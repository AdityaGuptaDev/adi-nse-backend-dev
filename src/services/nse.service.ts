
import axios from "axios";
import configs from "../config/config";// adjust path as needed
import environment from "../environment";
import https from "https";
import crypto from "crypto";


const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = (configs as { [key: string]: any })[environment];

// ══════════════════════════════════════════════════════════════
//  NSE API — centralized base URL + dynamic Authorization builder
// ══════════════════════════════════════════════════════════════
//
// Switch UAT↔Prod via .env. NSE_AUTH_TOKEN is NOT used: per NSEIL NNF
// spec v1.9.6 §"Common Authentication", the Basic auth header must be
// regenerated on every request because it embeds a fresh random salt+iv
// and a freshly AES-128 encrypted password. We build it dynamically.
//
// Algorithm (doc pg 5-6):
//   1. salt = random 16-byte alphanumeric (hex), iv = same
//   2. plain_text = "<API_SECRET>|<RANDOM_NUMBER>"
//   3. cipher = AES-128-CBC( key = MEMBER_API_KEY[:16],
//                            iv  = iv[:16],
//                            data = plain_text ) → base64
//   4. encrypted_password = base64( "<iv>::<salt>::<cipher>" )
//   5. Authorization = "Basic " + base64( "<LOGIN_ID>:<encrypted_password>" )
//
// UAT reference values (commented in .env for rollback only):
//   NSE_BASE_URL = https://nseinvestuat.nseindia.com, NSE_MEMBER_ID = 1003039
//
// Prod headers per NSE connection-prerequisite:
//   Accept must be BLANK (Akamai blocks Accept:application/json)
//   Accept-Language: en-US, Referer set, no static Authorization

export const NSE_BASE_URL = (process.env.NSE_BASE_URL || '').trim();

/**
 * Build a fresh `Basic …` Authorization header per NSEIL NNF v1.9.6 §Common
 * Authentication. Called on every request because salt+iv must be random.
 *
 * Algorithm matches NSEInvest's official Postman collection (AesUtil):
 *   key       = PBKDF2-SHA1( passPhrase=api_key_member,
 *                            salt=hexDecode(salt), iterations=1000,
 *                            keyLen=16 bytes )
 *   ciphertext= AES-128-CBC/PKCS7( key, iv=hexDecode(iv), plain_text )
 *   encPwd    = base64( iv + "::" + salt + "::" + base64(ciphertext) )
 *   header    = "Basic " + base64( LOGIN_ID + ":" + encPwd )
 *
 * salt and iv are themselves random 128-bit values rendered as 32-char
 * lowercase hex strings (as in the spec example).
 */
export function buildNseAuthHeader(): string {
  const loginId = (process.env.NSE_LOGIN_ID || '').trim();
  const apiSecret = (process.env.NSE_API_SECRET || '').trim();
  const memberApiKey = (process.env.NSE_MEMBER_API_KEY || '').trim();

  if (!loginId || !apiSecret || !memberApiKey) {
    console.warn('[NSE] NSE_LOGIN_ID / NSE_API_SECRET / NSE_MEMBER_API_KEY missing — auth will fail');
    return '';
  }

  // 128-bit random salt + iv, rendered as 32-char hex (the wire format).
  const salt = crypto.randomBytes(16).toString('hex');
  const iv = crypto.randomBytes(16).toString('hex');

  // plain_text = "<API_SECRET>|<RANDOM>"; doc example uses 11-digit random.
  const rand = Math.floor(Math.random() * 1e11).toString();
  const plainText = `${apiSecret}|${rand}`;

  // PBKDF2 derives the AES key from the member key + salt (SHA-1, 1000 iters,
  // 16-byte output) — this is what CryptoJS.PBKDF2 with keySize 4 / iters 1000
  // does in the official Postman collection.
  const saltBuf = Buffer.from(salt, 'hex');
  const ivBuf = Buffer.from(iv, 'hex');
  const keyBuf = crypto.pbkdf2Sync(memberApiKey, saltBuf, 1000, 16, 'sha1');

  const cipher = crypto.createCipheriv('aes-128-cbc', keyBuf, ivBuf);
  let aesEncrypted = cipher.update(plainText, 'utf8', 'base64');
  aesEncrypted += cipher.final('base64');

  // Encrypted Password = base64(iv::salt::aes_encrypted_val)
  const encryptedPassword = Buffer.from(`${iv}::${salt}::${aesEncrypted}`, 'utf8').toString('base64');

  // Authorization = Basic base64(LOGIN_ID:encryptedPassword)
  const basic = Buffer.from(`${loginId}:${encryptedPassword}`, 'utf8').toString('base64');
  return `Basic ${basic}`;
}

