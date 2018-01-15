sap.ui.define([
		"sap/ui/base/Object",
		"sap/m/MessageBox"
	], function (UI5Object, MessageBox) {
		"use strict";
		
		return UI5Object.extend("com.sap.ipdci.bcrc.rcManage.controller.BlockchainService", {
			
			_sUrl: "/channel",
			_sXsrfToken: "",
			
			/**
			 * Handles application errors by automatically attaching to the model events and displaying errors when needed.
			 * @class
			 * @param {sap.ui.core.UIComponent} oComponent reference to the app"s component
			 * @public
			 * @alias cls.sbm.sbp.controller.ErrorHandler
			 */
			constructor : function (oComponent) {
				this.fnFetchXsrfToken();
				oComponent._oBlockchainService = this;
			},
			
			fnFetchXsrfToken: function() {
				var that = this;
				$.ajax({
					type: "GET",
					url: this._sUrl + "/Token",
					contentType: "application/json",
					headers: {
						"x-csrf-token": "Fetch",
						"Accept": "application/json"
					},
					success: function(oData, sTextStatus, oRequest) {
						that._sXsrfToken = oRequest.getResponseHeader("x-csrf-token");
					},
					error: function(sJqXHR, sTextStatus, oErrorThrown) {
						MessageBox.error("Error in fetching XSRF token for " + this._sUrl);
						return;
					}
				});
			},
			
			fnRequestReadJobStart: function(fnSuccess, fnError) {
				$.ajax(this._fnCreatePostPayload("/startRequestsSync", {}, fnSuccess, fnError));
			},
			
			fnRequestReadJobStop: function(fnSuccess, fnError) {
				$.ajax(this._fnCreatePostPayload("/stopRequestsSync", {}, fnSuccess, fnError));
			},
			
			fnResponseReadJobStart: function(fnSuccess, fnError) {
				$.ajax(this._fnCreatePostPayload("/startResponsesSync", {}, fnSuccess, fnError));
			},
			
			fnResponseReadJobStop: function(fnSuccess, fnError) {
				$.ajax(this._fnCreatePostPayload("/stopResponsesSync", {}, fnSuccess, fnError));
			},
			
			fnBlockchainJobStart: function(fnSuccess, fnError) {
				$.ajax(this._fnCreatePostPayload("/startBlockchainSync", {}, fnSuccess, fnError));
			},
			
			fnBlockchainJobStop: function(fnSuccess, fnError) {
				$.ajax(this._fnCreatePostPayload("/stopBlockchainSync", {}, fnSuccess, fnError));
			},
			
			fnCreateRequest: function(aRequest, fnSuccess, fnError) {
				$.ajax(this._fnCreatePostPayload("/postRequest", aRequest, fnSuccess, fnError));
			},
			
			fnCreateResponse: function(aResponse, fnSuccess, fnError) {
				$.ajax(this._fnCreatePostPayload("/postResponse", aResponse, fnSuccess, fnError));
			},
			
			fnCreateSubstanceRegulation: function(oSubstanceRegulation, fnSuccess, fnError) {
				$.ajax(this._fnCreatePostPayload("/postSubstanceRegulation", oSubstanceRegulation, fnSuccess, fnError));
			},
			
			_fnCreatePostPayload: function(sTarget, oBody, fnSuccess, fnError) {
				return {
					type: "POST",
					url: this._sUrl + sTarget,
					contentType: "application/json",
					data: JSON.stringify(oBody),
					dataType: "json",
					headers: {
						"x-csrf-token": this._sXsrfToken
					},
					success: fnSuccess,
					error: fnError
				};
			}
		});
	}
);