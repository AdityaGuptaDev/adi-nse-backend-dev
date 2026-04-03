import axios from 'axios';
import { DecentroLog } from '../routes/decentro/DecentroLog';
import { InvestorRegistration } from '../routes/kyc-flow/user_basic_detail-model';
import { BankAccountDetail } from '../routes/kyc-flow/bank-account-detail-model';
import { financialServiceDataPull } from '../routes/decentro/decentro-handler';
import { AddressDetail } from '../routes/kyc-flow/address-detail-model';

// export async function mobileToAccountService(refUniqueId: string, mobile_number: string): Promise<any> {
//   console.log("refUniqueId:", refUniqueId);
//   console.log("mobile_number:", mobile_number);

//   const url ="https://in.staging.decentro.tech/v2/banking/mobile_to_account";
//   const clientId = process.env.Client_id_dec;
//   const clientSecret = process.env.Client_secret_dec;
//   const moduleSecret = process.env.Module_secret_dec;

//   if (!url) {
//     throw new Error("Decentro Mobile-to-Account URL is not configured");
//   }
//   if (!clientId || !clientSecret || !moduleSecret) {
//     throw new Error("Decentro credentials are not configured");
//   }

//   const headers = {
//     "Content-Type": "application/json",
//     client_id: clientId,
//     client_secret: clientSecret,
//     module_secret: moduleSecret,
//   };

//   try {
//     const requestPayload = {
//       reference_id: refUniqueId,
//       mobile_number: mobile_number,
//       fetch_branch_details: true,
//       is_consent_granted: true,
//     };

//     console.log("Sending request to Decentro:", url);
//     console.log("Payload:", requestPayload);

//     const response = await axios.post(url, requestPayload, {
//       headers,
//       timeout: 30000, // 30 seconds
//       httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }), // allow self-signed certs for staging
//     });

//     console.log("Decentro Mobile-to-Account response:", response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error calling Decentro Mobile-to-Account API:", error.message);

//     const res = error.response?.data;
//     console.error("Decentro error response:", res);

//     throw new Error(res?.message || "Mobile-to-Account request failed");
//   }
// }

export async function mobileToAccountService(
  refUniqueId: string,
  mobile_number: string,
  investor_id: number
): Promise<any> {
  console.log("refUniqueId:", refUniqueId);
  console.log("mobile_number:", mobile_number);
  console.log("investor_id:", investor_id);

  // const url = "https://in.staging.decentro.tech/v2/banking/mobile_to_account";
  const clientId = process.env.Client_id_dec;
  const clientSecret = process.env.Client_secret_dec;
  const moduleSecret = process.env.Module_secret_dec;
  //Production
  const IDFC_Provider_Secret = process.env.IDFC_Provider_Secret_prod;
  const url = process.env.mobileToAcUrlDec;
  // const clientId = process.env.Client_id_dec_prod;
  // const clientSecret = process.env.Client_secret_dec_prod;
  // const moduleSecret = process.env.Module_secret_dec_prod;

  if (!url) {
    throw new Error("Decentro Mobile-to-Account URL is not configured");
  }
  if (!clientId || !clientSecret || !moduleSecret) {
    throw new Error("Decentro credentials are not configured");
  }

  const headers = {
    "Content-Type": "application/json",
    client_id: clientId,
    client_secret: clientSecret,
    module_secret: moduleSecret,
  };

  try {
    const requestPayload = {
      reference_id: refUniqueId,
      mobile_number: mobile_number,
      fetch_branch_details: true,
      is_consent_granted: true,
    };

    console.log("Sending request to Decentro:", url);
    console.log("Payload:", requestPayload);

    // Create log entry for request
    // await DecentroLog.create({
    //   investor_id: investor_id,
    //   reference_id: refUniqueId,
    //   api_type: "mobile-to-account",
    //   request_payload: requestPayload,
    //   status: "PENDING",
    //   remark: "Request initiated"
    // });

    const response = await axios.post(url, requestPayload, {
      headers,
      timeout: 30000,
      httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
    });

    console.log("Decentro Mobile-to-Account response:", response.data);

    // Process the successful response
    // if (response.data) {
    //   await processSuccessfulResponse(investor_id, refUniqueId, response.data);
    // }

    // // Update log with response
    // await DecentroLog.update({
    //   response_data: response.data,
    //   status: response.data.status,
    //   remark: response.data.remark
    // }, {
    //   where: { reference_id: refUniqueId }
    // });

    return response.data;
  } catch (error: any) {
    console.error("Error calling Decentro Mobile-to-Account API:", error.message);

    const res = error.response?.data;
    console.error("Decentro error response:", res);

    // Update log with error
    // await DecentroLog.update({
    //   response_data: res,
    //   status: "FAILED",
    //   remark: res?.message || "Mobile-to-Account request failed"
    // }, {
    //   where: { reference_id: refUniqueId }
    // });

    throw new Error(res?.message || "Mobile-to-Account request failed");
  }
}

