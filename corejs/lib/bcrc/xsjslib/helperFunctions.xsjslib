/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0, no-use-before-define: 0, no-redeclare: 0*/
"use strict";

function checkParams(oParams) {
	for(var param in oParams) {
		if(param !== "error") {
			if (oParams[param] == null || oParams[param] === "") {
				oParams.error = {
					message: "None of the params can be null or empty."
				};
				return oParams;
			}
		}		
	}

	return oParams;
}

function fetchSendingBPID() {
	try {
		console.info("helpderFunctions.xsjslib: fetchSendingBPID enter");

		var db = $.db.getConnection(),
			pstmt, result, query,
			sendingBPID = {};

		query = 'SELECT	* FROM "BP.BusinessPartner" WHERE "IsOwned" = ?';

		pstmt = db.prepareStatement(query);
		pstmt.setString(1, "X");
		result = pstmt.executeQuery();

		while(result.next()) {
			sendingBPID = result.getString(1);
			console.log("helpderFunctions.xsjslib: fetchSendingBPID-sendingBPID: " + sendingBPID);
		}
		
		result.close();
		pstmt.close();
		db.close();

	} catch (e) {
		console.error("helpderFunctions.xsjslib: fetchSendingBPID Exception occurred: " + e.message);
		sendingBPID = null;
	}

	console.info("helpderFunctions.xsjslib: fetchSendingBPID exit");
	return sendingBPID;
}

function fetchReceivingBPMaterialID(bpID, materialID) {
	try {
		console.info("helpderFunctions.xsjslib: fetchReceivingBPMaterialID enter");

		var db = $.db.getConnection(),
			pstmt, result, query,
			receivingBPMaterialID = null;

		query = 'SELECT	"ExternalMaterialID" FROM "BP.BusinessPartnerMaterial" WHERE "BusinessPartnerID" = ? AND "MaterialID" = ?';

		pstmt = db.prepareStatement(query);
		pstmt.setString(1, bpID);
		pstmt.setString(2, materialID);
		result = pstmt.executeQuery();

		while(result.next()) {
			receivingBPMaterialID = result.getString(1);
			console.log("helpderFunctions.xsjslib: fetchReceivingBPMaterialID-receivingBPMaterialID: " + receivingBPMaterialID);
		}
		
		result.close();
		pstmt.close();
		db.close();
		
	} catch (e) {
		console.error("helpderFunctions.xsjslib: fetchReceivingBPMaterialID Exception occurred: " + e.message);
		receivingBPMaterialID = null;
	}
	
	console.info("helpderFunctions.xsjslib: fetchReceivingBPMaterialID exit");
	return receivingBPMaterialID;
}



function getCurrentDate() {
	var date = new Date();
    return date.toISOString();
}

function getCompositionItems(materialID) {
	console.log("getCompositionItems enter");
	var db = $.db.getConnection(),
		pstmt, result, query,
        compound = {},
		compounds = [];

	query = 'SELECT	* FROM "COM.Composition" WHERE "MaterialID" = ?';

	pstmt = db.prepareStatement(query);
	pstmt.setString(1, materialID);
	result = pstmt.executeQuery();

	console.log("getCompositionItems query executed");

	while (result.next()) {
        compound.MaterialID = result.getString(1);
        compound.SubstanceID = result.getString(2);
        compound.Type = result.getString(3);
        compound.Quantity = result.getDecimal(4);
        compound.UoM = result.getString(5);
		compounds.push(compound);
	}
	result.close();
	pstmt.close();
	db.close();
	console.log("getCompositionItems exit");
	return compounds;
}

function getBusinessPartnerMaterials(materialID) {

	var db = $.db.getConnection(),
		pstmt, result, query,
		affectedMaterials = [];	
		
	query = 'SELECT	* FROM "BP.BusinessPartnerMaterial" AS BUPAMAT ' +
			'INNER JOIN "BP.BusinessPartner" AS BUPA ON BUPAMAT."BusinessPartnerID" = BUPA.ID ' +
			'WHERE BUPAMAT."MaterialID" = ?';

	pstmt = db.prepareStatement(query);
	pstmt.setString(1, materialID);
	result = pstmt.executeQuery();

	while (result.next()) {        
		affectedMaterials.push(result.getString(1));
	}
	result.close();
	pstmt.close();
	db.close();
	return affectedMaterials;

}

