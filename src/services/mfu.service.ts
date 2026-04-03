import environment from "../environment";
import configs from "../config/config";
import { apiRequest } from "./apirequest.service";
import { MfuAccessToken, ReferenceNumber } from "../routes/mfu/mfu-model";
import { convertJsonToXml, convertXmlToJson } from "../utils/parser";
import { encrypt, decrypt } from "../utils/aesmfu";
import { CanRegisterResponse } from "../routes/mfu/can-register-response-dtl";
import { apiRequest2 } from "./apirequest.service.aditya";
import { Mandate } from "../routes/mfu/mandate-model";
const fs = require('fs');
import FormData from "form-data";
import { InvestorPortfolio } from "../routes/investor/investor-portfolio.model";
import { Console } from "console";
const crypto = require('crypto');
const qs = require('qs');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = (configs as { [key: string]: any })[environment];
const mfu = config.mfu;

// Function to auto-generate a uniqueId
function generateUniqueId() {
  return crypto.randomBytes(8).toString('hex');  // Random 16 character string
}

// Function to get the current timestamp in the required format
function getCurrentTimestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').split('.')[0]; // Format as 'YYYY-MM-DD HH:MM:SS'
}

// Define reqHeader object with parts from environment variables and auto-generated parts
let reqHeader = {
  entityId: config.mfu.entityId,
  version: "1.00",
  reqTS: getCurrentTimestamp(),
  apiType: "",  // Change apiType Dynamically
  uniqueId: generateUniqueId(),
};

interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Function to fetch a new access token from the external API
const getAccessToken = async (): Promise<AccessTokenResponse> => {
  const data = {
    "reqBody": {
      entityId: mfu.entityId,
      clientUser: mfu.clientId,
      clientPwd: mfu.clientSecret,
    }
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  const url = `${mfu.baseUrl}${mfu.accessToken}`;

  try {
    const response = await apiRequest({
      method: 'post',
      url,
      headers,
      data,
    });

    console.log("Access Token Response:", response);

    const { access_token, token_type, expires_in } = response;

    if (!access_token || !token_type || !expires_in) {
      throw new Error('Invalid token response');
    }

    return { access_token, token_type, expires_in };
  } catch (error) {
    // console.error("Error getting access token:", error);
    throw error;
  }
};

// Function to fetch and manage the access token in the database
export const fetchAccessToken = async (): Promise<MfuAccessToken> => {
  try {
    const now = new Date();



    // Step 1: Find the latest token from the DB
    let latestToken = await MfuAccessToken.findOne({
      order: [['createdAt', 'DESC']],
    });


    console.log("Latest Token from DB:", latestToken);

    // Step 2: If token doesn't exist or it's expired, fetch a new one and update the DB
    if (!latestToken || new Date(latestToken.expires_at) <= now) {
      console.log(new Date(latestToken?.dataValues.expires_at))

      // Fetch new token from the external API
      const newTokenData: AccessTokenResponse = await getAccessToken();

      const expires_at = new Date(Date.now() + newTokenData.expires_in * 3600 * 1000);


      if (latestToken) {
        // Step 3a: Update existing token if it was found
        await latestToken.update({
          access_token: newTokenData.access_token,
          token_type: newTokenData.token_type,
          expires_in: newTokenData.expires_in,
          expires_at,
          createdAt: now, // optional: reset createdAt for clarity
        });
        console.log('Access token updated.');
      } else {
        // Step 3b: If no token exists, create a new one
        latestToken = await MfuAccessToken.create({
          access_token: newTokenData.access_token,
          token_type: newTokenData.token_type,
          expires_in: newTokenData.expires_in,
          expires_at,
          createdAt: now,
        });
        console.log('Access token created.');
      }
    } else {
      console.log('Token is still valid.');
    }

    return latestToken;
  } catch (error) {
    console.error('Error saving or fetching access token:', error);
    throw error;
  }
};

const getHeaders = async () => {
  const token = await fetchAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.access_token}`,
  };
};

export const generateReference = async (date: Date = new Date()): Promise<string> => {
  try {
    // Get the latest sequence number used
    const maxSequenceRecord = await ReferenceNumber.findOne({
      order: [["sequence", "DESC"]],
    });

    // Determine the next sequence number, starting from 71 if no record is found
    const nextSequence = (maxSequenceRecord?.sequence ?? 70) + 1;

    const prefix = "V";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const datePart = `${yyyy}${mm}${dd}`;
    const sequencePart = String(nextSequence).padStart(4, "0");

    const referenceNo = `${prefix}${datePart}${sequencePart}`;

    // Save the newly generated reference number
    await ReferenceNumber.create({
      reference_no: referenceNo,
      sequence: nextSequence,
    });

    return referenceNo;

  } catch (error) {
    console.error("Error generating reference number:", error);
    throw new Error("Failed to generate reference number.");
  }
};


export const MFUCanFillEezzService = async (userBody: any) => {
  try {
    const headers = await getHeaders();

    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<CANIndFillEezzReq xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="CANIndFillEezzReq.xsd">`;
    const xmlFooter = `</CANIndFillEezzReq>`;
    const xmlResult = await convertJsonToXml(userBody);
    const finalXml = `${xmlHeader}${xmlResult.replace(/<\/?root>/g, '')}${xmlFooter}`;

    const url = config.mfu.baseUrl + config.mfu.apiCanCreate;

    console.log("url--", url)
    const configRequest = {
      method: 'post',
      url: url,
      headers: {
        'Content-Type': 'application/xml',
        'Authorization': `${headers.Authorization}`
      },
      data: finalXml
    };

    console.log(finalXml)


    const rawXmlResponse = await apiRequest2(configRequest);
    const response = await convertXmlToJson(rawXmlResponse);
    return response;

  } catch (error) {
    console.error("Error in MFUCanFillEezzService:", error);
    throw error;
  }
};


