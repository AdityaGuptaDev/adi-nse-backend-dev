import express from "express";

import prosesjwt from "proses-jwt";
import {
    serverError
} from "proses-response";
let { tokenMiddleWare, generateToken } = prosesjwt;

import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import {
    MFUCanFillEezzService, ApiFinTechBankValidationService, ApiFinTechFetchUtrn, ApiFinTechCanFetchService,
    ApiFinTechCanFolioValService, ApiFinTechCanValidationService, ApiFinTechInvConsentEntryService, ApiFinTechInvConsentViewService,
    ApiFinTechNormalTxnService, ApiFinTechPRNValidationService, ApiFinTechSwpPayEezService, ApiFinTechSystCancellationService,
    ApiFinTechSystematicTxnService, ApiFinTechTxnApprovalService, ApiFinTechTxnAuthDetService, ApiFinTechTxnHistoryService, generateReference,
    MfUtilityApiLogin, APIePayEezzService,
    APIUploadServerImageService,
    getMandates,
    updateMandates,
    APIEPayEezzStatusService,
    getInvestorPortfolio



} from "../../services/mfu.service";

import { searchByAmcId, searchByCan, searchByCanIdmfuBankDetails, searchByCanIdMfuFolioDtl, viewCanDetails, searchByCanPayEzz, portfolioValuationData, portfolioSearch, searchByISIN, getFoliosByPanAndScheme, investorSearch, searchMorningstarFundByName, getBankByFolio, getSchemeByName } from "../../services/mfu.scheme.service";
import path from "path";
import { createTransaction, transactionCallback } from "../../services/mfu.transaction.service";
import db from "../../db/core/control-db";
import { apiRequest } from "../../services/apirequest.service";

const router = express.Router();

//payezz api added by aditya


router.get('/searchByCanPayEzz/:can_id', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const { can_id } = req.params;
        const results = await searchByCanPayEzz(can_id);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            // message: Found ${results.length} records for ISIN: ${pri_isin}
        }, "viewCanDetails");
    } catch (error) {
        ErrorLogger.write({ type: "viewCanDetails error :- ", error });
        serverError(res, error);
    }
});



//can master details devopled by Aditya Gupta

router.get('/amc/:amc_id', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const { amc_id } = req.params;

        const results = await searchByAmcId(amc_id);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            // message: Found ${results.length} records for ISIN: ${pri_isin}
        }, "searchByISIN");
    } catch (error) {
        ErrorLogger.write({ type: "searchByAmcId error :- ", error });
        serverError(res, error);
    }
});

//can master details devopled by Aditya Gupta

router.get('/can/:can_id', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const { can_id } = req.params;
        console.log("inside the searchByCan");

        const results = await searchByCan(can_id);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            // message: Found ${results.length} records for ISIN: ${pri_isin}
        }, "searchByCan");
    } catch (error) {
        ErrorLogger.write({ type: "searchByCan error :- ", error });
        serverError(res, error);
    }
});

//can bank detail table name-testing_mfu_bank_details
router.get('/mfuBankDetails/:can_id', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const { can_id } = req.params;

        const results = await searchByCanIdmfuBankDetails(can_id);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            // message: Found ${results.length} records for ISIN: ${pri_isin}
        }, "searchByCanIdmfuBankDetails");
    } catch (error) {
        ErrorLogger.write({ type: "searchByAmcId error :- ", error });
        serverError(res, error);
    }
});



//can bank detail table name-testing_mfu_bank_details
router.get('/searchByCanIdMfuFolioDtl/:can_id', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const { can_id } = req.params;

        const results = await searchByCanIdMfuFolioDtl(can_id);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            // message: Found ${results.length} records for ISIN: ${pri_isin}
        }, "searchByCanIdMfuFolioDtl");
    } catch (error) {
        ErrorLogger.write({ type: "searchByCanIdMfuFolioDtl error :- ", error });
        serverError(res, error);
    }
});


//can all data from the joining concept 
router.get('/viewCanDetails/:can_id', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const { can_id } = req.params;
        const results = await viewCanDetails(can_id);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            // message: Found ${results.length} records for ISIN: ${pri_isin}
        }, "viewCanDetails");
    } catch (error) {
        ErrorLogger.write({ type: "viewCanDetails error :- ", error });
        serverError(res, error);
    }
});


router.get('/isin/:pri_isin', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const { pri_isin } = req.params;

        const results = await searchByISIN(pri_isin);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            message: `Found ${results.length} records for ISIN: ${pri_isin}`
        }, "searchByISIN");
    } catch (error) {
        ErrorLogger.write({ type: "searchByISIN error :- ", error });
        serverError(res, error);
    }
});


