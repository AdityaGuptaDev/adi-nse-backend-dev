import axios from "axios";
import { getHardcodedUccPayload, nseUccRegistration, nseTransactionApi, nseRedemptionApi, nseSwitchApi, nseXsipRegistrationApi, nseSipRegistrationApi, nseStpRegistrationApi, nseSwpRegistrationApi, nseOrderCancellationApi, nseStpCancellationApi, nseClientBankDetailsApi, nseMandatePurchaseApi, nseMandateRedemptionApi, nseProvisionalReportApi, nseOrderStatusApi, nseBankElogUploadApi, nseMemberFundAllocationApi, nseTwoFaReportApi } from "../../services/nse.service";
import { UserRegistration } from "../partner/partner-model";
import { InvestorRegistration } from "../kyc-flow/user_basic_detail-model";
import sequelize from "sequelize/types/sequelize";
import { db } from "../../db/sql-queries/queries";
import { QueryTypes } from "sequelize";
import { UccRegistrationLog } from "./nse-ucc-reg-logs";
import { NseTransactionLog, NseSipRegistrationLog, NseCancellationLog, NseBankDetailsLog, NseMandateLog, NseReportLog, NseElogLog } from "./nse-api-logs";
import { UCCRegistration } from "./ucc-registration-model";



// registration ucc 1

// ── Helper: Format any date string to NSE-required DD-MM-YYYY ──
// Accepts: YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY, DD/MM/YYYY, ISO timestamps.
// Returns "" for empty/invalid input.
const formatDobForNse = (val: any): string => {
  if (!val) return "";
  const s = String(val).trim();
  if (!s) return "";

  // Already DD-MM-YYYY or DD/MM/YYYY
  let m = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  // YYYY-MM-DD or YYYY/MM/DD (optionally followed by time)
  m = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  // Last resort: try Date parsing
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  console.warn("[formatDobForNse] !!! could not parse date:", val);
  return "";
};

// ── Helper: Build NSE UCC payload directly from UCCRegistration table row ──
// Used as a fallback when InvestorRegistration / NomineeDetail / BankAccountDetail
// data is missing or incomplete (e.g. reg_mobile is empty).
export const buildUccPayloadFromUccRegistration = async (
  investor_id?: number,
  mobile?: string
): Promise<any | null> => {
  console.log("[buildUccPayloadFromUccRegistration] >>> lookup", { investor_id, mobile });
  let row: UCCRegistration | null = null;

  if (investor_id) {
    row = await UCCRegistration.findOne({ where: { investorId: investor_id } });
  }
  if (!row && mobile) {
    row = await UCCRegistration.findOne({ where: { indianMobileNo: mobile } });
  }

  if (!row) {
    console.log("[buildUccPayloadFromUccRegistration] !!! no UCCRegistration row found");
    return null;
  }
  console.log("[buildUccPayloadFromUccRegistration] >>> found row id =", row.id);

  const r = row;
  const payload = {
    reg_details: [
      {
        // Identity & PAN
        client_code: r.clientCode,
        tax_status: r.taxStatus,
        primary_holder_pan: r.primaryHolderPan,
        primary_holder_first_name: r.primaryHolderFirstName,
        primary_holder_middle_name: r.primaryHolderMiddleName,
        primary_holder_last_name: r.primaryHolderLastName,
        primary_holder_dob_incorporation: formatDobForNse(r.primaryHolderDobIncorporation),
        primary_holder_pan_exempt: r.primaryHolderPanExempt || "N",
        primary_holder_exempt_category: r.primaryHolderExemptCategory,
        primary_holder_kyc_type: r.primaryHolderKycType || "C",
        primary_holder_ckyc_number: r.primaryHolderCkycNumber || "1234567891",
        aadhaar_updated: r.aadhaarUpdated || "Y",
        mapin_id: r.mapinId,

        // Address
        address_1: r.address1,
        address_2: r.address2,
        address_3: r.address3,
        city: r.city,
        state: r.state,
        pincode: r.pincode,
        country: r.country,

        // Personal
        gender: r.gender,
        occupation_code: r.occupationCode || "01",
        email: r.email,
        indian_mobile_no: r.indianMobileNo,
        mobile_declaration_flag: r.mobileDeclarationFlag || "SE",
        email_declaration_flag: r.emailDeclarationFlag || "SE",

        // Holding pattern & misc
        holding_nature: r.holdingNature,
        client_type: "P",
        cmbp_id: "12345666",
        div_pay_mode: r.divPayMode || "01",
        communication_mode: r.communicationMode || "E",
        paperless_flag: r.paperlessFlag || "Z",

        // Bank 1
        account_type_1: r.accountType1,
        account_no_1: r.accountNo1,
        micr_no_1: r.micrNo1,
        ifsc_code_1: r.ifscCode1,
        default_bank_flag_1: r.defaultBankFlag1 || "Y",
        bank_name_1: r.bankName1,
        branch_name_1: r.branchName1,
        bank_address_1: r.bankAddress1,
        bank_city_1: r.bankCity1,
        bank_pincode_1: r.bankPincode1,

        // Nomination
        nomination_opt: r.nominationOpt || "Y",
        nomination_authentication: r.nominationAuthentication || "O",
        nominee_soa: r.nomineeSoa || "Y",

        // Nominee 1
        nominee_1_name: r.nominee1Name,
        nominee_1_relationship: r.nominee1Relationship,
        nominee_1_dob: formatDobForNse(r.nominee1Dob),
        nominee_1_share: r.nominee1Share,
        nominee_1_applicable: r.nominee1Share,
        nominee_1_email: r.nominee1Email,
        nominee_1_mobile: r.nominee1Mobile,
        nominee_1_identity_type: r.nominee1IdentityType,
        nominee_1_identity_number: r.nominee1IdentityNumber,
        nominee_1_minor_flag: r.nominee1MinorFlag || "N",
        nominee_1_guardian: r.nominee1Guardian,
        nominee_1_address1: r.nominee1Address1,
        nominee_1_address2: r.nominee1Address2,
        nominee_1_address3: r.nominee1Address3,
        nominee_1_city: r.nominee1City,
        nominee_1_pin: r.nominee1Pin,
        nominee_1_country: r.nominee1Country,
      },
    ],
  };

  return payload;
};

