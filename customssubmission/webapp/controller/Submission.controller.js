sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/util/File",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/sap/poc/customssubmission/util/APIHelper",
    "com/sap/poc/customssubmission/util/CommonUtil",
    "com/sap/poc/customssubmission/util/DataModel",
    "com/sap/poc/customssubmission/util/MasterData",
    "com/sap/poc/customssubmission/util/SimData",
    "./MechandiseLineItemDialog"
],   
/**
 * @param {typeof sap.ui.core.mvc.Controller} Controller
 */
function (Controller, File, MessageBox, MessageToast, APIHelper, CommonUtil, DataModel, MasterData, SimData, MechandiseLineItemDialog) {
    "use strict";

    return Controller.extend("com.sap.poc.customssubmission.controller.Submission", {

        onInit: function()
        {
            this._router = sap.ui.core.UIComponent.getRouterFor(this);
            this._router.getTarget("Submission").attachDisplay(this.handleRouteMatched, this);
        },

        handleRouteMatched: function(event)
        {
            let contextData = event.getParameters().data.context;
            this.doContextData(contextData);
            let args = {};
            CommonUtil.doBusy(this.doInit, this, args);
        },
        
        doContextData: function(contextData)
        {
            let contextDataDecoded = decodeURIComponent(contextData);
            this._contextData = JSON.parse(contextDataDecoded);
        },

        doInit: function(self, args)
        {
            self._resourceBundle = self.getView().getModel("i18n").getResourceBundle();
            self.initAppEnv();
            self.checkTDXOnlineStatus();
            self.loadAppData();
            self.loadViewData();
        },

        onNavButtonPress: function()
        {
            this.doCloseSubmission();
        },

        doNavBack: function()
        {
            let contextDataDO = {};
            if (this._contextData.routeFromContextData)
            {
                contextDataDO = this._contextData.routeFromContextData;
            }
            let contextData = JSON.stringify(contextDataDO);
            var contextDataEncoded = encodeURIComponent(contextData);
            let routeFrom = this._contextData.routeFrom;
            this._router.navTo(routeFrom, {context:contextDataEncoded}, false);
        },

        initAppEnv: function()
        {
            /*
            let uriProtocol = this.getOwnerComponent()._oManifest._oBaseUri._parts.protocol;
            let uriHostname = this.getOwnerComponent()._oManifest._oBaseUri._parts.hostname;
            let uriPath = this.getOwnerComponent()._oManifest._oBaseUri._parts.path;
            let arrPath = uriPath.split("/");
            let path = arrPath.length >= 2 ? arrPath[1] : "";
            let baseURL = uriProtocol + "://" + uriHostname + "/" + path;
            sap.ui.getCore().setModel({BaseURL: baseURL}, "AppEnv");
            */
        },

        checkTDXOnlineStatus: function()
        {
            let tdxOnlineStatusDO = APIHelper.getTDXOnlineStatus();
            let tdxOnlineStatusVWDO = DataModel.newTDXOnlineStatusVMDO()
            if (tdxOnlineStatusDO.OnlineStatus)
            {
                tdxOnlineStatusVWDO.OnlineStatus = true;
                tdxOnlineStatusVWDO.StatusImageFileName = "intel-tdx-online.png";
                tdxOnlineStatusVWDO.StatusTooltip = this._resourceBundle.getText("view.Submission.IntelTDX.Status.Tooltip.Online");
            }
            else
            {
                tdxOnlineStatusVWDO.OnlineStatus = false;
                tdxOnlineStatusVWDO.StatusImageFileName = "intel-tdx-offline.png";
                tdxOnlineStatusVWDO.StatusTooltip = this._resourceBundle.getText("view.Submission.IntelTDX.Status.Tooltip.Offline");
            }
            let tdxOnlineStatusVWDM = new sap.ui.model.json.JSONModel(tdxOnlineStatusVWDO);
            this.getView().setModel(tdxOnlineStatusVWDM, "TDXOnlineStatusVWDM");
        },

        loadViewData: function()
        {
            let id = this._contextData.Id;
            let submissionVWDO;
            if (id === undefined)
            {
                submissionVWDO = DataModel.newSubmissionVWDO();
                submissionVWDO.Id = "<NEW>";
                this.resetUIControls();
            }
            else
            {
                let resultSetDO = APIHelper.getSubmission(id);
                submissionVWDO = this.resultSetToViewSubmission(resultSetDO);
                let status = resultSetDO.Status;
                if (resultSetDO.Responses.length > 0 && status !== "RELEASED")
                {
                    let responseListVMDO = this.resultSetToViewResponseList(resultSetDO);
                    let responseListVWDM = new sap.ui.model.json.JSONModel(responseListVMDO);
                    this.getView().setModel(responseListVWDM, "ResponseListVWDM");
                }
                if (status === "RELEASED")
                {
                    let responseListVMDO = this.resultSetToViewResponseListReleased(resultSetDO);
                    let responseListVWDM = new sap.ui.model.json.JSONModel(responseListVMDO);
                    this.getView().setModel(responseListVWDM, "ResponseListVWDM");
                }
            }
            let submissionVWDM = new sap.ui.model.json.JSONModel(submissionVWDO);
            this.getView().setModel(submissionVWDM, "SubmissionVWDM");
            this.toggleUIReadOnly();
            this.toggleImportButtons();
        },

        resetUIControls: function()
        {
            this.getView().byId("idSummaryDate").setValue("");
            this.getView().byId("idEntryDate").setValue("");
            this.getView().byId("idImportDate").setValue("");
            this.getView().byId("idExportDate").setValue("");
            this.getView().byId("idITDate").setValue("");
            this.getView().byId("idDeclaredDate").setValue("");
        },

        loadAppData: function()
        {
            this._countryDO = APIHelper.loadCountry();
            this._canadaProvinceDO = APIHelper.loadCanadaProvince();
            this._portCodeDO = APIHelper.loadPortCode();
            this._documentList = APIHelper.loadDocumentList();

            this._entryTypeDO = APIHelper.loadEntryType();
            let entryTypeDM = new sap.ui.model.json.JSONModel(this._entryTypeDO);
            this.getView().setModel(entryTypeDM, "EntryTypeDM");

            this._suretyNumberDO = APIHelper.loadSuretyNumber();
            let suretyNumberDM = new sap.ui.model.json.JSONModel(this._suretyNumberDO);
            this.getView().setModel(suretyNumberDM, "SuretyNumberDM");

            this._bondTypeDO = APIHelper.loadBondType();
            let bondTypeDM = new sap.ui.model.json.JSONModel(this._bondTypeDO);
            this.getView().setModel(bondTypeDM, "BondTypeDM");

            this._portDistrictDO = APIHelper.loadPortDistrict();
            let portDistrictDM = new sap.ui.model.json.JSONModel(this._portDistrictDO);
            this.getView().setModel(portDistrictDM, "PortDistrictDM");

            this._importingCarrierDO = APIHelper.loadImportingCarrier();
            let importingCarrierDM = new sap.ui.model.json.JSONModel(this._importingCarrierDO);
            this.getView().setModel(importingCarrierDM, "ImportingCarrierDM");

            this._modeOfTransportDO = APIHelper.loadTransportMode();
            let modeOfTransportDM = new sap.ui.model.json.JSONModel(this._modeOfTransportDO);
            this.getView().setModel(modeOfTransportDM, "ModeOfTransportDM");

            this._countryOfOriginDO = this.loadAppDataCountry();
            let countryOfOriginDM = new sap.ui.model.json.JSONModel(this._countryOfOriginDO);
            this.getView().setModel(countryOfOriginDM, "CountryOfOriginDM");
            
            this._exportingCountryDO = this.loadAppDataCountry();
            let exportingCountryDM = new sap.ui.model.json.JSONModel(this._exportingCountryDO);
            this.getView().setModel(exportingCountryDM, "ExportingCountryDM");

            this._stateProviceDO = APIHelper.loadStateProvice();
            let consigneeAddrStateDM = new sap.ui.model.json.JSONModel(this._stateProviceDO);
            this.getView().setModel(consigneeAddrStateDM, "ConsigneeAddrStateDM");
            let importerAddrStateDM = new sap.ui.model.json.JSONModel(this._stateProviceDO);
            this.getView().setModel(importerAddrStateDM, "ImporterAddrStateDM");
        },

        loadAppDataCountry: function()
        {
            let countryListDO = [];
            for (let i = 0; i < this._countryDO.length; i++)
            {
                let countryCode = this._countryDO[i].ALPHA_2;
                let countryName = this._countryDO[i].COUNTRY_NAME;
                if (countryCode === "CA")
                {
                    for (let m = 0; m < this._canadaProvinceDO.length; m++)
                    {
                        let countryData =
                        {
                            "COUNTRY_NAME": "Canada, " + this._canadaProvinceDO[m].NAME,
                            "COUNTRY_CODE": this._canadaProvinceDO[m].ID
                        };
                        countryListDO.push(countryData);
                    }
                }
                else
                {
                    let countryData =
                    {
                        "COUNTRY_NAME": countryName,
                        "COUNTRY_CODE": countryCode
                    };
                    countryListDO.push(countryData);
                }
            }
            return countryListDO;
        },

        doInitPortCode: function(portDistrict)
        {
            let portCodeListDO = this._portCodeDO.filter(list => list.DISTRICT == portDistrict);
            let portCodeDM = new sap.ui.model.json.JSONModel(portCodeListDO);
            this.getView().setModel(portCodeDM, "PortCodeDM");
        },

        openMechandiseLineItemDialog: function(event, mode)
        {
            let dialogName = "MechandiseLineItemDialog";
            this._dialogs = this._dialogs || {};
            let dialog = this._dialogs[dialogName];
            if (! dialog)
            {
                dialog = new MechandiseLineItemDialog(this.getView());
                this._dialogs[dialogName] = dialog;
                dialog.setRouter(this._router);
            }
            dialog.open(mode);
        },

        onLinkPressNavToDashboard: function(event)
        {
            let submissionVWDO = this.getView().getModel("SubmissionVWDM").getData();
            let status = submissionVWDO.Status;
            if (status === "WIP" || status ===  "REQUIREUPDATE")
            {
                let self = this;
                let confirmationMsg = this._resourceBundle.getText("msg.View.Submission.CloseConfirmation");
                let title =  this._resourceBundle.getText("messageBox.Title.Confirmation");
                MessageBox.show(
                    confirmationMsg,
                    {
                        icon: MessageBox.Icon.QUESTION,
                        title: title,
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: function (oAction)
                        {
                            if (oAction === "YES")
                            {
                                self._router.navTo("Dashboard", false);
                            }
                        }
                    }
                );
            }
            else
            {
                this._router.navTo("Dashboard", false);
            }
        },

        onChangePortDistrict: function(event)
        {
            let scPortCode = this.getView().byId("idPortCode");
            scPortCode.setSelectedKey("");
            let scPortDistrict = this.getView().byId("idPortDistrict");
            let selectedPortDistrictId = scPortDistrict.getSelectedKey();
            this.doInitPortCode(selectedPortDistrictId);
        },

        onPressAddLineItem: function(event)
        {
            this.openMechandiseLineItemDialog(event, "ADD_MODE");
        },

        onPressDeleteLineItem: function(event)
        {
            var selectedItems = this.getView().byId("idMerchandiseTable").getSelectedItems();
            if (selectedItems.length === 0)
            {
                MessageBox.error("No item has been selected for deletion.");
                return;
            }
            return new Promise(function(fnResolve) {
                let self = this;
                let confirmationMsg = this._resourceBundle.getText("msg.View.Submission.DeleteMechandiseConfirmation");
                let title =  this._resourceBundle.getText("messageBox.Title.Confirmation");
                MessageBox.show(
                    confirmationMsg,
                    {
                        icon: MessageBox.Icon.QUESTION,
                        title: title,
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: function (oAction)
                        {
                            if (oAction === "YES")
                            {
                                self.doDeleteMechandiseLineItems(self);
                            }
                        }
                    }
                );
            }.bind(this)).catch(function(err) {
                if (err !== undefined) {
                    MessageBox.error(err.message);
                }
            });
        },

        doDeleteMechandiseLineItems: function(self)
        {
            let selectedItems = self.getView().byId("idMerchandiseTable").getSelectedItems();
            let listofMechandiseLineItemVWDO = self.getView().getModel("SubmissionVWDM").getData().SubmissionData.Items;
            for (let i = 0; i < selectedItems.length; i++)
            {
                let currItem = selectedItems[i];
                let index = currItem.oBindingContexts.SubmissionVWDM.sPath.split("/")[3];
                listofMechandiseLineItemVWDO[index]._DELETED = true;
            }
            let remainingMechandiseLineItemVWDO = [];
            let lineNumber = 0;
            for (let i = 0; i < listofMechandiseLineItemVWDO.length; i++)
            {
                if (listofMechandiseLineItemVWDO[i]._DELETED)
                {
                    continue;
                }
                lineNumber++;
                listofMechandiseLineItemVWDO[i].LineNumber = lineNumber.toFixed(0);
                remainingMechandiseLineItemVWDO.push(listofMechandiseLineItemVWDO[i]);
            }
            self.getView().getModel("SubmissionVWDM").getData().SubmissionData.Items = remainingMechandiseLineItemVWDO;
            self.getView().getModel("SubmissionVWDM").refresh();
            self.getView().byId("idMerchandiseTable").removeSelections(true);
        },

        onPressLineItem: function(event)
        {
            let index = event.getSource().getBindingContextPath().split("/")[3];
            let mechandiseLineItemVWDO = this.getView().getModel("SubmissionVWDM").getData().SubmissionData.Items[index];
            let mechandiseLineItemVWDM = new sap.ui.model.json.JSONModel(mechandiseLineItemVWDO)
            this.getView().setModel(mechandiseLineItemVWDM, "MechandiseLineItemVWDM");

            let submissionVWDO = this.getView().getModel("SubmissionVWDM").getData();
            let status = submissionVWDO.Status;
            let mode = "VIEW_MODE";
            if (status === "WIP" || status ===  "REQUIREUPDATE")
            {
                mode = "EDIT_MODE";
            }
            this.openMechandiseLineItemDialog(event, mode);
        },

        onPressSaveSubmission: function(event)
        {
            let self = this;
            let confirmationMsg = this._resourceBundle.getText("msg.View.Submission.SaveConfirmation");
            let title =  this._resourceBundle.getText("messageBox.Title.Confirmation");
            MessageBox.show(
                confirmationMsg,
                {
                    icon: MessageBox.Icon.QUESTION,
                    title: title,
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction)
                    {
                        if (oAction === "YES")
                        {
                            self.doSaveSubmission();
                        }
                    }
                }
            );
        },

        onPressCloseSubmission: function(event)
        {
            this.doCloseSubmission();
        },
        
        doCloseSubmission: function()
        {
            let submissionVWDO = this.getView().getModel("SubmissionVWDM").getData();
            let status = submissionVWDO.Status;
            if (status === "WIP" || status ===  "REQUIREUPDATE")
            {
                let self = this;
                let confirmationMsg = this._resourceBundle.getText("msg.View.Submission.CloseConfirmation");
                let title =  this._resourceBundle.getText("messageBox.Title.Confirmation");
                MessageBox.show(
                    confirmationMsg,
                    {
                        icon: MessageBox.Icon.QUESTION,
                        title: title,
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: function (oAction)
                        {
                            if (oAction === "YES")
                            {
                                self.doNavBack();
                            }
                        }
                    }
                );
            }
            else
            {
                this.doNavBack();
            }
        },

        onPressSubmitSubmission: function(event)
        {
            return new Promise(function(fnResolve) {
                let self = this;
                let tdxOnlineStatusVWDO = this.getView().getModel("TDXOnlineStatusVWDM").getData();
                let tdxOnlineStatus = tdxOnlineStatusVWDO.OnlineStatus;
                let confirmationMsg = this._resourceBundle.getText("msg.View.Submission.SubmitConfirmation");
                if (! tdxOnlineStatus)
                {
                    confirmationMsg = this._resourceBundle.getText("msg.View.Submission.SubmitConfirmationTDXOffline");
                }
                let title =  this._resourceBundle.getText("messageBox.Title.Confirmation");
                MessageBox.show(
                    confirmationMsg,
                    {
                        icon: MessageBox.Icon.QUESTION,
                        title: title,
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: function (oAction)
                        {
                            if (oAction === "YES")
                            {
                                self.exeSubmitSubmission(self);
                            }
                        }
                    }
                );
            }.bind(this)).catch(function(err) {
                if (err !== undefined) {
                    MessageBox.error(err.message);
                }
            });
        },

        exeSubmitSubmission: function(self)
        {
            if (! self.validateRequireFields())
            {
                let errorMsg = self._resourceBundle.getText("errorMsg.ValidationError.FixAll");
                MessageBox.error(errorMsg);
                return;
            }
            if (! self.validateAllFields())
            {
                let errorMsg = self._resourceBundle.getText("errorMsg.ValidationError.FixAll");
                MessageBox.error(errorMsg);
                return;
            }
            if (! self.validateMechandise())
            {
                let errorMsg = self._resourceBundle.getText("errorMsg.ValidationError.View.Submission.NoMechandiseLineItems");
                MessageBox.error(errorMsg);
                return;
            }
            self.doSubmitSubmission();
        },

        validateRequireFields: function()
        {
            let validationPassed = true;
            let errorMsg = this._resourceBundle.getText("errorMsg.RequiredField.CannotBeBlank");
            let requireFieldDefs = this.getRequiredFieldDefs();
            for (let i = 0; i < requireFieldDefs.length; i++)
            {
                let id = requireFieldDefs[i].id;
                let type = requireFieldDefs[i].type;
                let uiControl = this.getView().byId(id);
                uiControl.setValueState(sap.ui.core.ValueState.None);
                uiControl.setValueStateText("");
                if (type === "Input" || type === "TextArea")
                {
                    let inputValue = uiControl.getValue();
                    if (inputValue === null || inputValue === "")
                    {
                        uiControl.setValueState(sap.ui.core.ValueState.Error);
                        uiControl.setValueStateText(errorMsg);
                        validationPassed = false;
                    }
                }
                else if (type === "ComboBox")
                {
                    let selectedKey = uiControl.getSelectedKey();
                    if (selectedKey === "")
                    {
                        uiControl.setValueState(sap.ui.core.ValueState.Error);
                        uiControl.setValueStateText(errorMsg);
                        validationPassed = false;
                    }
                }
                else if (type === "DatePicker")
                {
                    let dateValue = uiControl.getDateValue();
                    if (dateValue === null)
                    {
                        uiControl.setValueState(sap.ui.core.ValueState.Error);
                        uiControl.setValueStateText(errorMsg);
                        validationPassed = false;
                    }
                }
            }
            return validationPassed;
        },

        validateAllFields: function()
        {
            if (! this.validateImportExportDate())
            {
                return false;
            }
            if (! this.validateMissingDocs())
            {
                return false;
            }
            return true;
        },

        validateImportExportDate: function()
        {
            let scImportDate = this.getView().byId("idImportDate");
            let scExportDate = this.getView().byId("idExportDate");
            scImportDate.setValueState(sap.ui.core.ValueState.None);
            scImportDate.setValueStateText("");
            scExportDate.setValueState(sap.ui.core.ValueState.None);
            scExportDate.setValueStateText("");
            let importDate = scImportDate.getDateValue();
            let exportDate = scExportDate.getDateValue();
        //  [COMMENT] Validation Rule: Import Date must be >= Export Date.
            if (exportDate.getTime() > importDate.getTime())
            {
            //  let errorMsg = this._resourceBundle.getText("errorMsg.ValidationError.View.Submission.ImportDateGTExportDate");
                let errorMsg = this._resourceBundle.getText("errorMsg.ValidationError.View.Submission.ExportDateGTImportDate");
                scImportDate.setValueState(sap.ui.core.ValueState.Error);
                scImportDate.setValueStateText(errorMsg);
                scExportDate.setValueState(sap.ui.core.ValueState.Error);
                scExportDate.setValueStateText(errorMsg);                   
                return false;
            }
            return true;
        },

        validateMissingDocs: function()
        {
            let selectedMissingDocs = [];
            let missingDocsDO = MasterData.getMissingDocs();
            for (let i = 0; i < missingDocsDO.length; i++)
            {
                let id = missingDocsDO[i].ViewId;
                let scMissDoc = this.getView().byId(id);
                scMissDoc.setValueState(sap.ui.core.ValueState.None);
                scMissDoc.setValueStateText("");
                let isSelected = scMissDoc.getSelected();
                if (isSelected)
                {
                    selectedMissingDocs.push(id);
                }
            }
            if (selectedMissingDocs.length > 2)
            {
                let errorMsg = this._resourceBundle.getText("errorMsg.ValidationError.View.Submission.MaxTwoMissingDocs");
                for (let k = 0; k < selectedMissingDocs.length; k++)
                {
                    let id = selectedMissingDocs[k];
                    let scMissDoc = this.getView().byId(id);
                    scMissDoc.setValueState(sap.ui.core.ValueState.Error);
                    scMissDoc.setValueStateText(errorMsg);
                }
                return false;
            }
            return true;
        },

        validateMechandise: function()
        {
            let submissionVWDM = this.getView().getModel("SubmissionVWDM");
            let numofLineItems = submissionVWDM.getData().SubmissionData.Items.length;
            if (numofLineItems == 0)
            {
                return false;
            }
            return true;
        },

        doGetEntryNumber: function()
        {
            let submissionVWDO = this.getView().getModel("SubmissionVWDM").getData();
            if (submissionVWDO.Id === "<NEW>")
            {
                let newEntryNumber = APIHelper.newEntryNumber();
                if (newEntryNumber.EntryNumber)
                {
                    submissionVWDO.Id = newEntryNumber.EntryNumber;
                }
            }
            if (submissionVWDO.Id === "<NEW>")
            {
                let errMsg = this._resourceBundle.getText("msg.View.Submission.GetNewEntryNumberFailed");
                MessageBox.error(errMsg);
                return false;
            }
            return true;
        },

        doSubmitSubmission: function()
        {
            if (! this.doGetEntryNumber())
            {
                return;
            }
            let submissionPayloadDO = this.viewToPayloadSubmission();
            let responseDO;
            let msg;
            sap.ui.core.BusyIndicator.show();
            if (submissionPayloadDO.Status === "WIP")
            {
                responseDO = APIHelper.submitSubmission(submissionPayloadDO);
                msg = this._resourceBundle.getText("msg.View.Submission.SubmissionSubmitSuccessful");
            }
            else if (submissionPayloadDO.Status === "REQUIREUPDATE")
            {
                responseDO = APIHelper.updateSubmission(submissionPayloadDO);
                msg = this._resourceBundle.getText("msg.View.Submission.SubmissionUpdateSuccessful");
            }
            sap.ui.core.BusyIndicator.hide();
            if (responseDO.StatusCode == 200)
            {
                let self = this;
                let entryNumber = submissionPayloadDO.Id;
                let enMsg = this._resourceBundle.getText("msg.View.Submission.EntryNumberColon") + " " + entryNumber;
                let title = this._resourceBundle.getText("messageBox.Title.Success");
                MessageBox.show(
                    msg + " " + enMsg,
                    {
                        icon: MessageBox.Icon.SUCCESS,
                        title: title,
                        actions: [MessageBox.Action.OK],
                        onClose: function (oAction)
                        {
                            if (oAction === "OK")
                            {
                                self.doNavBack();
                            }
                        }
                    }
                );
            }
            else
            {
                let msg = this._resourceBundle.getText("msg.View.Submission.SubmissionSubmitFailed");
                MessageBox.error(msg);
            }
        },

        doSaveSubmission: function()
        {
            if (! this.doGetEntryNumber())
            {
                return;
            }
            this.getView().getModel("SubmissionVWDM").refresh();
            let submissionPayloadDO = this.viewToPayloadSubmission();
            let responseDO = APIHelper.saveSubmission(submissionPayloadDO);
            if (responseDO.StatusCode == 200)
            {
                let entryNumber = submissionPayloadDO.Id;
                let enMsg = this._resourceBundle.getText("msg.View.Submission.EntryNumberColon") + " " + entryNumber;
                let msg = this._resourceBundle.getText("msg.View.Submission.SubmissionSaveSuccessful");
                MessageBox.success(msg + " " + enMsg);
            }
            else
            {
                let msg = this._resourceBundle.getText("msg.View.Submission.SubmissionSaveFailed");
                MessageBox.error(msg);
            }
            this.toggleImportButtons();
        },

        viewToPayloadSubmission: function()
        {
            let submissionVWDO = this.getView().getModel("SubmissionVWDM").getData();
            let submissionPayloadDO = DataModel.newSubmissionPayloadDO();
            submissionPayloadDO.Id = submissionVWDO.Id;
            submissionPayloadDO.Status = submissionVWDO.Status;
            submissionPayloadDO.SubmissionData.EntryType = submissionVWDO.SubmissionData.EntryType;
            submissionPayloadDO.SubmissionData.SummaryDate = CommonUtil.getFormattedDate(this.getView(), "idSummaryDate");
            submissionPayloadDO.SubmissionData.SuretyNumber = submissionVWDO.SubmissionData.SuretyNumber;
            submissionPayloadDO.SubmissionData.BondType = submissionVWDO.SubmissionData.BondType;
            submissionPayloadDO.SubmissionData.PortCode = submissionVWDO.SubmissionData.PortDistrict + submissionVWDO.SubmissionData.PortCode;
            submissionPayloadDO.SubmissionData.EntryDate = CommonUtil.getFormattedDate(this.getView(), "idEntryDate");
            submissionPayloadDO.SubmissionData.ImportCarrier = submissionVWDO.SubmissionData.ImportCarrier;
            submissionPayloadDO.SubmissionData.TransportMode = submissionVWDO.SubmissionData.TransportMode
            submissionPayloadDO.SubmissionData.CountryOfOrigin = submissionVWDO.SubmissionData.CountryOfOrigin;
            submissionPayloadDO.SubmissionData.ImportDate = CommonUtil.getFormattedDate(this.getView(), "idImportDate");
            submissionPayloadDO.SubmissionData.BLAWBNumber = submissionVWDO.SubmissionData.BLAWBNumber;
            submissionPayloadDO.SubmissionData.ManufacturerId = submissionVWDO.SubmissionData.ManufacturerId;
            submissionPayloadDO.SubmissionData.ExportingCountry = submissionVWDO.SubmissionData.ExportingCountry;
            submissionPayloadDO.SubmissionData.ExportDate = CommonUtil.getFormattedDate(this.getView(), "idExportDate");
            submissionPayloadDO.SubmissionData.ITNumber = submissionVWDO.SubmissionData.ITNumber;
            submissionPayloadDO.SubmissionData.ITDate = CommonUtil.getFormattedDate(this.getView(), "idITDate");
            submissionPayloadDO.SubmissionData.MissingDocs = this.viewToPayloadMissingDocs();
            submissionPayloadDO.SubmissionData.ForeignPortOfLaiding = submissionVWDO.SubmissionData.ForeignPortOfLaiding;
            submissionPayloadDO.SubmissionData.USPortOfLaiding = submissionVWDO.SubmissionData.USPortOfLaiding;
            submissionPayloadDO.SubmissionData.GoodsLocation = submissionVWDO.SubmissionData.GoodsLocation;
            submissionPayloadDO.SubmissionData.CosingneeNumber = submissionVWDO.SubmissionData.CosingneeNumber;
            submissionPayloadDO.SubmissionData.CosigneeLName = submissionVWDO.SubmissionData.CosigneeLName;
            submissionPayloadDO.SubmissionData.CosigneeFName = submissionVWDO.SubmissionData.CosigneeFName;
            submissionPayloadDO.SubmissionData.CosigneeMIName = submissionVWDO.SubmissionData.CosigneeMIName;
            submissionPayloadDO.SubmissionData.CosigneeAddrStreet = submissionVWDO.SubmissionData.CosigneeAddrStreet;
            submissionPayloadDO.SubmissionData.CosigneeAddrCity = submissionVWDO.SubmissionData.CosigneeAddrCity;
            submissionPayloadDO.SubmissionData.CosigneeAddrStateCd = submissionVWDO.SubmissionData.CosigneeAddrStateCd;
            submissionPayloadDO.SubmissionData.CosigneeAddrZip = submissionVWDO.SubmissionData.CosigneeAddrZip;
            submissionPayloadDO.SubmissionData.ImporterNumber = submissionVWDO.SubmissionData.ImporterNumber;
            submissionPayloadDO.SubmissionData.ReferenceNumber = submissionVWDO.SubmissionData.ReferenceNumber;
            submissionPayloadDO.SubmissionData.ImporterLName = submissionVWDO.SubmissionData.ImporterLName;
            submissionPayloadDO.SubmissionData.ImporterFName = submissionVWDO.SubmissionData.ImporterFName;
            submissionPayloadDO.SubmissionData.ImporterMIName = submissionVWDO.SubmissionData.ImporterMIName;
            submissionPayloadDO.SubmissionData.ImporterAddrStreet = submissionVWDO.SubmissionData.ImporterAddrStreet;
            submissionPayloadDO.SubmissionData.ImporterAddrCity = submissionVWDO.SubmissionData.ImporterAddrCity;
            submissionPayloadDO.SubmissionData.ImporterAddrStateCd = submissionVWDO.SubmissionData.ImporterAddrStateCd;
            submissionPayloadDO.SubmissionData.ImporterAddrZip = submissionVWDO.SubmissionData.ImporterAddrZip;
            submissionPayloadDO.SubmissionData.TotalEnteredValue = submissionVWDO.SubmissionData.TotalEnteredValue;
            submissionPayloadDO.SubmissionData.TotalOtherFees = submissionVWDO.SubmissionData.TotalOtherFees;
            submissionPayloadDO.SubmissionData.OtherFeesSummary = submissionVWDO.SubmissionData.OtherFeesSummary;
            submissionPayloadDO.SubmissionData.TotalDuty = submissionVWDO.SubmissionData.TotalDuty;
            submissionPayloadDO.SubmissionData.TotalTax = submissionVWDO.SubmissionData.TotalTax;
            submissionPayloadDO.SubmissionData.TotalOtherFee = submissionVWDO.SubmissionData.TotalOtherFee;
            submissionPayloadDO.SubmissionData.Total = submissionVWDO.SubmissionData.Total;
            submissionPayloadDO.SubmissionData.DeclarentFName = submissionVWDO.SubmissionData.DeclarentFName;
            submissionPayloadDO.SubmissionData.DeclarentLName = submissionVWDO.SubmissionData.DeclarentLName;
            submissionPayloadDO.SubmissionData.DeclarentMIName = submissionVWDO.SubmissionData.DeclarentMIName;
            submissionPayloadDO.SubmissionData.DeclarentTitle = submissionVWDO.SubmissionData.DeclarentTitle;
            submissionPayloadDO.SubmissionData.DeclaredDate = CommonUtil.getFormattedDate(this.getView(), "idDeclaredDate");
            submissionPayloadDO.SubmissionData.BrokerFilerFName = submissionVWDO.SubmissionData.BrokerFilerFName;
            submissionPayloadDO.SubmissionData.BrokerFilerLName = submissionVWDO.SubmissionData.BrokerFilerLName;
            submissionPayloadDO.SubmissionData.BrokerFilerMIName = submissionVWDO.SubmissionData.BrokerFilerMIName;
            submissionPayloadDO.SubmissionData.BrokerFilerPhone = submissionVWDO.SubmissionData.BrokerFilerPhone;
            submissionPayloadDO.SubmissionData.BrokerFilerNumner1 = submissionVWDO.SubmissionData.BrokerFilerNumner1;
            submissionPayloadDO.SubmissionData.BrokerFilerNumner2 = submissionVWDO.SubmissionData.BrokerFilerNumner2;
            let listofMechandiseLineItemPayloadDO = this.viewToPayloadMechandise();
            submissionPayloadDO.SubmissionData.Items = listofMechandiseLineItemPayloadDO;
            return submissionPayloadDO;
        },

        viewToPayloadMissingDocs: function()
        {
            let missingDocs = "";
            let missingDocsDO = MasterData.getMissingDocs();
            for (let i = 0; i < missingDocsDO.length; i++)
            {
                let viewId = missingDocsDO[i].ViewId;
                let scMissDoc = this.getView().byId(viewId);
                let isSelected = scMissDoc.getSelected();
                if (isSelected)
                {
                //  let customData = scMissDoc.data("ID");
                    let customData = MasterData.getMissingDocId(viewId);
                    if (missingDocs.length > 0)
                    {
                        missingDocs += ",";
                    }
                    missingDocs += customData;
                }
            }
            return missingDocs;
        },

        viewToPayloadMechandise: function()
        {
            let listofMechandiseLineItemPayloadDO = []
            let listofMechandiseLineItemVWDO = this.getView().getModel("SubmissionVWDM").getData().SubmissionData.Items;
            for (let i = 0; i < listofMechandiseLineItemVWDO.length; i++)
            {
                let mechandiseLineItemPayloadDO = DataModel.newMechandiseLineItemPayloadDO();
                mechandiseLineItemPayloadDO.LineNumber = listofMechandiseLineItemVWDO[i].LineNumber;
                mechandiseLineItemPayloadDO.MerchantDesc = listofMechandiseLineItemVWDO[i].MerchantDesc;
                mechandiseLineItemPayloadDO.HTSUSNumber = listofMechandiseLineItemVWDO[i].HTSUSNumber;
                mechandiseLineItemPayloadDO.ADDCVNumber = listofMechandiseLineItemVWDO[i].ADDCVNumber;
                mechandiseLineItemPayloadDO.GrossWeight = listofMechandiseLineItemVWDO[i].GrossWeight;
                mechandiseLineItemPayloadDO.ManifestQty = listofMechandiseLineItemVWDO[i].ManifestQty;
                mechandiseLineItemPayloadDO.HTSUSQty = listofMechandiseLineItemVWDO[i].HTSUSQty;
                mechandiseLineItemPayloadDO.EnteredValue = listofMechandiseLineItemVWDO[i].EnteredValue;
                mechandiseLineItemPayloadDO.OtherCharges = listofMechandiseLineItemVWDO[i].OtherCharges;
                mechandiseLineItemPayloadDO.Relationship = listofMechandiseLineItemVWDO[i].Relationship;
                mechandiseLineItemPayloadDO.HTSUSRatePct = listofMechandiseLineItemVWDO[i].HTSUSRatePct;
                mechandiseLineItemPayloadDO.ADCVDRatePct = listofMechandiseLineItemVWDO[i].ADCVDRatePct;
                mechandiseLineItemPayloadDO.IrcRatePct = listofMechandiseLineItemVWDO[i].IrcRatePct;
                mechandiseLineItemPayloadDO.VisaCertificateNumber = listofMechandiseLineItemVWDO[i].VisaCertificateNumber;
                mechandiseLineItemPayloadDO.AgreLicenseNumber = listofMechandiseLineItemVWDO[i].AgreLicenseNumber;
                mechandiseLineItemPayloadDO.Duty = listofMechandiseLineItemVWDO[i].Duty;
                mechandiseLineItemPayloadDO.IRTax = listofMechandiseLineItemVWDO[i].IRTax;
                listofMechandiseLineItemPayloadDO.push(mechandiseLineItemPayloadDO);
            }
            return listofMechandiseLineItemPayloadDO;
        },

        resultSetToViewPortDistrict: function(resultSetPortCode)
        {
            if( ! resultSetPortCode ) {
                return "";
            }

            let portDistrict = "";
            if (resultSetPortCode.length >= 2)
            {
                portDistrict = resultSetPortCode.substring(0, 2);
            }
            this.doInitPortCode(portDistrict);
            return portDistrict;
        },

        resultSetToViewPortCode: function(resultSetPortCode)
        {
            if( ! resultSetPortCode ) {
                return "";
            }

            let portCode = "";
            if (resultSetPortCode.length >= 4)
            {
                portCode = resultSetPortCode.substring(2, 4);
            }
            return portCode;
        },

        resultSetToViewSubmission: function(resultSetDO)
        {
            let submissionVWDO = DataModel.newSubmissionVWDO();
            let submissionDataDO = resultSetDO.SubmissionData;
            submissionVWDO.Id = resultSetDO.Id;
            submissionVWDO.Status = resultSetDO.Status;
            submissionVWDO.StatusDesc = MasterData.getStatusDesc(resultSetDO.Status);
            submissionVWDO.SubmissionData.EntryType = submissionDataDO.EntryType
            submissionVWDO.SubmissionData.SummaryDate = CommonUtil.setFormattedDate(this.getView(), "idSummaryDate", submissionDataDO.SummaryDate);
            submissionVWDO.SubmissionData.SuretyNumber = submissionDataDO.SuretyNumber;
            submissionVWDO.SubmissionData.BondType = submissionDataDO.BondType;
            submissionVWDO.SubmissionData.PortDistrict = this.resultSetToViewPortDistrict(submissionDataDO.PortCode);
            submissionVWDO.SubmissionData.PortCode = this.resultSetToViewPortCode(submissionDataDO.PortCode);
            submissionVWDO.SubmissionData.EntryDate = CommonUtil.setFormattedDate(this.getView(), "idEntryDate", submissionDataDO.EntryDate);
            submissionVWDO.SubmissionData.ImportCarrier = submissionDataDO.ImportCarrier;
            submissionVWDO.SubmissionData.TransportMode = submissionDataDO.TransportMode;
            submissionVWDO.SubmissionData.CountryOfOrigin = submissionDataDO.CountryOfOrigin;
            submissionVWDO.SubmissionData.ImportDate = CommonUtil.setFormattedDate(this.getView(), "idImportDate", submissionDataDO.ImportDate);
            submissionVWDO.SubmissionData.BLAWBNumber = submissionDataDO.BLAWBNumber;
            submissionVWDO.SubmissionData.ManufacturerId = submissionDataDO.ManufacturerId;
            submissionVWDO.SubmissionData.ExportingCountry = submissionDataDO.ExportingCountry;
            submissionVWDO.SubmissionData.ExportDate = CommonUtil.setFormattedDate(this.getView(), "idExportDate", submissionDataDO.ExportDate);
            submissionVWDO.SubmissionData.ITNumber = submissionDataDO.ITNumber;
            submissionVWDO.SubmissionData.ITDate = CommonUtil.setFormattedDate(this.getView(), "idITDate", submissionDataDO.ITDate);
            submissionVWDO.SubmissionData.ForeignPortOfLaiding = submissionDataDO.ForeignPortOfLaiding;
            submissionVWDO.SubmissionData.USPortOfLaiding = submissionDataDO.USPortOfLaiding;
            submissionVWDO.SubmissionData.GoodsLocation = submissionDataDO.GoodsLocation;
            submissionVWDO.SubmissionData.MissingDocCommercialInvoice = this.resultSetToViewMissingDocs(submissionDataDO.MissingDocs, "idMissingDocCommercialInvoice");
            submissionVWDO.SubmissionData.MissingDocCBPForm5523 = this.resultSetToViewMissingDocs(submissionDataDO.MissingDocs, "idMissingDocCBPForm5523");
            submissionVWDO.SubmissionData.MissingDocCorrectedCommercialInvoice = this.resultSetToViewMissingDocs(submissionDataDO.MissingDocs, "idMissingDocCorrCommInvoice");
            submissionVWDO.SubmissionData.MissingDocOtherAgencyForm = this.resultSetToViewMissingDocs(submissionDataDO.MissingDocs, "idMissingDocOtherAgencyForm");
            submissionVWDO.SubmissionData.MissingDocScaleWeight = this.resultSetToViewMissingDocs(submissionDataDO.MissingDocs, "idMissingDocScaleWeight");
            submissionVWDO.SubmissionData.MissingDocCoffeeFormO = this.resultSetToViewMissingDocs(submissionDataDO.MissingDocs, "idMissingDocCoffeeFormO");
            submissionVWDO.SubmissionData.MissingDocChemicalAnalysis = this.resultSetToViewMissingDocs(submissionDataDO.MissingDocs, "idMissingDocChemicalAnalysis");
            submissionVWDO.SubmissionData.MissingDocOutturnReport = this.resultSetToViewMissingDocs(submissionDataDO.MissingDocs, "idMissingDocOutturnReport");
            submissionVWDO.SubmissionData.MissingDocPackingList = this.resultSetToViewMissingDocs(submissionDataDO.MissingDocs, "idMissingDocPackingList");
            submissionVWDO.SubmissionData.MissingDocNotSpecifiedAbove = this.resultSetToViewMissingDocs(submissionDataDO.MissingDocs, "idMissingDocNotSpecifiedAbove");
            submissionVWDO.SubmissionData.MissingDocMoreThanTwo = this.resultSetToViewMissingDocs(submissionDataDO.MissingDocs, "idMissingDocMoreThanTwo");
            submissionVWDO.SubmissionData.CosingneeNumber = submissionDataDO.CosingneeNumber;
            submissionVWDO.SubmissionData.CosigneeLName = submissionDataDO.CosigneeLName;
            submissionVWDO.SubmissionData.CosigneeFName = submissionDataDO.CosigneeFName;
            submissionVWDO.SubmissionData.CosigneeMIName = submissionDataDO.CosigneeMIName;
            submissionVWDO.SubmissionData.CosigneeAddrStreet = submissionDataDO.CosigneeAddrStreet;
            submissionVWDO.SubmissionData.CosigneeAddrCity = submissionDataDO.CosigneeAddrCity;
            submissionVWDO.SubmissionData.CosigneeAddrStateCd = submissionDataDO.CosigneeAddrStateCd;
            submissionVWDO.SubmissionData.CosigneeAddrZip = submissionDataDO.CosigneeAddrZip;
            submissionVWDO.SubmissionData.ImporterNumber = submissionDataDO.ImporterNumber;
            submissionVWDO.SubmissionData.ReferenceNumber = submissionDataDO.ReferenceNumber;
            submissionVWDO.SubmissionData.ImporterLName = submissionDataDO.ImporterLName;
            submissionVWDO.SubmissionData.ImporterFName = submissionDataDO.ImporterFName;
            submissionVWDO.SubmissionData.ImporterMIName = submissionDataDO.ImporterMIName;
            submissionVWDO.SubmissionData.ImporterAddrStreet = submissionDataDO.ImporterAddrStreet;
            submissionVWDO.SubmissionData.ImporterAddrCity = submissionDataDO.ImporterAddrCity;
            submissionVWDO.SubmissionData.ImporterAddrStateCd = submissionDataDO.ImporterAddrStateCd;
            submissionVWDO.SubmissionData.ImporterAddrZip = submissionDataDO.ImporterAddrZip;
            submissionVWDO.SubmissionData.OtherFeesSummary = submissionDataDO.OtherFeesSummary;
            submissionVWDO.SubmissionData.TotalEnteredValue = submissionDataDO.TotalEnteredValue;
            submissionVWDO.SubmissionData.TotalOtherFees = submissionDataDO.TotalOtherFees;
            submissionVWDO.SubmissionData.TotalDuty = submissionDataDO.TotalDuty;
            submissionVWDO.SubmissionData.TotalTax = submissionDataDO.TotalTax;
            submissionVWDO.SubmissionData.TotalOtherFee = submissionDataDO.TotalOtherFee;
            submissionVWDO.SubmissionData.Total = submissionDataDO.Total;
            submissionVWDO.SubmissionData.DeclarentLName = submissionDataDO.DeclarentLName;
            submissionVWDO.SubmissionData.DeclarentFName = submissionDataDO.DeclarentFName;
            submissionVWDO.SubmissionData.DeclarentMIName = submissionDataDO.DeclarentMIName;
            submissionVWDO.SubmissionData.DeclarentTitle = submissionDataDO.DeclarentTitle;
            submissionVWDO.SubmissionData.DeclaredDate = CommonUtil.setFormattedDate(this.getView(), "idDeclaredDate", submissionDataDO.DeclaredDate);
            submissionVWDO.SubmissionData.BrokerFilerLName = submissionDataDO.BrokerFilerLName;
            submissionVWDO.SubmissionData.BrokerFilerFName = submissionDataDO.BrokerFilerFName;
            submissionVWDO.SubmissionData.BrokerFilerMIName = submissionDataDO.BrokerFilerMIName;
            submissionVWDO.SubmissionData.BrokerFilerPhone = submissionDataDO.BrokerFilerPhone;
            submissionVWDO.SubmissionData.BrokerFilerNumner1 = submissionDataDO.BrokerFilerNumner1;
            submissionVWDO.SubmissionData.BrokerFilerNumner2 = submissionDataDO.BrokerFilerNumner2;
            let listofMechandiseLineItemVWDO = this.resultSetToViewMechandise(submissionDataDO);
            submissionVWDO.SubmissionData.Items = listofMechandiseLineItemVWDO;
            return submissionVWDO
        },

        resultSetToViewMissingDocs: function(missingDocs, argViewId)
        {
            if( ! missingDocs ) {
                return false;
            }

            let tokenizer = missingDocs.split(",");
            for (let i = 0; i < tokenizer.length; i++)
            {
                let docId = tokenizer[i];
                let viewId = MasterData.getMissingDocViewId(docId);
                if (viewId == argViewId)
                {
                    return true;
                }
            }
            return false;
        },

        resultSetToViewMechandise: function(submissionDataDO)
        {
            let listofMechandiseLineItemVWDO = [];
            let listofMechandiseLineItemDataDO = submissionDataDO.Items;
            for (let i = 0; i < listofMechandiseLineItemDataDO.length; i++)
            {
                let mechandiseLineItemVWDO = DataModel.newMechandiseLineItemVWDO();
                mechandiseLineItemVWDO.LineNumber = listofMechandiseLineItemDataDO[i].LineNumber;
                mechandiseLineItemVWDO.MerchantDesc = listofMechandiseLineItemDataDO[i].MerchantDesc;
                mechandiseLineItemVWDO.HTSUSNumber = listofMechandiseLineItemDataDO[i].HTSUSNumber;
                mechandiseLineItemVWDO.ADDCVNumber = listofMechandiseLineItemDataDO[i].ADDCVNumber;
                mechandiseLineItemVWDO.GrossWeight = listofMechandiseLineItemDataDO[i].GrossWeight;
                mechandiseLineItemVWDO.ManifestQty = listofMechandiseLineItemDataDO[i].ManifestQty;
                mechandiseLineItemVWDO.HTSUSQty = listofMechandiseLineItemDataDO[i].HTSUSQty;
                mechandiseLineItemVWDO.EnteredValue = listofMechandiseLineItemDataDO[i].EnteredValue;
                mechandiseLineItemVWDO.OtherCharges = listofMechandiseLineItemDataDO[i].OtherCharges;
                mechandiseLineItemVWDO.Relationship = listofMechandiseLineItemDataDO[i].Relationship;
                mechandiseLineItemVWDO.HTSUSRatePct = listofMechandiseLineItemDataDO[i].HTSUSRatePct;
                mechandiseLineItemVWDO.ADCVDRatePct = listofMechandiseLineItemDataDO[i].ADCVDRatePct;
                mechandiseLineItemVWDO.IrcRatePct = listofMechandiseLineItemDataDO[i].IrcRatePct;
                mechandiseLineItemVWDO.VisaCertificateNumber = listofMechandiseLineItemDataDO[i].VisaCertificateNumber;
                mechandiseLineItemVWDO.AgreLicenseNumber = listofMechandiseLineItemDataDO[i].AgreLicenseNumber;
                mechandiseLineItemVWDO.Duty = listofMechandiseLineItemDataDO[i].Duty;
                mechandiseLineItemVWDO.IRTax = listofMechandiseLineItemDataDO[i].IRTax;
                listofMechandiseLineItemVWDO.push(mechandiseLineItemVWDO);
            }
            return listofMechandiseLineItemVWDO;
        },

        resultSetToViewResponseListReleased: function(resultSetDO)
        {
            let responseListVWDO = DataModel.newResponseListVWDO();
            let listofResultSetResponseDO = resultSetDO.Responses;
            let numofResponses = listofResultSetResponseDO.length;
            if (numofResponses <= 0)
            {
                return responseListVWDO;
            
            }
            this.getView().byId("idLabelResponseListAdditionalComments").setVisible(false);
            this.getView().byId("idResponseListAdditionalComments").setVisible(false);
            let resultSetResponseDO = listofResultSetResponseDO[0];
            responseListVWDO.AuthNumber = resultSetResponseDO.Id;
            responseListVWDO.ResponseMsg = this._resourceBundle.getText("msg.view.Submission.ResponseItem.Released");
            return responseListVWDO;
        },

        resultSetToViewResponseList: function(resultSetDO)
        {
            let responseListVWDO = DataModel.newResponseListVWDO();
            let listofResultSetResponseDO = resultSetDO.Responses;
            let numofResponses = listofResultSetResponseDO.length;
            if (numofResponses <= 0)
            {
                return responseListVWDO;
            }
            this.getView().byId("idLabelResponseListAdditionalComments").setVisible(true);
            this.getView().byId("idResponseListAdditionalComments").setVisible(true);
            let resultSetResponseDO = listofResultSetResponseDO[0];
            let decision = resultSetResponseDO.Decision;
            responseListVWDO.AuthNumber = resultSetResponseDO.Id;
            responseListVWDO.ResponseData = resultSetResponseDO.ResponseData;
            if (decision === "REQUIREUPDATE")
            {
                responseListVWDO.ResponseMsg = this._resourceBundle.getText("msg.view.Submission.ResponseItem.NeedMoreInfo");
            }
            else if (decision === "REQUIREACTION")
            {
                responseListVWDO.ResponseMsg = this._resourceBundle.getText("msg.view.Submission.ResponseItem.OnHold");
            }
            else if (decision === "REJECTED")
            {
                responseListVWDO.ResponseMsg = this._resourceBundle.getText("msg.view.Submission.ResponseItem.Rejected");
            }
            return responseListVWDO;
        },

        toggleUIReadOnly: function()
        {
            let submissionVWDO = this.getView().getModel("SubmissionVWDM").getData();
            let status = submissionVWDO.Status;
            if (status === "WIP" || status ===  "REQUIREUPDATE")
            {
                this.doEnableUI(true);
                this.doVisibleUI(true);
                let buttonText = this._resourceBundle.getText("view.Submission.Button.CancelWithoutSavingSubmission");
                this.getView().byId("idCloseSubmissionButton").setText(buttonText);
            }
            else
            {
                this.doEnableUI(false);
                this.doVisibleUI(false);
                let buttonText = this._resourceBundle.getText("view.Submission.Button.CloseSubmission");
                this.getView().byId("idCloseSubmissionButton").setText(buttonText);                   
            }
            if (status === "WIP" || status === "UNDERREVIEW" || status === "SUBMITTED")
            {
                this.showHideResponseSection(false);
            }
            else
            {
                this.showHideResponseSection(true);
            }
        },

        toggleImportButtons: function()
        {
            let enabled = false;
            let submissionVWDO = this.getView().getModel("SubmissionVWDM").getData();
            if (submissionVWDO.Id === "<NEW>")
            {
                enabled = true;
            }
            this.getView().byId("idFileUploader").setEnabled(enabled);
            this.getView().byId("idUploadFromExcelButton").setEnabled(enabled);
            this.getView().byId("idPullFromExportButton").setEnabled(enabled);
            this.getView().byId("idPullFromExternalSystemButton").setEnabled(enabled);
        },

        showHideResponseSection: function(visible)
        {
            let sectionResponse = this.getView().byId("idSectionResponse");
            let sectionGeneralInfo = this.getView().byId("idSectionGeneralInfo");
            sectionResponse.setVisible(visible);
            CommonUtil.sleep(500);
            if (visible)
            {
            //  this.getView().byId("idObjectPageLayout").setSelectedSection(sectionResponse);
                this.getView().byId("idObjectPageLayout").setSelectedSection(sectionResponse.getId());
            //  this.getView().byId("idObjectPageLayout").scrollToSection("idSectionResponse");
            //  this.getView().byId("idObjectPageLayout").scrollToSection(sectionResponse.getId());

            }
            else
            {
            //  this.getView().byId("idObjectPageLayout").setSelectedSection(sectionGeneralInfo);
                this.getView().byId("idObjectPageLayout").setSelectedSection(sectionGeneralInfo.getId());
            //  this.getView().byId("idObjectPageLayout").scrollToSection("idSectionGeneralInfo");
            //  this.getView().byId("idObjectPageLayout").scrollToSection(sectionGeneralInfo.getId());
            }
        },

        doVisibleUI: function(visible)
        {
            this.getView().byId("idSubmitSubmissionButton").setVisible(visible);
            this.getView().byId("idSaveSubmissionButton").setVisible(visible);
        },

        doEnableUI: function(enabled)
        {
            let submissionVWDO = this.getView().getModel("SubmissionVWDM").getData();
            let status = submissionVWDO.Status;
            if (status === "WIP")
            {
                let buttonLabel = this._resourceBundle.getText("view.Submission.Button.SubmitSubmission");
                this.getView().byId("idSubmitSubmissionButton").setText(buttonLabel);
            }
            else if (status ===  "REQUIREUPDATE")
            {
                let buttonLabel = this._resourceBundle.getText("view.Submission.Button.UpdateSubmission");
                this.getView().byId("idSubmitSubmissionButton").setText(buttonLabel);
            }
            this.getView().byId("idSubmitSubmissionButton").setEnabled(enabled);
            this.getView().byId("idSaveSubmissionButton").setEnabled(enabled);
            this.getView().byId("idEntryType").setEnabled(enabled);
            this.getView().byId("idSummaryDate").setEnabled(enabled);
            this.getView().byId("idSuretyNumber").setEnabled(enabled);
            this.getView().byId("idBondType").setEnabled(enabled);
            this.getView().byId("idPortDistrict").setEnabled(enabled);
            this.getView().byId("idPortCode").setEnabled(enabled);
            this.getView().byId("idEntryDate").setEnabled(enabled);
            this.getView().byId("idImportingCarrier").setEnabled(enabled);
            this.getView().byId("idModeOfTransport").setEnabled(enabled);
            this.getView().byId("idCountryOfOrigin").setEnabled(enabled);
            this.getView().byId("idImportDate").setEnabled(enabled);
            this.getView().byId("idBLAWBNumber").setEnabled(enabled);
            this.getView().byId("idManufacturerID").setEnabled(enabled);
            this.getView().byId("idExportingCountry").setEnabled(enabled);
            this.getView().byId("idExportDate").setEnabled(enabled);
            this.getView().byId("idITNumber").setEnabled(enabled);
            this.getView().byId("idITDate").setEnabled(enabled);
            this.getView().byId("idForeignPortOfLading").setEnabled(enabled);
            this.getView().byId("idUSPortOfLading").setEnabled(enabled);
            this.getView().byId("idLocOfGoodGONumber").setEnabled(enabled);
            this.getView().byId("idMissingDocCommercialInvoice").setEnabled(enabled);
            this.getView().byId("idMissingDocCBPForm5523").setEnabled(enabled);
            this.getView().byId("idMissingDocCorrCommInvoice").setEnabled(enabled);
            this.getView().byId("idMissingDocOtherAgencyForm").setEnabled(enabled);
            this.getView().byId("idMissingDocScaleWeight").setEnabled(enabled);
            this.getView().byId("idMissingDocCoffeeFormO").setEnabled(enabled);
            this.getView().byId("idMissingDocChemicalAnalysis").setEnabled(enabled);
            this.getView().byId("idMissingDocOutturnReport").setEnabled(enabled);
            this.getView().byId("idMissingDocPackingList").setEnabled(enabled);
            this.getView().byId("idMissingDocNotSpecifiedAbove").setEnabled(enabled);
            this.getView().byId("idMissingDocMoreThanTwo").setEnabled(enabled);
            this.getView().byId("idConsigneeNumber").setEnabled(enabled);
            this.getView().byId("idConsigneeLastName").setEnabled(enabled);
            this.getView().byId("idConigneeFirstName").setEnabled(enabled);
            this.getView().byId("idConigneeMiddleInitial").setEnabled(enabled);
            this.getView().byId("idConsigneeAddressStreet").setEnabled(enabled);
            this.getView().byId("idConigneeAddressCity").setEnabled(enabled);
            this.getView().byId("idConigneeAddressState").setEnabled(enabled);
            this.getView().byId("idConigneeAddressZip").setEnabled(enabled);
            this.getView().byId("idImporterNumber").setEnabled(enabled);
            this.getView().byId("idReferenceNumber").setEnabled(enabled);
            this.getView().byId("idImporterLastName").setEnabled(enabled);
            this.getView().byId("idImporterFirstName").setEnabled(enabled);
            this.getView().byId("idImporterMiddleInitial").setEnabled(enabled);
            this.getView().byId("idImporterAddressStreet").setEnabled(enabled);
            this.getView().byId("idImporterAddressCity").setEnabled(enabled);
            this.getView().byId("idImporterAddressState").setEnabled(enabled);
            this.getView().byId("idImporterAddressZip").setEnabled(enabled);
            this.getView().byId("idMerchandiseTableToolbar").setEnabled(enabled);
            this.getView().byId("idOtherFeeSummary").setEnabled(enabled);
            this.getView().byId("idTotalEnteredValue").setEnabled(enabled);
            this.getView().byId("idTotalOtherFees").setEnabled(enabled);
            this.getView().byId("idTotalDuty").setEnabled(enabled);
            this.getView().byId("idTotalTax").setEnabled(enabled);
            this.getView().byId("idTotalOtherFee").setEnabled(enabled);
            this.getView().byId("idTotal").setEnabled(enabled);
            this.getView().byId("idDeclarentLName").setEnabled(enabled);
            this.getView().byId("idDeclarentFName").setEnabled(enabled);
            this.getView().byId("idDeclarentMIName").setEnabled(enabled);
            this.getView().byId("idDeclarentTitle").setEnabled(enabled);
            this.getView().byId("idDeclaredDate").setEnabled(enabled);
            this.getView().byId("idBrokerFilerLName").setEnabled(enabled);
            this.getView().byId("idBrokerFilerFName").setEnabled(enabled);
            this.getView().byId("idBrokerFilerMIName").setEnabled(enabled);
            this.getView().byId("idBrokerFilerPhone").setEnabled(enabled);
            this.getView().byId("idBrokerFilerNumner1").setEnabled(enabled);
            this.getView().byId("idBrokerFilerNumner2").setEnabled(enabled);
        },

        onLinkPressResponseHistory: function()
        {
            let submissionVWDO = this.getView().getModel("SubmissionVWDM").getData();
            let contextDataDO =
            {
                "routeFrom": "Submission",
                "id": submissionVWDO.Id
            };
            let contextData = JSON.stringify(contextDataDO);
            var contextDataEncoded = encodeURIComponent(contextData);
            this._router.navTo("ResponseHistory", {context:contextDataEncoded}, false);
        },

        onPressNotImplemented: function(event)
        {
            let msg = this._resourceBundle.getText("msg.generic.NotImplemented");
            MessageBox.alert(msg);
        },

        onPressPullFromExternalSystem: function(event)
        {
            let self = this;
            let confirmationMsg = this._resourceBundle.getText("msg.View.Submission.PullFromExternalSystemConfirmation");
            let title =  this._resourceBundle.getText("messageBox.Title.Confirmation");
            MessageBox.show(
                confirmationMsg,
                {
                    icon: MessageBox.Icon.QUESTION,
                    title: title,
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction)
                    {
                        if (oAction === "YES")
                        {
                            self.doPullFromExternalSystem();
                        }
                    }
                }
            );
        },

        doPullFromExternalSystem: function()
        {
            let submissionVWDO = SimData.pullDataFromExternalSystemVWDO();
            this.doInitPortCode(submissionVWDO.SubmissionData.PortDistrict);
            let submissionVWDM = new sap.ui.model.json.JSONModel(submissionVWDO);
            this.getView().setModel(submissionVWDM, "SubmissionVWDM");
            let dateFormat = this._resourceBundle.getText("default.DateFormat");
            let today = new Date();
            let summaryDate = today;
            let summaryDateFormatted = CommonUtil.timeEpochToFormattedDate(summaryDate.getTime(), dateFormat);
            this.getView().byId("idSummaryDate").setValue(summaryDateFormatted);
            let entryDate = today;
            let entryDateFormatted = CommonUtil.timeEpochToFormattedDate(entryDate.getTime(), dateFormat);
            this.getView().byId("idEntryDate").setValue(entryDateFormatted);
            let importDate = CommonUtil.addDays(today, 1);
            let importDateFormatted = CommonUtil.timeEpochToFormattedDate(importDate.getTime(), dateFormat);
            this.getView().byId("idImportDate").setValue(importDateFormatted);
            let exportDate = CommonUtil.addDays(today, -12);
            let exportDateFormatted = CommonUtil.timeEpochToFormattedDate(exportDate.getTime(), dateFormat);
            this.getView().byId("idExportDate").setValue(exportDateFormatted);
            let itDate = CommonUtil.addDays(today, 3);
            let itDateFormatted = CommonUtil.timeEpochToFormattedDate(itDate.getTime(), dateFormat);
            this.getView().byId("idITDate").setValue(itDateFormatted);
            let declaredDate = today;
            let declaredDateFormatted = CommonUtil.timeEpochToFormattedDate(declaredDate.getTime(), dateFormat);
            this.getView().byId("idDeclaredDate").setValue(declaredDateFormatted);
        },

        onUploadComplete: function(event)
        {
            let self = this;
            let responseStatus = event.getParameter("status");
            let responseRaw = event.getParameter("responseRaw");
            sap.ui.core.BusyIndicator.hide();
            if (responseStatus === 200)
            {
                let msg = this._resourceBundle.getText("msg.View.Submission.ExcelUpload.Successful");
                let responseJson = JSON.parse(responseRaw);
                let entryNumberList = responseJson.EntryNumberList;
                if (entryNumberList.length > 0)
                {
                    msg = msg + "\n" + "Entry Numbers:";
                }
                for (let idx = 0; idx < entryNumberList.length; idx++)
                {
                    msg = msg + "\n" + entryNumberList[idx].EntryNumber;
                }
                let title = this._resourceBundle.getText("messageBox.Title.Information");
                MessageBox.show(
                    msg,
                    {
                        icon: MessageBox.Icon.INFORMATION,
                        title: title,
                        actions: [MessageBox.Action.OK],
                        onClose: function (oAction)
                        {
                            if (oAction === "OK")
                            {
                                let fileUploader = self.getView().byId("idFileUploader");
                                fileUploader.clear();
                                self.doNavBack();
                            }
                        }
                    }
                );

            }
            else if (responseStatus === 400)
            {
                let msg = this._resourceBundle.getText("msg.View.Submission.ExcelUpload.Error");
                let responseJson = JSON.parse(responseRaw);
                let errorList = responseJson.ErrorList;
                if (errorList.length > 0)
                {
                    msg = msg + "\n" + "Errors:";
                }
                for (let idx = 0; idx < errorList.length; idx++)
                {
                    let id = errorList[idx].Id
                    if (id === "")
                    {
                        msg = msg + "\n" + errorList[idx].Msg;    
                    }
                    else
                    {
                        msg = msg + "\n" + "ID " + errorList[idx].Id + ": " + errorList[idx].Msg;
                    }
                }
                MessageBox.information(msg);
            }
            else
            {
                MessageBox.error(responseRaw);
            }
            let fileUploader = this.getView().byId("idFileUploader");
            fileUploader.clear();
        },

        handleTypeMissmatch: function(event)
        {
            let aFileTypes = event.getSource().getFileType();
            aFileTypes.map(function(fType) {
                return "*." + fType;
            });
        //  let msg = "The file type *." + event.getParameter("fileType") + " is not supported. Choose one of the following: " + aFileTypes.join(", ");
        //  [i18n] The file type *.{0} is not supported. Choose one of the following: {1}
            let fileTypeSelected = event.getParameter("fileType");
            let fileTypesAllowed = aFileTypes.join(", ");
            let msg = this._resourceBundle.getText("errorMsg.View.Submission.FileUploadTypeMissmatch", [fileTypeSelected, fileTypesAllowed]);
            MessageBox.error(msg);
        },

        onPressVerbagePullFromExcel: function(event)
        {
            MessageBox.information("Fill in declaration data from an Excel workbook.");
        },

        onPressVerbagePullFromExport: function(event)
        {
            MessageBox.information("Fill in declaration data from an Export Record.");
        },

        onPressPullFromExcel: function(event)
        {
            if (! this.validateUploadFilename())
            {
                return;
            }
            let fileUploader = this.getView().byId("idFileUploader");


            let tdxOnlineStatusVWDO = this.getView().getModel("TDXOnlineStatusVWDM").getData();
            let tdxOnlineStatus = tdxOnlineStatusVWDO.OnlineStatus;
            let confirmMsg = this._resourceBundle.getText("msg.View.Submission.ExcelUpload.ConfirmUpload");
            if (! tdxOnlineStatus)
            {
                confirmMsg = this._resourceBundle.getText("msg.View.Submission.ExcelUpload.ConfirmUploadTDXOffline");
            }
            MessageBox.confirm(confirmMsg,
            {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.CANCEL],
                onClose: function(action)
                {
                    if (action == sap.m.MessageBox.Action.YES)
                    {
                        let baseUrl = "https://submissionservice.cfapps.us10.hana.ondemand.com";
                        let uploadUrl = baseUrl + "/excelupload";
                        fileUploader.setSendXHR(true);
                        fileUploader.setUploadUrl(uploadUrl);
                        sap.ui.core.BusyIndicator.show();
                        fileUploader.upload();
                    }   
                    fileUploader.clear();
                }
            });
        },

        validateUploadFilename: function()
        {
            let fileUploader = this.getView().byId("idFileUploader");
            let fileName = fileUploader.getValue();
            if (fileName == null || fileName === "" || (! fileName.endsWith(".xlsx")))
            {
                let errMsgg = this._resourceBundle.getText("msg.View.Submission.ExcelUpload.IncorrectFileType");
                MessageBox.error(errMsgg);
                return false;
            }
            return true;
        },

        onPressDownloadExcel: function(event)
        {
            let httpRequest = new XMLHttpRequest();
            httpRequest.responseType = "arraybuffer";
            httpRequest.open("GET", "https://submissionservice.cfapps.us10.hana.ondemand.com/downloadexcel", true);
            httpRequest.send();
            httpRequest.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200)
                {
                    File.save(this.response, "Submission-Template", "xlsx", null, null);
                }
            };
        },

        getRequiredFieldDefs: function()
        {
            let requireFieldDefs =
            [
                {
                    "id": "idEntryType",
                    "type": "ComboBox"
                },
                {
                    "id": "idSummaryDate",
                    "type": "DatePicker"
                },
                {
                    "id": "idSuretyNumber",
                    "type": "ComboBox"
                },
                {
                    "id": "idBondType",
                    "type": "ComboBox"
                },
                {
                    "id": "idPortDistrict",
                    "type": "ComboBox"
                },
                {
                    "id": "idPortCode",
                    "type": "ComboBox"
                },
                {
                    "id": "idEntryDate",
                    "type": "DatePicker"
                },
                {
                    "id": "idImportingCarrier",
                    "type": "ComboBox"
                },
                {
                    "id": "idModeOfTransport",
                    "type": "ComboBox"
                },
                {
                    "id": "idCountryOfOrigin",
                    "type": "ComboBox"
                },
                {
                    "id": "idImportDate",
                    "type": "DatePicker"
                },
                {
                    "id": "idBLAWBNumber",
                    "type": "Input"
                },
                {
                    "id": "idManufacturerID",
                    "type": "Input"
                },
                {
                    "id": "idExportingCountry",
                    "type": "ComboBox"
                },
                {
                    "id": "idExportDate",
                    "type": "DatePicker"
                },
                {
                    "id": "idITNumber",
                    "type": "Input"
                },
                {
                    "id": "idITDate",
                    "type": "DatePicker"
                },
                {
                    "id": "idForeignPortOfLading",
                    "type": "Input"
                },
                {
                    "id": "idUSPortOfLading",
                    "type": "Input"
                },
                {
                    "id": "idLocOfGoodGONumber",
                    "type": "Input"
                },
                {
                    "id": "idConsigneeNumber",
                    "type": "Input"
                },
                {
                    "id": "idConsigneeLastName",
                    "type": "Input"
                },
                {
                    "id": "idConigneeFirstName",
                    "type": "Input"
                },
                {
                    "id": "idConsigneeAddressStreet",
                    "type": "Input"
                },
                {
                    "id": "idConigneeAddressCity",
                    "type": "Input"
                },
                {
                    "id": "idConigneeAddressState",
                    "type": "ComboBox"
                },
                {
                    "id": "idConigneeAddressZip",
                    "type": "Input"
                },
                {
                    "id": "idImporterNumber",
                    "type": "Input"
                },
                {
                    "id": "idReferenceNumber",
                    "type": "Input"
                },
                {
                    "id": "idImporterLastName",
                    "type": "Input"
                },
                {
                    "id": "idImporterFirstName",
                    "type": "Input"
                },
                {
                    "id": "idImporterAddressStreet",
                    "type": "Input"
                },
                {
                    "id": "idImporterAddressCity",
                    "type": "Input"
                },
                {
                    "id": "idImporterAddressState",
                    "type": "ComboBox"
                },
                {
                    "id": "idImporterAddressZip",
                    "type": "Input"
                },
                {
                    "id": "idOtherFeeSummary",
                    "type": "TextArea"
                },
                {
                    "id": "idTotalEnteredValue",
                    "type": "Input"
                },
                {
                    "id": "idTotalOtherFees",
                    "type": "Input"
                },
                {
                    "id": "idTotalDuty",
                    "type": "Input"
                },
                {
                    "id": "idTotalTax",
                    "type": "Input"
                },
                {
                    "id": "idTotalOtherFee",
                    "type": "Input"
                },
                {
                    "id": "idTotal",
                    "type": "Input"
                },
                {
                    "id": "idDeclarentLName",
                    "type": "Input"
                },
                {
                    "id": "idDeclarentFName",
                    "type": "Input"
                },
                {
                    "id": "idDeclaredDate",
                    "type": "DatePicker"
                },
                {
                    "id": "idBrokerFilerLName",
                    "type": "Input"
                },
                {
                    "id": "idBrokerFilerFName",
                    "type": "Input"
                },
                {
                    "id": "idBrokerFilerPhone",
                    "type": "Input"
                },
                {
                    "id": "idBrokerFilerNumner1",
                    "type": "Input"
                },
                {
                    "id": "idBrokerFilerNumner2",
                    "type": "Input"
                }
            ];
            return requireFieldDefs;
        }
    });
});
