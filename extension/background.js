// background.js
console.log("Background script loaded and running.");
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Message received:', request); // This should log any incoming message
  if (request.action === "startCapture") {
    console.log('Capture started');
  } else if (request.action === "stopCapture") {
    console.log('Capture stopped');
  } else if (request.action === "capture") {
    chrome.tabs.captureVisibleTab(null, {}, function(dataUrl) {
    });
  }
});