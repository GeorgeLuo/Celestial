// Function to fetch the flow data from the localStorage
function fetchFlowData() {
    var flowData = localStorage.getItem('selectedFlowData');
    if (flowData) {
        return JSON.parse(flowData);
    }
    return null;
}

// Function to display images in the analyzeFlow.html
function displayImages(flow) {
    var screenshotsContainer = document.getElementById('screenshotsContainer');
    flow.screenshots.forEach(function (screenshotData) {
        var img = document.createElement('img');
        img.src = screenshotData.dataUrl;
        screenshotsContainer.appendChild(img);
    });
}
document.addEventListener('DOMContentLoaded', function () {
    var flowData = fetchFlowData();
    if (flowData) {
        displayImages(flowData); // Call the new function to display images
        // All the code related to analyzing the flow using the fetched flowData goes here
        console.log(flowData);
    } else {
        console.error('Flow data is not available.');
    }
});