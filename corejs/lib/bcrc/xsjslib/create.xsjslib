/*eslint no-console: 0, no-unused-vars: 0, dot-notation: 0, no-use-before-desuccessful: 0, no-redeclare: 0*/
"use strict";

$.import("bcrc.xsjsliblib", "sessionBCRC");
$.import("bcrc.xsjsliblib", "helperFunctions");
var testNodeExit = $.require("../nodejs/testNodeExit");

var SESSIONINFO = $.bcrc.xsjslib.sessionBCRC;
var HELPERFUNCTIONS = $.bcrc.xsjslib.helperFunctions;

/**
@param {connection} Connection - The SQL connection used in the OData request
@param {beforeTableName} String - The name of a temporary table with the single entry before the operation (UPDATE and DELETE events only)
@param {afterTableName} String -The name of a temporary table with the single entry after the operation (CREATE and UPDATE events only)
*/
function createRegulationChange(param){
    console.log("bcrc.xsjsliblib.create.xsjslib: " + "SubstanceRegulation create 'after' event entered: " + "successful");

	var after = param.afterTableName;    // Entity REG.SubstanceRegulation
    console.log("bcrc.xsjsliblib.create.xsjslib: " + "Temp table name: " + after);

    // Get the user info
	var	pStmt = param.connection.prepareStatement("select * from \"" + after + "\"");	 
	var user = $.session.getUsername();
	pStmt.close();
    console.log("bcrc.xsjsliblib.create.xsjslib: " + "User: " + user);
	
    var regulationID, applicationAreaID, substanceID, threshold, uom, sign, status = "Pending";
	// Get Input New Record Values
	var	pStmt = param.connection.prepareStatement("select * from \"" + after + "\"");	 
	var rs = pStmt.executeQuery();
    while (rs.next()) {
		regulationID = rs.getString(1);
        applicationAreaID = rs.getString(2);
        substanceID = rs.getString(3);
        threshold = rs.getDecimal(4);
        uom = rs.getString(5);
        sign = rs.getString(6);
	}
	pStmt.close();
    console.log("bcrc.xsjsliblib.create.xsjslib: " + "regulationID: " + regulationID + "," + "applicationAreaID: " + applicationAreaID + "," + "substanceID: " + substanceID);

    // Get next regulation change number
	pStmt = param.connection.prepareStatement("select \"regulationChangeSeqNo\".NEXTVAL from dummy"); 
	var rs = pStmt.executeQuery();
	var regulationChangeNo = "";
	while (rs.next()) {
		regulationChangeNo = rs.getString(1);
	}
	pStmt.close();
    console.log("bcrc.xsjsliblib.create.xsjslib: " + "regulationChangeNo: " + regulationChangeNo.toString());

    // Get the current date
    var date = new Date();
    var dateString = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
    console.log("bcrc.xsjsliblib.create.xsjslib: " + "dateString: " + dateString);

    pStmt = param.connection.prepareStatement("insert into \"REG.RegulationChange\" values(?,?,?,?,?,?,?,?,?,?,?)" );
    pStmt.setString(1, regulationID); // RegulationID
    pStmt.setString(2, applicationAreaID); // ApplicationAreaID
    pStmt.setString(3, substanceID);	// SubstanceID
    console.log("bcrc.xsjsliblib.create.xsjslib: " + "set substanceID: " + "successful");

    pStmt.setInteger(4, parseInt(regulationChangeNo));	// RegulationChangeNo
    console.log("bcrc.xsjsliblib.create.xsjslib: " + "set regulationChangeNo: " + "successful");

    pStmt.setString(5, status); // Status
    pStmt.setDate(6, dateString, 'yyyy-mm-dd'); // ChangeDate
    console.log("bcrc.xsjsliblib.create.xsjslib: " + "set regulation change date: " + "successful");

    pStmt.setString(7, user); // ChangedBy
    pStmt.setDecimal(8, threshold); // NewThreshold
    pStmt.setDecimal(9, 0); // OldThreshold
    pStmt.setString(10, uom); // NewUoM
    pStmt.setString(11, ""); // OldUoM
    pStmt.executeUpdate();
    pStmt.close();
    console.log("bcrc.xsjsliblib.create.xsjslib: " + "create RegulationChange instance: " + "successful");

    createMaterialRegulationChange(param, regulationID, applicationAreaID, substanceID, regulationChangeNo, status, dateString, user, threshold, 0, uom, "");

    console.log("bcrc.xsjslib.create.xsjslib: " + "SubstanceRegulation create 'after' event exit: " + "successful");	
}

