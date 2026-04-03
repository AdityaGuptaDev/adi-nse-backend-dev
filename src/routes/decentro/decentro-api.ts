import express from "express";
const router = express.Router();

import axios from "axios";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import ErrorLogger from "../../db/core/logger/error-logger";
import { serverError } from "proses-response";
import { financialServiceDataPull, logInvestorRequest, mobileToAccount } from "./decentro-handler";
import { getDecentroLog } from "../partner/partner-handler";
import { tokenMiddleWare } from "../../middlewares/tokenMiddleware";

// router.post("/mobile-to-account", async (req, res) => {
//   try {
//     const { mobile_number} = req.body;

//     if (!mobile_number) {
//       return sendEncryptedResponse(
//         res,
//         {
//           status: "F",
//           remark: "Mobile number is required",
//         },
//         "mobile-to-account"
//       );
//     }

//     const serviceResponse = await mobileToAccount(mobile_number);

//     // Send success response
//     return sendEncryptedResponse(
//       res,
//       {
//         status: "S",
//         remark: serviceResponse.message,
//         data: serviceResponse.data,
//       },
//       "mobile-to-account"
//     );
//   } catch (error) {
//     console.log("mobile-to-account route error:", error);
//     serverError(res, error);
//   }
// });

// router.post("/mobile-to-account", async (req, res) => {
//   try {
//     const { mobile_number, investor_id } = req.body; // Added investor_id

//     if (!mobile_number || !investor_id) {
//       return sendEncryptedResponse(
//         res,
//         {
//           status: "F",
//           remark: "Mobile number and investor ID are required",
//         },
//         "mobile-to-account"
//       );
//     }

//     const serviceResponse = await mobileToAccount(mobile_number, investor_id);

//     // Send success response
//     return sendEncryptedResponse(
//       res,
//       {
//         status: "S",
//         remark: serviceResponse.message,
//         data: serviceResponse.data,
//       },
//       "mobile-to-account"
//     );
//   } catch (error) {
//     console.log("mobile-to-account route error:", error);
//     serverError(res, error);
//   }
// });

// router.post("/mobile-to-account", async (req, res) => {
//   try {
//     const { mobile_number, investor_id } = req.body;

//     if (!mobile_number || !investor_id) {
//       return sendEncryptedResponse(
//         res,
//         {
//           status: "F",
//           remark: "Mobile number and investor ID are required",
//         },
//         "mobile-to-account"
//       );
//     }

//     //  Call first API
//     const serviceResponse = await mobileToAccount(mobile_number, investor_id);
//     console.log("First API (mobile-to-account) response:", serviceResponse);

//     // FIX: handle both 'S' and 'SUCCESS' as valid success
//     const firstApiStatus =
//       serviceResponse?.status === "S" ||
//       serviceResponse?.status === "SUCCESS" ||
//       serviceResponse?.data?.status === "S" ||
//       serviceResponse?.data?.status === "SUCCESS";

//     if (!firstApiStatus) {
//       return sendEncryptedResponse(
//         res,
//         {
//           status: "F",
//           remark:
//             serviceResponse?.remark ||
//             serviceResponse?.message ||
//             "Mobile-to-Account API failed",
//           data: serviceResponse,
//         },
//         "mobile-to-account"
//       );
//     }

//     //  Extract name and mobile
//     // const name =
//     //   serviceResponse?.data?.data?.nameAsPerBank ||
//     //   serviceResponse?.data?.nameAsPerBank;
//     // const mobile = mobile_number;


//       const mobileNumber="8107600161";
//     const name ="ASHOK KUMAR SAINI";


//     //Call second API (Financial Data Pull)
//     let financialResponse = null;
//     if (name) {
//       console.log("Triggering Financial Service Data Pull API...");
//       try {
//         financialResponse = await financialServiceDataPull(mobileNumber, name,investor_id);
//         console.log("Financial Data Pull API response:", financialResponse);
//       } catch (error) {
//         console.error("Financial Data Pull API failed:", error);
//         financialResponse = {
//           status: "FAILED",
//           message: error,
//         };
//       }
//     } else {
//       console.warn(
//         "No nameAsPerBank found in first API response, skipping financial API"
//       );
//     }

