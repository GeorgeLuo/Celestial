// extension/background.js

let isReplaying = false;

// BEGIN CAPTURE SESSION METADATA

let isCapturing = false;

let typeCount = 0;
let nextTypingScreenshotCount = 6;

function setNextTypingScreenshotCount() {
  nextTypingScreenshotCount *= 2;
  console.log(nextTypingScreenshotCount);
}

function resetNextTypingScreenshotCount() {
  typeCount = 0;
  nextTypingScreenshotCount = 6;

}

let knownUrl = "";
let screenshotId = 0;

// Define the captureSession data structure to store session information
let captureSession = {
  startTime: null,
  endTime: null,
  label: "", // Added label to captureSession
  startUrl: "", // Added startUrl to captureSession
  tabDimensions: {},
  events: [],
  screenshots: []
};

function resetCaptureMetadata() {
  isCapturing = false;

  resetNextTypingScreenshotCount();

  knownUrl = "";
  screenshotId = 0;
  captureSession = {
    startTime: null,
    endTime: null,
    label: "",
    startUrl: "",
    tabDimensions: {},
    events: [],
    screenshots: []
  };
}

// END CAPTURE SESSION METADATA

function replayFlow(flow) {
  // The tab navigates to the start URL of the flow and then triggers the events.
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let activeTab = tabs[0];
    chrome.windows.update(activeTab.windowId, { width: flow.tabDimensions.width, height: flow.tabDimensions.height }, function () {
      chrome.tabs.update(activeTab.id, { url: flow.startUrl }, function (tab) {
        if (tab) {
          function sendEvent(event, index) {
            // Get the delay before sending the event. For the first event it's 1 second, for others calculate the difference between the events
            const delay = index === 0 ? 1000 : new Date(flow.events[index].time).getTime() - new Date(flow.events[index - 1].time).getTime();

            setTimeout(() => {
              if (event.trigger === "user") {
                chrome.tabs.sendMessage(activeTab.id, { action: "playEvent", event: event });
              }

              // If there are more events, call the next event
              if (index < flow.events.length - 1) {
                sendEvent(flow.events[index + 1], index + 1);
              } else {
                isReplaying = false;
              }
            }, delay); // Dynamic delay between each event
          }
          // Start executing the first event after a delay to allow page load
          if (flow.events.length > 0) {
            sendEvent(flow.events[0], 0);
          }
        }
      });
    });
  });
}

function takeScreenshot(callback) {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (dataUrl) {
    console.log("taking screenshot");
    callback(dataUrl, new Date().toISOString());
  });
}

const CaptureStage = {
  BEGINNING_OF_CAPTURE: 'BEGINNING_OF_CAPTURE',
  KEY_INPUT: 'KEY_INPUT',
  CLICK: 'CLICK',
  BEFORE_UNLOAD: 'BEFORE_UNLOAD',
  AFTER_LOAD: 'AFTER_LOAD',
  END_OF_CAPTURE: 'END_OF_CAPTURE'
};

/**
 * screenshots are taken primarily to track what happens at various stable states. 
 * So the label may take the values of 
 * 
 * BEGINNING_OF_CAPTURE, 
 * KEY_INPUT, 
 * CLICK, 
 * BEFORE_UNLOAD,
 * AFTER_LOAD,
 * END_OF_CAPTURE
 * 
 * @param {*} callback 
 */
function storeScreenshot(dataUrl, time, label) {
  console.log('screenshot label:', label);
  captureSession.screenshots.push({ time: time, dataUrl: dataUrl, label: label, screenshotId });
  screenshotId += 1;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.eventBeforeUnload) {
    if (isCapturing) {
      takeScreenshot(function (dataUrl, screenshotTime) {
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
        storeScreenshot(dataUrl, screenshotTime, label = CaptureStage.BEFORE_UNLOAD);
      });
    }
    return
  }
  switch (request.action) {
    // port signal from popup.js to content.js to start capturing
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
        takeScreenshot(function (dataUrl, screenshotTime) {
          storeScreenshot(dataUrl, screenshotTime, label = CaptureStage.BEGINNING_OF_CAPTURE);
        });
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
              takeScreenshot(function (dataUrl, screenshotTime) {
                storeScreenshot(dataUrl, screenshotTime, label = CaptureStage.END_OF_CAPTURE);
                // Fetch the existing captureSessions array, add the new session to it, and save it back
                chrome.storage.local.get({ captureSessions: [] }, function (result) {
                  let sessions = result.captureSessions;
                  sessions.push(captureSession);
                  chrome.storage.local.set({ captureSessions: sessions }, function () {
                    console.log('Capture sessions saved:', sessions);
                    // Reset the captureSession after ensuring it's saved
                    resetCaptureMetadata();
                    sendResponse({ status: 'capture ended', session: captureSession });
                  });
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
        switch (request.interactionType) {
          case "click":
            resetNextTypingScreenshotCount();
            console.log(request, request.interactionType, request.x, request.y);
            // Take a screenshot when a click event is captured
            takeScreenshot(function (dataUrl, screenshotTime) {
              captureSession.events.push({
                type: "click",
                x: request.x,
                y: request.y,
                time: request.time,
                trigger: "user"
              });
              storeScreenshot(dataUrl, screenshotTime, label = CaptureStage.CLICK);
            });
            break;
          case "keyInput":
            console.log(request.interactionType, request.value);
            captureSession.events.push({
              type: "keyInput",
              value: request.value,
              time: request.time,
              trigger: "user"
            });

            // if we're in the middle of typing, we don't need to take a screenshot
            // the final state of text is captured either when text is out of focus (TODO), 
            // out of screen (for instance, scrolling TODO), page change, or on the next click
            // so take the screenshot based on 72 words/minute, average 5 characters per word,
            // 360 character/minute = 6 characters per second, and doubling after every screenshot

            typeCount += 1;
            if (typeCount === nextTypingScreenshotCount) {
              takeScreenshot(function (dataUrl, screenshotTime) {
                if (typeCount === nextTypingScreenshotCount) {
                  storeScreenshot(dataUrl, screenshotTime, label = CaptureStage.KEY_INPUT);
                  setNextTypingScreenshotCount();
                }
              });
            }
            break;
          case "paste":
            captureSession.events.push({
              type: "paste",
              value: request.value,
              trigger: "user"
            });
            break;
        }
      }
      break;
    case "contentReloaded":
      if (isCapturing) {
        resetNextTypingScreenshotCount();
        if (knownUrl !== request.currentUrl) {
          captureSession.events.push({
            type: "urlChange",
            value: request.currentUrl,
            time: request.time,
            trigger: "page"
          });
          knownUrl = request.currentUrl;
          takeScreenshot(function (dataUrl, screenshotTime) {
            storeScreenshot(dataUrl, screenshotTime, label = CaptureStage.AFTER_LOAD);
          });
        }
      }
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
    case "checkState":
      sendResponse({ isCapturing: isCapturing, isReplaying: isReplaying });
      break;
  }
  return true;
});