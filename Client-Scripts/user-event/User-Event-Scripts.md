# User Event Scripts

## AutoPopulateCustomer
- Script to auto populate the customer, email, phone fields in transaction records.
- It uses `beforeLoad()` entry point along with `record` & `search` api's in NetSuite
- To auto populate the fields we need a customer ID which is stored in the variable
- `search.lookupFields` module is used in which type, id and respective columns for info is passed
- ` record_object.setValue` is used to set the values

## AddButton
- Script to add a button in transaction records such as sales order.
- Uses `N/ui/serverWidget` API and form module
- `addButton` module of API is used

## PreventSubmit
- `beforeSubmit`entry point is used as we need to only validate if the user has an empty field or not
- ` var email = newRecord.getValue({ fieldId: 'email' });` is used to get the value of fieldid


