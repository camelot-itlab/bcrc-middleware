sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"sap/m/GroupHeaderListItem",
	"../model/models"
], function(BaseController, MessageBox, Sorter, GroupHeaderListItem, models) {
	"use strict";

	return BaseController.extend("com.sap.ipdci.bcrc.rcManage.controller.ChangedConditionsOfUse", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.sap.ipdci.bcrc.rcManage.view.ChangedConditionsOfUse
		 */
		onInit: function() {
			this.getView().addStyleClass(this.getOwnerComponent().fnGetContentDensityClass());
			this.oRouter = this.getOwnerComponent().getRouter();
			this.getView().setModel(models.createViewModel(), "viewModel");
		},
		
		onAfterRendering: function() {
			var aSorters = [
				new sap.ui.model.Sorter("RegulationID", false, this.fnGrouper),
				new sap.ui.model.Sorter("ApplicationAreaID", false)
			];
			
			this.getView().byId("MaterialUsage").getBinding("items").sort(aSorters);
		},
		
		fnGrouper: function(oContext) {
			var sRegID = oContext.getProperty("Regulation/ID"),
				sRegName = oContext.getProperty("Regulation/Name")/*,
				sAppAreaID = oContext.getProperty("ApplicationArea/ID"),
				sAppAreaDesc = oContext.getProperty("ApplicationArea/Description")*/;
			return { key: sRegID /*+ "/" + sAppAreaID*/, text: sRegName /*+ "/" + sAppAreaDesc*/ };
		},
		
		fnGroupHeader: function(oGroup) {
			return new GroupHeaderListItem({
				title : oGroup.text,
				upperCase : false
			});
		},
		
		fnOnStartListening: function() {
			this.getOwnerComponent()._oBlockchainService.fnBlockchainJobStart(
				function() {
					MessageBox.success("Started listener job for blockchain!");
				}, 
				function(oError) {
					MessageBox.error(JSON.stringify(oError));
				});
		},

		fnOnStopListening: function() {
			this.getOwnerComponent()._oBlockchainService.fnBlockchainJobStart(
				function() {
					MessageBox.success("Stopped listener job for blockchain!");
				}, 
				function(oError) {
					MessageBox.error(JSON.stringify(oError));
				});
		},
		
		_onTableItemPress1: function(oEvent) {
			return this.fnOnPressTableItemNavigation(oEvent, "ConditionOfUse");
		}
	});
});