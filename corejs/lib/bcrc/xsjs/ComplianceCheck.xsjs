$.import("bcrc.xsjslib", "helperFunctions");
var HELPERFUNCTIONS = $.bcrc.xsjslib.helperFunctions;

/** Service call **/
var oParams = {
    materialID   : $.request.parameters.get('MaterialID'),
    regulationID : $.request.parameters.get('RegulationID'),
    applicationAreaID  : $.request.parameters.get('ApplicationAreaID'),
    error : undefined
};

var body, results;
HELPERFUNCTIONS.checkParams(oParams);

// Get Composition items
var compositionItems = HELPERFUNCTIONS.getCompositionItems(oParams.materialID);

// Get MaterialRegulationChanges
var materialRegulationChanges = HELPERFUNCTIONS.getMaterialRegulationChanges(materialID, regulationID, applicationAreaID);

// Check if for the SubstanceID from the Composition list, if the Quantity exceeds the NewThreshold for the SubstanceID from MaterialRegulationChange

if (oParams.error !== undefined) {
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
	$.response.setBody(oParams.error.message);
} else {
	results = []; 
	body = JSON.stringify(results);
	$.response.contentType = 'application/json';
	$.response.setBody(body);
	$.response.status = $.net.http.OK;
}