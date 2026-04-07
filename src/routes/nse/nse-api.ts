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
  saveUCCStep3
} from "./nse-handler";
import ErrorLogger from "../../db/core/logger/error-logger";
import { serverError } from "proses-response";
import https from "https";
import { CookieJar } from "tough-cookie";
import { apiRequest } from "../../services/apirequest.service";
import { AxiosRequestConfig } from "axios";
import { financialRateLimit, exportRateLimit } from "../../middlewares/rateLimit";

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


export default router;

module.exports = router;