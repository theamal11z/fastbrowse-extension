// FastBrowse Popup Script
// Handles UI interactions and communication with background script

class PopupManager {
    constructor() {
        this.memoryUsageElement = document.getElementById('memory-usage');
        this.tabListElement = document.getElementById('tab-list');
        this.suspendAllButton = document.getElementById('suspend-all');
        this.restoreAllButton = document.getElementById('restore-all');
        this.autoGroupTabsMainButton = document.getElementById('auto-group-tabs-main');
        
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
        
        // Current filter state
        this.currentFilter = 'all';
        this.selectedTagId = null;
        this.currentTabs = [];
        this.allTags = [];
        
        this.init();
    }
    
    async init() {
        await this.loadMemoryInfo();
        await this.loadTabList();
        await this.loadFocusState();
        await this.loadTagData();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.suspendAllButton.addEventListener('click', () => {
            this.suspendAllTabs();
        });
        
        this.restoreAllButton.addEventListener('click', () => {
            this.restoreAllTabs();
        });
        
        if (this.autoGroupTabsMainButton) {
            this.autoGroupTabsMainButton.addEventListener('click', () => {
                this.autoGroupTabs();
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
            this.autoGroupTabs();
        });
        
        this.toggleTagsButton.addEventListener('click', () => {
            this.toggleTagsSection();
        });
        
        this.closeTagsButton.addEventListener('click', () => {
            this.closeTagsSection();
        });
        
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
        }
    }
    
    closeTagsSection() {
        this.tagsSectionElement.style.display = 'none';
        this.toggleTagsButton.classList.remove('active');
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
    
    async autoGroupTabs() {
        try {
            this.autoGroupTabsButton.disabled = true;
            this.autoGroupTabsButton.textContent = 'Analyzing...';
            
            const response = await this.sendMessage({ action: 'autoGroupTabs' });
            if (response.success) {
                this.renderGroupSuggestions(response.data);
                
                // Show tags section if hidden
                if (this.tagsSectionElement.style.display === 'none') {
                    this.toggleTagsSection();
                }
            } else {
                throw new Error(response.error || 'Failed to generate suggestions');
            }
        } catch (error) {
            console.error('Failed to auto-group tabs:', error);
            alert(`Failed to auto-group tabs: ${error.message}`);
        } finally {
            this.autoGroupTabsButton.disabled = false;
            this.autoGroupTabsButton.textContent = 'Auto-Group';
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
                alert(`Group "${suggestion.name}" created successfully!`);
                // Refresh the display
                await this.updateTagsDisplay();
            } else {
                throw new Error(response.error || 'Failed to create group');
            }
        } catch (error) {
            console.error('Failed to create group:', error);
            alert(`Failed to create group: ${error.message}`);
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
        
        return tabItem;
    }
    
    async suspendTab(tabId) {
        try {
            await this.sendMessage({ action: 'suspendTab', tabId: tabId });
            setTimeout(() => this.loadTabList(), 500); // Refresh after a delay
        } catch (error) {
            console.error('Failed to suspend tab:', error);
        }
    }
    
    async restoreTab(tabId) {
        try {
            await this.sendMessage({ action: 'restoreTab', tabId: tabId });
            setTimeout(() => this.loadTabList(), 500); // Refresh after a delay
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
            
            await this.sendMessage({ action: 'restoreAllTabs' });
            
            setTimeout(() => {
                this.loadTabList();
                this.restoreAllButton.disabled = false;
                this.restoreAllButton.textContent = 'Restore All';
            }, 1000);
        } catch (error) {
            console.error('Failed to restore all tabs:', error);
            this.restoreAllButton.disabled = false;
            this.restoreAllButton.textContent = 'Restore All';
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
                // Show success message
                const notification = document.createElement('div');
                notification.textContent = `Extension "${extensionName}" disabled successfully`;
                notification.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #4caf50; color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; z-index: 1000;';
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 3000);
            }
        } catch (error) {
            console.error('Failed to disable extension:', error);
            alert(`Failed to disable extension: ${error.message}`);
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
            alert(`Failed to toggle focus mode: ${error.message}`);
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
            alert(`Failed to load recommendations: ${error.message}`);
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
    
    sendMessage(message) {
        return new Promise((resolve, reject) => {
            try {
                chrome.runtime.sendMessage(message, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Runtime error:', chrome.runtime.lastError);
                        reject(chrome.runtime.lastError);
                    } else if (!response) {
                        console.error('No response received');
                        reject(new Error('No response from background script'));
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