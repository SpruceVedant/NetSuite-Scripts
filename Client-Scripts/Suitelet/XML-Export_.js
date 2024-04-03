/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/search', 'N/file', 'N/encode', 'N/http', 'N/xml'], function(search, file, encode, http, xml) {
    
    function onRequest(context) {
        if (context.request.method === 'GET') {
            var searchId = context.request.parameters.searchid; 
            
            // Check if searchId is provided
            if (!searchId) {
                context.response.write({
                    output: 'Missing or invalid search ID.'
                });
                return;
            }
            
            try {
                var mySearch = search.load({id: searchId}); // Load the Saved Search
                
                // Run the Saved Search
                var searchResult = mySearch.run().getRange({
                    start: 0,
                    end: 1000 // Adjust based on your needs
                });
                
                // Prepare data for Excel file (XML format)
                var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
                xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"';
                xmlStr += ' xmlns:o="urn:schemas-microsoft-com:office:office"';
                xmlStr += ' xmlns:x="urn:schemas-microsoft-com:office:excel"';
                xmlStr += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"';
                xmlStr += ' xmlns:html="http://www.w3.org/TR/REC-html40">';
                xmlStr += '<Worksheet ss:Name="Sheet1"><Table>';
                
                // Assuming first row contains headers
                xmlStr += '<Row>';
                for (var field in searchResult[0].columns) {
                    xmlStr += '<Cell><Data ss:Type="String">' + xml.escape({
                        xmlText: searchResult[0].columns[field].label
                    }) + '</Data></Cell>';
                }
                xmlStr += '</Row>';
                
                // Rows Data
                for (var i = 0; i < searchResult.length; i++) {
                    xmlStr += '<Row>';
                    for (var field in searchResult[i].columns) {
                        var fieldValue = searchResult[i].getValue(searchResult[i].columns[field]);
                        xmlStr += '<Cell><Data ss:Type="String">' + xml.escape({
                            xmlText: fieldValue
                        }) + '</Data></Cell>';
                    }
                    xmlStr += '</Row>';
                }
                
                xmlStr += '</Table></Worksheet></Workbook>';
                
                // Create Excel file
                var fileObj = file.create({
                    name: 'exported_search.xml', // The .xml extension is used here for simplicity
                    fileType: file.Type.PLAINTEXT,
                    contents: xmlStr
                });
                
                context.response.writeFile({
                    file: fileObj,
                    isInline: false
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
