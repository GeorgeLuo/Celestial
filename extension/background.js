// Define a state variable to track the capturing status
let isCapturing = false;

let knownUrl = "";

// Define the captureSession data structure to store session information
let captureSession = {
  startTime: null,
  endTime: null,
  label: "", // Added label to captureSession
  startUrl: "", // Added startUrl to captureSession
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
        captureSession.startUrl = tab.url;
        knownUrl = tab.url;
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
                  captureSession = { startTime: null, endTime: null, tabDimensions: {}, startUrl: "", events: [] };
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
      console.log('click')
      if (isCapturing) {
        // Push the click event coordinates into the capture session
        captureSession.events.push({
          type: "click",
          x: request.x,
          y: request.y,
          time: request.time
        });
      }
      break;
    case "logInput":
      if (isCapturing) {
        // Append the input event with the time and text sent into the capture session
        captureSession.events.push({
          type: "input",
          value: request.value,
          time: request.time,
          // enterPressed: request.enterPressed
        });
      }
      break;
    case "contentReloaded":
      if (isCapturing) {
        if (knownUrl !== request.currentUrl) {
          captureSession.events.push({
            type: "urlChange",
            value: request.currentUrl,
            time: request.time
          });
          knownUrl = request.currentUrl;
        }
      }
      break;
    case "eventBeforeUnload":
      console.log('eventBeforeUnload event:', request);
      if (isCapturing) {
        // Check if the last event in captureSession.events is the same as the pending click
        const lastEvent = captureSession.events[captureSession.events.length - 1];
        if (!lastEvent || lastEvent.time !== request.time) {
          captureSession.events.push({
            x: request.x,
            y: request.y,
            time: request.time,
            type: "eventBeforeUnload"
          });
        }
      }
      break;
    case "checkCapturing":
      sendResponse({ isCapturing: isCapturing });
      break;
  }
  return true;
});