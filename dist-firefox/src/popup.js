// FastBrowse Popup Script
// Handles UI interactions and communication with background script

// Cross-browser shim: map chrome.* to browser.* in Firefox so async/await works
(function(){
  try {
    const isFirefox = typeof browser !== 'undefined' && browser && typeof browser.runtime !== 'undefined';
    if (isFirefox) {
      globalThis.chrome = browser;
    }
  } catch (_) {}
})();

class PopupManager {
    constructor() {
        this.memoryUsageElement = document.getElementById('memory-usage');
        this.tabListElement = document.getElementById('tab-list');
        this.suspendAllButton = document.getElementById('suspend-all');
        this.restoreAllButton = document.getElementById('restore-all');
        this.restoreAllLiteButton = document.getElementById('restore-all-lite');
        this.toggleRestorationModeButton = document.getElementById('toggle-restoration-mode');
        this.restorationStatusElement = document.getElementById('restoration-status');
        this.currentRestorationModeElement = document.getElementById('current-restoration-mode');
        this.restorationProgressElement = document.getElementById('restoration-progress');
        this.liteRestorationsElement = document.getElementById('lite-restorations');
        this.restorationMemoryFillElement = document.getElementById('restoration-memory-fill');
        this.restorationMemoryPercentElement = document.getElementById('restoration-memory-percent');
        this.restorationThresholdLineElement = document.getElementById('restoration-threshold-line');
        this.restorationModeIconElement = document.getElementById('restoration-mode-icon');
        this.autoGroupTabsMainButton = document.getElementById('auto-group-tabs-main');
        this.declutterButton = document.getElementById('declutter');
        
        // Extension monitoring elements
        this.analyzeExtensionsButton = document.getElementById('analyze-extensions');
        this.toggleExtensionsButton = document.getElementById('toggle-extensions');
        this.extensionListElement = document.getElementById('extension-list');
        
        // Focus mode elements
        this.focusToggleButton = document.getElementById('toggle-focus-mode');
        this.focusStateElement = document.getElementById('focus-state');
        this.focusStatsElement = document.getElementById('focus-stats');
        this.focusTimeElement = document.getElementById('focus-time');
        this.focusTabsElement = document.getElementById('focus-tabs');
        this.focusRecommendationsButton = document.getElementById('focus-recommendations');
        
        // Tag management elements
        this.showAllTabsButton = document.getElementById('show-all-tabs');
        this.showFrequentTagsButton = document.getElementById('show-frequent-tags');
        this.showActiveTagsButton = document.getElementById('show-active-tags');
        this.tagFilterSelect = document.getElementById('tag-filter-select');
        this.autoGroupTabsButton = document.getElementById('auto-group-tabs');
        this.toggleTagsButton = document.getElementById('toggle-tags');
        this.closeTagsButton = document.getElementById('close-tags');
        this.tagsSectionElement = document.getElementById('tags-section');
        this.tagsDisplayElement = document.getElementById('tags-display');
        this.frequentTagPillsElement = document.getElementById('frequent-tag-pills');
        this.activeTagPillsElement = document.getElementById('active-tag-pills');
        this.groupSuggestionsElement = document.getElementById('group-suggestions');
        this.relationshipGroupsElement = document.getElementById('relationship-groups');
        this.refreshRelationshipsButton = document.getElementById('refresh-relationships');
        
        // Settings elements
        this.settingsSection = document.getElementById('settings-section');
        this.openSettingsButton = document.getElementById('open-settings');
        this.openSettingsTopButton = document.getElementById('open-settings-top');
        this.saveSettingsButton = document.getElementById('save-settings');
        this.openFullOptionsButton = document.getElementById('open-full-options');
        this.closeSettingsButton = document.getElementById('close-settings');
        this.setAutoSuspend = document.getElementById('set-auto-suspend');
        this.setSuspendDelay = document.getElementById('set-suspend-delay');
        this.setSuspendDelayValue = document.getElementById('set-suspend-delay-value');
        this.setMemorySmartMode = document.getElementById('set-memory-smart-mode');
        this.setMemoryLimit = document.getElementById('set-memory-limit');
        this.setMemoryLimitValue = document.getElementById('set-memory-limit-value');
        this.setTagsEnabled = document.getElementById('set-tags-enabled');
        this.setSmartMute = document.getElementById('set-smart-mute');
        this.setDeclutterStale = document.getElementById('set-declutter-stale');
        this.setDeclutterStaleValue = document.getElementById('set-declutter-stale-value');
        this.setDeclutterWhitelist = document.getElementById('set-declutter-whitelist');
        this.setForecastingEnabled = document.getElementById('set-forecasting-enabled');
        this.setForecastHorizon = document.getElementById('set-forecast-horizon');
        this.setForecastHorizonValue = document.getElementById('set-forecast-horizon-value');
        this.setRelationshipsEnabled = document.getElementById('set-relationships-enabled');
        this.setRelationshipDecay = document.getElementById('set-relationship-decay');
        this.setRelationshipDecayValue = document.getElementById('set-relationship-decay-value');
        this.setFocusMusic = document.getElementById('set-focus-music');
        this.setContextAwareEnabled = document.getElementById('set-context-aware-enabled');
        this.setWorkHoursEnabled = document.getElementById('set-work-hours-enabled');
        this.setWorkModeIntensity = document.getElementById('set-work-mode-intensity');
        this.setWorkflowDetectionEnabled = document.getElementById('set-workflow-detection-enabled');
        this.setSmartWhitelistEnabled = document.getElementById('set-smart-whitelist-enabled');
        
        // Context-aware elements
        this.contextAwareSection = document.getElementById('context-aware-section');
        this.contextStatusBadge = document.getElementById('context-status-badge');
        this.contextMode = document.getElementById('context-mode');
        this.detectedWorkflowPopup = document.getElementById('detected-workflow-popup');
        this.smartWhitelistInfo = document.getElementById('smart-whitelist-info');
        this.whitelistedDomains = document.getElementById('whitelisted-domains');
        this.contextLastCheck = document.getElementById('context-last-check');

        // Declutter modal elements
        this.declutterModal = document.getElementById('declutter-modal');
        this.declutterSummary = document.getElementById('declutter-summary');
        this.declutterDuplicates = document.getElementById('declutter-duplicates');
        this.declutterStale = document.getElementById('declutter-stale');
        this.declutterExecuteButton = document.getElementById('declutter-execute');
        this.declutterCancelButton = document.getElementById('declutter-cancel');
        this.previewFocusMusicButton = document.getElementById('preview-focus-music');
        
        // Toasts
        this.toastContainer = document.getElementById('toast-container');
        
        // Current filter state
        this.currentFilter = 'all';
        this.selectedTagId = null;
        this.currentTabs = [];
        this.allTags = [];
        
        // Restoration state
        this.currentRestorationMode = 'smart'; // 'smart', 'lite', 'full'
        this.restorationStats = null;
        this.restorationUpdateInterval = null;
        
        this.init();

        // UX additions
        this.navOverviewBtn = document.getElementById('tab-overview');
        this.navTagsBtn = document.getElementById('tab-tags');
        this.navSettingsBtn = document.getElementById('tab-settings');
        this.overviewSection = document.getElementById('overview-section');
        this.tabSearch = document.getElementById('tab-search');
    }
    
    async init() {
        try {
            await this.loadMemoryInfo();
            await this.loadTabList();
            await this.loadFocusState();
            await this.loadTagData();
            await this.loadRestorationState();
            await this.loadContextInfo();
            this.setupEventListeners();
            this.setupNavigation();
            this.setupTabSearch();
            this.startRestorationMonitoring();
        } catch (error) {
            console.error('Failed to initialize popup:', error);
            // Still setup event listeners even if other initialization fails
            this.setupEventListeners();
        }
    }
    
