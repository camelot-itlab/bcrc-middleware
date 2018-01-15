/* jshint undef: true, unused: true */
/* globals require, module, console */

(function () {
    "use strict";
    var async = require("async");

    var dbStatement = function (client, sql, param, callback) {
        try {
            client.prepare(sql, function (error, statement) {
                if (error) {
                    console.error("Statement could not be created: " + JSON.stringify(error));
                    callback(error);
                } else {
                    statement.exec(param, function (error, result) {
                        if (error) {
                            console.error("SQL execution failed: " + sql + " with " + JSON.stringify(param));
                            console.error("SQL execution failed with error: " + JSON.stringify(error));
                            callback(error);
                        } else {
                            console.info("DB statement executed successfully: " + sql + " with " + JSON.stringify(param));
                            callback(null, result);
                        }
                    });
                }
            });
        } catch (error) {
            var errorObj = new Error("Exception occurred with HANA DB." + JSON.stringify(error));
            errorObj.statusCode = 500;
            callback(errorObj);
        }
    };

    module.exports = {
        createRequest: function (requestParams, client, cb) {
            //console.info("createRequest: method enter");
            dbStatement(
                client,
                "UPSERT \"REQ.Request\" VALUES(?,?,?,?,?,?,?,?,?,?,?) WHERE \"RequestID\" = ?",
                [requestParams.RequestID, requestParams.BusinessPartnerID, requestParams.MaterialID,
                requestParams.RegulationID, requestParams.ApplicationAreaID, requestParams.SubstanceID,
                requestParams.RegulationChangeNo, requestParams.RequestStatus, requestParams.RequestDate,
                requestParams.DueDate, requestParams.Inbound, requestParams.RequestID],
                function (err) {
                    //console.info("createRequest: method exit");
                    cb(err, requestParams.RequestID);
                });
        },

        readRequestById: function (requestID, client, cb) {
            //console.info("readRequestById: method enter");
            dbStatement(
                client,
                "SELECT * FROM \"REQ.Request\" WHERE \"RequestID\" = ?",
                [requestID],
                function (err, res) {
                    if(err) return cb(err);
                    //console.info("readRequestById: method exit");
                    cb(null, res[0]);
                });
        },

        createResponse: function (requestParams, client, cb) {
            //console.info("createResponse: method enter");
            dbStatement(
                client,
                "UPSERT \"REQ.Response\" VALUES(?,?,?,?,?) WHERE \"RequestID\" = ?",
                [requestParams.RequestID, requestParams.ResponseDate, requestParams.Quantity,
                requestParams.UoM, requestParams.ComplianceStatus, requestParams.RequestID],
                function (err) {
                    //console.info("createResponse: method exit");
                    cb(err, requestParams.RequestID);
                });
        },

        readResponseById: function (responseID, client, cb) {
            //console.info("readResponseById: method enter");
            dbStatement(
                client,
                "SELECT * FROM \"REQ.Response\" WHERE \"RequestID\" = ?",
                [responseID],
                function (err, res) {
                    if(err) return cb(err);
                    //console.info("readResponseById: method exit");
                    cb(null, res[0]);
                });
        },

        createSubstanceRegulation: function (aParams, client, cb) {
            //console.info("createSubstanceRegulation: method enter");
            dbStatement(
                client,
                "UPSERT \"REG.SubstanceRegulation\" VALUES(?,?,?,?,?,?) WHERE \"RegulationID\" = ? AND \"ApplicationAreaID\" = ? AND \"SubstanceID\" = ?",
                aParams,
                function (err) {
                    if (err) {
                        cb(err);
                    } else {
                        //if (typeof res === "number") {
                        //    console.info("Created Substance Regulations: " + res);
                        //} else if (res && res[0]) {
                        //    console.info("Substance Regulation created: " + JSON.stringify(res[0]));
                        //}
                        //console.info("createSubstanceRegulation: method exit");
                        cb(null);
                    }
                });
        },

        createMaterialRegulationChange: function (aParams, client, cb) {
            //console.info("createMaterialRegulationChange: method enter");
            dbStatement(
                client,
                "UPSERT \"REG.MaterialRegulationChange\" VALUES(?,?,?,?,?,?,?,?,?,?,?,?) WHERE " +
                "\"MaterialID\" = ? AND \"RegulationID\" = ? AND \"ApplicationAreaID\" = ? AND \"SubstanceID\" = ? AND \"RegulationChangeNo\" = ?",
                aParams,
                function (err,res) {
                    //console.info("createMaterialRegulationChange: method exit");
                    if (err) return cb(err);
                    cb(null, res[0]);
                });
        },

        createRegulationChange: function (aParams, client, cb) {
            //console.info("createRegulationChange: method enter");
            dbStatement(
                client,
                "UPSERT \"REG.RegulationChange\" VALUES(?,?,?,?,?,?,?,?,?,?,?) WHERE " +
                "\"RegulationID\" = ? AND \"ApplicationAreaID\" = ? AND \"SubstanceID\" = ? AND \"RegulationChangeNo\" = ?",
                aParams,
                function (err) {
                    console.info("createRegulationChange: method exit");
                    if (err) return cb(err);
                    cb(null);
                });
        },

        createSubRegAndRegChangeAndMatRegChange: function (requestParams, client, user, cb) {
            console.info("createSubRegAndRegChangeAndMatRegChange: method enter");
            console.info("parameters: " + JSON.stringify(requestParams));
            var complianceStatus = "NR", // New Regulation
                changeDate = new Date().toISOString(), // Current Date.
                changedBy = user.id;

            async.waterfall(
                [
                    // update or create substance regulation
                    function createSubstanceRegulation(callback) {
                        var aParams = [ requestParams.RegulationID, requestParams.ApplicationAreaID, requestParams.SubstanceID,
                                        requestParams.Threshold, requestParams.UoM, requestParams.Sign,
                                        requestParams.RegulationID, requestParams.ApplicationAreaID, requestParams.SubstanceID];
                        this.createSubstanceRegulation(aParams, client, callback);
                    }.bind(this),

                    function getLastRegulationChange(callback) {
                        this.getLastRegulationChange(requestParams.RegulationID, requestParams.ApplicationAreaID, requestParams.SubstanceID, client, callback);
                    }.bind(this),

                    function createNewRegulationChange(lastRegulationChange, callback) {
                        //a regulation change exists
                        console.info("last regulation change: ", JSON.stringify(lastRegulationChange));
                        console.info("new substance regulation: ", JSON.stringify(requestParams));
                        var aParams;
                        if (lastRegulationChange && lastRegulationChange.NewThreshold && lastRegulationChange.NewUoM) {
                            //last regulation change as same threshold and uom
                            console.info("UoM comparison: " + (requestParams.UoM !== lastRegulationChange.NewUoM));
                            console.info("UoM comparison: " + (Number(requestParams.Threshold) !== Number(lastRegulationChange.NewThreshold)));
                            if((requestParams.UoM !== lastRegulationChange.NewUoM) || (Number(requestParams.Threshold) !== Number(lastRegulationChange.NewThreshold))) {
                                aParams = [ requestParams.RegulationID, requestParams.ApplicationAreaID, requestParams.SubstanceID, 
                                            lastRegulationChange.RegulationChangeNo + 1, complianceStatus, changeDate, changedBy, 
                                            Number(requestParams.Threshold), Number(lastRegulationChange.NewThreshold), 
                                            requestParams.UoM, lastRegulationChange.NewUoM,
                                            requestParams.RegulationID, requestParams.ApplicationAreaID, requestParams.SubstanceID, lastRegulationChange.RegulationChangeNo + 1];

                                this.createRegulationChange(aParams, client, function(err) {
                                    if(err) return callback(err);
                                    callback(null, {
                                        RegulationID: requestParams.RegulationID, 
                                        ApplicationAreaID: requestParams.ApplicationAreaID, 
                                        SubstanceID: requestParams.SubstanceID, 
                                        RegulationChangeNo: lastRegulationChange.RegulationChangeNo + 1, 
                                        ComplianceStatus: complianceStatus, 
                                        ChangeDate: changeDate, 
                                        ChangedBy: changedBy, 
                                        NewThreshold: Number(requestParams.Threshold), 
                                        OldThreshold: Number(lastRegulationChange.NewThreshold), 
                                        NewUoM: requestParams.UoM, 
                                        OldUoM: lastRegulationChange.NewUoM
                                    });
                                });
                            } else {
                                callback(null, null);
                            }
                        } else {
                            aParams = [ requestParams.RegulationID, requestParams.ApplicationAreaID, requestParams.SubstanceID, 0,
                                        complianceStatus, changeDate, changedBy, Number(requestParams.Threshold), null,
                                        requestParams.UoM, "",
                                        requestParams.RegulationID, requestParams.ApplicationAreaID, requestParams.SubstanceID, 0];
                            this.createRegulationChange(aParams, client, function(err) {
                                if(err) return callback(err);
                                callback(null, {
                                    RegulationID: requestParams.RegulationID, 
                                    ApplicationAreaID: requestParams.ApplicationAreaID, 
                                    SubstanceID: requestParams.SubstanceID, 
                                    RegulationChangeNo: 0, 
                                    ComplianceStatus: complianceStatus, 
                                    ChangeDate: changeDate, 
                                    ChangedBy: changedBy, 
                                    NewThreshold: Number(requestParams.Threshold), 
                                    OldThreshold: null, 
                                    NewUoM: requestParams.UoM, 
                                    OldUoM: ""
                                });
                            });
                        }
                    }.bind(this),

                    function getAffectedMaterials(oRegulationChange, callback) {
                        if(!oRegulationChange) return callback(null, null, []);
                        console.info("searching affected materials for: " + JSON.stringify(oRegulationChange));
                        this.getMaterialUsageIDs(oRegulationChange.RegulationID, oRegulationChange.ApplicationAreaID, client, function(err, aMaterialIDs) {
                            console.info("found affected materials: " + JSON.stringify(aMaterialIDs));
                            if(err) return callback(err);
                            callback(null, oRegulationChange, aMaterialIDs);
                        });
                    }.bind(this),

                    function createMaterialRegulationChanges(oRegulationChange, aMaterialIDs, callback) {
                        if(!oRegulationChange) callback(null, []);
                        var aAsync = [];
                        aMaterialIDs.forEach(function (sMaterialID) {
                            var aParams = [ sMaterialID, oRegulationChange.RegulationID, oRegulationChange.ApplicationAreaID, oRegulationChange.SubstanceID,
                                            oRegulationChange.RegulationChangeNo, complianceStatus, changeDate, changedBy,
                                            Number(oRegulationChange.NewThreshold), Number(oRegulationChange.OldThreshold),
                                            oRegulationChange.NewUoM, oRegulationChange.OldUoM,
                                            sMaterialID, oRegulationChange.RegulationID, oRegulationChange.ApplicationAreaID, oRegulationChange.SubstanceID,
                                            oRegulationChange.RegulationChangeNo];
                            aAsync.push(function(innerCallback) {
                                this.createMaterialRegulationChange(aParams, client, innerCallback);
                            }.bind(this));
                        }.bind(this));
                        async.parallel(aAsync, callback);
                    }.bind(this)
                ],
                function (err) {
                    //console.info("createSubRegAndRegChangeAndMatRegChange: method exit");
                    if (err) {
                        console.error("error during creation of substance regulations/material changes from inbound request: " + JSON.stringify(err));
                        return cb(err);
                    }
                    cb(null);
                }
            );
        },

        createInboundRequest: function (requestParams, client, user, cb) {
            console.info("createInboundRequest - user: " + JSON.stringify(user));
            
            async.waterfall(
                [
                    function readRequestById(callback) {
                        this.readRequestById(requestParams.requestid, client, callback);
                    }.bind(this),

                    function readRegulationChange(oRequest, callback) {
                        console.info("Found request on DB: " + JSON.stringify(oRequest));
                        if(oRequest) return callback(null, null);
                        this.getLastRegulationChange(requestParams.regulationid, requestParams.applicationareaid, requestParams.substanceid, client, callback);
                    }.bind(this),

                    function createRequest(oLastRegulationChange, callback) {
                        console.info("Last regulation change: " + JSON.stringify(oLastRegulationChange));
                        if(!oLastRegulationChange) return callback(null, null);
                        var dDueDate = new Date(requestParams.DueDate);
                        if (isNaN(dDueDate.getTime())) {
                            dDueDate = new Date(); //TODO: Currently invalid date becomes today
                        }
                        var newInboundRequestParams = {
                            RequestID: requestParams.requestid,
                            BusinessPartnerID: requestParams.sendingbusinesspartnerid,
                            MaterialID: requestParams.sendingbusinesspartnermaterialid,
                            RegulationID: requestParams.regulationid,
                            ApplicationAreaID: requestParams.applicationareaid,
                            SubstanceID: requestParams.substanceid,
                            RegulationChangeNo: oLastRegulationChange.RegulationChangeNo,
                            RequestStatus: "REQR",
                            RequestDate: new Date().toISOString(),
                            DueDate: dDueDate.toISOString(),
                            Inbound: "X"
                        };
            
                        this.createRequest(newInboundRequestParams, client, callback);
                    }.bind(this)                    
                ],
                function (err, res) {
                    if (err) {
                        console.error("error during inbound request creation" + JSON.stringify(err));
                        return cb(err);
                    }
                    cb(null, res);
                }
            );
        },

        updateSubstanceRegulation: function (aParams, client, cb) {
            //console.info("updateSubstanceRegulation: method enter");
            dbStatement(
                client,
                "UPDATE \"REG.SubstanceRegulation\" SET \"Threshold\" = ?, \"UoM\" = ?, \"Sign\" = ? WHERE \"RegulationID\" = ? AND \"ApplicationAreaID\" = ? AND \"SubstanceID\" = ?",
                aParams,
                function (err) {
                    if (err) return cb(err);

                    //if (typeof rows === "number") {
                    //    console.log("Substance Regulation updated" + rows);
                    //} else if (rows && rows[0]) {
                    //    console.log("Substance Regulation updated" + rows[0].RegulationID);
                    //}
                    //console.info("updateSubstanceRegulation: method exit");
                    cb(null);
                });
        },

        updateRequestStatus: function (sRequestID, sRequestStatus, client, cb) {
            async.waterfall(
                [
                    function updateReq(callback) {
                        dbStatement(
                            client,
                            "UPDATE \"REQ.Request\" SET \"RequestStatus\" = ? WHERE \"RequestID\" = ?",
                            [sRequestStatus, sRequestID],
                            callback
                        );
                    },
                    function readReq(dbResult, callback) {
                        dbStatement(
                            client,
                            "SELECT * FROM \"REQ.Request\" WHERE \"RequestID\" = ?",
                            [sRequestID],
                            function (err, res) {
                                //console.info("updateRequestStatus: method exit");
                                if(err) return callback(err);
                                callback(null, res[0]);
                            }
                        );
                    }
                ],
                function (err, res) {
                    if (err) {
                        console.error("Error during update of request status: " + JSON.stringify(err));
                        return cb(err);
                    }
                    return cb(null, res);
                }
            );
        },

        updateComposition: function (quantity, materialID, substanceID, client, cb) {
            //console.info("updateComposition: method enter");
            dbStatement(
                client,
                "UPDATE \"COM.Composition\" SET \"Quantity\" = ? WHERE \"MaterialID\" = ? AND \"SubstanceID\" = ?",
                [quantity, materialID, substanceID],
                function (err) {
                    //console.info("updateComposition: method exit");
                    cb(err);
                });
        },

        updateMaterialRegulationChangeStatus: function (status, materialID, regulationID, applicationAreaID, substanceID, regulationChangeNo, client, cb) {
            //console.info("updateMaterialRegulationChangeStatus: method enter");
            dbStatement(
                client,
                "UPDATE \"REG.MaterialRegulationChange\" SET \"ComplianceStatus\" = ? WHERE " +
                "\"MaterialID\" = ? AND \"RegulationID\" = ? AND \"ApplicationAreaID\" = ? AND \"SubstanceID\" = ? AND \"RegulationChangeNo\" = ?",
                [status, materialID, regulationID, applicationAreaID, substanceID, regulationChangeNo],
                function (err) {
                    //console.info("updateMaterialRegulationChangeStatus: method exit");
                    cb(err);
                });
        },

        getLastRegulationChange: function (regulationID, applicationAreaID, substanceID, client, cb) {
            //console.info("getLastRegulationChange: method enter");
            dbStatement(
                client,
                "SELECT TOP 1 * FROM \"REG.RegulationChange\" WHERE \"RegulationID\" = ? AND \"ApplicationAreaID\" = ? AND \"SubstanceID\" = ? ORDER BY \"RegulationChangeNo\" DESC",
                [regulationID, applicationAreaID, substanceID],
                function (err, res) {
                    //console.info("Number of regulation changes: " + res.length);
                    if (res.length > 0) {
                        //console.log("getLastRegulationChange: " + JSON.stringify(res[res.length - 1]));
                        //console.info("getLastRegulationChange: method exit");
                        cb(null, res[0]);
                    }
                    else {
                        //console.info("getLastRegulationChange: method exit");
                        cb(null, null);
                    }
                });
        },

        getLastMaterialRegulationChange: function (materialID, regulationID, applicationAreaID, substanceID, client, cb) {
            //console.info("getLastMaterialRegulationChange: method enter");
            dbStatement(
                client,
                "SELECT TOP 1 * FROM \"REG.MaterialRegulationChange\" WHERE \"MaterialID\" = ? AND \"RegulationID\" = ? AND \"ApplicationAreaID\" = ? AND \"SubstanceID\" = ? ORDER BY \"RegulationChangeNo\" DESC",
                [materialID, regulationID, applicationAreaID, substanceID],
                function (err, res) {
                    //console.info("Number of regulation changes: " + res.length);
                    if (res.length > 0) {
                        //console.log("getLastMaterialRegulationChange: " + JSON.stringify(res[res.length - 1]));
                        //console.info("getLastMaterialRegulationChange: method exit");
                        cb(null, materialID, res[0]);
                    }
                    else {
                        //console.info("getLastMaterialRegulationChange: method exit");
                        cb(null, materialID, null);
                    }
                });
        },

        getMyBusinessPartnerID: function (client, cb) {
            //console.info("getMyBusinessPartnerID: method enter");
            dbStatement(
                client,
                "SELECT * FROM \"BP.BusinessPartner\" WHERE \"IsOwned\" = ?",
                ["X"],
                function (err, res) {
                    if (res && res[0]) {
                        //console.log(res[0].ID);
                        //console.info("getMyBusinessPartnerID: method exit");
                        cb(null, res[0].ID);
                    } else {
                        var errorObj = new Error("No business partner could be found with IsOwned property set.");
                        errorObj.statusCode = 500;
                        cb(errorObj);
                    }
                });
        },

        getReceivingBPMaterialID: function (client, materialID, businessPartnerID, cb) {
            //console.info("getReceivingBPMaterialID: method enter");
            dbStatement(
                client,
                "SELECT * FROM \"BP.BusinessPartnerMaterial\" WHERE \"BusinessPartnerID\" = ? AND \"MaterialID\" = ?",
                [materialID, businessPartnerID],
                function (err, res) {
                    if (err) return cb(err);

                    if (res && res[0]) {
                        //console.log(res[0].ExternalMaterialID);
                        cb(null, res[0].ExternalMaterialID);
                    } else {
                        var errorObj = new Error("No business partner material could be found for this business partner with this material ID.");
                        errorObj.statusCode = 500;
                        cb(errorObj);
                    }
                });
        },

        getMaterialUsageIDs: function (regulationID, applicationAreaID, client, cb) {
            //console.info("getMaterialUsageIDs: method enter");
            dbStatement(
                client,
                "SELECT * FROM \"MAT.MaterialUsage\" WHERE \"RegulationID\" = ? AND \"ApplicationAreaID\" = ?",
                [regulationID, applicationAreaID],
                function (err, res) {
                    if (err) return cb(err);

                    //console.log("Number of material usages: " + res.length);
                    var materialIDs = [];
                    if (res && res.length > 0) {
                        for (var index = 0; index < res.length; index++) {
                            materialIDs.push(res[index].MaterialID);
                        }
                    }
                    //console.info("getMaterialUsageIDs: method exit");
                    cb(null, materialIDs);
                });
        },

        getMaterialUsages: function (regulationID, applicationAreaID, client, cb) {
            //console.info("getMaterialUsages: method enter");
            dbStatement(
                client,
                "SELECT * FROM \"MAT.MaterialUsage\" WHERE \"RegulationID\" = ? AND \"ApplicationAreaID\" = ?",
                [regulationID, applicationAreaID],
                function (err, res) {
                    //console.info("getMaterialUsages: method exit");
                    if (err) err.statusCode = 500;
                    cb(err, res);
                });
        },

        getCompositionItem: function (materialID, substanceID, client, cb) {
            //console.info("getCompositionItem: method enter");
            dbStatement(
                client,
                "SELECT * FROM \"COM.Composition\" WHERE \"MaterialID\" = ? AND \"SubstanceID\" = ?",
                [materialID, substanceID],
                function (err, rows) {
                    //console.info("getCompositionItem: method exit");
                    if (err) return cb(err);
                    if (rows && rows[0]) {
                        cb(null, rows[0]);
                    } else {
                        var errorObj = new Error("No composition item found for this material ID and substabce ID.");
                        errorObj.statusCode = 500;
                        cb(errorObj);
                    }
                });
        },

        getSubstanceRegulation: function (regulationID, applicationAreaID, substanceID, client, cb) {
            //console.info("getSubstanceRegulation: method enter");
            dbStatement(
                client,
                "SELECT * FROM \"REG.SubstanceRegulation\" WHERE \"RegulationID\" = ? AND \"ApplicationAreaID\" = ? AND \"SubstanceID\" = ?",
                [regulationID, applicationAreaID, substanceID],
                function (err, rows) {
                    //console.info("getSubstanceRegulation: method exit");
                    if (err) return cb(err);
                    if (rows && rows[0]) {
                        cb(null, rows[0]);
                    } else {
                        var errorObj = new Error("No relevant substance regulation found.");
                        errorObj.statusCode = 500;
                        cb(errorObj);
                    }
                });
        },

        getRequest: function (requestID, client, cb) {
            //console.info("getRequest: method enter");
            dbStatement(
                client,
                "SELECT * FROM \"REQ.Request\" WHERE \"RequestID\" = ?",
                [requestID],
                function (err, rows) {
                    //console.info("getRequest: method exit");
                    if (err) return cb(err);
                    if (rows && rows[0]) {
                        cb(null, rows[0]);
                    } else {
                        var errorObj = new Error("No relevant request found.");
                        errorObj.statusCode = 500;
                        cb(errorObj);
                    }
                });
        },

        getMaterialUsageRequests: function (materialID, regulationID, applicationAreaID, client, cb) {
            //console.info("getMaterialUsageRequests: method enter");
            dbStatement(
                client,
                "SELECT * FROM \"REQ.Request\" WHERE \"MaterialID\" = ? AND \"RegulationID\" = ? AND \"ApplicationAreaID\" = ?",
                [materialID, regulationID, applicationAreaID],
                function (err, rows) {
                    //console.info("getMaterialUsageRequests: method exit");
                    if (err) return cb(err);
                    if (rows) {
                        cb(null, rows);
                    } else {
                        var errorObj = new Error("No relevant request(s) found.");
                        errorObj.statusCode = 500;
                        cb(errorObj);
                    }
                });
        }
    };
}());