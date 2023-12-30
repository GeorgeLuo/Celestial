document.getElementById('startCapture').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let activeTab = tabs[0];
    chrome.runtime.sendMessage({action: "startCapture", tabId: activeTab.id});
  });
});

document.getElementById('stopCapture').addEventListener('click', function() {
  let flowLabelField = document.getElementById('flowLabel');
  let labelValue = flowLabelField.value || flowLabelField.placeholder;

  chrome.runtime.sendMessage({action: "stopCapture", label: labelValue}, function(response) {
    if (response && response.status === 'capture ended') {
      console.log('Capture stopped successfully');
    } else {
      console.error('Failed to stop capture');
    }
  });
});

// Function to populate the dropdown with captured user flow metadata
function populateCapturedFlowsDropdown() {
  chrome.storage.local.get(['captureSessions'], function(result) {
    var capturedFlows = result.captureSessions || [];
    var selectElement = document.getElementById('flowsSelect');
    selectElement.innerHTML = ''; // Clear existing options if any

    capturedFlows.forEach(function(session, index) {
      var optionElement = document.createElement('option');
      optionElement.value = index;
      optionElement.textContent = session.label || `Flow ${index + 1}`;
      selectElement.appendChild(optionElement);
    });
    
    // Listen for changes on the dropdown to display the selected flow's details
    selectElement.addEventListener('change', function() {
      var selectedIndex = selectElement.options[selectElement.selectedIndex].value;
      var selectedFlow = capturedFlows[selectedIndex];
      
      if (selectedFlow) {
        document.getElementById('flowDetails').textContent = JSON.stringify(selectedFlow, null, 2);
      } else {
        document.getElementById('flowDetails').textContent = '';
      }
    });
  });
}

// Call the function to populate the dropdown when the popup is opened
document.addEventListener('DOMContentLoaded', populateCapturedFlowsDropdown);

// Code remains unchanged below
document.addEventListener('DOMContentLoaded', function() {
  let labelField = document.getElementById('flowLabel');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let currentTab = tabs[0];
    labelField.placeholder = currentTab.title;
  });
});