//Fetch UTRN Service API – Request
export const ApiFinTechFetchUtrn = async (userBody: any) => {

  const headers = await getHeaders();
  reqHeader.apiType = "FETCH-UTRN";

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });


  // URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiFetchUtrn;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log("Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error in ApiFinTechFetchUtrn :", error);
    throw error; // Rethrow the error to be handled by the caller
  }


}
//Normal Transaction Service API – Request
export const ApiFinTechNormalTxnService = async (userBody: any) => {
  console.log("userbody", userBody)

  reqHeader.apiType = "NORMAL-TXN";
  const headers = await getHeaders();

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });
  console.log("Request Data", data);
  //URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiNormalTxn;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log("Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error in ApiFinTechNormalTxnService:", error);
    throw error; // Rethrow the error to be handled by the caller
  }

}
//ApiFinTechSystematicTxnService
export const ApiFinTechSystematicTxnService = async (userBody: any) => {
  reqHeader.apiType = "SYS-TXN";
  const headers = await getHeaders();

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });
  console.log("Request Data", data);
  // URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiSystematicTxn;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log("Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error in ApiFinTechSystematicTxnService:", error);
    throw error; // Rethrow the error to be handled by the caller
  }


}

//ApiFinTechSystCancellationService
export const ApiFinTechSystCancellationService = async (userBody: any) => {

  reqHeader.apiType = "SYS-CANCEL-TXN";
  const headers = await getHeaders();

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });
  // URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiCancellationTxn;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log("Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error in ApiFinTechSystCancellationService:", error);
    throw error; // Rethrow the error to be handled by the caller
  }


}

//Transaction Order Auth Detail Service API – Request
export const ApiFinTechTxnAuthDetService = async (userBody: any) => {

  reqHeader.apiType = "TXN-AUT-DETH";
  const headers = await getHeaders();

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });
  // URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiTxnAuthdet;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log("Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error in ApiFinTechTxnAuthDetService:", error);
    throw error; // Rethrow the error to be handled by the caller
  }

}

//Transaction Order Approval Service API – Request
export const ApiFinTechTxnApprovalService = async (userBody: any) => {

  reqHeader.apiType = "TXN-APPROVAL";
  const headers = await getHeaders();

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });
  // URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiTxnApproval;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log(" Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error in ApiFinTechTxnApprovalService:", error);
    throw error; // Rethrow the error to be handled by the caller
  }

}


//Transaction Order History Service API – Request
export const ApiFinTechTxnHistoryService = async (userBody: any) => {
  reqHeader.apiType = "TXN-HIST";
  const headers = await getHeaders();

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });
  // URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiTxnHistory;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log(" Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error in ApiFinTechTxnHistoryService:", error);
    throw error; // Rethrow the error to be handled by the caller
  }

}

