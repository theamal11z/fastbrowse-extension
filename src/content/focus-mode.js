// FastBrowse Focus Mode Content Script
// Removes distractions and applies minimal UI for enhanced focus

class FocusModeManager {
    constructor() {
        this.isEnabled = false;
        this.originalStyles = new Map();
        this.hiddenElements = new Set();
        this.observers = [];
        
        // Site-specific selectors for distraction removal
        this.distractionSelectors = {
            'youtube.com': [
                '#related', // Related videos sidebar
                '[data-testid="comments"]', // Comments section
                '#secondary', // Entire sidebar
                '.ytp-ce-element', // End screen elements
                '.ytp-cards-teaser', // Card teasers
                '#masthead-container nav', // Top navigation
                'ytd-mini-guide-renderer', // Mini guide
                '#guide-button', // Menu button
                '.ytp-videowall-still', // Video wall
                'ytd-compact-video-renderer', // Suggested videos in sidebar
                'ytd-secondary-pyv-renderer' // Up next section
            ],
            'twitter.com': [
                '[data-testid="sidebarColumn"]', // Right sidebar
                '[data-testid="trending"]', // Trending section
                '[aria-label*="Timeline: Trending"]', // Trending timeline
                'aside[aria-label="Who to follow"]', // Who to follow
                '[data-testid="placementTracking"]' // Ads
            ],
            'x.com': [
                '[data-testid="sidebarColumn"]', // Right sidebar
                '[data-testid="trending"]', // Trending section
                '[aria-label*="Timeline: Trending"]', // Trending timeline
                'aside[aria-label="Who to follow"]', // Who to follow
                '[data-testid="placementTracking"]' // Ads
            ],
            'facebook.com': [
                '[data-pagelet="RightRail"]', // Right sidebar
                '[data-pagelet="FeedUnit_0"]', // Suggested posts
                '[role="complementary"]', // Sidebar content
                '.ego_unit', // Sponsored content
                '[data-testid="story_tray"]' // Stories
            ],
            'instagram.com': [
                'div[role="complementary"]', // Suggestions sidebar
                '[data-testid="explore_grid"]', // Explore grid
                'section:has([aria-label*="Suggested"])', // Suggested posts
                'div[class*="suggested"]' // Suggested content
            ],
            'reddit.com': [
                '.premium-banner', // Premium banners
                '.subreddit-rules', // Sidebar rules
                '.trending-subreddits', // Trending section
                '.listingsignupbar', // Signup bar
                '[data-testid="subreddit-sidebar"]', // Subreddit info
                '.promotedlink' // Promoted posts
            ],
            'github.com': [
                '.BorderGrid-cell:last-child', // Right sidebar
                '.js-notice', // Notification banners
                '.marketing-section', // Marketing sections
                '.dashboard-sidebar', // Dashboard sidebar
                '[data-test-selector="trending-repositories"]' // Trending repos
            ],
            'linkedin.com': [
                '.feed-shared-news-module', // LinkedIn news
                '.feed-follows-module', // Who to follow
                '[data-test-app-aware-link]', // Promoted content
                '.artdeco-card:has(.ad-banner-container)', // Ad cards
                '.feed-shared-mini-update-v2' // Mini updates
            ]
        };

        // Global distraction patterns (apply to all sites)
        this.globalDistractions = [
            '[class*="advertisement"]',
            '[class*="ad-"]',
            '[id*="ad-"]',
            '[class*="popup"]',
            '[class*="modal"]:not(.focus-mode-keep)',
            '[class*="notification"]:not(.focus-mode-keep)',
            '[class*="banner"]:not(.focus-mode-keep)',
            '.cookie-banner',
            '.newsletter-signup',
            '.social-share',
            '.related-content',
            '.recommended'
        ];

        this.init();
    }

    async init() {
        try {
            // Check if focus mode is enabled
            await this.loadFocusState();
            
            // Listen for messages from background script
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                try {
                    this.handleMessage(request, sender, sendResponse);
                } catch (error) {
                    console.debug('Error handling message:', error);
                    sendResponse({ success: false, error: error.message });
                }
                return true; // Keep message channel open for async responses
            });

            // Apply focus mode if enabled
            if (this.isEnabled) {
                this.enableFocusMode();
            }

