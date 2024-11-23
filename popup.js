// Function to remove query parameters from URL
function tidyUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.origin + urlObj.pathname;
  } catch (e) {
    console.error('Invalid URL:', e);
    return url;
  }
}

// Function to copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    console.error('Failed to copy:', e);
  }
}

// Function to create markdown link
function createMarkdownLink(title, url) {
  return `[${title}](${url})`;
}

// Handle current tab operations
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// Handle all tabs operations
async function getAllTabs() {
  return await chrome.tabs.query({ currentWindow: true });
}

// Function to close popup window
function closePopup() {
  window.close();
}

// Function to perform quick action
async function performQuickAction(action) {
  switch (action) {
    case 'tidy-current-refresh':
      const tab = await getCurrentTab();
      const tidiedUrl = tidyUrl(tab.url);
      await chrome.tabs.update(tab.id, { url: tidiedUrl });
      break;
    case 'tidy-current-copy':
      const tab2 = await getCurrentTab();
      await copyToClipboard(tidyUrl(tab2.url));
      break;
    case 'tidy-current-markdown':
      const tab3 = await getCurrentTab();
      const markdown = createMarkdownLink(tab3.title, tidyUrl(tab3.url));
      await copyToClipboard(markdown);
      break;
    case 'tidy-all-copy':
      const tabs = await getAllTabs();
      const tidiedUrls = tabs
        .map(tab => `- ${tidyUrl(tab.url)}`)
        .join('\n');
      await copyToClipboard(tidiedUrls);
      break;
    case 'tidy-all-markdown':
      const tabs2 = await getAllTabs();
      const markdownLinks = tabs2
        .map(tab => `- ${createMarkdownLink(tab.title, tidyUrl(tab.url))}`)
        .join('\n');
      await copyToClipboard(markdownLinks);
      break;
  }
  closePopup();
}

// Check for quick action when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const { quickAction, quickActionOption } = await chrome.storage.sync.get({
    quickAction: false,
    quickActionOption: 'tidy-current-refresh'
  });

  if (quickAction) {
    await performQuickAction(quickActionOption);
  }
});

// Event handlers for each button
document.getElementById('tidyRefresh').addEventListener('click', async () => {
  await performQuickAction('tidy-current-refresh');
});

document.getElementById('tidyCopy').addEventListener('click', async () => {
  await performQuickAction('tidy-current-copy');
});

document.getElementById('tidyMarkdown').addEventListener('click', async () => {
  await performQuickAction('tidy-current-markdown');
});

document.getElementById('tidyAllCopy').addEventListener('click', async () => {
  await performQuickAction('tidy-all-copy');
});

document.getElementById('tidyAllMarkdown').addEventListener('click', async () => {
  await performQuickAction('tidy-all-markdown');
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  await performQuickAction(command);
});
