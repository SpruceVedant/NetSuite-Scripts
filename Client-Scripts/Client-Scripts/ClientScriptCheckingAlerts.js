/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord'],
/**
 * @param{currentRecord} currentRecord
 */
function(currentRecord) {

    function pageInit(scriptContext) {
        alert('Page initialized.');
    }

    function fieldChanged(scriptContext) {
        alert('Field changed.');
    }

    function postSourcing(scriptContext) {
        alert('Field slaved.');
    }
    function sublistChanged(scriptContext) {
        alert('Sublist changed.');
    }

    function lineInit(scriptContext) {
        alert('Line initialized.');
    }

    function validateField(scriptContext) {
        alert('Field validated.');
        return true;
    }

    function validateLine(scriptContext) {
        alert('Sublist line validated.');
        return true;
    }

    function validateInsert(scriptContext) {
        alert('Sublist line inserted.');
        return true;
    }

    function validateDelete(scriptContext) {
        alert('Record deleted.');
        return true;
    }

    function saveRecord(scriptContext) {
        alert('Record saved.');
        return true;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,
        saveRecord: saveRecord
    };

});
// Script to check the trigger points of methods upon loading of a record
