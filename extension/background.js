// Define a state variable to track the capturing status
let isCapturing = false;

// Define the captureSession data structure to store session information
let captureSession = {
  startTime: null,
  endTime: null,
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
      chrome.tabs.get(request.tabId, function(tab) {
        captureSession.tabDimensions = {
          width: tab.width,
          height: tab.height
        };
        // Send message to content.js to start capturing
        chrome.tabs.sendMessage(tab.id, { action: "startCapture" });
      });
      break;
    case "stopCapture":
      if(isCapturing) {
        // Send message to content.js to stop capturing
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          let activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, { action: "stopCapture" }, function(response) {
            if (response && response.status === 'capture stopped') {
              captureSession.endTime = new Date().toISOString();
              console.log('Capture stopped:', captureSession);
              sendResponse({ status: 'capture ended', session: captureSession });
              // After stopping the capture, reset the captureSession
              isCapturing = false;
              captureSession = { startTime: null, endTime: null, tabDimensions: {}, events: [] };
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
  }
  return true;
});
