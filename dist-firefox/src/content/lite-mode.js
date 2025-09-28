// FastBrowse Lite Mode Content Script
// Blocks auto-playing videos, animations, and heavy media for memory optimization during tab restoration

// Cross-browser shim: map chrome.* to browser.* in Firefox so async/await works
(function(){
  try {
    const isFirefox = typeof browser !== 'undefined' && browser && typeof browser.runtime !== 'undefined';
    if (isFirefox) {
      globalThis.chrome = browser;
    }
  } catch (_) {}
})();

class LiteModeManager {
    constructor() {
        this.isLiteModeActive = false;
        this.blockedElements = new Set();
        this.originalStyles = new WeakMap();
        this.mediaObserver = null;
        this.animationObserver = null;
        this.injectedStyles = null;
        
        // Media selectors for different types of heavy content
        this.mediaSelectors = {
            videos: 'video, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="dailymotion"], iframe[src*="twitch"]',
            audio: 'audio',
            animations: '.gif, img[src*=".gif"], [class*="animate"], [class*="animation"]',
            autoplay: '[autoplay], [data-autoplay="true"]',
            heavyImages: 'img[src*="unsplash"], img[src*="pexels"], img[data-size="large"]',
            socialEmbeds: 'iframe[src*="twitter"], iframe[src*="instagram"], iframe[src*="facebook"], iframe[src*="tiktok"]'
        };
        
        // Site-specific heavy content selectors
        this.siteSpecificSelectors = {
            'youtube.com': {
                autoplay: '#movie_player video, .video-stream',
                ads: '.ytp-ad-module, .ytd-display-ad-renderer, .ytd-promoted-sparkles-web-renderer',
                suggestions: '#related, #secondary, .ytd-watch-next-secondary-results-renderer',
                animations: '.ytp-spinner, [class*="skeleton"]'
            },
            'twitter.com': {
                videos: '[data-testid="videoComponent"] video',
                gifs: '[data-testid="gif"]',
                autoplay: 'video[autoplay]',
                animations: '[class*="r-animation"]'
            },
            'facebook.com': {
                videos: 'video[data-video-id]',
                autoplay: '[data-autoplay="true"]',
                animations: '[class*="animation"], [class*="bounce"]'
            },
            'instagram.com': {
                videos: 'video',
                stories: '[role="button"][tabindex="0"] video',
                reels: '[data-testid="media-video"]'
            },
            'reddit.com': {
                videos: '.media-element video, video[data-hls-source]',
                gifs: '.media-element img[src*=".gif"]',
                autoplay: 'video[autoplay]'
            },
            'twitch.tv': {
                videos: '.video-player video',
                chat: '.chat-scrollable-area__message-container',
                animations: '[class*="animation"]'
            }
        };
        
        this.init();
    }
    
