sap.ui.define([
    "camelot/smartcontract/administration/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (BaseController, MessageBox, MessageToast, History) {
    "use strict";

    return BaseController.extend("camelot.smartcontract.administration.controller.Network", {

        onInit: function () {

        },

        setGBSaveVisibility: function (selectedTab) {
            if (selectedTab === "CreateCustomGenesisTab")
                return true;
            else
                return false;
        },

        setNetworksStartWithGenesisVisibility: function (viewModelData) {
            if (viewModelData.selectedTab === "NetworkTab" && viewModelData.selectedMenu === "ExtendNetwork")
                return true;
            else
                return false;
        },

        setNetworksStartVisibility: function (selectedTab) {
            if (selectedTab === "NetworkTab")
                return true;
            else
                return false;
        },

        setBootURLVisibility: function (selectedMenu) {
            if (selectedMenu === "ExtendNetwork")
                return true;
            else if (selectedMenu === "StartNetwork")
                return false;
        },

        setDefaultAccountVisibility: function (selectedMenu) {
            if (selectedMenu === "ExtendNetwork")
                return true;
            else if (selectedMenu === "StartNetwork")
                return false;
        },

        onCustomGenesisSave: function () {
            var data = this.getView().getModel("customGenesisModel").getData();
            if (data.Nonce && data.MixHash && data.Difficulty && data.Alloc.Account && data.Alloc.Balance && data.Coinbase &&
                data.Timestamp && data.ParentHash && data.ExtraData && data.GasLimit) {
                this.createCustomGenesisBlock(data, function (response, status) {
                    if (status === "error") {
                        MessageBox.error("Genesis block could not be created. Reason: " + response.responseJSON.error.message);
                    } else if (status === "success") {
                        MessageToast.show("Genesis block was successfully saved.");
                    }
                });
            } else
                MessageBox.error("All the values are mandatory for creating a custom genesis file.");
        },

        onExtendWithGenesis: function () {
            var view = this.getView().getModel("viewModel").getData().selectedMenu;
            if (view === "ExtendNetwork")
                this.extendNodes(true);
            else if (view === "StartNetwork")
                this.startNodes();
        },

        onExtendWithoutGenesis: function () {
            this.extendNodes(false);
        },

        startNodes: function () {
            var config = this.getView().getModel("configModel").getData();
            if (config.basePort && config.baseRPCPort && config.startNode && config.numberOfNodes && config.genesisBlockId &&
                config.networkId && config.password) {
                var data = {
                    basePort: parseInt(config.basePort),
                    baseRPCPort: parseInt(config.baseRPCPort),
                    startNode: parseInt(config.startNode),
                    numberOfNodes: parseInt(config.numberOfNodes),
                    genesisBlockId: config.genesisBlockId,
                    networkId: config.networkId,
                    pwdDefaultAccount: config.password
                };
                this.extendExistingNetwork(data, function (response, responseStatus) {
                    if (responseStatus === "success") {
                        MessageToast.show("Ethereum nodes started successfully.");
                    } else if (responseStatus === "error") {
                        MessageBox.error("Ethereum nodes could not be started. Reason: " + response.responseJSON.error.message);
                    }
                }.bind(this));
            } else
                MessageBox.error("All the configuration values are mandatory.");
        },

        extendNodes: function (genesisInitalization) {
            var config = this.getView().getModel("configModel").getData();
            if (config.basePort && config.baseRPCPort && config.startNode && config.numberOfNodes && config.genesisBlockId &&
                config.networkId && config.bootUrl && config.password) {
                var data = {
                    basePort: parseInt(config.basePort),
                    baseRPCPort: parseInt(config.baseRPCPort),
                    startNode: parseInt(config.startNode),
                    numberOfNodes: parseInt(config.numberOfNodes),
                    genesisBlockId: config.genesisBlockId,
                    networkId: config.networkId,
                    bootUrl: config.bootUrl,
                    genesisInitalization: genesisInitalization,                    
                    pwdDefaultAccount: config.password,
                    defaultNode:config.defaultNode
                };
                this.extendExistingNetwork(data, function (response, responseStatus) {
                    if (responseStatus === "success") {
                        MessageToast.show("Ethereum nodes started successfully.");
                    } else if (responseStatus === "error") {
                        MessageBox.error("Ethereum nodes could not be started. Reason: " + response.responseJSON.error.message);
                    }
                }.bind(this));
            } else
                MessageBox.error("All the configuration values are mandatory.");
        }
    });
});