# Client Scripts

## CS_SetCustomer.js
- This script is used to set the customer on a transaction record upon deployment
- `pageint` entry point is used in this script which is triggered upon the process of loading page.
- For better validation we can add debug statements in the functions to monitor the script.

## displayNameon_memo.js
- This script is used to diplay the selected customers name in the memo field for the transactions record
- `N/currentRecord` API is used in this script
- This time `fieldChanged` entrypoint or function is used because we are changing the value of the field.
- We have an if condition that matches the field ID to the entity with strict equals `===`
- `currentRecord.setText` is used to fetch the text that is on entity field.
- `currentRecord.setValue` is used to set the value to the memo field with id `memo`.


  
