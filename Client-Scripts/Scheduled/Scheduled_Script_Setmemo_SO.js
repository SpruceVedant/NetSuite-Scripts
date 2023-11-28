/**
* @NApiVersion 2.1
* @NScriptType ScheduledScript
*/
define(["N/log", "N/record", "N/runtime", "N/search"],
    (log, record, runtime, search) => {

        const execute = (scriptContext) => {
            var salesorder_id_array = runtime.getCurrentScript().getParameter({
                name: 'custscript_so'
            });
            log.debug('Sales Order : ', salesorder_id_array);

            const arr = salesorder_id_array.split(',');

            log.debug('arr : ', arr);

            for (var i = 0; i < arr.length; i++) {
				var a = parseInt(arr[i])

                var salesorder = record.load({
                    type: record.Type.SALES_ORDER,
                    id: parseInt(arr[i]),
                    isDynamic: true,
                })
                salesorder.setValue({
                    fieldId: 'memo',
                    value: 'Update from Schedule Script',
                })
                salesorder.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                log.debug('Memo has been saved ', 'Memo has been saved ' );
            }



        };

        return { execute };
    });

