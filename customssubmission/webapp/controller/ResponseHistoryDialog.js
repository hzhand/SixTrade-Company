sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "com/sap/poc/customssubmission/util/APIHelper",
    "com/sap/poc/customssubmission/util/CommonUtil",
    "com/sap/poc/customssubmission/util/DataModel"
    ],
    
    function(ManagedObject, MessageBox, History, APIHelper, CommonUtil, DataModel) {
        "use strict";

        return ManagedObject.extend("com.sap.poc.customssubmission.controller.ResponseHistoryDialog", {

            constructor: function(view)
            {
                this._view = view;
                this._control = sap.ui.xmlfragment(view.getId(), "com.sap.poc.customssubmission.view.ResponseHistoryDialog", this);
                this._init = false;
                this._resourceBundle = this.getView().getModel("i18n").getResourceBundle();
            },

            exit: function()
            {
                delete this._view;
            },

            getView: function()
            {
                return this._view;
            },

            getControl: function()
            {
                return this._control;
            },

            getOwnerComponent: function()
            {
                return this._view.getController().getOwnerComponent();
            },

            getBindingParameters: function()
            {
                return {};
            },

            setRouter: function(router)
            {
                this._router = router;
            },

            close: function() {
                this._control.close();
            },

            onInit: function()
            {
                this._dialog = this.getControl();
                this.loadAppData();
            },

            onExit: function()
            {
                this._dialog.destroy();
            },

            open: function(mode)
            {
                let view = this._view;
                let control = this._control;
                if (! this._init)
                {
                    this.onInit();
                    this._init = true;
                    view.addDependent(control);
                }
                let args = Array.prototype.slice.call(arguments);
                if (control.open)
                {
                    control.open.apply(control, args);
                }
                else if (control.openBy)
                {
                    control.openBy.apply(control, args);
                }
                this._mode = mode;
                this.doOpenDialog();
            },

            onPressClose: function()
            {
                this.close();
            },

            loadAppData: function()
            {},

            loadViewData: function()
            {},

            doOpenDialog: function()
            {}
        });
    }, true);