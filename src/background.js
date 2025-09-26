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
            // Smart memory alerts
            memorySmartMode: true,
            memoryMinUnsuspendedTabs: 5,
            memoryFocusGraceMinutes: 3,
            memoryHighStreak: 3,
            // Extension monitoring settings
            extensionMonitoring: true,
            extensionMemoryThreshold: 50, // MB
            extensionSuggestions: true,
            extensionNotifications: true,
        // Focus mode settings
            focusMode: false,
            focusAutoSuspend: true, // Auto-suspend tabs in focus mode
            focusMinimalTheme: true,
            focusRemoveDistractions: true,
            focusDisableAnimations: true,
            focusMemoryOptimization: true,
            focusExtensionRecommendations: true,
            // Focus mode audio
            focusModeMusic: 'none', // 'none' or path like assets/music/FocusFlow.mp3
            // Tag management settings
            tagsEnabled: true,
            autoTagging: true,
            tagFrequencyThreshold: 0.3, // 0-1 scale for frequent tag classification
            tagBasedSuspension: true,
            tagSuggestions: true,
            maxTagsPerTab: 5,
            tagInactivityDays: 30 // Days before a tag is considered inactive
        };
        
        this.suspendedTabs = new Map();
        this.tabTimers = new Map();
        
        // Extension monitoring data
        this.extensionMemoryData = new Map();
        this.extensionSuggestions = new Map();
        this.lastExtensionCheck = 0;
        
        // Smart memory tracking
        this.highMemStreak = 0;
        this.lastChromeFocusAt = 0;
        
        // Focus mode state
        this.focusModeActive = false;
        this.focusModeStartTime = null;
        this.focusModeStats = {
            tabsSuspended: 0,
            distractionsRemoved: 0,
            timeActive: 0
        };
        
        // Tag management data structures
        this.tags = new Map(); // tagId -> tag object
        this.tabTags = new Map(); // tabId -> Set of tagIds
        this.tagGroups = new Map(); // groupId -> group object
        this.tagUsageHistory = new Map(); // tagId -> usage history
        this.domainTagSuggestions = new Map(); // domain -> suggested tags
        this.lastTagCleanup = 0;
        
        // Notification state management
        this.activeNotifications = new Set();
        this.notificationCooldowns = new Map();
        this.lastNotificationTime = new Map();
        
        // Recommended focus extensions database
        this.recommendedFocusExtensions = new Map([
            ['ublock-origin', {
                name: 'uBlock Origin',
                id: 'cjpalhdlnbpafiamejdnhcphjbkeiagm',
                webstoreUrl: 'https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm',
                description: 'Advanced ad and tracker blocker',
                priority: 10,
                category: 'blocking'
            }],
            ['df-youtube', {
                name: 'DF YouTube (Distraction Free)',
                id: 'mjdepdfccjgcndkmemponafgioodelna',
                webstoreUrl: 'https://chrome.google.com/webstore/detail/df-youtube-distraction-fr/mjdepdfccjgcndkmemponafgioodelna',
                description: 'Removes YouTube distractions like suggestions and comments',
                priority: 9,
                category: 'social-media'
            }],
            ['news-feed-eradicator', {
                name: 'News Feed Eradicator',
                id: 'fjcldmjmjhkklehbacihaiopjklihlgg',
                webstoreUrl: 'https://chrome.google.com/webstore/detail/news-feed-eradicator/fjcldmjmjhkklehbacihaiopjklihlgg',
                description: 'Removes distracting news feeds from Facebook, Twitter, etc.',
                priority: 8,
                category: 'social-media'
            }],
            ['stayfocusd', {
                name: 'StayFocusd',
                id: 'laankejkbhbdhmipfmgcngdelahlfoji',
                webstoreUrl: 'https://chrome.google.com/webstore/detail/stayfocusd/laankejkbhbdhmipfmgcngdelahlfoji',
                description: 'Limits time spent on time-wasting websites',
                priority: 7,
                category: 'time-management'
            }],
            ['forest', {
                name: 'Forest: Stay Focused',
                id: 'kjacjjdnoddnpbbcjilcajfhhbdhkpgk',
                webstoreUrl: 'https://chrome.google.com/webstore/detail/forest-stay-focused-be-pr/kjacjjdnoddnpbbcjilcajfhhbdhkpgk',
                description: 'Pomodoro timer and website blocker',
                priority: 6,
                category: 'time-management'
            }],
            ['momentum', {
                name: 'Momentum',
                id: 'laookkfknpbbblfpciffpaejjkokdgca',
                webstoreUrl: 'https://chrome.google.com/webstore/detail/momentum/laookkfknpbbblfpciffpaejjkokdgca',
                description: 'Replaces new tab with inspiring dashboard',
                priority: 5,
                category: 'productivity'
            }]
        ]);
        
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
        
        // Initialize tag system
        await this.initializeTagSystem();
        
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
        // Listen for notification clicks
        chrome.notifications.onClicked.addListener((notificationId) => {
            this.handleNotificationClick(notificationId);
        });
        
        // Listen for notification button clicks
        chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
            this.handleNotificationButtonClick(notificationId, buttonIndex);
        });
        
        // Clean up closed notifications
        chrome.notifications.onClosed.addListener((notificationId, byUser) => {
            this.activeNotifications.delete(notificationId);
        });
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
        
        // Listen for keyboard shortcuts
        chrome.commands.onCommand.addListener((command) => {
            this.handleCommand(command);
        });
        
        // Setup context menus
        this.setupContextMenus();
    }
    
    // Notification event handlers
    handleNotificationClick(notificationId) {
        // Clear the notification when clicked
        chrome.notifications.clear(notificationId);
        this.activeNotifications.delete(notificationId);
    }
    
    handleNotificationButtonClick(notificationId, buttonIndex) {
        // Handle button clicks for notifications that have buttons
        chrome.notifications.clear(notificationId);
        this.activeNotifications.delete(notificationId);
        
        // You can add specific handling for different notification types here
        console.log(`Notification button ${buttonIndex} clicked for ${notificationId}`);
    }
    
    async onTabActivated(activeInfo) {
        // Record recent Chrome interaction (used for smart memory gating)
        this.lastChromeFocusAt = Date.now();
        const tab = await chrome.tabs.get(activeInfo.tabId);
        
        // Clear suspend timer for active tab
        this.clearTabTimer(activeInfo.tabId);
        
        // Restore tab if it's suspended
        if (this.suspendedTabs.has(activeInfo.tabId)) {
            await this.restoreTab(activeInfo.tabId);
        }
        
        // Update tag usage for activated tab
        if (this.settings.tagsEnabled) {
            await this.updateTabTagUsage(activeInfo.tabId);
            
            // Auto-suggest tags if enabled and tab has no tags
            if (this.settings.autoTagging && !this.tabTags.has(activeInfo.tabId)) {
                const suggestedTags = await this.suggestTagsForTab(tab);
                if (suggestedTags.length > 0) {
                    // Automatically apply first suggestion if confidence is high
                    await this.assignTagToTab(activeInfo.tabId, suggestedTags[0]);
                }
            }
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
        
        // Clean up tag associations
        if (this.settings.tagsEnabled && this.tabTags.has(tabId)) {
            this.tabTags.delete(tabId);
            // Save tag data asynchronously
            this.saveTagData().catch(error => {
                console.error('Failed to save tag data after tab removal:', error);
            });
        }
    }
    
    async onWindowFocusChanged(windowId) {
        // Track last time any Chrome window gained focus (used for smart memory gating)
        if (windowId !== chrome.windows.WINDOW_ID_NONE) {
            this.lastChromeFocusAt = Date.now();
        }
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
        
        // Tag-based protection
        if (this.settings.tagsEnabled && this.settings.tagBasedSuspension) {
            const tabTags = this.getTabTags(tab.id);
            
            for (const tag of tabTags) {
                // Protect high priority tags
                if (tag.priority === 'high') {
                    return true;
                }
                
                // Protect frequently used tags
                if (tag.frequency >= this.settings.tagFrequencyThreshold) {
                    return true;
                }
                
                // Protect tags marked as no auto-suspend
                if (!tag.autoSuspend) {
                    return true;
                }
            }
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
            
            const overLimit = usagePercent > this.settings.memoryLimit;
            if (!overLimit) {
                // Reset streak when usage goes back under limit
                this.highMemStreak = 0;
                return;
            }
            
            if (this.settings.memorySmartMode) {
                // Require persistence over multiple checks
                this.highMemStreak = (this.highMemStreak || 0) + 1;
                const requiredStreak = Math.max(1, this.settings.memoryHighStreak || 3);
                if (this.highMemStreak < requiredStreak) {
                    return; // wait for sustained pressure
                }
                
                // Assess Chrome context: recent focus and enough unsuspended tabs
                const tabs = await chrome.tabs.query({});
                const normalTabs = tabs.filter(t => t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://'));
                const unsuspendedCount = normalTabs.filter(t => !t.discarded && !this.suspendedTabs.has(t.id)).length;
                const minUnsuspended = Math.max(1, this.settings.memoryMinUnsuspendedTabs || 5);
                const hasRecentChromeFocus = (Date.now() - (this.lastChromeFocusAt || 0)) < ((this.settings.memoryFocusGraceMinutes || 3) * 60 * 1000);
                
                // If browser seems idle or not likely the culprit, suppress warnings/suspension
                if (unsuspendedCount < minUnsuspended || !hasRecentChromeFocus) {
                    return;
                }
            }
            
            if (this.settings.memoryWarnings) {
                this.showNotification(`High memory usage detected: ${usagePercent.toFixed(1)}%`);
            }
            
            // Suspend some tabs to free memory
            await this.emergencySuspend();
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
    
    showNotification(message, options = {}) {
        try {
            // Create a unique key for this notification type
            const notificationKey = `${message.substring(0, 30)}_${options.type || 'basic'}`;
            
            // Check for cooldown - don't show same notification within 30 seconds
            const now = Date.now();
            const cooldownTime = 30000; // 30 seconds
            
            if (this.notificationCooldowns.has(notificationKey)) {
                const lastShown = this.notificationCooldowns.get(notificationKey);
                if (now - lastShown < cooldownTime) {
                    console.debug(`Notification "${message}" suppressed due to cooldown`);
                    return;
                }
            }
            
            // Set cooldown
            this.notificationCooldowns.set(notificationKey, now);
            
            const notificationOptions = {
                type: 'basic',
                iconUrl: chrome.runtime.getURL('assets/icon48.png'),
                title: 'FastBrowse',
                message: message,
                ...options
            };
            
            // Remove iconUrl from buttons if present, as it causes issues
            if (notificationOptions.buttons) {
                notificationOptions.buttons = notificationOptions.buttons.map(button => {
                    const { iconUrl, ...cleanButton } = button;
                    return cleanButton;
                });
            }
            
            chrome.notifications.create(notificationOptions, (notificationId) => {
                if (chrome.runtime.lastError) {
                    console.debug('Notification error:', chrome.runtime.lastError);
                } else {
                    console.log('Notification created:', notificationId);
                    this.activeNotifications.add(notificationId);
                    
                    // Auto-clear notification after 5 seconds if not requiring interaction
                    if (!options.requireInteraction) {
                        setTimeout(() => {
                            chrome.notifications.clear(notificationId, () => {
                                this.activeNotifications.delete(notificationId);
                            });
                        }, 5000);
                    }
                }
            });
        } catch (error) {
            console.debug('Failed to show notification:', error);
        }
    }
    
    // Helper method for safe tab debugging
    getTabDescription(tab) {
        if (!tab) return 'null tab';
        const title = tab.title || 'Unknown';
        const url = tab.url || 'no URL';
        return `${title} (${url})`;
    }
    
    // ============================================================================
    // TAG MANAGEMENT SYSTEM
    // ============================================================================
    
    async initializeTagSystem() {
        if (!this.settings.tagsEnabled) return;
        
        try {
            // Load tag data from storage
            const tagData = await chrome.storage.local.get([
                'fastbrowse_tags',
                'fastbrowse_tab_tags', 
                'fastbrowse_tag_groups',
                'fastbrowse_tag_usage',
                'fastbrowse_domain_suggestions'
            ]);
            
            // Initialize tags
            if (tagData.fastbrowse_tags) {
                this.tags = new Map(Object.entries(tagData.fastbrowse_tags));
            }
            
            // Initialize tab-tag associations
            if (tagData.fastbrowse_tab_tags) {
                this.tabTags = new Map();
                for (const [tabId, tagIds] of Object.entries(tagData.fastbrowse_tab_tags)) {
                    this.tabTags.set(parseInt(tabId), new Set(tagIds));
                }
            }
            
            // Initialize tag groups
            if (tagData.fastbrowse_tag_groups) {
                this.tagGroups = new Map(Object.entries(tagData.fastbrowse_tag_groups));
            }
            
            // Initialize usage history
            if (tagData.fastbrowse_tag_usage) {
                this.tagUsageHistory = new Map(Object.entries(tagData.fastbrowse_tag_usage));
            }
            
            // Initialize domain suggestions
            if (tagData.fastbrowse_domain_suggestions) {
                this.domainTagSuggestions = new Map(Object.entries(tagData.fastbrowse_domain_suggestions));
            }
            
            // Create default domain-based tag suggestions
            await this.initializeDefaultTagSuggestions();
            
        // Start tag cleanup scheduler
        this.scheduleTagCleanup();
        
        // Start notification cooldown cleanup
        this.scheduleNotificationCleanup();
            
            console.log('Tag system initialized', {
                tags: this.tags.size,
                tabTags: this.tabTags.size,
                groups: this.tagGroups.size
            });
            
        } catch (error) {
            console.error('Failed to initialize tag system:', error);
        }
    }
    
    async initializeDefaultTagSuggestions() {
        const defaultSuggestions = {
            // Work & Productivity
            'github.com': ['Development', 'Work', 'Code'],
            'stackoverflow.com': ['Development', 'Help', 'Code'],
            'docs.google.com': ['Work', 'Documents', 'Productivity'],
            'gmail.com': ['Work', 'Email', 'Communication'],
            'calendar.google.com': ['Work', 'Productivity', 'Schedule'],
            'trello.com': ['Work', 'Productivity', 'Project Management'],
            'slack.com': ['Work', 'Communication', 'Team'],
            'zoom.us': ['Work', 'Communication', 'Meeting'],
            'linkedin.com': ['Work', 'Professional', 'Network'],
            
            // Social & Entertainment
            'facebook.com': ['Social Media', 'Entertainment', 'Personal'],
            'twitter.com': ['Social Media', 'News', 'Entertainment'],
            'instagram.com': ['Social Media', 'Entertainment', 'Personal'],
            'youtube.com': ['Entertainment', 'Video', 'Learning'],
            'reddit.com': ['Social Media', 'Entertainment', 'News'],
            'tiktok.com': ['Social Media', 'Entertainment', 'Video'],
            
            // Learning & Research
            'wikipedia.org': ['Research', 'Learning', 'Reference'],
            'coursera.org': ['Learning', 'Education', 'Course'],
            'udemy.com': ['Learning', 'Education', 'Course'],
            'medium.com': ['Learning', 'Reading', 'Articles'],
            'arxiv.org': ['Research', 'Academic', 'Papers'],
            
            // Shopping & Finance
            'amazon.com': ['Shopping', 'Personal', 'E-commerce'],
            'ebay.com': ['Shopping', 'Personal', 'E-commerce'],
            'paypal.com': ['Finance', 'Personal', 'Payment'],
            'bank': ['Finance', 'Personal', 'Banking'],
            
            // News & Information
            'news': ['News', 'Information', 'Current Events'],
            'bbc.com': ['News', 'Information', 'Current Events'],
            'cnn.com': ['News', 'Information', 'Current Events']
        };
        
        for (const [domain, tags] of Object.entries(defaultSuggestions)) {
            if (!this.domainTagSuggestions.has(domain)) {
                this.domainTagSuggestions.set(domain, tags);
            }
        }
        
        await this.saveTagData();
    }
    
    // Generate unique tag ID
    generateTagId(name) {
        return `tag_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    }
    
    // Generate unique group ID
    generateGroupId(name) {
        return `group_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    }
    
    // Create a new tag
    async createTag(name, options = {}) {
        if (!this.settings.tagsEnabled) return null;
        
        const tagId = this.generateTagId(name);
        const tag = {
            id: tagId,
            name: name,
            color: options.color || this.getDefaultTagColor(),
            created: Date.now(),
            lastUsed: Date.now(),
            frequency: 0,
            usage: {
                daily: 0,
                weekly: 0,
                monthly: 0,
                total: 0
            },
            autoSuspend: options.autoSuspend !== false,
            priority: options.priority || 'medium', // low, medium, high
            group: options.group || null
        };
        
        this.tags.set(tagId, tag);
        await this.saveTagData();
        
        // Update context menus
        if (this.settings.tagsEnabled) {
            this.updateContextMenuTags();
        }
        
        console.log(`Created tag: ${name} (${tagId})`);
        return tagId;
    }
    
    // Delete a tag
    async deleteTag(tagId) {
        if (!this.tags.has(tagId)) return false;
        
        // Remove tag from all tabs
        for (const [tabId, tagSet] of this.tabTags.entries()) {
            if (tagSet.has(tagId)) {
                tagSet.delete(tagId);
                if (tagSet.size === 0) {
                    this.tabTags.delete(tabId);
                }
            }
        }
        
        // Remove from groups
        for (const group of this.tagGroups.values()) {
            if (group.tags && group.tags.includes(tagId)) {
                group.tags = group.tags.filter(id => id !== tagId);
            }
        }
        
        // Remove tag and its usage history
        this.tags.delete(tagId);
        this.tagUsageHistory.delete(tagId);
        
        await this.saveTagData();
        console.log(`Deleted tag: ${tagId}`);
        return true;
    }
    
    // Assign tag to tab
    async assignTagToTab(tabId, tagId) {
        if (!this.tags.has(tagId)) return false;
        
        if (!this.tabTags.has(tabId)) {
            this.tabTags.set(tabId, new Set());
        }
        
        const tabTagSet = this.tabTags.get(tabId);
        if (tabTagSet.size >= this.settings.maxTagsPerTab) {
            console.warn(`Tab ${tabId} already has maximum tags (${this.settings.maxTagsPerTab})`);
            return false;
        }
        
        tabTagSet.add(tagId);
        
        // Update tag usage
        const tag = this.tags.get(tagId);
        tag.lastUsed = Date.now();
        tag.usage.total++;
        tag.usage.daily++;
        
        await this.updateTagFrequency(tagId);
        await this.saveTagData();
        
        console.log(`Assigned tag ${tagId} to tab ${tabId}`);
        return true;
    }
    
    // Remove tag from tab
    async removeTagFromTab(tabId, tagId) {
        const tabTagSet = this.tabTags.get(tabId);
        if (!tabTagSet || !tabTagSet.has(tagId)) return false;
        
        tabTagSet.delete(tagId);
        if (tabTagSet.size === 0) {
            this.tabTags.delete(tabId);
        }
        
        await this.saveTagData();
        console.log(`Removed tag ${tagId} from tab ${tabId}`);
        return true;
    }
    
    // Get tags for a specific tab
    getTabTags(tabId) {
        const tagSet = this.tabTags.get(tabId);
        if (!tagSet) return [];
        
        return Array.from(tagSet)
            .map(tagId => this.tags.get(tagId))
            .filter(tag => tag !== undefined);
    }
    
    // Get all tabs with a specific tag
    getTabsWithTag(tagId) {
        const tabIds = [];
        for (const [tabId, tagSet] of this.tabTags.entries()) {
            if (tagSet.has(tagId)) {
                tabIds.push(tabId);
            }
        }
        return tabIds;
    }
    
    // Update tag frequency based on usage patterns
    async updateTagFrequency(tagId) {
        const tag = this.tags.get(tagId);
        if (!tag) return;
        
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const weekMs = 7 * dayMs;
        const monthMs = 30 * dayMs;
        
        // Get or create usage history
        if (!this.tagUsageHistory.has(tagId)) {
            this.tagUsageHistory.set(tagId, []);
        }
        
        const history = this.tagUsageHistory.get(tagId);
        history.push({ timestamp: now, action: 'used' });
        
        // Keep only recent history (last month)
        const cutoff = now - monthMs;
        const recentHistory = history.filter(entry => entry.timestamp > cutoff);
        this.tagUsageHistory.set(tagId, recentHistory);
        
        // Calculate frequency metrics
        const dailyUsage = recentHistory.filter(entry => entry.timestamp > now - dayMs).length;
        const weeklyUsage = recentHistory.filter(entry => entry.timestamp > now - weekMs).length;
        const monthlyUsage = recentHistory.length;
        
        tag.usage.daily = dailyUsage;
        tag.usage.weekly = weeklyUsage;
        tag.usage.monthly = monthlyUsage;
        
        // Calculate frequency score (0-1)
        // Weighted average: 50% daily, 30% weekly, 20% monthly
        const maxDaily = 20; // max expected daily usage
        const maxWeekly = 50; // max expected weekly usage
        const maxMonthly = 100; // max expected monthly usage
        
        const dailyScore = Math.min(dailyUsage / maxDaily, 1);
        const weeklyScore = Math.min(weeklyUsage / maxWeekly, 1);
        const monthlyScore = Math.min(monthlyUsage / maxMonthly, 1);
        
        tag.frequency = (dailyScore * 0.5) + (weeklyScore * 0.3) + (monthlyScore * 0.2);
        
        console.log(`Updated frequency for tag ${tag.name}: ${tag.frequency.toFixed(3)}`);
    }
    
    // Auto-suggest tags for a tab based on URL and domain
    async suggestTagsForTab(tab) {
        if (!this.settings.autoTagging || !this.settings.tagSuggestions) return [];
        
        const suggestions = new Set();
        
        try {
            // Validate and normalize the URL
            const tabUrl = tab.url || '';
            const title = tab.title || '';
            
            // Skip invalid or special URLs
            if (!tabUrl || 
                tabUrl.startsWith('chrome://') || 
                tabUrl.startsWith('chrome-extension://') || 
                tabUrl.startsWith('edge://') || 
                tabUrl.startsWith('about:') || 
                tabUrl === 'about:blank') {
                
                // For special pages, try title-based suggestions only
                const titleContent = title.toLowerCase();
                const keywords = {
                    'Development': ['github', 'stackoverflow', 'code', 'dev', 'api', 'docs', 'developer'],
                    'Work': ['docs', 'drive', 'office', 'work', 'meeting', 'calendar', 'productivity'],
                    'Social Media': ['facebook', 'twitter', 'instagram', 'social', 'linkedin'],
                    'Entertainment': ['youtube', 'netflix', 'video', 'music', 'game', 'entertainment'],
                    'Shopping': ['amazon', 'shop', 'cart', 'buy', 'store', 'shopping'],
                    'News': ['news', 'article', 'breaking', 'update', 'latest'],
                    'Learning': ['course', 'tutorial', 'learn', 'education', 'study'],
                    'Research': ['wiki', 'research', 'paper', 'academic', 'study'],
                    'Browser': ['chrome', 'edge', 'browser', 'extension', 'settings']
                };
                
                for (const [tagName, keywords_list] of Object.entries(keywords)) {
                    if (keywords_list.some(keyword => titleContent.includes(keyword))) {
                        suggestions.add(tagName);
                    }
                }
            } else {
                // Try to parse as URL
                let url, domain, pathname;
                try {
                    url = new URL(tabUrl);
                    domain = url.hostname.replace('www.', '');
                    pathname = url.pathname;
                } catch (urlError) {
                    console.debug(`Invalid URL for tab ${tab.id}: ${tabUrl}`);
                    // Fallback: extract domain from URL string if possible
                    const urlMatch = tabUrl.match(/https?:\/\/([^\/]+)/);
                    if (urlMatch) {
                        domain = urlMatch[1].replace('www.', '');
                        pathname = '';
                    } else {
                        // Can't parse URL, use title-based suggestions only
                        domain = '';
                        pathname = '';
                    }
                }
                
                // Domain-based suggestions
                if (domain) {
                    for (const [domainPattern, tagNames] of this.domainTagSuggestions.entries()) {
                        if (domain.includes(domainPattern) || domainPattern.includes(domain)) {
                            tagNames.forEach(tagName => suggestions.add(tagName));
                        }
                    }
                }
                
                // Content-based suggestions (title + pathname)
                const content = `${title} ${pathname || ''}`.toLowerCase();
                const keywords = {
                    'Development': ['github', 'stackoverflow', 'code', 'dev', 'api', 'docs', 'programming'],
                    'Work': ['docs', 'drive', 'office', 'work', 'meeting', 'calendar', 'productivity'],
                    'Social Media': ['facebook', 'twitter', 'instagram', 'social', 'linkedin', 'reddit'],
                    'Entertainment': ['youtube', 'netflix', 'video', 'music', 'game', 'entertainment', 'stream'],
                    'Shopping': ['amazon', 'shop', 'cart', 'buy', 'store', 'shopping', 'ebay'],
                    'News': ['news', 'article', 'breaking', 'update', 'latest', 'reuters', 'bbc', 'cnn'],
                    'Learning': ['course', 'tutorial', 'learn', 'education', 'study', 'coursera', 'udemy'],
                    'Research': ['wiki', 'research', 'paper', 'academic', 'study', 'scholar']
                };
                
                for (const [tagName, keywords_list] of Object.entries(keywords)) {
                    if (keywords_list.some(keyword => content.includes(keyword))) {
                        suggestions.add(tagName);
                    }
                }
            }
            
            // Convert suggestions to tag IDs or create new tags if needed
            const suggestedTags = [];
            for (const tagName of suggestions) {
                let tagId = this.findTagByName(tagName);
                if (!tagId && this.settings.autoTagging) {
                    tagId = await this.createTag(tagName);
                }
                if (tagId) {
                    suggestedTags.push(tagId);
                }
            }
            
            console.debug(`Tag suggestions for "${title}": ${Array.from(suggestions).join(', ')}`);
            return suggestedTags;
            
        } catch (error) {
            console.error('Error suggesting tags for tab:', error);
            // Return title-based suggestions as fallback
            try {
                const titleContent = (tab.title || '').toLowerCase();
                const fallbackKeywords = {
                    'Work': ['work', 'office', 'meeting'],
                    'Entertainment': ['video', 'music', 'game'],
                    'Development': ['code', 'github']
                };
                
                const fallbackSuggestions = [];
                for (const [tagName, keywords] of Object.entries(fallbackKeywords)) {
                    if (keywords.some(keyword => titleContent.includes(keyword))) {
                        let tagId = this.findTagByName(tagName);
                        if (!tagId && this.settings.autoTagging) {
                            tagId = await this.createTag(tagName);
                        }
                        if (tagId) {
                            fallbackSuggestions.push(tagId);
                        }
                    }
                }
                
                return fallbackSuggestions;
            } catch (fallbackError) {
                console.error('Fallback tag suggestion also failed:', fallbackError);
                return [];
            }
        }
    }
    
    // Find tag by name
    findTagByName(name) {
        for (const [tagId, tag] of this.tags.entries()) {
            if (tag.name.toLowerCase() === name.toLowerCase()) {
                return tagId;
            }
        }
        return null;
    }
    
    // Get default color for new tags
    getDefaultTagColor() {
        const colors = [
            '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', 
            '#F44336', '#795548', '#607D8B', '#3F51B5',
            '#009688', '#8BC34A', '#FFC107', '#E91E63'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Get frequent tags (above threshold)
    getFrequentTags() {
        return Array.from(this.tags.values())
            .filter(tag => tag.frequency >= this.settings.tagFrequencyThreshold)
            .sort((a, b) => b.frequency - a.frequency);
    }
    
    // Get active tags (used in last 24 hours)
    getActiveTags() {
        const dayMs = 24 * 60 * 60 * 1000;
        const cutoff = Date.now() - dayMs;
        
        return Array.from(this.tags.values())
            .filter(tag => tag.lastUsed > cutoff)
            .sort((a, b) => b.lastUsed - a.lastUsed);
    }
    
    // Get all tags sorted by usage
    getAllTagsSorted() {
        return Array.from(this.tags.values())
            .sort((a, b) => {
                // Sort by frequency first, then by last used
                if (b.frequency !== a.frequency) {
                    return b.frequency - a.frequency;
                }
                return b.lastUsed - a.lastUsed;
            });
    }
    
    // Schedule tag cleanup (remove unused tags)
    scheduleTagCleanup() {
        const cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours
        
        setInterval(() => {
            this.cleanupInactiveTags();
        }, cleanupInterval);
        
        // Initial cleanup after 1 hour
        setTimeout(() => {
            this.cleanupInactiveTags();
        }, 60 * 60 * 1000);
    }
    
    // Remove tags that haven't been used for a long time
    async cleanupInactiveTags() {
        const now = Date.now();
        const inactivityThreshold = this.settings.tagInactivityDays * 24 * 60 * 60 * 1000;
        const cutoff = now - inactivityThreshold;
        
        const tagsToDelete = [];
        
        for (const [tagId, tag] of this.tags.entries()) {
            // Don't delete tags that are currently assigned to tabs
            const hasAssignedTabs = this.getTabsWithTag(tagId).length > 0;
            if (hasAssignedTabs) continue;
            
            // Don't delete frequently used tags
            if (tag.frequency >= this.settings.tagFrequencyThreshold) continue;
            
            // Delete if not used for threshold period
            if (tag.lastUsed < cutoff) {
                tagsToDelete.push(tagId);
            }
        }
        
        for (const tagId of tagsToDelete) {
            await this.deleteTag(tagId);
        }
        
        if (tagsToDelete.length > 0) {
            console.log(`Cleaned up ${tagsToDelete.length} inactive tags`);
        }
        
        this.lastTagCleanup = now;
    }
    
    // Schedule notification cooldown cleanup
    scheduleNotificationCleanup() {
        // Clean up old cooldowns every 10 minutes
        setInterval(() => {
            this.cleanupNotificationCooldowns();
        }, 10 * 60 * 1000);
    }
    
    // Remove old notification cooldowns
    cleanupNotificationCooldowns() {
        const now = Date.now();
        const maxAge = 60 * 60 * 1000; // 1 hour
        
        for (const [key, timestamp] of this.notificationCooldowns.entries()) {
            if (now - timestamp > maxAge) {
                this.notificationCooldowns.delete(key);
            }
        }
        
        console.debug(`Cleaned up notification cooldowns, ${this.notificationCooldowns.size} remaining`);
    }
    
    // Save tag data to storage
    async saveTagData() {
        try {
            const tagData = {
                fastbrowse_tags: Object.fromEntries(this.tags),
                fastbrowse_tab_tags: Object.fromEntries(
                    Array.from(this.tabTags.entries()).map(([tabId, tagSet]) => [
                        tabId.toString(),
                        Array.from(tagSet)
                    ])
                ),
                fastbrowse_tag_groups: Object.fromEntries(this.tagGroups),
                fastbrowse_tag_usage: Object.fromEntries(this.tagUsageHistory),
                fastbrowse_domain_suggestions: Object.fromEntries(this.domainTagSuggestions)
            };
            
            await chrome.storage.local.set(tagData);
        } catch (error) {
            console.error('Failed to save tag data:', error);
        }
    }
    
    // Update usage for all tags associated with a tab
    async updateTabTagUsage(tabId) {
        const tabTagSet = this.tabTags.get(tabId);
        if (!tabTagSet || tabTagSet.size === 0) return;
        
        for (const tagId of tabTagSet) {
            await this.updateTagFrequency(tagId);
        }
        
        await this.saveTagData();
    }
    
    // ============================================================================
    // TAG GROUPING ALGORITHMS
    // ============================================================================
    
    // Create a tag group
    async createTagGroup(name, tagIds = [], options = {}) {
        const groupId = this.generateGroupId(name);
        const group = {
            id: groupId,
            name: name,
            tags: tagIds,
            created: Date.now(),
            lastUsed: Date.now(),
            suspendRule: options.suspendRule || 'inactive', // never, inactive, always
            color: options.color || this.getDefaultTagColor(),
            autoSuspendDelay: options.autoSuspendDelay || 30, // minutes
            priority: options.priority || 'medium'
        };
        
        this.tagGroups.set(groupId, group);
        await this.saveTagData();
        
        console.log(`Created tag group: ${name} (${groupId})`);
        return groupId;
    }
    
    // Auto-group tabs based on various criteria
    async autoGroupTabs() {
        if (!this.settings.tagsEnabled) return;
        
        console.log('Starting auto-grouping process...');
        
        const tabs = await chrome.tabs.query({});
        const groupSuggestions = [];
        
        // Group by domain similarity
        const domainGroups = await this.groupTabsByDomain(tabs);
        groupSuggestions.push(...domainGroups);
        
        // Group by tag co-occurrence
        const tagCoGroups = await this.groupTabsByTagCooccurrence(tabs);
        groupSuggestions.push(...tagCoGroups);
        
        // Group by usage patterns
        const usageGroups = await this.groupTabsByUsagePattern(tabs);
        groupSuggestions.push(...usageGroups);
        
        // Group by time-based patterns
        const timeGroups = await this.groupTabsByTimePattern(tabs);
        groupSuggestions.push(...timeGroups);
        
        console.log(`Generated ${groupSuggestions.length} auto-grouping suggestions`);
        return groupSuggestions;
    }
    
    // Group tabs by domain similarity
    async groupTabsByDomain(tabs) {
        const domainGroups = new Map();
        const suggestions = [];
        
        for (const tab of tabs) {
            try {
                const url = new URL(tab.url);
                const domain = url.hostname.replace('www.', '');
                
                if (!domainGroups.has(domain)) {
                    domainGroups.set(domain, []);
                }
                domainGroups.get(domain).push(tab);
            } catch (error) {
                // Skip invalid URLs
                continue;
            }
        }
        
        // Create suggestions for domains with multiple tabs
        for (const [domain, domainTabs] of domainGroups.entries()) {
            if (domainTabs.length >= 2) {
                const domainName = domain.split('.')[0];
                const groupName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
                
                suggestions.push({
                    type: 'domain',
                    name: groupName,
                    tabs: domainTabs,
                    confidence: Math.min(domainTabs.length / 5, 1), // Higher confidence with more tabs
                    reason: `${domainTabs.length} tabs from ${domain}`
                });
            }
        }
        
        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }
    
    // Group tabs by tag co-occurrence patterns
    async groupTabsByTagCooccurrence(tabs) {
        const tagCombinations = new Map();
        const suggestions = [];
        
        // Analyze which tags frequently appear together
        for (const tab of tabs) {
            const tabTags = this.getTabTags(tab.id);
            if (tabTags.length < 2) continue;
            
            // Generate all combinations of tags for this tab
            for (let i = 0; i < tabTags.length; i++) {
                for (let j = i + 1; j < tabTags.length; j++) {
                    const combo = [tabTags[i].id, tabTags[j].id].sort().join(',');
                    
                    if (!tagCombinations.has(combo)) {
                        tagCombinations.set(combo, {
                            tags: [tabTags[i], tabTags[j]],
                            tabs: [],
                            count: 0
                        });
                    }
                    
                    tagCombinations.get(combo).tabs.push(tab);
                    tagCombinations.get(combo).count++;
                }
            }
        }
        
        // Create suggestions for frequent tag combinations
        for (const [combo, data] of tagCombinations.entries()) {
            if (data.count >= 3) { // At least 3 co-occurrences
                const groupName = data.tags.map(tag => tag.name).join(' + ');
                
                suggestions.push({
                    type: 'tag-cooccurrence',
                    name: groupName,
                    tags: data.tags,
                    tabs: data.tabs,
                    confidence: Math.min(data.count / 10, 1),
                    reason: `${data.count} tabs with both tags`
                });
            }
        }
        
        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }
    
    // Group tabs by usage patterns (frequent vs occasional)
    async groupTabsByUsagePattern(tabs) {
        const suggestions = [];
        const frequentTabs = [];
        const occasionalTabs = [];
        
        for (const tab of tabs) {
            const tabTags = this.getTabTags(tab.id);
            const avgFrequency = tabTags.length > 0 
                ? tabTags.reduce((sum, tag) => sum + tag.frequency, 0) / tabTags.length
                : 0;
            
            if (avgFrequency >= this.settings.tagFrequencyThreshold) {
                frequentTabs.push(tab);
            } else if (avgFrequency > 0) {
                occasionalTabs.push(tab);
            }
        }
        
        if (frequentTabs.length >= 3) {
            suggestions.push({
                type: 'usage-frequent',
                name: 'Frequent Use',
                tabs: frequentTabs,
                confidence: Math.min(frequentTabs.length / 10, 1),
                reason: `${frequentTabs.length} frequently used tabs`,
                priority: 'high'
            });
        }
        
        if (occasionalTabs.length >= 5) {
            suggestions.push({
                type: 'usage-occasional',
                name: 'Occasional Use',
                tabs: occasionalTabs,
                confidence: Math.min(occasionalTabs.length / 15, 1),
                reason: `${occasionalTabs.length} occasionally used tabs`,
                priority: 'low'
            });
        }
        
        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }
    
    // Group tabs by time-based patterns (work hours, etc.)
    async groupTabsByTimePattern(tabs) {
        const suggestions = [];
        const now = new Date();
        const currentHour = now.getHours();
        
        // Define time periods
        const timePatterns = {
            'Morning Work': { start: 8, end: 12, tags: ['Work', 'Development', 'Productivity'] },
            'Afternoon Work': { start: 13, end: 17, tags: ['Work', 'Development', 'Productivity'] },
            'Evening Personal': { start: 18, end: 22, tags: ['Personal', 'Entertainment', 'Social Media'] },
            'Late Night': { start: 22, end: 6, tags: ['Entertainment', 'Personal', 'Research'] }
        };
        
        for (const [patternName, pattern] of Object.entries(timePatterns)) {
            const matchingTabs = [];
            
            for (const tab of tabs) {
                const tabTags = this.getTabTags(tab.id);
                const hasMatchingTag = tabTags.some(tag => 
                    pattern.tags.some(patternTag => 
                        tag.name.toLowerCase().includes(patternTag.toLowerCase())
                    )
                );
                
                // Check if current time matches pattern
                const isTimeMatch = (pattern.start <= pattern.end) 
                    ? (currentHour >= pattern.start && currentHour <= pattern.end)
                    : (currentHour >= pattern.start || currentHour <= pattern.end);
                
                if (hasMatchingTag && isTimeMatch) {
                    matchingTabs.push(tab);
                }
            }
            
            if (matchingTabs.length >= 2) {
                suggestions.push({
                    type: 'time-pattern',
                    name: patternName,
                    tabs: matchingTabs,
                    confidence: Math.min(matchingTabs.length / 5, 1),
                    reason: `${matchingTabs.length} tabs matching ${patternName.toLowerCase()} pattern`,
                    timePattern: pattern
                });
            }
        }
        
        return suggestions.sort((a, b) => b.confidence - a.confidence);
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
    
    // Focus Mode Implementation
    async ensureOffscreen() {
        try {
            const has = await chrome.offscreen.hasDocument?.();
            if (!has) {
                await chrome.offscreen.createDocument({
                    url: chrome.runtime.getURL('src/offscreen.html'),
                    reasons: ['AUDIO_PLAYBACK'],
                    justification: 'Play ambient focus music while Focus Mode is enabled'
                });
            }
        } catch (e) {
            console.debug('Offscreen ensure failed (may still exist):', e);
        }
    }

    async closeOffscreen() {
        try {
            await chrome.offscreen.closeDocument?.();
        } catch (e) {
            console.debug('Offscreen close failed:', e);
        }
    }

    async playFocusMusic(trackPath) {
        if (!trackPath || trackPath === 'none') return;
        await this.ensureOffscreen();
        try {
            await chrome.runtime.sendMessage({ action: 'focusMusicPlay', track: trackPath, volume: 0.25 });
        } catch (e) {
            console.debug('Failed to send focusMusicPlay:', e);
        }
    }

    async stopFocusMusic() {
        try {
            await chrome.runtime.sendMessage({ action: 'focusMusicStop' });
        } catch (e) {
            console.debug('Failed to send focusMusicStop:', e);
        }
    }

    async enableFocusMode() {
        try {
            this.focusModeActive = true;
            this.focusModeStartTime = Date.now();
            this.settings.focusMode = true;
            
            // Save focus mode state
            await chrome.storage.sync.set({ focusMode: true });
            
            console.log('Focus mode enabled');
            
            // Inject focus mode into all existing tabs
            await this.injectFocusModeIntoAllTabs();
            
            // Auto-suspend tabs if enabled
            if (this.settings.focusAutoSuspend) {
                await this.focusAutoSuspendTabs();
            }
            
            // Show notification
            if (this.settings.showNotifications) {
                this.showNotification('🎯 Focus Mode Enabled - Distractions removed');
            }

            // Start focus music if configured
            if (this.settings.focusModeMusic && this.settings.focusModeMusic !== 'none') {
                await this.playFocusMusic(this.settings.focusModeMusic);
            }
            
            // Check for recommended extensions
            if (this.settings.focusExtensionRecommendations) {
                setTimeout(() => this.checkMissingFocusExtensions(), 2000);
            }
            
        } catch (error) {
            console.error('Failed to enable focus mode:', error);
            this.focusModeActive = false;
            this.settings.focusMode = false;
            throw error;
        }
    }
    
    async disableFocusMode() {
        try {
            this.focusModeActive = false;
            this.settings.focusMode = false;
            
            // Update stats
            if (this.focusModeStartTime) {
                this.focusModeStats.timeActive += Date.now() - this.focusModeStartTime;
                this.focusModeStartTime = null;
            }
            
            // Save focus mode state
            await chrome.storage.sync.set({ focusMode: false });
            
            console.log('Focus mode disabled');
            
            // Remove focus mode from all existing tabs
            await this.removeFocusModeFromAllTabs();
            
            // Stop focus music if any
            await this.stopFocusMusic();

            // Show notification
            if (this.settings.showNotifications) {
                const timeActiveMinutes = Math.round(this.focusModeStats.timeActive / 60000);
                this.showNotification(`✨ Focus Mode Disabled - Active for ${timeActiveMinutes} minutes`);
            }
            
        } catch (error) {
            console.error('Failed to disable focus mode:', error);
            throw error;
        }
    }
    
    async injectFocusModeIntoAllTabs() {
        try {
            const tabs = await chrome.tabs.query({});
            
            for (const tab of tabs) {
                // Skip chrome:// and extension pages
                if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                    continue;
                }
                
                try {
                    // Send message to content script
                    await chrome.tabs.sendMessage(tab.id, { action: 'enableFocusMode' });
                } catch (error) {
                    // Content script might not be loaded yet, that's OK
                    console.debug(`Could not enable focus mode in tab ${tab.id}:`, error.message);
                }
            }
        } catch (error) {
            console.error('Failed to inject focus mode into tabs:', error);
        }
    }
    
    async removeFocusModeFromAllTabs() {
        try {
            const tabs = await chrome.tabs.query({});
            
            for (const tab of tabs) {
                if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                    continue;
                }
                
                try {
                    await chrome.tabs.sendMessage(tab.id, { action: 'disableFocusMode' });
                } catch (error) {
                    console.debug(`Could not disable focus mode in tab ${tab.id}:`, error.message);
                }
            }
        } catch (error) {
            console.error('Failed to remove focus mode from tabs:', error);
        }
    }
    
    async focusAutoSuspendTabs() {
        try {
            const tabs = await chrome.tabs.query({ active: false });
            let suspendCount = 0;
            
            for (const tab of tabs) {
                // Don't suspend tabs that are already suspended
                if (this.suspendedTabs.has(tab.id)) {
                    continue;
                }
                
                // Apply same protection logic as regular suspension
                if (await this.shouldProtectTab(tab)) {
                    continue;
                }
                
                await this.suspendTab(tab.id);
                suspendCount++;
            }
            
            this.focusModeStats.tabsSuspended += suspendCount;
            console.log(`Focus mode: Auto-suspended ${suspendCount} tabs`);
            
        } catch (error) {
            console.error('Failed to auto-suspend tabs in focus mode:', error);
        }
    }
    
    async getFocusExtensionRecommendations() {
        try {
            const installedExtensions = await chrome.management.getAll();
            const installedIds = new Set(installedExtensions
                .filter(ext => ext.enabled)
                .map(ext => ext.id)
            );
            
            const recommendations = [];
            
            for (const [key, extension] of this.recommendedFocusExtensions) {
                if (!installedIds.has(extension.id)) {
                    recommendations.push({
                        key,
                        ...extension,
                        installed: false,
                        enabled: false
                    });
                } else {
                    const installedExt = installedExtensions.find(e => e.id === extension.id);
                    recommendations.push({
                        key,
                        ...extension,
                        installed: true,
                        enabled: installedExt?.enabled || false
                    });
                }
            }
            
            return recommendations.sort((a, b) => b.priority - a.priority);
            
        } catch (error) {
            console.error('Failed to get focus extension recommendations:', error);
            return [];
        }
    }
    
    async checkMissingFocusExtensions() {
        try {
            const recommendations = await this.getFocusExtensionRecommendations();
            const missing = recommendations.filter(ext => !ext.installed && ext.priority >= 8);
            
            if (missing.length > 0 && this.settings.showNotifications) {
                const topMissing = missing[0];
                this.showNotification(
                    `💡 Focus Tip: Install ${topMissing.name} for better distraction blocking`,
                    {
                        buttons: [{
                            title: 'Install'
                        }],
                        eventTime: Date.now() + 5000,
                        requireInteraction: true
                    }
                );
            }
            
        } catch (error) {
            console.error('Failed to check missing focus extensions:', error);
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
                    const tabsWithSuspendState = tabs.map(tab => {
                        const tabData = {
                            ...tab,
                            suspended: this.suspendedTabs.has(tab.id)
                        };
                        
                        // Add tag information if tags are enabled
                        if (this.settings.tagsEnabled) {
                            tabData.tags = this.getTabTags(tab.id);
                        }
                        
                        return tabData;
                    });
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

                    // If focus mode is active and music setting changed, update playback
                    if (request.settings && Object.prototype.hasOwnProperty.call(request.settings, 'focusModeMusic')) {
                        if (this.focusModeActive) {
                            if (this.settings.focusModeMusic && this.settings.focusModeMusic !== 'none') {
                                await this.playFocusMusic(this.settings.focusModeMusic);
                            } else {
                                await this.stopFocusMusic();
                            }
                        }
                    }

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
                    
                case 'previewFocusMusic':
                    try {
                        const track = request.track || this.settings.focusModeMusic || 'none';
                        const duration = Math.min(Math.max(Number(request.durationMs || 10000), 2000), 60000);
                        if (track === 'none') {
                            await this.stopFocusMusic();
                        } else {
                            await this.ensureOffscreen();
                            await chrome.runtime.sendMessage({ action: 'focusMusicPreview', track: track, durationMs: duration, volume: 0.25 });
                        }
                        sendResponse({ success: true });
                    } catch (error) {
                        console.error('Preview focus music failed:', error);
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
                    
                case 'enableFocusMode':
                    console.log('Enabling focus mode');
                    await this.enableFocusMode();
                    sendResponse({ success: true, focusMode: true });
                    break;
                    
                case 'disableFocusMode':
                    console.log('Disabling focus mode');
                    await this.disableFocusMode();
                    sendResponse({ success: true, focusMode: false });
                    break;
                    
                case 'toggleFocusMode':
                    const newState = !this.focusModeActive;
                    console.log(`Toggling focus mode to: ${newState}`);
                    if (newState) {
                        await this.enableFocusMode();
                    } else {
                        await this.disableFocusMode();
                    }
                    sendResponse({ success: true, focusMode: this.focusModeActive });
                    break;
                    
                case 'getFocusState':
                    sendResponse({ 
                        success: true, 
                        data: {
                            focusMode: this.focusModeActive,
                            stats: this.focusModeStats,
                            startTime: this.focusModeStartTime
                        }
                    });
                    break;
                    
                case 'getFocusExtensionRecommendations':
                    try {
                        const recommendations = await this.getFocusExtensionRecommendations();
                        sendResponse({ success: true, data: recommendations });
                    } catch (error) {
                        console.error('Failed to get focus extension recommendations:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                // Tag management actions
                case 'getAllTags':
                    const allTags = this.getAllTagsSorted();
                    sendResponse({ success: true, data: allTags });
                    break;
                    
                case 'getFrequentTags':
                    const frequentTags = this.getFrequentTags();
                    sendResponse({ success: true, data: frequentTags });
                    break;
                    
                case 'getActiveTags':
                    const activeTags = this.getActiveTags();
                    sendResponse({ success: true, data: activeTags });
                    break;
                    
                case 'createTag':
                    try {
                        const tagId = await this.createTag(request.name, request.options || {});
                        sendResponse({ success: true, data: { tagId } });
                    } catch (error) {
                        console.error('Failed to create tag:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'deleteTag':
                    try {
                        const result = await this.deleteTag(request.tagId);
                        sendResponse({ success: result });
                    } catch (error) {
                        console.error('Failed to delete tag:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'assignTagToTab':
                    try {
                        const result = await this.assignTagToTab(request.tabId, request.tagId);
                        sendResponse({ success: result });
                    } catch (error) {
                        console.error('Failed to assign tag to tab:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'removeTagFromTab':
                    try {
                        const result = await this.removeTagFromTab(request.tabId, request.tagId);
                        sendResponse({ success: result });
                    } catch (error) {
                        console.error('Failed to remove tag from tab:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'getTabTags':
                    try {
                        const tags = this.getTabTags(request.tabId);
                        sendResponse({ success: true, data: tags });
                    } catch (error) {
                        console.error('Failed to get tab tags:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'suggestTagsForTab':
                    try {
                        const tab = await chrome.tabs.get(request.tabId);
                        const suggestions = await this.suggestTagsForTab(tab);
                        sendResponse({ success: true, data: suggestions });
                    } catch (error) {
                        console.error('Failed to suggest tags for tab:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'getTabsWithTag':
                    try {
                        const tabIds = this.getTabsWithTag(request.tagId);
                        const tabs = [];
                        for (const tabId of tabIds) {
                            try {
                                const tab = await chrome.tabs.get(tabId);
                                tabs.push(tab);
                            } catch (e) {
                                // Tab might have been closed, clean up
                                await this.removeTagFromTab(tabId, request.tagId);
                            }
                        }
                        sendResponse({ success: true, data: tabs });
                    } catch (error) {
                        console.error('Failed to get tabs with tag:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'autoGroupTabs':
                    try {
                        const suggestions = await this.autoGroupTabs();
                        sendResponse({ success: true, data: suggestions });
                    } catch (error) {
                        console.error('Failed to auto-group tabs:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'createTagGroup':
                    try {
                        const groupId = await this.createTagGroup(
                            request.name,
                            request.tagIds || [],
                            request.options || {}
                        );
                        sendResponse({ success: true, data: { groupId } });
                    } catch (error) {
                        console.error('Failed to create tag group:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'getTagGroups':
                    try {
                        const groups = Array.from(this.tagGroups.values());
                        sendResponse({ success: true, data: groups });
                    } catch (error) {
                        console.error('Failed to get tag groups:', error);
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
    
    // ============================================================================
    // CONTEXT MENUS AND KEYBOARD SHORTCUTS
    // ============================================================================
    
    setupContextMenus() {
        if (!this.settings.tagsEnabled) return;
        
        try {
            // Remove existing context menus
            chrome.contextMenus.removeAll();
            
            // Main tag management menu
            chrome.contextMenus.create({
                id: 'fastbrowse-tags',
                title: '🏷️ FastBrowse Tags',
                contexts: ['page', 'action']
            });
            
            // Quick tag options
            chrome.contextMenus.create({
                id: 'quick-tag-current',
                parentId: 'fastbrowse-tags',
                title: 'Quick Tag Current Tab',
                contexts: ['page', 'action']
            });
            
            chrome.contextMenus.create({
                id: 'suggest-tags',
                parentId: 'fastbrowse-tags',
                title: 'Suggest Tags for This Tab',
                contexts: ['page', 'action']
            });
            
            chrome.contextMenus.create({
                id: 'separator1',
                parentId: 'fastbrowse-tags',
                type: 'separator',
                contexts: ['page', 'action']
            });
            
            // Auto-grouping
            chrome.contextMenus.create({
                id: 'auto-group-tabs',
                parentId: 'fastbrowse-tags',
                title: 'Auto-Group All Tabs',
                contexts: ['page', 'action']
            });
            
            chrome.contextMenus.create({
                id: 'separator2',
                parentId: 'fastbrowse-tags',
                type: 'separator',
                contexts: ['page', 'action']
            });
            
            // Add recent tags as submenu items
            this.updateContextMenuTags();
            
            // Listen for context menu clicks
            chrome.contextMenus.onClicked.addListener((info, tab) => {
                this.handleContextMenuClick(info, tab);
            });
            
        } catch (error) {
            console.error('Failed to setup context menus:', error);
        }
    }
    
    async updateContextMenuTags() {
        try {
            const frequentTags = this.getFrequentTags().slice(0, 5); // Top 5 frequent tags
            
            // Remove existing tag items using callback-based approach to avoid errors
            const existingItems = ['assign-tag-separator'];
            for (let i = 0; i < 10; i++) {
                existingItems.push(`assign-tag-${i}`);
            }
            
            // Use Promise-based removal with proper error handling
            const removePromises = existingItems.map(id => {
                return new Promise((resolve) => {
                    chrome.contextMenus.remove(id, () => {
                        // Ignore chrome.runtime.lastError - item might not exist
                        if (chrome.runtime.lastError) {
                            console.debug(`Context menu item ${id} doesn't exist, skipping removal`);
                        }
                        resolve();
                    });
                });
            });
            
            // Wait for all removals to complete
            await Promise.all(removePromises);
            
            // Small delay to ensure removals are processed
            await new Promise(resolve => setTimeout(resolve, 50));
            
            if (frequentTags.length > 0) {
                chrome.contextMenus.create({
                    id: 'assign-tag-separator',
                    parentId: 'fastbrowse-tags',
                    type: 'separator',
                    contexts: ['page', 'action']
                });
                
                frequentTags.forEach((tag, index) => {
                    chrome.contextMenus.create({
                        id: `assign-tag-${index}`,
                        parentId: 'fastbrowse-tags',
                        title: `📌 Assign "${tag.name}"`,
                        contexts: ['page', 'action']
                    });
                });
            }
            
        } catch (error) {
            console.error('Failed to update context menu tags:', error);
        }
    }
    
    async handleContextMenuClick(info, tab) {
        try {
            switch (info.menuItemId) {
                case 'quick-tag-current':
                    await this.quickTagCurrentTab(tab);
                    break;
                    
                case 'suggest-tags':
                    await this.showTagSuggestionsForTab(tab);
                    break;
                    
                case 'auto-group-tabs':
                    await this.autoGroupTabs();
                    this.showNotification('Auto-grouping completed! Check the popup for suggestions.');
                    break;
                    
                default:
                    // Check if it's an assign-tag action
                    if (info.menuItemId.startsWith('assign-tag-')) {
                        const tagIndex = parseInt(info.menuItemId.replace('assign-tag-', ''));
                        const frequentTags = this.getFrequentTags();
                        
                        if (frequentTags[tagIndex]) {
                            await this.assignTagToTab(tab.id, frequentTags[tagIndex].id);
                            this.showNotification(`Tagged "${tab.title}" with "${frequentTags[tagIndex].name}"`);
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error('Context menu action failed:', error);
            this.showNotification(`Action failed: ${error.message}`);
        }
    }
    
    async handleCommand(command) {
        try {
            switch (command) {
                case 'toggle-focus-mode':
                    await this.toggleFocusMode();
                    break;
                    
                case 'suspend-all-tabs':
                    await this.suspendAllTabs();
                    this.showNotification('All eligible tabs have been suspended');
                    break;
                    
                case 'auto-group-tabs':
                    await this.autoGroupTabs();
                    this.showNotification('Auto-grouping completed! Check the popup for suggestions.');
                    break;
                    
                case 'quick-tag-current':
                    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tabs.length > 0) {
                        await this.quickTagCurrentTab(tabs[0]);
                    }
                    break;
            }
        } catch (error) {
            console.error('Keyboard shortcut action failed:', error);
            this.showNotification(`Action failed: ${error.message}`);
        }
    }
    
    // Quick tag the current tab with suggestions
    async quickTagCurrentTab(tab) {
        try {
            const suggestions = await this.suggestTagsForTab(tab);
            
            if (suggestions.length === 0) {
                this.showNotification('No tag suggestions found for this tab');
                return;
            }
            
            // Auto-assign the first suggestion
            const tagId = suggestions[0];
            const tag = this.tags.get(tagId);
            
            if (tag) {
                await this.assignTagToTab(tab.id, tagId);
                this.showNotification(`Quick-tagged "${tab.title}" with "${tag.name}"`);
                
                // Update context menu
                this.updateContextMenuTags();
            }
        } catch (error) {
            console.error('Quick tagging failed:', error);
            this.showNotification('Quick tagging failed');
        }
    }
    
    // Show tag suggestions for a tab via notification
    async showTagSuggestionsForTab(tab) {
        try {
            const suggestions = await this.suggestTagsForTab(tab);
            
            if (suggestions.length === 0) {
                this.showNotification('No tag suggestions found for this tab');
                return;
            }
            
            const tagNames = suggestions.slice(0, 3).map(tagId => {
                const tag = this.tags.get(tagId);
                return tag ? tag.name : 'Unknown';
            }).join(', ');
            
            this.showNotification(
                `Suggested tags for "${tab.title}": ${tagNames}`,
                {
                    buttons: [{
                        title: 'Apply All'
                    }],
                    requireInteraction: true
                }
            );
        } catch (error) {
            console.error('Failed to show tag suggestions:', error);
            this.showNotification('Failed to get tag suggestions');
        }
    }
}

// Initialize FastBrowse when the service worker starts
const fastBrowse = new FastBrowse();