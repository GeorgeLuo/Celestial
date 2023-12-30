// popup.js
document.getElementById('startCapture').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let activeTab = tabs[0];
    
    chrome.tabs.captureVisibleTab(null, {}, function(dataUrl) {
      console.log("startCapture.");
      let initialScreenshot = dataUrl; // Initial screenshot is taken
      localStorage.setItem('initialScreenshot', initialScreenshot);

      // Sending a message to the background script with the tab ID.
      chrome.runtime.sendMessage({
        action: "startCapture",
        tabId: activeTab.id
      });
    });
  });
});

document.getElementById('stopCapture').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let activeTab = tabs[0];
    
    // Sending a message to the background script with the tab ID.
    chrome.runtime.sendMessage({
      action: "stopCapture",
      tabId: activeTab.id
    });
  });
});