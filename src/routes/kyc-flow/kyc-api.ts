import axios from "axios";
import bcrypt from "bcryptjs";
import express from "express";
import fs, { promises as fsPromises } from "fs";
import path from "path";
import prosesjwt from "proses-jwt";
import { notFound, other, serverError } from "proses-response";
import configs from "../../config/config";
import dbInstance from "../../db/core/control-db";
import ErrorLogger from "../../db/core/logger/error-logger";
import environment from "../../environment";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import { getKycStatusFromCVLKra } from "../../services/kyc-status-service";
import { sendEmail } from "../../services/mailService";
import { CancelCheque, PANUploder, Photo, RelationshipProof, UploderFrontAddress, Video } from "../../services/multer";
import { generateRandomNumber, generateRandomOTP } from "../../services/password-service";
import { BankAccountPennyTransfer, CancelledChequeExecute, CreatePDFURL, execute_verification_engine, executeCorrespondencePOA, executePOA, executePOI, executePOIFromDigiLocker, Genearte_Aadhar, getDetailsPOAFromDigiLocker, getDetailsPOIFromDigiLocker, investorLogin, investorOnboarding, loginChannel, save_aaddher_PDF, save_signed_PDF, UpdateCorrespondencePOA, UpdateCorrespondencePOASameAsPermanent, UpdateFatcaForm, UpdateFormCallFORMSSection, UpdateFormCancelledCheque, UpdateFormPhoto, UpdateFormSignature, UpdatePOA, updatePOI, updatePOIFormDigiLocker, uploadFile, VideoStart, VideoVerification } from "../../services/signzy-service";
import { SmsService } from "../../services/sms.service";
import { ACCOUNT_TYPE, DEFAULT_SIGNZY_PLATFORM, DIGILOCKER_TYPE, MEMBER_TYPE, ROLE, USER_TYPE } from "../../utils/constant";
import { convertDateDdMmYyyy, sanitizePayload } from "../../utils/helper";
import { AddressType } from "../address_type/address_type_model";
import { findCountrybyName } from "../country_master/country-handler";
import { StateMaster } from "../state_master/state_master-model";
import { addUser, createUserMapping, findUserByEmailOrMobile, getUserByEmail, getUserByMobile } from "../user/user-handler";
import { AddressDetail } from "./address-detail-model";
import { AnnuaIincomeMaster } from "./annual-income-master-model";
import { IncomeSource } from "./incomeSource-model";
import { addEmailInOtpDetail, addUserInvestorData, CheckPinCodeData, createAddressDetail, createBankDetails, createInvestorDeclaration, createNomineesDetails, createPersonalDetails, deleteNomineesDetails, destroyBankAcccountDetails, findCountry, findOtpDetail, findInvestorRegistrationByPanNo, findMobileInOtpDetail, findState, findUserDataById, getAddressDetail, getAllBank, getAllBankProof, getAllGender, getAllIdentityTypes, getAllMaritalStatus, getAllMobileRelation, getAllNomineeGuardianRelationshipTypes, getAllRelationshipPrimaryHolder, getAllRelationshipProof, getAllRelationshipTypes, getAllTaxStatus, getBankDetails, getInvestorDeclaration, getNomineeDetails, getPersonalDetails, getUserDataForNomineeForm, getUserSummary, updateAddressDetail, updateEmailInOtpDetail, updateInvestorDeclaration, updateInvestorRegistration, updateOtpDetail, updatePersonalByInvestorDetails, getInvBankUpdate, gteCanDetailsInvestor, updateNomineesDetails, completeRegistration, saveAdditionalKycDetails, saveFatcaDetails, updateHolderDetails, saveBankAccountDetails, saveNomineeDetails, getCanSummary, getHolderDetails } from "./kyc-handler";
import { address_updatePOA, address_updateSignZy, bank_update, bank_updateSignZy, declaration_validation, kyc_personal_updatePOI, kyc_personal_updateSignZy, nominee_update, v_pan } from "./kyc-validation";
import { OccupationMaster } from "./occupation-model";
import { TaxStatus } from "./tax-status-model";
import { MFUCanFillEezzService, MFUCanModificationService, prepareCanModificationPayload, prepareDirectCanModificationPayload, prepareNomineeCanModificationPayload } from "../../services/mfu.service";
import { prepareCanPayloadFromInvestor } from "../mfu/prepareCanPayloadFromInvestor";
import { preparePayload } from "../mfu/preparePayload";
import { generateEncryptedLinkWithExpiry, decryptAndValidateToken } from "../../services/encryptDecrypt-service";
import { addHolidingAccount } from "../../services/investor.service";
import { BankAccountDetailHistory } from "./bank-account-detail-model-history";
import { BankAccountDetail } from "./bank-account-detail-model";
import { CANModificationLogs, CountryMaster, InvestorAccountHolding, InvestorBasicDetails, InvestorDeclaration, InvestorRegistration, NomineeDetail, NomineeGuardianRelationship, NomineeIdentity, NominineeRelationshipType } from "../../db/core/init-control-db";
import { bcEmailOtpVerification } from "../partner/partner-handler";
import { kycRateLimit } from "../../middlewares/rateLimit";

let { tokenMiddleWare } = prosesjwt;
const router = express.Router();
const config = (configs as { [key: string]: any })[environment];

