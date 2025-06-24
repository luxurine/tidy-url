// Utility function to remove query parameters from URL
function tidyUrl(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch (e) {
    return url; // Return original if parsing fails
  }
}

// Copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
}

// Show status message
function showStatus(message, isError = false) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${isError ? 'error' : 'success'}`;
  
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'status';
  }, 2000);
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

// Action handlers
async function tidyCurrentTab() {
  try {
    const tab = await getCurrentTab();
    const tidiedUrl = tidyUrl(tab.url);
    const success = await copyToClipboard(tidiedUrl);
    
    if (success) {
      showStatus('Current tab URL copied!');
    } else {
      showStatus('Failed to copy URL', true);
    }
  } catch (err) {
    showStatus('Error processing current tab', true);
  }
}

async function tidyCurrentTabMarkdown() {
  try {
    const tab = await getCurrentTab();
    const tidiedUrl = tidyUrl(tab.url);
    const markdownText = `[${tab.title}](${tidiedUrl})`;
    const success = await copyToClipboard(markdownText);
    
    if (success) {
      showStatus('Current tab markdown copied!');
    } else {
      showStatus('Failed to copy markdown', true);
    }
  } catch (err) {
    showStatus('Error processing current tab', true);
  }
}

async function tidyAllTabs() {
  try {
    const tabs = await getAllTabs();
    const tidiedUrls = tabs.map(tab => `• ${tidyUrl(tab.url)}`).join('\n');
    const success = await copyToClipboard(tidiedUrls);
    
    if (success) {
      showStatus(`${tabs.length} tab URLs copied!`);
    } else {
      showStatus('Failed to copy URLs', true);
    }
  } catch (err) {
    showStatus('Error processing tabs', true);
  }
}

async function tidyAllTabsMarkdown() {
  try {
    const tabs = await getAllTabs();
    const markdownList = tabs.map(tab => `• [${tab.title}](${tidyUrl(tab.url)})`).join('\n');
    const success = await copyToClipboard(markdownList);
    
    if (success) {
      showStatus(`${tabs.length} tab markdown copied!`);
    } else {
      showStatus('Failed to copy markdown', true);
    }
  } catch (err) {
    showStatus('Error processing tabs', true);
  }
}

// Check if we should perform quick action
async function checkQuickAction() {
  const result = await chrome.storage.sync.get(['quickActionEnabled', 'quickActionType']);
  
  if (result.quickActionEnabled && result.quickActionType) {
    // Perform the quick action and close popup
    await performAction(result.quickActionType);
    window.close();
    return true;
  }
  return false;
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
  }
}

// Update shortcut display based on platform
function updateShortcutDisplay() {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcuts = document.querySelectorAll('.btn-shortcut');
  
  if (!isMac) {
    document.body.classList.add('shortcut-ctrl');
    shortcuts.forEach((shortcut, index) => {
      const ctrlShortcuts = ['Ctrl+⇧1', 'Ctrl+⇧2', 'Ctrl+⇧3', 'Ctrl+⇧4'];
      shortcut.textContent = ctrlShortcuts[index] || '';
    });
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  updateShortcutDisplay();
  
  // Check for quick action first
  const isQuickAction = await checkQuickAction();
  if (isQuickAction) {
    return; // Quick action performed, popup will close
  }
  
  // Set up button event listeners
  document.getElementById('tidy-current').addEventListener('click', () => {
    tidyCurrentTab();
    setTimeout(() => window.close(), 1000);
  });
  
  document.getElementById('tidy-current-markdown').addEventListener('click', () => {
    tidyCurrentTabMarkdown();
    setTimeout(() => window.close(), 1000);
  });
  
  document.getElementById('tidy-all').addEventListener('click', () => {
    tidyAllTabs();
    setTimeout(() => window.close(), 1000);
  });
  
  document.getElementById('tidy-all-markdown').addEventListener('click', () => {
    tidyAllTabsMarkdown();
    setTimeout(() => window.close(), 1000);
  });
});