export function getNseHeaders(): Record<string, string> {
  const memberId = process.env.NSE_MEMBER_ID || '';

  if (!NSE_BASE_URL) {
    console.warn('[NSE] NSE_BASE_URL is not set in .env');
  }
  if (!memberId) {
    console.warn('[NSE] NSE_MEMBER_ID is not set in .env');
  }

  return {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    // NSE prod: Accept must be blank; Accept-Language en-US; Referer present.
    'Accept': '',
    'Accept-Language': 'en-US',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    // Built fresh per request — salt+iv must be random per the NSE spec.
    'Authorization': buildNseAuthHeader(),
    'Referer': process.env.NSE_REFERER || '',
    'Cookie': process.env.NSE_COOKIE || '',
  };
}



// Hardcoded payload function (similar to your existing patterns)
const getHardcodedUccPayload = () => {
  return {
    reg_details: [
      {
        client_code: "21283",//AUTO-GENERATED, UPDATE AS NEEDED-LIMIT = 10
        primary_holder_first_name: "Nitish",  //REQUIRED
        primary_holder_middle_name: "R",//OPTIONAL
        primary_holder_last_name: "TOPIWALA",//OPTIONAL
        tax_status: "01",//M 
        gender: "M",//M/F/O
        primary_holder_dob_incorporation: "04-11-1995",//M
        occupation_code: "01",
        holding_nature: "SI",
        second_holder_first_name: "",//OPTIONAL
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
        guardian_dob: "",//OPTIONAL
        primary_holder_pan_exempt: "Y",
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
        cmbp_id: "12345666",//by own from cdsl website or nsdl website
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
        cheque_name: "MY CHEQUE NAME",//optional
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
        primary_holder_kyc_type: "C",//Mandatory if PAN exempt = Y
        primary_holder_ckyc_number: "1234567891",//optional if kyc type is C
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
};

// Main service function (following your sendAadhaarOtp pattern)
export async function nseUccRegistration(payload: any): Promise<any> {
  console.log("========== nseUccRegistration() STARTED ==========");
  console.log("Preparing UCC registration request");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/CLIENTCOMMON183
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/registration/CLIENTCOMMON183`;
  const headers = getNseHeaders();

  console.log("Request URL:", url);
  console.log("Member ID:", headers.memberId);
  console.log("Auth Token Available:", !!headers.Authorization);

  if (!NSE_BASE_URL) {
    console.error("❌ ERROR: NSE_BASE_URL missing");
    throw new Error("NSE_BASE_URL is not configured");
  }

  console.log("Request Headers:", {
    ...headers,
    'Authorization': 'Basic [HIDDEN]', // Hide sensitive data in logs
    'Cookie': '[HIDDEN]'
  });

  try {
    // const requestPayload = getHardcodedUccPayload();
    const requestPayload = payload;

    console.log("Step 1: Preparing Request Payload...");
    console.log("Request Body:", JSON.stringify(requestPayload, null, 2));

    console.log("Step 2: Sending Request to NSE API...");
    const response = await axios.post(url, requestPayload, { headers });

    console.log("✔ API Response Received:");
    console.log("NSE UCC Registration Response:", response.data);

    console.log("========== nseUccRegistration() COMPLETED ==========");
    return response.data;

  } catch (error: any) {
    console.error("❌ Error Occurred while registering UCC with NSE");
    console.error(error);

    // =============================
    // 🔍 Detailed Error Diagnostics (following your pattern)
    // =============================
    if (error.errors) {
      console.error("Validation Errors:", error.errors);
    }
    if (error.parent) {
      console.error("DB Error Parent:", error.parent);
    }
    if (error.original) {
      console.error("Original Error:", error.original);
    }
    if (error.fields) {
      console.error("Error Fields:", error.fields);
    }
    if (error.sql) {
      console.error("Executed SQL:", error.sql);
    }

    if (error.response) {
      console.error("Error Status:", error.response.status);
      console.error("Error Response Data:", error.response.data);
      console.error("Error Headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received from NSE server");
      console.error("Request:", error.request);
    }

    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "NSE UCC registration request failed";

    throw new Error(errorMessage);

  } finally {
    console.log("========== nseUccRegistration() PROCESS ENDED ==========");
  }
}

// Optional: Export payload function if needed elsewhere
export { getHardcodedUccPayload };

// NSE Transaction API service function
export async function nseTransactionApi(payload: any): Promise<any> {
  console.log("========== nseTransactionApi() STARTED ==========");
  console.log("Preparing NSE transaction request");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/transaction/NORMAL
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/transaction/NORMAL`;
  const headers = getNseHeaders();

  console.log("Request URL:", url);
  console.log("Member ID:", headers.memberId);
  console.log("Auth Token Available:", !!headers.Authorization);

  if (!NSE_BASE_URL) {
    console.error("❌ ERROR: NSE_BASE_URL missing");
    throw new Error("NSE_BASE_URL is not configured");
  }

  console.log("Request Headers:", {
    ...headers,
    'Authorization': 'Basic [HIDDEN]', // Hide sensitive data in logs
    'Cookie': '[HIDDEN]'
  });

  try {
    console.log("Step 1: Preparing Request Payload...");
    console.log("Request Body:", JSON.stringify(payload, null, 2));

    console.log("Step 2: Sending Request to NSE Transaction API...");
    const response = await axios.post(url, payload, { headers });

    console.log("✔ API Response Received:");
    console.log("NSE Transaction Response:", response.data);

    console.log("========== nseTransactionApi() COMPLETED ==========");
    return response.data;

  } catch (error: any) {
    console.error("❌ Error Occurred while processing transaction with NSE");
    console.error(error);

    // Detailed Error Diagnostics
    if (error.response) {
      console.error("Error Status:", error.response.status);
      console.error("Error Response Data:", error.response.data);
      console.error("Error Headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received from NSE server");
      console.error("Request:", error.request);
    }

    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "NSE transaction request failed";

    throw new Error(errorMessage);

  } finally {
    console.log("========== nseTransactionApi() PROCESS ENDED ==========");
  }
}

// NSE Redemption Transaction API service function
export async function nseRedemptionApi(payload: any): Promise<any> {
  console.log("========== nseRedemptionApi() STARTED ==========");
  console.log("Preparing NSE redemption request");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/transaction/NORMAL
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/transaction/NORMAL`;
  const headers = getNseHeaders();

  console.log("Request URL:", url);
  console.log("Member ID:", headers.memberId);
  console.log("Auth Token Available:", !!headers.Authorization);

  console.log("Request Headers:", {
    ...headers,
    'Authorization': 'Basic [HIDDEN]',
    'Cookie': '[HIDDEN]'
  });

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    console.log("Sending request to:", url);
    const response = await axios.post(url, payload, { headers });
    console.log("NSE Redemption Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ NSE redemption error occurred");
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: url
    });
    
    if (error.response?.status === 404) {
      console.error("❌ 404 Error - The URL might be incorrect or the endpoint doesn't exist");
      console.error("Please verify the NSE redemption endpoint URL");
    }
    
    throw new Error(error.response?.data?.message || error.message || "NSE redemption request failed");
  }
}

// NSE Switch Transaction API service function
export async function nseSwitchApi(payload: any): Promise<any> {
  console.log("========== nseSwitchApi() STARTED ==========");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/transaction/SWITCH
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/transaction/SWITCH`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE Switch Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE switch error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE switch request failed");
  }
}

// NSE XSIP Registration API service function
export async function nseXsipRegistrationApi(payload: any): Promise<any> {
  console.log("========== nseXsipRegistrationApi() STARTED ==========");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/product/XSIP
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/registration/product/XSIP`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE XSIP Registration Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE XSIP registration error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE XSIP registration request failed");
  }
}

// NSE SIP Registration API service function
export async function nseSipRegistrationApi(payload: any): Promise<any> {
  console.log("========== nseSipRegistrationApi() STARTED ==========");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/product/SIP
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/registration/product/SIP`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE SIP Registration Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE SIP registration error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE SIP registration request failed");
  }
}

// NSE STP Registration API service function
export async function nseStpRegistrationApi(payload: any): Promise<any> {
  console.log("========== nseStpRegistrationApi() STARTED ==========");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/product/STP
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/registration/product/STP`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE STP Registration Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE STP registration error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE STP registration request failed");
  }
}

// NSE SWP Registration API service function
export async function nseSwpRegistrationApi(payload: any): Promise<any> {
  console.log("========== nseSwpRegistrationApi() STARTED ==========");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/product/SWP
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/registration/product/SWP`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE SWP Registration Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE SWP registration error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE SWP registration request failed");
  }
}