// Utility function to download file from URL and save to public folder
const downloadAndSaveFile = async (fileUrl: string, fileName: string, folderPath: string = 'esigned-documents') => {
  try {
    // Create the full directory path using config
    const publicPath = path.join(process.cwd(), config.publicPath, folderPath);

    // Ensure directory exists
    if (!fs.existsSync(publicPath)) {
      await fsPromises.mkdir(publicPath, { recursive: true });
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = path.extname(fileName) || '.pdf';
    const uniqueFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}${fileExtension}`;
    const filePath = path.join(publicPath, uniqueFileName);

    // Download file from URL
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream'
    }) as any;

    // Save file to disk
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        const publicUrl = `/static/${folderPath}/${uniqueFileName}`;
        resolve({
          success: true,
          fileName: uniqueFileName,
          filePath: filePath,
          publicUrl: publicUrl
        });
      });
      writer.on('error', reject);
    });

  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};




const invalidStatusCodes = new Set(["002", "102", "202", "302", "402", "012", "112", "212", "312", "412"]);
// const validStatusCodes200 = new Set(["002", "102", "202", "302", "402", "007", "107", "207", "307", "407"]);
const validStatusCodes200 = new Set(["007", "107", "207", "307", "407", "507"]);

const isValidStatus = (status: string): boolean => {
  return validStatusCodes200.has(status) ? true : false;
};

const handleDate = (dateStr: string) => {
  const [dd, mm, yyyy] = dateStr.split("/");
  return new Date(`${yyyy}-${mm}-${dd}`);
};



router.post("/checkPANStatus", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  let t = await dbInstance.transaction();
  try {

    const body: any = v_pan.parse(req.body);

    const panNumberregex = /[A-z]{5}[0-9]{4}[A-z]{1}$/;
    if (!panNumberregex.test(body.pan_no.replace(/\s/g, ""))) {
      throw other(res, "Not a Valid PAN Number");
    }

    let kycStatus = false;
    let User_kycName: any;

    if (body.taxStatus !== "Minor") {
      const find = await findInvestorRegistrationByPanNo(body.pan_no);
      if (find) {
        throw other(res, "PAN already exists, Please Enter other PAN");
      }

    }

    const [code, result] = await getKycStatusFromCVLKra(body.pan_no);
    // const [code, result] = await getCheckKYCPanStatus(body);


    if (code == 400) {
      throw other(res, result?.decryptedData?.error_message)
    }

    // let resString = JSON.parse(result?.decryptedData?.resdtls);
    let resString: any;
    try {
      resString = JSON.parse(result?.decryptedData?.resdtls);
    } catch (error) {
      console.log(error, "error in parsing resdtls");
      throw other(res, 'Invalid response from CVL KRA');
    }
    console.log(resString, "resString");

    const appStatus = resString?.APP_PAN_INQ?.APP_STATUS?.toString();
    const appName = resString?.APP_PAN_INQ?.APP_NAME;

    if (!appStatus) {
      throw other(res, 'Invalid PAN Number');
    }

    if (isValidStatus(appStatus)) {
      kycStatus = true;
      User_kycName = appName;
    } else {
      kycStatus = false;
      User_kycName = appName;

    }
    const payload = {
      pan_no: body.pan_no,
      kycStatus,

      User_kycName: User_kycName || null,
    };
    const msg = kycStatus ? 'Dear Investor, the kyc status for your PAN is validated.' : 'Dear Investor, the kyc status for your PAN is not validated, kindly proceed with e-kyc journey';
    await t.commit();
    sendEncryptedResponse(res, payload, msg);





  } catch (error) {
    console.log(error, "error")
    await t.rollback();
    ErrorLogger.write({ type: "checkKYCStatus error", error });
    serverError(res, error);
  }

})

router.post("/checkPincode", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  let t = await dbInstance.transaction();
  try {
    const body = req.body;
    let checkPincode: any = await CheckPinCodeData(body);
    checkPincode = JSON.parse(JSON.stringify(checkPincode));
    const payload = {

      userType: checkPincode ? 'Urban' : 'Rural'
    };
    await t.commit();
    sendEncryptedResponse(res, payload, 'User Type Checked');
  } catch (error) {
    await t.rollback();
    ErrorLogger.write({ type: "checkPincode error", error });
    serverError(res, error);
  }

})

// tokenMiddleWare,-removed
// router.post("/checkKYCStatus", async (req: any, res: any) => {
//   try {

//     const body = req.body
//     const panNumberregex = /[A-z]{5}[0-9]{4}[A-z]{1}$/;
//     if (!panNumberregex.test(body.pan_no.replace(/\s/g, ""))) {
//       throw other(res, "Not a Valid PAN Number");
//     }

//     let kycStatus = false;


//     const [code, result] = await getKycStatusFromCVLKra(body.pan_no);
//     // const [code, result] = await getCheckKYCPanStatus(body);
// console.log("code",code)

// console.log("result-",result)


//     if (code == 400) {
//       throw other(res, result?.decryptedData?.error_message)
//     }

//     // let resString = JSON.parse(result?.decryptedData?.resdtls);
//     let resString: any;

//     try {
//       resString = JSON.parse(result?.decryptedData?.resdtls);
//     } catch (error) {
//       throw other(res, 'Invalid response from CVL KRA');
//     }

//     const appStatus = resString?.APP_PAN_INQ?.APP_STATUS?.toString();

//     if (!appStatus) {
//       throw other(res, 'Invalid PAN Number');
//     }
//     let msg = ''
//     if (isValidStatus(appStatus)) {
//       kycStatus = true;
//       msg = 'Dear Investor, the kyc status for your PAN is validated.';
//     } else {
//       kycStatus = false;
//       msg = 'Dear Investor, the kyc status for your PAN is still pending.';
//     }

//     //body?.investor_id
//     const investor_id=507;

//     let investor_data: any = await updateInvestorRegistration({ isKYCDone: kycStatus }, investor_id)
//     investor_data = investor_data?.[1]?.[0]
//       ? JSON.parse(JSON.stringify(investor_data[1][0]))
//       : null;

//     sendEncryptedResponse(res, { investor_data }, msg);


//   } catch (error) {
//     console.log(error, 'error')
//     ErrorLogger.write({ type: "checkStatus error", error });
//     serverError(res, error);
//   }

// })

router.post("/checkKYCStatus", kycRateLimit, async (req: any, res: any) => {
  try {
    const body = req.body;
    const panNumberregex = /[A-z]{5}[0-9]{4}[A-z]{1}$/;

    if (!panNumberregex.test(body.pan_no.replace(/\s/g, ""))) {
      throw other(res, "Not a Valid PAN Number");
    }

    // Validate mobile number if provided
    if (!body.mobile_number) {
      throw other(res, "Mobile number is required");
    }

    //const pan='ABJPM6939J';

    let kycStatus = false;
    const [code, result] = await getKycStatusFromCVLKra(body.pan_no);

    console.log("code", code);
    console.log("result-", result);

    if (code == 400) {
      throw other(res, result?.decryptedData?.error_message);
    }

    let resString: any;
    try {
      resString = JSON.parse(result?.decryptedData?.resdtls);
    } catch (error) {
      throw other(res, 'Invalid response from CVL KRA');
    }

    const appStatus = resString?.APP_PAN_INQ?.APP_STATUS?.toString();

    if (!appStatus) {
      throw other(res, 'Invalid PAN Number');
    }

    let msg = '';
    let cvlKraMessage = ''; // Store the actual CVL KRA message

    if (isValidStatus(appStatus)) {
      kycStatus = true;
      msg = 'Dear Investor, the kyc status for your PAN is validated.';
      cvlKraMessage = `PAN validation successful - Status: ${appStatus}`;
    } else {
      kycStatus = false;
      msg = 'Dear Investor, the kyc status for your PAN is still pending.';
      cvlKraMessage = `PAN validation failed - Status: ${appStatus}. Please complete your KYC with the concerned authority.`;
    }

    // Find investor by mobile number in InvestorRegistration model
    let investor_id = body.investor_id;

    // If no investor_id provided, try to find by mobile number
    if (!investor_id) {
      const investor = await InvestorRegistration.findOne({
        where: {
          reg_mobile: body.mobile_number,
          isDelete: false // Assuming you want active records only
        },
        attributes: ['id'] // Only get the ID
      });

      if (investor) {
        investor_id = investor.id;
        console.log(`Found investor ID: ${investor_id} for mobile: ${body.mobile_number}`);
      } else {
        console.log(`No investor found for mobile: ${body.mobile_number}`);
        // You can choose to create a new investor record here if needed
        // Or proceed without investor_id for KYC check only
      }
    }

    let investor_data = null;
    if (investor_id) {
      try {
        investor_data = await updateInvestorRegistration({ isKYCDone: kycStatus }, investor_id);
        investor_data = investor_data?.[1]?.[0] ? JSON.parse(JSON.stringify(investor_data[1][0])) : null;
        console.log(`Updated KYC status for investor ID: ${investor_id} to: ${kycStatus}`);
      } catch (updateError) {
        console.error('Error updating investor KYC status:', updateError);
        // Don't throw here, just log the error and continue
      }
    } else {
      console.log('No investor ID available for KYC status update');
    }

    // Send both the user message and the actual CVL KRA message
    sendEncryptedResponse(res, {
      investor_data,
      kycStatus,
      cvlKraMessage,
      appStatus,
      investorId: investor_id // Send back the investor ID for reference
    }, msg);

  } catch (error) {
    console.log(error, 'error');
    ErrorLogger.write({ type: "checkStatus error", error });
    serverError(res, error);
  }
});

router.post("/kyc-otp-generate", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {

    let body = req.body;

    let payload: any;

    const salt = await bcrypt.genSalt(10);

    if (body.emailFlag) {

      if (!req.body.reg_email) {
        throw other(res, "Email not Found!");
      }

      let getUser: any = await getUserByEmail(body.reg_email.toLowerCase());

      if (getUser) {
        throw other(res, "Email Already Exists!");
      }

      let emailOTP: any = generateRandomOTP();

      const email_OTP = await bcrypt.hash(emailOTP, salt);

      const otpbody = {
        email: req.body.reg_email,
        kyc_email_otp: email_OTP,
        userId: req.user.id
      };
      payload = { reg_email: req.body.reg_email, kyc_email_otp: emailOTP };

      let checkEmailExitsOrNot = await findOtpDetail({ email: body.reg_email, mobile: body.reg_mobile });

      if (checkEmailExitsOrNot) {
        await updateOtpDetail(otpbody, { mobile: body.reg_mobile, email: body.reg_email });
      } else {
        await addEmailInOtpDetail(otpbody);
      }


      //send email
      const mailData: any = {
        to: body.reg_email.toLowerCase(),
        subject: "KYC Email Verification Code",
        html: `<div>
            Greetings from Vedant !<br/><br/>,
                  Email : ${body.reg_email.toLowerCase()}<br/><br/>
            Your KYC Email Verifcation Code of Registration is  ${emailOTP} <br/><br/>
            Thanks & Regards,<br/>
                </div>`,
      };

      sendEmail(mailData);
    }

    if (body.mobileFlag) {

      if (!req.body.reg_mobile) {
        throw other(res, "Mobile not Found!");
      }

      let getUser: any = await getUserByMobile(req.body.reg_mobile);

      if (getUser) {
        throw other(res, "Mobile Already Exists!");
      }

      let mobileOTP: any = generateRandomOTP();

      const mobile_OTP = await bcrypt.hash(mobileOTP, salt);

      const otpbody = {
        mobile: req.body.reg_mobile,
        kyc_mobile_otp: mobile_OTP,
        userId: req.user.id
      };
      payload = { mobile: req.body.reg_mobile, kyc_mobile_otp: mobileOTP };
      let checkEmailExitsOrNot = await findOtpDetail({ mobile: body.reg_mobile, email: body.reg_email });

      if (checkEmailExitsOrNot) {
        await updateOtpDetail(otpbody, { mobile: body.reg_mobile, email: body.reg_email });
      } else {
        await addEmailInOtpDetail(otpbody);
      }

      let msg: any = `OTP - ${mobileOTP} is the OTP for your transaction. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`
      await SmsService.sendSmsUsingNimbus(body.reg_mobile, msg)

    }

    sendEncryptedResponse(res, payload, "Your OTP send successfully!!");

  } catch (error) {
    console.log(error, "error")
    ErrorLogger.write({ type: "kyc-otp-generate error", error });
    serverError(res, error);
  }
})

router.post("/kyc-otp-verify", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {

    let body = req.body;

    let responseOTP = {};

    if (!body.reg_email && !body.reg_mobile) {
      throw other(res, "Registration Email or Mobile can not be empty!");
    }
    let otp_details: any

    otp_details = await findOtpDetail({ mobile: body.reg_mobile, email: body.reg_email });
    otp_details = JSON.parse(JSON.stringify(otp_details));

    if (!otp_details) {
      throw other(res, "Registration Email or Mobile not Found!");
    }
    if (body.emailFlag) {
      if (!body.emailOTP) {
        throw other(res, "Email OTP can not be empty!");
      }

      const validEmailOTP = await bcrypt.compare(
        body.emailOTP,
        otp_details.kyc_email_otp
      );
      if (!validEmailOTP) {
        throw other(res, "Invalid Email OTP");
      }

      if (validEmailOTP) {
        responseOTP = { ...responseOTP, validEmailOTP };
      }
    }

    if (body.mobileFlag) {
      if (!body.mobileOTP) {
        throw other(res, "Mobile OTP can not be empty!");
      }

      const validMobileOTP = await bcrypt.compare(
        body.mobileOTP,
        otp_details.kyc_mobile_otp
      );
      if (!validMobileOTP) {
        throw other(res, "Invalid Mobile OTP");
      }

      if (validMobileOTP) {
        responseOTP = { ...responseOTP, validMobileOTP };
      }
    }

    sendEncryptedResponse(res, responseOTP, "OTP Verified successfully");

  } catch (error) {
    console.log(error, 'error')
    ErrorLogger.write({ type: "kyc-otp-verify error", error });
    serverError(res, error);
  }
})

router.post("/create_kyc_investor", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  let t = await dbInstance.transaction();

  try {

    let body: any = req.body;
    let user = req.user

    let investor_data = {
      email_address: user.email || "itvedant@vedantasset.com",
      phone: user.mobile,
      name: body.nameAsPan,
      pan_no: body.pan_no
    };

    console.log("investor_data", investor_data);

    let passObj = {
      user_id: body.user_id,
      pan_no: body.pan_no,
      isKYCDone: body.kycStatus,
      name: body.nameAsPan,
      tax_status: body.tax_status,
      dob: body.dob,
      // gender: null,
      // marital_status: null,
      risk_category_id: 1,
      group_leader_id: body.isMember ? body.group_leader_id : 0,
      //last_kyc_step: body.kycStatus ? 2 : 1,
      last_kyc_step: 1,
      is_kyc_complete: false,
      rm_id: body.rm_id ? body.rm_id : null,
      // partner_id: body.partner_id ? body.partner_id : null,
      reg_email: body.email || "",
      reg_mobile: body.mobile || "",
      signzy_kyc_id: null,
      signzy_user_name: null,
      //user_type: body.user_type,
      annualFund: body.annualFund
    }

    console.log("passObj", passObj);

    //initiate investor on-boarding in signzy
    let newKyc: any = null
    if (!body.kycStatus) {
      const signzyResponsObj = await onBoardInvestorinSignzy(investor_data);
      if (signzyResponsObj) {

        passObj.signzy_kyc_id = signzyResponsObj?.createdObj?.id
        passObj.signzy_user_name = signzyResponsObj?.createdObj?.username

      }


      if (signzyResponsObj) {

        let investorSignzyLoginBody = {
          username: signzyResponsObj?.createdObj?.username,
          password: signzyResponsObj?.createdObj?.id,
          platform: DEFAULT_SIGNZY_PLATFORM
        }
        if (body.investor_id) {
          const updated_investor = await updateInvestorRegistration(passObj, body.investor_id, t);
          newKyc = updated_investor?.[1]?.[0]
            ? JSON.parse(JSON.stringify(updated_investor[1][0]))
            : null;

        } else {

          newKyc = await addUserInvestorData(passObj, t);
          newKyc = JSON.parse(JSON.stringify(newKyc));
        }


        // newKyc = await addUserInvestorData(passObj, t);
        const signzyInvestorLoginRespObj = await investorLogin(investorSignzyLoginBody);

        if (signzyInvestorLoginRespObj) {
          newKyc.signzy_user_token = signzyInvestorLoginRespObj?.id;
        }
      }

    } else {
      if (body.investor_id) {
        const updated_investor = await updateInvestorRegistration(passObj, body.investor_id, t);
        newKyc = updated_investor?.[1]?.[0]
          ? JSON.parse(JSON.stringify(updated_investor[1][0]))
          : null;

      } else {

        newKyc = await addUserInvestorData(passObj, t);
        newKyc = JSON.parse(JSON.stringify(newKyc));
      }

    }

    await t.commit();
    sendEncryptedResponse(res, { newKyc }, "Initiate On-boarding");
    // }

  } catch (error) {
    console.log(error, "error")
    await t.rollback();
    ErrorLogger.write({ type: "create_kyc_investor error", error });
    serverError(res, error);
  }
})
router.post("/create_kyc_investor_sinzy", kycRateLimit, async (req: any, res: any) => {
  const t = await dbInstance.transaction();

  try {
    const body: any = req.body;
    //const user = req.user;

    const investor_data = {
      email_address: body.email,
      phone: body.mobile,
      name: body.name,
      pan_no: body.pan_no
    };

    const passObj: any = {
      signzy_kyc_id: null,
      signzy_user_name: null,
    };

    // ✅ Step 1: Find investor by mobile number
    let existingInvestor = await InvestorRegistration.findOne({
      where: { reg_mobile: body.mobile },
      transaction: t,
    });

    let investor_id = existingInvestor ? existingInvestor.id : null;

    // ✅ Step 2: Continue with Signzy onboarding logic
    let newKyc: any = null;

    if (!body.kycStatus) {
      const signzyResponsObj = await onBoardInvestorinSignzy(investor_data);
      if (signzyResponsObj) {
        passObj.signzy_kyc_id = signzyResponsObj?.createdObj?.id;
        passObj.signzy_user_name = signzyResponsObj?.createdObj?.username;

        const investorSignzyLoginBody = {
          username: signzyResponsObj?.createdObj?.username,
          password: signzyResponsObj?.createdObj?.id,
          platform: DEFAULT_SIGNZY_PLATFORM
        };

        // ✅ If investor already exists → update record
        if (investor_id) {
          const updated_investor = await updateInvestorRegistration(passObj, investor_id, t);
          newKyc = updated_investor?.[1]?.[0]
            ? JSON.parse(JSON.stringify(updated_investor[1][0]))
            : null;
        } else {
          // ✅ If not, create new investor record
          newKyc = await addUserInvestorData(passObj, t);
          newKyc = JSON.parse(JSON.stringify(newKyc));
        }

        // ✅ Login to Signzy
        const signzyInvestorLoginRespObj = await investorLogin(investorSignzyLoginBody);
        if (signzyInvestorLoginRespObj) {
          newKyc.signzy_user_token = signzyInvestorLoginRespObj?.id;
        }
      }
    } else {
      // ✅ If KYC already done — update or create investor
      if (investor_id) {
        const updated_investor = await updateInvestorRegistration(passObj, investor_id, t);
        newKyc = updated_investor?.[1]?.[0]
          ? JSON.parse(JSON.stringify(updated_investor[1][0]))
          : null;
      } else {
        newKyc = await addUserInvestorData(passObj, t);
        newKyc = JSON.parse(JSON.stringify(newKyc));
      }
    }

    await t.commit();
    sendEncryptedResponse(res, { newKyc, investor_id }, "Initiate On-boarding");

  } catch (error) {
    console.log("❌ Error in create_kyc_investor_sinzy:", error);
    await t.rollback();
    ErrorLogger.write({ type: "create_kyc_investor error", error });
    serverError(res, error);
  }
});



const onBoardInvestorinSignzy = async (investor_data: any) => {
  if (!investor_data) return null;

  try {

    const signzy_login_resp = await loginChannel();

    const randomNumber = generateRandomNumber();

    const randomUserName = investor_data?.pan_no.toString().toLowerCase() + "-" + randomNumber;

    let investorDataObj = {
      email: investor_data?.email_address,
      username: randomUserName,
      phone: investor_data?.phone,
      name: investor_data?.name,
      channelEmail: investor_data?.email_address,
      channel_token: signzy_login_resp?.id,
      channel_id: signzy_login_resp?.userId,
    };

    const onBoardingResponseObj = await investorOnboarding(investorDataObj);

    return onBoardingResponseObj;
  } catch (err: any) {
    throw err
  }
};

// router.post("/investorSignzyLogin", async (req: any, res: any) => {
//   try {

//     let body = req.body;

//     const invertorLoginCred = {
//       username: req.body?.username,
//       password: req.body?.password,
//     };

//     console.log("req.body?.username---",req.body?.username)
//     console.log("req.body?.password---",req.body?.password)

//     const loginData = await investorLogin(invertorLoginCred);
//     sendEncryptedResponse(res, loginData, "investor Login");

//   } catch (error: any) {
//     if (error?.error?.statusCode) {
//       other(res, error.error.message)
//     } else {
//       ErrorLogger.write({ type: "create_kyc_investor error", error });
//       serverError(res, error);
//     }
//   }
// })

//removed for testing purpose-tokenMiddleWare,-10-11-2025

router.post(
  "/initiate_dlConsent",
  kycRateLimit,
  async (req: any, res: any) => {
    try {

      const ConsentObj = {
        user_id: req?.body?.synzyuserId,
        type: DIGILOCKER_TYPE.aadhaarDigiLocker,
        user_token: req?.body?.userToken,
      };


      const result = await executePOIFromDigiLocker(ConsentObj);
      console.log("result-", result);


      sendEncryptedResponse(res, result, "get DG Url");

    } catch (error: any) {
      if (error?.error?.error?.statusCode) {
        other(res, error.error.error.message)
      } else {
        ErrorLogger.write({ type: "initiate_dlConsent error", error });
        serverError(res, error);
      }

    }
  }
);

router.post("/investorSignzyLogin", kycRateLimit, async (req: any, res: any) => {
  try {

    let body = req.body;

    const { mobile_number } = req.body;

    if (!mobile_number) {
      return other(res, "Mobile number is required");
    }

    // Fetch investor data by mobile number
    const investorData = await InvestorRegistration.findOne({
      where: {
        reg_mobile: mobile_number,
        isDelete: false
      }
    });

    if (!investorData) {
      return other(res, "Investor not found with the provided mobile number");
    }

    // Check if required fields are available
    if (!investorData.signzy_kyc_id || !investorData.signzy_user_name) {
      return other(res, "Signzy KYC data not found for this investor");
    }


    const invertorLoginCred = {
      username: investorData.signzy_user_name,
      password: investorData.signzy_kyc_id,
    };

    const loginData = await investorLogin(invertorLoginCred);
    sendEncryptedResponse(res, loginData, "investor Login");

  } catch (error: any) {
    if (error?.error?.statusCode) {
      other(res, error.error.message)
    } else {
      ErrorLogger.write({ type: "create_kyc_investor error", error });
      serverError(res, error);
    }
  }
})


router.post(
  "/initiate_dlConsent_sinzy",
  kycRateLimit,
  async (req: any, res: any) => {
    try {
      const { mobile_number } = req.body;

      if (!mobile_number) {
        return other(res, "Mobile number is required");
      }

      // Fetch investor data by mobile number
      const investorData = await InvestorRegistration.findOne({
        where: {
          reg_mobile: mobile_number,
          isDelete: false
        }
      });

      if (!investorData) {
        return other(res, "Investor not found with the provided mobile number");
      }

      // Check if required fields are available
      if (!investorData.signzy_kyc_id || !investorData.signzy_user_name) {
        return other(res, "Signzy KYC data not found for this investor");
      }

      const payLoad = {
        mobile_number: mobile_number
      };

      const ConsentObj = {
        user_id: investorData.signzy_user_name, // Use signzy_kyc_id as user_id
        type: DIGILOCKER_TYPE.aadhaarDigiLocker,
        user_token: investorData.signzy_kyc_id, // Use signzy_user_name as user_token
      };

      console.log("Consent Object:", ConsentObj);

      const result = await executePOIFromDigiLocker(ConsentObj);
      console.log("DigiLocker Result:", result);

      sendEncryptedResponse(res, result, "get DG Url");

    } catch (error: any) {
      if (error?.error?.error?.statusCode) {
        other(res, error.error.error.message)
      } else {
        ErrorLogger.write({ type: "initiate_dlConsent error", error });
        serverError(res, error);
      }
    }
  }
);

router.post(
  "/getDLDetails",
  kycRateLimit,
  async (req: any, res: any) => {
    try {
      const ConsentObj = {
        user_id: req?.body?.synzyuserId,
        type: DIGILOCKER_TYPE.panDigiLocker,
        user_token: req?.body?.userToken,
      };

      let POIDL = null;
      let POADL = null;
      let poiError = null;
      let poaError = null;
      let investor_data = null;

      // First try getDetailsPOIFromDigiLocker (optional)
      try {
        POIDL = await getDetailsPOIFromDigiLocker(ConsentObj);

        let poiResponseObj: any = {

          name: POIDL?.object?.result?.name,
          dob: null,
          fathers_name: POIDL?.object?.result?.fatherName,
          pan_no: POIDL?.object?.result?.number,
          poiConsent: true

        }
        const inputDate = POIDL?.object?.result?.dob;
        const [day, month, year] = inputDate.split('-');
        const formattedDate = `${year}-${month}-${day}`;
        poiResponseObj.dob = formattedDate;

        investor_data = await updateInvestorRegistration(poiResponseObj, req?.body?.investor_id)
        investor_data = investor_data?.[1]?.[0]
          ? JSON.parse(JSON.stringify(investor_data[1][0]))
          : null;
      } catch (error) {
        poiError = error;
        // POI failure is non-critical, continue to POA
      }

      // POA is mandatory - must succeed
      try {
        ConsentObj.type = DIGILOCKER_TYPE.aadhaarDigiLocker;
        POADL = await getDetailsPOAFromDigiLocker(ConsentObj);
        let poaResponseObj: any = {
          investor_id: req?.body?.investor_id,
          type: POADL?.result?.type,
          doc_holder_name: POADL?.result?.output?.name,

          doc_no: POADL?.result?.output?.uid,
          address1: POADL?.result?.output?.address,
          pincode: POADL?.result?.output?.splitAddress?.pincode,
          district: POADL?.result?.output?.splitAddress?.district[0],
          city: POADL?.result?.output?.splitAddress?.city[0],
          country: POADL?.result?.output?.splitAddress?.country[POADL?.result?.output?.splitAddress?.country?.length - 1],
          poaConsent: true


        }
        const input = POADL?.result?.output?.splitAddress?.state[0][0];
        const output = input
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        let findState: any = await StateMaster.findOne({
          where: { name: output },
        });
        if (findState) {
          poaResponseObj.state_id = findState.id
        }
        const countryInput = POADL?.result?.output?.splitAddress?.country[POADL?.result?.output?.splitAddress?.country?.length - 1];
        const countryOutput = countryInput
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        const findCountry: any = await findCountrybyName(countryOutput);
        if (findCountry) {
          poaResponseObj.country_id = findCountry.id
        }

        const addAadhar = await createAddressDetail(poaResponseObj);
      } catch (error) {
        poaError = error;
        // POA is mandatory, throw error to main catch
        throw error;
      }
      investor_data = await updateInvestorRegistration({ last_kyc_step: 2 }, req?.body?.investor_id)
      investor_data = investor_data?.[1]?.[0]
        ? JSON.parse(JSON.stringify(investor_data[1][0]))
        : null;
      const responseData = {
        POIDL: !poiError ? true : false,
        POADL: !poaError ? true : false,
        investor_data: investor_data
      };

      sendEncryptedResponse(res, responseData, "DigiLocker details retrieved successfully");

    } catch (error: any) {
      if (error?.error?.error?.statusCode) {
        other(res, error.error.error.message)
      } else {
        ErrorLogger.write({ type: "getDLDetails error", error });
        serverError(res, error);
      }
    }
  }
);


router.post(
  "/updatePersonalDetail",
  kycRateLimit,
  tokenMiddleWare,
  PANUploder.single("pan_image"),
  async (req: any, res: any) => {
    let t = await dbInstance.transaction();
    try {
      let passBody: any = JSON.parse(req.body.formData);
      passBody = sanitizePayload(passBody)

      let body: any;

      const requestType = passBody?.request_type;


      if (requestType === "updateSignZy") {
        if (!req.file) throw other(res, "Please upload PAN");

        body = kyc_personal_updateSignZy.parse(passBody);


        let investorData: any = await findUserDataById(body.investor_id)

        if (!investorData) throw other(res, "Investor not found");

        let kycBody = {}


        // Upload Image
        const investorDocumentObj = {
          user_token: body.userToken,
          ttl: "7 days",
        };

        const investorDocuments = {
          path: req.file.path,
          fieldname: "pan_card_image",
        };

        //uploade signZy
        const uploadImageSignZy = await uploadFile(
          investorDocumentObj,
          investorDocuments
        );


        if (!uploadImageSignZy) {
          throw other(res, "Image upload failed");
        }
        // Execute POI Extraction
        const poiPayload = {
          user_id: body.synzyuserId,
          file_url: uploadImageSignZy.file.directURL,
          user_token: body.userToken,
        };

        const execute = await executePOI(poiPayload);
        const checkData = execute?.object?.result;

        if (!checkData) throw other(res, "Invalid document, no data extracted");

        const { number, dob, name, fatherName } = checkData;

        if (!(number || dob || name || fatherName))
          throw other(res, "Please attach proper document");

        if (investorData.pan_no !== number)
          throw other(
            res,
            "Please upload the valid image of PAN Card, for the PAN Number shared while checking KYC Status."
          );

        kycBody = {
          name,
          dob: dob ? handleDate(dob) : null,
          pan_no: number,
          fathers_name: fatherName,
          pan_doc: req.file.filename,
          is_kyc_complete: false,
          mothers_name: body?.mothers_name,
          gender: body.gender,
        };




        const updated_details = await updateInvestorRegistration(kycBody, body.investor_id);
        const updatedInvestor = updated_details?.[1]?.[0]
          ? JSON.parse(JSON.stringify(updated_details[1][0]))
          : null;

        if (!updatedInvestor) throw other(res, "Failed to update investor");

        sendEncryptedResponse(res, { investor_data: updatedInvestor, kycbody: kycBody }, "POI Details Created");

      } else if (requestType === "updatePOI") {
        body = kyc_personal_updatePOI.parse(passBody);

        const kycObj = {
          ...passBody,
          ...body,
          last_kyc_step: 3,
        };
        delete kycObj.request_type;


        let investor_address: any = await getAddressDetail(body.investor_id)
        console.log(investor_address, 'investor_address')
        if (investor_address) {
          let findState = await StateMaster.findOne({
            where: { id: investor_address.state_id },
          });
          console.log(findState)
          if (findState) {
            investor_address.state = findState?.kyc_code
          }
        }


        let payload = {
          user_token: kycObj.userToken,
          user_id: kycObj.synzyuserId,
          uid: investor_address?.doc_no,
          address: investor_address?.address1,
          city: investor_address?.city,
          state: investor_address?.state,
          district: investor_address?.district,
          pincode: investor_address?.pincode.toString(),
          name: kycObj.name,
          dob: convertDateDdMmYyyy(kycObj.dob),
          // number: kycObj.pan_no,
          // fatherName: kycObj.fathers_name,
        }
        console.log(payload, 'payload')

        if (!kycObj.kycStatus) {
          if (investor_address?.poaConsent) {
            const update = await updatePOIFormDigiLocker(payload);
            console.log(update, 'updatePOIFormDigiLocker')
          } else {

            let updatepoI = await updatePOI(payload)
            console.log(updatepoI, 'updatePOI')

          }
        }


        if ((kycObj.member_type == MEMBER_TYPE.MEMBER || req.user.userTypeData['RM'] || req.user.userTypeData['partner'] || req.user.userTypeData['superAdmin']) && kycObj.taxStatus != "Minor") {

          let getUser: any = await findUserByEmailOrMobile({ email: kycObj.reg_email, mobile: kycObj.reg_mobile });
          if (kycObj.user_id != getUser?.id) {

            if (getUser) {
              throw other(res, "Email or Mobile already exists");
            }
            const randomNumber = generateRandomNumber();

            const randomPassword = kycObj?.pan_no.toString().toLowerCase() + "-" + randomNumber;
            const userpayload = {
              email: kycObj.reg_email.toLowerCase(),
              mobile: kycObj.reg_mobile,
              name: kycObj.name,
              password: randomPassword,     // Will be hashed automatically by your setter
              isActive: true,
              isPartner: false,
              roleId: ROLE.investor,
              userTypeId: USER_TYPE.InvestorRegistration,
              isEmailOTPVerified: true,
              isMobileOTPVerified: true,


            }
            const user = await addUser(userpayload, t);
            kycObj.user_id = user.id
            const userMappingPayload = {
              user_id: user.id,
              role_id: ROLE.investor,
              userType_id: USER_TYPE.InvestorRegistration,
              ref_id: body.investor_id,
            }
            await createUserMapping(userMappingPayload, t)
            const mailData: any = {
              to: kycObj.reg_email.toLowerCase(),
              subject: "Register User Password",
              html: `<div>
                      Email : ${kycObj.reg_email.toLowerCase()}<br/><br/>
                      Password : ${randomPassword} <br/><br/>
                    </div>`,
            };

            sendEmail(mailData);
          }

        }


        const updated_investor = await updateInvestorRegistration(kycObj, body.investor_id, t);
        const investorData = updated_investor?.[1]?.[0]
          ? JSON.parse(JSON.stringify(updated_investor[1][0]))
          : null;

        if (!investorData) throw other(res, "Failed to update POI");
        await t.commit();

        //call the function of can modification for personal details-----
        const investor_data = await getUserSummary(body.investor_id);
        console.log("investor_data", investor_data)
        const parsedInvestor = JSON.parse(JSON.stringify(investor_data));
        console.log("parsedDetails", parsedInvestor)

        // Prepare fixed payload as per the exact XML structure
        const payloadCan = prepareDirectCanModificationPayload(parsedInvestor);
        console.log("Direct MFU Payload:", JSON.stringify(payloadCan, null, 2));

        // Call MFU service for CAN modification
        const response: any = await MFUCanModificationService(payloadCan);

        const result = response?.CANIndFillEezzResp;
        console.log("Direct MFU Modification Response:", result);

        let investor = null;

        // If successful response from MFU
        if (result?.RESP_HEADER?.RES_CODE === "0") {
          // Update investor record flags in DB if investor_id provided
          if (body.investor_id) {
            const data = await updateInvestorRegistration(
              { is_bank_details_updated: true },
              body.investor_id
            );
            investor = data[1][0];
            console.log("Investor updated after direct CAN modification:", investor);
          }
        }

        // Prepare MFU CAN modification log object
        await CANModificationLogs.create({
          investor_id: body.investor_id,
          request_xml: typeof payloadCan === "object" ? JSON.stringify(payloadCan) : payloadCan,
          response_xml: typeof response === "object" ? JSON.stringify(response) : response,
          response_code: result?.RESP_HEADER?.RES_CODE || null,
          response_message: result?.RESP_HEADER?.RES_MSG || null,
          process_type: "CAN PERSONAL DETAIL",
        });


        // Optionally save this log in DB (see SQL below)
        //await CANModificationLogs.create(canModificationLog);

        // Prepare unified response for frontend
        const finalResponse = {
          investor_data: investorData,
          can_modification: {
            success: result?.RESP_HEADER?.RES_CODE === "0",
            response_code: result?.RESP_HEADER?.RES_CODE || null,
            response_message: result?.RESP_HEADER?.RES_MSG || "Request processed",
          },
        };

        // Send encrypted response cleanly
        sendEncryptedResponse(res, finalResponse, "POI Details Updated & CAN Modification Triggered");


        //sendEncryptedResponse(res, investorData, "POI Details Updated!!!");

      } else {
        throw other(res, "Invalid Request Type");
      }
    } catch (error: any) {
      console.log(error)
      await t.rollback()
      if (error?.error?.error?.statusCode) {
        other(res, error.error.error.message)
      } else {
        ErrorLogger.write({ type: "updatePersonalDetail error", error });
        serverError(res, error);
      }

    }
  }
);

router.post(
  "/uploadRelationshipProof",
  kycRateLimit,
  tokenMiddleWare,
  RelationshipProof.single("relationship_proof_document"),
  async (req: any, res: any) => {
    try {
      sendEncryptedResponse(res, { relationship_proof_document: req.file.filename }, "POI Details Created");


    } catch (error: any) {

      ErrorLogger.write({ type: "uploadRelationshipProof error", error });
      serverError(res, error);

    }
  }
);




router.post(
  "/updateAddressDetail",
  kycRateLimit,
  tokenMiddleWare,
  UploderFrontAddress.fields([{ name: "address_front_doc" }, { name: "address_back_doc" }]),
  async (req: any, res: any) => {
    try {

      let passBody: any = JSON.parse(req.body.formData || "{}");
      let body: any;
      if (Object.keys(passBody).length == 0) {
        passBody = req.body;
      }

      const requestType = passBody?.request_type;

      if (!requestType) {
        throw other(res, "Invalid Request Type!")
      }

      if (requestType === "updateSignZy") {

        if (!req.files) throw other(res, "Please upload Images");

        body = address_updateSignZy.parse(passBody);
        let signzypayload = {};

        let investor_data = await findUserDataById(body.investor_id)

        if (!investor_data) throw other(res, "Investor not found");


        let investorDocumentObj = {
          user_token: body?.userToken,
          ttl: "7 days",
        };

        let uploadImageSignZyFront;
        let uploadImageSignZyBack;

        if (req.files?.address_front_doc?.[0]) {
          let investorDocumentsFront = {
            path: req.files?.address_front_doc[0].path,
            fieldname: "Address_Proof_Front",
          };
          uploadImageSignZyFront = await uploadFile(
            investorDocumentObj,
            investorDocumentsFront
          );

        }

        if (req.files.address_back_doc?.[0]) {

          let investorDocumentsBack = {
            path: req.files.address_back_doc[0].path,
            fieldname: "Address_proof_Back",
          };


          uploadImageSignZyBack = await uploadFile(
            investorDocumentObj,
            investorDocumentsBack
          );
        }


        // if (uploadImageSignZyFront && uploadImageSignZyBack) {
        let investorPOIData = {
          user_id: body.synzyuserId,
          user_token: body.userToken,
          type: "aadhaar",
          front_page_url: req.files.address_front_doc?.[0] && uploadImageSignZyFront ? uploadImageSignZyFront?.file?.directURL : null,
          back_page_url: req.files.address_back_doc?.[0] && uploadImageSignZyBack ? uploadImageSignZyBack?.file?.directURL : null,
        };

        let execute = await executePOA(investorPOIData);

        let checkData = execute?.object?.result;


        // if (!checkData) {
        //     throw other(res, "Please attach proper document")
        // }

        //   if (!checkData?.uid) {
        //     throw other(res, "Please attach proper document");
        //   }

        signzypayload = {
          poa_number: checkData?.uid,
          address: checkData?.address,
          pincode: checkData?.pincode,
          city: checkData?.splitAddress?.city?.[0],
          district: checkData?.splitAddress?.district?.[0],
          state: checkData?.splitAddress?.state?.[0]?.[0],
          country: checkData?.splitAddress?.country?.[2],
        };


        // let investor_data:any = await findUserDataById(body.investor_id)


        let poabody: any;
        if (req.files?.address_front_doc?.[0]) {
          poabody = {
            ...poabody,
            address_front_doc: req.files.address_front_doc[0].filename,
          };
        }
        if (req.files?.address_back_doc?.[0]) {
          poabody = {
            ...poabody,
            address_back_doc: req.files.address_back_doc?.[0].filename,
          };
        }

        sendEncryptedResponse(res, { investor_data, poabody, signzypayload }, "POA Details Updated!!!");

      } else if (requestType === "updatePOA") {
        body = address_updatePOA.parse(passBody);

        let poabody: any = {
          investor_id: body.investor_id,
          doc_no: body?.doc_no,
          doc_holder_name: body.doc_holder_name,
          address1: body?.address1,
          address2: body?.address2,
          pincode: body.pincode,
          address_type: body.address_type,
          city: body.city,
          district: body.district,
          state_id: body.state_id,
          country_id: body.country_id,
          type: 'aadhaar',
          user_token: body?.userToken,
          user_id: body?.synzyuserId,
          dob: convertDateDdMmYyyy(body.dob),
          corr_doc_no: body?.corr_doc_no,
          corr_address1: body?.corr_address1,
          corr_address2: body?.corr_address2,
          corr_pincode: body?.corr_pincode,
          corr_address_type: body?.corr_address_type,
          corr_city: body?.corr_city,
          corr_district: body?.corr_district,
          corr_state_id: body?.corr_state_id,
          corr_country_id: body?.corr_country_id,
          same_as_permanent: body?.same_as_permanent,
        };

        if (body.address_back_doc) {
          poabody = { ...poabody, address_back_doc: body.address_back_doc }
        }

        if (body.address_front_doc) {
          poabody = { ...poabody, address_front_doc: body.address_front_doc }
        }
        if (body.corr_aadhaar_back_doc) {
          poabody = { ...poabody, corr_aadhaar_back_doc: body.corr_aadhaar_back_doc }
        }

        if (body.corr_aadhaar_front_doc) {
          poabody = { ...poabody, corr_aadhaar_front_doc: body.corr_aadhaar_front_doc }
        }

        let findState = await StateMaster.findOne({
          where: { id: body.state_id },
        });

        if (findState) {
          poabody = { ...poabody, stateCode: findState?.kyc_code }
        }
        if (!body.kycStatus) {
          if (body.POAConsent) {
            poabody.type = 'aadhaarDigiLocker'

            const updatePOA = await UpdatePOA(poabody)
            let correspondenceDATA: any = {
              doc_no: body?.corr_doc_no,
              doc_holder_name: body.doc_holder_name,
              address1: body?.corr_address1,
              pincode: body.corr_pincode,
              city: body.corr_city,
              district: body.corr_district,
              type: 'aadhaar',
              user_token: body?.userToken,
              user_id: body?.synzyuserId,
              dob: convertDateDdMmYyyy(body.dob)
            }

            let findState = await StateMaster.findOne({
              where: { id: body.corr_state_id },
            });

            if (findState) {
              correspondenceDATA = { ...correspondenceDATA, stateCode: findState?.kyc_code }
            }
            if (!body.same_as_permanent) {

              // correspondenceDATA.type = 'drivingLicence'
              // correspondenceDATA.number = 'TOZ1107557'
              // correspondenceDATA.issueDate = '30/04/2014'
              // correspondenceDATA.expiryDate = 'NA'
              // console.log(correspondenceDATA, 'correspondenceDATA')
              const updateCorrespondencePOA = await UpdateCorrespondencePOA(correspondenceDATA)
              console.log(updateCorrespondencePOA, 'updateCorrespondencePOA')
            } else {
              console.log(poabody, 'poabody')
              const updateCorrespondencePOA = await UpdateCorrespondencePOASameAsPermanent(poabody)
              console.log(updateCorrespondencePOA, 'updateCorrespondencePOA')

            }

          } else {

            // const updatePOA = await UpdatePOA(poabody)
          }
        }

        let adressDetails = await AddressDetail.findOne({
          where: { investor_id: body.investor_id },
        });

        if (adressDetails) {
          await updateAddressDetail(poabody, body.investor_id)

        } else {
          await createAddressDetail(poabody);
        }


        const update_investor_data = await updateInvestorRegistration({ address_type: body?.address_type, last_kyc_step: 4 }, body.investor_id)

        let investor_data = update_investor_data[1][0]

        let updatedadressDetails = await AddressDetail.findOne({
          where: { investor_id: body.investor_id }
        });

        sendEncryptedResponse(res, { poabody, updatedadressDetails, investor_data }, "POA Details Updated!!!");
      }

    } catch (error: any) {
      if (error?.error?.error?.statusCode) {
        other(res, error.error.error.message)
      } else if (error?.error?.statusCode) {
        other(res, error.error.message)
      } else {
        ErrorLogger.write({ type: "updateAddressDetail error", error });
        serverError(res, error);
      }
    }
  }
);
router.post(
  "/scan-corr-aadhaar",
  kycRateLimit,
  tokenMiddleWare,
  UploderFrontAddress.fields([{ name: "corr_aadhaar_front_doc" }, { name: "corr_aadhaar_back_doc" }]),
  async (req: any, res: any) => {
    try {

      let passBody: any = JSON.parse(req.body.formData || "{}");
      let body: any;
      if (Object.keys(passBody).length == 0) {
        passBody = req.body;
      }

      const requestType = passBody?.request_type;

      if (!requestType) {
        throw other(res, "Invalid Request Type!")
      }

      if (requestType === "updateSignZy") {

        if (!req.files) throw other(res, "Please upload Images");

        body = address_updateSignZy.parse(passBody);
        let signzypayload = {};

        let investor_data = await findUserDataById(body.investor_id)

        if (!investor_data) throw other(res, "Investor not found");


        let investorDocumentObj = {
          user_token: body?.userToken,
          ttl: "7 days",
        };

        let uploadImageSignZyFront;
        let uploadImageSignZyBack;

        if (req.files?.corr_aadhaar_front_doc?.[0]) {
          let investorDocumentsFront = {
            path: req.files?.corr_aadhaar_front_doc[0].path,
            fieldname: "corr_Address_Proof_Front",
          };
          uploadImageSignZyFront = await uploadFile(
            investorDocumentObj,
            investorDocumentsFront
          );

        }

        if (req.files.corr_aadhaar_back_doc?.[0]) {

          let investorDocumentsBack = {
            path: req.files.corr_aadhaar_back_doc[0].path,
            fieldname: "corr_Address_proof_Back",
          };


          uploadImageSignZyBack = await uploadFile(
            investorDocumentObj,
            investorDocumentsBack
          );
        }


        // if (uploadImageSignZyFront && uploadImageSignZyBack) {
        let investorPOIData = {
          user_id: body.synzyuserId,
          user_token: body.userToken,
          type: "aadhaar",
          front_page_url: req.files.corr_aadhaar_front_doc?.[0] && uploadImageSignZyFront ? uploadImageSignZyFront?.file?.directURL : null,
          back_page_url: req.files.corr_aadhaar_back_doc?.[0] && uploadImageSignZyBack ? uploadImageSignZyBack?.file?.directURL : null,
        };
        let execute = await executeCorrespondencePOA(investorPOIData);

        let checkData = execute?.object?.result;


        // if (!checkData) {
        //     throw other(res, "Please attach proper document")
        // }

        //   if (!checkData?.uid) {
        //     throw other(res, "Please attach proper document");
        //   }

        signzypayload = {
          poa_number: checkData?.uid,
          address: checkData?.address,
          pincode: checkData?.splitAddress?.pincode,
          city: checkData?.splitAddress?.city?.[0],
          district: checkData?.splitAddress?.district?.[0],
          state: checkData?.splitAddress?.state?.[0]?.[0],
          country: checkData?.splitAddress?.country?.[2],
        };


        // let investor_data:any = await findUserDataById(body.investor_id)


        let poabody: any;
        if (req.files?.corr_aadhaar_front_doc?.[0]) {
          poabody = {
            ...poabody,
            corr_aadhaar_front_doc: req.files.corr_aadhaar_front_doc[0].filename,
          };
        }
        if (req.files?.corr_aadhaar_back_doc?.[0]) {
          poabody = {
            ...poabody,
            corr_aadhaar_back_doc: req.files.corr_aadhaar_back_doc?.[0].filename,
          };
        }

        sendEncryptedResponse(res, { investor_data, poabody, signzypayload }, "POA Details Updated!!!");

      }

    } catch (error: any) {
      if (error?.error?.error?.statusCode) {
        other(res, error.error.error.message)
      } else {
        ErrorLogger.write({ type: "scan-corr-aadhaar error", error });
        serverError(res, error);
      }
    }
  }
);




router.post(
  "/declaration",
  kycRateLimit,
  tokenMiddleWare,
  async (req: any, res: any) => {
    try {

      let body: any = req.body;
      body = declaration_validation.parse(body);
      let investor_id = body.investor_id;
      body = sanitizePayload(body)
      const declarationData = await getInvestorDeclaration(investor_id)
      const find_investor_data = await findUserDataById(investor_id)
      let state = null
      let COBcountry = null
      let country = null
      if (body?.foreign_state) {

        state = await findState(body?.foreign_state)
      }
      if (body?.COB || body?.foreign_country) {
        const countryId = body?.COB ? body?.COB : body?.foreign_country
        COBcountry = await findCountry(countryId)

      }
      if (body?.citizenship_country) {
        country = await findCountry(body?.citizenship_country)
      }
      let payload: any = {
        user_id: body?.signZy_user_id || "", // Get SignZy user ID from user data
        user_token: body?.signZy_user_Token,
        pep: body?.is_politically_exposed == 'yes' ? "YES" : "NO", //whether a 'politically exposed person’ values: “YES” / “NO”
        rpep: body?.is_related_to_pep == 'yes' ? "YES" : "NO", //whether a 'related to a politically exposed person’ values: “YES” / “NO”
        residentForTaxInIndia: body?.is_indian_taxpayer == 'yes' ? "NO" : "YES",
        relatedPerson: "NO",

      };
      // Get user data to retrieve SignZy credentials if needed
      if (body?.is_indian_taxpayer == 'no') {
        payload = {
          ...payload,

          placeOfBirth: body?.POB || "",
          countryCodeOfBirth: COBcountry?.ansi_code || "",
          // addressType: body?.is_indian_taxpayer == 'no' ? "correspondence" : "",
          fatcaAdditionalDetails: [
            {
              countryCodeJurisdictionResidence: COBcountry?.name || "",
              taxIdentificationNumber: find_investor_data?.pan_no,
              taxExempt: 'NO',
              tinExemptReason: ''
            }
          ],
          address: {
            pincode: body?.foreign_pincode || "",
            city: body?.foreign_city || "",
            district: body?.foreign_district || "",
            state: state?.kyc_code || "",
            country: COBcountry?.name || "",
            address: body?.foreign_address || "",

          },



          // relatedPersonType: 1,
          // relatedPersonKycNumber: "",
          // relatedPersonKycNumberExists: "NO",
          // relatedPersonTitle: body?.relatedPersonTitle || "",
          // relatedPersonName: body?.relatedPersonName || "",
          // relatedPersonIdentityProofType:
          //   body?.relatedPersonIdentityProofType || "",
        };
      }


      let FatcaRes = {}
      if (!body?.kycStatus) {

        FatcaRes = await UpdateFatcaForm(payload);
        console.log(FatcaRes, 'UpdateFatcaForm')
      }
      if (!declarationData) {
        await createInvestorDeclaration(body);


      }
      else {
        await updateInvestorDeclaration(body, investor_id);
      }

      let updated_invester = await updateInvestorRegistration(
        { last_kyc_step: 5 },
        investor_id
      );

      let investor_data = updated_invester[1][0];
      investor_data = JSON.parse(JSON.stringify(investor_data))

      let finalObj = {
        declarationData, investor_data,
        FatcaRes
      };




      sendEncryptedResponse(res, finalObj, "Updated Investor Declarations");

    } catch (error) {
      ErrorLogger.write({ type: "Declaration_investor error", error });
      serverError(res, error);
    }
  }
);

async function logBankAccountHistory(
  action_type: "INSERT" | "UPDATE" | "DELETE",
  bankAccountData: any
) {
  try {
    await BankAccountDetailHistory.create({
      bank_account_detail_id: bankAccountData.id || null,
      investor_id: bankAccountData.investor_id,
      cancelled_cheque: bankAccountData.cancelled_cheque || null,
      account_no: bankAccountData.account_no || null,
      account_type: bankAccountData.account_type || null,
      ifsc: bankAccountData.ifsc || null,
      bank_id: bankAccountData.bank_id || null,
      micr: bankAccountData.micr || null,
      branch: bankAccountData.branch || null,
      bank_proof: bankAccountData.bank_proof || null,
      action_type,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (err) {
    console.error("Failed to insert BankAccountDetailHistory:", err);
  }
}


router.post(
  "/invester-bankdetails",
  kycRateLimit,
  tokenMiddleWare,
  CancelCheque.single("cancelled_cheque"),
  async (req: any, res: any) => {
    try {

      let passBody: any = JSON.parse(req.body.formData || "{}");
      let body: any;
      if (Object.keys(passBody).length == 0) {
        passBody = req.body;
      }

      const requestType = passBody?.request_type;

      if (!requestType) {
        throw other(res, "Invalid Request Type!")
      }

      if (requestType === "updateSignZy") {

        if (!req.file) throw other(res, "Please upload Images");

        body = bank_updateSignZy.parse(passBody);

        let investorDocumentObj = {
          user_token: body?.userToken,
          ttl: "7 days",
        };

        let investorDocuments = {
          path: req.file.path,
          fieldname: "canceled_cheque_image",
        };

        let uploadImageSignZy = await uploadFile(
          investorDocumentObj,
          investorDocuments
        );

        let execute: any;
        let checkData = null
        if (uploadImageSignZy) {
          let investorPOIData = {
            user_id: body?.synzyuserId,
            front_page_url: uploadImageSignZy?.file?.directURL,
            user_token: body?.userToken,
          };

          execute = await CancelledChequeExecute(investorPOIData);
          checkData = execute?.object?.result;

          const panyTransferPayload = {
            file_url: uploadImageSignZy?.file?.directURL,
            beneficiaryAccount: checkData?.accountNumber,
            beneficiaryIFSC: checkData?.ifsc,
            beneficiaryName: checkData?.name,
            beneficiaryMobile: '',
            user_id: body?.synzyuserId,
            user_token: body?.userToken,

          }
          const reponse = await BankAccountPennyTransfer(panyTransferPayload)
          console.log(reponse.object?.result.bankTransfer, 'BankAccountPennyTransfer')
        }


        if (!checkData) {
          throw other(res, "Please attach proper document");
        }

        if (!(checkData.accountNumber || checkData.ifsc || checkData?.name)) {
          throw other(res, "Please attach proper document")
        }

        let bankbody: any = {
          account_no: checkData.accountNumber,
          ifsc: checkData.ifsc,
          bank_address: body.bank_address ? body.bank_address : "",
          bank_name: checkData.bankName,
          branch: checkData.branch,
          micr: checkData.micrCode,
          account_type: checkData?.accountType,

        };

        if (req?.file) {
          bankbody = { ...bankbody, cancelled_cheque: req?.file?.filename };
        }

        sendEncryptedResponse(res, bankbody, "Bank Details");
      } else if (requestType === "updateBankDetails") {

        body = bank_update.parse(passBody);

        const payload = body.bankAccounts.map((item: any) => {
          return {
            ...item,
            investor_id: body.investor_id
          }

        })

        // chack after 

        if (!body.kycStatus) {
          const account = body.bankAccounts[0]

          const bankPayload = {
            accountNumber: account.account_no,
            name: '',
            ifsc: account.ifsc,
            contact: '',
            micrCode: account.micr,
            address: '',
            user_id: body?.synzyuserId,
            user_token: body?.userToken,
          }
          const data = await UpdateFormCancelledCheque(bankPayload)
          console.log(data, 'updateBankDetails')
        }

        //old code ny novaline team
        // await destroyBankAcccountDetails(body.investor_id)
        // console.log("inside the bank details section ")

        // let newBank = await createBankDetails(payload);

        // let investor_data = await updateInvestorRegistration({ last_kyc_step: 6 }, body.investor_id)

        //commented by aditya with new logic 
        //         await destroyBankAcccountDetails(body.investor_id)
        // console.log("inside the bank details section ")

        // let newBank = await createBankDetails(payload);

        // let investor_data = await updateInvestorRegistration({ last_kyc_step: 6 }, body.investor_id)

        //         const investor = investor_data[1][0]

        //         sendEncryptedResponse(res, { investor_data: investor }, "updated Bank Details");
        // First, fetch existing bank details before destroying them
        const existingBanks = await BankAccountDetail.findAll({
          where: { investor_id: body.investor_id },
        });

        // Log DELETE history for existing records
        for (const record of existingBanks) {
          await logBankAccountHistory("DELETE", record);
        }

        // Delete old records
        await destroyBankAcccountDetails(body.investor_id);
        console.log("Deleted old bank details for investor", body.investor_id);

        // Create new bank records
        const newBankRecords = await createBankDetails(payload);

        // Log INSERT history for newly created records
        for (const record of newBankRecords) {
          await logBankAccountHistory("INSERT", record);
        }

        // Update investor’s last KYC step
        let investor_data = await updateInvestorRegistration({ last_kyc_step: 6 }, body.investor_id);
        const investor = investor_data[1][0];

        sendEncryptedResponse(res, { investor_data: investor }, "Updated Bank Details");

      }
      else {
        throw other(res, "Invalid Request Type");
      }




    } catch (error: any) {
      console.log(error, 'error')
      if (error?.error?.error?.statusCode) {
        other(res, error.error.error.message)
      } else {
        ErrorLogger.write({ type: "invester-bankdetails error", error });
        serverError(res, error);
      }
    }
  }
);

router.post(
  "/invester-bankdetails-for-Kyc-done",
  kycRateLimit,
  tokenMiddleWare,
  CancelCheque.single("cancelled_cheque"),
  async (req: any, res: any) => {
    try {

      let passBody: any = JSON.parse(req.body.formData || "{}");
      let body: any;
      if (Object.keys(passBody).length == 0) {
        passBody = req.body;
      }

      const requestType = passBody?.request_type;

      if (!requestType) {
        throw other(res, "Invalid Request Type!")
      }

      if (requestType === "updateSignZy") {

        if (!req.file) throw other(res, "Please upload Images");


        const bankbody = { cancelled_cheque: req?.file?.filename };

        sendEncryptedResponse(res, bankbody, "Bank Details");
      }


    } catch (error: any) {
      if (error?.error?.error?.statusCode) {
        other(res, error.error.error.message)
      } else {
        ErrorLogger.write({ type: "invester-bankdetails-for-Kyc-done error", error });
        serverError(res, error);
      }
    }
  }
);



router.post(
  "/investor-nominee",
  kycRateLimit,
  tokenMiddleWare,
  async (req: any, res: any) => {
    try {

      let body: any = req.body;
      body = nominee_update.parse(body);

      let investor_id = body.investor_id;

      // let checkEmailExitsOrNot = await NomineeDetail.findOne({
      //   where: { investor_id: investor_id },
      // });

      // Get user data from database to fill missing fields
      const userData: any = await getUserDataForNomineeForm(investor_id);


      let nominee_details = body.nominee_details[0];

      // Build payload for SignZy, using database data as fallback
      let payload = {
        user_id: body.synzyuserId,
        user_token: body.userToken,
        gender: userData?.Gender?.code,
        maritalStatus: userData?.MaritalStatus.code,  //“MARRIED” / “UNMARRIED” / “OTHERS”
        emailId: userData?.reg_email || "", //Email Id of Investor
        fatherName: userData?.fathers_name || "",
        motherName: userData?.mothers_name || "",
        nomineeRelationShip: userData.father_relation, //Pass either “FATHER” or “SPOUSE”, accordingly pass the name in “fatherName”
        fatherTitle: userData.father_title,
        maidenTitle: '',
        maidenName: '',
        panNumber: userData?.pan_no || "",
        aadhaarNumber: "", // No aadhar field in PersonalDocuments model
        motherTitle: "Mrs.",
        residentialStatus: userData.InvestorDeclaration?.is_indian_citizen == 'yes' ? "Resident Individual" : 'Foreign National',     //for Person of Indian Origin after we can discuss
        occupationDescription: userData?.InvestorDeclaration?.OccupationMaster?.occupation, //after FATCA
        occupationCode: userData?.InvestorDeclaration?.OccupationMaster?.occ_code, //after FATCA
        occupationOther: '',
        kycAccountCode: "01",
        kycAccountDescription: "New",
        communicationAddressCode: userData.AddressDetail?.AddressType?.at_code,
        communicationAddressType: userData.AddressDetail?.AddressType?.address_type,
        permanentAddressCode: userData.AddressDetail?.AddressType?.at_code,
        permanentAddressType: userData.AddressDetail?.AddressType?.address_type,
        citizenshipCountryCode: userData.InvestorDeclaration?.is_indian_citizen == 'yes' ? userData.InvestorDeclaration?.ContryOfBirth.kyc_code : userData.InvestorDeclaration?.CitizenshipCountry.kyc_code, //after FATCA
        citizenshipCountry: userData.InvestorDeclaration?.is_indian_citizen == 'yes' ? userData.InvestorDeclaration?.ContryOfBirth.name : userData.InvestorDeclaration?.CitizenshipCountry.name, //after FATCA
        applicationStatusCode: userData.InvestorDeclaration?.is_indian_citizen == 'yes' ? 'R' : 'N', //for Foreign National, Person of Indian Origin after we can discuss
        applicationStatusDescription: userData.InvestorDeclaration?.is_indian_citizen == 'yes' ? 'Resident Indian' : 'Non-Resident Indian', //for Foreign National, Person of Indian Origin after we can discuss
        mobileNumber: userData?.reg_mobile,
        countryCode: userData.InvestorDeclaration?.is_indian_citizen == 'yes' ? 91 : '',

        placeOfBirth: userData.InvestorDeclaration?.POB || "",
        annualIncome: "",
        dob: userData?.dob ? convertDateDdMmYyyy(userData?.dob) : null,
        name: userData?.name
      };


      if (!body.kycStatus) {

        let nomineesDataSygnzy = await UpdateFormCallFORMSSection(payload);
        console.log(nomineesDataSygnzy, 'nomineesDataSygnzy')
      }
      const nomineeArr = body.nominee_details.map((item: any) => {
        return {
          ...item,
          guardian_DOB: item.guardian_DOB ? item.guardian_DOB : null,
          guardian_relationship: item.guardian_relationship ? item.guardian_relationship : null,
          guardian_email: item.guardian_email ? item.guardian_email : null,
          guardian_mobile: item.guardian_mobile ? item.guardian_mobile : null,
          guardian_PAN: item.guardian_PAN ? item.guardian_PAN : null,
          guardian_name: item.guardian_name ? item.guardian_name : null,
          investor_id: body.investor_id
        }

      })

      await deleteNomineesDetails(body.investor_id)
      await createNomineesDetails(nomineeArr)
      let investor_data = await updateInvestorRegistration({ last_kyc_step: 7 }, body.investor_id)

      const investor = investor_data[1][0]

      sendEncryptedResponse(res, { investor_data: investor }, "Updated Investor Nominee");


    }
    catch (error: any) {
      if (error.status) {
        other(res, error.message)
      } else {
        ErrorLogger.write({ type: "investor-nominee error", error });
        serverError(res, error);
      }

    }
  }
);

router.post(
  "/investor-signature",
  kycRateLimit,
  tokenMiddleWare,
  async (req: any, res: any) => {
    try {

      let body: any = req.body;
      let investor_id = body.investor_id;

      if (!investor_id) throw other(res, "Investor not found");
      if (!body.filename) throw other(res, "Please upload Images");


      let investorDocumentObj = {
        user_token: body?.userToken,
        ttl: "7 days",
      };

      let investorDocuments = {
        path: `${config.publicPath}/signature/${body.filename}`,
        fieldname: "signature",
      };

      let uploadImageSignZy = await uploadFile(
        investorDocumentObj,
        investorDocuments
      );
      const signaturePayload = {
        user_id: body.synzyuserId,
        user_token: body?.userToken,
        signatureImageUrl: uploadImageSignZy?.file?.directURL,
      }

      const UpdateSignature = await UpdateFormSignature(signaturePayload)
      console.log(UpdateSignature, 'UpdateSignature')
      let payload = {
        investor_id: investor_id,
        signature: body.filename,
      };

      let documents = await getPersonalDetails(investor_id)
      let sign;
      if (documents) {
        sign = await updatePersonalByInvestorDetails(payload, investor_id)
      } else {
        sign = await createPersonalDetails(payload);
      }

      sendEncryptedResponse(res, sign, "signature updated");
    }
    catch (error: any) {
      if (error?.error?.error?.statusCode) {
        other(res, error.error.error.message)
      } else if (error?.error?.statusCode) {
        other(res, error.error.message)

      }
      else {
        ErrorLogger.write({ type: "investor signature error", error });
        serverError(res, error);
      }
    }
  }
);
router.post(
  "/investor-photo",
  kycRateLimit,
  Photo.single("photo"),

  async (req: any, res: any) => {
    try {

      let body: any = req.body;


      let investor_id = body.investor_id;

      if (!investor_id) throw other(res, "Investor not found");
      if (!req.file.filename) throw other(res, "Please upload Images");

      let payload = {
        investor_id: investor_id,
        photo: req.file.filename,
      };


      if (!req.body.userToken) {
        throw other(res, "User Token Not Found");
      }
      if (!req.body.synzyuserId) {
        throw other(res, "UserId Not Found");
      }

      let investorDocumentObj = {
        user_token: req.body.userToken,
        ttl: "7 days",
      };

      //  return other(req, res, null, "please upload photo");
      let investorDocumentsPhoto = {
        path: `${config.publicPath}/photo/${req.file.filename}`,
        fieldname: "photo",
      };

      let uploadImageSignZyPhoto = await uploadFile(
        investorDocumentObj,
        investorDocumentsPhoto
      );

      if (uploadImageSignZyPhoto) {
        let investorPhoto = {
          user_id: req.body.synzyuserId,
          user_token: req.body.userToken,
          photoUrl: uploadImageSignZyPhoto?.file?.directURL,
        };

        let execute1 = await UpdateFormPhoto(investorPhoto);
        console.log(execute1, 'UpdateFormPhoto')


      }



      let documents = await getPersonalDetails(investor_id)
      let sign;
      if (documents) {
        sign = await updatePersonalByInvestorDetails(payload, investor_id)
      } else {
        sign = await createPersonalDetails(payload);
      }

      sendEncryptedResponse(res, { fileName: req.file.filename, sign }, "Upload phtoto Successfully");
    }
    catch (error: any) {
      if (error?.error?.error?.statusCode) {
        other(res, error.error.error.message)
      } else if (error?.error?.statusCode) {
        other(res, error.error.message)

      }
      else {
        ErrorLogger.write({ type: "upload photo error", error });
        serverError(res, error);
      }
    }
  }
);

router.post(
  "/investor-video",
  kycRateLimit,
  Video.single("video"),
  tokenMiddleWare,
  async (req: any, res: any) => {
    try {
      let body: any = JSON.parse(req.body.formData || "{}");

      // let body: any;
      if (Object.keys(body).length == 0) {
        body = req.body;
      }


      const requestType = body?.request_type;

      if (!requestType) {
        throw other(res, "Invalid Request Type!")
      }

      let investor_id = body.investor_id;

      if (!investor_id) throw other(res, "Investor not found");

      let investor_data = await findUserDataById(investor_id)

      if (!investor_data) {
        throw other(res, "Investor Data Not Found");
      }

      if (!investor_data?.pan_doc) {
        throw other(res, "Please Upload the POI First");
      }

      if (!body?.userToken) {
        throw other(res, "User Token Not Found");
      }

      if (!body?.synzyuserId) {
        throw other(res, "UserId Not Found");
      }


      //started start recording
      if (requestType === "startVideo") {
        let investorVideo = {
          user_id: body.synzyuserId,
          user_token: body.userToken,
        };

        let investorDocumentObj = {
          user_token: body?.userToken,
          ttl: "7 days",
        };
        let poiImage = path.join(__dirname, `../../../src/public/panDoc/${investor_data?.pan_doc}`)
        if (!poiImage) {
          throw other(res, "Unable to find POI Image")
        }

        let investorDocuments = {
          path: poiImage,
          fieldname: "pan_card_image",
        };

        let uploadImageSignZy = await uploadFile(
          investorDocumentObj,
          investorDocuments
        );

        let execute1 = await VideoStart(investorVideo);
        let VideoSYNRes = execute1?.object;

        if (!VideoSYNRes) {
          throw other(res, "Please Upload proper video");
        }

        sendEncryptedResponse(res, { VideoSYNRes, matchImage: uploadImageSignZy?.file?.directURL }, "Start Video!")

      }

      if (requestType === "startExecutingVideo") {
        if (!req.file) {
          throw other(res, "Video Not Found!");
        }

        if (!body?.video_otp) {
          throw other(res, "Video otp Not Found!");
        }
        if (!body.transactionId) {
          throw other(res, "Transaction ID Not Found!");
        }
        if (!body?.matchImage) {
          throw other(res, "POI Image URL Not Found!");
        }

        let documents = await getPersonalDetails(investor_id);


        if (!documents) {
          throw notFound(res, "investot  not found!");
        }

        let investorDocumentObj = {
          user_token: body.userToken,
          ttl: "7 days",
        };

        let investorDocumentsVideo = {
          path: req.file.path,
          fieldname: "video",
        };

        let uploadImageSignZyPVideo = await uploadFile(
          investorDocumentObj,
          investorDocumentsVideo
        );

        if (!uploadImageSignZyPVideo) {
          throw other(
            res, "Error Video uploading"
          );

        }
        let investorVideo = {
          user_id: body.synzyuserId,
          user_token: body.userToken,
          videoUrl: uploadImageSignZyPVideo?.file?.directURL,
          transactionId: body.transactionId,
          matchImage: body.matchImage,
        };

        let execute1 = await VideoVerification(investorVideo);
        let VideoSYNRes = execute1.object;

        let photobody = {
          self_video: req.file.filename,
          video_otp: body.video_otp,
        };

        await updatePersonalByInvestorDetails(photobody, investor_id)

        let investor_data = findUserDataById(investor_id)

        sendEncryptedResponse(res, { VideoSYNRes, investor_data }, "video uploaded")

      }


      // sendEncryptedResponse(res, null, "video uploaded")
    }
    catch (error) {
      ErrorLogger.write({ type: "video error", error });
      serverError(res, error);
    }
  }
);


router.get("/on-boarding-listings", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    const [gender, marital_status, mobile_relation, RelationshipPrimaryHolder, RelationshipProof, TaxStatus, BankProof, RelationshipTypes, NomineeGuardianRelationshipTypes, identity_type, bankList] = await Promise.all([
      getAllGender(),
      getAllMaritalStatus(),
      getAllMobileRelation(),
      getAllRelationshipPrimaryHolder(),
      getAllRelationshipProof(),
      getAllTaxStatus(),
      getAllBankProof(),
      getAllRelationshipTypes(),
      getAllNomineeGuardianRelationshipTypes(),
      getAllIdentityTypes(),
      getAllBank()
    ]);

    const listing: Record<string, any> = {};

    if (gender?.length > 0) {
      listing.gender = gender;
    }
    if (marital_status?.length > 0) {
      listing.marital_status = marital_status;
    }
    if (mobile_relation?.length > 0) {
      listing.mobile_relation = mobile_relation;
    }
    if (RelationshipPrimaryHolder?.length > 0) {
      listing.relationship_primaryHolder = RelationshipPrimaryHolder;
    }
    if (RelationshipProof?.length > 0) {
      listing.relationship_proof = RelationshipProof;
    }
    if (TaxStatus?.length > 0) {
      listing.tax_status = TaxStatus;
    }
    if (BankProof?.length > 0) {
      listing.bank_proof = BankProof;
    }
    if (RelationshipTypes?.length > 0) {
      listing.relationship_types = RelationshipTypes;
    }
    if (NomineeGuardianRelationshipTypes?.length > 0) {
      listing.nominee_guardian_relationship_types = NomineeGuardianRelationshipTypes;
    }
    if (identity_type?.length > 0) {
      listing.identity_type_list = identity_type;
    }
    if (bankList?.length > 0) {
      listing.bank_list = bankList;
    }

    sendEncryptedResponse(res, listing, "listings");

  } catch (error) {
    ErrorLogger.write({ type: "on-boarding-listings error", error });
    serverError(res, error);
  }
})

router.get("/get-bank-proof", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    const bankProofList = await getAllBankProof();
    sendEncryptedResponse(res, bankProofList, "Bank proof types");
  } catch (error) {
    ErrorLogger.write({ type: "get_bank_proof error", error });
    serverError(res, error);
  }
})



router.post("/updateinvestor", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    const body = req.body;
    // change-kyc-step
    let investor_data = await updateInvestorRegistration(body, req.body.investor_id)

    const investor = investor_data[1][0]

    sendEncryptedResponse(res, { investor_data: investor }, "Updated Investor Data");
  } catch (error) {
    ErrorLogger.write({ type: "updateinvestor error", error });
    serverError(res, error);
  }
})



router.get("/get-personal-info/:investor_id", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {

    let investor_id = req.params.investor_id
    let investor_data = await findUserDataById(investor_id)

    sendEncryptedResponse(res, investor_data, "get personal info");
  } catch (error) {
    ErrorLogger.write({ type: "get-personal-info error", error });
    serverError(res, error);
  }
})
router.get("/get-investor-declaration/:investor_id", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    let investor_id = req.params.investor_id

    const data = await getInvestorDeclaration(investor_id);
    sendEncryptedResponse(res, data, "get Investor declaration");
  } catch (error) {
    ErrorLogger.write({ type: "get-investor-declaration/:investor_id", error });
    serverError(res, error);
  }
})

router.get("/get-address-info/:investor_id", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {

    let investor_id = req.params.investor_id
    let investor_address = await getAddressDetail(investor_id)

    sendEncryptedResponse(res, investor_address, "get address info");
  } catch (error) {
    ErrorLogger.write({ type: "get-address-info error", error });
    serverError(res, error);
  }
})

router.get("/get-bank-info/:investor_id", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {

    let investor_id = req.params.investor_id

    let investor_bank = await getBankDetails(investor_id)

    sendEncryptedResponse(res, investor_bank, "get bank info");
  } catch (error) {
    ErrorLogger.write({ type: "get-bank-info error", error });
    serverError(res, error);
  }
})

router.get("/get-nominee-info/:investor_id", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {

    let investor_id = req.params.investor_id

    let investor_nominee = await getNomineeDetails(investor_id)

    sendEncryptedResponse(res, investor_nominee, "get nominee info");
  } catch (error) {
    ErrorLogger.write({ type: "get-nominee-info error", error });
    serverError(res, error);
  }
})

router.get("/get-personal-document-info/:investor_id", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {

    let investor_id = req.params.investor_id;

    let investor_docs = await getPersonalDetails(investor_id)
    let investor_address = await getAddressDetail(investor_id)

    sendEncryptedResponse(res, { investor_docs, investor_address }, "get document info");
  } catch (error) {
    ErrorLogger.write({ type: "get-personal-document-info error", error });
    serverError(res, error);
  }
})

router.get("/investor-summary/:investor_id", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {

    let investor_id = req.params.investor_id


    let investor_data = await getUserSummary(investor_id)
    let parsedInvestor = JSON.parse(JSON.stringify(investor_data))




    sendEncryptedResponse(res, parsedInvestor, "get personal info");
  } catch (error) {
    ErrorLogger.write({ type: "investor-summary error", error });
    serverError(res, error);
  }
})

router.get("/get-fatca-dropdown", kycRateLimit, async (req: any, res: any) => {
  try {
    const [occupationList, incomeList, addresslist, annualIncome] = await Promise.all([
      OccupationMaster.findAll(),
      IncomeSource.findAll(),
      AddressType.findAll(),
      AnnuaIincomeMaster.findAll()
    ]);


    sendEncryptedResponse(res, { occupationList, incomeList, addresslist, annualIncome }, "get fatca dropdown info");
  } catch (err) {
    ErrorLogger.write({ type: "get-fatca-dropdown error", err });
    serverError(res, err);
  }
})

//code of Aditya for Nominee drop down --
router.get("/get-nominee-dropdown", kycRateLimit, async (req: any, res: any) => {
  try {
    const [nomineeRelationShipType, nomineeIdentity, nomineeCountry, nominee_guardian_relationship_types] = await Promise.all([
      NominineeRelationshipType.findAll(),
      NomineeIdentity.findAll(),
      CountryMaster.findAll(),
      NomineeGuardianRelationship.findAll()
    ]);


    sendEncryptedResponse(res, { nomineeRelationShipType, nomineeIdentity, nomineeCountry, nominee_guardian_relationship_types }, "get Nominee dropdown info");
  } catch (err) {
    ErrorLogger.write({ type: "get-nominee-dropdown error", err });
    serverError(res, err);
  }
})



router.post("/create-contract", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {

    // let body = req.body.data
    let payload = {
      user_id: req.body.synzyuserId,
      user_token: req.body.userToken,
    }


    let data = await CreatePDFURL(payload)
    sendEncryptedResponse(res, data, "get contract info");
  } catch (error: any) {
    if (error.error.error?.statusCode) {
      other(res, error.error.error.message)
    } else {
      ErrorLogger.write({ type: "create_contract error", error });
      serverError(res, error);
    }
  }
})


router.post("/genarate-aadhar", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {

    // let body = req.body.data
    let payload = {
      fileName: req.body.fileName,
      user_id: req.body.synzyuserId,
      user_token: req.body.userToken,
    }
    let data = await Genearte_Aadhar(payload)
    sendEncryptedResponse(res, data, "get contract info");
  } catch (error: any) {
    if (error.error.error?.statusCode) {
      other(res, error.error.error.message)
    } else {
      ErrorLogger.write({ type: "genarate-aadhar error", error });
      serverError(res, error);
    }
  }
})


router.post("/save_aaddher_PDF", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {

    // let body = req.body.data

    let payload = {
      user_id: req.body.synzyuserId,
      user_token: req.body.userToken,
    }
    let data = await save_aaddher_PDF(payload)

    // Download and save the esigned file to public folder
    let downloadResult = null;
    if (data.object?.result?.esignedFile) {
      const esignedFileUrl = data.object.result.esignedFile;
      const fileName = `esigned-document-${req.body.investor_id}`;

      downloadResult = await downloadAndSaveFile(esignedFileUrl, fileName);

      // Update the response data to include local file info
      data.localFile = downloadResult;

    }

    const urlData = {
      user_id: req.body.synzyuserId,
      user_token: req.body.userToken,
      signedPdf: data.object.result.esignedFile,
    }
    const saveData = await save_signed_PDF(urlData)
    sendEncryptedResponse(res, { data }, "get PDF file");
  } catch (error: any) {
    if (error.error.error?.statusCode) {
      other(res, error.error.error.message)
    } else {
      ErrorLogger.write({ type: "save_aaddher_PDF error", error });
      serverError(res, error);
    }

  }
})
router.post("/execute_verification_engine", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {

    let body = req.body

    let payload = {
      investor_id: body.investor_id,
      user_id: body.synzyuserId,
      user_token: body.userToken,
    }
    let data = await execute_verification_engine(payload)
    let investor_data = await updateInvestorRegistration({ is_kyc_complete: true }, body.investor_id)

    const investor = investor_data[1][0]
    sendEncryptedResponse(res, { investor }, "Your KYC has been successfully completed");
  } catch (error: any) {
    if (error?.error?.error?.statusCode) {
      other(res, error.error.error.message)

    } else {
      ErrorLogger.write({ type: "execute_verification_engine error", error });
      serverError(res, error);
    }

  }
})


router.post("/Signzy", kycRateLimit, async (req: any, res: any) => {
  try {

    let body = req.body
    console.log(body, 'eventCallbackUrl')
    // let payload = {
    //   data: req.body.data,
    //   user_id: req.body.synzyuserId,
    //   user_token: req.body.userToken,
    // }

    // res.redirect(`http://localhost:3000/kyc-quick-summary`);

    // let data = await CreatePDFURL(payload)
    // sendEncryptedResponse(res, data, "get contract info");
  } catch (error) {
    ErrorLogger.write({ type: "Signzy error", error });
    serverError(res, error);
  }
})
router.post("/generate-photo-capture-link", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    const { investor_id } = req.body;

    if (!investor_id) {
      throw other(res, "Investor ID is required");
    }

    // Get user data from database
    const userData = await getUserSummary(investor_id);

    if (!userData) {
      throw other(res, "Investor not found or not registered");
    }



    // Create payload for encryption
    const payload = {
      investor_id: userData.id
    };

    // Generate encrypted token with 30 minutes expiry
    const encryptedToken = generateEncryptedLinkWithExpiry(payload, 30);

    // Generate the photo capture link
    const photoLink = `${config.reactUrl}/photo-capture/${encryptedToken}`;

    const mailData: any = {
      to: userData.reg_email.toLowerCase(),
      subject: "Photo Capture Link",
      html: `<div>
               Photo Capture Link - ${photoLink} is the link for your capture photo. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you
              </div>`,
    };

    sendEmail(mailData);

    let msg: any = `Photo Capture Link - ${photoLink} is the link for your capture photo. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`;

    // await SmsService.sendSmsUsingNimbus(userData.reg_mobile, msg)
    const responseData = {
      photoLink,
      token: encryptedToken,
      compactToken: encryptedToken, // Same as token now (compact format)
      tokenLength: encryptedToken.length,
      smsMessage: `Photo code: ${encryptedToken}`,
      expiresIn: 30, // minutes
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };

    sendEncryptedResponse(res, responseData, "Photo capture link generated successfully");
  } catch (error) {
    ErrorLogger.write({ type: "generate-photo-capture-link", error });
    serverError(res, error);
  }
})