    setupEventListeners() {
        this.suspendAllButton.addEventListener('click', () => {
            this.suspendAllTabs();
        });
        
        this.restoreAllButton.addEventListener('click', () => {
            this.restoreAllTabs();
        });
        
        if (this.restoreAllLiteButton) {
            this.restoreAllLiteButton.addEventListener('click', () => {
                this.restoreAllTabsLite();
            });
        }
        
        if (this.toggleRestorationModeButton) {
            this.toggleRestorationModeButton.addEventListener('click', () => {
                this.cycleRestorationMode();
            });
        }
        
        if (this.autoGroupTabsMainButton) {
            this.autoGroupTabsMainButton.addEventListener('click', () => {
                this.autoGroupTabs(this.autoGroupTabsMainButton);
            });
        }
        if (this.declutterButton) {
            this.declutterButton.title = 'Declutter tabs (Shift+Click for quick preview)';
            this.declutterButton.addEventListener('click', (e) => {
                if (e.shiftKey) {
                    this.quickDeclutterToast();
                } else {
                    this.openDeclutterPreview();
                }
            });
        }
        
        this.analyzeExtensionsButton.addEventListener('click', () => {
            this.analyzeExtensions();
        });
        
        this.toggleExtensionsButton.addEventListener('click', () => {
            this.toggleExtensionList();
        });
        
        this.focusToggleButton.addEventListener('click', () => {
            this.toggleFocusMode();
        });
        
        this.focusRecommendationsButton.addEventListener('click', () => {
            this.showFocusRecommendations();
        });
        
        // Navigation tab listeners
        if (this.navOverviewBtn && this.navTagsBtn && this.navSettingsBtn) {
            const setActive = (btn) => {
                [this.navOverviewBtn, this.navTagsBtn, this.navSettingsBtn].forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.navOverviewBtn.setAttribute('aria-selected', btn === this.navOverviewBtn ? 'true' : 'false');
                this.navTagsBtn.setAttribute('aria-selected', btn === this.navTagsBtn ? 'true' : 'false');
                this.navSettingsBtn.setAttribute('aria-selected', btn === this.navSettingsBtn ? 'true' : 'false');
            };
            this.navOverviewBtn.addEventListener('click', () => {
                setActive(this.navOverviewBtn);
                this.showSection('overview');
            });
            this.navTagsBtn.addEventListener('click', () => {
                setActive(this.navTagsBtn);
                this.showSection('tags');
            });
            this.navSettingsBtn.addEventListener('click', () => {
                setActive(this.navSettingsBtn);
                this.showSection('settings');
            });
        }

        // Tag management event listeners
        this.showAllTabsButton.addEventListener('click', () => {
            this.setFilter('all');
        });
        
        this.showFrequentTagsButton.addEventListener('click', () => {
            this.setFilter('frequent');
        });
        
        this.showActiveTagsButton.addEventListener('click', () => {
            this.setFilter('active');
        });
        
        this.tagFilterSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                this.setFilter('tag', e.target.value);
            } else {
                this.setFilter('all');
            }
        });
        
        this.autoGroupTabsButton.addEventListener('click', () => {
            this.autoGroupTabs(this.autoGroupTabsButton);
        });
        
        this.toggleTagsButton.addEventListener('click', () => {
            this.toggleTagsSection();
        });
        
        this.closeTagsButton.addEventListener('click', () => {
            this.closeTagsSection();
        });
        
        if (this.refreshRelationshipsButton) {
            this.refreshRelationshipsButton.addEventListener('click', () => this.loadRelationships());
        }
        
        // Settings open/close
        if (this.openSettingsButton) {
            this.openSettingsButton.addEventListener('click', () => this.toggleSettingsSection(true));
        }
        if (this.openSettingsTopButton) {
            this.openSettingsTopButton.addEventListener('click', () => this.toggleSettingsSection(true));
        }
        if (this.closeSettingsButton) {
            this.closeSettingsButton.addEventListener('click', () => this.toggleSettingsSection(false));
        }
        if (this.setSuspendDelay) {
            this.setSuspendDelay.addEventListener('input', () => {
                this.setSuspendDelayValue.textContent = this.setSuspendDelay.value;
            });
        }
        if (this.setMemoryLimit) {
            this.setMemoryLimit.addEventListener('input', () => {
                this.setMemoryLimitValue.textContent = this.setMemoryLimit.value;
            });
        }
        if (this.saveSettingsButton) {
            this.saveSettingsButton.addEventListener('click', () => this.saveInlineSettings());
        }
        if (this.openFullOptionsButton) {
            this.openFullOptionsButton.addEventListener('click', () => this.openFullOptions());
        }
        if (this.setDeclutterStale) {
            this.setDeclutterStale.addEventListener('input', () => {
                this.setDeclutterStaleValue.textContent = this.setDeclutterStale.value;
            });
        }
        if (this.setForecastHorizon) {
            this.setForecastHorizon.addEventListener('input', () => {
                this.setForecastHorizonValue.textContent = this.setForecastHorizon.value;
            });
        }
        if (this.setRelationshipDecay) {
            this.setRelationshipDecay.addEventListener('input', () => {
                this.setRelationshipDecayValue.textContent = this.setRelationshipDecay.value;
            });
        }
        if (this.previewFocusMusicButton) {
            this.previewFocusMusicButton.addEventListener('click', () => this.previewFocusMusic());
        }
        if (this.declutterExecuteButton) {
            this.declutterExecuteButton.addEventListener('click', () => this.executeDeclutter());
        }
        if (this.declutterCancelButton) {
            this.declutterCancelButton.addEventListener('click', () => this.closeDeclutterModal());
        }
        if (this.declutterModal) {
            this.declutterModal.addEventListener('click', (e) => {
                if (e.target === this.declutterModal) this.closeDeclutterModal();
            });
        }
        
        // Refresh data every 5 seconds
        setInterval(() => {
            this.loadMemoryInfo();
            this.loadTabList();
            this.loadFocusState();
            this.loadTagData();
        }, 5000);
    }
    
    async loadMemoryInfo() {
        try {
            const response = await this.sendMessage({ action: 'getMemoryInfo' });
            if (response.success) {
                const memoryInfo = response.data;
                const totalGB = (memoryInfo.capacity / (1024 * 1024 * 1024)).toFixed(1);
                const usedGB = ((memoryInfo.capacity - memoryInfo.availableCapacity) / (1024 * 1024 * 1024)).toFixed(1);
                const usagePercent = (((memoryInfo.capacity - memoryInfo.availableCapacity) / memoryInfo.capacity) * 100).toFixed(1);
                
                this.memoryUsageElement.textContent = `${usedGB}/${totalGB} GB (${usagePercent}%)`;
                
                // Color code based on usage
                if (usagePercent > 80) {
                    this.memoryUsageElement.style.color = '#f44336';
                } else if (usagePercent > 60) {
                    this.memoryUsageElement.style.color = '#ff9800';
                } else {
                    this.memoryUsageElement.style.color = '#4caf50';
                }
            }
        } catch (error) {
            console.error('Failed to load memory info:', error);
            this.memoryUsageElement.textContent = 'Unable to load';
        }
    }
    
    async loadTabList() {
        try {
            const response = await this.sendMessage({ action: 'getAllTabs' });
            if (response.success) {
                this.renderTabList(response.data);
            }
        } catch (error) {
            console.error('Failed to load tab list:', error);
        }
    }
    
    async loadTagData() {
        try {
            // Load all tags
            const allTagsResponse = await this.sendMessage({ action: 'getAllTags' });
            if (allTagsResponse.success) {
                this.allTags = allTagsResponse.data;
                this.updateTagFilterOptions();
                
                // Show tag toggle icon if tags are available
                if (this.allTags.length > 0) {
                    this.toggleTagsButton.style.display = 'inline-block';
                }
            }
            
            // Load frequent and active tags if tags section is visible
            if (this.tagsSectionElement.style.display !== 'none') {
                await this.updateTagsDisplay();
            }
        } catch (error) {
            console.error('Failed to load tag data:', error);
        }
    }
    
    updateTagFilterOptions() {
        // Update the tag filter select options
        this.tagFilterSelect.innerHTML = '<option value="">Filter by tag...</option>';
        
        this.allTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = `${tag.name} (${tag.usage.total})`;
            this.tagFilterSelect.appendChild(option);
        });
        
        // Show select if there are tags
        if (this.allTags.length > 0) {
            this.tagFilterSelect.style.display = 'inline-block';
        }
    }
    
    renderTabList(tabs) {
        this.currentTabs = tabs; // Store for filtering
        
        // Apply current filter
        let filteredTabs = this.filterTabs(tabs);

        // Apply text search filter
        const q = (this.tabSearch && this.tabSearch.value || '').trim().toLowerCase();
        if (q) {
            filteredTabs = filteredTabs.filter(tab => {
                const title = (tab.title || '').toLowerCase();
                const url = (tab.url || '').toLowerCase();
                return title.includes(q) || url.includes(q);
            });
        }
        
        // Clear existing list
        this.tabListElement.innerHTML = '';
        
        // Sort tabs: active first, then by window, then by index
        filteredTabs.sort((a, b) => {
            if (a.active !== b.active) return b.active - a.active;
            if (a.windowId !== b.windowId) return a.windowId - b.windowId;
            return a.index - b.index;
        });
        
        // Group tabs by window
        const tabsByWindow = filteredTabs.reduce((groups, tab) => {
            if (!groups[tab.windowId]) {
                groups[tab.windowId] = [];
            }
            groups[tab.windowId].push(tab);
            return groups;
        }, {});
        
        // Render each window
        Object.entries(tabsByWindow).forEach(([windowId, windowTabs]) => {
            // Only show tabs from other windows if there are multiple windows
            if (Object.keys(tabsByWindow).length > 1) {
                const windowHeader = document.createElement('div');
                windowHeader.className = 'window-header';
                windowHeader.style.cssText = 'font-weight: bold; font-size: 11px; color: #666; padding: 8px 0 4px 0; border-top: 1px solid #eee; margin-top: 8px;';
                windowHeader.textContent = `Window ${windowId} (${windowTabs.length} tabs)`;
                this.tabListElement.appendChild(windowHeader);
            }
            
            // Render tabs in this window
            windowTabs.forEach(tab => {
                const tabItem = this.createTabItem(tab);
                this.tabListElement.appendChild(tabItem);
            });
        });
    }

    setupNavigation() {
        // Ensure default visible state
        this.showSection('overview');
    }

    showSection(section) {
        // Sections: overview (overviewSection), tags (tagsSectionElement), settings (settingsSection)
        if (this.overviewSection) this.overviewSection.style.display = (section === 'overview') ? 'block' : 'none';
        if (this.tagsSectionElement) this.tagsSectionElement.style.display = (section === 'tags') ? 'block' : 'none';
        if (this.settingsSection) this.settingsSection.style.display = (section === 'settings') ? 'block' : 'none';
        // When switching to settings, load inline settings
        if (section === 'settings') {
            this.loadInlineSettings();
        }
    }

    setupTabSearch() {
        if (!this.tabSearch) return;
        const apply = () => {
            if (this.currentTabs.length > 0) this.renderTabList(this.currentTabs);
        };
        this.tabSearch.addEventListener('input', apply);
    }
    
    // ============================================================================
    // TAG MANAGEMENT METHODS
    // ============================================================================
    
    filterTabs(tabs) {
        switch (this.currentFilter) {
            case 'frequent':
                return tabs.filter(tab => 
                    tab.tags && tab.tags.some(tag => tag.frequency >= 0.3)
                );
                
            case 'active':
                const dayMs = 24 * 60 * 60 * 1000;
                const cutoff = Date.now() - dayMs;
                return tabs.filter(tab => 
                    tab.tags && tab.tags.some(tag => tag.lastUsed > cutoff)
                );
                
            case 'tag':
                return tabs.filter(tab => 
                    tab.tags && tab.tags.some(tag => tag.id === this.selectedTagId)
                );
                
            default:
                return tabs;
        }
    }
    
    setFilter(type, tagId = null) {
        this.currentFilter = type;
        this.selectedTagId = tagId;
        
        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        switch (type) {
            case 'frequent':
                this.showFrequentTagsButton.classList.add('active');
                break;
            case 'active':
                this.showActiveTagsButton.classList.add('active');
                break;
            case 'tag':
                this.tagFilterSelect.value = tagId;
                break;
            default:
                this.showAllTabsButton.classList.add('active');
                this.tagFilterSelect.value = '';
        }
        
        // Re-render tab list with new filter
        if (this.currentTabs.length > 0) {
            this.renderTabList(this.currentTabs);
        }
    }
    
    toggleTagsSection() {
        const isVisible = this.tagsSectionElement.style.display !== 'none';
        this.tagsSectionElement.style.display = isVisible ? 'none' : 'block';
        this.toggleTagsButton.classList.toggle('active', !isVisible);
        
        if (!isVisible) {
            this.updateTagsDisplay();
            this.loadRelationships();
        }
    }
    
    closeTagsSection() {
        this.settingsSection.style.display = 'none';
        this.tagsSectionElement.style.display = 'none';
        this.toggleTagsButton.classList.remove('active');
    }
    
    toggleSettingsSection(show) {
        if (!this.settingsSection) return;
        this.settingsSection.style.display = show ? 'block' : 'none';
        if (show) {
            this.loadInlineSettings();
        }
    }
    
    async updateTagsDisplay() {
        try {
            // Load frequent tags
            const frequentResponse = await this.sendMessage({ action: 'getFrequentTags' });
            if (frequentResponse.success) {
                this.renderTagPills(frequentResponse.data, this.frequentTagPillsElement, 'frequent');
            }
            
            // Load active tags
            const activeResponse = await this.sendMessage({ action: 'getActiveTags' });
            if (activeResponse.success) {
                this.renderTagPills(activeResponse.data, this.activeTagPillsElement, 'active');
            }
        } catch (error) {
            console.error('Failed to update tags display:', error);
        }
    }
    
    renderTagPills(tags, container, type) {
        container.innerHTML = '';
        
        if (tags.length === 0) {
            const noTags = document.createElement('div');
            noTags.textContent = `No ${type} tags found`;
            noTags.style.color = '#999';
            noTags.style.fontSize = '11px';
            container.appendChild(noTags);
            return;
        }
        
        tags.forEach(tag => {
            const pill = document.createElement('div');
            pill.className = `tag-pill ${type === 'frequent' ? 'frequent' : ''} ${tag.priority === 'high' ? 'high-priority' : ''}`;
            pill.style.backgroundColor = tag.color + '20'; // 20% opacity
            pill.style.borderColor = tag.color;
            pill.style.color = tag.color;
            
            const tagName = document.createElement('span');
            tagName.textContent = tag.name;
            pill.appendChild(tagName);
            
            const frequency = document.createElement('span');
            frequency.className = 'tag-frequency';
            frequency.textContent = `${(tag.frequency * 100).toFixed(0)}%`;
            pill.appendChild(frequency);
            
            // Click to filter by this tag
            pill.addEventListener('click', () => {
                this.setFilter('tag', tag.id);
            });
            
            container.appendChild(pill);
        });
    }
    
    async autoGroupTabs(triggerButton = null) {
        const btn = triggerButton || this.autoGroupTabsButton;
        const originalLabel = btn ? btn.textContent : '';
        try {
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Analyzing...';
            }
            
            const response = await this.sendMessage({ action: 'autoGroupTabs' });
            if (response.success) {
                this.renderGroupSuggestions(response.data);
                
                // Show tags section if hidden
                if (this.tagsSectionElement.style.display === 'none') {
                    this.toggleTagsSection();
                }
                
                if (!response.data || response.data.length === 0) {
                    this.showToast('No grouping suggestions found', 'info');
                } else {
                    this.showToast('Grouping suggestions updated', 'success');
                }
            } else {
                throw new Error(response.error || 'Failed to generate suggestions');
            }
        } catch (error) {
            console.error('Failed to auto-group tabs:', error);
            this.showToast(`Failed to auto-group tabs: ${error.message}`, 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalLabel || 'Auto-Group';
            }
        }
    }
    
    renderGroupSuggestions(suggestions) {
        this.groupSuggestionsElement.innerHTML = '';
        
        if (suggestions.length === 0) {
            const noSuggestions = document.createElement('div');
            noSuggestions.textContent = 'No grouping suggestions found';
            noSuggestions.style.color = '#999';
            noSuggestions.style.fontSize = '11px';
            this.groupSuggestionsElement.appendChild(noSuggestions);
            return;
        }
        
        // Show top 3 suggestions
        suggestions.slice(0, 3).forEach(suggestion => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.className = 'group-suggestion';
            
            const header = document.createElement('div');
            header.className = 'group-suggestion-header';
            header.textContent = suggestion.name;
            suggestionDiv.appendChild(header);
            
            const reason = document.createElement('div');
            reason.className = 'group-suggestion-reason';
            reason.textContent = suggestion.reason;
            suggestionDiv.appendChild(reason);
            
            const actions = document.createElement('div');
            actions.className = 'group-suggestion-actions';
            
            const createBtn = document.createElement('button');
            createBtn.className = 'create-group-btn';
            createBtn.textContent = 'Create Group';
            createBtn.addEventListener('click', () => {
                this.createGroupFromSuggestion(suggestion);
            });
            actions.appendChild(createBtn);
            
            const dismissBtn = document.createElement('button');
            dismissBtn.className = 'dismiss-suggestion-btn';
            dismissBtn.textContent = 'Dismiss';
            dismissBtn.addEventListener('click', () => {
                suggestionDiv.remove();
            });
            actions.appendChild(dismissBtn);
            
            suggestionDiv.appendChild(actions);
            this.groupSuggestionsElement.appendChild(suggestionDiv);
        });
    }
    
    async createGroupFromSuggestion(suggestion) {
        try {
            const response = await this.sendMessage({
                action: 'createTagGroup',
                name: suggestion.name,
                tagIds: suggestion.tags ? suggestion.tags.map(tag => tag.id) : [],
                options: {
                    suspendRule: suggestion.priority === 'low' ? 'inactive' : 'never',
                    priority: suggestion.priority || 'medium'
                }
            });
            
            if (response.success) {
                this.showToast(`Group "${suggestion.name}" created successfully`, 'success');
                // Refresh the display
                await this.updateTagsDisplay();
            } else {
                throw new Error(response.error || 'Failed to create group');
            }
        } catch (error) {
            console.error('Failed to create group:', error);
            this.showToast(`Failed to create group: ${error.message}`, 'error');
        }
    }
    
    createTabItem(tab) {
        const tabItem = document.createElement('div');
        let itemClasses = `tab-item ${tab.suspended || tab.discarded ? 'suspended' : ''}`;
        
        // Add tag-based styling
        if (tab.tags && tab.tags.length > 0) {
            itemClasses += ' has-tags';
            
            // Check for frequent tags
            const hasFrequentTag = tab.tags.some(tag => tag.frequency >= 0.3);
            if (hasFrequentTag) {
                itemClasses += ' frequent-tag';
            }
            
            // Check for high priority tags
            const hasHighPriorityTag = tab.tags.some(tag => tag.priority === 'high');
            if (hasHighPriorityTag) {
                itemClasses += ' high-priority-tag';
            }
        }
        
        tabItem.className = itemClasses;
        
        // Tab icon
        const tabIcon = document.createElement('div');
        tabIcon.className = 'tab-icon';
        if (tab.favIconUrl && !tab.favIconUrl.startsWith('chrome://')) {
            tabIcon.style.backgroundImage = `url(${tab.favIconUrl})`;
            tabIcon.style.backgroundSize = 'contain';
            tabIcon.style.backgroundRepeat = 'no-repeat';
            tabIcon.style.backgroundPosition = 'center';
        }
        
        // Tab title
        const tabTitle = document.createElement('div');
        tabTitle.className = 'tab-title';
        tabTitle.textContent = tab.title || 'Loading...';
        tabTitle.title = tab.url;
        
        // Active indicator
        if (tab.active) {
            tabTitle.style.fontWeight = 'bold';
            tabTitle.style.color = '#2196F3';
        }
        
        // Pinned indicator
        if (tab.pinned) {
            tabTitle.textContent = '📌 ' + tabTitle.textContent;
        }
        
        // Audio indicator
        if (tab.audible) {
            tabTitle.textContent = '🔊 ' + tabTitle.textContent;
        }
        
        // Tab actions
        const tabActions = document.createElement('div');
        tabActions.className = 'tab-actions';
        
        if (tab.suspended || tab.discarded) {
            const restoreButton = document.createElement('button');
            restoreButton.textContent = 'Restore';
            restoreButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.restoreTab(tab.id);
            });
            tabActions.appendChild(restoreButton);
        } else if (!tab.active) {
            const suspendButton = document.createElement('button');
            suspendButton.textContent = 'Suspend';
            suspendButton.className = 'secondary';
            suspendButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.suspendTab(tab.id);
            });
            tabActions.appendChild(suspendButton);
        }
        
        // Click to switch to tab
        // Add tag display
        if (tab.tags && tab.tags.length > 0) {
            const tabTagsContainer = document.createElement('div');
            tabTagsContainer.className = 'tab-tags';
            
            tab.tags.slice(0, 3).forEach(tag => { // Show max 3 tags
                const tagElement = document.createElement('span');
                tagElement.className = 'tab-tag';
                tagElement.textContent = tag.name;
                tagElement.style.borderColor = tag.color;
                tagElement.title = `Frequency: ${(tag.frequency * 100).toFixed(1)}% | Priority: ${tag.priority}`;
                tabTagsContainer.appendChild(tagElement);
            });
            
            if (tab.tags.length > 3) {
                const moreTag = document.createElement('span');
                moreTag.className = 'tab-tag';
                moreTag.textContent = `+${tab.tags.length - 3}`;
                moreTag.title = `${tab.tags.length - 3} more tags`;
                tabTagsContainer.appendChild(moreTag);
            }
            
            tabTitle.appendChild(tabTagsContainer);
        }
        
        tabItem.addEventListener('click', () => {
            this.switchToTab(tab.id);
        });
        
        tabItem.appendChild(tabIcon);
        tabItem.appendChild(tabTitle);
        tabItem.appendChild(tabActions);
        
        // Enhance for memory-aware restoration
        return this.enhanceTabItemForRestoration(tabItem, tab);
    }
    
    async suspendTab(tabId) {
        try {
            await this.sendMessage({ action: 'suspendTab', tabId: tabId });
            setTimeout(() => this.loadTabList(), 500); // Refresh after a delay
        } catch (error) {
            console.error('Failed to suspend tab:', error);
        }
    }
    
    async restoreTab(tabId, mode = null) {
        try {
            const action = mode === 'lite' ? 'restoreTabLite' : 
                          mode === 'full' ? 'restoreTabFull' : 'restoreTab';
            await this.sendMessage({ action, tabId, options: { forceMode: mode } });
            setTimeout(() => {
                this.loadTabList();
                this.updateRestorationStatus();
            }, 500); // Refresh after a delay
        } catch (error) {
            console.error('Failed to restore tab:', error);
        }
    }
    
    async suspendAllTabs() {
        try {
            this.suspendAllButton.disabled = true;
            this.suspendAllButton.textContent = 'Suspending...';
            
            await this.sendMessage({ action: 'suspendAllTabs' });
            
            setTimeout(() => {
                this.loadTabList();
                this.suspendAllButton.disabled = false;
                this.suspendAllButton.textContent = 'Suspend All Tabs';
            }, 1000);
        } catch (error) {
            console.error('Failed to suspend all tabs:', error);
            this.suspendAllButton.disabled = false;
            this.suspendAllButton.textContent = 'Suspend All Tabs';
        }
    }
    
    async restoreAllTabs() {
        try {
            this.restoreAllButton.disabled = true;
            this.restoreAllButton.textContent = 'Restoring...';
            
            // Use current restoration mode settings
            const options = this.currentRestorationMode === 'lite' ? { forceMode: 'lite' } :
                           this.currentRestorationMode === 'full' ? { forceMode: 'full' } : {};
            
            await this.sendMessage({ action: 'restoreAllTabs', options });
            
            // Show restoration status during operation
            this.showRestorationStatus();
            
            setTimeout(() => {
                this.loadTabList();
                this.updateRestorationStatus();
                this.restoreAllButton.disabled = false;
                this.restoreAllButton.textContent = 'Restore All';
            }, 1000);
        } catch (error) {
            console.error('Failed to restore all tabs:', error);
            this.restoreAllButton.disabled = false;
            this.restoreAllButton.textContent = 'Restore All';
        }
    }
    
    async restoreAllTabsLite() {
        try {
            this.restoreAllLiteButton.disabled = true;
            this.restoreAllLiteButton.textContent = 'Restoring...';
            
            await this.sendMessage({ 
                action: 'restoreAllTabs', 
                options: { forceMode: 'lite' }
            });
            
            this.showRestorationStatus();
            
            setTimeout(() => {
                this.loadTabList();
                this.updateRestorationStatus();
                this.restoreAllLiteButton.disabled = false;
                this.restoreAllLiteButton.textContent = 'Restore (Lite)';
            }, 1000);
        } catch (error) {
            console.error('Failed to restore all tabs in lite mode:', error);
            this.restoreAllLiteButton.disabled = false;
            this.restoreAllLiteButton.textContent = 'Restore (Lite)';
        }
    }
    
    
    async switchToTab(tabId) {
        try {
            await chrome.tabs.update(tabId, { active: true });
            const tab = await chrome.tabs.get(tabId);
            await chrome.windows.update(tab.windowId, { focused: true });
            window.close(); // Close popup
        } catch (error) {
            console.error('Failed to switch to tab:', error);
        }
    }
    
    populateMusicOptions(tracks) {
        // Disable music controls when offscreen API is not available (e.g., Firefox)
        try {
            const offscreenSupported = !!(chrome && chrome.offscreen && (chrome.offscreen.createDocument || chrome.offscreen.hasDocument));
            if (!offscreenSupported) {
                if (this.setFocusMusic) {
                    this.setFocusMusic.innerHTML = '';
                    const opt = document.createElement('option');
                    opt.value = 'none';
                    opt.textContent = 'None (not supported in Firefox)';
                    this.setFocusMusic.appendChild(opt);
                    this.setFocusMusic.disabled = true;
                }
                if (this.previewFocusMusicButton) this.previewFocusMusicButton.disabled = true;
                return;
            }
        } catch (_) {}
        if (!this.setFocusMusic) return;
        this.setFocusMusic.innerHTML = '';
        const add = (value, label) => {
            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = label;
            this.setFocusMusic.appendChild(opt);
        };
        add('none', 'None');
        tracks.forEach(t => add(t.path, t.label));
    }

    async loadInlineSettings() {
        try {
            const response = await this.sendMessage({ action: 'getSettings' });
            if (response.success) {
                const s = response.data;
                if (this.setAutoSuspend) this.setAutoSuspend.checked = s.autoSuspend;
                if (this.setSuspendDelay) {
                    this.setSuspendDelay.value = s.suspendDelay;
                    this.setSuspendDelayValue.textContent = s.suspendDelay;
                }
                if (this.setMemorySmartMode) this.setMemorySmartMode.checked = s.memorySmartMode !== false;
                if (this.setMemoryLimit) {
                    this.setMemoryLimit.value = s.memoryLimit;
                    this.setMemoryLimitValue.textContent = s.memoryLimit;
                }
                if (this.setTagsEnabled) this.setTagsEnabled.checked = s.tagsEnabled;
                if (this.setSmartMute) this.setSmartMute.checked = s.smartMuteEnabled !== false;
                if (this.setDeclutterStale) {
                    this.setDeclutterStale.value = s.declutterStaleMinutes ?? 120;
                    this.setDeclutterStaleValue.textContent = this.setDeclutterStale.value;
                }
                if (this.setDeclutterWhitelist) {
                    const list = Array.isArray(s.declutterWhitelist) ? s.declutterWhitelist : [];
                    this.setDeclutterWhitelist.value = list.join(', ');
                }
                if (this.setForecastingEnabled) this.setForecastingEnabled.checked = s.forecastingEnabled !== false;
                if (this.setForecastHorizon) {
                    this.setForecastHorizon.value = s.forecastHorizonMinutes ?? 3;
                    this.setForecastHorizonValue.textContent = this.setForecastHorizon.value;
                }
                if (this.setRelationshipsEnabled) this.setRelationshipsEnabled.checked = s.relationshipsEnabled !== false;
                if (this.setRelationshipDecay) {
                    this.setRelationshipDecay.value = s.relationshipDecayMinutes ?? 60;
                    this.setRelationshipDecayValue.textContent = this.setRelationshipDecay.value;
                }

                // Build music list (fallback to known tracks, try optional tracks.json)
                const defaultTracks = [
                    { path: 'assets/music/FocusFlow.mp3', label: 'FocusFlow 1' },
                    { path: 'assets/music/FocusFlow_2.mp3', label: 'FocusFlow 2' },
                    { path: 'assets/music/FocusFlow_3.mp3', label: 'FocusFlow 3' }
                ];
                try {
                    const resp = await fetch(chrome.runtime.getURL('assets/music/tracks.json'));
                    if (resp.ok) {
                        const extra = await resp.json();
                        if (Array.isArray(extra)) {
                            // Expect array of {path, label}
                            extra.forEach(item => {
                                if (item && item.path && item.label && !defaultTracks.find(d => d.path === item.path)) {
                                    defaultTracks.push(item);
                                }
                            });
                        }
                    }
                } catch (_) { /* no tracks.json, ignore */ }
                this.populateMusicOptions(defaultTracks);
                if (this.setFocusMusic) this.setFocusMusic.value = s.focusModeMusic || 'none';
                
                // Context-aware settings
                if (this.setContextAwareEnabled) this.setContextAwareEnabled.checked = s.contextAwareEnabled !== false;
                if (this.setWorkHoursEnabled) this.setWorkHoursEnabled.checked = s.workHoursEnabled !== false;
                if (this.setWorkModeIntensity) this.setWorkModeIntensity.value = s.workModeIntensity || 'high';
                if (this.setWorkflowDetectionEnabled) this.setWorkflowDetectionEnabled.checked = s.workflowDetectionEnabled !== false;
                if (this.setSmartWhitelistEnabled) this.setSmartWhitelistEnabled.checked = s.smartWhitelistEnabled !== false;
            }
        } catch (e) {
            console.error('Failed to load inline settings:', e);
            this.showToast('Failed to load settings', 'error');
        }
    }

    async quickDeclutterToast() {
        try {
            const resp = await this.sendMessage({ action: 'declutterPreview' });
            if (!resp.success) throw new Error(resp.error || 'Preview failed');
            const { counts } = resp.data;
            const msg = `Declutter candidates: ${counts.duplicates} duplicates, ${counts.stale} stale`;
            this.showActionToast(msg, counts.duplicates + counts.stale > 0 ? 'success' : 'info',
                counts.duplicates + counts.stale > 0 ? 'Run' : null,
                () => this.executeDeclutter()
            );
        } catch (e) {
            console.error('Quick declutter failed:', e);
            this.showToast('Quick declutter failed', 'error');
        }
    }

    async openDeclutterPreview() {
        try {
            const resp = await this.sendMessage({ action: 'declutterPreview' });
            if (!resp.success) throw new Error(resp.error || 'Preview failed');
            const { counts, duplicates, stale } = resp.data;
            this.declutterSummary.textContent = `${counts.duplicates} duplicate tabs, ${counts.stale} stale tabs found`;
            this.declutterDuplicates.innerHTML = '';
            duplicates.slice(0, 50).forEach(item => {
                const div = document.createElement('div');
                div.className = 'declutter-item';
                div.textContent = `${item.title || 'Untitled'} — ${item.url}`;
                this.declutterDuplicates.appendChild(div);
            });
            this.declutterStale.innerHTML = '';
            stale.slice(0, 50).forEach(item => {
                const div = document.createElement('div');
                div.className = 'declutter-item';
                div.textContent = `${item.title || 'Untitled'} — ${item.url}`;
                this.declutterStale.appendChild(div);
            });
            this.declutterModal.style.display = 'flex';
        } catch (e) {
            console.error('Declutter preview failed:', e);
            this.showToast('Failed to generate declutter preview', 'error');
        }
    }

    closeDeclutterModal() {
        if (this.declutterModal) this.declutterModal.style.display = 'none';
    }

    async executeDeclutter() {
        try {
            this.declutterExecuteButton.disabled = true;
            const resp = await this.sendMessage({ action: 'declutterExecute', options: { closeDuplicates: true, suspendStale: true } });
            if (!resp.success) throw new Error(resp.error || 'Declutter failed');
            this.showToast('Declutter complete. Undo available for a short time.', 'success');
            this.closeDeclutterModal();
            // Offer undo via a temporary inline button
            const undoBtn = document.createElement('button');
            undoBtn.textContent = 'Undo Declutter';
            undoBtn.className = 'secondary';
            undoBtn.style.marginLeft = '8px';
            this.declutterButton.insertAdjacentElement('afterend', undoBtn);
            const removeUndo = () => { if (undoBtn && undoBtn.parentNode) undoBtn.parentNode.removeChild(undoBtn); };
            undoBtn.addEventListener('click', async () => {
                try { await this.sendMessage({ action: 'declutterUndo' }); this.showToast('Declutter undone', 'success'); } catch (_) {}
                removeUndo();
            });
            setTimeout(removeUndo, 15000);
        } catch (e) {
            console.error('Declutter execution failed:', e);
            this.showToast('Declutter failed', 'error');
        } finally {
            this.declutterExecuteButton.disabled = false;
        }
    }

    async previewFocusMusic() {
        try {
            const track = this.setFocusMusic ? this.setFocusMusic.value : 'none';
            const response = await this.sendMessage({ action: 'previewFocusMusic', track, durationMs: 15000 });
            if (response.success) {
                if (track === 'none') {
                    this.showToast('Stopped preview', 'info');
                } else {
                    this.showToast('Playing preview...', 'success');
                }
            }
        } catch (e) {
            console.error('Failed to preview music:', e);
            this.showToast('Failed to preview', 'error');
        }
    }

    async saveInlineSettings() {
        try {
            const newSettings = {};
            if (this.setAutoSuspend) newSettings.autoSuspend = this.setAutoSuspend.checked;
            if (this.setSuspendDelay) newSettings.suspendDelay = parseInt(this.setSuspendDelay.value);
            if (this.setMemorySmartMode) newSettings.memorySmartMode = this.setMemorySmartMode.checked;
            if (this.setMemoryLimit) newSettings.memoryLimit = parseInt(this.setMemoryLimit.value);
            if (this.setTagsEnabled) newSettings.tagsEnabled = this.setTagsEnabled.checked;
            if (this.setSmartMute) newSettings.smartMuteEnabled = this.setSmartMute.checked;
            if (this.setDeclutterStale) newSettings.declutterStaleMinutes = parseInt(this.setDeclutterStale.value);
            if (this.setDeclutterWhitelist) {
                const raw = this.setDeclutterWhitelist.value || '';
                const list = raw.split(',').map(s => s.trim()).filter(Boolean);
                newSettings.declutterWhitelist = list;
            }
            if (this.setForecastingEnabled) newSettings.forecastingEnabled = this.setForecastingEnabled.checked;
            if (this.setForecastHorizon) newSettings.forecastHorizonMinutes = parseInt(this.setForecastHorizon.value);
            if (this.setRelationshipsEnabled) newSettings.relationshipsEnabled = this.setRelationshipsEnabled.checked;
            if (this.setRelationshipDecay) newSettings.relationshipDecayMinutes = parseInt(this.setRelationshipDecay.value);
            if (this.setFocusMusic) newSettings.focusModeMusic = this.setFocusMusic.value;
            
            // Context-aware settings
            if (this.setContextAwareEnabled) newSettings.contextAwareEnabled = this.setContextAwareEnabled.checked;
            if (this.setWorkHoursEnabled) newSettings.workHoursEnabled = this.setWorkHoursEnabled.checked;
            if (this.setWorkModeIntensity) newSettings.workModeIntensity = this.setWorkModeIntensity.value;
            if (this.setWorkflowDetectionEnabled) newSettings.workflowDetectionEnabled = this.setWorkflowDetectionEnabled.checked;
            if (this.setSmartWhitelistEnabled) newSettings.smartWhitelistEnabled = this.setSmartWhitelistEnabled.checked;
            
            const response = await this.sendMessage({ action: 'updateSettings', settings: newSettings });
            if (response.success) {
                this.showToast('Settings saved', 'success');
                this.toggleSettingsSection(false);
            } else {
                throw new Error(response.error || 'Unknown error');
            }
        } catch (e) {
            console.error('Failed to save inline settings:', e);
            this.showToast('Failed to save settings', 'error');
        }
    }
    
    openFullOptions() {
        try {
            // Open the full options page in a new tab
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                // Fallback for older Chrome versions
                window.open(chrome.runtime.getURL('src/options.html'));
            }
        } catch (error) {
            console.error('Failed to open options page:', error);
            this.showToast('Failed to open options page', 'error');
        }
    }

    async loadRelationships() {
        try {
            const resp = await this.sendMessage({ action: 'getTabRelationships' });
            if (!resp.success) throw new Error(resp.error || 'Failed to load relationships');
            this.renderRelationships(resp.data || []);
        } catch (e) {
            console.error('Failed to load relationships:', e);
            if (this.relationshipGroupsElement) this.relationshipGroupsElement.innerHTML = '<div style="color:#999; font-size:11px;">No relationships found</div>';
        }
    }

    renderRelationships(groups) {
        if (!this.relationshipGroupsElement) return;
        this.relationshipGroupsElement.innerHTML = '';
        if (!groups || groups.length === 0) {
            this.relationshipGroupsElement.innerHTML = '<div style="color:#999; font-size:11px;">No relationships found</div>';
            return;
        }
        groups.slice(0, 5).forEach((group, idx) => {
            const box = document.createElement('div');
            box.style.cssText = 'border:1px solid #e0e0e0; border-radius:6px; padding:8px; margin-bottom:6px;';
            const header = document.createElement('div');
            header.style.cssText = 'font-weight:bold; font-size:12px; color:#333; margin-bottom:4px;';
            header.textContent = `Group ${idx+1} (${group.tabs.length} tabs)`;
            box.appendChild(header);
            const list = document.createElement('div');
            group.tabs.slice(0, 5).forEach(t => {
                const item = document.createElement('div');
                item.style.cssText = 'font-size:11px; color:#555; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;';
                item.textContent = t.title || t.url || 'Untitled';
                item.title = t.url;
                list.appendChild(item);
            });
            if (group.tabs.length > 5) {
                const more = document.createElement('div');
                more.style.cssText = 'font-size:11px; color:#999;';
                more.textContent = `+${group.tabs.length - 5} more`;
                list.appendChild(more);
            }
            box.appendChild(list);
            const actions = document.createElement('div');
            actions.style.cssText = 'margin-top:6px; display:flex; gap:6px;';
            const focusBtn = document.createElement('button');
            focusBtn.textContent = 'Focus Group';
            focusBtn.addEventListener('click', async () => {
                try {
                    await this.sendMessage({ action: 'focusRelatedTabs', tabIds: group.tabIds });
                    this.showToast('Focused group', 'success');
                } catch (e) {
                    this.showToast('Failed to focus group', 'error');
                }
            });
            const suspendBtn = document.createElement('button');
            suspendBtn.className = 'secondary';
            suspendBtn.textContent = 'Suspend Group';
            suspendBtn.addEventListener('click', async () => {
                try {
                    await this.sendMessage({ action: 'suspendRelatedTabs', tabIds: group.tabIds.filter(id => !group.tabs.find(t => t.id === id)?.active) });
                    this.showToast('Group suspended', 'success');
                    setTimeout(() => this.loadTabList(), 500);
                } catch (e) {
                    this.showToast('Failed to suspend group', 'error');
                }
            });
            actions.appendChild(focusBtn);
            actions.appendChild(suspendBtn);
            box.appendChild(actions);
            this.relationshipGroupsElement.appendChild(box);
        });
    }

    async analyzeExtensions() {
        try {
            this.analyzeExtensionsButton.disabled = true;
            this.analyzeExtensionsButton.textContent = 'Analyzing...';
            
            const response = await this.sendMessage({ action: 'getExtensionSuggestions' });
            if (response.success) {
                this.renderExtensionSuggestions(response.data);
                this.extensionListElement.style.display = 'block';
                this.toggleExtensionsButton.textContent = 'Hide';
            }
        } catch (error) {
            console.error('Failed to analyze extensions:', error);
        } finally {
            this.analyzeExtensionsButton.disabled = false;
            this.analyzeExtensionsButton.textContent = 'Analyze Extensions';
        }
    }
    
    toggleExtensionList() {
        const isVisible = this.extensionListElement.style.display !== 'none';
        this.extensionListElement.style.display = isVisible ? 'none' : 'block';
        this.toggleExtensionsButton.textContent = isVisible ? 'Show' : 'Hide';
    }
    
    renderExtensionSuggestions(suggestions) {
        this.extensionListElement.innerHTML = '';
        
        if (suggestions.length === 0) {
            const noSuggestions = document.createElement('div');
            noSuggestions.textContent = 'No optimization suggestions found. Your extensions look good!';
            noSuggestions.style.cssText = 'padding: 12px; text-align: center; color: #4caf50; font-size: 12px;';
            this.extensionListElement.appendChild(noSuggestions);
            return;
        }
        
        suggestions.forEach(suggestion => {
            const extensionItem = this.createExtensionItem(suggestion);
            this.extensionListElement.appendChild(extensionItem);
        });
    }
    
    createExtensionItem(suggestion) {
        const extensionItem = document.createElement('div');
        extensionItem.className = `extension-item ${suggestion.severity}-memory`;
        
        if (suggestion.action === 'urgent_disable') {
            extensionItem.classList.add('suggestion');
        }
        
        const extensionInfo = document.createElement('div');
        extensionInfo.className = 'extension-info';
        
        const extensionName = document.createElement('div');
        extensionName.className = 'extension-name';
        extensionName.textContent = suggestion.extensionName;
        
        const extensionMemory = document.createElement('div');
        extensionMemory.className = 'extension-memory';
        extensionMemory.textContent = `~${suggestion.memoryUsage}MB estimated`;
        
        const extensionReason = document.createElement('div');
        extensionReason.className = 'extension-reason';
        extensionReason.textContent = suggestion.reason;
        
        extensionInfo.appendChild(extensionName);
        extensionInfo.appendChild(extensionMemory);
        extensionInfo.appendChild(extensionReason);
        
        const extensionActions = document.createElement('div');
        extensionActions.className = 'extension-actions';
        
        if (suggestion.canDisable) {
            const disableButton = document.createElement('button');
            disableButton.textContent = 'Disable';
            disableButton.className = 'disable-btn';
            disableButton.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.disableExtension(suggestion.extensionId, suggestion.extensionName);
                // Refresh the analysis after disabling
                setTimeout(() => this.analyzeExtensions(), 1000);
            });
            extensionActions.appendChild(disableButton);
        }
        
        // Add severity indicator
        const severityIndicator = document.createElement('span');
        severityIndicator.style.cssText = 'font-size: 10px; padding: 2px 4px; border-radius: 2px; margin-left: 4px;';
        
        switch (suggestion.severity) {
            case 'high':
                severityIndicator.textContent = 'HIGH';
                severityIndicator.style.backgroundColor = '#f44336';
                severityIndicator.style.color = 'white';
                break;
            case 'medium':
                severityIndicator.textContent = 'MED';
                severityIndicator.style.backgroundColor = '#ff9800';
                severityIndicator.style.color = 'white';
                break;
            case 'low':
                severityIndicator.textContent = 'LOW';
                severityIndicator.style.backgroundColor = '#2196F3';
                severityIndicator.style.color = 'white';
                break;
        }
        
        extensionActions.appendChild(severityIndicator);
        
        extensionItem.appendChild(extensionInfo);
        extensionItem.appendChild(extensionActions);
        
        return extensionItem;
    }
    
    async disableExtension(extensionId, extensionName) {
        try {
            const confirmed = confirm(`Are you sure you want to disable "${extensionName}"?\n\nThis will disable the extension to free up memory. You can re-enable it later from Chrome's extension settings.`);
            
            if (!confirmed) return;
            
            const response = await this.sendMessage({ 
                action: 'disableExtension', 
                extensionId: extensionId 
            });
            
            if (response.success) {
                this.showToast(`Extension "${extensionName}" disabled`, 'success');
            }
        } catch (error) {
            console.error('Failed to disable extension:', error);
            this.showToast(`Failed to disable extension: ${error.message}`, 'error');
        }
    }
    
    // Focus Mode Methods
    async loadFocusState() {
        try {
            const response = await this.sendMessage({ action: 'getFocusState' });
            if (response.success) {
                const data = response.data;
                this.updateFocusUI(data.focusMode, data.stats, data.startTime);
            }
        } catch (error) {
            console.error('Failed to load focus state:', error);
        }
    }
    
    updateFocusUI(isActive, stats, startTime) {
        // Update state indicator
        this.focusStateElement.textContent = isActive ? 'ON' : 'OFF';
        this.focusStateElement.classList.toggle('active', isActive);
        
        // Update button
        this.focusToggleButton.textContent = isActive ? 'Disable Focus Mode' : 'Enable Focus Mode';
        this.focusToggleButton.classList.toggle('active', isActive);
        
        // Show/hide stats
        if (isActive && stats) {
            this.focusStatsElement.style.display = 'block';
            
            // Calculate active time
            let totalTime = stats.timeActive;
            if (startTime) {
                totalTime += Date.now() - startTime;
            }
            const minutes = Math.round(totalTime / 60000);
            
            this.focusTimeElement.textContent = minutes > 0 ? `${minutes}m` : '<1m';
            this.focusTabsElement.textContent = stats.tabsSuspended || 0;
            
            // Show recommendations button if focus mode is active
            this.focusRecommendationsButton.style.display = 'inline-block';
        } else {
            this.focusStatsElement.style.display = 'none';
            this.focusRecommendationsButton.style.display = 'none';
        }
    }
    
    async toggleFocusMode() {
        try {
            this.focusToggleButton.disabled = true;
            this.focusToggleButton.textContent = 'Switching...';
            
            const response = await this.sendMessage({ action: 'toggleFocusMode' });
            if (response.success) {
                // UI will be updated by the refresh interval
                setTimeout(() => this.loadFocusState(), 500);
            } else {
                throw new Error(response.error || 'Failed to toggle focus mode');
            }
        } catch (error) {
            console.error('Failed to toggle focus mode:', error);
            this.showToast(`Failed to toggle focus mode: ${error.message}`, 'error');
        } finally {
            this.focusToggleButton.disabled = false;
        }
    }
    
    async showFocusRecommendations() {
        try {
            const response = await this.sendMessage({ action: 'getFocusExtensionRecommendations' });
            if (response.success) {
                this.renderRecommendationsModal(response.data);
            }
        } catch (error) {
            console.error('Failed to load focus recommendations:', error);
            this.showToast(`Failed to load recommendations: ${error.message}`, 'error');
        }
    }
    
    renderRecommendationsModal(recommendations) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'recommendations-modal';
        
        const content = document.createElement('div');
        content.className = 'recommendations-content';
        
        const header = document.createElement('h3');
        header.textContent = 'Recommended Focus Extensions';
        header.style.marginTop = '0';
        content.appendChild(header);
        
        const description = document.createElement('p');
        description.textContent = 'These extensions can enhance your focus mode experience by blocking additional distractions and improving productivity.';
        description.style.fontSize = '14px';
        description.style.color = '#666';
        content.appendChild(description);
        
        // Add recommendations
        recommendations.forEach(rec => {
            const item = document.createElement('div');
            item.className = `recommendation-item ${rec.installed ? 'installed' : ''}`;
            
            const info = document.createElement('div');
            info.className = 'recommendation-info';
            
            const name = document.createElement('div');
            name.className = 'recommendation-name';
            name.textContent = rec.name;
            
            const desc = document.createElement('div');
            desc.className = 'recommendation-desc';
            desc.textContent = rec.description;
            
            const category = document.createElement('span');
            category.className = 'recommendation-category';
            category.textContent = rec.category.replace('-', ' ');
            
            info.appendChild(name);
            info.appendChild(desc);
            info.appendChild(category);
            
            const actions = document.createElement('div');
            actions.className = 'recommendation-actions';
            
            if (rec.installed) {
                const status = document.createElement('span');
                status.textContent = rec.enabled ? '✓ Enabled' : '⚠ Disabled';
                status.style.fontSize = '12px';
                status.style.color = rec.enabled ? '#4CAF50' : '#ff9800';
                actions.appendChild(status);
            } else {
                const installBtn = document.createElement('button');
                installBtn.textContent = 'Install';
                installBtn.className = 'install-btn';
                installBtn.addEventListener('click', () => {
                    chrome.tabs.create({ url: rec.webstoreUrl });
                });
                actions.appendChild(installBtn);
            }
            
            item.appendChild(info);
            item.appendChild(actions);
            content.appendChild(item);
        });
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.marginTop = '16px';
        closeBtn.style.width = '100%';
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        content.appendChild(closeBtn);
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    // Toast helper
    showActionToast(message, type = 'info', actionLabel = null, actionHandler = null, timeout = 4000) {
        try {
            if (!this.toastContainer) return;
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            const span = document.createElement('span');
            span.textContent = message;
            toast.appendChild(span);
            if (actionLabel && typeof actionHandler === 'function') {
                const actBtn = document.createElement('button');
                actBtn.className = 'toast-close';
                actBtn.style.marginLeft = '8px';
                actBtn.textContent = actionLabel;
                actBtn.addEventListener('click', () => {
                    actionHandler();
                    if (this.toastContainer.contains(toast)) this.toastContainer.removeChild(toast);
                });
                toast.appendChild(actBtn);
            }
            const closeBtn = document.createElement('button');
            closeBtn.className = 'toast-close';
            closeBtn.textContent = '×';
            closeBtn.addEventListener('click', () => {
                if (this.toastContainer.contains(toast)) {
                    this.toastContainer.removeChild(toast);
                }
            });
            toast.appendChild(closeBtn);
            this.toastContainer.appendChild(toast);
            setTimeout(() => {
                if (this.toastContainer.contains(toast)) {
                    this.toastContainer.removeChild(toast);
                }
            }, timeout);
        } catch (e) { console.warn('Action toast failed:', e); }
    }
    showToast(message, type = 'info', timeout = 3000) {
        try {
            if (!this.toastContainer) return;
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'toast-close';
            closeBtn.textContent = '×';
            closeBtn.addEventListener('click', () => {
                if (this.toastContainer.contains(toast)) {
                    this.toastContainer.removeChild(toast);
                }
            });
            toast.appendChild(closeBtn);
            
            this.toastContainer.appendChild(toast);
            
            setTimeout(() => {
                if (this.toastContainer.contains(toast)) {
                    this.toastContainer.removeChild(toast);
                }
            }, timeout);
        } catch (e) {
            // Silent fallback if DOM not ready
            console.warn('Toast failed:', e);
        }
    }

    // Memory-Aware Restoration Methods
    async loadRestorationState() {
        try {
            // Load restoration stats
            const statsResponse = await this.sendMessage({ action: 'getRestorationStats' });
            if (statsResponse && statsResponse.success) {
                this.restorationStats = statsResponse.data;
            }
            
            // Load current memory state
            await this.updateMemoryForRestoration();
            
            // Update UI
            this.updateRestorationModeUI();
            
        } catch (error) {
            console.error('Failed to load restoration state:', error);
            // Initialize with default values if connection fails
            this.restorationStats = {
                totalRestored: 0,
                liteRestorations: 0,
                memoryOptimized: 0,
                activeRestorations: 0
            };
            this.updateRestorationModeUI();
        }
    }
    
    async updateRestorationStatus() {
        try {
            const [statsResponse, memoryResponse] = await Promise.allSettled([
                this.sendMessage({ action: 'getRestorationStats' }).catch(e => ({ success: false, error: e.message })),
                this.sendMessage({ action: 'getMemoryInfo' }).catch(e => ({ success: false, error: e.message }))
            ]);
            
            // Handle restoration stats response
            if (statsResponse.status === 'fulfilled' && statsResponse.value.success) {
                this.restorationStats = statsResponse.value.data;
            }
            
            // Handle memory response
            if (memoryResponse.status === 'fulfilled' && memoryResponse.value.success && this.restorationMemoryFillElement) {
                const memoryInfo = memoryResponse.value.data;
                const usagePercent = ((memoryInfo.capacity - memoryInfo.availableCapacity) / memoryInfo.capacity) * 100;
                
                this.restorationMemoryFillElement.style.width = `${usagePercent}%`;
                this.restorationMemoryPercentElement.textContent = `${usagePercent.toFixed(1)}%`;
            }
            
            this.updateRestorationStatsUI();
            
        } catch (error) {
            console.error('Failed to update restoration status:', error);
        }
    }
    
    async updateMemoryForRestoration() {
        try {
            const response = await this.sendMessage({ action: 'getMemoryInfo' });
            if (response.success && this.restorationMemoryFillElement) {
                const memoryInfo = response.data;
                const usagePercent = ((memoryInfo.capacity - memoryInfo.availableCapacity) / memoryInfo.capacity) * 100;
                
                this.restorationMemoryFillElement.style.width = `${usagePercent}%`;
                this.restorationMemoryPercentElement.textContent = `${usagePercent.toFixed(1)}%`;
                
                // Update threshold line position based on settings
                const settings = await this.sendMessage({ action: 'getSettings' });
                if (settings.success) {
                    const threshold = settings.data.liteRestorationThreshold || 75;
                    this.restorationThresholdLineElement.style.left = `${threshold}%`;
                }
            }
        } catch (error) {
            console.error('Failed to update memory for restoration:', error);
        }
    }
    
    cycleRestorationMode() {
        const modes = ['smart', 'lite', 'full'];
        const currentIndex = modes.indexOf(this.currentRestorationMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.currentRestorationMode = modes[nextIndex];
        
        this.updateRestorationModeUI();
        this.showToast(`Restoration mode: ${this.currentRestorationMode}`, 'info');
    }
    
    updateRestorationModeUI() {
        if (!this.currentRestorationModeElement) return;
        
        // Update mode text and icon
        this.currentRestorationModeElement.textContent = this.currentRestorationMode;
        
        const modeIcons = {
            'smart': '🧠',  // brain
            'lite': '⚡',   // lightning
            'full': '🚀'    // rocket
        };
        
        if (this.restorationModeIconElement) {
            this.restorationModeIconElement.textContent = modeIcons[this.currentRestorationMode];
        }
        
        // Update button titles
        const descriptions = {
            'smart': 'Smart mode - automatically chooses best restoration method',
            'lite': 'Lite mode - always restore with memory optimization',
            'full': 'Full mode - always restore without restrictions'
        };
        
        if (this.toggleRestorationModeButton) {
            this.toggleRestorationModeButton.title = descriptions[this.currentRestorationMode];
        }
    }
    
    updateRestorationStatsUI() {
        if (!this.restorationStats || !this.restorationProgressElement) return;
        
        this.restorationProgressElement.textContent = 
            `${this.restorationStats.totalRestored || 0}/${this.restorationStats.totalRestored || 0}`;
        
        if (this.liteRestorationsElement) {
            this.liteRestorationsElement.textContent = this.restorationStats.liteRestorations || 0;
        }
    }
    
    showRestorationStatus() {
        if (this.restorationStatusElement) {
            this.restorationStatusElement.style.display = 'block';
        }
    }
    
    hideRestorationStatus() {
        if (this.restorationStatusElement) {
            this.restorationStatusElement.style.display = 'none';
        }
    }
    
    startRestorationMonitoring() {
        // Update restoration status every 2 seconds during active operations
        this.restorationUpdateInterval = setInterval(() => {
            try {
                if (this.restorationStats && this.restorationStats.activeRestorations > 0) {
                    this.updateRestorationStatus().catch(error => {
                        console.debug('Restoration status update failed:', error);
                    });
                }
            } catch (error) {
                console.debug('Restoration monitoring error:', error);
            }
        }, 2000);
    }
    
    // Enhanced tab item creation to include restoration indicators
    enhanceTabItemForRestoration(tabItem, tab) {
        // Add restoration indicator
        const indicator = document.createElement('div');
        indicator.className = 'restoration-indicator';
        tabItem.appendChild(indicator);
        
        // Check if tab is in lite mode (with proper error handling)
        chrome.tabs.sendMessage(tab.id, { action: 'getLiteModeStatus' }, (response) => {
            if (chrome.runtime.lastError) {
                // Ignore connection errors for tabs without content script
                console.debug('Tab', tab.id, 'does not have lite mode content script loaded');
                return;
            }
            if (response && response.success && response.data.active) {
                tabItem.classList.add('lite-mode');
            }
        });
        
        // Add restoration mode controls to tab actions
        const tabActions = tabItem.querySelector('.tab-actions');
        if (tabActions && (tab.suspended || tab.discarded)) {
            // Replace simple restore with mode-aware restore
            const existingRestore = tabActions.querySelector('button');
            if (existingRestore && existingRestore.textContent === 'Restore') {
                existingRestore.remove();
                
                // Add restore dropdown or multiple buttons based on space
                const restoreBtn = document.createElement('button');
                restoreBtn.textContent = 'Restore';
                restoreBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.restoreTab(tab.id, this.currentRestorationMode === 'smart' ? null : this.currentRestorationMode);
                });
                
                const liteBtn = document.createElement('button');
                liteBtn.textContent = '⚡';
                liteBtn.className = 'secondary';
                liteBtn.title = 'Restore in lite mode';
                liteBtn.style.fontSize = '10px';
                liteBtn.style.padding = '2px 4px';
                liteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.restoreTab(tab.id, 'lite');
                });
                
                tabActions.appendChild(restoreBtn);
                tabActions.appendChild(liteBtn);
            }
        }
        
        return tabItem;
    }
    
    async loadContextInfo() {
        try {
            const response = await this.sendMessage({ action: 'getContextInfo' });
            if (response.success && response.data) {
                const contextInfo = response.data;
                
                // Show the context-aware section if enabled
                if (contextInfo.contextAwareEnabled && this.contextAwareSection) {
                    this.contextAwareSection.style.display = 'block';
                    
                    // Update context mode display
                    const currentContext = contextInfo.currentContext || 'personal';
                    const detectedWorkflow = contextInfo.detectedWorkflow || null;
                    
                    if (this.contextStatusBadge) {
                        this.contextStatusBadge.textContent = currentContext.charAt(0).toUpperCase() + currentContext.slice(1);
                        // Change badge color based on context
                        if (currentContext === 'work') {
                            this.contextStatusBadge.style.background = '#ff9800';
                        } else {
                            this.contextStatusBadge.style.background = '#9c27b0';
                        }
                    }
                    
                    if (this.contextMode) {
                        this.contextMode.textContent = currentContext.charAt(0).toUpperCase() + currentContext.slice(1);
                        this.contextMode.style.color = currentContext === 'work' ? '#ff9800' : '#9c27b0';
                    }
                    
                    if (this.detectedWorkflowPopup) {
                        this.detectedWorkflowPopup.textContent = detectedWorkflow 
                            ? detectedWorkflow.charAt(0).toUpperCase() + detectedWorkflow.slice(1)
                            : 'None';
                    }
                    
                    // Show smart whitelist info if there are active domains
                    if (contextInfo.smartWhitelist && contextInfo.smartWhitelist.length > 0) {
                        const activeDomains = contextInfo.smartWhitelist.filter(([domain, expiry]) => 
                            Date.now() < expiry
                        );
                        
                        if (activeDomains.length > 0 && this.smartWhitelistInfo) {
                            this.smartWhitelistInfo.style.display = 'block';
                            if (this.whitelistedDomains) {
                                this.whitelistedDomains.textContent = activeDomains.length;
                            }
                        }
                    }
                    
                    // Update last check time
                    if (this.contextLastCheck) {
                        const lastCheck = contextInfo.lastContextCheck;
                        if (lastCheck && lastCheck > 0) {
                            const date = new Date(lastCheck);
                            const now = Date.now();
                            const diffMs = now - lastCheck;
                            const diffMinutes = Math.floor(diffMs / 60000);
                            
                            if (diffMinutes < 1) {
                                this.contextLastCheck.textContent = 'Just now';
                            } else if (diffMinutes < 60) {
                                this.contextLastCheck.textContent = `${diffMinutes}m ago`;
                            } else {
                                this.contextLastCheck.textContent = date.toLocaleTimeString();
                            }
                        } else {
                            this.contextLastCheck.textContent = 'Never';
                        }
                    }
                    
                    console.log('Context info loaded:', contextInfo);
                } else if (this.contextAwareSection) {
                    // Hide the section if context-aware features are disabled
                    this.contextAwareSection.style.display = 'none';
                }
            }
        } catch (error) {
            console.debug('Failed to load context info:', error);
            // Hide the context section if we can't load context info
            if (this.contextAwareSection) {
                this.contextAwareSection.style.display = 'none';
            }
        }
    }

    sendMessage(message) {
        return new Promise((resolve, reject) => {
            try {
                chrome.runtime.sendMessage(message, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Runtime error:', chrome.runtime.lastError.message);
                        // Try to provide a fallback response for some actions
                        if (message.action === 'getRestorationStats') {
                            resolve({ 
                                success: true, 
                                data: { totalRestored: 0, liteRestorations: 0, memoryOptimized: 0, activeRestorations: 0 }
                            });
                        } else {
                            reject(chrome.runtime.lastError);
                        }
                    } else if (!response) {
                        console.warn('No response received for action:', message.action);
                        // Provide fallback responses for non-critical actions
                        if (message.action === 'getRestorationStats' || message.action === 'getTabPriorities') {
                            resolve({ success: true, data: {} });
                        } else {
                            reject(new Error('No response from background script'));
                        }
                    } else {
                        resolve(response);
                    }
                });
            } catch (error) {
                console.error('Failed to send message:', error);
                reject(error);
            }
        });
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});