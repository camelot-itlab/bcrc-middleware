sap.ui.define([
	"./DialogBaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("com.sap.ipdci.bcrc.rcManage.controller.SubstanceRegulationDialog", {
		sEntityType: "SubstanceRegulation",
		sErrorCreateText: "Error creating new regulation for the substance: ",
		sErrorUpdateText: "Error updating the regulation for substance item: ",
		
		fnRefreshHandler: function() {
			var oTable = this.getOwnerComponent().byId("ConditionOfUse--SubstanceRegulation");
			if(oTable) {
				oTable.getBinding("items").refresh();
			}
		},
		
		_fnCreate: function(oEntityInstance, oDialog, oModel, fnResolve, fnReject) {
			this._fnPost(this.sErrorCreateText, oEntityInstance, oDialog, oModel, fnResolve, fnReject);
		},
		
		_fnUpdate: function(oEntityInstance, oDialog, oModel, fnResolve, fnReject) {
			this._fnPost(this.sErrorUpdateText, oEntityInstance, oDialog, oModel, fnResolve, fnReject);
		},
		
		_fnPost: function(sErrorText, oEntityInstance, oDialog, oModel, fnResolve, fnReject) {
			var oBody = {
					RegulationID      : oEntityInstance.RegulationID,
					ApplicationAreaID : oEntityInstance.ApplicationAreaID,
					SubstanceID       : oEntityInstance.SubstanceID,
					Threshold		  : oEntityInstance.Threshold,
					UoM            	  : oEntityInstance.UoM,
					Sign			  : oEntityInstance.Sign			 
				},
				fnSuccess = function(oData, sTextStatus, oRequest) { //TODO: only read for data
					oDialog.attachEventOnce("afterClose", null, fnResolve);
					oDialog.close();
				},
				fnError = function(jqXHR, textStatus, errorThrown) { 
					var sCreateErrorMessage = sErrorText + JSON.stringify(errorThrown);
					fnReject(new Error(sCreateErrorMessage));
				};
			
			this.getOwnerComponent()._oBlockchainService.fnCreateSubstanceRegulation(oBody, fnSuccess, fnError);
		}
	});
}, /* bExport= */ true);