router.get("/validate-photo-capture-token/:token", kycRateLimit, async (req: any, res: any) => {
  try {
    const { token } = req.params;

    if (!token) {
      throw other(res, "Token is required");
    }

    // Decrypt and validate token
    const result = decryptAndValidateToken(token);

    if (!result.valid || !result.payload) {
      throw other(res, result.error || "Invalid token");
    }

    // Get investor data to verify token is for valid investor
    const userData = await getUserSummary(result.payload.investor_id);

    if (!userData) {
      throw other(res, "Investor not found");
    }

    const responseData = {
      valid: true,
      investor_id: result.payload.investor_id,
      investor_name: userData.name,
      signzy_user_name: userData.signzy_user_name,
      signzy_kyc_id: userData.signzy_kyc_id,
      expiresAt: result.expiresAt,
      timeRemaining: result.expiresAt ? Math.max(0, Math.floor((result.expiresAt.getTime() - new Date().getTime()) / 1000 / 60)) : 0 // minutes remaining
    };

    sendEncryptedResponse(res, responseData, "Token is valid");
  } catch (error) {
    ErrorLogger.write({ type: "validate-photo-capture-token", error });
    serverError(res, error);
  }
})

router.post("/CAN-register", kycRateLimit, async (req: any, res: any) => {
  try {

    let investorId = req.body.investor_id
    let investor_data = await getUserSummary(investorId)

    let parsedInvestor = JSON.parse(JSON.stringify(investor_data))

    const payload = preparePayload(parsedInvestor);
    let response: any = await MFUCanFillEezzService(payload);
    const result = response?.CANIndFillEezzResp
    console.log(result)
    let investor = null;

    if (result?.RESP_HEADER?.RES_CODE == "0") {
      const _result = addHolidingAccount({
        investor_id: investorId,
        first_investor_id: investorId,
        second_investor_id: null,
        third_investor_id: null,
        account_holding_type: ACCOUNT_TYPE.find((opt: any) => opt.value === 'SI')?.code,
        CAN_Id: result?.RESP_BODY?.CAN,
      })

      let data = await updateInvestorRegistration(
        { is_kyc_complete: true, is_CAN_registered: true },
        req.body.investor_id
      );

      investor = data[1][0];
      console.log("Updation of investor after can registration", investor);

    }
    /*const responses = {
      "CANIndFillEezzResp": {
        "RESP_HEADER": {
          "ENTITY_ID": "40008I",
          "UNIQUE_ID": "REQ_00000002",
          "REQUEST_TYPE": "CANINDREG",
          "VERSION_NO": "1.00",
          "TIMESTAMP": "2025-07-14T14:38:28",
          "RES_CODE": "0",
          "RES_MSG": "Success"
        },
        "RESP_BODY": {
          "CAN": "32195FF003",
          "NOM_VER_LINK_H1": "https://14.141.212.169:4091/CanCDNVLinkViewAction.do?key=ZMi1K17UamPLy6tqPO85L19dVmMEjW76ZPAZ2fSQlR5yIIeYGw/o0c1oWxwDwwbmcjCZdfSG0z2EK3lXGp+XMrJ6+V2+y05j7eIm1zsIugPyHvbIslt0Kx82R0BiI1rB+SOZNsFfk+qwPcsucQOrjNGM5y/IhGGY94ewfTXi+MUAmZbuHRtUkWucVSRyrCZm",
          "NOM_VER_LINK_H2": "",
          "NOM_VER_LINK_H3": ""
        }
      }
    }*/

    sendEncryptedResponse(res, { investor_data: investor, canResponse: response }, "MFUCanFillEezzService")


  } catch (error) {
    ErrorLogger.write({ type: "CAN-register", error });
    serverError(res, error);
  }
})


