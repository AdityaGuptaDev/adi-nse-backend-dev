import axios from 'axios';

export async function sendAadhaarOtp(aadhaar_number: string): Promise<any> {

  console.log("========== sendAadhaarOtp() STARTED ==========");
  console.log("Input Aadhaar Number:", aadhaar_number);

  const url = process.env.CASHFREE_SEND_AADHAAR_OTP_URL;
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

  console.log("Request URL:", url);
  console.log("Client ID:", clientId);
  console.log("Client Secret Available:", !!clientSecret);

  if (!url) {
    console.error("❌ ERROR: Cashfree Aadhaar OTP URL missing");
    throw new Error("Cashfree Aadhaar OTP URL is not configured");
  }
  if (!clientId || !clientSecret) {
    console.error("❌ ERROR: Missing Cashfree credentials");
    throw new Error("Cashfree credentials are not configured");
  }

  const headers = {
    "Content-Type": "application/json",
    "x-client-id": clientId,
    "x-client-secret": clientSecret,
  };

  console.log("Request Headers:", headers);

  try {
    const requestPayload = { aadhaar_number };

    console.log("Step 1: Preparing Request Payload...");
    console.log("Request Body:", requestPayload);

    console.log("Step 2: Sending Request to Cashfree API...");
    const response = await axios.post(url, requestPayload, { headers });

    console.log("✔ API Response Received:");
    console.log("Cashfree Aadhaar OTP Response:", response.data);

    console.log("========== sendAadhaarOtp() COMPLETED ==========");
    return response.data;

  } catch (error: any) {
    console.error("❌ Error Occurred while sending Aadhaar OTP");
    console.error(error);

    // =============================
    // 🔍 Detailed Error Diagnostics
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
    }

    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Aadhaar OTP request failed";

    throw new Error(errorMessage);

  } finally {
    console.log("========== sendAadhaarOtp() PROCESS ENDED ==========");
  }
}


// export async function sendAadhaarOtp(
//   aadhaar_number: string,
// ): Promise<any> {
//    console.log("sendotp");

//   const url = process.env.CASHFREE_SEND_AADHAAR_OTP_URL || '';
//   const headers = {
//     'Content-Type': 'application/json',
//     'x-client-id': process.env.CASHFREE_CLIENT_ID!,
//     'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
//   };

//   try {
//     const requestPayload = {aadhaar_number};
//     const response = await axios.post(url, requestPayload, { headers });

//     console.log(response.data);

//     return response.data;}
//   // } catch (error: any) {
//   //   const res = error.response?.data;
//   //   throw new Error(res?.message || 'Aadhaar OTP request failed');
//   // }
// catch (error: any) {
//   console.error('Error sending Aadhaar OTP:', error);
//   const res = error.response?.data;
//   throw new Error(res?.message || 'Aadhaar OTP request failed');
// }
// }

export async function verifyAadhaarOtp(
  otp: string,
  refId: string
): Promise<any> {

  console.log("========== verifyAadhaarOtp() STARTED ==========");
  console.log("Input Payload:", { otp, refId });

  const url = process.env.CASHFREE_VERIFY_AADHAAR_OTP_URL || "";
  const headers = {
    "Content-Type": "application/json",
    "x-client-id": process.env.CASHFREE_CLIENT_ID!,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
  };

  console.log("Request URL:", url);
  console.log("Request Headers:", headers);

  try {
    const requestPayload = { otp, ref_id: refId };
    console.log("Step 1: Sending request to Cashfree API...");
    console.log("Request Body:", requestPayload);

    const response = await axios.post(url, requestPayload, { headers });

    console.log("✔ API Response Received");
    console.log("Cashfree Response:", response.data);

    console.log("========== verifyAadhaarOtp() COMPLETED ==========");
    return response.data;

  } catch (error: any) {
    console.error("❌ Error Occurred during Aadhaar OTP Verification API");
    console.error(error);

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
    }

    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Aadhaar OTP request failed";

    throw new Error(errorMessage);

  } finally {
    console.log("========== verifyAadhaarOtp() PROCESS ENDED ==========");
  }
}


