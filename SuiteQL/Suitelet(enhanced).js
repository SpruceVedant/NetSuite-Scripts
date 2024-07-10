/**
 * @NScriptType Suitelet
 * @NApiVersion 2.x
 */
define(['N/query', 'N/ui/serverWidget', 'N/log', 'N/file'], function(query, serverWidget, log, file) {

    var file_folder = -15; 
    function runQuery(sql, limitRows) {
        var response = { columns: [], rows: [], error: undefined };
        if (limitRows != undefined && limitRows > 0) sql = 'SELECT * FROM (' + sql + ') WHERE ROWNUM <= ' + limitRows;

        try {
            var result = query.runSuiteQL({ query: sql });
        } catch (e) {
            response.error = e.message;
            return response;
        }

        log.debug('query returned', result.results.length + ' results');

        for (var i = 0; i < result.results.length; i++) {
            if (response.columns.length == 0) {
                response.columns = Object.keys(result.results[i].asMap());
            }
            response.rows.push(result.results[i].values);
        }

        return response;
    }

    function generateHTMLTable(result) {
        var html = '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.11.5/css/jquery.dataTables.css">';
        html += '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/responsive/2.2.9/css/responsive.dataTables.min.css">';
        html += '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/2.2.3/css/buttons.dataTables.min.css">';
        html += '<script type="text/javascript" charset="utf8" src="https://code.jquery.com/jquery-3.5.1.js"></script>';
        html += '<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.js"></script>';
        html += '<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/responsive/2.2.9/js/dataTables.responsive.min.js"></script>';
        html += '<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/2.2.3/js/dataTables.buttons.min.js"></script>';
        html += '<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/2.2.3/js/buttons.flash.min.js"></script>';
        html += '<script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>';
        html += '<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/2.2.3/js/buttons.html5.min.js"></script>';
        html += '<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/buttons/2.2.3/js/buttons.print.min.js"></script>';
        html += '<script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.36/pdfmake.min.js"></script>';
        html += '<script type="text/javascript" charset="utf8" src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.36/vfs_fonts.js"></script>';

      
        html += '<style>';
        html += 'table.dataTable tbody tr:hover { background-color: #f5f5f5; }';
        html += '</style>';

        html += '<table id="resultsTable" class="display responsive nowrap" style="width:100%">';
        html += '<thead><tr>';

     
        result.columns.forEach(function(column) {
            html += '<th>' + column + '</th>';
        });

        html += '</tr></thead>';
        html += '<tbody>';

    
        result.rows.forEach(function(row) {
            html += '<tr>';
            row.forEach(function(cell) {
                html += '<td>' + (cell != null ? cell : '') + '</td>';
            });
            html += '</tr>';
        });

        html += '</tbody></table>';

        html += '<script>';
        html += '$(document).ready(function() {';
        html += '    $("#resultsTable").DataTable({';
        html += '        responsive: true,';
        html += '        dom: "Bfrtip",';
        html += '        buttons: [';
        html += '            "copy", "csv", "excel", "pdf", "print"';
        html += '        ]';
        html += '    });';
        html += '} );';
        html += '</script>';

        return html;
    }

    return {
        onRequest: function(context) {
            var form = serverWidget.createForm({ title: 'Run SuiteQL Query' });

            
            var sql_field = form.addField({
                id: 'custpage_sql_field',
                type: serverWidget.FieldType.TEXTAREA,
                label: 'Query'
            }).updateBreakType({
                breakType: serverWidget.FieldBreakType.STARTCOL
            }).updateDisplaySize({
                height: 15,
                width: 150
            });

           
            var limit_rows = form.addField({
                id: 'custpage_limit_field',
                type: serverWidget.FieldType.INTEGER,
                label: 'Limit Rows'
            }).updateBreakType({
                breakType: serverWidget.FieldBreakType.STARTCOL
            }).updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.STARTROW
            });

           
            var output_type = form.addField({
                id: 'custpage_output_selector',
                type: serverWidget.FieldType.SELECT,
                label: 'Output Type'
            }).updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.ENDROW
            });
            output_type.addSelectOption({
                value: 'grid',
                text: 'Table'
            });
            output_type.addSelectOption({
                value: 'csv',
                text: 'CSV'
            });

          
            if (context.request.method === 'POST') {
                log.debug('Query', context.request.parameters.custpage_sql_field);
                sql_field.defaultValue = context.request.parameters.custpage_sql_field;
                limit_rows.defaultValue = context.request.parameters.custpage_limit_field;
                output_type.defaultValue = context.request.parameters.custpage_output_selector;
                var result = runQuery(context.request.parameters.custpage_sql_field, context.request.parameters.custpage_limit_field);

                if (result.rows.length > 0) {
                    if (context.request.parameters.custpage_output_selector == 'grid') {
                    
                        var html_table = generateHTMLTable(result);
                        form.addField({
                            id: 'custpage_html_table',
                            type: serverWidget.FieldType.INLINEHTML,
                            label: 'Results'
                        }).defaultValue = html_table;
                    } else if (context.request.parameters.custpage_output_selector == 'csv') {
                     
                        var csv_file = file.create({
                            name: Date.now() + '.csv',
                            contents: result.columns.join(','),
                            folder: file_folder,
                            fileType: file.Type.CSV
                        });
                        for (var row_num = 0; row_num < result.rows.length; row_num++) {
                            csv_file.appendLine({ value: result.rows[row_num].join(',') });
                        }
                        var file_id = csv_file.save();
                        form.addField({
                            id: 'custpage_csv_link',
                            type: serverWidget.FieldType.URL,
                            label: 'Download CSV'
                        }).updateLayoutType({
                            layoutType: serverWidget.FieldLayoutType.STARTROW
                        }).updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.INLINE
                        }).defaultValue = file.load({ id: file_id }).url;
                    }
                } else {
                  
                    var error_message;
                    if (result.error == undefined) {
                        error_message = '<div style="font-size:20pt; margin-top:50px;">0 results found</div>';
                    } else {
                        error_message = '<div style="font-size:14pt; color: red;">' + result.error + '</div>';
                    }

                    form.addField({
                        id: 'custpage_error_field',
                        type: serverWidget.FieldType.INLINEHTML,
                        label: ' '
                    }).updateBreakType({
                        breakType: serverWidget.FieldBreakType.STARTROW
                    }).defaultValue = error_message;
                }
            } else {
             
                sql_field.defaultValue = "SELECT * FROM transaction";
                limit_rows.defaultValue = 100;
            }

            form.addSubmitButton({ label: 'Run Query' });

            context.response.writePage(form);
        }
    }
});