router.get('/isin/:pri_isin', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const { pri_isin } = req.params;

        const results = await searchByISIN(pri_isin);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            message: `Found ${results.length} records for ISIN: ${pri_isin}`
        }, "searchByISIN");
    } catch (error) {
        ErrorLogger.write({ type: "searchByISIN error :- ", error });
        serverError(res, error);
    }
});


router.post('/morningstar', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;

        const results = await searchMorningstarFundByName(body.fundname);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            message: `Found ${results.length} records for ms_fullname: ${body.fundname}`
        }, "searchByFundName");
    } catch (error) {
        ErrorLogger.write({ type: "searchByFundName error :- ", error });
        serverError(res, error);
    }
});



router.get("/generate-reference", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const date = body?.date ? new Date(body.date) : new Date();
        const reference = await generateReference(date);

        sendEncryptedResponse(res, { reference }, "generateReference");

    } catch (error) {
        ErrorLogger.write({ type: "generateReference error :- ", error });
        serverError(res, error);
    }
});


//Create CAN

router.post("/can-register", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers
        let response: any = await MFUCanFillEezzService(body);
        sendEncryptedResponse(res, response, "MFUCanFillEezzService");
    } catch (error) {
        ErrorLogger.write({ type: "can MFUCanFillEezzService error :- ", error });
        serverError(res, error);
    }
});


router.post("/can-bank-validation", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;

        let response: any = await ApiFinTechBankValidationService(body);

        sendEncryptedResponse(res, response, "ApiFinTechBankValidationService ");
    } catch (error) {
        ErrorLogger.write({ type: "Bank ApiFinTechBankValidationService error", error });
        serverError(res, error);
    }
});

router.post("/can-fetch", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;

        let response: any = await ApiFinTechCanFetchService(body);

        sendEncryptedResponse(res, response, "ApiFinTechCanFetchService");
    } catch (error) {
        ErrorLogger.write({ type: "fetch ApiFinTechCanFetchService error", error });
        serverError(res, error);
    }
});

router.post("/can-folio-validation", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;

        let response: any = await ApiFinTechCanFolioValService(body);

        sendEncryptedResponse(res, response, "ApiFinTechCanFolioValService");
    } catch (error) {
        ErrorLogger.write({ type: "fetch ApiFinTechCanFolioValService error", error });
        serverError(res, error);
    }
});

router.post("/can-validation", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;

        let response: any = await ApiFinTechCanValidationService(body);

        sendEncryptedResponse(res, response, "ApiFinTechCanValidationService");
    } catch (error) {
        ErrorLogger.write({ type: "fetch ApiFinTechCanValidationService error", error });
        serverError(res, error);
    }
});



router.post("/fetch-utrn", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;

        let response: any = await ApiFinTechFetchUtrn(body);

        sendEncryptedResponse(res, response, "ApiFinTechFetchUtrn");
    } catch (error) {
        ErrorLogger.write({ type: "fetch ApiFinTechFetchUtrn error", error });
        serverError(res, error);
    }
});

router.post("/inv-con-view", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;

        let response: any = await ApiFinTechInvConsentViewService(body);

        sendEncryptedResponse(res, response, "ApiFinTechInvConsentViewService");
    } catch (error) {
        ErrorLogger.write({ type: "fetch ApiFinTechInvConsentViewService error", error });
        serverError(res, error);
    }
});

router.post("/prn-validation", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;

        let response: any = await ApiFinTechPRNValidationService(body);

        sendEncryptedResponse(res, response, "ApiFinTechPRNValidationService");
    } catch (error) {
        ErrorLogger.write({ type: "fetch ApiFinTechPRNValidationService error", error });
        serverError(res, error);
    }
});

router.post("/txn-auth-details", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;

        let response: any = await ApiFinTechTxnAuthDetService(body);

        sendEncryptedResponse(res, response, "ApiFinTechTxnAuthDetService");
    } catch (error) {
        ErrorLogger.write({ type: "fetch ApiFinTechTxnAuthDetService error", error });
        serverError(res, error);
    }
});

router.post("/txn-history", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;

        let response: any = await ApiFinTechTxnHistoryService(body);

        sendEncryptedResponse(res, response, "ApiFinTechTxnHistoryService");
    } catch (error) {
        ErrorLogger.write({ type: "fetch ApiFinTechTxnHistoryService error", error });
        serverError(res, error);
    }
});