export const uccRegistration = async (
  mobile: string,
  userType: number
) => {
  let payloadForLog: any = null;
  try {
    console.log("========== UCC Registration STARTED ==========", {
      mobile,
      userType,
    });

    if (!mobile) {
      throw new Error("mobile is required to call UCC registration");
    }

    // Step 1: Check if investor exists in InvestorRegistration by mobile (from request payload)
    console.log("[uccRegistration] >>> InvestorRegistration lookup by reg_mobile =", mobile);
    const investor = await InvestorRegistration.findOne({
      where: { reg_mobile: mobile, isDelete: false },
    });
    console.log(
      "[uccRegistration] >>> InvestorRegistration result:",
      investor ? { id: investor.id, reg_mobile: investor.reg_mobile } : null
    );

    let payload: any = null;

    if (investor) {
      console.log("✅ Investor found in InvestorRegistration — using raw SQL path");

      // Step 2: Run raw SQL — match by mobile from request payload
      const query = `
        SELECT
            LPAD(ir.id::text, 5, '0') AS client_code,

            SPLIT_PART(ir.name, ' ', 1) AS primary_holder_first_name,
            SPLIT_PART(ir.name, ' ', 2) AS primary_holder_middle_name,
            SPLIT_PART(ir.name, ' ', 3) AS primary_holder_last_name,

           LPAD(ir.tax_status::text, 2, '0') AS tax_status,

            CASE
                WHEN ir.gender = 1 THEN 'M'
                WHEN ir.gender = 2 THEN 'F'
                ELSE 'O'
            END AS gender,

            TO_CHAR(ir.dob, 'DD-MM-YYYY') AS primary_holder_dob_incorporation,

            ir.holding_nature,
            ir.pan_no AS primary_holder_pan,

            ir.reg_email AS email,
            ir.reg_mobile AS indian_mobile_no,

            nd.address_line_1 AS address_1,
            nd.address_line_2 AS address_2,
            '' AS address_3,
            nd.city,
            nd.pin_code AS pincode,
            'INDIA' AS country,

            bad.account_type AS account_type_1,
            bad.account_no AS account_no_1,
            bad.micr AS micr_no_1,
            bad.ifsc AS ifsc_code_1,
            'Y' AS default_bank_flag_1,

            nd.nominee_name AS nominee_1_name,
           LPAD(nd.relation::text, 2, '0') AS nominee_1_relationship,
            nd.percentage_allocation::varchar AS nominee_1_applicable,

            CASE
                WHEN nd."nominee_DOB" IS NOT NULL THEN 'Y'
                ELSE 'N'
            END AS nominee_1_minor_flag,

            TO_CHAR(nd."nominee_DOB", 'DD-MM-YYYY') AS nominee_1_dob,

            nd.guardian_name AS nominee_1_guardian,
            nd.identity_type::varchar AS nominee_1_identity_type,
            nd.identity_number AS nominee_1_identity_number,
            nd.email_address AS nominee_1_email,
            nd.mobile_number AS nominee_1_mobile,

            nd.address_line_1 AS nominee_1_address1,
            nd.address_line_2 AS nominee_1_address2,
            '' AS nominee_1_address3,
            nd.city AS nominee_1_city,
            nd.pin_code AS nominee_1_pin,
            'INDIA' AS nominee_1_country,
             sm.bse_code as state,

            nd.nominee_folio_soa AS nominee_soa

        FROM "InvestorRegistration" ir

        LEFT JOIN LATERAL (
            SELECT * FROM "NomineeDetail"
            WHERE investor_id = ir.id
            ORDER BY id ASC LIMIT 1
        ) nd ON true
        LEFT JOIN "StateMaster" sm ON sm.id = nd.state
        LEFT JOIN LATERAL (
            SELECT * FROM "BankAccountDetail"
            WHERE investor_id = ir.id
            ORDER BY id ASC LIMIT 1
        ) bad ON true

        WHERE ir.reg_mobile = :mobile
        LIMIT 1
      `;
      const replacements = { mobile };
      console.log("[uccRegistration] >>> raw SQL replacements:", replacements);

      const results: any[] = await db.query(query, {
        replacements,
        type: QueryTypes.SELECT,
      });
      console.log("[uccRegistration] >>> raw SQL rows:", results.length);

      if (results.length > 0) {
        const dbData = results[0];
        payload = {
          reg_details: [
            {
              ...dbData,
              // Static fields
              occupation_code: "01",
              client_type: "P",
              cmbp_id: "12345666",
              div_pay_mode: "01",
              communication_mode: "E",
              primary_holder_pan_exempt: "N",
              primary_holder_kyc_type: "C", // Mandatory if PAN exempt = Y
              primary_holder_ckyc_number: "1234567891", // optional if kyc type is C
              aadhaar_updated: "Y",
              paperless_flag: "Z",
              mobile_declaration_flag: "SE",
              email_declaration_flag: "SE",
              nomination_opt: "Y",
              nominee_soa: "Y",
              nomination_authentication: "O",
            },
          ],
        };
      } else {
        // Investor row exists but join produced no row — fall through to UCCRegistration
        console.log(
          "⚠️ raw SQL returned 0 rows even though investor exists — trying UCCRegistration fallback by mobile"
        );
        payload = await buildUccPayloadFromUccRegistration(undefined, mobile);
      }
    } else {
      console.log(
        "❌ Investor not found in InvestorRegistration — using UCCRegistration table by mobile"
      );
      payload = await buildUccPayloadFromUccRegistration(undefined, mobile);
    }

    if (!payload) {
      const msg = `Cannot build UCC payload — no data found for mobile=${mobile} in InvestorRegistration or UCCRegistration`;
      console.error("[uccRegistration] !!!", msg);
      throw new Error(msg);
    }

    // Step 3: Call NSE API
    payloadForLog = payload;
    console.log("[uccRegistration] >>> payload built, about to POST to NSE...");
    console.log("[uccRegistration] >>> payload:", JSON.stringify(payload, null, 2));

    let apiResponse: any;
    try {
      apiResponse = await nseUccRegistration(payload);
    } catch (nseErr: any) {
      console.error("[uccRegistration] !!! NSE UCC API call FAILED:", nseErr?.message);
      throw new Error(
        `NSE UCC API call failed: ${nseErr?.message || String(nseErr)}`
      );
    }
    console.log("[uccRegistration] >>> NSE response received:", JSON.stringify(apiResponse, null, 2));

    const responseData = apiResponse?.reg_details?.[0];
    console.log("[uccRegistration] >>> Writing UccRegistrationLog row...");

    // ✅ SAVE INTO DB
    await UccRegistrationLog.create({
      mobile,
      userType,
      clientCode: payload?.reg_details?.[0]?.client_code,

      requestPayload: payload,
      responsePayload: apiResponse,

      status: responseData?.reg_status === "REG_SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.reg_remark,

      regId: responseData?.reg_id,
      regStatus: responseData?.reg_status,
      regRemark: responseData?.reg_remark,
    });

    console.log("✅ UCC LOG SAVED");

    if (responseData?.reg_status && responseData.reg_status !== "REG_SUCCESS") {
      throw new Error(
        `NSE UCC registration failed: ${responseData.reg_remark || responseData.reg_status}`
      );
    }

    console.log("========== UCC Registration COMPLETED ==========");
    return apiResponse;

  } catch (err: any) {
    console.log("UCC registration error =", err);
    // Persist a failure row so the request/response is always traceable in DB
    try {
      await UccRegistrationLog.create({
        mobile,
        userType,
        clientCode: payloadForLog?.reg_details?.[0]?.client_code,
        requestPayload: payloadForLog,
        responsePayload: { error: err?.message || String(err), stack: err?.stack },
        status: "FAILED",
        remark: err?.message || "UCC registration threw before response",
      });
      console.log("✅ UCC FAILURE LOG SAVED");
    } catch (logErr) {
      console.log("❌ Failed to write UccRegistrationLog failure row:", logErr);
    }
    throw err;
  }
};

