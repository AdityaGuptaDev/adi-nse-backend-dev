import express from "express";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import {
  uccRegistration,
  nseTransaction,
  nseRedemption,
  nseSwitch,
  nseXsipRegistration,
  nseSipRegistration,
  nseStpRegistration,
  nseSwpRegistration,
  nseOrderCancellation,
  nseStpCancellation,
  nseClientBankDetails,
  nseMandatePurchase,
  nseMandateRedemption,
  nseProvisionalReport,
  nseOrderStatus,
  nseBankElogUpload,
  nseMemberFundAllocation,
  nseTwoFaReport,
  saveUCCStep0,
  saveUCCStep1,
  saveUCCStep2,
  saveUCCStep3,
  // New handlers
  nseSchemeMasterDownload,
  resolveNseSchemeByIsin,
  nseSchemeList,
  nseGetLink,
  nseResendComm,
  nseMandateStatus,
  nseMandateImageUpload,
  nsePurchasePayment,
  nseUpiStatusCheck,
  nseSipCancellation,
  nseXsipCancellation,
  nseSwpCancellation,
  nseXsipPause,
  nseFatcaUpload,
  nseKycCheck,
  nseClientAuthReport,
  nseAofUpload,
  nseAllotmentStatement,
  nseRedemptionPayout,
} from "./nse-handler";
import ErrorLogger from "../../db/core/logger/error-logger";
import { serverError } from "proses-response";
import https from "https";
import { CookieJar } from "tough-cookie";
import { apiRequest } from "../../services/apirequest.service";
import { AxiosRequestConfig } from "axios";
import { financialRateLimit, exportRateLimit } from "../../middlewares/rateLimit";
import { UCCRegistration } from "./ucc-registration-model";

const router = express.Router();
const axios = require('axios');

router.post('/ucc', financialRateLimit, async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        
        const payload = {
            reg_details: [
                {
                    client_code: "K0283",
                    primary_holder_first_name: "Nitish",
                    primary_holder_middle_name: "R",
                    primary_holder_last_name: "TOPIWALA",
                    tax_status: "01",
                    gender: "M",
                    primary_holder_dob_incorporation: "04-11-1995",
                    occupation_code: "01",
                    holding_nature: "SI",
                    second_holder_first_name: "",
                    second_holder_middle_name: "",
                    second_holder_last_name: "",
                    third_holder_first_name: "",
                    third_holder_middle_name: "",
                    third_holder_last_name: "",
                    second_holder_dob: "",
                    third_holder_dob: "",
                    guardian_first_name: "",
                    guardian_middle_name: "",
                    guardian_last_name: "",
                    guardian_dob: "",
                    primary_holder_pan_exempt: "N",
                    second_holder_pan_exempt: "N",
                    third_holder_pan_exempt: "N",
                    guardian_pan_exempt: "N",
                    primary_holder_pan: "BADPT6767G",
                    second_holder_pan: "",
                    third_holder_pan: "",
                    guardian_pan: "",
                    primary_holder_exempt_category: "",
                    second_holder_exempt_category: "",
                    third_holder_exempt_category: "",
                    guardian_exempt_category: "",
                    client_type: "P",
                    pms: "",
                    default_dp: "",
                    cdsl_dpid: "",
                    cdslcltid: "",
                    cmbp_id: "12345666",
                    nsdldpid: "",
                    nsdlcltid: "",
                    account_type_1: "SB",
                    account_no_1: "12311115",
                    micr_no_1: "",
                    ifsc_code_1: "SBIN0000019",
                    default_bank_flag_1: "Y",
                    account_type_2: "",
                    account_no_2: "",
                    micr_no_2: "",
                    ifsc_code_2: "",
                    default_bank_flag_2: "",
                    cheque_name: "MY CHEQUE NAME",
                    div_pay_mode: "01",
                    address_1: "ADDRESS_1",
                    address_2: "ADDRESS_2",
                    address_3: "ADDRESS_3",
                    city: "RANCHI",
                    state: "MA",
                    pincode: "400008",
                    country: "INDIA",
                    resi_phone: "123123123",
                    resi_fax: "",
                    office_phone: "",
                    office_fax: "",
                    email: "nitish@gmail.com",
                    communication_mode: "E",
                    foreign_address_1: "",
                    foreign_address_2: "",
                    foreign_address_3: "",
                    foreign_address_city: "",
                    foreign_address_pincode: "",
                    foreign_address_state: "",
                    foreign_address_country: "",
                    indian_mobile_no: "9304955503",
                    primary_holder_kyc_type: "C",
                    primary_holder_ckyc_number: "1234567891",
                    aadhaar_updated: "Y",
                    mapin_id: "1234567887654321",
                    paperless_flag: "Z",
                    mobile_declaration_flag: "SE",
                    email_declaration_flag: "SE",
                    nomination_opt: "Y",
                    nomination_authentication: "O",
                    nominee_1_name: "Suman Kumar Munda",
                    nominee_1_relationship: "05",
                    nominee_1_applicable: "100",
                    nominee_1_minor_flag: "N",
                    nominee_1_dob: "",
                    nominee_1_guardian: "",
                    nominee_1_identity_type: "1",
                    nominee_1_identity_number: "ASKPD2345A",
                    nominee_1_email: "nominee@test.com",
                    nominee_1_mobile: "9876543211",
                    nominee_1_address1: "NOMINEE ADDRESS LINE 1",
                    nominee_1_address2: "",
                    nominee_1_address3: "",
                    nominee_1_city: "MUMBAI",
                    nominee_1_pin: "400001",
                    nominee_1_country: "INDIA",
                    nominee_soa: "Y",
                    reg_id: "",
                    reg_status: "",
                    reg_remark: ""
                }
            ]
        };

        // Fix the headers - especially the Accept header
        const headers = {
            'memberId': process.env.NSE_MEMBER_ID || '1003039',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',  // Changed from '/' to 'application/json'
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Authorization': 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=',
            'Cookie': process.env.NSE_COOKIE || ''  // Make sure this cookie is valid
        };

        // Also, look at the response headers from the error - the server expects 'application/json'
        // The response headers show: 'accept: application/json'

        const response = await axios.post(
            'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/CLIENTCOMMON183',
            payload,
            { headers }
        );

        sendEncryptedResponse(res, {
            response: response.data,
            count: ""
        }, "getSchemeByName");

    } catch (error: any) {
        console.error("Error in /ucc route:", error);

        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: 'NSE API error',
                details: error.response.data,
                status: error.response.status,
                statusText: error.response.statusText
            });
        } else if (error.request) {
            return res.status(504).json({
                success: false,
                message: 'No response from NSE server'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                details: error.message
            });
        }
    }
});

