// settings.js

// This function loads the saved settings from chrome.storage when the settings page is opened.
function loadSettings() {
    chrome.storage.sync.get(['mimodexHost'], function(result) {
      document.getElementById('mimodexHost').value = result.mimodexHost || 'http://localhost:4999';
    });
  }
  
  // This function saves the settings to chrome.storage when the save button is clicked.
  function saveSettings() {
    let mimodexHost = document.getElementById('mimodexHost').value;
    chrome.storage.sync.set({mimodexHost: mimodexHost}, function() {
      console.log('Settings saved');
    });
  }
  
  // Event listeners are added to the window object to load and save settings appropriately.
  window.addEventListener('DOMContentLoaded', loadSettings);
  document.getElementById('saveSettings').addEventListener('click', saveSettings);