sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"../model/models"
], function(BaseController, MessageBox, models) {
	"use strict";

	return BaseController.extend("com.sap.ipdci.bcrc.rcManage.controller.Consumer", {
		
		_expand: "BusinessPartnerMaterials,BusinessPartnerMaterials/Material,BusinessPartnerMaterials/Material/ProductFamily," +
				 "Requests,Requests/Material,Requests/Composition,Requests/Substance,Requests/SubstanceRegulation," +
				 "Requests/Response,Requests/Response/ComplianceStatusEntity,Requests/RequestStatusEntity,Requests/RegulationChange," +
				 "BusinessPartnerMaterials/ComplianceStatusEntity",
		
		_onRowPress4: function(oEvent) {
			return this.fnOnPressRowNavigation(oEvent, "Product");
		},
		
		_onRowPress5: function(oEvent) {
			return this.fnOnPressRowNavigation(oEvent, "RegulationChange");
		},
		
		onInit: function() {
			this.mBindingOptions = {};
			this.getView().addStyleClass(this.getOwnerComponent().fnGetContentDensityClass());
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Consumer").attachDisplay(jQuery.proxy(this.fnHandleRouteMatched, this));
			this.getView().setModel(models.createViewModel(), "viewModel");
		},
		
		fnHandlePublishComposition: function() {
			var oTable = this.getView().byId("InboundRequests"),
				aSelectedItems = oTable.getSelectedItems(),
				oOwnerComponent = this.getOwnerComponent();
			if(aSelectedItems && aSelectedItems.length && aSelectedItems.length > 0) {
				var aResponses = [];
				aSelectedItems.forEach(function(oSelectedItem) {
					var oBindingContext = oSelectedItem.getBindingContext(),
						oRequest = oBindingContext.getModel().getProperty(oBindingContext.sPath);
					aResponses.push({
						RequestID		  : oRequest.RequestID,
						BusinessPartnerID : oRequest.BusinessPartnerID
					});
				});
				var fnSuccess = function(oData, sTextStatus, oRequest) { //TODO: only read for data
						// Success //TODO update requests
						jQuery.sap.log.info("Created " + aSelectedItems.length + " requests");
						oTable.getBinding("items").refresh();
					},
					fnError = function(jqXHR, textStatus, errorThrown) { 
						MessageBox.error(JSON.stringify(errorThrown)); 
					};
				
				oOwnerComponent._oBlockchainService.fnCreateResponse(aResponses, fnSuccess, fnError);
			} else {
				MessageBox.error("No item selected");
			}
		}
	});
}, /* bExport= */ true);