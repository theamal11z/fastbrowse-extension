// FastBrowse Options Script
// Handles settings management and UI interactions

class OptionsManager {
    constructor() {
        this.elements = {
            autoSuspend: document.getElementById('auto-suspend'),
            suspendDelay: document.getElementById('suspend-delay'),
            suspendDelayValue: document.getElementById('suspend-delay-value'),
            memoryThreshold: document.getElementById('memory-threshold'),
            memoryLimit: document.getElementById('memory-limit'),
            memoryLimitValue: document.getElementById('memory-limit-value'),
            memorySmartMode: document.getElementById('memory-smart-mode'),
            // Memory compression controls
            memoryCompressionEnabled: document.getElementById('memory-compression-enabled'),
            snapshotScroll: document.getElementById('snapshot-scroll'),
            snapshotForms: document.getElementById('snapshot-forms'),
            memoryCompressionAlgo: document.getElementById('memory-compression-algo'),
            protectPinned: document.getElementById('protect-pinned'),
            protectAudio: document.getElementById('protect-audio'),
            protectForms: document.getElementById('protect-forms'),
            showNotifications: document.getElementById('show-notifications'),
            // Network optimization elements
            networkOptimizationEnabled: document.getElementById('network-optimization-enabled'),
            dnsPrefetchEnabled: document.getElementById('dns-prefetch-enabled'),
            maxPrefetchHosts: document.getElementById('max-prefetch-hosts'),
            maxPrefetchHostsValue: document.getElementById('max-prefetch-hosts-value'),
            preconnectEnabled: document.getElementById('preconnect-enabled'),
            preconnectTopN: document.getElementById('preconnect-top-n'),
            preconnectTopNValue: document.getElementById('preconnect-top-n-value'),
            prefetchOnHoverEnabled: document.getElementById('prefetch-on-hover-enabled'),
            // GPU Accel elements
            gpuAccelEnabled: document.getElementById('gpu-accel-enabled'),
            gpuMode: document.getElementById('gpu-mode'),
            webglProfile: document.getElementById('webgl-profile'),
            webglForceHighPerf: document.getElementById('webgl-force-high-perf'),
            webglAntialias: document.getElementById('webgl-antialias'),
            webglPreserve: document.getElementById('webgl-preserve'),
            // Smart Cache Management
            smartCacheEnabled: document.getElementById('smart-cache-enabled'),
            aggressivePrefetchEnabled: document.getElementById('aggressive-prefetch-enabled'),
            precacheMaxLinks: document.getElementById('precache-max-links'),
            precacheMaxLinksValue: document.getElementById('precache-max-links-value'),
            precacheIdleDelay: document.getElementById('precache-idle-delay'),
            precacheIdleDelayValue: document.getElementById('precache-idle-delay-value'),
            runPrecacheNow: document.getElementById('precache-now'),
            intelligentCacheClearEnabled: document.getElementById('intelligent-cache-clear-enabled'),
            runCacheClear: document.getElementById('run-cache-clear'),
            cacheClearStatus: document.getElementById('cache-clear-status'),
            cacheCompressionEnabled: document.getElementById('cache-compression-enabled'),
            // Profile Optimization
            profileOptimizationEnabled: document.getElementById('profile-optimization-enabled'),
            optimizeIdbCurrent: document.getElementById('optimize-idb-current'),
            optimizeIdbRecent: document.getElementById('optimize-idb-recent'),
            idbOptStatus: document.getElementById('idb-opt-status'),
            memoryWarnings: document.getElementById('memory-warnings'),
            // Extension monitoring elements
            extensionMonitoring: document.getElementById('extension-monitoring'),
            extensionMemoryThreshold: document.getElementById('extension-memory-threshold'),
            extensionMemoryThresholdValue: document.getElementById('extension-memory-threshold-value'),
            extensionSuggestions: document.getElementById('extension-suggestions'),
            extensionNotifications: document.getElementById('extension-notifications'),
            // Focus mode elements
            focusMode: document.getElementById('focus-mode'),
            focusAutoSuspend: document.getElementById('focus-auto-suspend'),
            focusMinimalTheme: document.getElementById('focus-minimal-theme'),
            focusRemoveDistractions: document.getElementById('focus-remove-distractions'),
            focusDisableAnimations: document.getElementById('focus-disable-animations'),
            focusMemoryOptimization: document.getElementById('focus-memory-optimization'),
            focusExtensionRecommendations: document.getElementById('focus-extension-recommendations'),
            focusTotalTime: document.getElementById('focus-total-time'),
            focusTotalTabs: document.getElementById('focus-total-tabs'),
            // Tag management elements
            tagsEnabled: document.getElementById('tags-enabled'),
            autoTagging: document.getElementById('auto-tagging'),
            tagFrequencyThreshold: document.getElementById('tag-frequency-threshold'),
            tagFrequencyThresholdValue: document.getElementById('tag-frequency-threshold-value'),
            tagBasedSuspension: document.getElementById('tag-based-suspension'),
            tagSuggestions: document.getElementById('tag-suggestions'),
            maxTagsPerTab: document.getElementById('max-tags-per-tab'),
            maxTagsPerTabValue: document.getElementById('max-tags-per-tab-value'),
            tagInactivityDays: document.getElementById('tag-inactivity-days'),
            tagInactivityDaysValue: document.getElementById('tag-inactivity-days-value'),
            // Tag-based memory policies elements
            tagPolicyEnabled: document.getElementById('tag-policy-enabled'),
            workTagDelayMultiplier: document.getElementById('work-tag-delay-multiplier'),
            workTagDelayMultiplierValue: document.getElementById('work-tag-delay-multiplier-value'),
            referenceNoSuspendDuringWork: document.getElementById('reference-no-suspend-during-work'),
            totalTagsCount: document.getElementById('total-tags-count'),
            frequentTagsCount: document.getElementById('frequent-tags-count'),
            taggedTabsCount: document.getElementById('tagged-tabs-count'),
            // Memory-aware restoration elements
            memoryAwareRestoration: document.getElementById('memory-aware-restoration'),
            liteRestorationThreshold: document.getElementById('lite-restoration-threshold'),
            liteRestorationThresholdValue: document.getElementById('lite-restoration-threshold-value'),
            progressiveRestorationEnabled: document.getElementById('progressive-restoration-enabled'),
            progressiveRestorationDelay: document.getElementById('progressive-restoration-delay'),
            progressiveRestorationDelayValue: document.getElementById('progressive-restoration-delay-value'),
            prioritizeContentOverMedia: document.getElementById('prioritize-content-over-media'),
            liteRestorationDefault: document.getElementById('lite-restoration-default'),
            restorationPriorityMode: document.getElementById('restoration-priority-mode'),
            maxConcurrentRestorations: document.getElementById('max-concurrent-restorations'),
            maxConcurrentRestorationsValue: document.getElementById('max-concurrent-restorations-value'),
            restorationMemoryBuffer: document.getElementById('restoration-memory-buffer'),
            restorationMemoryBufferValue: document.getElementById('restoration-memory-buffer-value'),
            totalRestoredCount: document.getElementById('total-restored-count'),
            liteRestoredCount: document.getElementById('lite-restored-count'),
            memoryOptimizedCount: document.getElementById('memory-optimized-count'),
            lastRestorationTime: document.getElementById('last-restoration-time'),
            // Page Acceleration elements
            pageAccelEnabled: document.getElementById('page-accel-enabled'),
            lazyOverrideEnabled: document.getElementById('lazy-override-enabled'),
            cssDeferEnabled: document.getElementById('css-defer-enabled'),
            cssDeferMax: document.getElementById('css-defer-max'),
            cssDeferMaxValue: document.getElementById('css-defer-max-value'),
            jsDeferralEnabled: document.getElementById('js-deferral-enabled'),
            jsDeferralMode: document.getElementById('js-deferral-mode'),
            // Chrome Flags Manager
            flagsManagerEnabled: document.getElementById('flags-manager-enabled'),
            flagGpuRasterization: document.getElementById('flag-gpu-rasterization'),
            flagParallelDownloading: document.getElementById('flag-parallel-downloading'),
            flagsExperimentalToggle: document.getElementById('flags-experimental-toggle'),
            // Speed Dashboard elements
            speedDashboardEnabled: document.getElementById('speed-dashboard-enabled'),
            refreshSpeed: document.getElementById('refresh-speed'),
            clearSpeed: document.getElementById('clear-speed'),
            speedStatus: document.getElementById('speed-status'),
            speedList: document.getElementById('speed-dashboard-list'),
            // Bottlenecks
            bottlenecksEnabled: document.getElementById('bottlenecks-enabled'),
            slowResourceDetection: document.getElementById('slow-resource-detection'),
            slowResourceSizeKb: document.getElementById('slow-resource-size-kb'),
            slowResourceSizeKbValue: document.getElementById('slow-resource-size-kb-value'),
            slowResourceDurationMs: document.getElementById('slow-resource-duration-ms'),
            slowResourceDurationMsValue: document.getElementById('slow-resource-duration-ms-value'),
            cpuHogWarning: document.getElementById('cpu-hog-warning'),
            cpuLongTaskWindowMs: document.getElementById('cpu-longtask-window-ms'),
            cpuLongTaskWindowMsValue: document.getElementById('cpu-longtask-window-ms-value'),
            cpuLongTaskTotalMs: document.getElementById('cpu-longtask-total-ms'),
            cpuLongTaskTotalMsValue: document.getElementById('cpu-longtask-total-ms-value'),
            memoryLeakAlerts: document.getElementById('memory-leak-alerts'),
            memoryLeakLookback: document.getElementById('memory-leak-lookback'),
            memoryLeakLookbackValue: document.getElementById('memory-leak-lookback-value'),
            memoryLeakSlope: document.getElementById('memory-leak-slope'),
            memoryLeakSlopeValue: document.getElementById('memory-leak-slope-value'),
            copyFlagsBtn: document.getElementById('copy-flags'),
            copyFullCommandBtn: document.getElementById('copy-full-command'),
            flagsCopyStatus: document.getElementById('flags-copy-status'),
            flagsOsSelect: document.getElementById('flags-os-select'),
            // Context-aware elements
            contextAwareEnabled: document.getElementById('context-aware-enabled'),
            workHoursEnabled: document.getElementById('work-hours-enabled'),
            workStartHour: document.getElementById('work-start-hour'),
            workEndHour: document.getElementById('work-end-hour'),
            workModeStrict: document.getElementById('work-mode-strict'),
            personalModeRelaxed: document.getElementById('personal-mode-relaxed'),
            autoAdjustEnabled: document.getElementById('auto-adjust-enabled'),
            smartWhitelistEnabled: document.getElementById('smart-whitelist-enabled'),
            workflowDetectionEnabled: document.getElementById('workflow-detection-enabled'),
            contextSwitchDelay: document.getElementById('context-switch-delay'),
            contextSwitchDelayValue: document.getElementById('context-switch-delay-value'),
            workModeIntensity: document.getElementById('work-mode-intensity'),
            personalModeIntensity: document.getElementById('personal-mode-intensity'),
            smartWhitelistTimeout: document.getElementById('smart-whitelist-timeout'),
            smartWhitelistTimeoutValue: document.getElementById('smart-whitelist-timeout-value'),
            // Context status display elements
            currentContext: document.getElementById('current-context'),
            detectedWorkflow: document.getElementById('detected-workflow'),
            lastContextCheck: document.getElementById('last-context-check'),
            saveButton: document.getElementById('save'),
            saveStatus: document.getElementById('save-status')
        };
        
        // Work days checkboxes
        this.workDayElements = {
            0: document.getElementById('work-day-0'), // Sunday
            1: document.getElementById('work-day-1'), // Monday
            2: document.getElementById('work-day-2'), // Tuesday
            3: document.getElementById('work-day-3'), // Wednesday
            4: document.getElementById('work-day-4'), // Thursday
            5: document.getElementById('work-day-5'), // Friday
            6: document.getElementById('work-day-6')  // Saturday
        };
        
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        await this.loadFocusStats();
        await this.loadTagStats();
        await this.loadRestorationStats();
        await this.loadSpeedDashboard();
        await this.loadContextInfo();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Range value display updates
        this.elements.suspendDelay.addEventListener('input', () => {
            this.elements.suspendDelayValue.textContent = this.elements.suspendDelay.value;
        });
        
        this.elements.memoryLimit.addEventListener('input', () => {
            this.elements.memoryLimitValue.textContent = this.elements.memoryLimit.value;
        });
        
        this.elements.extensionMemoryThreshold.addEventListener('input', () => {
            this.elements.extensionMemoryThresholdValue.textContent = this.elements.extensionMemoryThreshold.value;
        });
        
        // Tag management range updates
        this.elements.tagFrequencyThreshold.addEventListener('input', () => {
            this.elements.tagFrequencyThresholdValue.textContent = this.elements.tagFrequencyThreshold.value;
        });
        
        this.elements.maxTagsPerTab.addEventListener('input', () => {
            this.elements.maxTagsPerTabValue.textContent = this.elements.maxTagsPerTab.value;
        });
        
        this.elements.tagInactivityDays.addEventListener('input', () => {
            this.elements.tagInactivityDaysValue.textContent = this.elements.tagInactivityDays.value;
        });
        
        // Tag-based memory policies listeners
        if (this.elements.workTagDelayMultiplier) {
            this.elements.workTagDelayMultiplier.addEventListener('input', () => {
                this.elements.workTagDelayMultiplierValue.textContent = this.elements.workTagDelayMultiplier.value;
            });
            this.elements.workTagDelayMultiplier.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        if (this.elements.tagPolicyEnabled) {
            this.elements.tagPolicyEnabled.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.referenceNoSuspendDuringWork) {
            this.elements.referenceNoSuspendDuringWork.addEventListener('change', () => this.saveSettings());
        }
        
        // GPU Accel listeners
        if (this.elements.gpuAccelEnabled) this.elements.gpuAccelEnabled.addEventListener('change', () => this.saveSettings());
        if (this.elements.gpuMode) this.elements.gpuMode.addEventListener('change', () => this.saveSettings());
        if (this.elements.webglProfile) this.elements.webglProfile.addEventListener('change', () => {
            this.applyWebglPresetToUI(this.elements.webglProfile.value);
            this.saveSettings();
        });
        if (this.elements.webglForceHighPerf) this.elements.webglForceHighPerf.addEventListener('change', () => this.saveSettings());
        if (this.elements.webglAntialias) this.elements.webglAntialias.addEventListener('change', () => this.saveSettings());
        if (this.elements.webglPreserve) this.elements.webglPreserve.addEventListener('change', () => this.saveSettings());

        // Network optimization range updates
        if (this.elements.maxPrefetchHosts) {
            this.elements.maxPrefetchHosts.addEventListener('input', () => {
                this.elements.maxPrefetchHostsValue.textContent = this.elements.maxPrefetchHosts.value;
            });
            this.elements.maxPrefetchHosts.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.preconnectTopN) {
            this.elements.preconnectTopN.addEventListener('input', () => {
                this.elements.preconnectTopNValue.textContent = this.elements.preconnectTopN.value;
            });
            this.elements.preconnectTopN.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.networkOptimizationEnabled) {
            this.elements.networkOptimizationEnabled.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.dnsPrefetchEnabled) {
            this.elements.dnsPrefetchEnabled.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.preconnectEnabled) {
            this.elements.preconnectEnabled.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.prefetchOnHoverEnabled) {
            this.elements.prefetchOnHoverEnabled.addEventListener('change', () => this.saveSettings());
        }

        // Restoration settings range updates
        if (this.elements.liteRestorationThreshold) {
            this.elements.liteRestorationThreshold.addEventListener('input', () => {
                this.elements.liteRestorationThresholdValue.textContent = this.elements.liteRestorationThreshold.value;
            });
        }
        
        if (this.elements.progressiveRestorationDelay) {
            this.elements.progressiveRestorationDelay.addEventListener('input', () => {
                this.elements.progressiveRestorationDelayValue.textContent = this.elements.progressiveRestorationDelay.value;
            });
        }
        
        if (this.elements.maxConcurrentRestorations) {
            this.elements.maxConcurrentRestorations.addEventListener('input', () => {
                this.elements.maxConcurrentRestorationsValue.textContent = this.elements.maxConcurrentRestorations.value;
            });
        }
        
        if (this.elements.restorationMemoryBuffer) {
            this.elements.restorationMemoryBuffer.addEventListener('input', () => {
                this.elements.restorationMemoryBufferValue.textContent = this.elements.restorationMemoryBuffer.value;
            });
        }
        
        // Memory compression listeners
        if (this.elements.memoryCompressionEnabled) {
            this.elements.memoryCompressionEnabled.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.snapshotScroll) {
            this.elements.snapshotScroll.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.snapshotForms) {
            this.elements.snapshotForms.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.memoryCompressionAlgo) {
            this.elements.memoryCompressionAlgo.addEventListener('change', () => this.saveSettings());
        }
        
        // Bottlenecks listeners
        if (this.elements.bottlenecksEnabled) this.elements.bottlenecksEnabled.addEventListener('change', () => this.saveSettings());
        if (this.elements.slowResourceDetection) this.elements.slowResourceDetection.addEventListener('change', () => this.saveSettings());
        if (this.elements.slowResourceSizeKb) {
            this.elements.slowResourceSizeKb.addEventListener('input', () => this.elements.slowResourceSizeKbValue.textContent = this.elements.slowResourceSizeKb.value);
            this.elements.slowResourceSizeKb.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.slowResourceDurationMs) {
            this.elements.slowResourceDurationMs.addEventListener('input', () => this.elements.slowResourceDurationMsValue.textContent = this.elements.slowResourceDurationMs.value);
            this.elements.slowResourceDurationMs.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.cpuHogWarning) this.elements.cpuHogWarning.addEventListener('change', () => this.saveSettings());
        if (this.elements.cpuLongTaskWindowMs) {
            this.elements.cpuLongTaskWindowMs.addEventListener('input', () => this.elements.cpuLongTaskWindowMsValue.textContent = this.elements.cpuLongTaskWindowMs.value);
            this.elements.cpuLongTaskWindowMs.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.cpuLongTaskTotalMs) {
            this.elements.cpuLongTaskTotalMs.addEventListener('input', () => this.elements.cpuLongTaskTotalMsValue.textContent = this.elements.cpuLongTaskTotalMs.value);
            this.elements.cpuLongTaskTotalMs.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.memoryLeakAlerts) this.elements.memoryLeakAlerts.addEventListener('change', () => this.saveSettings());
        if (this.elements.memoryLeakLookback) {
            this.elements.memoryLeakLookback.addEventListener('input', () => this.elements.memoryLeakLookbackValue.textContent = this.elements.memoryLeakLookback.value);
            this.elements.memoryLeakLookback.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.memoryLeakSlope) {
            this.elements.memoryLeakSlope.addEventListener('input', () => this.elements.memoryLeakSlopeValue.textContent = this.elements.memoryLeakSlope.value);
            this.elements.memoryLeakSlope.addEventListener('change', () => this.saveSettings());
        }

        // Speed Dashboard listeners
        if (this.elements.speedDashboardEnabled) this.elements.speedDashboardEnabled.addEventListener('change', () => this.saveSettings());
        if (this.elements.refreshSpeed) this.elements.refreshSpeed.addEventListener('click', () => this.loadSpeedDashboard());
        if (this.elements.clearSpeed) this.elements.clearSpeed.addEventListener('click', () => this.clearSpeedDashboard());

        // Flags Manager listeners
        if (this.elements.flagsManagerEnabled) this.elements.flagsManagerEnabled.addEventListener('change', () => this.saveSettings());
        if (this.elements.flagGpuRasterization) this.elements.flagGpuRasterization.addEventListener('change', () => this.saveSettings());
        if (this.elements.flagParallelDownloading) this.elements.flagParallelDownloading.addEventListener('change', () => this.saveSettings());
        if (this.elements.flagsExperimentalToggle) this.elements.flagsExperimentalToggle.addEventListener('change', () => this.saveSettings());
        if (this.elements.copyFlagsBtn) this.elements.copyFlagsBtn.addEventListener('click', () => this.copyFlags(false));
        if (this.elements.copyFullCommandBtn) this.elements.copyFullCommandBtn.addEventListener('click', () => this.copyFlags(true));

        // Page Acceleration listeners
        if (this.elements.pageAccelEnabled) this.elements.pageAccelEnabled.addEventListener('change', () => this.saveSettings());
        if (this.elements.lazyOverrideEnabled) this.elements.lazyOverrideEnabled.addEventListener('change', () => this.saveSettings());
        if (this.elements.cssDeferEnabled) this.elements.cssDeferEnabled.addEventListener('change', () => this.saveSettings());
        if (this.elements.cssDeferMax) {
            this.elements.cssDeferMax.addEventListener('input', () => {
                this.elements.cssDeferMaxValue.textContent = this.elements.cssDeferMax.value;
            });
            this.elements.cssDeferMax.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.jsDeferralEnabled) this.elements.jsDeferralEnabled.addEventListener('change', () => this.saveSettings());
        if (this.elements.jsDeferralMode) this.elements.jsDeferralMode.addEventListener('change', () => this.saveSettings());

        // Smart Cache Management listeners
        if (this.elements.smartCacheEnabled) this.elements.smartCacheEnabled.addEventListener('change', () => this.saveSettings());
        if (this.elements.aggressivePrefetchEnabled) this.elements.aggressivePrefetchEnabled.addEventListener('change', () => this.saveSettings());
        if (this.elements.precacheMaxLinks) {
            this.elements.precacheMaxLinks.addEventListener('input', () => this.elements.precacheMaxLinksValue.textContent = this.elements.precacheMaxLinks.value);
            this.elements.precacheMaxLinks.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.precacheIdleDelay) {
            this.elements.precacheIdleDelay.addEventListener('input', () => this.elements.precacheIdleDelayValue.textContent = this.elements.precacheIdleDelay.value);
            this.elements.precacheIdleDelay.addEventListener('change', () => this.saveSettings());
        }
        if (this.elements.runPrecacheNow) this.elements.runPrecacheNow.addEventListener('click', () => this.runAggressivePrecache());
        if (this.elements.intelligentCacheClearEnabled) this.elements.intelligentCacheClearEnabled.addEventListener('change', () => this.saveSettings());
        if (this.elements.runCacheClear) this.elements.runCacheClear.addEventListener('click', () => this.runIntelligentCacheClear());
        if (this.elements.cacheCompressionEnabled) this.elements.cacheCompressionEnabled.addEventListener('change', () => this.saveSettings());

        // Profile Optimization listeners
        if (this.elements.profileOptimizationEnabled) this.elements.profileOptimizationEnabled.addEventListener('change', () => this.saveSettings());
        if (this.elements.optimizeIdbCurrent) this.elements.optimizeIdbCurrent.addEventListener('click', () => this.optimizeIndexedDBCurrent());
        if (this.elements.optimizeIdbRecent) this.elements.optimizeIdbRecent.addEventListener('click', () => this.optimizeIndexedDBRecent());
        
        // Save button
        this.elements.saveButton.addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Auto-save on change for checkboxes
        Object.values(this.elements).forEach(element => {
            if (element.type === 'checkbox') {
                element.addEventListener('change', () => {
                    this.saveSettings();
                });
            }
        });
        
        // Auto-save on range input completion
        this.elements.suspendDelay.addEventListener('change', () => {
            this.saveSettings();
        });
        
        this.elements.memoryLimit.addEventListener('change', () => {
            this.saveSettings();
        });
        
        this.elements.extensionMemoryThreshold.addEventListener('change', () => {
            this.saveSettings();
        });
        
        // Tag management range change listeners
        this.elements.tagFrequencyThreshold.addEventListener('change', () => {
            this.saveSettings();
        });
        
        this.elements.maxTagsPerTab.addEventListener('change', () => {
            this.saveSettings();
        });
        
        this.elements.tagInactivityDays.addEventListener('change', () => {
            this.saveSettings();
        });
        
        // Restoration range change listeners
        if (this.elements.liteRestorationThreshold) {
            this.elements.liteRestorationThreshold.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        
        if (this.elements.progressiveRestorationDelay) {
            this.elements.progressiveRestorationDelay.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        
        if (this.elements.maxConcurrentRestorations) {
            this.elements.maxConcurrentRestorations.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        
        if (this.elements.restorationMemoryBuffer) {
            this.elements.restorationMemoryBuffer.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        
        if (this.elements.restorationPriorityMode) {
            this.elements.restorationPriorityMode.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        
        // Context-aware range value display updates
        if (this.elements.contextSwitchDelay) {
            this.elements.contextSwitchDelay.addEventListener('input', () => {
                this.elements.contextSwitchDelayValue.textContent = this.elements.contextSwitchDelay.value;
            });
            
            this.elements.contextSwitchDelay.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        
        if (this.elements.smartWhitelistTimeout) {
            this.elements.smartWhitelistTimeout.addEventListener('input', () => {
                this.elements.smartWhitelistTimeoutValue.textContent = this.elements.smartWhitelistTimeout.value;
            });
            
            this.elements.smartWhitelistTimeout.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        
        // Context-aware select dropdowns
        if (this.elements.workStartHour) {
            this.elements.workStartHour.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        
        if (this.elements.workEndHour) {
            this.elements.workEndHour.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        
        if (this.elements.workModeIntensity) {
            this.elements.workModeIntensity.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        
        if (this.elements.personalModeIntensity) {
            this.elements.personalModeIntensity.addEventListener('change', () => {
                this.saveSettings();
            });
        }
        
        // Work days checkboxes
        Object.values(this.workDayElements).forEach(element => {
            if (element) {
                element.addEventListener('change', () => {
                    this.saveSettings();
                });
            }
        });
    }
    
    async loadSettings() {
        try {
            const response = await this.sendMessage({ action: 'getSettings' });
            if (response.success) {
                const settings = response.data;
                
                // Update form elements with loaded settings
                this.elements.autoSuspend.checked = settings.autoSuspend;
                this.elements.suspendDelay.value = settings.suspendDelay;
                this.elements.suspendDelayValue.textContent = settings.suspendDelay;
                this.elements.memoryThreshold.checked = settings.memoryThreshold;
                this.elements.memoryLimit.value = settings.memoryLimit;
                this.elements.memoryLimitValue.textContent = settings.memoryLimit;
                this.elements.memorySmartMode.checked = settings.memorySmartMode !== false;
                this.elements.protectPinned.checked = settings.protectPinned;
                this.elements.protectAudio.checked = settings.protectAudio;
                this.elements.protectForms.checked = settings.protectForms;
                this.elements.showNotifications.checked = settings.showNotifications;
                this.elements.memoryWarnings.checked = settings.memoryWarnings;

                // Network optimization settings
                if (this.elements.networkOptimizationEnabled) this.elements.networkOptimizationEnabled.checked = settings.networkOptimizationEnabled !== false;
                if (this.elements.dnsPrefetchEnabled) this.elements.dnsPrefetchEnabled.checked = settings.dnsPrefetchEnabled !== false;
                if (this.elements.maxPrefetchHosts) {
                    this.elements.maxPrefetchHosts.value = settings.maxPrefetchHosts || 5;
                    this.elements.maxPrefetchHostsValue.textContent = settings.maxPrefetchHosts || 5;
                }
                if (this.elements.preconnectEnabled) this.elements.preconnectEnabled.checked = settings.preconnectEnabled !== false;
                if (this.elements.preconnectTopN) {
                    this.elements.preconnectTopN.value = settings.preconnectTopN || 2;
                    this.elements.preconnectTopNValue.textContent = settings.preconnectTopN || 2;
                }
                if (this.elements.prefetchOnHoverEnabled) this.elements.prefetchOnHoverEnabled.checked = settings.prefetchOnHoverEnabled !== false;

                // GPU Accel settings
                if (this.elements.gpuAccelEnabled) this.elements.gpuAccelEnabled.checked = settings.gpuAccelEnabled !== false;
                if (this.elements.gpuMode) this.elements.gpuMode.value = settings.gpuMode || 'auto';
                if (this.elements.webglProfile) this.elements.webglProfile.value = settings.webglProfile || 'performance';
                if (this.elements.webglForceHighPerf) this.elements.webglForceHighPerf.checked = settings.webglForceHighPerf !== false;
                if (this.elements.webglAntialias) this.elements.webglAntialias.checked = !!settings.webglAntialias;
                if (this.elements.webglPreserve) this.elements.webglPreserve.checked = !!settings.webglPreserveDrawingBuffer;
                
                // Memory compression settings
                if (this.elements.memoryCompressionEnabled) {
                    this.elements.memoryCompressionEnabled.checked = settings.memoryCompressionEnabled !== false;
                }
                if (this.elements.snapshotScroll) {
                    this.elements.snapshotScroll.checked = settings.snapshotScroll !== false;
                }
                if (this.elements.snapshotForms) {
                    this.elements.snapshotForms.checked = settings.snapshotForms !== false;
                }
                if (this.elements.memoryCompressionAlgo) {
                    this.elements.memoryCompressionAlgo.value = settings.memoryCompressionAlgo || 'gzip';
                }
                
                // Page Acceleration
                if (this.elements.pageAccelEnabled) this.elements.pageAccelEnabled.checked = settings.pageAccelEnabled !== false;
                if (this.elements.lazyOverrideEnabled) this.elements.lazyOverrideEnabled.checked = settings.lazyOverrideEnabled !== false;
                if (this.elements.cssDeferEnabled) this.elements.cssDeferEnabled.checked = settings.cssDeferEnabled || false;
                if (this.elements.cssDeferMax) {
                    this.elements.cssDeferMax.value = settings.cssDeferMax || 2;
                    this.elements.cssDeferMaxValue.textContent = settings.cssDeferMax || 2;
                }
                if (this.elements.jsDeferralEnabled) this.elements.jsDeferralEnabled.checked = settings.jsDeferralEnabled || false;
                if (this.elements.jsDeferralMode) this.elements.jsDeferralMode.value = settings.jsDeferralMode || 'safe';

                // Smart Cache Management
                if (this.elements.smartCacheEnabled) this.elements.smartCacheEnabled.checked = settings.smartCacheEnabled !== false;
                if (this.elements.aggressivePrefetchEnabled) this.elements.aggressivePrefetchEnabled.checked = settings.aggressivePrefetchEnabled !== false;
                if (this.elements.precacheMaxLinks) { this.elements.precacheMaxLinks.value = settings.precacheMaxLinks || 6; this.elements.precacheMaxLinksValue.textContent = settings.precacheMaxLinks || 6; }
                if (this.elements.precacheIdleDelay) { this.elements.precacheIdleDelay.value = settings.precacheIdleDelayMs || 1500; this.elements.precacheIdleDelayValue.textContent = settings.precacheIdleDelayMs || 1500; }
                if (this.elements.intelligentCacheClearEnabled) this.elements.intelligentCacheClearEnabled.checked = settings.intelligentCacheClearEnabled !== false;
                if (this.elements.cacheCompressionEnabled) this.elements.cacheCompressionEnabled.checked = settings.cacheCompressionEnabled || false;

                // Profile Optimization
                if (this.elements.profileOptimizationEnabled) this.elements.profileOptimizationEnabled.checked = settings.profileOptimizationEnabled !== false;

                // Flags Manager
                if (this.elements.flagsManagerEnabled) this.elements.flagsManagerEnabled.checked = settings.flagsManagerEnabled !== false;
                if (this.elements.flagGpuRasterization) this.elements.flagGpuRasterization.checked = !!settings.flagsEnableGpuRasterization;
                if (this.elements.flagParallelDownloading) this.elements.flagParallelDownloading.checked = !!settings.flagsEnableParallelDownloading;
                if (this.elements.flagsExperimentalToggle) this.elements.flagsExperimentalToggle.checked = !!settings.flagsExperimentalToggle;

                // Speed Dashboard
                if (this.elements.speedDashboardEnabled) this.elements.speedDashboardEnabled.checked = settings.speedDashboardEnabled !== false;

                // Bottlenecks
                if (this.elements.bottlenecksEnabled) this.elements.bottlenecksEnabled.checked = settings.bottlenecksEnabled !== false;
                if (this.elements.slowResourceDetection) this.elements.slowResourceDetection.checked = settings.slowResourceDetection !== false;
                if (this.elements.slowResourceSizeKb) { this.elements.slowResourceSizeKb.value = settings.slowResourceSizeKB || 200; this.elements.slowResourceSizeKbValue.textContent = settings.slowResourceSizeKB || 200; }
                if (this.elements.slowResourceDurationMs) { this.elements.slowResourceDurationMs.value = settings.slowResourceDurationMs || 300; this.elements.slowResourceDurationMsValue.textContent = settings.slowResourceDurationMs || 300; }
                if (this.elements.cpuHogWarning) this.elements.cpuHogWarning.checked = settings.cpuHogWarning !== false;
                if (this.elements.cpuLongTaskWindowMs) { this.elements.cpuLongTaskWindowMs.value = settings.cpuLongTaskWindowMs || 10000; this.elements.cpuLongTaskWindowMsValue.textContent = settings.cpuLongTaskWindowMs || 10000; }
                if (this.elements.cpuLongTaskTotalMs) { this.elements.cpuLongTaskTotalMs.value = settings.cpuLongTaskTotalMsThreshold || 1000; this.elements.cpuLongTaskTotalMsValue.textContent = settings.cpuLongTaskTotalMsThreshold || 1000; }
                if (this.elements.memoryLeakAlerts) this.elements.memoryLeakAlerts.checked = settings.memoryLeakAlerts !== false;
                if (this.elements.memoryLeakLookback) { this.elements.memoryLeakLookback.value = settings.memoryLeakLookbackMinutes || 5; this.elements.memoryLeakLookbackValue.textContent = settings.memoryLeakLookbackMinutes || 5; }
                if (this.elements.memoryLeakSlope) { this.elements.memoryLeakSlope.value = settings.memoryLeakSlopeThreshold || 1.0; this.elements.memoryLeakSlopeValue.textContent = settings.memoryLeakSlopeThreshold || 1.0; }
                
                // Extension monitoring settings
                this.elements.extensionMonitoring.checked = settings.extensionMonitoring;
                this.elements.extensionMemoryThreshold.value = settings.extensionMemoryThreshold;
                this.elements.extensionMemoryThresholdValue.textContent = settings.extensionMemoryThreshold;
                this.elements.extensionSuggestions.checked = settings.extensionSuggestions;
                this.elements.extensionNotifications.checked = settings.extensionNotifications;
                
                // Focus mode settings
                this.elements.focusMode.checked = settings.focusMode;
                this.elements.focusAutoSuspend.checked = settings.focusAutoSuspend;
                this.elements.focusMinimalTheme.checked = settings.focusMinimalTheme;
                this.elements.focusRemoveDistractions.checked = settings.focusRemoveDistractions;
                this.elements.focusDisableAnimations.checked = settings.focusDisableAnimations;
                this.elements.focusMemoryOptimization.checked = settings.focusMemoryOptimization;
                this.elements.focusExtensionRecommendations.checked = settings.focusExtensionRecommendations;
                
                // Tag management settings
                this.elements.tagsEnabled.checked = settings.tagsEnabled;
                this.elements.autoTagging.checked = settings.autoTagging;
                this.elements.tagFrequencyThreshold.value = Math.round(settings.tagFrequencyThreshold * 100);
                this.elements.tagFrequencyThresholdValue.textContent = Math.round(settings.tagFrequencyThreshold * 100);
                this.elements.tagBasedSuspension.checked = settings.tagBasedSuspension;
                this.elements.tagSuggestions.checked = settings.tagSuggestions;
                this.elements.maxTagsPerTab.value = settings.maxTagsPerTab;
                this.elements.maxTagsPerTabValue.textContent = settings.maxTagsPerTab;
                this.elements.tagInactivityDays.value = settings.tagInactivityDays;
                this.elements.tagInactivityDaysValue.textContent = settings.tagInactivityDays;
                
                // Tag-based memory policies
                if (this.elements.tagPolicyEnabled) {
                    this.elements.tagPolicyEnabled.checked = settings.tagPolicyEnabled !== false;
                }
                if (this.elements.workTagDelayMultiplier) {
                    this.elements.workTagDelayMultiplier.value = settings.workTagDelayMultiplier || 3;
                    this.elements.workTagDelayMultiplierValue.textContent = settings.workTagDelayMultiplier || 3;
                }
                if (this.elements.referenceNoSuspendDuringWork) {
                    this.elements.referenceNoSuspendDuringWork.checked = settings.referenceNoSuspendDuringWork !== false;
                }
                
                // Memory-aware restoration settings
                if (this.elements.memoryAwareRestoration) {
                    this.elements.memoryAwareRestoration.checked = settings.memoryAwareRestoration !== false;
                    this.elements.liteRestorationThreshold.value = settings.liteRestorationThreshold || 75;
                    this.elements.liteRestorationThresholdValue.textContent = settings.liteRestorationThreshold || 75;
                    this.elements.progressiveRestorationEnabled.checked = settings.progressiveRestorationEnabled !== false;
                    this.elements.progressiveRestorationDelay.value = settings.progressiveRestorationDelay || 1000;
                    this.elements.progressiveRestorationDelayValue.textContent = settings.progressiveRestorationDelay || 1000;
                    this.elements.prioritizeContentOverMedia.checked = settings.prioritizeContentOverMedia !== false;
                    this.elements.liteRestorationDefault.checked = settings.liteRestorationDefault || false;
                    this.elements.restorationPriorityMode.value = settings.restorationPriorityMode || 'smart';
                    this.elements.maxConcurrentRestorations.value = settings.maxConcurrentRestorations || 3;
                    this.elements.maxConcurrentRestorationsValue.textContent = settings.maxConcurrentRestorations || 3;
                    this.elements.restorationMemoryBuffer.value = settings.restorationMemoryBuffer || 5;
                    this.elements.restorationMemoryBufferValue.textContent = settings.restorationMemoryBuffer || 5;
                }
                
                // Context-aware settings
                if (this.elements.contextAwareEnabled) {
                    this.elements.contextAwareEnabled.checked = settings.contextAwareEnabled !== false;
                    this.elements.workHoursEnabled.checked = settings.workHoursEnabled !== false;
                    this.elements.workStartHour.value = settings.workStartHour || 9;
                    this.elements.workEndHour.value = settings.workEndHour || 17;
                    this.elements.workModeStrict.checked = settings.workModeStrict !== false;
                    this.elements.personalModeRelaxed.checked = settings.personalModeRelaxed || false;
                    this.elements.autoAdjustEnabled.checked = settings.autoAdjustEnabled !== false;
                    this.elements.smartWhitelistEnabled.checked = settings.smartWhitelistEnabled !== false;
                    this.elements.workflowDetectionEnabled.checked = settings.workflowDetectionEnabled !== false;
                    this.elements.contextSwitchDelay.value = Math.round((settings.contextSwitchDelay || 300000) / 60000); // Convert ms to minutes
                    this.elements.contextSwitchDelayValue.textContent = Math.round((settings.contextSwitchDelay || 300000) / 60000);
                    this.elements.workModeIntensity.value = settings.workModeIntensity || 'high';
                    this.elements.personalModeIntensity.value = settings.personalModeIntensity || 'medium';
                    this.elements.smartWhitelistTimeout.value = Math.round((settings.smartWhitelistTimeout || 1800000) / 60000); // Convert ms to minutes
                    this.elements.smartWhitelistTimeoutValue.textContent = Math.round((settings.smartWhitelistTimeout || 1800000) / 60000);
                    
                    // Work days checkboxes
                    const workDays = settings.workDays || [1, 2, 3, 4, 5]; // Default Monday-Friday
                    Object.entries(this.workDayElements).forEach(([day, element]) => {
                        if (element) {
                            element.checked = workDays.includes(parseInt(day));
                        }
                    });
                }
                
                console.log('Settings loaded successfully');
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.showStatus('Failed to load settings', 'error');
        }
    }
    
    async saveSettings() {
        try {
            const settings = {
                autoSuspend: this.elements.autoSuspend.checked,
                suspendDelay: parseInt(this.elements.suspendDelay.value),
                memoryThreshold: this.elements.memoryThreshold.checked,
                memoryLimit: parseInt(this.elements.memoryLimit.value),
                memorySmartMode: this.elements.memorySmartMode.checked,
                protectPinned: this.elements.protectPinned.checked,
                protectAudio: this.elements.protectAudio.checked,
                protectForms: this.elements.protectForms.checked,
                showNotifications: this.elements.showNotifications.checked,
                memoryWarnings: this.elements.memoryWarnings.checked,
                // Page Acceleration
                pageAccelEnabled: this.elements.pageAccelEnabled ? this.elements.pageAccelEnabled.checked : true,
                lazyOverrideEnabled: this.elements.lazyOverrideEnabled ? this.elements.lazyOverrideEnabled.checked : true,
                cssDeferEnabled: this.elements.cssDeferEnabled ? this.elements.cssDeferEnabled.checked : false,
                cssDeferMax: this.elements.cssDeferMax ? parseInt(this.elements.cssDeferMax.value) : 2,
                jsDeferralEnabled: this.elements.jsDeferralEnabled ? this.elements.jsDeferralEnabled.checked : false,
                jsDeferralMode: this.elements.jsDeferralMode ? this.elements.jsDeferralMode.value : 'safe',
                // Smart Cache Management
                smartCacheEnabled: this.elements.smartCacheEnabled ? this.elements.smartCacheEnabled.checked : true,
                aggressivePrefetchEnabled: this.elements.aggressivePrefetchEnabled ? this.elements.aggressivePrefetchEnabled.checked : true,
                precacheMaxLinks: this.elements.precacheMaxLinks ? parseInt(this.elements.precacheMaxLinks.value) : 6,
                precacheIdleDelayMs: this.elements.precacheIdleDelay ? parseInt(this.elements.precacheIdleDelay.value) : 1500,
                intelligentCacheClearEnabled: this.elements.intelligentCacheClearEnabled ? this.elements.intelligentCacheClearEnabled.checked : true,
                cacheCompressionEnabled: this.elements.cacheCompressionEnabled ? this.elements.cacheCompressionEnabled.checked : false,
                // Bottlenecks
                bottlenecksEnabled: this.elements.bottlenecksEnabled ? this.elements.bottlenecksEnabled.checked : true,
                slowResourceDetection: this.elements.slowResourceDetection ? this.elements.slowResourceDetection.checked : true,
                slowResourceSizeKB: this.elements.slowResourceSizeKb ? parseInt(this.elements.slowResourceSizeKb.value) : 200,
                slowResourceDurationMs: this.elements.slowResourceDurationMs ? parseInt(this.elements.slowResourceDurationMs.value) : 300,
                cpuHogWarning: this.elements.cpuHogWarning ? this.elements.cpuHogWarning.checked : true,
                cpuLongTaskWindowMs: this.elements.cpuLongTaskWindowMs ? parseInt(this.elements.cpuLongTaskWindowMs.value) : 10000,
                cpuLongTaskTotalMsThreshold: this.elements.cpuLongTaskTotalMs ? parseInt(this.elements.cpuLongTaskTotalMs.value) : 1000,
                memoryLeakAlerts: this.elements.memoryLeakAlerts ? this.elements.memoryLeakAlerts.checked : true,
                memoryLeakLookbackMinutes: this.elements.memoryLeakLookback ? parseInt(this.elements.memoryLeakLookback.value) : 5,
                memoryLeakSlopeThreshold: this.elements.memoryLeakSlope ? parseFloat(this.elements.memoryLeakSlope.value) : 1.0,
                // Flags Manager
                flagsManagerEnabled: this.elements.flagsManagerEnabled ? this.elements.flagsManagerEnabled.checked : true,
                flagsEnableGpuRasterization: this.elements.flagGpuRasterization ? this.elements.flagGpuRasterization.checked : false,
                flagsEnableParallelDownloading: this.elements.flagParallelDownloading ? this.elements.flagParallelDownloading.checked : false,
                flagsExperimentalToggle: this.elements.flagsExperimentalToggle ? this.elements.flagsExperimentalToggle.checked : false,
                // Network optimization
                networkOptimizationEnabled: this.elements.networkOptimizationEnabled ? this.elements.networkOptimizationEnabled.checked : true,
                dnsPrefetchEnabled: this.elements.dnsPrefetchEnabled ? this.elements.dnsPrefetchEnabled.checked : true,
                maxPrefetchHosts: this.elements.maxPrefetchHosts ? parseInt(this.elements.maxPrefetchHosts.value) : 5,
                preconnectEnabled: this.elements.preconnectEnabled ? this.elements.preconnectEnabled.checked : true,
                preconnectTopN: this.elements.preconnectTopN ? parseInt(this.elements.preconnectTopN.value) : 2,
                prefetchOnHoverEnabled: this.elements.prefetchOnHoverEnabled ? this.elements.prefetchOnHoverEnabled.checked : true,
                // GPU Accel
                gpuAccelEnabled: this.elements.gpuAccelEnabled ? this.elements.gpuAccelEnabled.checked : true,
                gpuMode: this.elements.gpuMode ? this.elements.gpuMode.value : 'auto',
                webglProfile: this.elements.webglProfile ? this.elements.webglProfile.value : 'performance',
                webglForceHighPerf: this.elements.webglForceHighPerf ? this.elements.webglForceHighPerf.checked : true,
                webglAntialias: this.elements.webglAntialias ? this.elements.webglAntialias.checked : false,
                webglPreserveDrawingBuffer: this.elements.webglPreserve ? this.elements.webglPreserve.checked : false,
                // Memory compression
                memoryCompressionEnabled: this.elements.memoryCompressionEnabled ? this.elements.memoryCompressionEnabled.checked : true,
                snapshotScroll: this.elements.snapshotScroll ? this.elements.snapshotScroll.checked : true,
                snapshotForms: this.elements.snapshotForms ? this.elements.snapshotForms.checked : true,
                memoryCompressionAlgo: this.elements.memoryCompressionAlgo ? this.elements.memoryCompressionAlgo.value : 'gzip',
                // Extension monitoring settings
                extensionMonitoring: this.elements.extensionMonitoring.checked,
                extensionMemoryThreshold: parseInt(this.elements.extensionMemoryThreshold.value),
                extensionSuggestions: this.elements.extensionSuggestions.checked,
                extensionNotifications: this.elements.extensionNotifications.checked,
                // Focus mode settings
                focusMode: this.elements.focusMode.checked,
                focusAutoSuspend: this.elements.focusAutoSuspend.checked,
                focusMinimalTheme: this.elements.focusMinimalTheme.checked,
                focusRemoveDistractions: this.elements.focusRemoveDistractions.checked,
                focusDisableAnimations: this.elements.focusDisableAnimations.checked,
                focusMemoryOptimization: this.elements.focusMemoryOptimization.checked,
                focusExtensionRecommendations: this.elements.focusExtensionRecommendations.checked,
                // Tag management settings
                tagsEnabled: this.elements.tagsEnabled.checked,
                autoTagging: this.elements.autoTagging.checked,
                tagFrequencyThreshold: parseInt(this.elements.tagFrequencyThreshold.value) / 100,
                tagBasedSuspension: this.elements.tagBasedSuspension.checked,
                tagSuggestions: this.elements.tagSuggestions.checked,
                maxTagsPerTab: parseInt(this.elements.maxTagsPerTab.value),
                tagInactivityDays: parseInt(this.elements.tagInactivityDays.value)
            };
            
            // Tag-based memory policies
            if (this.elements.tagPolicyEnabled) {
                settings.tagPolicyEnabled = this.elements.tagPolicyEnabled.checked;
            }
            if (this.elements.workTagDelayMultiplier) {
                settings.workTagDelayMultiplier = parseInt(this.elements.workTagDelayMultiplier.value);
            }
            if (this.elements.referenceNoSuspendDuringWork) {
                settings.referenceNoSuspendDuringWork = this.elements.referenceNoSuspendDuringWork.checked;
            }
            
            // Add restoration settings if elements exist
            if (this.elements.memoryAwareRestoration) {
                settings.memoryAwareRestoration = this.elements.memoryAwareRestoration.checked;
                settings.liteRestorationThreshold = parseInt(this.elements.liteRestorationThreshold.value);
                settings.progressiveRestorationEnabled = this.elements.progressiveRestorationEnabled.checked;
                settings.progressiveRestorationDelay = parseInt(this.elements.progressiveRestorationDelay.value);
                settings.prioritizeContentOverMedia = this.elements.prioritizeContentOverMedia.checked;
                settings.liteRestorationDefault = this.elements.liteRestorationDefault.checked;
                settings.restorationPriorityMode = this.elements.restorationPriorityMode.value;
                settings.maxConcurrentRestorations = parseInt(this.elements.maxConcurrentRestorations.value);
                settings.restorationMemoryBuffer = parseInt(this.elements.restorationMemoryBuffer.value);
            }
            
            // Add context-aware settings if elements exist
            if (this.elements.contextAwareEnabled) {
                settings.contextAwareEnabled = this.elements.contextAwareEnabled.checked;
                settings.workHoursEnabled = this.elements.workHoursEnabled.checked;
                settings.workStartHour = parseInt(this.elements.workStartHour.value);
                settings.workEndHour = parseInt(this.elements.workEndHour.value);
                settings.workModeStrict = this.elements.workModeStrict.checked;
                settings.personalModeRelaxed = this.elements.personalModeRelaxed.checked;
                settings.autoAdjustEnabled = this.elements.autoAdjustEnabled.checked;
                settings.smartWhitelistEnabled = this.elements.smartWhitelistEnabled.checked;
                settings.workflowDetectionEnabled = this.elements.workflowDetectionEnabled.checked;
                settings.contextSwitchDelay = parseInt(this.elements.contextSwitchDelay.value) * 60000; // Convert minutes to ms
                settings.workModeIntensity = this.elements.workModeIntensity.value;
                settings.personalModeIntensity = this.elements.personalModeIntensity.value;
                settings.smartWhitelistTimeout = parseInt(this.elements.smartWhitelistTimeout.value) * 60000; // Convert minutes to ms
                
                // Work days array
                settings.workDays = [];
                Object.entries(this.workDayElements).forEach(([day, element]) => {
                    if (element && element.checked) {
                        settings.workDays.push(parseInt(day));
                    }
                });
            }
            
            const response = await this.sendMessage({ 
                action: 'updateSettings', 
                settings: settings 
            });
            
            if (response.success) {
                this.showStatus('Settings saved successfully!', 'success');
                console.log('Settings saved:', settings);
            } else {
                throw new Error(response.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showStatus('Failed to save settings', 'error');
        }
    }
    
    showStatus(message, type = 'success') {
        this.elements.saveStatus.textContent = message;
        this.elements.saveStatus.style.color = type === 'success' ? '#4CAF50' : '#f44336';
        
        // Clear status after 3 seconds
        setTimeout(() => {
            this.elements.saveStatus.textContent = '';
        }, 3000);
    }
    
    async loadFocusStats() {
        try {
            const response = await this.sendMessage({ action: 'getFocusState' });
            if (response.success && response.data.stats) {
                const stats = response.data.stats;
                
                // Update total focus time
                let totalMinutes = Math.round(stats.timeActive / 60000);
                if (response.data.focusMode && response.data.startTime) {
                    totalMinutes += Math.round((Date.now() - response.data.startTime) / 60000);
                }
                
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                
                let timeText = '';
                if (hours > 0) {
                    timeText = `${hours}h ${minutes}m`;
                } else {
                    timeText = `${minutes} minutes`;
                }
                
                this.elements.focusTotalTime.textContent = timeText;
                this.elements.focusTotalTabs.textContent = stats.tabsSuspended || 0;
            }
        } catch (error) {
            console.error('Failed to load focus stats:', error);
            this.elements.focusTotalTime.textContent = 'Unavailable';
            this.elements.focusTotalTabs.textContent = 'Unavailable';
        }
    }
    
    async loadTagStats() {
        try {
            // Load all tags
            const allTagsResponse = await this.sendMessage({ action: 'getAllTags' });
            const frequentTagsResponse = await this.sendMessage({ action: 'getFrequentTags' });
            
            // Count tags
            const totalTags = allTagsResponse.success ? allTagsResponse.data.length : 0;
            const frequentTags = frequentTagsResponse.success ? frequentTagsResponse.data.length : 0;
            
            // Count tagged tabs
            let taggedTabsCount = 0;
            if (allTagsResponse.success) {
                const tabsResponse = await this.sendMessage({ action: 'getAllTabs' });
                if (tabsResponse.success) {
                    taggedTabsCount = tabsResponse.data.filter(tab => 
                        tab.tags && tab.tags.length > 0
                    ).length;
                }
            }
            
            // Update UI
            this.elements.totalTagsCount.textContent = totalTags;
            this.elements.frequentTagsCount.textContent = frequentTags;
            this.elements.taggedTabsCount.textContent = taggedTabsCount;
            
        } catch (error) {
            console.error('Failed to load tag stats:', error);
            this.elements.totalTagsCount.textContent = 'Error';
            this.elements.frequentTagsCount.textContent = 'Error';
            this.elements.taggedTabsCount.textContent = 'Error';
        }
    }
    
    async loadRestorationStats() {
        try {
            const response = await this.sendMessage({ action: 'getRestorationStats' });
            if (response.success && this.elements.totalRestoredCount) {
                const stats = response.data;
                
                // Update restoration statistics
                this.elements.totalRestoredCount.textContent = stats.totalRestored || 0;
                this.elements.liteRestoredCount.textContent = stats.liteRestorations || 0;
                this.elements.memoryOptimizedCount.textContent = stats.memoryOptimized || 0;
                
                // Format last restoration time
                if (stats.lastRestorationTime) {
                    const date = new Date(stats.lastRestorationTime);
                    this.elements.lastRestorationTime.textContent = date.toLocaleString();
                } else {
                    this.elements.lastRestorationTime.textContent = 'Never';
                }
            }
        } catch (error) {
            console.error('Failed to load restoration stats:', error);
            if (this.elements.totalRestoredCount) {
                this.elements.totalRestoredCount.textContent = 'Error';
                this.elements.liteRestoredCount.textContent = 'Error';
                this.elements.memoryOptimizedCount.textContent = 'Error';
                this.elements.lastRestorationTime.textContent = 'Error';
            }
        }
    }
    
    async loadContextInfo() {
        try {
            const response = await this.sendMessage({ action: 'getContextInfo' });
            if (response.success && response.data) {
                const contextInfo = response.data;
                
                // Update context status display
                if (this.elements.currentContext) {
                    this.elements.currentContext.textContent = contextInfo.currentContext || 'Personal';
                }
                
                if (this.elements.detectedWorkflow) {
                    this.elements.detectedWorkflow.textContent = contextInfo.detectedWorkflow || 'None';
                }
                
                if (this.elements.lastContextCheck) {
                    const lastCheck = contextInfo.lastContextCheck;
                    if (lastCheck && lastCheck > 0) {
                        const date = new Date(lastCheck);
                        this.elements.lastContextCheck.textContent = date.toLocaleString();
                    } else {
                        this.elements.lastContextCheck.textContent = 'Never';
                    }
                }
                
                console.log('Context info loaded successfully');
            }
        } catch (error) {
            console.debug('Failed to load context info:', error);
            // Set default values if we can't load context info
            if (this.elements.currentContext) {
                this.elements.currentContext.textContent = 'Personal';
            }
            if (this.elements.detectedWorkflow) {
                this.elements.detectedWorkflow.textContent = 'None';
            }
            if (this.elements.lastContextCheck) {
                this.elements.lastContextCheck.textContent = 'Never';
            }
        }
    }

    async loadSpeedDashboard() {
        try {
            const resp = await this.sendMessage({ action: 'getSpeedSessions' });
            if (!resp.success) throw new Error(resp.error || 'Failed');
            const list = resp.data || [];
            this.renderSpeedList(list);
        } catch (e) {
            if (this.elements.speedStatus) {
                this.elements.speedStatus.textContent = 'Failed to load';
                setTimeout(() => { this.elements.speedStatus.textContent=''; }, 2000);
            }
        }
    }

    async clearSpeedDashboard() {
        try {
            const resp = await this.sendMessage({ action: 'clearSpeedSessions' });
            if (!resp.success) throw new Error(resp.error || 'Failed');
            if (this.elements.speedStatus) {
                this.elements.speedStatus.textContent = 'Cleared';
                setTimeout(() => { this.elements.speedStatus.textContent=''; }, 1500);
            }
            this.renderSpeedList([]);
        } catch (e) {
            if (this.elements.speedStatus) {
                this.elements.speedStatus.textContent = 'Failed to clear';
                setTimeout(() => { this.elements.speedStatus.textContent=''; }, 2000);
            }
        }
    }

    renderSpeedList(items) {
        const root = this.elements.speedList;
        if (!root) return;
        root.innerHTML = '';
        if (!items || items.length === 0) {
            const empty = document.createElement('div');
            empty.textContent = 'No data yet. Browse some pages and come back.';
            empty.style.color = '#777';
            root.appendChild(empty);
            return;
        }
        // Limit to 10 for UI
        const slice = items.slice(0, 10);
        slice.forEach(item => {
            const wrap = document.createElement('div');
            wrap.style.border = '1px solid #eee';
            wrap.style.borderRadius = '6px';
            wrap.style.padding = '12px';

            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.gap = '8px';
            const left = document.createElement('div');
            left.style.fontSize = '13px';
            left.style.color = '#333';
            left.textContent = `${new URL(item.url).hostname} — ${new Date(item.ts).toLocaleTimeString()}`;
            const right = document.createElement('div');
            right.style.fontSize = '13px';
            right.innerHTML = `<strong>Score:</strong> <span style="color:${item.score>=80?'#4caf50':item.score>=60?'#ff9800':'#f44336'}">${item.score}</span>`;
            header.appendChild(left); header.appendChild(right);
            wrap.appendChild(header);

            const t = item.timings || {};
            const p = item.paints || {};
            const grid = document.createElement('div');
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            grid.style.gap = '6px';
            grid.style.marginTop = '8px';
            grid.innerHTML = `
                <div><strong>FCP</strong><div>${Math.round(p.firstContentfulPaint||0)} ms</div></div>
                <div><strong>LCP</strong><div>${Math.round(item.lcp||0)} ms</div></div>
                <div><strong>DCL</strong><div>${Math.round(t.domContentLoadedEventEnd||0)} ms</div></div>
                <div><strong>Load</strong><div>${Math.round(t.loadEventEnd||0)} ms</div></div>
            `;
            wrap.appendChild(grid);

            // Bottleneck summary
            if (item.bottlenecks) {
                const bot = document.createElement('div');
                bot.style.marginTop = '6px';
                bot.style.fontSize = '12px';
                bot.style.color = '#555';
                const parts = [];
                if (typeof item.bottlenecks.slowCount === 'number') parts.push(`${item.bottlenecks.slowCount} slow 3rd‑party script(s)`);
                if (typeof item.bottlenecks.cpuLongTaskTotalMs === 'number') parts.push(`Long tasks ${item.bottlenecks.cpuLongTaskTotalMs}ms`);
                if (parts.length > 0) {
                    bot.innerHTML = `<strong>Bottlenecks:</strong> ${parts.join(', ')}`;
                    wrap.appendChild(bot);
                }
            }

            // Waterfall
            const resources = item.resources || [];
            if (resources.length > 0) {
                const waterfall = document.createElement('div');
                waterfall.style.marginTop = '8px';
                const maxDur = Math.max(...resources.map(r => r.duration || 1), 1);
                resources.slice(0, 12).forEach(r => {
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.alignItems = 'center';
                    row.style.gap = '8px';
                    row.style.margin = '2px 0';
                    const label = document.createElement('div');
                    label.style.flex = '0 0 160px';
                    label.style.fontSize = '11px';
                    label.style.color = '#666';
                    label.style.whiteSpace = 'nowrap';
                    label.style.overflow = 'hidden';
                    label.style.textOverflow = 'ellipsis';
                    label.title = r.name;
                    label.textContent = (r.initiatorType||'res')+': '+(r.name || '').replace(/^https?:\/\//,'');
                    const barWrap = document.createElement('div');
                    barWrap.style.flex = '1';
                    barWrap.style.background = '#f1f1f1';
                    barWrap.style.borderRadius = '3px';
                    const bar = document.createElement('div');
                    const w = Math.max(2, Math.round((r.duration / maxDur) * 100));
                    bar.style.width = w + '%';
                    bar.style.height = '8px';
                    bar.style.background = '#2196f3';
                    bar.style.borderRadius = '3px';
                    barWrap.appendChild(bar);
                    const time = document.createElement('div');
                    time.style.flex = '0 0 60px';
                    time.style.textAlign = 'right';
                    time.style.fontSize = '11px';
                    time.textContent = `${r.duration} ms`;
                    row.appendChild(label); row.appendChild(barWrap); row.appendChild(time);
                    waterfall.appendChild(row);
                });
                wrap.appendChild(waterfall);
            }

            root.appendChild(wrap);
        });
    }

    applyWebglPresetToUI(profile) {
        try {
            if (!this.elements.webglAntialias || !this.elements.webglPreserve) return;
            const p = profile || (this.elements.webglProfile ? this.elements.webglProfile.value : 'performance');
            if (p === 'performance') {
                this.elements.webglAntialias.checked = false;
                this.elements.webglPreserve.checked = false;
            } else if (p === 'quality') {
                this.elements.webglAntialias.checked = true;
                this.elements.webglPreserve.checked = true;
            } else {
                // compatibility: minimal
                this.elements.webglAntialias.checked = false;
                this.elements.webglPreserve.checked = false;
            }
        } catch (_) {}
    }

    // Compose flags string and copy to clipboard
    buildFlagsString() {
        const parts = [];
        try {
            if (this.elements.flagGpuRasterization && this.elements.flagGpuRasterization.checked) {
                parts.push('--enable-gpu-rasterization');
            }
            if (this.elements.flagParallelDownloading && this.elements.flagParallelDownloading.checked) {
                parts.push('--enable-features=ParallelDownloading');
            }
            // Experimental suggestions can be added here when toggled; keeping minimal and safe by default
        } catch (_) {}
        return parts.join(' ');
    }

    async runAggressivePrecache() {
        try {
            await this.sendMessage({ action: 'runAggressivePrecache' });
        } catch (_) {}
    }

    async runIntelligentCacheClear() {
        try {
            const resp = await this.sendMessage({ action: 'runIntelligentCacheClear' });
            if (resp && resp.success && this.elements.cacheClearStatus) {
                this.elements.cacheClearStatus.textContent = 'Done';
                setTimeout(()=>{ this.elements.cacheClearStatus.textContent=''; }, 1500);
            }
        } catch (e) {
            if (this.elements.cacheClearStatus) {
                this.elements.cacheClearStatus.textContent = 'Failed';
                setTimeout(()=>{ this.elements.cacheClearStatus.textContent=''; }, 2000);
            }
        }
    }

    async optimizeIndexedDBCurrent() {
        try {
            const resp = await this.sendMessage({ action: 'optimizeIndexedDBCurrent' });
            if (resp && resp.success && this.elements.idbOptStatus) {
                this.elements.idbOptStatus.textContent = 'Optimized current';
                setTimeout(()=>{ this.elements.idbOptStatus.textContent=''; }, 1500);
            }
        } catch (e) {
            if (this.elements.idbOptStatus) {
                this.elements.idbOptStatus.textContent = 'Failed';
                setTimeout(()=>{ this.elements.idbOptStatus.textContent=''; }, 2000);
            }
        }
    }

    async optimizeIndexedDBRecent() {
        try {
            const resp = await this.sendMessage({ action: 'optimizeIndexedDBRecent' });
            if (resp && resp.success && this.elements.idbOptStatus) {
                const n = (resp.data && resp.data.count) || 0;
                this.elements.idbOptStatus.textContent = `Optimized ${n}`;
                setTimeout(()=>{ this.elements.idbOptStatus.textContent=''; }, 1500);
            }
        } catch (e) {
            if (this.elements.idbOptStatus) {
                this.elements.idbOptStatus.textContent = 'Failed';
                setTimeout(()=>{ this.elements.idbOptStatus.textContent=''; }, 2000);
            }
        }
    }

    async copyFlags(fullCommand = false) {
        // Build OS-specific example command
        const os = this.elements.flagsOsSelect ? this.elements.flagsOsSelect.value : 'linux';
        try {
            const flags = this.buildFlagsString();
            let text = flags;
            if (fullCommand) {
                let binary = 'google-chrome';
                if (os === 'windows') {
                    binary = '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"';
                } else if (os === 'mac') {
                    binary = '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"';
                } // linux default
                text = `${binary}${flags ? ' ' + flags : ''}`.trim();
            }
            if (!text) {
                this.showStatus('No flags selected', 'error');
                return;
            }
            await navigator.clipboard.writeText(text);
            if (this.elements.flagsCopyStatus) {
                this.elements.flagsCopyStatus.textContent = 'Copied!';
                setTimeout(() => { this.elements.flagsCopyStatus.textContent = ''; }, 2000);
            }
        } catch (e) {
            this.showStatus('Copy failed', 'error');
        }
    }
    
    sendMessage(message) {
        return new Promise((resolve, reject) => {
            try {
                chrome.runtime.sendMessage(message, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Runtime error in options:', chrome.runtime.lastError.message);
                        // Provide fallback responses for stats queries
                        if (message.action === 'getRestorationStats') {
                            resolve({ 
                                success: true, 
                                data: { totalRestored: 0, liteRestorations: 0, memoryOptimized: 0 }
                            });
                        } else if (message.action === 'getSettings') {
                            resolve({ success: false, error: 'Connection failed' });
                        } else {
                            reject(chrome.runtime.lastError);
                        }
                    } else {
                        resolve(response || { success: false, error: 'No response' });
                    }
                });
            } catch (error) {
                console.error('Failed to send message from options:', error);
                reject(error);
            }
        });
    }
}

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OptionsManager();
});

// Add some helpful information and tips
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard shortcuts info
    const infoSection = document.createElement('div');
    infoSection.className = 'section';
    infoSection.innerHTML = `
        <h2>Tips & Information</h2>
        <p><strong>How it works:</strong> FastBrowse uses Chrome's native tab discarding feature to suspend inactive tabs, freeing up memory while preserving your browsing session.</p>
        <p><strong>Protected tabs:</strong> Pinned tabs, tabs playing audio, and system pages are automatically protected from suspension.</p>
        <p><strong>Memory monitoring:</strong> The extension continuously monitors system memory usage and can automatically suspend tabs when usage gets too high.</p>
        <p><strong>Performance:</strong> This extension is designed to use minimal resources itself - the background script only activates when needed.</p>
        
        <h3>Best Practices</h3>
        <ul>
            <li>Start with a 30-minute suspension delay and adjust based on your browsing habits</li>
            <li>Enable memory threshold monitoring if you frequently run low on RAM</li>
            <li>Pin important tabs that you want to keep active</li>
            <li>Use the popup to manually suspend tabs when needed</li>
        </ul>
        
        <h3>Keyboard Shortcuts</h3>
        <p>You can set up keyboard shortcuts for FastBrowse in Chrome's extension settings:</p>
        <ol>
            <li>Go to <code>chrome://extensions/shortcuts</code></li>
            <li>Find "FastBrowse" in the list</li>
            <li>Set shortcuts for "Suspend all tabs" and "Open popup"</li>
        </ol>
    `;
    
    document.body.appendChild(infoSection);
});