// NSE Order Cancellation API service function
export async function nseOrderCancellationApi(payload: any): Promise<any> {
  console.log("========== nseOrderCancellationApi() STARTED ==========");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/transaction/CANCEL
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/transaction/CANCEL`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE Order Cancellation Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE order cancellation error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE order cancellation request failed");
  }
}

// NSE STP Cancellation API service function
export async function nseStpCancellationApi(payload: any): Promise<any> {
  console.log("========== nseStpCancellationApi() STARTED ==========");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/product/STP/CANCEL
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/registration/product/STP/CANCEL`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE STP Cancellation Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE STP cancellation error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE STP cancellation request failed");
  }
}

// NSE Client Bank Details API service function
export async function nseClientBankDetailsApi(payload: any): Promise<any> {
  console.log("========== nseClientBankDetailsApi() STARTED ==========");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/BANKDTL
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/registration/BANKDTL`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE Client Bank Details Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE client bank details error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE client bank details request failed");
  }
}

// NSE Mandate Registration Purchase API service function
export async function nseMandatePurchaseApi(payload: any): Promise<any> {
  console.log("========== nseMandatePurchaseApi() STARTED ==========");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/product/MANDATE
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/registration/product/MANDATE`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE Mandate Purchase Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE mandate purchase error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE mandate purchase request failed");
  }
}