router.post("/txn-normal", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        //console.log(body)
        let response: any = await ApiFinTechNormalTxnService(body?.transaction);

        console.log("Transaction Response :- ", response?.respHeader?.respFlag, response?.respHeader?.errorCode);

        //const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        //console.log('Client IP:', ip);
        if (
            response?.respHeader?.respFlag === "S" &&
            !response?.respHeader?.errorCode
        ) {
            await createTransaction(body.transaction, body?.investor_id, body?.isin);
        }
        //await createTransaction(body.transaction, body?.investor_id, body?.isin);

        sendEncryptedResponse(res, response, "ApiFinTechNormalTxnService");
    } catch (error) {
        ErrorLogger.write({ type: "fetch ApiFinTechNormalTxnService error", error });
        serverError(res, error);

    }
});

router.post("/txn-systematic", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;

        let response: any = await ApiFinTechSystematicTxnService(body?.transaction);

        if (
            response?.respHeader?.respFlag === "S" &&
            !response?.respHeader?.errorCode
        ) {
            await createTransaction(body.transaction, body?.investor_id, body?.isin);
        }

        //await createTransaction(body.transaction, body?.investor_id, body?.isin);
        sendEncryptedResponse(res, response, "ApiFinTechSystematicTxnService");
        // sendEncryptedResponse(res,  response, "Can onboarding");
    } catch (error) {
        ErrorLogger.write({ type: "fetch ApiFinTechSystematicTxnService error", error });
        serverError(res, error);
    }
});





router.post("/txn-approval", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;


        let response: any = await ApiFinTechTxnApprovalService(body);

        sendEncryptedResponse(res, response, "ApiFinTechTxnApprovalService");
        // sendEncryptedResponse(res,  response, "Can onboarding");
    } catch (error) {
        ErrorLogger.write({ type: "fetch ApiFinTechTxnApprovalService error", error });
        serverError(res, error);
    }
});




router.post("/syst-cancellation", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;

        let response: any = await ApiFinTechSystCancellationService(body);

        sendEncryptedResponse(res, response, "ApiFinTechSystCancellationService");
        // sendEncryptedResponse(res,  response, "Can onboarding");
    } catch (error) {
        ErrorLogger.write({ type: "fetch ApiFinTechSystCancellationService error", error });
        serverError(res, error);
    }
});
router.post("/wppay-eez", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        let response: any = await ApiFinTechSwpPayEezService(body);

        sendEncryptedResponse(res, response, "ApiFinTechSwpPayEezService");
    } catch (error) {
        ErrorLogger.write({ type: "fetch ApiFinTechSwpPayEezService error", error });
        serverError(res, error);
    }
});

router.post("/inv-concent", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;

        let response: any = await ApiFinTechInvConsentEntryService(body);

        sendEncryptedResponse(res, response, "ApiFinTechInvConsentEntryService");
        // sendEncryptedResponse(res,  response, "Can onboarding");
    } catch (error) {
        ErrorLogger.write({ type: "fetch ApiFinTechInvConsentEntryService error", error });
        serverError(res, error);
    }
});


//can master details devopled by Aditya Gupta

router.get('/amc/:amc_id', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const { amc_id } = req.params;

        const results = await searchByAmcId(amc_id);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            // message: Found ${results.length} records for ISIN: ${pri_isin}
        }, "searchByISIN");
    } catch (error) {
        ErrorLogger.write({ type: "searchByAmcId error :- ", error });
        serverError(res, error);
    }
});

//can master details devopled by Aditya Gupta

router.get('/can/:can_id', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const { can_id } = req.params;
        console.log("inside the searchByCan");

        const results = await searchByCan(can_id);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            // message: Found ${results.length} records for ISIN: ${pri_isin}
        }, "searchByISIN");
    } catch (error) {
        ErrorLogger.write({ type: "searchByCan error :- ", error });
        serverError(res, error);
    }
});

//can bank detail table name-testing_mfu_bank_details
router.get('/mfuBankDetails/:can_id', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const { can_id } = req.params;

        const results = await searchByCanIdmfuBankDetails(can_id);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            // message: Found ${results.length} records for ISIN: ${pri_isin}
        }, "searchByCanIdmfuBankDetails");
    } catch (error) {
        ErrorLogger.write({ type: "searchByAmcId error :- ", error });
        serverError(res, error);
    }
});