//CAN Validation Service API – Request
export const ApiFinTechCanValidationService = async (userBody: any) => {

  reqHeader.apiType = "CAN-VAL";
  const headers = await getHeaders();

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });
  // URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiCanValidation;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log(" Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error in ApiFinTechCanValidationService:", error);
    throw error; // Rethrow the error to be handled by the caller
  }


}

//CAN Fetch Service API – Request
export const ApiFinTechCanFetchService = async (userBody: any) => {

  reqHeader.apiType = "CAN-FETCH";
  const headers = await getHeaders();
  console.log("header ", headers);

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });
  // URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiCanFetch;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log(" Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error in ApiFinTechCanFetchService:", error);
    throw error; // Rethrow the error to be handled by the caller
  }


}
//PRN Validation API Service – Request
export const ApiFinTechPRNValidationService = async (userBody: any) => {

  reqHeader.apiType = "PRN-VAL";
  const headers = await getHeaders();

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });
  // URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiPrnValidation;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log(" Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error in ApiFinTechPRNValidationService:", error);
    throw error; // Rethrow the error to be handled by the caller
  }




}
//CAN Bank Validation Service API – Request
export const ApiFinTechBankValidationService = async (userBody: any) => {
  reqHeader.apiType = "CAN-BNK-VAL";
  const headers = await getHeaders();

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });
  // URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiBankValidation;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log(" Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error im ApiFinTechBankValidationService:", error);
    throw error; // Rethrow the error to be handled by the caller
  }



}

//Swap PayEezz Service API – Request
export const ApiFinTechSwpPayEezService = async (userBody: any) => {
  reqHeader.apiType = "SWP-PAYEEZ";
  const headers = await getHeaders();

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });
  // URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiSwapPayEez;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log(" Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error in ApiFinTechSwpPayEezService:", error);
    throw error; // Rethrow the error to be handled by the caller
  }

}



//CAN Folio Validation Service API – Request
export const ApiFinTechCanFolioValService = async (userBody: any) => {
  reqHeader.apiType = "CAN-FOL-VAL";
  const headers = await getHeaders();

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });
  // URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiCanFolioVal;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log(" Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error in ApiFinTechCanFolioValService:", error);
    throw error; // Rethrow the error to be handled by the caller
  }

}

//Investor Consent Entry Service API – Request
export const ApiFinTechInvConsentEntryService = async (userBody: any) => {

  reqHeader.apiType = "INV-CON-ENTRY";
  const headers = await getHeaders();

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });
  // URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiConcentEntry;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log(" Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error in ApiFinTechInvConsentEntryService:", error);
    throw error; // Rethrow the error to be handled by the caller
  }

}


//Investor Consent View Service API – Request
export const ApiFinTechInvConsentViewService = async (userBody: any) => {
  reqHeader.apiType = "INV-CON-VIEW";
  const headers = await getHeaders();

  let data = JSON.stringify({
    "reqHeader": reqHeader,
    "reqBody": {
      "data": encrypt(userBody)
    }
  });
  // URL for the API endpoint
  const url = config.mfu.baseUrl + config.mfu.apiConcentView;

  try {
    // Calling the utility function to make the API request
    const response = await apiRequest({
      method: 'post',
      url: url,
      headers: headers,
      data: data
    });

    console.log(" Response :", response);
    return decrypt(response.respData);
  } catch (error) {
    console.error("Error in ApiFinTechInvConsentViewService:", error);
    throw error; // Rethrow the error to be handled by the caller
  }


}

//e-madate
/*apiMfuUtiliyLogin: process.env.API_MFU_UTILITY_API_LOGIN,
      apiEpayEzz: process.env.API_EPAY_EEZ_SERVICE,
      apiEpayEzzStatus: process.env.API_EPAY_EEZ_STATUS_SERVICE,
  apiEpayEzzLogout: process.env.API_EPAY_EEZ_LOGOUT_SERVICE*/

