sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {
    "use strict";

    return Controller.extend("camelot.smartcontract.administration.BaseController", {

        //Gets all custom genesis blocks
        getCustomGenesisBlocks: function (responseCallBack) {
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/GenesisBlock";
            jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: url,
                async: true,
                success: responseCallBack,
                error: responseCallBack
            });
        },

        //creates custom genesis block
        createCustomGenesisBlock: function (data, responseCallBack) {
            data.Alloc = "{\"" + data.Alloc.Account + "\":{\"" + data.Alloc.BalanceText + "\":\"" + data.Alloc.Balance + "\"}}";
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/GenesisBlock";
            jQuery.ajax({
                type: "POST",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: responseCallBack,
                error: responseCallBack
            });
        },

        startNewNetwork: function (data, responseCallBack) {
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Ethereum/startEthereumNetwork";
            jQuery.ajax({
                type: "POST",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: responseCallBack,
                error: responseCallBack
            });
        },

        extendExistingNetwork: function (data, responseCallBack) {
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Ethereum/extendEthereumNodes";
            jQuery.ajax({
                type: "POST",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: responseCallBack,
                error: responseCallBack
            });
        },

        //Gets details of all the running nodes
        getRunningNodes: function (responseCallBack) {
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Ethereum/runningNodes";
            jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: url,
                async: true,
                success: responseCallBack,
                error: responseCallBack
            });
        },

        startNode: function (nodeId, responseCallBack) {
            var data = { nodeId: nodeId };
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Ethereum/startEthereumNodes";
            jQuery.ajax({
                type: "POST",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: responseCallBack,
                error: responseCallBack
            });
        },

        stopNode: function (nodeId, responseCallBack) {
            var data = { nodeId: nodeId };
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Ethereum/stopEthereumNodes";
            jQuery.ajax({
                type: "POST",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: responseCallBack,
                error: responseCallBack
            });
        },

        startMiningNode: function (nodeId, responseCallBack) {
            var data = { nodeId: nodeId };
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Ethereum/startMiningEthereumNodes";
            jQuery.ajax({
                type: "POST",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: responseCallBack,
                error: responseCallBack
            });
        },

        stopMiningNode: function (nodeId, responseCallBack) {
            var data = { nodeId: nodeId };
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Ethereum/stopMiningEthereumNodes";
            jQuery.ajax({
                type: "POST",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: responseCallBack,
                error: responseCallBack
            });
        },

        connectToNode: function (nodeId, responseCallBack) {
            var data = { nodeId: nodeId };
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Ethereum/connect";
            jQuery.ajax({
                type: "POST",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: responseCallBack,
                error: responseCallBack
            });
        },

         disconnectNode: function (responseCallBack) {
            var data = { nodeId: -1 };
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Ethereum/connect";
            jQuery.ajax({
                type: "POST",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: responseCallBack,
                error: responseCallBack
            });
        },

        updateGethNode: function (node,responseCallBack) {
            var data = { node: node };
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/GethNodes/updateGethNode";
            jQuery.ajax({
                type: "POST",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: responseCallBack,
                error: responseCallBack
            });
        },

        _navWithHash: function (oRouter, sHash) {
            if (this._checkUserModel()) {
                var bFound = false,
                    aMenu = sap.ui.getCore().getModel("appsMenu").getProperty("/Menu");
                for (var i in aMenu) {
                    if (jQuery.sap.startsWith(sHash, aMenu[i].targetRouteURI) && !aMenu[i].opened) {
                        aMenu[i].opened = true;
                        sap.ui.getCore().getModel("appsMenu").setProperty("/Menu/" + i, aMenu[i]);
                        oRouter.navTo(aMenu[i].targetRoute, null, true);
                        return;
                    }
                }
            }
        },

        createNewApplication: function (data, success, error) {
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Applications";
            jQuery.ajax({
                type: "POST",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: success,
                error: error
            });
        },

        updateApplication: function (data, cb) {
            var data = {data:data};
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Applications/updateApplication";
            jQuery.ajax({
                type: "post",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: cb,
                error: cb
            });
        },

        exportApplication: function (data, cb) {
            var data = {data:data};
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Applications/exportApplication";
            jQuery.ajax({
                type: "post",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: cb,
                error: cb
            });
        },

        importApplication: function (fileName, cb) {
            var data = {fileName:fileName};
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Applications/importApplication";
            jQuery.ajax({
                type: "post",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: cb,
                error: cb
            });
        },

        uploadApplication: function (file, cb, error) {
            var form_data = new FormData();                  
            form_data.append('file', file);
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/containers/container1/upload/";
            jQuery.ajax({
                type: "post",
                url: url,
                processData: false,
                contentType: false,
                data: form_data,
                success: cb,
                error: error
            });
        },

        getApplications: function (success, error) {
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Applications";
            jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: url,
                async: true,
                success: success,
                error: error
            });
        },

        getBaasInstances: function (success, error) {
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/BaasInstances";
            jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: url,
                async: true,
                success: success,
                error: error
            });
        },

        deleteAllApplications: function (id,cb) {
            var data = {id:id};
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Applications/deleteAllApplications";
            jQuery.ajax({
                type: "post",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(data),
                async: true,
                success: cb,
                error: cb
            });
        },

        downloadApplication: function (fileName, success, error) {
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/containers/container1/download/"+fileName;
            jQuery.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                xhrFields : {
                       responseType : 'blob'
                       },
                dataType: "binary",
                url: url,
                async: true,
                success: success,
                error: error
            });
        },
        
        getGlobalMode: function (cb) {
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/Applications/getGlobalMode";
            jQuery.ajax({
                type: "get",
                contentType: "application/json",
                url: url,
                dataType: "json",
                async: true,
                success: cb,
                error: cb
            });
        },

        addBaasInstance: function (instance, success, error) {
            var url = this.getOwnerComponent().getMetadata().getManifest()["sap.app"]["dataSources"]["loopbacksource"]["uri"] + "/BaasInstances";
            jQuery.ajax({
                type: "POST",
                contentType: "application/json",
                url: url,
                dataType: "json",
                data: JSON.stringify(instance),
                async: true,
                success: success,
                error: error
            });
        },
    });
});