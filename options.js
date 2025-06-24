// DOM elements
const quickActionEnabledCheckbox = document.getElementById('quickActionEnabled');
const quickActionTypeSelect = document.getElementById('quickActionType');
const quickActionOptions = document.getElementById('quickActionOptions');
const saveButton = document.getElementById('saveOptions');
const openShortcutsButton = document.getElementById('openShortcutsPage');
const statusDiv = document.getElementById('status');

// Show status message
function showStatus(message, isError = false) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${isError ? 'error' : 'success'}`;
  
  setTimeout(() => {
    statusDiv.textContent = '';
    statusDiv.className = 'status';
  }, 3000);
}

// Load saved options
async function loadOptions() {
  try {
    const result = await chrome.storage.sync.get([
      'quickActionEnabled',
      'quickActionType'
    ]);
    
    quickActionEnabledCheckbox.checked = result.quickActionEnabled || false;
    quickActionTypeSelect.value = result.quickActionType || 'tidy-current';
    
    // Show/hide quick action options based on checkbox state
    toggleQuickActionOptions();
  } catch (error) {
    console.error('Failed to load options:', error);
    showStatus('Failed to load options', true);
  }
}

// Save options
async function saveOptions() {
  try {
    const options = {
      quickActionEnabled: quickActionEnabledCheckbox.checked,
      quickActionType: quickActionTypeSelect.value
    };
    
    await chrome.storage.sync.set(options);
    showStatus('Options saved successfully!');
  } catch (error) {
    console.error('Failed to save options:', error);
    showStatus('Failed to save options', true);
  }
}

// Toggle quick action options visibility
function toggleQuickActionOptions() {
  if (quickActionEnabledCheckbox.checked) {
    quickActionOptions.style.display = 'block';
  } else {
    quickActionOptions.style.display = 'none';
  }
}

// Open Chrome's keyboard shortcuts page
function openShortcutsPage() {
  chrome.tabs.create({
    url: 'chrome://extensions/shortcuts'
  });
}

// Update shortcut display based on platform
function updateShortcutDisplay() {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const keyElements = document.querySelectorAll('.keys');
  
  keyElements.forEach(keyEl => {
    if (isMac) {
      keyEl.textContent = keyEl.getAttribute('data-mac');
    } else {
      keyEl.textContent = keyEl.getAttribute('data-default');
    }
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load options when page loads
  loadOptions();
  
  // Update shortcut display for current platform
  updateShortcutDisplay();
  
  // Quick action checkbox toggle
  quickActionEnabledCheckbox.addEventListener('change', toggleQuickActionOptions);
  
  // Save button
  saveButton.addEventListener('click', saveOptions);
  
  // Open shortcuts page button
  openShortcutsButton.addEventListener('click', openShortcutsPage);
  
  // Auto-save when options change
  quickActionEnabledCheckbox.addEventListener('change', saveOptions);
  quickActionTypeSelect.addEventListener('change', saveOptions);
});

// Handle storage changes from other contexts
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    // Reload options if they were changed elsewhere
    loadOptions();
  }
});