export const MfUtilityApiLogin = async () => {
  const headers = await getHeaders();
  const queryParams = new URLSearchParams({
    loginid: mfu.loginId,
    password: mfu.password,
    entityId: mfu.entityId,
    sendResponseFormat: "JSON",
    logTp: "A",
    versionNo: "1.00"

  });
  const url = `${config.mfu.baseUrl}${config.mfu.apiMfuUtiliyLogin}?${queryParams}`;

  const conf = {
    method: 'get',
    url: url,
    headers: headers
  }
  console.log(conf)
  try {
    const response = await apiRequest(conf);
    console.log(response)
    return response;
  } catch (error) {
    console.error("Error in MfUtilityApiLogin:", error);
    throw error;
  }
}

export const APIePayEezzService = async (userBody: any) => {
  const headers = await getHeaders();
  const resp = await MfUtilityApiLogin();

  const queryParams = new URLSearchParams({
    sendResponseFormat: 'JSON',
    sessioncontext: resp?.sessioncontext,
    sendersubid: resp.sendersubid,
    logTp: 'A',
    regMode: userBody.regMode || 'PN',
    entityId: userBody.entityId,
    reqType: 'A',
    can: userBody.can,
    riaNo: userBody.riaNo || '',
    arnNo: userBody.arnNo,
    subBrokArn: userBody.subBrokArn || '',
    subBrokCode: userBody.subBrokCode || '',
    euincode: userBody.euincode || '',
    accNo: userBody.accNo,
    accType: userBody.accType || 'SB',
    bankId: userBody.bankId,
    ifscCode: userBody.ifscCode,
    micrCode: userBody.micrCode,
    maxAmt: userBody.maxAmt,
    perpetualFlag: 'N',
    startDate: userBody.startDate,
    endDate: userBody.endDate,
  }).toString();
  console.log(queryParams)

  const url = `${config.mfu.baseUrl}${config.mfu.apiEpayEzz}?${queryParams}`;

  try {
    const response = await apiRequest({
      method: 'get',
      url: url,
      headers: headers
    });


    console.log("Response:", response);
    if (response?.respStatus == 0) {
      await Mandate.create({

        investor_id: userBody?.investorId,
        can_id: userBody?.can,
        mandate_type: userBody?.mandateType,
        mmrn: response.addResp.mmrn,
        prn: response.addResp.prn,
        unique_refno: response.addResp.uniqueRefNo,
        reg_mode: userBody?.regMode,
        acc_no: userBody?.accNo,
        acc_type: userBody?.accType,
        bank_id: userBody?.bankId,
        ifsc: userBody?.ifscCode,
        micr: userBody?.micrCode,
        max_amt: userBody?.maxAmt,
        start_date: userBody?.startDate,
        end_date: userBody?.endDate,
        mandate_status: '',
        mmrnAggrStatus: response.addResp.mmrnAggrStatus,
        prnAggrStatus: response.addResp.prnAggrStatus,
      });
    }
    await Logout({ sessioncontext: resp?.sessioncontext, sendersubid: resp.sendersubid });

    return response;
  } catch (error) {
    console.error("Error in APIePayEezzService:", error);
    throw error;
  }
};

export const getMandates = async (filters = {}) => {
  try {
    const mandates = await Mandate.findAll({
      where: filters,
      order: [['createdAt', 'DESC']],
    });

    return mandates;
  } catch (error) {
    console.error('Error fetching mandates:', error);
    throw new Error('Failed to fetch mandates');
  }
}

export const updateMandates = async (id: any, updateData: any) => {
  try {
    const mandate = await Mandate.findByPk(id);
    if (!mandate) {
      console.log("Mandate not found with id:", id);
      throw new Error('Mandate not found');
    }

    console.log("Updating mandate with data:=================", updateData);
    const updatedMandate = await mandate.update(updateData);
    console.log("Mandate updated successfully:", updatedMandate);

    return updatedMandate;
  } catch (error) {
    console.error('Error updating mandate:', error);
    throw new Error('Failed to update mandate');
  }
}

export const APIEPayEezzStatusService = async (userBody: any) => {
  const headers = await getHeaders();
  const resp = await MfUtilityApiLogin();

  const queryParams = new URLSearchParams({
    sendResponseFormat: 'JSON',
    sessioncontext: resp?.sessioncontext,
    sendersubid: resp.sendersubid,
    logTp: 'A',
    can: userBody?.can,
    mmrn: userBody.mmrn,

  }).toString();
  console.log("==============================", queryParams)

  const url = `${config.mfu.baseUrl}${config.mfu.apiEpayEzzStatus}?${queryParams}`;


  try {
    const response = await apiRequest({
      method: 'get',
      url: url,
      headers: headers
    });


    console.log("Response:", response);
    await Logout({ sessioncontext: resp?.sessioncontext, sendersubid: resp.sendersubid });
    return response;
  } catch (error) {
    console.error("Error in APIEPayEezzStatusService:", error);
    throw error;
  }
}

