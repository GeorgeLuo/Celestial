// Function to fetch the flow data from the localStorage
function fetchFlowData() {
    var flowData = localStorage.getItem('selectedFlowData');
    if (flowData) {
        return JSON.parse(flowData);
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
        labelInput.value = screenshotData.label +
                           (Object.keys(screenshotData.values).length > 0 ?
                           ': ' + JSON.stringify(screenshotData.values) : '');
        screenshotDiv.appendChild(labelInput);

        screenshotsContainer.appendChild(screenshotDiv);
    });
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
