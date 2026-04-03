import axios from "axios";
import { getHardcodedUccPayload, nseUccRegistration, nseTransactionApi, nseRedemptionApi, nseSwitchApi, nseXsipRegistrationApi, nseSipRegistrationApi, nseStpRegistrationApi, nseSwpRegistrationApi, nseOrderCancellationApi, nseStpCancellationApi, nseClientBankDetailsApi, nseMandatePurchaseApi, nseMandateRedemptionApi, nseProvisionalReportApi, nseOrderStatusApi, nseBankElogUploadApi, nseMemberFundAllocationApi, nseTwoFaReportApi } from "../../services/nse.service";
import { UserRegistration } from "../partner/partner-model";
import { InvestorRegistration } from "../kyc-flow/user_basic_detail-model";
import sequelize from "sequelize/types/sequelize";
import { db } from "../../db/sql-queries/queries";
import { QueryTypes } from "sequelize";
import { UccRegistrationLog } from "./nse-ucc-reg-logs";
import { NseTransactionLog, NseSipRegistrationLog, NseCancellationLog, NseBankDetailsLog, NseMandateLog, NseReportLog, NseElogLog } from "./nse-api-logs";



// registration ucc 1 

export const uccRegistration = async (mobile: string, userType: number) => {
  try {
    console.log("========== UCC Registration STARTED ==========");

    // Step 1: Check if investor exists
    const investor = await InvestorRegistration.findOne({
      where: {
        reg_mobile: mobile,
        isDelete: false,
      },
    });

    let payload;

    if (investor) {
      console.log("✅ Investor found, fetching DB data...");

      // Step 2: Run raw SQL
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


    const results = await db.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });
    console.log("Raw SQL query executed, results =", results);

      if (results.length > 0) {
        const dbData = results[0];

        payload = {
          reg_details: [
            {
              ...dbData,

              // Add static fields
              occupation_code: "01",
              client_type: "P",
              cmbp_id: "12345666",
              div_pay_mode: "01",
              communication_mode: "E",
              primary_holder_pan_exempt: "N",
               primary_holder_kyc_type: "C",//Mandatory if PAN exempt = Y
              primary_holder_ckyc_number: "1234567891",//optional if kyc type is C
              aadhaar_updated: "Y",
              paperless_flag: "Z",
              mobile_declaration_flag: "SE",
              email_declaration_flag: "SE",
              nomination_opt: "Y",
              nominee_soa:"Y",
              nomination_authentication: "O",
            },
          ],
        };
      } else {
        console.log("⚠️ No DB data found, using fallback");
        payload = getHardcodedUccPayload();
      }

    } else {
      console.log("❌ Investor not found, using hardcoded payload");
      payload = getHardcodedUccPayload();
    }

    // Step 3: Call NSE API

    const apiResponse = await nseUccRegistration(payload);

    const responseData = apiResponse?.reg_details?.[0];

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

    console.log("========== UCC Registration COMPLETED ==========");
    return apiResponse;

  } catch (err) {
    console.log("UCC registration error =", err);
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


