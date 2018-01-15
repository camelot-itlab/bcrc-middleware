sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox"
], function(BaseController, MessageBox) {
	"use strict";

	return BaseController.extend("com.sap.ipdci.bcrc.rcManage.controller.DialogController", {

		sEntityType: null,
		sErrorCreateText: "Unimplemented abstact method create(.)",
		sErrorUpdateText: "Unimplemented abstact method update(.)",
		fnRefreshHandler: function() {
			MessageBox.error("Refresh Handler not implemented");
		},

		onInit: function() {
			this.mBindingOptions = {};
			this._oDialog = this.getView().getContent()[0];
		},

		setRouter: function(oRouter) {
			this.oRouter = oRouter;
		},
		
		_fnCreate: function(oEntityInstance, oDialog, oModel, fnResolve, fnReject) {
			oModel.create("/" + this.sEntityType, oEntityInstance, {
				success: function() {
					oDialog.attachEventOnce("afterClose", null, fnResolve);
					oDialog.close();
				},
				error: function(err) {
					var sCreateErrorMessage = this.sErrorCreateText + err;
					fnReject(new Error(sCreateErrorMessage));
				}
			});
		},
		
		_fnUpdate: function(oEntityInstance, oDialog, oModel, fnResolve, fnReject) {
			var sObjectID = "/" + oModel.createKey(this.sEntityType, oEntityInstance);
			oModel.update(sObjectID, oEntityInstance, {
				success: function() {
					oDialog.attachEventOnce("afterClose", null, fnResolve);
					oDialog.close();
				},
				error: function(err) {
					var sEditErrorMessage = this.sErrorUpdateText + err;
					fnReject(new Error(sEditErrorMessage));
				}
			});
		},

		onConfirm: function() {
			var oDialog = this.getView().getContent()[0],
				oSavePromise = new Promise(function(fnResolve, fnReject) {
				var bHasPendingChanges = false;
				var oModel = this.getView().getModel();
				bHasPendingChanges = oModel && oModel.hasPendingChanges();

				if (bHasPendingChanges) {
					var sUserMessage = "Please save your changes, first";
					fnReject(new Error(sUserMessage));
				} else {
					var oEntityInstance = this.getView().getModel("entityInstance").getData(),
						oDialogModel = this.getView().getModel("dialog");
					if (oDialogModel.getProperty("/mode") === "New") {
						this._fnCreate(oEntityInstance, oDialog, oModel, fnResolve, fnReject);
					} else if (oDialogModel.getProperty("/mode") === "Edit") {
						this._fnUpdate(oEntityInstance, oDialog, oModel, fnResolve, fnReject);
					}
				}
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
			
			oSavePromise.then(this.fnRefreshHandler.bind(this));
			return oSavePromise;
		},

		onCancel: function() {
			var oDialog = this.getView().getContent()[0];
			return new Promise(function(fnResolve) {
				oDialog.attachEventOnce("afterClose", null, fnResolve);
				oDialog.close();
			});

		},

		onExit: function() {
			this._oDialog.destroy();
		}
	});
}, /* bExport= */ true);