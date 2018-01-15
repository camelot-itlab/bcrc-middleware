sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"../model/models"
], function(BaseController, MessageBox, models) {
	"use strict";

	return BaseController.extend("com.sap.ipdci.bcrc.rcManage.controller.Supplier", {
		
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
			this.oRouter.getTarget("Supplier").attachDisplay(jQuery.proxy(this.fnHandleRouteMatched, this));
			this.getView().setModel(models.createViewModel(), "viewModel");
		}
	});
}, /* bExport= */ true);