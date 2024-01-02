// Define a state variable to track the capturing status
let isCapturing = false;
let isReplaying = false;

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

function replayFlow(flow) {
  // The tab navigates to the start URL of the flow and then triggers the events.
  // window.location.href = flow.startUrl;
  // Function to execute each event after a delay

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let activeTab = tabs[0];

    function sendEvent(event, index) {
      setTimeout(() => {

        chrome.tabs.sendMessage(activeTab.id, { action: "playEvent", event: event });

        // If there are more events, call the next event
        if (index < flow.events.length - 1) {
          sendEvent(flow.events[index + 1], index + 1);
        } else {
          isReplaying = false;
        }
      }, 1000); // Delay of 1000ms (1 second) between each event. Adjust as necessary.
    }
    // Start executing the first event after a delay to allow page load
    if (flow.events.length > 0) {
      sendEvent(flow.events[0], 0);
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.eventBeforeUnload) {
    console.log('eventBeforeUnload event:', request);
    if (isCapturing) {
      // Check if the last event in captureSession.events is the same as the pending click
      const lastEvent = captureSession.events[captureSession.events.length - 1];
      if (!lastEvent || lastEvent.time !== request.time) {
        captureSession.events.push({
          x: request.x,
          y: request.y,
          time: request.time,
          type: request.type
        });
      }
    }
    return
  }
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
    case "captureEvent":
      if (isCapturing) {
        switch (request.opType) {
          case "click":
            captureSession.events.push({
              type: "click",
              x: request.x,
              y: request.y,
              time: request.time
            });
            break;
          case "input":
            captureSession.events.push({
              type: "input",
              value: request.value,
              time: request.time
            });
            break;
        }
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
    case "checkState":
      sendResponse({ isCapturing: isCapturing, isReplaying: isReplaying });
      break;
    case "replayFlow":
      // send one event at a time to content.js from popup.js message
      isReplaying = true;
      sendResponse({ replayStarted: true });
      replayFlow(request.flowData);
      break;
    case "endReplay":
      replayFlow = false;
      sendResponse({ replayEnded: true });
      break;
    // case "replayFlow":
    //   // start replaying the flow in the active tab
    //   isReplaying = true;
    //   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //     let activeTab = tabs[0];
    //     chrome.tabs.sendMessage(activeTab.id, { action: "replayFlow", flowData: request.flowData });
    //   });
    //   // Optionally, return a response message
    //   sendResponse({ replayStarted: true });
    //   break;
  }
  return true;
});