// background.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "capture") {
    chrome.tabs.captureVisibleTab(null, {}, function(dataUrl) {
      // Save the dataUrl or do something with it here
      // For example, send it back to the popup.js or content.js
    });
  }
});
