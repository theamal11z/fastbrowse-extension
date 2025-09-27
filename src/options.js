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