//Ucc registrtation API-1
router.post("/ucc-registration", financialRateLimit, async (req, res) => {
  try {
    const { mobile, userType } = req.body;

    console.log("UCC registration request received", { mobile, userType });

    if (!mobile) {
      return sendEncryptedResponse(
        res,
        { status: "F", remark: "mobile is required" },
        "ucc"
      );
    }

    const uccResponse = await uccRegistration(mobile, userType);
    const regDetails = uccResponse?.reg_details?.[0];
    const isUccSuccess = regDetails?.reg_status === "REG_SUCCESS";

    sendEncryptedResponse(
      res,
      {
        status: isUccSuccess ? "S" : "F",
        remark: isUccSuccess
          ? "UCC registration completed successfully"
          : regDetails?.reg_remark || "UCC registration failed",
        data: uccResponse,
      },
      "ucc"
    );
  } catch (error) {
    ErrorLogger.write({ type: "ucc registration error :- ", error });
    serverError(res, error);
  }
});

// NSE Transaction API - Purchase/Redemption
router.post("/transaction", financialRateLimit, async (req, res) => {
  try {
    console.log("nside the transactional api");
    
    const { transaction_details } = req.body;

    console.log("NSE transaction request received", { transaction_details });

    if (!transaction_details || !Array.isArray(transaction_details)) {
      return res.status(400).json({
        success: false,
        message: "transaction_details is required and must be an array"
      });
    }

    const transactionResponse = await nseTransaction(transaction_details);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Transaction processed successfully",
        data: transactionResponse,
      },
      "transaction"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse transaction error :- ", error });
    serverError(res, error);
  }
});

// NSE Redemption Transaction API
router.post("/redemption", financialRateLimit, async (req, res) => {
  try {
    const { transaction_details } = req.body;

    console.log("NSE redemption request received", { transaction_details });

    if (!transaction_details || !Array.isArray(transaction_details)) {
      return res.status(400).json({
        success: false,
        message: "transaction_details is required and must be an array"
      });
    }

    const redemptionResponse = await nseRedemption(transaction_details);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Redemption processed successfully",
        data: redemptionResponse,
      },
      "redemption"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse redemption error :- ", error });
    serverError(res, error);
  }
});

// NSE Switch Transaction API
router.post("/switch", financialRateLimit, async (req, res) => {
  try {
    const { transaction_details } = req.body;

    console.log("NSE switch request received", { transaction_details });

    if (!transaction_details || !Array.isArray(transaction_details)) {
      return res.status(400).json({
        success: false,
        message: "transaction_details is required and must be an array"
      });
    }

    const switchResponse = await nseSwitch(transaction_details);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Switch processed successfully",
        data: switchResponse,
      },
      "switch"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse switch error :- ", error });
    serverError(res, error);
  }
});

// NSE XSIP Registration API
router.post("/xsip-registration", financialRateLimit, async (req, res) => {
  try {
    const { reg_data } = req.body;

    console.log("NSE XSIP registration request received", { reg_data });

    if (!reg_data || !Array.isArray(reg_data)) {
      return res.status(400).json({
        success: false,
        message: "reg_data is required and must be an array"
      });
    }

    const xsipResponse = await nseXsipRegistration(reg_data);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "XSIP registration processed successfully",
        data: xsipResponse,
      },
      "xsip-registration"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse xsip registration error :- ", error });
    serverError(res, error);
  }
});

// NSE SIP Registration API
router.post("/sip-registration", financialRateLimit, async (req, res) => {
  try {
    const { reg_data } = req.body;

    console.log("NSE SIP registration request received", { reg_data });

    if (!reg_data || !Array.isArray(reg_data)) {
      return res.status(400).json({
        success: false,
        message: "reg_data is required and must be an array"
      });
    }

    const sipResponse = await nseSipRegistration(reg_data);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "SIP registration processed successfully",
        data: sipResponse,
      },
      "sip-registration"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse sip registration error :- ", error });
    serverError(res, error);
  }
});

// NSE STP Registration API
router.post("/stp-registration", financialRateLimit, async (req, res) => {
  try {
    const { reg_data } = req.body;

    console.log("NSE STP registration request received", { reg_data });

    if (!reg_data || !Array.isArray(reg_data)) {
      return res.status(400).json({
        success: false,
        message: "reg_data is required and must be an array"
      });
    }

    const stpResponse = await nseStpRegistration(reg_data);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "STP registration processed successfully",
        data: stpResponse,
      },
      "stp-registration"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse stp registration error :- ", error });
    serverError(res, error);
  }
});

// NSE SWP Registration API
router.post("/swp-registration", financialRateLimit, async (req, res) => {
  try {
    const { reg_data } = req.body;

    console.log("NSE SWP registration request received", { reg_data });

    if (!reg_data || !Array.isArray(reg_data)) {
      return res.status(400).json({
        success: false,
        message: "reg_data is required and must be an array"
      });
    }

    const swpResponse = await nseSwpRegistration(reg_data);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "SWP registration processed successfully",
        data: swpResponse,
      },
      "swp-registration"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse swp registration error :- ", error });
    serverError(res, error);
  }
});

