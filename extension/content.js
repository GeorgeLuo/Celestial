// This is the refactored content.js file
console.log('content.js loaded and running');

let capturing = false;

function handleDocumentClick(event) {
  if (capturing) {
    // Send the click coordinates to the background script
    chrome.runtime.sendMessage({
      action: "logClick",
      x: event.clientX,
      y: event.clientY
    });
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Message received in content.js:', request.action);
  switch (request.action) {
    case "startCapture":
      capturing = true;
      console.log('Capturing started', capturing);
      document.addEventListener('click', handleDocumentClick);
      console.log('Click event listener added');
      break;
    case "stopCapture":
      capturing = false;
      document.removeEventListener('click', handleDocumentClick);
      sendResponse({ status: 'capture stopped' });
      console.log('Capturing stopped', capturing);
      break;
  }
});