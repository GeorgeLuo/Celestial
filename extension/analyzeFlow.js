// Function to fetch the flow data from the localStorage
function fetchFlowData() {
    var flowData = localStorage.getItem('selectedFlowData');
    if (flowData) {
        flowData = JSON.parse(flowData);
        flowData.screenshots = flowData.screenshots.filter(function (screenshot) {
            return screenshot.label !== 'KEY_INPUT' || screenshot.values.endKeyInput === true;
        });
        return flowData;
    }
    return null;
}

// Function to display images and their labels in the analyzeFlow.html
function displayImagesWithLabels(flow) {
    var screenshotsContainer = document.getElementById('screenshotsContainer');
    flow.screenshots.forEach(function (screenshotData) {
        var screenshotDiv = document.createElement('div');
        screenshotDiv.className = 'screenshotDiv';

        var img = document.createElement('img');
        img.src = screenshotData.dataUrl;
        screenshotDiv.appendChild(img);

        var labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.className = 'screenshotLabel';
        labelInput.value = createHumanReadableLabel(screenshotData);
        screenshotDiv.appendChild(labelInput);

        screenshotsContainer.appendChild(screenshotDiv);
    });
}

function createHumanReadableLabel(screenshotData) {
    if (screenshotData.label === 'CLICK') {
        return `click at position (${screenshotData.values.x}, ${screenshotData.values.y})`;
    } else if (screenshotData.label === 'KEY_INPUT' || screenshotData.values.endKeyInput === true) {
        var label = 'input text "';
        let lastChar = '"';
        for (var i = 0; i < screenshotData.values.fullKeyInputSequence.length; i++) {
            var key = screenshotData.values.fullKeyInputSequence[i];
            if (key === 'Enter' && i === screenshotData.values.fullKeyInputSequence.length - 1) {
                lastChar = '';
                label += '" and press Enter';
                break;
            } else {
                label += key;
            }
        }
        label += lastChar;
        return label;
    }
    return screenshotData.label;
}

document.addEventListener('DOMContentLoaded', function () {
    var flowData = fetchFlowData();
    if (flowData) {
        displayImagesWithLabels(flowData);  // Updated function call
        console.log(flowData);
    } else {
        console.error('Flow data is not available.');
    }
});