// NSE Order Cancellation API
router.post("/order-cancellation", financialRateLimit, async (req, res) => {
  try {
    const { can_data } = req.body;

    console.log("NSE order cancellation request received", { can_data });

    if (!can_data || !Array.isArray(can_data)) {
      return res.status(400).json({
        success: false,
        message: "can_data is required and must be an array"
      });
    }

    const cancellationResponse = await nseOrderCancellation(can_data);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Order cancellation processed successfully",
        data: cancellationResponse,
      },
      "order-cancellation"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse order cancellation error :- ", error });
    serverError(res, error);
  }
});

// NSE STP Cancellation API
router.post("/stp-cancellation", financialRateLimit, async (req, res) => {
  try {
    const { can_data } = req.body;

    console.log("NSE STP cancellation request received", { can_data });

    if (!can_data || !Array.isArray(can_data)) {
      return res.status(400).json({
        success: false,
        message: "can_data is required and must be an array"
      });
    }

    const stpCancellationResponse = await nseStpCancellation(can_data);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "STP cancellation processed successfully",
        data: stpCancellationResponse,
      },
      "stp-cancellation"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse stp cancellation error :- ", error });
    serverError(res, error);
  }
});

// NSE Client Bank Details API
router.post("/client-bank-details", financialRateLimit, async (req, res) => {
  try {
    const { bank_dtl } = req.body;

    console.log("NSE client bank details request received", { bank_dtl });

    if (!bank_dtl || !Array.isArray(bank_dtl)) {
      return res.status(400).json({
        success: false,
        message: "bank_dtl is required and must be an array"
      });
    }

    const bankDetailsResponse = await nseClientBankDetails(bank_dtl);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Client bank details processed successfully",
        data: bankDetailsResponse,
      },
      "client-bank-details"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse client bank details error :- ", error });
    serverError(res, error);
  }
});

// NSE Mandate Purchase API
router.post("/mandate-purchase", financialRateLimit, async (req, res) => {
  try {
    const { reg_data } = req.body;

    console.log("NSE mandate purchase request received", { reg_data });

    if (!reg_data || !Array.isArray(reg_data)) {
      return res.status(400).json({
        success: false,
        message: "reg_data is required and must be an array"
      });
    }

    const mandatePurchaseResponse = await nseMandatePurchase(reg_data);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Mandate purchase processed successfully",
        data: mandatePurchaseResponse,
      },
      "mandate-purchase"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse mandate purchase error :- ", error });
    serverError(res, error);
  }
});

// NSE Mandate Redemption API
router.post("/mandate-redemption", financialRateLimit, async (req, res) => {
  try {
    const { reg_data } = req.body;

    console.log("NSE mandate redemption request received", { reg_data });

    if (!reg_data || !Array.isArray(reg_data)) {
      return res.status(400).json({
        success: false,
        message: "reg_data is required and must be an array"
      });
    }

    const mandateRedemptionResponse = await nseMandateRedemption(reg_data);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Mandate redemption processed successfully",
        data: mandateRedemptionResponse,
      },
      "mandate-redemption"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse mandate redemption error :- ", error });
    serverError(res, error);
  }
});

// NSE Provisional Report API
router.post("/provisional-report", exportRateLimit, async (req, res) => {
  try {
    console.log("NSE provisional report request received", req.body);

    const provisionalReportResponse = await nseProvisionalReport(req.body);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Provisional report processed successfully",
        data: provisionalReportResponse,
      },
      "provisional-report"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse provisional report error :- ", error });
    serverError(res, error);
  }
});

// NSE Order Status API
router.post("/order-status", exportRateLimit, async (req, res) => {
  try {
    console.log("NSE order status request received", req.body);

    const orderStatusResponse = await nseOrderStatus(req.body);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Order status processed successfully",
        data: orderStatusResponse,
      },
      "order-status"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse order status error :- ", error });
    serverError(res, error);
  }
});

// NSE Bank eLog Upload API
router.post("/bank-elog-upload", financialRateLimit, async (req, res) => {
  try {
    console.log("NSE bank eLog upload request received", req.body);

    const elogUploadResponse = await nseBankElogUpload(req.body);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Bank eLog upload processed successfully",
        data: elogUploadResponse,
      },
      "bank-elog-upload"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse bank elog upload error :- ", error });
    serverError(res, error);
  }
});

// NSE Member Fund Allocation API
router.post("/member-fund-allocation", financialRateLimit, async (req, res) => {
  try {
    console.log("NSE member fund allocation request received", req.body);

    const fundAllocationResponse = await nseMemberFundAllocation(req.body);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Member fund allocation processed successfully",
        data: fundAllocationResponse,
      },
      "member-fund-allocation"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse member fund allocation error :- ", error });
    serverError(res, error);
  }
});

// NSE 2FA Report API
router.post("/2fa-report", exportRateLimit, async (req, res) => {
  try {
    console.log("NSE 2FA report request received", req.body);

    const twoFaReportResponse = await nseTwoFaReport(req.body);

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "2FA report processed successfully",
        data: twoFaReportResponse,
      },
      "2fa-report"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse 2fa report error :- ", error });
    serverError(res, error);
  }
});


