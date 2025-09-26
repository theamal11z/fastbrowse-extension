# FastBrowse: Lightweight Chrome Extension to Reduce Memory Usage

FastBrowse is a Chrome extension designed to minimize browser memory consumption without sacrificing user experience. It leverages Chrome's native performance features and smart tab management to keep browsing fast and efficient—especially on systems with limited RAM.

## ✨ Features

- **Automatic Tab Suspension**: Intelligently suspends inactive tabs using Chrome's built-in tab discarding API
- **Smart Memory Monitoring**: Continuously monitors system memory usage and takes action when thresholds are exceeded
- **Tab Protection**: Automatically protects pinned tabs, tabs playing audio, and system pages
- **Clean Interface**: Minimalist popup UI for viewing and managing suspended tabs
- **Memory Usage Display**: Real-time memory usage statistics in the popup
- **Configurable Settings**: Fully customizable suspension timing and behavior
- **Zero Tracking**: No third-party analytics or data collection
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

## 📖 How to Use

### Basic Usage

1. **Click the FastBrowse icon** in your toolbar to open the popup
2. **View memory usage** at the top of the popup
3. **See all your tabs** organized by window with suspension status
4. **Manually suspend/restore** individual tabs using the buttons
5. **Suspend all inactive tabs** with one click using "Suspend All Tabs"

### Settings Configuration

1. **Right-click the FastBrowse icon** and select "Options" (or click the options link in the popup)
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
5. **Configure notifications**:
   - Show notifications when tabs are suspended
   - Show warnings when memory usage is high

## 🛠️ Technical Details

### Architecture

FastBrowse uses Chrome Extension Manifest V3 with the following components:

- **Background Service Worker**: Handles tab management logic and memory monitoring
- **Popup Interface**: Provides user interface for manual tab control
- **Options Page**: Allows configuration of all settings
- **Chrome APIs Used**:
  - `chrome.tabs` - Tab management and discarding
  - `chrome.system.memory` - Memory usage monitoring
  - `chrome.storage` - Settings persistence
  - `chrome.notifications` - User notifications

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
│   └── options.js         # Options page functionality
├── assets/
│   ├── icon16.png         # 16x16 extension icon
│   ├── icon48.png         # 48x48 extension icon
│   └── icon128.png        # 128x128 extension icon
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
- [ ] Settings save and load properly
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