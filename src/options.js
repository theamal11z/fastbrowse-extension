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
            totalTagsCount: document.getElementById('total-tags-count'),
            frequentTagsCount: document.getElementById('frequent-tags-count'),
            taggedTabsCount: document.getElementById('tagged-tabs-count'),
            saveButton: document.getElementById('save'),
            saveStatus: document.getElementById('save-status')
        };
        
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        await this.loadFocusStats();
        await this.loadTagStats();
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
    
    sendMessage(message) {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(message, resolve);
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