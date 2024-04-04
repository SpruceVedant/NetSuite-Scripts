/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.0        08 Apr 2024     Vedant Bakshi    To fetch sales orders data
 */

define(['N/search', 'N/record'], function(search, record) {
    
    /**
     * Function called when a GET request is made to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from the GET request
     * @returns {Object[]} An array of objects representing sales orders
     */
    function doGet(requestParams) {
        var minimumAmount = requestParams.minimumAmount || 100; 
        var salesOrderSearch = search.create({
            type: search.Type.SALES_ORDER,
            filters: [
                ["amount", "greaterthan", minimumAmount]
            ],
            columns: [
                search.createColumn({name: "tranid"}),
                search.createColumn({name: "entity"}),
                search.createColumn({name: "amount"}),
            ]
        });
        
        var salesOrders = [];
        salesOrderSearch.run().each(function(result) {
            salesOrders.push({
                id: result.id,
                tranId: result.getValue({name: "tranid"}),
                entity: result.getValue({name: "entity"}),
                amount: result.getValue({name: "amount"})
            });
            return true;
        });
        
        return JSON.stringify(salesOrders);
    }

    return {
        get: doGet
    };
    
});
