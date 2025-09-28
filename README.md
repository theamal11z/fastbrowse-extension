# FastBrowse: Cross-Browser Extension for Memory Optimization & Focus 🦊🔗

FastBrowse is a powerful cross-browser extension (Chrome & Firefox) designed to minimize browser memory consumption and eliminate distractions for enhanced productivity. It combines intelligent tab management, focus mode features, and smart extension recommendations to create the ultimate browsing experience—especially beneficial for users with limited RAM or those seeking distraction-free productivity.

## 🦊 Firefox Support

**New in v1.3.0**: Full Firefox compatibility with Manifest V2 support! FastBrowse now works seamlessly on both Chrome and Firefox with intelligent API detection and graceful feature degradation.

### Firefox Features:
- ✅ Complete memory management and tab suspension
- ✅ Focus Mode with distraction removal
- ✅ Tab grouping and auto-organization
- ✅ Speed dashboard and performance monitoring
- ✅ Settings customization and profiles
- ✅ Context menus and keyboard shortcuts
- ⚠️ Focus Music preview (disabled - uses unsupported offscreen API)

### Cross-Browser Architecture:
- **Smart API Detection**: Automatically uses `browser.*` APIs on Firefox and `chrome.*` on Chrome
- **Graceful Degradation**: Features adapt when specific APIs aren't available
- **Unified Codebase**: Single codebase with browser-specific builds
- **AMO Ready**: Firefox build prepared for Mozilla Add-ons submission

## ✨ Features

### 📑 Memory Management
- **Automatic Tab Suspension**: Intelligently suspends inactive tabs using Chrome's built-in tab discarding API
- **Memory-Aware Tab Restoration**: Smart tab restoration that prioritizes content over heavy media based on memory usage and site type
- **Lite Mode Restoration**: Blocks auto-playing videos, animations, and heavy media during tab restoration for memory optimization
- **Progressive Restoration**: Restores tabs in configurable batches with delays to prevent memory spikes
- **Priority-Based Restoration**: Intelligent restoration ordering based on tab importance, recent usage, and user-defined priorities
- **Smart Memory Monitoring**: Continuously monitors system memory usage and takes action when thresholds are exceeded
- **Smart Memory Alerts (context-aware)**: Only warns/acts on sustained pressure when Chrome is likely responsible (recent Chrome focus + enough unsuspended tabs)
- **Tab Protection**: Automatically protects pinned tabs, tabs playing audio, and system pages
- **Extension Memory Analysis**: Identifies memory-heavy extensions and provides optimization suggestions
- **Emergency Suspend**: Automatically suspends tabs during high memory pressure situations
- **Memory Compression for Suspended Tabs**: Stores minimal tab state (URL, title, scroll position, non-sensitive form values) in compressed form and restores it on resume
- **Tag-Based Memory Policies**: Configure suspension behavior per tag category (e.g., Work → longer delays, Reference → never suspend during work hours)

### 🎯 Focus Mode
- **Distraction Removal**: Automatically hides distracting elements on major websites (YouTube suggestions, social media feeds, ads, etc.)
- **Minimal Dark Theme**: Applies a clean, eye-friendly dark theme across all websites
- **Animation Disabling**: Removes animations and transitions for better focus and performance
- **Memory Optimization**: Advanced techniques including image compression and lazy loading
- **Auto-Suspend Integration**: Automatically suspends background tabs when entering focus mode
- **Ambient Focus Music**: Optional background music from assets with in-popup Preview; starts/stops with Focus Mode
- **Extension Recommendations**: Suggests complementary focus extensions (e.g., DF YouTube, News Feed Eradicator) and avoids suggesting ones you already have or suitable alternatives