// Transaction handler for NSE
export const nseTransaction = async (transactionDetails: any[]) => {
  try {
    console.log("========== NSE Transaction STARTED ==========");

    const payload = {
      transaction_details: transactionDetails
    };

    console.log("Transaction payload:", JSON.stringify(payload, null, 2));

    const apiResponse = await nseTransactionApi(payload);

    // Extract client code from first transaction detail
    const clientCode = transactionDetails[0]?.client_code || '';
    const transactionType = transactionDetails[0]?.transaction_type || 'PURCHASE';
    const transactionRefNo = transactionDetails[0]?.transaction_ref_no || '';

    // Extract response data
    const responseData = apiResponse?.transaction_details?.[0];
    
    // ✅ SAVE INTO DB
    await NseTransactionLog.create({
      clientCode,
      transactionType,
      transactionRefNo,
      requestPayload: payload,
      responsePayload: apiResponse,
      status: responseData?.status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.remark || responseData?.message,
      orderId: responseData?.order_id,
      orderStatus: responseData?.status,
      orderRemark: responseData?.remark || responseData?.message,
    });

    console.log("✅ Transaction LOG SAVED");

    console.log("NSE Transaction Response:", apiResponse);
    console.log("========== NSE Transaction COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE transaction error =", err);
    throw err;
  }
};

// Redemption handler for NSE
export const nseRedemption = async (transactionDetails: any[]) => {
  try {
    console.log("========== NSE Redemption STARTED ==========");

    const payload = {
      transaction_details: transactionDetails
    };

    console.log("Redemption payload:", JSON.stringify(payload, null, 2));

    const apiResponse = await nseRedemptionApi(payload);

    // Extract client code from first transaction detail
    const clientCode = transactionDetails[0]?.client_code || '';
    const transactionType = 'REDEMPTION';
    const transactionRefNo = transactionDetails[0]?.transaction_ref_no || '';

    // Extract response data
    const responseData = apiResponse?.transaction_details?.[0];
    
    // ✅ SAVE INTO DB
    await NseTransactionLog.create({
      clientCode,
      transactionType,
      transactionRefNo,
      requestPayload: payload,
      responsePayload: apiResponse,
      status: responseData?.status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.remark || responseData?.message,
      orderId: responseData?.order_id,
      orderStatus: responseData?.status,
      orderRemark: responseData?.remark || responseData?.message,
    });

    console.log("✅ Redemption LOG SAVED");
    console.log("NSE Redemption Response:", apiResponse);
    console.log("========== NSE Redemption COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE redemption error =", err);
    throw err;
  }
};

// Switch handler for NSE
export const nseSwitch = async (transactionDetails: any[]) => {
  try {
    console.log("========== NSE Switch STARTED ==========");

    const payload = {
      transaction_details: transactionDetails
    };

    console.log("Switch payload:", JSON.stringify(payload, null, 2));

    const apiResponse = await nseSwitchApi(payload);

    // Extract client code from first transaction detail
    const clientCode = transactionDetails[0]?.client_code || '';
    const transactionType = 'SWITCH';
    const transactionRefNo = transactionDetails[0]?.transaction_ref_no || '';

    // Extract response data
    const responseData = apiResponse?.transaction_details?.[0];
    
    // ✅ SAVE INTO DB
    await NseTransactionLog.create({
      clientCode,
      transactionType,
      transactionRefNo,
      requestPayload: payload,
      responsePayload: apiResponse,
      status: responseData?.status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.remark || responseData?.message,
      orderId: responseData?.order_id,
      orderStatus: responseData?.status,
      orderRemark: responseData?.remark || responseData?.message,
    });

    console.log("✅ Switch LOG SAVED");
    console.log("NSE Switch Response:", apiResponse);
    console.log("========== NSE Switch COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE switch error =", err);
    throw err;
  }
};

