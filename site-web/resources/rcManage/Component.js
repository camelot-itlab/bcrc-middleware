sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/sap/ipdci/bcrc/rcManage/model/models",
	"com/sap/ipdci/bcrc/rcManage/controller/ErrorHandler",
	"com/sap/ipdci/bcrc/rcManage/controller/BlockchainService"
], function(UIComponent, Device, models, ErrorHandler, BlockchainService) {
	"use strict";

	var navigationWithContext = {
		"SubstanceRegulation": {
			"SubstanceRegulationDialog": "",
			"ConditionOfUse": "ConditionOfUse"
		},
		"ConditionOfUse": {
			"SubstanceRegulationDialog": "SubstanceRegulations",
			"ConditionOfUse": "",
			"RegulationChange": "RegulationChanges"
		},
		"MaterialUsage": {
			"ConditionOfUse": "ConditionOfUse",
			"Product": "Material"
		},
		"MaterialRegulationChange": {
			"ConditionOfUse": "ConditionOfUse",
			"RegulationChange": "RegulationChange",
			"Product": "Material"
		},
		"RegulationChange": {
			"ConditionOfUse": "ConditionOfUse",
			"RegulationChange": ""
		},
		"Regulation": {
			"ChangedConditionsOfUse": "ConditionsOfUse"
		},
		"ApplicationArea": {
			"ChangedConditionsOfUse": "ConditionsOfUse"
		},
		"Request": {
			"RegulationChange": "RegulationChange",
			"Supplier": "BusinessPartner",
			"Product": "Material",
			"Consumer": "BusinessPartner"
		},
		"BusinessPartnerMaterial": {
			"Supplier": "BusinessPartner",
			"Product": "Material",
			"Consumer": "BusinessPartner"
		},
		"BusinessPartner": {
			"Supplier": "",
			"Consumer": ""
		},
		"Material": {
			"Product": ""
		},
		"Composition": {
			"Product": "Material"
		}
	};

	return UIComponent.extend("com.sap.ipdci.bcrc.rcManage.Component", {

		_oErrorHandler: null,
		_oBlockchainService: null,
		
		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			this._oErrorHandler = new ErrorHandler(this);
			this._BlockchainService = new BlockchainService(this);
			
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			// set the FLP model
			this.setModel(models.createFLPModel(), "FLP");

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			var oRouter = this.getRouter();
			oRouter.initialize();
			oRouter.attachBypassed(jQuery.proxy(this.fnHandleRouteBypassed, this));
		},

		createContent: function() {
			var app = new sap.m.App({
				id: "App"
			});
			var appType = "App";
			var appBackgroundColor = "#FFFFFF";
			if (appType === "App" && appBackgroundColor) {
				app.setBackgroundColor(appBackgroundColor);
			}

			return app;
		},
		
		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler is destroyed.
		 * @public
		 * @override
		 */
		destroy: function() {
			if(this._oErrorHandler) {
				this._oErrorHandler.destroy();
			}
			if(this._BlockchainService) {
				this._BlockchainService.destroy();
			}
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},
		
		fnGetContentDensityClass : function() {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},

		fnGetNavigationPropertyForNavigationWithContext: function(sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations === null ? null : entityNavigations[targetPageName];
		},
		
		fnHandleRouteBypassed: function() {
			debugger;
		}
	});

});