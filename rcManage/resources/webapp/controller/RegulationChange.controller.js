sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"../model/models"
], function(BaseController, MessageBox, models) {
	"use strict";

	return BaseController.extend("com.sap.ipdci.bcrc.rcManage.controller.RegulationChange", {
		
		_expand: "ComplianceStatusEntity,ConditionOfUse/Regulation,ConditionOfUse/ApplicationArea," +
				 "MaterialRegulationChanges,MaterialRegulationChanges/Material,MaterialRegulationChanges/Material/BusinessPartnerMaterials," +
				 "MaterialRegulationChanges/Material/ProductFamily,Request,Request/Material,Request/Material/ProductFamily," +
				 "Request/BusinessPartner,Request/Response,Request/RequestStatusEntity,MaterialRegulationChanges/ComplianceStatusEntity",
				 
				 
		onInit: function() {
			this.mBindingOptions = {};
			this.getView().addStyleClass(this.getOwnerComponent().fnGetContentDensityClass());
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("RegulationChange").attachDisplay(jQuery.proxy(this.fnHandleRouteMatched, this));
			this.getView().setModel(models.createViewModel(), "viewModel");
		},
		
		_onTableItemPress2: function(oEvent) {
			return this.fnOnPressTableItemNavigation(oEvent, "Product");
		},
		
		_onRowPress3: function(oEvent) {
			return this.fnOnPressRowNavigation(oEvent, "Product");
		},
		
		fnSupplyTypeGetGroup: function (oContext){
			var sKey = oContext.getProperty("SupplyType");
			return {
				key: sKey,
				title: sKey || "Empty Supply Type"
			};
		},
		
		fnGetGroupHeader: function (oGroup){
			return new sap.m.GroupHeaderListItem({
				title: oGroup.title,
				upperCase: false
			});
		},
		
		fnBusinessPartnerGetGroup: function (oContext){
			var sKey = oContext.getProperty("BusinessPartnerID");
			return {
				key: sKey,
				title: oContext.getProperty("BusinessPartner/Name")
			};
		},
		
		fnHandleInformationRequest: function() {
			var oTable = this.getView().byId("MaterialRegulationChanges"),
				oOutboundRequestTable = this.getView().byId("OutboundRequests"),
				aSelectedItems = oTable.getSelectedItems(),
				oOwnerComponent = this.getOwnerComponent();
			if(aSelectedItems && aSelectedItems.length && aSelectedItems.length > 0) {
				var aRequests = [];
				aSelectedItems.forEach(function(oSelectedItem) {
					var oBindingContext = oSelectedItem.getBindingContext(),
						oModel = oBindingContext.getModel(),
						oMaterialRegulationChange = oModel.getProperty(oBindingContext.sPath),
						aBusinessPartnerMaterials = oModel.getProperty(oBindingContext.sPath + "/Material/BusinessPartnerMaterials");
					if(aBusinessPartnerMaterials && aBusinessPartnerMaterials.length > 0) {
						aBusinessPartnerMaterials.forEach(function(oBusinessPartnerMaterial) {
							var sBusinessPartnerID = oModel.getProperty("/" + oBusinessPartnerMaterial + "/BusinessPartnerID");
							aRequests.push({
								BusinessPartnerID  : sBusinessPartnerID,
								MaterialID         : oMaterialRegulationChange.MaterialID,
								RegulationID       : oMaterialRegulationChange.RegulationID,
								ApplicationAreaID  : oMaterialRegulationChange.ApplicationAreaID,
								SubstanceID        : oMaterialRegulationChange.SubstanceID,
								RegulationChangeNo : oMaterialRegulationChange.RegulationChangeNo,
								DueDate            : new Date().toISOString() //TODO: Create dialog
							});
						});
						var fnSuccess = function(oData, sTextStatus, oRequest) { //TODO: only read for data
								oTable.getBinding("items").refresh();
								oOutboundRequestTable.getBinding("items").refresh();
								MessageBox.success("Created " + aRequests.length + " requests.");
							},
							fnError = function(jqXHR, textStatus, errorThrown) { 
								MessageBox.error(JSON.stringify(errorThrown)); 
							};
						oOwnerComponent._oBlockchainService.fnCreateRequest(aRequests, fnSuccess, fnError);
					}
				});
			} else {
				MessageBox.error("No item selected.");
			}
		}
	});
}, /* bExport= */ true);