function createMaterialRegulationChange(param, regulationID, applicationAreaID, substanceID, regulationChangeNo, status, dateString, user, threshold, oldThreshold, uom, oldUom) {
   
	console.log("bcrc.xsjslib.create.xsjslib: " + "createMaterialRegulationChange instance: " + "enter");   
    
    var materialRegulationChangeNo = "";
    var affectedMaterials = HELPERFUNCTIONS.getAffectedMaterials(regulationID, applicationAreaID);
    console.log("bcrc.xsjslib.create.xsjslib: affectedMaterials length: " + affectedMaterials.length);

    for(var i = 0; i < affectedMaterials.length; i++) {
      
        var materialID = affectedMaterials[i];
        console.log("bcrc.xsjslib.create.xsjslib: MaterialID: " + materialID);
        var pStmt = param.connection.prepareStatement("insert into \"REG.MaterialRegulationChange\" values(?,?,?,?,?,?,?,?,?,?,?,?)" );
        pStmt.setString(1, materialID); // MaterialID
        pStmt.setString(2, regulationID); // RegulationID 
        pStmt.setString(3, applicationAreaID); // ApplicationAreaID
        pStmt.setString(4, substanceID);	// SubstanceID
        pStmt.setInteger(5, parseInt(regulationChangeNo));	// RegulationChangeNo
        pStmt.setString(6, status); // Status
        pStmt.setDate(7, dateString, 'yyyy-mm-dd'); // ChangeDate
        pStmt.setString(8, user); // ChangedBy
        pStmt.setDecimal(9, threshold); // NewThreshold
        pStmt.setDecimal(10, oldThreshold); // OldThreshold
        pStmt.setString(11, uom); // NewUoM
        pStmt.setString(12, oldUom); // OldUoM
        
        pStmt.executeUpdate();
        pStmt.close();
        console.log("bcrc.xsjslib.create.xsjslib: " + "create MaterialRegulationChange instance: " + "successful");    
    }

    console.log("bcrc.xsjslib.create.xsjslib: " + "createMaterialRegulationChange instance: " + "exit");  
       
}

function createRequest(requestUUId, oParams) {
	try {
		console.info("create.xsjslib: createRequest enter");

		var db = $.db.getConnection(),
			pstmt, result, query;
			
		var sRequestID = null;

		query = 'INSERT INTO "REQ.Request" VALUES(?,?,?,?,?,?,?,?,?,?,?)';

		pstmt = db.prepareStatement(query);
		pstmt.setString(1, requestUUId);
		pstmt.setString(2, oParams.BusinessPartnerID);
		pstmt.setString(3, oParams.MaterialID);
		pstmt.setString(4, oParams.RegulationID);
		pstmt.setString(5, oParams.ApplicationAreaID);
		pstmt.setString(6, oParams.SubstanceID);
		pstmt.setString(7, oParams.RegulationChangeNo);
		pstmt.setString(8, "REQS"); // Request status: Request Sent
		pstmt.setString(9, HELPERFUNCTIONS.getCurrentDate());
		pstmt.setString(10, oParams.DueDate);
		pstmt.setString(11, ""); // Not an inbound request

		result = pstmt.executeQuery();

        console.log("Due Date: " + oParams.DueDate.toString());

        while(result.next()) {
            sRequestID = result.getString(1);
            console.log("create.xsjslib: createRequest-sRequestID: " + sRequestID);
        }
		
		result.close();
		pstmt.close();
		db.close();

	} catch (e) {
		console.error("create.xsjslib: createRequest Exception occurred: " + e.message);
		sRequestID = null;
	}

	console.info("create.xsjslib: createRequest exit");
	return sRequestID;
}

function testNodeExit(param) {
    console.log("bcrc.xsjslib.create.xsjslib: testNodeExit" + "SubstanceRegulation create 'after' event enter: " + "successful");

    testNodeExit.testNodeExit(param);

    console.log("bcrc.xsjslib.create.xsjslib: testNodeExit" + "SubstanceRegulation create 'after' event exit: " + "successful");
}

function testBlockchainCall(param) {
    console.log("bcrc.xsjslib.create.xsjslib: testBlockchainCall" + "SubstanceRegulation create 'before' event enter: " + "successful");

    testNodeExit.testBlockchainCall(param);

    console.log("bcrc.xsjslib.create.xsjslib: testBlockchainCall" + "SubstanceRegulation create 'before' event exit: " + "successful");
}