sap.ui.define([
    "camelot/smartcontract/administration/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (BaseController, MessageBox, MessageToast, History) {
    "use strict";

    return BaseController.extend("camelot.smartcontract.administration.controller.ApplicationManager", {

        onInit: function () {

        },


        openAddApplicationDialog: function (oEvent) {
            var sDialogName = "AddApplication";
            this.mDialogs = this.mDialogs || {};
            var oDialog = this.mDialogs[sDialogName];
            var oSource = oEvent.getSource();

            var actionType = oEvent.getSource().getText();
            var applicationDetails = {};
            if(actionType === "Edit"){
                var oTableAppList = this.getView().byId("oTableAppList");
                var selectedItem = oTableAppList.getSelectedItem();
                var oBindingContext = selectedItem.getBindingContext("applicationsModel");
                var id = oBindingContext.getModel().getProperty(oBindingContext.sPath).id;
                var AppName = oBindingContext.getModel().getProperty(oBindingContext.sPath).AppName;
                var TechnicalAppName = oBindingContext.getModel().getProperty(oBindingContext.sPath).TechnicalAppName;
                var Version = oBindingContext.getModel().getProperty(oBindingContext.sPath).Version;

                applicationDetails = {id:id,AppName:AppName,TechnicalAppName:TechnicalAppName,Version:Version};
            }

            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
                actionType : actionType,
                application:applicationDetails
            });

            var oView;
            if (!oDialog) {
                this.getOwnerComponent().runAsOwner(function() {
                    oView = sap.ui.xmlview({
                        viewName: "camelot.smartcontract.administration.view." + sDialogName
                    });
                    this.getView().addDependent(oView);
                    oView.getController().setRouter(this.oRouter);
                    oDialog = oView.getContent()[0];
                    this.mDialogs[sDialogName] = oDialog;
                }.bind(this));
            }

            return new ES6Promise.Promise(function(resolve, reject) {
                oDialog.attachEventOnce("afterOpen", null, resolve);
                //oDialog.attachEventOnce("afterClose", null, this._showDetailSelectedItem);

                oDialog.open();
                if (oView) {
                    oDialog.attachAfterOpen(function() {
                        oDialog.rerender();
                    });
                } else {
                    oView = oDialog.getParent();
                }
                oView.setModel(oModel);
                if (sPath) {
                    var oParams = oView.getController().getBindingParameters();
                    oView.bindElement(sPath, oParams);
                }
            }.bind(this));
        },

        onDeleteAll: function() {
            // var application = 
            this.deleteAllApplications("",function(){});
        },

        onExportApplication: function(oEvent){
            var oTableAppList = this.getView().byId("oTableAppList");
            var selectedItem = oTableAppList.getSelectedItem();
            var oBindingContext = selectedItem.getBindingContext("applicationsModel");
            var id = oBindingContext.getModel().getProperty(oBindingContext.sPath).id;
            var AppName = oBindingContext.getModel().getProperty(oBindingContext.sPath).AppName;
            var TechnicalAppName = oBindingContext.getModel().getProperty(oBindingContext.sPath).TechnicalAppName;
            var Version = oBindingContext.getModel().getProperty(oBindingContext.sPath).Version;

            var applicationDetails = {id:id,AppName:AppName,TechnicalAppName:TechnicalAppName,Version:Version};

            var callback = function(data) {
                    if(data.fileName){
                        this.downloadApplication(data.fileName,function(response){
                            // var blob = new Blob([response], {type: 'application/zip'});
                            var downloadUrl = URL.createObjectURL(response);
                            var a = document.createElement("a");
                            a.href = downloadUrl;
                            a.download = data.fileName;
                            document.body.appendChild(a);
                            a.click();
                        },function(err){
                            jQuery.sap.log.error("Could not export the application " + err.statusText);
                            MessageToast.show("Application cannot be exported. Please refer log for more info.");
                        });
                    }else{
						jQuery.sap.log.error("Could not export the application " + data.statusText);
						MessageToast.show("Application cannot be exported. Please refer log for more info.");
                    }
			}.bind(this);

            this.exportApplication(applicationDetails, callback);
        },

        onImportpplication: function(oEvent) {
            var input = $(document.createElement('input')); 
            input.attr("type", "file");
            input.trigger('click');

            input.change(function (oEvent) {
                var fileName = oEvent.target.files[0].name;
                // this.importApplication(fileName, callback);
                // this.importApplication(oEvent.target.files[0], callback);
                this.uploadApplication(oEvent.target.files[0], callback, error);
            }.bind(this));

            var callback = function(data) {
                //MessageToast.show("Application imported successfully.");
                var fileName = data.result.files.file[0].name;
                this.importApplication(fileName, importCallBack);
            }.bind(this);

            var error = function(data) {
                jQuery.sap.log.error("Could not import the application " + data.statusText);
                MessageToast.show("Application cannot be imported. Please refer log for more info.");
            }.bind(this);

            var importCallBack = function(data){
                var status = data.response.status;
                if(status === "success"){
                    MessageToast.show(data.response.statusText);

                    //refresh the model with all applications
                    this.getApplications(function(data) {				
                        //set the applications model
                        this.getOwnerComponent().getModel("applicationsModel").setData(null);
                        this.getOwnerComponent().getModel("applicationsModel").setData(data);								
                    }.bind(this), function(error) {
                        jQuery.sap.log.error("Applications could not be received " + error);
                    }.bind(this)); 
                }else if(status === "error"){
                    MessageToast.show(data.response.statusText);
                }
            }.bind(this);

            return false;
        }

        
    });
});