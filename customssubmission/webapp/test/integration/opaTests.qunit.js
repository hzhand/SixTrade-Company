/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/sap/poc/customssubmission/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
