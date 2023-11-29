/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord'],
  
    function (currentRecord) {

        var SalesOrder_arr = [];

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
            SalesOrder_arr.push(sales_order_select)
				
			}
        }
        function set_Memo() {
			var url = 'https://tstdrv2816485.app.netsuite.com/app/site/hosting/scriptlet.nl?script=819&deploy=1&compid=TSTDRV2816485&custpage_customer_name=323&custpage_to_date=20+November%2C+2023&custpage_from_date=01+July%2C+2023';
			url += '&custpage_arr='+SalesOrder_arr;
			alert('Setting Memo for these sales order :'+SalesOrder_arr)
			window.open(url , '_self');

        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            set_Memo: set_Memo
        };

    });