### 🖥️ Interface & Usability
- **Tabbed Popup Interface**: Organized Overview/Tags/Settings tabs for streamlined navigation and better UX
- **Tab Search Filter**: Quick search functionality in popup to find specific tabs instantly
- **Clean Interface**: Minimalist popup UI with real-time statistics, focus mode controls, and restoration mode management
- **Memory-Aware Restoration Controls**: Toggle between Smart (🧠), Lite (⚡), and Full (🚀) restoration modes with live memory visualization
- **Progressive Restoration Status**: Real-time progress tracking during batch restoration operations
- **Tab Restoration Indicators**: Visual indicators for tabs in lite mode and active restoration processes
- **One‑Tap Declutter**: Preview duplicates and stale tabs, then clean up with undo support (Shift+Click for quick preview toast)
- **Actionable Badge**: See how many quick actions are available at a glance
- **Memory Usage Display**: Live memory usage monitoring with color-coded indicators and restoration threshold visualization
- **Focus Statistics**: Track focus time and productivity metrics
- **Auto-Group Tabs button**: One-click analysis to suggest tab groups by domain, tags, usage, or time patterns
- **In-Popup Settings Panel**: Open via the ⚙️ in the header or Tags section; includes Focus Music, smart memory controls, and tag toggles
- **Non-blocking Toasts**: Friendly, unobtrusive success/error feedback
- **Chrome Flags Management**: Guided, safe recommendations with copy-to-clipboard launch flags and stability warnings (extensions cannot auto-set flags)
  - Examples:
    - Linux: `google-chrome --enable-gpu-rasterization --enable-features=ParallelDownloading`
    - Windows: `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --enable-gpu-rasterization --enable-features=ParallelDownloading`
    - macOS: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --enable-gpu-rasterization --enable-features=ParallelDownloading`
- **Smart Cache Management**: Aggressive pre-caching during idle, intelligent cache clearing with warming, and best‑effort cache compression toggle
- **Profile Optimization**: IndexedDB clean-up tools per site or across recent sites (safe batch), with clear guidance and safety
- **Speed Dashboard**: Real-time page load metrics, performance timelines, and network waterfall charts
- **Bottleneck Identification**: Advanced performance analysis to identify slow resources and optimization opportunities
- **Quick Session Switching**: Turbo mode with performance presets and 1-click browser optimization
- **Configurable Settings**: Fully customizable behavior for all features

### 🏷️ Tag System & Auto Grouping
- **Auto-Tagging**: Suggests and applies tags based on domain, title, and history
- **Tag Filters**: View All, Frequent, Active, or a specific tag
- **Group Suggestions**: Top suggestions with reasons and quick “Create Group”/Dismiss actions
- **Inline Tag Pills**: Color-coded pills with usage frequency

### 🔒 Privacy & Performance
- **Zero Tracking**: No third-party analytics or data collection
- **Local Processing**: All functionality works entirely offline
- **Minimal Resource Usage**: Optimized service worker with event-driven architecture
- **Open Source**: Complete transparency in code and functionality

## 🚀 Installation

### Chrome Installation

#### From Source (Development)
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the project directory
5. The FastBrowse icon should appear in your extensions toolbar

#### From Chrome Web Store
*(Coming soon - extension will be published after testing)*

### 🦊 Firefox Installation

#### From Source (Development)
1. Clone or download this repository
2. Build the Firefox version:
   ```bash
   npm run build:firefox
   ```
3. Open Firefox and navigate to `about:debugging`
4. Click "This Firefox" → "Load Temporary Add-on"
5. Select any file in the `dist-firefox` folder
6. The FastBrowse icon should appear in your extensions toolbar

#### From Firefox Add-ons (AMO)
*(Coming soon - extension will be submitted for Firefox review)*

### Build Commands

```bash
# Chrome/Chromium (default)
npm run zip                    # Creates fastbrowse-extension.zip
npm run build                  # Lint and format code

