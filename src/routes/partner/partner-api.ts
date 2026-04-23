import express from "express";
import {
  getOrCreateRegistrationStatus,
  mobileVerification,
  mobileOtpVerification,
  aadhaarOtpVerification,
  nismUpload,
  updateNominee,
  completeRegistration,
  saveContinueAdhaarDetails,
  userCreated,
  panVerificationLite,
  dashboard,
  saveEmailLog,
  portfolioDetail,
  portfolioDetails,
  getDataByFolioAndScheme,
  getUserBasicDetails,
  portfolioDetailList,
  investmentGetFolioDtl,
  getAdminCount,
  portfolioDetailListAll,
  partnerList,
  getCanImageUploadDtl,
  getCanRegisDtl,
  BirthdaySearch,
  rmDashboardDetail,
  getAllPartnerList,
  updatePartner,
  getAumRecordDtl,
  portfolioSearchs,
  getrmList,
  partnerCount,
  getUserTypeBirthdayDtl,
  getInvestorPortfolioDtl,
  getAcctHoldingPortfolioDtl,
  fnGetPartnerCurrentStatus,
  getPartnerStatus,
  getInvestmentLedgerData,
  getTaxationSummaryData,
  getRmListDtl,
  getTaxationSummaryData1,
  convertInvToPartner,
  getSipCalendar,
  getAumReport,
  getUserPanList,
  getRmCount,
  getBrokerageReport,
  getPartnerDtlWithMobile,
  portfolioXirr,
  invMobileVerification,
  invMobileOtpVerification,
  getDecentroLog,
  bcMobileVerification,
  bcMobileOtpVerification,
  bcCount,
  bcCreated,
  getCanCount,
  getAllBcList,
  portfolioSearches,
  partnerAadhaarVerification,
  bcAadhaarVerification,
  partnerBankAccountNoVerification,
  bcBankAccountNoVerification,
  getPartnerVerificationAllStatus,
  partnerEmailOtpVerification,
  bcEmailOtpVerification,
  getAllClient,
  getAllCanRegisterResponse,
  filterCanRegisterResponse,
  getBcCreatedStatus,
  getPartnerCreatedStatus,
  convertInvToBc,
  getBcCreatedStatuswithmissingfield,
  getInvestmentLedgerDatas,
  getCanId,
  //detailsByPanName,
  //getUserBasicDetails,
  // deactivatePartner,
} from "./partner-handler";
import { findInvestorsByPartnerId } from "../investor/investor-handler";

//import { sendEmail } from "../../service/email.service2";

import prosesjwt from "proses-jwt";
import { sendEmail2 } from "../../services/email.service2";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import ErrorLogger from "../../db/core/logger/error-logger";
import { serverError, unauthorized, alreadyExist } from "proses-response/dist/response";
import {
  getFoliosByPanAndScheme,
  investmentGetFolio,
} from "../../services/mfu.scheme.service";
import path from "path";
import e from "express";
import { getUserByFindEmailOrMobile } from "../user/user-handler";
import { partnerMobileToAccount } from "../decentro/decentro-handler";
import { tokenMiddleWare } from "../../middlewares/tokenMiddleware";
import {
  kycRateLimit,
  dataReadRateLimit,
  dataWriteRateLimit,
  uploadRateLimit,
  mobileOtpSendLimit,
  emailOtpSendLimit,
  aadhaarOtpSendLimit,
} from "../../middlewares/rateLimit";

let { generateToken } = prosesjwt;

const router = express.Router();

// Registration status is a read of our own DB, not an external KYC call.
router.post("/registration-status", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const body = req.body;
    const header = req.headers;

    const { mobile } = body;

    if (!mobile) {
      // Return with sendEncryptedResponse for consistent format
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile number is required",
        },
        "registration-status"
      );
    }

    const [regStatus, created] = await getOrCreateRegistrationStatus(mobile);

    // Use the consistent encryption response
    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: created ? "Created" : "Found",
        regStatus,
      },
      "registration-status"
    );
  } catch (error) {
    ErrorLogger.write({ type: "registration-status error :- ", error });
    serverError(res, error);
  }
});

//mobile-verification -
router.post("/mobile-verification", mobileOtpSendLimit, kycRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const body = req.body;
    const header = req.headers;

    const { mobile, userType } = body;

    if (!mobile) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile number is required",
        },
        "mobile-verification"
      );
    }
    let serviceResponse;
    console.log("userType", userType);

    if (userType == 4) {
      serviceResponse = await mobileVerification(mobile, userType);
    }
    else if (userType == 2) {
      serviceResponse = await invMobileVerification(mobile, userType);
    }
    else {
      serviceResponse = await bcMobileVerification(mobile, userType);
    }

    if (!serviceResponse.success) {
      // If service says failure (mobile exists or any other error)
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: serviceResponse.message,
        },
        "mobile-verification"
      );
    }

    // If success
    return sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: serviceResponse.message,
        data: serviceResponse.data,
      },
      "mobile-verification"
    );
  } catch (error) {
    ErrorLogger.write({ type: "mobile-verification error :- ", error });
    serverError(res, error);
  }
});
// ujjwal
router.get("/rm/dashboard", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    console.log("inside the api");

    const results = await rmDashboardDetail();

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: Array.isArray(results) ? results.length : results ? 1 : 0,
      },
      "rmDashboardDetail search"
    );

    console.log("inside the api- " + results);
  } catch (error) {
    ErrorLogger.write({ type: "rmDashboardDetail search error :- ", error });
    serverError(res, error);
  }
});