//bank detail modification for CAN---
router.post("/CAN-modification", kycRateLimit, async (req: any, res: any) => {
  try {
    const investorId = req.body.investor_id;

    // Fetch investor details
    const investor_data = await getUserSummary(investorId);
    console.log("investor_data", investor_data)
    const parsedInvestor = JSON.parse(JSON.stringify(investor_data));
    console.log("parsedDetails", parsedInvestor)
    // Prepare payload for MFU modification request
    const payload = prepareCanModificationPayload(parsedInvestor, '');

    // Call MFU service for CAN modification
    const response: any = await MFUCanModificationService(payload);

    const result = response?.CANIndFillEezzResp;
    console.log("MFU Modification Response:", result);

    let investor = null;

    // If successful response from MFU
    if (result?.RESP_HEADER?.RES_CODE === "0") {
      // Update investor record flags in DB
      const data = await updateInvestorRegistration(
        { is_bank_details_updated: true },
        investorId
      );
      investor = data[1][0];
      console.log("Investor updated after CAN modification:", investor);
    }

    sendEncryptedResponse(
      res,
      { investor_data: investor, canModificationResponse: response },
      "MFUCanModificationService"
    );
  } catch (error) {
    ErrorLogger.write({ type: "CAN-modification", error });
    serverError(res, error);
  }
});

