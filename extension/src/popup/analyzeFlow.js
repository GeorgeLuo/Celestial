let flowData = {};

function fetchFlowData() {
    var flowData = localStorage.getItem('selectedFlowData');
    if (flowData) {
        flowData = JSON.parse(flowData);
        flowData.screenshots = flowData.screenshots.filter(function (screenshot) {
            console.log(screenshot.label);
            return screenshot.label !== 'keyInput' || screenshot.values.endKeyInput === true;
        });
        return flowData;
    }
    return null;
}

function displayImagesWithLabels(flow) {
    var screenshotsContainer = document.getElementById('screenshotsContainer');
    flow.screenshots.forEach(function (screenshotData, index) {
        var screenshotDiv = document.createElement('div');
        screenshotDiv.className = 'screenshotDiv';
        var img = document.createElement('img');
        img.src = screenshotData.dataUrl;
        screenshotDiv.appendChild(img);
        var labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.className = 'screenshotLabel';

        let displayLabel = createHumanReadableLabel(screenshotData);
        labelInput.value = displayLabel;
        labelInput.dataset.index = index;
        flowData.screenshots[index].generatedLabel = displayLabel;

        labelInput.addEventListener('change', function (event) {
            var newIndex = event.target.dataset.index;
            flowData.screenshots[newIndex].modifiedLabel = event.target.value;
        });
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

function downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

document.getElementById('exportModifiedFlowsWithoutImages').addEventListener('click', function () {
    exportModifiedFlow(flowData, includeImages = false);
});

document.addEventListener('DOMContentLoaded', function () {
    var retrievedFlowData = fetchFlowData();
    if (retrievedFlowData) {
        flowData = retrievedFlowData;
        displayImagesWithLabels(flowData);
        console.log(flowData);
    } else {
        console.error('Flow data is not available.');
    }

    document.getElementById('exportModifiedFlow').addEventListener('click', function () {
        exportModifiedFlow(flowData, true);
    });

    var namedLabelInput = document.getElementById('namedFlowLabel');
    if (flowData && flowData.label) {
        namedLabelInput.value = flowData.label;
    }

    namedLabelInput.addEventListener('change', function (event) {
        flowData.namedLabel = event.target.value;
    });
});