//can bank detail table name-testing_mfu_bank_details
router.get('/searchByCanIdMfuFolioDtl/:can_id', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const { can_id } = req.params;

        const results = await searchByCanIdMfuFolioDtl(can_id);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            // message: Found ${results.length} records for ISIN: ${pri_isin}
        }, "searchByCanIdMfuFolioDtl");
    } catch (error) {
        ErrorLogger.write({ type: "searchByCanIdMfuFolioDtl error :- ", error });
        serverError(res, error);
    }
});



//can all data from the joining concept 
router.get('/viewCanDetails/:can_id', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const { can_id } = req.params;
        const results = await viewCanDetails(can_id);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            // message: Found ${results.length} records for ISIN: ${pri_isin}
        }, "viewCanDetails");
    } catch (error) {
        ErrorLogger.write({ type: "viewCanDetails error :- ", error });
        serverError(res, error);
    }
});

//payezz api -Aditya Gupta - 09-07-2025
router.get('/searchByCanPayEzz/:can_id', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const { can_id } = req.params;
        const results = await searchByCanPayEzz(can_id);

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            // message: Found ${results.length} records for ISIN: ${pri_isin}
        }, "viewCanDetails");
    } catch (error) {
        ErrorLogger.write({ type: "viewCanDetails error :- ", error });
        serverError(res, error);
    }
});



//payezz api -Aditya Gupta - 09-07-2025
router.get('/portfolioValuationData', tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const header = req.headers;
        const results = await portfolioValuationData();

        sendEncryptedResponse(res, {
            data: results,
            count: results.length,
            // message: Found ${results.length} records for ISIN: ${pri_isin}
        }, "viewCanDetails");
    } catch (error) {
        ErrorLogger.write({ type: "viewCanDetails error :- ", error });
        serverError(res, error);
    }
});

router.post('/portfolio/search', tokenMiddleWare, async (req, res) => {
    try {
        const { pan, folio_no, scheme } = req.body;

        const results = await portfolioSearch({ pan, folio_no, scheme });

        sendEncryptedResponse(res, {
            data: results,
            count: Array.isArray(results) ? results.length : (results ? 1 : 0),
        }, "viewPortfolioBySearch");

    } catch (error) {
        ErrorLogger.write({ type: "viewPortfolioBySearch error :- ", error });
        serverError(res, error);
    }
});


router.post('/investor/search', tokenMiddleWare, async (req, res) => {
    try {
        const { pan, folio_no, scheme } = req.body;
        const results = await investorSearch({ pan, folio_no, scheme });

        sendEncryptedResponse(res, {
            data: results,
            count: Array.isArray(results) ? results.length : (results ? 1 : 0),
        }, "viewPortfolioBySearch");

    } catch (error) {
        ErrorLogger.write({ type: "view Investor error :- ", error });
        serverError(res, error);
    }
});

//for mandate registration
router.get('/MfUtilityApiLogin', tokenMiddleWare, async (req, res) => {
    try {

        const results = await MfUtilityApiLogin();
        sendEncryptedResponse(res, {
            data: results,
            count: Array.isArray(results) ? results.length : (results ? 1 : 0),
        }, "viewPortfolioBySearch");

    } catch (error) {
        ErrorLogger.write({ type: "viewPortfgi olioBySearch error :- ", error });
        serverError(res, error);
    }
});

router.get('/APIePayEezzService', tokenMiddleWare, async (req, res) => {
    try {

        console.log("Request Body :- ", req.query)
        const results = await APIePayEezzService(req.query);

        sendEncryptedResponse(res, {
            data: results,
            count: Array.isArray(results) ? results.length : (results ? 1 : 0),
        }, "APIePayEezzService");

    } catch (error) {
        ErrorLogger.write({ type: "APIePayEezzService error :- ", error });
        serverError(res, error);
    }
});


router.get('/APIEPayEezzStatusService', tokenMiddleWare, async (req, res) => {
    try {

        console.log("Request Body :- ", req.query)
        const results = await APIEPayEezzStatusService(req.query);

        sendEncryptedResponse(res, {
            data: results,
            count: Array.isArray(results) ? results.length : (results ? 1 : 0),
        }, "APIEPayEezzStatusService");

    } catch (error) {
        ErrorLogger.write({ type: "APIEPayEezzStatusService error :- ", error });
        serverError(res, error);
    }
});

router.get('/mandates', tokenMiddleWare, async (req, res) => {
    try {
        const filters = req.query; // e.g. ?investor_id=123&can_id=ABC
        const results = await getMandates(filters);
        sendEncryptedResponse(res, {
            data: results,
            count: Array.isArray(results) ? results.length : (results ? 1 : 0),
        }, "mandates");
    } catch (error) {
        ErrorLogger.write({ type: "viewPortfgi olioBySearch error :- ", error });
        serverError(res, error);
    }
});