//Helper function to process successful response
async function processSuccessfulResponse(
  investor_id: number,
  reference_id: string,
  decentroResponse: any
) {
  try {
    const responseData = decentroResponse.data;

    console.log("Processing response for investor:", investor_id);
    console.log("Bank account holder name:", responseData.nameAsPerBank);

    // Verify investor exists before updating
    const investor = await InvestorRegistration.findByPk(investor_id);
    if (!investor) {
      throw new Error(`Investor with ID ${investor_id} not found`);
    }

    // Update Investor name (always updates with latest from bank)
    if (responseData.nameAsPerBank) {
      const [affectedRows] = await InvestorRegistration.update(
        {
          name: responseData.nameAsPerBank,
          updatedAt: new Date()
        },
        {
          where: { id: investor_id }
        }
      );
      console.log(`Updated investor name to: ${responseData.nameAsPerBank}, Affected rows: ${affectedRows}`);
    } else {
      console.warn("No nameAsPerBank found in response");
    }

    //Prepare bank account data
    const bankAccountData: any = {
      investor_id: investor_id,
      account_no: responseData.accountNumber,
      ifsc: responseData.ifsc,
      micr: responseData.branchDetails?.micr || null,
      branch: responseData.branchDetails?.branch || null,
      updatedAt: new Date()
    };

    // Check if bank account already exists for this investor
    const existingAccount = await BankAccountDetail.findOne({
      where: { investor_id: investor_id }
    });

    if (existingAccount) {
      // Update existing record
      const [affectedRows] = await BankAccountDetail.update(bankAccountData, {
        where: { investor_id: investor_id }
      });
      console.log(`Updated existing bank account details. Affected rows: ${affectedRows}`);
    } else {
      // Create new record
      bankAccountData.createdAt = new Date();
      const newAccount = await BankAccountDetail.create(bankAccountData);
      console.log(`Created new bank account details with ID: ${newAccount.id}`);
    }

    console.log("Successfully processed bank account details");

  } catch (error) {
    console.error("Error processing successful response:", error);
    throw error;
  }
}



// async function processSuccessfulResponse(
//   investor_id: number,
//   reference_id: string,mobile_number:string,
//   decentroResponse: any
// ) {
//   try {
//     const responseData = decentroResponse.data;
//     console.log("Processing response for investor:", investor_id);
//     console.log("Bank account holder name:", responseData.nameAsPerBank);

//     // Verify investor exists before updating
//     const investor = await InvestorRegistration.findByPk(investor_id);
//     if (!investor) {
//       throw new Error(`Investor with ID ${investor_id} not found`);
//     }

//     // Update Investor name (always updates with latest from bank)
//     if (responseData.nameAsPerBank) {
//       const [affectedRows] = await InvestorRegistration.update(
//         {
//           name: responseData.nameAsPerBank,
//           updatedAt: new Date(),
//         },
//         {
//           where: { id: investor_id },
//         }
//       );
//       console.log(
//         `Updated investor name to: ${responseData.nameAsPerBank}, Affected rows: ${affectedRows}`
//       );
//     } else {
//       console.warn("No nameAsPerBank found in response");
//     }

//     // Prepare bank account data
//     const bankAccountData: any = {
//       investor_id: investor_id,
//       account_no: responseData.accountNumber,
//       ifsc: responseData.ifsc,
//       micr: responseData.branchDetails?.micr || null,
//       branch: responseData.branchDetails?.branch || null,
//       updatedAt: new Date(),
//     };

//     // Check if bank account already exists for this investor
//     const existingAccount = await BankAccountDetail.findOne({
//       where: { investor_id: investor_id },
//     });

//     if (existingAccount) {
//       // Update existing record
//       const [affectedRows] = await BankAccountDetail.update(bankAccountData, {
//         where: { investor_id: investor_id },
//       });
//       console.log(
//         `Updated existing bank account details. Affected rows: ${affectedRows}`
//       );
//     } else {
//       // Create new record
//       bankAccountData.createdAt = new Date();
//       const newAccount = await BankAccountDetail.create(bankAccountData);
//       console.log(`Created new bank account details with ID: ${newAccount.id}`);
//     }

//     console.log("Successfully processed bank account details");

//     // const mobileNumber="8107600161";
//     // const name ="ASHOK KUMAR SAINI";

//     // //  STEP 2: Now trigger the financial_service_data_pull API
//     // if (responseData.nameAsPerBank) {
//     //   console.log("Triggering Financial Service Data Pull API...");
//     //   const financialResponse = await financialServiceDataPull(
//     //     mobileNumber, // or from your request context
//     //     //responseData.nameAsPerBank
//     //     name
//     //   );
//     //   console.log("Financial Data Pull API response:", financialResponse);
//     // } else {
//     //   console.warn(
//     //     "Skipping Financial Service Data Pull API — nameAsPerBank not found"
//     //   );
//     // }
//   } catch (error) {
//     console.error("Error processing successful response:", error);
//     throw error;
//   }
// }




