import { JSONB, QueryTypes, Sequelize } from "sequelize";
const { MakeQuery } = require("../../services/model-service");
import { Op } from "sequelize";
import {
  GoalPlan,
  Role,
  InvestorRegistration,
  UserRiskProfile,
  Users,
  UserMapping,
  RMRegistration,
} from "../../db/core/init-control-db";
import bcrypt from "bcryptjs";
import { UserRegistration } from "../../routes/partner/partner-model";
import {
  sendAadhaarOtp,
  verifyPanLite,
} from "../../routes/partner/cashfree.service";
import { verifyAadhaarOtp } from "../../routes/partner/cashfree.service";
import { verifyPan } from "../../routes/partner/cashfree.service";
import { verifyBank } from "../../routes/partner/cashfree.service";
// import { validateOtpLog } from "../../service/otplog.service"
import { PartnerAdhaarReqDtl } from "../../routes/partner/partner-adhaar-req-model";
import { PartnerAdhaarResDtl } from "../../routes/partner/partner-adhaar-resp-model";
import { PartnerAadhaarOtpReqDtl } from "../../routes/partner/partner-adhaar-otp-req-model";
import { PartnerAadhaarOtpResDtl } from "../../routes/partner/partner-adhaar-otp-resp-model";
import { AadhaarVerification } from "./adhaar-verifications-model";
import { OtpLog } from "../../routes/partner/otplog.model";
import { validateOtpLog } from "../../services/otplog.service";
import db from "../../db/core/control-db";
import { PortfolioQueryBuilder } from "./PortfolioQueryBuilder";
import { InvestmentLedgerListQueryBuilder } from "./InvestmentLedgerListQueryBuilder";
import { folioListQueryBuilder } from "./folioListQueryBuilder";
import { ROLE, USER_TYPE } from "../../utils/constant";
import { APIUploadServerImageService } from "../../services/mfu.service";
import path from "path";
import { BirthdayQueryBuilder } from "./BirthdayQueryBuilder";
import { rmDashboardQueryBuilder } from "./rmDashboardQueryBuilder";
import { sendEmail2 } from "../../services/email.service2";
import { format } from "date-fns";
import { PartnerInvestorMapping } from "../mapping_role/investor-partner-model";
import { randomBytes } from "crypto";
import ErrorLogger from "../../db/core/logger/error-logger";
import { BcRegistration } from "../buisnessCorrespondent/bc-model";
import { SmsService } from "../../services/sms.service";
import { PanVerification } from "./pan-verifications-model";
import { error } from "console";

export const tenantUserByEmail$ = (email: string, instance: Sequelize) => {
  return Users.findOne({
    where: { email },
    attributes: [
      "name",
      "email",
      "mobile",
      "designation",
      "roleId",
      "password",
    ],
  });
};

//function to check password in db
export const checkPassword = (pass: string, hash: string) => {
  return bcrypt.compareSync(pass, hash);
};

//function to check email in db
export const getUserByEmail = (email: string) => {
  return Users.findOne({ where: { email } });
};

export const getOrCreateRegistrationStatus = (mobile: string) => {
  return UserRegistration.findOrCreate({
    where: { mobile },
    defaults: {
      mobile,
    },
  });
};

export const mobileVerification = async (mobile: string, userType: number) => {
  try {
    //const otp = "123456";

    console.log("=====================")
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();


    const composedMsg = `${otp} is the OTP for your transaction. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`;

    console.log("userType -", userType);
    console.log("mobile -", mobile);

    // keep mobile as string
    const existingUser = await Users.findOne({
      where: { mobile },  // no Number()
    });

    if (existingUser) {
      return {
        success: false,
        message: "Partner is already created with this mobile number",
      };
    }

    const [userReg, created] = await UserRegistration.findOrCreate({
      where: { mobile },
      defaults: {
        mobile,
        userType,
        mobileVerified: 1,
      },
    });

    if (!created) {
      await userReg.update({
        userType,
        mobileVerified: 1,
      });
    }

    // Send SMS
    try {
      await SmsService.sendSmsUsingNimbus(mobile, composedMsg);
      console.log(`SMS sent successfully to ${mobile}`);
    } catch (smsError) {
      console.error('Failed to send SMS:', smsError);
      // Continue with OTP generation even if SMS fails
    }

    // Get user ID for OTP log
    let userId = 0;
    try {
      userId = await getUserIdByMobile(mobile);
    } catch (error) {
      console.log('User not found yet, using userId = 0');
    }

    //otp log 
    const newOtpLog = await OtpLog.create({
      userId,
      mobile,
      email: null,
      otp,
      purpose: "Mobile Verification",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
      isUsed: 0,
      status: 1,
    });

    console.log(` OTP log saved in memory:`, newOtpLog.toJSON());


    return {
      success: true,
      message: created
        ? "Mobile registered and OTP sent successfully"
        : "Mobile updated and OTP sent successfully",
      data: { userReg, created },
    };
  } catch (error: any) {
    console.error("Error in mobileVerification:", error);
    return { success: false, message: error.message || "Something went wrong" };
  }
};

//for Investor Registration Code by @Aditya Gupta

