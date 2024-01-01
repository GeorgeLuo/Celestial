// content.js
console.log('content.js loaded and running');

let capturing = false;
let pendingClick = null;

chrome.runtime.sendMessage({ action: "contentReloaded", currentUrl: window.location.href, time: new Date().toISOString() });

// Ask the background page if it's currently capturing
chrome.runtime.sendMessage({ action: 'checkCapturing' }, function (response) {
  capturing = response.isCapturing;
  if (capturing) {
    console.log('Content script reinitialized and capturing is active.');
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleTextInput, true);
  }
});

function handleDocumentClick(event) {
  console.log('handleDocumentClick called'); // Debugging line
  if (capturing) {
    console.log('Capturing click at:', event.clientX, event.clientY); // Another debugging line
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
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleTextInput, true);
  } else if (request.action === "stopCapture") {
    capturing = false;
    document.removeEventListener('mousedown', handleDocumentClick);
    document.removeEventListener('keydown', handleTextInput, true);
    sendResponse({ status: 'capture stopped' });
  } else if (request.action === "replayFlow") {
    replayFlow(request.flowData);
  }
});

function replayFlow(flow) {
  // The tab navigates to the start URL of the flow and then triggers the events.
  window.location.href = flow.startUrl;
  flow.events.forEach(event => {
    if (event.type === 'click') {
      simulateClick(event.x, event.y);
    }
    // Handle 'input' event type for replaying keyboard inputs
    if (event.type === 'input') {
      simulateInput(event.selector, event.value);
    }
    // Add more action simulations as needed, e.g., mouse movements, scrolls, etc.
  });
}

function simulateClick(x, y) {
  console.log(x, y);
  const el = document.elementFromPoint(x, y);
  el && el.click();
}

function simulateInput(value) {
  console.log('simulateInput', value);
  value.split('').forEach(char => {
    let event = new KeyboardEvent('keydown', {
      key: char,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  });
}
