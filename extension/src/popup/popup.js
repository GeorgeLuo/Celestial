// button handlers

function loadSettings() {
  chrome.storage.sync.get(['mimodexHost'], function(result) {
    document.getElementById('mimodexHost').value = result.mimodexHost || 'http://localhost:4999';
  });
}
// Save settings function from the original settings.js
function saveSettings() {
  let mimodexHost = document.getElementById('mimodexHost').value;
  chrome.storage.sync.set({mimodexHost: mimodexHost}, function() {
    console.log('Settings saved');
    toggleSettings(); // Hide settings div after saving
  });
}
// Toggles the settings div visibility
function toggleSettings() {
  console.log("toggleSettings")
  let settingsDiv = document.getElementById("settingsModal");
  if (settingsDiv.style.top === "0px") {
    settingsDiv.style.top = "-100%"; // Hide the settings div by moving it out of view
  } else {
    settingsDiv.style.top = "0px"; // Show the settings div by moving it into view
  }
}
// Event listeners
document.getElementById("settingsButton").addEventListener("click", function() {
  toggleSettings();
  loadSettings(); // Ensure settings are up-to-date when showing the div
});
document.getElementById('saveSettings').addEventListener('click', saveSettings);

document.getElementById("startCapture").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let activeTab = tabs[0];
    chrome.runtime.sendMessage({ action: "startCapture", tabId: activeTab.id });
  });
});

document.getElementById("stopCapture").addEventListener("click", function () {
  let flowLabelField = document.getElementById("flowLabel");
  let labelValue = flowLabelField.value || flowLabelField.placeholder;

  chrome.runtime.sendMessage(
    { action: "stopCapture", label: labelValue },
    function (response) {
      if (response && response.status === "capture ended") {
        console.log("Capture stopped successfully");
        populateCapturedFlowsDropdown();
      } else {
        console.error("Failed to stop capture");
      }
    },
  );
});

document.getElementById("replayFlow").addEventListener("click", function () {
  var selectedFlowIndex = document.getElementById("flowsSelect").value;
  chrome.storage.local.get(["captureSessions"], function (result) {
    var capturedFlows = result.captureSessions || [];
    var selectedFlow = capturedFlows[selectedFlowIndex];
    if (selectedFlow) {
      console.log(selectedFlow);
      chrome.runtime.sendMessage(
        { action: "replayFlow", flowData: selectedFlow },
        function (response) {
          if (response && response.replayStarted) {
            window.close(); // Closes the popup
          } else {
            console.error("Error starting replay flow.");
          }
        },
      );
    } else {
      console.error("Selected flow index is not valid.");
    }
  });
});

document.getElementById("exportFlow").addEventListener("click", function () {
  var selectedFlowIndex = document.getElementById("flowsSelect").value;
  chrome.storage.local.get(["captureSessions"], function (result) {
    var capturedFlows = result.captureSessions || [];
    var selectedFlow = capturedFlows[selectedFlowIndex];
    if (selectedFlow) {
      exportModifiedFlow(selectedFlow, true);
    } else {
      console.error("Selected flow index is not valid.");
    }
  });
});

document
  .getElementById("exportToMimodex")
  .addEventListener("click", function () {
    var selectedFlowIndex = document.getElementById("flowsSelect").value;
    chrome.storage.local.get(["captureSessions"], function (result) {
      var capturedFlows = result.captureSessions || [];
      var selectedFlow = capturedFlows[selectedFlowIndex];
      if (selectedFlow) {
        exportModifiedFlow(selectedFlow, true, false).then(function (zipBlob) {
          uploadZipAndRedirect(zipBlob);
        }).catch(function (error) {
          console.error("Error generating zip Blob:", error);
        });
      } else {
        console.error("Selected flow index is not valid.");
      }
    });
  });

// Initialize and save default mimodexHost if it's not set
chrome.storage.sync.get(["mimodexHost"], function (result) {
  if (!result.mimodexHost) {
    // Set the default value since it's not already set
    chrome.storage.sync.set({ mimodexHost: "http://localhost:4999" }, function () {
      console.log("mimodexHost default value set to http://localhost:4999");
    });
  }
});

function uploadZipAndRedirect(zipFile) {
  var formData = new FormData();
  formData.append("file", zipFile, "flow.zip");
  // Retrieve the mimodexHost value and use it in the fetch call
  chrome.storage.sync.get(["mimodexHost"], function (result) {
    const mimodexHost = result.mimodexHost;
    fetch(mimodexHost + "/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.url) {
          console.log("opening new tab", data.url);
          chrome.tabs.create({ url: data.url });
        }
      })
      .catch((error) => console.error("Error uploading flow zip:", error));
  });
}

document.getElementById("exportFlows").addEventListener("click", function () {
  chrome.storage.local.get(["captureSessions"], function (result) {
    var capturedFlows = result.captureSessions || [];
    var dataToSave = { captureSessions: capturedFlows };
    downloadObjectAsJson(dataToSave, "capturedFlows");
  });
});

document.getElementById("analyzeFlow").addEventListener("click", function () {
  var selectedFlowIndex = document.getElementById("flowsSelect").value;
  chrome.storage.local.get(["captureSessions"], function (result) {
    var capturedFlows = result.captureSessions || [];
    var selectedFlow = capturedFlows[selectedFlowIndex];
    if (selectedFlow) {
      localStorage.setItem("selectedFlowData", JSON.stringify(selectedFlow));
      var newWindow = window.open(
        "analyzeFlow.html",
        "Flow Analysis Window",
        "width=600, height=400",
      );
    } else {
      console.error("Selected flow index is not valid.");
    }
  });
});

document.getElementById("clearFlows").addEventListener("click", function () {
  chrome.storage.local.remove(["captureSessions"], function () {
    populateCapturedFlowsDropdown();
  });
});

// on load listeners

document.addEventListener("DOMContentLoaded", populateCapturedFlowsDropdown);

document.addEventListener("DOMContentLoaded", function () {
  let labelField = document.getElementById("flowLabel");
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let currentTab = tabs[0];
    labelField.placeholder = currentTab.title;
  });
  document.getElementById('settingsModal').style.top = "-100%"; // Start with the settings div hidden
  loadSettings(); // Pre-load settings upon DOMContentLoaded

});

// utilities

function populateCapturedFlowsDropdown() {
  chrome.storage.local.get(["captureSessions"], function (result) {
    var capturedFlows = result.captureSessions || [];
    var selectElement = document.getElementById("flowsSelect");
    selectElement.innerHTML = "";
    capturedFlows.forEach(function (session, index) {
      var optionElement = document.createElement("option");
      optionElement.value = index;
      optionElement.textContent = session.label || `Flow ${index + 1}`;
      selectElement.appendChild(optionElement);
    });
    // Set the selected index to the last option if there are any captured flows
    if (capturedFlows.length > 0) {
      selectElement.selectedIndex = capturedFlows.length - 1;
    }
  });
}

function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}