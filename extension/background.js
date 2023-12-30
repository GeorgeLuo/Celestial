// background.js - rewritten for Manifest V3

let captureMetadata = { start: null, stop: null, windowSize: {} };

function setWindowSize(tabId, callback) {
  chrome.tabs.get(tabId, (tab) => {
    captureMetadata.windowSize = { width: tab.width, height: tab.height };
    if (typeof callback === 'function') {
      callback();
    }
  });
}

function captureTab(tabId) {
  captureMetadata.start = new Date();
  setWindowSize(tabId, () => {});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startCapture") {
    captureMetadata.start = Date.now();
    if (sender.tab) {
      captureTab(sender.tab.id);
      sendResponse({ status: 'capture started' });
    }
  } else if (request.action === "stopCapture") {
    captureMetadata.stop = Date.now();
    if (sender.tab) {
      const currentTabID = sender.tab.id;
      if (!captureMetadata.windowSize.width || !captureMetadata.windowSize.height) {
        setWindowSize(currentTabID, () => {
          try {
            chrome.tabs.captureVisibleTab(
              chrome.windows.WINDOW_ID_CURRENT, 
              { format: 'png' },
              (dataUrl) => {}
            );
          } catch (error) {
            console.error(error);
          }
        });
      } else {
        try {
          chrome.tabs.captureVisibleTab(
            chrome.windows.WINDOW_ID_CURRENT, 
            { format: 'png' },
            (dataUrl) => {}
          );
        } catch (error) {
          console.error(error);
        }
      }
    }
    sendResponse({ status: 'capture ended', metadata: captureMetadata });
  }
});
