sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "com/sap/poc/customssubmission/util/APIHelper",
    "com/sap/poc/customssubmission/util/CommonUtil",
    "com/sap/poc/customssubmission/util/DataModel",
    "com/sap/poc/customssubmission/util/MasterData",
    "./ResponseHistoryDialog"
],   
/**
 * @param {typeof sap.ui.core.mvc.Controller} Controller
 */
function (Controller, MessageBox, History, APIHelper, CommonUtil, DataModel, MasterData, ResponseHistoryDialog) {
    "use strict";

    return Controller.extend("com.sap.poc.customssubmission.controller.ResponseHistory", {

        onInit: function()
        {
            this._router = sap.ui.core.UIComponent.getRouterFor(this);
            this._router.getTarget("ResponseHistory").attachDisplay(this.handleRouteMatched, this);
            this._usePopupDialog = false;
        },

        handleRouteMatched: function(event)
        {
            let contextData = event.getParameters().data.context;
            this.doContextData(contextData);
            this.doInit();
        },

        doContextData: function(contextData)
        {
            let contextDataDecoded = decodeURIComponent(contextData);
            this._contextData = JSON.parse(contextDataDecoded);
        },

        doInit: function()
        {
            this._resourceBundle = this.getView().getModel("i18n").getResourceBundle();
            this.loadAppData();
            this.loadViewData();
            this.resetUIControls();
        },

        onNavButtonPress: function()
        {
            let history = History.getInstance();
            let previousHash = history.getPreviousHash();
            let queryParams = this.getQueryParameters(window.location);
            if (previousHash !== undefined || queryParams.navBackToLaunchpad)
            {
                window.history.go(-1);
            }
            else
            {
                this._router.navTo("default", false);
            }
        },

        getQueryParameters: function(location)
        {
            let query = {};
            let params = location.search.substring(1).split("&");
            for (let i = 0; i < params.length; i++)
            {
                let pair = params[i].split("=");
                query[pair[0]] = decodeURIComponent(pair[1]);
            }
            return query;
        },

        resetUIControls: function()
        {
            this.getView().byId("idResponseHistoryDetailPanel").setVisible(false);
        },

        loadAppData: function()
        {},

        loadViewData: function()
        {
            let id = this._contextData.id;
            this._resultSetDO = APIHelper.getSubmission(id);
            let responseHistoryVWDO = this.resultSetToViewResponseHistory(this._resultSetDO);
            let responseHistoryVWDM = new sap.ui.model.json.JSONModel(responseHistoryVWDO);
            this.getView().setModel(responseHistoryVWDM, "ResponseHistoryVWDM");
        },

        resultSetToViewResponseHistory: function(resultSetDO)
        {
            let responseHistoryVWDO = DataModel.newResponseHistoryVMDO();
            responseHistoryVWDO.Id = resultSetDO.Id;
            responseHistoryVWDO.Status = resultSetDO.Status;
            responseHistoryVWDO.StatusDesc = MasterData.getStatusDesc(resultSetDO.Status);
            for (let i = 0; i < resultSetDO.Responses.length; i++)
            {
                let resultSetResponseDO = resultSetDO.Responses[i];
                let responseHistoryItemVMDO = this.resultSetToViewHistoryItem(resultSetResponseDO);
                responseHistoryVWDO.Responses.push(responseHistoryItemVMDO);
            }
            return responseHistoryVWDO;
        },

        resultSetToViewHistoryItem: function(resultSetResponseDO)
        {
            let dateFormat = this._resourceBundle.getText("default.DateTimeFormat");
            let responseHistoryItemVMDO = DataModel.newResponseHistoryItemVMDO();
            responseHistoryItemVMDO.Id = resultSetResponseDO.Id;
            responseHistoryItemVMDO.Decision = resultSetResponseDO.Decision;
            responseHistoryItemVMDO.DecisionDesc = MasterData.getDecisionDesc(resultSetResponseDO.Decision);
            responseHistoryItemVMDO.ResponseDate = resultSetResponseDO.ResponseDate;
            responseHistoryItemVMDO.ResponseDateFormatted = CommonUtil.timeEpochToFormattedDate(resultSetResponseDO.ResponseDate, dateFormat);
            responseHistoryItemVMDO.ResponseData = resultSetResponseDO.ResponseData;
            return responseHistoryItemVMDO;
        },
        
        onPressRowItem: function(event)
        {
            let index = event.getSource().getBindingContextPath().split("/")[2];
            let responseHistoryDetailVWDO = this.getView().getModel("ResponseHistoryVWDM").getData().Responses[index];
            let responseHistoryDetailVWDM = new sap.ui.model.json.JSONModel(responseHistoryDetailVWDO)
            this.getView().setModel(responseHistoryDetailVWDM, "ResponseHistoryDetailVWDM");
            if (this._usePopupDialog)
            {
                this.openResponseHistoryDialog(event);
            }
            else
            {
                this.getView().byId("idResponseHistoryDetailPanel").setVisible(true);
            }
        },

        openResponseHistoryDialog: function(event)
        {
            let dialogName = "ResponseHistoryDialog";
            this._dialogs = this._dialogs || {};
            let dialog = this._dialogs[dialogName];
            if (! dialog)
            {
                dialog = new ResponseHistoryDialog(this.getView());
                this._dialogs[dialogName] = dialog;
                dialog.setRouter(this._router);
            }
            dialog.open();
        }
    });
});