// XSIP Registration handler for NSE
export const nseXsipRegistration = async (regData: any[]) => {
  try {
    console.log("========== NSE XSIP Registration STARTED ==========");

    const payload = {
      reg_data: regData
    };

    console.log("XSIP Registration payload:", JSON.stringify(payload, null, 2));

    const apiResponse = await nseXsipRegistrationApi(payload);

    // Extract client code from first reg data
    const clientCode = regData[0]?.client_code || '';
    const registrationType = 'XSIP';
    const sipRegNo = regData[0]?.sip_reg_no || '';

    // Extract response data
    const responseData = apiResponse?.reg_data?.[0];
    
    // ✅ SAVE INTO DB
    await NseSipRegistrationLog.create({
      clientCode,
      registrationType,
      sipRegNo,
      requestPayload: payload,
      responsePayload: apiResponse,
      status: responseData?.reg_status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.reg_remark || responseData?.message,
      regId: responseData?.reg_id,
      regStatus: responseData?.reg_status,
      regRemark: responseData?.reg_remark || responseData?.message,
    });

    console.log("✅ XSIP Registration LOG SAVED");
    console.log("NSE XSIP Registration Response:", apiResponse);
    console.log("========== NSE XSIP Registration COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE XSIP registration error =", err);
    throw err;
  }
};

// SIP Registration handler for NSE
export const nseSipRegistration = async (regData: any[]) => {
  try {
    console.log("========== NSE SIP Registration STARTED ==========");

    const payload = {
      reg_data: regData
    };

    console.log("SIP Registration payload:", JSON.stringify(payload, null, 2));

    const apiResponse = await nseSipRegistrationApi(payload);

    // Extract client code from first reg data
    const clientCode = regData[0]?.client_code || '';
    const registrationType = 'SIP';
    const sipRegNo = regData[0]?.sip_reg_no || '';

    // Extract response data
    const responseData = apiResponse?.reg_data?.[0];
    
    // ✅ SAVE INTO DB
    await NseSipRegistrationLog.create({
      clientCode,
      registrationType,
      sipRegNo,
      requestPayload: payload,
      responsePayload: apiResponse,
      status: responseData?.reg_status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.reg_remark || responseData?.message,
      regId: responseData?.reg_id,
      regStatus: responseData?.reg_status,
      regRemark: responseData?.reg_remark || responseData?.message,
    });

    console.log("✅ SIP Registration LOG SAVED");
    console.log("NSE SIP Registration Response:", apiResponse);
    console.log("========== NSE SIP Registration COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE SIP registration error =", err);
    throw err;
  }
};

// STP Registration handler for NSE
export const nseStpRegistration = async (regData: any[]) => {
  try {
    console.log("========== NSE STP Registration STARTED ==========");

    const payload = {
      reg_data: regData
    };

    console.log("STP Registration payload:", JSON.stringify(payload, null, 2));

    const apiResponse = await nseStpRegistrationApi(payload);

    // Extract client code from first reg data
    const clientCode = regData[0]?.client_code || '';
    const registrationType = 'STP';
    const sipRegNo = regData[0]?.stp_reg_no || '';

    // Extract response data
    const responseData = apiResponse?.reg_data?.[0];
    
    // ✅ SAVE INTO DB
    await NseSipRegistrationLog.create({
      clientCode,
      registrationType,
      sipRegNo,
      requestPayload: payload,
      responsePayload: apiResponse,
      status: responseData?.reg_status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.reg_remark || responseData?.message,
      regId: responseData?.reg_id,
      regStatus: responseData?.reg_status,
      regRemark: responseData?.reg_remark || responseData?.message,
    });

    console.log("✅ STP Registration LOG SAVED");
    console.log("NSE STP Registration Response:", apiResponse);
    console.log("========== NSE STP Registration COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE STP registration error =", err);
    throw err;
  }
};

// SWP Registration handler for NSE
export const nseSwpRegistration = async (regData: any[]) => {
  try {
    console.log("========== NSE SWP Registration STARTED ==========");

    const payload = {
      reg_data: regData
    };

    console.log("SWP Registration payload:", JSON.stringify(payload, null, 2));

    const apiResponse = await nseSwpRegistrationApi(payload);

    // Extract client code from first reg data
    const clientCode = regData[0]?.client_code || '';
    const registrationType = 'SWP';
    const sipRegNo = regData[0]?.swp_reg_no || '';

    // Extract response data
    const responseData = apiResponse?.reg_data?.[0];
    
    // ✅ SAVE INTO DB
    await NseSipRegistrationLog.create({
      clientCode,
      registrationType,
      sipRegNo,
      requestPayload: payload,
      responsePayload: apiResponse,
      status: responseData?.reg_status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.reg_remark || responseData?.message,
      regId: responseData?.reg_id,
      regStatus: responseData?.reg_status,
      regRemark: responseData?.reg_remark || responseData?.message,
    });

    console.log("✅ SWP Registration LOG SAVED");
    console.log("NSE SWP Registration Response:", apiResponse);
    console.log("========== NSE SWP Registration COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE SWP registration error =", err);
    throw err;
  }
};

// Order Cancellation handler for NSE
export const nseOrderCancellation = async (canData: any[]) => {
  try {
    console.log("========== NSE Order Cancellation STARTED ==========");

    const payload = {
      can_data: canData
    };

    console.log("Order Cancellation payload:", JSON.stringify(payload, null, 2));

    const apiResponse = await nseOrderCancellationApi(payload);

    // Extract client code from first cancellation data
    const clientCode = canData[0]?.client_code || '';
    const cancellationType = 'ORDER';
    const originalOrderId = canData[0]?.order_id || '';

    // Extract response data
    const responseData = apiResponse?.can_data?.[0];
    
    // ✅ SAVE INTO DB
    await NseCancellationLog.create({
      clientCode,
      cancellationType,
      originalOrderId,
      requestPayload: payload,
      responsePayload: apiResponse,
      status: responseData?.can_status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.can_remark || responseData?.message,
      cancellationId: responseData?.can_id,
      cancellationStatus: responseData?.can_status,
      cancellationRemark: responseData?.can_remark || responseData?.message,
    });

    console.log("✅ Order Cancellation LOG SAVED");
    console.log("NSE Order Cancellation Response:", apiResponse);
    console.log("========== NSE Order Cancellation COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE order cancellation error =", err);
    throw err;
  }
};

