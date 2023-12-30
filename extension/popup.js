// popup.js
document.getElementById('startCapture').addEventListener('click', function() {
  chrome.tabs.captureVisibleTab(null, {}, function(dataUrl) {
    console.log("startCapture.");
    let initialScreenshot = dataUrl; // Initial screenshot is taken
    localStorage.setItem('initialScreenshot', initialScreenshot);

    // Sending a message to the background script instead of the content script.
    chrome.runtime.sendMessage({action: "startCapture"});
  });
});

document.getElementById('stopCapture').addEventListener('click', function() {
  // Sending a message to the background script instead of the content script.
  chrome.runtime.sendMessage({action: "stopCapture"});
});
