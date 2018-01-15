sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {

        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        createShellViewModel: function () {
            var oModel = new JSONModel({
                showPane: true
            });
            return oModel;
        },

        createAppModel: function () {
            var oModel = new JSONModel();
            oModel.loadData("model/apps.json", {}, false, "GET", false, false, {});
            return oModel;
        }

    };
});