// NSE Mandate Registration Redemption API service function
export async function nseMandateRedemptionApi(payload: any): Promise<any> {
  console.log("========== nseMandateRedemptionApi() STARTED ==========");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/product/MANDATE
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/registration/product/MANDATE`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE Mandate Redemption Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE mandate redemption error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE mandate redemption request failed");
  }
}

// NSE Provisional Report API service function
export async function nseProvisionalReportApi(payload: any): Promise<any> {
  console.log("========== nseProvisionalReportApi() STARTED ==========");

  // Per NSEMF API spec v1.9.6 §"Order Status Reports API" — provisional
  // orders feed. Earlier code used /reporting/provisional which 404s on
  // prod; canonical path is /reports/PROV_ORDERS.
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/reports/PROV_ORDERS`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE Provisional Report Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE provisional report error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE provisional report request failed");
  }
}

// NSE Order Status API service function
export async function nseOrderStatusApi(payload: any): Promise<any> {
  console.log("========== nseOrderStatusApi() STARTED ==========");

  // Per NSEMF API spec v1.9.6 §"Order Status Reports API" — order-status
  // feed. Earlier code used /reporting/order-status which 404s on prod;
  // canonical path is /reports/ORDER_STATUS.
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/reports/ORDER_STATUS`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE Order Status Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE order status error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE order status request failed");
  }
}

// NSE Bank eLog Upload API service function
export async function nseBankElogUploadApi(payload: any): Promise<any> {
  console.log("========== nseBankElogUploadApi() STARTED ==========");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/BANK/ELOG/UPLOAD
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/registration/BANK/ELOG/UPLOAD`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE Bank eLog Upload Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE bank eLog upload error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE bank eLog upload request failed");
  }
}

// NSE Member Fund Allocation API service function
export async function nseMemberFundAllocationApi(payload: any): Promise<any> {
  console.log("========== nseMemberFundAllocationApi() STARTED ==========");

  // Per NSEMF API spec v1.9.6 §"Member fund allocation order wise Report".
  // Earlier code used /reporting/member-fund-allocation which 404s on prod.
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/reports/MEMBER_FUND_ALLOCATION/ORDER_WISE`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE Member Fund Allocation Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE member fund allocation error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE member fund allocation request failed");
  }
}

// NSE 2FA Report API service function
export async function nseTwoFaReportApi(payload: any): Promise<any> {
  console.log("========== nseTwoFaReportApi() STARTED ==========");

  // Per NSEMF API spec v1.9.6 §"2FA Report API". Earlier code used
  // /reporting/2fa-report which 404s on prod; canonical path is /reports/2fa.
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/reports/2fa`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    const response = await axios.post(url, payload, { headers });
    console.log("NSE 2FA Report Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE 2FA report error:", error);
    throw new Error(error.response?.data?.message || error.message || "NSE 2FA report request failed");
  }
}

