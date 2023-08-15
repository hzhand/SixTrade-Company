sap.ui.define([
],

function()
{
    "use strict";

    return {
        getBaseURL: function()
        {
            return sap.ui.getCore().getModel("AppEnv").BaseURL;
        },

        getNameSpace: function()
        {
            return this.getBaseURL();
        },

        getDestinationAppService: function()
        {
            let destination = "/SubmissionService"
            return destination;
        },

        getRequestHeader: function()
        {
            let contentType = "application/json";
            let reqHeader = {"Content-Type":contentType};
			return reqHeader;
        },

        apiServiceGet: function(servicePath)
        {
            let reqHeader = this.getRequestHeader();
            let reqPath = this.getNameSpace() + this.getDestinationAppService();
            let jsonModel = new sap.ui.model.json.JSONModel();
            jsonModel.loadData(reqPath + servicePath,
                               null, false, "GET", false, null, reqHeader);
            let dataDO = jsonModel.getData();
            return dataDO;
        },

        apiServiceOperation: function(servicePath, payloadDO, operation)
        {
            let statusCode = 200;
            let messageText = "";
            let payloadJSON = JSON.stringify(payloadDO);
            let reqHeader = this.getRequestHeader();
            let reqPath = this.getNameSpace() + this.getDestinationAppService();
            let jsonModel = new sap.ui.model.json.JSONModel();
            jsonModel.attachRequestCompleted(function(responseObj) {
                let errorObj = responseObj.getParameter("errorobject");
                if (errorObj.statusCode !== 200)
                {
                    statusCode = errorObj.statusCode;
                    messageText = errorObj.responseText;
                }
            });
            jsonModel.loadData(reqPath + servicePath,
                               payloadJSON, false, operation, false, null, reqHeader);
        //  let dataDO = jsonModel.getData();
            let dataDO =
            {
                "StatusCode": statusCode,
                "Message": messageText
            };
            return dataDO;
        },

        apiServicePost: function(servicePath, payloadDO)
        {
            return this.apiServiceOperation(servicePath, payloadDO, "POST");
        },

        apiServicePut: function(servicePath, payloadDO)
        {
            return this.apiServiceOperation(servicePath, payloadDO, "PUT");
        },

    //	==================== APIs ====================
        newEntryNumber: function()
        {
            return this.apiServiceGet("/newentrynumber");
        },

        loadEntryType: function()
        {
            return this.apiServiceGet("/referencedata/entry_type");
        },

        loadSuretyNumber: function()
        {
            return this.apiServiceGet("/referencedata/surety");
        },

        loadBondType: function()
        {
            return this.apiServiceGet("/referencedata/bond_type");
        },

        loadPortDistrict: function()
        {
            return this.apiServiceGet("/referencedata/port_district");
        },

        loadPortCode: function()
        {
            return this.apiServiceGet("/referencedata/port");
        },

        loadImportingCarrier: function()
        {
            return this.apiServiceGet("/referencedata/import_carrier");
        },

        loadTransportMode: function()
        {
            return this.apiServiceGet("/referencedata/transport_mode");
        },

        loadCountry: function()
        {
            return this.apiServiceGet("/referencedata/country");
        },

        loadCanadaProvince: function()
        {
            return this.apiServiceGet("/referencedata/canada_province");
        },

        loadDocumentList: function()
        {
            return this.apiServiceGet("/referencedata/document_list");
        },

        loadStateProvice: function()
        {
            return this.apiServiceGet("/referencedata/state_province");
        },

        loadProductHTS: function()
        {
            return this.apiServiceGet("/referencedata/product_hts");
        },

        saveSubmission: function(payloadDO)
        {
            return this.apiServicePost("/wipsubmission", payloadDO);
        },

        submitSubmission: function(payloadDO)
        {
            return this.apiServicePost("/submission", payloadDO);
        },

        updateSubmission: function(payloadDO)
        {
            return this.apiServicePut("/submission", payloadDO);
        },

        querySubmissions: function(queryParamDO)
        {
            let entryNumber = queryParamDO.EntryNumber;
            let status = queryParamDO.Status;
            let type = queryParamDO.Type;
            let fromDate = queryParamDO.FromDate;
            let toDate = queryParamDO.ToDate;
            let queryParams = "?"
            if (entryNumber !== "")
            {
                if (queryParams.length > 1)
                {
                    queryParams = queryParams + "&";
                }
                queryParams = queryParams + "id=" + encodeURIComponent(entryNumber);
            }
            if (status !== "")
            {
                if (queryParams.length > 1)
                {
                    queryParams = queryParams + "&";
                }
                queryParams = queryParams + "status=" + encodeURIComponent(status);
            }
            if (type !== "")
            {
                if (queryParams.length > 1)
                {
                    queryParams = queryParams + "&";
                }
                queryParams = queryParams + "type=" + encodeURIComponent(type);
            }
            if (fromDate != 0)
            {
                if (queryParams.length > 1)
                {
                    queryParams = queryParams + "&";
                }
                queryParams = queryParams + "fromtime=" + encodeURIComponent(fromDate.toFixed(0));
            }
            if (toDate != 0)
            {
                if (queryParams.length > 1)
                {
                    queryParams = queryParams + "&";
                }
                queryParams = queryParams + "totime=" + encodeURIComponent(toDate.toFixed(0));
            }
            return this.apiServiceGet("/submissions" + queryParams);
        },

        getSubmission: function(id)
        {
            return this.apiServiceGet("/submission" + "/" + id);
        },

        getWorklistItems: function(numberOfItems)
        {
            return this.apiServiceGet("/worklistitems" + "/" + numberOfItems);
        },

        getSubmissionCounts: function()
        {
            return this.apiServiceGet("/submissioncounts");
        },
        
        getTDXOnlineStatus: function()
        {
            return this.apiServiceGet("/tdxamberonlinestatus");
        }
    };
});