export async function financialServiceDataPullService(refUniqueId: string, mobile_number: string, name: string, investor_id: number): Promise<any> {
  console.log("refUniqueId:", refUniqueId);
  console.log("mobile_number:", mobile_number);
  console.log("name:", name);
  const concentPurpose = "for bank verification only";
  const inquiryPurpose = "PL";

  //UAT
  // const url ="https://in.staging.decentro.tech/v2/financial_services/data/pull";
  // const clientId = process.env.Client_id_dec;
  // const clientSecret = process.env.Client_secret_dec;
  // const IDFC_Provider_Secret = process.env.Module_secret_dec_fdp;
   const provider_secret=process.env.Provider_secret_fdp;

  //production
  const IDFC_Provider_Secret = process.env.IDFC_Provider_Secret_prod;
  const clientId = process.env.Client_id_dec;
  const clientSecret = process.env.Client_secret_dec;
  const url = process.env.fnpDecUrl;

  if (!url) {
    throw new Error("Decentro financial_service_data_pull URL is not configured");
  }
  if (!clientId || !clientSecret || !IDFC_Provider_Secret) {
    throw new Error("Decentro credentials are not configured");
  }

  const headers = {
    "Content-Type": "application/json",
    client_id: clientId,
    client_secret: clientSecret,
    IDFC_Provider_Secret: IDFC_Provider_Secret,
    Provider_secret:provider_secret,
  };

  try {
    const requestPayload = {
      reference_id: refUniqueId,
      consent: true,
      consent_purpose: concentPurpose,
      name: name,
      mobile: mobile_number,
      inquiry_purpose: inquiryPurpose,

    };

    console.log("Sending request to Decentro financial :", url);
    console.log("Payload:", requestPayload);

    const response = await axios.post(url, requestPayload, {
      headers,
      timeout: 30000,
      httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
    });

    console.log("Decentro Mobile-to-Account response financial:", response.data);

    // Wrap response with source info
    const formattedResponse = {
      source: "financial_service_data_pull",
      response: response.data
    };


    // Save address details from response
    await saveFinancialAddressData(investor_id, formattedResponse);

    console.log("Decentro Mobile-to-Account response financial:", formattedResponse);
    return response.data;
  } catch (error: any) {
    console.error("Error calling Decentro Mobile-to-Account API financial:", error.message);

    const res = error.response?.data;
    console.error("Decentro error response:", res);

    throw new Error(res?.message || "Mobile-to-Account request failed");
  }
}

export async function saveFinancialAddressData(
  investorId: number,
  financialApiResponse: any
) {
  try {
    console.log("investorId-", investorId);
    console.log(
      "financialApiResponse-",
      JSON.stringify(financialApiResponse, null, 2)
    );

    const addresses = financialApiResponse?.response?.data?.addressInfo || [];
    const personalInfo = financialApiResponse?.response?.data?.personalInfo || {};
    const name = personalInfo.fullName || "N/A";
    const docNo =
      financialApiResponse?.response?.data?.identityInfo?.aadhaarNumber?.[0]
        ?.idNumber || null;

    if (!addresses.length) {
      console.warn("No address data found in financial API response.");
      return null;
    }

    //  Find the address with the most recent reportedDate
    const latestAddress = addresses.reduce((latest: any, current: any) => {
      const latestDate = new Date(latest.reportedDate);
      const currentDate = new Date(current.reportedDate);
      return currentDate > latestDate ? current : latest;
    });

    console.log("Latest address selected:", latestAddress);

    // Save only the latest address record
    // const savedAddress = await AddressDetail.create({
    //   investor_id: investorId,
    //   doc_no: docNo,
    //   doc_holder_name: name,
    //   address_proof_type: "Aadhaar",
    //   address_front_doc: "",
    //   address_back_doc: "",
    //   address1: latestAddress.address || "",
    //   address2: "",
    //   address_type: latestAddress.type === "Permanent" ? 1 : 2, // 1 = Permanent, 2 = Correspondence
    //   district: "",
    //   city: "",
    //   state_id: "",
    //   pincode: parseInt(latestAddress.postal) || null,
    //   country_id: await getCountryId("India"),
    //   poaConsent: true,
    //   same_as_permanent: latestAddress.type === "Permanent",
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // });

    console.log(
      `Saved latest address for investor ${investorId} with reportedDate ${latestAddress.reportedDate}`
    );

    return true;
  } catch (error: any) {
    console.error("Error saving financial address data:", error.message);
    throw new Error("Failed to save address data");
  }
}

async function getStateId(stateName: string): Promise<number> {
  const stateMap: Record<string, number> = {
    "MAHARASHTRA": 27,
    "BIHAR": 10,
    "JHARKHAND": 20,
    "DELHI": 7,
    "RAJASTHAN": 26, // added Rajasthan
  };
  return stateMap[stateName?.toUpperCase()] || 0;
}

async function getCountryId(countryName: string): Promise<number> {
  const countryMap: Record<string, number> = {
    "INDIA": 1,
  };
  return countryMap[countryName?.toUpperCase()] || 0;
}