# Firefox
npm run build:firefox          # Build Firefox version to dist-firefox/
npm run zip:firefox            # Creates fastbrowse-firefox.zip
npm run dev:firefox            # Run in Firefox with web-ext
```

## 📚 How to Use

### Basic Memory Management

1. **Click the FastBrowse icon** in your toolbar to open the popup
2. **View memory usage** at the top with color-coded indicators (green/yellow/red)
3. **See all your tabs** organized by window with suspension status
4. **Manually suspend/restore** individual tabs using the buttons
5. **Suspend all inactive tabs** with one click using "Suspend All Tabs"
6. **Auto-Group Tabs** using the button in the popup; review suggestions and create groups you like
7. **Declutter**: Click to preview duplicates/stale and clean up with Undo, or Shift+Click for a quick preview toast with a Run action
8. **Analyze extensions** to identify memory-heavy extensions and get optimization suggestions

### 🧠 Memory-Aware Tab Restoration

1. **Choose restoration mode** using the brain icon (🧠) in the popup:
   - **Smart Mode** (🧠): Automatically selects the best restoration method based on memory usage and site content
   - **Lite Mode** (⚡): Always restores tabs with memory optimization, blocking videos and animations
   - **Full Mode** (🚀): Restores tabs without any restrictions or optimizations
2. **Monitor memory usage** with the live memory bar showing current usage and lite mode threshold
3. **Use Restore (Lite)** button for individual tabs to restore with memory optimization
4. **Track restoration statistics** including total restored tabs and memory savings
5. **Configure restoration preferences** in settings for automatic behavior

#### Restoration Mode Benefits:
- ⚡ **Lite Mode**: 50-80% memory reduction by blocking auto-playing videos, animations, and heavy media
- 🚀 **Smart Priority**: Important tabs (pinned, recent, work-related) restore first
- 📋 **Progressive Loading**: Batched restoration prevents memory spikes and system overload
- 🎯 **Site Optimization**: Automatic detection of media-heavy sites for intelligent mode selection

### 🎯 Focus Mode Usage

1. **Enable Focus Mode** by clicking the prominent toggle in the popup
2. **Watch distractions disappear** automatically across all your open tabs
3. **Enjoy the minimal theme** that reduces eye strain and visual noise
4. **Track your productivity** with real-time focus time and tab suspension statistics
5. **Optionally play ambient Focus Music**: choose a track in Settings and click Preview; music starts/stops with Focus Mode
6. **Get extension recommendations** for enhanced focus (e.g., DF YouTube, News Feed Eradicator); we won’t suggest ones you already have
7. **Disable Focus Mode** anytime to restore the original browsing experience

#### Focus Mode Benefits:
- ✨ **YouTube**: Removes suggestions, comments, and sidebar distractions
- 🐦 **Twitter/X**: Hides trending topics, suggestions, and promoted content
- 📱 **Facebook**: Removes news feed clutter and sponsored posts
- 📷 **Instagram**: Hides explore grid and suggested content
- 📝 **Reddit**: Removes promoted posts, trending sections, and sidebars
- 💻 **GitHub**: Cleans up marketing sections and unnecessary sidebars
- 💼 **LinkedIn**: Removes news modules and suggested connections

### Settings Configuration

#### Quick Settings (in the Popup)
- Click the **⚙️ Settings** button in the popup header (next to the tag icon) or in the Tags section
- Adjust common settings quickly:
  - Auto-suspend toggle and delay
  - Smart memory alerts and threshold
  - Smart mute background audio
  - Declutter stale threshold (minutes)
  - Declutter domain whitelist (comma separated)
  - Tags system toggle
  - Focus Mode music selection with Preview
- Click Save

#### Full Options Page
1. **Right-click the FastBrowse icon** and select "Options" (or click the options link in the popup)

#### Memory Management Settings
2. **Configure automatic suspension**:
   - Enable/disable automatic tab suspension
   - Set the delay before inactive tabs are suspended (5-120 minutes)
3. **Set up memory monitoring**:
   - Enable automatic suspension when memory usage is high
   - Set the memory threshold percentage (60-95%)
4. **Configure Memory-Aware Restoration**:
   - Enable/disable smart restoration based on memory usage
   - Set lite mode memory threshold (50-90%) - when exceeded, tabs restore in lite mode
   - Enable progressive restoration with configurable delays (500-5000ms)
   - Set maximum concurrent restorations (1-10 tabs)
   - Choose restoration priority mode (Smart/Manual/All)
   - Configure memory buffer for restoration operations (2-15%)
   - Option to prioritize content over heavy media sites
   - Set lite mode as default for all restorations
5. **Choose tab protection settings**:
   - Protect pinned tabs from suspension
   - Protect tabs playing audio
   - Protect tabs with unsaved form data

#### Focus Mode Settings
5. **Configure focus mode behavior**:
   - Enable focus mode on startup
   - Auto-suspend tabs when entering focus mode
   - Apply minimal dark theme
   - Remove website distractions
   - Disable animations and transitions
   - Enable memory optimization techniques
   - Show recommended focus extensions
6. **View focus statistics**:
   - Total focus time across all sessions
   - Number of tabs suspended during focus mode

#### Extension & Notification Settings
7. **Extension monitoring**:
   - Monitor extension memory usage
   - Set memory threshold for extension alerts (20-200 MB)
   - Enable smart extension suggestions
   - Get notifications about optimization opportunities
8. **Configure notifications**:
   - Show notifications when tabs are suspended
   - Show warnings when memory usage is high
   - Display focus mode recommendations

#### Tag-Based Memory Policies
1. **Enable tag-based suspension policies**: Turn on policy-based behavior for specific tag categories
2. **Work tabs delay multiplier**: Choose 1–5× to lengthen suspension delay for tabs with a “Work” tag
3. **Reference tabs protection**: Prevent suspension of “Reference” tagged tabs during work hours (uses your configured work days/hours)

Notes:
- Policy detection is name-based and case-insensitive (e.g., tags containing “work” or “reference”).
- Work hours are configured in the Context-Aware section (start/end and days).

## 🛠️ Technical Details

### Cross-Browser Architecture

FastBrowse supports both Chrome (Manifest V3) and Firefox (Manifest V2) with intelligent API detection:

#### Chrome Implementation (Manifest V3):
- **Service Worker**: Background processing with chrome.* APIs
- **Offscreen Documents**: Audio playback for Focus Music
- **chrome.scripting**: Dynamic content script injection

#### Firefox Implementation (Manifest V2):
- **Background Scripts**: Traditional background page with browser.* APIs  
- **API Fallbacks**: tabs.executeScript when chrome.scripting unavailable
- **Graceful Degradation**: Offscreen features disabled on Firefox

#### Shared Components:

- **Background Service Worker**: Handles tab management, memory monitoring, focus mode orchestration, and memory-aware restoration logic
- **Popup Interface**: Provides user interface for manual tab control, focus mode management, and restoration mode selection
- **Options Page**: Allows configuration of all settings including focus mode preferences and restoration behavior
- **Content Scripts**: Injected into web pages for focus mode distraction removal, theme application, and lite mode media blocking
- **Lite Mode Content Script**: Specialized script for blocking auto-playing videos, animations, and optimizing media-heavy pages
- **Cross-Browser APIs Used**:
  - `tabs` - Tab management and discarding (chrome.tabs / browser.tabs)
  - `system.memory` - Memory usage monitoring (Chrome only, graceful fallback on Firefox)
  - `storage` - Settings persistence across sessions (chrome.storage / browser.storage)
  - `notifications` - User notifications and alerts (chrome.notifications / browser.notifications)
  - `management` - Extension analysis and recommendations (chrome.management / browser.management)
  - `scripting` - Dynamic content script injection (Chrome MV3) / `tabs.executeScript` (Firefox MV2)
  - `offscreen` - Background audio playback for Focus Music (Chrome MV3 only, disabled on Firefox)
  - `action` / `browserAction` - Badge updates for actionable items (MV3 vs MV2)
  - `activeTab` - Content script access for focus enhancements (universal)

#### Firefox-Specific Considerations:
- **Manifest V2**: Uses traditional background scripts instead of service workers
- **browser.* APIs**: Automatically mapped from chrome.* where available
- **Permissions Rationale**: Detailed explanations for Mozilla Add-ons review
- **Gecko ID**: Removed for AMO to assign automatically on first upload
- **Security Audit**: No unsafe innerHTML, eval, or remote code execution

### Memory Optimization Strategy

1. **Native Tab Discarding**: Uses Chrome's built-in `chrome.tabs.discard()` API, which is the same mechanism used by Chrome's Memory Saver feature
2. **Intelligent Protection**: Automatically identifies and protects important tabs:
   - Active tabs (currently in use)
   - Pinned tabs
   - Tabs playing audio or video
   - System pages (chrome://, chrome-extension://)
   - Tabs with unsaved form data (optional)
3. **Graduated Response**: 
   - Normal operation: Suspend tabs after configured delay
   - High memory usage: Emergency suspension of oldest inactive tabs
   - Memory critical: More aggressive suspension while respecting protections
4. **Smart Memory Alerts**:
   - Requires sustained high memory across checks
   - Suppresses alerts/actions unless Chrome had recent focus and there are enough unsuspended tabs
5. **Memory Compression for Suspended Tabs**:
   - Captures minimal state (URL, title, scroll position, non-sensitive form values)
   - Compresses and stores snapshot in `chrome.storage.local` (uses `CompressionStream` gzip/deflate when available; falls back to base64)
   - Restores state on resume and cleans up the stored snapshot
   - Never captures sensitive inputs (password/hidden)

### Memory-Aware Restoration Strategy

1. **Intelligent Mode Selection**:
   - **Smart Mode**: Analyzes memory usage, tab content type, and system state to automatically choose optimal restoration method
   - **Lite Mode**: Injects content script to block auto-playing videos, animations, and heavy media elements
   - **Full Mode**: Standard restoration without any optimization or restrictions
2. **Priority-Based Restoration**:
   - **Tab Scoring System**: Calculates priority based on pinned status (+100), recent access (+30), audio playback (+60), and tag importance
   - **Domain Classification**: Work domains (GitHub, Stack Overflow, docs) get higher priority (+25) than entertainment sites
   - **Smart Ordering**: Restores high-priority tabs first, media-heavy sites last or in lite mode
3. **Progressive Restoration**:
   - **Batched Processing**: Restores tabs in configurable batches (1-10 concurrent) with delays (500-5000ms)
   - **Memory Pressure Monitoring**: Pauses restoration when memory usage exceeds safe thresholds
   - **Progress Tracking**: Real-time updates and notifications for large restoration operations
4. **Lite Mode Optimizations**:
   - **Media Blocking**: Replaces videos, GIFs, and auto-playing content with clickable placeholders
   - **Animation Disabling**: Removes CSS animations and transitions for performance
   - **Image Optimization**: Implements lazy loading and compression for off-screen images
   - **Site-Specific Rules**: Custom selectors for YouTube, Twitter, Facebook, Instagram, and other media-heavy platforms

### Focus Mode Strategy

1. **Site-Specific Distraction Removal**: Uses curated CSS selectors for major platforms:
   - **YouTube**: Suggestions, comments, sidebars, end screens, and recommendations
   - **Social Media**: News feeds, trending sections, suggested content, and ads
   - **Professional Sites**: Marketing sections, promotional content, and non-essential sidebars
2. **Minimal UI Theme**: Applies consistent dark theme with:
   - Reduced visual noise and simplified color schemes
   - Optimized contrast for better readability and reduced eye strain
   - Consistent typography and spacing across all websites
3. **Performance Optimizations**:
   - **Animation Disabling**: Removes CSS animations and transitions for better focus
   - **Image Optimization**: Compresses images and implements lazy loading for off-screen content
   - **Memory Reduction**: Unloads non-visible images and reduces resource consumption
4. **Extension Ecosystem Integration**:
   - **Smart Recommendations**: Suggests complementary extensions based on browsing patterns
   - **Priority System**: Ranks recommendations by effectiveness and user benefit
   - **Installation Assistance**: Direct links to Chrome Web Store for recommended extensions

### Performance Considerations

- **Minimal Background Activity**: Service worker only runs when needed
- **Event-Driven Architecture**: Responds to tab changes rather than continuous polling
- **Efficient Memory Monitoring**: Checks memory usage every 30 seconds (configurable)
- **Clean Resource Management**: Properly disposes of timers and event listeners

### Network Optimization Strategy

1. **DNS Prefetching**
   - Scans anchors on the current page to find frequently linked external domains
   - Inserts `<link rel="dns-prefetch" href="//domain">` for up to N domains (configurable)
2. **Connection Pre-warming**
   - Adds `<link rel="preconnect" href="https://domain" crossorigin>` for the top external domains by frequency
   - Helps reduce connection setup latency (DNS+TCP+TLS)
3. **Resource Preloading**
   - On link hover or pointer down, prefetches the target page via `<link rel="prefetch" as="document" href="...">`
   - Smartly throttled and deduplicated to avoid waste

Settings (Options → Network Optimization):
- Enable Network Optimization
- DNS Prefetching: toggle + maximum hosts to prefetch
- Connection Pre-warming: toggle + number of top domains
- Resource Preloading: toggle prefetch on hover

### Page Load Acceleration

1. **Lazy Loading Override**
   - Forces lazy loading for images/iframes outside the initial viewport
   - Sets `decoding=\"async\"` for images and `preload=\"metadata\"` for below-the-fold videos