// NSE Transaction Detail Report API service function
// Endpoint per NSEIL MF Service System Protocol v1.9.6, section "Transaction Detail Report API".
// Date gap between from_date/to_date: 7 days max (3 days if date_type === LAST_ACTIVITY_DATE).
// order_id / systematic_reg_id accept up to 50 comma-separated ids and override other filters.
//
// Returns { ok: boolean, data, errorRemark } instead of throwing on upstream
// failure so the handler can persist a FAILED log row and the route can
// surface a clear error to the frontend instead of a generic 500.
export async function nseTransactionDetailReportApi(payload: any): Promise<{
  ok: boolean;
  httpStatus: number | null;
  data: any;
  errorRemark: string;
}> {
  console.log("========== nseTransactionDetailReportApi() STARTED ==========");

  // UAT URL (reference): https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/reports/TRANSACTION_DETAIL_REPORT
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/reports/TRANSACTION_DETAIL_REPORT`;
  const headers = getNseHeaders();

  try {
    console.log("Request Body:", JSON.stringify(payload, null, 2));
    // 60s hard timeout — NSE UAT can hang on cold paths; without this the
    // express response never comes back and the frontend shows "no response".
    const response = await axios.post(url, payload, {
      headers,
      timeout: 60000,
      validateStatus: () => true, // we inspect the body + status ourselves
    });
    console.log("NSE Transaction Detail Report HTTP Status:", response.status);
    console.log("NSE Transaction Detail Report Response:", response.data);

    const body = response.data;
    const ok = response.status >= 200 && response.status < 300
      && (body?.response_status === "S" || body?.data?.response_status === "S");
    const errorRemark = body?.error_remark
      || body?.data?.error_remark
      || body?.message
      || (ok ? "" : `NSE returned HTTP ${response.status}`);

    return { ok, httpStatus: response.status, data: body, errorRemark };
  } catch (error: any) {
    const axiosMsg = error?.response?.data?.message
      || error?.response?.data?.error_remark
      || error?.message
      || "NSE transaction detail report request failed";
    console.error("NSE transaction detail report error:", error?.response?.data || error?.message);
    return {
      ok: false,
      httpStatus: error?.response?.status ?? null,
      data: error?.response?.data ?? null,
      errorRemark: axiosMsg,
    };
  }
}

// ══════════════════════════════════════════════════════════════
//  NEW SERVICE FUNCTIONS FOR COMPLETE NSE MODULE
// ══════════════════════════════════════════════════════════════
// (NSE_BASE_URL + getNseHeaders are defined at the top of this file.)

// Scheme Master Download API
export async function nseScheMasterDownloadApi(fileType: string): Promise<any> {
  console.log("========== nseSchemeMasterDownloadApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/reports/MASTER_DOWNLOAD`;
  try {
    const response = await axios.post(url, { file_type: fileType }, { headers: getNseHeaders() });
    console.log("NSE Scheme Master Download Response received, type:", fileType);
    return response.data;
  } catch (error: any) {
    console.error("NSE scheme master download error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE scheme master download failed");
  }
}

// Get Short URL Link API
export async function nseGetLinkApi(payload: any): Promise<any> {
  console.log("========== nseGetLinkApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/reports/GET_LINK`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE Get Link Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE get link error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE get link request failed");
  }
}

// Resend Communication API
export async function nseResendCommApi(payload: any): Promise<any> {
  console.log("========== nseResendCommApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/registration/RESEND_COMM`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE Resend Comm Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE resend comm error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE resend comm request failed");
  }
}

