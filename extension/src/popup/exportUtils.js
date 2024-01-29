function exportModifiedFlow(flowData, includeImages = true) {
    if (flowData) {
        let cleanFlowData = {...flowData};
        console.log(cleanFlowData);
        cleanFlowData.screenshots = cleanFlowData.screenshots.map(s => ({...s, dataUrl: undefined}));

        if (includeImages) {
            let cleanFlowData = JSON.parse(JSON.stringify(flowData));

            var zip = new JSZip();
            zip.file("flow.json", JSON.stringify(cleanFlowData, null, 2));
            var imgFolder = zip.folder("screenshots");

            cleanFlowData.screenshots.forEach(screenshot => {
                if (typeof screenshot.dataUrl === 'undefined') {
                    console.log('no screenshot');
                    return;
                }
                var base64Data = screenshot.dataUrl.split(';base64,').pop();
                var imgData = atob(base64Data);
                var imgArray = new Uint8Array(imgData.length);
                for (var i = 0; i < imgData.length; i++) {
                    imgArray[i] = imgData.charCodeAt(i);
                }
                const date = new Date(screenshot.time);

                var fileName = `${Math.floor(date.getTime() / 1000)}_${screenshot.screenshotId}.png`;
                screenshot.dataUrl = undefined;
                screenshot.filename = fileName;

                imgFolder.file(fileName, imgArray, { base64: true });
            });

            zip.file("flow.json", JSON.stringify(cleanFlowData, null, 2));

            zip.generateAsync({ type: "blob" }).then(function (content) {
                saveAs(content, "exportedFlow.zip");
            });
        } else {
            // Export only the JSON data without images.
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cleanFlowData));
            var downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "exportedFlow.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
    } else {
        console.error('Flow data is not available for export.');
    }
}

window.exportModifiedFlow = exportModifiedFlow;
