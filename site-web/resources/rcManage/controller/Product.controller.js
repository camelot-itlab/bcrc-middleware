sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"../model/models",
	"sap/ui/model/Filter"
], function(BaseController, MessageBox, models, Filter) {
	"use strict";

	return BaseController.extend("com.sap.ipdci.bcrc.rcManage.controller.Product", {
		
		_expand: "ProductFamily,MaterialUsages,MaterialUsages/ConditionOfUse,MaterialUsages/ComplianceStatusEntity,MaterialUsages/ConditionOfUse/Regulation,MaterialUsages/ConditionOfUse/ApplicationArea,"+
				 "BillOfMaterials,BillOfMaterials/SourceMaterial/ComplianceStatusEntity,BillOfMaterials/SourceMaterial,BillOfMaterials/SourceMaterial/ProductFamily," +
				 "BusinessPartnerMaterials,BusinessPartnerMaterials/BusinessPartner,BusinessPartnerMaterials/ComplianceStatusEntity," +
				 "Requests,Requests/BusinessPartner,Requests/Composition,Requests/Response,Requests/RequestStatusEntity,Requests/Substance,Requests/RegulationChange,Requests/Response/ComplianceStatusEntity," +
				 "MaterialRegulationChanges,MaterialRegulationChanges/Substance,MaterialRegulationChanges/RegulationChange,MaterialRegulationChanges/ConditionOfUse,MaterialRegulationChanges/ComplianceStatusEntity," +
				 "Compositions,Compositions/Substance",
		
		onInit: function() {
			this.mBindingOptions = {};
			this.getView().addStyleClass(this.getOwnerComponent().fnGetContentDensityClass());
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Product").attachDisplay(jQuery.proxy(this.fnHandleRouteMatched, this));
			this.getView().setModel(models.createViewModel(), "viewModel");
		},

		onAddMaterialUsage: function() {
			var oBindingContext = this.getView().getBindingContext();
			if(oBindingContext) {
				var oEntity = this._getNewMaterialUsageInstance(oBindingContext.getProperty("ID"));
				return this.fnOpenDialog("MaterialUsageDialog", "New", oEntity);
			} else {
				MessageBox.error("No View Binding");
			}
		},

		onDeleteMaterialUsage: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("listItem"),
				oBindingContext = oSelectedItem.getBindingContext(),
				oModel = oBindingContext.getModel(),
				oEntity = oModel.getProperty(oBindingContext.getPath()),
				bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				
			this.fnOnDeleteConfirmation(bCompact, 
										"Delete condition of use from this material?", 
										"Condition of use of the material deleted successfully.", 
										oModel, 
										"MaterialUsage", 
										oEntity);
		},

		onAddCompositionItem: function() {
			var oBindingContext = this.getView().getBindingContext();
			if(oBindingContext) {
				var oEntity = this._getNewCompositionInstance(oBindingContext.getProperty("ID"));
				return this.fnOpenDialog("CompositionDialog", "New", oEntity);
			} else {
				MessageBox.error("No View Binding");
			}
		},

		onEditCompositionItem: function() {
			var oSelectedItem = this.getView().byId("Composition").getSelectedItem();
			if(oSelectedItem && oSelectedItem.getBindingContext()) {
				var oBindingContext = oSelectedItem.getBindingContext(),
					oEntity = oBindingContext.getModel().getProperty(oBindingContext.sPath);
			
				return this.fnOpenDialog("CompositionDialog", "Edit", oEntity);
			} else {
				MessageBox.error("No item selected");
			}
		},

		onDeleteCompositionItem: function() {
			var oSelectedItem = this.getView().byId("Composition").getSelectedItem(),
				oBindingContext = oSelectedItem.getBindingContext(),
				oModel = oBindingContext.getModel(),
				oEntity = oModel.getProperty(oBindingContext.getPath()),
				bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				
			this.fnOnDeleteConfirmation(bCompact, 
										"Delete composition item from this material?", 
										"Composition item deleted successfully.", 
										oModel, 
										"Composition", 
										oEntity);
		},
		
		fnDataReceived: function() {
			this.getView().byId("InboundRequests").getBinding("items").filter(new Filter({path: "Inbound", operator: "EQ", value1: "X"}));
			this.getView().byId("OutboundRequests").getBinding("items").filter(new Filter({path: "Inbound", operator: "EQ", value1: "-"}));
		},

		_getNewMaterialUsageInstance: function(sMaterialID) {
			return {
				"MaterialID": sMaterialID,
				"RegulationID": "",
				"ApplicationAreaID": "",
				"ComplianceStatus": "NR"
			};
		},

		_getNewCompositionInstance: function(sMaterialID) {
			return {
				"MaterialID": sMaterialID,
				"SubstanceID": "",
				"Type": "Bulk",
				"Quantity": "",
				"UoM": "%"
			};
		},

		_onRowPress6: function(oEvent) {
			return this.fnOnPressRowNavigation(oEvent, "ConditionOfUse");
		},

		_onTableItemPress4: function(oEvent) {
			return this.fnOnPressTableItemNavigation(oEvent, "Product");
		},

		_onRowPress7: function(oEvent) {
			return this.fnOnPressRowNavigation(oEvent, "Product");
		},

		_onRowPress8: function(oEvent) {
			return this.fnOnPressRowNavigation(oEvent, "Supplier");
		},

		_onRowPress9: function(oEvent) {
			return this.fnOnPressRowNavigation(oEvent, "Consumer");
		},

		_onRowPress10: function(oEvent) {
			return this.fnOnPressRowNavigation(oEvent, "Supplier");
		},

		_onRowPress11: function(oEvent) {
			return this.fnOnPressRowNavigation(oEvent, "RegulationChange");
		}
	});
}, /* bExport= */ true);