// STP Cancellation handler for NSE
export const nseStpCancellation = async (canData: any[]) => {
  try {
    console.log("========== NSE STP Cancellation STARTED ==========");

    const payload = {
      can_data: canData
    };

    console.log("STP Cancellation payload:", JSON.stringify(payload, null, 2));

    const apiResponse = await nseStpCancellationApi(payload);

    // Extract client code from first cancellation data
    const clientCode = canData[0]?.client_code || '';
    const cancellationType = 'STP';
    const originalOrderId = canData[0]?.stp_reg_no || '';

    // Extract response data
    const responseData = apiResponse?.can_data?.[0];
    
    // ✅ SAVE INTO DB
    await NseCancellationLog.create({
      clientCode,
      cancellationType,
      originalOrderId,
      requestPayload: payload,
      responsePayload: apiResponse,
      status: responseData?.can_status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.can_remark || responseData?.message,
      cancellationId: responseData?.can_id,
      cancellationStatus: responseData?.can_status,
      cancellationRemark: responseData?.can_remark || responseData?.message,
    });

    console.log("✅ STP Cancellation LOG SAVED");
    console.log("NSE STP Cancellation Response:", apiResponse);
    console.log("========== NSE STP Cancellation COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE STP cancellation error =", err);
    throw err;
  }
};

// Client Bank Details handler for NSE
export const nseClientBankDetails = async (bankDtl: any[]) => {
  try {
    console.log("========== NSE Client Bank Details STARTED ==========");

    const payload = {
      bank_dtl: bankDtl
    };

    console.log("Client Bank Details payload:", JSON.stringify(payload, null, 2));

    const apiResponse = await nseClientBankDetailsApi(payload);

    // Extract client code from first bank detail
    const clientCode = bankDtl[0]?.client_code || '';

    // Extract response data
    const responseData = apiResponse?.bank_dtl?.[0];
    
    // ✅ SAVE INTO DB
    await NseBankDetailsLog.create({
      clientCode,
      requestPayload: payload,
      responsePayload: apiResponse,
      status: responseData?.bank_status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.bank_remark || responseData?.message,
      bankDetailId: responseData?.bank_id,
      bankDetailStatus: responseData?.bank_status,
      bankDetailRemark: responseData?.bank_remark || responseData?.message,
    });

    console.log("✅ Client Bank Details LOG SAVED");
    console.log("NSE Client Bank Details Response:", apiResponse);
    console.log("========== NSE Client Bank Details COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE client bank details error =", err);
    throw err;
  }
};

// Mandate Purchase handler for NSE
export const nseMandatePurchase = async (regData: any[]) => {
  try {
    console.log("========== NSE Mandate Purchase STARTED ==========");

    const payload = {
      reg_data: regData
    };

    console.log("Mandate Purchase payload:", JSON.stringify(payload, null, 2));

    const apiResponse = await nseMandatePurchaseApi(payload);

    // Extract client code from first reg data
    const clientCode = regData[0]?.client_code || '';
    const mandateType = 'PURCHASE';
    const mandateId = regData[0]?.mandate_id || '';

    // Extract response data
    const responseData = apiResponse?.reg_data?.[0];
    
    // ✅ SAVE INTO DB
    await NseMandateLog.create({
      clientCode,
      mandateType,
      mandateId,
      requestPayload: payload,
      responsePayload: apiResponse,
      status: responseData?.reg_status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.reg_remark || responseData?.message,
      regId: responseData?.reg_id,
      regStatus: responseData?.reg_status,
      regRemark: responseData?.reg_remark || responseData?.message,
    });

    console.log("✅ Mandate Purchase LOG SAVED");
    console.log("NSE Mandate Purchase Response:", apiResponse);
    console.log("========== NSE Mandate Purchase COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE mandate purchase error =", err);
    throw err;
  }
};

// Mandate Redemption handler for NSE
export const nseMandateRedemption = async (regData: any[]) => {
  try {
    console.log("========== NSE Mandate Redemption STARTED ==========");

    const payload = {
      reg_data: regData
    };

    console.log("Mandate Redemption payload:", JSON.stringify(payload, null, 2));

    const apiResponse = await nseMandateRedemptionApi(payload);

    // Extract client code from first reg data
    const clientCode = regData[0]?.client_code || '';
    const mandateType = 'REDEMPTION';
    const mandateId = regData[0]?.mandate_id || '';

    // Extract response data
    const responseData = apiResponse?.reg_data?.[0];
    
    // ✅ SAVE INTO DB
    await NseMandateLog.create({
      clientCode,
      mandateType,
      mandateId,
      requestPayload: payload,
      responsePayload: apiResponse,
      status: responseData?.reg_status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.reg_remark || responseData?.message,
      regId: responseData?.reg_id,
      regStatus: responseData?.reg_status,
      regRemark: responseData?.reg_remark || responseData?.message,
    });

    console.log("✅ Mandate Redemption LOG SAVED");
    console.log("NSE Mandate Redemption Response:", apiResponse);
    console.log("========== NSE Mandate Redemption COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE mandate redemption error =", err);
    throw err;
  }
};

// Provisional Report handler for NSE
export const nseProvisionalReport = async (reportParams: any) => {
  try {
    console.log("========== NSE Provisional Report STARTED ==========");

    console.log("Provisional Report payload:", JSON.stringify(reportParams, null, 2));

    const apiResponse = await nseProvisionalReportApi(reportParams);

    // Extract client code from report params
    const clientCode = reportParams?.client_code || '';
    const reportType = 'PROVISIONAL';

    // Extract response data
    const responseData = apiResponse?.report_data?.[0];
    
    // ✅ SAVE INTO DB
    await NseReportLog.create({
      reportType,
      clientCode,
      requestPayload: reportParams,
      responsePayload: apiResponse,
      status: responseData?.report_status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.report_remark || responseData?.message,
      reportId: responseData?.report_id,
      reportStatus: responseData?.report_status,
      reportRemark: responseData?.report_remark || responseData?.message,
    });

    console.log("✅ Provisional Report LOG SAVED");
    console.log("NSE Provisional Report Response:", apiResponse);
    console.log("========== NSE Provisional Report COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE provisional report error =", err);
    throw err;
  }
};

