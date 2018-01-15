sap.ui.define([
    "camelot/smartcontract/administration/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "camelot/smartcontract/administration/model/models",
    "camelot/smartcontract/administration/model/formatter"
], function (BaseController, MessageBox, MessageToast, models, formatter) {
    "use strict";

    return BaseController.extend("camelot.smartcontract.administration.controller.Shell", {
        formatter:formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf camelot.smartcontract.view.Shell
		 */
        onInit: function () {
            var model = models.createAppModel();
            sap.ui.getCore().setModel(model, "appsMenu");
            this.getView().setModel(model, "appsMenu");
            this.getView().setModel(models.createShellViewModel(), "shellView");

            var oRouter = this.getOwnerComponent().getRouter();
            this.showView("About");
        },

        showView: function (view, title) {
            //first remove all contents
            this.destroyCurtainContent();

            var oView;
            this.getOwnerComponent().runAsOwner(function () {
                var viewName = (view === "StartNetwork" || view === "ExtendNetwork") ? "Network" : view;
                oView = sap.ui.xmlview({
                    viewName: "camelot.smartcontract.administration.view." + viewName
                });
                this.getView().addDependent(oView);
                // oView.getController().setRouter(this.oRouter);
            }.bind(this));

            if (view === "ManageDB") {

            } else if (view === "StartNetwork" || view === "ExtendNetwork") {
                oView.setModel(this.getCustomGenesisBlockModel(), "customGenesisModel");
                oView.setModel(this.getConfigBlockModel(), "configModel");

                var oGenesisBlocksModel = new sap.ui.model.json.JSONModel();
                oView.setModel(oGenesisBlocksModel, "genesisBlocksModel");

                this.getCustomGenesisBlocks(function (response, status) {
                    if (status === "success") {
                        oGenesisBlocksModel.setData(response);
                    } else if (status === "error") {
                        MessageToast.show("No custom genesis blocks exist.");
                    }
                });

                var oViewModel = new sap.ui.model.json.JSONModel({
                    selectedMenu: view,
                    title: title,
                    selectedTab: "NetworkTab"
                });
                oView.setModel(oViewModel, "viewModel");

            } else if (view === "RunningNodes") {
                var oViewModelRunningNodes = new sap.ui.model.json.JSONModel({
                    connectBtnTxt: "Connect"
                });
                oView.setModel(oViewModelRunningNodes, "viewModel");

                var oRunningNodesModel = new sap.ui.model.json.JSONModel();
                oView.setModel(oRunningNodesModel);

                this.getRunningNodes(function (response, status) {
                    if (status === "success") {
                        oRunningNodesModel.setData(response);
                    } else if (status === "error") {
                        MessageToast.show("Details could not be fetched. Reason: " + response.responseJSON.error.message);
                    }
                });
            }

            var shell = this.getView().getContent()[0];
            shell.addCurtainContent(oView);
        },

        getCustomGenesisBlockModel: function () {
            let oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
                "Nonce": "0x0000000000000042",
                "MixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
                "Difficulty": "0x4000",
                "Alloc": {
                    "Account": "0xfd3069dea658e64f2477d4daf7488f633aed31a2",
                    "BalanceText": "balance",
                    "Balance": "1000000000000000000000000"
                },
                "Coinbase": "0x0000000000000000000000000000000000000000",
                "Timestamp": "0x00",
                "ParentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
                "ExtraData": "Custom Ethereum Genesis Block",
                "GasLimit": "0xffffffff"
            });
            return oModel;
        },

        getConfigBlockModel: function () {
            let oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
                "basePort": 30305,
                "baseRPCPort": 8550,
                "startNode": 1,
                "numberOfNodes": 1,
                "genesisBlockId": "597ef9c5b40ed02d0c66f84a",
                "networkId": "1800",
                "bootUrl": "enode://5621a751712984c6a821383e63ebc82bed9843439d787652fa46eccc4441a6c908cf0dc00130f26fa3e679a60faf57fa8a4c72d14abac8ee7ba521d5dd05f927@172.16.11.36:30303",
                "password" : "",
                "defaultNode" : false
            });
            return oModel;
        },

        destroyCurtainContent: function () {
            var shell = this.getView().getContent()[0];
            shell.destroyCurtainContent();
        },

        onMenuTogglePress: function (oEvent) {
            var oViewModel = oEvent.getSource().getModel("shellView");
            oViewModel.setProperty("/showPane", !oViewModel.getProperty("/showPane"));
        },

        onMenuItemPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("appsMenu");
            var oMenu = oContext.getModel().getProperty(oContext.getPath());
            this.showView(oMenu.targetPage, oMenu.description);
        },

        onBtnHomePress: function (oEvent) {
            this.showView("About");
        },

        onBtnAPIPress: function () {
            window.open("/explorer", null, "height=900,width=900,status=yes,toolbar=no,menubar=no,location=no,scrollbars=yes");
        },

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf camelot.smartcontract.view.Shell
		 */
        //	onBeforeRendering: function() {
        //
        //	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf camelot.smartcontract.view.Shell
		 */
        //	onAfterRendering: function() {
        //
        //	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf camelot.smartcontract.view.Shell
		 */
        //	onExit: function() {
        //
        //	}
    });
});