sap.ui.define([
	"./DialogBaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("com.sap.ipdci.bcrc.rcManage.controller.CompositionDialog", {
		sEntityType: "Composition",
		sErrorCreateText: "Error creating new composition item for the material: ",
		sErrorUpdateText: "Error updating the composition item for the material: ",
		
		fnRefreshHandler: function() {
			var oTable = this.getOwnerComponent().byId("Product--Composition");
			if(oTable) {
				oTable.getBinding("items").refresh();
			}
		}
	});
}, /* bExport= */ true);