//     //Combine both API responses in one array
//     const combinedData = [
//       {
//         source: "mobile_to_account",
//         response: serviceResponse,
//       },
//       {
//         source: "financial_service_data_pull",
//         response: financialResponse,
//       },
//     ];

//     //  Send combined success response
//     return sendEncryptedResponse(
//       res,
//       {
//         status: "S",
//         remark: "Both APIs executed successfully",
//         data: combinedData,
//       },
//       "mobile-to-account"
//     );
//   } catch (error) {
//     console.error("mobile-to-account route error:", error);
//     serverError(res, error);
//   }
// });

//code without log 

// router.post("/mobile-to-account", async (req, res) => {
//   try {
//     const { mobile_number, investor_id } = req.body;

//     if (!mobile_number) {
//       return sendEncryptedResponse(
//         res,
//         {
//           status: "F",
//           remark: "Mobile number is required",
//         },
//         "mobile-to-account"
//       );
//     }

//     const investorIdValue = investor_id && investor_id !== "" ? investor_id : null;

//     // Call first API
//     const serviceResponse = await mobileToAccount(mobile_number, investorIdValue);
//     console.log("First API (mobile-to-account) response:", serviceResponse);

//     const firstApiStatus =
//       serviceResponse?.status === "S" ||
//       serviceResponse?.status === "SUCCESS" ||
//       serviceResponse?.data?.status === "S" ||
//       serviceResponse?.data?.status === "SUCCESS";

//     if (!firstApiStatus) {
//       return sendEncryptedResponse(
//         res,
//         {
//           status: "F",
//           remark:
//             serviceResponse?.remark ||
//             serviceResponse?.message ||
//             "Mobile-to-Account API failed",
//           data: serviceResponse,
//         },
//         "mobile-to-account"
//       );
//     }

//     // const mobileNumber = mobile_number;
//     // const name = serviceResponse?.data?.data?.nameAsPerBank || "UNKNOWN";

//     const mobileNumber = "8107600161";
//     const name = "ASHOK KUMAR SAINI";


//     console.log("serviceResponse.investor_id---", serviceResponse.investor_id);

//     //Call second API (Financial Data Pull)
//     let financialResponse = null;
//     if (name) {
//       console.log("Triggering Financial Service Data Pull API...");
//       try {
//         financialResponse = await financialServiceDataPull(mobileNumber, name, serviceResponse.investor_id);
//         console.log("Financial Data Pull API response:", financialResponse);
//       } catch (error) {
//         console.error("Financial Data Pull API failed:", error);
//         financialResponse = {
//           status: "FAILED",
//           message: error
//         };
//       }
//     } else {
//       console.warn("No nameAsPerBank found, skipping financial API");
//     }

//     //Combine both API responses in one array
//     const combinedData = [
//       {
//         source: "mobile_to_account",
//         response: serviceResponse,
//       },
//       {
//         source: "financial_service_data_pull",
//         response: financialResponse,
//       },
//     ];

//     return sendEncryptedResponse(
//       res,
//       {
//         status: "S",
//         remark: "Both APIs executed successfully",
//         data: combinedData,
//       },
//       "mobile-to-account"
//     );
//   } catch (error) {
//     console.error("mobile-to-account route error:", error);
//     serverError(res, error);
//   }
// });

//code with log -

