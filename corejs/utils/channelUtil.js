/* jshint undef: true, unused: true */
/* globals global, require, module, console, clearInterval */

(function () {
    "use strict";
    var request = require("request");
    var uuidv1 = require("uuid/v1");
    var async = require("async");

    var xsenv = require("@sap/xsenv");
    var hdbext = require("@sap/hdbext");

    var hanaUtil = require(global.__base + "utils/hanaUtil");

    var apiKey = "zMV7bgkx6RMa2CJhJfe8GkhZ1TkP42T4PGQzMtR37X6z8pztBHV0qtgvAc6J2vYFTUAKipEXcQrAbyEK2VONlGikMd5c06KSPDQpdn64Rg9VerG8aOC6FPYBqLxXRWN8xD8WgOfnIlO9huPxCmmLG9WFFt3oxH5PcWqE8NMJ1pc5ywRwnG4tX62ixgEVrojjNKVYZ0XDrguAUJZB3Us9YYdMKANAckbaJoIWjT4g6ad18OOjW5vVfvx8NftDpHqsyZdBpyvC8bp6m6W07e8VaRRwLGtDje8WrrF9J5GtiOSnaMrDEsaHaQIcWNSxwHIvC4DcKQ4HaAm23rOm4tPgWBY5ehmuhviDUYYTq9crcf6mNNDuhBAXyagDQsOLInLfvDCSoBHqoHdwCLnyzaERRj0p6lihI4uejHl6mmd4oNOGvcwRWjtHjKoJhEOycU8hFKqTw2RS798dCyhg9AuXno38HXEXtrRfVHUMXJRJFhHtwFDedqOkxRKZNkvdOKsf";
    var chaincodeURL = "https://hyperledger-api.cfapps.eu10.hana.ondemand.com/invoke";
    var chaincodeID = "08fb3b88863cefe053a76c4f9c852ff9";

    var syncRequestsInterval;
    var syncResponsesInterval;
    var syncInterval;

    var openDBConnection = function (callback) {
        console.info("openDBConnection");
        var hanaOptions = xsenv.getServices({
            hana: { tag: "hana" }
        }).hana;
        hdbext.createConnection(hanaOptions, callback);
    };

    // TODO: should handle multiple business partners
    var getOwnBusinessPartnerIDs = function (client, callback) {
        //console.info("getOwnBusinessPartnerIDs");
        //console.info(client._connection.getClientInfo());
        hanaUtil.getMyBusinessPartnerID(client, function (err, sBPID) {
            console.info(JSON.stringify(sBPID));
            callback(err, client, sBPID);
        });
    };

    var blockchainPostHeader = function () {
        return { "Content-Type": "application/json", "Accept": "application/json", "apikey": apiKey, "Connection": "keep-alive", "accept-encoding": "gzip, deflate" };
    };

    var blockchainPost = function (oBody, sErrorText, callback) {
        console.info("Blockchain request: " + JSON.stringify(oBody));
        request.post({
            headers: blockchainPostHeader(),
            url: chaincodeURL,
            body: oBody,
            json: true
        }, function (error, response, body) {
            if (error || !body.txId) {
                var errorObj = new Error(sErrorText);
                console.error(JSON.stringify(errorObj));
                if (error)
                    console.error(JSON.stringify(error));
                callback(errorObj);
            } else {
                console.info("Blockchain response: " + JSON.stringify(response.body));
                callback(null, response, body);
            }
        });
    };

    module.exports = {
        createRequest: function (oParams, cb) {
            ///console.info("createRequest: " + "function enter");
            //console.log(oParams);
            if (!oParams.ReceivingBusinessPartnerMaterialID) {
                cb(new Error("Receiving BusinessPartner MaterialID cannot be empty."));
            }

            var requestUUId = uuidv1(),
                requestObject = {
                    "chaincodeId": chaincodeID,
                    "fcn": "createrequest",
                    "args": [
                        requestUUId,
                        oParams.SendingBusinessPartnerID, // sending business partner ID
                        oParams.BusinessPartnerID, // receiving business partner ID
                        oParams.MaterialID, // sending business partner material ID
                        oParams.ReceivingBusinessPartnerMaterialID, // receiving business partner material ID
                        oParams.RegulationID,
                        oParams.ApplicationAreaID,
                        oParams.SubstanceID,
                        oParams.DueDate
                    ]
                };

            blockchainPost(requestObject, "Request could not be posted on the blockchain network", function (err) {
                cb(err, requestUUId);
            });
        },

        readRequests: function (receivingBusinessPartnerID, cb) {
            //console.info("readRequests: " + "function enter");
            var requestObject = {
                "chaincodeId": chaincodeID,
                "fcn": "readrequests",
                "args": [
                    receivingBusinessPartnerID
                ]
            };

                blockchainPost(requestObject, "Requests could not be read from the blockchain network", function (err, response, body) {
                    if (err) {
                        cb(err);
                    } else {
                        if (body && body.data && body.data.replace) {
                            var resultString = body.data.replace(/\0/g, ""),
                                results = JSON.parse(resultString);
                            //console.info("Requests result string: " + resultString);
                            //console.info("readRequests: " + "function exit");
                            cb(null, results.results);
                        } else {
                            cb(new Error("Unexpected format"));
                        }
                    }
                });
        },

        readRequestById: function (receivingBusinessPartnerID, requestID, cb) {
            //console.info("readRequestById: " + "function enter");
            var requestObject = {
                "chaincodeId": chaincodeID,
                "fcn": "readrequest",
                "args": [
                    receivingBusinessPartnerID,
                    requestID
                ]
            };

            blockchainPost(requestObject, "Request could not be read from the blockchain network", function (err, response, body) {
                if (err) {
                    cb(err);
                } else {
                    //console.info("readRequestById: " + "function exit");
                    cb(null, JSON.parse(body.data));
                }
            });
        },

        createResponse: function (oParams, cb) {
            //console.info("createResponse: " + "function enter");
            if (!oParams.RequestID || !oParams.SendingBusinessPartnerID || !oParams.BusinessPartnerID ||
                !oParams.ResponseDate || !oParams.Quantity || !oParams.UoM || !oParams.ComplianceStatus) {
                cb(new Error("None od the RequestID, SendingBusinessPartnerID, BusinessPartnerID, RepsonseDate, Quantity, UoM, ComplianceStatus can be empty."));
            }

            var requestObject = {
                "chaincodeId": chaincodeID,
                "fcn": "createresponse",
                "args": [
                    oParams.RequestID,
                    oParams.SendingBusinessPartnerID, // sending business partner ID
                    oParams.BusinessPartnerID, // receiving business partner ID
                    oParams.ResponseDate,
                    oParams.Quantity, // updated quantity for the regulated substance that the request with this RequestID corresponds to
                    oParams.UoM,
                    oParams.ComplianceStatus // compliance status for the regulated substance that the request with this RequestID corresponds to
                ]
            };

            blockchainPost(requestObject, "Response could not be created on the blockchain network", function (err) {
                //console.info("createResponse: " + "function exit");
                cb(err);
            });
        },

        readResponses: function (receivingBusinessPartnerID, cb) {
            //console.info("readResponses: " + "function enter");
            var requestObject = {
                "chaincodeId": chaincodeID,
                "fcn": "readresponses",
                "args": [
                    receivingBusinessPartnerID
                ]
            };

            blockchainPost(requestObject, "Responses could not be read from the blockchain network", function (err, response, body) {
                if (body.data && body.data.replace) {
                    var resultString = body.data.replace(/\0/g, "");
                    var results = JSON.parse(resultString);
                    //console.info("Responses result string: " + resultString);
                    //console.info("readResponses: " + "function exit");
                    cb(null, results.results);
                } else {
                    cb(new Error("Unexpected format"));
                }
            });
        },

        addRegulatedCompound: function (oParams, cb) {
            //console.info("addRegulatedCompound: " + "function enter");
            //console.log(oParams);
            var requestObject = {
                "chaincodeId": chaincodeID,
                "fcn": "addregulatedcompound",
                "args": [
                    oParams.RegulationID,
                    oParams.ApplicationAreaID,
                    oParams.SubstanceID,
                    oParams.Threshold,
                    oParams.UoM,
                    oParams.Sign
                ]
            };

            blockchainPost(requestObject, "Regulated Substance could not be posted on the blockchain network", function (err) {
                //console.info("addRegulatedCompound: " + "function exit");
                cb(err);
            });
        },

        readRegulatedCompoundsByID: function (regulationID, applicationAreaID, substanceID, cb) {
            //console.info("readRegulatedCompoundsByID: " + "function enter");
            var requestObject = {
                "chaincodeId": chaincodeID,
                "fcn": "readregulatedcompoundsbyid",
                "args": [
                    regulationID,
                    applicationAreaID,
                    substanceID
                ]
            };

            blockchainPost(requestObject, "Could not read regulated substance from the blockchain network", function (err, response, body) {
                if (err) {
                    cb(err);
                } else {
                    if (body.data) {
                        //console.info("readRegulatedCompoundsByID: " + "function exit");
                        cb(null, JSON.parse(body.data));
                    } else {
                        cb(new Error("No regulated compound entry could be found."));
                    }
                }
            });
        },

        readRegulatedSubstances: function (cb) {
            var requestObject = {
                "chaincodeId": chaincodeID,
                "fcn": "readregulatedcompounds",
                "args": []
            };

            blockchainPost(requestObject, "Could not read regulated substances from the blockchain network", function (err, response, body) {
                if (err) {
                    cb(err);
                } else {
                    if (body && body.data && body.data.replace) {
                        var resultString = body.data.replace(/\0/g, ""),
                            results = JSON.parse(resultString);
                        cb(null, results.results);
                    } else {
                        cb(new Error("Unexpected format"));
                    }
                }
            });
        },

        synchronizeInboundRequests: function (user, cb) {
            //console.info("synchronizeInboundRequests: " + "function enter, user: " + JSON.stringify(user));
            async.waterfall(
                [
                    openDBConnection,
                    getOwnBusinessPartnerIDs,

                    function readBlockchainRequests(client, sBPID, callback) {
                        //console.info("Own Business Partner ID: " + sBPID);
                        //console.info("readBlockchainRequests");
                        this.readRequests(sBPID, function (err, channelRequests) {
                            if (err) {
                                console.error("Error during reading inbound requests, reading blockchain requests: " + JSON.stringify(err));
                                return callback(err);
                            }
                            callback(err, client, channelRequests);
                        });
                    }.bind(this),

                    function createDBRequests(client, aChannelRequests, callback) {
                        console.info("Requests: " + JSON.stringify(aChannelRequests));
                        var aAsync = [];
                        aChannelRequests.forEach(function (oItem) {
                            var oChannelRequest = oItem.Record;
                            aAsync.push(function (callback) {
                                hanaUtil.createInboundRequest(oChannelRequest, client, user, function (err, requestId) {
                                    if (err) {
                                        console.error("Error during sync inbound requests, DB request creation: " + JSON.stringify(err));
                                        return callback(err);
                                    }
                                    callback(null, requestId);
                                });
                            });
                        });
                        async.parallel(aAsync, function (err, aData) {
                            if (err) {
                                console.error("Error during sync inbound requests, DB request creation: " + JSON.stringify(err));
                                return callback(err);
                            }
                            console.info("DB Requests created: " + JSON.stringify(aData));
                            callback(null);
                        });
                    }
                ],
                function (err) {
                    if (err) {
                        console.error("error in inbound request synchronisation: " + JSON.stringify(err));
                        console.error("error object type: " + typeof (err));
                        cb(err);
                    } else {
                        console.info("finished inbound request synchronisation");
                        cb(null);
                    }
                }
            );

            //syncRequestsInterval = setInterval(this.synchronizeInboundRequests.bind(this), 60000, user);
        },

        startRequestsSync: function (user, cb) {
            if (!syncRequestsInterval) {
                //console.infoerror("Setting interval for request sync start");
                //syncRequestsInterval = setInterval(this.synchronizeInboundRequests.bind(this), 60000, user);
                //if (syncRequestsInterval) {
                cb(null);
                this.synchronizeInboundRequests(user, function(err) {
                    if(err) console.error(JSON.stringify(err));
                });
                //} else {
                //    var errorObj = new Error("Error occured: Request synchronization process could not be started.");
                //    errorObj.statusCode = 500;
                //    cb(errorObj);
                //}
            } else {
                var errorObj = new Error("Error occured: Cannot restart. Request synchronization process already started.");
                errorObj.statusCode = 500;
                cb(errorObj);
            }
        },

        stopRequestsSync: function (cb) {
            if (syncRequestsInterval) {
                clearInterval(syncRequestsInterval);
                syncRequestsInterval = null;
                cb(null);
            } else {
                var errorObj = new Error("Error occured: Request synchronization process could not be stopped.");
                errorObj.statusCode = 500;
                cb(errorObj);
            }
        },

        synchronizeInboundResponses: function (cb) {
            //console.info("synchronizeInboundResponses: " + "function enter");
            async.waterfall(
                [
                    openDBConnection,
                    getOwnBusinessPartnerIDs,

                    function readBlockchainResponses(client, sBPID, callback) {
                        //console.info("Own Business Partner ID: " + sBPID);
                        this.readResponses(sBPID, function (err, aChannelResponses) {
                            callback(err, client, aChannelResponses);
                        });
                    }.bind(this),

                    function takeOnlyLastResponse(client, aChannelResponses, callback) {
                        if(!aChannelResponses || aChannelResponses.length == 0) {
                            return callback(null, client, []);
                        }
                        var aFilteredResponses = [];
                        aChannelResponses.forEach(function (oItem) {
                            var aCurrenctIDs = aChannelResponses.filter(
                                function lastDate(oInnerItem) { 
                                    return oInnerItem != null && new Date(oItem.responsedate) < new Date(oInnerItem.responsedate) && oItem.requestid == oInnerItem.requestid; 
                                });
                            if(aCurrenctIDs.length == 0) {
                                aFilteredResponses.push(oItem);
                            }
                        });
                        callback(null, client, aFilteredResponses);
                    },

                    function findChangedResponses(client, aChannelResponses, callback) {
                        console.info("Responses: " + JSON.stringify(aChannelResponses));
                        if(!aChannelResponses || aChannelResponses.length == 0) {
                            return callback(null, client, []);
                        }
                        var aAsync = [];
                        aChannelResponses.forEach(function (oItem) {
                            var oChannelResponses = oItem.Record;
                            aAsync.push(function(innerCallback) {
                                hanaUtil.readResponseById(oChannelResponses, client, function(err, oResponse) {
                                    if(err) return innerCallback(err);
                                    if(!oResponse || oResponse.Quantity != oChannelResponses.quantity || oResponse.UoM != oChannelResponses.uom) {
                                        innerCallback(null, {
                                            RequestID: oChannelResponses.requestid,
                                            ResponseDate: new Date(oChannelResponses.responsedate).toISOString(),
                                            Quantity: oChannelResponses.quantity,
                                            UoM: oChannelResponses.uom,
                                            ComplianceStatus: oChannelResponses.compliancestatus
                                        });
                                    } else {
                                        innerCallback(null, null);
                                    }
                                });
                            });
                        }.bind(this));
                        async.parallel(aAsync, function(err, results) {
                            if(err) return callback(err);
                            console.info("Changed Responses unfiltered: " + JSON.stringify(results));

                            callback(null, client, 
                                results.filter(
                                    function notNull(oItem) { 
                                        return oItem != null; 
                                    }
                                ).sort(
                                    function(a, b) {
                                        return new Date(a.ResponseDate) - new Date(b.ResponseDate);
                                    }
                                )
                            );
                        });
                    },

                    function createDBResponses(client, aChangedResponses, callback) {
                        console.info("Changed Responses filtered: " + JSON.stringify(aChangedResponses));
                        if(!aChangedResponses || aChangedResponses.length == 0) {
                            return callback(null, client, [], []);
                        }
                        var aAsync = [];
                        aChangedResponses.forEach(function (oResponse) {
                            aAsync.push(function (innerCallback) {
                                hanaUtil.createResponse(oResponse, client, innerCallback);
                            });
                        });
                        async.parallel(aAsync, function (err, aRequestIDs) {
                            if (err) {
                                console.error("Error during sync inbound responses, DB response creation: " + JSON.stringify(err));
                                callback(err);
                            } else {
                                //console.info("DB Responses created: " + JSON.stringify(aRequestIDs));
                                callback(null, client, aRequestIDs, aChangedResponses);
                            }
                        });
                    },

                    function updateDBRequests(client, aRequestIDs, aChangedResponses, callback) {
                        console.info("Requests to be changed: " + JSON.stringify(aRequestIDs));
                        if(!aRequestIDs || aRequestIDs.length == 0) {
                            return callback(null, client, [], []);
                        }
                        var aAsync = [];
                        aRequestIDs.forEach(function (sRequestID) {
                            aAsync.push(function (innerCallback) {
                                hanaUtil.updateRequestStatus(sRequestID, "RESR", client, innerCallback);
                            });
                        });
                        async.parallel(aAsync, function (err, aRequestEntries) {
                            if (err) {
                                console.error("Error during DB update inbound requests: " + JSON.stringify(err));
                                callback(err);
                            } else {
                                //console.info("DB Requests updated: " + JSON.stringify(aRequestEntries));
                                callback(null, client, aRequestEntries, aChangedResponses);
                            }
                        });
                    },

                    function updateCompositions(client, aRequestEntries, aChangedResponses, callback) {
                        console.info("Compositions to be changed: " + JSON.stringify(aRequestEntries));
                        var aAsync = [];
                        aRequestEntries.filter(function (oResponse) {
                            return oResponse && oResponse.RequestID;
                        }).forEach(function (oItem) {
                            var aFilteredResponse = aChangedResponses.filter(function (oResponse) {
                                return oResponse && oResponse.RequestID && oResponse.RequestID === oItem.RequestID;
                            });
                            if (aFilteredResponse.length != 1) {
                                return callback(new Error("Found not exactly one response for request entry: " + JSON.stringify(oItem)));
                            }
                            aAsync.push(function (callback) {
                                hanaUtil.updateComposition(aFilteredResponse[0].Quantity, oItem.MaterialID, oItem.SubstanceID, client, callback);
                            });
                        });
                        async.parallel(aAsync, callback);
                    }
                ],
                function (err) {
                    if (err) {
                        console.error("error in inbound response synchronisation: " + JSON.stringify(err));
                        cb(err);
                    } else {
                        console.info("finished inbound response synchronisation");
                        cb(null);
                    }
                }
            );
            //syncResponsesInterval = setInterval(this.synchronizeInboundResponses.bind(this), 60000);
        },

        startResponsesSync: function (cb) {
            if (!syncResponsesInterval) {
                //console.info("Setting interval for response sync start");
                //syncResponsesInterval = setInterval(this.synchronizeInboundResponses.bind(this), 60000);
                //if (syncResponsesInterval) {
                cb(null);
                this.synchronizeInboundResponses(function(err) {
                    if(err) console.error(JSON.stringify(err));
                });
                //} else {
                //   var errorObj = new Error("Error occured: Responses synchronization process could not be started.");
                //    errorObj.statusCode = 500;
                //    cb(errorObj);
                //}
            } else {
                var errorObj = new Error("Error occured: Cannot restart. Responses synchronization process already started.");
                errorObj.statusCode = 500;
                cb(errorObj);
            }
        },

        stopResponsesSync: function (cb) {
            if (syncResponsesInterval) {
                clearInterval(syncResponsesInterval);
                syncResponsesInterval = null;
                cb(null);
            } else {
                var errorObj = new Error("Error occured: Responses synchronization process could not be stopped.");
                errorObj.statusCode = 500;
                cb(errorObj);
            }
        },

        synchronizeRegulatedSubstances: function(cb) {
            var that = this;
            async.waterfall(
                [
                    openDBConnection,
                    function readRegulatedSubstancesFromBlockchain(client, callback) {
                        that.readRegulatedSubstances(function(err, aRegulatedSubstances) {
                            callback(err, client, aRegulatedSubstances);
                        });
                    },
      
                    function createSubstanceRegulationChangeAndDependents(client, aRegulatedSubstances, callback) {
                        var aAsync = [];
                        console.info("createSubstanceRegulationChangeAndDependents with: " + JSON.stringify(aRegulatedSubstances));
                        aRegulatedSubstances.forEach(function(oRegulatedSubstance) {
                            var oNewRegulatedSubstance = {
                                RegulationID:      oRegulatedSubstance.Record.regulationid, 
                                ApplicationAreaID: oRegulatedSubstance.Record.applicationareaid, 
                                SubstanceID:       oRegulatedSubstance.Record.substanceid,
                                Threshold:         oRegulatedSubstance.Record.threshold, 
                                UoM:               oRegulatedSubstance.Record.unitofmeas, 
                                Sign:              oRegulatedSubstance.Record.sign
                            };
                            aAsync.push(function (innerCallback) {        
                                console.info("single createSubstanceRegulationChangeAndDependents with: " + JSON.stringify(oNewRegulatedSubstance));
                                hanaUtil.createSubRegAndRegChangeAndMatRegChange(oNewRegulatedSubstance, client, {id:"Blockchain Input"}, innerCallback);
                            });
                        });
                        async.parallel(aAsync, function(err) {
                            if(err) return callback(err);
                            callback(null);
                        });
                    }
                ], 
                function(err, results) {
                    if(err) {
                        console.error("error in synchronizeRegulatedSubstances: " + JSON.stringify(err));
                        return cb(err);
                    }
                    cb(null, results);
                }
            );
        },
        
        performBlockchainSync: function(user, cb) {
            async.waterfall(
                [
                    this.synchronizeRegulatedSubstances.bind(this),
                    function syncReq(results, callback) {
                        this.synchronizeInboundRequests(user, callback);
                    }.bind(this),
                    this.synchronizeInboundResponses.bind(this)
                ], function(err) {
                if(err) {
                    console.error("error during blockchain sync: " + JSON.stringify(err));
                    return cb(err);
                }
                cb(null);
            });
        },

        startBlockchainSync: function (cb) {
            if (!syncResponsesInterval) {
                //console.info("Setting interval for response sync start");
                //syncInterval = setInterval(this.synchronizeInboundResponses.bind(this), 60000);
                //if (syncResponsesInterval) {
                cb(null);
                this.performBlockchainSync({id:"Blockchain Input"}, function(err) {
                    if(err) console.error(JSON.stringify(err));
                });
                //} else {
                //   var errorObj = new Error("Error occured: Responses synchronization process could not be started.");
                //    errorObj.statusCode = 500;
                //    cb(errorObj);
                //}
            } else {
                var errorObj = new Error("Error occured: Cannot restart. Responses synchronization process already started.");
                errorObj.statusCode = 500;
                cb(errorObj);
            }
        },

        stopBlockchainSync: function (cb) {
            if (syncInterval) {
                clearInterval(syncInterval);
                syncInterval = null;
                cb(null);
            } else {
                var errorObj = new Error("Error occured: Responses synchronization process could not be stopped.");
                errorObj.statusCode = 500;
                cb(errorObj);
            }
        }
    };
}());