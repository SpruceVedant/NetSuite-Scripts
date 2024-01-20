          /**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record'], function(serverWidget, record){
    return {
        onRequest: function(params) {
            var form = serverWidget.createForm({
                title: 'Simple Form'
            });
            var sublistObj2 = form.addSublist({
                id: 'mylist',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'List'
            });
            sublistObj2.addField({
                id: 'description',
                type: serverWidget.FieldType.TEXT,
                label: 'Description'
            });
            sublistObj2.addField({
                id: 'amount',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Amount'
            });
            sublistObj2.updateTotallingFieldId({
                id: 'amount'
            });
            sublistObj2.setSublistValue({
                id: 'description',
                line: 0,
                value: 'foo'
            });
            sublistObj2.setSublistValue({
                id: 'amount',
                line: 0,
                value: '10'
            });
            sublistObj2.setSublistValue({
                id: 'description',
                line: 1,
                value: 'bar'
            });
            sublistObj2.setSublistValue({
                id: 'amount',
                line: 1,
                value: '15'
            });
            form.addSublist({
                id: 'dummy',
                type: serverWidget.SublistType.STATICLIST,
                label: 'Dummy'
            });
            params.response.writePage(form);
        }
    };
}); 

        
