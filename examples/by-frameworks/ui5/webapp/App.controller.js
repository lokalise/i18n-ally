sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("Quickstart.App", {
		onPress : function () {
			MessageToast.show(this.getResourceBundle().getText("hello"));
		},
		getResourceBundle: function(){
			return this.getView().getModel("i18n").getResourceBundle();
		}
	});

});