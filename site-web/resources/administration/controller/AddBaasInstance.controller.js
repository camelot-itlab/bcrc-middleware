sap.ui.define(["camelot/smartcontract/administration/controller/BaseController", "sap/m/MessageToast"],
	function (BaseController, MessageToast) {
		"use strict";

		return BaseController.extend("camelot.smartcontract.administration.controller.AddBaasInstance", {

			onInit: function () {
				this.mBindingOptions = {};
				this._oDialog = this.getView().getContent()[0];
			},

			onExit: function () {
				this._oDialog.destroy();
			},

			setRouter: function (oRouter) {
				this.oRouter = oRouter;
			},

			getBindingParameters: function () {
				return {};

			},

			onBtnAdd: function (oEvent) {
				var oDialog = this.getView().getContent()[0];

				var actionType = this.getView().getModel().getData().actionType;
				var baasInstanceData = this.getView().getModel().getData().baasInstance;

				if (actionType === "Add") {

					var success = function (data) {

						//refresh the model with all applications
						this.getBaasInstances(function (data) {
							//set the applications model
							this.getOwnerComponent().getModel("baasInstancesModel").setData(null);
							this.getOwnerComponent().getModel("baasInstancesModel").setData(data);
						}.bind(this), function (error) {
							jQuery.sap.log.error("BaaS Instances could not be received " + error);
						}.bind(this));

						//close the dialog
						oDialog.close();
					}.bind(this);

					var error = function (err) {
						jQuery.sap.log.error("Could not add the BaaS Instance " + err);
						MessageToast.show("BaaS Instance cannot be added. Please refer log for more info.");
					}.bind(this);

					this.addBaasInstance(baasInstanceData, success, error);
				}
				// else if(actionType === "Edit"){
				// 	var callback = function(data) {

				// 		if(!data){
				// 			MessageToast.show("Application updated successfully.");	

				// 			//refresh the model with all applications
				// 			this.getApplications(function(data) {				
				// 				//set the applications model
				// 				this.getOwnerComponent().getModel("applicationsModel").setData(null);
				// 				this.getOwnerComponent().getModel("applicationsModel").setData(data);								
				// 			}.bind(this), function(error) {
				// 				jQuery.sap.log.error("Applications could not be received " + error);
				// 			}.bind(this));
				// 		}else{
				// 			jQuery.sap.log.error("Could not update the application " + data.statusText);
				// 			MessageToast.show("Application cannot be updated. Please refer log for more info.");
				// 		}
				// 		oDialog.close();
				// 	}.bind(this);

				// 	this.updateApplication(applicationData, callback);
				// }


			},

			onBtnCancel: function () {
				var oDialog = this.getView().getContent()[0];

				return new ES6Promise.Promise(function (resolve, reject) {
					oDialog.attachEventOnce("afterClose", null, resolve);

					oDialog.close();
				});

			}
		});
	}, /* bExport= */ true);