2. **Render-Blocking CSS Optimizer**
   - Heuristically defers non-critical stylesheets (cross-origin or known non-critical providers)
   - Uses `rel=preload as=style` and sets back to `rel=stylesheet` on load
   - Limit the number with “Max stylesheets to defer” to avoid FOUC
3. **JavaScript Deferral**
   - Safely defers known non-essential third-party scripts (analytics/ads). Aggressive mode defers any cross-origin script
   - Applies to `<script src>` without `async`/`defer`, leaves inline scripts intact

Settings (Options → Page Load Acceleration):
- Enable Page Load Acceleration
- Lazy Loading Override toggle
- CSS Defer: toggle + max stylesheets
- JavaScript Deferral: toggle + mode (Safe/Aggressive)

### GPU Acceleration Control

1. **Hardware Acceleration Tuner**
   - Modes: Auto (recommended), Conservative, Balanced, Aggressive
   - Provides future hooks for GPU compositing hints; kept conservative by default to avoid regressions
2. **WebGL Performance Profiles**
   - Performance: favors speed (disable antialias, no preserveDrawingBuffer, powerPreference="high-performance")
   - Quality: favors visuals (enable antialias, preserveDrawingBuffer)
   - Compatibility: minimal changes

Settings (Options → GPU Acceleration Control):
- Enable GPU Acceleration Control
- Hardware Acceleration mode
- WebGL Profile + toggles (Force high-performance GPU, Antialias, Preserve drawing buffer)

