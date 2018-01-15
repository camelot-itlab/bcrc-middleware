sap.ui.define([
	"./DialogBaseController",
	"sap/m/MessageBox"
], function(BaseController) {
	"use strict";

	return BaseController.extend("com.sap.ipdci.bcrc.rcManage.controller.MaterialUsageDialog", {
		sEntityType: "MaterialUsage",
		sErrorCreateText: "Error creating new condition of use for the material: ",
		sErrorUpdateText: "Error updating the condition of use for the material: ",
		
		fnRefreshHandler: function() {
			var oTable = this.getOwnerComponent().byId("Product--MaterialUsages");
			if(oTable) {
				oTable.getBinding("items").refresh();
			}
		}
	});
}, /* bExport= */ true);