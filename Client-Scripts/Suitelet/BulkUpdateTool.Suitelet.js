/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/record', 'N/ui/serverWidget'], function(file, record, serverWidget) {

    function onRequest(context) {
        if (context.request.method === 'GET') {
           
            var form = serverWidget.createForm({
                title: 'Bulk Update Item Prices'
            });
            
            
            var fileField = form.addField({
                id: 'custpage_price_update_file',
                type: serverWidget.FieldType.FILE,
                label: 'CSV File (Item ID, New Price)'
            });
            fileField.isMandatory = true;
            
            form.addSubmitButton({
                label: 'Upload and Update Prices'
            });
            
            context.response.writePage(form);
        } else {
           
            var request = context.request;
            var uploadedFile = request.files.custpage_price_update_file;
            
            var fileId = uploadedFile.save();
            var csvFile = file.load({id: fileId});
            
            var iterator = csvFile.lines.iterator();
            iterator.each(function(line){
                var values = line.value.split(',');
                var itemId = values[0].trim();
                var newPrice = parseFloat(values[1].trim());
                
                if(itemId && !isNaN(newPrice)){
                    try{
                        var itemRecord = record.load({
                            type: record.Type.INVENTORY_ITEM,
                            id: itemId,
                            isDynamic: true,
                        });
                        itemRecord.setValue({fieldId: 'baseprice', value: newPrice});
                        itemRecord.save();
                    } catch(e){
                        log.error({title: "Error updating item", details: e});
                    }
                }
                
                return true; 
            });
            
            
            var resultForm = serverWidget.createForm({
                title: 'Price Update Results'
            });
            resultForm.addField({
                id: 'custpage_result',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Result'
            }).defaultValue = '<p>Price update process completed. Please check individual items for confirmation.</p>';
            
            resultForm.addButton({
                id: 'custpage_new_update',
                label: 'New Update',
                functionName: 'redirectToUpload'
            });
            
            
            // resultForm.clientScriptModulePath = 'Path/To/Your/ClientScript.js';
            
            context.response.writePage(resultForm);
        }
    }

    return {
        onRequest: onRequest
    };
});
