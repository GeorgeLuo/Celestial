// This is the refactored content.js file
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
  // If there is a pending click, send it
  console.log('beforeunload: Preparing to send pending click:', pendingClick);
  if (pendingClick) {
    chrome.runtime.sendMessage({ ...pendingClick, action: "eventBeforeUnload" });
    pendingClick = null; // Clear the pending click
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
  console.log('Message received in content.js:', request.action);
  switch (request.action) {
    case "startCapture":
      capturing = true;
      // Add listeners for click and input events when capture starts
      console.log('Capturing started', capturing);
      document.addEventListener('click', handleDocumentClick);
      document.addEventListener('keydown', handleTextInput, true);
      console.log('Event listeners added');
      break;
    case "stopCapture":
      capturing = false;
      // Remove listeners for click and input events when capture stops
      document.removeEventListener('click', handleDocumentClick);
      document.addEventListener('keydown', handleTextInput, true);
      sendResponse({ status: 'capture stopped' });
      console.log('Capturing stopped', capturing);
      break;
  }
});