export async function verifyPan(
  pan: string,
  name: string
): Promise<any> {

  console.log("========== verifyPan() STARTED ==========");
  console.log("Input Payload:", { pan, name });

  const url = process.env.CASHFREE_VERIFY_PAN_URL || "";
  const headers = {
    "Content-Type": "application/json",
    "x-client-id": process.env.CASHFREE_CLIENT_ID!,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
  };

  console.log("Request URL:", url);
  console.log("Request Headers:", headers);

  try {
    const requestPayload = { pan, name };

    console.log("Step 1: Sending request to Cashfree PAN API...");
    console.log("Request Body:", requestPayload);

    const response = await axios.post(url, requestPayload, { headers });

    console.log("✔ API Response Received from Cashfree");
    console.log("Cashfree PAN Response:", response.data);

    console.log("========== verifyPan() COMPLETED ==========");
    return response.data;

  } catch (error: any) {
    console.error("❌ Error Occurred during PAN Verification API");
    console.error(error);

    // ================================================
    // 🔍 Detailed Error Logging (same as your example)
    // ================================================
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
    }

    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);

    // Standard error return
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "PAN verification failed";

    throw new Error(errorMessage);

  } finally {
    console.log("========== verifyPan() PROCESS ENDED ==========");
  }
}


//verify pan lite -
export async function verifyPanLite(
  verification_id: string,
  pan: string,
  name: string,
  dob: string
): Promise<any> {

  console.log("========== verifyPanLite() STARTED ==========");
  console.log("Input Payload:", { verification_id, pan, name, dob });

  const url = process.env.CASHFREE_VERIFY_PAN_LITE_URL || "";
  const headers = {
    "Content-Type": "application/json",
    "x-client-id": process.env.CASHFREE_CLIENT_ID!,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
  };

  console.log("Request URL:", url);
  console.log("Request Headers:", headers);

  try {
    console.log("Step 1: Preparing request payload...");
    const requestPayload = { verification_id, pan, name, dob };
    console.log("Request Body:", requestPayload);

    console.log("Step 2: Sending request to Cashfree PAN Lite API...");
    const response = await axios.post(url, requestPayload, { headers });

    console.log("✔ API Response Received from Cashfree");
    console.log("Cashfree PAN Lite Response:", response.data);

    console.log("========== verifyPanLite() COMPLETED ==========");
    return response.data;

  } catch (error: any) {
    console.error("❌ Error Occurred during PAN Lite Verification API");
    console.error(error);

    // =====================================================
    // 🔍 Detailed Error Logging (same pattern everywhere)
    // =====================================================
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
    }

    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "PAN Lite verification failed";

    throw new Error(errorMessage);

  } finally {
    console.log("========== verifyPanLite() PROCESS ENDED ==========");
  }
}



export async function verifyBank(
  bank_account: string,
  ifsc: string,
  name: string,
  phone: string,
): Promise<any> {

  console.log("========== verifyBank() STARTED ==========");
  console.log("Input Payload:", { bank_account, ifsc, name, phone });

  const url = process.env.CASHFREE_VERIFY_BANK_ACCOUNT_URL || "";
  const headers = {
    "Content-Type": "application/json",
    "x-client-id": process.env.CASHFREE_CLIENT_ID!,
    "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
  };

  console.log("Request URL:", url);
  console.log("Request Headers:", headers);

  try {
    console.log("Step 1: Preparing request payload...");
    const requestPayload = { bank_account, ifsc, name, phone };
    console.log("Request Body:", requestPayload);

    console.log("Step 2: Sending request to Cashfree Bank Verification API...");
    const response = await axios.post(url, requestPayload, { headers });

    console.log("✔ API Response Received from Cashfree");
    console.log("Cashfree Bank Verification Response:", response.data);

    console.log("========== verifyBank() COMPLETED ==========");
    return response.data;

  } catch (error: any) {
    console.error("❌ Error Occurred during Bank Verification API");
    console.error(error);

    // =====================================================
    // 🔍 Detailed Error Logging (same as other functions)
    // =====================================================
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
    }

    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Bank verification failed";

    throw new Error(errorMessage);

  } finally {
    console.log("========== verifyBank() PROCESS ENDED ==========");
  }
}


