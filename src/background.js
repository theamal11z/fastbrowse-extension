// FastBrowse Background Service Worker
// Handles tab discarding and memory optimization

class FastBrowse {
    constructor() {
        this.settings = {
            autoSuspend: true,
            suspendDelay: 1, // minutes - start with 1 minute for testing
            memoryThreshold: true,
            memoryLimit: 80, // percentage
            protectPinned: true,
            protectAudio: true,
            protectForms: true,
            showNotifications: true, // Enable notifications by default for debugging
            memoryWarnings: true
        };
        
        this.suspendedTabs = new Map();
        this.tabTimers = new Map();
        
        this.init();
    }
    
    async init() {
        // Load settings from storage
        await this.loadSettings();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start memory monitoring
        this.startMemoryMonitoring();
        
        console.log('FastBrowse initialized');
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(this.settings);
            this.settings = { ...this.settings, ...result };
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }
    
    setupEventListeners() {
        // Listen for tab activation changes
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.onTabActivated(activeInfo);
        });
        
        // Listen for tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.onTabUpdated(tabId, changeInfo, tab);
        });
        
        // Listen for tab removal
        chrome.tabs.onRemoved.addListener((tabId) => {
            this.onTabRemoved(tabId);
        });
        
        // Listen for window focus changes
        chrome.windows.onFocusChanged.addListener((windowId) => {
            this.onWindowFocusChanged(windowId);
        });
        
        // Listen for messages from popup/options
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
    }
    
    async onTabActivated(activeInfo) {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        
        // Clear suspend timer for active tab
        this.clearTabTimer(activeInfo.tabId);
        
        // Restore tab if it's suspended
        if (this.suspendedTabs.has(activeInfo.tabId)) {
            await this.restoreTab(activeInfo.tabId);
        }
        
        // Start timers for other tabs in the window
        if (this.settings.autoSuspend) {
            await this.updateTabTimers(activeInfo.windowId, activeInfo.tabId);
        }
    }
    
    onTabUpdated(tabId, changeInfo, tab) {
        // Handle tab loading states
        if (changeInfo.status === 'loading') {
            this.clearTabTimer(tabId);
        } else if (changeInfo.status === 'complete' && this.settings.autoSuspend) {
            // Start suspend timer if tab is not active
            if (!tab.active) {
                this.startTabTimer(tabId);
            }
        }
    }
    
    onTabRemoved(tabId) {
        this.clearTabTimer(tabId);
        this.suspendedTabs.delete(tabId);
    }
    
    async onWindowFocusChanged(windowId) {
        if (windowId !== chrome.windows.WINDOW_ID_NONE && this.settings.autoSuspend) {
            // Update timers for all tabs in the focused window
            await this.updateTabTimers(windowId);
        }
    }
    
    async updateTabTimers(windowId, activeTabId = null) {
        try {
            const tabs = await chrome.tabs.query({ windowId: windowId });
            
            for (const tab of tabs) {
                if (tab.id === activeTabId || tab.active) {
                    this.clearTabTimer(tab.id);
                } else if (!this.suspendedTabs.has(tab.id)) {
                    this.startTabTimer(tab.id);
                }
            }
        } catch (error) {
            console.error('Failed to update tab timers:', error);
        }
    }
    
    startTabTimer(tabId) {
        this.clearTabTimer(tabId);
        
        const delay = this.settings.suspendDelay * 60 * 1000; // Convert to milliseconds
        const timer = setTimeout(() => {
            this.suspendTab(tabId);
        }, delay);
        
        this.tabTimers.set(tabId, timer);
    }
    
    clearTabTimer(tabId) {
        if (this.tabTimers.has(tabId)) {
            clearTimeout(this.tabTimers.get(tabId));
            this.tabTimers.delete(tabId);
        }
    }
    
    async suspendTab(tabId) {
        try {
            const tab = await chrome.tabs.get(tabId);
            console.log(`Attempting to suspend tab ${tabId}: ${tab.title}`);
            
            // Check if tab should be protected
            if (await this.shouldProtectTab(tab)) {
                console.log(`Tab ${tabId} is protected from suspension`);
                return;
            }
            
            // Check if tab is already discarded
            if (tab.discarded) {
                console.log(`Tab ${tabId} is already discarded`);
                this.suspendedTabs.set(tabId, {
                    url: tab.url,
                    title: tab.title,
                    favIconUrl: tab.favIconUrl,
                    suspendedAt: Date.now()
                });
                return;
            }
            
            // Store tab information before discarding
            this.suspendedTabs.set(tabId, {
                url: tab.url,
                title: tab.title,
                favIconUrl: tab.favIconUrl,
                suspendedAt: Date.now()
            });
            
            // Discard the tab
            console.log(`Discarding tab ${tabId}...`);
            
            try {
                await chrome.tabs.discard(tabId);
                
                // Verify the tab was discarded
                const updatedTab = await chrome.tabs.get(tabId);
                if (updatedTab.discarded) {
                    console.log(`✓ Tab ${tabId} successfully suspended: ${tab.title}`);
                    if (this.settings.showNotifications) {
                        this.showNotification(`Tab suspended: ${tab.title}`);
                    }
                } else {
                    console.warn(`⚠ Tab ${tabId} was not discarded by Chrome API, trying alternative method`);
                    // Alternative: Replace tab URL with a suspended page
                    await this.suspendTabAlternative(tabId, tab);
                }
            } catch (discardError) {
                console.error(`Discard API failed for tab ${tabId}:`, discardError);
                // Fallback to alternative suspension method
                await this.suspendTabAlternative(tabId, tab);
            }
            
        } catch (error) {
            console.error(`Failed to suspend tab ${tabId}:`, error);
            this.suspendedTabs.delete(tabId);
            
            // If tab doesn't exist anymore, that's ok
            if (error.message && error.message.includes('No tab with id')) {
                console.log(`Tab ${tabId} no longer exists`);
                return;
            }
        }
    }
    
    async suspendTabAlternative(tabId, originalTab) {
        try {
            // Create a data URL with suspend page content
            const suspendPageHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Suspended: ${originalTab.title}</title>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            background: #f5f5f5; 
                            padding: 40px; 
                            text-align: center; 
                            color: #666;
                        }
                        .container {
                            max-width: 400px;
                            margin: 0 auto;
                            background: white;
                            padding: 40px;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        .icon { font-size: 48px; margin-bottom: 20px; }
                        h1 { color: #333; font-size: 20px; margin-bottom: 10px; }
                        .url { font-size: 12px; color: #999; word-break: break-all; margin-bottom: 20px; }
                        button {
                            background: #2196F3;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                        }
                        button:hover { background: #1976D2; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="icon">😴</div>
                        <h1>Tab Suspended</h1>
                        <p>This tab was suspended by FastBrowse to save memory.</p>
                        <div class="url">${originalTab.url}</div>
                        <button onclick="window.location.href='${originalTab.url}'">Restore Tab</button>
                    </div>
                </body>
                </html>
            `;
            
            const dataURL = 'data:text/html;charset=utf-8,' + encodeURIComponent(suspendPageHTML);
            
            // Navigate tab to suspend page
            await chrome.tabs.update(tabId, { url: dataURL });
            
            console.log(`✓ Tab ${tabId} suspended using alternative method`);
            if (this.settings.showNotifications) {
                this.showNotification(`Tab suspended (alt): ${originalTab.title}`);
            }
            
        } catch (error) {
            console.error(`Alternative suspend method failed for tab ${tabId}:`, error);
        }
    }
    
    async restoreTab(tabId) {
        try {
            const tab = await chrome.tabs.get(tabId);
            
            if (tab.discarded) {
                await chrome.tabs.reload(tabId);
            }
            
            this.suspendedTabs.delete(tabId);
            console.log(`Tab ${tabId} restored: ${tab.title}`);
        } catch (error) {
            console.error(`Failed to restore tab ${tabId}:`, error);
        }
    }
    
    async shouldProtectTab(tab) {
        // Protect pinned tabs
        if (this.settings.protectPinned && tab.pinned) {
            return true;
        }
        
        // Protect tabs playing audio
        if (this.settings.protectAudio && tab.audible) {
            return true;
        }
        
        // Don't suspend active tabs
        if (tab.active) {
            return true;
        }
        
        // Check for special URLs
        if (tab.url.startsWith('chrome://') || 
            tab.url.startsWith('chrome-extension://') || 
            tab.url.startsWith('edge://') || 
            tab.url.startsWith('about:')) {
            return true;
        }
        
        return false;
    }
    
    async suspendAllTabs() {
        try {
            const tabs = await chrome.tabs.query({});
            
            for (const tab of tabs) {
                if (!tab.active && !(await this.shouldProtectTab(tab))) {
                    await this.suspendTab(tab.id);
                }
            }
        } catch (error) {
            console.error('Failed to suspend all tabs:', error);
        }
    }
    
    async restoreAllTabs() {
        try {
            const suspendedTabIds = Array.from(this.suspendedTabs.keys());
            
            for (const tabId of suspendedTabIds) {
                await this.restoreTab(tabId);
            }
        } catch (error) {
            console.error('Failed to restore all tabs:', error);
        }
    }
    
    startMemoryMonitoring() {
        // Check memory usage every 30 seconds
        setInterval(() => {
            this.checkMemoryUsage();
        }, 30000);
    }
    
    async checkMemoryUsage() {
        if (!this.settings.memoryThreshold) return;
        
        try {
            const memoryInfo = await chrome.system.memory.getInfo();
            const usagePercent = ((memoryInfo.capacity - memoryInfo.availableCapacity) / memoryInfo.capacity) * 100;
            
            if (usagePercent > this.settings.memoryLimit) {
                if (this.settings.memoryWarnings) {
                    this.showNotification(`High memory usage detected: ${usagePercent.toFixed(1)}%`);
                }
                
                // Suspend some tabs to free memory
                await this.emergencySuspend();
            }
        } catch (error) {
            console.error('Failed to check memory usage:', error);
        }
    }
    
    async emergencySuspend() {
        try {
            const tabs = await chrome.tabs.query({ active: false });
            const unprotectedTabs = [];
            
            for (const tab of tabs) {
                if (!(await this.shouldProtectTab(tab)) && !this.suspendedTabs.has(tab.id)) {
                    unprotectedTabs.push(tab);
                }
            }
            
            // Sort by last accessed (oldest first) and suspend up to 5 tabs
            unprotectedTabs
                .sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0))
                .slice(0, 5)
                .forEach(tab => this.suspendTab(tab.id));
                
        } catch (error) {
            console.error('Failed to perform emergency suspend:', error);
        }
    }
    
    showNotification(message) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/icon48.png',
            title: 'FastBrowse',
            message: message
        });
    }
    
    async handleMessage(request, sender, sendResponse) {
        console.log('FastBrowse received message:', request.action);
        try {
            switch (request.action) {
                case 'getMemoryInfo':
                    try {
                        const memoryInfo = await chrome.system.memory.getInfo();
                        sendResponse({ success: true, data: memoryInfo });
                    } catch (error) {
                        console.warn('Memory API not available:', error);
                        // Fallback for systems where memory API isn't available
                        sendResponse({ 
                            success: true, 
                            data: { 
                                capacity: 8000000000, // 8GB fallback
                                availableCapacity: 4000000000 // 4GB available fallback
                            }
                        });
                    }
                    break;
                    
                case 'getAllTabs':
                    const tabs = await chrome.tabs.query({});
                    const tabsWithSuspendState = tabs.map(tab => ({
                        ...tab,
                        suspended: this.suspendedTabs.has(tab.id)
                    }));
                    console.log(`Found ${tabs.length} tabs, ${this.suspendedTabs.size} suspended`);
                    sendResponse({ success: true, data: tabsWithSuspendState });
                    break;
                    
                case 'suspendAllTabs':
                    console.log('Suspending all tabs...');
                    await this.suspendAllTabs();
                    sendResponse({ success: true });
                    break;
                    
                case 'restoreAllTabs':
                    console.log('Restoring all tabs...');
                    await this.restoreAllTabs();
                    sendResponse({ success: true });
                    break;
                    
                case 'suspendTab':
                    console.log(`Manual suspend request for tab ${request.tabId}`);
                    await this.suspendTab(request.tabId);
                    sendResponse({ success: true });
                    break;
                    
                case 'restoreTab':
                    console.log(`Manual restore request for tab ${request.tabId}`);
                    await this.restoreTab(request.tabId);
                    sendResponse({ success: true });
                    break;
                    
                case 'testSuspend':
                    // Force suspend a random non-active tab for testing
                    console.log('Test suspend triggered');
                    const allTabs = await chrome.tabs.query({ active: false });
                    const eligibleTabs = [];
                    for (const tab of allTabs) {
                        if (!(await this.shouldProtectTab(tab))) {
                            eligibleTabs.push(tab);
                        }
                    }
                    if (eligibleTabs.length > 0) {
                        const testTab = eligibleTabs[0];
                        console.log(`Test suspending tab: ${testTab.title}`);
                        await this.suspendTab(testTab.id);
                        sendResponse({ success: true, message: `Test suspended: ${testTab.title}` });
                    } else {
                        sendResponse({ success: false, message: 'No eligible tabs to suspend' });
                    }
                    break;
                    
                case 'updateSettings':
                    console.log('Updating settings:', request.settings);
                    this.settings = { ...this.settings, ...request.settings };
                    await chrome.storage.sync.set(this.settings);
                    sendResponse({ success: true });
                    break;
                    
                case 'getSettings':
                    sendResponse({ success: true, data: this.settings });
                    break;
                    
                case 'getDebugInfo':
                    sendResponse({ 
                        success: true, 
                        data: {
                            suspendedTabs: Array.from(this.suspendedTabs.entries()),
                            activeTimers: this.tabTimers.size,
                            settings: this.settings
                        }
                    });
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Message handler error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
}

// Initialize FastBrowse when the service worker starts
const fastBrowse = new FastBrowse();