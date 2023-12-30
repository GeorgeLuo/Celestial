// Define a state variable to track the capturing status
let isCapturing = false;

// Define the captureSession data structure to store session information
let captureSession = {
  startTime: null,
  endTime: null,
  label: "", // Added label to captureSession
  tabDimensions: {},
  events: []
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "startCapture":
      isCapturing = true;
      console.log('startCapture');
      // Save the start time and tab dimensions
      captureSession.startTime = new Date().toISOString();
      chrome.tabs.get(request.tabId, function (tab) {
        captureSession.tabDimensions = {
          width: tab.width,
          height: tab.height
        };
        // Send message to content.js to start capturing
        chrome.tabs.sendMessage(tab.id, { action: "startCapture" });
      });
      break;
    case "stopCapture":
      if (isCapturing) {
        captureSession.label = request.label || captureSession.label;
        // Send message to content.js to stop capturing
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          let activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, { action: "stopCapture" }, function (response) {
            if (response && response.status === 'capture stopped') {
              captureSession.endTime = new Date().toISOString();
              // Fetch the existing captureSessions array, add the new session to it, and save it back
              chrome.storage.local.get({ captureSessions: [] }, function (result) {
                let sessions = result.captureSessions;
                sessions.push(captureSession);
                chrome.storage.local.set({ captureSessions: sessions }, function () {
                  console.log('Capture sessions saved:', sessions);
                  // Reset the captureSession after ensuring it's saved
                  isCapturing = false;
                  captureSession = { startTime: null, endTime: null, tabDimensions: {}, events: [] };
                  sendResponse({ status: 'capture ended', session: captureSession });
                });
              });
            }
          });
        });
      } else {
        console.log('No active capturing session to stop.');
      }
      break;
    case "logClick":
      if (isCapturing) {
        // Push the click event coordinates into the capture session
        captureSession.events.push({
          x: request.x,
          y: request.y,
          time: new Date().toISOString()
        });
      }
      break;
    case "logInput":
      if (isCapturing) {
        // Append the input event with the time and text sent into the capture session
        captureSession.events.push({
          type: "input",
          value: request.value,
          time: new Date().toISOString()
        });
      }
  }
  return true;
});