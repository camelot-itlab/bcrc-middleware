sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"../model/models"
], function(BaseController, MessageBox, models) {
	"use strict";

	return BaseController.extend("com.sap.ipdci.bcrc.rcManage.controller.ConditionOfUse", {
		_expand: "Regulation,MaterialUsages,MaterialUsages/ComplianceStatusEntity," +
				 "MaterialUsages/Material,MaterialUsages/Material/ProductFamily,SubstanceRegulations," +
				 "SubstanceRegulations/Substance,RegulationChanges,RegulationChanges/Substance",
		
		onInit: function() {
			this.mBindingOptions = {};
			this.getView().addStyleClass(this.getOwnerComponent().fnGetContentDensityClass());
			this.getView().setModel(models.createViewModel(), "viewModel");
			
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("ConditionOfUse").attachDisplay(jQuery.proxy(this.fnHandleRouteMatched, this));
		},

		onAffectedProductsPress: function(oEvent) {
			return this.fnOnPressTableItemNavigation(oEvent, "Product");
		},

		onHistoryItemPress: function(oEvent) {
			return this.fnOnPressRowNavigation(oEvent, "RegulationChange");
		},

		onAddRegulatedSubstance: function() {
			var oBindingContext = this.getView().getBindingContext();
			if(oBindingContext) {
				var oEntity = this._getNewSubstanceRegulationInstance(oBindingContext.getProperty("RegulationID"), oBindingContext.getProperty("ApplicationAreaID"));
				return this.fnOpenDialog("SubstanceRegulationDialog", "New", oEntity);
			} else {
				MessageBox.error("No View Binding");
			}
		},

		onEditRegulatedSubstance: function() {
			var oSelectedItem = this.getView().byId("SubstanceRegulation").getSelectedItem();
			if(oSelectedItem && oSelectedItem.getBindingContext()) {
				var oBindingContext = oSelectedItem.getBindingContext(),
					oEntity = oBindingContext.getModel().getProperty(oBindingContext.sPath);
			
				return this.fnOpenDialog("SubstanceRegulationDialog", "Edit", oEntity);
			} else {
				MessageBox.error("No item selected");
			}
		},

		onDeleteRegulatedSubstance: function() {
			var oSelectedItem = this.getView().byId("SubstanceRegulation").getSelectedItem(),
				oBindingContext = oSelectedItem.getBindingContext(),
				oModel = oBindingContext.getModel(),
				oEntity = oModel.getProperty(oBindingContext.getPath()),
				bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				
			this.fnOnDeleteConfirmation(bCompact, 
										"Delete substance regulation from this condition of use?", 
										"Regulation for substance item deleted successfully.", 
										oModel, 
										"SubstanceRegulation", 
										oEntity);
		},

		_getNewSubstanceRegulationInstance: function(sRegulationID, sApplicationAreaID) {
			return {
				"RegulationID": sRegulationID,
				"ApplicationAreaID": sApplicationAreaID,
				"SubstanceID": "",
				"Threshold": 0.0,
				"UoM": "%",
				"Sign": "LE"
			};
		}
	});
}, /* bExport= */ true);