export const Logout = async (userBody: any) => {
  const headers = await getHeaders();
  const queryParams = new URLSearchParams({
    isJsonResponseFormatReqd: 'Y',
    loginid: mfu.loginId,
    sessioncontext: userBody?.sessioncontext,
    sendersubid: userBody.sendersubid,
  }).toString();
  const url = `${config.mfu.baseUrl}${config.mfu.apiEpayEzzLogout}?${queryParams}`;

  console.log("Query Params ==========" + queryParams, "Url===", url)
  try {
    const response = await apiRequest({
      method: 'get',
      url: url,
      headers: headers
    });
    console.log("Logout Response:", response);
  } catch (error) {
    console.error("Error in Logout:", error);
    throw error;
  }
}

export const APIUploadServerImageService = async (params: any) => {
  try {
    const formData = new FormData();
    formData.append("param1", params.param1);
    formData.append("param2", params.param2);
    formData.append("param3", params.param3);
    formData.append("param4", params.param4);
    formData.append("param5", params.param5);
    formData.append("param6", params.param6);
    formData.append("param8", params.param8);

    // Stream the file from your folder
    formData.append("image", fs.createReadStream(params.imagePath));
    const response = await apiRequest({
      method: 'post',
      url: "https://14.141.212.169:4091/MFUImageServerUpload",
      headers: {
        Authorization: "Bearer FK2OFEZI-D9G2-SXM8U-40008I-UZTN-UOLMBA4Q"

      },
      data: formData
    });


    console.log("MFU Response:", response);
    return response;
  } catch (error) {
    console.error("Error in APIUploadServerImageService:", error);
    throw error;
  }
};


