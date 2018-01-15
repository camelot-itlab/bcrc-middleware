sap.ui.define([
    "camelot/smartcontract/administration/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (BaseController, MessageBox, MessageToast, History) {
    "use strict";

    return BaseController.extend("camelot.smartcontract.administration.controller.RunningNodes", {

        onInit: function () {

        },

        checkRunningState: function (status) {
            if (status)
                return "Success";
            else
                return "Error";
        },

        formatRunningStateText: function (status) {
            if (status)
                return "Running";
            else
                return "Killed";
        },

        formatConnectedStateText: function (status) {
            if (status)
                return "Connected";
            else
                return "Disconnected";
        },

        formatMiningLastTimeText: function (lastMiningTime) {
            if (lastMiningTime)
                return lastMiningTime.match(/^(\d\d:\d\d:\d\d)/)[0];
            else
                return "Not Mining";
        },

        onNodeSelectionChange: function (oControlEvent) {
            var oTable = this.getView().getContent()[0];
            if (oTable.getSelectedItem()) {
                var sPath = oTable.getSelectedItem().getBindingContext().sPath;
                var connected = oTable.getSelectedItem().getBindingContext().getModel().getProperty(sPath).connected;
                if (connected)
                    this.getView().getModel("viewModel").setProperty("/connectBtnTxt", "Disconnect");
                else
                    this.getView().getModel("viewModel").setProperty("/connectBtnTxt", "Connect");
            }
        },

        refreshRunningNodes: function () {
            this.getRunningNodes(function (response, status) {
                if (status === "success") {
                    if (this.getView().getModel())
                        this.getView().getModel().setData(response);
                    else {
                        var oRunningNodesModel = new sap.ui.model.json.JSONModel(response);
                        this.getView().setModel(oRunningNodesModel);
                    }
                } else if (status === "error") {
                    MessageToast.show("Details could not be fetched. Reason: " + response.responseJSON.error.message);
                }
            }.bind(this));
        },

        onConnectNode: function (oControlEvent) {
            var oTable = this.getView().getContent()[0];
            if (oTable.getSelectedItem()) {
                var sPath = oTable.getSelectedItem().getBindingContext().sPath;
                var nodeId = oTable.getSelectedItem().getBindingContext().getModel().getProperty(sPath).id;
                if (nodeId && oControlEvent.getSource().getText() === "Connect") {
                    this.connectToNode(nodeId, function (response, responseStatus) {
                        if (responseStatus === "success") {
                            MessageToast.show("Ethereum node was successfully connected.");
                            this.refreshRunningNodes();
                        } else if (responseStatus === "error") {
                            MessageBox.error("Ethereum node could not be connected. Reason: " + response.responseJSON.error.message);
                        }
                    }.bind(this));
                }
                else if (oControlEvent.getSource().getText() === "Disconnect") {
                    this.disconnectNode(function (response, responseStatus) {
                        if (responseStatus === "success") {
                            MessageToast.show("Ethereum node was disconnected.");
                            this.refreshRunningNodes();
                        } else if (responseStatus === "error") {
                            MessageBox.error("Ethereum node could not be disconnected. Reason: " + response.responseJSON.error.message);
                        }
                    }.bind(this));
                }
            }
        },

        onStartNode: function (oControlEvent) {
            var oTable = this.getView().getContent()[0];
            if (oTable.getSelectedItem()) {
                var sPath = oTable.getSelectedItem().getBindingContext().sPath;
                var nodeId = oTable.getSelectedItem().getBindingContext().getModel().getProperty(sPath).id;
                if (nodeId) {
                    this.startNode(nodeId, function (response, responseStatus) {
                        if (responseStatus === "success") {
                            MessageToast.show("Ethereum node was successfully started.");
                            this.refreshRunningNodes();
                        } else if (responseStatus === "error") {
                            MessageBox.error("Ethereum node could not be started. Reason: " + response.responseJSON.error.message);
                        }
                    }.bind(this));
                }
            }
        },

        onStopNode: function (oControlEvent) {
            var oTable = this.getView().getContent()[0];
            if (oTable.getSelectedItem()) {
                var sPath = oTable.getSelectedItem().getBindingContext().sPath;
                var nodeId = oTable.getSelectedItem().getBindingContext().getModel().getProperty(sPath).id;
                if (nodeId) {
                    this.stopNode(nodeId, function (response, responseStatus) {
                        if (responseStatus === "success") {
                            MessageToast.show("Ethereum node was successfully stopped.");
                            this.refreshRunningNodes();
                        } else if (responseStatus === "error") {
                            MessageBox.error("Ethereum node could not be stopped. Reason: " + response.responseJSON.error.message);
                        }
                    }.bind(this));
                }
            }
        },

        onStartMiningNode: function (oControlEvent) {
            var oTable = this.getView().getContent()[0];
            if (oTable.getSelectedItem()) {
                var sPath = oTable.getSelectedItem().getBindingContext().sPath;
                var nodeId = oTable.getSelectedItem().getBindingContext().getModel().getProperty(sPath).id;
                if (nodeId) {
                    this.startMiningNode(nodeId, function (response, responseStatus) {
                        if (responseStatus === "success") {
                            MessageToast.show("Ethereum node successfully started Mining.");
                            this.refreshRunningNodes();
                        } else if (responseStatus === "error") {
                            MessageBox.error("Ethereum node could start Mining. Reason: " + response.responseJSON.error.message);
                        }
                    }.bind(this));
                }
            }
        },

        onStopMiningNode: function (oControlEvent) {
            var oTable = this.getView().getContent()[0];
            if (oTable.getSelectedItem()) {
                var sPath = oTable.getSelectedItem().getBindingContext().sPath;
                var nodeId = oTable.getSelectedItem().getBindingContext().getModel().getProperty(sPath).id;
                if (nodeId) {
                    this.stopMiningNode(nodeId, function (response, responseStatus) {
                        if (responseStatus === "success") {
                            MessageToast.show("Ethereum node successfully stopped Mining.");
                            this.refreshRunningNodes();
                        } else if (responseStatus === "error") {
                            MessageBox.error("Ethereum node could not stop Mining. Reason: " + response.responseJSON.error.message);
                        }
                    }.bind(this));
                }
            }
        },

        onDefaultNodeSelect: function (oControlEvent) {
            var selectedNode = oControlEvent.getSource().getParent();
            var sPath = selectedNode.getBindingContext().sPath;
            var node = selectedNode.getBindingContext().getModel().getProperty(sPath);

            var callback = function(data) {
				if(!data){
                    if(node.DefaultNode){
                        MessageToast.show("Node selected as a default node.");	
                    }else{
                        MessageToast.show("Node is no longer a default node.");	
                    }
                    this.refreshRunningNodes();
				}else{
					jQuery.sap.log.error("Could not update the node " + data.statusText);
					MessageToast.show("Node cannot be updated. Please refer log for more info.");
				}
            }.bind(this);
            
            this.updateGethNode(node,callback);
        }
    });
});