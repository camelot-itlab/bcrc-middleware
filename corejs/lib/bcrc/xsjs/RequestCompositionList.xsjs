$.import("bcrc.xsjslib", "helperFunctions");
var HELPERFUNCTIONS = $.bcrc.xsjslib.helperFunctions;

/** Service call to request composition items from all the suppliers (business partners) **/
var oParams = {
    materialID   : $.request.parameters.get('MaterialID'),
    regulationID   : $.request.parameters.get('RegulationID'),
    applicationAreaID   : $.request.parameters.get('ApplicationAreaID'),
    sedingPartnerID   : $.request.parameters.get('SedingPartnerID'),
    error : undefined
};

var body, results;
HELPERFUNCTIONS.checkParams(oParams);

if (oParams.error !== undefined) {
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody(oParams.error.message);
} else {

    var suppliers = [], regulationIDs = [];
    
    // Get all suppliers from BusinessPartnerMaterials
    suppliers = HELPERFUNCTIONS.getBusinessPartnerMaterials(materialID);

    // Get all regulation changes for the material from MaterialRegulationChanges
    regulationIDs = HELPERFUNCTIONS.getMaterialRegulationChanges(materialID, regulationID, applicationAreaID);

    var requestObject = {}, requestObjects = [];
    for(var i = 0; i < suppliers.length; i++) {
        requestObject.sedingPartnerID = sedingPartnerID;
        requestObject.receivingPartnerID = suppliers[i].receivingPartnerID;
        requestObject.sedingPartnerMatID = suppliers[i].sedingPartnerMatID;
        requestObject.receivingPartnerMatID = suppliers[i].receivingPartnerMatID;
        requestObject.regulationIDs = regulationIDs;
        requestObjects.push(requestObject);

    }

    requestObjects.forEach(function(requestObject, indey, requestObjects) {
        // Compose the Request object with all the RequestEntries
        var requestArgs = [requestObject.sedingPartnerID, requestObject.receivingPartnerID, requestObject.sedingPartnerMatID, requestObject.receivingPartnerMatID, requestObject.regulationIDs]

        // Post the Request to the Blockchain

    }, this);

    


    // Update statuses for MaterialRegulationChanges and BusinessPartnerMaterials if the call is successful --> PRES = "Pending Response"
    HELPERFUNCTIONS.updateMaterialRegulationChangeStatuses(materialID, "PRES");
    HELPERFUNCTIONS.updateBusinessPartnerMaterialsStatuses(materialID, "PRES");

    // 
	results = []; 
	body = JSON.stringify(results);
	$.response.contentType = 'application/json';
	$.response.setBody(body);
	$.response.status = $.net.http.OK;
}