### Smart Cache Management

1. **Aggressive Pre‑caching**
   - Scores on‑page links and prefetches likely next pages during idle
   - Adjustable: max links and idle delay
   - “Pre‑cache now” action to test immediately
2. **Intelligent Cache Clearing**
   - Clears HTTP cache only (preserves cookies/storage)
   - Re‑warms important origins: active/pinned tabs and recent sites
3. **Cache Compression (best‑effort)**
   - Toggle influences extension heuristics; Chrome manages HTTP cache compression internally

Settings (Options → Smart Cache Management):
- Enable Smart Cache Management
- Aggressive Pre‑caching toggle + Max links + Idle delay
- Intelligent Cache Clearing toggle + “Run” action
- Cache Compression toggle

### Speed Dashboard

1. **Page Load Timelines**
   - Navigation timings: DOMContentLoaded, Load, responseStart, duration
   - Paint timings: First Paint (FP), First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP) when available
2. **Network Waterfall Charts**
   - Sample of slowest resources with simple per-page bar chart
   - Shows initiator type, duration, and relative bar width
3. **Performance Score**
   - Simple 0–100 heuristic based on FCP/LCP/DCL/Load
   - Higher is better; quick way to compare recent pages

Settings (Options → Speed Dashboard):
- Enable Speed Dashboard
- Refresh/clear history from the Options page

