import axios from "axios";
import https from "https";
import { financialServiceDataPullService, mobileToAccountService } from "../../services/decentro-api-service";
import { InvestorRegistration } from "../kyc-flow/user_basic_detail-model";
import { BankAccountDetail } from "../kyc-flow/bank-account-detail-model";
import { DecentroLog, InvestorRequestDecentroLogs } from "../../db/core/init-control-db";

export function generateReferenceId(prefix = "REF") {
  const timestamp = Date.now(); // current time in ms
  const random = Math.floor(Math.random() * 1000000); // 6-digit random number
  return `${prefix}_${timestamp}_${random}`;
}

// export const mobileToAccount = async (
//   mobile: string
// ) => {
//   try {
//     console.log("mobile -", mobile);

// const reference_id = generateReferenceId("DECENTRO");
// console.log(reference_id);

//     console.log("Calling Decentro mobile-to-account API...");

//     const response = await mobileToAccountService(reference_id, mobile);

//     console.log("Decentro API final response:", response);
//     return response;
//   } catch (err: any) {
//     console.log("mobileToAccount error =============", err.message);
//     return {
//       success: false,
//       message: err.message || "Something went wrong",
//       data: null,
//     };
//   }
// };

// export const mobileToAccount = async (mobile: string, investor_id: number) => {
//   try {
//     console.log("mobile -", mobile);
//     console.log("investor_id -", investor_id);

//     const reference_id = generateReferenceId("DECENTRO");
//     console.log("reference_id:", reference_id);

//     console.log("Calling Decentro mobile-to-account API...");

//     const response = await mobileToAccountService(reference_id, mobile, investor_id);

//     console.log("Decentro API final response:", response);
//     return response;
//   } catch (err: any) {
//     console.log("mobileToAccount error =============", err.message);
//     return {
//       success: false,
//       message: err.message || "Something went wrong",
//       data: null,
//     };
//   }
// };


export const mobileToAccount = async (mobile: string, investor_id?: number | null) => {
  try {
    console.log("mobile -", mobile);
    console.log("investor_id -", investor_id);

    let finalInvestorId = investor_id;

    // Step 1: Check if mobile exists in InvestorRegistration
    let investor = await InvestorRegistration.findOne({
      where: { reg_mobile: mobile },
    });

    if (investor) {
      console.log("Existing investor found with this mobile. Updating record...");

      //  Step 2: Update existing investor fields
      await investor.update({
        modifiedBy: 0,
        updatedAt: new Date(),
        isDelete: false,
      });

      finalInvestorId = investor.id;

    } else {
      // Step 3: Create new record if not found
      console.log("No investor found. Creating new investor record...");
      const newInvestor = await InvestorRegistration.create({
        name: "TEMPORARY INVESTOR",
        reg_mobile: mobile,
        isDelete: false,
        createdBy: 0,
        modifiedBy: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      finalInvestorId = newInvestor.id;
      investor = newInvestor;

      console.log("New investor created with ID:", finalInvestorId);
    }

    //  Step 4: Prepare Decentro reference_id
    const reference_id = generateReferenceId("DECENTRO");
    console.log("reference_id:", reference_id);

    console.log("Calling Decentro mobile-to-account API...");

    //  Step 5: Call Decentro API
    const response = await mobileToAccountService(
      reference_id,
      mobile,
      finalInvestorId as number
    );

    console.log("Decentro API final response:", response);

    return {
      ...response,
      investor_id: finalInvestorId,
      success: true,
    };

  } catch (err: any) {
    console.log("mobileToAccount error =============", err.message);
    return {
      success: false,
      message: err.message || "Something went wrong",
      data: null,
    };
  }
};

//for partner---

export const partnerMobileToAccount = async (mobile: string, investor_id?: number | null) => {
  try {
    console.log("mobile -", mobile);
    console.log("investor_id -", investor_id);

    let finalInvestorId = investor_id;

    const reference_id = generateReferenceId("DECENTRO");
    console.log("reference_id:", reference_id);

    console.log("Calling Decentro mobile-to-account API...");

    // STEP 1 — FIRST API CALL
    const firstApiResponse = await mobileToAccountService(
      reference_id,
      mobile,
      finalInvestorId as number
    );

    console.log("Decentro API final response:", firstApiResponse);

    // Validate
    if (
      !firstApiResponse ||
      firstApiResponse.status !== "SUCCESS" ||
      !firstApiResponse.data
    ) {

      return {
        status: "F",
        message: "mobile-to-account failed",
        data: firstApiResponse
      };
    }

    // Extract required data
    const nameAsPerBank = firstApiResponse.data.nameAsPerBank;
    const mobileNumber = mobile;

    console.log("Calling financial service with:", {
      mobile: mobileNumber,
      nameAsPerBank,
      investor_id: finalInvestorId
    });

    // STEP 2 — SECOND API CALL
    let financialResponse = null;

    if (nameAsPerBank) {
      financialResponse = await financialServiceDataPull(
        mobileNumber,
        nameAsPerBank,
        finalInvestorId as number
      );
    }

    // FINAL COMBINED-response
    const combinedResponse = {
      status: "S",
      remark: "Both APIs executed successfully",
      data: [
        { source: "mobile_to_account", response: firstApiResponse },
        { source: "financial_service_data_pull", response: financialResponse }
      ]
    };

    await DecentroLog.create({
      user_id: finalInvestorId || 0,
      reference_id,
      api_type: "combined_mobile_financial",
      request_payload: { mobile, investor_id },
      response_data: combinedResponse,
      status: "SUCCESS",
      remark: "Both APIs executed successfully",
      mobile_no: mobile,
      user_type_id: 0
    });

    return combinedResponse;

  } catch (err: any) {

    await DecentroLog.create({
      user_id: investor_id || 0,
      reference_id: generateReferenceId("DECENTRO"),
      api_type: "combined_mobile_financial",
      request_payload: { mobile, investor_id },
      response_data: { error: err.message },
      status: "FAILED",
      remark: err.message,
      mobile_no: mobile,
      user_type_id: 0
    });

    console.log("mobileToAccount error =============", err.message);
    return {
      success: false,
      message: err.message || "Something went wrong",
      data: null,
    };
  }
};





export const financialServiceDataPull = async (
mobile: string, name: string,investor_id:number) => {
  try {
    console.log("inside the ffunction of financial api ");

    console.log("mobile financial-",mobile);
    console.log("name financial-",name);

const reference_id = generateReferenceId("DECENTRO");
console.log(reference_id);

    console.log("Calling Decentro mobile-to-account API...");

    const response = await financialServiceDataPullService(reference_id, mobile,name,investor_id);

    console.log("Decentro API final response:", response);
    return response;
  } catch (err: any) {
    console.log("financialServiceDataPull error =============", err.message);
    return {
      success: false,
      message: err.message || "Something went wrong",
      data: null,
    };
  }
};


export const logInvestorRequest = async ({
  mobile_number,
  investor_id,
  api_name,
  request_payload,
  response_payload,
  status,
  remark,
}: any) => {
  try {
    await InvestorRequestDecentroLogs.create({
      mobile_number,
      investor_id,
      api_name,
      request_payload,
      response_payload,
      status,
      remark,
    });
  } catch (err) {
    console.error("Error logging investor request:", err);
  }
};