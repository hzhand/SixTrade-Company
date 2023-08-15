sap.ui.define([], function() {
    "use strict";
    
	return {
		getMissingDocId: function(viewId)
        {
            let missingDocsDO = this.getMissingDocs();
            let arrDocId = missingDocsDO.filter(dataObject => dataObject.ViewId == viewId)
                                        .map(filtered => {
                return filtered.DocId;
            });
            let docId = arrDocId.length > 0 ? arrDocId[0] : "";
            return docId;
        },

        getMissingDocViewId: function(docId)
        {
            let missingDocsDO = this.getMissingDocs();
            let arrViewId = missingDocsDO.filter(dataObject => dataObject.DocId == docId)
                                        .map(filtered => {
                return filtered.ViewId;
            });
            let viewId = arrViewId.length > 0 ? arrViewId[0] : "";
            return viewId;
        },

        getMissingDocName: function(docId)
        {
            let missingDocsDO = this.getMissingDocs();
            let arrDocName = missingDocsDO.filter(dataObject => dataObject.DocId == docId)
                                          .map(filtered => {
                return filtered.DocName;
            });
            let docName = arrDocName.length > 0 ? arrDocName[0] : "";
            return docName;
        },

        getMissingDocs: function()
        {
            let missingDocsDO =
            [
                {
                    "DocId": "01",
                    "ViewId": "idMissingDocCommercialInvoice",
                    "DocName": "Commercial Invoice"
                },
                {
                    "DocId": "10",
                    "ViewId": "idMissingDocCBPForm5523",
                    "DocName": "CBP FORM 5523 (Optional for footwear)"
                },
                {
                    "DocId": "16",
                    "ViewId": "idMissingDocCorrCommInvoice",
                    "DocName": "Corrected Commercial Invoice"
                },
                {
                    "DocId": "17",
                    "ViewId": "idMissingDocOtherAgencyForm",
                    "DocName": "Other Agency Form"
                },
                {
                    "DocId": "19",
                    "ViewId": "idMissingDocScaleWeight",
                    "DocName": "Scale Weight"
                },
                {
                    "DocId": "21",
                    "ViewId": "idMissingDocCoffeeFormO",
                    "DocName": "Coffee Form O"
                },
                {
                    "DocId": "22",
                    "ViewId": "idMissingDocChemicalAnalysis",
                    "DocName": "Chemical Analysis"
                },
                {
                    "DocId": "23",
                    "ViewId": "idMissingDocOutturnReport",
                    "DocName": "Outturn Report"
                },
                {
                    "DocId": "26",
                    "ViewId": "idMissingDocPackingList",
                    "DocName": "Packing List"
                },
                {
                    "DocId": "98",
                    "ViewId": "idMissingDocNotSpecifiedAbove",
                    "DocName": "Not Specified Above"
                },
                {
                    "DocId": "99",
                    "ViewId": "idMissingDocMoreThanTwo",
                    "DocName": "More Than Two"
                }
            ];
            return missingDocsDO;
        },

        getStatusDesc: function(status)
        {
            let statusListDO = this.getStatusList();
            let arrStatusDesc = statusListDO.filter(dataObject => dataObject.Status == status)
                                            .map(filtered => {
                return filtered.StatusDesc;
            });
            let statusDesc = arrStatusDesc.length > 0 ? arrStatusDesc[0] : "";
            return statusDesc;
        },

        getStatusList: function()
        {
            let statusListDO =
            [
                {
                    "Status": "",
                    "StatusDesc": ""
                },
                {
                    "Status": "REQUIREACTION",
                    "StatusDesc": "Action Required"
                },
                {
                    "Status": "RECEIVED",
                    "StatusDesc": "Received"
                },
                {
                    "Status": "REJECTED",
                    "StatusDesc": "Rejected"
                },
                {
                    "Status": "RELEASED",
                    "StatusDesc": "Released"
                },
                {
                    "Status": "SUBMITTED",
                    "StatusDesc": "Submitted"
                },
                {
                    "Status": "UNDERREVIEW",
                    "StatusDesc": "Under Review"
                },
                {
                    "Status": "REQUIREUPDATE",
                    "StatusDesc": "Update Required"
                },
                {
                    "Status": "WIP",
                    "StatusDesc": "Work in Progress"
                }
            ];
            return statusListDO;
        },

        getDecisionDesc: function(decision)
        {
            let decisionListDO = this.getDecisionList();
            let arrDecisionDesc = decisionListDO.filter(dataObject => dataObject.Decision == decision)
                                                .map(filtered => {
                return filtered.DecisionDesc;
            });
            let decisionDesc = arrDecisionDesc.length > 0 ? arrDecisionDesc[0] : "";
            return decisionDesc;
        },

        getDecisionList: function()
        {
            let decisionListDO =
            [
                {
                    "Decision": "REQUIREACTION",
                    "DecisionDesc": "Action Required"
                },
                {
                    "Decision": "RECEIVED",
                    "DecisionDesc": "Received"
                },
                {
                    "Decision": "REJECTED",
                    "DecisionDesc": "Rejected"
                },
                {
                    "Decision": "RELEASED",
                    "DecisionDesc": "Released"
                },
                {
                    "Decision": "REQUIREUPDATE",
                    "DecisionDesc": "Update Required"
                }
            ];
            return decisionListDO;
        },

        getRelationshipList: function()
        {
            let relationshipListDO =
            [
                {
                    "Code": "Y",
                    "Desc": "Related"
                },
                {
                    "Code": "N",
                    "Desc": "Not Related"
                }
            ];
            return relationshipListDO;
        }
	};
});