// content.js
console.log('content.js loaded and running');

let capturing = false;
let pendingEvent = null;

chrome.runtime.sendMessage({ action: "contentReloaded", currentUrl: window.location.href, time: new Date().toISOString() });

// Ask the background page if it's currently capturing
chrome.runtime.sendMessage({ action: 'checkCapturing' }, function (response) {
  capturing = response.isCapturing;
  if (capturing) {
    console.log('Content script reinitialized and capturing is active.');
    enableCaptureListeners();
  }
});

function handleDocumentClick(event) {
  console.log('handleDocumentClick called'); // Debugging line
  if (capturing) {
    console.log('Capturing click at:', event.clientX, event.clientY); // Another debugging line
    pendingEvent = {
      action: "logClick",
      x: event.clientX,
      y: event.clientY,
      time: new Date().toISOString() // Log the time to resolve any race conditions later
    };
    chrome.runtime.sendMessage(pendingEvent);
  }
}

function handleTextInput(event) {
  if (capturing) {
    pendingEvent = {
      action: "logInput",
      value: event.key,
      time: new Date().toISOString()
    };
    chrome.runtime.sendMessage(pendingEvent);
  }
}

// Add beforeunload event listener to ensure pending click is sent before navigation
window.addEventListener('beforeunload', function (event) {
  if (pendingEvent) {
    chrome.runtime.sendMessage({ ...pendingEvent, action: "eventBeforeUnload", eventBeforeUnload: true });
    pendingEvent = null;
  }
}, false);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "startCapture") {
    capturing = true;
    enableCaptureListeners();
  } else if (request.action === "stopCapture") {
    capturing = false;
    document.removeEventListener('mousedown', handleDocumentClick);
    document.removeEventListener('keydown', handleTextInput, true);
    sendResponse({ status: 'capture stopped' });
  } else if (request.action === "replayFlow") {
    console.log('replayFlow')
    replayFlow(request.flowData);
  }
});

function enableCaptureListeners() {
  document.addEventListener('mousedown', handleDocumentClick);
  document.addEventListener('keydown', handleTextInput, true);
}

function replayFlow(flow) {
  // The tab navigates to the start URL of the flow and then triggers the events.
  // window.location.href = flow.startUrl;
  // Function to execute each event after a delay
  function executeEvent(event, index) {
    setTimeout(() => {
      if (event.type === 'click') {
        simulateClick(event.x, event.y);
      } else if (event.type === 'input') {
        simulateInput(event.value);
      }

      // If there are more events, call the next event
      if (index < flow.events.length - 1) {
        executeEvent(flow.events[index + 1], index + 1);
      }
    }, 333); // Delay of 1000ms (1 second) between each event. Adjust as necessary.
  }
  // Start executing the first event after a delay to allow page load
  if (flow.events.length > 0) {
    executeEvent(flow.events[0], 0);
  }
}

function simulateClick(x, y) {
  console.log(x, y);
  const el = document.elementFromPoint(x, y);
  if (el) {
    let clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    });
    el.dispatchEvent(clickEvent);
    // If the element is focusable, focus it to ensure cursor appears
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.focus();
    }
  }
}

function simulateInput(value) {
  console.log('simulateInput', value);
  const activeElement = document.activeElement;
  if (value.length > 1) {
    console.log("length > 1");
    if (value === "Enter") {
      console.log("value is enter");
      if (activeElement) {
        console.log("sending enter");
        const event = new KeyboardEvent('keydown', {
          code: 'Enter',
          key: 'Enter',
          charCode: 13,
          keyCode: 13,
          view: window,
          bubbles: true
        });
        activeElement.dispatchEvent(event);
      }
    }
  } else
  // Send the string to the currently active/focused element
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    // Append the incoming string to the existing content
    activeElement.value += value;
    // Dispatch the input event to trigger change handlers on the element
    const event = new Event('input', { bubbles: true });
    activeElement.dispatchEvent(event);
  } else {
    console.warn('simulateInput: No input field focused.');
  }
}
