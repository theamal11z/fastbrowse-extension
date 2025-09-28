// FastBrowse Background Service Worker
// Handles tab discarding and memory optimization

// Cross-browser shim: map chrome.* to browser.* in Firefox so async/await works
(function(){
  try {
    const isFirefox = typeof browser !== 'undefined' && browser && typeof browser.runtime !== 'undefined';
    if (isFirefox) {
      // Use Promise-based browser APIs via the chrome namespace used by this codebase
      globalThis.chrome = browser;
      // Provide a fallback for MV2 where chrome.scripting is unavailable
      if (!globalThis.chrome.scripting) globalThis.chrome.scripting = {};
      if (typeof globalThis.chrome.scripting.executeScript !== 'function') {
        globalThis.chrome.scripting.executeScript = async ({ target, files }) => {
          if (!target || typeof target.tabId !== 'number') throw new Error('Missing target.tabId');
          for (const file of (files || [])) {
            await globalThis.chrome.tabs.executeScript(target.tabId, { file });
          }
          return [];
        };
      }
    }
  } catch (_) {}
})();

class FastBrowse {
    constructor() {
this.settings = {
            autoSuspend: true,
            // Quick Session Switching
            turboMode: false,
            performancePreset: 'browsing', // 'gaming' | 'streaming' | 'browsing'
            // Profile Optimization
            profileOptimizationEnabled: true,
            idbOptimizeEnabled: true,
            idbOptimizeBatchMax: 5,
            // Smart Cache Management
            smartCacheEnabled: true,
            aggressivePrefetchEnabled: true,
            precacheIdleDelayMs: 1500,
            precacheMaxLinks: 6,
            intelligentCacheClearEnabled: true,
            cacheCompressionEnabled: false,
            // Bottleneck Identification
            bottlenecksEnabled: true,
            slowResourceDetection: true,
            slowResourceSizeKB: 200,
            slowResourceDurationMs: 300,
            cpuHogWarning: true,
            cpuLongTaskWindowMs: 10000,
            cpuLongTaskTotalMsThreshold: 1000,
            memoryLeakAlerts: true,
            memoryLeakSlopeThreshold: 1.0, // % per minute
            memoryLeakLookbackMinutes: 5,
            // Speed Dashboard
            speedDashboardEnabled: true,
            speedRetainEntries: 50,
            // GPU Acceleration Control
            gpuAccelEnabled: true,
            gpuMode: 'auto', // 'auto' | 'conservative' | 'balanced' | 'aggressive'
            webglProfile: 'performance', // 'performance' | 'quality' | 'compatibility'
            webglForceHighPerf: true,
            webglAntialias: false,
            webglPreserveDrawingBuffer: false,
            // Chrome Flags Management (informational only; extensions cannot set flags)
            flagsManagerEnabled: true,
            flagsEnableGpuRasterization: false,
            flagsEnableParallelDownloading: false,
            flagsExperimentalToggle: false,
            // Page Load Acceleration
            pageAccelEnabled: true,
            lazyOverrideEnabled: true,
            cssDeferEnabled: false,
            jsDeferralEnabled: false,
            cssDeferMax: 2, // number of stylesheets to defer (non-critical heuristic)
            jsDeferralMode: 'safe', // 'safe' (3rd-party, analytics) | 'aggressive'
            // Network Optimization
            networkOptimizationEnabled: true,
            dnsPrefetchEnabled: true,
            preconnectEnabled: true,
            prefetchOnHoverEnabled: true,
            maxPrefetchHosts: 5,
            preconnectTopN: 2,
        // Memory compression for suspended tabs
            memoryCompressionEnabled: true,
            // Container policies (Firefox contextual identities)
            containerPolicies: {}, // { [containerName or cookieStoreId]: { delayMultiplier?: number, neverSuspend?: boolean } }
            containerBudgets: {} // { [containerName or cookieStoreId]: { maxUnsuspended?: number } }
            memoryCompressionAlgo: 'gzip', // 'gzip' | 'deflate' | 'none'
            snapshotScroll: true,
            snapshotForms: true,
            // Tag-Based Memory Policies
            tagPolicyEnabled: true,
            workTagDelayMultiplier: 3, // Work-tagged tabs get 3x longer delay
            referenceNoSuspendDuringWork: true,
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
            // Smart memory forecasting
            forecastingEnabled: true,
            forecastLookbackMinutes: 10,
            forecastHorizonMinutes: 3,
            forecastBufferPercent: 3,
            forecastPreemptiveMax: 3,
            leakSpikeDeltaPercent: 8,
            leakSpikeWindowMinutes: 3,
            leakDomainThreshold: 3,
            leakFastSuspendMinutes: 5,
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
            // Declutter & audio
            declutterEnabled: true,
            declutterStaleMinutes: 120,
            declutterWhitelist: [],
            smartMuteEnabled: true,
            smartMuteWhitelist: ['music.youtube.com','spotify.com','soundcloud.com','meet.google.com','zoom.us'],
            // Tag management settings
            tagsEnabled: true,
            autoTagging: true,
            tagFrequencyThreshold: 0.3, // 0-1 scale for frequent tag classification
            tagBasedSuspension: true,
            tagSuggestions: true,
            maxTagsPerTab: 5,
            tagInactivityDays: 30, // Days before a tag is considered inactive
            // Tab relationships
            relationshipsEnabled: true,
            relationshipDecayMinutes: 60,
            // Memory-aware restoration settings
            memoryAwareRestoration: true,
            liteRestorationThreshold: 75, // Memory usage % to trigger lite mode
            progressiveRestorationEnabled: true,
            progressiveRestorationDelay: 1000, // ms between restoring tabs
            prioritizeContentOverMedia: true,
            liteRestorationDefault: false,
            // Restoration priority settings
            restorationPriorityMode: 'smart', // 'smart', 'manual', 'all'
            maxConcurrentRestorations: 3,
            restorationMemoryBuffer: 5, // % memory buffer to maintain
            // Context-aware distraction removal settings
            contextAwareEnabled: true,
            workHoursEnabled: true,
            workStartHour: 9, // 9 AM
            workEndHour: 17, // 5 PM
            workDays: [1, 2, 3, 4, 5], // Monday-Friday (0=Sunday, 6=Saturday)
            workModeStrict: true, // Stricter distraction removal during work hours
            personalModeRelaxed: false, // More relaxed rules during personal time
            autoAdjustEnabled: true, // Auto-adjust based on active window content
            smartWhitelistEnabled: true, // Smart whitelisting for important workflows
            workflowDetectionEnabled: true, // Detect coding, writing, research workflows
            contextSwitchDelay: 300000, // 5 minutes delay before switching context
            workModeIntensity: 'high', // 'low', 'medium', 'high'
            personalModeIntensity: 'medium', // 'low', 'medium', 'high'
            smartWhitelistTimeout: 1800000, // 30 minutes smart whitelist timeout
            // Firefox-centric settings
            firefoxOptimizations: true,
            ffPreferAltSuspend: true, // In Firefox, prefer navigation-based suspension for better e10s behavior
            ffZombieCheckAggressive: false,
            // Pocket & Sync
            pocketSuggestBeforeSuspend: true,
            pocketTreatSavedAsArchivable: true,
            pocketSuggestCooldownMinutes: 120,
            syncAwareSuspend: true,
            recentlySyncedGraceMinutes: 60
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
        this.memoryHistory = []; // {ts, usedPercent, tabCount}
        this.tabOpenEvents = []; // {ts, domain}
        this.leakDomainScores = new Map(); // domain -> score
        this.leakProneDomains = new Set();
        
        // Tab relationship mapping
        this.relationships = new Map(); // fromTabId -> Map(toTabId -> ts)
        
        // Declutter snapshot for undo
        this.lastDeclutterSnapshot = null;
        
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
        this._updatingContextMenus = false;
        this.tabTags = new Map(); // tabId -> Set of tagIds
        this.tagGroups = new Map(); // groupId -> group object
        this.tagUsageHistory = new Map(); // tagId -> usage history
        this.domainTagSuggestions = new Map(); // domain -> suggested tags
        this.lastTagCleanup = 0;
        
        // Notification state management
        this.activeNotifications = new Set();
        this.notificationCooldowns = new Map();
        this.lastNotificationTime = new Map();
        
        // Memory-aware restoration state
        this.restorationQueue = [];

        // Pocket & Sync markers
        this.pocketSaved = new Set(); // normalized URLs
        this.recentlySynced = new Map(); // tabId -> ts
        this.lastPocketSuggest = new Map(); // domain -> ts
        this.activeRestorations = new Set();
        this.restorationStats = {
            totalRestored: 0,
            liteRestorations: 0,
            memoryOptimized: 0,
            lastRestorationTime: null
        };
        this.tabRestorePriorities = new Map(); // tabId -> priority score
        
        // Recommended focus extensions database
        this.recommendedFocusExtensions = new Map([
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
        
        // Context-aware focus state
        this.contextAwareFocus = null; // Will be initialized in init()
        this.currentContext = 'personal'; // 'work' or 'personal'
        this.detectedWorkflow = null; // Current detected workflow
        this.smartWhitelist = new Map(); // domain -> expiry timestamp
        this.contextSwitchTimeout = null; // Timeout for context switching
        this.lastContextCheck = 0; // Last time context was checked
        
        this.init();
    }
    
    async init() {
        // Load settings from storage
        await this.loadSettings();
        
        // Firefox: if management API is unavailable, disable extension monitoring features to avoid errors
        try {
            if (!chrome.management || typeof chrome.management.getAll !== 'function') {
                this.settings.extensionMonitoring = false;
                this.settings.extensionSuggestions = false;
                try { await chrome.storage.sync.set({ extensionMonitoring: false, extensionSuggestions: false }); } catch (_) {}
            }
        } catch (_) {}

        // Initialize Firefox-specific integrations
        try {
            if (this.settings.firefoxOptimizations) {
                await this.initFirefoxIntegration();
            }
        } catch (_) {}

        // Platform-aware tuning (Linux)
        try { await this.initPlatformTuning(); } catch (_) {}
        // Load learned leak domains
        try {
            const stored = await chrome.storage.local.get(['fastbrowse_leak_domains']);
            if (stored.fastbrowse_leak_domains && Array.isArray(stored.fastbrowse_leak_domains)) {
                stored.fastbrowse_leak_domains.forEach(d => this.leakProneDomains.add(d));
            }
        } catch (e) { console.debug('No leak domains yet'); }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start memory monitoring
        this.startMemoryMonitoring();
        
        // Start extension monitoring
        this.startExtensionMonitoring();
        
        // Initialize tag system
        await this.initializeTagSystem();
        
        // Initialize context-aware focus
        if (this.settings.contextAwareEnabled) {
            this.contextAwareFocus = new ContextAwareFocus(this);
            await this.contextAwareFocus.init();
        }
        
        console.log('FastBrowse initialized');
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(this.settings);
            this.settings = { ...this.settings, ...result };
            try {
                const saved = await chrome.storage.local.get(['fastbrowse_pocket_saved_urls']);
                const arr = saved.fastbrowse_pocket_saved_urls || [];
                if (Array.isArray(arr)) arr.forEach(u => this.pocketSaved.add(u));
            } catch (_) {}
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

            // Inject page acceleration early during loading
            try {
                if (changeInfo.status === 'loading' && this.settings.pageAccelEnabled) {
                    if (tab && tab.url && tab.url.startsWith('http')) {
                        const args = { target: { tabId }, files: ['src/content/page-acceleration.js'] };
                        try { args.injectImmediately = true; } catch (_) {}
                        chrome.scripting.executeScript(args).catch(() => {});
                    }
                }
            } catch (_) {}

            // Inject GPU acceleration controls early during loading
            try {
                if (changeInfo.status === 'loading' && this.settings.gpuAccelEnabled) {
                    if (tab && tab.url && tab.url.startsWith('http')) {
                        const args = { target: { tabId }, files: ['src/content/gpu-accel.js'] };
                        try { args.injectImmediately = true; } catch (_) {}
                        chrome.scripting.executeScript(args).catch(() => {});
                    }
                }
            } catch (_) {}

            // Inject network optimization script on completed loads
            try {
                if (changeInfo.status === 'complete' && this.settings.networkOptimizationEnabled) {
                    if (tab && tab.url && tab.url.startsWith('http')) {
                        chrome.scripting.executeScript({
                            target: { tabId },
                            files: ['src/content/network-optimization.js']
                        }).catch(() => {});
                    }
                }
            } catch (_) {}

            // Inject speed metrics collector on completed loads
            try {
                if (changeInfo.status === 'complete' && this.settings.speedDashboardEnabled) {
                    if (tab && tab.url && tab.url.startsWith('http')) {
                        chrome.scripting.executeScript({
                            target: { tabId },
                            files: ['src/content/speed-metrics.js']
                        }).catch(() => {});
                    }
                }
            } catch (_) {}

            // Inject bottleneck detection on completed loads
            try {
                if (changeInfo.status === 'complete' && this.settings.bottlenecksEnabled) {
                    if (tab && tab.url && tab.url.startsWith('http')) {
                        chrome.scripting.executeScript({
                            target: { tabId },
                            files: ['src/content/bottlenecks.js']
                        }).catch(() => {});
                    }
                }
            } catch (_) {}
            // Record domain when URL becomes available
            try {
                if (changeInfo.url || (changeInfo.status === 'complete' && tab.url)) {
                    const urlStr = changeInfo.url || tab.url;
                    const u = new URL(urlStr);
                    const domain = u.hostname.replace('www.', '');
                    this.recordTabOpen(domain);
                }
            } catch (_) {}
        });
        
        // Listen for tab creation
        chrome.tabs.onCreated.addListener((tab) => {
            try {
                const urlStr = tab.pendingUrl || tab.url || '';
                if (urlStr) {
                    const u = new URL(urlStr);
                    const domain = u.hostname.replace('www.', '');
                    this.recordTabOpen(domain);
                }
            } catch (_) {}
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
        
        // Listen for alarms (for context-aware focus)
        chrome.alarms.onAlarm.addListener((alarm) => {
            this.handleAlarm(alarm);
        });
        
        // Setup context menus
        this.setupContextMenus();

        // Setup webNavigation listeners for relationship mapping
        if (this.settings.relationshipsEnabled) {
            try {
                chrome.webNavigation.onCreatedNavigationTarget.addListener((details) => {
                    // Link opened to a new tab
                    if (details.sourceTabId != null && details.tabId != null) {
                        this.addRelationship(details.sourceTabId, details.tabId);
                    }
                });
                chrome.webNavigation.onCommitted.addListener((details) => {
                    // Same-tab navigation via link/form can imply relation with previous tab via opener; skip without clear source
                });
            } catch (e) {
                console.debug('webNavigation mapping not available:', e);
            }
        }
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
        // Smart mute evaluation on audio state changes
        if (this.settings.smartMuteEnabled && (changeInfo.audible !== undefined || changeInfo.status === 'complete')) {
            try { await this.smartMuteEvaluate(tab); } catch (e) { console.debug('smartMuteEvaluate failed:', e); }
        }
        // Badge update
        this.updateActionBadge().catch(() => {});
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
        // Cleanup relationships
        try {
            if (this.relationships.has(tabId)) this.relationships.delete(tabId);
            // Remove references where tabId is a target
            for (const [fromId, targets] of this.relationships.entries()) {
                if (targets.has(tabId)) targets.delete(tabId);
                if (targets.size === 0) this.relationships.delete(fromId);
            }
        } catch (_) {}
        this.updateActionBadge().catch(() => {});
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
        // Update badge too
        this.updateActionBadge().catch(() => {});
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
            const tab = await chrome.tabs.get(tabId);

            // Compute effective delay based on tag policies
            const delayMs = await this.computeEffectiveSuspendDelay(tab);
            if (delayMs === null) {
                console.log(`Skipping suspend timer for tab ${tabId} due to tag policy`);
                return;
            }
            
            // Suggest Pocket before suspend (once per domain per cooldown)
            try { await this.maybeSuggestPocket(tab); } catch (_) {}

            const timer = setTimeout(() => {
                this.suspendTab(tabId);
            }, delayMs);
            
            this.tabTimers.set(tabId, timer);
            const minutes = Math.round(delayMs / 60000);
            console.log(`Timer set for tab ${tabId} - will suspend in ${minutes} minutes`);
        } catch (error) {
            // Tab doesn't exist anymore, no need to set a timer
            if (error.message && error.message.includes('No tab with id')) {
                console.log(`Not setting timer for tab ${tabId} - tab no longer exists`);
                return;
            }
            // For other errors, log but still try to set the timer
            console.error(`Error checking tab existence for ${tabId}:`, error);
            
            const delayMs = this.settings.suspendDelay * 60 * 1000;
            const timer = setTimeout(() => {
                this.suspendTab(tabId);
            }, delayMs);
            
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
            
// Optionally capture and store minimal tab state before discarding
            if (this.settings.memoryCompressionEnabled) {
                try {
                    await this.captureAndStoreTabState(tab);
                } catch (snapErr) {
                    console.debug(`Snapshot failed for tab ${tabId}:`, snapErr);
                }
            }

            // Store tab information before discarding (with defensive checks)
            this.suspendedTabs.set(tabId, {
                url: tab.url || 'about:blank',
                title: tab.title || 'Unknown',
                favIconUrl: tab.favIconUrl || null,
                suspendedAt: Date.now()
            });
            
            // In Firefox or when user prefers, use alternative suspension first for better e10s behavior
            const isFirefox = typeof browser !== 'undefined' && browser && typeof browser.runtime !== 'undefined';
            if (isFirefox && this.settings.ffPreferAltSuspend) {
                await this.suspendTabAlternative(tabId, tab);
                return;
            }

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

            const safeTitle = (originalTab.title || 'Unknown Tab').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
            const safeUrl = originalTab.url || 'about:blank';
            const suspendedUrl = chrome.runtime.getURL('src/suspended.html') +
                `?tabId=${encodeURIComponent(String(tabId))}` +
                `&url=${encodeURIComponent(safeUrl)}` +
                `&title=${encodeURIComponent(safeTitle)}`;

            // Navigate tab to suspended page
            await chrome.tabs.update(tabId, { url: suspendedUrl });

            console.log(`✓ Tab ${tabId} suspended using alternative method (suspended.html)`);
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
    
    async restoreTab(tabId, options = {}) {
        try {
            const tab = await chrome.tabs.get(tabId);
            const restoreMode = await this.determineRestoreMode(tab, options);
            
            console.log(`Restoring tab ${tabId} in ${restoreMode} mode: ${tab.title || 'Unknown'}`);
            
            // Track active restoration
            this.activeRestorations.add(tabId);
            
            if (restoreMode === 'lite') {
                await this.restoreTabLite(tab, options);
                this.restorationStats.liteRestorations++;
            } else {
                await this.restoreTabFull(tab, options);
            }
            
            this.suspendedTabs.delete(tabId);
            this.activeRestorations.delete(tabId);
            this.restorationStats.totalRestored++;
            this.restorationStats.lastRestorationTime = Date.now();
            
            console.log(`✓ Tab ${tabId} restored successfully`);
            
        } catch (error) {
            // Clean up our records even if tab doesn't exist
            this.suspendedTabs.delete(tabId);
            this.activeRestorations.delete(tabId);
            
            if (error.message && error.message.includes('No tab with id')) {
                console.log(`Cannot restore tab ${tabId} - tab no longer exists`);
                return;
            }
            console.error(`Failed to restore tab ${tabId}:`, error);
        }
    }
    
    async determineRestoreMode(tab, options = {}) {
        // Check for user override
        if (options.forceMode) {
            return options.forceMode;
        }
        
        // If memory-aware restoration is disabled, always use full mode
        if (!this.settings.memoryAwareRestoration) {
            return 'full';
        }
        
        // Check if lite mode is default setting
        if (this.settings.liteRestorationDefault) {
            return 'lite';
        }
        
        try {
            // Check current memory usage
            const memoryInfo = await chrome.system.memory.getInfo();
            const usagePercent = ((memoryInfo.capacity - memoryInfo.availableCapacity) / memoryInfo.capacity) * 100;
            
            // Use lite mode if memory usage is high
            if (usagePercent > this.settings.liteRestorationThreshold) {
                console.log(`Using lite mode due to high memory usage: ${usagePercent.toFixed(1)}%`);
                return 'lite';
            }
            
            // Check if tab contains heavy media (based on URL patterns)
            if (this.settings.prioritizeContentOverMedia && this.isMediaHeavyTab(tab)) {
                console.log(`Using lite mode for media-heavy tab: ${tab.url}`);
                return 'lite';
            }
            
            // Check concurrent restorations
            if (this.activeRestorations.size >= this.settings.maxConcurrentRestorations) {
                console.log(`Using lite mode due to concurrent restoration limit`);
                return 'lite';
            }
            
            return 'full';
            
        } catch (error) {
            console.warn('Failed to determine restore mode, using full:', error);
            return 'full';
        }
    }
    
    isMediaHeavyTab(tab) {
        if (!tab.url) return false;
        
        const mediaHeavySites = [
            'youtube.com', 'vimeo.com', 'dailymotion.com', 'twitch.tv',
            'netflix.com', 'hulu.com', 'disney.com', 'amazon.com/prime',
            'instagram.com', 'tiktok.com', 'twitter.com', 'x.com',
            'reddit.com/r/videos', 'imgur.com', 'giphy.com'
        ];
        
        return mediaHeavySites.some(site => tab.url.includes(site));
    }
    
    async restoreTabFull(tab, options = {}) {
        try {
            if (tab.discarded) {
                await chrome.tabs.reload(tab.id);
                await this.waitForTabLoad(tab.id, 3000);
            } else {
                // If we used alternative suspension (our suspended.html or data URL), navigate back to original
                const isSuspendedPage = (tab.url || '').startsWith(chrome.runtime.getURL('src/suspended.html')) || (tab.url || '').startsWith('data:text/html');
                if (isSuspendedPage) {
                    const rec = this.suspendedTabs.get(tab.id);
                    if (rec && rec.url) {
                        await chrome.tabs.update(tab.id, { url: rec.url });
                        await this.waitForTabLoad(tab.id, 3000);
                    }
                }
            }
        } catch (_) {
            // Ignore navigation errors
        }

        // Attempt to restore snapshot state if available
        if (this.settings.memoryCompressionEnabled) {
            try {
                await this.tryRestoreStoredTabState(tab.id);
            } catch (e) {
                console.debug('State restore (full) failed:', e);
            }
        }
    }
    
    async restoreTabLite(tab, options = {}) {
        if (tab.discarded) {
            // First, reload the tab
            await chrome.tabs.reload(tab.id);
            
            // Wait for basic page load
            await this.waitForTabLoad(tab.id, 2000);
            
            // Inject lite mode content script to block heavy media
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['src/content/lite-mode.js']
                });
                
                // Enable lite mode
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'enableLiteMode',
                    options: {
                        blockVideos: true,
                        blockAutoplay: true,
                        blockAnimations: this.settings.focusDisableAnimations,
                        blockSocialEmbeds: true,
                        showPlaceholders: true,
                        optimizeImages: true
                    }
                });
                
                console.log(`✓ Lite mode enabled for tab ${tab.id}`);
this.restorationStats.memoryOptimized++;
                // After enabling lite mode, try restoring minimal state too
                if (this.settings.memoryCompressionEnabled) {
                    try { await this.tryRestoreStoredTabState(tab.id); } catch (e) { console.debug('State restore (lite) failed:', e); }
                }
                
            } catch (error) {
                console.warn(`Failed to enable lite mode for tab ${tab.id}:`, error);
                // Continue with regular restoration if lite mode fails
            }
        }
    }
    
    async waitForTabLoad(tabId, timeout = 5000) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const checkTab = async () => {
                try {
                    const tab = await chrome.tabs.get(tabId);
                    
                    if (tab.status === 'complete' || Date.now() - startTime > timeout) {
                        resolve();
                    } else {
                        setTimeout(checkTab, 500);
                    }
                } catch (error) {
                    resolve(); // Tab might be closed, just resolve
                }
            };
            
            checkTab();
        });
    }

    // Compute per-tab suspend delay based on tag policies and work hours
    async computeEffectiveSuspendDelay(tab) {
        try {
            let delayMs = this.settings.suspendDelay * 60 * 1000;
            if (!this.settings.tagsEnabled || !this.settings.tagPolicyEnabled) return delayMs;

            const tags = this.getTabTags(tab.id) || [];
            const hasTag = (name) => tags.some(t => (t.name || '').toLowerCase().includes(name));

            // Reference: never suspend during work hours
            if (this.settings.referenceNoSuspendDuringWork && this.isWorkHoursActive() && hasTag('reference')) {
                return null; // signal to skip timer entirely
            }

            // Work: longer delay
            if (hasTag('work')) {
                const mult = Math.max(1, Number(this.settings.workTagDelayMultiplier || 1));
                delayMs = Math.round(delayMs * mult);
            }

            // Container-aware override (Firefox contextual identities)
            try {
                const policy = this.getContainerPolicyForTab(tab);
                if (policy && policy.neverSuspend) return null;
                if (policy && typeof policy.delayMultiplier === 'number' && isFinite(policy.delayMultiplier) && policy.delayMultiplier > 0) {
                    delayMs = Math.round(delayMs * policy.delayMultiplier);
                }
            } catch (_) {}
            return delayMs;
        } catch (e) {
            // On error, fall back to default delay
            return this.settings.suspendDelay * 60 * 1000;
        }
    }

    // Work hours helper based on settings
    isWorkHoursActive() {
        try {
            if (!this.settings.workHoursEnabled) return false;
            const now = new Date();
            const day = now.getDay(); // 0=Sun..6=Sat
            const hours = now.getHours();
            const workDays = Array.isArray(this.settings.workDays) ? this.settings.workDays : [1,2,3,4,5];
            if (!workDays.includes(day)) return false;
            const start = Number(this.settings.workStartHour ?? 9);
            const end = Number(this.settings.workEndHour ?? 17);
            if (start === end) return true; // whole-day work window
            if (start < end) {
                return hours >= start && hours < end;
            } else {
                // Overnight window (e.g., 22 to 6)
                return hours >= start || hours < end;
            }
        } catch (_) {
            return false;
        }
    }

    // ================= Memory Compression Helpers =================

    async captureAndStoreTabState(tab) {
        if (!tab || !tab.id) return;
        if (!this.settings.snapshotScroll && !this.settings.snapshotForms) return;

        // Inject snapshot script (idempotent) and request snapshot
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['src/content/state-snapshot.js']
            });
        } catch (e) {
            // Ignore injection errors (e.g., restricted pages)
            throw e;
        }

        const snapshot = await new Promise((resolve, reject) => {
            let done = false;
            const timer = setTimeout(() => {
                if (!done) reject(new Error('Snapshot timed out'));
            }, 2000);
            try {
                chrome.tabs.sendMessage(tab.id, { action: 'snapshotTabState' }, (response) => {
                    done = true; clearTimeout(timer);
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    if (!response || !response.success) return reject(new Error(response?.error || 'Snapshot failed'));
                    resolve(response.data);
                });
            } catch (err) {
                clearTimeout(timer);
                reject(err);
            }
        });

        // Filter snapshot per settings
        const filtered = {
            url: snapshot.url || tab.url || 'about:blank',
            title: snapshot.title || tab.title || '',
            scroll: this.settings.snapshotScroll ? snapshot.scroll : null,
            forms: this.settings.snapshotForms ? snapshot.forms : [],
            ts: Date.now()
        };

        const json = JSON.stringify(filtered);
        const { algo, b64 } = await this.compressStringToBase64(json, this.settings.memoryCompressionAlgo);
        const key = this.getTabStateKey(tab.id);
        await chrome.storage.local.set({ [key]: { algo, b64, meta: { url: filtered.url, ts: filtered.ts } } });
    }

    getTabStateKey(tabId) { return `fastbrowse_tab_state_${tabId}`; }

    async tryRestoreStoredTabState(tabId) {
        try {
            const key = this.getTabStateKey(tabId);
            const obj = await chrome.storage.local.get([key]);
            const rec = obj[key];
            if (!rec || !rec.b64) return false;
            const json = await this.decompressBase64ToString(rec.b64, rec.algo || 'none');
            const state = JSON.parse(json);
            // Inject restore script and send state
            try {
                await chrome.scripting.executeScript({ target: { tabId }, files: ['src/content/state-snapshot.js'] });
            } catch (_) {}
            await new Promise((resolve, reject) => {
                let done = false;
                const timer = setTimeout(() => { if (!done) reject(new Error('Restore timed out')); }, 3000);
                try {
                    chrome.tabs.sendMessage(tabId, { action: 'restoreTabState', state }, (response) => {
                        done = true; clearTimeout(timer);
                        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                        if (!response || !response.success) return reject(new Error(response?.error || 'Restore failed'));
                        resolve(response.data);
                    });
                } catch (err) { clearTimeout(timer); reject(err); }
            });
            // Cleanup after successful restore
            await chrome.storage.local.remove([key]);
            return true;
        } catch (e) {
            console.debug('tryRestoreStoredTabState error:', e);
            return false;
        }
    }

    async compressStringToBase64(str, algo = 'gzip') {
        try {
            const enc = new TextEncoder();
            const data = enc.encode(str);
            if (typeof CompressionStream !== 'undefined' && (algo === 'gzip' || algo === 'deflate')) {
                const cs = new CompressionStream(algo);
                const writer = cs.writable.getWriter();
                await writer.write(data);
                await writer.close();
                const compressed = await new Response(cs.readable).arrayBuffer();
                const b64 = this.uint8ToBase64(new Uint8Array(compressed));
                return { algo, b64 };
            } else {
                // Fallback: store as base64 uncompressed
                const b64 = this.uint8ToBase64(data);
                return { algo: 'none', b64 };
            }
        } catch (e) {
            // On error, fallback to uncompressed base64 of original string
            const b64 = btoa(unescape(encodeURIComponent(str)));
            return { algo: 'none', b64 };
        }
    }

    async decompressBase64ToString(b64, algo = 'none') {
        try {
            let bytes;
            try { bytes = this.base64ToUint8(b64); } catch (_) {
                // Maybe it's base64 of utf-8 string
                const str = atob(b64);
                return decodeURIComponent(escape(str));
            }
            if (typeof DecompressionStream !== 'undefined' && (algo === 'gzip' || algo === 'deflate')) {
                const ds = new DecompressionStream(algo);
                const writer = ds.writable.getWriter();
                await writer.write(bytes);
                await writer.close();
                const decompressed = await new Response(ds.readable).arrayBuffer();
                const dec = new TextDecoder();
                return dec.decode(decompressed);
            } else if (algo === 'none') {
                const dec = new TextDecoder();
                return dec.decode(bytes);
            } else {
                // Unknown algo, try to decode as utf-8
                const dec = new TextDecoder();
                return dec.decode(bytes);
            }
        } catch (e) {
            // Last resort
            const str = atob(b64);
            return decodeURIComponent(escape(str));
        }
    }

    uint8ToBase64(uint8) {
        let binary = '';
        const chunk = 0x8000;
        for (let i = 0; i < uint8.length; i += chunk) {
            binary += String.fromCharCode.apply(null, uint8.subarray(i, i + chunk));
        }
        return btoa(binary);
    }

    base64ToUint8(b64) {
        const binary = atob(b64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
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
        
        // Treat recently synced tabs as protected for a grace period
        try { if (this.isRecentlySynced(tab)) return true; } catch (_) {}
        
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
        
        // Tag-Based Memory Policies: protect Reference tabs during work hours
        try {
            if (this.settings.tagsEnabled && this.settings.tagPolicyEnabled && this.settings.referenceNoSuspendDuringWork && this.isWorkHoursActive()) {
                const tabTags = this.getTabTags(tab.id) || [];
                if (tabTags.some(t => (t.name || '').toLowerCase().includes('reference'))) {
                    return true;
                }
            }
        } catch (_) {}
        
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
    
    async restoreAllTabs(options = {}) {
        try {
            const suspendedTabIds = Array.from(this.suspendedTabs.keys());
            console.log(`Starting restoration of ${suspendedTabIds.length} suspended tabs`);
            
            if (this.settings.progressiveRestorationEnabled && !options.immediate) {
                await this.progressiveRestoreAllTabs(suspendedTabIds, options);
            } else {
                // Restore all tabs immediately (legacy behavior)
                for (const tabId of suspendedTabIds) {
                    await this.restoreTab(tabId, options);
                }
            }
            
            console.log(`✓ Completed restoration of all tabs`);
        } catch (error) {
            console.error('Failed to restore all tabs:', error);
        }
    }
    
    async progressiveRestoreAllTabs(tabIds, options = {}) {
        const prioritizedTabs = await this.prioritizeTabsForRestoration(tabIds);
        const delay = options.delay || this.settings.progressiveRestorationDelay;
        const maxConcurrent = options.maxConcurrent || this.settings.maxConcurrentRestorations;
        
        console.log(`Progressive restoration: ${prioritizedTabs.length} tabs, ${delay}ms delay, max ${maxConcurrent} concurrent`);
        
        let processed = 0;
        const chunks = [];
        
        // Split tabs into chunks for concurrent processing
        for (let i = 0; i < prioritizedTabs.length; i += maxConcurrent) {
            chunks.push(prioritizedTabs.slice(i, i + maxConcurrent));
        }
        
        for (const chunk of chunks) {
            // Check memory before each chunk
            if (await this.shouldPauseRestoration()) {
                console.log('Pausing restoration due to memory pressure');
                await new Promise(resolve => setTimeout(resolve, delay * 3));
                continue;
            }
            
            // Restore chunk concurrently
            const promises = chunk.map(async (tabData) => {
                try {
                    await this.restoreTab(tabData.tabId, { 
                        ...options,
                        priority: tabData.priority 
                    });
                    processed++;
                } catch (error) {
                    console.error(`Failed to restore tab ${tabData.tabId}:`, error);
                }
            });
            
            await Promise.allSettled(promises);
            
            // Progress notification
            if (this.settings.showNotifications && chunks.length > 1) {
                const progress = Math.round((processed / prioritizedTabs.length) * 100);
                this.showNotification(`Restoration progress: ${progress}% (${processed}/${prioritizedTabs.length} tabs)`);
            }
            
            // Delay before next chunk (except for last chunk)
            if (chunk !== chunks[chunks.length - 1]) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    async prioritizeTabsForRestoration(tabIds) {
        const tabPriorities = [];
        
        for (const tabId of tabIds) {
            try {
                const tab = await chrome.tabs.get(tabId);
                const priority = this.calculateTabRestorePriority(tab);
                
                tabPriorities.push({
                    tabId,
                    priority,
                    tab
                });
            } catch (error) {
                // Tab might be closed, skip it
                console.debug(`Tab ${tabId} no longer exists, skipping`);
            }
        }
        
        // Sort by priority (higher priority first)
        return tabPriorities.sort((a, b) => b.priority - a.priority);
    }
    
    calculateTabRestorePriority(tab) {
        let priority = 0;
        
        // Base priority factors
        if (tab.pinned) priority += 100;  // Pinned tabs highest priority
        if (tab.active) priority += 80;   // Active tab very high priority
        if (tab.audible) priority += 60;  // Audio tabs high priority
        
        // Tag-based priority
        if (this.settings.tagsEnabled) {
            const tabTags = this.getTabTags(tab.id);
            for (const tag of tabTags) {
                if (tag.priority === 'high') priority += 40;
                else if (tag.priority === 'medium') priority += 20;
                else if (tag.priority === 'low') priority += 5;
                
                // Frequently used tags get bonus
                if (tag.frequency >= this.settings.tagFrequencyThreshold) {
                    priority += 15;
                }
            }
        }
        
        // Recency factor (more recently accessed = higher priority)
        if (tab.lastAccessed) {
            const ageHours = (Date.now() - tab.lastAccessed) / (1000 * 60 * 60);
            if (ageHours < 1) priority += 30;
            else if (ageHours < 6) priority += 15;
            else if (ageHours < 24) priority += 5;
        }
        
        // Domain-based priority adjustments
        if (tab.url) {
            // Work/productivity sites get higher priority
            const workDomains = ['github.com', 'gitlab.com', 'stackoverflow.com', 'docs.google.com', 'notion.so', 'slack.com'];
            if (workDomains.some(domain => tab.url.includes(domain))) {
                priority += 25;
            }
            
            // Media-heavy sites get lower priority for lite mode consideration
            if (this.isMediaHeavyTab(tab)) {
                priority -= 10;
            }
        }
        
        // Store calculated priority for UI display
        this.tabRestorePriorities.set(tab.id, priority);
        
        return Math.max(0, priority); // Ensure non-negative
    }
    
    async shouldPauseRestoration() {
        if (!this.settings.memoryAwareRestoration) return false;
        
        try {
            const memoryInfo = await chrome.system.memory.getInfo();
            const usagePercent = ((memoryInfo.capacity - memoryInfo.availableCapacity) / memoryInfo.capacity) * 100;
            const bufferThreshold = this.settings.liteRestorationThreshold - this.settings.restorationMemoryBuffer;
            
            return usagePercent > bufferThreshold;
        } catch (error) {
            console.warn('Failed to check memory for restoration pause:', error);
            return false;
        }
    }
    
    startMemoryMonitoring() {
        // Check memory usage every 30 seconds
        setInterval(() => {
            this.checkMemoryUsage();
            this.recordMemorySample().catch(() => {});
            this.smartForecastAndAct().catch(() => {});
        }, 30000);
        // Initial sample
        this.recordMemorySample().catch(() => {});
    }
    
    startExtensionMonitoring() {
        // Periodically refresh badge
        setInterval(() => { this.updateActionBadge().catch(() => {}); }, 60000);
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
            
            // Container-aware budget enforcement: prefer suspending from containers over budget
            const overBudgetIds = new Set();
            try {
                const budget = this.settings.containerBudgets || {};
                if (budget && Object.keys(budget).length > 0) {
                    const counts = new Map();
                    for (const t of unprotectedTabs) {
                        const key = this.getContainerKeyForTab(t) || 'default';
                        counts.set(key, (counts.get(key) || 0) + (t.discarded ? 0 : 1));
                    }
                    for (const [key, cfg] of Object.entries(budget)) {
                        const max = (cfg && cfg.maxUnsuspended) || 0;
                        if (max > 0) {
                            const c = counts.get(key) || 0;
                            if (c > max) overBudgetIds.add(key);
                        }
                    }
                }
            } catch (_) {}

            const prioritized = unprotectedTabs.slice().sort((a, b) => {
                const ka = this.getContainerKeyForTab(a) || 'default';
                const kb = this.getContainerKeyForTab(b) || 'default';
                const oa = overBudgetIds.has(ka) ? -1 : 0;
                const ob = overBudgetIds.has(kb) ? -1 : 0;
                if (oa !== ob) return oa - ob;
                return (a.lastAccessed || 0) - (b.lastAccessed || 0);
            });

            // Prefer suspending Pocket-saved tabs first if archivable
            const pocketFirst = (t) => this.isPocketSavedUrl(t.url) && this.settings.pocketTreatSavedAsArchivable ? -1 : 0;
            prioritized.sort((a,b)=> pocketFirst(a)-pocketFirst(b) || ( (a.lastAccessed||0)-(b.lastAccessed||0) ));
            prioritized
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
    
    // Pocket & Sync helpers
    normalizeUrlForPocket(urlStr) {
        try { const u = new URL(urlStr); u.hash=''; return u.toString(); } catch (_) { return urlStr || ''; }
    }
    isPocketSavedUrl(urlStr) {
        if (!urlStr) return false; const n = this.normalizeUrlForPocket(urlStr); return this.pocketSaved.has(n);
    }
    async markPocketSaved(urlStr) {
        const n = this.normalizeUrlForPocket(urlStr);
        if (!n) return false;
        this.pocketSaved.add(n);
        try { await chrome.storage.local.set({ fastbrowse_pocket_saved_urls: Array.from(this.pocketSaved) }); } catch(_){}
        return true;
    }
    async maybeSuggestPocket(tab) {
        try {
            if (!this.settings.pocketSuggestBeforeSuspend) return;
            if (!tab || !tab.url || tab.discarded || tab.pinned) return;
            if (this.isPocketSavedUrl(tab.url)) return;
            const host = new URL(tab.url).hostname.replace('www.','');
            const cdMin = Math.max(1, this.settings.pocketSuggestCooldownMinutes || 120);
            const last = this.lastPocketSuggest.get(host) || 0;
            if (Date.now() - last < cdMin*60*1000) return;
            this.lastPocketSuggest.set(host, Date.now());
            const title = (tab.title||'Save to Pocket');
            const saveUrl = `https://getpocket.com/save?url=${encodeURIComponent(tab.url)}&title=${encodeURIComponent(title)}`;
            this.showNotification('Save this tab to Pocket before suspending?', {
                buttons: [{ title: 'Save to Pocket' }, { title: 'Dismiss' }],
                requireInteraction: true
            });
            // When user clicks notification button, we handle globally in onButtonClicked if we store context; simplify: open immediately on suggestion (less interactive)
        } catch (_) {}
    }

    markRecentlySynced(tabId) {
        try { this.recentlySynced.set(tabId, Date.now()); } catch (_) {}
    }
    isRecentlySynced(tab) {
        try {
            if (!this.settings.syncAwareSuspend) return false;
            const ts = this.recentlySynced.get(tab.id);
            if (!ts) return false;
            const mins = this.settings.recentlySyncedGraceMinutes || 60;
            return (Date.now() - ts) < mins * 60 * 1000;
        } catch (_) { return false; }
    }

    // Firefox integration helpers
    async initFirefoxIntegration() {
        try {
            if (typeof browser === 'undefined' || !browser.contextualIdentities) return;
            const identities = await browser.contextualIdentities.query({});
            this.ffContainers = new Map();
            identities.forEach(ci => this.ffContainers.set(ci.cookieStoreId, ci));
        } catch (_) {}
        await this.loadFirefoxPrivacyContext();
    }

    async initPlatformTuning() {
        try {
            const info = await chrome.runtime.getPlatformInfo();
            this.platformInfo = info;
            if (info && (info.os || '').toLowerCase() === 'linux' && !this.settings.linuxTuningApplied) {
                // Conservative, safe tweaks for Linux
                this.settings.progressiveRestorationDelay = Math.max(this.settings.progressiveRestorationDelay, 1200);
                this.settings.prefetchOnHoverEnabled = false; // reduce network churn on some Linux setups
                this.settings.gpuMode = this.settings.gpuMode || 'balanced';
                this.settings.webglProfile = this.settings.webglProfile || 'performance';
                this.settings.linuxTuningApplied = true;
                try { await chrome.storage.sync.set(this.settings); } catch (_) {}
            }
        } catch (_) {}
    }

    async loadFirefoxPrivacyContext() {
        try {
            const tp = await browser.privacy.websites.trackingProtectionMode.get({});
            const rfp = await browser.privacy.websites.resistFingerprinting.get({});
            let pred = { value: true };
            try { pred = await browser.privacy.network.networkPredictionEnabled.get({}); } catch (_) {}
            this.firefoxPrivacy = { trackingProtectionMode: tp && tp.value, resistFingerprinting: rfp && rfp.value, networkPredictionEnabled: pred && pred.value };
            // Adjust our features conservatively when privacy hardening is on
            let changed = false;
            if (this.firefoxPrivacy && this.firefoxPrivacy.resistFingerprinting) {
                if (this.settings.speedDashboardEnabled) { this.settings.speedDashboardEnabled = false; changed = true; }
                if (this.settings.bottlenecksEnabled) { this.settings.bottlenecksEnabled = false; changed = true; }
            }
            if (this.firefoxPrivacy && this.firefoxPrivacy.networkPredictionEnabled === false) {
                if (this.settings.prefetchOnHoverEnabled) { this.settings.prefetchOnHoverEnabled = false; changed = true; }
                if (this.settings.preconnectEnabled) { this.settings.preconnectEnabled = false; changed = true; }
            }
            if (changed) { try { await chrome.storage.sync.set(this.settings); } catch (_) {} }
        } catch (_) {}
    }

    getContainerKeyForTab(tab) {
        try {
            if (!tab) return null;
            const id = tab.cookieStoreId || null;
            if (id) return id;
            return null;
        } catch (_) { return null; }
    }

    getContainerPolicyForTab(tab) {
        try {
            const map = this.settings.containerPolicies || {};
            const id = this.getContainerKeyForTab(tab);
            if (id && map[id]) return map[id];
            // Try by name if available
            if (id && this.ffContainers && this.ffContainers.has(id)) {
                const name = (this.ffContainers.get(id).name || '').toLowerCase();
                for (const [key, val] of Object.entries(map)) {
                    if (key.toLowerCase() === name) return val;
                }
            }
            return null;
        } catch (_) { return null; }
    }

    async suggestContainerForTab(tab) {
        try {
            if (!tab || !tab.url) return null;
            if (!this.ffContainers || this.ffContainers.size === 0) return null;
            const u = new URL(tab.url);
            const host = u.hostname.toLowerCase();
            const nameMatch = (needle) => {
                for (const ci of this.ffContainers.values()) {
                    if ((ci.name || '').toLowerCase().includes(needle)) return ci;
                }
                return null;
            };
            // Heuristics
            if (/github|gitlab|bitbucket|stack(over|)flow|docs|developer|atlassian/i.test(host)) {
                const t = nameMatch('work'); if (t) return { target: t, reason: 'Work-related domain' };
            }
            if (/facebook|instagram|twitter|x\.com|tiktok|reddit/i.test(host)) {
                const t = nameMatch('social'); if (t) return { target: t, reason: 'Social media domain' };
            }
            if (/bank|paypal|stripe|finance|invest|secure/i.test(host)) {
                const t = nameMatch('bank') || nameMatch('finance') || nameMatch('secure'); if (t) return { target: t, reason: 'Financial domain' };
            }
            if (/mail|outlook|gmail|yahoo/i.test(host)) {
                const t = nameMatch('mail') || nameMatch('personal'); if (t) return { target: t, reason: 'Mail/Personal domain' };
            }
            return null;
        } catch (_) { return null; }
    }

    async getContainerSuggestions() {
        try {
            const tabs = await chrome.tabs.query({});
            const out = [];
            for (const tab of tabs) {
                const sug = await this.suggestContainerForTab(tab);
                if (sug && (!tab.cookieStoreId || tab.cookieStoreId !== sug.target.cookieStoreId)) {
                    out.push({ tabId: tab.id, title: tab.title, url: tab.url, current: tab.cookieStoreId || null, recommendedId: sug.target.cookieStoreId, recommendedName: sug.target.name, reason: sug.reason });
                }
            }
            return out;
        } catch (_) { return []; }
    }

    async openTabInContainer(tabId, cookieStoreId) {
        try {
            const tab = await chrome.tabs.get(tabId);
            const created = await chrome.tabs.create({ url: tab.url, index: tab.index + 1, windowId: tab.windowId, cookieStoreId });
            return { newTabId: created.id };
        } catch (e) { return { error: e.message }; }
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
    
    // Relationship helpers
    addRelationship(fromId, toId) {
        try {
            if (!this.settings.relationshipsEnabled) return;
            if (!this.relationships.has(fromId)) this.relationships.set(fromId, new Map());
            this.relationships.get(fromId).set(toId, Date.now());
        } catch (_) {}
    }

    getRelationshipComponents = async () => {
        try {
            if (!this.settings.relationshipsEnabled) return [];
            const decay = (this.settings.relationshipDecayMinutes || 60) * 60 * 1000;
            const now = Date.now();
            // Build undirected graph among existing tabs
            const tabs = await chrome.tabs.query({});
            const tabSet = new Set(tabs.map(t => t.id));
            const adj = new Map();
            for (const id of tabSet) adj.set(id, new Set());
            for (const [fromId, targets] of this.relationships.entries()) {
                for (const [toId, ts] of targets.entries()) {
                    if (now - ts > decay) continue; // expired
                    if (!tabSet.has(fromId) || !tabSet.has(toId)) continue;
                    if (!adj.has(fromId)) adj.set(fromId, new Set());
                    if (!adj.has(toId)) adj.set(toId, new Set());
                    adj.get(fromId).add(toId);
                    adj.get(toId).add(fromId);
                }
            }
            // Components
            const seen = new Set();
            const components = [];
            for (const id of tabSet) {
                if (seen.has(id)) continue;
                const comp = [];
                const stack = [id];
                seen.add(id);
                while (stack.length) {
                    const cur = stack.pop();
                    comp.push(cur);
                    const neigh = adj.get(cur) || new Set();
                    for (const n of neigh) {
                        if (!seen.has(n)) { seen.add(n); stack.push(n); }
                    }
                }
                if (comp.length > 1) components.push(comp);
            }
            return components;
        } catch (e) {
            console.debug('getRelationshipComponents failed:', e);
            return [];
        }
    }

    // Memory forecasting helpers
    async recordMemorySample() {
        try {
            const mem = await chrome.system.memory.getInfo();
            const usedPercent = ((mem.capacity - mem.availableCapacity) / mem.capacity) * 100;
            const tabs = await chrome.tabs.query({});
            const sample = { ts: Date.now(), usedPercent, tabCount: tabs.length };
            this.memoryHistory.push(sample);
            // Keep last 200 samples (~100 mins)
            if (this.memoryHistory.length > 200) this.memoryHistory.shift();
        } catch (_) {}
    }

    recordTabOpen(domain) {
        if (!domain) return;
        const now = Date.now();
        this.tabOpenEvents.push({ ts: now, domain });
        // Keep last 300 events
        if (this.tabOpenEvents.length > 300) this.tabOpenEvents.shift();
    }

    getRecentSamples(minutes) {
        const cutoff = Date.now() - minutes * 60 * 1000;
        return this.memoryHistory.filter(s => s.ts >= cutoff);
    }

    computeSlopePercentPerMinute(samples) {
        if (samples.length < 2) return 0;
        const first = samples[0];
        const last = samples[samples.length - 1];
        const dtMin = (last.ts - first.ts) / 60000;
        if (dtMin <= 0) return 0;
        return (last.usedPercent - first.usedPercent) / dtMin;
    }

    async smartForecastAndAct() {
        if (!this.settings.forecastingEnabled) return;
        const lookback = this.settings.forecastLookbackMinutes || 10;
        const horizon = this.settings.forecastHorizonMinutes || 3;
        const buffer = this.settings.forecastBufferPercent || 3;
        const samples = this.getRecentSamples(lookback);
        if (samples.length < 2) return;
        const slope = this.computeSlopePercentPerMinute(samples);
        const current = samples[samples.length - 1].usedPercent;
        const forecast = current + slope * (horizon);
        const limit = this.settings.memoryLimit - buffer;
        if (forecast > limit) {
            await this.preemptiveSuspend();
        }
        // Spike detection
        this.detectSpikeAndLearn(samples).catch(() => {});
        // Memory leak alert check (best-effort)
        this.memoryLeakAlertCheck().catch(() => {});
    }

    async preemptiveSuspend() {
        try {
            const maxCount = Math.max(1, this.settings.forecastPreemptiveMax || 3);
            const tabs = await chrome.tabs.query({ active: false });
            const candidates = [];
            for (const tab of tabs) {
                if (await this.shouldProtectTab(tab)) continue;
                candidates.push(tab);
            }
            // Prefer leak‑prone domains first, then oldest
            candidates.sort((a, b) => {
                const ad = this.isDomainInList(a.url || '', Array.from(this.leakProneDomains)) ? -1 : 0;
                const bd = this.isDomainInList(b.url || '', Array.from(this.leakProneDomains)) ? -1 : 0;
                if (ad !== bd) return ad - bd;
                return (a.lastAccessed || 0) - (b.lastAccessed || 0);
            });
            const toSuspend = candidates.slice(0, maxCount);
            for (const t of toSuspend) {
                await this.suspendTab(t.id);
            }
            if (toSuspend.length > 0 && this.settings.showNotifications) {
                this.showNotification(`⚡ Pre‑emptive memory save: suspended ${toSuspend.length} tab(s) to avoid spike`);
            }
        } catch (e) {
            console.debug('preemptiveSuspend failed:', e);
        }
    }

    async detectSpikeAndLearn(samples) {
        const windowMin = this.settings.leakSpikeWindowMinutes || 3;
        const deltaThreshold = this.settings.leakSpikeDeltaPercent || 8;
        const recent = this.getRecentSamples(windowMin);
        if (recent.length < 2) return;
        const first = recent[0];
        const last = recent[recent.length - 1];
        const delta = last.usedPercent - first.usedPercent;
        if (delta < deltaThreshold) return;
        // Spike detected: attribute to domains opened in this window
        const cutoff = Date.now() - windowMin * 60 * 1000;
        const events = this.tabOpenEvents.filter(e => e.ts >= cutoff);
        const incr = new Set();
        events.forEach(e => incr.add(e.domain));
        incr.forEach(domain => {
            const cur = this.leakDomainScores.get(domain) || 0;
            const next = cur + 1;
            this.leakDomainScores.set(domain, next);
            if (next >= (this.settings.leakDomainThreshold || 3)) {
                if (!this.leakProneDomains.has(domain)) {
                    this.leakProneDomains.add(domain);
                    this.showNotification(`🧠 Learned memory‑heavy site: ${domain}. Will suspend earlier when needed.`);
                    // Persist
                    chrome.storage.local.set({ fastbrowse_leak_domains: Array.from(this.leakProneDomains) });
                }
            }
        });
    }

    // Smart Mute helpers
    async smartMuteEvaluate(tab) {
        try {
            if (!tab || !tab.id) return;
            if (!this.settings.smartMuteEnabled) return;
            const active = tab.active === true;
            const audible = tab.audible === true;
            const url = tab.url || '';
            const whitelisted = this.isDomainWhitelisted(url, this.settings.smartMuteWhitelist || []);
            if (audible && !active && !whitelisted && !tab.mutedInfo?.muted) {
                await chrome.tabs.update(tab.id, { muted: true });
            }
            if (active && tab.mutedInfo?.muted && whitelisted) {
                await chrome.tabs.update(tab.id, { muted: false });
            }
        } catch (_) {}
    }

    isDomainWhitelisted(url, whitelist) {
        try {
            const u = new URL(url);
            return (whitelist || []).some(d => u.hostname.includes(d));
        } catch (_) {
            return false;
        }
    }

    isDomainInList(url, list) {
        try {
            const u = new URL(url);
            return (list || []).some(d => u.hostname.includes(d));
        } catch (_) {
            return false;
        }
    }

    // Declutter analysis and actions
    normalizeUrlForDuplicates(urlStr) {
        try {
            const u = new URL(urlStr);
            u.hash = '';
            return u.toString();
        } catch (_) {
            return urlStr || '';
        }
    }

    async analyzeDeclutter() {
        if (!this.settings.declutterEnabled) {
            return { duplicates: [], stale: [], counts: { duplicates: 0, stale: 0 } };
        }
        const tabs = await chrome.tabs.query({});
        const map = new Map();
        const duplicates = [];
        const now = Date.now();
        const staleCutoff = now - (this.settings.declutterStaleMinutes * 60 * 1000);
        const stale = [];

        for (const tab of tabs) {
            if (!tab.url || tab.pinned) continue;
            if (this.isDomainInList(tab.url, this.settings.declutterWhitelist)) continue;
            const key = this.normalizeUrlForDuplicates(tab.url);
            if (map.has(key)) {
                const kept = map.get(key);
                const older = (tab.lastAccessed || 0) < (kept.lastAccessed || 0) ? tab : kept;
                const newer = older === tab ? kept : tab;
                if (!older.active && !older.audible) {
                    duplicates.push({ tabId: older.id, title: older.title, url: older.url, windowId: older.windowId });
                }
                map.set(key, newer);
            } else {
                map.set(key, tab);
            }
        }

        for (const tab of tabs) {
            if (tab.active || tab.pinned) continue;
            if (this.isDomainInList(tab.url, this.settings.declutterWhitelist)) continue;
            if ((tab.lastAccessed || 0) < staleCutoff) {
                if (!(await this.shouldProtectTab(tab))) {
                    stale.push({ tabId: tab.id, title: tab.title, url: tab.url, windowId: tab.windowId });
                }
            }
        }
        return { duplicates, stale, counts: { duplicates: duplicates.length, stale: stale.length } };
    }

    async performDeclutter({ closeDuplicates = true, suspendStale = true } = {}) {
        const preview = await this.analyzeDeclutter();
        this.lastDeclutterSnapshot = {
            time: Date.now(),
            closedTabs: [],
            suspended: []
        };
        if (closeDuplicates) {
            for (const dup of preview.duplicates) {
                try {
                    const tab = await chrome.tabs.get(dup.tabId);
                    this.lastDeclutterSnapshot.closedTabs.push({ url: tab.url, windowId: tab.windowId, index: tab.index, pinned: tab.pinned, active: tab.active });
                    await chrome.tabs.remove(tab.id);
                } catch (_) {}
            }
        }
        if (suspendStale) {
            for (const st of preview.stale) {
                try {
                    await this.suspendTab(st.tabId);
                    this.lastDeclutterSnapshot.suspended.push(st.tabId);
                } catch (_) {}
            }
        }
        await this.updateActionBadge();
        return preview.counts;
    }

    async undoDeclutter() {
        if (!this.lastDeclutterSnapshot) return false;
        for (const t of this.lastDeclutterSnapshot.closedTabs) {
            try {
                await chrome.tabs.create({ url: t.url, windowId: t.windowId, index: t.index, active: false });
            } catch (_) {}
        }
        for (const id of this.lastDeclutterSnapshot.suspended) {
            try { await this.restoreTab(id); } catch (_) {}
        }
        this.lastDeclutterSnapshot = null;
        await this.updateActionBadge();
        return true;
    }

    async updateActionBadge() {
        try {
            const { counts } = await this.analyzeDeclutter();
            const num = (counts.duplicates + counts.stale);
            const text = num > 0 ? String(num) : '';
            await chrome.action.setBadgeText({ text });
            if (num > 0) {
                await chrome.action.setBadgeBackgroundColor({ color: '#2196F3' });
            }
        } catch (_) {}
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
            const installedIds = new Set(installedExtensions.map(ext => ext.id));
            const enabledIds = new Set(installedExtensions.filter(ext => ext.enabled).map(ext => ext.id));

            // Build simple category satisfaction map by scanning installed extension names
            const nameLower = (s) => (s || '').toLowerCase();
            const installedNames = installedExtensions.map(ext => nameLower(ext.name));
            const categorySatisfied = {
                'blocking': installedNames.some(n => /ublock|adblock|ad guard|adguard|privacy badger|ghostery|ad\s*blocker/.test(n)),
                'social-media': installedNames.some(n => /df youtube|distraction\s*free|news feed eradicator|hide feed|no (youtube|facebook) suggestions|productivity for (facebook|twitter)/.test(n)),
                'time-management': installedNames.some(n => /stayfocusd|leechblock|pomodoro|forest|limit|time\s*warp|focus\s*time/.test(n)),
                'productivity': installedNames.some(n => /momentum|new tab (dashboard|page)|infinity new tab|toby|start (me|page)/.test(n))
            };

            const recommendations = [];

            for (const [key, extension] of this.recommendedFocusExtensions) {
                const isInstalled = installedIds.has(extension.id);
                const isEnabled = enabledIds.has(extension.id);
                const satisfiedByAlternative = !isInstalled && !!categorySatisfied[extension.category];
                const altName = satisfiedByAlternative ? installedExtensions.find(ext => nameLower(ext.name)).name : undefined;

                if (!isInstalled) {
                    recommendations.push({
                        key,
                        ...extension,
                        installed: false,
                        enabled: false,
                        satisfiedByAlternative,
                        altName: satisfiedByAlternative ? 'Alternative installed' : undefined
                    });
                } else {
                    const installedExt = installedExtensions.find(e => e.id === extension.id);
                    recommendations.push({
                        key,
                        ...extension,
                        installed: true,
                        enabled: installedExt?.enabled || false,
                        satisfiedByAlternative: false
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
            const missing = recommendations.filter(ext => !ext.installed && !ext.satisfiedByAlternative && ext.priority >= 8);
            
            if (missing.length > 0 && this.settings.showNotifications) {
                const topMissing = missing[0];
                this.showNotification(
                    `💡 Focus Tip: Install ${topMissing.name} for better distraction blocking`,
                    {
                        buttons: [{ title: 'Install' }],
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
                    await this.restoreTab(request.tabId, request.options || {});
                    sendResponse({ success: true });
                    break;
                    
                case 'restoreTabLite':
                    console.log(`Lite restore request for tab ${request.tabId}`);
                    await this.restoreTab(request.tabId, { forceMode: 'lite' });
                    sendResponse({ success: true });
                    break;
                    
                case 'restoreTabFull':
                    console.log(`Full restore request for tab ${request.tabId}`);
                    await this.restoreTab(request.tabId, { forceMode: 'full' });
                    sendResponse({ success: true });
                    break;
                    
                case 'getRestorationStats':
                    sendResponse({ 
                        success: true, 
                        data: {
                            ...this.restorationStats,
                            activeRestorations: this.activeRestorations.size,
                            queueLength: this.restorationQueue.length
                        }
                    });
                    break;
                    
                case 'getTabPriorities':
                    const priorities = {};
                    this.tabRestorePriorities.forEach((priority, tabId) => {
                        priorities[tabId] = priority;
                    });
                    sendResponse({ success: true, data: priorities });
                    break;
                    
                case 'getContainers':
                    try {
                        const arr = [];
                        if (this.ffContainers) {
                            for (const ci of this.ffContainers.values()) arr.push({ id: ci.cookieStoreId, name: ci.name, color: ci.color, icon: ci.icon });
                        }
                        sendResponse({ success: true, data: arr });
                    } catch (e) { sendResponse({ success: false, error: e.message }); }
                    break;
                case 'getContainerSuggestions':
                    try {
                        const sug = await this.getContainerSuggestions();
                        sendResponse({ success: true, data: sug });
                    } catch (e) { sendResponse({ success: false, error: e.message }); }
                    break;
                case 'openTabInContainer':
                    try {
                        const r = await this.openTabInContainer(request.tabId, request.cookieStoreId);
                        sendResponse({ success: !r.error, data: r });
                    } catch (e) { sendResponse({ success: false, error: e.message }); }
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
                    
                // Firefox-centric utilities
                case 'ffSetPreferAltSuspend':
                    this.settings.ffPreferAltSuspend = !!request.enable;
                    await chrome.storage.sync.set({ ffPreferAltSuspend: this.settings.ffPreferAltSuspend });
                    sendResponse({ success: true });
                    break;
                case 'detectZombieTabs':
                    try {
                        const result = await this.detectZombieTabs();
                        sendResponse({ success: true, data: result });
                    } catch (e) {
                        sendResponse({ success: false, error: e.message });
                    }
                    break;
                case 'ffProfileClearHttpCache':
                    try { await chrome.browsingData.remove({}, { cache: true }); sendResponse({ success: true }); } catch (e) { sendResponse({ success: false, error: e.message }); }
                    break;
                case 'ffProfileClearIndexedDBRecent':
                    try { const n = await this.optimizeIndexedDBForRecentOrigins(); sendResponse({ success: true, data: { count: n } }); } catch (e) { sendResponse({ success: false, error: e.message }); }
                    break;
                case 'ffProfileClearSiteDataForOrigins':
                    try {
                        const origins = Array.isArray(request.origins) ? request.origins : [];
                        if (origins.length === 0) { sendResponse({ success: true, data: { count: 0 } }); break; }
                        for (const o of origins) {
                            try {
                                await chrome.browsingData.remove({ origins: [o] }, { indexedDB: true, cacheStorage: true, serviceWorkers: true, localStorage: true });
                            } catch (_) {
                                // Some data types may not be supported; best-effort
                                try { await chrome.browsingData.remove({ origins: [o] }, { indexedDB: true, cacheStorage: true, serviceWorkers: true }); } catch(_){}
                            }
                        }
                        sendResponse({ success: true, data: { count: origins.length } });
                    } catch (e) { sendResponse({ success: false, error: e.message }); }
                    break;
                case 'ffOpenAboutProfiles':
                    try { await chrome.tabs.create({ url: 'about:profiles' }); sendResponse({ success: true }); } catch (e) { sendResponse({ success: false, error: e.message }); }
                    break;
                case 'ffOpenTroubleshooting':
                    try { await chrome.tabs.create({ url: 'about:support' }); sendResponse({ success: true }); } catch (e) { sendResponse({ success: false, error: e.message }); }
                    break;
                case 'ffOpenAboutConfig':
                    try { await chrome.tabs.create({ url: 'about:config' }); sendResponse({ success: true }); } catch (e) { sendResponse({ success: false, error: e.message }); }
                    break;
                case 'ffOpenAboutPerformance':
                    try { await chrome.tabs.create({ url: 'about:performance' }); sendResponse({ success: true }); } catch (e) { sendResponse({ success: false, error: e.message }); }
                    break;
                case 'ffOpenAboutProcesses':
                    try { await chrome.tabs.create({ url: 'about:processes' }); sendResponse({ success: true }); } catch (e) { sendResponse({ success: false, error: e.message }); }
                    break;
                case 'applyLinuxTuning':
                    try { await this.initPlatformTuning(); sendResponse({ success: true, data: this.settings }); } catch (e) { sendResponse({ success: false, error: e.message }); }
                    break;
                case 'testNativeHost':
                    try {
                        // Optional: requires nativeMessaging permission and installed host
                        const port = chrome.runtime.connectNative ? chrome.runtime.connectNative('fastbrowse.host') : null;
                        if (!port) { sendResponse({ success: false, error: 'nativeMessaging not available' }); break; }
                        let done = false;
                        port.onMessage.addListener((msg)=>{ if (!done) { done = true; sendResponse({ success: true, data: msg }); port.disconnect(); } });
                        port.onDisconnect.addListener(()=>{ if (!done) { done = true; sendResponse({ success: false, error: chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Disconnected' }); } });
                        try { port.postMessage({ op: 'ping', ts: Date.now() }); } catch (e) { sendResponse({ success: false, error: e.message }); }
                    } catch (e) { sendResponse({ success: false, error: e.message }); }
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
                    
                case 'declutterPreview':
                    try {
                        const result = await this.analyzeDeclutter();
                        sendResponse({ success: true, data: result });
                    } catch (error) {
                        console.error('Declutter preview failed:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;

                case 'declutterExecute':
                    try {
                        const counts = await this.performDeclutter(request.options || {});
                        sendResponse({ success: true, data: counts });
                    } catch (error) {
                        console.error('Declutter execute failed:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;

                case 'declutterUndo':
                    try {
                        const ok = await this.undoDeclutter();
                        sendResponse({ success: ok });
                    } catch (error) {
                        console.error('Declutter undo failed:', error);
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
                    
                case 'getTabRelationships':
                    try {
                        const comps = await this.getRelationshipComponents();
                        // Return with simple metadata
                        const result = [];
                        for (const comp of comps) {
                            const tabs = [];
                            for (const id of comp) {
                                try { tabs.push(await chrome.tabs.get(id)); } catch (_) {}
                            }
                            result.push({ tabIds: comp, tabs });
                        }
                        sendResponse({ success: true, data: result });
                    } catch (error) {
                        console.error('Failed to get tab relationships:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;

                case 'focusRelatedTabs':
                    try {
                        const tabIds = request.tabIds || [];
                        // Pick most recently accessed tab to focus
                        let best = null;
                        for (const id of tabIds) {
                            try {
                                const t = await chrome.tabs.get(id);
                                if (!best || (t.lastAccessed || 0) > (best.lastAccessed || 0)) best = t;
                            } catch (_) {}
                        }
                        if (best) {
                            await chrome.tabs.update(best.id, { active: true });
                            await chrome.windows.update(best.windowId, { focused: true });
                        }
                        sendResponse({ success: true });
                    } catch (error) {
                        console.error('Failed to focus related tabs:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;

                case 'suspendRelatedTabs':
                    try {
                        const tabIds = request.tabIds || [];
                        for (const id of tabIds) {
                            try { await this.suspendTab(id); } catch (_) {}
                        }
                        sendResponse({ success: true });
                    } catch (error) {
                        console.error('Failed to suspend related tabs:', error);
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
                    
                // Context-aware focus actions
                case 'getContextInfo':
                    try {
                        const contextInfo = {
                            currentContext: this.currentContext,
                            detectedWorkflow: this.detectedWorkflow,
                            smartWhitelist: Array.from(this.smartWhitelist.entries()),
                            lastContextCheck: this.lastContextCheck,
                            contextAwareEnabled: this.settings.contextAwareEnabled
                        };
                        if (this.contextAwareFocus) {
                            contextInfo.contextHistory = this.contextAwareFocus.contextHistory.slice(-10);
                        }
                        sendResponse({ success: true, data: contextInfo });
                    } catch (error) {
                        console.error('Failed to get context info:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'getContextRules':
                    try {
                        if (!this.contextAwareFocus) {
                            sendResponse({ success: false, error: 'Context-aware focus not enabled' });
                            break;
                        }
                        const domain = request.domain || 'unknown.com';
                        const rules = this.contextAwareFocus.getContextRules(domain);
                        sendResponse({ success: true, data: rules });
                    } catch (error) {
                        console.error('Failed to get context rules:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'forceContextCheck':
                    try {
                        if (this.contextAwareFocus) {
                            await this.contextAwareFocus.checkContext();
                            sendResponse({ success: true, data: {
                                currentContext: this.currentContext,
                                detectedWorkflow: this.detectedWorkflow
                            }});
                        } else {
                            sendResponse({ success: false, error: 'Context-aware focus not enabled' });
                        }
                    } catch (error) {
                        console.error('Failed to force context check:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'addToSmartWhitelist':
                    try {
                        if (!this.contextAwareFocus || !request.domain) {
                            sendResponse({ success: false, error: 'Invalid request' });
                            break;
                        }
                        const duration = request.duration || this.settings.smartWhitelistTimeout;
                        const expiryTime = Date.now() + duration;
                        this.smartWhitelist.set(request.domain.replace('www.', '').toLowerCase(), expiryTime);
                        sendResponse({ success: true });
                    } catch (error) {
                        console.error('Failed to add to smart whitelist:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'removeFromSmartWhitelist':
                    try {
                        if (!request.domain) {
                            sendResponse({ success: false, error: 'Domain required' });
                            break;
                        }
                        this.smartWhitelist.delete(request.domain.replace('www.', '').toLowerCase());
                        sendResponse({ success: true });
                    } catch (error) {
                        console.error('Failed to remove from smart whitelist:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;

                // Speed Dashboard handlers
                case 'recordSpeedMetrics':
                    try {
                        await this.recordSpeedSession(request.data);
                        sendResponse({ success: true });
                    } catch (error) {
                        console.error('recordSpeedMetrics failed:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                case 'getSpeedSessions':
                    try {
                        const list = await this.getSpeedSessions();
                        sendResponse({ success: true, data: list });
                    } catch (error) {
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                case 'clearSpeedSessions':
                    try {
                        await chrome.storage.local.remove(['fastbrowse_speed_sessions']);
                        sendResponse({ success: true });
                    } catch (error) {
                        sendResponse({ success: false, error: error.message });
                    }
                    break;

                // Bottleneck reports
                case 'toggleTurboMode':
                    try {
                        const enable = !!request.enable;
                        if (enable) {
                            await this.enableTurboMode();
                        } else {
                            await this.disableTurboMode();
                        }
                        sendResponse({ success: true, data: { turboMode: this.settings.turboMode } });
                    } catch (error) {
                        sendResponse({ success: false, error: error.message });
                    }
                    break;

                case 'applyPerformancePreset':
                    try {
                        const name = request.preset || 'browsing';
                        await this.applyPerformancePreset(name);
                        sendResponse({ success: true, data: { preset: this.settings.performancePreset } });
                    } catch (error) {
                        sendResponse({ success: false, error: error.message });
                    }
                    break;

                case 'oneClickOptimize':
                    try {
                        await this.applyPerformancePreset('browsing');
                        await this.runIntelligentCacheClear();
                        sendResponse({ success: true });
                    } catch (error) {
                        sendResponse({ success: false, error: error.message });
                    }
                    break;

                case 'reportBottlenecks':
                    try {
                        await this.handleBottleneckReport(request.data);
                        sendResponse({ success: true });
                    } catch (error) {
                        console.error('reportBottlenecks failed:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                    
                case 'restoreFromSuspended':
                    try {
                        const tabId = Number(request.tabId);
                        const options = {};
                        if (request.forceMode === 'lite') options.forceMode = 'lite';
                        else if (request.forceMode === 'full') options.forceMode = 'full';
                        await this.restoreTab(tabId, options);
                        sendResponse({ success: true });
                    } catch (error) {
                        console.error('Failed to restore from suspended page:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                
                case 'runAggressivePrecache':
                    try {
                        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                        if (tabs.length > 0) {
                            chrome.tabs.sendMessage(tabs[0].id, { action: 'aggressivePrefetchNow' }, () => {});
                        }
                        sendResponse({ success: true });
                    } catch (error) {
                        sendResponse({ success: false, error: error.message });
                    }
                    break;

                case 'runIntelligentCacheClear':
                    try {
                        await this.runIntelligentCacheClear();
                        sendResponse({ success: true });
                    } catch (error) {
                        sendResponse({ success: false, error: error.message });
                    }
                    break;

                case 'optimizeIndexedDBCurrent':
                    try {
                        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                        if (tabs.length > 0 && tabs[0].url && tabs[0].url.startsWith('http')) {
                            const origin = new URL(tabs[0].url).origin;
                            await this.optimizeIndexedDBForOrigin(origin);
                        }
                        sendResponse({ success: true });
                    } catch (error) {
                        sendResponse({ success: false, error: error.message });
                    }
                    break;

                case 'optimizeIndexedDBRecent':
                    try {
                        const count = await this.optimizeIndexedDBForRecentOrigins();
                        sendResponse({ success: true, data: { count } });
                    } catch (error) {
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
    
    // Speed Dashboard helpers
    async recordSpeedSession(payload) {
        try {
            const now = Date.now();
            const entry = {
                ts: now,
                url: payload?.url || 'about:blank',
                origin: (() => { try { return new URL(payload?.url).origin; } catch (_) { return ''; } })(),
                timings: payload?.timings || {},
                paints: payload?.paints || {},
                lcp: payload?.lcp || null,
                resources: (payload?.resources || []).slice(0, 100),
                score: this.computePerfScore(payload)
            };
            const key = 'fastbrowse_speed_sessions';
            const obj = await chrome.storage.local.get([key]);
            const arr = Array.isArray(obj[key]) ? obj[key] : [];
            arr.unshift(entry);
            const max = Math.max(1, Number(this.settings.speedRetainEntries || 50));
            const trimmed = arr.slice(0, max);
            await chrome.storage.local.set({ [key]: trimmed });
        } catch (e) {
            console.debug('recordSpeedSession failed', e);
        }
    }

    computePerfScore(payload) {
        try {
            const t = payload?.timings || {};
            const p = payload?.paints || {};
            const lcp = payload?.lcp || 0;
            const fcp = p.firstContentfulPaint || 0;
            const dcl = t.domContentLoadedEventEnd || 0;
            const load = t.loadEventEnd || 0;
            // Simple heuristic: start at 100, subtract weighted ms/100
            let score = 100;
            if (fcp) score -= Math.min(50, fcp / 100);
            if (lcp) score -= Math.min(30, lcp / 150);
            if (dcl) score -= Math.min(15, dcl / 200);
            if (load) score -= Math.min(15, load / 300);
            score = Math.max(0, Math.min(100, Math.round(score)));
            return score;
        } catch (_) { return 0; }
    }

    async getSpeedSessions() {
        try {
            const key = 'fastbrowse_speed_sessions';
            const obj = await chrome.storage.local.get([key]);
            return Array.isArray(obj[key]) ? obj[key] : [];
        } catch (_) { return []; }
    }

    async handleBottleneckReport(data) {
        try {
            if (!this.settings.bottlenecksEnabled) return;
            const findings = [];
            const slowSize = (this.settings.slowResourceSizeKB || 200) * 1024;
            const slowDur = this.settings.slowResourceDurationMs || 300;
            const trackers = [/googletagmanager\.com/i, /google-analytics\.com/i, /doubleclick\.net/i, /facebook\.net/i, /hotjar\.com/i, /segment\.com/i, /newrelic\.com/i, /datadoghq\.com/i];

            // Slow resource detection
            if (this.settings.slowResourceDetection && Array.isArray(data?.resources)) {
                const heavy = data.resources.filter(r => {
                    const isScript = (r.initiatorType || '').toLowerCase().includes('script');
                    const isSlow = (r.duration || 0) >= slowDur || (r.encodedBodySize || 0) >= slowSize;
                    const isThirdParty = (() => { try { return new URL(r.name).hostname !== new URL(data.url).hostname; } catch (_) { return false; }})();
                    const isTracker = trackers.some(rx => rx.test(r.name || ''));
                    return (isScript || isTracker) && isSlow && isThirdParty;
                }).slice(0, 5);
                if (heavy.length > 0) {
                    findings.push({ type: 'slow-resources', heavy });
                }
            }

            // CPU Hog from long tasks
            if (this.settings.cpuHogWarning && data?.longTasks) {
                const win = this.settings.cpuLongTaskWindowMs || 10000;
                const thr = this.settings.cpuLongTaskTotalMsThreshold || 1000;
                // data.longTasks.totalDurationMs is measured over a recent window in content script
                if (data.longTasks.totalDurationMs >= thr) {
                    findings.push({ type: 'cpu-hog', total: data.longTasks.totalDurationMs, windowMs: win });
                }
            }

            if (findings.length > 0) {
                // Attach summary to latest speed session for same URL/origin
                try {
                    const key = 'fastbrowse_speed_sessions';
                    const obj = await chrome.storage.local.get([key]);
                    const arr = Array.isArray(obj[key]) ? obj[key] : [];
                    const now = Date.now();
                    let idx = -1;
                    for (let i = 0; i < arr.length; i++) {
                        const e = arr[i];
                        const sameUrl = e.url === data.url;
                        const sameHost = (()=>{ try { return new URL(e.url).hostname === new URL(data.url).hostname; } catch(_) { return false; }})();
                        if ((sameUrl || sameHost) && (now - e.ts) < 2*60*1000) { idx = i; break; }
                    }
                    if (idx >= 0) {
                        const summary = {};
                        const slow = findings.find(f => f.type === 'slow-resources');
                        if (slow) summary.slowCount = slow.heavy.length;
                        const cpu = findings.find(f => f.type === 'cpu-hog');
                        if (cpu) summary.cpuLongTaskTotalMs = cpu.total;
                        arr[idx].bottlenecks = summary;
                        await chrome.storage.local.set({ [key]: arr });
                    }
                } catch (_) {}
                if (this.settings.showNotifications) {
                    const host = (()=>{ try { return new URL(data.url).hostname; } catch(_) { return 'this page'; } })();
                    const parts = findings.map(f => {
                        if (f.type === 'slow-resources') return `${f.heavy.length} slow third‑party script(s)`;
                        if (f.type === 'cpu-hog') return `Long tasks ${f.total}ms/${(f.windowMs/1000)}s`;
                        return f.type;
                    });
                    this.showNotification(`⚠️ Bottlenecks on ${host}: ${parts.join(', ')}`);
                }
            }
        } catch (e) {
            console.debug('handleBottleneckReport failed', e);
        }
    }

    // Periodic memory leak alert integrated with forecasting
    async memoryLeakAlertCheck() {
        try {
            if (!this.settings.memoryLeakAlerts) return;
            const look = this.settings.memoryLeakLookbackMinutes || 5;
            const samples = this.getRecentSamples(look);
            if (samples.length < 2) return;
            const slope = this.computeSlopePercentPerMinute(samples);
            if (slope < (this.settings.memoryLeakSlopeThreshold || 1)) return; // below threshold
            // Attribute to active tab domain
            const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (activeTabs && activeTabs[0] && activeTabs[0].url) {
                const host = new URL(activeTabs[0].url).hostname;
                this.showNotification(`🧪 Memory leak suspected: rising usage while on ${host}`);
            }
        } catch (e) { /* ignore */ }
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
            
            // Pocket & Sync quick actions (Firefox only)
            try {
                const isFirefox = typeof browser !== 'undefined' && browser;
                if (isFirefox) {
                    chrome.contextMenus.create({ id: 'fastbrowse-tools', title: '🧰 FastBrowse Tools', contexts: ['page','action'] });
                    chrome.contextMenus.create({ id: 'save-to-pocket', parentId: 'fastbrowse-tools', title: 'Save to Pocket', contexts: ['page','action'] });
                    chrome.contextMenus.create({ id: 'mark-recently-synced', parentId: 'fastbrowse-tools', title: 'Mark as Recently Synced', contexts: ['page','action'] });
                }
            } catch (_) {}

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
            if (this._updatingContextMenus) {
                return; // prevent concurrent updates
            }
            this._updatingContextMenus = true;
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
                await this.createContextMenuSafe({
                    id: 'assign-tag-separator',
                    parentId: 'fastbrowse-tags',
                    type: 'separator',
                    contexts: ['page', 'action']
                });
                
                for (let index = 0; index < frequentTags.length; index++) {
                    const tag = frequentTags[index];
                    await this.createContextMenuSafe({
                        id: `assign-tag-${index}`,
                        parentId: 'fastbrowse-tags',
                        title: `📌 Assign "${tag.name}"`,
                        contexts: ['page', 'action']
                    });
                }
            }
            
        } catch (error) {
            console.error('Failed to update context menu tags:', error);
        } finally {
            this._updatingContextMenus = false;
        }
    }
    
    // Intelligent cache clear: clears browser cache then re-warms important origins
    async runIntelligentCacheClear() {
        try {
            if (!this.settings.intelligentCacheClearEnabled) return;
            // Clear HTTP cache only (preserve cookies/storage)
            await chrome.browsingData.remove({}, { cache: true });
            const origins = new Set();
            // Current tabs (pinned and active first)
            const tabs = await chrome.tabs.query({});
            for (const t of tabs) {
                try {
                    if (!t.url || !t.url.startsWith('http')) continue;
                    const u = new URL(t.url);
                    if (t.pinned || t.active) origins.add(u.origin);
                } catch (_) {}
            }
            // Recent speed sessions
            try {
                const sessions = await this.getSpeedSessions();
                sessions.slice(0, 10).forEach(s => { try { origins.add(new URL(s.url).origin); } catch(_){} });
            } catch (_) {}
            // Rewarm by fetching home pages (best-effort)
            const tasks = Array.from(origins).slice(0, 10).map(async (origin) => {
                try {
                    await fetch(origin + '/', { mode: 'no-cors', cache: 'reload' });
                } catch (_) {}
            });
            await Promise.allSettled(tasks);
            if (this.settings.showNotifications) {
                this.showNotification(`🧼 Cache cleared and re-warmed ${origins.size} origin(s)`);
            }
        } catch (e) {
            console.debug('runIntelligentCacheClear failed', e);
        }
    }

    // IndexedDB optimization helpers
    async optimizeIndexedDBForOrigin(origin) {
        try {
            if (!this.settings.profileOptimizationEnabled || !this.settings.idbOptimizeEnabled) return 0;
            // Clear IndexedDB for a given origin
            await chrome.browsingData.remove({ origins: [origin] }, { indexedDB: true });
            if (this.settings.showNotifications) {
                this.showNotification(`🧹 IndexedDB optimized for ${origin}`);
            }
            return 1;
        } catch (e) {
            console.debug('optimizeIndexedDBForOrigin failed', e);
            return 0;
        }
    }

    async optimizeIndexedDBForRecentOrigins() {
        try {
            if (!this.settings.profileOptimizationEnabled || !this.settings.idbOptimizeEnabled) return 0;
            const sessions = await this.getSpeedSessions();
            const tabs = await chrome.tabs.query({});
            const important = new Set();
            for (const t of tabs) {
                try { if (t.url && t.url.startsWith('http')) { const o = new URL(t.url).origin; if (t.active || t.pinned) important.add(o); } } catch(_){}
            }
            const origins = [];
            const seen = new Set();
            sessions.slice(0, 20).forEach(s => { try { const o = new URL(s.url).origin; if (!seen.has(o)) { seen.add(o); origins.push(o); } } catch(_){} });
            // Avoid clearing important origins
            const targets = origins.filter(o => !important.has(o)).slice(0, Math.max(1, this.settings.idbOptimizeBatchMax || 5));
            for (const o of targets) {
                try { await chrome.browsingData.remove({ origins: [o] }, { indexedDB: true }); } catch(_){}
            }
            if (this.settings.showNotifications) {
                this.showNotification(`🧹 Optimized IndexedDB for ${targets.length} recent site(s)`);
            }
            return targets.length;
        } catch (e) {
            console.debug('optimizeIndexedDBForRecentOrigins failed', e);
            return 0;
        }
    }

    // Quick Session Switching
    async enableTurboMode() {
        try {
            if (this.settings.turboMode) return;
            // Snapshot current settings
            await chrome.storage.local.set({ fastbrowse_turbo_snapshot: this.settings });
            // Apply turbo settings (non-destructive to user data)
            this.settings.turboMode = true;
            // Reduce extension overhead, maximize speed
            this.settings.speedDashboardEnabled = false;
            this.settings.bottlenecksEnabled = false;
            this.settings.aggressivePrefetchEnabled = false;
            this.settings.tagsEnabled = false;
            this.settings.extensionMonitoring = false;
            this.settings.extensionSuggestions = false;
            this.settings.extensionNotifications = false;
            this.settings.memoryAwareRestoration = true;
            this.settings.liteRestorationDefault = true;
            this.settings.prioritizeContentOverMedia = true;
            this.settings.networkOptimizationEnabled = true;
            this.settings.dnsPrefetchEnabled = true;
            this.settings.preconnectEnabled = true;
            this.settings.prefetchOnHoverEnabled = false;
            this.settings.gpuAccelEnabled = true;
            this.settings.gpuMode = 'aggressive';
            this.settings.webglProfile = 'performance';
            this.settings.webglForceHighPerf = true;
            await chrome.storage.sync.set(this.settings);
            if (this.settings.showNotifications) {
                this.showNotification('🚀 Turbo Mode enabled');
            }
        } catch (e) {
            console.debug('enableTurboMode failed', e);
        }
    }

    async disableTurboMode() {
        try {
            if (!this.settings.turboMode) return;
            const snap = (await chrome.storage.local.get(['fastbrowse_turbo_snapshot'])).fastbrowse_turbo_snapshot;
            if (snap) {
                this.settings = { ...this.settings, ...snap, turboMode: false };
            } else {
                this.settings.turboMode = false;
            }
            await chrome.storage.sync.set(this.settings);
            if (this.settings.showNotifications) {
                this.showNotification('🧰 Turbo Mode disabled');
            }
        } catch (e) {
            console.debug('disableTurboMode failed', e);
        }
    }

    getPresetSettings(name) {
        const p = String(name || '').toLowerCase();
        switch (p) {
            case 'gaming':
                return {
                    performancePreset: 'gaming',
                    aggressivePrefetchEnabled: false,
                    networkOptimizationEnabled: true,
                    dnsPrefetchEnabled: true,
                    preconnectEnabled: true,
                    prefetchOnHoverEnabled: false,
                    memoryAwareRestoration: true,
                    liteRestorationDefault: true,
                    prioritizeContentOverMedia: true,
                    gpuAccelEnabled: true,
                    gpuMode: 'aggressive',
                    webglProfile: 'performance',
                    webglForceHighPerf: true,
                };
            case 'streaming':
                return {
                    performancePreset: 'streaming',
                    aggressivePrefetchEnabled: false,
                    networkOptimizationEnabled: true,
                    dnsPrefetchEnabled: true,
                    preconnectEnabled: true,
                    prefetchOnHoverEnabled: false,
                    protectAudio: true,
                    memoryAwareRestoration: true,
                    liteRestorationDefault: false,
                    prioritizeContentOverMedia: false,
                    gpuAccelEnabled: true,
                    gpuMode: 'balanced',
                    webglProfile: 'quality',
                };
            case 'browsing':
            default:
                return {
                    performancePreset: 'browsing',
                    aggressivePrefetchEnabled: true,
                    networkOptimizationEnabled: true,
                    dnsPrefetchEnabled: true,
                    preconnectEnabled: true,
                    prefetchOnHoverEnabled: true,
                    memoryAwareRestoration: true,
                    liteRestorationDefault: false,
                    prioritizeContentOverMedia: true,
                    gpuAccelEnabled: true,
                    gpuMode: 'auto',
                    webglProfile: 'performance',
                };
        }
    }

    async applyPerformancePreset(name) {
        try {
            const patch = this.getPresetSettings(name);
            this.settings = { ...this.settings, ...patch };
            await chrome.storage.sync.set(this.settings);
            if (this.settings.showNotifications) {
                this.showNotification(`⚙️ Applied ${this.settings.performancePreset} preset`);
            }
        } catch (e) {
            console.debug('applyPerformancePreset failed', e);
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
                    if (info.menuItemId === 'save-to-pocket') {
                        try {
                            const title = (tab && tab.title) || 'Saved via FastBrowse';
                            const saveUrl = `https://getpocket.com/save?url=${encodeURIComponent(tab.url||'')}&title=${encodeURIComponent(title)}`;
                            await chrome.tabs.create({ url: saveUrl, index: (tab ? tab.index+1 : undefined), windowId: (tab ? tab.windowId : undefined) });
                            await this.markPocketSaved(tab.url||'');
                            this.showNotification('Opened Pocket save. Tab will be treated as archivable.');
                        } catch (e) { this.showNotification('Failed to open Pocket'); }
                        break;
                    }
                    if (info.menuItemId === 'mark-recently-synced') {
                        try { this.markRecentlySynced(tab.id); this.showNotification('Marked as recently synced'); } catch (_) {}
                        break;
                    }
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
    
    async handleAlarm(alarm) {
        try {
            switch (alarm.name) {
                case 'contextCheck':
                    if (this.contextAwareFocus) {
                        await this.contextAwareFocus.checkContext();
                    }
                    break;
            }
        } catch (error) {
            console.debug('Alarm handler failed:', error);
        }
    }

    // Safe wrapper for creating context menu items (ignores duplicate id errors)
    async createContextMenuSafe(options) {
        return new Promise((resolve) => {
            try {
                chrome.contextMenus.create(options, () => {
                    if (chrome.runtime.lastError) {
                        // Duplicate IDs or other benign errors can be ignored
                        const msg = chrome.runtime.lastError.message || '';
                        if (!/Cannot create item with duplicate id/i.test(msg)) {
                            console.debug('Context menu create warning:', msg);
                        }
                    }
                    resolve();
                });
            } catch (e) {
                resolve();
            }
        });
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

// Context-Aware Focus Management Class
class ContextAwareFocus {
    constructor(fastBrowse) {
        this.fastBrowse = fastBrowse;
        this.workflowPatterns = {
            coding: {
                domains: ['github.com', 'stackoverflow.com', 'gitlab.com', 'bitbucket.org', 'codepen.io', 'jsfiddle.net', 'replit.com'],
                keywords: ['code', 'programming', 'development', 'api', 'documentation', 'terminal', 'command'],
                tabMinimum: 2
            },
            writing: {
                domains: ['docs.google.com', 'notion.so', 'medium.com', 'substack.com', 'wordpress.com', 'blogger.com'],
                keywords: ['write', 'document', 'article', 'blog', 'draft', 'edit'],
                tabMinimum: 1
            },
            research: {
                domains: ['scholar.google.com', 'jstor.org', 'pubmed.ncbi.nlm.nih.gov', 'arxiv.org', 'researchgate.net'],
                keywords: ['research', 'study', 'paper', 'journal', 'academic', 'citation'],
                tabMinimum: 3
            },
            design: {
                domains: ['figma.com', 'sketch.com', 'canva.com', 'behance.net', 'dribbble.com', 'adobe.com'],
                keywords: ['design', 'creative', 'ui', 'ux', 'prototype', 'mockup'],
                tabMinimum: 2
            }
        };
        
        this.contextHistory = []; // Track context changes over time
        this.workflowHistory = []; // Track detected workflows
        this.lastWorkflowCheck = 0;
        this.contextCheckInterval = null;
    }
    
    async init() {
        // Start context monitoring
        this.startContextMonitoring();
        
        // Initial context check
        await this.checkContext();
        
        console.log('ContextAwareFocus initialized');
    }
    
    startContextMonitoring() {
        // Check context every 2 minutes
        this.contextCheckInterval = setInterval(() => {
            this.checkContext();
        }, 120000); // 2 minutes
        
        // Set up alarm for work hours detection
        if (this.fastBrowse.settings.workHoursEnabled) {
            chrome.alarms.create('contextCheck', { periodInMinutes: 5 });
        }
    }
    
    async checkContext() {
        try {
            const now = Date.now();
            this.fastBrowse.lastContextCheck = now;
            
            // Determine if we're in work hours
            const newContext = await this.determineWorkHours();
            
            // Check for workflow detection if enabled
            let detectedWorkflow = null;
            if (this.fastBrowse.settings.workflowDetectionEnabled) {
                detectedWorkflow = await this.detectCurrentWorkflow();
            }
            
            // Check if context has changed
            const contextChanged = newContext !== this.fastBrowse.currentContext;
            const workflowChanged = detectedWorkflow !== this.fastBrowse.detectedWorkflow;
            
            if (contextChanged || workflowChanged) {
                await this.handleContextChange(newContext, detectedWorkflow);
            }
            
            // Clean up expired smart whitelist entries
            this.cleanupSmartWhitelist();
            
        } catch (error) {
            console.debug('Context check failed:', error);
        }
    }
    
    async determineWorkHours() {
        if (!this.fastBrowse.settings.workHoursEnabled) {
            return 'personal';
        }
        
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        const isWorkDay = this.fastBrowse.settings.workDays.includes(currentDay);
        const isWorkHour = currentHour >= this.fastBrowse.settings.workStartHour && 
                          currentHour < this.fastBrowse.settings.workEndHour;
        
        return (isWorkDay && isWorkHour) ? 'work' : 'personal';
    }
    
    async detectCurrentWorkflow() {
        try {
            // Get all open tabs
            const tabs = await chrome.tabs.query({});
            const activeTabs = tabs.filter(tab => !tab.discarded && tab.url && !tab.url.startsWith('chrome://'));
            
            // Analyze tabs for workflow patterns
            const workflowScores = {};
            
            for (const [workflowName, pattern] of Object.entries(this.workflowPatterns)) {
                workflowScores[workflowName] = this.calculateWorkflowScore(activeTabs, pattern);
            }
            
            // Find the workflow with the highest score
            const bestWorkflow = Object.entries(workflowScores)
                .reduce((best, [name, score]) => score > best.score ? { name, score } : best, { name: null, score: 0 });
            
            // Return workflow if score is significant (>0.3) and meets minimum tab requirement
            if (bestWorkflow.score > 0.3) {
                const pattern = this.workflowPatterns[bestWorkflow.name];
                const relevantTabs = activeTabs.filter(tab => this.isTabRelevantToWorkflow(tab, pattern));
                
                if (relevantTabs.length >= pattern.tabMinimum) {
                    return bestWorkflow.name;
                }
            }
            
            return null;
            
        } catch (error) {
            console.debug('Workflow detection failed:', error);
            return null;
        }
    }
    
    calculateWorkflowScore(tabs, pattern) {
        let score = 0;
        let relevantTabs = 0;
        
        for (const tab of tabs) {
            if (this.isTabRelevantToWorkflow(tab, pattern)) {
                relevantTabs++;
                score += 1;
                
                // Boost score for active tabs
                if (tab.active) {
                    score += 0.5;
                }
                
                // Boost score for recently accessed tabs
                if (tab.lastAccessed && (Date.now() - tab.lastAccessed < 300000)) { // 5 minutes
                    score += 0.3;
                }
            }
        }
        
        // Normalize score by total tabs to get a ratio
        return tabs.length > 0 ? score / tabs.length : 0;
    }
    
    isTabRelevantToWorkflow(tab, pattern) {
        try {
            const url = new URL(tab.url);
            const domain = url.hostname.toLowerCase().replace('www.', '');
            const title = tab.title.toLowerCase();
            const urlPath = url.pathname.toLowerCase();
            
            // Check domain matches
            if (pattern.domains.some(d => domain.includes(d))) {
                return true;
            }
            
            // Check keyword matches in title or URL
            if (pattern.keywords.some(keyword => 
                title.includes(keyword) || urlPath.includes(keyword))) {
                return true;
            }
            
            return false;
            
        } catch (error) {
            return false;
        }
    }
    
    async handleContextChange(newContext, detectedWorkflow) {
        const oldContext = this.fastBrowse.currentContext;
        const oldWorkflow = this.fastBrowse.detectedWorkflow;
        
        // Clear any pending context switch timeout
        if (this.fastBrowse.contextSwitchTimeout) {
            clearTimeout(this.fastBrowse.contextSwitchTimeout);
        }
        
        // Apply context switch delay if enabled
        if (this.fastBrowse.settings.contextSwitchDelay > 0 && oldContext !== newContext) {
            this.fastBrowse.contextSwitchTimeout = setTimeout(async () => {
                await this.applyContextChange(newContext, detectedWorkflow);
            }, this.fastBrowse.settings.contextSwitchDelay);
        } else {
            await this.applyContextChange(newContext, detectedWorkflow);
        }
    }
    
    async applyContextChange(newContext, detectedWorkflow) {
        const oldContext = this.fastBrowse.currentContext;
        const oldWorkflow = this.fastBrowse.detectedWorkflow;
        
        // Update context
        this.fastBrowse.currentContext = newContext;
        this.fastBrowse.detectedWorkflow = detectedWorkflow;
        
        // Record context change in history
        this.contextHistory.push({
            timestamp: Date.now(),
            oldContext,
            newContext,
            oldWorkflow,
            newWorkflow: detectedWorkflow
        });
        
        // Limit history to last 50 entries
        if (this.contextHistory.length > 50) {
            this.contextHistory = this.contextHistory.slice(-50);
        }
        
        console.log(`Context changed: ${oldContext} -> ${newContext}, Workflow: ${oldWorkflow} -> ${detectedWorkflow}`);
        
        // Apply smart whitelist based on detected workflow
        if (detectedWorkflow && this.fastBrowse.settings.smartWhitelistEnabled) {
            await this.applySmartWhitelist(detectedWorkflow);
        }
        
        // Update focus mode rules in all tabs if focus mode is active
        if (this.fastBrowse.focusModeActive) {
            await this.updateFocusRulesInAllTabs();
        }
    }
    
    async applySmartWhitelist(workflow) {
        const pattern = this.workflowPatterns[workflow];
        if (!pattern) return;
        
        const expiryTime = Date.now() + this.fastBrowse.settings.smartWhitelistTimeout;
        
        // Add workflow-related domains to smart whitelist
        for (const domain of pattern.domains) {
            this.fastBrowse.smartWhitelist.set(domain, expiryTime);
        }
        
        console.log(`Smart whitelist applied for ${workflow} workflow`);
    }
    
    cleanupSmartWhitelist() {
        const now = Date.now();
        for (const [domain, expiry] of this.fastBrowse.smartWhitelist.entries()) {
            if (now > expiry) {
                this.fastBrowse.smartWhitelist.delete(domain);
            }
        }
    }
    
    async updateFocusRulesInAllTabs() {
        try {
            const tabs = await chrome.tabs.query({});
            
            for (const tab of tabs) {
                if (tab.url && !tab.url.startsWith('chrome://')) {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'updateContextRules',
                        context: this.fastBrowse.currentContext,
                        workflow: this.fastBrowse.detectedWorkflow,
                        intensity: this.getContextIntensity()
                    }).catch(() => {}); // Ignore errors for tabs without content script
                }
            }
        } catch (error) {
            console.debug('Failed to update focus rules in tabs:', error);
        }
    }
    
    getContextIntensity() {
        return this.fastBrowse.currentContext === 'work' 
            ? this.fastBrowse.settings.workModeIntensity 
            : this.fastBrowse.settings.personalModeIntensity;
    }
    
    isSmartWhitelisted(domain) {
        if (!this.fastBrowse.settings.smartWhitelistEnabled) return false;
        
        const cleanDomain = domain.replace('www.', '').toLowerCase();
        const expiry = this.fastBrowse.smartWhitelist.get(cleanDomain);
        
        if (expiry && Date.now() < expiry) {
            return true;
        }
        
        // Check if domain matches any workflow patterns for current detected workflow
        if (this.fastBrowse.detectedWorkflow) {
            const pattern = this.workflowPatterns[this.fastBrowse.detectedWorkflow];
            if (pattern && pattern.domains.some(d => cleanDomain.includes(d))) {
                return true;
            }
        }
        
        return false;
    }
    
    getContextRules(domain) {
        const rules = {
            context: this.fastBrowse.currentContext,
            workflow: this.fastBrowse.detectedWorkflow,
            intensity: this.getContextIntensity(),
            isSmartWhitelisted: this.isSmartWhitelisted(domain),
            distractionLevel: 'medium' // default
        };
        
        // Adjust distraction level based on context and settings
        if (this.fastBrowse.currentContext === 'work') {
            if (this.fastBrowse.settings.workModeStrict) {
                rules.distractionLevel = this.fastBrowse.settings.workModeIntensity;
            }
        } else if (this.fastBrowse.settings.personalModeRelaxed) {
            rules.distractionLevel = 'low';
        }
        
        // Override for smart whitelisted domains
        if (rules.isSmartWhitelisted) {
            rules.distractionLevel = 'low'; // Reduce distraction removal for important workflows
        }
        
        return rules;
    }
    }

    async detectZombieTabs() {
        // Heuristic: try to discard non-protected, non-active tabs; any that resist discard are reported
        const candidates = await chrome.tabs.query({ active: false });
        const tested = [];
        for (const t of candidates) {
            try {
                if (await this.shouldProtectTab(t)) continue;
                if (!t.url || t.url.startsWith('about:')) continue;
                tested.push(t.id);
                try { await chrome.tabs.discard(t.id); } catch (_) {}
            } catch (_) {}
        }
        // Wait briefly for discard to take effect
        await new Promise(r => setTimeout(r, 800));
        const zombies = [];
        for (const id of tested) {
            try {
                const u = await chrome.tabs.get(id);
                const isSuspendedPage = (u.url || '').startsWith(chrome.runtime.getURL('src/suspended.html'));
                if (!u.discarded && !u.audible && !u.pinned && !isSuspendedPage) {
                    zombies.push({ tabId: u.id, title: u.title, url: u.url, windowId: u.windowId });
                }
            } catch (_) {}
        }
        return { suspected: zombies, tested: tested.length };
    }
    
    // Initialize FastBrowse when the service worker starts
    const fastBrowse = new FastBrowse();
