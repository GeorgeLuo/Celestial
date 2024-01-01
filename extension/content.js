// This is the modified content.js file
console.log('content.js loaded and running');

let capturing = false;
let pendingClick = null;

chrome.runtime.sendMessage({ action: "contentReloaded", currentUrl: window.location.href, time: new Date().toISOString() });

// Ask the background page if it's currently capturing
chrome.runtime.sendMessage({ action: 'checkCapturing' }, function (response) {
  capturing = response.isCapturing;
  if (capturing) {
    console.log('Content script reinitialized and capturing is active.');
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleTextInput, true);
  }
});

function handleDocumentClick(event) {
  if (capturing) {
    // Send the click coordinates to the background script
    pendingClick = {
      action: "logClick",
      x: event.clientX,
      y: event.clientY,
      time: new Date().toISOString() // Log the time to resolve any race conditions later
    };
    chrome.runtime.sendMessage(pendingClick);
  }
}

// Add beforeunload event listener to ensure pending click is sent before navigation
window.addEventListener('beforeunload', function (event) {
  if (pendingClick) {
    chrome.runtime.sendMessage({ ...pendingClick, action: "eventBeforeUnload" });
    pendingClick = null;
  }
}, false);

function handleTextInput(event) {
  if (capturing) {
    chrome.runtime.sendMessage({
      action: "logInput",
      value: event.key,
      time: new Date().toISOString()
    });
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "startCapture") {
    capturing = true;
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleTextInput, true);
  } else if (request.action === "stopCapture") {
    capturing = false;
    document.removeEventListener('click', handleDocumentClick);
    document.removeEventListener('keydown', handleTextInput, true);
    sendResponse({ status: 'capture stopped' });
  } else if (request.action === "replayFlow") {
    replayFlow(request.flowData);
  }
});

function replayFlow(flow) {
  window.location.href = flow.startUrl;
  flow.events.forEach(event => {
    if (event.type === 'click') {
      simulateClick(event.x, event.y);
    }
    // Add more action simulations as needed, e.g., keystrokes, etc.
  });
}

function simulateClick(x, y) {
  console.log(x, y)
  const el = document.elementFromPoint(x, y);
  el && el.click();
}

function simulateAction(action) {
  if (action.type === 'click') {
    simulateClick(action.x, action.y);
  }
  // Add more action types as needed
}