/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search'], function (serverWidget, search) {

    function onRequest(context) {
        if (context.request.method === 'GET') {
            var form = serverWidget.createForm({
                title: 'Enhanced Data Table'
            });

            
            var htmlField = form.addField({
                id: 'custpage_table',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Table'
            });

           
            var savedSearch = search.load({
                id: 'customsearch1766'
            });

            var results = [];
            savedSearch.run().each(function (result) {
                results.push({
                    name: result.getValue('name'),
                    amount: parseFloat(result.getValue('amount'))
                });
                return true;
            });

           
            var html = '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">';
            html += '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.21/css/jquery.dataTables.css">';
            html += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>';
            html += '<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.21/js/jquery.dataTables.js"></script>';
            html += '<div class="container">';
            html += '<table id="resultsTable" class="table table-striped table-bordered">';
            html += '<thead><tr><th>Name</th><th>Amount</th></tr></thead>';
            html += '<tbody>';
            results.forEach(function (item) {
                html += '<tr><td>' + item.name + '</td><td>' + item.amount + '</td></tr>';
            });
            html += '</tbody>';
            html += '</table>';
            html += '</div>';
            html += '<script>';
            html += '$(document).ready(function() {';
            html += '$("#resultsTable").DataTable();';
            html += '});';
            html += '</script>';

            htmlField.defaultValue = html;

            context.response.writePage(form);
        }
    }

    return {
        onRequest: onRequest
    };
});
