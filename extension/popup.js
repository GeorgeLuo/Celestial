// popup.js
// This event handler initializes the capture process
document.getElementById('startCapture').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let activeTab = tabs[0];
    // Take an initial screenshot and send a message to start capture
    chrome.tabs.captureVisibleTab(null, {}, function(dataUrl) {
      if (chrome.runtime.lastError) {
        // Handle error
        console.error("Error capturing the visible tab: ", chrome.runtime.lastError.message);
        return;
      }
      console.log("startCapture.");
      let initialScreenshot = dataUrl; // Initial screenshot is taken
      localStorage.setItem('initialScreenshot', initialScreenshot);

      // Sending a message to the background script with the tab ID
      // The message now includes a directive to indicate a screenshot has been captured
      chrome.runtime.sendMessage({
        action: "startCapture",
        tabId: activeTab.id,
        captured: true
      });
    });
  });
});

// This event handler finalizes the capture process
document.getElementById('stopCapture').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let activeTab = tabs[0];
    
    // Sending a message to the background script to stop the capture
    chrome.runtime.sendMessage({
      action: "stopCapture",
      tabId: activeTab.id
    });
  });
});