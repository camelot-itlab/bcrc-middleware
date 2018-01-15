sap.ui.define([
		"sap/ui/model/type/Date"
	], function(DateType) {
		"use strict";
	
		return {
			
			oDateType: new DateType({
				pattern: "dd MMM yyyy"
			}),
			
			fnSupplyTypeIcon: function(sSupplyType) {
				switch (sSupplyType) {
					case "Manufactured":
						return "sap-icon://factory";
					case "Purchased":
						return "sap-icon://shipping-status";
					default: 
						return null;
				}
			},
			
			fnComplianceStatusCriticality: function(sComplianceStatusType) {
				switch (sComplianceStatusType) {
					case "AT":
					case "NC":
						return "Error";
					case "BT":
						return "Success";
					case "PRES":
					case "PSR":
						return "Warning";
					default: 
						return "None";
				}
			},
			
			fnComplianceStatusIcon: function(sComplianceStatusType) {
				switch (sComplianceStatusType) {
					case "AT":
					case "NOTOK":
						return "sap-icon://status-negative";
					case "NC":
					case "COMPU":
					case "NR":
						return "sap-icon://to-be-reviewed";
					case "BT":
					case "ALLOK":
						return "sap-icon://status-positive";
					case "PRES":
					case "PSR":
						return "sap-icon://status-in-process";
					default: 
						return "None";
				}
			},
			
			fnRequestStatusCriticality: function(sRequestStatusType) {
				switch (sRequestStatusType) {
					case "RESR":
					case "RESS":
						return "Success";
					case "REQR":
					case "REQP":
						return "Warning";
					default: 
						return "None";
				}
			},
			
			fnRequestStatusIcon: function(sRequestStatusType) {
				switch (sRequestStatusType) {
					case "REQP":
					case "REQS":
						return "sap-icon://status-in-process";
					case "REQR":
					case "RESP":
						return "sap-icon://to-be-reviewed";
					case "RESR":
					case "RESS":
						return "sap-icon://status-positive";
					default: 
						return null;
				}
			}
		};
	}
);