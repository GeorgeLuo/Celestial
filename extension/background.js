// background.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "startCapture") {
    console.log('Capture started');
  } else if (request.action === "stopCapture") {
    console.log('Capture stopped');
  } else if (request.action === "capture") {
    chrome.tabs.captureVisibleTab(null, {}, function(dataUrl) {
    });
  }
});