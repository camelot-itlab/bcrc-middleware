sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.ipdci.bcrc.rcManage.controller.CreateMaterialUsage", {

		onInit: function() {
			this.mBindingOptions = {};
			this._oDialog = this.getView().getContent()[0];

		},

		setRouter: function(oRouter) {
			this.oRouter = oRouter;
		},

		getBindingParameters: function() {
			return {
				"expand": "ConditionOfUse"
			};
		},

		onConfirm: function() {
			var oDialog = this.getView().getContent()[0];
			return new Promise(function(fnResolve, fnReject) {
				var bHasPendingChanges = false;
				var oModel = this.getView().getModel();
				bHasPendingChanges = oModel && oModel.hasPendingChanges();

				if (bHasPendingChanges) {
					var sUserMessage = "Please save your changes, first";
					fnReject(new Error(sUserMessage));
				} else {
					var oNewEntityInstance = this.getView().getModel("newInstance").getData();
					oModel = this.getView().getModel();
					oModel.create("/MaterialUsage", oNewEntityInstance, {
						success: function(data) {
							jQuery.sap.log.debug(data);
							oDialog.attachEventOnce("afterClose", null, fnResolve);
							oDialog.close();
						},
						error: function(err) {
							var sCreateErrorMessage = "Error creating new usage for the material." + err;
							fnReject(new Error(sCreateErrorMessage));
						}
					});
				}
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

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