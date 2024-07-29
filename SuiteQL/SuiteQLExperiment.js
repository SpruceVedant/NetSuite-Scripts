/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define(['N/query', 'N/log'], function(query, log) {
    
    function doGet(requestParams) {
        var sql = "SELECT * from entity";
        var results = [];
        
        try {
           
            var resultSet = query.runSuiteQL({ query: sql });
            
            
            results = resultSet.asMappedResults();
        } catch (e) {
            log.error('Error executing SuiteQL', e.toString());
            return {
                status: 'error',
                message: e.toString()
            };
        }
        
        return results;
    }
    
    return {
        get: doGet
    };
});
