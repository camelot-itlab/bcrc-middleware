sap.ui.define([
		"sap/ui/base/Object",
		"sap/m/MessageBox",
		"sap/m/MessageToast"
	], function (UI5Object, MessageBox, MessageToast) {
		"use strict";

		return UI5Object.extend("com.sap.ipdci.bcrc.rcManage.controller.ErrorHandler", {

			/**
			 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
			 * @class
			 * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
			 * @public
			 * @alias cls.sbm.sbp.controller.ErrorHandler
			 */
			constructor : function (oComponent) {
				this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
				this._oComponent = oComponent;
				this._oModel = oComponent.getModel();
				this._bMessageOpen = false;
				this._sTechnicalErrorText = this._oResourceBundle.getText("technicalErrorText");
				this._sContentErrorText = this._oResourceBundle.getText("badRequestText");

				this._oModel.attachMetadataFailed(function (oEvent) {
					var oParams = oEvent.getParameters();
					this._showServiceError(oParams.response, true);
				}, this);

				this._oModel.attachRequestFailed(function (oEvent) {
					var oParams = oEvent.getParameters();
					// An entity that was not found in the service is also throwing a 404 error in oData.
					// We already cover this case with a notFound target so we skip it here.
					// A request that cannot be sent to the server is a technical error that we have to handle though
					if(oParams.response.statusCode === "400") {
						this._showServiceError(oParams.response, false);
					} else if (oParams.response.statusCode !== "404" || (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf("Cannot POST") === 0)) {
						this._showServiceError(oParams.response, true);
					}
				}, this);
			},
			
			showErrorToast: function(sMessage) {
				MessageToast.show(sMessage);
			},

			/**
			 * Shows a {@link sap.m.MessageBox} when a service call has failed.
			 * Only the first error message will be display.
			 * @param {string} sDetails a technical error to be displayed on request
			 * @param {string} bTechnicalError whether a technical error to be displayed on request
			 * @private
			 */
			_showServiceError : function (sDetails, bTechnicalError) {
				if (this._bMessageOpen) {
					return;
				}
				
				var sMessage;
				if (sDetails.responseText) {
					if(!(sDetails.responseText instanceof Object)) {
						try {
							sDetails.responseText = JSON.parse(sDetails.responseText);
						} catch(err) {
							jQuery.sap.log.error(err);
						}
					}
				}
				if(!sMessage && sDetails.responseText && sDetails.responseText.error && sDetails.responseText.error.innererror && sDetails.responseText.error.innererror.errordetails) {
					var aDetails = sDetails.responseText.error.innererror.errordetails;
					sMessage = "";
					aDetails.forEach(function(oDetail) {
						if(oDetail.message) {
							sMessage += (sMessage === "" ? "" : "\n") + oDetail.message;
						}
					});
				}
				if(!sMessage && sDetails.responseText && sDetails.responseText.error && sDetails.responseText.error.message && sDetails.responseText.error.message.value) {
					sMessage = sDetails.responseText.error.message.value;
				}
				if(!sMessage) {
					sMessage = bTechnicalError ? this._sTechnicalErrorText : this._sContentErrorText;
				}
				
				this._bMessageOpen = true;
				MessageBox.error(
					sMessage,
					{
						id : "serviceErrorMessageBox",
						details : sDetails,
						styleClass : this._oComponent.getContentDensityClass(),
						actions : [MessageBox.Action.CLOSE],
						onClose : function () {
							this._bMessageOpen = false;
						}.bind(this)
					}
				);
			}

		});

	}
);