//code by aditya gupta for saving the details of NSE
// Step 0 — PAN & Aadhaar (INSERT / upsert by mobile)
router.post("/ucc/step-0",  async (req, res) => {
  try {
    const body = req.body;

    if (!body.investor_id) {
      return sendEncryptedResponse(
        res,
        { status: "F", remark: "investor_id is required" },
        "ucc-step-0"
      );
    }

    const result = await saveUCCStep0(body);

    if (!result.success) {
      return sendEncryptedResponse(
        res,
        { status: "F", remark: result.message },
        "ucc-step-0"
      );
    }

    return sendEncryptedResponse(
      res,
      { status: "S", remark: result.message, data: result.data },
      "ucc-step-0"
    );
  } catch (error) {
    ErrorLogger.write({ type: "ucc-step-0 error", error });
    serverError(res, error);
  }
});

// Step 1 — Holding Pattern (UPDATE by mobile)
router.post("/ucc/step-1",  async (req, res) => {
  try {
    const body = req.body;

    if (!body.investor_id) {
      return sendEncryptedResponse(
        res,
        { status: "F", remark: "investor_id is required" },
        "ucc-step-1"
      );
    }

    const result = await saveUCCStep1(body);

    if (!result.success) {
      return sendEncryptedResponse(
        res,
        { status: "F", remark: result.message },
        "ucc-step-1"
      );
    }

    return sendEncryptedResponse(
      res,
      { status: "S", remark: result.message, data: result.data },
      "ucc-step-1"
    );
  } catch (error) {
    ErrorLogger.write({ type: "ucc-step-1 error", error });
    serverError(res, error);
  }
});

// Step 2 — Nominee Details (UPDATE by mobile)
router.post("/ucc/step-2", async (req, res) => {
  try {
    const body = req.body;

    if (!body.investor_id) {
      return sendEncryptedResponse(
        res,
        { status: "F", remark: "investor_id is required" },
        "ucc-step-2"
      );
    }

    const result = await saveUCCStep2(body);

    if (!result.success) {
      return sendEncryptedResponse(
        res,
        { status: "F", remark: result.message },
        "ucc-step-2"
      );
    }

    return sendEncryptedResponse(
      res,
      { status: "S", remark: result.message, data: result.data },
      "ucc-step-2"
    );
  } catch (error) {
    ErrorLogger.write({ type: "ucc-step-2 error", error });
    serverError(res, error);
  }
});

// Step 3 — Bank Details + Final Submit (UPDATE by mobile)
router.post("/ucc/step-3",  async (req, res) => {
  console.log("\n\n████████████████████████████████████████████████████████");
  console.log("█  [STEP-3] ROUTE HIT  /nse/ucc/step-3");
  console.log("████████████████████████████████████████████████████████");
  try {
    const body = req.body;
    console.log("[STEP-3] >>> 1. Request body received:", JSON.stringify(body, null, 2));

    console.log("[STEP-3] >>> 2. Checking investor_id presence...");
    if (!body.investor_id) {
      console.log("[STEP-3] !!! investor_id MISSING — aborting");
      return sendEncryptedResponse(
        res,
        { status: "F", remark: "investor_id is required" },
        "ucc-step-3"
      );
    }
    console.log("[STEP-3] >>> investor_id =", body.investor_id);

    console.log("[STEP-3] >>> 3. Calling saveUCCStep3() to persist bank/foreign/final fields...");
    const result = await saveUCCStep3(body);
    console.log("[STEP-3] >>> 3. saveUCCStep3() returned:", result);

    if (!result.success) {
      console.log("[STEP-3] !!! saveUCCStep3 reported failure — aborting before NSE call");
      return sendEncryptedResponse(
        res,
        { status: "F", remark: result.message },
        "ucc-step-3"
      );
    }

    // Mobile MUST come from the request payload (indian_mobile_no), not from InvestorRegistration
    const requestMobile: string = body.indian_mobile_no || "";
    console.log("[STEP-3] >>> 4. requestMobile (from body.indian_mobile_no) =", requestMobile);

    if (!requestMobile) {
      console.log("[STEP-3] !!! indian_mobile_no missing in request body — aborting");
      return sendEncryptedResponse(
        res,
        { status: "F", remark: "indian_mobile_no is required in request body" },
        "ucc-step-3"
      );
    }

    const userType = body.userType ?? body.user_type ?? 0;
    console.log("[STEP-3] >>> 5. Resolved userType =", userType);

    console.log("[STEP-3] >>> 6. ============ CALLING uccRegistration() ============");
    console.log("[STEP-3] >>> 6. args:", {
      mobile: requestMobile,
      userType,
    });

    let uccResponse: any;
    try {
      uccResponse = await uccRegistration(requestMobile, userType);
      console.log("[STEP-3] >>> 6. ============ uccRegistration() RETURNED ============");
      console.log("[STEP-3] >>> 6. raw response:", JSON.stringify(uccResponse, null, 2));
      console.log("[STEP-3] >>> 6. summary:", {
        reg_status: uccResponse?.reg_details?.[0]?.reg_status,
        reg_id: uccResponse?.reg_details?.[0]?.reg_id,
        reg_remark: uccResponse?.reg_details?.[0]?.reg_remark,
      });
    } catch (uccErr: any) {
      console.error("[STEP-3] !!! uccRegistration() THREW:", uccErr?.message);
      console.error("[STEP-3] !!! stack:", uccErr?.stack);
      ErrorLogger.write({ type: "ucc-step-3 nse ucc error", error: uccErr });
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark:
            uccErr?.message || "UCC registration failed at NSE",
          data: result.data,
        },
        "ucc-step-3"
      );
    }

    console.log("[STEP-3] >>> 7. Evaluating reg_status to decide final response...");
    const regDetails = uccResponse?.reg_details?.[0];
    const isUccSuccess = regDetails?.reg_status === "REG_SUCCESS";
    console.log("[STEP-3] >>> 7. isUccSuccess =", isUccSuccess);

    console.log("[STEP-3] >>> 8. Sending encrypted response back to frontend");
    console.log("████████████████████████████████████████████████████████\n");
    return sendEncryptedResponse(
      res,
      {
        status: isUccSuccess ? "S" : "F",
        remark: isUccSuccess
          ? "UCC registration completed successfully"
          : regDetails?.reg_remark || "UCC registration failed",
        data: {
          step3: result.data,
          ucc: uccResponse,
        },
      },
      "ucc-step-3"
    );
  } catch (error: any) {
    console.error("[STEP-3] !!! TOP-LEVEL CATCH:", error?.message);
    console.error("[STEP-3] !!! stack:", error?.stack);
    ErrorLogger.write({ type: "ucc-step-3 error", error });
    serverError(res, error);
  }
});

