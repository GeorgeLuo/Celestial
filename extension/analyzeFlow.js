// Function to fetch the flow data from the localStorage
function fetchFlowData() {
    var flowData = localStorage.getItem('selectedFlowData');
    if (flowData) {
        flowData = JSON.parse(flowData);
        flowData.screenshots = flowData.screenshots.filter(function (screenshot) {
            return screenshot.label !== 'keyInput' || screenshot.values.endKeyInput === true;
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
    if (screenshotData.label === 'click') {
        return `click at position (${screenshotData.values.x}, ${screenshotData.values.y})`;
    } else if (screenshotData.label === 'keyInput' || screenshotData.values.endKeyInput === true) {
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
    } else if (screenshotData.label === 'paste') {
        return `paste text "${screenshotData.values.data}"`;
    } else if (screenshotData.label === 'scroll') {
        const position = determineScrollPosition(screenshotData.values);
        return `scroll to ${position}`;
    }
    return screenshotData.label;
}

// Helper function to determine the scroll position in human-readable terms
function determineScrollPosition(values) {
    const topThreshold = 0.2; // Top 20% of the page
    const bottomThreshold = 0.8; // Bottom 20% of the page
    // You would typically need the total height of the page to calculate this accurately.
    // For this example, we'll assume this information is already available in our values object
    const pageHeight = values.pageHeight;
    const scrollPositionPercentage = values.scrollY / pageHeight;
    if (scrollPositionPercentage < topThreshold) {
        return 'the top of the page';
    } else if (scrollPositionPercentage >= topThreshold && scrollPositionPercentage <= bottomThreshold) {
        return 'the middle of the page';
    } else {
        return 'the bottom of the page';
    }
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
