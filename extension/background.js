// background.js
let captureMetadata = { start: null, stop: null, windowSize: {} };

function setWindowSize(tabId, callback) {
  chrome.tabs.get(tabId, function(tab) {
    if (chrome.runtime.lastError) {
      // Log the error
      console.error('Error retrieving the tab:', chrome.runtime.lastError);
      return;
    }
    captureMetadata.windowSize = { width: tab.width, height: tab.height };
    if (typeof callback === 'function') {
      callback();
    }
  });
}

// This function will be called by the popup script.
function captureTab(tabId) {
  captureMetadata.start = new Date();

  setWindowSize(tabId, function() {
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Message received:', request); // This should log any incoming message

  if (request.action === "startCapture") {
    if (request.tabId) {
      // The tab ID is sent from popup.js, use it directly
      captureTab(request.tabId);
    } else if (sender.tab) {
      // The tab ID was not sent from popup.js, so get it from sender.tab
      captureTab(sender.tab.id);
    }
  } else if (request.action === "stopCapture") {
    captureMetadata.stop = new Date();
    if (sender.tab || request.tabId) {
      const currentTabID = sender.tab ? sender.tab.id : request.tabId; 
      if (!captureMetadata.windowSize.width || !captureMetadata.windowSize.height) {
        setWindowSize(currentTabID, function() {
          chrome.tabs.captureVisibleTab(null, {}, function(dataUrl) {
          });
        });
      } else {
        chrome.tabs.captureVisibleTab(null, {}, function(dataUrl) {
        });
      }
    }
    console.log(captureMetadata);
  }
});