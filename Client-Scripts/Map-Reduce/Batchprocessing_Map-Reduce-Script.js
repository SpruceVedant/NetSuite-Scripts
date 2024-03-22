/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/file', 'N/runtime'], function(search, record, file, runtime) {
    
    function getInputData() {
        return search.create({
            type: search.Type.CUSTOMER,
            columns: [
                'internalid',
                'companyname',
                'email'
            ],
            filters: [
                ['lastmodifieddate', 'within', '8/1/2021', '3/22/2024']
            ]
        });
    }

    function map(context) {
        var searchResult = JSON.parse(context.value);
        var customerId = searchResult.id;
        var companyName = searchResult.values.companyname;
        var email = searchResult.values.email;

        // Use a simplified matching criterion for potential duplicates
        // For example, match by the first part of the email address before "@" and part of the company name
        var matchKey = email.split('@')[0].substring(0, 3) + companyName.substring(0, 3);
        context.write({
            key: matchKey.toLowerCase(),
            value: customerId
        });
    }

    function reduce(context) {
        var matchingIds = context.values;
        if (matchingIds.length > 1) { // Only consider as potential duplicates if there are 2 or more matches
            context.write({
                key: context.key,
                value: matchingIds
            });
        }
    }

    function summarize(summary) {
        var potentialDuplicates = {};
        summary.output.iterator().each(function(key, value) {
            potentialDuplicates[key] = value;
            return true;
        });

        var content = 'Potential Duplicate Customers Report\n\n';
        for (var key in potentialDuplicates) {
            content += 'Match Key: ' + key + ' - IDs: ' + potentialDuplicates[key] + '\n';
        }

        // Save the report to the File Cabinet
        var reportFile = file.create({
            name: 'duplicate_customers_report_' + new Date().getTime() + '.txt',
            fileType: file.Type.PLAINTEXT,
            contents: content,
            folder: -15 
        });
        reportFile.save();
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
});
