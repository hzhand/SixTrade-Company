sap.ui.define([], function() {
    "use strict";
    
	return {
		newSubmissionVWDO: function()
		{
			let submissionVWDO =
            {
                "Id": "",
                "Status": "WIP",
                "StatusDesc": "Work in Progress",
                "SubmissionData" :
                {
                    "EntryType": "",
                    "SummaryDate": "",
                    "SuretyNumber": "",
                    "BondType": "",
                    "PortDistrict": "",
                    "PortCode": "",
                    "EntryDate": "",
                    "ImportCarrier": "",
                    "TransportMode": "",
                    "CountryOfOrigin": "",
                    "ImportDate": "",
                    "BLAWBNumber": "",
                    "ManufacturerId": "",
                    "ExportingCountry": "",
                    "ExportDate": "",
                    "ITNumber": "",
                    "ITDate": "",
                    "ForeignPortOfLaiding": "",
                    "USPortOfLaiding": "",
                    "GoodsLocation": "",
                    "MissingDocCommercialInvoice": false,
                    "MissingDocCBPForm5523": false,
                    "MissingDocCorrectedCommercialInvoice": false,
                    "MissingDocOtherAgencyForm": false,
                    "MissingDocScaleWeight": false,
                    "MissingDocCoffeeFormO": false,
                    "MissingDocChemicalAnalysis": false,
                    "MissingDocOutturnReport": false,
                    "MissingDocPackingList": false,
                    "MissingDocNotSpecifiedAbove": false,
                    "MissingDocMoreThanTwo": false,
                    "CosingneeNumber": "",
                    "CosigneeLName": "",
                    "CosigneeFName": "",
                    "CosigneeMIName": "",
                    "CosigneeAddrStreet": "",
                    "CosigneeAddrCity": "",
                    "CosigneeAddrStateCd": "",
                    "CosigneeAddrZip": "",
                    "ImporterNumber": "",
                    "ReferenceNumber": "",
                    "ImporterLName": "",
                    "ImporterFName": "",
                    "ImporterMIName": "",
                    "ImporterAddrStreet": "",
                    "ImporterAddrCity": "",
                    "ImporterAddrStateCd": "",
                    "ImporterAddrZip": "",
                    "OtherFeesSummary": "",
                    "TotalEnteredValue": "0",
                    "TotalOtherFees": "0",
                    "TotalDuty": "0",
                    "TotalTax": "0",
                    "TotalOtherFee": "0",
                    "Total": "0",
                    "DeclarentLName": "",
                    "DeclarentFName": "",
                    "DeclarentMIName": "",
                    "DeclarentTitle": "",
                    "DeclaredDate": "",
                    "BrokerFilerLName": "",
                    "BrokerFilerFName": "",
                    "BrokerFilerMIName": "",
                    "BrokerFilerPhone": "",
                    "BrokerFilerNumner1": "",
                    "BrokerFilerNumner2": "",
                    "Items": []
                }
            };
			return submissionVWDO;
        },

        newMechandiseLineItemVWDO: function()
		{
            let mechandiseLineItemVWDO =
            {
                "LineNumber": "",
                "MerchantDesc": "",
                "HTSUSNumber": "",
                "ADDCVNumber": "",
                "GrossWeight": "0",
                "ManifestQty": "0",
                "HTSUSQty": "0",
                "EnteredValue": "0",
                "OtherCharges": "0",
                "Relationship": "",
                "HTSUSRatePct": "0",
                "ADCVDRatePct": "0",
                "IrcRatePct": "0",
                "VisaCertificateNumber": "",
                "AgreLicenseNumber": "",
                "Duty": "0",
                "IRTax": "0"
            };
            return mechandiseLineItemVWDO;
        },

        newResponseListVWDO: function()
        {
            let responseListVMDO =
            {
                "AuthNumber": "",
                "ResponseMsg": "",
                "ResponseData": ""
            };
            return responseListVMDO
        },

        newResponseHistoryVMDO: function()
        {
            let responseHistoryVMDO = 
            {
                "Id": "",
                "Status": "",
                "StatusDesc": "",
                "Responses": []
            };
            return responseHistoryVMDO;
        },

        newResponseHistoryItemVMDO: function()
        {
            let responseVMDO = 
            {
                "Id": "",
                "Decision": "",
                "DecisionDesc": "",
                "ResponseDate": 0,
                "ResponseDateFormatted": "",
                "ResponseData": ""
            };
            return responseVMDO;
        },

        newDashboardTileMySubmissionItemVWDO: function()
        {
            let dashboardTileMySubmissionItemVWDO =
            {
                "IconImage": "",
                "IconColor": "",
                "Id": "",
                "FilingDate": "",
                "Status": "",
                "StatusDesc": "",
                "StatusState": ""
            };
            return dashboardTileMySubmissionItemVWDO;
        },

        newSubmissionPayloadDO: function()
        {
            let submissionPayloadDO =
            {
                "Id": "",
                "ToAuthority": "AUTH",
                "Type": "DECL",
                "Status": "",
                "SubmissionData" :
                {
                    "EntryType": "",
                    "SummaryDate": "",
                    "SuretyNumber": "",
                    "BondType": "",
                    "PortCode": "",
                    "EntryDate": "",
                    "ImportCarrier": "",
                    "TransportMode": "",
                    "CountryOfOrigin": "",
                    "ImportDate": "",
                    "BLAWBNumber": "",
                    "ManufacturerId": "",
                    "ExportingCountry": "",
                    "ExportDate": "",
                    "ITNumber": "",
                    "ITDate": "",
                    "MissingDocs": "",
                    "ForeignPortOfLaiding": "",
                    "USPortOfLaiding": "",
                    "GoodsLocation": "",
                    "CosingneeNumber": "",
                    "CosigneeLName": "",
                    "CosigneeFName": "",
                    "CosigneeMIName": "",
                    "CosigneeAddrStreet": "",
                    "CosigneeAddrCity": "",
                    "CosigneeAddrStateCd": "",
                    "CosigneeAddrZip": "",
                    "ImporterNumber": "",
                    "ReferenceNumber": "",
                    "ImporterLName": "",
                    "ImporterFName": "",
                    "ImporterMIName": "",
                    "ImporterAddrStreet": "",
                    "ImporterAddrCity": "",
                    "ImporterAddrStateCd": "",
                    "ImporterAddrZip": "",
                    "TotalEnteredValue": "",
                    "TotalOtherFees": "",
                    "OtherFeesSummary": "",
                    "TotalDuty": "",
                    "TotalTax": "",
                    "TotalOtherFee": "",
                    "Total": "",
                    "DeclarentFName": "",
                    "DeclarentLName": "",
                    "DeclarentMIName": "",
                    "DeclarentTitle": "",
                    "DeclaredDate": "",
                    "BrokerFilerFName": "",
                    "BrokerFilerLName": "",
                    "BrokerFilerMIName": "",
                    "BrokerFilerPhone": "",
                    "BrokerFilerNumner1": "",
                    "BrokerFilerNumner2": "",
                    "Items": []
                }
            };
			return submissionPayloadDO;
        },

        newMechandiseLineItemPayloadDO: function()
		{
            let mechandiseLineItemPayloadDO =
            {
                "LineNumber": "",
                "MerchantDesc": "",
                "HTSUSNumber": "",
                "ADDCVNumber": "",
                "GrossWeight": "",
                "ManifestQty": "",
                "HTSUSQty": "",
                "EnteredValue": "",
                "OtherCharges": "",
                "Relationship": "",
                "HTSUSRatePct": "",
                "ADCVDRatePct": "",
                "IrcRatePct": "",
                "VisaCertificateNumber": "",
                "AgreLicenseNumber": "",
                "Duty": "",
                "IRTax": ""
            };
            return mechandiseLineItemPayloadDO;
        },
        
        newTDXOnlineStatusVMDO: function()
        {
            let tdxOnlineStatusVMDO =
            {
                "OnlineStatus": false,
                "StatusImageFileName": "",
                "StatusTooltip": ""
            };
            return tdxOnlineStatusVMDO
        }
	};
});