function getAffectedMaterials(regulationID, applicationAreaID) {
	var db = $.db.getConnection(),
		pstmt, result, query,
		affectedMaterials = [];

	query = 'SELECT	* FROM "MAT.MaterialUsage" WHERE "RegulationID" = ? AND "ApplicationAreaID" = ?';

	pstmt = db.prepareStatement(query);
	pstmt.setString(1, regulationID);
    pstmt.setString(2, applicationAreaID);
	result = pstmt.executeQuery();

	while (result.next()) {        
		affectedMaterials.push(result.getString(1));
	}
	result.close();
	pstmt.close();
	db.close();
	return affectedMaterials;
}

function getMaterialRegulationChanges(materialID, regulationID, applicationAreaID) {
	var db = $.db.getConnection(),
		pstmt, result, query,
		materialRegulationChange = {},
		materialRegulationChanges = [];

	if(regulationID && applicationAreaID) {
		query = 'SELECT	* FROM "REG.MaterialRegulationChange" WHERE "MaterialID" = ? AND "RegulationID" = ? AND "ApplicationAreaID" = ?';
		pstmt = db.prepareStatement(query);
		pstmt.setString(1, materialID);
		pstmt.setString(2, regulationID);
		pstmt.setString(3, applicationAreaID);
	} else {
		query = 'SELECT	* FROM "REG.MaterialRegulationChange" WHERE "MaterialID" = ?';
		pstmt = db.prepareStatement(query);
		pstmt.setString(1, materialID);
	}	
	
	result = pstmt.executeQuery();

	while (result.next()) {       
		materialRegulationChange.MaterialID = result.getString(1);
        materialRegulationChange.RegulationID = result.getString(2);
        materialRegulationChange.ApplicationAreaID = result.getString(3);
        materialRegulationChange.SubstanceID = result.getDecimal(4);
        materialRegulationChange.MaterialRegulationChangeNo = result.getInteger(5); 
		materialRegulationChange.RegulationChangeNo = result.getInteger(6); 
		materialRegulationChange.Status = result.getString(7); 
		materialRegulationChange.ChangeDate = result.getDate(8); 
		materialRegulationChange.ChangedBy = result.getString(9); 
		materialRegulationChange.NewThreshold = result.getDecimal(10); 
		materialRegulationChange.OldThreshold = result.getDecimal(11); 
		materialRegulationChange.NewUoM = result.getString(12); 
		materialRegulationChange.OldUoM = result.getString(13); 
		materialRegulationChanges.push(materialRegulationChange);
	}
	result.close();
	pstmt.close();
	db.close();
	return materialRegulationChanges;
}

function getBusinessPartners(materialID) {
	var db = $.db.getConnection(),
		pstmt, result, query,
		businessPartner = {},
		businessPartners = [];

	query = 'SELECT	* FROM "BP.BusinessPartnerMaterial" WHERE "MaterialID" = ?';

	pstmt = db.prepareStatement(query);
	pstmt.setString(1, materialID);
	result = pstmt.executeQuery();

	while (result.next()) {       
		businessPartner.BusinessPartnerID = result.getString(1);
        businessPartner.MaterialID = result.getString(2);
        businessPartner.Status = result.getString(3);
		businessPartners.push(businessPartner);
	}
	result.close();
	pstmt.close();
	db.close();
	return businessPartners;
}

function updateMaterialRegulationChangeStatuses(materialID, regulationID, applicationAreaID, status) {
	var db = $.db.getConnection(),
		pstmt, result, query;

	query = 'UPDATE	"REG.MaterialRegulationChange" SET "Status" = ? WHERE "MaterialID" = ? AND "RegulationID" = ? AND "ApplicationAreaID" = ?';

	pstmt = db.prepareStatement(query);
	pstmt.setString(1, status);
	pstmt.setString(2, materialID);
	pstmt.setString(3, regulationID);
	pstmt.setString(4, applicationAreaID);
	pstmt.executeUpdate();

	pstmt.close();
	db.close();
	return ;

}