//OTP verification--
router.post("/mobile-otp-verification", kycRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const { mobile, userType, otp } = req.body;

    // Input validation

    if (!mobile || !otp) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile ,otp number is required",
        },
        "mobile-otp-verification"
      );
    }

    console.log("inside the ");
    console.log("userType-", userType);

    let resp;

    if (userType == 4) {
      resp = await mobileOtpVerification(mobile, userType, otp);
    }
    else if (userType == 2) {
      resp = await invMobileOtpVerification(mobile, userType, otp);
    }
    else {
      resp = await bcMobileOtpVerification(mobile, userType, otp);
    }

    if (!resp) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "OTP validation failed",
        },
        "mobile-otp-verification"
      );
    }

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Mobile OTP initiated successfully",
        resp,
      },
      "mobile-otp-verification"
    );
  } catch (error) {
    ErrorLogger.write({ type: "mobile-otp-verification error :- ", error });
    serverError(res, error);
  }
});

//Adhaar Verification send otp
router.post("/aadhaar-verification", aadhaarOtpSendLimit, kycRateLimit, tokenMiddleWare, async (req, res) => {
  try {
   //added the user type for handleing the partner and bc adhaar verification function 
    const { mobile, aadhaar,userTypeId } = req.body;

    if (!mobile || !aadhaar) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile ,aadhaar number is required",
        },
        "aadhaar-verification"
      );
    }

     let userReg = "";

     console.log("userTypeId---",userTypeId);
if(userTypeId===4){
userReg = await partnerAadhaarVerification(mobile, aadhaar);
}
  if(userTypeId===6){
userReg = await bcAadhaarVerification(mobile, aadhaar);
  } 
  

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Aadhaar OTP sent successfully",
        userReg,
      },
      "aadhaar-verification"
    );
  } catch (error) {
    ErrorLogger.write({ type: "aadhaar-verification error :- ", error });
    serverError(res, error);
  }
});

//otb verirification without mobile-

router.post("/aadhaar-otp-verification", kycRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const { mobile, aadhaar, otp, ref_id } = req.body;

    // Validate required fields
    if (!mobile || !aadhaar || !otp || !ref_id) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile ,aadhaar number is required",
        },
        "aadhaar-otp-verification"
      );
    }

    // Call service function
    const userReg = await aadhaarOtpVerification(mobile, aadhaar, otp, ref_id);

    // Build response data
    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Aadhaar Verified successfully",
        userReg,
      },
      "aadhaar-otp-verification"
    );
  } catch (error) {
    ErrorLogger.write({ type: "aadhaar-otp-verification error :- ", error });
    serverError(res, error);
  }
});

// Assuming you have imported your service
// import { aadhaarOtpVerification } from "../services/partner-handler";

router.post("/aadhaar-otp-verification", kycRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const { mobile, aadhaar, otp, ref_id } = req.body;

    // Validate required fields
    if (!mobile || !aadhaar || !otp || !ref_id) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile, Aadhaar, OTP and ref_id are all required",
        },
        "aadhaar-otp-verification"
      );
    }

    // Call service function
    const userReg = await aadhaarOtpVerification(mobile, aadhaar, otp, ref_id);

    // Build response data
    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Aadhaar Verified successfully",
        userReg,
      },
      "aadhaar-otp-verification"
    );
  } catch (error) {
    ErrorLogger.write({ type: "aadhaar-otp-verification error :- ", error });
    serverError(res, error);
  }
});

//PAN verification lite-
router.post("/pan-verification", kycRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const { mobile, pan, name, dob,userTypeId } = req.body;
console.log("userTypeId---",userTypeId);

    // Validate required fields
    if (!mobile || !pan) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile, PAN are required",
        },
        "pan-verification"
      );
    }

    // Call service function
    const userReg = await panVerificationLite(mobile, pan, name, dob,userTypeId);
    // Build response data
    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "PAN Verified successfully",
        userReg,
      },
      "pan-verification"
    );
  } catch (error) {
    ErrorLogger.write({ type: "pan-verification error :- ", error });
    serverError(res, error);
  }
});

//Bank verification process-
router.post("/bank-account-verification", kycRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const { mobile, bankAcNo, bankAcIfsc,userTypeId } = req.body;

    // Validate required fields
    if (!mobile || !bankAcNo || !bankAcIfsc) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark:
            "Mobile, Bank Account Number, IFSC, and Name in Bank are required",
        },
        "bank-account-verification"
      );
    }

     // Call service function
    let userReg=null;


if(userTypeId===4){
   userReg = await partnerBankAccountNoVerification(
      mobile,
      bankAcNo,
      bankAcIfsc,
    );
}
if(userTypeId===6){
 userReg = await bcBankAccountNoVerification(
      mobile,
      bankAcNo,
      bankAcIfsc,
    );
}
   
    // Build response data
    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Bank Account Number verified successfully",
        userReg,
      },
      "bank-account-verification"
    );
  } catch (error) {
    ErrorLogger.write({ type: "bank-account-verification error :- ", error });
    serverError(res, error);
  }
});

//nismUpload

