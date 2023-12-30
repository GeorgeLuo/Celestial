document.getElementById('startCapture').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let activeTab = tabs[0];
    chrome.runtime.sendMessage({action: "startCapture", tabId: activeTab.id});
  });
});

document.getElementById('stopCapture').addEventListener('click', function() {
  chrome.runtime.sendMessage({action: "stopCapture"}, function(response) {
    if (response && response.status === 'capture ended') {
      console.log('Capture stopped successfully');
    } else {
      console.error('Failed to stop capture');
    }
  });
});

// Code below remains unchanged
document.addEventListener('DOMContentLoaded', function() {
  let labelField = document.getElementById('flowLabel');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      let currentTab = tabs[0];
      labelField.placeholder = currentTab.title;
  });
});