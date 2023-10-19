sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageBox",
        "sap/ui/core/routing/History",
        "sap/ui/model/Sorter",
        "com/sap/poc/customssubmission/util/APIHelper",
        "com/sap/poc/customssubmission/util/CommonUtil",
        "com/sap/poc/customssubmission/util/MasterData"
    ],   
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (Controller, MessageBox, History, Sorter, APIHelper, CommonUtil, MasterData) {
        "use strict";

        return Controller.extend("com.sap.poc.customssubmission.controller.SubmissionSearch", {

            onInit: function()
            {
                this._router = sap.ui.core.UIComponent.getRouterFor(this);
                this._router.getTarget("SubmissionSearch").attachDisplay(this.handleRouteMatched, this);
            },

            handleRouteMatched: function(event)
            {
                let contextData = event.getParameters().data.context;
                this.doContextData(contextData);
                this.doInit();
                CommonUtil.doBusy(this.doInitSearch, this, {});
            },

            doInit: function()
            {
                this._resourceBundle = this.getView().getModel("i18n").getResourceBundle();
                this.loadAppData();
            },

            doContextData: function(contextData)
            {
                let contextDataDecoded = decodeURIComponent(contextData);
                this._contextData = JSON.parse(contextDataDecoded);
            },

            onNavButtonPress: function()
            {
                this._router.navTo("Dashboard", false);
            },

            /*  
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
            */

            /*  
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
            */

            onLinkPressNavToDashboard: function(event)
            {
                this._router.navTo("Dashboard", false);
            },

            loadAppData: function()
            {
                this._submissionStatusDO = MasterData.getStatusList();
                let submissionStatusDM = new sap.ui.model.json.JSONModel(this._submissionStatusDO);
                this.getView().setModel(submissionStatusDM, "SubmissionStatusDM");
            },

            doInitSearch: function(self, args)
            {
                self.triggerSearch();
            },

            triggerSearch: function()
            {
                let tiggerSearchSubmission = false;
                if (this._contextData.entryNumber !== "")
                {
                    this.getView().byId("idEntryNumber").setValue(this._contextData.entryNumber);
                    tiggerSearchSubmission = true;
                }
                else
                {
                    this.getView().byId("idEntryNumber").setValue("");
                }
                if (this._contextData.status !== "")
                {
                    this.getView().byId("idStatus").setSelectedKey(this._contextData.status);
                    tiggerSearchSubmission = true;
                }
                else
                {
                    this.getView().byId("idStatus").setSelectedKey("");
                }
                if (this._contextData.type !== "")
                {
                    this.getView().byId("idType").setSelectedKey(this._contextData.type);
                    tiggerSearchSubmission = true;
                }
                else
                {
                    this.getView().byId("idType").setSelectedKey("");
                }
                if (this._contextData.fromDate !== "")
                {
                    this.getView().byId("idFromDate").setValue(this._contextData.fromDate);
                    tiggerSearchSubmission = true;
                }
                else
                {
                    this.getView().byId("idFromDate").setValue("");
                }
                if (this._contextData.toDate !== "")
                {
                    this.getView().byId("idToDate").setValue(this._contextData.toDate);
                    tiggerSearchSubmission = true;
                }
                else
                {
                    this.getView().byId("idToDate").setValue("");
                }
                if (tiggerSearchSubmission)
                {
                    let evtParams = {};
                    let uicSearchButton = this.getView().byId("idSearchButton");
			        let event = new sap.ui.base.Event("eventOnPressSearchSubmission", uicSearchButton, evtParams);
			        this.onPressSearchSubmission(event);
                }
            },

            onPressClearFilter: function(event)
            {
                this.getView().byId("idEntryNumber").setValue("");
                this.getView().byId("idStatus").setSelectedKey("");
                this.getView().byId("idType").setSelectedKey("");
                this.getView().byId("idFromDate").setValue("");
                this.getView().byId("idToDate").setValue("");
            },

            onPressSearchSubmission: function(event)
            {
                let uicEntryNumber = this.getView().byId("idEntryNumber");
                let uicStatus = this.getView().byId("idStatus");
                let uicType = this.getView().byId("idType");
                let uicFromDate = this.getView().byId("idFromDate");
                let uicToDate = this.getView().byId("idToDate");
                let entryNumber = uicEntryNumber.getValue();
                let status = uicStatus.getSelectedKey();
                let type = uicType.getSelectedKey();
                let fromDate = uicFromDate.getDateValue();
                let toDate = uicToDate.getDateValue();
                if (entryNumber == "" && status === "" && type === "" && fromDate === null)
                {
                    let errorMsg = this._resourceBundle.getText("errorMsg.View.SubmissionSearch.NoSearchCriteria");
                    MessageBox.error(errorMsg);
                    return;
                }
            //  let unixFromDate = fromDate === null ? 0 : CommonUtil.toUnixTime(fromDate.getTime());
            //  let unixToDate = toDate === null ? 0 : CommonUtil.toUnixTime(toDate.getTime());
                let unixFromDate = fromDate === null ? 0 : fromDate.getTime();
                let unixToDate = toDate === null ? 0 : toDate.getTime();
                let args =
                {
                    "EntryNumber": entryNumber,
                    "Status": status,
                    "Type": type,
                    "FromDate": unixFromDate,
                    "ToDate": unixToDate
                };
                this._contextData.entryNumber = entryNumber;
                this._contextData.status = status;
                this._contextData.type = type;
                this._contextData.fromDate = uicFromDate.getValue();
                this._contextData.toDate = uicToDate.getValue();
                CommonUtil.doBusy(this.doSearchSubmission, this, args);
            },

            doSearchSubmission: function(self, args)
            {
                let queryParamDO =
                {
                    "EntryNumber": args.EntryNumber.toUpperCase(),
                    "Status": args.Status,
                    "Type": args.Type,
                    "FromDate": args.FromDate,
                    "ToDate": args.ToDate
                };
                let resultSetDO = APIHelper.querySubmissions(queryParamDO);
                self.doSubmissionSearchResults(resultSetDO);
            },

            doSubmissionSearchResults: function(resultSetDO)
            {
                let submissionSearchVWDO = [];
                for (let i = 0; i < resultSetDO.length; i++)
                {
                    let submissionDO =
                    {
                        "Id": resultSetDO[i].ID,
                        "SummaryDate": resultSetDO[i].SUMMARY_DATE,
                        "EntryDate": resultSetDO[i].ENTRY_DATE,
                        "ImportDate": resultSetDO[i].IMPORT_DATE,
                        "ImportCarrier": resultSetDO[i].IMPORT_CARRIER,
                        "MissingDocs": resultSetDO[i].MISSING_DOCS,
                        "MissingDocNames": this.doGetMissingDocNames(resultSetDO[i].MISSING_DOCS),
                        "Status": resultSetDO[i].STATUS,
                        "StatusDesc": MasterData.getStatusDesc(resultSetDO[i].STATUS)
                    };
                    submissionSearchVWDO.push(submissionDO);
                }
                let submissionSearchVWDM = new sap.ui.model.json.JSONModel(submissionSearchVWDO);

                for( let i=0; i<submissionSearchVWDM.oData.length; i++) {
                    let statImageName = MasterData.getStatusImageName(submissionSearchVWDM.oData[i].Status);
                    submissionSearchVWDM.oData[i].StatusImageName = statImageName;
                }
                this.getView().setModel(submissionSearchVWDM, "SubmissionSearchVWDM");
            },

            doGetMissingDocNames: function(argMissingDocs)
            {
                let missingDocNames = "";
                let tokenizer = argMissingDocs.split(",");
                for (let i = 0; i < tokenizer.length; i++)
                {
                    let docId = tokenizer[i];
                    let docName = MasterData.getMissingDocName(docId);
                    if (missingDocNames.length > 0)
                    {
                        missingDocNames += ", ";
                    }
                    missingDocNames += docName;
                }
                let missingDocs = missingDocNames == "" ? "" : argMissingDocs + ": " + missingDocNames;
                return missingDocs;
            },

            onPressRowItem: function(event)
            {
                let bindingContext = event.getSource().getBindingContext("SubmissionSearchVWDM");
                let path = bindingContext.getPath();
                let submissionSearchVWDO = bindingContext.getModel().getData();
                let selectedIndex = path.split("/")[1];
                let selectedSubmission = submissionSearchVWDO[selectedIndex];
                let id = selectedSubmission.Id;
                let contextDataDO =
                {
                    "routeFrom": "SubmissionSearch",
                    "routeFromContextData": this._contextData,
                    "Id": id
                };
                let contextData = JSON.stringify(contextDataDO);
                var contextDataEncoded = encodeURIComponent(contextData);
                this._router.navTo("Submission", {context:contextDataEncoded}, false);
            },

            onPressSort: function(event)
            {
                let sortDialog = sap.ui.xmlfragment("com.sap.poc.customssubmission.view.SubmissionSearchSortingDialog", this);
                sortDialog.open();
            },

            onConfirmSort: function(event)
		    {
                var params = event.getParameters();
                var sPath = params.sortItem.getKey();
                var bDescending = params.sortDescending;
                if ((sPath === "SummaryDate") || (sPath === "EntryDate") || (sPath === "ImportDate"))
                {
                    this.sortByDate(sPath, bDescending);
                }
                else
                {
                    var sorter = new sap.ui.model.Sorter(sPath, bDescending);
                    var sorters = [];
                    sorters.push(sorter);
                    this.getView().byId("idSearchResultTable").getBinding("items").sort(sorters);
                }
            },

            sortByDate: function(dateColumnName, bSortDescending)
            {
                var sorters = [];
                var sorterDate = new Sorter(dateColumnName, bSortDescending, null, function(sDate1, sDate2)
                    {
                        var dDate1 = new Date(sDate1);
                        var dDate2 = new Date(sDate2);
                        if (dDate2 === null)
                        {
                            return -1;
                        }
                        if (dDate1 === null)
                        {
                            return 1;
                        }
                        if (dDate1 < dDate2)
                        {
                            return -1;
                        }
                        if (dDate1 > dDate2)
                        {
                            return 1;
                        }
                        return 0;
                    });
                let sortDescendingId = false;
                var sorterId = new Sorter("Id", sortDescendingId);
                sorters.push(sorterDate);
                sorters.push(sorterId);
                this.getView().byId("idSearchResultTable").getBinding("items").sort(sorters);
            }
		});
	});