// Search UCCRegistration details by mobile number
router.get("/ucc/search-by-mobile/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;

    if (!mobile) {
      return sendEncryptedResponse(
        res,
        { status: "F", remark: "mobile is required" },
        "ucc-search"
      );
    }

    const record = await UCCRegistration.findOne({
      where: { indianMobileNo: mobile },
    });

    if (!record) {
      return sendEncryptedResponse(
        res,
        { status: "F", remark: "No UCC record found for this mobile" },
        "ucc-search"
      );
    }

    return sendEncryptedResponse(
      res,
      { status: "S", remark: "UCC record fetched successfully", data: record },
      "ucc-search"
    );
  } catch (error) {
    ErrorLogger.write({ type: "ucc-search-by-mobile error", error });
    serverError(res, error);
  }
});


// ══════════════════════════════════════════════════════════════
//  NEW API ROUTES FOR COMPLETE NSE MODULE
// ══════════════════════════════════════════════════════════════

// Scheme Master Download
router.get("/scheme-master", exportRateLimit, async (req, res) => {
  try {
    const fileType = (req.query.file_type as string) || "SCH";
    const response = await nseSchemeMasterDownload(fileType);
    sendEncryptedResponse(res, { status: "S", remark: "Scheme master fetched", data: response }, "scheme-master");
  } catch (error) {
    ErrorLogger.write({ type: "nse scheme master error", error });
    serverError(res, error);
  }
});

// Paginated + searchable NSE scheme list for the fund-explore "NSE mode".
// Rows are shaped to mirror the Morningstar MFU response so the same table
// can render either source without branching.
router.get("/scheme/list", async (req, res) => {
  try {
    const result = await nseSchemeList({
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 50,
      search: (req.query.search as string) || "",
      category: (req.query.category as string) || "",
      amc: (req.query.amc as string) || "",
      onlyPurchaseAllowed:
        String(req.query.only_purchase_allowed || "true").toLowerCase() !== "false",
    });
    return sendEncryptedResponse(
      res,
      { status: "S", remark: "NSE scheme list fetched", data: result },
      "nse-scheme-list"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse scheme list error", error });
    serverError(res, error);
  }
});

// Resolve a Morningstar ISIN to the matching NSE scheme row so the front-end
// can hand the canonical NSE scheme_code to /nse-order-form. Backed by an
// in-memory cache (1h TTL) over NSE MASTER_DOWNLOAD.
router.get("/scheme/resolve-by-isin", async (req, res) => {
  try {
    const isin = (req.query.isin as string) || "";
    const refresh = String(req.query.refresh || "").toLowerCase() === "true";
    if (!isin || !/^[A-Z0-9]{10,12}$/i.test(isin.trim())) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "A valid ISIN is required",
          data: null,
        },
        "scheme-resolve"
      );
    }

    const match = await resolveNseSchemeByIsin(isin, refresh);
    if (!match) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "This scheme is not available on NSE MF Desk for execution",
          data: { isin: isin.trim().toUpperCase(), matched: false },
        },
        "scheme-resolve"
      );
    }

    const purchaseAllowed =
      (match.purchase_allowed || "").toUpperCase() === "Y";

    return sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Scheme resolved successfully",
        data: {
          matched: true,
          purchase_allowed: purchaseAllowed,
          scheme_code: match.scheme_code || "",
          scheme_name: match.scheme_name || "",
          amc_code: match.amc_code || "",
          amc_name: match.amc_name || "",
          isin: match.isin || "",
          sub_category: match.sub_category || "",
          scheme_type: match.scheme_type || "",
          min_purchase_amount: match.min_purchase_amount || "",
          nav: match.nav || "",
          nav_date: match.nav_date || "",
          sip_allowed: match.sip_allowed || "",
          redemption_allowed: match.redemption_allowed || "",
        },
      },
      "scheme-resolve"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse scheme resolve error", error });
    serverError(res, error);
  }
});

// Get Short URL Link
router.post("/get-link", financialRateLimit, async (req, res) => {
  try {
    const response = await nseGetLink(req.body);
    sendEncryptedResponse(res, { status: "S", remark: "Link fetched", data: response }, "get-link");
  } catch (error) {
    ErrorLogger.write({ type: "nse get-link error", error });
    serverError(res, error);
  }
});

// Resend Communication
router.post("/resend-comm", financialRateLimit, async (req, res) => {
  try {
    const response = await nseResendComm(req.body);
    sendEncryptedResponse(res, { status: "S", remark: "Communication resent", data: response }, "resend-comm");
  } catch (error) {
    ErrorLogger.write({ type: "nse resend-comm error", error });
    serverError(res, error);
  }
});

