sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "camelot/smartcontract/administration/model/models"
], function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("camelot.smartcontract.administration.Component", {

        metadata: {
            manifest: "json"
        },

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
        init: function () {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // create the views based on the url/hash
            this.getRouter().initialize();

            //get Applications from DB
				this.getApplications(function(data) {				
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(data);

					//set the applications model
					this.setModel(oModel, "applicationsModel");
								
				}.bind(this), function(error) {
					jQuery.sap.log.error("Applications could not be received " + error);
                }.bind(this));

            //get BaaS Instances from DB
				this.getBaasInstances(function(data) {				
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(data);

					//set the BaaS Instance model
					this.setModel(oModel, "baasInstancesModel");
								
				}.bind(this), function(error) {
					jQuery.sap.log.error("BaaS Instances could not be received " + error);
                }.bind(this));
                
            // Get Blockchain Global Mode
            this.getGlobalMode(function(data) {				
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData(data.globalMode);

                //set the global mode model
                this.setModel(oModel, "oModelGlobalMode");
                            
            }.bind(this), function(error) {
                jQuery.sap.log.error("Applications could not be received " + error);
            }.bind(this));
        },

        /**
			 * @public			 
		*/
        getApplications: function (success, error) {
            var url = this.getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Applications";
            jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: url,
                async: true,
                success: success,
                error: error
            });
        },

        getBaasInstances: function (success, error) {
            var url = this.getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/BaasInstances";
            jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: url,
                async: true,
                success: success,
                error: error
            });
        },

        getGlobalMode: function (cb) {
            var url = this.getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Applications/getGlobalMode";
            jQuery.ajax({
                type: "get",
                contentType: "application/json",
                url: url,
                dataType: "json",
                async: true,
                success: cb,
                error: cb
            });
        }
    });
});