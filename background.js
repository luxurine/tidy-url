// Utility function to remove query parameters from URL
function tidyUrl(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch (e) {
    return url; // Return original if parsing fails
  }
}

// Copy text to clipboard using content script injection
async function copyToClipboard(text) {
  try {
    // First try offscreen document method
    try {
      const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [chrome.runtime.getURL('offscreen.html')]
      });

      if (existingContexts.length === 0) {
        await chrome.offscreen.createDocument({
          url: 'offscreen.html',
          reasons: ['CLIPBOARD'],
          justification: 'Write text to clipboard'
        });
      }

      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: 'copyToClipboard',
          text: text
        }, (response) => {
          if (chrome.runtime.lastError) {
            resolve(null);
          } else {
            resolve(response);
          }
        });
      });

      if (response && response.success) {
        return true;
      }
    } catch (offscreenError) {
      // Silently fallback to content script method
    }

    // Fallback to content script method
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (textToCopy) => {
        // Use execCommand method to avoid permission dialog
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textarea);
        return result;
      },
      args: [text]
    });
    
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

// Get current tab
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// Get all tabs in current window
async function getAllTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  return tabs;
}

// Action implementations
async function tidyCurrentTab() {
  try {
    const tab = await getCurrentTab();
    const tidiedUrl = tidyUrl(tab.url);
    await copyToClipboard(tidiedUrl);
  } catch (err) {
    console.error('Error in tidyCurrentTab:', err);
  }
}

async function tidyCurrentTabMarkdown() {
  try {
    const tab = await getCurrentTab();
    const tidiedUrl = tidyUrl(tab.url);
    const markdownText = `[${tab.title}](${tidiedUrl})`;
    await copyToClipboard(markdownText);
  } catch (err) {
    console.error('Error in tidyCurrentTabMarkdown:', err);
  }
}

async function tidyAllTabs() {
  try {
    const tabs = await getAllTabs();
    const tidiedUrls = tabs.map(tab => `• ${tidyUrl(tab.url)}`).join('\n');
    await copyToClipboard(tidiedUrls);
  } catch (err) {
    console.error('Error in tidyAllTabs:', err);
  }
}

async function tidyAllTabsMarkdown() {
  try {
    const tabs = await getAllTabs();
    const markdownList = tabs.map(tab => `• [${tab.title}](${tidyUrl(tab.url)})`).join('\n');
    await copyToClipboard(markdownList);
  } catch (err) {
    console.error('Error in tidyAllTabsMarkdown:', err);
  }
}

// Perform action by type
async function performAction(actionType) {
  switch (actionType) {
    case 'tidy-current':
      await tidyCurrentTab();
      break;
    case 'tidy-current-markdown':
      await tidyCurrentTabMarkdown();
      break;
    case 'tidy-all':
      await tidyAllTabs();
      break;
    case 'tidy-all-markdown':
      await tidyAllTabsMarkdown();
      break;
    default:
      console.error('Unknown action type:', actionType);
  }
}

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case 'tidy-current':
      await performAction('tidy-current');
      break;
    case 'tidy-current-markdown':
      await performAction('tidy-current-markdown');
      break;
    case 'tidy-all':
      await performAction('tidy-all');
      break;
    case 'tidy-all-markdown':
      await performAction('tidy-all-markdown');
      break;
  }
});

// Handle extension icon click for quick actions
chrome.action.onClicked.addListener(async (tab) => {
  // Check if quick action is enabled
  const result = await chrome.storage.sync.get(['quickActionEnabled', 'quickActionType']);
  
  if (result.quickActionEnabled && result.quickActionType) {
    // Perform quick action
    await performAction(result.quickActionType);
  }
  // If quick action is not enabled, the popup will show (default behavior)
});

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default options on first install
    chrome.storage.sync.set({
      quickActionEnabled: false,
      quickActionType: 'tidy-current'
    });
  }
});


