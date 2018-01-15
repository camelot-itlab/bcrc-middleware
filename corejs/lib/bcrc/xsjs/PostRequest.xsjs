$.import("bcrc.xsjslib", "helperFunctions");
var HELPERFUNCTIONS = $.bcrc.xsjslib.helperFunctions;
var CREATE = $.bcrc.xsjslib.create;
var CHANNEL = $.require("../nodejs/channel");

/** Service call to request composition items from all the suppliers (business partners) **/
var oParams = {
    BusinessPartnerID   : $.request.parameters.get('BusinessPartnerID'),
    MaterialID          : $.request.parameters.get('MaterialID'),
    RegulationID        : $.request.parameters.get('RegulationID'),
    ApplicationAreaID   : $.request.parameters.get('ApplicationAreaID'),
    SubstanceID         : $.request.parameters.get('SubstanceID'),
    RegulationChangeNo  : $.request.parameters.get('RegulationChangeNo'),
    DueDate             : $.request.parameters.get('DueDate'),
    error               : undefined
};

HELPERFUNCTIONS.checkParams(oParams);

if (oParams.error !== undefined) {
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody(oParams.error.message);
} else {
    var sendingBusinessPartnerID, receivingBusinessPartnerMaterialID;

    // fetch sending business partner ID, receiving business partner materialID

    oParams.SendingBusinessPartnerID = HELPERFUNCTIONS.fetchSendingBPID();
    oParams.ReceivingBusinessPartnerMaterialID = HELPERFUNCTIONS.fetchReceivingBPMaterialID(oParams.BusinessPartnerID, oParams.MaterialID);

    if(oParams.SendingBusinessPartnerID) {
        if(oParams.ReceivingBusinessPartnerMaterialID) {
             // create request entry in HANA db
            var sRequestID = CREATE.createRequest(oChannelRequestResponse.requestUUId, oParams);
            if (sRequestID) {
                CHANNEL.createRequest(oParams);

                $.response.setBody(sRequestID); 
                $.response.status = $.net.http.OK; 
            } else {
                $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
                var errorMsg = "Request could not be persisted in HANA DB.";
                $.response.setBody(errorMsg);
            }            
        } else {
            $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
            var errorMsg = "Receiving business partner material ID cannot be null.";
            $.response.setBody(errorMsg);
        }
    } else {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        var errorMsg = "Sending business partner ID cannot be null.";
        $.response.setBody(errorMsg);
    }    
}
