/* jshint undef: true, unused: true */
/* globals global, require, module, console */

(function () {
    "use strict";
    var async = require("async");
    var hanaUtil = require(global.__base + "utils/hanaUtil");

    module.exports = {

        determineComplianceResponse: function (fQuantity, fThreshold, sUoM, sSign, cb) {
            if (fQuantity && fThreshold && sUoM && sSign) {
                if (sUoM === "%" && sSign === "LE") {
                    if (fQuantity < fThreshold) {
                        cb(null, "BT");
                    } else {
                        cb(null, "AT");
                    }
                } else {
                    console.error("Only implemented '%' and 'LE' for compliance status update, sent 'NR'");
                    cb(null, "UNKNOWN");
                }
            } else {
                console.error("Substance Regulation not expanded, cannot determine compliance status, sent 'NR'");
                cb(null, "UNKNOWN");
            }
        },

        performSingleItemComplianceCheck: function (client, materialID, regulationID, applicationAreaID, substanceID, cb) {
            if (materialID && regulationID && applicationAreaID && substanceID) {
                async.parallel(
                    {
                        comp: function getCompositionItem(callback) {
                            hanaUtil.getCompositionItem(materialID, substanceID, client, callback);
                        },
                        reg: function getRegulation(callback) {
                            hanaUtil.getSubstanceRegulation(regulationID, applicationAreaID, substanceID, client, callback);
                        }
                    },
                    function collectResultsCallCheck(err, results) {
                        if (err) {
                            console.error("error in compliance check: " + JSON.stringify(err));
                            return cb(err);
                        }

                        var oCompositionItem = results.comp,
                            oSubstanceRegulation = results.reg;
                        this.determineComplianceResponse(oCompositionItem.Quantity, oSubstanceRegulation.Threshold,
                            oSubstanceRegulation.UoM, oSubstanceRegulation.Sign,
                            function (err, sComplianceStatus) {
                                if (err) {
                                    console.error("error in compliance check: " + JSON.stringify(err));
                                    return cb(err);
                                }
                                cb(null, sComplianceStatus, oCompositionItem);
                            });
                    }.bind(this)
                );
            } else {
                console.error("None of MaterialID, RegulationID, ApplicationAreaID, SubstanceID can be empty.");
                cb(new Error("None of MaterialID, RegulationID, ApplicationAreaID, SubstanceID can be empty."));
            }
        },

        performMaterialComplianceCheck: function (materialID, client, logger, cb) {
            try {
                //hanaUtil.getMaterialUsages(regulationID, applicationAreaID, client, function (err, materialUsages) {
                //TODO
                //}.bind(this));
            } catch (error) {
                cb(error);
            }
        },

        performMaterialUsageComplianceCheck: function (materialID, regulationID, applicationAreaID, client, logger, cb) {
            //TODO
            try {
                var materialUsageComplianceStatuses = [], requestComplianceStatuses = [];
                hanaUtil.getSubstanceRegulations(regulationID, applicationAreaID, function (err, aSubstances) {
                    var aAsync = [];
                    aSubstances.forEach(function (element) {
                        aAsync.push(function (callback) {
                            this.performSingleItemComplianceCheck(client, materialID, regulationID, applicationAreaID, element.substanceID, function (err, sComplianceStatus) {
                                callback(err, {
                                    MaterialID: materialID,
                                    RegulationID: regulationID,
                                    ApplicationAreaID: applicationAreaID,
                                    ComplianceStatus: sComplianceStatus
                                });
                            });
                        }.bind(this));
                    }, this);
                    async.parallel(aAsync, function (err, results) {
                        materialUsageComplianceStatuses = results;
                    });
                });

                hanaUtil.getMaterialUsageRequests(materialID, regulationID, applicationAreaID, function (err, requests) {
                    if (err) {
                        console.error("Compliance check could not be performed for ");
                    } else {
                        for (var index = 0; index < requests.length; index++) {
                            requestComplianceStatuses.push(requests[index].RequestStatus);
                        }
                    }
                });

            } catch (error) {
                cb(error);
            }
        },
    };

}());