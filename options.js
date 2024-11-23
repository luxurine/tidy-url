// Save options to chrome.storage
function saveOptions() {
  const quickAction = document.getElementById('quickAction').checked;
  const quickActionOption = document.querySelector('input[name="quickActionOption"]:checked')?.value || 'tidy-current-refresh';
  
  chrome.storage.sync.set(
    {
      quickAction: quickAction,
      quickActionOption: quickActionOption,
    },
    () => {
      // Update status to let user know options were saved
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      status.classList.add('success');
      setTimeout(() => {
        status.textContent = '';
        status.classList.remove('success');
      }, 1500);
    }
  );
}

// Restore options from chrome.storage
function restoreOptions() {
  chrome.storage.sync.get(
    {
      quickAction: false,
      quickActionOption: 'tidy-current-refresh',
    },
    (items) => {
      document.getElementById('quickAction').checked = items.quickAction;
      updateSubOptions(items.quickAction);
      if (items.quickAction) {
        const radio = document.querySelector(`input[name="quickActionOption"][value="${items.quickActionOption}"]`);
        if (radio) {
          radio.checked = true;
        }
      }
    }
  );
}

// Update sub-options based on main option state
function updateSubOptions(enabled) {
  const subOptions = document.querySelectorAll('input[name="quickActionOption"]');
  subOptions.forEach((option) => {
    option.disabled = !enabled;
  });

  // If enabling and no option is selected, select the first one
  if (enabled && !document.querySelector('input[name="quickActionOption"]:checked')) {
    subOptions[0].checked = true;
  }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('quickAction').addEventListener('change', (e) => {
  updateSubOptions(e.target.checked);
  saveOptions();
});
document.querySelectorAll('input[name="quickActionOption"]').forEach((radio) => {
  radio.addEventListener('change', saveOptions);
});