### Profile Optimization

1. **IndexedDB Optimization**
   - Optimize current site: clears IndexedDB for the active origin (cookies/storage preserved)
   - Optimize recent sites: clears IndexedDB for a safe batch of recent origins (skips active/pinned)

Notes:
- Browser profile “defragmentation” is not exposed to extensions; this feature provides safe maintenance via Chrome’s browsingData APIs.

Settings (Options → Profile Optimization):
- Enable Profile Optimization helpers
- Buttons for current site and recent sites actions

## 🔧 Development

### Prerequisites

#### For Chrome Development:
- Google Chrome or Chromium browser
- Basic knowledge of JavaScript, HTML, and CSS
- Text editor or IDE of your choice

#### For Firefox Development:
- Firefox browser
- Node.js and npm (for build scripts)
- web-ext tool (optional, for automated testing): `npm install -g web-ext`
- Knowledge of Manifest V2 vs V3 differences

### Project Structure

```
fastbrowse-extension/
├── manifest.json          # Chrome extension manifest (Manifest V3)
├── src/
│   ├── background.js      # Background service worker with cross-browser compatibility
│   ├── popup.html         # Tabbed popup interface with Overview/Tags/Settings
│   ├── popup.js           # Enhanced popup with search, tabs, and restoration management
│   ├── options.html       # Comprehensive options page with all settings
│   ├── options.js         # Settings management and performance dashboard
│   ├── offscreen.html     # Offscreen document for Focus Music (Chrome only)
│   ├── offscreen.js       # Audio controller for Focus Music
│   └── content/
│       ├── focus-mode.js      # Focus mode distraction removal
│       ├── focus-mode.css     # Focus mode styling and minimal theme
│       ├── lite-mode.js       # Memory-optimized tab restoration
│       ├── state-snapshot.js  # Form state and scroll position management
│       ├── network-optimization.js # DNS prefetch and preload
│       ├── page-acceleration.js    # Page load speed optimization
│       └── performance-monitor.js  # Speed dashboard metrics
├── assets/
│   ├── icon16.png         # 16x16 extension icon
│   ├── icon32.png         # 32x32 extension icon (Firefox)
│   ├── icon48.png         # 48x48 extension icon
│   ├── icon96.png         # 96x96 extension icon (Firefox)
│   ├── icon128.png        # 128x128 extension icon
│   └── music/             # Focus Mode music assets (MP3/OGG/WAV)
├── scripts/
│   └── build-firefox.js   # Firefox build script for Manifest V2 conversion
├── dist-firefox/          # Firefox build output (generated)
│   ├── manifest.json      # Firefox manifest (Manifest V2)
│   ├── src/               # Cross-browser compatible source files
│   └── assets/            # Icons and assets for Firefox
├── package.json           # Project dependencies and build scripts
├── fastbrowse-extension.zip   # Chrome build package (generated)
├── fastbrowse-firefox.zip     # Firefox build package (generated)
└── README.md              # This comprehensive documentation
```

