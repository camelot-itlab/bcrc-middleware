sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"../model/formatter"
], function(Controller, MessageToast, MessageBox, formatter) {
	"use strict";
	
	return Controller.extend("com.sap.ipdci.bcrc.rcManage.controller.BaseController", {
		
		formatter: formatter,
		_expand: null,
		
		getModel: function(modelName) {
			this.getView().getModel(modelName);
		},
		
		fnHandleRouteMatched: function(oEvent) {
			var oParams = {};
			if(this._expand) {
				oParams.expand = this._expand;
			}
			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;
				if (this.sContext) {
					var oBinding = {
						path: "/" + this.sContext,
						parameters: oParams
					};
					if(this.fnDataReceived) {
						oBinding.events = {
							"dataReceived": this.fnDataReceived.bind(this)
						};
					}
					this.getView().bindElement(oBinding);
				}
			}
		},
		
		fnHandleNoAction: function() {
			MessageToast.show("No action implemented");
		},
		
		fnOnPressTableItemNavigation: function(oEvent, sTarget) {
			var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
			return this._fnNavigateToBindingContext(oBindingContext, sTarget);
		},
		
		fnOnPressRowNavigation: function(oEvent, sTarget) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			return this._fnNavigateToBindingContext(oBindingContext, sTarget);
		},
		
		_fnNavigateToBindingContext: function(oBindingContext, sTarget) {
			return new Promise(function(fnResolve) {
				this._fnDoNavigate(sTarget, oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		
		_fnGetDialog: function(sDialogName) {
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			var oView;
			if (!oDialog) {
				this.getOwnerComponent().runAsOwner(function() {
					oView = sap.ui.xmlview({
						viewName: "com.sap.ipdci.bcrc.rcManage.view." + sDialogName
					});
					this.getView().addDependent(oView);
					oView.getController().setRouter(this.oRouter);
					oDialog = oView.getContent()[0];
					this.mDialogs[sDialogName] = oDialog;
				}.bind(this));
			}
			return oDialog;
		},
		
		
		fnOpenDialog: function(sDialogName, sMode, oDialogItem) {
			if(sMode !== "New" && sMode !== "Edit") {
				throw new Error("Unsupported dialog mode " + sMode);
			}
			var oDialog = this._fnGetDialog(sDialogName),
				oView = oDialog.getParent();
			return new Promise(function(fnResolve) {
				oDialog.attachEventOnce("afterOpen", null, fnResolve);
				oDialog.open();
				if (oView) {
					oDialog.attachAfterOpen(function() {
						oDialog.rerender();
					});
				} else {
					oView = oDialog.getParent();
				}
				
				var oDialogModel = new sap.ui.model.json.JSONModel({mode: sMode});
				if (oDialogModel) {
					oView.setModel(oDialogModel, "dialog");
				}
				var oModel = new sap.ui.model.json.JSONModel(oDialogItem);
				if (oModel) {
					oView.setModel(oModel, "entityInstance");
				}
			}).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		
		fnOnDeleteConfirmation: function(bCompact, sQuestion, sConfirmation, oModel, sEntityType, oEntity) {
			MessageBox.confirm(sQuestion, {
			    title: "Confirm",
			    onClose: function(oAction) {
			    	if(oAction === "OK") {
						var sObjectID = "/" + oModel.createKey(sEntityType, oEntity);
						oModel.remove(sObjectID, oEntity, {
							success: function() {
								jQuery.sap.log.debug(sConfirmation);
							},
							error: function(err) {
								MessageBox.error("Error deleting " + sObjectID + ": " + err);
							}
						});
			    	}
			    },
			    styleClass: bCompact ? "sapUiSizeCompact" : "",
			    initialFocus: "OK",
			    textDirection: "Inherit"
		    });
		},
		
		_fnDoNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().fnGetNavigationPropertyForNavigationWithContext(sEntityNameSet,
					sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}
		},
		
		_fnUpdateBindingOptions: function(sCollectionId, oBindingData, sSourceId) {
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

			var aSorters = oBindingData.sorters === undefined ? this.mBindingOptions[sCollectionId].sorters : oBindingData.sorters;
			var oGroupby = oBindingData.groupby === undefined ? this.mBindingOptions[sCollectionId].groupby : oBindingData.groupby;

			// 1) Update the filters map for the given collection and source
			this.mBindingOptions[sCollectionId].sorters = aSorters;
			this.mBindingOptions[sCollectionId].groupby = oGroupby;
			this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
			this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];

			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}

			// Add the groupby first in the sorters array
			if (oGroupby) {
				aSorters = aSorters ? [oGroupby].concat(aSorters) : [oGroupby];
			}

			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};
		}
	});
});