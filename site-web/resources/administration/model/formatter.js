sap.ui.define(function () {
    "use strict";
    return {
        appMenuVisible: function (mode, target) {
            if(mode === "SAP_BAAS" && (target === "StartNetwork" || target === "ExtendNetwork" || target === "RunningNodes")){
                return false;
            }else if(mode === "ETHEREUM" && target === "RunningBaasInstances"){
                return false;
            }else{
                return true;
            }
        }
    };
});