            // Monitor for dynamic content changes
            this.setupContentObserver();
            
        } catch (error) {
            console.debug('Error initializing focus mode:', error);
        }
    }

    async loadFocusState() {
        try {
            const response = await this.sendMessage({ action: 'getFocusState' });
            this.isEnabled = response?.data?.focusMode || false;
        } catch (error) {
            console.debug('Failed to load focus state:', error);
            // Default to disabled state if we can't communicate with background
            this.isEnabled = false;
        }
    }

    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'enableFocusMode':
                this.enableFocusMode();
                sendResponse({ success: true });
                break;
            case 'disableFocusMode':
                this.disableFocusMode();
                sendResponse({ success: true });
                break;
            case 'toggleFocusMode':
                this.isEnabled ? this.disableFocusMode() : this.enableFocusMode();
                sendResponse({ success: true, enabled: this.isEnabled });
                break;
            case 'getFocusState':
                sendResponse({ success: true, enabled: this.isEnabled });
                break;
        }
        return true;
    }

    enableFocusMode() {
        try {
            this.isEnabled = true;
            
            if (document.body) {
                document.body.classList.add('fastbrowse-focus-mode');
            }
            
            // Apply site-specific distraction removal
            this.removeDistractions();
            
            // Apply minimal UI theme
            this.applyMinimalTheme();
            
            // Disable animations
            this.disableAnimations();
            
            // Apply memory-saving techniques (with error handling built-in)
            this.optimizeForMemory();
            
            console.log('FastBrowse Focus Mode: Enabled');
            
        } catch (error) {
            console.debug('Error enabling focus mode:', error);
            // If there's an error, make sure we don't leave things in a broken state
            this.isEnabled = false;
        }
    }

    disableFocusMode() {
        try {
            this.isEnabled = false;
            
            if (document.body) {
                document.body.classList.remove('fastbrowse-focus-mode');
            }
            
            // Restore hidden elements
            this.restoreDistractions();
            
            // Restore original styles (has built-in error handling)
            this.restoreOriginalStyles();
            
            // Re-enable animations
            this.enableAnimations();
            
            console.log('FastBrowse Focus Mode: Disabled');
            
        } catch (error) {
            console.debug('Error disabling focus mode:', error);
            // Even if there's an error, make sure isEnabled is false
            this.isEnabled = false;
        }
    }

    removeDistractions() {
        const hostname = window.location.hostname.replace('www.', '');
        const siteSelectors = this.distractionSelectors[hostname] || [];
        const allSelectors = [...siteSelectors, ...this.globalDistractions];

        allSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (!element.classList.contains('focus-mode-keep')) {
                        this.hideElement(element);
                    }
                });
            } catch (error) {
                console.warn('Invalid selector:', selector, error);
            }
        });
    }

    hideElement(element) {
        if (element && element.style) {
            // Store original display value
            this.originalStyles.set(element, {
                display: element.style.display || getComputedStyle(element).display,
                visibility: element.style.visibility || getComputedStyle(element).visibility
            });
            
            // Hide the element
            element.style.display = 'none !important';
            element.style.visibility = 'hidden !important';
            this.hiddenElements.add(element);
        }
    }

    restoreDistractions() {
        this.hiddenElements.forEach(element => {
            const originalStyles = this.originalStyles.get(element);
            if (originalStyles && element.style) {
                element.style.display = originalStyles.display === 'none' ? '' : originalStyles.display;
                element.style.visibility = originalStyles.visibility === 'hidden' ? '' : originalStyles.visibility;
            }
        });
        
        this.hiddenElements.clear();
        this.originalStyles.clear();
    }

    applyMinimalTheme() {
        // Create and inject minimal theme styles
        const styleId = 'fastbrowse-minimal-theme';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = `
            /* FastBrowse Focus Mode - Minimal Theme */
            .fastbrowse-focus-mode {
                /* Reduce visual noise */
                --bg-primary: #1a1a1a !important;
                --bg-secondary: #2d2d2d !important;
                --text-primary: #e0e0e0 !important;
                --text-secondary: #a0a0a0 !important;
                --accent: #4a9eff !important;
                --border: #404040 !important;
            }

            .fastbrowse-focus-mode * {
                /* Disable transitions and animations for performance */
                transition: none !important;
                animation-duration: 0s !important;
                animation-delay: 0s !important;
            }

            /* Apply minimal styling to common elements */
            .fastbrowse-focus-mode body {
                background-color: var(--bg-primary) !important;
                color: var(--text-primary) !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
            }

            .fastbrowse-focus-mode header,
            .fastbrowse-focus-mode nav,
            .fastbrowse-focus-mode aside {
                background-color: var(--bg-secondary) !important;
                border-color: var(--border) !important;
            }

            /* Reduce visual clutter */
            .fastbrowse-focus-mode *:not(input):not(textarea):not(select) {
                box-shadow: none !important;
                border-radius: 4px !important;
            }

            /* Focus on content */
            .fastbrowse-focus-mode main,
            .fastbrowse-focus-mode article,
            .fastbrowse-focus-mode [role="main"] {
                max-width: 800px !important;
                margin: 0 auto !important;
                background-color: var(--bg-primary) !important;
            }

            /* Simplify buttons and links */
            .fastbrowse-focus-mode button,
            .fastbrowse-focus-mode a {
                background-color: var(--bg-secondary) !important;
                color: var(--text-primary) !important;
                border: 1px solid var(--border) !important;
                text-decoration: none !important;
            }

            .fastbrowse-focus-mode button:hover,
            .fastbrowse-focus-mode a:hover {
                background-color: var(--accent) !important;
                color: white !important;
            }

            /* Hide scrollbars for cleaner look */
            .fastbrowse-focus-mode ::-webkit-scrollbar {
                width: 8px;
            }

            .fastbrowse-focus-mode ::-webkit-scrollbar-track {
                background: var(--bg-primary);
            }

            .fastbrowse-focus-mode ::-webkit-scrollbar-thumb {
                background: var(--border);
                border-radius: 4px;
            }
        `;
    }

    disableAnimations() {
        const animationStyleId = 'fastbrowse-no-animations';
        let animationStyle = document.getElementById(animationStyleId);
        
        if (!animationStyle) {
            animationStyle = document.createElement('style');
            animationStyle.id = animationStyleId;
            document.head.appendChild(animationStyle);
        }

        animationStyle.textContent = `
            *, *::before, *::after {
                animation-duration: 0s !important;
                animation-delay: 0s !important;
                transition-duration: 0s !important;
                transition-delay: 0s !important;
                scroll-behavior: auto !important;
            }
        `;
    }

    enableAnimations() {
        const animationStyle = document.getElementById('fastbrowse-no-animations');
        if (animationStyle) {
            animationStyle.remove();
        }
    }

    optimizeForMemory() {
        try {
            // Reduce image quality for memory savings
            const images = document.querySelectorAll('img');
            
            images.forEach(img => {
                try {
                    // Only process images that have a src and aren't already processed
                    if (!img.src || img.dataset.focusModeProcessed) {
                        return;
                    }
                    
                    // Mark as processed to avoid duplicate processing
                    img.dataset.focusModeProcessed = 'true';
                    
                    // Store original src safely
                    if (!img.dataset.originalSrc) {
                        img.dataset.originalSrc = img.src;
                    }
                    
                    // Reduce image resolution by using smaller versions if available
                    if (img.srcset && img.srcset.trim()) {
                        try {
                            const srcsetParts = img.srcset.split(',');
                            if (srcsetParts.length > 0) {
                                const smallestSrc = srcsetParts[0].trim().split(' ')[0];
                                if (smallestSrc && smallestSrc !== img.src) {
                                    img.src = smallestSrc;
                                }
                            }
                        } catch (srcsetError) {
                            console.debug('Error processing srcset for image:', srcsetError);
                        }
                    }
                    
                } catch (imgError) {
                    console.debug('Error processing individual image:', imgError);
                }
            });

            // Set up lazy loading for off-screen images with better error handling
            if ('IntersectionObserver' in window) {
                try {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            try {
                                if (!entry.isIntersecting && entry.target.tagName === 'IMG') {
                                    const img = entry.target;
                                    
                                    // Only process images with src and not already unloaded
                                    if (img.src && !img.dataset.unloaded && !img.src.startsWith('data:')) {
                                        img.dataset.focusModeOriginalSrc = img.src;
                                        
                                        // Use a minimal 1x1 transparent pixel as placeholder
                                        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                        img.dataset.unloaded = 'true';
                                    }
                                }
                            } catch (entryError) {
                                console.debug('Error processing intersection entry:', entryError);
                            }
                        });
                    }, {
                        // Only trigger when image is significantly out of view
                        rootMargin: '-50px',
                        threshold: 0
                    });

                    // Observe only images that are loaded and have src
                    images.forEach(img => {
                        try {
                            if (img.src && !img.src.startsWith('data:')) {
                                observer.observe(img);
                            }
                        } catch (observeError) {
                            console.debug('Error observing image:', observeError);
                        }
                    });
                    
                    // Store observer for cleanup
                    this.memoryObserver = observer;
                    
                } catch (observerError) {
                    console.debug('Error setting up intersection observer:', observerError);
                }
            }
            
        } catch (error) {
            console.debug('Error in optimizeForMemory:', error);
            // Don't throw the error, just log it and continue
        }
    }

    restoreOriginalStyles() {
        try {
            // Remove custom styles
            const styleElements = document.querySelectorAll('#fastbrowse-minimal-theme, #fastbrowse-no-animations');
            styleElements.forEach(style => {
                try {
                    style.remove();
                } catch (error) {
                    console.debug('Error removing style element:', error);
                }
            });

            // Clean up memory observer
            if (this.memoryObserver) {
                try {
                    this.memoryObserver.disconnect();
                    this.memoryObserver = null;
                } catch (error) {
                    console.debug('Error disconnecting memory observer:', error);
                }
            }

            // Restore original image sources
            const images = document.querySelectorAll('img[data-focus-mode-original-src]');
            images.forEach(img => {
                try {
                    if (img.dataset.focusModeOriginalSrc) {
                        img.src = img.dataset.focusModeOriginalSrc;
                    }
                    
                    // Clean up all focus mode data attributes
                    delete img.dataset.focusModeOriginalSrc;
                    delete img.dataset.unloaded;
                    delete img.dataset.focusModeProcessed;
                    delete img.dataset.originalSrc;
                } catch (error) {
                    console.debug('Error restoring image:', error);
                }
            });
            
        } catch (error) {
            console.debug('Error in restoreOriginalStyles:', error);
        }
    }

    setupContentObserver() {
        try {
            // Monitor for dynamically added content
            const observer = new MutationObserver((mutations) => {
                try {
                    if (this.isEnabled) {
                        let shouldReapply = false;
                        mutations.forEach(mutation => {
                            try {
                                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                                    shouldReapply = true;
                                }
                            } catch (mutationError) {
                                console.debug('Error processing mutation:', mutationError);
                            }
                        });
                        
                        if (shouldReapply) {
                            // Debounce reapplication to avoid excessive processing
                            clearTimeout(this.reapplyTimeout);
                            this.reapplyTimeout = setTimeout(() => {
                                try {
                                    this.removeDistractions();
                                } catch (reapplyError) {
                                    console.debug('Error reapplying distractions:', reapplyError);
                                }
                            }, 500);
                        }
                    }
                } catch (observerError) {
                    console.debug('Error in mutation observer callback:', observerError);
                }
            });

            if (document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                
                this.observers.push(observer);
            } else {
                // If body isn't ready yet, wait for DOM to load
                document.addEventListener('DOMContentLoaded', () => {
                    try {
                        if (document.body) {
                            observer.observe(document.body, {
                                childList: true,
                                subtree: true
                            });
                            
                            this.observers.push(observer);
                        }
                    } catch (error) {
                        console.debug('Error setting up delayed content observer:', error);
                    }
                });
            }
            
        } catch (error) {
            console.debug('Error setting up content observer:', error);
        }
    }

    sendMessage(message) {
        return new Promise((resolve, reject) => {
            try {
                // Check if Chrome runtime is available
                if (!chrome || !chrome.runtime) {
                    reject(new Error('Chrome runtime not available'));
                    return;
                }
                
                chrome.runtime.sendMessage(message, (response) => {
                    if (chrome.runtime.lastError) {
                        console.debug('Chrome runtime error:', chrome.runtime.lastError);
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(response);
                    }
                });
            } catch (error) {
                console.debug('Error sending message:', error);
                reject(error);
            }
        });
    }

    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.disableFocusMode();
    }
}

// Initialize focus mode manager when content script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.fastBrowseFocusMode = new FocusModeManager();
    });
} else {
    window.fastBrowseFocusMode = new FocusModeManager();
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.fastBrowseFocusMode) {
        window.fastBrowseFocusMode.destroy();
    }
});