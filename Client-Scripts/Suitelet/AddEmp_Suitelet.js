/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/record', 'N/ui/serverWidget'], function (record, serverWidget) {
    function onRequest(scriptContext) {
      if (scriptContext.request.method === 'GET') {
        var form = serverWidget.createForm({ title: 'Create Record Form' });
  
        form.addField({
          id: 'custpage_name',
          type: serverWidget.FieldType.TEXT,				
          label: 'Name'
        });
          
         form.addField({
          id: 'custpage_custid',
          type: serverWidget.FieldType.TEXT,
          label: 'Customer Id'
        });
        
        form.addField({
          id: 'custpage_subsidiary',
          type: serverWidget.FieldType.SELECT,
          source: 'subsidiary',
          label: 'Subsidiary'
        });
        
        // form.addField({
          // id: 'custpage_status',
          // type: serverWidget.FieldType.SELECT,
          // source: 'entityStatus',
          // label: 'Status'
        // });
        
        form.addField({
          id: 'custpage_company',
          type: serverWidget.FieldType.TEXT,
          label: 'Company Name'
        });
  
  
        form.addSubmitButton({
          label: 'Submit'
        });
  
        scriptContext.response.writePage(form);
      } else if (scriptContext.request.method === 'POST') {
        var name = scriptContext.request.parameters.custpage_name;
        var id = scriptContext.request.parameters.custpage_custid;
        var subsidiaryName = scriptContext.request.parameters.custpage_subsidiary;
        var statuss = scriptContext.request.parameters.custpage_status;
        var companyName = scriptContext.request.parameters.custpage_company;
        var custId = scriptContext.request.parameters.custpage_custid;
        
  
        
        var myRecord = record.create({
          type: 'Employee',
          isDynamic: true
        });
  
      
        myRecord.setValue({
          fieldId: 'fname',
          value: name
        });
        
         myRecord.setValue({
          fieldId: 'entityid',
          value: custId
        });
        
        myRecord.setValue({
          fieldId: 'subsidiary',
          value: subsidiaryName
        });
        
        myRecord.setValue({
          fieldId: 'companyname',
          value: companyName
        });
        
         myRecord.setValue({
          fieldId: 'entitystatus',
          value: statuss
        });
  
     
        var recordId = myRecord.save();
  
        scriptContext.response.write('Record created with ID: ' + recordId);
      }
    }
  
    return {
      onRequest: onRequest
    };
  });
  