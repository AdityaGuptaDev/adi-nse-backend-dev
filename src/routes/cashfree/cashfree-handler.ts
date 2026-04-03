import { Sequelize } from "sequelize/types";
const { MakeQuery } = require("../../services/model-service");
import { Users } from "../../db/core/init-control-db";
import bcrypt from "bcryptjs";

import {
  verifyAadhaarOtp,
  verifyBank,
  sendAadhaarOtp,
  verifyPanLite
} from "../../services/cashfree.service"

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

export const aadhaarVerificationWihtoutMobile = async (aadhaar: string) => {
  const aadhaarResponse = await sendAadhaarOtp(aadhaar);
  return aadhaarResponse;
};

export const aadhaarOtpVerificationWithOutMobile = async (
  aadhaar: string,
  otp: string,
  ref_id: string
) => {
  // Verify Aadhaar OTP with external service
  const aadhaarResponse = await verifyAadhaarOtp(otp, ref_id);


  // Return consistent result
  return aadhaarResponse;
};

export const panVerificationLiteWithOutMobile = async (pan: string, name: string, dob: string) => {
  const mobile = "7555";

  const uniqueId = generateUniqueId(mobile, pan);
   // Example output: "9812341698765432100"


  // Call PAN verification service

  const panResponse = await verifyPanLite(uniqueId, pan, name, dob);


  // Return consistent result
  return panResponse;
};

// Helper function to generate unique ID
const generateUniqueId = (mobile: string, pan: string): string => {
  // Get first 2 digits of mobile
  const mobileDigits = String(mobile).substring(0, 2);

  // Get last 4 digits of PAN (remove spaces and make uppercase)
  const cleanedPan = String(pan).replace(/\s+/g, '').toUpperCase();
  const panDigits = cleanedPan.substring(cleanedPan.length - 4);

  // Generate a unique number (timestamp + random 4 digits)
  const uniqueNumber = Date.now() + Math.floor(Math.random() * 10000);

  return `${mobileDigits}${panDigits}${uniqueNumber}`;
};

// export const bankAccountNoVerificationWithoutMobile = async (
//   mobile: string,
//   bankAcNo: string,
//   bankAcIfsc: string,
//   bankAcNameInBank: string
// ) => {

//   const bankVerificationResponse = await verifyBank(
//     bankAcNo,
//     bankAcIfsc,
//     bankAcNameInBank,
//     mobile
//   );

//   // Return consistent result
//   return bankVerificationResponse;
// };


export const bankAccountNoVerificationWithoutMobile = async (
  
  bankAcNo: string,
  bankAcIfsc: string,

) => {

  const bankVerificationResponse = await verifyBank(
    bankAcNo,
    bankAcIfsc,
 

  );

  // Return consistent result
  return bankVerificationResponse;
};