//Can Contact details update ----
router.post("/CAN-modification-direct", kycRateLimit, async (req: any, res: any) => {
  try {
    const { investor_id } = req.body;
    console.log("Direct CAN modification request for investor:", investor_id);

    const investor_data = await getUserSummary(investor_id);
    console.log("investor_data", investor_data)
    const parsedInvestor = JSON.parse(JSON.stringify(investor_data));
    console.log("parsedDetails", parsedInvestor)

    // Prepare fixed payload as per the exact XML structure
    const payload = prepareDirectCanModificationPayload(parsedInvestor);
    console.log("Direct MFU Payload:", JSON.stringify(payload, null, 2));

    // Call MFU service for CAN modification
    const response: any = await MFUCanModificationService(payload);

    const result = response?.CANIndFillEezzResp;
    console.log("Direct MFU Modification Response:", result);

    let investor = null;

    // If successful response from MFU
    if (result?.RESP_HEADER?.RES_CODE === "0") {
      // Update investor record flags in DB if investor_id provided
      if (investor_id) {
        const data = await updateInvestorRegistration(
          { is_bank_details_updated: true },
          investor_id
        );
        investor = data[1][0];
        console.log("Investor updated after direct CAN modification:", investor);
      }
    }

    sendEncryptedResponse(
      res,
      {
        investor_data: investor,
        canModificationResponse: response,
        success: result?.RESP_HEADER?.RES_CODE === "0",
        message: result?.RESP_HEADER?.RES_MSG || "Request processed"
      },
      "DirectMFUCanModificationService"
    );
  } catch (error) {
    console.error("Direct CAN Modification Error:", error);
    ErrorLogger.write({ type: "CAN-modification-direct", error });
    serverError(res, error);
  }
});


