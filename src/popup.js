// FastBrowse Popup Script
// Handles UI interactions and communication with background script

class PopupManager {
    constructor() {
        this.memoryUsageElement = document.getElementById('memory-usage');
        this.tabListElement = document.getElementById('tab-list');
        this.suspendAllButton = document.getElementById('suspend-all');
        this.restoreAllButton = document.getElementById('restore-all');
        
        // Extension monitoring elements
        this.analyzeExtensionsButton = document.getElementById('analyze-extensions');
        this.toggleExtensionsButton = document.getElementById('toggle-extensions');
        this.extensionListElement = document.getElementById('extension-list');
        
        this.init();
    }
    
    async init() {
        await this.loadMemoryInfo();
        await this.loadTabList();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.suspendAllButton.addEventListener('click', () => {
            this.suspendAllTabs();
        });
        
        this.restoreAllButton.addEventListener('click', () => {
            this.restoreAllTabs();
        });
        
        this.analyzeExtensionsButton.addEventListener('click', () => {
            this.analyzeExtensions();
        });
        
        this.toggleExtensionsButton.addEventListener('click', () => {
            this.toggleExtensionList();
        });
        
        // Refresh data every 5 seconds
        setInterval(() => {
            this.loadMemoryInfo();
            this.loadTabList();
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
    
    renderTabList(tabs) {
        // Clear existing list
        this.tabListElement.innerHTML = '';
        
        // Sort tabs: active first, then by window, then by index
        tabs.sort((a, b) => {
            if (a.active !== b.active) return b.active - a.active;
            if (a.windowId !== b.windowId) return a.windowId - b.windowId;
            return a.index - b.index;
        });
        
        // Group tabs by window
        const tabsByWindow = tabs.reduce((groups, tab) => {
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
    
    createTabItem(tab) {
        const tabItem = document.createElement('div');
        tabItem.className = `tab-item ${tab.suspended || tab.discarded ? 'suspended' : ''}`;
        
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