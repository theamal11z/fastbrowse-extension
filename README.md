# FastBrowse: Advanced Chrome Extension for Memory Optimization & Focus

FastBrowse is a powerful Chrome extension designed to minimize browser memory consumption and eliminate distractions for enhanced productivity. It combines intelligent tab management, focus mode features, and smart extension recommendations to create the ultimate browsing experience—especially beneficial for users with limited RAM or those seeking distraction-free productivity.

## ✨ Features

### 📑 Memory Management
- **Automatic Tab Suspension**: Intelligently suspends inactive tabs using Chrome's built-in tab discarding API
- **Smart Memory Monitoring**: Continuously monitors system memory usage and takes action when thresholds are exceeded
- **Smart Memory Alerts (context-aware)**: Only warns/acts on sustained pressure when Chrome is likely responsible (recent Chrome focus + enough unsuspended tabs)
- **Tab Protection**: Automatically protects pinned tabs, tabs playing audio, and system pages
- **Extension Memory Analysis**: Identifies memory-heavy extensions and provides optimization suggestions
- **Emergency Suspend**: Automatically suspends tabs during high memory pressure situations

### 🎯 Focus Mode
- **Distraction Removal**: Automatically hides distracting elements on major websites (YouTube suggestions, social media feeds, ads, etc.)
- **Minimal Dark Theme**: Applies a clean, eye-friendly dark theme across all websites
- **Animation Disabling**: Removes animations and transitions for better focus and performance
- **Memory Optimization**: Advanced techniques including image compression and lazy loading
- **Auto-Suspend Integration**: Automatically suspends background tabs when entering focus mode
- **Ambient Focus Music**: Optional background music from assets with in-popup Preview; starts/stops with Focus Mode
- **Extension Recommendations**: Suggests complementary focus extensions (e.g., DF YouTube, News Feed Eradicator) and avoids suggesting ones you already have or suitable alternatives

### 🖥️ Interface & Usability
- **Clean Interface**: Minimalist popup UI with real-time statistics and focus mode controls
- **One‑Tap Declutter**: Preview duplicates and stale tabs, then clean up with undo support (Shift+Click for quick preview toast)
- **Actionable Badge**: See how many quick actions are available at a glance
- **Memory Usage Display**: Live memory usage monitoring with color-coded indicators
- **Focus Statistics**: Track focus time and productivity metrics
- **Auto-Group Tabs button**: One-click analysis to suggest tab groups by domain, tags, usage, or time patterns
- **In-Popup Settings Panel**: Open via the ⚙️ in the header or Tags section; includes Focus Music, smart memory controls, and tag toggles
- **Non-blocking Toasts**: Friendly, unobtrusive success/error feedback
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

### From Source (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the project directory
5. The FastBrowse icon should appear in your extensions toolbar

### From Chrome Web Store
*(Coming soon - extension will be published after testing)*

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
4. **Choose tab protection settings**:
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

## 🛠️ Technical Details

### Architecture

FastBrowse uses Chrome Extension Manifest V3 with the following components:

- **Background Service Worker**: Handles tab management, memory monitoring, and focus mode orchestration
- **Popup Interface**: Provides user interface for manual tab control and focus mode management
- **Options Page**: Allows configuration of all settings including focus mode preferences
- **Content Scripts**: Injected into web pages for focus mode distraction removal and theme application
- **Chrome APIs Used**:
  - `chrome.tabs` - Tab management and discarding
  - `chrome.system.memory` - Memory usage monitoring
  - `chrome.storage` - Settings persistence across sessions
  - `chrome.notifications` - User notifications and alerts
  - `chrome.management` - Extension analysis and recommendations
  - `chrome.scripting` - Dynamic content script injection for focus mode
  - `chrome.offscreen` - Background audio playback for Focus Music (MV3-offscreen document)
  - `chrome.action` - Badge updates for actionable items
  - `activeTab` - Content script access for focus enhancements

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

## 🔧 Development

### Prerequisites

- Google Chrome or Chromium browser
- Basic knowledge of JavaScript, HTML, and CSS
- Text editor or IDE of your choice

### Project Structure

```
fastbrowse-extension/
├── manifest.json          # Extension manifest (Manifest V3)
├── src/
│   ├── background.js      # Background service worker
│   ├── popup.html         # Popup interface HTML
│   ├── popup.js           # Popup functionality
│   ├── options.html       # Options page HTML
│   ├── options.js         # Options page functionality
│   ├── offscreen.html     # Offscreen document for Focus Music playback
│   └── offscreen.js       # Offscreen audio controller
├── assets/
│   ├── icon16.png         # 16x16 extension icon
│   ├── icon48.png         # 48x48 extension icon
│   ├── icon128.png        # 128x128 extension icon
│   └── music/             # Focus Mode music assets (MP3/OGG/WAV)
└── README.md              # This file
```

### Local Development

1. **Make changes** to the source code
2. **Reload the extension**:
   - Go to `chrome://extensions/`
   - Click the reload button on the FastBrowse extension
3. **Test functionality**:
   - Open multiple tabs
   - Test automatic suspension
   - Verify memory monitoring
   - Check settings persistence

### Debugging

- **Background Script**: Use `chrome://extensions/` → FastBrowse → "service worker" link
- **Popup**: Right-click popup → "Inspect"
- **Options Page**: Right-click options page → "Inspect"
- **Console Logs**: All components log important events for debugging

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
- [ ] Notifications display when enabled

### Memory Impact Testing

Use Chrome Task Manager (`Shift+Esc`) to monitor:
- Extension's own memory usage (should be minimal)
- Overall browser memory reduction after suspending tabs
- Memory usage recovery when tabs are restored

## 🚫 Limitations

- **Chrome Extension API Limitations**: Cannot suspend certain system pages or extensions
- **Active Tab Detection**: May occasionally suspend tabs that appear inactive but are actually in use
- **Memory API Accuracy**: System memory reporting may vary by operating system
- **Background Script Persistence**: Service worker may need to restart, causing brief delays

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