//API to get the details of insertion,deletion for bank account details :-

router.get("/getInvBankUpdate/:id", kycRateLimit, async (req, res) => {
  try {
    const body = req.body;
    const header = req.headers;
    const { id } = req.params;

    const results = await getInvBankUpdate(id);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "getInvBankUpdate"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getInvBankUpdate error :- ", error });
    serverError(res, error);
  }
});
router.get("/compare-bankdetails/:investor_id", kycRateLimit, async (req: any, res: any) => {
  try {
    const { investor_id } = req.params;

    // 🔹 Fetch current active bank record
    const current = await BankAccountDetail.findOne({
      where: { investor_id },
      raw: true,
    });

    if (!current) {
      return sendEncryptedResponse(
        res,
        { isChanged: true, differences: [] },
        "No current bank record found for this investor"
      );
    }

    // 🔹 Fetch all history records (latest first)
    const historyRecords = await BankAccountDetailHistory.findAll({
      where: { investor_id },
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    if (!historyRecords || historyRecords.length < 2) {
      return sendEncryptedResponse(
        res,
        { isChanged: true, differences: [] },
        "Not enough history records to perform comparison"
      );
    }

    // 🔹 Take the second latest (previous) record for comparison
    const lastHistory = historyRecords[1];

    // 🔹 Fields to compare
    const compareFields = [
      "account_no",
      "bank_id",
      "ifsc",
      "account_type",
      "micr",
      "branch",
      "bank_proof",
      "cancelled_cheque",
    ];

    const differences: any[] = [];

    // 🔹 Compare values field by field
    for (const key of compareFields) {
      const currentValue =
        current[key as keyof typeof current] != null
          ? String(current[key as keyof typeof current]).trim()
          : "";
      const oldValue =
        lastHistory[key as keyof typeof lastHistory] != null
          ? String(lastHistory[key as keyof typeof lastHistory]).trim()
          : "";

      if (currentValue !== oldValue) {
        differences.push({
          field: key,
          oldValue,
          newValue: currentValue,
        });
      }
    }

    const isChanged = differences.length > 0;

    // 🔹 Send encrypted structured response
    sendEncryptedResponse(
      res,
      {
        isChanged,
        differences,
      },
      "Comparison completed"
    );
  } catch (error) {
    ErrorLogger.write({ type: "compare-bankdetails error :- ", error });
    serverError(res, error);
  }
});

//get the details for can update process by PAN---

router.get("/gteCanDetailsInvestor/:pan", kycRateLimit, async (req, res) => {
  try {
    const body = req.body;
    const header = req.headers;
    const { pan } = req.params;

    const results = await gteCanDetailsInvestor(pan);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "gteCanDetailsInvestor"
    );
  } catch (error) {
    ErrorLogger.write({ type: "gteCanDetailsInvestor error :- ", error });
    serverError(res, error);
  }
});

//can personal details update by Aditya Gupta
router.post(
  "/updateEmailMobile",
  kycRateLimit,
  async (req: any, res: any) => {
    const t = await dbInstance.transaction();
    try {
      let { investor_id, email, mobile } = req.body;

      console.log("email-", email);
      console.log("mobile-", mobile);
      console.log("mobiinvestor_idle-", investor_id);

      if (!investor_id) {
        throw other(res, "Investor ID is required");
      }

      const investor = await findUserDataById(investor_id);
      if (!investor) throw other(res, "Investor not found");

      const updateObj: any = {};
      if (email) updateObj.reg_email = email.toLowerCase();
      if (mobile) updateObj.reg_mobile = mobile;

      if (Object.keys(updateObj).length === 0)
        throw other(res, "Nothing to update. Please send email or mobile");

      if (email) {
        const existingEmail = await InvestorRegistration.findOne({
          where: { reg_email: email.toLowerCase() },
        });
        if (existingEmail && existingEmail.id !== investor_id)
          throw other(res, "Email already in use by another investor");
      }

      if (mobile) {
        const existingMobile = await InvestorRegistration.findOne({
          where: { reg_mobile: mobile },
        });
        if (existingMobile && existingMobile.id !== investor_id)
          throw other(res, "Mobile already in use by another investor");
      }

      const updated = await updateInvestorRegistration(updateObj, investor_id, t);
      const updatedInvestor =
        updated?.[1]?.[0] ? JSON.parse(JSON.stringify(updated[1][0])) : null;
      if (!updatedInvestor) throw other(res, "Failed to update investor");

      const investor_data = await getUserSummary(investor_id);
      const parsedInvestor = JSON.parse(JSON.stringify(investor_data));

      const payloadCan = prepareDirectCanModificationPayload(parsedInvestor);
      console.log("CAN Modification Payload:", JSON.stringify(payloadCan, null, 2));

      const response: any = await MFUCanModificationService(payloadCan);
      const result = response?.CANIndFillEezzResp;
      console.log("MFU Modification Response:", result);

      if (result?.RESP_HEADER?.RES_CODE === "0") {
        await updateInvestorRegistration(
          { is_bank_details_updated: true },
          investor_id,
          t
        );
      }

      await CANModificationLogs.create({
        investor_id,
        request_xml:
          typeof payloadCan === "object" ? JSON.stringify(payloadCan) : payloadCan,
        response_xml:
          typeof response === "object" ? JSON.stringify(response) : response,
        response_code: result?.RESP_HEADER?.RES_CODE || null,
        response_message: result?.RESP_HEADER?.RES_MSG || null,
        process_type: "CAN EMAIL/MOBILE UPDATE",
      });

      await t.commit();

      const finalResponse = {
        investor_data: updatedInvestor,
        can_modification: {
          success: result?.RESP_HEADER?.RES_CODE === "0",
          response_code: result?.RESP_HEADER?.RES_CODE || null,
          response_message: result?.RESP_HEADER?.RES_MSG || "Request processed",
        },
      };

      sendEncryptedResponse(
        res,
        finalResponse,
        "Investor Email/Mobile Updated & CAN Modification Triggered"
      );
    } catch (error: any) {
      console.log("updateEmailMobile Error:", error);
      await t.rollback();

      if (error?.error?.error?.statusCode) {
        other(res, error.error.error.message);
      } else {
        ErrorLogger.write({ type: "updateEmailMobile error", error });
        serverError(res, error);
      }
    }
  }
);


//can bank modification code-
router.post(
  "/canUpdateInvestorBankDetails",
  kycRateLimit,
  tokenMiddleWare,
  CancelCheque.single("bank_proof"), // optional cheque proof upload
  async (req: any, res: any) => {
    const t = await dbInstance.transaction();
    try {
      const {
        investor_id,
        account_no,
        ifsc,
        micr,
        account_type,
        bank_name,
        branch,
      } = req.body;

      console.log(" Received Bank Update Request:", req.body);

      if (!investor_id) {
        throw other(res, "Investor ID is required");
      }

      //  Find existing record
      const existingBank = await BankAccountDetail.findOne({
        where: { investor_id },
        raw: true,
      });

      if (!existingBank) {
        throw other(res, "No existing bank record found for this investor");
      }

      //  Prepare update object
      let updateObj: any = {
        account_no,
        ifsc,
        micr,
        account_type,
        bank_name,
        branch,
      };

      if (req.file) {
        updateObj.cancelled_cheque = req.file.filename;
      }

      console.log("🛠 Updating BankAccountDetail:", updateObj);

      // Perform update
      await BankAccountDetail.update(updateObj, { where: { investor_id }, transaction: t });

      //  Fetch updated investor info
      const investorData = await getUserSummary(investor_id);
      const parsedInvestor = JSON.parse(JSON.stringify(investorData));

      //  Check for CAN
      const canRecord = await InvestorAccountHolding.findOne({
        where: { investor_id },
        raw: true,
      });

      if (!canRecord?.CAN_Id) {
        console.log("ℹ No CAN found for investor:", investor_id);
        await t.commit();

        return sendEncryptedResponse(
          res,
          { message: "Bank details updated successfully (No CAN found)" },
          "Bank details updated successfully"
        );
      }

      //  Prepare CAN modification payload
      const payloadCan = prepareCanModificationPayload(parsedInvestor, canRecord.CAN_Id);
      console.log("CAN Modification Payload:", JSON.stringify(payloadCan, null, 2));

      //  Call CAN Modification Service
      const response: any = await MFUCanModificationService(payloadCan);
      const result = response?.CANIndFillEezzResp;

      console.log(" MFU CAN Modification Response:", result);

      //  If successful, mark investor as updated
      if (result?.RESP_HEADER?.RES_CODE === "0") {
        await updateInvestorRegistration(
          { is_bank_details_updated: true },
          investor_id,
          t
        );
      }

      //  Log CAN modification event
      await CANModificationLogs.create({
        investor_id,
        request_xml: typeof payloadCan === "object" ? JSON.stringify(payloadCan) : payloadCan,
        response_xml: typeof response === "object" ? JSON.stringify(response) : response,
        response_code: result?.RESP_HEADER?.RES_CODE || null,
        response_message: result?.RESP_HEADER?.RES_MSG || null,
        process_type: "CAN BANK DETAIL UPDATE",
      });

      await t.commit();

      //  Send success response
      return sendEncryptedResponse(
        res,
        {
          investor_data: parsedInvestor,
          can_modification: {
            success: result?.RESP_HEADER?.RES_CODE === "0",
            response_code: result?.RESP_HEADER?.RES_CODE || null,
            response_message: result?.RESP_HEADER?.RES_MSG || "Request processed",
          },
        },
        "Bank details updated & CAN modification triggered"
      );
    } catch (error: any) {
      console.error(" updateInvestorBankDetails Error:", error);
      await t.rollback();

      if (error?.error?.error?.statusCode) {
        other(res, error.error.error.message);
      } else {
        ErrorLogger.write({ type: "updateInvestorBankDetails error", error });
        serverError(res, error);
      }
    }
  }
);


router.post("/can-investor-nominee", kycRateLimit, async (req: any, res: any) => {
  try {
    const body: any = req.body;
    const investorId = body.investor_id;

    if (!investorId) {
      return other(res, "Investor ID is required");
    }

    const nominee = body.nominee_details?.[0];
    if (!nominee) {
      return other(res, "Nominee details missing");
    }

    // 🧩 STEP 0: Resolve identity type if string provided (like "PAN")
    let identityTypeId: number | null = null;
    if (nominee.identity_type) {
      const identityRecord = await NomineeIdentity.findOne({
        where: { type: nominee.identity_type },
        raw: true,
      });
      if (identityRecord) {
        identityTypeId = identityRecord.id;
      } else {
        console.warn("⚠️ Unknown identity type:", nominee.identity_type);
      }
    }

    // 🧩 Prepare nominee update body
    const updateData = {
      nominee_name: nominee.name || null,
      nominee_DOB: nominee.dob || null,
      //nominee_type: nominee.nominee_type || null,
      //relation: nominee.relationship || null,
      mobile_number: nominee.mobile || null,
      email_address: nominee.email || null,
      percentage_allocation: nominee.percentage || null,
      guardian_name: nominee.guardian_name || null,
      guardian_PAN: nominee.guardian_PAN || null,
      guardian_DOB: nominee.guardian_DOB || null,
      guardian_relationship: nominee.guardian_relationship || null,
      guardian_mobile: nominee.guardian_mobile || null,
      guardian_email: nominee.guardian_email || null,
      country: nominee.country || null,
      state: nominee.state || null,
      identity_type: identityTypeId, // ✅ resolved id here
      identity_number: nominee.identity_number || null,
      city: nominee.city || null,
      pin_code: nominee.pin_code || null,
      address_line_1: nominee.address_line_1 || null,
      address_line_2: nominee.address_line_2 || null,
    };

    const existingNominee = await NomineeDetail.findOne({
      where: { investor_id: investorId },
    });

    if (existingNominee) {
      await updateNomineesDetails(updateData, existingNominee.id);
      console.log("✅ Nominee details updated for investor:", investorId);
    } else {
      await NomineeDetail.create({
        ...updateData,
        investor_id: investorId,
      });
      console.log("✅ Nominee created for investor:", investorId);
    }

    // 🧩 STEP 2: Update investor registration progress
    let investorData = await updateInvestorRegistration(
      { last_kyc_step: 7 },
      investorId
    );
    let investor = investorData[1][0];

    // 🧩 STEP 3: Trigger CAN modification if CAN exists
    const canRecord = await InvestorAccountHolding.findOne({
      where: { investor_id: investorId },
      raw: true,
    });

    let canModificationResponse = null;
    let investorAfterCanUpdate = investor;

    if (canRecord?.CAN_Id) {
      console.log("CAN found for nominee update:", canRecord.CAN_Id);

      const investorSummary = await getUserSummary(investorId);
      const parsedInvestor = JSON.parse(JSON.stringify(investorSummary));

      const payloadCan = prepareNomineeCanModificationPayload(
        parsedInvestor,
        canRecord.CAN_Id
      );

      console.log(
        "MFU Nominee Modification Payload:",
        JSON.stringify(payloadCan, null, 2)
      );

      const response: any = await MFUCanModificationService(payloadCan);
      console.log("MFU Nominee Modification Response:", response);

      canModificationResponse = response;
      const result = response?.CANIndFillEezzResp;

      if (result?.RESP_HEADER?.RES_CODE === "0") {
        const data = await updateInvestorRegistration(
          { is_nominee_details_updated: true },
          investorId
        );
        investorAfterCanUpdate = data[1][0];
      }

      // 🧩 Log CAN modification
      await CANModificationLogs.create({
        investor_id: investorId,
        request_xml:
          typeof payloadCan === "object"
            ? JSON.stringify(payloadCan)
            : payloadCan,
        response_xml:
          typeof response === "object" ? JSON.stringify(response) : response,
        response_code: result?.RESP_HEADER?.RES_CODE || null,
        response_message: result?.RESP_HEADER?.RES_MSG || null,
        process_type: "CAN NOMINEE UPDATE",
      });
    } else {
      console.log("No CAN found for investor:", investorId);
    }

    // 🧩 STEP 4: Final success response
    return sendEncryptedResponse(
      res,
      {
        investor_data: investorAfterCanUpdate,
        can_modification: {
          success:
            canModificationResponse?.CANIndFillEezzResp?.RESP_HEADER
              ?.RES_CODE === "0",
          response_code:
            canModificationResponse?.CANIndFillEezzResp?.RESP_HEADER
              ?.RES_CODE || null,
          response_message:
            canModificationResponse?.CANIndFillEezzResp?.RESP_HEADER
              ?.RES_MSG || "Request processed",
        },
      },
      "Nominee details updated & CAN modification triggered"
    );
  } catch (error: any) {
    console.error("investor-nominee error:", error);
    if (error.status) {
      other(res, error.message);
    } else {
      ErrorLogger.write({ type: "investor-nominee error", error });
      serverError(res, error);
    }
  }
});


//investor complete registration by decentro-----
router.post("/complete-registration", kycRateLimit, async (req, res) => {
  try {
    const { partner, verification, fatca, nominees } = req.body;

    console.log("partner---", partner);
    console.log("verification---", verification);
    console.log("fatca---", fatca);
    console.log("nominees---", nominees);

    const mobile = partner.mobile || partner.phone;
    const pan = verification?.pan?.number;

    if (!mobile || !pan) {
      return sendEncryptedResponse(
        res,
        { status: "F", remark: "Mobile and PAN are required" },
        "complete-registration"
      );
    }

    const normalizedPartner = { ...partner, mobile, pan };

    // 🔹 Run registration service
    const registrationResult = await completeRegistration(
      normalizedPartner,
      verification,
      fatca,
      nominees
    );

    // ✅ Construct clear, detailed frontend response
    const responsePayload = {
      status: "S",
      remark: "Registration completed successfully",
      message: "Investor created successfully",
      registrationResult: {
        ...registrationResult,
      },
    };

    sendEncryptedResponse(res, responsePayload, "complete-registration");
  } catch (error) {
    ErrorLogger.write({ type: "complete-registration error", error });
    serverError(res, error);
  }
});

//added by rakesh sinha on dated 19-11-2025

router.post("/investor_registration", kycRateLimit, tokenMiddleWare, async (req, res) => {
  const body: any = req.body;
  const response = await updateInvestorRegistration(body, body.investor_id);
  sendEncryptedResponse(res, response, "complete-registration");
});

router.post("/update-address", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    const body = req.body;
    console.log("Body == ", body);

    // Validate required fields
    const { investor_id, address, country_id, state_id, pincode, district, nameAsPan } = body;

    if (!investor_id) {
      return sendEncryptedResponse(res, {}, "Investor ID missing");
    }

    // Prepare payload correctly
    const payload = {
      investor_id,
      address1: address,
      country_id,
      state_id,
      pincode,
      district,
      doc_holder_name: nameAsPan
    };

    // Check existing address
    const findAddress = await AddressDetail.findOne({
      where: { investor_id: investor_id },
    });

    // Update or create address
    let addressResponse;
    if (findAddress) {
      addressResponse = await updateAddressDetail(payload, investor_id);
    } else {
      addressResponse = await createAddressDetail(payload);
    }

    // Update KYC holder details

    return sendEncryptedResponse(
      res,
      {
        address: addressResponse,
      },
      "Updated Address & Basic Details"
    );

  } catch (error) {
    ErrorLogger.write({ type: "update-basic-details error", error });
    return serverError(res, error);
  }
});

