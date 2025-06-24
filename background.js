// Utility function to remove query parameters from URL
function tidyUrl(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch (e) {
    return url; // Return original if parsing fails
  }
}

// Copy text to clipboard using the offscreen document method
async function copyToClipboard(text) {
  try {
    // For Manifest V3, we need to use the offscreen document or tabs API
    // Since we have activeTab permission, we can inject a script to copy
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (textToCopy) => {
        navigator.clipboard.writeText(textToCopy);
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
    console.log('Current tab URL copied:', tidiedUrl);
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
    console.log('Current tab markdown copied:', markdownText);
  } catch (err) {
    console.error('Error in tidyCurrentTabMarkdown:', err);
  }
}

async function tidyAllTabs() {
  try {
    const tabs = await getAllTabs();
    const tidiedUrls = tabs.map(tab => `• ${tidyUrl(tab.url)}`).join('\n');
    await copyToClipboard(tidiedUrls);
    console.log(`${tabs.length} tab URLs copied`);
  } catch (err) {
    console.error('Error in tidyAllTabs:', err);
  }
}

async function tidyAllTabsMarkdown() {
  try {
    const tabs = await getAllTabs();
    const markdownList = tabs.map(tab => `• [${tab.title}](${tidyUrl(tab.url)})`).join('\n');
    await copyToClipboard(markdownList);
    console.log(`${tabs.length} tab markdown links copied`);
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
  console.log('Command received:', command);
  
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
  console.log('Extension icon clicked');
  
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
  console.log('Tidy URL extension installed/updated');
  
  if (details.reason === 'install') {
    // Set default options on first install
    chrome.storage.sync.set({
      quickActionEnabled: false,
      quickActionType: 'tidy-current'
    });
  }
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    console.log('Storage changed:', changes);
  }
});