// Scan Mandate Image Upload (Physical mandate only)
router.post("/mandate-image-upload", financialRateLimit, async (req, res) => {
  try {
    const { client_code, mandate_id, file_name, file_data } = req.body || {};

    // Validation per NSE doc — all four fields are mandatory.
    if (!client_code || typeof client_code !== "string") {
      return res.status(400).json({ success: false, message: "client_code is required" });
    }
    if (client_code.length > 10) {
      return res.status(400).json({
        success: false,
        message: "client_code must be <= 10 characters (NSE UCC limit)",
      });
    }
    if (!mandate_id || typeof mandate_id !== "string") {
      return res.status(400).json({ success: false, message: "mandate_id is required" });
    }
    if (!/^\d{1,15}$/.test(mandate_id)) {
      return res.status(400).json({
        success: false,
        message: "mandate_id must be numeric, up to 15 digits",
      });
    }
    if (!file_name || typeof file_name !== "string") {
      return res.status(400).json({ success: false, message: "file_name is required" });
    }
    if (file_name.length > 30) {
      return res.status(400).json({
        success: false,
        message: "file_name must be <= 30 characters",
      });
    }
    if (!/\.(jpg|jpeg|png|pdf|tiff|tif)$/i.test(file_name)) {
      return res.status(400).json({
        success: false,
        message: "file_name must end with .jpg, .jpeg, .png, .pdf, .tiff or .tif",
      });
    }
    if (!file_data || typeof file_data !== "string") {
      return res.status(400).json({ success: false, message: "file_data is required" });
    }
    // The request pipeline escapes "/" to "#x2F" (same quirk the mandate-purchase
    // handler already works around). Base64 uses "/" as a valid character, so we
    // MUST un-escape before validating or forwarding to NSE.
    let cleanedFileData = file_data.replace(/#x2F/g, "/");
    // Strip data URI prefix if the client accidentally sent it.
    cleanedFileData = cleanedFileData.replace(/^data:[^;]+;base64,/, "");
    // Remove any stray whitespace / newlines the reader may have introduced.
    cleanedFileData = cleanedFileData.replace(/\s+/g, "");
    // Reject anything that isn't valid base64.
    if (!/^[A-Za-z0-9+/=]+$/.test(cleanedFileData)) {
      return res.status(400).json({
        success: false,
        message: "file_data must be a valid base64 string",
      });
    }
    // Rough size guard — 4 MB ≈ 5.6 MB of base64.
    const MAX_BASE64_BYTES = 6 * 1024 * 1024;
    if (cleanedFileData.length > MAX_BASE64_BYTES) {
      return res.status(400).json({
        success: false,
        message: "file_data too large (max ~4 MB image)",
      });
    }

    const response = await nseMandateImageUpload({
      client_code,
      mandate_id,
      file_name,
      file_data: cleanedFileData,
    });

    sendEncryptedResponse(
      res,
      {
        status: response?.status === "100" ? "S" : "F",
        remark: response?.message || "Mandate image upload processed",
        data: response,
      },
      "mandate-image-upload"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse mandate-image-upload error", error });
    serverError(res, error);
  }
});

// Mandate Status Report
router.post("/mandate-status", exportRateLimit, async (req, res) => {
  try {
    const response = await nseMandateStatus(req.body);
    sendEncryptedResponse(res, { status: "S", remark: "Mandate status fetched", data: response }, "mandate-status");
  } catch (error) {
    ErrorLogger.write({ type: "nse mandate-status error", error });
    serverError(res, error);
  }
});

// Purchase Payment
router.post("/purchase-payment", financialRateLimit, async (req, res) => {
  try {
    const response = await nsePurchasePayment(req.body);
    sendEncryptedResponse(res, { status: "S", remark: "Payment processed", data: response }, "purchase-payment");
  } catch (error) {
    ErrorLogger.write({ type: "nse purchase-payment error", error });
    serverError(res, error);
  }
});

// UPI Status Check
router.post("/upi-status", financialRateLimit, async (req, res) => {
  try {
    const response = await nseUpiStatusCheck(req.body);
    sendEncryptedResponse(res, { status: "S", remark: "UPI status fetched", data: response }, "upi-status");
  } catch (error) {
    ErrorLogger.write({ type: "nse upi-status error", error });
    serverError(res, error);
  }
});

// SIP Cancellation
router.post("/sip-cancellation", financialRateLimit, async (req, res) => {
  try {
    const { can_data } = req.body;
    if (!can_data || !Array.isArray(can_data)) {
      return res.status(400).json({ success: false, message: "can_data is required and must be an array" });
    }
    const response = await nseSipCancellation(can_data);
    sendEncryptedResponse(res, { status: "S", remark: "SIP cancellation processed", data: response }, "sip-cancellation");
  } catch (error) {
    ErrorLogger.write({ type: "nse sip-cancellation error", error });
    serverError(res, error);
  }
});

// XSIP Cancellation
router.post("/xsip-cancellation", financialRateLimit, async (req, res) => {
  try {
    const { can_data } = req.body;
    if (!can_data || !Array.isArray(can_data)) {
      return res.status(400).json({ success: false, message: "can_data is required and must be an array" });
    }
    const response = await nseXsipCancellation(can_data);
    sendEncryptedResponse(res, { status: "S", remark: "XSIP cancellation processed", data: response }, "xsip-cancellation");
  } catch (error) {
    ErrorLogger.write({ type: "nse xsip-cancellation error", error });
    serverError(res, error);
  }
});

// SWP Cancellation
router.post("/swp-cancellation", financialRateLimit, async (req, res) => {
  try {
    const { can_data } = req.body;
    if (!can_data || !Array.isArray(can_data)) {
      return res.status(400).json({ success: false, message: "can_data is required and must be an array" });
    }
    const response = await nseSwpCancellation(can_data);
    sendEncryptedResponse(res, { status: "S", remark: "SWP cancellation processed", data: response }, "swp-cancellation");
  } catch (error) {
    ErrorLogger.write({ type: "nse swp-cancellation error", error });
    serverError(res, error);
  }
});

// XSIP Pause/Resume
router.post("/xsip-pause", financialRateLimit, async (req, res) => {
  try {
    const { pause_data } = req.body;
    if (!pause_data || !Array.isArray(pause_data)) {
      return res.status(400).json({ success: false, message: "pause_data is required and must be an array" });
    }
    const response = await nseXsipPause(pause_data);
    sendEncryptedResponse(res, { status: "S", remark: "XSIP pause processed", data: response }, "xsip-pause");
  } catch (error) {
    ErrorLogger.write({ type: "nse xsip-pause error", error });
    serverError(res, error);
  }
});

// FATCA Upload
router.post("/fatca-upload", financialRateLimit, async (req, res) => {
  try {
    const response = await nseFatcaUpload(req.body);
    sendEncryptedResponse(res, { status: "S", remark: "FATCA uploaded", data: response }, "fatca-upload");
  } catch (error) {
    ErrorLogger.write({ type: "nse fatca-upload error", error });
    serverError(res, error);
  }
});

// KYC Check
router.post("/kyc-check", exportRateLimit, async (req, res) => {
  try {
    const response = await nseKycCheck(req.body);
    sendEncryptedResponse(res, { status: "S", remark: "KYC status fetched", data: response }, "kyc-check");
  } catch (error) {
    ErrorLogger.write({ type: "nse kyc-check error", error });
    serverError(res, error);
  }
});

// Client Authorization Report
router.post("/client-auth-report", exportRateLimit, async (req, res) => {
  try {
    const response = await nseClientAuthReport(req.body);
    sendEncryptedResponse(res, { status: "S", remark: "Client auth report fetched", data: response }, "client-auth-report");
  } catch (error) {
    ErrorLogger.write({ type: "nse client-auth-report error", error });
    serverError(res, error);
  }
});

// AOF Image Upload
// Doc: POST /nsemfdesk/api/v2/fileupload/AOFIMG
// Body: { client_code, file_name, document_type ("NRM"|"RIA"), file_data (base64) }
router.post("/aof-upload", financialRateLimit, async (req, res) => {
  try {
    const { client_code, file_name, document_type, file_data } = req.body || {};

    if (!client_code || typeof client_code !== "string") {
      return res.status(400).json({ success: false, message: "client_code is required" });
    }
    if (client_code.length > 10) {
      return res.status(400).json({
        success: false,
        message: "client_code must be <= 10 characters (NSE UCC limit)",
      });
    }
    if (!file_name || typeof file_name !== "string") {
      return res.status(400).json({ success: false, message: "file_name is required" });
    }
    if (file_name.length > 40) {
      return res.status(400).json({
        success: false,
        message: "file_name must be <= 40 characters",
      });
    }
    // NSE AOFIMG only accepts .jpg / .jpeg per spec sample. It also rejects
    // filenames containing uppercase or special characters — we normalize here.
    if (!/\.(jpg|jpeg)$/i.test(file_name)) {
      return res.status(400).json({
        success: false,
        message: "file_name must end with .jpg or .jpeg (NSE AOF accepts JPEG only)",
      });
    }
    const docType = (document_type || "NRM").toString().toUpperCase();
    if (!["NRM", "RIA"].includes(docType)) {
      return res.status(400).json({
        success: false,
        message: "document_type must be NRM or RIA",
      });
    }
    if (!file_data || typeof file_data !== "string") {
      return res.status(400).json({ success: false, message: "file_data is required" });
    }

    // The PII-decrypt middleware escapes "/" to "#x2F" — base64 uses "/" as a
    // valid character, so we MUST un-escape before validating or forwarding.
    let cleanedFileData = file_data.replace(/#x2F/g, "/");
    cleanedFileData = cleanedFileData.replace(/^data:[^;]+;base64,/, "");
    cleanedFileData = cleanedFileData.replace(/\s+/g, "");
    if (!/^[A-Za-z0-9+/=]+$/.test(cleanedFileData)) {
      return res.status(400).json({
        success: false,
        message: "file_data must be a valid base64 string",
      });
    }
    const MAX_BASE64_BYTES = 6 * 1024 * 1024;
    if (cleanedFileData.length > MAX_BASE64_BYTES) {
      return res.status(400).json({
        success: false,
        message: "file_data too large (max ~4 MB image)",
      });
    }

    // Sanitize: lowercase, replace any non-[a-z0-9._-] with "_", collapse
    // runs, and force a ".jpg" extension so NSE doesn't complain.
    const base = file_name.replace(/\.(jpg|jpeg)$/i, "");
    const sanitizedBase = base
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 30) || "aof_image";
    const sanitizedFileName = `${sanitizedBase}.jpg`;

    const response = await nseAofUpload({
      client_code,
      file_name: sanitizedFileName,
      document_type: docType,
      file_data: cleanedFileData,
    });

    // NSE returns { status: "100", message: "Image Uploaded Successfully." } on success.
    sendEncryptedResponse(
      res,
      {
        status: response?.status === "100" ? "S" : "F",
        remark: response?.message || "AOF upload processed",
        data: response,
      },
      "aof-upload"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nse aof-upload error", error });
    serverError(res, error);
  }
});

// Allotment Statement Report
router.post("/allotment-statement", exportRateLimit, async (req, res) => {
  try {
    const response = await nseAllotmentStatement(req.body);
    sendEncryptedResponse(res, { status: "S", remark: "Allotment statement fetched", data: response }, "allotment-statement");
  } catch (error) {
    ErrorLogger.write({ type: "nse allotment-statement error", error });
    serverError(res, error);
  }
});

// Redemption Payout Report
router.post("/redemption-payout", exportRateLimit, async (req, res) => {
  try {
    const response = await nseRedemptionPayout(req.body);
    sendEncryptedResponse(res, { status: "S", remark: "Redemption payout fetched", data: response }, "redemption-payout");
  } catch (error) {
    ErrorLogger.write({ type: "nse redemption-payout error", error });
    serverError(res, error);
  }
});


// ── NSE UCC Investor List API ──
// Returns all UCCRegistration rows with their UCC creation status
// and the latest log entry from ucc_registration_logs for each investor.
router.get("/ucc/investor-list", async (req, res) => {
  try {
    const { page = "1", limit = "20", ucc_status, search } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    const where: any = {};
    if (ucc_status === "created") {
      where.uccCreated = 1;
    } else if (ucc_status === "not_created") {
      where.uccCreated = { [require("sequelize").Op.or]: [0, null] };
    }
    if (search) {
      const { Op } = require("sequelize");
      where[Op.or] = [
        { indianMobileNo: { [Op.iLike]: `%${search}%` } },
        { primaryHolderFirstName: { [Op.iLike]: `%${search}%` } },
        { primaryHolderLastName: { [Op.iLike]: `%${search}%` } },
        { primaryHolderPan: { [Op.iLike]: `%${search}%` } },
        { clientCode: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await UCCRegistration.findAndCountAll({
      where,
      attributes: [
        "id",
        "investorId",
        "clientCode",
        "primaryHolderFirstName",
        "primaryHolderMiddleName",
        "primaryHolderLastName",
        "primaryHolderPan",
        "taxStatus",
        "email",
        "indianMobileNo",
        "holdingNature",
        "gender",
        "primaryHolderDobIncorporation",
        "formStep",
        "uccCreated",
        "regId",
        "regStatus",
        "regRemark",
        "fatcaRegId",
        "fatcaStatus",
        "fatcaRemark",
        "fatcaSubmittedAt",
        "createdAt",
        "updatedAt",
        // Bank 1
        "accountType1",
        "accountNo1",
        "micrNo1",
        "ifscCode1",
        "defaultBankFlag1",
        "bankName1",
        "branchName1",
        // Bank 2
        "accountType2",
        "accountNo2",
        "micrNo2",
        "ifscCode2",
        "defaultBankFlag2",
        "bankName2",
        "branchName2",
      ],
      order: [["updatedAt", "DESC"]],
      limit: limitNum,
      offset,
    });

    // Fetch the latest UCC registration log for each mobile number
    const { UccRegistrationLog } = require("./nse-ucc-reg-logs");
    const mobiles = rows
      .map((r: any) => r.indianMobileNo)
      .filter((m: any) => m);

    let logsByMobile: Record<string, any> = {};
    if (mobiles.length > 0) {
      const { Op } = require("sequelize");
      const logs = await UccRegistrationLog.findAll({
        where: { mobile: { [Op.in]: mobiles } },
        order: [["id", "DESC"]],
        attributes: [
          "id",
          "mobile",
          "clientCode",
          "status",
          "remark",
          "regId",
          "regStatus",
          "regRemark",
          "createdAt",
        ],
      });
      // Group by mobile, keep latest (first due to DESC order)
      for (const log of logs) {
        const m = log.mobile;
        if (m && !logsByMobile[m]) {
          logsByMobile[m] = log;
        }
      }
    }

    // Build response
    const investors = rows.map((r: any) => {
      const row = r.toJSON();
      const latestLog = logsByMobile[row.indianMobileNo] || null;

      return {
        id: row.id,
        investor_id: row.investorId,
        client_code: row.clientCode,
        name: [row.primaryHolderFirstName, row.primaryHolderMiddleName, row.primaryHolderLastName]
          .filter(Boolean)
          .join(" "),
        pan: row.primaryHolderPan,
        email: row.email,
        mobile: row.indianMobileNo,
        gender: row.gender,
        dob: row.primaryHolderDobIncorporation,
        tax_status: row.taxStatus,
        holding_nature: row.holdingNature,
        form_step: row.formStep,
        ucc_created: row.uccCreated === 1,
        ucc_status: row.uccCreated === 1 ? "CREATED" : "NOT CREATED",
        reg_id: row.regId,
        reg_status: row.regStatus,
        reg_remark: row.regRemark,
        fatca_reg_id: row.fatcaRegId,
        fatca_status: row.fatcaStatus,
        fatca_remark: row.fatcaRemark,
        fatca_uploaded: row.fatcaStatus === "REG_SUCCESS",
        fatca_submitted_at: row.fatcaSubmittedAt,
        created_at: row.createdAt,
        updated_at: row.updatedAt,
        // Bank details
        banks: [
          row.accountNo1
            ? {
                account_no: row.accountNo1,
                account_type: row.accountType1 || "SB",
                ifsc_code: row.ifscCode1 || "",
                micr_no: row.micrNo1 || "",
                bank_name: row.bankName1 || "",
                branch_name: row.branchName1 || "",
                default_bank_flag: row.defaultBankFlag1 || "N",
              }
            : null,
          row.accountNo2
            ? {
                account_no: row.accountNo2,
                account_type: row.accountType2 || "SB",
                ifsc_code: row.ifscCode2 || "",
                micr_no: row.micrNo2 || "",
                bank_name: row.bankName2 || "",
                branch_name: row.branchName2 || "",
                default_bank_flag: row.defaultBankFlag2 || "N",
              }
            : null,
        ].filter(Boolean),
        // Latest log from ucc_registration_logs
        latest_nse_log: latestLog
          ? {
              log_id: latestLog.id,
              status: latestLog.status,
              remark: latestLog.remark,
              reg_id: latestLog.regId,
              reg_status: latestLog.regStatus,
              reg_remark: latestLog.regRemark,
              submitted_at: latestLog.createdAt,
            }
          : null,
      };
    });

    return sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Investor list fetched successfully",
        data: {
          investors,
          pagination: {
            total: count,
            page: pageNum,
            limit: limitNum,
            total_pages: Math.ceil(count / limitNum),
          },
        },
      },
      "ucc-investor-list"
    );
  } catch (error) {
    ErrorLogger.write({ type: "ucc-investor-list error", error });
    serverError(res, error);
  }
});


export default router;

module.exports = router;