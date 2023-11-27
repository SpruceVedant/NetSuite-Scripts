/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record'],
  function (serverWidget, record) {
    function onRequest(scriptContext) {
      if (scriptContext.request.method === 'GET') {
        var form = serverWidget.createForm({
          title: 'Employee Form'
        });
		
		 var submitButton = form.addButton({
          id: 'custpage_submit_button',
          label: 'Submit',
          functionName: 'submitRecord'
        });
		
        var fieldGroup1 = form.addFieldGroup({
          id: 'custpage_fieldgroup1',
          label: 'Primary Information'
        });

        var fieldGroup2 = form.addFieldGroup({
          id: 'custpage_fieldgroup2',
          label: 'Email | Phone | Address'
        });

        var fieldGroup3 = form.addFieldGroup({
            id: 'custpage_fieldgroup3',
            label: 'Classification'
          });

        

        form.addField({
          id: 'custpage_employee_id',
          type: serverWidget.FieldType.TEXT,
          label: 'Employee ID',
          container: 'custpage_fieldgroup1'
        });

        form.addField({
          id: 'custpage_name',
          type: serverWidget.FieldType.TEXT,
          label: 'Name',
          container: 'custpage_fieldgroup1'
        });
		
		 form.addField({
          id: 'custpage_currency',
          type: serverWidget.FieldType.TEXT,
          label: 'Job Title',
          container: 'custpage_fieldgroup1'
        });

        form.addField({
          id: 'custpage_initials',
          type: serverWidget.FieldType.TEXT,
          label: 'Initials',
          container: 'custpage_fieldgroup1'
        });

        form.addField({
          id: 'custpage_supervisor',
          type: serverWidget.FieldType.SELECT,
          label: 'Supervisor',
          source: 'employee',
          container: 'custpage_fieldgroup1'
        });

       

        form.addField({
            id: 'custpage_jobtitle',
            type: serverWidget.FieldType.SELECT,
            label: 'Currency',
            source: 'currency',
            container: 'custpage_fieldgroup1'
          });

        form.addField({
          id: 'custpage_email',
          type: serverWidget.FieldType.EMAIL,
          label: 'Email',
          container: 'custpage_fieldgroup2'
        });

        form.addField({
          id: 'custpage_phone',
          type: serverWidget.FieldType.PHONE,
          label: 'Phone',
          container: 'custpage_fieldgroup2'
        });
		
		form.addField({
          id: 'custpage_officephone',
          type: serverWidget.FieldType.PHONE,
          label: 'Office Phone',
          container: 'custpage_fieldgroup2'
        });
		
		form.addField({
          id: 'custpage_mobilephone',
          type: serverWidget.FieldType.PHONE,
          label: 'Mobile Phone',
          container: 'custpage_fieldgroup2'
        });
		
		form.addField({
          id: 'custpage_homephone',
          type: serverWidget.FieldType.PHONE,
          label: 'Home Phone',
          container: 'custpage_fieldgroup2'
        });

        form.addField({
          id: 'custpage_mobile_phone',
          type: serverWidget.FieldType.PHONE,
          label: 'Mobile Phone',
          container: 'custpage_fieldgroup2'
        });

        form.addField({
          id: 'custpage_subsidiary',
          type: serverWidget.FieldType.SELECT,
          label: 'Subsidiary',
          source: 'subsidiary',
          container: 'custpage_fieldgroup3'
        });

        form.addField({
          id: 'custpage_location',
          type: serverWidget.FieldType.SELECT,
          label: 'Location',
          source: 'location',
          container: 'custpage_fieldgroup3'
        });

        form.addField({
          id: 'custpage_department',
          type: serverWidget.FieldType.SELECT,
          label: 'Department',
          source: 'department',
          container: 'custpage_fieldgroup3'
        });

        form.addField({
          id: 'custpage_class',
          type: serverWidget.FieldType.SELECT,
          label: 'Class',
          source: 'classification',
          container: 'custpage_fieldgroup3'
        });

       
        var communicationTab = form.addTab({
          id: 'custpage_communication_tab',
          label: 'Communication'
        });

        var communicationSublist = form.addSublist({
          id: 'custpage_communication_sublist',
          type: serverWidget.SublistType.LIST,
          label: 'Communication',
          tab: 'custpage_communication_tab'
        });

        communicationSublist.addField({
          id: 'custpage_comm_type',
          type: serverWidget.FieldType.SELECT,
          label: 'Type',
          source: 'communicationtype'
        });

        communicationSublist.addField({
          id: 'custpage_comm_details',
          type: serverWidget.FieldType.TEXT,
          label: 'Details'
        });

      
        form.addButton({
          id: 'custpage_save_button',
          label: 'Save',
          functionName: 'saveRecord'
        });

        form.addButton({
          id: 'custpage_cancel_button',
          label: 'Cancel',
          functionName: 'cancelRecord'
        });

        // Marking Fields as Mandatory
        form.getField({
          id: 'custpage_employee_id'
        }).isMandatory = true;

        form.getField({
          id: 'custpage_name'
        }).isMandatory = true;
		
		form.getField({
			id: 'custpage_subsidiary'
		}).isMandatory = true;

       
        scriptContext.response.writePage(form);
      }else if (context.request.method === 'POST') {
        var employeeData = context.request.parameters;
		    var nameField = context.request.parameters.custpage_name;
            var employeeID = context.request.parameters.custpage_name;
            var initials = context.request.parameters;
            var emailField = context.request.parameters.emailfield;
            var subsidiaryField = context.request.parameters.subsidiaryfield;
            var phoneField = context.request.parameters.phonefield;
            var urlField = context.request.parameters.urlfield;

        var employeeRecord = record.create({
          type: record.Type.EMPLOYEE,
          isDynamic: true
        });

       
        employeeRecord.setValue({
          fieldId: 'entityid',
          value: employeeData.custpage_employee_id
        });

        employeeRecord.setValue({
          fieldId: 'firstname',
          value: employeeData.custpage_name
        });

        employeeRecord.setValue({
          fieldId: 'initials',
          value: employeeData.custpage_initials
        });

     
        var employeeId = employeeRecord.save();

        log.debug('Employee Created', 'Employee ID: ' + employeeId);

      
        var form = serverWidget.createForm({
          title: 'Employee Form'
        });

        form.addPageInitMessage({
          type: serverWidget.MessageType.CONFIRMATION,
          title: 'Success',
          message: 'Employee record created with ID: ' + employeeId
        });

        context.response.writePage(form);
      }
    }

    return {
      onRequest: onRequest
    };
  });
