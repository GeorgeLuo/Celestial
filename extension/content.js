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

// Function to track input events on text fields
function handleTextInput(event) {
  if (capturing) {
    chrome.runtime.sendMessage({
      action: "logInput",
      value: event.target.value
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
      document.addEventListener('input', handleTextInput, true); // Use event delegation for dynamic inputs
      console.log('Event listeners added');
      break;
    case "stopCapture":
      capturing = false;
      // Remove listeners for click and input events when capture stops
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('input', handleTextInput, true);
      sendResponse({ status: 'capture stopped' });
      console.log('Capturing stopped', capturing);
      break;
  }
});

// Ensure to add the input event listener only once and use event delegation to handle dynamic inputs
// This will also take care of any new inputs added to the DOM after the initial page load
document.documentElement.addEventListener('input', handleTextInput, true);