export const MFUCanModificationService = async (userBody: any) => {
  try {
    const headers = await getHeaders();

    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<CANIndFillEezzReq xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="CANIndFillEezzReq.xsd">`;
    const xmlFooter = `</CANIndFillEezzReq>`;

    // Convert JSON payload to XML
    const xmlResult = await convertJsonToXml(userBody);
    const finalXml = `${xmlHeader}${xmlResult.replace(/<\/?root>/g, '')}${xmlFooter}`;

    const url = "https://14.141.212.169:4091/MFUCanFillEezzService";
    console.log("CAN Modification XML Request:", finalXml);

    // Prepare Axios-like config
    const configRequest = {
      method: "post",
      url: url,
      headers: {
        "Content-Type": "application/xml",
        Authorization: `${headers.Authorization}`,
      },
      data: finalXml,
    };

    // Send API request
    const rawXmlResponse = await apiRequest2(configRequest);
    console.log("Raw XML Response from MFU (Modification):", rawXmlResponse);

    // Convert XML response to JSON
    const response = await convertXmlToJson(rawXmlResponse);
    console.log("Converted JSON Response:", JSON.stringify(response, null, 2));

    return response;
  } catch (error) {
    console.error("Error in MFUCanModificationService:", error);
    throw error;
  }
};


export const prepareCanModificationPayload = (investor: any, CAN_Id: string) => {

  console.log("investorCAN", investor?.can_id);

  // Get the first bank account (since it's an array)
  const bankAccount = investor?.BankAccountDetails?.[0];

  console.log("Bank Account Details:", bankAccount);
  console.log("ifsc_code", bankAccount?.ifsc);
  console.log("micr_code", bankAccount?.micr);
  console.log("bank_id", bankAccount?.bank_id);
  console.log("bank_account_type", bankAccount?.account_type);
  console.log("bank_account_no", bankAccount?.account_no);

  return {



    REQ_HEADER: {
      ENTITY_ID: "40008I",
      UNIQUE_ID: `REQ_${Date.now()}`,
      REQUEST_TYPE: "CANINDREG",
      LOG_USER_ID: "M0eGG0WiaLN9kgiiVfS3Ug==",
      EN_ENCR_PASSWORD: "NWbbHpz1kHpDjBBCHV8z7A==",
      VERSION_NO: "1.00",
      TIMESTAMP: new Date().toISOString(),
    },
    REQ_BODY: {
      REQ_ENT_VIA: "API",
      REQ_EVENT: "CM", // CAN Modification
      REG_TYPE: "E",
      CAN: investor?.can_id || "32195FF003", // fallback for testing
      PROOF_UPLOAD_BY_CAN: "Y",
      ENABLE_ONLINE_ACCESS_FLAG: "N",
      ENTITY_EMAIL_DETAILS: {
        EMAIL_ID: investor?.email || "subesh.chacha@example.com",
      },
      HOLDING_TYPE: "SI",
      INV_CATEGORY: "I",
      TAX_STATUS: "RI",
      HOLDER_COUNT: 1,
      HOLDER_RECORDS: {
        HOLDER_RECORD: {
          HOLDER_TYPE: "PR",
          NAME: investor?.name || "Rakesh Kumar Sinha",
          DOB: investor?.dob || "1983-01-20",
          PAN_EXEMPT_FLAG: "N",
          PAN_PEKRN_NO: investor?.pan || "BNVPS8094K",
          AADHAAR_NO: investor?.aadhaar || "",
          CONTACT_DETAIL: {
            MOB_ISD_CODE: "91",
            PRI_MOB_NO: investor?.mobile || "9934312075",
            PRI_EMAIL: investor?.email || "rakesh.sinha96@gmail.com",
          },
        },
      },
      BANK_DETAILS: {
        BANK_RECORD: {
          SEQ_NUM: 1,
          DEFAULT_ACC_FLAG: "Y",
          ACCOUNT_NO: bankAccount?.account_no || "987654321012",
          ACCOUNT_TYPE: bankAccount?.account_type || "SB",
          BANK_ID: bankAccount?.bank_id || "240",
          MICR_CODE: bankAccount?.micr || "110240012",
          IFSC_CODE: bankAccount?.ifsc || "HDFC0001234",
          PROOF: "14",
        },
      },
      NOMINEE_DETAILS: {
        NOM_DECL_LVL: "C",
        NOMIN_OPT_FLAG: "N",
        NOM_FOLIO_SOA: "Y",
        NOM_VERIFY_TYPE: "E",
      },
    },
  };
};


export const prepareDirectCanModificationPayload = (investor: any) => {
  const timestamp = Date.now();
  const isoTimestamp = new Date().toISOString();

  return {
    REQ_HEADER: {
      ENTITY_ID: "40008I",
      UNIQUE_ID: `REQ${timestamp}`,
      REQUEST_TYPE: "CANINDREG",
      LOG_USER_ID: "M0eGG0WiaLN9kgiiVfS3Ug==",
      EN_ENCR_PASSWORD: "NWbbHpz1kHpDjBBCHV8z7A==",
      VERSION_NO: "1.00",
      TIMESTAMP: isoTimestamp,
    },
    REQ_BODY: {
      REQ_ENT_VIA: "API",
      REQ_EVENT: "CM",
      REG_TYPE: "E",
      CAN: "32195FF003",
      PROOF_UPLOAD_BY_CAN: "Y",
      ENABLE_ONLINE_ACCESS_FLAG: "N",
      ENTITY_EMAIL_DETAILS: {
        EMAIL_ID: "subesh.chacha@example.com"
      },
      HOLDING_TYPE: "SI",
      INV_CATEGORY: "I",
      TAX_STATUS: "RI",
      HOLDER_COUNT: 1,
      HOLDER_RECORDS: {
        HOLDER_RECORD: {
          HOLDER_TYPE: "PR",
          NAME: "Rakesh Kumar Sinha",
          DOB: "1983-01-20",
          PAN_EXEMPT_FLAG: "N",
          PAN_PEKRN_NO: "BNVPS8094K",
          AADHAAR_NO: "",
          CONTACT_DETAIL: {
            MOB_ISD_CODE: "91",
            PRI_MOB_NO: "9934312075",
            PRI_MOB_BELONGSTO: "SE",
            PRI_EMAIL: "rakesh.sinha96@gmail.com",
            PRI_EMAIL_BELONGSTO: "SE"
          }
        }
      },
      NOMINEE_DETAILS: {
        NOM_DECL_LVL: "C",
        NOMIN_OPT_FLAG: "N",
        NOM_FOLIO_SOA: "Y",
        NOM_VERIFY_TYPE: "E"
      }
    }
  };
};




export const prepareNomineeCanModificationPayload = (investor: any, canId: string) => {
  const timestamp = Date.now();
  const isoTimestamp = new Date().toISOString();

  // Extract nominee data from investor object
  const nominee = investor.NomineeDetails?.[0]; // Assuming first nominee

  return {
    REQ_HEADER: {
      ENTITY_ID: "40008I",
      UNIQUE_ID: `REQ${timestamp}`,
      REQUEST_TYPE: "CANINDREG",
      LOG_USER_ID: "M0eGG0WiaLN9kgiiVfS3Ug==",
      EN_ENCR_PASSWORD: "NWbbHpz1kHpDjBBCHV8z7A==",
      VERSION_NO: "1.00",
      TIMESTAMP: isoTimestamp,
    },
    REQ_BODY: {
      REQ_ENT_VIA: "API",
      REQ_EVENT: "CM",
      REG_TYPE: "E",
      CAN: canId,
      PROOF_UPLOAD_BY_CAN: "Y",
      ENABLE_ONLINE_ACCESS_FLAG: "N",
      ENTITY_EMAIL_DETAILS: {
        EMAIL_ID: investor.email || "subesh.chacha@example.com"
      },
      HOLDING_TYPE: "SI",
      INV_CATEGORY: "I",
      TAX_STATUS: "RI",
      HOLDER_COUNT: 1,
      HOLDER_RECORDS: {
        HOLDER_RECORD: {
          HOLDER_TYPE: "PR",
          NAME: `${investor.first_name} ${investor.last_name}`,
          DOB: investor.date_of_birth?.split('T')[0] || "1983-01-20",
          PAN_EXEMPT_FLAG: "N",
          PAN_PEKRN_NO: investor.pan_number || "BNVPS8094K",
          AADHAAR_NO: investor.aadhaar_number || "",
          CONTACT_DETAIL: {
            MOB_ISD_CODE: "91",
            PRI_MOB_NO: investor.mobile_number || "9934312075",
            PRI_MOB_BELONGSTO: "SE",
            PRI_EMAIL: investor.email || "rakesh.sinha96@gmail.com",
            PRI_EMAIL_BELONGSTO: "SE"
          }
        }
      },
      NOMINEE_DETAILS: {
        NOM_DECL_LVL: "C",
        NOMIN_OPT_FLAG: "Y", // Changed to "Y" as per your XML
        NOM_FOLIO_SOA: "Y",
        NOM_VERIFY_TYPE: "E",
        NOMINEES_RECORDS: {
          NOMINEE_RECORD: {
            SEQ_NUM: "1",
            NOMINEE_NAME: nominee?.nominee_name || "Payal Sinha",
            RELATION: nominee?.relationship_code || "MFU22", // Use relationship code from your mapping
            PERCENTAGE: nominee?.percentage?.toString() || "100",
            DOB: nominee?.date_of_birth?.split('T')[0] || "1990-05-15",
            NOM_PI_TYPE: "PA", // PAN
            NOM_PI_NO: nominee?.pan_number || "CYUPG5556P",
            NOM_MOBILE: nominee?.mobile_number || "7676767666",
            NOM_EMAIL: nominee?.email || "agdhsd@gmail.com",
            NOM_ADDR1: nominee?.address_line1 || "xssssss",
            NOM_ADDR2: nominee?.address_line2 || "xssssss",
            NOM_ADDR3: nominee?.address_line3 || "sss",
            NOM_PINCODE: nominee?.pincode || "222123",
            NOM_CITY: nominee?.city || "SS",
            NOM_COUNTRY: nominee?.country_code || "101"
          }
        }
      }
    }
  };
};


export const getInvestorPortfolio = async (filters = {}) => {
  try {
    const response = await InvestorPortfolio.findAll({
      where: filters,
      order: [['createdAt', 'DESC']],
    });

    return response;
  } catch (error) {
    console.error('Error fetching mandates:', error);
    throw new Error('Failed to fetch mandates');
  }
}