export const invMobileVerification = async (mobile: string, userType: number) => {
  try {

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    //const otp = "123456";
    const composedMsg = `${otp} is the OTP for your transaction. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`;

    console.log("userType -", userType);
    console.log("mobile -", mobile);

    //  Check if this mobile already exists in Users table
    const existingUser = await Users.findOne({
      where: { mobile }, // FIXED
    });

    if (existingUser) {
      return {
        success: false,
        message: "Investor is already created with this mobile number",
      };
    }

    // Create or find record in InvestorRegistration table (which uses reg_mobile)
    const [userReg, created] = await InvestorRegistration.findOrCreate({
      where: { reg_mobile: mobile },
      defaults: {
        reg_mobile: mobile,
        user_type: String(userType), // user_type is string in model
        isKYCDone: false,
        is_kyc_complete: false,
        is_CAN_registered: false,
        poiConsent: false,
        isDelete: false,
        mobile_relation: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    if (!created) {
      await userReg.update({
        user_type: String(userType),
        updatedAt: new Date(),
      });
    }

    // Optional SMS integration
    await SmsService.sendSmsUsingNimbus(mobile, composedMsg);

    // Get user ID for OTP log
    let userId = 0;
    try {
      userId = await getUserIdByMobile(mobile);
    } catch (error) {
      console.log('User not found yet, using userId = 0');
    }

    //otp log 
    const newOtpLog = await OtpLog.create({
      userId,
      mobile,
      email: null,
      otp,
      purpose: "Mobile Verification",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
      isUsed: 0,
      status: 1,
    });

    console.log(` OTP log saved in memory:`, newOtpLog.toJSON());


    return {
      success: true,
      message: created
        ? "Mobile registered and OTP sent successfully"
        : "Mobile updated and OTP sent successfully",
      data: { userReg, created },
    };
  } catch (error: any) {
    console.error("Error in invMobileVerification:", error);
    return {
      success: false,
      message: error.message || "Something went wrong",
    };
  }
};


export const bcMobileVerification = async (mobile: string, userType: number) => {
  try {
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();


    const composedMsg = `${otp} is the OTP for your transaction. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`;

    console.log("userType -", userType);
    console.log("mobile -", mobile);

    // keep mobile as string
    // const existingUser = await Users.findOne({
    //   where: { mobile },  // no Number()
    // });

    // if (existingUser) {
    //   return {
    //     success: false,
    //     message: "BC is already created with this mobile number",
    //   };
    // }

    const [userReg, created] = await BcRegistration.findOrCreate({
      where: { mobile },
      defaults: {
        mobile,
        userType,
        mobileVerified: 1,
      },
    });

    if (!created) {
      await userReg.update({
        userType,
        mobileVerified: 1,
      });
    }

    // Send SMS
    try {
      await SmsService.sendSmsUsingNimbus(mobile, composedMsg);
      console.log(`SMS sent successfully to ${mobile}`);
    } catch (smsError) {
      console.error('Failed to send SMS:', smsError);
      // Continue with OTP generation even if SMS fails
    }

    // Get user ID for OTP log
    let userId = 0;
    try {
      userId = await getUserIdByMobile(mobile);
    } catch (error) {
      console.log('User not found yet, using userId = 0');
    }

    //otp log 
    const newOtpLog = await OtpLog.create({
      userId,
      mobile,
      email: null,
      otp,
      purpose: "Mobile Verification",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
      isUsed: 0,
      status: 1,
    });

    console.log(` OTP log saved in memory:`, newOtpLog.toJSON());



    return {
      success: true,
      message: created
        ? "Mobile registered and OTP sent successfully"
        : "Mobile updated and OTP sent successfully",
      data: { userReg, created },
    };
  } catch (error: any) {
    console.error("Error in mobileVerification:", error);
    return { success: false, message: error.message || "Something went wrong" };
  }
};

//ujjwal
///new RM dashboard service
export const rmDashboardDetail = async (): Promise<any[]> => {
  const builder = new rmDashboardQueryBuilder();

  return await db.query(builder.getQuery(), {
    type: QueryTypes.SELECT,
  });
};

// src/utils/PortfolioQueryBuilder.ts

//OTP verification -
export const mobileOtpVerification = async (
  mobile: string,
  userType: number,
  otp?: string
) => {
  console.log("mobile =", mobile);
  console.log("userType =", userType);

  if (otp) {
    // -------------------------------------------
    // OTP Verification Flow
    // -------------------------------------------
    console.log("otp =", otp);

    const otpRecord = await OtpLog.findOne({
      where: { mobile, otp },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord) {
      throw new Error("No OTP found for this mobile number. Please request a new one.");
    }

    // Check if OTP expired
    if (new Date() > otpRecord.expiresAt) {
      throw new Error("OTP has expired. Please request a new one.");
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      // increment failed attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      throw new Error("Invalid OTP entered. Please try again.");
    }

    // Mark OTP as used
    await otpRecord.update({
      isUsed: 1,
      verifiedAt: new Date(),
      status: 0,
    });

    // Check registration
    const userReg = await UserRegistration.findOne({
      where: { mobile: mobile },
    });

    if (!userReg) {
      throw new Error("Registration not found for this mobile number");
    }

    return {
      success: true,
      verified: true,
      message: "Mobile verified successfully",
      userReg,
    };
  } else {
    // OTP Generation and SMS Flow
    const generatedOtp = "123456";
    const expiresInMinutes = 10;
    const composedMsg = `${generatedOtp} is the OTP for your transaction. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`;

    // Send SMS
    try {
      await SmsService.sendSmsUsingNimbus(mobile, composedMsg);
      console.log(`SMS sent successfully to ${mobile}`);
    } catch (smsError) {
      console.error('Failed to send SMS:', smsError);
      // Continue with OTP generation even if SMS fails
    }

    // Find existing or create new registration
    const [userReg, created] = await UserRegistration.findOrCreate({
      where: { mobile },
      defaults: {
        mobile,
        userType,
        mobileVerified: 0,
      },
    });

    // If existing record found, update userType
    if (!created) {
      await userReg.update({ userType });
    }
    return { userReg, created, otpSent: true };
  }
};


//code of Investor registration process---

export const invMobileOtpVerification = async (
  mobile: string,
  userType: number,
  otp?: string
) => {
  console.log("mobile =", mobile);
  console.log("userType =", userType);

  if (otp) {
    // -------------------------------------------
    // OTP Verification Flow
    // -------------------------------------------
    console.log("otp =", otp);

    console.log("otp =", otp);
    const otpRecord = await OtpLog.findOne({
      where: {
        mobile,
        otp
      },
      order: [["createdAt", "DESC"]], // get latest OTP
    });
    if (!otpRecord || otpRecord == null) {
      console.log("================", otpRecord)
      return ""

      //throw new Error("No OTP found for this mobile number. Please request a new one.");
    }

    // Check if OTP expired
    if (new Date() > otpRecord.expiresAt) {
      throw new Error("OTP has expired. Please request a new one.");
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      // increment failed attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      throw new Error("Invalid OTP entered. Please try again.");
    }

    // Mark OTP as used
    await otpRecord.update({
      isUsed: 1,
      verifiedAt: new Date(),
      status: 0,
    });

    // Check registration
    const userReg = await InvestorRegistration.findOne({
      where: { reg_mobile: mobile },
    });

    if (!userReg) {
      throw new Error("Registration not found for this mobile number");
    }

    return {
      success: true,
      verified: true,
      message: "Mobile verified successfully",
      userReg,
    };
  }
  else {
    const generatedOtp = "123456"; // Replace with random OTP later
    const composedMsg = `${generatedOtp} is the OTP for your transaction. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`;

    let userReg = await InvestorRegistration.findOne({
      where: { reg_mobile: mobile },
    });

    if (userReg) {
      // Update all relevant columns for existing record
      await userReg.update({
        user_type: String(userType),

        poiConsent: false,
        isKYCDone: false,
        is_CAN_registered: false,
        isDelete: false,
        mobile_relation: 1,
        updatedAt: new Date(),
      });

      console.log("Existing investor registration updated");

      console.log("New investor registration created");
    }

    return {
      success: true,
      otpSent: true,
      userReg,
      message: userReg
        ? "Mobile record updated and OTP sent successfully"
        : "Mobile record created and OTP sent successfully",
    };
  }
};


export const bcMobileOtpVerification = async (
  mobile: string,
  userType: number,
  otp?: string
) => {
  console.log("mobile =", mobile);
  console.log("userType =", userType);

  if (otp) {
    // -------------------------------------------
    // OTP Verification Flow
    // -------------------------------------------
    console.log("otp =", otp);

    const otpRecord = await OtpLog.findOne({
      where: {
        mobile,
        //purpose: "MOBILE_VERIFICATION",
        // isUsed: 0,
        // status: 1,
      },
      order: [["createdAt", "DESC"]], // get latest OTP
    });

    if (!otpRecord) {
      throw new Error("No OTP found for this mobile number. Please request a new one.");
    }

    // Check if OTP expired
    if (new Date() > otpRecord.expiresAt) {
      throw new Error("OTP has expired. Please request a new one.");
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      // increment failed attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      throw new Error("Invalid OTP entered. Please try again.");
    }

    // Mark OTP as used
    await otpRecord.update({
      isUsed: 1,
      verifiedAt: new Date(),
      status: 0,
    });

    // Check registration
    const userReg = await BcRegistration.findOne({
      where: { mobile: mobile },
    });

    if (!userReg) {
      throw new Error("Registration not found for this mobile number");
    }

    return {
      success: true,
      verified: true,
      message: "Mobile verified successfully",
      userReg,
    };
  } else {
    //  OTP Generation + Update/Create Flow
    const generatedOtp = "123456"; // Replace with random OTP later
    const composedMsg = `${generatedOtp} is the OTP for your transaction. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`;

    //  Optionally send SMS
    // await SmsService.sendSmsUsingNimbus(mobile, composedMsg);

    // Check if investor already exists
    let userReg = await BcRegistration.findOne({
      where: { mobile: mobile },
    });

    if (userReg) {
      // Update all relevant columns for existing record
      await userReg.update({
        userType: Number(userType),


        // isKYCDone: false,
        // is_CAN_registered: false,
        // isDelete: false,

        //updatedAt: new Date(),
      });

      console.log("Existing investor registration updated");
      // } else {
      //   //  Create new record if not found
      //   userReg = await InvestorRegistration.create({
      //     reg_mobile: mobile,
      //     user_type: String(userType),
      //     mobileVerified: 0,
      //     poiConsent: false,
      //     isKYCDone: false,
      //     is_CAN_registered: false,
      //     isDelete: false,
      //     mobile_relation: 1,
      //     createdAt: new Date(),
      //     updatedAt: new Date(),
      //   });

      console.log("New investor registration created");
    }

    return {
      success: true,
      otpSent: true,
      userReg,
      message: userReg
        ? "Mobile record updated and OTP sent successfully"
        : "Mobile record created and OTP sent successfully",
    };
  }
};



//code with save code of req and resp--

export const partnerAadhaarVerification = async (mobile: string, aadhaar: string) => {
  try {
    console.log("mobile -", mobile);
    console.log("aadhaar -", aadhaar);

    // Check for existing registration
    const userReg = await UserRegistration.findOne({ where: { mobile } });
    if (!userReg) {
      throw new Error("Registration Status not found");
    }

    // Log that we're saving the request
    console.log("Saving Aadhaar verification request...");

    await PartnerAdhaarReqDtl.create({
      mobile,
      adhaar: aadhaar,
      createdAt: new Date(),
    });

    // Simulate / call Aadhaar OTP API
    const otp = "123456";
    const expiresInMinutes = 10;

    console.log("Calling sendAadhaarOtp service...");
    const aadhaarResponse = await sendAadhaarOtp(aadhaar);

    console.log("OTP sent to Aadhaar:", aadhaar, "OTP:", otp);

    // Log the response in DB
    console.log("Saving Aadhaar verification response...");
    await PartnerAdhaarResDtl.create({
      mobile,
      aadhaar,
      responseData: aadhaarResponse,
      createdAt: new Date(),
    });

    // Update user record
    const aadhaar_response=await userReg.update({
      aadhaar,
      aadhaarVerified: 1,
      aadhaarVerifiedAt: new Date()
    });

    console.log("aadhaar_response-",aadhaar_response);
if(!aadhaar_response.dataValues.aadhaar){
  throw new Error("Aadhaar Details are not found!!");
}

    // Return consistent result
    return [userReg, aadhaarResponse];
  } catch (err: any) {
    console.log("Aaaadhar error =============", err);
    return err
  }
};

//for BC registration 

export const bcAadhaarVerification = async (mobile: string, aadhaar: string) => {
  try {
    console.log("mobile -", mobile);
    console.log("aadhaar -", aadhaar);

    // Check for existing registration
    const userReg = await BcRegistration.findOne({ where: { mobile } });
    if (!userReg) {
      throw new Error("Bc Registration Record not found");
    }

    // Log that we're saving the request
    console.log("Saving Aadhaar verification request...");

    await PartnerAdhaarReqDtl.create({
      mobile,
      adhaar: aadhaar,
      createdAt: new Date(),
    });

    console.log("Calling sendAadhaarOtp service...");
    const aadhaarResponse = await sendAadhaarOtp(aadhaar);

    // Log the response in DB
    console.log("Saving Aadhaar verification response...");
    await PartnerAdhaarResDtl.create({
      mobile,
      aadhaar,
      responseData: aadhaarResponse,
      createdAt: new Date(),
    });

    // Update user record
   const aadhaar_response= await userReg.update({
      aadhaar,
      aadhaarVerified: 1,
      aadhaarVerifiedAt: new Date()
    });
console.log("aadhaar_response-",aadhaar_response);
if(!aadhaar_response.dataValues.aadhaar){
  throw new Error("Aadhaar Details are not found!!");
}
    // Return consistent result
    return [userReg, aadhaarResponse];
  } catch (err: any) {
    console.log("Aaaadhar error =============", err);
    return err
  }
};


export const aadhaarVerificationWihtoutMobile = async (aadhaar: string) => {
  console.log("aadhaar -", aadhaar);

  // Log that we're saving the request
  console.log("Saving Aadhaar verification request...");

  await PartnerAdhaarReqDtl.create({
    mobile: "0",
    adhaar: aadhaar,
    createdAt: new Date(),
  });

  // Simulate / call Aadhaar OTP API
  const otp = "123456";
  const expiresInMinutes = 10;

  console.log("Calling sendAadhaarOtp service...");
  const aadhaarResponse = await sendAadhaarOtp(aadhaar);

  console.log("OTP sent to Aadhaar:", aadhaar, "OTP:", otp);
  // Return consistent result
  return aadhaarResponse;
};

export const aadhaarOtpVerificationWithOutMobile = async (
  aadhaar: string,
  otp: string,
  ref_id: string
) => {
  console.log("aadhaar -", aadhaar);
  console.log("otp -", otp);
  console.log("ref_id -", ref_id);

  // Save request
  console.log("Saving Aadhaar OTP verification request...");
  await PartnerAadhaarOtpReqDtl.create({
    mobile: "0",
    aadhaar,
    otp,
    refId: ref_id,
    createdAt: new Date(),
  });
  // Verify Aadhaar OTP with external service
  const aadhaarResponse = await verifyAadhaarOtp(otp, ref_id);

  // Optionally log response
  console.log("Aadhaar verification response:", aadhaarResponse);

  console.log("Saving Aadhaar OTP verification response...");
  await PartnerAadhaarOtpResDtl.create({
    mobile: "0",
    aadhaar,
    otp,
    refId: ref_id,
    responseData: aadhaarResponse,
    createdAt: new Date(),
  });

  // Return consistent result
  return aadhaarResponse;
};

export const aadhaarOtpVerification = async (
  mobile: string,
  aadhaar: string,
  otp: string,
  ref_id: string
) => {
  console.log("========== Aadhaar OTP Verification STARTED ==========");
  console.log("Input Payload:", { mobile, aadhaar, otp, ref_id });

  try {
    console.log("Step 1: Saving OTP request...");
    await PartnerAadhaarOtpReqDtl.create({
      mobile,
      aadhaar,
      otp,
      refId: ref_id,
      createdAt: new Date()
    });
    console.log("Step 1 Completed: OTP request saved.");

    console.log("Step 2: Calling Aadhaar OTP Verify API...");
    const aadhaarResponse = await verifyAadhaarOtp(otp, ref_id);
    console.log("Step 2 Completed: OTP Verification response received.");
    console.log("Aadhaar API Response:", aadhaarResponse);

    console.log("Step 3: Saving Aadhaar verification in DB...");
    await AadhaarVerification.create({
      aadhaarNumber: aadhaar,
      aadhaarResponse: aadhaarResponse,
      recordStatus: 1,
      createdBy: 0,
      updatedBy: 0
    });
    console.log("Step 3 Completed: Aadhaar verification saved.");

    console.log("Step 4: Saving response log...");
    await PartnerAadhaarOtpResDtl.create({
      mobile,
      aadhaar,
      otp,
      refId: ref_id,
      responseData: aadhaarResponse,
      createdAt: new Date()
    });
    console.log("Step 4 Completed: Response log saved.");

    console.log("========== Aadhaar OTP Verification COMPLETED ==========");

    return [aadhaarResponse];
  } catch (error: any) {
    console.error("Error Occurred in Aadhaar OTP Verification");

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

    console.error("Error Message:", error.message);
    console.error("Stack Trace:", error.stack);

    return {
      status: "error",
      message: "Aadhaar OTP verification failed",
      error: error?.message || error
    };
  } finally {
    console.log("========== Aadhaar OTP Verification PROCESS ENDED ==========");
  }
};

//PAN
export const panVerification = async (
  mobile: string,
  pan: string,
  name: string
) => {
  console.log("========== PAN Verification STARTED ==========");
  console.log("Mobile:", mobile);
  console.log("PAN:", pan);
  console.log("Name:", name);

  try {
    // Step 1: Check if user registration exists
    console.log("Step 1: Fetching user registration...");
    const userReg = await UserRegistration.findOne({ where: { mobile } });

    if (!userReg) {
      console.error("Registration record not found for:", mobile);
      throw new Error("Registration Status not found");
    }

    console.log("User registration found:", {
      regId: userReg.reg_id,
      mobile: userReg.mobile,
    });

    // Step 2: Call PAN verification API
    console.log("Step 2: Calling verifyPan service...");
    const panResponse = await verifyPan(pan, name);

    console.log("PAN API Response Received:");
    console.log(panResponse);

    // Step 3: Update user PAN details
    console.log("Step 3: Updating user record with PAN details...");

    await userReg.update({
      pan,
      panVerified: 1,
      panVerifiedAt: new Date(),
    });

    console.log("User PAN details updated successfully");

    console.log("========== PAN Verification COMPLETED ==========");
    return [userReg, panResponse];

  } catch (error: any) {
    console.error("Exception in panVerification()");

    // -------------------------------------------------
    // 🔥 GENERAL ERROR DETAILS
    // -------------------------------------------------
    console.error("Error Message:", error.message);

    // -------------------------------------------------
    // 🔥 SEQUELIZE VALIDATION / DB ERRORS
    // -------------------------------------------------
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

    // -------------------------------------------------
    // AXIOS ERRORS FROM verifyPan()
    // -------------------------------------------------
    if (error.response) {
      console.error("HTTP Status:", error.response.status);
      console.error("Response Data:", error.response.data);
    }
    if (error.request) {
      console.error("No Response Received:", error.request);
    }
    if (error.config) {
      console.error("Axios Config:", error.config);
    }

    // -------------------------------------------------
    // FULL STACK
    // -------------------------------------------------
    console.error("Stack Trace:", error.stack);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "PAN verification failed"
    );

  } finally {
    console.log("========== PAN Verification PROCESS ENDED ==========");
  }
};


export const panVerificationWithOutMobile = async (
  pan: string,
  name: string
) => {
  console.log("pan -", pan);
  console.log("name -", name);

  // Call PAN verification service
  console.log("Inside the PAN verification service");
  const panResponse = await verifyPan(pan, name);

  // Log verification response
  console.log(`PAN verification response:`, panResponse);

  // Return consistent result
  return [panResponse];
};

export const panVerificationLite = async (
  mobile: string,
  pan: string,
  name: string,
  dob: string,
  userTypeId:number
) => {
  try {
    console.log("mobile -", mobile);
    console.log("pan -", pan);
    console.log("name -", name);
    console.log("dob -", dob);

    const uniqueId = generateUniqueId(mobile, pan);
    console.log("Generated UniqueId:", uniqueId);

    console.log("Inside the PAN verification service");

    const panResponse = await verifyPan(pan, name);
    console.log("PAN verification response:", panResponse);

    await PanVerification.create({
      panNumber: pan,
      nameOnPan: name,
      dateOfBirth: dob,
      panResponse: panResponse,
      recordStatus: 1,
      createdBy: 1,
      updatedBy: 1
    });
console.log("user_type_id-",userTypeId)

if(userTypeId===4){
    const userReg = await UserRegistration.findOne({ where: { mobile } });
    if (!userReg) {
      throw new Error("Registration Status not found");
    }
     await userReg.update({
      pan,
      panVerified: 1,
      panVerifiedAt: new Date()
    });

    }
    if(userTypeId===6){

       const userReg = await BcRegistration.findOne({ where: { mobile } });
    if (!userReg) {
      throw new Error("Registration Status not found");
    }
     const pan_response=await userReg.update({
      pan,
      panVerified: 1,
      panVerifiedAt: new Date()
    });

    if(!pan_response.dataValues.pan){
      throw new Error("Pan Details are not found!!");
    }
    }

    return [panResponse];

  } catch (error: any) {
    console.error("PAN Verification Lite Error:", error);

    // API error response
    if (error.response) {
      console.error("Error Response Data:", error.response.data);
      console.error("Error Response Status:", error.response.status);
      console.error("Error Response Headers:", error.response.headers);
    }

    // Sequelize or internal errors
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

    // Basic details
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "PAN verification failed"
    );
  }
};

export const panVerificationLiteWithOutMobile = async (
  pan: string,
  name: string,
  dob: string
) => {
  console.log("pan -", pan);
  console.log("name -", name);
  console.log("dob -", dob);

  const mobile = "7555";

  const uniqueId = generateUniqueId(mobile, pan);
  console.log(uniqueId); // Example output: "9812341698765432100"

  // Call PAN verification service

  console.log("Inside the PAN verification service");
  const panResponse = await verifyPanLite(uniqueId, pan, name, dob);

  // Log verification response
  console.log(`PAN verification response:`, panResponse);

  // Return consistent result
  return panResponse;
};

export const partnerBankAccountNoVerification = async (
  mobile: string,
  bankAcNo: string,
  bankAcIfsc: string,
  // bankAcNameInBank: string
) => {
  console.log("mobile -", mobile);
  console.log("bankAcNo -", bankAcNo);
  console.log("bankAcIfsc -", bankAcIfsc);
  //console.log("bankAcNameInBank -", bankAcNameInBank);

  // Check for existing registration
  const userReg = await UserRegistration.findOne({ where: { mobile } });
  if (!userReg) {
    throw new Error("Registration Status not found");
  }
  const bankAcNameInBank: string = String(userReg.adhaarName || "");
  // Call Bank verification service
  console.log("Inside the Bank verification service");
  const bankVerificationResponse = await verifyBank(
    bankAcNo,
    bankAcIfsc,
    bankAcNameInBank,
    mobile
  );

  // Log verification response
  console.log(`Bank verification response:`, bankVerificationResponse);

  // Update user record with bank account info
const bank_response=await userReg.update({
    bankAcNo,
    bankAcIfsc,
    bankAcNameInBank,
    bankAcNoVerified: 1,
    bankAcNoVerifiedAt: new Date(),
  });
if(!bank_response.dataValues.bankAcNo){
  throw new Error("Bank details not found")
}
  // Return consistent result
  return [userReg, bankVerificationResponse];
};


//for Bc bank verification -
export const bcBankAccountNoVerification = async (
  mobile: string,
  bankAcNo: string,
  bankAcIfsc: string,
  // bankAcNameInBank: string
) => {
  console.log("mobile -", mobile);
  console.log("bankAcNo -", bankAcNo);
  console.log("bankAcIfsc -", bankAcIfsc);
  //console.log("bankAcNameInBank -", bankAcNameInBank);

  // Check for existing registration
  const userReg = await BcRegistration.findOne({ where: { mobile } });
  if (!userReg) {
    throw new Error("Registration Status not found");
  }
  const bankAcNameInBank: string = String(userReg.adhaarName || "");
  // Call Bank verification service
  console.log("Inside the Bank verification service");
  const bankVerificationResponse = await verifyBank(
    bankAcNo,
    bankAcIfsc,
    bankAcNameInBank,
    mobile
  );

  // Log verification response
  console.log(`Bank verification response:`, bankVerificationResponse);

  // Update user record with bank account info
  const response_bank=await userReg.update({
    bankAcNo,
    bankAcIfsc,
    bankAcNameInBank,
    bankAcNoVerified: 1,
    bankAcNoVerifiedAt: new Date(),
  });
console.log("bankresponse-",response_bank)
console.log("bankaccount-",response_bank.dataValues.bankAcNo)

if(!response_bank.dataValues.bankAcNo){
  throw new Error("Bank Account Number Not Found!");
}

// Return consistent result
  return [userReg, bankVerificationResponse];
};

export const bankAccountNoVerificationWithoutMobile = async (
  mobile: string,
  bankAcNo: string,
  bankAcIfsc: string,
  bankAcNameInBank: string
) => {
  console.log("mobile -", mobile);
  console.log("bankAcNo -", bankAcNo);
  console.log("bankAcIfsc -", bankAcIfsc);
  console.log("bankAcNameInBank -", bankAcNameInBank);

  // Check for existing registration
  const userReg = await UserRegistration.findOne({ where: { mobile } });
  if (!userReg) {
    throw new Error("Registration Status not found");
  }

  // Call Bank verification service
  console.log("Inside the Bank verification service");
  const bankVerificationResponse = await verifyBank(
    bankAcNo,
    bankAcIfsc,
    bankAcNameInBank,
    mobile
  );

  // Log verification response
  console.log(`Bank verification response:`, bankVerificationResponse);

  // Update user record with bank account info
  await userReg.update({
    bankAcNo,
    bankAcIfsc,
    bankAcNameInBank,
    bankAcNoVerified: 1,
    bankAcNoVerifiedAt: new Date(),
  });

  // Return consistent result
  return bankVerificationResponse;
};

//nismUpload
export const nismUpload = async (
  mobile: string,
  nismDoc: string,
  arn_no: string,
  euin_no: string
) => {
  console.log("mobile -", mobile);
  console.log("nismDoc -", nismDoc);

  // Check for existing registration
  const userReg = await UserRegistration.findOne({ where: { mobile } });
  if (!userReg) {
    throw new Error("Registration Status not found");
  }

  // Log upload action
  console.log("Inside the NISM document upload service");

  // Update user record with NISM document info
  await userReg.update({
    nism: nismDoc,
    nismVerified: 1,
    nismVerifiedAt: new Date(),
    arn_no: arn_no,
    euin_no: euin_no,
  });

  // Return consistent result
  return userReg;
};

//Update Nominee-
export const updateNominee = async (
  mobile: string,
  nomineeName: string,
  nomineeRelation: number,
  nomineeType: number,
  nomineeDob: string,
  nomineePan: string
) => {
  console.log("mobile -", mobile);
  console.log("nomineeName -", nomineeName);
  console.log("nomineeRelation -", nomineeRelation);
  console.log("nomineeType -", nomineeType);
  console.log("nomineeDob -", nomineeDob);
  console.log("nomineePan -", nomineePan);

  // Check for existing registration
  const userReg = await UserRegistration.findOne({ where: { mobile } });
  if (!userReg) {
    throw new Error("Registration Status not found");
  }

  // Log update action
  console.log("Inside the nominee update service");

  // Update user record with nominee info
  await userReg.update({
    nomineeName,
    nomineeRelation,
    nomineeType,
    nomineeDob: nomineeDob ? new Date(nomineeDob) : null,
    nomineePan,
    nomineeCreatedAt: new Date(),
  });

  // Return consistent result
  return userReg;
};

export const partnerEmailOtpVerification = async (
  mobile: string,
  email: string,
  otp: string,
) => {
  console.log("mobile -", mobile);
  console.log("email -", email);
  console.log("otp -", otp);

  // Check for existing registration
  const userReg = await UserRegistration.findOne({ where: { mobile } });
  if (!userReg) {
    throw new Error("Registration Status not found");
  }

  // Log action
  console.log("Inside the email OTP verification service");

  const userId = await getUserIdByMobile(mobile);

  console.log("userId-" + userId);
  // Validate OTP
  await validateOtpLog({
    userId,
    mobile,
    otp,
    purpose: "Email Verification",
  });
  //console.log("OTP validated successfully:", otpValidationResult);

  // Update user record with email verification info
  await userReg.update({
    emailVerified: 1,

    emailVerifiedAt: new Date(),
  });

  console.log(`User email verified for mobile: ${mobile}`);

  // Return consistent result
  return 1;
};

//for BC --
export const bcEmailOtpVerification = async (
  mobile: string,
  email: string,
  otp: string,
) => {
  console.log("mobile -", mobile);
  console.log("email -", email);
  console.log("otp -", otp);

  // Check for existing registration
  const userReg = await BcRegistration.findOne({ where: { mobile } });
  if (!userReg) {
    throw new Error("Registration Status not found");
  }

  // Log action
  console.log("Inside the email OTP verification service");

  const userId = await getUserIdByMobile(mobile);

  console.log("userId-" + userId);
  // Validate OTP
  await validateOtpLog({
    userId,
    mobile,
    otp,
    purpose: "Email Verification",
  });
  //console.log("OTP validated successfully:", otpValidationResult);

  // Update user record with email verification info
  await userReg.update({
    emailVerified: 1,
    emailVerifiedAt: new Date(),
  });

  console.log(`User email verified for mobile: ${mobile}`);

  // Return consistent result
  return 1;
};


//complete registration-
export const completeRegistration = async (
  mobile: string,
  password: string
) => {
  console.log("mobile -", mobile);
  console.log("password -", password);

  // Check for existing registration
  const userReg = await UserRegistration.findOne({ where: { mobile } });
  if (!userReg) {
    throw new Error("Registration Status not found");
  }

  // Log action
  console.log("Inside the complete registration service");

  // Check if user already exists
  const existingUser = await UserRegistration.findOne({ where: { mobile } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Determine user role
  let userRole = "";
  if (userReg.userType === 1) {
    userRole = "partner";
  } else if (userReg.userType === 2) {
    userRole = "investor";
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create User
  const user = await UserRegistration.create({
    mobile,
    //password: hashedPassword,
    // role: userRole,
    // userType: userReg.userType,
    // email: userReg.email,
    // address: null,
    // cityId: null,
    // pincode: null,
    // isActive: 1,
  });

  // Log user creation
  console.log(`User created with ID: ${user.userId}`);

  // Update UserRegistration
  await userReg.update({
    userCreated: 1,
    userId: user.userId,
    userCreatedAt: new Date(),
  });

  // Return created user
  return user;
};

export const saveContinueAdhaarDetails = async (
  name: string,
  adhaar: string,
  mobile: string,
  address: string,
  dob: string
) => {
  console.log("name -", name);
  console.log("adhaar -", adhaar);
  console.log("mobile -", mobile);
  console.log("address -", address);
  console.log("dob -", dob);

  // Check for existing registration
  const userReg = await UserRegistration.findOne({ where: { mobile } });
  if (!userReg) {
    throw new Error("Registration Status not found");
  }

  // Log action
  console.log("Inside the Aadhaar details saving service");

  // Update user record with Aadhaar details
  await userReg.update({
    adhaarName: name,
    adhaarDob: dob,
    adhaarAddress: address,
    aadhaarVerified: 1,
  });

  // Log update
  console.log(`Aadhaar details saved for mobile: ${mobile}`);

  // Return updated user
  return userReg;
};



//User created-

// export const userCreated = async (
//  // name: string,
//   //email: string,
//   mobile: string
// ) => {
//   console.log("mobile -", mobile);

//   // Check for existing registration
//   const userReg = await UserRegistration.findOne({ where: { mobile } });
//   if (!userReg) {
//     throw new Error("Registration Status not found");
//   }

// //   const email: string = String(userReg.email || "");
// //    const name = userReg.adhaarName;
// //   console.log("Picked Aadhaar Name:", name);

// //   // Log action
// //   console.log("Inside the Aadhaar details saving service");

// //   const mobile_num = parseInt(mobile, 10);
// //   let newUser = await Users.findOne({
// //     where: {
// //       [Op.or]: [{ email: email }, { mobile: mobile_num }],
// //     },
// //   });
// //   if (newUser) {
// //     newUser = JSON.parse(JSON.stringify(newUser));
// //   }


// // const plainassword = randomBytes(6).toString("base64");

// //   if (!newUser) {
// //     newUser = await Users.create({
// //       name,
// //       email,
// //       mobile: mobile_num,
// //       password: plainassword,
// //       isActive: true,
// //       isPartner: true,
// //       roleId: ROLE.partner,
// //       isEmailOTPVerified: true,
// //       isMobileOTPVerified: true,
// //       emailOTP: null,
// //       mobileOTP: null,
// //       loginOTP: null,
// //       tempPassword: null,
// //       isTempPasswordReq: false,
// //       fcmToken: null,
// //       refreshToken: false,
// //       deviceId: null,
// //       userTypeId: 4,
// //       //createdBy: 0,
// //       modifiedBy: 0,
// //       createdAt: new Date(),
// //       updatedAt: new Date(),
// //     });
// //   }

// //   await UserMapping.create({
// //     user_id: newUser.id,
// //     role_id: ROLE.partner,
// //     userType_id: USER_TYPE.partner,
// //     ref_id: userReg.regId,
// //   });
// //   // Update UserRegistration record with linkage if you want
// //   await userReg.update({
// //     userCreatedAt: new Date(),
// //     userCreated: 1,
// //     userId: newUser.id,
// //   });
// //   // Log update
// //   console.log(`User details saved for mobile: ${mobile}`);

// //   // Email content with password instead of OTP
// //   const htmlContent = `
// //     <!DOCTYPE html>
// //     <html>
// //       <head>
// //         <meta charset="UTF-8" />
// //         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
// //         <style>
// //           body { background-color: #f4f4f4; font-family: Arial, sans-serif; }
// //           .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 30px; text-align: center; }
// //           .logo img { width: 120px; margin-bottom: 20px; }
// //           .title { font-size: 22px; color: #333; margin-bottom: 20px; }
// //           .otp-box { font-size: 28px; color: #007bff; font-weight: bold; letter-spacing: 2px; background: #eef4ff; padding: 15px 0; border-radius: 6px; margin: 20px 0; }
// //           .message { font-size: 15px; color: #555; margin: 10px 0 20px; }
// //           .footer { font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px; }
// //         </style>
// //       </head>
// //       <body>
// //         <div class="container">
// //           <div class="logo">
// //             <img src="https://vedantasset.com/wp-content/uploads/2024/03/cropped-vedant-asset-logo.webp" alt="Vedant Asset Logo" />
// //           </div>
// //           <div class="title">Your Account Credentials</div>
// //           <div class="message">Dear ${name},</div>
// //           <div class="message">Your account has been successfully created. Please use the password below to log in:</div>
// //           <div class="otp-box">${plainassword}</div>
// //           <div class="message">We recommend changing your password after your first login.</div>
// //           <div class="footer">
// //             © ${new Date().getFullYear()} Vedant Asset Limited. All rights reserved.
// //           </div>
// //         </div>
// //       </body>
// //     </html>`;

// //   // Send email
// //   await sendEmail2(email, "Customer", "Your Account Password", htmlContent);

//   // Return updated user
//   return userReg;
// };
// export const userCreated = async (
//   mobile: string,
//   name: string,
//   email: string,
//   dob: string,
//   address: string,
//   pan: string,
//   aadhaar: string,
//   bank_account: string,
//   ifsc: string,
//   nism_arn: string,
//   nism_euin: string,
//   nism_certificate_uploaded: boolean,
//   nism_file_name: string
// ) => {
//   console.log("Creating user with all data:", {
//     mobile, name, email, dob, address, pan, aadhaar, bank_account, ifsc,
//     nism_arn, nism_euin, nism_certificate_uploaded, nism_file_name
//   });

//   // Check for existing registration
//   const userReg = await UserRegistration.findOne({ where: { mobile } });
//   if (!userReg) {
//     throw new Error("Registration Status not found");
//   }

//   // Update UserRegistration using existing fields
//   const updateData = {
//     userCreatedAt: new Date(),
//     userCreated: 1,

//     // Personal Information - existing fields use kar rahe hain
//     adhaarName: name || userReg.adhaarName || null,
//     email: email || userReg.email || null,
//     adhaarDob: dob || userReg.adhaarDob || null,
//     adhaarAddress: address || userReg.adhaarAddress || null,

//     // KYC Documents - existing fields
//     pan: pan || userReg.pan || null,
//     aadhaar: aadhaar || userReg.aadhaar || null,

//     // Bank Details - existing fields
//     bankAcNo: bank_account || userReg.bankAcNo || null,
//     bankAcIfsc: ifsc || userReg.bankAcIfsc || null,

//     // NISM Details - existing fields
//     arn_no: nism_arn || userReg.arn_no || null,
//     euin_no: nism_euin || userReg.euin_no || null,
//     nism: nism_file_name || userReg.nism || null, // Using nism field for file name

//     // Verification status - set to verified since data is coming from verified source
//     panVerified: pan ? 1 : userReg.panVerified || 0,
//     aadhaarVerified: aadhaar ? 1 : userReg.aadhaarVerified || 0,
//     bankAcNoVerified: bank_account ? 1 : userReg.bankAcNoVerified || 0,
//     emailVerified: email ? 1 : userReg.emailVerified || 0,
//     nismVerified: nism_certificate_uploaded ? 1 : userReg.nismVerified || 0,

//     // Verification timestamps
//     panVerifiedAt: pan ? new Date() : userReg.panVerifiedAt,
//     aadhaarVerifiedAt: aadhaar ? new Date() : userReg.aadhaarVerifiedAt,
//     bankAcNoVerifiedAt: bank_account ? new Date() : userReg.bankAcNoVerifiedAt,
//     emailVerifiedAt: email ? new Date() : userReg.emailVerifiedAt,
//     nismVerifiedAt: nism_certificate_uploaded ? new Date() : userReg.nismVerifiedAt
//   };

//   console.log("Updating UserRegistration with data:", updateData);

//   // Update UserRegistration
//   await userReg.update(updateData);

//   const nameToUse = name || userReg.adhaarName || "";
//   const emailToUse = email || userReg.email || "";
//   console.log("Using Name:", nameToUse);
//   console.log("Using Email:", emailToUse);

//   // Create or update Users table entry
//   const mobile_num = parseInt(mobile, 10);
//   let newUser = await Users.findOne({
//     where: {
//       mobile: mobile_num,
//     },
//   });

//   const plainPassword = randomBytes(6).toString("base64");
//   console.log("password",plainPassword)

//   if (!newUser) {
//     newUser = await Users.create({
//       name: nameToUse,
//       email: emailToUse,
//       mobile: mobile_num,
//       password: plainPassword,
//       isActive: true,
//       isPartner: true,
//       roleId: ROLE.partner,
//       isEmailOTPVerified: true,
//       isMobileOTPVerified: true,
//       emailOTP: null,
//       mobileOTP: null,
//       loginOTP: null,
//       tempPassword: null,
//       isTempPasswordReq: false,
//       fcmToken: null,
//       refreshToken: false,
//       deviceId: null,
//       userTypeId: 4,
//       modifiedBy: 0,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });
//     console.log("New user created with ID:", newUser.id);
//   } else {
//     // Update existing user with new data
//     await newUser.update({
//       name: nameToUse,
//       email: emailToUse,
//       updatedAt: new Date(),
//     });
//     console.log("Existing user updated with ID:", newUser.id);
//   }

//   // Update UserRegistration with the user ID
//   await userReg.update({
//     userId: newUser.id
//   });

//   // Check if mapping already exists
//   const existingMapping = await UserMapping.findOne({
//     where: {
//       user_id: newUser.id,
//       role_id: ROLE.partner
//     }
//   });

//   if (!existingMapping) {
//     await UserMapping.create({
//       user_id: newUser.id,
//       role_id: ROLE.partner,
//       userType_id: USER_TYPE.partner,
//       ref_id: userReg.regId,
//     });
//     console.log("User mapping created");
//   }

//   // Log final update
//   console.log(`All user details saved successfully for mobile: ${mobile}`);
//   console.log("UserRegistration updated with:", {
//     name: nameToUse,
//     email: emailToUse,
//     dob: dob,
//     address: address,
//     pan: pan,
//     aadhaar: aadhaar,
//     bank_account: bank_account,
//     ifsc: ifsc,
//     nism_arn: nism_arn,
//     nism_euin: nism_euin,
//     nism_certificate_uploaded: nism_certificate_uploaded,
//     nism_file_name: nism_file_name
//   });

//   // Return the fully updated user registration
//   const finalUserReg = await UserRegistration.findOne({ 
//     where: { mobile }
//   });

//   return finalUserReg;
// };


// export const userCreated = async (
//   mobile: string,
//   name: string,
//   email: string,
//   dob: string,
//   address: string,
//   pincode: string,
//   aadhaar: string,
//   pan: string,
//   bank_account: string,
//   ifsc: string,
//   bank_name: string,
//   micr: string,
//   nism_arn: string,
//   nism_euin: string,
//   nism_certificate_uploaded: boolean,
//   nism_file_name: string,
//   aadhaar_verified: string,
//   pan_verified: string,
//   bank_verified: string,
//   email_verified: string
// ) => {
//   console.log("Creating user with all data:", {
//     mobile, name, email, dob, address, pincode, aadhaar, pan, bank_account, ifsc,
//     bank_name, micr, nism_arn, nism_euin, nism_certificate_uploaded, nism_file_name,
//     aadhaar_verified, pan_verified, bank_verified, email_verified
//   });

//   const userReg = await UserRegistration.findOne({ where: { mobile } });
//   if (!userReg) {
//     throw new Error("Registration Status not found");
//   }

//   const updateData = {
//     aadhaar: aadhaar || userReg.aadhaar || null,
//     aadhaarVerified: aadhaar_verified ? 1 : userReg.aadhaarVerified || 0,
//     aadhaarVerifiedAt: aadhaar_verified ? new Date() : userReg.aadhaarVerifiedAt,
//     pan: pan || userReg.pan || null,
//     panVerified: pan_verified ? 1 : userReg.panVerified || 0,
//     panVerifiedAt: pan_verified ? new Date() : userReg.panVerifiedAt,
//     bankAcNo: bank_account || userReg.bankAcNo || null,
//     bankAcIfsc: ifsc || userReg.bankAcIfsc || null,
//     bankAcNameInBank: userReg.bankAcNameInBank, // unchanged
//     bankAcBankName: bank_name || userReg.bankAcBankName || null,
//     bankAcMicr: micr || userReg.bankAcMicr || null,
//     bankAcNoVerified: bank_verified ? 1 : userReg.bankAcNoVerified || 0,
//     bankAcNoVerifiedAt: bank_verified ? new Date() : userReg.bankAcNoVerifiedAt,
//     nism: nism_file_name || userReg.nism || null,
//     nismVerified: nism_certificate_uploaded ? 1 : userReg.nismVerified || 0,
//     nismVerifiedAt: nism_certificate_uploaded ? new Date() : userReg.nismVerifiedAt,
//     email: email || userReg.email || null,
//     emailVrified: email_verified ? 1 : userReg.emailVerified || 0,
//     emailVerifiedAt: email_verified ? new Date() : userReg.emailVerifiedAt,
//     userCreated: 1,
//     adhaarName: name || userReg.adhaarName || null,
//     adhaarDob: dob || userReg.adhaarDob || null,
//     adhaarAddress: address || userReg.adhaarAddress || null,
//     adhaarPincode: pincode || userReg.adhaarPincode || null,
//   };
//   console.log("updateData:", updateData);

//   const response = await userReg.update(updateData);
//   console.log("UserRes============================================");
//   console.log(response);

//   const nameToUse = name || userReg.adhaarName || "";
//   const emailToUse = email || userReg.email || "";
//   const mobile_num = parseInt(mobile, 10);
//   const plainPassword = randomBytes(6).toString("base64");

//   let newUser = await Users.findOne({ where: { mobile: mobile_num } });

//   if (!newUser) {
//     newUser = await Users.create({
//       name: nameToUse,
//       email: emailToUse,
//       mobile: mobile_num,
//       password: plainPassword,
//       isActive: true,
//       isPartner: true,
//       roleId: ROLE.partner,
//       isEmailOTPVerified: true,
//       isMobileOTPVerified: true,
//       emailOTP: null,
//       mobileOTP: null,
//       loginOTP: null,
//       tempPassword: null,
//       isTempPasswordReq: false,
//       fcmToken: null,
//       refreshToken: false,
//       deviceId: null,
//       userTypeId: 4,
//       modifiedBy: 0,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });
//     console.log("New user created with ID:", newUser.id);
//   } else {
//     await newUser.update({
//       name: nameToUse,
//       email: emailToUse,
//       updatedAt: new Date(),
//     });
//     console.log("Existing user updated with ID:", newUser.id);
//   }

//   await userReg.update({ userId: newUser.id });

//   const existingMapping = await UserMapping.findOne({
//     where: { user_id: newUser.id, role_id: ROLE.partner }
//   });

//   if (!existingMapping) {
//     await UserMapping.create({
//       user_id: newUser.id,
//       role_id: ROLE.partner,
//       userType_id: USER_TYPE.partner,
//       ref_id: userReg.regId,
//     });
//   }

//   if (emailToUse) {
//     const htmlContent = `
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="UTF-8" />
//           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//           <style>
//             body { background-color: #f4f4f4; font-family: Arial, sans-serif; }
//             .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 30px; text-align: center; }
//             .logo img { width: 120px; margin-bottom: 20px; }
//             .title { font-size: 22px; color: #333; margin-bottom: 20px; }
//             .otp-box { font-size: 28px; color: #007bff; font-weight: bold; letter-spacing: 2px; background: #eef4ff; padding: 15px 0; border-radius: 6px; margin: 20px 0; }
//             .message { font-size: 15px; color: #555; margin: 10px 0 20px; }
//             .footer { font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px; }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="logo">
//               <img src="https://vedantasset.com/wp-content/uploads/2024/03/cropped-vedant-asset-logo.webp" alt="Vedant Asset Logo" />
//             </div>
//             <div class="title">Your Account Credentials</div>
//             <div class="message">Dear ${nameToUse},</div>
//             <div class="message">Your account has been successfully created. Please use the password below to log in:</div>
//             <div class="otp-box">${plainPassword}</div>
//             <div class="message">We recommend changing your password after your first login.</div>
//             <div class="footer">© ${new Date().getFullYear()} Vedant Asset Limited. All rights reserved.</div>
//           </div>
//         </body>
//       </html>`;

//     try {
//       await sendEmail2(emailToUse, "Customer", "Your Account Password", htmlContent);
//       console.log(" Email sent successfully to:", emailToUse);
//     } catch (err) {
//       console.error(" Failed to send email:", err);
//     }
//   }

//   const finalUserReg = await UserRegistration.findOne({ where: { mobile } });
//   return finalUserReg;
// };

export const userCreated = async (
  mobile: string,
  name: string,
  email: string,
  dob: string,
  address: string,
  pincode: string,
  aadhaar: string,
  pan: string,
  bank_account: string,
  ifsc: string,
  bank_name: string,
  micr: string,
  nism_arn: string,
  nism_euin: string,
  nism_certificate_uploaded: boolean,
  nism_file_name: string,
  aadhaar_verified: string,
  pan_verified: string,
  bank_verified: string,
  email_verified: string
) => {
  try {
    console.log("Creating user with all data:", {
      mobile, name, email, dob, address, pincode, aadhaar, pan, bank_account, ifsc,
      bank_name, micr, nism_arn, nism_euin, nism_certificate_uploaded, nism_file_name,
      aadhaar_verified, pan_verified, bank_verified, email_verified
    });

    let userReg;
    try {
      userReg = await UserRegistration.findOne({ where: { mobile } });
    } catch (error) {
      console.error("Error finding UserRegistration:", error);
      throw new Error("Database error while checking registration status");
    }

    if (!userReg) {
      throw new Error("Registration Status not found");
    }

    const updateData = {
      aadhaar: aadhaar || userReg.aadhaar || null,
      aadhaarVerified: aadhaar_verified ? 1 : userReg.aadhaarVerified || 0,
      aadhaarVerifiedAt: aadhaar_verified ? new Date() : userReg.aadhaarVerifiedAt,
      pan: pan || userReg.pan || null,
      panVerified: pan_verified ? 1 : userReg.panVerified || 0,
      panVerifiedAt: pan_verified ? new Date() : userReg.panVerifiedAt,
      bankAcNo: bank_account || userReg.bankAcNo || null,
      bankAcIfsc: ifsc || userReg.bankAcIfsc || null,
      bankAcNameInBank: userReg.bankAcNameInBank, // unchanged
      bankAcBankName: bank_name || userReg.bankAcBankName || null,
      bankAcMicr: micr || userReg.bankAcMicr || null,
      bankAcNoVerified: bank_verified ? 1 : userReg.bankAcNoVerified || 0,
      bankAcNoVerifiedAt: bank_verified ? new Date() : userReg.bankAcNoVerifiedAt,
      nism: nism_file_name || userReg.nism || null,
      nismVerified: nism_certificate_uploaded ? 1 : userReg.nismVerified || 0,
      nismVerifiedAt: nism_certificate_uploaded ? new Date() : userReg.nismVerifiedAt,
      email: email || userReg.email || null,
      emailVrified: email_verified ? 1 : userReg.emailVerified || 0,
      emailVerifiedAt: email_verified ? new Date() : userReg.emailVerifiedAt,
      userCreated: 1,
      adhaarName: name || userReg.adhaarName || null,
      adhaarDob: dob || userReg.adhaarDob || null,
      adhaarAddress: address || userReg.adhaarAddress || null,
      adhaarPincode: pincode || userReg.adhaarPincode || null,
    };
    
    console.log("updateData:", updateData);

    let updateResponse;
    try {
      updateResponse = await userReg.update(updateData);
      console.log("UserRes============================================");
      console.log(updateResponse);
    } catch (error) {
      console.error("Error updating UserRegistration:", error);
      throw new Error("Failed to update user registration data");
    }

    const nameToUse = name || userReg.adhaarName || "";
    const emailToUse = email || userReg.email || "";
    const mobile_num = parseInt(mobile, 10);
    const plainPassword = randomBytes(6).toString("base64");

    let newUser;
    try {
      newUser = await Users.findOne({ where: { mobile: mobile_num } });
    } catch (error) {
      console.error("Error finding existing user:", error);
      throw new Error("Database error while checking for existing user");
    }

    if (!newUser) {
      try {
        newUser = await Users.create({
          name: nameToUse,
          email: emailToUse,
          mobile: mobile_num,
          password: plainPassword,
          isActive: true,
          isPartner: true,
          roleId: ROLE.partner,
          isEmailOTPVerified: true,
          isMobileOTPVerified: true,
          emailOTP: null,
          mobileOTP: null,
          loginOTP: null,
          tempPassword: null,
          isTempPasswordReq: false,
          fcmToken: null,
          refreshToken: false,
          deviceId: null,
          userTypeId: 4,
          modifiedBy: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log("New user created with ID:", newUser.id);
      } catch (error) {
        console.error("Error creating new user:", error);
        throw new Error("Failed to create new user");
      }
    } else {
      try {
        await newUser.update({
          name: nameToUse,
          email: emailToUse,
          updatedAt: new Date(),
        });
        console.log("Existing user updated with ID:", newUser.id);
      } catch (error) {
        console.error("Error updating existing user:", error);
        throw new Error("Failed to update existing user");
      }
    }

    try {
      await userReg.update({ userId: newUser.id });
    } catch (error) {
      console.error("Error updating user ID in registration:", error);
      throw new Error("Failed to link user with registration");
    }

    try {
      const existingMapping = await UserMapping.findOne({
        where: { user_id: newUser.id, role_id: ROLE.partner }
      });

      if (!existingMapping) {
        try {
          await UserMapping.create({
            user_id: newUser.id,
            role_id: ROLE.partner,
            userType_id: USER_TYPE.partner,
            ref_id: userReg.regId,
          });
        } catch (error) {
          console.error("Error creating user mapping:", error);
          throw new Error("Failed to create user mapping");
        }
      }
    } catch (error) {
      console.error("Error checking existing user mapping:", error);
      throw new Error("Database error while checking user mapping");
    }

    if (emailToUse) {
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
              .otp-box { font-size: 28px; color: #007bff; font-weight: bold; letter-spacing: 2px; background: #eef4ff; padding: 15px 0; border-radius: 6px; margin: 20px 0; }
              .message { font-size: 15px; color: #555; margin: 10px 0 20px; }
              .footer { font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                <img src="https://vedantasset.com/wp-content/uploads/2024/03/cropped-vedant-asset-logo.webp" alt="Vedant Asset Logo" />
              </div>
              <div class="title">Your Account Credentials</div>
              <div class="message">Dear ${nameToUse},</div>
              <div class="message">Your account has been successfully created. Please use the password below to log in:</div>
              <div class="otp-box">${plainPassword}</div>
              <div class="message">We recommend changing your password after your first login.</div>
              <div class="footer">© ${new Date().getFullYear()} Vedant Asset Limited. All rights reserved.</div>
            </div>
          </body>
        </html>`;

      try {
        await sendEmail2(emailToUse, "Customer", "Your Account Password", htmlContent);
        console.log("Email sent successfully to:", emailToUse);
      } catch (err) {
        console.error("Failed to send email:", err);
        // Don't throw error for email failure, just log it
      }
    }

    let finalUserReg;
    try {
      finalUserReg = await UserRegistration.findOne({ where: { mobile } });
      return finalUserReg;
    } catch (error) {
      console.error("Error fetching final user registration:", error);
      // Return the already updated userReg if we can't fetch fresh data
      return userReg;
    }

  } catch (error) {
    console.error("Error in userCreated function:", error);
    
    // Re-throw the error with more context if it's not already a proper Error object
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`User creation failed: ${String(error)}`);
    }
  }
};


//busniess correspondent user
export const bcCreated = async (
  mobile: string,
  name: string,
  dob: string,
  address: string,
  pincode: string,
  aadhaar: string,
  pan: string,
  bank_account: string,
  ifsc: string,
  bank_name: string,
  micr: string,
  email: string,
  aadhaar_verified: string,
  pan_verified: string,
  bank_verified: string,
  email_verified: string
) => {

  console.log("Creating user with all data:", {
    mobile, name, email, dob, address, pan, aadhaar, bank_account, ifsc,
  });
  console.log("aaaffsdfsdfsdfsdfsdfsd")

  try {
    const bcReg = await BcRegistration.findOne({ where: { mobile } });

    if (!bcReg) {
      throw new Error("Registration Status not found");
    }

    const updateData = {
      //user_type: userReg.userType,  // unchanged (not in your update list)
      //mobile: userReg.mobile,        // unchanged

      //mobile_verified: userReg.mobileVerified,
      mobile_verified_at: bcReg.aadhaarVerifiedAt || new Date(),

      aadhaar: aadhaar || bcReg.aadhaar || null,
      aadhaarVerified: aadhaar_verified ? 1 : bcReg.aadhaarVerified || 0,
      aadhaarVerifiedAt: aadhaar_verified ? new Date() : bcReg.aadhaarVerifiedAt,

      pan: pan || bcReg.pan || null,
      panVerified: pan_verified ? 1 : bcReg.panVerified || 0,
      panVerifiedAt: pan_verified ? new Date() : bcReg.panVerifiedAt,

      bankAcNo: bank_account || bcReg.bankAcNo || null,
      bankAcIfsc: ifsc || bcReg.bankAcIfsc || null,
      bankAcNameInBank: bcReg.bankAcNameInBank, // unchanged
      bankAcBankName: bank_name || bcReg.bankAcBankName || null,
      bankAcMicr: micr || bcReg.bankAcMicr || null,
      bankAcNoVerified: bank_verified ? 1 : bcReg.bankAcNoVerified || 0,
      bankAcNoVerifiedAt: bank_verified ? new Date() : bcReg.bankAcNoVerifiedAt,

      //nism: nism_file_name || userReg.nism || null,
      //nismVerified: nism_certificate_uploaded ? 1 : userReg.nismVerified || 0,
      //nismVerifiedAt: nism_certificate_uploaded ? new Date() : userReg.nismVerifiedAt,

      email: email || bcReg.email || null,
      emailVerified: email_verified ? 1 : bcReg.emailVerified || 0,
      emailVerifiedAt: email_verified ? new Date() : bcReg.emailVerifiedAt,

      //agreement: userReg.agreement,              // unchanged
      //agreement_signed: userReg.agreementSigned,
      //agreement_signed_at: userReg.agreementSignedAt,

      //nominee_name: userReg.nomineeName,
      //nominee_relation: userReg.nomineeRelation,
      //nominee_type: userReg.nomineeType,
      //nominee_dob: userReg.nomineeDob,
      //nominee_pan: userReg.nomineePan,
      //nominee_created_at: userReg.nomineeCreatedAt,

      userCreated: 1,
      //user_id: userReg.user_id,  // unchanged
      //user_created_at: new Date(),

      adhaarName: name || bcReg.adhaarName || null,
      adhaarDob: dob || bcReg.adhaarDob || null,
      adhaarAddress: address || bcReg.adhaarAddress || null,
      adhaarPincode: pincode || bcReg.adhaarPincode || null,

      //rm_id: userReg.rm_id,  // unchanged

      //arn_no: nism_arn || userReg.arn_no || null,
      //euin_no: nism_euin || userReg.euin_no || null,

      //is_delete: userReg.is_delete // unchanged
    };

    await bcReg.update(updateData);

    const nameToUse = name || bcReg.adhaarName || "";
    const emailToUse = email || bcReg.email || "";
    const mobile_num = parseInt(mobile, 10);
    const plainPassword = randomBytes(6).toString("base64");
    console.log("Password", plainPassword)

    let newUser = await Users.findOne({ where: { mobile: mobile_num } });

    if (!newUser) {
      newUser = await Users.create({
        name: nameToUse,
        email: emailToUse,
        mobile: mobile_num,
        password: plainPassword,
        isActive: true,
        isPartner: false,
        roleId: ROLE.BC,
        isEmailOTPVerified: true,
        isMobileOTPVerified: true,
        emailOTP: null,
        mobileOTP: null,
        loginOTP: null,
        tempPassword: null,
        isTempPasswordReq: false,
        fcmToken: null,
        refreshToken: false,
        deviceId: null,
        userTypeId: 6,
        modifiedBy: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("New user created with ID:", newUser.id);
    } else {
      await newUser.update({
        name: nameToUse,
        email: emailToUse,
        updatedAt: new Date(),
      });
      console.log("Existing user updated with ID:", newUser.id);
    }

    await bcReg.update({ userId: newUser.id });

    console.log("ROLE.bc =", ROLE.BC);
    console.log("USER_TYPE.bc =", USER_TYPE.BC);
    console.log("userReg.regId =", bcReg.regId);
    console.log("newUser.id =", newUser.id);

    const existingMapping = await UserMapping.findOne({
      where: { user_id: newUser.id, role_id: ROLE.BC }
    });

    if (!existingMapping) {
      await UserMapping.create({
        user_id: newUser.id,
        role_id: ROLE.BC,
        userType_id: USER_TYPE.BC,
        ref_id: bcReg.regId,
      });
    }

    if (emailToUse) {
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
            .otp-box { font-size: 28px; color: #007bff; font-weight: bold; letter-spacing: 2px; background: #eef4ff; padding: 15px 0; border-radius: 6px; margin: 20px 0; }
            .message { font-size: 15px; color: #555; margin: 10px 0 20px; }
            .footer { font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <img src="https://vedantasset.com/wp-content/uploads/2024/03/cropped-vedant-asset-logo.webp" alt="Vedant Asset Logo" />
            </div>
            <div class="title">Your Account Credentials</div>
            <div class="message">Dear ${nameToUse},</div>
            <div class="message">Your account has been successfully created. Please use the password below to log in:</div>
            <div class="otp-box">${plainPassword}</div>
            <div class="message">We recommend changing your password after your first login.</div>
            <div class="footer">© ${new Date().getFullYear()} Vedant Asset Limited. All rights reserved.</div>
          </div>
        </body>
      </html>`;

      try {
        await sendEmail2(emailToUse, "Customer", "Your Account Password", htmlContent);
        console.log(" Email sent successfully to:", emailToUse);
      } catch (err) {
        console.error(" Failed to send email:", err);
      }
    }

    const finalUserReg = await BcRegistration.findOne({ where: { mobile } });
    return finalUserReg;
  } catch (error) {
    console.log("--------------------------------------------------------", error)
  }
};



const generateUniqueId = (mobile: string, pan: string): string => {
  // Get first 2 digits of mobile
  const mobileDigits = String(mobile).substring(0, 2);

  const cleanedPan = String(pan).replace(/\s+/g, "").toUpperCase();
  const panDigits = cleanedPan.substring(cleanedPan.length - 4);

  const uniqueNumber = Date.now() + Math.floor(Math.random() * 10000);

  return `${mobileDigits}${panDigits}${uniqueNumber}`;
};

export const dashboard = async (mobile: string) => {
  console.log("mobile -", mobile);

  const userReg = await UserRegistration.findOne({ where: { mobile } });
  if (!userReg) {
    throw new Error("Registration Status not found");
  }

  const totalCount = await Users.count();
  const aumSum = await GoalPlan.sum("target_amt");
  const activeCount = await Users.count({
    where: { isActive: "true" },
  });

  //const activeCount = await Users.count({ WHERE "Users"."isActive" = 'active' });

  console.log(`Total: ${totalCount}, Active: ${activeCount}`);

  return {
    userReg,
    totalCount,
    activeCount,
    aumSum,
  };
};

export const saveEmailLog = async (
  mobile: string,
  email: string,
  otp: string
) => {
  console.log("mobile -", mobile);
  console.log("email -", email);
  console.log("otp -", otp);

  // Check for existing registration
  const userReg = await UserRegistration.findOne({ where: { mobile } });
  if (!userReg) {
    throw new Error("Registration Status not found");
  }

  console.log("Inside the email verification service");

  const userId = await getUserIdByMobile(mobile);

  try {
    const newOtpLog = await OtpLog.create({
      userId: userId,
      mobile,
      email,
      otp,
      purpose: "Email Verification",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
      isUsed: 0,
      status: 1,
    });

    console.log(` OTP log saved in memory:`, newOtpLog.toJSON());

    // Force a fresh read
    const check = await OtpLog.findByPk(newOtpLog.otpId);
    if (!check) {
      console.error("Row NOT in DB immediately after create!");
    } else {
      console.log("Freshly loaded from DB:", check.toJSON());
    }
  } catch (error) {
    console.error(`Error saving OTP log:`, error);
    throw error;
  }

  try {
    await userReg.update({
      email,
      aadhaarVerified: 0,
    });
    console.log(`User record updated with new email for mobile: ${mobile}`);
  } catch (error) {
    console.error(` Error updating user record:`, error);
    throw error;
  }

  return 1;
};

export async function getUserIdByMobile(mobile: string): Promise<number> {
  const userReg = await UserRegistration.findOne({
    where: { mobile },
    attributes: ["regId"],
  });

  if (!userReg) {
    throw new Error(`User not found for mobile ${mobile}`);
  }

  return userReg.regId;
}

export const portfolioDetail = async (filters: {
  pan_no?: string;
}): Promise<any[]> => {
  const builder = new PortfolioQueryBuilder(filters.pan_no);

  return await db.query(builder.getQuery(), {
    type: QueryTypes.SELECT,
    replacements: { pan_no: filters.pan_no },
  });
};

//new service for RM Dashboard
/*export const rmDashboardDetail = async (): Promise<any[]> => {
  const builder = new rmDashboardQueryBuilder();

  return await db.query(builder.getQuery(), {
    type: QueryTypes.SELECT,
  });
};*/

//new service class for birthday
export const BirthdaySearch = async (): Promise<any[]> => {
  const builder = new BirthdayQueryBuilder();
  return await db.query(builder.getQuery(), {
    type: QueryTypes.SELECT,
  });
};

export const portfolioDetails = async (
  loginId: string,
  rmId: string,
  userTypeid?: string
): Promise<any[]> => {
  console.log("loginId - " + loginId);
  console.log("rmId - " + rmId);
  console.log("userTypeid - " + userTypeid);

  let query = "";
  let replacements: any = {};

  // CASE 1: BC LOGIN  (userTypeid = 6)
  if (userTypeid === "6" && loginId !== "0") {
    query = `SELECT * FROM fn_get_client_dtl_user(NULL, NULL, NULL, :bcId)`;
    replacements = { bcId: loginId };
  }

  // CASE 2: ADMIN/SUPER ADMIN (all RM clients)
  else if (
    (loginId === "0" || !loginId) &&
    (rmId === "0" || !rmId) &&
    (userTypeid === "1" || !userTypeid)
  ) {
    query = `SELECT * FROM fn_get_client_dtl_user(NULL, NULL, 1, NULL)`;
  }

  // CASE 3: PARTNER LOGIN (userTypeid = 4 or 5)
  else if (userTypeid !== "6" && loginId !== "0" && rmId === "0") {
    query = `SELECT * FROM fn_get_client_dtl_user(:partnerId, NULL, NULL, NULL)`;
    replacements = { partnerId: loginId };
  }

  // CASE 4: RM LOGIN
  else if (rmId !== "0" && (loginId === "0" || !loginId)) {
    query = `SELECT * FROM fn_get_client_dtl_user(NULL, :rmId, NULL, NULL)`;
    replacements = { rmId };
  }

  // CASE 5: PARTNER + RM BOTH PROVIDED
  else {
    query = `SELECT * FROM fn_get_client_dtl_user(:partnerId, :rmId, NULL, NULL)`;
    replacements = { partnerId: loginId, rmId };
  }

  try {
    const results = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results as any[];
  } catch (error) {
    console.error(`Error showing details`, error);
    throw error;
  }
};


// export const portfolioDetails = async (
//   loginId: string,
//   rmId: string,
//   userTypeid?: string
// ): Promise<any[]> => {
//   console.log("loginId - " + loginId);
//   console.log("rmId - " + rmId);
//   console.log("userTypeid - " + userTypeid);

//   let query = "";
//   let replacements: any = {};

//   // CASE 1: BC LOGIN (userTypeid = 6)
//   if (userTypeid === "6" && loginId !== "0") {
//     query = `SELECT * FROM fn_get_clientss_dtl_userss(NULL, NULL, NULL, :bcId)`;
//     replacements = { bcId: loginId };
//   }

//   // CASE 2: ADMIN/SUPER ADMIN (ALL CLIENTS - NO FILTER)
//   else if (
//     (loginId === "0" || !loginId) &&
//     (rmId === "0" || !rmId) &&
//     (userTypeid === "1" || !userTypeid)
//   ) {
//     query = `SELECT * FROM fn_get_clientss_dtl_userss(NULL, NULL, NULL, NULL)`;
//     // ↑ Changed from 2 to NULL to get ALL data
//   }

//   // CASE 3: PARTNER LOGIN (userTypeid = 4 or 5)
//   else if (userTypeid !== "6" && loginId !== "0" && rmId === "0") {
//     query = `SELECT * FROM fn_get_clientss_dtl_userss(:partnerId, NULL, NULL, NULL)`;
//     replacements = { partnerId: loginId };
//   }

//   // CASE 4: RM LOGIN
//   else if (rmId !== "0" && (loginId === "0" || !loginId)) {
//     query = `SELECT * FROM fn_get_clientss_dtl_userss(NULL, :rmId, NULL, NULL)`;
//     replacements = { rmId };
//   }

//   // CASE 5: PARTNER + RM BOTH PROVIDED
//   else {
//     query = `SELECT * FROM fn_get_clientss_dtl_userss(:partnerId, :rmId, NULL, NULL)`;
//     replacements = { partnerId: loginId, rmId };
//   }

//   try {
//     const results = await db.query(query, {
//       replacements,
//       type: QueryTypes.SELECT,
//     });

//     return results as any[];
//   } catch (error) {
//     console.error(`Error showing details`, error);
//     throw error;
//   }
// };

export const getDataByFolioAndScheme = async (
  foliochk: string,
  sch_name: string
): Promise<any[]> => {
  const query = `SELECT * FROM cam_investor_details_wbr9 WHERE foliochk = :foliochk AND sch_name = :sch_name `;
  try {
    const results = await db.query(query, {
      type: QueryTypes.SELECT,
      replacements: { foliochk, sch_name },
    });
    return results as any[];
  } catch (error) {
    console.error(`Error fetching all data by pan and scheme:`, error);
    throw error;
  }
};

export const getUserBasicDetails = async (id: string): Promise<any[]> => {
  const query = `select ubd.id as investor_id,ubd."name",ubd.pan_no  from "UserBasicDetail" ubd where ubd.user_id = :id `;

  try {
    const results = await db.query(query, {
      replacements: { id: id.trim().toUpperCase() },
      type: QueryTypes.SELECT,
    });
    console.log("query-" + query);
    return results as any[];
  } catch (error) {
    console.error(`Error searching by ID ${id}:`, error);

    throw error; // this ensures function always throws or returns
  }
};

////new
export const portfolioDetailList = async (filters: {
  pan_no?: number;
}): Promise<any[]> => {
  let whereClause = "WHERE 1=1";
  const replacements: any = {};

  if (filters.pan_no) {
    whereClause += " AND pan_no = :pan_no";
    replacements.pan_no = filters.pan_no;
  }

  console.log("pan-" + whereClause);
  try {
    const builder = new folioListQueryBuilder(whereClause);

    return await db.query(builder.getQuery(), {
      type: QueryTypes.SELECT,
      replacements: { pan_no: filters.pan_no },
    });
  } catch (error) {
    console.error(`Error fetching portfolio data by filters:`, error);
    throw error;
  }
};

//ankit
export const portfolioDetailListAll = async (): Promise<any[]> => {
  try {
    // Query for cam_investor_details_wbr9 table
    const camQuery = `SELECT * FROM cam_investor_details_wbr9`;
    // Query for kafintech_trxn_report table with column mapping
    const kafinQuery = `
      SELECT 
        NULL AS id,
        fmcode AS amc_code,
        td_acno AS folio_no,
        td_scheme AS scheme_code,
        funddesc AS scheme_name,
        invname AS investor_name,
        pan1 AS pan,
        NULL AS email,
        NULL AS mobile,
        NULL AS address,
        NULL AS city,
        NULL AS state,
        NULL AS pin_code,
        NULL AS bank_name,
        NULL AS bank_account,
        NULL AS ifsc_code,
        NULL AS nominee_name,
        NULL AS nominee_relation,
        NULL AS euin,
        NULL AS kyc_status,
        NULL AS ckyc_id,
        NULL AS created_at,
        NULL AS updated_at
      FROM kafintech_trxn_report
      GROUP BY fmcode, td_acno, td_scheme, funddesc, invname, pan1
    `;

    // Execute both queries in parallel
    const [camResults, kafinResults] = await Promise.all([
      db.query(camQuery, { type: QueryTypes.SELECT }),
      db.query(kafinQuery, { type: QueryTypes.SELECT }),
    ]);

    // Combine results from both tables
    const combinedResults = [...camResults, ...kafinResults];
    return combinedResults;
  } catch (error) {
    console.error("Error fetching all portfolio data:", error);
    throw error;
  }
};

//chnages done by Aditya Gupta with kafintech and cam -

// export const investmentGetFolioDtl = async (pan: string): Promise<any[]> => {

//   console.log("pan---"+pan);

//    const builder = new PortfolioQueryBuilder(pan);

//   return await db.query(builder.getQuery(), {
//     type: QueryTypes.SELECT,
//     replacements: { pan: pan },
//   });

//   // const query = `SELECT * FROM cam_investor_details_wbr9 WHERE pan_no = :pan `;
//   // try {
//   //   const results = await db.query(query, {
//   //     type: QueryTypes.SELECT,
//   //     replacements: { pan },
//   //   });
//   //   return results as any[];
//   // } catch (error) {
//   //   console.error(`Error fetching folio numbers by pan:`, error);
//   //   throw error;
//   // }
// };

export const investmentGetFolioDtl = async (filters: {
  pan?: string;
}): Promise<any[]> => {
  console.log("pan---" + filters.pan);
  const builder = new InvestmentLedgerListQueryBuilder(filters.pan);

  // Get the query
  const query = builder.getQuery();

  console.log("Executing SQL Query:", query);
  console.log("Replacements:", { pan_no: filters.pan });

  return await db.query(builder.getQuery(), {
    type: QueryTypes.SELECT,
    replacements: { pan_no: filters.pan },
  });
};

export const getAdminCount = async (): Promise<any[]> => {
  const query = `
   SELECT 
  (
    SELECT COUNT(*) 
    FROM "InvestorRegistration"
  ) AS total_clients,
(
  COALESCE(
    (SELECT SUM(CAST(rupee_bal AS numeric)) 
     FROM cam_investor_details_wbr9),
    0
  )
  +
  COALESCE(
    (SELECT SUM(CAST(valinv AS numeric))
     FROM kfintech_client_aum),
    0
  )
) AS total_aum,
  (
    SELECT COUNT(*) 
    FROM user_registrations ur
    WHERE is_delete = false
  ) AS total_partner,

  (
    SELECT COUNT(*)
    FROM (
      SELECT r."Name", r.email, r.mobile
      FROM "RMRegistration" r
      INNER JOIN "Users" u ON u.mobile::text = r.mobile
    ) AS rm_data
  ) AS total_rm,

  (
    SELECT COUNT(*)
    FROM bc_registrations br
    WHERE is_delete = false
  ) AS total_bc;

  `;

  try {
    const results = await db.query(query, {
      type: QueryTypes.SELECT,
    });
    return results;
  } catch (error) {
    console.error("Error fetching admin counts:", error);
    throw error;
  }
};



export const getRmCount = async (rmId: string): Promise<any[]> => {
  console.log("rmId-" + rmId);

  const query = `SELECT 
      -- Total Investors
      (
        SELECT COUNT(*) 
        FROM "InvestorRegistration" ir 
        WHERE ir.rm_id = :rmId
      ) AS total_investor,
      (
        SELECT COUNT(*) 
        FROM user_registrations ur 
        WHERE ur.rm_id = :rmId
      ) AS total_partner,
      (
        SELECT COUNT(*) 
        FROM bc_registrations br 
        WHERE br.rm_id = :rmId
      ) AS total_bc,

      -- Total AUM (from all three tables)
      (
  COALESCE(
    (
      SELECT SUM(CAST(c.rupee_bal AS numeric))
      FROM cam_investor_details_wbr9 c
      WHERE c.pan_no IN (
        SELECT pan_no FROM "InvestorRegistration" WHERE rm_id = :rmId
        UNION
        SELECT pan FROM user_registrations WHERE rm_id = :rmId
        UNION  
        SELECT pan FROM bc_registrations WHERE rm_id = :rmId
      )
    ),
    0
  )
  +
  COALESCE(
    (
      SELECT SUM(CAST(k.valinv AS numeric))
      FROM kfintech_client_aum k
      WHERE k.pan IN (
        SELECT pan_no FROM "InvestorRegistration" WHERE rm_id = :rmId
        UNION
        SELECT pan FROM user_registrations WHERE rm_id = :rmId
        UNION  
        SELECT pan FROM bc_registrations WHERE rm_id = :rmId
      )
    ),
    0
  )
) AS total_aum,
      -- Total Transaction (CAMS + KFinTech) from all three tables
      (
        COALESCE((
          SELECT SUM(cam.amount)
          FROM cam_investor_trxn_wbr2 cam
          WHERE cam.pan IN (
            SELECT pan_no FROM "InvestorRegistration" WHERE rm_id = :rmId
            UNION
            SELECT pan FROM user_registrations WHERE rm_id = :rmId
            UNION
            SELECT pan FROM bc_registrations WHERE rm_id = :rmId
          )
        ), 0)
        +
        COALESCE((
          SELECT SUM(kf.td_amt)
          FROM kafintech_trxn_report kf
          WHERE kf.pan1 IN (
            SELECT pan_no FROM "InvestorRegistration" WHERE rm_id = :rmId
            UNION
            SELECT pan FROM user_registrations WHERE rm_id = :rmId
            UNION
            SELECT pan FROM bc_registrations WHERE rm_id = :rmId
          )
          OR kf.pan2 IN (
            SELECT pan_no FROM "InvestorRegistration" WHERE rm_id = :rmId
            UNION
            SELECT pan FROM user_registrations WHERE rm_id = :rmId
            UNION
            SELECT pan FROM bc_registrations WHERE rm_id = :rmId
          )
          OR kf.pan3 IN (
            SELECT pan_no FROM "InvestorRegistration" WHERE rm_id = :rmId
            UNION
            SELECT pan FROM user_registrations WHERE rm_id = :rmId
            UNION
            SELECT pan FROM bc_registrations WHERE rm_id = :rmId
          )
        ), 0)
      ) AS total_transaction,

      -- Mobile
      (
        SELECT mobile 
        FROM "RMRegistration" 
        WHERE id = :rmId
        LIMIT 1
      ) AS mobile,

      -- Email
      (
        SELECT email 
        FROM "RMRegistration"   
        WHERE id = :rmId
        LIMIT 1
      ) AS email,

      -- Name
      (
        SELECT "Name" 
        FROM "RMRegistration" 
        WHERE id = :rmId
        LIMIT 1
      ) AS name
  ;`;

  try {
    const results = await db.query(query, {
      replacements: { rmId: rmId },
      type: QueryTypes.SELECT,
    });
    console.log("query-" + query);
    return results as any[];
  } catch (error) {
    console.error(`Error searching by ID ${rmId}:`, error);

    throw error;
  }
};


//ankit
export const getAllClient = async (rmId: string): Promise<any[]> => {
  console.log("rmId-" + rmId);

  const query = `
    -- Investors
    SELECT 
      ir.id as id,
      ir."name" as name,
      ir.reg_email as email,
      ir.reg_mobile as mobile,
      ir.pan_no as pan,
      ir.dob,
      'investor' as client_type,
      NULL as aadhaar
    FROM "InvestorRegistration" ir 
    WHERE ir.rm_id = :rmId
    AND ir."isDelete" = false
    
    UNION ALL
    
    -- Partners
    SELECT 
      ur.reg_id as id,
      ur.adhaar_name as name,
      ur.email,
      ur.mobile,
      ur.pan,
      ur.adhaar_dob::date as dob,
      'partner' as client_type,
      ur.aadhaar
    FROM user_registrations ur 
    WHERE ur.rm_id = :rmId
    AND ur.is_delete = false
    
    UNION ALL
    
    -- BCs
    SELECT 
      br.reg_id as id,
      br.adhaar_name as name,
      br.email,
      br.mobile,
      br.pan,
      br.adhaar_dob::date as dob,
      'bc' as client_type,
      br.aadhaar
    FROM bc_registrations br 
    WHERE br.rm_id = :rmId
    AND br.is_delete = false
    
    ORDER BY client_type, name;
  `;

  try {
    const results = await db.query(query, {
      replacements: { rmId: rmId },
      type: QueryTypes.SELECT,
    });
    console.log("query-" + query);
    return results as any[];
  } catch (error) {
    console.error(`Error searching by ID ${rmId}:`, error);
    throw error;
  }
};

//ankit can get  all
export const getAllCanRegisterResponse = async (): Promise<any[]> => {
  const query = `
   SELECT 
  crr.id,
  crr.raw_response,
  crr.created_at,
  crr.investor_id,
  crr.can_number,
  crr.pan_no AS response_pan,
  
  -- Joined fields from InvestorRegistration
  ir.name AS investor_name,
  ir.pan_no AS investor_pan

FROM can_register_response crr
LEFT JOIN "InvestorRegistration" ir 
  ON ir.id = crr.investor_id

ORDER BY crr.id DESC
  `;

  try {
    const results = await db.query(query, {
      type: QueryTypes.SELECT,
    });

    return results as any[];
  } catch (error) {
    console.error("Error fetching CAN Register Response:", error);
    throw error;
  }
};


export const filterCanRegisterResponse = async (
  created_at?: string,
  CAN?: string
): Promise<any[]> => {
 let query = `
  SELECT 
    crr.id,
    crr.raw_response,
    crr.created_at,
    crr.investor_id,
    crr.can_number,
    crr.pan_no AS response_pan,
    ir.name AS investor_name,
    ir.pan_no AS investor_pan
  FROM can_register_response crr
  LEFT JOIN "InvestorRegistration" ir
    ON ir.id = crr.investor_id
`;

  let conditions: string[] = [];
  let replacements: any = {};

  // Filter by date
  if (created_at) {
    conditions.push(`created_at::date = :created_at`);
    replacements.created_at = created_at;
  }

  if (CAN) {
    conditions.push(`
      raw_response->'CANIndFillEezzResp'->'RESP_BODY'->>'CAN' = :CAN
    `);
    replacements.CAN = CAN;
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY id DESC";

  try {
    const results = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results as any[];
  } catch (error) {
    console.error("Error filtering CAN responses:", error);
    throw error;
  }
};



// export const partnerCount = async (partnerId: string): Promise<any[]> => {
//   console.log("partnerId-" + partnerId);

//   const query = `
//     SELECT 
//       (
//         SELECT COUNT(*) 
//         FROM "InvestorRegistration" ir 
//         WHERE ir.partner_id = :partnerId
//       ) AS total_investor,

   

//       (
//         SELECT COALESCE(SUM(CAST(rupee_bal AS numeric)), 0)
//         FROM cam_investor_details_wbr9 c
//         INNER JOIN "InvestorRegistration" ir ON ir.pan_no = c.pan_no
//         WHERE ir.partner_id = :partnerId
//       ) AS total_aum,

      
//       -- BC Details
//       (
//         SELECT mobile 
//         FROM user_registrations 
//         WHERE reg_id = :partnerId
//         LIMIT 1
//       ) AS mobile,

//       (
//         SELECT email 
//         FROM user_registrations   
//         WHERE reg_id = :partnerId
//         LIMIT 1
//       ) AS email,

//       (
//         SELECT pan 
//         FROM user_registrations 
//         WHERE reg_id = :partnerId
//         LIMIT 1
//       ) AS pan
//   ;`;

//   try {
//     const results = await db.query(query, {
//       replacements: { partnerId },
//       type: QueryTypes.SELECT,
//     });
//     console.log("query-" + query);
//     return results;
//   } catch (error) {
//     console.error(`Error searching by ID ${partnerId}:`, error);
//     throw error;
//   }
// };






// export const bcCount = async (bcId: string): Promise<any[]> => {
//   console.log("bcId-" + bcId);

//   const query = `SELECT
//   -- total investors
//   (
//     SELECT COUNT(*)
//     FROM "InvestorRegistration" ir
//     WHERE ir.bc_id = :bcId
//   ) AS total_investor,



//  (
//         SELECT COALESCE(SUM(CAST(rupee_bal AS numeric)), 0)
//         FROM cam_investor_details_wbr9 c
//         INNER JOIN "InvestorRegistration" ir ON ir.pan_no = c.pan_no
//         WHERE ir.bc_id = :bcId
//       ) AS total_current_value,

 


//   -- BC Details
//   (
//     SELECT adhaar_name 
//     FROM bc_registrations 
//     WHERE reg_id = :bcId
//     LIMIT 1
//   ) AS name,

//   (
//     SELECT email 
//     FROM bc_registrations 
//     WHERE reg_id = :bcId
//     LIMIT 1
//   ) AS email,

//   (
//     SELECT pan 
//     FROM bc_registrations 
//     WHERE reg_id = :bcId
//     LIMIT 1
//   ) AS pan;

// `;

//   try {
//     const results = await db.query(query, {
//       replacements: { bcId: bcId },
//       type: QueryTypes.SELECT,
//     });
//     console.log("query-" + query);
//     return results as any[];
//   } catch (error) {
//     console.error(`Error searching by ID ${bcId}:`, error);

//     throw error; // this ensures function always throws or returns
//   }
// };


export const partnerCount = async (partnerId: string): Promise<any[]> => {
  console.log("partnerId-" + partnerId);

  const query = `
    SELECT 
      -- Total Investors
      (
        SELECT COUNT(*) 
        FROM "InvestorRegistration" ir 
        WHERE ir.partner_id = :partnerId
      ) AS total_investor,

      -- Total AUM
      (
  COALESCE(
    (
      SELECT SUM(CAST(c.rupee_bal AS numeric))
      FROM cam_investor_details_wbr9 c
      INNER JOIN "InvestorRegistration" ir ON ir.pan_no = c.pan_no
      WHERE ir.partner_id = :partnerId
    ),
    0
  )
  +
  COALESCE(
    (
      SELECT SUM(CAST(k.valinv AS numeric))
      FROM kfintech_client_aum k
      INNER JOIN "InvestorRegistration" ir2 ON ir2.pan_no = k.pan
      WHERE ir2.partner_id = :partnerId
    ),
    0
  )
) AS total_aum
,
      --  Total Transaction (CAMS + KFinTech)
      (
        COALESCE((
          SELECT SUM(cam.amount)
          FROM cam_investor_trxn_wbr2 cam
          WHERE cam.pan IN (
            SELECT pan_no FROM "InvestorRegistration" WHERE partner_id = :partnerId
          )
        ), 0)
        +
        COALESCE((
          SELECT SUM(kf.td_amt)
          FROM kafintech_trxn_report kf
          WHERE kf.pan1 IN (SELECT pan_no FROM "InvestorRegistration" WHERE partner_id = :partnerId)
             OR kf.pan2 IN (SELECT pan_no FROM "InvestorRegistration" WHERE partner_id = :partnerId)
             OR kf.pan3 IN (SELECT pan_no FROM "InvestorRegistration" WHERE partner_id = :partnerId)
        ), 0)
      ) AS total_transaction,

      -- Mobile
      (
        SELECT mobile 
        FROM user_registrations 
        WHERE reg_id = :partnerId
        LIMIT 1
      ) AS mobile,

      -- Email
      (
        SELECT email 
        FROM user_registrations   
        WHERE reg_id = :partnerId
        LIMIT 1
      ) AS email,

      -- Pan
      (
        SELECT pan 
        FROM user_registrations 
        WHERE reg_id = :partnerId
        LIMIT 1
      ) AS pan
  ;`;

  try {
    const results = await db.query(query, {
      replacements: { partnerId },
      type: QueryTypes.SELECT,
    });
    console.log("query-" + query);
    return results;
  } catch (error) {
    console.error(`Error searching by ID ${partnerId}:`, error);
    throw error;
  }
};


export const bcCount = async (bcId: string): Promise<any[]> => {
  console.log("bcId-" + bcId);

  const query = `
    SELECT
      -- Total investors
      (
        SELECT COUNT(*)
        FROM "InvestorRegistration" ir
        WHERE ir.bc_id = :bcId
      ) AS total_investor,

      -- Total Current Value
   (
  COALESCE(
    (
      SELECT SUM(CAST(c.rupee_bal AS numeric))
      FROM cam_investor_details_wbr9 c
      INNER JOIN "InvestorRegistration" ir ON ir.pan_no = c.pan_no
      WHERE ir.bc_id = :bcId
    ),
    0
  )
  +
  COALESCE(
    (
      SELECT SUM(CAST(k.valinv AS numeric))
      FROM kfintech_client_aum k
      INNER JOIN "InvestorRegistration" ir2 ON ir2.pan_no = k.pan
      WHERE ir2.bc_id = :bcId
    ),
    0
  )
) AS total_current_value
,
   -- Total Transaction (CAMS + KFinTech)
(
  COALESCE((
    SELECT SUM(cam.amount)
    FROM cam_investor_trxn_wbr2 cam
    WHERE cam.pan IN (
      SELECT pan_no 
      FROM "InvestorRegistration" 
      WHERE bc_id = :bcId
    )
  ), 0)
  +
  COALESCE((
    SELECT SUM(kf.td_amt)
    FROM kafintech_trxn_report kf
    INNER JOIN "InvestorRegistration" ir
      ON ir.pan_no IN (kf.pan1, kf.pan2, kf.pan3)
    WHERE ir.bc_id = :bcId
  ), 0)
) AS total_transaction,


      -- BC Details
      (
        SELECT adhaar_name 
        FROM bc_registrations
        WHERE reg_id = :bcId
        LIMIT 1
      ) AS name,

      (
        SELECT email 
        FROM bc_registrations
        WHERE reg_id = :bcId
        LIMIT 1
      ) AS email,

      (
        SELECT pan 
        FROM bc_registrations
        WHERE reg_id = :bcId
        LIMIT 1
      ) AS pan;
  `;

  try {
    const results = await db.query(query, {
      replacements: { bcId },
      type: QueryTypes.SELECT,
    });

    return results as any[];
  } catch (error) {
    console.error(`Error searching by ID ${bcId}:`, error);
    throw error;
  }
};



export const partnerList = async (): Promise<any[]> => {
  try {
    const query = `select * from "Users" where "isPartner" is true`;

    const results = await db.query(query, {
      type: QueryTypes.SELECT,
    });

    return results;
  } catch (error) {
    console.error("Error fetching all portfolio data:", error);
    throw error;
  }
};

//code of image upload can

interface CanImageUploadDtl {
  can_number: string;
  cancelled_cheque: string;
}

//rmList --
interface RmListDtl {
  Name: string;
  mobile: string;
  email: string;
  isActive: string;
}

export const getCanRegisDtl = async (): Promise<CanImageUploadDtl[]> => {
  try {
    const query = `select crr.can_number,bad.cancelled_cheque,ir."name",ir.reg_mobile,ir.reg_email from "InvestorRegistration" ir
inner join can_register_response crr on crr.pan_no =ir.pan_no
inner join "BankAccountDetail" bad on bad.investor_id = ir.id
where ir.pan_no ='ADAPA1017B' `;

    const results = await db.query<CanImageUploadDtl>(query, {
      type: QueryTypes.SELECT,
    });

    return results;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getCanImageUploadDtl = async (): Promise<CanImageUploadDtl[]> => {
  try {
    const query = `select crr.can_number, bad.cancelled_cheque from "InvestorRegistration" ir
    inner join can_register_response crr on crr.pan_no = ir.pan_no
    inner join "BankAccountDetail" bad on bad.investor_id = ir.id
    where ir.pan_no = 'ADAPA1017B'`;

    const results = await db.query<CanImageUploadDtl>(query, {
      type: QueryTypes.SELECT,
    });

    if (results.length === 0) {
      console.log("No results found");
      return results;
    }

    // Get values from first result
    const { can_number, cancelled_cheque } = results[0];

    console.log("Cancelled Cheque:", cancelled_cheque);
    console.log("CAN Number:", can_number);

    const filepath = path.join(__dirname, "..", "..", "..", "src");
    const imagePath = path.join(
      filepath,
      "public",
      "chequeDoc",
      cancelled_cheque
    );

    console.log("Directory Name :=", imagePath);
    console.log("Uploading file:", imagePath);

    const result = await APIUploadServerImageService({
      param1: "VEDANTECUAT",
      param2: "NWbbHpz1kHpDjBBCHV8z7A==",
      param3: "40008I",
      param4: "ECAN",
      param5: "AD",
      param6: can_number,
      param8: "1#PC",
      imagePath: imagePath,
    });

    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getAllPartnerList = (query: any) => {

  const { limit, offset, modelOption, orderBy, attributes, forExcel } =
    MakeQuery({
      query: query,
      Model: UserRegistration,
    });

  const userTypeData = query?.user?.userTypeData;

  if (userTypeData) {
    if (userTypeData.RM) {
      modelOption.push({ rm_id: userTypeData.RM.id });
    }
  }

  let customFilter = query.filters ? JSON.parse(query.filters) : query.filters;

  if (customFilter) {
    if (customFilter.adhaarName) {
      const stepFromIndex = modelOption.findIndex((item: any) => {
        return "adhaarName" in item;
      });

      if (stepFromIndex > -1) {
        modelOption.splice(stepFromIndex, 1);
      }

      modelOption.push({
        adhaar_name: { [Op.like]: `%${customFilter.adhaarName}%` },
      });
    }
  }
  if (query.filters && customFilter.is_delete == true) {
    modelOption.push({ is_delete: true });
  } else {
    modelOption.push({ is_delete: false });
  }
  let includeOption: any = [
    {
      model: RMRegistration,
      attributes: ["id", "Name"],
    },
  ];

  if (forExcel) {
    return UserRegistration.findAll({
      where: modelOption,
      attributes,
      include: includeOption,
      order: [["regId", "DESC"]],
      raw: true,
    });
  } else {
    return UserRegistration.findAndCountAll({
      where: modelOption,
      attributes,
      include: includeOption,
      order: [["regId", "DESC"]],
      raw: true,
      limit,
      offset,
    });
  }
};


export const getAllBcList = (query: any) => {

  const { limit, offset, modelOption, orderBy, attributes, forExcel } =
    MakeQuery({
      query: query,
      Model: BcRegistration,
    });

  const userTypeData = query?.user?.userTypeData;

  // if (userTypeData) {
  //   if (userTypeData.RM) {
  //     modelOption.push({ rm_id: userTypeData.RM.id });
  //   }
  // }

  let customFilter = query.filters ? JSON.parse(query.filters) : query.filters;

  if (customFilter) {
    if (customFilter.adhaarName) {
      const stepFromIndex = modelOption.findIndex((item: any) => {
        return "adhaarName" in item;
      });

      if (stepFromIndex > -1) {
        modelOption.splice(stepFromIndex, 1);
      }

      modelOption.push({
        adhaar_name: { [Op.like]: `%${customFilter.adhaarName}%` },
      });
    }
  }
  if (query.filters && customFilter.is_delete == true) {
    modelOption.push({ is_delete: true });
  } else {
    modelOption.push({ is_delete: false });
  }
  // let includeOption: any = [
  //   {
  //     model: RMRegistration,
  //     attributes: ["id", "Name"],
  //   },
  // ];

  if (forExcel) {
    return BcRegistration.findAll({
      where: modelOption,
      attributes,
      // include: includeOption,
      order: [["regId", "DESC"]],
      raw: true,
    });
  } else {
    return BcRegistration.findAndCountAll({
      where: modelOption,
      attributes,
      // include: includeOption,
      order: [["regId", "DESC"]],
      raw: true,
      limit,
      offset,
    });
  }
};


export const updatePartner = (body: any, params: any) => {
  return UserRegistration.update(body, {
    where: { regId: params.id },
  });
};


// ankit canid getting

export const getCanId = async (investor_id: string): Promise<any[]> => {
  console.log("investor_id -" + investor_id);

  const query = `
    SELECT "CAN_Id"
    FROM public."InvestorAccountHolding"
    WHERE investor_id = :investor_id
    ORDER BY id DESC
    LIMIT 1;
  `;

  try {
    const results = await db.query(query, {
      replacements: { investor_id },
      type: QueryTypes.SELECT,
    });

    console.log("query -" + query);
    return results as any[];
  } catch (error) {
    console.error(`Error fetching CAN_Id for investor_id ${investor_id}:`, error);
    throw error;
  }
};

export const getAumRecordDtl = async (pan: string): Promise<any[]> => {
  console.log("pan-" + pan);

  const query = `SELECT * FROM get_investor_details(:pan);`;

  try {
    const results = await db.query(query, {
      replacements: { pan: pan },
      type: QueryTypes.SELECT,
    });
    console.log("query-" + query);
    return results as any[];
  } catch (error) {
    console.error(`Error searching by ID ${pan}:`, error);

    throw error; // this ensures function always throws or returns
  }
};

export const portfolioSearchs = async (pan: string, rpt_date?: string) => {
  try {
    console.log("pan -", pan);

    // Decide the date to use
    const finalDate = rpt_date?.trim()
      ? rpt_date
      : format(new Date(), "yyyy-MM-dd");

    console.log("Using rpt_date:", finalDate);

    const query = `SELECT * FROM public.fn_portfolio_valuation(:pan, :rpt_date)`;

    const result = await db.query(query, {
      replacements: {
        pan,
        rpt_date: finalDate,
      },
      type: QueryTypes.SELECT,
    });

    return result;
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return [];
  }
};

// ankit 25-11-2025
export const portfolioSearches = async (pan: string, rpt_date?: string) => {
  try {
    console.log("pan -", pan);

    const finalDate = rpt_date?.trim()
      ? rpt_date
      : format(new Date(), "yyyy-MM-dd");

    console.log("Using rpt_date:", finalDate);

    const query = `SELECT * FROM public.fn_investor_portfolio_summary(:pan, :rpt_date)`;

    const result = await db.query(query, {
      replacements: {
        pan,
        rpt_date: finalDate,
      },
      type: QueryTypes.SELECT,
    });

    return result;
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return [];
  }
};


export const portfolioXirr = async (pan: any, rpt_date: any) => {
  try {
    console.log("XIRR Function - PAN:", pan);

    const finalDate = rpt_date?.trim()
      ? rpt_date
      : format(new Date(), "yyyy-MM-dd");

    console.log("Using rpt_date:", finalDate);

    const query = `SELECT * FROM public.fn_xirr_all_funds(:pan, :rpt_date)`;

    const result = await db.query(query, {
      replacements: {
        pan,
        rpt_date: finalDate,
      },
      type: QueryTypes.SELECT,
    });

    return result;
  } catch (error) {
    console.error("Error fetching XIRR data:", error);
    return [];
  }
};

export const getrmList = async (): Promise<RmListDtl[]> => {
  try {
    const query = ` select r."Name" ,r.email,r.mobile,r."isActive"  from "RMRegistration" r`;

    const results = await db.query<RmListDtl>(query, {
      type: QueryTypes.SELECT,
    });

    return results;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getUserTypeBirthdayDtl = async (
  userTypeId: string
): Promise<any[]> => {
  console.log("userTypeId - " + userTypeId);

  let query = "";
  let replacements: any = {};
  console.log("----------------------------------------------------");
  query = `select DISTINCT ir."name",ir.dob,ir.reg_email,ir.reg_mobile from "Users" u 
inner join "InvestorRegistration" ir on ir.user_id =u.id
where u."userTypeId" =:userTypeId`;
  replacements = { userTypeId: userTypeId };

  try {
    const results = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results as any[];
  } catch (error) {
    console.error(`Error showing details`, error);
    throw error;
  }
};
export const getInvestorPortfolioDtl = async (
  userTypeId: string,
  userId: string | null
): Promise<any[]> => {
  console.log("userTypeId - " + userTypeId, "userId - " + userId);

  let query = "";
  let replacements: any = { userTypeId };


  replacements.userId = userId ?? null;

  query = `SELECT * FROM fn_get_investor_portfolio(:userTypeId, :userId);`;

  try {
    const results = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results as any[];
  } catch (error) {
    console.error(`Error showing details`, error);
    throw error;
  }
};

export const getAcctHoldingPortfolioDtl = async (
  inv_id: string
): Promise<any[]> => {
  console.log("inv_id - " + inv_id);

  let query = "";
  let replacements: any = {};
  console.log("----------------------------------------------------");
  query = `SELECT 
            ir2.pan_no::TEXT AS holder_pan,
            ir2."name"::TEXT AS holder_name
        FROM "InvestorAccountHolding" iah
        INNER JOIN "InvestorRegistration" ir2 
            ON ir2.id = iah.first_investor_id
        WHERE iah.investor_id = :inv_id
          AND iah."CAN_Id" IS NOT NULL`;
  replacements = { inv_id: inv_id };

  try {
    const results = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results as any[];
  } catch (error) {
    console.error(`Error showing details`, error);
    throw error;
  }
};

export const fnGetPartnerCurrentStatus = async (
  mobile_no: string
): Promise<any[]> => {
  console.log("mobile_no - " + mobile_no);

  const query = `SELECT * FROM fn_get_partner_current_status(:mobile_no);`;
  const replacements = { mobile_no };

  try {
    const results = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results as any[];
  } catch (error) {
    console.error(`Error showing details`, error);
    throw error;
  }
};

export const getPartnerStatus = async (mobile: string, userType: number) => {
  try {
    console.log(
      `Checking partner status for mobile: ${mobile}, userType: ${userType}`
    );

    // Find if user already exists
    const existingUser = await Users.findOne({
      where: { mobile }, // mobile stored as string in DB
    });

    if (existingUser) {
      return {
        success: false,
        message: "Partner is already created with this mobile number",
        data: { existingUser },
      };
    }

    // No user found, so return success
    return {
      success: true,
      message: "Mobile is available. No partner exists with this number.",
      data: null,
    };
  } catch (error: any) {
    console.error("Error in getPartnerStatus:", error);
    return {
      success: false,
      message: error.message || "Something went wrong",
    };
  }
};

export const getInvestmentLedgerData = async (
  pan: string,
  rpt_type: string,
  from_date: string,
  to_date: string
) => {
  try {
    console.log("pan -", pan);
    console.log("from_date -", from_date);
    console.log("to_date -", to_date);

    const query = `select * from public.fn_investment_ledger(:pan,:rpt_type,:from_date,:to_date);`;

    const result = await db.query(query, {
      replacements: {
        pan,
        rpt_type: rpt_type,
        from_date: from_date,
        to_date: to_date,
      },
      type: QueryTypes.SELECT,
    });

    return result;
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return [];
  }
};



export const getInvestmentLedgerDatas = async (
  pan: string,
  rpt_type: string,
  from_date: string,
  to_date: string
) => {
  try {
    console.log("pan -", pan);
    console.log("from_date -", from_date);
    console.log("to_date -", to_date);

    const query = `select * from public.fn_investment_ledgers(:pan,:rpt_type,:from_date,:to_date);`;

    const result = await db.query(query, {
      replacements: {
        pan,
        rpt_type: rpt_type,
        from_date: from_date,
        to_date: to_date,
      },
      type: QueryTypes.SELECT,
    });

    return result;
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return [];
  }
};

export const getTaxationSummaryData = async (pan: string, rpt_type: string, from_date: string, to_date: string) => {
  try {
    console.log("pan -", pan);
    console.log("from_date -", from_date);
    console.log("to_date -", to_date);



    const query = `select * from public.fn_capital_gain_realized(:pan,:from_date,:to_date,:rpt_type);`;

    const result = await db.query(query, {
      replacements: {
        pan,
        from_date: from_date,
        to_date: to_date,
        rpt_type: rpt_type,
      },
      type: QueryTypes.SELECT,
    });

    return result;
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return [];
  }
};
// export const getRmListDtl = async (query: any) => {
//   try {
//     console.log("Received query:", JSON.stringify(query));

//     // If you want, you can add dynamic filters from query
//     //const limit = query.limit || 3;

//     const sqlQuery = `
//       SELECT 
//         r."Name" AS name, 
//         r.email, 
//         r.mobile,
//         '' AS pan,
//         'RM' AS rm,
//         'true' AS status
//       FROM "RMRegistration" r

//       ;
//     `;

//     const result = await db.query(sqlQuery, {
//       type: QueryTypes.SELECT,
//       //replacements: { limit },
//     });

//     return result;
//   } catch (error) {
//     console.error("Error fetching RM data:", error);
//     throw error; // Let the router handle logging and response
//   }
// };

interface InvestorResult {
  pan_no: string;
  name: string;
  reg_email: string;
  reg_mobile: string;
  account_no: string;
  ifsc: string;
}


export const getTaxationSummaryData1 = async (pan: string, date: string) => {
  try {
    console.log("pan -", pan);
    console.log("date -", date);




    const query = `select * from public.fn_capital_gain_unrealized(:pan,:date);`;

    const result = await db.query(query, {
      replacements: {
        pan,
        date: date,

      },
      type: QueryTypes.SELECT,
    });

    return result;
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return [];
  }
};


export const getRmListDtl = async (query: any) => {
  try {
    console.log("Received query:", JSON.stringify(query));

    const sqlQuery = `
      SELECT 
        r."Name" AS name, 
        r.email, 
        r.mobile,
        '' AS pan,
        'RM' AS rm,
        'true' AS status
      FROM "RMRegistration" r
      INNER JOIN "Users" u ON u.mobile::text = r.mobile
      ;
    `;

    const result = await db.query(sqlQuery, {
      type: QueryTypes.SELECT,

    });

    return result;
  } catch (error) {
    console.error("Error fetching RM data:", error);
    throw error; // Let the router handle logging and response
  }
};


interface InvestorResult {
  pan_no: string;
  name: string;
  reg_email: string;
  reg_mobile: string;
  account_no: string;
  ifsc: string;
}

// services/userService.ts
export const convertInvToPartner = async (userId: number) => {
  try {
    // Step 1: Fetch investor details
    const sqlQuery = `
      SELECT 
          ir.pan_no,
          ir.name,
          ir.reg_email,
          ir.reg_mobile,
          bad.account_no,
          bad.ifsc
      FROM "InvestorRegistration" ir
      INNER JOIN "BankAccountDetail" bad 
          ON bad.investor_id = ir.id
      WHERE ir.user_id = :userId
      LIMIT 1;
    `;

    const [investor] = await db.query<InvestorResult>(sqlQuery, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });


    if (!investor) {
      return {
        success: false,
        msg: "No investor data found for this user",
        data: null,
      };
    }

    // Step 2: Check if user already exists
    const existingUser = await UserRegistration.findOne({
      where: { mobile: investor.reg_mobile },
    });

    if (existingUser) {
      return {
        success: false,
        msg: `User with mobile ${investor.reg_mobile} already exists in UserRegistration`,
        data: null,
      };
    }

    // Step 3: Create user registration
    const createdReg = await UserRegistration.create({
      pan: investor.pan_no,
      adhaarName: investor.name,
      email: investor.reg_email,
      mobile: investor.reg_mobile,
      bankAcNo: investor.account_no,
      bankAcIfsc: investor.ifsc,
      userId: userId,
      userCreatedAt: new Date(),
      userType: 4,
      is_delete: false,
    });

    // Step 4: Create user mapping
    const userMapping = await UserMapping.create({
      user_id: userId,
      role_id: 4,
      userType_id: 4,
      ref_id: createdReg.regId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      msg: "User Registration created successfully",
      data: { createdReg, userMapping },
    };
  } catch (error: any) {
    ErrorLogger.write({ type: "convertInvToPartner error :- ", error });
    return {
      success: false,
      msg: error.message || "Something went wrong while creating partner",
      data: null,
    };
  }
};

export const convertInvToBc = async (userId: number) => {
  try {
    // Step 1: Fetch investor details
    const sqlQuery = `
      SELECT 
          ir.pan_no,
          ir.name,
          ir.reg_email,
          ir.reg_mobile,
          bad.account_no,
          bad.ifsc
      FROM "InvestorRegistration" ir
      INNER JOIN "BankAccountDetail" bad 
          ON bad.investor_id = ir.id
      WHERE ir.user_id = :userId
      LIMIT 1;
    `;

    const [investor] = await db.query<InvestorResult>(sqlQuery, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });


    if (!investor) {
      return {
        success: false,
        msg: "No investor data found for this user",
        data: null,
      };
    }

    // Step 2: Check if user already exists
    const existingUser = await BcRegistration.findOne({
      where: { mobile: investor.reg_mobile },
    });

    if (existingUser) {
      return {
        success: false,
        msg: `User with mobile ${investor.reg_mobile} already exists in BcRegistration`,
        data: null,
      };
    }

    // Step 3: Create user registration
    const createdReg = await BcRegistration.create({
      pan: investor.pan_no,
      adhaarName: investor.name,
      email: investor.reg_email,
      mobile: investor.reg_mobile,
      bankAcNo: investor.account_no,
      bankAcIfsc: investor.ifsc,
      userId: userId,
      userCreatedAt: new Date(),
      userType: 6,
      is_delete: false,
    });

    // Step 4: Create user mapping
    const userMapping = await UserMapping.create({
      user_id: userId,
      role_id: 6,
      userType_id: 6,
      ref_id: createdReg.regId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      msg: "User Registration created successfully",
      data: { createdReg, userMapping },
    };
  } catch (error: any) {
    ErrorLogger.write({ type: "convertInvToBc error :- ", error });
    return {
      success: false,
      msg: error.message || "Something went wrong while creating bc",
      data: null,
    };
  }
};


//sunil
export const getSipCalendar = async (
  in_role: string,
  in_user_id: string,
  in_ason_date: string
): Promise<any[]> => {
  const query = `
    SELECT * FROM public.fn_sip_calander(
      :in_role,
      CAST(:in_user_id AS numeric),
      CAST(:in_ason_date AS date)
    );
  `;

  const replacements = {
    in_role,
    in_user_id,
    in_ason_date,
  };

  try {
    const results = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    console.log("Executed query:", query, replacements);

    return results as any[];
  } catch (error) {
    console.error(`Error fetching SIP Calendar:`, error);
    throw error;
  }
};

export const getAumReport = async (
  fromDate: string,
  toDate: string,
  pan: string | null
): Promise<any[]> => {
  const query = `
    SELECT * FROM public.fn_aum_report(
      CAST(:fromDate AS date),
      CAST(:toDate AS date),
      :pan
    );
  `;

  const replacements = {
    fromDate,
    toDate,
    pan,
  };

  try {
    const results = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    console.log("Executed query:", query, replacements);

    return results as any[];
  } catch (error) {
    console.error(`Error fetching AUM Report:`, error);
    throw error;
  }
};


//ankit
export const getUserPanList = async (in_type: string): Promise<any[]> => {
  const query = `
    SELECT * FROM fn_user_pan_list(:in_type);
  `;

  try {
    const results = await db.query(query, {
      replacements: { in_type },
      type: QueryTypes.SELECT,
    });

    console.log("Executed query:", query, { in_type });

    return results as any[];
  } catch (error) {
    console.error(`Error fetching User PAN List:`, error);
    throw error;
  }
};


//ankit brokerage report
export const getBrokerageReport = async (
  in_group: string,
  in_category: string,
  in_fund: string,
  in_brokerage_type: string,
  in_from_date: string,
  in_to_date: string
): Promise<any[]> => {
  const query = `
    SELECT * FROM public.fn_brokerage_report(
      :in_group,
      :in_category,
      :in_fund,
      :in_brokerage_type,
      CAST(:in_from_date AS date),
      CAST(:in_to_date AS date)
    );
  `;

  const replacements = {
    in_group,
    in_category,
    in_fund,
    in_brokerage_type,
    in_from_date,
    in_to_date,
  };

  try {
    const results = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    console.log("Executed fn_brokerage_report:", replacements);

    return results;
  } catch (error) {
    console.error(`Error fetching Brokerage Report:`, error);
    throw error;
  }
};


export const getPartnerDtlWithMobile = async (mobile: string): Promise<any[]> => {

  const query = `
    select ur.aadhaar ,ur.pan ,ur.email ,ur.bank_ac_no  from user_registrations ur where UR.mobile =:mobile;
  `;

  try {
    const results = await db.query(query, {
      replacements: { mobile },
      type: QueryTypes.SELECT,
    });

    console.log("Executed query:", query, { mobile });

    return results as any[];
  } catch (error) {
    console.error(`Error fetching User PAN List:`, error);
    throw error;
  }
};



export const getDecentroLog = async (
  mobile_no: string
): Promise<any[]> => {
  console.log("mobile_no - " + mobile_no);

  const query = `select d.response_data from "DecentroLogs" d where d.mobile_no=:mobile_no;`;
  const replacements = { mobile_no };

  try {
    const results = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results as any[];
  } catch (error) {
    console.error(`Error showing details`, error);
    throw error;
  }
};



export const getCanCount = async (
  investor_id: string
): Promise<any[]> => {
  console.log("investor_id - " + investor_id);

  const query = `select count(*) from "InvestorAccountHolding" iah where iah.investor_id =:investor_id `;
  const replacements = { investor_id };

  try {
    const results = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results as any[];
  } catch (error) {
    console.error(`Error showing details`, error);
    throw error;
  }
};



export const getPartnerVerificationAllStatus = async (
  mobile_no: string
): Promise<any[]> => {
  console.log("mobile_no - " + mobile_no);

  const query = `select br.aadhaar_verified,br.bank_ac_no_verified,br.pan_verified,br.email_verified 
from bc_registrations br
where br.mobile =:mobile_no order by br.reg_id desc limit 1`;
  const replacements = { mobile_no };

  try {
    const results = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results as any[];
  } catch (error) {
    console.error(`Error showing details`, error);
    throw error;
  }
};


export const getBcCreatedStatus = async (
  mobile_no: string
): Promise<any[]> => {
  console.log("mobile_no - " + mobile_no);

  const query = `select br.user_created from bc_registrations br where br.mobile =:mobile_no order by br.reg_id desc limit 1`;
  const replacements = { mobile_no };

  try {
    const results = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results;
  } catch (error) {
    console.error(`Error showing details`, error);
    throw error;
  }
};

export const getPartnerCreatedStatus = async (
  mobile_no: string
): Promise<{ isUserCreated: number; missingFields: string[] }> => {
// AND email IS NOT NULL AND email <> ''
// CASE WHEN email IS NULL OR email = '' THEN 'email' END,
  const query = `
    SELECT
      CASE
        WHEN
          mobile IS NOT NULL AND mobile <> ''
          AND aadhaar IS NOT NULL AND aadhaar <> ''
          AND pan IS NOT NULL AND pan <> ''
          AND bank_ac_no IS NOT NULL AND bank_ac_no <> ''
          AND bank_ac_ifsc IS NOT NULL AND bank_ac_ifsc <> ''
        THEN 1
        ELSE 0
      END AS is_user_created,

      ARRAY_REMOVE(ARRAY[
        CASE WHEN mobile IS NULL OR mobile = '' THEN 'mobile' END,
        CASE WHEN aadhaar IS NULL OR aadhaar = '' THEN 'aadhaar' END,
        CASE WHEN pan IS NULL OR pan = '' THEN 'pan' END,
        CASE
          WHEN bank_ac_no IS NULL OR bank_ac_no = ''
            OR bank_ac_ifsc IS NULL OR bank_ac_ifsc = ''
          THEN 'bank'
        END
      ], NULL) AS missing_fields
    FROM user_registrations
    WHERE mobile = :mobile_no
    LIMIT 1;
  `;

  try {
    const result: any[] = await db.query(query, {
      replacements: { mobile_no },
      type: QueryTypes.SELECT,
    });

    if (!result.length) {
      return {
        isUserCreated: 0,
        missingFields: ['user_not_found'],
      };
    }

    return {
      isUserCreated: Number(result[0].is_user_created),
      missingFields: result[0].missing_fields || [],
    };

  } catch (error) {
    console.error("Error checking partner created status", error);
    throw error;
  }
};



export const getBcCreatedStatuswithmissingfield = async (
  mobile_no: string
): Promise<{ isUserCreated: number; missingFields: string[] }> => {

  const query = `
    SELECT
      CASE
        WHEN
          mobile IS NOT NULL AND mobile <> ''
          AND aadhaar IS NOT NULL AND aadhaar <> ''
          AND pan IS NOT NULL AND pan <> ''
          AND bank_ac_no IS NOT NULL AND bank_ac_no <> ''
          AND bank_ac_ifsc IS NOT NULL AND bank_ac_ifsc <> ''
        THEN 1
        ELSE 0
      END AS is_user_created,

      ARRAY_REMOVE(ARRAY[
        CASE WHEN mobile IS NULL OR mobile = '' THEN 'mobile' END,
        CASE WHEN aadhaar IS NULL OR aadhaar = '' THEN 'aadhaar' END,
        CASE WHEN pan IS NULL OR pan = '' THEN 'pan' END,
        CASE
          WHEN bank_ac_no IS NULL OR bank_ac_no = ''
            OR bank_ac_ifsc IS NULL OR bank_ac_ifsc = ''
          THEN 'bank'
        END
      ], NULL) AS missing_fields
     FROM bc_registrations
    WHERE mobile = :mobile_no
    LIMIT 1;
  `;

  try {
    const result: any[] = await db.query(query, {
      replacements: { mobile_no },
      type: QueryTypes.SELECT,
    });

    if (!result.length) {
      return {
        isUserCreated: 0,
        missingFields: ['user_not_found'],
      };
    }

    return {
      isUserCreated: Number(result[0].is_user_created),
      missingFields: result[0].missing_fields || [],
    };

  } catch (error) {
    console.error("Error checking partner created status", error);
    throw error;
  }
};
