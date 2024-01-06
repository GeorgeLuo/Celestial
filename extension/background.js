// extension/background.js

let isReplaying = false;

// BEGIN CAPTURE SESSION METADATA

let isCapturing = false;

let fullKeyInputSequence = []
let typeCount = 0;
let nextTypingScreenshotCount = 6;

function setNextTypingScreenshotCount() {
  nextTypingScreenshotCount *= 2;
  console.log(nextTypingScreenshotCount);
}

function resetNextTypingScreenshotCount() {
  if (fullKeyInputSequence.length > 0 && captureSession.screenshots.length > 0) {
    const lastScreenshot = captureSession.screenshots[captureSession.screenshots.length - 1];
    lastScreenshot.values.fullKeyInputSequence = [...fullKeyInputSequence];
    lastScreenshot.values.endKeyInput = true;
  }
  fullKeyInputSequence = [];
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

const EventCaptureType = {
  PASTE: 'paste',
  CLICK: 'click',
  KEY_INPUT: 'keyInput',
  START_CAPTURE: 'startCapture',
  END_OF_CAPTURE: 'endOfCapture'
};

function addEventToCaptureSession(event) {
  console.log("adding event", event);
  let values = {};
  let attemptScreenshot = true;
  switch (event.type) {
    case EventCaptureType.CLICK:
      values = { x: event.x, y: event.y };
      break;
    case EventCaptureType.KEY_INPUT:
      values = { data: event.value, fullKeyInputSequence: [...fullKeyInputSequence] };
      if (typeCount === nextTypingScreenshotCount) {
        setNextTypingScreenshotCount();
        attemptScreenshot = false;
      }
      break;
    case EventCaptureType.PASTE:
      values = { data: event.value };
      break;
  }
  if (attemptScreenshot) takeAndSaveScreenshot(event.type, values = values);
  captureSession.events.push(event);
}

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
    console.log("taking screenshot", dataUrl);
    callback(dataUrl, new Date().toISOString());
  });
}

/**
 * all-in-one screenshotting including rate limiting 
 * and storage
 * @param {*} eventCaptureType 
 * @param {*} values 
 * @returns 
 */
function takeAndSaveScreenshot(eventCaptureType, values = {}, callback) {
  if (captureSession.screenshots.length > 0) {
    const lastScreenshot = captureSession.screenshots[captureSession.screenshots.length - 1];
    const currentTime = new Date().toISOString();
    if (Date.parse(currentTime) - Date.parse(lastScreenshot.time) < 500) {
      console.log("screenshot rate limited", Date.parse(currentTime), Date.parse(lastScreenshot.time));
      return false;
    }
  }
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (dataUrl) {
    console.log("taking screenshot", dataUrl, values);
    storeScreenshot(dataUrl, new Date().toISOString(), eventCaptureType, values);
    if (typeof callback === 'function') {
      callback();
    }
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
function storeScreenshot(dataUrl, time, label, values = {}) {
  console.log('screenshot label:', label);
  captureSession.screenshots.push({ time: time, dataUrl: dataUrl, label: label, screenshotId, values: values });
  screenshotId += 1;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.eventBeforeUnload) {
    if (isCapturing) {
      takeScreenshot(function (dataUrl, screenshotTime) {
        // Check if the last event in captureSession.events is the same as the pending click
        const lastEvent = captureSession.events[captureSession.events.length - 1];
        if (!lastEvent || lastEvent.time !== request.time) {
          addEventToCaptureSession({
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
        // takeScreenshot(function (dataUrl, screenshotTime) {
        //   storeScreenshot(dataUrl, screenshotTime, label = CaptureStage.BEGINNING_OF_CAPTURE);
        // });
        takeAndSaveScreenshot(EventCaptureType.START_CAPTURE);
        chrome.tabs.sendMessage(tab.id, { action: "startCapture" });
      });
      break;
    case "stopCapture":
      if (isCapturing) {
        captureSession.label = request.label || captureSession.label;
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          let activeTab = tabs[0];
          chrome.tabs.sendMessage(activeTab.id, { action: "stopCapture" }, function (response) {
            if (response && response.status === 'capture stopped') {
              captureSession.endTime = new Date().toISOString();
              takeAndSaveScreenshot(EventCaptureType.END_OF_CAPTURE, {}, function () {
                chrome.storage.local.get({ captureSessions: [] }, function (result) {
                  let sessions = result.captureSessions;
                  sessions.push(captureSession);
                  chrome.storage.local.set({ captureSessions: sessions }, function () {
                    console.log('Capture sessions saved:', sessions);
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
          case EventCaptureType.CLICK:
            resetNextTypingScreenshotCount();
            // Take a screenshot when a click event is captured
            addEventToCaptureSession({
              type: EventCaptureType.CLICK,
              x: request.x,
              y: request.y,
              time: request.time,
              trigger: "user"
            });
            break;
          case EventCaptureType.KEY_INPUT:

            // if we're in the middle of typing, we don't need to take a screenshot
            // the final state of text is captured either when text is out of focus (TODO), 
            // out of screen (for instance, scrolling TODO), page change, or on the next click
            // so take the screenshot based on 72 words/minute, average 5 characters per word,
            // 360 character/minute = 6 characters per second, and doubling after every screenshot
            fullKeyInputSequence.push(request.value);
            typeCount += 1;

            addEventToCaptureSession({
              type: EventCaptureType.KEY_INPUT,
              value: request.value,
              time: request.time,
              trigger: "user"
            });
            break;
          case EventCaptureType.PASTE:
            addEventToCaptureSession({
              type: EventCaptureType.PASTE,
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
          addEventToCaptureSession({
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