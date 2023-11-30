/**
* @NApiVersion 2.1
* @NScriptType MapReduceScript
*/
define(['N/currentRecord', 'N/record', 'N/runtime'],
    (currentRecord, record, runtime) => {


        const getInputData = (inputContext) => {
            var salesorder_id_array = runtime.getCurrentScript().getParameter({
                name: 'custscript3'
            });
            log.debug('Sales Order : ', salesorder_id_array);
            var arr = salesorder_id_array.split(',');
            // log.debug('Sales Order : ', typeof arr);

            return arr;

        }



        const map = (mapContext) => {
            var map_key = JSON.parse(mapContext.key);
            var map_value = JSON.parse(mapContext.value);
            log.debug('map value', map_value)

            mapContext.write({
                key: record.Type.SALES_ORDER,
                value: {
                    'custpage_so_id': map_value,
                }
            })



        }


        const reduce = (reduceContext) => {
            var reduce_key = reduceContext.key;
            var reduce_value = reduceContext.values;

            log.debug('reduce_value', reduce_value)
            for (var i = 0; i < reduce_value.length; i++) {
                var reduce_parse_value = JSON.parse(reduceContext.values[i]);

                var so_id = reduce_parse_value.custpage_so_id;
                log.debug('so_id', so_id)
                var salesorder = record.load({
                    type: record.Type.SALES_ORDER,
                    id: so_id,
                    isDynamic: true,
                })
                salesorder.setValue({
                    fieldId: 'memo',
                    value: 'Update from Map Reduce Script',
                })
                salesorder.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                log.debug('Memo has been saved ', 'Memo has been saved ' + so_id);

            }

        }



        const summarize = (summaryContext) => {

        }

        return { getInputData, map, reduce, summarize }

    });