router.post("/mobile-to-account", tokenMiddleWare, async (req, res) => {
  try {
    const { mobile_number, investor_id } = req.body;

    if (!mobile_number) {
      await logInvestorRequest({
        mobile_number: mobile_number || "N/A",
        api_name: "mobile-to-account",
        request_payload: req.body,
        status: "FAILED",
        remark: "Mobile number is required",
      });

      return sendEncryptedResponse(
        res,
        { status: "F", remark: "Mobile number is required" },
        "mobile-to-account"
      );
    }

    const investorIdValue = investor_id && investor_id !== "" ? investor_id : null;

    const serviceResponse = await mobileToAccount(mobile_number, investorIdValue);
    console.log("First API (mobile-to-account) response:", serviceResponse);

    const firstApiStatus =
      serviceResponse?.status === "S" ||
      serviceResponse?.status === "SUCCESS" ||
      serviceResponse?.data?.status === "S" ||
      serviceResponse?.data?.status === "SUCCESS";

    if (!firstApiStatus) {
      await logInvestorRequest({
        mobile_number,
        investor_id: serviceResponse?.investor_id,
        api_name: "mobile-to-account",
        request_payload: req.body,
        response_payload: serviceResponse,
        status: "FAILED",
        remark:
          serviceResponse?.remark ||
          serviceResponse?.message ||
          "Mobile-to-Account API failed",
      });

      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark:
            serviceResponse?.remark ||
            serviceResponse?.message ||
            "Mobile-to-Account API failed",
          data: serviceResponse,
        },
        "mobile-to-account"
      );
    }

    //const mobileNumber = "8107600161";
    //const name = "ASHOK KUMAR SAINI";
console.log("serviceResponse?.data?.nameAsPerBank-------",serviceResponse?.data?.nameAsPerBank);
console.log("mobile_number----",mobile_number);

    let financialResponse = null;
    if (serviceResponse?.data?.nameAsPerBank) {
      try {
        financialResponse = await financialServiceDataPull(
          mobile_number,
          serviceResponse?.data?.nameAsPerBank,
          serviceResponse.investor_id
        );
      } catch (error) {
        financialResponse = { status: "FAILED", message: error };
      }
    }

    const combinedData = [
      { source: "mobile_to_account", response: serviceResponse },
      { source: "financial_service_data_pull", response: financialResponse },
    ];

    //  Log successful flow
    await logInvestorRequest({
      mobile_number,
      investor_id: serviceResponse?.investor_id,
      api_name: "mobile-to-account",
      request_payload: req.body,
      response_payload: combinedData,
      status: "SUCCESS",
      remark: "Both APIs executed successfully",
    });

    return sendEncryptedResponse(
      res,
      { status: "S", remark: "Both APIs executed successfully", data: combinedData },
      "mobile-to-account"
    );
  } catch (error) {
    console.error("mobile-to-account route error:", error);

    await logInvestorRequest({
      mobile_number: req.body?.mobile_number || "N/A",
      api_name: "mobile-to-account",
      request_payload: req.body,
      status: "FAILED",
      remark: error,
    });

    serverError(res, error);
  }
});



router.post("/financial_service_data_pull", tokenMiddleWare, async (req, res) => {
  try {
    const { mobile_number, name, investor_id } = req.body;
    const headers = req.headers; 

    if (!mobile_number || !name) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile number and name is required",
        },
        "financial_service_data_pull"
      );
    }

    const serviceResponse = await financialServiceDataPull(mobile_number, name, investor_id);

    if (!serviceResponse || serviceResponse.status !== "SUCCESS") {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: serviceResponse.message || "Failed to fetch account details",
        },
        "financial_service_data_pull"
      );
    }

    // Send success response
    return sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: serviceResponse.message,
        data: serviceResponse.data, // this contains account & branch details JSON
      },
      "financial_service_data_pull"
    );
  } catch (error) {
    console.log("financial_service_data_pull route error:", error);
    serverError(res, error);
  }
});

