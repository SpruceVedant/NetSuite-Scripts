/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/search', 'N/file', 'N/encode'], function(search, file, encode) {
    
    function onRequest(context) {
        if (context.request.method === 'GET') {
            var searchId = context.request.parameters.searchid; // Get Saved Search ID from request parameter
            
            if (!searchId) {
                context.response.write({
                    output: 'Missing or invalid search ID.'
                });
                return;
            }
            
            try {
                var mySearch = search.load({
                    id: searchId
                });
                
                var searchResult = mySearch.run().getRange({
                    start: 0,
                    end: 1000 // Adjust based on your needs
                });
                
                var csvContent = '';
                // Header
                var headers = mySearch.columns.map(function(col) {
                    return col.label || col.name; // Fallback to name if label is undefined
                });
                csvContent += headers.join(',') + '\n';
                
                // Rows
                searchResult.forEach(function(result) {
                    var row = mySearch.columns.map(function(col) {
                        var value = result.getValue(col);
                        return '"' + value.replace(/"/g, '""') + '"'; // Escape double quotes
                    });
                    csvContent += row.join(',') + '\n';
                });
                
                // Create CSV file
                var csvFile = file.create({
                    name: 'exported_search.csv',
                    fileType: file.Type.CSV,
                    contents: csvContent,
                    folder: -15
                });

                // Save the file in the File Cabinet
                var fileId = csvFile.save();
                
               context.response.write({
                    output: 'File saved with ID: ' + fileId
                });
            } catch (e) {
                context.response.write({
                    output: 'Error: ' + e.message
                });
            }
        }
    }
    
    return {
        onRequest: onRequest
    };
});