// Scan Mandate Image Upload API
// Doc: POST /nsemfdesk/api/v2/fileupload/MANDATEIMG
// Uploads a base64 scan of the signed physical mandate form for an already
// registered mandate. Only applicable for Physical (mandate_type "X").
export async function nseMandateImageUploadApi(payload: {
  client_code: string;
  mandate_id: string;
  file_name: string;
  file_data: string;
}): Promise<any> {
  console.log("========== nseMandateImageUploadApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/fileupload/MANDATEIMG`;
  try {
    // Don't log file_data (huge base64). Log metadata only.
    console.log("Mandate Image Upload request:", {
      client_code: payload.client_code,
      mandate_id: payload.mandate_id,
      file_name: payload.file_name,
      file_data_length: payload.file_data?.length || 0,
    });
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE Mandate Image Upload Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE mandate image upload error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE mandate image upload failed");
  }
}

// Mandate Status Report API
export async function nseMandateStatusApi(payload: any): Promise<any> {
  console.log("========== nseMandateStatusApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/reports/MANDATE_STATUS`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE Mandate Status Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE mandate status error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE mandate status request failed");
  }
}

// Purchase Orders Payment API
export async function nsePurchasePaymentApi(payload: any): Promise<any> {
  console.log("========== nsePurchasePaymentApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/payments/purchase_payment`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE Purchase Payment Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE purchase payment error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE purchase payment request failed");
  }
}

// UPI Payment Status Check API
export async function nseUpiStatusCheckApi(payload: any): Promise<any> {
  console.log("========== nseUpiStatusCheckApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/payments/upi_status_check`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE UPI Status Check Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE UPI status check error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE UPI status check failed");
  }
}

// SIP Cancellation API
export async function nseSipCancellationApi(payload: any): Promise<any> {
  console.log("========== nseSipCancellationApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/cancellation/SIP_CAN`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE SIP Cancellation Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE SIP cancellation error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE SIP cancellation request failed");
  }
}

// XSIP Cancellation API
export async function nseXsipCancellationApi(payload: any): Promise<any> {
  console.log("========== nseXsipCancellationApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/cancellation/XSIP_CAN`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE XSIP Cancellation Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE XSIP cancellation error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE XSIP cancellation request failed");
  }
}

// SWP Cancellation API
export async function nseSwpCancellationApi(payload: any): Promise<any> {
  console.log("========== nseSwpCancellationApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/cancellation/SWP_CAN`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE SWP Cancellation Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE SWP cancellation error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE SWP cancellation request failed");
  }
}

// SIP/XSIP Pause API
export async function nseXsipPauseApi(payload: any): Promise<any> {
  console.log("========== nseXsipPauseApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/registration/XSIP_PAUSE`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE XSIP Pause Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE XSIP pause error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE XSIP pause request failed");
  }
}

// FATCA Upload API (Individual)
export async function nseFatcaUploadApi(payload: any): Promise<any> {
  console.log("========== nseFatcaUploadApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/registration/FATCA`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE FATCA Upload Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE FATCA upload error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE FATCA upload request failed");
  }
}

// KYC Status Check API
export async function nseKycCheckApi(payload: any): Promise<any> {
  console.log("========== nseKycCheckApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/utility/KYC_CHECK`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE KYC Check Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE KYC check error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE KYC check request failed");
  }
}

// Client Authorization Report API
export async function nseClientAuthReportApi(payload: any): Promise<any> {
  console.log("========== nseClientAuthReportApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/reports/client_authorization`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE Client Auth Report Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE client auth report error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE client auth report request failed");
  }
}

// AOF Image Upload API
export async function nseAofUploadApi(payload: any): Promise<any> {
  console.log("========== nseAofUploadApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/fileupload/AOFIMG`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE AOF Upload Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE AOF upload error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE AOF upload request failed");
  }
}

// Allotment Statement Report API
export async function nseAllotmentStatementApi(payload: any): Promise<any> {
  console.log("========== nseAllotmentStatementApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/reports/ALLOTMENT_STATEMENT`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE Allotment Statement Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE allotment statement error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE allotment statement request failed");
  }
}

// Redemption Payout Date Report API
export async function nseRedemptionPayoutApi(payload: any): Promise<any> {
  console.log("========== nseRedemptionPayoutApi() STARTED ==========");
  const url = `${NSE_BASE_URL}/nsemfdesk/api/v2/reports/REDEMPTION_PAYOUT`;
  try {
    const response = await axios.post(url, payload, { headers: getNseHeaders() });
    console.log("NSE Redemption Payout Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("NSE redemption payout error:", error?.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "NSE redemption payout request failed");
  }
}

