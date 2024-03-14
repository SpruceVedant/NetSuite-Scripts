/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/runtime', 'N/ui/serverWidget'], function(runtime, serverWidget) {

    function onRequest(context) {
        if (context.request.method === 'GET') {
           
            var form = serverWidget.createForm({
                title: 'Set Script Parameters'
            });

            form.addField({
                id: 'param1',
                type: serverWidget.FieldType.TEXT,
                label: 'Parameter 1'
            });

            form.addField({
                id: 'param2',
                type: serverWidget.FieldType.TEXT,
                label: 'Parameter 2'
            });

            form.addSubmitButton({
                label: 'Save Parameters'
            });

            context.response.writePage(form);
        } else if (context.request.method === 'POST') {
            var param1Value = context.request.parameters.param1;
            var param2Value = context.request.parameters.param2;

           
            var script = runtime.getCurrentScript();
            script.setParameter({
                name: 'custscript_param1',
                value: param1Value
            });

            script.setParameter({
                name: 'custscript_param2',
                value: param2Value
            });
            context.response.write('Script parameters updated successfully.');
        }
    }

    return {
        onRequest: onRequest
    };
});