router.post("/update-basic-details", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    const body = req.body;
    const investor_id = body.investor_id;
    const next_kyc_step = body.next_kyc_step;
    const last_kyc_step = body.last_kyc_step;
    const email = body.email;
    const user_id = body.user_id;

    const updatedData = await updateHolderDetails(investor_id, last_kyc_step, next_kyc_step, email, user_id, body);

    sendEncryptedResponse(
      res,
      { additional_kyc: updatedData },
      "Updated Basic Details"
    );
  } catch (error) {
    ErrorLogger.write({ type: "update-basic-details error", error });
    serverError(res, error);
  }
});


router.post("/get-holder-details", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    const body = req.body;
    const investor_id = body.investor_id;
    const last_kyc_step = body.last_kyc_step;

    const updatedData = await getHolderDetails(investor_id);

    sendEncryptedResponse(
      res,
      { data: updatedData },
      "Updated Basic Details"
    );
  } catch (error) {
    ErrorLogger.write({ type: "update-basic-details error", error });
    serverError(res, error);
  }
});

router.post("/update-additional-kyc", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    const body = req.body;
    const investor_id = body.investor_id;

    console.log("Additional KYC=====", body)


    const updatedData = await saveAdditionalKycDetails(investor_id, body);

    sendEncryptedResponse(
      res,
      { additional_kyc: updatedData },
      "Updated Additional KYC Details"
    );
  } catch (error) {
    ErrorLogger.write({ type: "update-additional-kyc error", error });
    serverError(res, error);
  }
});


