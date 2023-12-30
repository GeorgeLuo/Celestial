// popup.js
document.getElementById('startCapture').addEventListener('click', function() {
  chrome.tabs.captureVisibleTab(null, {}, function(dataUrl) {
    let initialScreenshot = dataUrl; // Initial screenshot is taken
    localStorage.setItem('initialScreenshot', initialScreenshot);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "startCapture"});
    });
  });
});

document.getElementById('stopCapture').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "stopCapture"});
  });
});
