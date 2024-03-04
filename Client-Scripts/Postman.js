// Postman Pre-request Script
const fileEndpoint = 'http://127.0.0.1:8080/demo_extension/example.txt';

pm.sendRequest({
    url: fileEndpoint,
    method: 'GET',
    header: 'Content-Type: application/octet-stream',
}, function (err, response) {
    if (err) {
        console.error('Error fetching file content:', err);
        return;
    }

    const base64Content = response.stream.toString('base64');
    pm.variables.set('fileContent', base64Content);
});
