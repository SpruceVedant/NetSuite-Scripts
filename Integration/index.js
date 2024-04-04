define(['N/record','N/https'],function(record,https){
    function sendProductData(context){
      var prodNewRecord=context.newRecord;
      var internalID=prodNewRecord.id;
      var productCode=prodNewRecord.getValue('itemid');
      var postData={"internalID":internalID,"productCode":productCode};
      postData=JSON.stringify(postData);
      var header=[];
      header['Content-Type']='application/json';
      var apiURL='';
      try{
        var response=https.post({
          url:apiURL,
          headers:header,
          body:postData
        });
        var newSFID=response.body;
        newSFID=newSFID.replace('\n','');
      }catch(er02){
        log.error('ERROR',JSON.stringify(er02));
      }
  
      if(newSFID!=''){
        try{
          var prodRec=record.submitFields({
            type:recordType,
            id:internalID,
            values:{'custitem_sf_id':newSFID,'externalid':newSFID},
          });
        }catch(er03){
          log.error('ERROR[er03]',JSON.stringify(er03));
        }
      }
    }
  
    return{
      afterSubmit:sendProductData
    }
  });