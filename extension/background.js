// background.js
console.log("Background script loaded and running.");
let captureMetadata = { start: null, stop: null, windowSize: {} };

function setWindowSize(tabId, callback) {
  console.log('setting window size')
  chrome.tabs.get(tabId, function(tab) {
    if (chrome.runtime.lastError) {
      // Log the error
      console.error('Error retrieving the tab:', chrome.runtime.lastError);
      return;
    }

    console.log('Tab:', tab); // This is where we expect to see the "Tab:" log
    captureMetadata.windowSize = { width: tab.width, height: tab.height };
    if (typeof callback === 'function') {
      callback();
    }
  });
}

// This function will be called by the popup script.
function captureTab(tabId) {
  console.log('Capture started');
  captureMetadata.start = new Date();

  setWindowSize(tabId, function() {
    console.log('Window size set:', captureMetadata.windowSize);
    // you can call other function here to handle the tab capture.
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
    console.log('Capture stopped');
    captureMetadata.stop = new Date();
    console.log(sender);
    if (sender.tab || request.tabId) {
      const currentTabID = sender.tab ? sender.tab.id : request.tabId; 
      if (!captureMetadata.windowSize.width || !captureMetadata.windowSize.height) {
        console.log('about to set window size');
        setWindowSize(currentTabID, function() {
          chrome.tabs.captureVisibleTab(null, {}, function(dataUrl) {
            // Capture logic here, now that windowSize is guaranteed to be set
          });
        });
      } else {
        // windowSize has been set, proceed to capture directly
        chrome.tabs.captureVisibleTab(null, {}, function(dataUrl) {
          // Capture logic here
        });
      }
    }
    console.log(captureMetadata);
  }
});