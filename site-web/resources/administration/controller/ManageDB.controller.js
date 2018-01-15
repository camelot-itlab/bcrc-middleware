sap.ui.define([
    "camelot/smartcontract/administration/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (BaseController, MessageBox, MessageToast, History) {
    "use strict";

    return BaseController.extend("camelot.smartcontract.administration.controller.ManageDB", {

        onInit: function () {

        },

        checkRunningState: function (status) {
            if (status)
                return "Success";
            else
                return "Error";
        },

        

        onStartDB: function (oControlEvent) {
                    this.startDB(nodeId, function (response, responseStatus) {
                        if (responseStatus === "success") {
                            MessageToast.show("Ethereum node was successfully started.");
                            this.refreshRunningNodes();
                        } else if (responseStatus === "error") {
                            MessageBox.error("Ethereum node could not be started. Reason: " + response.responseJSON.error.message);
                        }
                    }.bind(this));
        },

        onStopDB: function (oControlEvent) {
                    this.stopDB(nodeId, function (response, responseStatus) {
                        if (responseStatus === "success") {
                            MessageToast.show("Ethereum node was successfully stopped.");
                            this.refreshRunningNodes();
                        } else if (responseStatus === "error") {
                            MessageBox.error("Ethereum node could not be stopped. Reason: " + response.responseJSON.error.message);
                        }
                    }.bind(this));
        }
    });
});