router.post('/mandates', tokenMiddleWare, async (req, res) => {
    try {
        const filters = req.body; // e.g. { investor_id: 123, can_id: 'ABC' }
        const results = await getMandates(filters);
        sendEncryptedResponse(res, {
            data: results,
            count: Array.isArray(results) ? results.length : (results ? 1 : 0),
        }, "mandates");
    } catch (error) {
        ErrorLogger.write({ type: "viewPortfgi olioBySearch error :- ", error });
        serverError(res, error);
    }
});

router.post("/update-mandates", tokenMiddleWare, async (req, res) => {
    try {
        const body = req.body;
        const id = req.query.id;

        console.log("Updating mandate with ID:", id, "and body:", body);

        let response: any = await updateMandates(id, body);

        sendEncryptedResponse(res, response, "update-mandates");
    } catch (error) {
        ErrorLogger.write({ type: "update-mandates error :- ", error });
        serverError(res, error);
    }
});


//written by @Aditya Gupta
//bank details can modification 
router.post("/can-modification-bank", tokenMiddleWare, async (req, res) => {

    try {
        const body = req.body;
        const header = req.headers


        let response: any = await MFUCanFillEezzService(body);

        sendEncryptedResponse(res, response, "MFUCanFillEezzService");
    } catch (error) {
        ErrorLogger.write({ type: "can MFUCanFillEezzService error :- ", error });
        serverError(res, error);
    }
});

//code written by Aditya Gupta


router.post("/SendServerImage", tokenMiddleWare, async (req, res) => {
    try {
        // const fileName = req.query.file as string;
        const filepath = path.join(__dirname, '..', '..', '..', 'src')
        const imagePath = path.join(filepath, 'public', 'chequeDoc', '1753789484189-Screenshot (1).png');
        // Resolve absolute path to file

        console.log("Directory Name :=", imagePath);


        console.log("Uploading file:", imagePath);

        const result = await APIUploadServerImageService({
            param1: "VEDANTECUAT",
            param2: "NWbbHpz1kHpDjBBCHV8z7A==",
            param3: "40008I",
            param4: "ECAN",
            param5: "AD",
            param6: "32195FF003",
            param8: "1#PC",
            imagePath: imagePath,
        });

        sendEncryptedResponse(res, { data: result, count: 1 }, "SendServerImage");
    } catch (error) {
        ErrorLogger.write({ type: "SendServerImage error :- ", error });
        serverError(res, error);
    }
});

router.post("/transaction/callback", tokenMiddleWare, async (req, res) => {
    const transactionData = req.body;

    const response = await transactionCallback(transactionData)
    sendEncryptedResponse(res, { data: response }, "Transaction Callback");
    console.log("Transaction callback received:", transactionData);
})

router.get('/investor-portfolio', tokenMiddleWare, async (req, res) => {
    try {
        const filters = req.query; // e.g. ?investor_id=123&can_id=ABC
        const results = await getInvestorPortfolio(filters);
        sendEncryptedResponse(res, {
            data: results,
            count: Array.isArray(results) ? results.length : (results ? 1 : 0),
        }, "getInvestorPortfolio");
    } catch (error) {
        ErrorLogger.write({ type: "getInvestorPortfolio error :- ", error });
        serverError(res, error);
    }
});


//Added on dated 10-march-2026
router.post('/bank-by-folio', async (req, res) => {
    try {
        const { folio } = req.body;

        if (!folio) {
            return res.status(400).json({ message: "folio is required" });
        }

        const results = await getBankByFolio(folio);

        sendEncryptedResponse(
            res,
            {
                data: results,
                count: results.length
            },
            "searchByFolio"
        );

    } catch (error) {
        ErrorLogger.write({ type: "searchByFolio error :- ", error });
        serverError(res, error);
    }
});


//added by rakesh sinha ond  dated 11-march-2026
router.post('/scheme-by-name', async (req, res) => {
    try {
        const { scheme_name } = req.body;

        if (!scheme_name) {
            return res.status(400).json({ message: "scheme_name is required" });
        }

        const results = await getSchemeByName(scheme_name);

        sendEncryptedResponse(
            res,
            {
                data: results,
                count: results.length
            },
            "getSchemeByName"
        );

    } catch (error) {
        ErrorLogger.write({ type: "getSchemeByName error :- ", error });
        serverError(res, error);
    }
});

//added by rakesh for nese


module.exports = router;
