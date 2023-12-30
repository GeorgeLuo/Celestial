document.getElementById('startCapture').addEventListener('click', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let activeTab = tabs[0];
    chrome.runtime.sendMessage({ action: "startCapture", tabId: activeTab.id });
  });
});

document.getElementById('stopCapture').addEventListener('click', function () {
  let flowLabelField = document.getElementById('flowLabel');
  let labelValue = flowLabelField.value || flowLabelField.placeholder;

  chrome.runtime.sendMessage({ action: "stopCapture", label: labelValue }, function (response) {
    if (response && response.status === 'capture ended') {
      console.log('Capture stopped successfully');
      populateCapturedFlowsDropdown();
    } else {
      console.error('Failed to stop capture');
    }
  });
});

function populateCapturedFlowsDropdown() {
  chrome.storage.local.get(['captureSessions'], function (result) {
    var capturedFlows = result.captureSessions || [];
    var selectElement = document.getElementById('flowsSelect');
    selectElement.innerHTML = '';

    capturedFlows.forEach(function (session, index) {
      var optionElement = document.createElement('option');
      optionElement.value = index;
      optionElement.textContent = session.label || `Flow ${index + 1}`;
      selectElement.appendChild(optionElement);
    });

    selectElement.addEventListener('change', function () {
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

document.addEventListener('DOMContentLoaded', populateCapturedFlowsDropdown);

document.addEventListener('DOMContentLoaded', function () {
  let labelField = document.getElementById('flowLabel');
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let currentTab = tabs[0];
    labelField.placeholder = currentTab.title;
  });
});

// Add this at the end of popup.js

function downloadObjectAsJson(exportObj, exportName) {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

document.getElementById('exportFlows').addEventListener('click', function () {
  chrome.storage.local.get(['captureSessions'], function (result) {
    var capturedFlows = result.captureSessions || [];
    downloadObjectAsJson(capturedFlows, 'capturedFlows');
  });
});