// Order Status handler for NSE
export const nseOrderStatus = async (statusParams: any) => {
  try {
    console.log("========== NSE Order Status STARTED ==========");

    console.log("Order Status payload:", JSON.stringify(statusParams, null, 2));

    const apiResponse = await nseOrderStatusApi(statusParams);

    // Extract client code from status params
    const clientCode = statusParams?.client_code || '';
    const reportType = 'ORDER_STATUS';

    // Extract response data
    const responseData = apiResponse?.status_data?.[0];
    
    // ✅ SAVE INTO DB
    await NseReportLog.create({
      reportType,
      clientCode,
      requestPayload: statusParams,
      responsePayload: apiResponse,
      status: responseData?.status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.remark || responseData?.message,
      reportId: responseData?.order_id,
      reportStatus: responseData?.status,
      reportRemark: responseData?.remark || responseData?.message,
    });

    console.log("✅ Order Status LOG SAVED");
    console.log("NSE Order Status Response:", apiResponse);
    console.log("========== NSE Order Status COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE order status error =", err);
    throw err;
  }
};

// Bank eLog Upload handler for NSE
export const nseBankElogUpload = async (elogData: any) => {
  try {
    console.log("========== NSE Bank eLog Upload STARTED ==========");

    console.log("Bank eLog Upload payload:", JSON.stringify(elogData, null, 2));

    const apiResponse = await nseBankElogUploadApi(elogData);

    // Extract client code from elog data
    const clientCode = elogData?.client_code || '';

    // Extract response data
    const responseData = apiResponse?.elog_data?.[0];
    
    // ✅ SAVE INTO DB
    await NseElogLog.create({
      clientCode,
      requestPayload: elogData,
      responsePayload: apiResponse,
      status: responseData?.elog_status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.elog_remark || responseData?.message,
      elogId: responseData?.elog_id,
      elogStatus: responseData?.elog_status,
      elogRemark: responseData?.elog_remark || responseData?.message,
    });

    console.log("✅ Bank eLog Upload LOG SAVED");
    console.log("NSE Bank eLog Upload Response:", apiResponse);
    console.log("========== NSE Bank eLog Upload COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE bank eLog upload error =", err);
    throw err;
  }
};

// Member Fund Allocation handler for NSE
export const nseMemberFundAllocation = async (allocationParams: any) => {
  try {
    console.log("========== NSE Member Fund Allocation STARTED ==========");

    console.log("Member Fund Allocation payload:", JSON.stringify(allocationParams, null, 2));

    const apiResponse = await nseMemberFundAllocationApi(allocationParams);

    // Extract client code from allocation params
    const clientCode = allocationParams?.client_code || '';
    const reportType = 'FUND_ALLOCATION';

    // Extract response data
    const responseData = apiResponse?.allocation_data?.[0];
    
    // ✅ SAVE INTO DB
    await NseReportLog.create({
      reportType,
      clientCode,
      requestPayload: allocationParams,
      responsePayload: apiResponse,
      status: responseData?.allocation_status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.allocation_remark || responseData?.message,
      reportId: responseData?.allocation_id,
      reportStatus: responseData?.allocation_status,
      reportRemark: responseData?.allocation_remark || responseData?.message,
    });

    console.log("✅ Member Fund Allocation LOG SAVED");
    console.log("NSE Member Fund Allocation Response:", apiResponse);
    console.log("========== NSE Member Fund Allocation COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE member fund allocation error =", err);
    throw err;
  }
};

// 2FA Report handler for NSE
export const nseTwoFaReport = async (reportParams: any) => {
  try {
    console.log("========== NSE 2FA Report STARTED ==========");

    console.log("2FA Report payload:", JSON.stringify(reportParams, null, 2));

    const apiResponse = await nseTwoFaReportApi(reportParams);

    // Extract client code from report params
    const clientCode = reportParams?.client_code || '';
    const reportType = '2FA';

    // Extract response data
    const responseData = apiResponse?.twofa_data?.[0];
    
    // ✅ SAVE INTO DB
    await NseReportLog.create({
      reportType,
      clientCode,
      requestPayload: reportParams,
      responsePayload: apiResponse,
      status: responseData?.twofa_status === "SUCCESS" ? "SUCCESS" : "FAILED",
      remark: responseData?.twofa_remark || responseData?.message,
      reportId: responseData?.twofa_id,
      reportStatus: responseData?.twofa_status,
      reportRemark: responseData?.twofa_remark || responseData?.message,
    });

    console.log("✅ 2FA Report LOG SAVED");
    console.log("NSE 2FA Report Response:", apiResponse);
    console.log("========== NSE 2FA Report COMPLETED ==========");
    
    return apiResponse;

  } catch (err) {
    console.log("NSE 2FA report error =", err);
    throw err;
  }
};

