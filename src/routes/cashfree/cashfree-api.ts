import express from "express";
import {
  aadhaarVerificationWihtoutMobile,
  aadhaarOtpVerificationWithOutMobile,
  panVerificationLiteWithOutMobile,
  bankAccountNoVerificationWithoutMobile,
} from "./cashfree-handler";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import prosesjwt from "proses-jwt";
import { other, serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
let { tokenMiddleWare } = prosesjwt;

const router = express.Router();

//adhaar verification without mobile parameter-
router.post("/initiate-aadhaar-verification", tokenMiddleWare, async (req, res) => {
  try {
    const { aadhaar } = req.body;
    if (!aadhaar) {
      throw other(res, 'Aadhaar are required')
    }

    const response = await aadhaarVerificationWihtoutMobile(aadhaar);

    sendEncryptedResponse(res, response, "Aadhaar OTP request initiated successfully.");
  } catch (error) {
    if (error instanceof Error) {
      other(res, error.message)
    } else {
      ErrorLogger.write({ type: "initiate-aadhaar-verification", error });
      serverError(res, error);
    }


  }
});

//otb verirification without mobile-
router.post("/aadhaar-otp-verification", tokenMiddleWare, async (req, res) => {
  try {
    const { aadhaar, otp, ref_id } = req.body;

    console.log("==============================================================", req.body)

    // Validate required fields
    if (!aadhaar || !otp || !ref_id) {
      throw other(res, 'Aadhaar, OTP and ref_id are all required')

    }

    // Call service function
    const adhaarResp = await aadhaarOtpVerificationWithOutMobile(aadhaar, otp, ref_id);

    // Send success response
    sendEncryptedResponse(res, adhaarResp, "Aadhaar Verified successfully");

  } catch (error) {
    if (error instanceof Error) {
      other(res, error.message)
    } else {
      ErrorLogger.write({ type: "aadhaar-otp-verification", error });
      serverError(res, error);
    }
  }
});

//PAN verification lite without mobile-
router.post("/initiate-pan-verification", tokenMiddleWare, async (req, res) => {
  try {
    const { pan, name, dob } = req.body;
    // Validate required fields
    if (!pan || !name || !dob) {
      return res.status(400).json({
        status: "F",
        remark: "PAN, and Name,DOB are required",
      });
    }

    // Call service function
    const panResponse = await panVerificationLiteWithOutMobile(pan, name, dob);


    sendEncryptedResponse(res, panResponse, "PAN Verified successfully");

  } catch (error) {
    if (error instanceof Error) {
      other(res, error.message)
    } else {
      ErrorLogger.write({ type: "aadhaar-otp-verification", error });
      serverError(res, error);
    }
  }
});

//Bank verification process without mobile-
// router.post("/initiate-bank-account-verification", tokenMiddleWare, async (req, res) => {
//   try {
//     const { mobile, bankAcNo, bankAcIfsc, bankAcNameInBank } = req.body;

//     // Validate required fields
//     if (!mobile || !bankAcNo || !bankAcIfsc || !bankAcNameInBank) {
//       throw other(res, 'Mobile, Bank Account Number, IFSC, and Name in Bank are required')
//     }

//     // Call service function
//     const bankResponse = await bankAccountNoVerificationWithoutMobile(
//       mobile,
//       bankAcNo,
//       bankAcIfsc,
//       bankAcNameInBank
//     );
//     sendEncryptedResponse(res, bankResponse, "Bank Account Number verified successfully");

//   } catch (error) {
//     if (error instanceof Error) {
//       other(res, error.message)
//     } else {
//       ErrorLogger.write({ type: "initiate-bank-account-verification", error });
//       serverError(res, error);
//     }
//   }
// });

// changes by ankit
router.post("/initiate-bank-account-verification",  tokenMiddleWare,async (req, res) => {
  try {
    const { bankAcNo, bankAcIfsc} = req.body;

    // Validate required fields
    if ( !bankAcNo || !bankAcIfsc ) {
      throw other(res, 'Mobile, Bank Account Number, IFSC, and Name in Bank are required')
    }

    // Call service function
    const bankResponse = await bankAccountNoVerificationWithoutMobile(
    
      bankAcNo,
      bankAcIfsc
    
    );
    sendEncryptedResponse(res, bankResponse, "Bank Account Number verified successfully");

  } catch (error) {
    if (error instanceof Error) {
      other(res, error.message)
    } else {
      ErrorLogger.write({ type: "initiate-bank-account-verification", error });
      serverError(res, error);
    }
  }
});

module.exports = router;
