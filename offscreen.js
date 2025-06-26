chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'copyToClipboard') {
    const textarea = document.createElement('textarea');
    textarea.value = message.text;
    // Prevent scrolling to bottom of page in MS Edge.
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const success = document.execCommand('copy');
      if (success) {
        sendResponse({ success: true });
      } else {
        // Log an error if execCommand fails.
        console.error('document.execCommand failed to copy.');
        sendResponse({ success: false, error: 'document.execCommand failed' });
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      sendResponse({ success: false, error: error.message });
    } finally {
      document.body.removeChild(textarea);
      window.close();
    }

    return true;
  }
});