// ══════════════════════════════════════════
//  STEP 0 — PAN & Aadhaar
//  Logic: INSERT if mobile not found, else UPDATE
// ══════════════════════════════════════════
export const saveUCCStep0 = async (body: any) => {
  try {
    const {
      investor_id,
      indian_mobile_no,
      tax_status,
      primary_holder_pan,
      primary_holder_first_name,
      primary_holder_middle_name,
      primary_holder_last_name,
      primary_holder_dob_incorporation,
      primary_holder_pan_exempt,
      primary_holder_exempt_category,
      primary_holder_kyc_type,
      primary_holder_ckyc_number,
      aadhaar_updated,
      mapin_id,
      address_1,
      address_2,
      address_3,
      city,
      state,
      pincode,
      country,
      gender,
      occupation_code,
      email,
      mobile_declaration_flag,
      email_declaration_flag,
      // Guardian
      guardian_pan,
      guardian_pan_exempt,
      guardian_exempt_category,
      guardian_first_name,
      guardian_middle_name,
      guardian_last_name,
      guardian_dob,
    } = body;

    const step0Data = {
      investorId: investor_id,
      formStep: 0,
      primaryHolderPan: primary_holder_pan?.toUpperCase(),
      primaryHolderFirstName: primary_holder_first_name,
      primaryHolderMiddleName: primary_holder_middle_name,
      primaryHolderLastName: primary_holder_last_name,
      primaryHolderDobIncorporation: primary_holder_dob_incorporation,
      primaryHolderPanExempt: primary_holder_pan_exempt || "N",
      primaryHolderExemptCategory: primary_holder_exempt_category,
      primaryHolderKycType: primary_holder_kyc_type,
      primaryHolderCkycNumber: primary_holder_ckyc_number,
      aadhaarUpdated: aadhaar_updated || "Y",
      mapinId: mapin_id,
      address1: address_1,
      address2: address_2,
      address3: address_3,
      city,
      state,
      pincode,
      country,
      gender,
      occupationCode: occupation_code,
      email,
      indianMobileNo: indian_mobile_no,
      mobileDeclarationFlag: mobile_declaration_flag,
      emailDeclarationFlag: email_declaration_flag,
      guardianPan: guardian_pan?.toUpperCase(),
      guardianPanExempt: guardian_pan_exempt || "N",
      guardianExemptCategory: guardian_exempt_category,
      guardianFirstName: guardian_first_name,
      guardianMiddleName: guardian_middle_name,
      guardianLastName: guardian_last_name,
      guardianDob: guardian_dob,
    };

    // Upsert by investor_id
    const [record, created] = await UCCRegistration.findOrCreate({
      where: { investorId: investor_id },
      defaults: step0Data,
    });

    if (!created) {
      await record.update({ ...step0Data, formStep: 0 });
    }

    return {
      success: true,
      message: created
        ? "UCC record created successfully"
        : "Step 0 updated successfully",
      data: { id: record.id },
    };
  } catch (error: any) {
    console.error("saveUCCStep0 error:", error);
    return { success: false, message: error.message || "Something went wrong" };
  }
};

// ══════════════════════════════════════════
//  STEP 1 — Holding Pattern & Personal Info
// ══════════════════════════════════════════
export const saveUCCStep1 = async (body: any) => {
  try {
    const {
      investor_id,
      client_code,
      holding_nature,
      gender,
      marital_status,
      annual_income,
      wealth_source,
      address_type,
      address_1,
      address_2,
      address_3,
      city,
      state,
      pincode,
      country,
      city_of_birth,
      country_of_birth,
      pep_status,
      tax_india_only,
      tax_residency_country,
      tax_id_doc_type,
      tax_id_number,
      occupation_code,
      // Second holder
      second_holder_pan,
      second_holder_first_name,
      second_holder_middle_name,
      second_holder_last_name,
      second_holder_dob,
      second_holder_mobile,
      second_holder_mobile_relation,
      second_holder_email,
      second_holder_email_relation,
      second_holder_occupation,
      second_holder_annual_income,
      second_holder_wealth_source,
      second_holder_address_type,
      second_holder_city_of_birth,
      second_holder_country_of_birth,
      second_holder_pep,
      second_holder_tax_india_only,
      // Third holder
      third_holder_pan,
      third_holder_first_name,
      third_holder_middle_name,
      third_holder_last_name,
      third_holder_dob,
      third_holder_mobile,
      third_holder_mobile_relation,
      third_holder_email,
      third_holder_email_relation,
      third_holder_occupation,
      third_holder_annual_income,
      third_holder_wealth_source,
      third_holder_address_type,
      third_holder_city_of_birth,
      third_holder_country_of_birth,
      third_holder_pep,
      third_holder_tax_india_only,
    } = body;

    const existing = await UCCRegistration.findOne({
      where: { investorId: investor_id },
    });

    if (!existing) {
      return {
        success: false,
        message: "No UCC record found for this investor. Please complete Step 0 first.",
      };
    }

    await existing.update({
      clientCode: client_code,
      holdingNature: holding_nature,
      gender,
      maritalStatus: marital_status,
      annualIncome: annual_income,
      wealthSource: wealth_source,
      addressType: address_type,
      address1: address_1,
      address2: address_2,
      address3: address_3,
      city,
      state,
      pincode,
      country,
      cityOfBirth: city_of_birth,
      countryOfBirth: country_of_birth,
      pepStatus: pep_status,
      taxIndiaOnly: tax_india_only,
      taxResidencyCountry: tax_residency_country,
      taxIdDocType: tax_id_doc_type,
      taxIdNumber: tax_id_number,
      occupationCode: occupation_code,
      secondHolderPan: second_holder_pan?.toUpperCase(),
      secondHolderFirstName: second_holder_first_name,
      secondHolderMiddleName: second_holder_middle_name,
      secondHolderLastName: second_holder_last_name,
      secondHolderDob: second_holder_dob,
      secondHolderMobile: second_holder_mobile,
      secondHolderMobileRelation: second_holder_mobile_relation,
      secondHolderEmail: second_holder_email,
      secondHolderEmailRelation: second_holder_email_relation,
      secondHolderOccupation: second_holder_occupation,
      secondHolderAnnualIncome: second_holder_annual_income,
      secondHolderWealthSource: second_holder_wealth_source,
      secondHolderAddressType: second_holder_address_type,
      secondHolderCityOfBirth: second_holder_city_of_birth,
      secondHolderCountryOfBirth: second_holder_country_of_birth,
      secondHolderPep: second_holder_pep,
      secondHolderTaxIndiaOnly: second_holder_tax_india_only,
      thirdHolderPan: third_holder_pan?.toUpperCase(),
      thirdHolderFirstName: third_holder_first_name,
      thirdHolderMiddleName: third_holder_middle_name,
      thirdHolderLastName: third_holder_last_name,
      thirdHolderDob: third_holder_dob,
      thirdHolderMobile: third_holder_mobile,
      thirdHolderMobileRelation: third_holder_mobile_relation,
      thirdHolderEmail: third_holder_email,
      thirdHolderEmailRelation: third_holder_email_relation,
      thirdHolderOccupation: third_holder_occupation,
      thirdHolderAnnualIncome: third_holder_annual_income,
      thirdHolderWealthSource: third_holder_wealth_source,
      thirdHolderAddressType: third_holder_address_type,
      thirdHolderCityOfBirth: third_holder_city_of_birth,
      thirdHolderCountryOfBirth: third_holder_country_of_birth,
      thirdHolderPep: third_holder_pep,
      thirdHolderTaxIndiaOnly: third_holder_tax_india_only,
      formStep: 1,
    });

    return {
      success: true,
      message: "Step 1 saved successfully",
      data: { id: existing.id },
    };
  } catch (error: any) {
    console.error("saveUCCStep1 error:", error);
    return { success: false, message: error.message || "Something went wrong" };
  }
};

