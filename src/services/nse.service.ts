
import axios from "axios";
import configs from "../config/config";// adjust path as needed
import environment from "../environment";
import https from "https";


const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = (configs as { [key: string]: any })[environment];



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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/CLIENTCOMMON183';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  console.log("Request URL:", url);
  console.log("Member ID:", memberId);
  console.log("Auth Token Available:", !!authToken);

  if (!url) {
    console.error("❌ ERROR: NSE UCC URL missing");
    throw new Error("NSE UCC URL is not configured");
  }

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/transaction/NORMAL';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  console.log("Request URL:", url);
  console.log("Member ID:", memberId);
  console.log("Auth Token Available:", !!authToken);

  if (!url) {
    console.error("❌ ERROR: NSE Transaction URL missing");
    throw new Error("NSE Transaction URL is not configured");
  }

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/transaction/NORMAL';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  console.log("Request URL:", url);
  console.log("Member ID:", memberId);
  console.log("Auth Token Available:", !!authToken);

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/transaction/SWITCH';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/product/XSIP';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/product/SIP';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/product/STP';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/product/SWP';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/transaction/CANCEL';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/product/STP/CANCEL';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/BANKDTL';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/product/MANDATE';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/product/MANDATE';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/reporting/provisional';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/reporting/order-status';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/registration/BANK/ELOG/UPLOAD';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/reporting/member-fund-allocation';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

  const url = 'https://nseinvestuat.nseindia.com/nsemfdesk/api/v2/reporting/2fa-report';
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';

  const headers = {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };

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

// ══════════════════════════════════════════════════════════════
//  NEW SERVICE FUNCTIONS FOR COMPLETE NSE MODULE
// ══════════════════════════════════════════════════════════════

const NSE_BASE_URL = 'https://nseinvestuat.nseindia.com';

function getNseHeaders() {
  const memberId = process.env.NSE_MEMBER_ID || '1003039';
  const authToken = process.env.NSE_AUTH_TOKEN || 'Basic QURNSU46TmprMFptVTJaR016TURJd05EUTFPVFU0WXpkbFpqQTROamc1TlRaak4yRTZPak14T1dSbFpqTTVPV1kyT0RJME0yRmtNV1V6TmpObU1ETm1ZVEV4T1dVd09qcGhTMDVNUzFsNE55OXlOVGxHYm5STmVWZG5UeXRuZDBOamQwbFBkbWh3WTNOUGJ6QkZjRVZEY25JMFZIWk1lVWswVnpsbFRWZExjSGxoYlN0dVp6Y3g=';
  return {
    'memberId': memberId,
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Authorization': authToken,
    'Cookie': process.env.NSE_COOKIE || ''
  };
}

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