    init() {
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            try {
                if (request.action === 'enableLiteMode') {
                    this.enableLiteMode(request.options || {});
                    sendResponse({ success: true });
                    return true; // Indicates async response
                } else if (request.action === 'disableLiteMode') {
                    this.disableLiteMode();
                    sendResponse({ success: true });
                    return true;
                } else if (request.action === 'getLiteModeStatus') {
                    sendResponse({ 
                        success: true, 
                        data: { 
                            active: this.isLiteModeActive,
                            blockedCount: this.blockedElements.size
                        }
                    });
                    return true;
                }
            } catch (error) {
                console.error('FastBrowse Lite Mode: Error handling message:', error);
                sendResponse({ success: false, error: error.message });
                return true;
            }
            return false; // No response sent
        });
        
        console.log('FastBrowse Lite Mode Manager initialized');
    }
    
    enableLiteMode(options = {}) {
        if (this.isLiteModeActive) return;
        
        this.isLiteModeActive = true;
        console.log('FastBrowse: Enabling Lite Mode for memory optimization');
        
        // Default options
        const config = {
            blockVideos: true,
            blockAutoplay: true,
            blockAnimations: true,
            blockHeavyImages: true,
            blockSocialEmbeds: true,
            showPlaceholders: true,
            optimizeImages: true,
            ...options
        };
        
        // Apply lite mode immediately to existing content
        this.applyLiteModeToExistingContent(config);
        
        // Inject lite mode styles
        this.injectLiteModeStyles(config);
        
        // Set up observers for dynamically loaded content
        this.setupContentObservers(config);
        
        // Notify background script
        chrome.runtime.sendMessage({ 
            action: 'liteModeEnabled', 
            blockedCount: this.blockedElements.size 
        });
    }
    
    disableLiteMode() {
        if (!this.isLiteModeActive) return;
        
        console.log('FastBrowse: Disabling Lite Mode');
        this.isLiteModeActive = false;
        
        // Restore all blocked elements
        this.restoreBlockedElements();
        
        // Remove injected styles
        if (this.injectedStyles) {
            this.injectedStyles.remove();
            this.injectedStyles = null;
        }
        
        // Disconnect observers
        if (this.mediaObserver) {
            this.mediaObserver.disconnect();
            this.mediaObserver = null;
        }
        
        if (this.animationObserver) {
            this.animationObserver.disconnect();
            this.animationObserver = null;
        }
        
        // Clear tracking data
        this.blockedElements.clear();
        this.originalStyles = new WeakMap();
        
        // Notify background script
        chrome.runtime.sendMessage({ action: 'liteModeDisabled' });
    }
    
    applyLiteModeToExistingContent(config) {
        const currentDomain = window.location.hostname;
        const siteSelectors = this.siteSpecificSelectors[currentDomain] || {};
        
        // Block videos
        if (config.blockVideos) {
            this.blockElements(this.mediaSelectors.videos, 'video', config.showPlaceholders);
            if (siteSelectors.videos) {
                this.blockElements(siteSelectors.videos, 'video', config.showPlaceholders);
            }
        }
        
        // Block autoplay content
        if (config.blockAutoplay) {
            this.blockAutoplayElements();
            if (siteSelectors.autoplay) {
                this.blockElements(siteSelectors.autoplay, 'autoplay', config.showPlaceholders);
            }
        }
        
        // Block animations
        if (config.blockAnimations) {
            this.blockElements(this.mediaSelectors.animations, 'animation', false);
            if (siteSelectors.animations) {
                this.blockElements(siteSelectors.animations, 'animation', false);
            }
        }
        
        // Block social embeds
        if (config.blockSocialEmbeds) {
            this.blockElements(this.mediaSelectors.socialEmbeds, 'social-embed', config.showPlaceholders);
        }
        
        // Optimize images
        if (config.optimizeImages) {
            this.optimizeImages();
        }
        
        // Apply site-specific optimizations
        this.applySiteSpecificOptimizations(currentDomain, siteSelectors, config);
    }
    
    blockElements(selector, type, showPlaceholder = true) {
        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (this.blockedElements.has(element)) return;
                
                // Store original styles and properties
                this.originalStyles.set(element, {
                    display: element.style.display,
                    visibility: element.style.visibility,
                    src: element.src,
                    autoplay: element.autoplay,
                    controls: element.controls
                });
                
                // Block the element
                if (element.tagName.toLowerCase() === 'video' || element.tagName.toLowerCase() === 'audio') {
                    element.pause();
                    element.removeAttribute('autoplay');
                    if (showPlaceholder) {
                        this.replaceWithPlaceholder(element, type);
                    } else {
                        element.style.display = 'none';
                    }
                } else if (element.tagName.toLowerCase() === 'iframe') {
                    const originalSrc = element.src;
                    element.src = 'about:blank';
                    if (showPlaceholder) {
                        this.replaceWithPlaceholder(element, type, originalSrc);
                    } else {
                        element.style.display = 'none';
                    }
                } else {
                    element.style.display = 'none';
                }
                
                this.blockedElements.add(element);
            });
        } catch (error) {
            console.error('FastBrowse Lite Mode: Error blocking elements:', error);
        }
    }
    
    blockAutoplayElements() {
        // Find and pause all autoplay videos/audio
        const autoplayElements = document.querySelectorAll(this.mediaSelectors.autoplay);
        autoplayElements.forEach(element => {
            if (element.tagName.toLowerCase() === 'video' || element.tagName.toLowerCase() === 'audio') {
                element.pause();
                element.removeAttribute('autoplay');
                element.muted = true; // Prevent audio from playing when user interacts
            }
        });
        
        // Block autoplay on newly created media elements
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach(media => {
            media.addEventListener('loadstart', () => {
                if (this.isLiteModeActive) {
                    media.pause();
                    media.removeAttribute('autoplay');
                }
            });
        });
    }
    
    replaceWithPlaceholder(element, type, originalSrc = null) {
        const placeholder = document.createElement('div');
        placeholder.className = 'fastbrowse-lite-placeholder';
        placeholder.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f5f5;
            border: 1px dashed #ccc;
            border-radius: 4px;
            min-height: 100px;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #666;
            cursor: pointer;
            transition: all 0.2s;
        `;
        
        const icon = type === 'video' ? '🎥' : type === 'social-embed' ? '📱' : '🖼️';
        placeholder.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 24px; margin-bottom: 8px;">${icon}</div>
                <div style="font-size: 14px; font-weight: 500;">Content blocked for memory optimization</div>
                <div style="font-size: 12px; color: #999; margin-top: 4px;">Click to load</div>
            </div>
        `;
        
        // Handle click to restore element
        placeholder.addEventListener('click', () => {
            this.restoreElement(element);
            placeholder.replaceWith(element);
        });
        
        // Store reference for restoration
        placeholder._originalElement = element;
        element.replaceWith(placeholder);
    }
    
    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Skip if already processed
            if (img.dataset.liteOptimized) return;
            
            // Add loading="lazy" if not present
            if (!img.getAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Replace high-resolution images with lower quality versions where possible
            if (img.src && img.src.includes('unsplash.com')) {
                const url = new URL(img.src);
                url.searchParams.set('w', '800'); // Limit width
                url.searchParams.set('q', '75'); // Lower quality
                img.src = url.toString();
            }
            
            img.dataset.liteOptimized = 'true';
        });
    }
    
    applySiteSpecificOptimizations(domain, selectors, config) {
        if (domain.includes('youtube.com')) {
            // Block YouTube ads and suggestions
            if (selectors.ads) {
                this.blockElements(selectors.ads, 'ad', false);
            }
            if (selectors.suggestions) {
                this.blockElements(selectors.suggestions, 'suggestion', false);
            }
        } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
            // Disable Twitter animations and auto-playing GIFs
            if (selectors.gifs) {
                this.blockElements(selectors.gifs, 'gif', true);
            }
        } else if (domain.includes('facebook.com')) {
            // Block Facebook video autoplay
            if (selectors.autoplay) {
                this.blockElements(selectors.autoplay, 'autoplay', true);
            }
        }
    }
    
    setupContentObservers(config) {
        // Observer for new media elements
        this.mediaObserver = new MutationObserver((mutations) => {
            if (!this.isLiteModeActive) return;
            
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node or its children contain media
                        const mediaElements = node.matches && node.matches(this.mediaSelectors.videos) 
                            ? [node] 
                            : node.querySelectorAll ? Array.from(node.querySelectorAll(this.mediaSelectors.videos)) : [];
                        
                        mediaElements.forEach(element => {
                            if (config.blockVideos && !this.blockedElements.has(element)) {
                                this.blockElements(`[data-fastbrowse-id="${element.dataset.fastbrowseId || Date.now()}"]`, 'video', config.showPlaceholders);
                            }
                        });
                    }
                });
            });
        });
        
        this.mediaObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    injectLiteModeStyles(config) {
        if (this.injectedStyles) return;
        
        const styles = `
            /* FastBrowse Lite Mode Styles */
            
            /* Disable CSS animations and transitions */
            ${config.blockAnimations ? `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
            
            /* Disable specific animation classes */
            [class*="animate"], [class*="animation"], [class*="bounce"], [class*="fade"], [class*="slide"] {
                animation: none !important;
                transform: none !important;
            }
            ` : ''}
            
            /* Placeholder styles */
            .fastbrowse-lite-placeholder:hover {
                background: #eeeeee !important;
                border-color: #999 !important;
            }
            
            /* Hide heavy decorative elements */
            [style*="background-image"], .hero-banner, .header-video {
                background-image: none !important;
            }
            
            /* Optimize font loading */
            @font-face {
                font-display: swap;
            }
        `;
        
        this.injectedStyles = document.createElement('style');
        this.injectedStyles.textContent = styles;
        this.injectedStyles.id = 'fastbrowse-lite-mode-styles';
        document.head.appendChild(this.injectedStyles);
    }
    
    restoreElement(element) {
        if (!this.originalStyles.has(element)) return;
        
        const original = this.originalStyles.get(element);
        
        // Restore original properties
        if (original.display !== undefined) {
            element.style.display = original.display;
        }
        if (original.visibility !== undefined) {
            element.style.visibility = original.visibility;
        }
        if (original.src && element.tagName.toLowerCase() === 'iframe') {
            element.src = original.src;
        }
        if (original.autoplay !== undefined) {
            element.autoplay = original.autoplay;
        }
        if (original.controls !== undefined) {
            element.controls = original.controls;
        }
        
        this.blockedElements.delete(element);
        this.originalStyles.delete(element);
    }
    
    restoreBlockedElements() {
        // Restore all blocked elements
        this.blockedElements.forEach(element => {
            this.restoreElement(element);
        });
        
        // Restore placeholders
        const placeholders = document.querySelectorAll('.fastbrowse-lite-placeholder');
        placeholders.forEach(placeholder => {
            if (placeholder._originalElement) {
                placeholder.replaceWith(placeholder._originalElement);
            }
        });
    }
}

// Initialize the Lite Mode Manager
if (typeof window !== 'undefined' && !window.fastbrowseLiteModeManager) {
    window.fastbrowseLiteModeManager = new LiteModeManager();
}