// ══════════════════════════════════════════
//  STEP 2 — Nominee Details
// ══════════════════════════════════════════
export const saveUCCStep2 = async (body: any) => {
  try {
    const { investor_id } = body;

    const existing = await UCCRegistration.findOne({
      where: { investorId: investor_id },
    });

    if (!existing) {
      return {
        success: false,
        message: "No UCC record found for this investor. Please complete Step 0 first.",
      };
    }

    // Pull all nominee fields dynamically
    const nomineeFields: Record<string, any> = {};
    const nomineeKeys = [
      "name", "relationship", "dob", "share", "email", "mobile",
      "identity_type", "identity_number", "minor_flag", "guardian",
      "guardian_pan", "same_address", "address1", "address2",
      "address3", "pin", "city", "country",
    ];

    [1, 2, 3].forEach((idx) => {
      nomineeKeys.forEach((key) => {
        const fieldName = `nominee_${idx}_${key}`;
        if (body[fieldName] !== undefined) {
          nomineeFields[fieldName] = body[fieldName];
        }
      });
    });

    await existing.update({
      nominationOpt: body.nomination_opt,
      nominationAuthentication: body.nomination_authentication,
      nomineeSoa: body.nominee_soa,
      doNotWishToNominate: body.do_not_wish_to_nominate,
      showNomineeInSoa: body.show_nominee_in_soa,
      ...nomineeFields,
      formStep: 2,
    });

    return {
      success: true,
      message: "Step 2 (Nominees) saved successfully",
      data: { id: existing.id },
    };
  } catch (error: any) {
    console.error("saveUCCStep2 error:", error);
    return { success: false, message: error.message || "Something went wrong" };
  }
};

// ══════════════════════════════════════════
//  STEP 3 — Bank Details + Final Submit
// ══════════════════════════════════════════
export const saveUCCStep3 = async (body: any) => {
  console.log("[saveUCCStep3] >>> ENTERED");
  try {
    console.log("[saveUCCStep3] >>> destructuring body...");
    const {
      investor_id,
      account_type_1, account_no_1, micr_no_1, ifsc_code_1,
      default_bank_flag_1, bank_name_1, branch_name_1,
      bank_address_1, bank_city_1, bank_pincode_1,
      account_type_2, account_no_2, micr_no_2, ifsc_code_2,
      default_bank_flag_2, bank_name_2, branch_name_2,
      bank_address_2, bank_city_2, bank_pincode_2,
      div_pay_mode,
      communication_mode,
      paperless_flag,
      cheque_name,
      resi_phone,
      resi_fax,
      office_phone,
      office_fax,
      foreign_address_1,
      foreign_address_2,
      foreign_address_3,
      foreign_address_city,
      foreign_address_pincode,
      foreign_address_state,
      foreign_address_country,
      reg_id,
      reg_status,
      reg_remark,
    } = body;

    console.log("[saveUCCStep3] >>> investor_id =", investor_id);
    console.log("[saveUCCStep3] >>> Looking up UCCRegistration row by investorId...");
    const existing = await UCCRegistration.findOne({
      where: { investorId: investor_id },
    });
    console.log("[saveUCCStep3] >>> existing UCCRegistration row:", existing ? { id: existing.id, formStep: existing.formStep } : null);

    if (!existing) {
      console.log("[saveUCCStep3] !!! No UCCRegistration row — must complete Step 0 first");
      return {
        success: false,
        message: "No UCC record found for this investor. Please complete Step 0 first.",
      };
    }

    console.log("[saveUCCStep3] >>> Updating existing row with bank/foreign/final fields...");
    await existing.update({
      accountType1: account_type_1, accountNo1: account_no_1, micrNo1: micr_no_1,
      ifscCode1: ifsc_code_1?.toUpperCase(),
      defaultBankFlag1: default_bank_flag_1, bankName1: bank_name_1, branchName1: branch_name_1,
      bankAddress1: bank_address_1, bankCity1: bank_city_1, bankPincode1: bank_pincode_1,
      accountType2: account_type_2, accountNo2: account_no_2, micrNo2: micr_no_2,
      ifscCode2: ifsc_code_2?.toUpperCase(),
      defaultBankFlag2: default_bank_flag_2, bankName2: bank_name_2, branchName2: branch_name_2,
      bankAddress2: bank_address_2, bankCity2: bank_city_2, bankPincode2: bank_pincode_2,
      divPayMode: div_pay_mode,
      communicationMode: communication_mode,
      paperlessFlag: paperless_flag,
      chequeName: cheque_name,
      resiPhone: resi_phone,
      resiFax: resi_fax,
      officePhone: office_phone,
      officeFax: office_fax,
      foreignAddress1: foreign_address_1,
      foreignAddress2: foreign_address_2,
      foreignAddress3: foreign_address_3,
      foreignAddressCity: foreign_address_city,
      foreignAddressPincode: foreign_address_pincode,
      foreignAddressState: foreign_address_state,
      foreignAddressCountry: foreign_address_country,
      regId: reg_id,
      regStatus: reg_status,
      regRemark: reg_remark,
      formStep: 3,         // marks record as fully submitted
    });

    console.log("[saveUCCStep3] >>> update completed, row id =", existing.id);
    return {
      success: true,
      message: "UCC registration completed successfully",
      data: { id: existing.id },
    };
  } catch (error: any) {
    console.error("[saveUCCStep3] !!! ERROR:", error?.message);
    console.error("[saveUCCStep3] !!! stack:", error?.stack);
    return { success: false, message: error.message || "Something went wrong" };
  }
};
