// content.js
console.log('content.js loaded and running');

let capturing = false;
let replaying = false;
let pendingEvent = null;

let typingState = {isTyping: false, typingCount: 0};

chrome.runtime.sendMessage({ action: "contentReloaded", currentUrl: window.location.href, time: new Date().toISOString() });

// Ask the background page if it's currently capturing
chrome.runtime.sendMessage({ action: 'checkState' }, function (response) {
  capturing = response.isCapturing;
  replaying = response.isReplaying;
  if (capturing) {
    console.log('Content script reinitialized and capturing is active.');
    enableCaptureListeners();
  }
  if (replaying) {
    console.log('Content script reinitialized and replaying is active.');
  }
});

function handleDocumentClick(event) {
  if (capturing) {
    pendingEvent = {
      action: "captureEvent",
      interactionType: "click",
      x: event.clientX,
      y: event.clientY,
      time: new Date().toISOString()
    };
    chrome.runtime.sendMessage(pendingEvent);
  }
}

function handleTextInput(event) {
  if (capturing) {
    pendingEvent = {
      action: "captureEvent",
      interactionType: "keyInput",
      value: event.key,
      time: new Date().toISOString()
    };
    chrome.runtime.sendMessage(pendingEvent);
  }
}

function handlePasteFromClipboard(event) {
  const clipboardData = event.clipboardData;
  let pastedText = clipboardData.getData('text');
  console.log('Pasted text:', pastedText);
  if (capturing) {
    pendingEvent = {
      action: "captureEvent",
      interactionType: "paste",
      value: pastedText,
      time: new Date().toISOString()
    };
    chrome.runtime.sendMessage(pendingEvent);
  }
}

// Add beforeunload event listener to ensure pending click is sent before navigation
window.addEventListener('beforeunload', function (event) {
  if (pendingEvent) {
    chrome.runtime.sendMessage({ ...pendingEvent, eventBeforeUnload: true });
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
  } else if (request.action === "playEvent") {
    playEvent(request.event);
  }
  // else if (request.action === "replayFlow") {
  //   replayFlow(request.flowData);
  // } 
});

function enableCaptureListeners() {
  console.log("enableCaptureListeners");
  document.addEventListener('mousedown', handleDocumentClick);
  document.addEventListener('keydown', handleTextInput, true);
}

function playEvent(event) {
  console.log("playEvent", event)
  if (event.type === 'click') {
    simulateClick(event.x, event.y);
  } else if (event.type === 'keyInput') {
    simulateInput(event.value);
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
    if (value === "Enter") {
      if (activeElement) {
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