router.post("/update-fatca", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    const body = req.body;
    const investor_id = body.investor_id;

    const updatedData = await saveFatcaDetails(investor_id, body);

    sendEncryptedResponse(
      res,
      { fatca_details: updatedData },
      "Updated FATCA Details"
    );
  } catch (error) {
    ErrorLogger.write({ type: "update-fatca error", error });
    serverError(res, error);
  }
});


router.post("/update-bank-details", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    const { investor_id, bank_details } = req.body;
    const next_kyc_step = req.body.next_kyc_step;
    const last_kyc_step = req.body.last_kyc_step;
    /* if (!investor_id) {
          return badRequest(res, "Investor ID is required");
        }
    
        if (!Array.isArray(bank_details)) {
          return badRequest(res, "bank_details must be an array");
        }*/

    const updated = await saveBankAccountDetails(investor_id, next_kyc_step, last_kyc_step, bank_details);

    sendEncryptedResponse(
      res,
      { bank_details: updated },
      "Bank details updated"
    );

  } catch (error) {
    ErrorLogger.write({ type: "update-bank-details error", error });
    serverError(res, error);
  }
});

router.post("/update-nominee-details", kycRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    const { next_kyc_step, last_kyc_step, investor_id, nominee_details } = req.body;

    // --- Basic Request Validations ---
    /*if (!investor_id) {
        return badRequest(res, "Investor ID is required");
    }

    if (!Array.isArray(nominee_details)) {
        return badRequest(res, "nominee_details must be an array");
    }

    // Optional: ensure at least one nominee provided
    if (nominee_details.length === 0) {
        return badRequest(res, "At least one nominee must be provided");
    }*/

    // --- Save Nominee Details ---
    const updated = await saveNomineeDetails(next_kyc_step, last_kyc_step, investor_id, nominee_details);

    // --- Encrypted Response ---
    sendEncryptedResponse(
      res,
      { nominee_details: updated },
      "Nominee details updated"
    );

  } catch (error) {
    ErrorLogger.write({ type: "update-nominee-details error", error });
    serverError(res, error);
  }
});

router.post("/CAN-creation", kycRateLimit, async (req: any, res: any) => {
  try {

    let investorId = req.body.investor_id
    let investor_data = await getCanSummary(investorId)
    console.log("==========5465654645645654645646456", investor_data)

    let parsedInvestor = JSON.parse(JSON.stringify(investor_data))

    const payload = preparePayload(parsedInvestor);
    //let investor = null;
    console.log("0000999999999999999", payload)
    let investor = null;
    let response: any = await MFUCanFillEezzService(payload);

    const result = response?.CANIndFillEezzResp
    //console.log("Responser :==========", response)

    if (result?.RESP_HEADER?.RES_CODE == "0") {
      const _result = addHolidingAccount({
        investor_id: investorId,
        first_investor_id: investorId,
        second_investor_id: null,
        third_investor_id: null,
        account_holding_type: ACCOUNT_TYPE.find((opt: any) => opt.value === 'SI')?.code,
        CAN_Id: result?.RESP_BODY?.CAN,
        request: payload,
        response: result

      })

      let data = await updateInvestorRegistration(
        { is_kyc_complete: true, is_CAN_registered: true },
        req.body.investor_id
      );

      investor = data[1][0];
      console.log("Updation of investor after can registration", investor);

    }
    /*const response = {
      "CANIndFillEezzResp": {
        "RESP_HEADER": {
          "ENTITY_ID": "40008I",
          "UNIQUE_ID": "REQ_00000002",
          "REQUEST_TYPE": "CANINDREG",
          "VERSION_NO": "1.00",
          "TIMESTAMP": "2025-07-14T14:38:28",
          "RES_CODE": "0",
          "RES_MSG": "Success"
        },
        "RESP_BODY": {
          "CAN": "32195FF003",
          "NOM_VER_LINK_H1": "https://14.141.212.169:4091/CanCDNVLinkViewAction.do?key=ZMi1K17UamPLy6tqPO85L19dVmMEjW76ZPAZ2fSQlR5yIIeYGw/o0c1oWxwDwwbmcjCZdfSG0z2EK3lXGp+XMrJ6+V2+y05j7eIm1zsIugPyHvbIslt0Kx82R0BiI1rB+SOZNsFfk+qwPcsucQOrjNGM5y/IhGGY94ewfTXi+MUAmZbuHRtUkWucVSRyrCZm",
          "NOM_VER_LINK_H2": "",
          "NOM_VER_LINK_H3": ""
        }
      }
    }*/

    sendEncryptedResponse(res, { investor_data: investor, canResponse: response }, "MFUCanFillEezzService")


  } catch (error) {
    ErrorLogger.write({ type: "CAN-register", error });
    serverError(res, error);
  }
})


module.exports = router;