router.post("/log-mobile-to-account", tokenMiddleWare, async (req, res) => {
  try {
    const { mobile_number, investor_id } = req.body;

    if (!mobile_number) {
      await logInvestorRequest({
        mobile_number: mobile_number || "N/A",
        api_name: "mobile-to-account",
        request_payload: req.body,
        status: "FAILED",
        remark: "Mobile number is required",
      });

      return sendEncryptedResponse(
        res,
        { status: "F", remark: "Mobile number is required" },
        "mobile-to-account"
      );
    }

    const investorIdValue = investor_id && investor_id !== "" ? investor_id : null;

    // First, check if mobile number exists in InvestorRequestDecentroLogs
    let existingLogs = null;
    try {
      existingLogs = await getDecentroLog(mobile_number);
      console.log("Existing logs found:", existingLogs?.length > 0);
    } catch (error) {
      console.log("Error fetching existing logs:", error);
      // Continue with API call if there's an error fetching logs
    }

    // If existing logs found and have successful data, return cached response WITHOUT logging
    if (existingLogs && existingLogs.length > 0) {
      const latestLog = existingLogs[0]; // Get the first/latest record
      
      // Check if the log has successful response payload
      if (latestLog.response_payload && Array.isArray(latestLog.response_payload)) {
        console.log("Returning cached data for mobile:", mobile_number);
        
        // DO NOT log when returning cached data - just return the response
        return sendEncryptedResponse(
          res,
          { 
            status: "S", 
            remark: "Data retrieved from cache", 
            data: latestLog.response_payload,
            source: "cache"
          },
          "mobile-to-account"
        );
      }
    }

    // If no cached data found, proceed with API calls AND log the request
    console.log("No cached data found, calling Decentro APIs for mobile:", mobile_number);

    const serviceResponse = await mobileToAccount(mobile_number, investorIdValue);
    console.log("First API (mobile-to-account) response:", serviceResponse);

    const firstApiStatus =
      serviceResponse?.status === "S" ||
      serviceResponse?.status === "SUCCESS" ||
      serviceResponse?.data?.status === "S" ||
      serviceResponse?.data?.status === "SUCCESS";

    if (!firstApiStatus) {
      // Log failed API call
      await logInvestorRequest({
        mobile_number,
        investor_id: serviceResponse?.investor_id,
        api_name: "mobile-to-account",
        request_payload: req.body,
        response_payload: serviceResponse,
        status: "FAILED",
        remark:
          serviceResponse?.remark ||
          serviceResponse?.message ||
          "Mobile-to-Account API failed",
      });

      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark:
            serviceResponse?.remark ||
            serviceResponse?.message ||
            "Mobile-to-Account API failed",
          data: serviceResponse,
        },
        "mobile-to-account"
      );
    }

   // const mobileNumber = "8107600161";
    //const name = "ASHOK KUMAR SAINI";

    let financialResponse = null;
    if (serviceResponse?.data?.nameAsPerBank) {
      try {
        financialResponse = await financialServiceDataPull(
          mobile_number,
          serviceResponse?.data?.nameAsPerBank,
          serviceResponse.investor_id
        );
      } catch (error) {
        financialResponse = { status: "FAILED", message: error };
      }
    }

    const combinedData = [
      { source: "mobile_to_account", response: serviceResponse },
      { source: "financial_service_data_pull", response: financialResponse },
    ];

    // Log successful API call
    await logInvestorRequest({
      mobile_number,
      investor_id: serviceResponse?.investor_id,
      api_name: "mobile-to-account",
      request_payload: req.body,
      response_payload: combinedData,
      status: "SUCCESS",
      remark: "Both APIs executed successfully",
    });

    return sendEncryptedResponse(
      res,
      { 
        status: "S", 
        remark: "Both APIs executed successfully", 
        data: combinedData,
        source: "api"
      },
      "mobile-to-account"
    );
  } catch (error) {
    console.error("mobile-to-account route error:", error);

    // Log error case
    await logInvestorRequest({
      mobile_number: req.body?.mobile_number || "N/A",
      api_name: "mobile-to-account",
      request_payload: req.body,
      status: "FAILED",
      remark: error,
    });

    serverError(res, error);
  }
});

module.exports = router;