router.post("/nism-upload", uploadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const { mobile, nismDoc, arn_no, euin_no } = req.body;

    // Validate required fields
    if (!mobile || !nismDoc) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile number and NISM Document are required",
        },
        "nism-upload"
      );
    }

    // Call service function
    const userReg = await nismUpload(mobile, nismDoc, arn_no, euin_no);

    // Build response data
    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "NISM Document updated successfully",
        userReg,
      },
      "nism-upload"
    );
  } catch (error) {
    ErrorLogger.write({ type: "nism-upload error :- ", error });
    serverError(res, error);
  }
});
router.post("/email-verification", emailOtpSendLimit, kycRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const body = req.body;
    const header = req.headers;

    const { mobile, email } = body;

    if (!mobile || !email) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile number and Email are required",
        },
        "email-verification"
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { background-color: #f4f4f4; font-family: Arial, sans-serif; }
          .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 30px; text-align: center; }
          .logo img { width: 120px; margin-bottom: 20px; }
          .title { font-size: 22px; color: #333; margin-bottom: 20px; }
          .otp-box { font-size: 36px; color: #28a745; font-weight: bold; letter-spacing: 4px; background: #f0fff0; padding: 15px 0; border-radius: 6px; margin: 20px 0; }
          .message { font-size: 15px; color: #555; margin: 10px 0 20px; }
          .footer { font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="https://vedantasset.com/wp-content/uploads/2024/03/cropped-vedant-asset-logo.webp" alt="Vedant Asset Logo" />
          </div>
          <div class="title">Your Email OTP</div>
          <div class="message">Dear User,</div>
          <div class="message">Use the following OTP to verify your email address:</div>
          <div class="otp-box">${otp}</div>
          <div class="message">This OTP is valid for 10 minutes. Please do not share it with anyone.</div>
          <div class="footer">
            © ${new Date().getFullYear()} Vedant Asset Limited. All rights reserved.
          </div>
        </div>
      </body>
    </html>`;

    // Send email
    await sendEmail2(
      email,
      "Customer",
      "Your Email Verification OTP",
      htmlContent
    );

    // Save log
    await saveEmailLog(mobile, email, otp);

    // Send encrypted response
    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Email OTP sent successfully",
      },
      "email-verification"
    );
  } catch (error) {
    ErrorLogger.write({ type: "email-verification error :- ", error });
    serverError(res, error);
  }
});

router.post("/email-otp-verification", kycRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const body = req.body;
    const header = req.headers;

    const { mobile, email, otp,userTypeId } = body;

    // Validate required fields
    if (!mobile || !email || !otp) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile number, Email, and OTP are required",
        },
        "email-otp-verification"
      );
    }

    let verificationResult;

if(userTypeId===4){
    // Call service function
     verificationResult = await partnerEmailOtpVerification(mobile, email, otp);

}
if(userTypeId===6){
    // Call service function
     verificationResult = await bcEmailOtpVerification(mobile, email, otp);

}
    // Send encrypted response
    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Email verified successfully",
        verificationResult,
      },
      "email-otp-verification"
    );
  } catch (error) {
    ErrorLogger.write({ type: "email-otp-verification error :- ", error });
    serverError(res, error);
  }
});

// Nominee save is a DB write, not an external KYC verification — it was
// sharing the strict 20-req KYC bucket with PAN/Aadhaar/OTP calls and tripping
// "Too many verification requests" mid-onboarding. Move it to the write tier
// (100/15min).
router.post("/update-nominee", dataWriteRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const body = req.body;
    const header = req.headers;

    const {
      mobile,
      nomineeName,
      nomineeRelation,
      nomineeType,
      nomineeDob,
      nomineePan,
    } = body;

    // Validate required fields
    if (
      !mobile ||
      !nomineeName ||
      !nomineeRelation ||
      !nomineeType ||
      !nomineeDob ||
      !nomineePan
    ) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark:
            "All nominee details (Mobile, Name, Relation, Type, DOB, PAN) are required",
        },
        "update-nominee"
      );
    }

    // Call service function
    const userReg = await updateNominee(
      mobile,
      nomineeName,
      nomineeRelation,
      nomineeType,
      nomineeDob,
      nomineePan
    );

    // Send encrypted response
    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Nominee updated successfully",
        userReg,
      },
      "update-nominee"
    );
  } catch (error) {
    ErrorLogger.write({ type: "update-nominee error :- ", error });
    serverError(res, error);
  }
});

router.post("/complete-registration", kycRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const body = req.body;
    const header = req.headers;

    const { mobile, password } = body;

    // Validate required fields
    if (!mobile || !password) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile number and password are required",
        },
        "complete-registration"
      );
    }

    // Call service function
    const userReg = await completeRegistration(mobile, password);

    // Send encrypted response
    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "User registration completed successfully",
        userReg,
      },
      "complete-registration"
    );
  } catch (error) {
    ErrorLogger.write({ type: "complete-registration error :- ", error });
    serverError(res, error);
  }
});

//save and continue button process
router.post("/save_continue_adhaar_details", kycRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const { name, adhaar, mobile, address, dob } = req.body;

    // Validate required fields
    if (!name || !adhaar || !mobile || !address || !dob) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile ,aadhaar number is required",
        },
        "save_continue_adhaar_details"
      );
    }
    console.log("name-" + name);

    // Call service function
    const userReg = await saveContinueAdhaarDetails(
      name,
      adhaar,
      mobile,
      address,
      dob
    );

    // Build response data
    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Aadhaar details saved and continued successfully",
        userReg,
      },
      "save_continue_adhaar_details"
    );
  } catch (error) {
    ErrorLogger.write({
      type: "save_continue_adhaar_details error :- ",
      error,
    });
    serverError(res, error);
  }
});
router.post("/partner_user_created", kycRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const {
      mobile,
      name,
      email,
      dob,
      address,
      pincode,
      aadhaar,
      pan,
      bank_account,
      ifsc,
      bank_name,
      micr,
      nism_arn,
      nism_euin,
      nism_certificate_uploaded,
      nism_file_name,
      aadhaar_verified,
      pan_verified,
      bank_verified,
      email_verified
    } = req.body;

    if (!mobile || !name) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile and name are required",
        },
        "partner_user_created"
      );
    }

  const { isUserCreated, missingFields } =
  await getPartnerCreatedStatus(mobile);

if (isUserCreated === 0) {

  const fieldMap: Record<string, string> = {
    mobile: "Mobile Number",
    email: "Email",
    aadhaar: "Aadhaar",
    pan: "PAN",
    bank: "Bank Details",
    user_not_found: "User Record",
  };

  const firstMissingField = missingFields[0] || "verification field";

  const remark = `${fieldMap[firstMissingField] || firstMissingField} is missing`;

  return sendEncryptedResponse(
    res,
    {
      status: "F",
      remark,
    },
    "partner_user_created"
  );
}


    const userReg = await userCreated(
      mobile,
      name,
      email,
      dob,
      address,
      pincode,
      aadhaar,
      pan,
      bank_account,
      ifsc,
      bank_name,
      micr,
      nism_arn,
      nism_euin,
      nism_certificate_uploaded,
      nism_file_name,
      aadhaar_verified,
      pan_verified,
      bank_verified,
      email_verified
    );

    return sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "User saved and continued successfully",
        userReg,
      },
      "partner_user_created"
    );

  } catch (error) {
    ErrorLogger.write({
      type: "partner_user_created error",
      error
    });
    return serverError(res, error);
  }
});


//user created for business correspondent 
router.post("/bc_user_created", kycRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const {
      mobile,
      name,
      dob,
      address,
      pincode,
      aadhaar,
      pan,
      bank_account,
      ifsc,
      bank_name,
      micr,
      email,
      aadhaar_verified,
      pan_verified,
      bank_verified,
      email_verified
    } = req.body;

    console.log("mobile-" + mobile);
    console.log("name-" + name);
    console.log("email-" + email);
    console.log("dob-" + dob);
    console.log("address-" + address);
    console.log("pan-" + pan);
    console.log("aadhaar-" + aadhaar);
    console.log("bank_account-" + bank_account);
    console.log("ifsc-" + ifsc);

    // Validate required fields
    if (!mobile || !name) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile and name are required",
        },
        "businessCorrespondent_user_created"
      );
    }

    const { isUserCreated, missingFields } =
  await getBcCreatedStatuswithmissingfield(mobile);

if (isUserCreated === 0) {

  const fieldMap: Record<string, string> = {
    mobile: "Mobile Number",
    email: "Email",
    aadhaar: "Aadhaar",
    pan: "PAN",
    bank: "Bank Details",
    user_not_found: "User Record",
  };

  const firstMissingField = missingFields[0] || "verification field";

  const remark = `${fieldMap[firstMissingField] || firstMissingField} is missing`;

  return sendEncryptedResponse(
    res,
    {
      status: "F",
      remark,
    },
    "partner_user_created"
  );
}

    // Call service function with all data
    const userReg = await bcCreated(
      mobile,
      name,
      dob,
      address,
      pincode,
      aadhaar,
      pan,
      bank_account,
      ifsc,
      bank_name,
      micr,
      email,
      aadhaar_verified,
      pan_verified,
      bank_verified,
      email_verified
    );

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "User saved and continued successfully",
        userReg,
      },
      "businessCorrespondent_user_created"
    );
  } catch (error) {
    ErrorLogger.write({ type: "businesscorrespondent_user_created error :- ", error });
    serverError(res, error);
  }
});




router.post("/dashboard", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const body = req.body;
    const header = req.headers;

    const { mobile } = body;

    if (!mobile) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile number is required",
        },
        "dashboard"
      );
    }

    console.log("mobile -", mobile);

    const { userReg, totalCount, activeCount, aumSum } = await dashboard(
      mobile
    );

    // Hardcoded values (update if dynamic in future)
    const transcount = 199;
    const revenueCount = 199;
    const ucoCount = 199;

    sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: "Dashboard data fetched successfully",
        totalCount,
        activeCount,
        aumSum,
        transcount,
        revenueCount,
        ucoCount,
      },
      "dashboard"
    );
  } catch (error) {
    ErrorLogger.write({ type: "dashboard error :- ", error });
    serverError(res, error);
  }
});

//code of ujjwal singh
router.post("/getFolio", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const { pan, scheme } = req.body;

    if (!pan || !scheme) {
      return res
        .status(400)
        .json({ message: "Both 'pan' and 'scheme' are required." });
    }

    const results = await getFoliosByPanAndScheme(pan, scheme);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "getFoliosByPanAndScheme"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getFoliosByPanAndScheme error :- ", error });
    serverError(res, error);
  }
});

router.post("/investmentGetFolio", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const { pan } = req.body;

    if (!pan) {
      return res.status(400).json({ message: "Both 'pan'  are required." });
    }

    const results = await investmentGetFolio(pan);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "getFoliosByPanAndScheme"
    );
  } catch (error) {
    ErrorLogger.write({ type: "investmentGetFolio error :- ", error });
    serverError(res, error);
  }
});

//details of investment ledger page through pan By Aditya Gupta-\

router.post("/investmentGetFolioDtl", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const { pan } = req.body;

    console.log(pan);

    if (!pan) {
      return res.status(400).json({ message: "Both 'pan'  are required." });
    }

    const results = await investmentGetFolioDtl({ pan });

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "getFoliosByPanAndScheme"
    );
  } catch (error) {
    ErrorLogger.write({ type: "investmentGetFolio error :- ", error });
    serverError(res, error);
  }
});

router.post("/portfolio/details", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const { pan_no } = req.body;

    console.log("inside the api ");
    console.log("pan-" + pan_no);

    const results = await portfolioDetail({ pan_no });

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: Array.isArray(results) ? results.length : results ? 1 : 0,
      },
      "viewPortfolioBySearch"
    );

    console.log("inside the api- " + results);
  } catch (error) {
    ErrorLogger.write({ type: "viewPortfolioBySearch error :- ", error });
    serverError(res, error);
  }
});

//new api for Birthday
router.get("/birthdays", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    console.log("Fetching all birthday records");

    const results = await BirthdaySearch();

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: Array.isArray(results) ? results.length : results ? 1 : 0,
      },
      "BirthdaySearch"
    );

    console.log("Birthday search results count: " + results.length);
  } catch (error) {
    ErrorLogger.write({ type: "BirthdaySearch error :- ", error });
    serverError(res, error);
  }
});

//changes done by aditya for the client list on the basis of partnerList,rm and admin

router.get("/portfolioDetails/:loginId/:rmId/:userTypeid?", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
    try {
      const { loginId, rmId, userTypeid } = req.params;

      const results = await portfolioDetails(loginId, rmId, userTypeid);

      sendEncryptedResponse(
        res,
        {
          data: results,
          count: results.length,
        },
        "viewPortfolioData"
      );
    } catch (error) {
      ErrorLogger.write({ type: "viewPortfolioData error :- ", error });
      serverError(res, error);
    }
  }
);

router.post("/getData", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const { foliochk, sch_name } = req.body;

    if (!foliochk || !sch_name) {
      return res
        .status(400)
        .json({ message: "Both 'foliochk' and 'scheme' are required." });
    }

    const results = await getDataByFolioAndScheme(foliochk, sch_name);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "getDataByFolioAndScheme"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getDataByFolioAndScheme error :- ", error });
    serverError(res, error);
  }
});

//fetching the basic details for reports-Aditya Gupta code

router.get("/getUserBasicDetails/:id", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const body = req.body;
    const header = req.headers;
    const { id } = req.params;

    const results = await getUserBasicDetails(id);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
        // message: Found ${results.length} records for ISIN: ${pri_isin}
      },
      "getUserBasicDetails"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getUserBasicDetails error :- ", error });
    serverError(res, error);
  }
});

///new
router.post("/portfolio/detailsList", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const { pan_no } = req.body;

    console.log("inside the api ");
    console.log("pan-" + pan_no);

    const results = await portfolioDetailList({ pan_no });

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: Array.isArray(results) ? results.length : results ? 1 : 0,
      },
      "viewPortfolioBySearch"
    );

    console.log("inside the api- " + results);
  } catch (error) {
    ErrorLogger.write({ type: "viewPortfolioBySearch error :- ", error });
    serverError(res, error);
  }
});

//ankit
router.post("/portfolio/detailsListAll", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    console.log("Fetching all portfolio details");

    const results = await portfolioDetailListAll();

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: Array.isArray(results) ? results.length : results ? 1 : 0,
      },
      "viewPortfolioListAll"
    );

    console.log("Portfolio details fetched successfully");
  } catch (error) {
    ErrorLogger.write({ type: "viewPortfolioListAll error :- ", error });
    serverError(res, error);
  }
});

//ankit
// router.post('/portfolio/detailsByPanName', async (req, res) => {
//   try {
//     console.log("Fetching all portfolio details");
//     const { pan, inv_name } = req.body; // include inv_name

//     const results = await detailsByPanName({ pan, inv_name }); // pass both pan and inv_name

//     sendEncryptedResponse(
//       res,
//       {
//         data: results,
//         count: Array.isArray(results) ? results.length : (results ? 1 : 0),
//       },
//       "detailsByPanName"
//     );

//     console.log("Portfolio details fetched successfully");
//   } catch (error) {
//     ErrorLogger.write({ type: "detailsByPanName error :- ", error });
//     serverError(res, error);
//   }
// });

//Adming Dashboard Overview counts -

router.get("/adming-counts", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const body = req.body;
    const header = req.headers;

    const results = await getAdminCount();

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "adming-counts"
    );
  } catch (error) {
    ErrorLogger.write({ type: "adming-counts error :- ", error });
    serverError(res, error);
  }
});

//Rm dashboard count -

router.get("/rmCount/:rmId", tokenMiddleWare, async (req, res) => {
  try {
    const { rmId } = req.params;

    const results = await getRmCount(rmId);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "rm-counts"
    );
  } catch (error) {
    ErrorLogger.write({ type: "rm-counts error :- ", error });
    serverError(res, error);
  }
});


//ankit 
router.get("/allClient/:rmId", tokenMiddleWare, async (req, res) => {
  try {
    const { rmId } = req.params;

    const results = await getAllClient(rmId);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "rm-counts"
    );
  } catch (error) {
    ErrorLogger.write({ type: "rm-counts error :- ", error });
    serverError(res, error);
  }
});

//can get all by ankit
router.get("/canRegister/all", tokenMiddleWare, async (req, res) => {
  try {
    const results = await getAllCanRegisterResponse();

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "can-register-response"
    );
  } catch (error) {
    ErrorLogger.write({ type: "can-register-response error :- ", error });
    serverError(res, error);
  }
});

// get CAN By Created Date By Ankit
router.post("/canRegister/filter", tokenMiddleWare, async (req, res) => {
  try {
    const { created_at, CAN } = req.body;

    const results = await filterCanRegisterResponse(created_at, CAN);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "can-register-filter"
    );
  } catch (error) {
    ErrorLogger.write({ type: "can-register-filter error :- ", error });
    serverError(res, error);
  }
});



router.get("/partnerCount/:partnerId", tokenMiddleWare, async (req, res) => {
  try {

    const { partnerId } = req.params;

    const results = await partnerCount(partnerId);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "partnerCount"
    );
  } catch (error) {
    ErrorLogger.write({ type: "partnerCount error :- ", error });
    serverError(res, error);
  }
});


router.get("/bcCount/:bcId", tokenMiddleWare, async (req, res) => {
  try {

    const { bcId } = req.params;

    const results = await bcCount(bcId);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "bcCount"
    );
  } catch (error) {
    ErrorLogger.write({ type: "bcCount error :- ", error });
    serverError(res, error);
  }
});

router.get("/partnerList", tokenMiddleWare, async (req, res) => {
  try {
    const results = await partnerList();

    sendEncryptedResponse(
      res,
      {
        data: results,
      },
      "partnerList"
    );
  } catch (error) {
    ErrorLogger.write({ type: "partnerList error :- ", error });
    serverError(res, error);
  }
});
//can details after registration done --
router.get("/getCanRegisDtl", tokenMiddleWare, async (req, res) => {
  try {
    const results = await getCanRegisDtl();

    sendEncryptedResponse(
      res,
      {
        data: results,
      },
      "getCanRegisDtl"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getCanRegisDtl error :- ", error });
    serverError(res, error);
  }
});

//API for Can Image Upload Section Done By Aditya Gupta

router.get("/getCanImageUploadDtl", tokenMiddleWare, async (req, res) => {
  try {
    const results = await getCanImageUploadDtl();

    sendEncryptedResponse(
      res,
      {
        data: results,
      },
      "getCanImageUploadDtl"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getCanImageUploadDtl error :- ", error });
    serverError(res, error);
  }
});

router.get("/getChequeImage/:filename", tokenMiddleWare, async (req, res) => {
  try {
    const { filename } = req.params;

    console.log("filename-" + filename);

    // Absolute path to your chequeDoc folder
    const filepath = path.join(__dirname, "..", "..", "..", "src");
    const imagePath = path.join(filepath, "public", "chequeDoc", filename);

    // Send the file directly
    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error("Error sending image:", err);
        res.status(404).json({ error: "File not found" });
      }
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get(
  "/getAllPartnerList",
  tokenMiddleWare,
  async (req: any, res: any) => {
    try {
      let query: any = { ...req.query, user: req.user };
      console.log("query-111111111111" + JSON.stringify(req.query));

      let allData: any = await getAllPartnerList(query);

      sendEncryptedResponse(res, allData, "Got all partner list");
    } catch (error) {
      console.log(error, "EEEEEEEEEEEE");

      ErrorLogger.write({ type: "getAllPartnerList error", error });
      serverError(res, error);
    }
  }
);


router.get(
  "/getAllBcList",
  tokenMiddleWare,
  async (req: any, res: any) => {
    try {
      let query: any = { ...req.query, user: req.user };
      console.log("query-111111111111" + JSON.stringify(req.query));

      let allData: any = await getAllBcList(query);

      sendEncryptedResponse(res, allData, "Got all bc list");
    } catch (error) {
      console.log(error, "EEEEEEEEEEEE");

      ErrorLogger.write({ type: "getAllBcList error", error });
      serverError(res, error);
    }
  }
);

router.put("/updatePartner/:id", tokenMiddleWare, async (req, res) => {
  try {
    let updateData: any = await updatePartner(req.body, req.params);
    updateData = JSON.parse(JSON.stringify(updateData[1][0]));

    sendEncryptedResponse(res, updateData, "Data Updated Successfully");
  } catch (error) {
    ErrorLogger.write({ type: "updatePartner error", error });
    serverError(res, error);
  }
});

// router.delete("/deactivatePartner/:id",  async (req, res) => {
//   try {
//     const { id } = req.params;
//     // make a new function in investor handeler file and get find all investor by partner_id

//     //if data exits then throw error
//     const investors = await findInvestorsByPartnerId(id);
//     if ( investors.length > 0) {
//       throw alreadyExist(res, `Cannot deactivate partner`);
//     } else {
//       const result = await deactivatePartner(id);
//       sendEncryptedResponse(res, result, "deactivate-partner");
//     }
//   } catch (error) {
//     ErrorLogger.write({ type: "deactivatePartner error", error });
//     serverError(res, error);
//   }
// });

// router.delete("/deleteInvestor/:id",  async (req, res) => {
//   try {

//     const results = await deleteInvestor(req.params);
//     sendEncryptedResponse(res, results, "delete Investor");

//   } catch (error) {
//     ErrorLogger.write({ type: "deleteInvestor error :- ", error });
//     serverError(res, error);
//   }
// });

router.get("/getAumRecordDtl/:pan", tokenMiddleWare, async (req, res) => {
  try {
    const body = req.body;
    const header = req.headers;
    const { pan } = req.params;

    const results = await getAumRecordDtl(pan);

    sendEncryptedResponse(
      res,
      {
        data: results,
      },
      "getAumRecordDtl"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getAumRecordDtl error :- ", error });
    serverError(res, error);
  }
});


// ankit get canid by investorid
router.get("/getCanId/:investor_id", tokenMiddleWare, async (req, res) => {
  try {
    const { investor_id } = req.params;

    const results = await getCanId(investor_id);

    sendEncryptedResponse(
      res,
      {
        data: results,
      },
      "getCanId"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getCanId error :- ", error });
    serverError(res, error);
  }
});

// ankit-for portfolio valuation report chnages done aditya gupta -23-08-2025
router.post("/portfolio/searchs", tokenMiddleWare, async (req, res) => {
  try {
    const { pan, rpt_date } = req.body;

    console.log("--------------------------------------------");

    console.log("pan--" + pan);

    console.log("--------------------------------------------");

    const results = await portfolioSearchs(pan, rpt_date);

    sendEncryptedResponse(
      res,
      {
        data: results,
        // count: Array.isArray(results) ? results.length : (results ? 1 : 0),
      },
      "portfolio"
    );
  } catch (error) {
    ErrorLogger.write({ type: "portfolio error :- ", error });
    serverError(res, error);
  }
});

// ankit 25-11-2025
router.post("/portfolio/searches", tokenMiddleWare, async (req, res) => {
  try {
    const { pan, rpt_date } = req.body;

    const results = await portfolioSearches(pan, rpt_date);

    sendEncryptedResponse(
      res,
      {
        data: results,
        // count: Array.isArray(results) ? results.length : (results ? 1 : 0),
      },
      "portfolio"
    );
  } catch (error) {
    ErrorLogger.write({ type: "portfolio error :- ", error });
    serverError(res, error);
  }
});


// ankit dubey
router.post("/portfolio/xirr", tokenMiddleWare, async (req, res) => {
  try {
    const { pan, rpt_date } = req.body;

    console.log("--------------------------------------------");
    console.log("XIRR API called for PAN:", pan);
    console.log("--------------------------------------------");

    const results = await portfolioXirr(pan, rpt_date);

    sendEncryptedResponse(
      res,
      {
        data: results,
      },
      "xirr"
    );
  } catch (error) {
    ErrorLogger.write({ type: "XIRR API error :- ", error });
    serverError(res, error);
  }
});

//rm registration list -
router.get("/getrmList", tokenMiddleWare, async (req, res) => {
  try {
    const results = await getrmList();

    sendEncryptedResponse(
      res,
      {
        data: results,
      },
      "getrmList"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getrmList error :- ", error });
    serverError(res, error);
  }
});

//birthday query api on the basis of the user type -
router.get("/userTypeBirthdayDtl/:userTypeId", tokenMiddleWare, async (req, res) => {
  try {
    const { userTypeId } = req.params;

    const results = await getUserTypeBirthdayDtl(userTypeId);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "userTypeBirthdayDtl"
    );
  } catch (error) {
    ErrorLogger.write({ type: "userTypeBirthdayDtl error :- ", error });
    serverError(res, error);
  }
});
//investor portfolio dropdown list --
router.get(
  "/getInvestorPortfolioDtl/:userTypeId/:userId?",
  tokenMiddleWare,
  async (req, res) => {
    try {
      let { userTypeId, userId } = req.params as {
        userTypeId: string;
        userId?: string | null;
      };

      if (!userId || userId === "null" || userId === "undefined") {
        userId = null;
      }

      const results = await getInvestorPortfolioDtl(userTypeId, userId ?? null);

      sendEncryptedResponse(
        res,
        {
          data: results,
          count: results.length,
        },
        "viewPortfolioData"
      );
    } catch (error) {
      ErrorLogger.write({ type: "viewPortfolioData error :- ", error });
      serverError(res, error);
    }
  }
);

router.get("/getAcctHoldingPortfolioDtl/:inv_id", tokenMiddleWare, async (req, res) => {
  try {
    const { inv_id } = req.params;

    const results = await getAcctHoldingPortfolioDtl(inv_id);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "getAcctHoldingPortfolioDtl"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getAcctHoldingPortfolioDtl error :- ", error });
    serverError(res, error);
  }
});

//getting the current status of the partner-

router.get("/fnGetPartnerCurrentStatus/:mobile_no", tokenMiddleWare, async (req, res) => {
  try {
    const { mobile_no } = req.params;

    const results = await fnGetPartnerCurrentStatus(mobile_no);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "fnGetPartnerCurrentStatus"
    );
  } catch (error) {
    ErrorLogger.write({ type: "fnGetPartnerCurrentStatus error :- ", error });
    serverError(res, error);
  }
});

router.post("/getPartnerStatus", tokenMiddleWare, async (req, res) => {
  try {
    const { mobile, userType } = req.body;

    if (!mobile) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile number is required",
        },
        "get-partner-status"
      );
    }

    const serviceResponse = await getPartnerStatus(mobile, userType);

    if (!serviceResponse.success) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: serviceResponse.message,
          data: serviceResponse.data || null,
        },
        "get-partner-status"
      );
    }

    return sendEncryptedResponse(
      res,
      {
        status: "S",
        remark: serviceResponse.message,
        data: serviceResponse.data,
      },
      "get-partner-status"
    );
  } catch (error) {
    ErrorLogger.write({ type: "get-partner-status error :- ", error });
    serverError(res, error);
  }
});

//investment ledger report with function query-
router.post("/getInvestmentLedgerData", tokenMiddleWare, async (req, res) => {
  try {
    const { pan, rpt_type, from_date, to_date } = req.body;

    const results = await getInvestmentLedgerData(
      pan,
      rpt_type,
      from_date,
      to_date
    );

    sendEncryptedResponse(
      res,
      {
        data: results,
      },
      "getInvestmentLedgerData"
    );
  } catch (error) {
    ErrorLogger.write({ type: "portfolio error :- ", error });
    serverError(res, error);
  }
});



router.post("/getSipSwp", tokenMiddleWare, async (req, res) => {
  try {
    const { pan, rpt_type, from_date, to_date } = req.body;

    const results = await getInvestmentLedgerDatas(
      pan,
      rpt_type,
      from_date,
      to_date
    );

    sendEncryptedResponse(
      res,
      {
        data: results,
      },
      "getInvestmentLedgerData"
    );
  } catch (error) {
    ErrorLogger.write({ type: "portfolio error :- ", error });
    serverError(res, error);
  }
});

//Taxation sheet 
router.post('/getTaxationSummaryData', tokenMiddleWare, async (req, res) => {
  try {
    const { pan, rpt_type, from_date, to_date } = req.body;

    const results = await getTaxationSummaryData(pan, rpt_type, from_date, to_date);

    sendEncryptedResponse(res, {
      data: results,
    }, "getInvestmentLedgerData");

  } catch (error) {
    ErrorLogger.write({ type: "portfolio error :- ", error });
    serverError(res, error);
  }
});

//Taxation sheet(Unrealised) by ankit
router.post('/getTaxationSummaryDataUnrealised', tokenMiddleWare, async (req, res) => {
  try {
    const { pan, date } = req.body;

    const results = await getTaxationSummaryData1(pan, date);

    sendEncryptedResponse(res, {
      data: results,
    }, "getInvestmentLedgerData");

  } catch (error) {
    ErrorLogger.write({ type: "portfolio error :- ", error });
    serverError(res, error);
  }
});


router.get("/getRmListDtl", tokenMiddleWare, async (req: any, res: any) => {
  try {
    console.log("----------------------------------------------------");

    const query = { ...req.query, user: req.user };
    const results = await getRmListDtl(query);

    sendEncryptedResponse(
      res,
      { data: results },
      "Got RM list details"
    );
  } catch (error) {
    console.error(error, "EEEEEEEEEEEE");
    ErrorLogger.write({ type: "getRmList error", error });
    serverError(res, error);
  }
});

// create investor as partner -Aditya Gupta
router.post('/convertInvToPartner', tokenMiddleWare, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return sendEncryptedResponse(
        res,
        { success: false, msg: "userId is required", data: null },
        "createUserRegistration"
      );
    }

    const result = await convertInvToPartner(Number(userId));

    sendEncryptedResponse(res, result, "createUserRegistration");
  } catch (error: any) {
    ErrorLogger.write({ type: "createUserRegistration fatal error :- ", error });

    sendEncryptedResponse(
      res,
      { success: false, msg: "Unexpected error", data: null },
      "createUserRegistration"
    );
  }
});

// create investor as bc  -Ankit
router.post('/convertInvToBc', tokenMiddleWare, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return sendEncryptedResponse(
        res,
        { success: false, msg: "userId is required", data: null },
        "createBcRegistration"
      );
    }

    const result = await convertInvToBc(Number(userId));

    sendEncryptedResponse(res, result, "createBcRegistration");
  } catch (error: any) {
    ErrorLogger.write({ type: "createBcRegistration fatal error :- ", error });

    sendEncryptedResponse(
      res,
      { success: false, msg: "Unexpected error", data: null },
      "createBcRegistration"
    );
  }
});


//sunil
router.post("/getSipCalendar", tokenMiddleWare, async (req, res) => {
  try {
    const { in_role, in_user_id, in_ason_date } = req.body;

    console.log("Inputs:", in_role, in_user_id, in_ason_date);

    const results = await getSipCalendar(in_role, in_user_id, in_ason_date);

    sendEncryptedResponse(
      res,
      { data: results },
      "getSipCalendar"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getSipCalendar error :- ", error });
    serverError(res, error);
  }
});

//anklit
router.post("/getAumReport", tokenMiddleWare, async (req, res) => {
  try {
    const { in_role, in_from_date, in_to_date, in_pan } = req.body;

    console.log("Inputs:", in_role, in_from_date, in_to_date, in_pan);

    let pan: string | null = null;

    if (in_role === "RM" || in_role === "Partner" || in_role === "Investor") {
      pan = in_pan;
    }

    const results = await getAumReport(in_from_date, in_to_date, pan);

    sendEncryptedResponse(res, { data: results }, "getAumReport");
  } catch (error) {
    ErrorLogger.write({ type: "getAumReport error :- ", error });
    serverError(res, error);
  }
});
// ankit
router.post("/getUserPanList", tokenMiddleWare, async (req, res) => {
  try {
    const { in_type } = req.body;

    if (!in_type || !["R", "P", "I"].includes(in_type)) {
      return res.status(400).json({ error: "Invalid type. Allowed values: R, P, I" });
    }

    const results = await getUserPanList(in_type);

    sendEncryptedResponse(res, { data: results }, "getUserPanList");
  } catch (error) {
    ErrorLogger.write({ type: "getUserPanList error :- ", error });
    serverError(res, error);
  }
});

// ankit brokerage Report
router.post("/getBrokerageReport", tokenMiddleWare, async (req, res) => {
  try {
    const { in_group, in_category, in_fund, in_brokerage_type, in_from_date, in_to_date } = req.body;

    console.log("Inputs:", in_group, in_category, in_fund, in_brokerage_type, in_from_date, in_to_date);

    const results = await getBrokerageReport(
      in_group,
      in_category,
      in_fund,
      in_brokerage_type,
      in_from_date,
      in_to_date
    );

    sendEncryptedResponse(res, { data: results }, "getBrokerageReport");
  } catch (error) {
    ErrorLogger.write({ type: "getBrokerageReport error :- ", error });
    serverError(res, error);
  }
});

//Get the partner onboarded details -
router.get("/getPartnerDtlWithMobile", tokenMiddleWare, async (req, res) => {
  try {
    // Fetch mobile number from query params instead of body for GET requests
    const { mobile } = req.query;

    console.log("mobile-", mobile);

    if (!mobile) {
      return sendEncryptedResponse(
        res,
        {
          status: "F",
          remark: "Mobile number is required",
        },
        "getPartnerDtlWithMobile"
      );
    }

    // Call your DB/service function
    const results = await getPartnerDtlWithMobile(String(mobile));

    sendEncryptedResponse(
      res,
      {
        status: "S",
        data: results,
      },
      "getPartnerDtlWithMobile"
    );

    console.log("getPartnerDtlWithMobile count:", results?.length || 0);
  } catch (error) {
    ErrorLogger.write({ type: "getPartnerDtlWithMobile error :- ", error });
    serverError(res, error);
  }
});

//Get details from decentro --
router.get("/getDecentroLog/:mobile_no", tokenMiddleWare, async (req, res) => {
  try {
    const { mobile_no } = req.params;

    const results = await getDecentroLog(mobile_no);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "getDecentroLog"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getDecentroLog error :- ", error });
    serverError(res, error);
  }
});

router.get("/getCanCount/:investor_id", tokenMiddleWare, async (req, res) => {
  try {
    const { investor_id } = req.params;

    const results = await getCanCount(investor_id);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "getCanCount"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getCanCount error :- ", error });
    serverError(res, error);
  }
});

//get the verification status of partner-
router.get("/getPartnerVerificationAllStatus/:mobile_no", tokenMiddleWare, async (req, res) => {
  try {
    const { mobile_no } = req.params;

    const results = await getPartnerVerificationAllStatus(mobile_no);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "getPartnerVerificationAllStatus"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getPartnerVerificationAllStatus error :- ", error });
    serverError(res, error);
  }
});
//get partner created status -
router.get("/getPartnerCreatedStatus/:mobile_no", tokenMiddleWare, async (req, res) => {
  try {
    const { mobile_no } = req.params;
    console.log("mobile----",mobile_no);
    

    const results = await getPartnerCreatedStatus(mobile_no);

    sendEncryptedResponse(
      res,
      {
         results,
       
      },
      "getPartnerCreatedStatus"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getPartnerCreatedStatus error :- ", error });
    serverError(res, error);
  }
});

//get bc created status with mobile 
router.get("/getBcCreatedStatus/:mobile_no", tokenMiddleWare, async (req, res) => {
  try {
    const { mobile_no } = req.params;

    const results = await getBcCreatedStatus(mobile_no);

    sendEncryptedResponse(
      res,
      {
         results,
       
      },
      "getBcCreatedStatus"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getBcCreatedStatus error :- ", error });
    serverError(res, error);
  }
});


//api for decnetro for partner -
router.post("/partner/mobile-to-account", tokenMiddleWare, async (req, res) => {
  try {
    const { mobile } = req.body;

    const results = await partnerMobileToAccount(mobile);

    sendEncryptedResponse(res, { results }, "Success");
  } catch (error) {
    ErrorLogger.write({ type: "partnerMobileToAccount error", error });
    serverError(res, error);
  }
});


module.exports = router;
