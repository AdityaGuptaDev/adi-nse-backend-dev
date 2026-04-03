import axios from 'axios';

export async function sendAadhaarOtp(aadhaar_number: string): Promise<any> {

  const url = process.env.CASHFREE_SEND_AADHAAR_OTP_URL;
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

  if (!url) {
    throw new Error('Cashfree Aadhaar OTP URL is not configured');
  }
  if (!clientId || !clientSecret) {
    throw new Error('Cashfree credentials are not configured');
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-client-id': clientId,
    'x-client-secret': clientSecret,
  };

  try {
    const requestPayload = { aadhaar_number };

    const response = await axios.post(url, requestPayload, { headers });

    return response.data;
  } catch (error: any) {
    const res = error.response?.data;
    throw new Error(res?.message || 'Aadhaar OTP request failed');
  }
}

export async function verifyAadhaarOtp(
  otp: string,
  refId: string,
): Promise<any> {
  
  const url = process.env.CASHFREE_VERIFY_AADHAAR_OTP_URL || '';
  const headers = {
    'Content-Type': 'application/json',
    'x-client-id': process.env.CASHFREE_CLIENT_ID!,
    'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
  };

  try {
    const requestPayload = {otp: otp,ref_id: refId};
    const response = await axios.post(url, requestPayload, { headers });


    return response.data;
  } catch (error: any) {
    const res = error.response?.data;
    throw new Error(res?.message || 'Aadhaar OTP request failed');
  }
}

export async function verifyPan(
  pan: string, name: string
): Promise<any> {
  
  const url = process.env.CASHFREE_VERIFY_PAN_URL || '';
  const headers = {
    'Content-Type': 'application/json',
    'x-client-id': process.env.CASHFREE_CLIENT_ID!,
    'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
  };

  try {
    const requestPayload = {pan, name};
    const response = await axios.post(url, requestPayload, { headers });


    return response.data;
  } catch (error: any) {
    const res = error.response?.data;
    throw new Error(res?.message || 'Aadhaar OTP request failed');
  }
}

//verify pan lite -
export async function verifyPanLite(
  verification_id:String ,pan: string, name: string,dob:String
): Promise<any> {
  
  const url = process.env.CASHFREE_VERIFY_PAN_LITE_URL || '';
  const headers = {
    'Content-Type': 'application/json',
    'x-client-id': process.env.CASHFREE_CLIENT_ID!,
    'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
  };

  try {
    const requestPayload = {verification_id,pan, name,dob};
    const response = await axios.post(url, requestPayload, { headers });


    return response.data;
  } catch (error: any) {
    const res = error.response?.data;
    throw new Error(res?.message || 'PAN Verification failed');
  }
}


// export async function verifyBank(
//   bank_account: string,
//   ifsc: string,
//   name: string,
//   phone: string,
// ): Promise<any> {
  
//   const url = process.env.CASHFREE_VERIFY_BANK_ACCOUNT_URL || '';
//   const headers = {
//     'Content-Type': 'application/json',
//     'x-client-id': process.env.CASHFREE_CLIENT_ID!,
//     'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
//   };

//   try {
//     const requestPayload = {bank_account, ifsc, name, phone};
//     const response = await axios.post(url, requestPayload, { headers });


//     return response.data;
//   } catch (error: any) {
//     const res = error.response?.data;
//     throw new Error(res?.message || 'Bank Verification failed');
//   }
// }


export async function verifyBank(
  bank_account: string,
  ifsc: string,


): Promise<any> {
  
  const url = process.env.CASHFREE_VERIFY_BANK_ACCOUNT_URL || '';
  const headers = {
    'Content-Type': 'application/json',
    'x-client-id': process.env.CASHFREE_CLIENT_ID!,
    'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
  };

  try {
    const requestPayload = {bank_account, ifsc};
    const response = await axios.post(url, requestPayload, { headers });


    return response.data;
  } catch (error: any) {
    const res = error.response?.data;
    throw new Error(res?.message || 'Bank Verification failed');
  }
}

