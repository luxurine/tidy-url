# Tidy URL Chrome Extension

A Chrome extension that helps you clean URLs by removing query parameters, copying them to clipboard, and optionally converting them to markdown format. Perfect for sharing clean links.

## Features

### Main Functions

1. **Tidy & Copy Current Tab**
   - Removes query parameters from current tab's URL
   - Copies the clean URL to clipboard

2. **Tidy & Copy Current Tab as Markdown**
   - Removes query parameters from current tab's URL
   - Copies the URL and page title in markdown format: `[Page Title](URL)`

3. **Tidy & Copy All Tabs**
   - Removes query parameters from all tabs in current window
   - Copies all clean URLs as a bullet-point list

4. **Tidy & Copy All Tabs as Markdown**
   - Removes query parameters from all tabs in current window
   - Copies all URLs and titles as a markdown bullet-point list

### Quick Action Mode

- Enable from extension options (right-click extension icon → Options)
- Performs your chosen action immediately when clicking the extension icon
- Only one quick action can be active at a time

### Keyboard Shortcuts

- **Mac**: ⌘⇧1 through ⌘⇧4 (default)
- **Windows/Linux**: Ctrl+Shift+1 through Ctrl+Shift+4 (default)
- Customizable in Chrome's extension keyboard shortcuts settings

## Installation

### From Source (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension should now appear in your extensions list

### Important Notes

- The extension uses placeholder icons (SVG files renamed as PNG). For production, replace the files in the `icons/` directory with proper PNG icons
- Make sure to test all functionality before deploying

## Usage

### Basic Usage
1. Click the extension icon to open the popup menu
2. Choose one of the four available actions
3. The selected action will be performed immediately

### Quick Action Setup
1. Right-click the extension icon
2. Select "Options"
3. Enable "Quick Action"
4. Select your preferred default action
5. Now clicking the extension icon will perform that action immediately

### Keyboard Shortcuts
1. Use the default shortcuts or customize them
2. To customize: Go to `chrome://extensions/shortcuts`
3. Find "Tidy URL" and set your preferred key combinations

## File Structure

```
tidy-url/
├── manifest.json          # Extension manifest
├── popup.html            # Main popup interface
├── popup.js              # Popup functionality
├── popup.css             # Popup styling
├── options.html          # Options page
├── options.js            # Options functionality
├── options.css           # Options styling
├── background.js         # Background script for shortcuts
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon.svg          # Source SVG
└── README.md
```

## Permissions

The extension requires the following permissions:
- `tabs` - To access tab information and URLs
- `storage` - To save user preferences
- `activeTab` - To interact with the current tab for clipboard operations

## Development

### Testing
1. Load the extension in developer mode
2. Test each of the four main functions
3. Test keyboard shortcuts
4. Test quick action mode
5. Verify options page functionality

### Building for Production
1. Replace placeholder icons with proper PNG files
2. Test thoroughly in different Chrome versions
3. Consider adding proper error handling for edge cases
4. Package for Chrome Web Store submission

## License

This extension is provided as-is for educational and practical use.
