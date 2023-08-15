sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "com/sap/poc/customssubmission/util/APIHelper",
    "com/sap/poc/customssubmission/util/CommonUtil",
    "com/sap/poc/customssubmission/util/DataModel",
    "com/sap/poc/customssubmission/util/MasterData"
    ],
    
    function(ManagedObject, MessageBox, History, APIHelper, CommonUtil, DataModel, MasterData) {
        "use strict";

        return ManagedObject.extend("com.sap.poc.customssubmission.controller.MechandiseLineItemDialog", {

            constructor: function(view)
            {
                this._view = view;
                this._control = sap.ui.xmlfragment(view.getId(), "com.sap.poc.customssubmission.view.MechandiseLineItemDialog", this);
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
                this.doOpenDialog(mode);
            },

            onPressAddMechandiseLineItem: function()
            {
                let validationPassed = this.validateRequireFields();
                if (! validationPassed)
                {
                    return;
                }
                let submissionVWDM = this.getView().getModel("SubmissionVWDM");
                let mechandiseLineItemVWDO = this.getView().getModel("MechandiseLineItemVWDM").getData();
                let lineNumber = submissionVWDM.getData().SubmissionData.Items.length + 1;
                mechandiseLineItemVWDO.LineNumber = lineNumber.toFixed(0);
                submissionVWDM.getData().SubmissionData.Items.push(mechandiseLineItemVWDO);
                submissionVWDM.refresh();
                this.close();
            },

            onPressSaveMechandiseLineItem: function()
            {
                let validationPassed = this.validateRequireFields();
                if (! validationPassed)
                {
                    return;
                }
                let submissionVWDM = this.getView().getModel("SubmissionVWDM");
                submissionVWDM.refresh();
                this.close();
            },

            onPressCancelMechandiseLineItem: function()
            {
                this.close();
            },

            loadAppData: function()
            {
                this._productHTSDO = APIHelper.loadProductHTS();
                let productHTSDM = new sap.ui.model.json.JSONModel(this._productHTSDO);
                this.getView().setModel(productHTSDM, "ProductHTSDM");

                this._relationshipVWDO = MasterData.getRelationshipList();
                let relationshipVWDM = new sap.ui.model.json.JSONModel(this._relationshipVWDO);
                this.getView().setModel(relationshipVWDM, "RelationshipVWDM");
            },

            loadViewData: function()
            {
                let mechandiseLineItemVWDO = DataModel.newMechandiseLineItemVWDO();
                let mechandiseLineItemVWDM = new sap.ui.model.json.JSONModel(mechandiseLineItemVWDO);
                this.getView().setModel(mechandiseLineItemVWDM, "MechandiseLineItemVWDM");
            },

            doOpenDialog: function(mode)
            {
                if (mode === "ADD_MODE" || mode === "EDIT_MODE")
                {
                    let enableAddButton = mode === "ADD_MODE" ? true : false;
                    let enableSaveButton = mode === "EDIT_MODE" ? true : false;
                    let visibleAddButton = mode === "ADD_MODE" ? true : false;
                    let visibleSaveButton = mode === "EDIT_MODE" ? true : false;
                    this.clearValidationErrors();
                    if (mode === "ADD_MODE")
                    {
                        this.loadViewData();
                    }
                    this.getView().byId("idMLIDescription").setEnabled(true);
                    this.getView().byId("idMLIHTSUSNumber").setEnabled(true);
                    this.getView().byId("idMLIADCVDNumber").setEnabled(true);
                    this.getView().byId("idMLIGrossWeight").setEnabled(true);
                    this.getView().byId("idMLIManifestQty").setEnabled(true);
                    this.getView().byId("idMLIHTSUSQty").setEnabled(true);
                    this.getView().byId("idMLIEnteredValue").setEnabled(true);
                    this.getView().byId("idMLIOtherCharges").setEnabled(true);
                    this.getView().byId("idMLIRelationship").setEnabled(true);
                    this.getView().byId("idMLIHTSUSRatePct").setEnabled(true);
                    this.getView().byId("idMLIADCVDRatePct").setEnabled(true);
                    this.getView().byId("idMLIIrcRatePct").setEnabled(true);
                    this.getView().byId("idMLIVisaCertificateNumber").setEnabled(true);
                    this.getView().byId("idMLIAgreLicenseNumber").setEnabled(true);
                    this.getView().byId("idMLIDuty").setEnabled(true);
                    this.getView().byId("idMLIIRTax").setEnabled(true);
                    this.getView().byId("idMLIAddButton").setEnabled(enableAddButton);
                    this.getView().byId("idMLISaveButton").setEnabled(enableSaveButton);
                    this.getView().byId("idMLICancelButton").setEnabled(true);
                    this.getView().byId("idMLIAddButton").setVisible(visibleAddButton);
                    this.getView().byId("idMLISaveButton").setVisible(visibleSaveButton);
                }
                else if (mode === "VIEW_MODE")
                {
                    this.getView().byId("idMLIDescription").setEnabled(false);
                    this.getView().byId("idMLIHTSUSNumber").setEnabled(false);
                    this.getView().byId("idMLIADCVDNumber").setEnabled(false);
                    this.getView().byId("idMLIGrossWeight").setEnabled(false);
                    this.getView().byId("idMLIManifestQty").setEnabled(false);
                    this.getView().byId("idMLIHTSUSQty").setEnabled(false);
                    this.getView().byId("idMLIEnteredValue").setEnabled(false);
                    this.getView().byId("idMLIOtherCharges").setEnabled(false);
                    this.getView().byId("idMLIRelationship").setEnabled(false);
                    this.getView().byId("idMLIHTSUSRatePct").setEnabled(false);
                    this.getView().byId("idMLIADCVDRatePct").setEnabled(false);
                    this.getView().byId("idMLIIrcRatePct").setEnabled(false);
                    this.getView().byId("idMLIVisaCertificateNumber").setEnabled(false);
                    this.getView().byId("idMLIAgreLicenseNumber").setEnabled(false);
                    this.getView().byId("idMLIDuty").setEnabled(false);
                    this.getView().byId("idMLIIRTax").setEnabled(false);
                    this.getView().byId("idMLIAddButton").setEnabled(false);
                    this.getView().byId("idMLISaveButton").setEnabled(false);
                    this.getView().byId("idMLICancelButton").setEnabled(true);
                    this.getView().byId("idMLIAddButton").setVisible(false);
                    this.getView().byId("idMLISaveButton").setVisible(false);
                }
            },

            validateRequireFields: function()
            {
                let validationPassed = true;
                let errorMsg = this._resourceBundle.getText("errorMsg.RequiredField.CannotBeBlank");
                let requireFields = this.getRequiredFields();
                for (let i = 0; i < requireFields.length; i++)
                {
                    let id = requireFields[i].id;
                    let type = requireFields[i].type;
                    let uiControl = this.getView().byId(id);
                    uiControl.setValueState(sap.ui.core.ValueState.None);
                    uiControl.setValueStateText("");
                    if (type === "Input")
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
                }
                return validationPassed;
            },

            clearValidationErrors: function()
            {
                let requireFields = this.getRequiredFields();
                for (let i = 0; i < requireFields.length; i++)
                {
                    let id = requireFields[i].id;
                    let type = requireFields[i].type;
                    let uiControl = this.getView().byId(id);
                    uiControl.setValueState(sap.ui.core.ValueState.None);
                    uiControl.setValueStateText("");
                }
            },

            getRequiredFields: function()
            {
                let requireFields =
                [
                    {
                        "id": "idMLIDescription",
                        "type": "Input"
                    },
                    {
                        "id": "idMLIHTSUSNumber",
                        "type": "ComboBox"
                    },
                    {
                        "id": "idMLIADCVDNumber",
                        "type": "Input"
                    },
                    {
                        "id": "idMLIGrossWeight",
                        "type": "Input"
                    },
                    {
                        "id": "idMLIManifestQty",
                        "type": "Input"
                    },
                    {
                        "id": "idMLIHTSUSQty",
                        "type": "Input"
                    },
                    {
                        "id": "idMLIEnteredValue",
                        "type": "Input"
                    },
                    {
                        "id": "idMLIOtherCharges",
                        "type": "Input"
                    },
                    {
                        "id": "idMLIRelationship",
                        "type": "Input"
                    },
                    {
                        "id": "idMLIHTSUSRatePct",
                        "type": "Input"
                    },
                    {
                        "id": "idMLIADCVDRatePct",
                        "type": "Input"
                    },
                    {
                        "id": "idMLIIrcRatePct",
                        "type": "Input"
                    },
                    {
                        "id": "idMLIVisaCertificateNumber",
                        "type": "Input"
                    },
                    {
                        "id": "idMLIAgreLicenseNumber",
                        "type": "Input"
                    },
                    {
                        "id": "idMLIDuty",
                        "type": "Input"
                    },
                    {
                        "id": "idMLIIRTax",
                        "type": "Input"
                    }
                ];
                return requireFields;
            }
        });
    }, true);