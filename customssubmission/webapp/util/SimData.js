sap.ui.define([], function() {
    "use strict";
    
	return {
		pullDataFromExternalSystemVWDO: function()
		{
			let submissionVWDO =
            {
                "Id": "<NEW>",
                "Status": "WIP",
                "StatusDesc": "Work in Progress",
                "SubmissionData" :
                {
                    "EntryType": "31",
                    "SummaryDate": "",
                    "SuretyNumber": "999",
                    "BondType": "9",
                    "PortDistrict": "04",
                    "PortCode": "03",
                    "EntryDate": "",
                    "ImportCarrier": "3011",
                    "TransportMode": "11",
                    "CountryOfOrigin": "DE",
                    "ImportDate": "",
                    "BLAWBNumber": "BL-1021",
                    "ManufacturerId": "BF-301-D",
                    "ExportingCountry": "DE",
                    "ExportDate": "",
                    "ITNumber": "FE-330122",
                    "ITDate": "",
                    "ForeignPortOfLaiding": "Hamburg",
                    "USPortOfLaiding": "0403",
                    "GoodsLocation": "GO-302293",
                    "MissingDocCommercialInvoice": false,
                    "MissingDocCBPForm5523": false,
                    "MissingDocCorrectedCommercialInvoice": false,
                    "MissingDocOtherAgencyForm": true,
                    "MissingDocScaleWeight": false,
                    "MissingDocCoffeeFormO": false,
                    "MissingDocChemicalAnalysis": false,
                    "MissingDocOutturnReport": false,
                    "MissingDocPackingList": false,
                    "MissingDocNotSpecifiedAbove": false,
                    "MissingDocMoreThanTwo": false,
                    "CosingneeNumber": "BB02912",
                    "CosigneeLName": "Smith",
                    "CosigneeFName": "John",
                    "CosigneeMIName": "R.",
                    "CosigneeAddrStreet": "321 Dalton Street",
                    "CosigneeAddrCity": "Toledo",
                    "CosigneeAddrStateCd": "OH",
                    "CosigneeAddrZip": "33223",
                    "ImporterNumber": "B76-0201",
                    "ReferenceNumber": "RN-9038",
                    "ImporterLName": "Doe",
                    "ImporterFName": "Jean",
                    "ImporterMIName": "C.",
                    "ImporterAddrStreet": "4051 Richmond Rd.",
                    "ImporterAddrCity": "Toledo",
                    "ImporterAddrStateCd": "OH",
                    "ImporterAddrZip": "33452",
                    "OtherFeesSummary": "Endorsing: 12.00",
                    "TotalEnteredValue": "39000.00",
                    "TotalOtherFees": "18.00",
                    "TotalDuty": "450.00",
                    "TotalTax": "0.00",
                    "TotalOtherFee": "12.00",
                    "Total": "39450.00",
                    "DeclarentLName": "Smith",
                    "DeclarentFName": "John",
                    "DeclarentMIName": "R.",
                    "DeclarentTitle": "Owner",
                    "DeclaredDate": "",
                    "BrokerFilerLName": "Powell",
                    "BrokerFilerFName": "Tom",
                    "BrokerFilerMIName": "W.",
                    "BrokerFilerPhone": "6502234344",
                    "BrokerFilerNumner1": "BF01921",
                    "BrokerFilerNumner2": "IFN69920",
                    "Items":
                    [
                        {
                            "LineNumber": "1",
                            "MerchantDesc": "Acetic Acid",
                            "HTSUSNumber": "29152100",
                            "ADDCVNumber": "101",
                            "GrossWeight": "2.0",
                            "ManifestQty": "2.0",
                            "HTSUSQty": "2.0",
                            "EnteredValue": "39000.00",
                            "OtherCharges": "39000.00",
                            "Relationship": "N",
                            "HTSUSRatePct": "1.20",
                            "ADCVDRatePct": "0.00",
                            "IrcRatePct": "0.00",
                            "VisaCertificateNumber": "4343562833492938",
                            "AgreLicenseNumber": "ALK091",
                            "Duty": "450.00",
                            "IRTax": "0.00"
                        }
                    ]
                }
            };
			return submissionVWDO;
        }
	};
});