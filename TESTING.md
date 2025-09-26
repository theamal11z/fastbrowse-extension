# FastBrowse Testing & Debugging Guide

## Quick Start Testing

1. **Load the extension**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" 
   - Click "Load unpacked" and select this directory

2. **Open the background console**:
   - In `chrome://extensions/`, find FastBrowse
   - Click "service worker" to open the background script console
   - You'll see initialization logs and debug info here

3. **Test tab suspension**:
   - Open several tabs (3-4 tabs minimum)
   - Click the FastBrowse extension icon
   - Click "Test Suspend" to immediately suspend one tab
   - Check the background console for detailed logs

## Debugging Steps

### 1. Check Background Script
- Open the service worker console from chrome://extensions/
- Look for these messages:
  - `FastBrowse initialized` - Extension loaded properly
  - `FastBrowse received message: testSuspend` - Popup communication works
  - `Attempting to suspend tab X: [title]` - Suspension attempt
  - `✓ Tab X successfully suspended` - Successful suspension

### 2. Test Manual Suspension
- Use the "Test Suspend" button in the popup
- This will attempt to suspend the first eligible inactive tab
- Watch both popup behavior and background console logs

### 3. Check Tab Status
- In the popup, look for tabs marked as "suspended" (greyed out)
- Suspended tabs should have a "Restore" button instead of "Suspend"
- Click on a suspended tab to restore and activate it

### 4. Verify Chrome Tab Discarding
After suspending tabs, check in Chrome Task Manager (`Shift+Esc`):
- Suspended tabs should show much lower memory usage
- Tab titles might show as greyed out in the tab bar
- Clicking a suspended tab should reload it

## Common Issues & Solutions

### Issue: "No tabs to suspend"
- **Cause**: All tabs are either active or protected (pinned, playing audio)
- **Solution**: Open more tabs, ensure some are inactive and not pinned

### Issue: Extension doesn't load
- **Cause**: Missing icon files or manifest errors
- **Solution**: Check that icon files exist in assets/ folder
- Set placeholder icons if needed

### Issue: No communication with background script
- **Cause**: Service worker not running or message handling errors
- **Solution**: 
  - Reload the extension
  - Check service worker console for errors
  - Verify manifest permissions

### Issue: Tabs don't appear suspended
- **Cause**: Chrome might not visually indicate discarded tabs
- **Solution**: 
  - Check memory usage in Task Manager
  - Look for "discarded" property in background logs
  - Try clicking the tab to see if it reloads

## Automatic Suspension Testing

1. **Set short delay**:
   - Go to Options page (right-click extension → Options)  
   - Set suspension delay to 1 minute
   - Enable auto-suspend

2. **Test automatic suspension**:
   - Open multiple tabs
   - Switch to one tab and wait 1-2 minutes
   - Other tabs should automatically suspend
   - Check background console for timer logs

## Debug Commands

Open the background console and try these:

```javascript
// Check current state
fastBrowse.suspendedTabs
fastBrowse.tabTimers

// Force suspend all tabs
fastBrowse.suspendAllTabs()

// Get current settings
fastBrowse.settings

// Check memory info
chrome.system.memory.getInfo().then(console.log)
```

## Expected Behavior

### Successful Tab Suspension:
1. Tab memory usage drops significantly
2. Tab may appear greyed/dimmed in tab bar
3. Clicking the tab reloads it (brief loading screen)
4. Background console shows "✓ Tab X successfully suspended"
5. Popup shows tab as "suspended" with restore button

### Failed Tab Suspension:
1. Background console shows warnings or errors
2. Tab memory usage remains high
3. Tab appears normal in tab bar
4. Popup still shows "Suspend" button for the tab

## Performance Verification

1. **Before suspension**: Note total browser memory in Task Manager
2. **After suspension**: Memory should decrease noticeably
3. **Individual tabs**: Suspended tabs show ~1-10MB vs 100MB+ for active tabs
4. **Extension overhead**: FastBrowse itself should use minimal memory (<5MB)

## Next Steps for Issues

If suspension still doesn't work:

1. **Check Chrome version**: Ensure you're using a recent version
2. **Test with simple tabs**: Try suspending tabs with simple content (not complex web apps)
3. **Review permissions**: Ensure all required permissions are granted
4. **Manual API testing**: Test `chrome.tabs.discard()` directly in console
5. **Alternative approach**: Consider using tab URL manipulation instead of native discard API

Remember: Chrome's native tab discarding is designed to be subtle - the main indicator is reduced memory usage, not dramatic visual changes.