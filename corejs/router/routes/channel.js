/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, quotes: 0, no-use-before-define: 0, new-cap:0 */
/* jshint undef: true, unused: true */
/* globals require, global, Promise, module, console, process */

(function () {
	"use strict";
	var express = require("express");
	var bodyParser = require("body-parser");
	var winston = require("winston");
	var async = require("async");
	var util = require(global.__base + "utils/util");
	var channelUtil = require(global.__base + "utils/channelUtil");
	var hanaUtil = require(global.__base + "utils/hanaUtil");
	var complianceCheckUtil = require(global.__base + "utils/complianceCheckUtil");

	module.exports = function () {

		var app = express.Router();
		var jsonParser = bodyParser.json();
		var logger;

		winston.level = process.env.winston_level || "error";

		var postRequest = function (requestParams, res, client, logger, cb) {
			try {
				if (requestParams.BusinessPartnerID && requestParams.MaterialID && requestParams.RegulationID && requestParams.ApplicationAreaID &&
					requestParams.SubstanceID && requestParams.RegulationChangeNo && requestParams.DueDate) {

					hanaUtil.getMyBusinessPartnerID(client, function (err, sendingBPID) {
						hanaUtil.getReceivingBPMaterialID(client, requestParams.BusinessPartnerID, requestParams.MaterialID, function (err, receivingBPMaterialID) {
							requestParams.SendingBusinessPartnerID = sendingBPID;
							requestParams.ReceivingBusinessPartnerMaterialID = receivingBPMaterialID;
							channelUtil.createRequest(requestParams, function (err, sRequestID) {
								if (err) {
									logger.error("Error occured: Request could not be posted on Blockchain network: " + err);
									cb(err);
								} else {
									requestParams.RequestID = sRequestID;
									requestParams.RequestStatus = "REQS"; // Request status: Request Sent
									requestParams.RequestDate = new Date().toISOString(); // Current Date.
									requestParams.DueDate = new Date(requestParams.DueDate).toISOString();
									requestParams.Inbound = "-"; // "-" for all outbound requets
									hanaUtil.createRequest(requestParams, client, function (err, sRequestID) {
										if (err) {
											logger.error("Error occured: Request could not be created in HANA DB: " + err);
											cb(err);
										} else {
											// update material regulation change statuses
											var matRegChangeStatus = "PRES"; // Pending Response
											hanaUtil.updateMaterialRegulationChangeStatus(matRegChangeStatus, requestParams.MaterialID, requestParams.RegulationID, requestParams.ApplicationAreaID, requestParams.SubstanceID, requestParams.RegulationChangeNo, client, function (err) {
												if (err) {
													logger.error("Error occured: Material Regulation Change status could not be updated: " + err);
													cb(null, sRequestID);
												} else {
													cb(null, sRequestID);
												}
											});
										}
									});
								}
							});
						});
					});
				} else {
					var error = new Error("None of the BusinessPartnerID, MaterialID, RegulationID, ApplicationAreaID, SubstanceID, RegulationChangeNo, DueDate could be empty.");
					logger.error(error.message);
					util.callback(error, res, error.message);
				}
			} catch (error) {
				logger.error(error);
				cb(error);
			}
		};

		var postResponse = function(oRequestParams, client, cb) {
			if (oRequestParams.RequestID && oRequestParams.BusinessPartnerID) {
				async.waterfall(
					[
						function getRequest(callback) {
							hanaUtil.getRequest(oRequestParams.RequestID, client, callback);
						},
						function determineComplianceStatus(oRequest, callback) {
							complianceCheckUtil.performSingleItemComplianceCheck(client, oRequest.MaterialID, oRequest.RegulationID, oRequest.ApplicationAreaID,
								oRequest.SubstanceID, function(err, sComplianceStatus, oCompositionItem) {
									if(err) return callback(err);
									callback(null, oRequest, sComplianceStatus, oCompositionItem);
								});
						},
						function getOwnBusinesPartnerID(oRequest, sComplianceStatus, oCompositionItem, callback) {
							hanaUtil.getMyBusinessPartnerID(client, function (err, sSendingBPID) {
								if(err) return callback(err);
								callback(null, sSendingBPID, oRequest, sComplianceStatus, oCompositionItem);
							});
						},
						function createBlockchainResponse(sSendingBPID, oRequest, sComplianceStatus, oCompositionItem, callback) {
							var oBlockchainResponse = {
								RequestID:                oRequestParams.RequestID,
								SendingBusinessPartnerID: sSendingBPID,
								BusinessPartnerID:        oRequestParams.BusinessPartnerID,
								ResponseDate:             new Date().toISOString(), 
								Quantity:                 oCompositionItem.Quantity,
								UoM:                      oCompositionItem.UoM,
								ComplianceStatus:         sComplianceStatus
							};
							channelUtil.createResponse(oBlockchainResponse, function (err) {
								if (err) return callback(err);
								callback(null, sSendingBPID, oRequest, sComplianceStatus, oCompositionItem);
							});
						},
						function createDBResponse(sSendingBPID, oRequest, sComplianceStatus, oCompositionItem, callback) {
							var oDBResponse = {
								RequestID:        oRequestParams.RequestID,
								ComplianceStatus: sComplianceStatus,
								ResponseDate:     new Date().toISOString(),
								Quantity:         oCompositionItem.Quantity,
								UoM:              oCompositionItem.UoM
							};
							hanaUtil.createResponse(oDBResponse, client, function (err) {
								if (err) return callback(err);
								callback(null);
							});
						},
						function updateDBRequest(callback) {
							hanaUtil.updateRequestStatus(oRequestParams.RequestID, "RESS", client, function(err) {
								if(err) return callback(err);
								callback(null);
							});
						}
					], 
					function(err) {
						if(err) {
							console.error("Error in response sending: " + JSON.stringify(err));
							return cb(err);
						}
						cb(null);
					}
				);
			} else {
				var error = new Error("None of the RequestID, BusinessPartnerID could be empty.");
				console.error(error.message);
				cb(error);
			}
		};

		app.get("/getSendingBPID", function (req, res) {
			logger = req.loggingContext.getLogger("/channel/getSendingBPID");
			var client = req.db;
			console.log(req);

			hanaUtil.getMyBusinessPartnerID(client, function (error, myBPID) {
				if (error) {
					logger.error("Error occured" + error);
					util.callback(error, res, "Fetching business partner failed.");
				} else {
					res.writeHead(200, {
						"Content-Type": "application/json"
					});
					res.end(JSON.stringify(myBPID));
				}
			});
		});

		
		app.get("/Token", function(req, res) {
			res.writeHead(200, {
				"Content-Type": "application/json"
			});
			res.end("{}");
		});

		app.post("/postRequest", jsonParser, function (req, res) {
			logger = req.loggingContext.getLogger("/channel/postRequest");
			var client = req.db,
				aRequests = req.body,
				aAsync = [];

			aRequests.forEach(function(oRequest) {
				aAsync.push(function(callback) {
					postRequest(oRequest, res, client, logger, callback);
					
				});
			}.bind(this));

			async.parallel(aAsync, function(err, results) {
				if(err) {
					var error = new Error("Requests could not be posted successfully. See log for more details: "+ JSON.stringify(err));
					logger.error(error.message);
					util.callback(error, res, error.message);
				} else {
					util.callback(null, res, results);
				}
			});
		});

		app.post("/postResponse", jsonParser, function (req, res) {
			logger = req.loggingContext.getLogger("/channel/postResponse");
			var client = req.db,
				aResponses = req.body,
				aAsync = [];

			aResponses.forEach(function(oResponse) {
				aAsync.push(function(callback) {
					postResponse(oResponse, client, callback);
				});
			}.bind(this));

			async.parallel(aAsync, function(err, results) {
				if(err) {
					var error = new Error("Requests could not be posted successfully. See log for more details: "+ JSON.stringify(err));
					logger.error(error.message);
					util.callback(error, res, error.message);
				} else {
					util.callback(null, res, results);
				}
			});
		});

		app.post("/postSubstanceRegulation", jsonParser, function (req, res) {
			logger = req.loggingContext.getLogger("/channel/postSubstanceRegulation");
			var client = req.db;
			var user = req.user;
			var requestParams = req.body;

			if (requestParams.RegulationID && requestParams.ApplicationAreaID && requestParams.SubstanceID &&
				requestParams.Threshold && requestParams.UoM && requestParams.Sign) {
				// Post on blockchain network
				channelUtil.addRegulatedCompound(requestParams, function (err) {
					if (err) {
						logger.error("Error occured: Regulated Compund not be posted on Blockchain network: " + err);
						util.callback(err, res, "Regulated Compund could not be posted on Blockchain network.");
					} else {
						// Get material usages
						hanaUtil.getMaterialUsageIDs(requestParams.RegulationID, requestParams.ApplicationAreaID, client, function (err, materialIDs) {
							requestParams.MaterialIDs = materialIDs;
							hanaUtil.createSubRegAndRegChangeAndMatRegChange(requestParams, client, user, function (err) {
								if (err) {
									logger.error("Error occured: Substance Regulation could not be created in HANA DB: " + err);
									util.callback(err, res, "Substance Regulation could not be created in HANA DB.");
								} else {
									util.callback(null, res, "Substance Regulation successfully created in HANA DB.");
								}
							});
						});
					}
				});
			} else {
				var error = new Error("None of the RegulationID, ApplicationAreaID, SubstanceID, Threshold, UoM or Sign could be empty.");
				logger.error(error.message);
				util.callback(error, res, error.message);
			}
		});

		//TODO
		app.post("/performMaterialComplianceCheck", jsonParser, function (req, res) {
			logger = req.loggingContext.getLogger("/channel/performMaterialComplianceCheck");
			var client = req.db,
				aMaterials = req.body;

			var aPromises = [];
			for (var index = 0; index < aMaterials.length; index++) {
				aPromises.push(new Promise(function (fnResolve, fnReject) {
					complianceCheckUtil.performSingleItemComplianceCheck(client, aMaterials[index].MaterialID, aMaterials[index].RegulationID,
						aMaterials[index].ApplicationAreaID, aMaterials[index].SubstanceID,
						function (err, complianceStatus) {
							if (err) {
								fnReject(JSON.stringify(err));
							} else {
								fnResolve(complianceStatus);
							}
						});
				}));
			}

			Promise.all(aPromises).then(function (aComplianceStatuses) {
				util.callback(null, res, aComplianceStatuses); // Success
			}).catch(function (sReason) {
				var error = new Error("Compliance check could not be completed. See log for more details.");
				logger.error(error.message + sReason);
				util.callback(error, res, error.message);
			});
		});

		app.post("/addRegulatedCompound", jsonParser, function (req, res) {
			logger = req.loggingContext.getLogger("/channel/addRegulatedCompound");
			var requestParams = req.body;

			// Post on blockchain network
			channelUtil.addRegulatedCompound(requestParams, function (err) {
				if (err) {
					logger.error("Error occured: Regulated Compund not be posted on Blockchain network: " + err);
					util.callback(err, res, "Regulated Compund could not be posted on Blockchain network.");
				} else {
					util.callback(null, res, "Regulated Compund successfully posted on Blockchain network.");
				}
			});
		});

		app.post("/startBlockchainSync", jsonParser, function (req, res) {
			logger = req.loggingContext.getLogger("/channel/startBlockchainSync");

			channelUtil.startBlockchainSync(function (err) {
				if (err) {
					logger.error(err);
					util.callback(err, res, err.message);
				} else
					util.callback(null, res, "Blockchain synchronization process started.");
			});
		});

		app.post("/stopBlockchainSync", jsonParser, function (req, res) {
			logger = req.loggingContext.getLogger("/channel/stopRequestsSync");
			
			channelUtil.stopBlockchainSync(function (err) {
				if (err) {
					logger.error(err);
					util.callback(err, res, err.message);
				} else
					util.callback(null, res, "Blockchain synchronization process stopped.");
			});
		});

		app.post("/startRequestsSync", jsonParser, function (req, res) {
			logger = req.loggingContext.getLogger("/channel/startRequestsSync");
			var user = req.user;

			channelUtil.startRequestsSync(user, function (err) {
				if (err) {
					logger.error(err);
					util.callback(err, res, err.message);
				} else
					util.callback(null, res, "Request synchronization process started.");
			});
		});

		app.post("/stopRequestsSync", jsonParser, function (req, res) {
			logger = req.loggingContext.getLogger("/channel/stopRequestsSync");

			channelUtil.stopRequestsSync(function (err) {
				if (err) {
					logger.error(err);
					util.callback(err, res, err.message);
				} else
					util.callback(null, res, "Request synchronization process stopped.");
			});
		});

		app.post("/startResponsesSync", jsonParser, function (req, res) {
			logger = req.loggingContext.getLogger("/channel/startResponsesSync");

			channelUtil.startResponsesSync(function (err) {
				if (err) {
					logger.error(err);
					util.callback(err, res, err.message);
				} else
					util.callback(null, res, "Response synchronization process started.");
			});
		});

		app.post("/stopResponsesSync", jsonParser, function (req, res) {
			logger = req.loggingContext.getLogger("/channel/stopResponsesSync");

			channelUtil.stopResponsesSync(function (err) {
				if (err) {
					logger.error(err);
					util.callback(err, res, err.message);
				} else
					util.callback(null, res, "Response synchronization process stopped.");
			});
		});

		return app;
	};
}());