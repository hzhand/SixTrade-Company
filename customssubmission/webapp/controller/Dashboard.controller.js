sap.ui.define([
        "sap/ui/core/mvc/Controller",
        'sap/ui/core/BusyIndicator',
        "sap/m/MessageBox",
        "com/sap/poc/customssubmission/util/APIHelper",
        "com/sap/poc/customssubmission/util/CommonUtil",
        "com/sap/poc/customssubmission/util/DataModel",
        "com/sap/poc/customssubmission/util/MasterData"
    ],   
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (Controller, BusyIndicator, MessageBox, APIHelper, CommonUtil, DataModel, MasterData) {
        "use strict";

        return Controller.extend("com.sap.poc.customssubmission.controller.Dashboard", {

            onInit: function()
            {
                this._router = sap.ui.core.UIComponent.getRouterFor(this);
                this._router.getTarget("Dashboard").attachDisplay(this.handleRouteMatched, this);
            },

            handleRouteMatched: function(event)
            {
                this.doInit();
            },

            doInit: function()
            {
                this._resourceBundle = this.getView().getModel("i18n").getResourceBundle();
                this.initAppEnv();
                this.loadAppData();
                this.loadDashboardData();
            },

            initAppEnv: function()
            {
                let uriProtocol = this.getOwnerComponent()._oManifest._oBaseUri._parts.protocol;
                let uriHostname = this.getOwnerComponent()._oManifest._oBaseUri._parts.hostname;
                let uriPath = this.getOwnerComponent()._oManifest._oBaseUri._parts.path;
                let arrPath = uriPath.split("/");
                let path = arrPath.length >= 2 ? arrPath[1] : "";
                let baseURL = uriProtocol + "://" + uriHostname + "/" + path;
                sap.ui.getCore().setModel({BaseURL: baseURL}, "AppEnv");
            },

            loadAppData: function()
            {
                this._submissionStatusDO = MasterData.getStatusList();
                let submissionStatusDM = new sap.ui.model.json.JSONModel(this._submissionStatusDO);
                this.getView().setModel(submissionStatusDM, "SubmissionStatusDM");
            },

            loadDashboardData: function()
            {
                this.loadTileMySubmissionData();
                this.loadTileExportLicenseData();
                this.loadTileImportLicenseData();
                this.loadTileDutyTaxData();
                this.loadTileImportStatusData();
                this.loadTileExportStatusData();
                this.loadTileUsageMaterialData();
                this.loadTileInventoryOnHandData();
            },

            navToCreateSubmission: function()
            {
                let contextDataDO =
                {
                    "routeFrom": "Dashboard"
                };
                let contextData = JSON.stringify(contextDataDO);
                var contextDataEncoded = encodeURIComponent(contextData);
                this._router.navTo("Submission", {context:contextDataEncoded}, false);
            },

            onLinkPressCreateSubmission: function(event)
            {
                this.navToCreateSubmission();
            },

            onPressNavToCreateSubmission: function(event)
            {
                this.navToCreateSubmission();
            },

            onPressNavToSearchSubmission:  function(event)
            {
                let contextDataDO = {};
                let contextData = JSON.stringify(contextDataDO);
                var contextDataEncoded = encodeURIComponent(contextData);
                this._router.navTo("SubmissionSearch", {context:contextDataEncoded}, false);
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
                let fromDate = uicFromDate.getValue();
                let toDate = uicToDate.getValue();
                if (entryNumber === "" && status === "" && type === "" && fromDate === "")
                {
                    let errorMsg = this._resourceBundle.getText("errorMsg.View.SubmissionSearch.NoSearchCriteria");
                    MessageBox.error(errorMsg);
                    return;
                }
                let contextDataDO =
                {
                    "routeFrom": "Dashboard",
                    "entryNumber": entryNumber,
                    "status": status,
                    "type": type,
                    "fromDate": fromDate,
                    "toDate": toDate
                };
                let contextData = JSON.stringify(contextDataDO);
                var contextDataEncoded = encodeURIComponent(contextData);
                this._router.navTo("SubmissionSearch", {context:contextDataEncoded}, false);
            },

            onPressNotImplemented: function(event)
            {
                let msg = this._resourceBundle.getText("msg.generic.NotImplemented");
                MessageBox.alert(msg);
            },

            onPressTileMySubmissionSubmissionNumber: function(event)
            {
                BusyIndicator.show(5000);
                let bindingContext = event.getSource().getBindingContext("TileMySubmissionVWDM");
                let path = bindingContext.getPath();
                let tile1VWDO = bindingContext.getModel().getData();
                let selectedIndex = path.split("/")[1];
                let selectedSubmission = tile1VWDO[selectedIndex];
                let id = selectedSubmission.Id;
                let contextDataDO =
                {
                    "routeFrom": "Dashboard",
                    "Id": id
                };
                let contextData = JSON.stringify(contextDataDO);
                var contextDataEncoded = encodeURIComponent(contextData);
                this._router.navTo("Submission", {context:contextDataEncoded}, false);
            },

            onPressTileMySubmissionCounter: function(event)
            {
                let contextDataDO =
                {
                    "routeFrom": "Dashboard",
                    "type": "DECL",
                };
                let contextData = JSON.stringify(contextDataDO);
                var contextDataEncoded = encodeURIComponent(contextData);
                this._router.navTo("SubmissionSearch", {context:contextDataEncoded}, false);
            },

            loadTileMySubmissionData: function()
            {
                let submissionCounts = APIHelper.getSubmissionCounts();
                let countTotal = submissionCounts.Total;
                let count = countTotal >= 4 ? 4 : countTotal;
                let wordOf = this._resourceBundle.getText("word.Of");
                let countText = count + " " + wordOf + " " + countTotal;
                this.getView().byId("idTileMySubmissionCount").setText(countText);
                let tileMySubmissionVWDO = [];
                let resultSetDO = APIHelper.getWorklistItems(count);
                for (let i = 0; i < resultSetDO.length; i++)
                {
                    let tileItemVWDO = this.resultSetToViewTileMySubmissionItem(resultSetDO[i]);
                    tileMySubmissionVWDO.push(tileItemVWDO);
                }
                let tileMySubmissionVWDM = new sap.ui.model.json.JSONModel(tileMySubmissionVWDO);
                this.getView().setModel(tileMySubmissionVWDM, "TileMySubmissionVWDM");
            },

            loadTileImportLicenseData: function()
            {
                let iconImage = "sap-icon://credit-card";
                let tileImportLicenseVWDO =
                [
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "Material": "29122100 - Benzaldehyde",
                        "License": "License A, License B"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "Material": "29091100 - Diethyl, ether",
                        "License": "License B, License D"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "Material": "28416100 - Potassium, permanganateC",
                        "License": "License E, License F"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "Material": "29141200 - Butanone, methyl, ethyl",
                        "License": "License G, License H"
                    }
                ];
                let tileImportLicenseVWDM = new sap.ui.model.json.JSONModel(tileImportLicenseVWDO);
                this.getView().setModel(tileImportLicenseVWDM, "TileImportLicenseVWDM");
            },

            loadTileExportLicenseData: function()
            {
                let iconImage = "sap-icon://credit-card";
                let tileExportLicenseVWDO =
                [
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "Product": "31340953 - UHD Graphics 770",
                        "License": "License K, License L"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "Product": "27965730 - TZ-280 Transceiver",
                        "License": "License M, License N"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "Product": "20492742 - ML-280 Capacitor",
                        "License": "License P, License Q"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "Product": "28467255 - GX-64 DDR RAM Memory",
                        "License": "License R, License S"
                    }
                ];
                let tileExportLicenseVWDM = new sap.ui.model.json.JSONModel(tileExportLicenseVWDO);
                this.getView().setModel(tileExportLicenseVWDM, "TileExportLicenseVWDM");
            },

            loadTileDutyTaxData: function()
            {
                let iconImage = "sap-icon://expense-report";
                let tileDutyTaxVWDO =
                [
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "ReportNumber": "28416100 - Potassium, permanganate",
                        "ReportDate": "2021-08-04"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "ReportNumber": "29141200 - Butanone, methyl, ethyl",
                        "ReportDate": "2021-09-15"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "ReportNumber": "29211100 - Methylamine, dimethylamine",
                        "ReportDate": "2021-10-24"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "ReportNumber": "29042010 - Nitrobenzene",
                        "ReportDate": "2021-11-02"
                    }
                ];
                let tileDutyTaxVWDM = new sap.ui.model.json.JSONModel(tileDutyTaxVWDO);
                this.getView().setModel(tileDutyTaxVWDM, "TileDutyTaxVWDM");
            },

            loadTileImportStatusData: function()
            {
                let iconImage = "sap-icon://manager-insight";
                let tileImportStatusVWDO =
                [
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "SubmissionNumber": "B76-0000094-2",
                        "Date": "2021-11-22",
                        "StatusDesc": "On Hold",
                        "StatusState": "Warning"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "SubmissionNumber": "B76-0000098-1",
                        "Date": "2021-10-11",
                        "StatusDesc": "On Hold",
                        "StatusState": "Warning"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "SubmissionNumber": "B76-0000104-7",
                        "Date": "2021-10-08",
                        "StatusDesc": "On Hold",
                        "StatusState": "Warning"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "SubmissionNumber": "B76-0000105-4",
                        "Date": "2021-09-30",
                        "StatusDesc": "On Hold",
                        "StatusState": "Warning"
                    }
                ];
                let tileImportStatusVWDM = new sap.ui.model.json.JSONModel(tileImportStatusVWDO);
                this.getView().setModel(tileImportStatusVWDM, "TileImportStatusVWDM");
            },

            loadTileExportStatusData: function()
            {
                let iconImage = "sap-icon://manager-insight";
                let tileExportStatusVWDO =
                [
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "SubmissionNumber": "B76-0000109-6",
                        "Date": "2021-11-30",
                        "StatusDesc": "On Hold",
                        "StatusState": "Warning"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "SubmissionNumber": "B76-0000114-6",
                        "Date": "2021-10-21",
                        "StatusDesc": "On Hold",
                        "StatusState": "Warning"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "SubmissionNumber": "B76-0000127-8",
                        "Date": "2021-10-19",
                        "StatusDesc": "On Hold",
                        "StatusState": "Warning"
                    },
                    {
                        "IconImage": iconImage,
                        "IconColor": "Neutral", // [COMMENT] sap.ui.core.IconColor
                        "SubmissionNumber": "B76-0000129-4",
                        "Date": "2021-10-08",
                        "StatusDesc": "On Hold",
                        "StatusState": "Warning"
                    }
                ];
                let tileExportStatusVWDM = new sap.ui.model.json.JSONModel(tileExportStatusVWDO);
                this.getView().setModel(tileExportStatusVWDM, "TileExportStatusVWDM");
            },

            loadTileUsageMaterialData: function()
            {
                let tileUsageMaterialVWDO =
                [
                    {
                        "Dummy": "Dummy"
                    }
                ];
                let tileUsageMaterialVWDM = new sap.ui.model.json.JSONModel(tileUsageMaterialVWDO);
                this.getView().setModel(tileUsageMaterialVWDM, "TileUsageMaterialVWDM");
                let imageSrc = APIHelper.getBaseURL() + "/images/Usage-Material.jpg"
                this.getView().byId("idUsageMaterialImage").setSrc(imageSrc);
            },

            loadTileInventoryOnHandData: function()
            {
                let tileInventoryOnHandVWDO =
                [
                    {
                        "Dummy": "Dummy"
                    }
                ];
                let tileInventoryOnHandVWDM = new sap.ui.model.json.JSONModel(tileInventoryOnHandVWDO);
                this.getView().setModel(tileInventoryOnHandVWDM, "TileInventoryOnHandVWDM");
                let imageSrc = APIHelper.getBaseURL() + "/images/Inventory-OnHand.jpg"
                this.getView().byId("idInventoryOnHandImage").setSrc(imageSrc);
            },

            onPressVerbageExportLicense: function(event)
            {
                MessageBox.information("List of the export licenses available, including quota and remaining balance.");
            },
            
            onPressVerbageImportLicense: function(event)
            {
                MessageBox.information("List of the import licenses available, including quota and remaining balance.");
            },

            onPressVerbageDutyTax: function(event)
            {
                MessageBox.information("List of the materials exempted from duty or tax.");
            },

            onPressVerbageImportStatus: function(event)
            {
                MessageBox.information("Review status of current and historical import declarations.");
            },

            onPressVerbageExportStatus: function(event)
            {
                MessageBox.information("Review status of current and historical export declarations.");
            },

            onPressVerbageUsageMaterial: function(event)
            {
            //  MessageBox.information("Analyze and forecast material and product utilization from product lines.");
                MessageBox.information("Analyze and forecast imports and inventory levels. Compare with orders and production planning.");
            },

            onPressVerbageInventoryOnHand: function(event)
            {
            //  MessageBox.information("Analyze and forcast inventory levels and compare with orders and production planning.");
                MessageBox.information("Analyze and forecast exports and inventory levels. Compare with orders and production planning.");
            },

            resultSetToViewTileMySubmissionItem: function(resultSetItemDO)
            {
                let dateFormat = this._resourceBundle.getText("default.DateFormat");
                let dashboardTileItemVWDO = DataModel.newDashboardTileMySubmissionItemVWDO();
                dashboardTileItemVWDO.IconImage = "sap-icon://document-text";
                dashboardTileItemVWDO.IconColor = "Default"; // [COMMENT] sap.ui.core.IconColor
                dashboardTileItemVWDO.Id = resultSetItemDO.Id;
                dashboardTileItemVWDO.FilingDate = resultSetItemDO.FilingDate;
                dashboardTileItemVWDO.FilingDateFormatted = CommonUtil.timeEpochToFormattedDate(resultSetItemDO.FilingDate, dateFormat);
                dashboardTileItemVWDO.Status = resultSetItemDO.Status;
                dashboardTileItemVWDO.StatusDesc = MasterData.getStatusDesc(resultSetItemDO.Status);
                dashboardTileItemVWDO.StatusState = this.toStatusState(resultSetItemDO.Status);
                return dashboardTileItemVWDO;
            },

            toStatusState: function(status)
            {
            //  [COMMENT] sap.ui.core.ValueState
                let state = "None";
                if (status === "WIP" || status === "SUBMITTED")
                {
                    state = "Information";
                }
                else if (status === "REJECTED")
                {
                    state = "Error";
                }
                else if (status === "RELEASED")
                {
                    state = "Success";
                }
                else if (status === "REQUIREUPDATE" || status === "REQUIREACTION")
                {
                    state = "Warning";
                }
                return state;
            }
		});
	});
