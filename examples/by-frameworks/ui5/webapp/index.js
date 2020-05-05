sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/resource/ResourceModel"
], function (XMLView, ResourceModel) {
	"use strict";

	var i18nModel = new ResourceModel({
		bundleName: "Quickstart.i18n.i18n"
	 });

	XMLView.create({viewName: "Quickstart.App"}).then(function (oView) {
		oView.setModel(i18nModel, "i18n");
		oView.placeAt("content");
	});
});