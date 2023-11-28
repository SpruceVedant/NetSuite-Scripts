/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord'],
    /**
     * @param{currentRecord} currentRecord
     */
    function (currentRecord) {

        var so_array = [];

       
        function pageInit(scriptContext) {
            

        }

        function fieldChanged(scriptContext) {
			
			if(scriptContext.fieldId == 'custpage_checkbox'){
				var objRecord = scriptContext.currentRecord

            var line_no = scriptContext.line

            var check_box_select = objRecord.getSublistValue({
                sublistId: 'sales_order_sublist',
                fieldId: 'custpage_checkbox',
                line: line_no
            });

            var sales_order_select = objRecord.getSublistValue({
                sublistId: 'sales_order_sublist',
                fieldId: 'custpage_tranid',
                line: line_no
            });
            so_array.push(sales_order_select)
				
			}
            

        }

        
        function setMemo() {
			var url = 'https://tstdrv2816485.app.netsuite.com/app/site/hosting/scriptlet.nl?script=819&deploy=1&compid=TSTDRV2816485&custpage_customer_name=323&custpage_to_date=20+November%2C+2023&custpage_from_date=01+July%2C+2023';
			url += '&custpage_arr='+so_array;
			alert('Setting Memo for these sales order :'+so_array)
			window.open(url , '_self');

        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            setMemo: setMemo
        };

    });
