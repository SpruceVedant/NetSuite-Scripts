/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record', 'N/search', 'N/log'], function(serverWidget, record, search, log) {

    function onRequest(context) {
        if (context.request.method === 'GET') {
            // Create the form
            var form = serverWidget.createForm({
                title: 'GL Reconciliation'
            });

            // Add fields for account selection and date range
            form.addField({
                id: 'account',
                type: serverWidget.FieldType.SELECT,
                label: 'Account',
                source: 'account'
            });

            form.addField({
                id: 'start_date',
                type: serverWidget.FieldType.DATE,
                label: 'Start Date'
            });

            form.addField({
                id: 'end_date',
                type: serverWidget.FieldType.DATE,
                label: 'End Date'
            });

            form.addSubmitButton({
                label: 'Reconcile'
            });

            context.response.writePage(form);
        } else {
            // Handle form submission
            var request = context.request;
            var accountId = request.parameters.account;
            var startDate = request.parameters.start_date;
            var endDate = request.parameters.end_date;

            // Perform reconciliation logic
            var bankTransactions = getBankTransactions(accountId, startDate, endDate);
            var glEntries = getGlEntries(accountId, startDate, endDate);

            var reconciliationResults = reconcileTransactions(bankTransactions, glEntries);

            // Display reconciliation results
            var resultPage = createResultPage(reconciliationResults);
            context.response.writePage(resultPage);
        }
    }

    function getBankTransactions(accountId, startDate, endDate) {
        // Placeholder for fetching bank transactions
        // This can be implemented by fetching data from an external source or custom record
        return [];
    }

    function getGlEntries(accountId, startDate, endDate) {
        // Fetch GL entries using a saved search
        var searchResults = search.create({
            type: search.Type.JOURNAL_ENTRY,
            filters: [
                ['account', 'is', accountId],
                'AND',
                ['trandate', 'within', startDate, endDate]
            ],
            columns: ['internalid', 'amount', 'trandate', 'memo']
        }).run().getRange(0, 1000);

        return searchResults.map(function(result) {
            return {
                id: result.id,
                amount: result.getValue('amount'),
                date: result.getValue('trandate'),
                memo: result.getValue('memo')
            };
        });
    }

    function reconcileTransactions(bankTransactions, glEntries) {
        var matchedTransactions = [];
        var unmatchedBankTransactions = [];
        var unmatchedGlEntries = [];

        // Simple matching logic (can be improved for real-world use cases)
        glEntries.forEach(function(glEntry) {
            var matched = bankTransactions.find(function(bankTransaction) {
                return bankTransaction.amount === glEntry.amount;
            });

            if (matched) {
                matchedTransactions.push({glEntry: glEntry, bankTransaction: matched});
                bankTransactions = bankTransactions.filter(function(bankTransaction) {
                    return bankTransaction.id !== matched.id;
                });
            } else {
                unmatchedGlEntries.push(glEntry);
            }
        });

        unmatchedBankTransactions = bankTransactions;

        return {
            matchedTransactions: matchedTransactions,
            unmatchedBankTransactions: unmatchedBankTransactions,
            unmatchedGlEntries: unmatchedGlEntries
        };
    }

    function createResultPage(reconciliationResults) {
        var form = serverWidget.createForm({
            title: 'Reconciliation Results'
        });

        var matchedSublist = form.addSublist({
            id: 'matched',
            type: serverWidget.SublistType.LIST,
            label: 'Matched Transactions'
        });

        matchedSublist.addField({
            id: 'gl_entry_id',
            type: serverWidget.FieldType.TEXT,
            label: 'GL Entry ID'
        });

        matchedSublist.addField({
            id: 'bank_transaction_id',
            type: serverWidget.FieldType.TEXT,
            label: 'Bank Transaction ID'
        });

        matchedSublist.addField({
            id: 'amount',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Amount'
        });

        reconciliationResults.matchedTransactions.forEach(function(result, index) {
            matchedSublist.setSublistValue({
                id: 'gl_entry_id',
                line: index,
                value: result.glEntry.id
            });

            matchedSublist.setSublistValue({
                id: 'bank_transaction_id',
                line: index,
                value: result.bankTransaction.id
            });

            matchedSublist.setSublistValue({
                id: 'amount',
                line: index,
                value: result.glEntry.amount
            });
        });

        var unmatchedBankSublist = form.addSublist({
            id: 'unmatched_bank',
            type: serverWidget.SublistType.LIST,
            label: 'Unmatched Bank Transactions'
        });

        unmatchedBankSublist.addField({
            id: 'bank_transaction_id',
            type: serverWidget.FieldType.TEXT,
            label: 'Bank Transaction ID'
        });

        unmatchedBankSublist.addField({
            id: 'amount',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Amount'
        });

        reconciliationResults.unmatchedBankTransactions.forEach(function(result, index) {
            unmatchedBankSublist.setSublistValue({
                id: 'bank_transaction_id',
                line: index,
                value: result.id
            });

            unmatchedBankSublist.setSublistValue({
                id: 'amount',
                line: index,
                value: result.amount
            });
        });

        var unmatchedGlSublist = form.addSublist({
            id: 'unmatched_gl',
            type: serverWidget.SublistType.LIST,
            label: 'Unmatched GL Entries'
        });

        unmatchedGlSublist.addField({
            id: 'gl_entry_id',
            type: serverWidget.FieldType.TEXT,
            label: 'GL Entry ID'
        });

        unmatchedGlSublist.addField({
            id: 'amount',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Amount'
        });

        reconciliationResults.unmatchedGlEntries.forEach(function(result, index) {
            unmatchedGlSublist.setSublistValue({
                id: 'gl_entry_id',
                line: index,
                value: result.id
            });

            unmatchedGlSublist.setSublistValue({
                id: 'amount',
                line: index,
                value: result.amount
            });
        });

        return form;
    }

    return {
        onRequest: onRequest
    };
});
