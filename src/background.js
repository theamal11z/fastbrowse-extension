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
            memoryWarnings: true,
            // Extension monitoring settings
            extensionMonitoring: true,
            extensionMemoryThreshold: 50, // MB
            extensionSuggestions: true,
            extensionNotifications: true
        };
        
        this.suspendedTabs = new Map();
        this.tabTimers = new Map();
        
        // Extension monitoring data
        this.extensionMemoryData = new Map();
        this.extensionSuggestions = new Map();
        this.lastExtensionCheck = 0;
        
        this.init();
    }
    
    async init() {
        // Load settings from storage
        await this.loadSettings();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start memory monitoring
        this.startMemoryMonitoring();
        
        // Start extension monitoring
        this.startExtensionMonitoring();
        
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
    
    async onTabUpdated(tabId, changeInfo, tab) {
        // Handle tab loading states
        if (changeInfo.status === 'loading') {
            this.clearTabTimer(tabId);
        } else if (changeInfo.status === 'complete' && this.settings.autoSuspend) {
            // Start suspend timer if tab is not active
            if (!tab.active) {
                await this.startTabTimer(tabId);
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
                    await this.startTabTimer(tab.id);
                }
            }
        } catch (error) {
            console.error('Failed to update tab timers:', error);
        }
    }
    
    async startTabTimer(tabId) {
        this.clearTabTimer(tabId);
        
        // First check if the tab still exists before setting a timer
        try {
            await chrome.tabs.get(tabId);
            
            const delay = this.settings.suspendDelay * 60 * 1000; // Convert to milliseconds
            const timer = setTimeout(() => {
                this.suspendTab(tabId);
            }, delay);
            
            this.tabTimers.set(tabId, timer);
            console.log(`Timer set for tab ${tabId} - will suspend in ${this.settings.suspendDelay} minutes`);
        } catch (error) {
            // Tab doesn't exist anymore, no need to set a timer
            if (error.message && error.message.includes('No tab with id')) {
                console.log(`Not setting timer for tab ${tabId} - tab no longer exists`);
                return;
            }
            // For other errors, log but still try to set the timer
            console.error(`Error checking tab existence for ${tabId}:`, error);
            
            const delay = this.settings.suspendDelay * 60 * 1000;
            const timer = setTimeout(() => {
                this.suspendTab(tabId);
            }, delay);
            
            this.tabTimers.set(tabId, timer);
        }
    }
    
    clearTabTimer(tabId) {
        if (this.tabTimers.has(tabId)) {
            clearTimeout(this.tabTimers.get(tabId));
            this.tabTimers.delete(tabId);
        }
    }
    
    async suspendTab(tabId) {
        // Clean up timer for this tab since we're about to process it
        this.clearTabTimer(tabId);
        
        try {
            // First check if tab exists before attempting operations
            const tab = await chrome.tabs.get(tabId);
            console.log(`Attempting to suspend tab ${tabId}: ${tab.title || 'Unknown'}`);
            
            // Check if tab should be protected
            if (await this.shouldProtectTab(tab)) {
                console.log(`Tab ${tabId} is protected from suspension`);
                return;
            }
            
            // Check if tab is already discarded
            if (tab.discarded) {
                console.log(`Tab ${tabId} is already discarded`);
                this.suspendedTabs.set(tabId, {
                    url: tab.url || 'about:blank',
                    title: tab.title || 'Unknown',
                    favIconUrl: tab.favIconUrl || null,
                    suspendedAt: Date.now()
                });
                return;
            }
            
            // Store tab information before discarding (with defensive checks)
            this.suspendedTabs.set(tabId, {
                url: tab.url || 'about:blank',
                title: tab.title || 'Unknown',
                favIconUrl: tab.favIconUrl || null,
                suspendedAt: Date.now()
            });
            
            // Discard the tab
            console.log(`Discarding tab ${tabId}...`);
            
            try {
                await chrome.tabs.discard(tabId);
                
                // Verify the tab was discarded (check if tab still exists first)
                try {
                    const updatedTab = await chrome.tabs.get(tabId);
                    if (updatedTab.discarded) {
                        console.log(`✓ Tab ${tabId} successfully suspended: ${tab.title || 'Unknown'}`);
                        if (this.settings.showNotifications) {
                            this.showNotification(`Tab suspended: ${tab.title || 'Unknown'}`);
                        }
                    } else {
                        console.warn(`⚠ Tab ${tabId} was not discarded by Chrome API, trying alternative method`);
                        // Alternative: Replace tab URL with a suspended page
                        await this.suspendTabAlternative(tabId, tab);
                    }
                } catch (getTabError) {
                    // Tab was discarded or removed during the process
                    if (getTabError.message && getTabError.message.includes('No tab with id')) {
                        console.log(`✓ Tab ${tabId} was discarded (tab no longer accessible): ${tab.title || 'Unknown'}`);
                    } else {
                        throw getTabError;
                    }
                }
            } catch (discardError) {
                // Check if the discard error is due to tab not existing
                if (discardError.message && discardError.message.includes('No tab with id')) {
                    console.log(`Tab ${tabId} was closed before suspension could complete: ${tab.title || 'Unknown'}`);
                    // Clean up our records
                    this.suspendedTabs.delete(tabId);
                    return;
                }
                
                console.error(`Discard API failed for tab ${tabId}:`, discardError);
                // Fallback to alternative suspension method only if tab still exists
                try {
                    await chrome.tabs.get(tabId); // Check if tab still exists
                    await this.suspendTabAlternative(tabId, tab);
                } catch (tabCheckError) {
                    if (tabCheckError.message && tabCheckError.message.includes('No tab with id')) {
                        console.log(`Tab ${tabId} was closed during suspension attempt: ${tab.title || 'Unknown'}`);
                        this.suspendedTabs.delete(tabId);
                        return;
                    }
                    throw tabCheckError;
                }
            }
            
        } catch (error) {
            // Clean up records for this tab
            this.suspendedTabs.delete(tabId);
            
            // If tab doesn't exist anymore, that's normal - user closed it
            if (error.message && error.message.includes('No tab with id')) {
                console.log(`Tab ${tabId} no longer exists (closed by user)`);
                return;
            }
            
            // For other errors, log them but don't throw
            console.error(`Failed to suspend tab ${tabId}:`, error);
        }
    }
    
    async suspendTabAlternative(tabId, originalTab) {
        try {
            // First check if tab still exists
            await chrome.tabs.get(tabId);
            
            // Create a data URL with suspend page content (with safe fallbacks)
            const safeTitle = (originalTab.title || 'Unknown Tab').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            const safeUrl = originalTab.url || 'about:blank';
            const suspendPageHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Suspended: ${safeTitle}</title>
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
                        <div class="url">${safeUrl}</div>
                        <button onclick="window.location.href='${safeUrl}'">Restore Tab</button>
                    </div>
                </body>
                </html>
            `;
            
            const dataURL = 'data:text/html;charset=utf-8,' + encodeURIComponent(suspendPageHTML);
            
            // Navigate tab to suspend page
            await chrome.tabs.update(tabId, { url: dataURL });
            
            console.log(`✓ Tab ${tabId} suspended using alternative method`);
            if (this.settings.showNotifications) {
                this.showNotification(`Tab suspended (alt): ${originalTab.title || 'Unknown'}`);
            }
            
        } catch (error) {
            // Handle case where tab was closed during the process
            if (error.message && error.message.includes('No tab with id')) {
                console.log(`Tab ${tabId} was closed during alternative suspension: ${originalTab.title || 'Unknown'}`);
                this.suspendedTabs.delete(tabId);
                return;
            }
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
            console.log(`Tab ${tabId} restored: ${tab.title || 'Unknown'}`);
        } catch (error) {
            // Clean up our records even if tab doesn't exist
            this.suspendedTabs.delete(tabId);
            
            if (error.message && error.message.includes('No tab with id')) {
                console.log(`Cannot restore tab ${tabId} - tab no longer exists`);
                return;
            }
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
        if (tab.url && (
            tab.url.startsWith('chrome://') || 
            tab.url.startsWith('chrome-extension://') || 
            tab.url.startsWith('edge://') || 
            tab.url.startsWith('about:'))) {
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
    
    startExtensionMonitoring() {
        // Check extensions every 5 minutes
        setInterval(() => {
            this.checkExtensionMemoryUsage();
        }, 5 * 60 * 1000);
        
        // Initial check after 10 seconds
        setTimeout(() => {
            this.checkExtensionMemoryUsage();
        }, 10000);
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
    
    // Helper method for safe tab debugging
    getTabDescription(tab) {
        if (!tab) return 'null tab';
        const title = tab.title || 'Unknown';
        const url = tab.url || 'no URL';
        return `${title} (${url})`;
    }
    
    // Extension Monitoring Methods
    async getExtensionMemoryUsage() {
        if (!this.settings.extensionMonitoring) return [];
        
        try {
            // Get all installed extensions
            const extensions = await chrome.management.getAll();
            const enabledExtensions = extensions.filter(ext => ext.enabled && ext.type === 'extension');
            
            // Get memory usage from Chrome processes
            const memoryData = [];
            
            for (const extension of enabledExtensions) {
                try {
                    // Try to get process info (this is approximate as Chrome doesn't expose exact per-extension memory)
                    const extData = {
                        id: extension.id,
                        name: extension.name,
                        version: extension.version,
                        enabled: extension.enabled,
                        permissions: extension.permissions || [],
                        // Estimate memory usage based on permissions and type
                        estimatedMemory: this.estimateExtensionMemoryUsage(extension),
                        lastUpdated: Date.now(),
                        canDisable: extension.mayDisable,
                        type: extension.type
                    };
                    
                    // Store historical data
                    if (this.extensionMemoryData.has(extension.id)) {
                        const historical = this.extensionMemoryData.get(extension.id);
                        historical.push(extData);
                        // Keep only last 10 readings
                        if (historical.length > 10) {
                            historical.shift();
                        }
                    } else {
                        this.extensionMemoryData.set(extension.id, [extData]);
                    }
                    
                    memoryData.push(extData);
                } catch (error) {
                    console.error(`Failed to analyze extension ${extension.name}:`, error);
                }
            }
            
            // Sort by estimated memory usage (highest first)
            memoryData.sort((a, b) => b.estimatedMemory - a.estimatedMemory);
            
            return memoryData;
        } catch (error) {
            console.error('Failed to get extension memory usage:', error);
            return [];
        }
    }
    
    estimateExtensionMemoryUsage(extension) {
        let baseMemory = 5; // Base memory usage in MB
        
        // Estimate based on permissions (more permissions = likely more memory usage)
        const permissions = extension.permissions || [];
        const memoryHeavyPermissions = [
            'tabs', 'activeTab', 'background', 'webRequest', 'webRequestBlocking',
            'storage', 'unlimitedStorage', 'history', 'bookmarks', 'downloads',
            'management', 'system.memory', 'system.cpu', 'processes'
        ];
        
        permissions.forEach(permission => {
            if (memoryHeavyPermissions.includes(permission)) {
                baseMemory += 3;
            } else if (permission.includes('://')) {
                baseMemory += 2; // Host permissions
            } else {
                baseMemory += 1;
            }
        });
        
        // Adjust based on extension type and characteristics
        if (extension.name.toLowerCase().includes('ad') || 
            extension.name.toLowerCase().includes('block')) {
            baseMemory += 10; // Ad blockers typically use more memory
        }
        
        if (extension.name.toLowerCase().includes('password') ||
            extension.name.toLowerCase().includes('vault')) {
            baseMemory += 8; // Password managers
        }
        
        if (extension.name.toLowerCase().includes('translate') ||
            extension.name.toLowerCase().includes('grammar')) {
            baseMemory += 6; // Language tools
        }
        
        return Math.round(baseMemory);
    }
    
    async analyzeExtensionSuggestions() {
        if (!this.settings.extensionSuggestions) return [];
        
        const extensions = await this.getExtensionMemoryUsage();
        const suggestions = [];
        
        extensions.forEach(ext => {
            const suggestion = {
                extensionId: ext.id,
                extensionName: ext.name,
                reason: '',
                severity: 'low', // low, medium, high
                action: 'consider_disable', // consider_disable, recommend_disable, urgent_disable
                memoryUsage: ext.estimatedMemory,
                canDisable: ext.canDisable
            };
            
            // High memory usage
            if (ext.estimatedMemory > this.settings.extensionMemoryThreshold) {
                suggestion.reason = `Using approximately ${ext.estimatedMemory}MB of memory`;
                suggestion.severity = ext.estimatedMemory > 100 ? 'high' : 'medium';
                suggestion.action = ext.estimatedMemory > 150 ? 'urgent_disable' : 'recommend_disable';
                suggestions.push(suggestion);
            }
            
            // Too many permissions
            else if (ext.permissions.length > 15) {
                suggestion.reason = `Has ${ext.permissions.length} permissions which may impact performance`;
                suggestion.severity = 'medium';
                suggestion.action = 'consider_disable';
                suggestions.push(suggestion);
            }
            
            // Duplicate functionality detection
            const duplicateTypes = this.detectDuplicateExtensions(extensions, ext);
            if (duplicateTypes.length > 0) {
                suggestion.reason = `Potentially redundant with other extensions: ${duplicateTypes.join(', ')}`;
                suggestion.severity = 'low';
                suggestion.action = 'consider_disable';
                suggestions.push(suggestion);
            }
        });
        
        // Store suggestions
        suggestions.forEach(suggestion => {
            this.extensionSuggestions.set(suggestion.extensionId, suggestion);
        });
        
        return suggestions.sort((a, b) => {
            const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });
    }
    
    detectDuplicateExtensions(allExtensions, currentExt) {
        const duplicateTypes = [];
        const currentName = currentExt.name.toLowerCase();
        
        // Check for common extension categories
        const categories = {
            'adblocker': ['ad', 'block', 'blocker', 'ublock', 'adblock'],
            'password': ['password', 'vault', 'keeper', 'bitwarden', 'lastpass'],
            'screenshot': ['screenshot', 'capture', 'screen', 'grab'],
            'translator': ['translate', 'translation', 'translator'],
            'grammar': ['grammar', 'grammarly', 'languagetool'],
            'bookmark': ['bookmark', 'pocket', 'save'],
            'theme': ['theme', 'dark', 'night']
        };
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => currentName.includes(keyword))) {
                // Count how many other extensions in the same category
                const sameCategory = allExtensions.filter(ext => 
                    ext.id !== currentExt.id && 
                    keywords.some(keyword => ext.name.toLowerCase().includes(keyword))
                );
                
                if (sameCategory.length > 0) {
                    duplicateTypes.push(category);
                }
            }
        }
        
        return duplicateTypes;
    }
    
    async checkExtensionMemoryUsage() {
        if (!this.settings.extensionMonitoring) return;
        
        const now = Date.now();
        // Check extensions every 5 minutes
        if (now - this.lastExtensionCheck < 5 * 60 * 1000) return;
        
        this.lastExtensionCheck = now;
        
        try {
            const suggestions = await this.analyzeExtensionSuggestions();
            
            // Notify about high-priority suggestions
            const urgentSuggestions = suggestions.filter(s => s.severity === 'high');
            
            if (urgentSuggestions.length > 0 && this.settings.extensionNotifications) {
                const extensionNames = urgentSuggestions.map(s => s.extensionName).join(', ');
                this.showNotification(
                    `Memory Alert: Consider disabling high-memory extensions: ${extensionNames}`
                );
            }
            
            console.log(`Extension analysis complete: ${suggestions.length} suggestions found`);
        } catch (error) {
            console.error('Extension memory check failed:', error);
        }
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
                    
                case 'getExtensionMemoryUsage':
                    try {
                        const extensions = await this.getExtensionMemoryUsage();
                        sendResponse({ success: true, data: extensions });
                    } catch (error) {
                        console.error('Failed to get extension memory usage:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'getExtensionSuggestions':
                    try {
                        const suggestions = await this.analyzeExtensionSuggestions();
                        sendResponse({ success: true, data: suggestions });
                    } catch (error) {
                        console.error('Failed to get extension suggestions:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'disableExtension':
                    try {
                        if (!request.extensionId) {
                            throw new Error('Extension ID required');
                        }
                        await chrome.management.setEnabled(request.extensionId, false);
                        console.log(`Extension ${request.extensionId} disabled`);
                        sendResponse({ success: true });
                    } catch (error) {
                        console.error('Failed to disable extension:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'enableExtension':
                    try {
                        if (!request.extensionId) {
                            throw new Error('Extension ID required');
                        }
                        await chrome.management.setEnabled(request.extensionId, true);
                        console.log(`Extension ${request.extensionId} enabled`);
                        sendResponse({ success: true });
                    } catch (error) {
                        console.error('Failed to enable extension:', error);
                        sendResponse({ success: false, error: error.message });
                    }
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