let capturing = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "startCapture") {
    capturing = true;
  } else if (request.action === "stopCapture") {
    capturing = false;
  }
});

document.addEventListener('click', function() {
  if (capturing) {
    chrome.runtime.sendMessage({action: "capture"});
  }
});
