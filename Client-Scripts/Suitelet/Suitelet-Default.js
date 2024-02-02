/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget'],
  function (serverWidget) {
    function onRequest(context) {
      if (context.request.method === 'GET') {
        var form = serverWidget.createForm({
          title: 'Custom Form'
        });
		
		// form.clientScriptFileId = 8774;

        var textField = form.addField({
          id: 'custpage_text_field',
          type: serverWidget.FieldType.TEXT,
          label: 'Text Field'
        });

        var selectField = form.addField({
          id: 'custpage_select_field',
          type: serverWidget.FieldType.SELECT,
          label: 'Customer',
          source: 'customer'
        });

        var checkboxField = form.addField({
          id: 'custpage_checkbox_field',
          type: serverWidget.FieldType.CHECKBOX,
          label: 'Checkbox Field'
        });

        var dateField = form.addField({
          id: 'custpage_date_field',
          type: serverWidget.FieldType.DATE,
          label: 'Date Field'
        });

        var sublist = form.addSublist({
          id: 'custpage_sublist',
          type: serverWidget.SublistType.LIST,
          label: 'Sublist'
        });
        sublist.addField({
          id: 'custpage_sublist_field1',
          type: serverWidget.FieldType.TEXT,
          label: 'Sublist Field 1'
        });
        sublist.addField({
          id: 'custpage_sublist_field2',
          type: serverWidget.FieldType.TEXT,
          label: 'Sublist Field 2'
        });

        sublist.setSublistValue({
          id: 'custpage_sublist_field1',
          line: 0,
          value: 'Value 1'
        });
        sublist.setSublistValue({
          id: 'custpage_sublist_field2',
          line: 0,
          value: 'Value 2'
        });

        sublist.addField({
          id: 'custpage_line_field1',
          type: serverWidget.FieldType.TEXT,
          label: 'Line Field 1'
        });
        sublist.addField({
          id: 'custpage_line_field2',
          type: serverWidget.FieldType.TEXT,
          label: 'Line Field 2'
        });

        sublist.setSublistValue({
          id: 'custpage_line_field1',
          line: 0,
          value: 'Line Value 1'
        });
        sublist.setSublistValue({
          id: 'custpage_line_field2',
          line: 0,
          value: 'Line Value 2'
        });

        form.addSubmitButton({
          label: 'Submit'
        });

        context.response.writePage(form);
      }
    }

    return {
      onRequest: onRequest
    };
  });
