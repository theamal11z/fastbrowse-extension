// FastBrowse Background Service Worker
// Handles tab discarding and memory optimization

class FastBrowse {
    constructor() {
        this.settings = {
            autoSuspend: true,
            suspendDelay: 30, // minutes
            memoryThreshold: true,
            memoryLimit: 80, // percentage
            protectPinned: true,
            protectAudio: true,
            protectForms: true,
            showNotifications: false,
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
            
            // Check if tab should be protected
            if (await this.shouldProtectTab(tab)) {
                return;
            }
            
            // Store tab information
            this.suspendedTabs.set(tabId, {
                url: tab.url,
                title: tab.title,
                favIconUrl: tab.favIconUrl,
                suspendedAt: Date.now()
            });
            
            // Discard the tab
            await chrome.tabs.discard(tabId);
            
            if (this.settings.showNotifications) {
                this.showNotification(`Tab suspended: ${tab.title}`);
            }
            
            console.log(`Tab ${tabId} suspended: ${tab.title}`);
        } catch (error) {
            console.error(`Failed to suspend tab ${tabId}:`, error);
            this.suspendedTabs.delete(tabId);
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
        try {
            switch (request.action) {
                case 'getMemoryInfo':
                    const memoryInfo = await chrome.system.memory.getInfo();
                    sendResponse({ success: true, data: memoryInfo });
                    break;
                    
                case 'getAllTabs':
                    const tabs = await chrome.tabs.query({});
                    const tabsWithSuspendState = tabs.map(tab => ({
                        ...tab,
                        suspended: this.suspendedTabs.has(tab.id)
                    }));
                    sendResponse({ success: true, data: tabsWithSuspendState });
                    break;
                    
                case 'suspendAllTabs':
                    await this.suspendAllTabs();
                    sendResponse({ success: true });
                    break;
                    
                case 'restoreAllTabs':
                    await this.restoreAllTabs();
                    sendResponse({ success: true });
                    break;
                    
                case 'suspendTab':
                    await this.suspendTab(request.tabId);
                    sendResponse({ success: true });
                    break;
                    
                case 'restoreTab':
                    await this.restoreTab(request.tabId);
                    sendResponse({ success: true });
                    break;
                    
                case 'updateSettings':
                    this.settings = { ...this.settings, ...request.settings };
                    await chrome.storage.sync.set(this.settings);
                    sendResponse({ success: true });
                    break;
                    
                case 'getSettings':
                    sendResponse({ success: true, data: this.settings });
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