### Cross-Browser Development Workflow

#### Chrome Development:
1. **Make changes** to the source code
2. **Reload the extension**:
   - Go to `chrome://extensions/`
   - Click the reload button on the FastBrowse extension
3. **Test functionality**:
   - Open multiple tabs
   - Test automatic suspension
   - Verify memory monitoring
   - Check settings persistence

#### Firefox Development:
1. **Build Firefox version**: `npm run build:firefox`
2. **Load in Firefox**:
   - Go to `about:debugging` → "This Firefox"
   - Click "Reload" on the FastBrowse extension
   - Or use `npm run dev:firefox` for automated reloading
3. **Test Firefox-specific behavior**:
   - Verify API fallbacks work correctly
   - Check that disabled features degrade gracefully
   - Test browser.* API compatibility

#### Cross-Browser Testing:
- **Feature Parity**: Ensure core functionality works on both browsers
- **API Compatibility**: Test chrome.* vs browser.* API differences
- **Performance**: Compare memory usage and extension overhead
- **UI Consistency**: Verify popup and options page render correctly

### Cross-Browser Debugging

#### Chrome Debugging:
- **Background Script**: Use `chrome://extensions/` → FastBrowse → "service worker" link
- **Popup**: Right-click popup → "Inspect"
- **Options Page**: Right-click options page → "Inspect"
- **Console Logs**: All components log important events for debugging

#### Firefox Debugging:
- **Background Script**: Go to `about:debugging` → "This Firefox" → FastBrowse → "Inspect"
- **Popup**: Right-click popup → "Inspect Element" → "Debugger" tab
- **Options Page**: Right-click options page → "Inspect Element"
- **Browser Console**: `Ctrl+Shift+J` (Linux/Windows) or `Cmd+Shift+J` (Mac) for all console logs
- **Web Console**: `F12` for page-specific console logs and content script debugging

## 🧪 Testing

### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup displays current memory usage
- [ ] Tab list shows all open tabs with correct status
- [ ] Manual tab suspension/restoration works
- [ ] Automatic suspension works after configured delay
- [ ] Protected tabs (pinned, audio, active) are not suspended
- [ ] Memory threshold suspension triggers correctly
- [ ] Smart memory alerts suppress false warnings when Chrome is idle
- [ ] Smart Mute mutes non-active audible tabs, respects whitelist
- [ ] Declutter quick preview (Shift+Click) shows counts and “Run” works
- [ ] Declutter respects stale threshold and domain whitelist
- [ ] Auto-Group Tabs shows suggestions and Create Group works
- [ ] Settings (inline) save and load properly
- [ ] Focus Music: Preview works and music plays/stops with Focus Mode
- [ ] Memory-aware restoration mode cycling works (Smart/Lite/Full)
- [ ] Lite mode blocks videos and animations during restoration
- [ ] Progressive restoration shows progress and respects timing settings
- [ ] Priority-based restoration orders tabs correctly (pinned first, work sites priority)
- [ ] Memory threshold triggers automatic lite mode restoration
- [ ] Restoration statistics update correctly in popup and options
- [ ] Individual tab lite restore button works
- [ ] Restoration controls appear and function in popup
- [ ] Notifications display when enabled

#### Firefox-Specific Testing Checklist:
- [ ] Extension loads without errors in Firefox
- [ ] browser.* APIs work correctly instead of chrome.* APIs
- [ ] Background script (not service worker) functions properly
- [ ] Focus Music preview is gracefully disabled (shows message)
- [ ] All features work without chrome.scripting (uses tabs.executeScript fallback)
- [ ] Manifest V2 permissions are correctly set
- [ ] Icons display properly (16/32/48/96/128px)
- [ ] Context menus work with browser.contextMenus
- [ ] Keyboard shortcuts function with browser.commands
- [ ] Extension passes AMO automated review checks

### Memory Impact Testing

Use Chrome Task Manager (`Shift+Esc`) to monitor:
- Extension's own memory usage (should be minimal)
- Overall browser memory reduction after suspending tabs
- Memory usage recovery when tabs are restored

### State Snapshot/Restore Testing

1. Open a page with a form and scroll down
2. Type into non-sensitive inputs (text/textarea/select) and optionally checkboxes
3. Suspend the tab using the popup (or wait for auto-suspend)
4. Restore the tab (Full or Lite). After load:
   - Scroll position should be restored
   - Non-sensitive form values should be re-applied
5. Verify in background console for snapshot/restore logs; stored snapshot is removed after successful restore

## 🚫 Limitations & Browser Differences

### Universal Limitations:
- **Extension API Limitations**: Cannot suspend certain system pages or extensions
- **Active Tab Detection**: May occasionally suspend tabs that appear inactive but are actually in use
- **State Snapshot Scope**: Snapshot/restore cannot run on restricted pages (chrome://, extension pages, etc.)
- **Form State Coverage**: Only non-sensitive inputs are captured (password/hidden excluded)
- **Browser Flags**: Extensions cannot programmatically modify browser://flags or chrome://flags

### Chrome-Specific Limitations:
- **Memory API Accuracy**: System memory reporting may vary by operating system
- **Service Worker Persistence**: Service worker may need to restart, causing brief delays
- **Offscreen Document Lifecycle**: Focus Music may occasionally need reinitialization

### Firefox-Specific Limitations:
- **No System Memory API**: Memory monitoring uses estimated heuristics instead of system.memory
- **No Offscreen Documents**: Focus Music preview disabled (Manifest V2 limitation)
- **Background Script Persistence**: Traditional background page instead of service worker
- **API Compatibility**: Some chrome.* APIs mapped to browser.* equivalents
- **Extension Review**: Subject to Mozilla's AMO review process and policies

## 🔒 Privacy & Security

FastBrowse is designed with privacy in mind:

- **No Data Collection**: No user data is collected or transmitted
- **No External Connections**: All functionality works entirely offline
- **Local Storage Only**: Settings stored locally using Chrome's storage API
- **Minimal Permissions**: Only requests necessary permissions for core functionality
- **Open Source**: All code is available for review and audit

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use modern JavaScript (ES6+)
- Follow consistent indentation (2 spaces)
- Add comments for complex logic
- Test changes thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For issues, questions, or feature requests:

- **GitHub Issues**: Create an issue in this repository
- **Documentation**: Check this README for common questions
- **Chrome Web Store**: Leave a review or report issues (when published)

## 🙏 Acknowledgments

- Chrome Extension team for the excellent Manifest V3 APIs
- The open-source community for inspiration and best practices
- Beta testers for feedback and bug reports

---

**Note**: This extension is not affiliated with Google or the Chrome browser team. It uses public Chrome Extension APIs to provide memory optimization features.