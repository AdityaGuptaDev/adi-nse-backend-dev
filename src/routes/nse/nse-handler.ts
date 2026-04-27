import axios from "axios";
import { getHardcodedUccPayload, nseUccRegistration, nseTransactionApi, nseRedemptionApi, nseSwitchApi, nseXsipRegistrationApi, nseSipRegistrationApi, nseStpRegistrationApi, nseSwpRegistrationApi, nseOrderCancellationApi, nseStpCancellationApi, nseClientBankDetailsApi, nseMandatePurchaseApi, nseMandateRedemptionApi, nseProvisionalReportApi, nseOrderStatusApi, nseBankElogUploadApi, nseMemberFundAllocationApi, nseTwoFaReportApi, nseTransactionDetailReportApi } from "../../services/nse.service";
import { UserRegistration } from "../partner/partner-model";
import { InvestorRegistration } from "../kyc-flow/user_basic_detail-model";
import sequelize from "sequelize/types/sequelize";
import { db } from "../../db/sql-queries/queries";
import { QueryTypes } from "sequelize";
import { UccRegistrationLog } from "./nse-ucc-reg-logs";
import { NseTransactionLog, NseSipRegistrationLog, NseCancellationLog, NseBankDetailsLog, NseMandateLog, NseReportLog, NseElogLog } from "./nse-api-logs";
import { UCCRegistration } from "./ucc-registration-model";
import { StateMaster } from "../state_master/state_master-model";
import { Op } from "sequelize";



// registration ucc 1

// ── Helper: Undo "/" → "#x2F" sanitization so NSE gets real slashes ──
// The inbound sanitization middleware HTML-escapes every "/" to "&#x2F;"
// for XSS defense, and the "&" and ";" are stripped downstream leaving
// "#x2F" literally in the payload. NSE needs real DD/MM/YYYY dates and
// real forward slashes in every string field, so we walk the payload
// recursively and replace them all before forwarding to NSE.
export const nseUnescapeSlashes = <T>(obj: T): T => {
  if (obj == null) return obj;
  if (typeof obj === "string") {
    return obj.replace(/#x2F/gi, "/") as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(nseUnescapeSlashes) as unknown as T;
  }
  if (typeof obj === "object") {
    const out: any = {};
    for (const k of Object.keys(obj as any)) {
      out[k] = nseUnescapeSlashes((obj as any)[k]);
    }
    return out;
  }
  return obj;
};

// ── Helper: Format any date string to NSE-required DD-MM-YYYY ──
// Accepts: YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY, DD/MM/YYYY, ISO timestamps.
// Returns "" for empty/invalid input.
const formatDobForNse = (val: any): string => {
  if (!val) return "";
  const s = String(val).trim();
  if (!s) return "";

  // Already DD-MM-YYYY or DD/MM/YYYY
  let m = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (m) return `${m[1]}/${m[2]}/${m[3]}`;

  // YYYY-MM-DD or YYYY/MM/DD (optionally followed by time)
  m = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;

  // Last resort: try Date parsing
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  console.warn("[formatDobForNse] !!! could not parse date:", val);
  return "";
};

// ── Helper: Map UCC annual_income code → FATCA inc_slab code ──
// UCC codes: 01=Below1L, 02=1-5L, 03=5-10L, 04=10-25L, 05=25L-1Cr, 06=>1Cr
// FATCA codes: 31=Below1L, 32=1-5L, 33=5-10L, 34=10-25L, 35=25L-1Cr, 36=>1Cr
const mapAnnualIncomeToFatcaSlab = (uccCode: string | null | undefined): string => {
  const map: Record<string, string> = {
    "01": "31",
    "02": "32",
    "03": "33",
    "04": "34",
    "05": "35",
    "06": "36",
  };
  return map[uccCode || ""] || "31";
};

// ── Helper: Resolve state name/code → NSE bse_code (2-char code) ──
// NSE expects state as a 2-char code (e.g., "UP"), not the full name "Uttar Pradesh".
const resolveStateBseCode = async (val: any): Promise<string> => {
  if (!val) return "";
  const s = String(val).trim();
  if (!s) return "";

  // If already a 2-char code, return as-is uppercased
  if (s.length === 2) return s.toUpperCase();

  try {
    const row = await StateMaster.findOne({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: s } },
          { state_code: { [Op.iLike]: s } },
          { bse_code: { [Op.iLike]: s } },
        ],
      },
      attributes: ["bse_code", "name"],
    });
    if (row && row.bse_code) {
      console.log(`[resolveStateBseCode] "${s}" → "${row.bse_code}"`);
      return row.bse_code;
    }
  } catch (e) {
    console.warn("[resolveStateBseCode] lookup failed:", e);
  }

  console.warn("[resolveStateBseCode] !!! could not resolve state:", val);
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
  // Resolve state name → NSE 2-char bse_code
  const stateCode = await resolveStateBseCode(r.state);

  // NSE expects country in UPPERCASE
  const normalizeCountry = (c: any): string => {
    if (!c) return "INDIA";
    return String(c).trim().toUpperCase();
  };

  // NSE rules per UCC 183-Column spec (page 50, fields 131-132):
  //   • If nominee_X_name is entered → identity_type is MANDATORY
  //   • If identity_type is entered → identity_number is MANDATORY
  //
  // Special case: minor nominees don't have their own ID. The form hides
  // the ID Proof / ID Number fields for minors and collects Guardian PAN
  // instead. We satisfy NSE by auto-filling identity_type=1 (PAN) and
  // identity_number=guardian's PAN — which is the legally responsible
  // identity on the account anyway.
  //
  // Pre-flight validation: if nominee is opted in but identity is missing
  // and we can't derive it from guardian, throw a clear error BEFORE
  // hitting NSE so the user gets actionable feedback.
  const validateAndNormalizeNomineeIdentity = (
    nomineeIndex: number,
    nomineeName: any,
    type: any,
    number: any,
    isMinor: any,
    guardianPan: any,
  ): { type: string; number: string } => {
    const name = nomineeName ? String(nomineeName).trim() : "";
    const t = type ? String(type).trim() : "";
    const n = number ? String(number).trim() : "";
    const minor =
      isMinor === true ||
      isMinor === "Y" ||
      isMinor === "y" ||
      isMinor === 1 ||
      isMinor === "1";
    const gpan = guardianPan ? String(guardianPan).trim().toUpperCase() : "";

    // No nominee at this slot → nothing to validate
    if (!name) return { type: "", number: "" };

    // Minor nominee → use Guardian PAN as the identity (type 1 = PAN).
    if (minor) {
      if (!gpan) {
        throw new Error(
          `Nominee ${nomineeIndex} is marked as a minor but Guardian PAN is missing. ` +
            `Please enter the Guardian PAN on the form so it can be sent as the nominee's identity to NSE.`,
        );
      }
      return { type: "1", number: gpan };
    }

    // Nominee exists but identity_type missing → fatal
    if (!t) {
      throw new Error(
        `Nominee ${nomineeIndex} identity type is required when a nominee is provided. ` +
          `Please collect "Nominee ${nomineeIndex} ID Type" (1=PAN, 2=Aadhaar last 4 digits, 3=Driving Licence, 4=Passport) on the form.`
      );
    }

    // identity_type given but identity_number missing → fatal
    if (!n) {
      throw new Error(
        `Nominee ${nomineeIndex} identity number is required (identity type "${t}" was provided). ` +
          `Please collect "Nominee ${nomineeIndex} ID Number" on the form.`
      );
    }

    return { type: t, number: n };
  };

  const nom1Id = validateAndNormalizeNomineeIdentity(
    1,
    r.nominee1Name,
    r.nominee1IdentityType,
    r.nominee1IdentityNumber,
    r.nominee1MinorFlag,
    r.nominee1GuardianPan,
  );
  const nom2Id = validateAndNormalizeNomineeIdentity(
    2,
    r.nominee2Name,
    r.nominee2IdentityType,
    r.nominee2IdentityNumber,
    r.nominee2MinorFlag,
    r.nominee2GuardianPan,
  );
  const nom3Id = validateAndNormalizeNomineeIdentity(
    3,
    r.nominee3Name,
    r.nominee3IdentityType,
    r.nominee3IdentityNumber,
    r.nominee3MinorFlag,
    r.nominee3GuardianPan,
  );

  // Only ship a nominee slot when that nominee actually has a name. A slot
  // with no name is one the user didn't fill — sending empty strings would
  // still be counted by NSE's nominee validator and break "NOMINEE TOTAL
  // PERCENTAGE MUST BE 100".
  const hasNominee2 = !!(r.nominee2Name && String(r.nominee2Name).trim());
  const hasNominee3 = !!(r.nominee3Name && String(r.nominee3Name).trim());

  // NSE rejects with "NOMINEE X MOBILE IS REQUIRED" for any populated
  // nominee row that has a blank mobile, even when minor_flag = Y. The
  // form keeps Mobile blank for minors (it's the guardian who's
  // contactable), so when a minor has no mobile of their own we fall
  // back to the primary holder's mobile — that's the guardian's number
  // in practice and satisfies the NSE mandatory check.
  const fallbackMobile = (own: any, isMinor: any): string => {
    const minor =
      isMinor === true ||
      isMinor === "Y" ||
      isMinor === "y" ||
      isMinor === 1 ||
      isMinor === "1";
    const trimmed = own ? String(own).trim() : "";
    if (trimmed) return trimmed;
    if (minor) return String(r.indianMobileNo || "").trim();
    return "";
  };

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
        state: stateCode,
        pincode: r.pincode,
        country: normalizeCountry(r.country),

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
        nominee_1_mobile: fallbackMobile(r.nominee1Mobile, r.nominee1MinorFlag),
        nominee_1_identity_type: nom1Id.type,
        nominee_1_identity_number: nom1Id.number,
        nominee_1_minor_flag: r.nominee1MinorFlag || "N",
        nominee_1_guardian: r.nominee1Guardian,
        nominee_1_address1: r.nominee1Address1,
        nominee_1_address2: r.nominee1Address2,
        nominee_1_address3: r.nominee1Address3,
        nominee_1_city: r.nominee1City,
        nominee_1_pin: r.nominee1Pin,
        nominee_1_country: normalizeCountry(r.nominee1Country),

        // Nominee 2 — only included when the user actually added one.
        // NSE sums nominee shares and rejects totals != 100, so every
        // nominee the user filled has to be shipped with its share here.
        ...(hasNominee2 && {
          nominee_2_name: r.nominee2Name,
          nominee_2_relationship: r.nominee2Relationship,
          nominee_2_dob: formatDobForNse(r.nominee2Dob),
          nominee_2_share: r.nominee2Share,
          nominee_2_applicable: r.nominee2Share,
          nominee_2_email: r.nominee2Email,
          nominee_2_mobile: fallbackMobile(r.nominee2Mobile, r.nominee2MinorFlag),
          nominee_2_identity_type: nom2Id.type,
          nominee_2_identity_number: nom2Id.number,
          nominee_2_minor_flag: r.nominee2MinorFlag ? "Y" : "N",
          nominee_2_guardian: r.nominee2Guardian,
          nominee_2_address1: r.nominee2Address1,
          nominee_2_address2: r.nominee2Address2,
          nominee_2_address3: r.nominee2Address3,
          nominee_2_city: r.nominee2City,
          nominee_2_pin: r.nominee2Pin,
          nominee_2_country: normalizeCountry(r.nominee2Country),
        }),

        // Nominee 3 — same conditional inclusion as Nominee 2.
        ...(hasNominee3 && {
          nominee_3_name: r.nominee3Name,
          nominee_3_relationship: r.nominee3Relationship,
          nominee_3_dob: formatDobForNse(r.nominee3Dob),
          nominee_3_share: r.nominee3Share,
          nominee_3_applicable: r.nominee3Share,
          nominee_3_email: r.nominee3Email,
          nominee_3_mobile: fallbackMobile(r.nominee3Mobile, r.nominee3MinorFlag),
          nominee_3_identity_type: nom3Id.type,
          nominee_3_identity_number: nom3Id.number,
          nominee_3_minor_flag: r.nominee3MinorFlag ? "Y" : "N",
          nominee_3_guardian: r.nominee3Guardian,
          nominee_3_address1: r.nominee3Address1,
          nominee_3_address2: r.nominee3Address2,
          nominee_3_address3: r.nominee3Address3,
          nominee_3_city: r.nominee3City,
          nominee_3_pin: r.nominee3Pin,
          nominee_3_country: normalizeCountry(r.nominee3Country),
        }),
      },
    ],
  };

  return payload;
};

// One-time lazy ALTER TABLE — guarantees the fatca_* columns exist on the
// UCCRegistration table regardless of how old the DB is, without requiring a
// separate migration step. Idempotent thanks to `ADD COLUMN IF NOT EXISTS`.
let fatcaColumnsChecked = false;
const ensureFatcaColumns = async () => {
  if (fatcaColumnsChecked) return;
  try {
    await db.query(`
      ALTER TABLE "UCCRegistration"
        ADD COLUMN IF NOT EXISTS fatca_reg_id VARCHAR(50),
        ADD COLUMN IF NOT EXISTS fatca_status VARCHAR(20),
        ADD COLUMN IF NOT EXISTS fatca_remark VARCHAR(500),
        ADD COLUMN IF NOT EXISTS fatca_submitted_at TIMESTAMP WITH TIME ZONE;
    `);
    fatcaColumnsChecked = true;
    console.log("[ensureFatcaColumns] >>> fatca_* columns verified/created");
  } catch (err) {
    console.error("[ensureFatcaColumns] !!! failed:", err);
    // Don't block the request — FATCA chain will still run, only persistence
    // of the status will fail silently if the column really isn't there.
  }
};

// ════════════════════════════════════════════════════════════════════════════
// FATCA payload builder — NSE requires FATCA to be submitted BEFORE the UCC
// CLIENTCOMMON183 call. The FATCA fields come from the same UCCRegistration
// row that Step 1 of the create-UCC form fills in (city_of_birth,
// country_of_birth, pep_status, tax_residency_country, wealth_source,
// annual_income, occupation_code, etc.), plus static defaults that match the
// existing "Submit FATCA" modal in the investor list.
// ════════════════════════════════════════════════════════════════════════════
export const buildFatcaPayloadFromUccRegistrationRow = (
  row: UCCRegistration
): any => {
  // ISO-2 country code helper. NSE's FATCA API wants 2-char country codes
  // (IN, US, …) not full country names.
  const toIso2 = (v: any): string => {
    const s = (v ?? "").toString().trim().toUpperCase();
    if (!s) return "IN";
    if (s.length === 2) return s;
    // Map the names we see most often back to ISO-2. Everything else falls
    // back to "IN" — NSE will reject unknown codes and the user will see it.
    const MAP: Record<string, string> = {
      INDIA: "IN",
      "UNITED STATES": "US",
      USA: "US",
      "UNITED KINGDOM": "GB",
      UK: "GB",
      CANADA: "CA",
      AUSTRALIA: "AU",
      SINGAPORE: "SG",
      UAE: "AE",
      "UNITED ARAB EMIRATES": "AE",
    };
    return MAP[s] || s.slice(0, 2);
  };

  const fullName = [
    row.primaryHolderFirstName,
    row.primaryHolderMiddleName,
    row.primaryHolderLastName,
  ]
    .map((p) => (p || "").toString().trim())
    .filter(Boolean)
    .join(" ");

  const poBirInc = (row.cityOfBirth || "").toString().trim();
  const coBirInc = toIso2(row.countryOfBirth || "INDIA");
  const taxRes1 = toIso2(row.taxResidencyCountry || "INDIA");

  // NSE FATCA reg_details shape — mirrors the one used by the manual "Submit
  // FATCA" modal in the investor list so the backend is the single source of
  // truth for defaults.
  return {
    reg_details: [
      {
        pan_rp: row.primaryHolderPan || "",
        pekrn: "",
        inv_name: fullName || "",
        dob: formatDobForNse(row.primaryHolderDobIncorporation) || "",
        fr_name: "",
        sp_name: "",
        tax_status: row.taxStatus || "01",
        data_src: "E",
        addr_type: row.addressType || "1",
        po_bir_inc: poBirInc,
        co_bir_inc: coBirInc,
        tax_res1: taxRes1,
        tpin1: row.primaryHolderPan || "",
        id1_type: "C",
        tax_res2: "",
        tpin2: "",
        id2_type: "",
        tax_res3: "",
        tpin3: "",
        id3_type: "",
        tax_res4: "",
        tpin4: "",
        id4_type: "",
        srce_wealt: row.wealthSource || "01",
        corp_servs: "",
        inc_slab: mapAnnualIncomeToFatcaSlab(row.annualIncome),
        net_worth: "",
        nw_date: "",
        pep_flag: row.pepStatus || "N",
        occ_code: row.occupationCode || "01",
        occ_type: "B",
        exemp_code: "",
        ffi_drnfe: "",
        giin_no: "",
        spr_entity: "",
        giin_na: "",
        giin_exemc: "",
        nffe_catg: "",
        act_nfe_sc: "",
        nature_bus: "",
        rel_listed: "",
        exch_name: "O",
        ubo_appl: "N",
        ubo_count: "",
        ubo_name: "",
        ubo_pan: "",
        ubo_nation: "",
        ubo_add1: "",
        ubo_add2: "",
        ubo_add3: "",
        ubo_city: "",
        ubo_pin: "",
        ubo_state: "",
        ubo_cntry: "",
        ubo_add_ty: "",
        ubo_ctr: "",
        ubo_tin: "",
        ubo_id_ty: "",
        ubo_cob: "",
        ubo_dob: "",
        ubo_gender: "",
        ubo_fr_nam: "",
        ubo_occ: "",
        ubo_occ_ty: "",
        ubo_tel: "",
        ubo_mobile: "",
        ubo_code: "",
        ubo_hol_pc: "",
        sdf_flag: "Y",
        ubo_df: "N",
        aadhaar_rp: "",
        new_change: "",
        log_name: fullName.substring(0, 30),
        filler1: "",
        filler2: "",
      },
    ],
  };
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

    // Lazily ensure the fatca_* tracking columns exist. No-op after the
    // first call in the process.
    await ensureFatcaColumns();

    if (!mobile) {
      throw new Error("mobile is required to call UCC registration");
    }

    let payload: any = null;

    // Step 1 (PRIMARY): Try UCCRegistration table by mobile — this holds the data the
    // user just filled in via /nse/ucc/step-0..3 and is the most authoritative source.
    console.log("[uccRegistration] >>> PRIMARY: looking up UCCRegistration by mobile =", mobile);
    payload = await buildUccPayloadFromUccRegistration(undefined, mobile);

    if (payload) {
      console.log("✅ Built payload from UCCRegistration table");
    } else {
      console.log(
        "⚠️ No UCCRegistration row for this mobile — falling back to InvestorRegistration raw SQL"
      );

      // Step 2 (FALLBACK): Older onboarding data via InvestorRegistration + joins
      const investor = await InvestorRegistration.findOne({
        where: { reg_mobile: mobile, isDelete: false },
      });
      console.log(
        "[uccRegistration] >>> InvestorRegistration result:",
        investor ? { id: investor.id, reg_mobile: investor.reg_mobile } : null
      );

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
          console.log(
            "⚠️ raw SQL returned 0 rows for this mobile"
          );
        }
      } else {
        console.log(
          "❌ Investor not found in InvestorRegistration either"
        );
      }
    }

    if (!payload) {
      const msg = `Cannot build UCC payload — no data found for mobile=${mobile} in InvestorRegistration or UCCRegistration`;
      console.error("[uccRegistration] !!!", msg);
      throw new Error(msg);
    }

    // ════════════════════════════════════════════════════════════════════════
    // NSE REQUIREMENT: FATCA must be uploaded BEFORE UCC registration. If the
    // FATCA row for this UCC has already succeeded we skip it (idempotent on
    // retries after a transient UCC failure). Only rows coming from the
    // UCCRegistration table path have the FATCA columns we need; the raw-SQL
    // InvestorRegistration fallback path silently skips FATCA since those
    // investors are legacy and may already have FATCA on file via a different
    // flow.
    // ════════════════════════════════════════════════════════════════════════
    const uccRow = await UCCRegistration.findOne({
      where: { indianMobileNo: mobile },
    });

    if (uccRow) {
      const alreadyDone =
        uccRow.fatcaStatus === "REG_SUCCESS" ||
        uccRow.regStatus === "REG_SUCCESS"; // old rows created before we tracked fatcaStatus
      if (alreadyDone) {
        console.log(
          "[uccRegistration] >>> FATCA already SUCCESS for this UCC — skipping re-upload"
        );
      } else {
        console.log("[uccRegistration] >>> FATCA upload STARTED");
        const fatcaPayload = buildFatcaPayloadFromUccRegistrationRow(uccRow);
        console.log(
          "[uccRegistration] >>> FATCA payload:",
          JSON.stringify(fatcaPayload, null, 2)
        );

        let fatcaResponse: any;
        try {
          fatcaResponse = await nseFatcaUploadApi(fatcaPayload);
        } catch (fatcaErr: any) {
          console.error(
            "[uccRegistration] !!! FATCA API call FAILED:",
            fatcaErr?.message
          );
          throw new Error(
            `NSE FATCA upload failed before UCC registration: ${
              fatcaErr?.message || String(fatcaErr)
            }`
          );
        }

        const fatcaReg = fatcaResponse?.reg_details?.[0] || {};
        const fatcaStatus: string | null = fatcaReg.reg_status || null;
        const fatcaRemark: string | null =
          fatcaReg.reg_remark || fatcaResponse?.message || null;
        const fatcaRegIdVal: string | null = fatcaReg.reg_id || null;

        // Persist — wrapped in try/catch because the fatca_* columns may not
        // yet exist on older databases. The chain must still work.
        try {
          await UCCRegistration.update(
            {
              fatcaRegId: fatcaRegIdVal,
              fatcaStatus: fatcaStatus,
              fatcaRemark: fatcaRemark,
              fatcaSubmittedAt: new Date(),
            },
            { where: { indianMobileNo: mobile } }
          );
        } catch (persistErr) {
          console.error(
            "[uccRegistration] !!! Failed to persist FATCA status (missing columns?):",
            persistErr
          );
        }

        if (fatcaStatus && fatcaStatus !== "REG_SUCCESS") {
          throw new Error(
            `NSE FATCA upload rejected — ${fatcaRemark || fatcaStatus}. UCC not attempted.`
          );
        }
        console.log("[uccRegistration] >>> FATCA upload COMPLETED with status =", fatcaStatus);
      }
    } else {
      console.log(
        "[uccRegistration] >>> No UCCRegistration row for this mobile — skipping FATCA chain (legacy fallback path)"
      );
    }

    // Step 3: Call NSE UCC API
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

    // Mark UCCRegistration row as successfully created on NSE (ucc_created = 1)
    if (responseData?.reg_status === "REG_SUCCESS") {
      try {
        const [updatedCount] = await UCCRegistration.update(
          {
            uccCreated: 1,
            regId: responseData?.reg_id,
            regStatus: responseData?.reg_status,
            regRemark: responseData?.reg_remark,
          },
          { where: { indianMobileNo: mobile } }
        );
        console.log(
          `[uccRegistration] >>> UCCRegistration.ucc_created flagged for mobile=${mobile}, rows updated =`,
          updatedCount
        );
      } catch (flagErr) {
        console.error("[uccRegistration] !!! Failed to flag ucc_created:", flagErr);
      }

      // Chain GET_LINK so the frontend can redirect the investor straight
      // to the UCC activation page (productType CL_ACT, refId = client_code).
      // Failure here is non-fatal — we already returned UCC success.
      await attachUccActivationLink(apiResponse);
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
    console.log("========== NSE Redemption STARTED [v2: slash-unescape] ==========");

    const payload = {
      transaction_details: nseUnescapeSlashes(transactionDetails)
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
    console.log("========== NSE Switch STARTED [v2: slash-unescape] ==========");

    const payload = {
      transaction_details: nseUnescapeSlashes(transactionDetails)
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
    console.log("========== NSE XSIP Registration STARTED [v2: slash-unescape + member_code backfill] ==========");

    // Backfill member_code from env so the frontend doesn't have to hardcode
    // the broker's NSE member ID. Anything already set on the row wins.
    // Dates and other strings are de-sanitized via the shared helper.
    const memberCode = process.env.NSE_MEMBER_ID || '1003039';
    const enrichedRegData = regData.map((r) => {
      const cleaned = nseUnescapeSlashes(r ?? {});
      return {
        ...cleaned,
        member_code: (cleaned as any)?.member_code || memberCode,
      };
    });

    const payload = {
      reg_data: enrichedRegData
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

    // Chain GET_LINK so the frontend can redirect the investor to the
    // XSIP authorization page (productType XSIP_REG, refId = reg_id).
    await attachAuthLink(apiResponse, "XSIP_REG");

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

    // Chain GET_LINK for SIP authorization (productType SIP_REG).
    await attachAuthLink(apiResponse, "SIP_REG");

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
    console.log("========== NSE SWP Registration STARTED [v2: slash-unescape + member_code backfill] ==========");

    // Backfill member_code from env (same pattern as XSIP) and unescape
    // the sanitizer's "#x2F" back to "/" so NSE receives real dates.
    const memberCode = process.env.NSE_MEMBER_ID || '1003039';
    const enrichedRegData = regData.map((r) => {
      const cleaned = nseUnescapeSlashes(r ?? {});
      return {
        ...cleaned,
        member_code: (cleaned as any)?.member_code || memberCode,
      };
    });

    const payload = {
      reg_data: enrichedRegData
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

// After a registration (mandate / XSIP / SIP / etc.) succeeds on NSE,
// fetch the corresponding authorization short URL via GET_LINK and
// attach it onto reg_data[0]. Failure here must NOT fail the parent
// flow — the registration already exists on NSE's side; without the
// link the user can still authorize via Member Desk later.
//
// productType is per the NSEMF spec table:
//   MANDATE_AUTH ⇒ Mandate authorization (refId = mandate reg_id)
//   XSIP_REG     ⇒ XSIP registration authorization (refId = xsip reg_id)
//   SIP_REG      ⇒ SIP registration authorization (refId = sip reg_id)
//   STP_REG / SWP_REG / SWH_REG / PUR / RED / etc.
const attachAuthLink = async (
  apiResponse: any,
  productType: string,
) => {
  const row = apiResponse?.reg_data?.[0];
  const regId = row?.reg_id;
  const regStatus: string | undefined = row?.reg_status;
  const failed = regStatus && /FAIL/i.test(regStatus);
  if (!regId || failed) return apiResponse;

  try {
    const linkResp = await nseGetLinkApi({
      productType,
      productRefId: String(regId),
    });
    const linkRow = Array.isArray(linkResp) ? linkResp[0] : linkResp;
    row.auth_link = linkRow?.firstHolderLink || "";
    row.auth_links = {
      firstHolderLink: linkRow?.firstHolderLink || "",
      secondHolderLink: linkRow?.secondHolderLink || "",
      thirdHolderLink: linkRow?.thirdHolderLink || "",
      errorMessage: linkRow?.errorMessage || "",
    };
    console.log(
      `[${productType}] GET_LINK attached:`,
      row.auth_links,
    );
  } catch (linkErr: any) {
    console.error(
      `[${productType}] GET_LINK failed (non-fatal — registration already succeeded):`,
      linkErr?.message,
    );
    row.auth_link = "";
    row.auth_links = {
      firstHolderLink: "",
      secondHolderLink: "",
      thirdHolderLink: "",
      errorMessage: linkErr?.message || "Failed to fetch authorization link",
    };
  }
  return apiResponse;
};

// Backwards-compat shim — mandate handlers used to call this name.
const attachAuthLinkToMandateResponse = (apiResponse: any) =>
  attachAuthLink(apiResponse, "MANDATE_AUTH");

// UCC variant: response shape is { reg_details: [...] } (not reg_data),
// and the GET_LINK refId is the client_code (CL_ACT productType per spec).
// Same fail-soft contract — we never fail UCC registration if GET_LINK
// hiccups, since the UCC is already created on NSE's side.
const attachUccActivationLink = async (apiResponse: any) => {
  const row = apiResponse?.reg_details?.[0];
  const clientCode = row?.client_code;
  const regStatus: string | undefined = row?.reg_status;
  const failed = regStatus && /FAIL/i.test(regStatus);
  if (!clientCode || failed) return apiResponse;

  try {
    const linkResp = await nseGetLinkApi({
      productType: "CL_ACT",
      productRefId: String(clientCode).trim(),
    });
    const linkRow = Array.isArray(linkResp) ? linkResp[0] : linkResp;
    row.auth_link = linkRow?.firstHolderLink || "";
    row.auth_links = {
      firstHolderLink: linkRow?.firstHolderLink || "",
      secondHolderLink: linkRow?.secondHolderLink || "",
      thirdHolderLink: linkRow?.thirdHolderLink || "",
      errorMessage: linkRow?.errorMessage || "",
    };
    console.log("[CL_ACT] GET_LINK attached:", row.auth_links);
  } catch (linkErr: any) {
    console.error(
      "[CL_ACT] GET_LINK failed (non-fatal — UCC already created):",
      linkErr?.message,
    );
    row.auth_link = "";
    row.auth_links = {
      firstHolderLink: "",
      secondHolderLink: "",
      thirdHolderLink: "",
      errorMessage: linkErr?.message || "Failed to fetch UCC activation link",
    };
  }
  return apiResponse;
};

// Mandate Purchase handler for NSE
export const nseMandatePurchase = async (regData: any[]) => {
  try {
    console.log("========== NSE Mandate Purchase STARTED ==========");

    // Fix URL-encoded dates in the payload
    const fixedRegData = regData.map(item => {
      if (item.start_date && typeof item.start_date === 'string') {
        item.start_date = item.start_date.replace(/#x2F/g, '/');
      }
      if (item.end_date && typeof item.end_date === 'string') {
        item.end_date = item.end_date.replace(/#x2F/g, '/');
      }
      return item;
    });

    const payload = {
      reg_data: fixedRegData
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

    // Chain GET_LINK to fetch the authorization URL the investor needs to
    // visit (eNACH netbanking page or physical mandate form).
    await attachAuthLinkToMandateResponse(apiResponse);

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

    // Fix URL-encoded dates in the payload
    const fixedRegData = regData.map(item => {
      if (item.start_date && typeof item.start_date === 'string') {
        item.start_date = item.start_date.replace(/#x2F/g, '/');
      }
      if (item.end_date && typeof item.end_date === 'string') {
        item.end_date = item.end_date.replace(/#x2F/g, '/');
      }
      return item;
    });

    const payload = {
      reg_data: fixedRegData
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

    // Same GET_LINK chain as the purchase path — investor still has to
    // authorize the mandate regardless of which transaction it backs.
    await attachAuthLinkToMandateResponse(apiResponse);

    console.log("========== NSE Mandate Redemption COMPLETED ==========");

    return apiResponse;

  } catch (err) {
    console.log("NSE mandate redemption error =", err);
    throw err;
  }
};

// Normalize a date string to YYYY-MM-DD (NSE reports format per spec
// sample). Accepts DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, or YYYY/MM/DD;
// passes through anything else unchanged so we don't mangle valid input.
const toReportDate = (s: any): any => {
  if (typeof s !== "string" || !s) return s;
  const trimmed = s.trim();
  // Already YYYY-MM-DD or YYYY/MM/DD
  let m = trimmed.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // DD-MM-YYYY or DD/MM/YYYY
  m = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return trimmed;
};

// Provisional Report handler for NSE
export const nseProvisionalReport = async (reportParams: any) => {
  try {
    console.log("========== NSE Provisional Report STARTED ==========");

    const normalized = {
      ...reportParams,
      from_date: toReportDate(reportParams?.from_date),
      to_date: toReportDate(reportParams?.to_date),
    };

    console.log("Provisional Report payload:", JSON.stringify(normalized, null, 2));

    const apiResponse = await nseProvisionalReportApi(normalized);

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

    const normalized = {
      ...statusParams,
      from_date: toReportDate(statusParams?.from_date),
      to_date: toReportDate(statusParams?.to_date),
    };

    console.log("Order Status payload:", JSON.stringify(normalized, null, 2));

    const apiResponse = await nseOrderStatusApi(normalized);

    // Extract client code from status params
    const clientCode = normalized?.client_code || '';
    const reportType = 'ORDER_STATUS';

    // Extract response data
    const responseData = apiResponse?.status_data?.[0];

    // ✅ SAVE INTO DB
    await NseReportLog.create({
      reportType,
      clientCode,
      requestPayload: normalized,
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

// Transaction Detail Report handler — thin wrapper around the NSE reporting
// endpoint, plus a log row in nse_report_logs so we have an audit trail.
// The service never throws — it returns { ok, data, errorRemark }. We always
// persist an audit row (SUCCESS or FAILED) so operators can debug live.
// The raw NSE response body is returned to the caller so the frontend sees
// report_data / report_data_total / response_status / error_remark directly.
export const nseTransactionDetailReport = async (reportParams: any) => {
  console.log("========== NSE Transaction Detail Report STARTED ==========");
  console.log("Transaction Detail Report payload:", JSON.stringify(reportParams, null, 2));

  const { ok, httpStatus, data, errorRemark } = await nseTransactionDetailReportApi(reportParams);

  const clientCode = reportParams?.client_code || '';
  const responseStatus = data?.response_status || data?.data?.response_status || (ok ? 'S' : 'F');

  // Best-effort audit row. We swallow log errors so a DB hiccup can't hide
  // the API response from the user.
  try {
    await NseReportLog.create({
      reportType: 'TRANSACTION_DETAIL',
      clientCode,
      requestPayload: reportParams,
      responsePayload: data ?? { _httpStatus: httpStatus, _errorRemark: errorRemark },
      status: ok ? 'SUCCESS' : 'FAILED',
      remark: errorRemark,
      reportStatus: responseStatus,
      reportRemark: errorRemark,
    });
    console.log("✅ Transaction Detail Report LOG SAVED");
  } catch (logErr) {
    console.log("⚠️ Transaction Detail Report log write failed:", logErr);
  }

  console.log("========== NSE Transaction Detail Report COMPLETED ==========");

  // Return a shape the route can turn into either a success envelope or a
  // user-visible error envelope without having to re-inspect the upstream.
  return { ok, httpStatus, data, errorRemark };
};

// ════════════════════════════════════════════════════════════════════════════
// NSE Portfolio by Client Code
//
// The MFU side has `fn_portfolio_valuation(pan, rpt_date)` populated from RTA
// holdings. NSE onboardees don't flow into that function yet, so this handler
// reconstructs a portfolio-ish view from local nse_transaction_logs rows:
//   • One row per (scheme_code, folio_no) bucket.
//   • Invested amount = sum of SUCCESS purchase order amounts.
//   • Scheme name / AMC / NAV looked up against the cached NSE MASTER_DOWNLOAD
//     (1 h TTL) so we don't hammer NSE per request.
//   • Units / current value / P&L show "--" until allotment data is available
//     in the response payload — the frontend treats blank strings the same way
//     it treats the MFU nulls.
//
// The response matches the `out_*` field names the portfolio table already
// expects, so the UI doesn't need a second rendering path.
// ════════════════════════════════════════════════════════════════════════════
export const nsePortfolioByClientCode = async (clientCode: string) => {
  const code = (clientCode || "").trim();
  if (!code) return [];

  const rows = await NseTransactionLog.findAll({
    where: { clientCode: code },
    order: [["id", "ASC"]],
  });

  // Load scheme master once so we can decorate scheme_name / amc / nav.
  // Silent failure: if NSE master is unreachable we still return transaction
  // rows — just without enriched scheme names.
  let schemeByCode = new Map<string, NseSchemeRow>();
  try {
    const { rows: masterRows } = await loadSchemeMasterWithCache(false);
    for (const r of masterRows) {
      if (r.scheme_code) schemeByCode.set(r.scheme_code.trim().toUpperCase(), r);
    }
  } catch (err) {
    console.log("[nsePortfolioByClientCode] scheme master lookup failed:", err);
  }

  type Bucket = {
    scheme_code: string;
    folio_no: string;
    invested: number;
    firstOrderDate: Date | null;
    transactionType: string;
    orderIds: string[];
    anyRequestRow: any;
  };
  const buckets = new Map<string, Bucket>();

  for (const r of rows) {
    const row: any = (r as any).toJSON ? (r as any).toJSON() : r;
    // Only count purchases that succeeded. Redemptions / failed orders are
    // out of scope for a "current holdings" view.
    const status = (row.status || "").toUpperCase();
    const txnType = (row.transactionType || "PURCHASE").toUpperCase();
    if (status !== "SUCCESS") continue;
    if (txnType !== "PURCHASE") continue;

    const detail =
      row?.requestPayload?.transaction_details?.[0] ||
      row?.requestPayload?.transaction_details ||
      {};
    const schemeCode = String(detail.scheme_code || detail.schemeCode || "").trim();
    if (!schemeCode) continue;
    const folioNo = String(detail.folio_no || detail.folioNo || "").trim() || "NEW";
    const amount = Number(detail.amount || detail.order_amount || detail.orderAmount || 0) || 0;
    if (amount <= 0) continue;

    const key = `${schemeCode}|${folioNo}`;
    const orderDate = row.createdAt ? new Date(row.createdAt) : null;
    const existing = buckets.get(key);
    if (existing) {
      existing.invested += amount;
      if (orderDate && (!existing.firstOrderDate || orderDate < existing.firstOrderDate)) {
        existing.firstOrderDate = orderDate;
      }
      if (row.orderId) existing.orderIds.push(row.orderId);
    } else {
      buckets.set(key, {
        scheme_code: schemeCode,
        folio_no: folioNo,
        invested: amount,
        firstOrderDate: orderDate,
        transactionType: txnType,
        orderIds: row.orderId ? [row.orderId] : [],
        anyRequestRow: detail,
      });
    }
  }

  const today = new Date();
  const result = Array.from(buckets.values()).map((b) => {
    const master = schemeByCode.get(b.scheme_code.toUpperCase());
    const noOfDays =
      b.firstOrderDate
        ? Math.max(
            0,
            Math.floor((today.getTime() - b.firstOrderDate.getTime()) / (1000 * 60 * 60 * 24))
          )
        : 0;
    return {
      // Match the field names the MFU portfolio table already reads.
      out_record_typ: "P",
      out_scheme: master?.scheme_name || b.scheme_code,
      out_mutual_fund: master?.amc_name || "",
      out_folio_no: b.folio_no,
      out_current_nav: master?.nav || "",
      out_units: "", // allotted units not yet flowing into nse_transaction_logs
      out_no_of_days: String(noOfDays),
      out_amount: b.invested.toFixed(2),
      out_current_val: "", // unknown without allotted units × NAV
      out_p_n_l: "",
      out_abs_per: "",
      // Extras the frontend can surface if/when it wants to:
      scheme_code: b.scheme_code,
      order_ids: b.orderIds,
      source: "NSE",
    };
  });

  return result;
};

// ══════════════════════════════════════════════════════════════
//  NEW HANDLER FUNCTIONS FOR COMPLETE NSE MODULE
// ══════════════════════════════════════════════════════════════

import {
  nseScheMasterDownloadApi,
  nseGetLinkApi,
  nseResendCommApi,
  nseMandateStatusApi,
  nseMandateImageUploadApi,
  nsePurchasePaymentApi,
  nseUpiStatusCheckApi,
  nseSipCancellationApi,
  nseXsipCancellationApi,
  nseSwpCancellationApi,
  nseXsipPauseApi,
  nseFatcaUploadApi,
  nseKycCheckApi,
  nseClientAuthReportApi,
  nseAofUploadApi,
  nseAllotmentStatementApi,
  nseRedemptionPayoutApi,
} from "../../services/nse.service";

// Scheme Master Download
export const nseSchemeMasterDownload = async (fileType: string) => {
  try {
    console.log("========== NSE Scheme Master Download STARTED ==========");
    const apiResponse = await nseScheMasterDownloadApi(fileType);
    console.log("========== NSE Scheme Master Download COMPLETED ==========");
    return apiResponse;
  } catch (err) {
    console.log("NSE scheme master download error =", err);
    throw err;
  }
};

// ════════════════════════════════════════════════════════════════════════════
// NSE Scheme Resolver by ISIN
//
// Purpose: Fund-Explore shows schemes from Morningstar (keyed by schemeISIN).
// NSE's transaction API executes on scheme_code. To guarantee the scheme a
// user picked on Morningstar is the exact scheme executed on NSE, we resolve
// the ISIN → NSE scheme_code against NSE's MASTER_DOWNLOAD feed before
// navigating to the order form.
//
// The full MASTER_DOWNLOAD response is ~several MB of pipe-separated text, so
// we cache the parsed map in-memory for 1 hour. On cache miss the next
// request transparently refreshes it.
// ════════════════════════════════════════════════════════════════════════════
interface NseSchemeRow {
  scheme_code: string;
  scheme_name: string;
  amc_code: string;
  amc_name: string;
  isin: string;
  sub_category: string;
  scheme_type: string;
  purchase_allowed: string;
  redemption_allowed: string;
  sip_allowed: string;
  min_purchase_amount: string;
  nav: string;
  nav_date: string;
  // Keep the raw row so callers can pick additional columns if needed.
  [k: string]: string;
}

const SCHEME_MASTER_TTL_MS = 60 * 60 * 1000; // 1 hour
let schemeMasterCache: {
  rows: NseSchemeRow[];
  byIsin: Map<string, NseSchemeRow>;
  fetchedAt: number;
} | null = null;

// Parses whatever shape NSE returns (pipe-separated text OR JSON array) into
// a normalized array of NseSchemeRow. Header keys are lowercased and spaces
// → underscores so downstream code can trust a fixed field shape.
const parseSchemeMasterResponse = (raw: any): NseSchemeRow[] => {
  if (!raw) return [];

  const normalizeKey = (k: string) =>
    k.trim().toLowerCase().replace(/\s+/g, "_");

  const normalizeRow = (row: Record<string, any>): NseSchemeRow => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      out[normalizeKey(k)] = v == null ? "" : String(v).trim();
    }
    return out as NseSchemeRow;
  };

  if (typeof raw === "string") {
    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];
    const header = lines[0].split("|").map(normalizeKey);
    return lines.slice(1).map((line) => {
      const cols = line.split("|");
      const obj: Record<string, string> = {};
      header.forEach((h, i) => {
        obj[h] = (cols[i] || "").trim();
      });
      return obj as NseSchemeRow;
    });
  }

  if (Array.isArray(raw)) {
    return raw.map(normalizeRow);
  }

  return [];
};

const buildIsinIndex = (rows: NseSchemeRow[]): Map<string, NseSchemeRow> => {
  const map = new Map<string, NseSchemeRow>();
  for (const row of rows) {
    const isin = (row.isin || "").toString().trim().toUpperCase();
    if (!isin) continue;
    // If NSE has multiple rows for the same ISIN (rare — Growth/IDCW splits),
    // prefer the one that's purchase-allowed.
    const existing = map.get(isin);
    if (!existing) {
      map.set(isin, row);
      continue;
    }
    const prevAllowed = (existing.purchase_allowed || "").toUpperCase() === "Y";
    const nextAllowed = (row.purchase_allowed || "").toUpperCase() === "Y";
    if (!prevAllowed && nextAllowed) map.set(isin, row);
  }
  return map;
};

const loadSchemeMasterWithCache = async (
  forceRefresh = false
): Promise<{ rows: NseSchemeRow[]; byIsin: Map<string, NseSchemeRow> }> => {
  const now = Date.now();
  if (
    !forceRefresh &&
    schemeMasterCache &&
    now - schemeMasterCache.fetchedAt < SCHEME_MASTER_TTL_MS
  ) {
    return {
      rows: schemeMasterCache.rows,
      byIsin: schemeMasterCache.byIsin,
    };
  }

  console.log(
    "[loadSchemeMasterWithCache] >>> cache miss — fetching NSE MASTER_DOWNLOAD"
  );
  const raw = await nseScheMasterDownloadApi("SCH");
  const rows = parseSchemeMasterResponse(raw);
  const byIsin = buildIsinIndex(rows);
  schemeMasterCache = { rows, byIsin, fetchedAt: now };
  console.log(
    `[loadSchemeMasterWithCache] >>> cached ${rows.length} rows / ${byIsin.size} unique ISINs`
  );
  return { rows, byIsin };
};

export const resolveNseSchemeByIsin = async (
  isin: string,
  forceRefresh = false
): Promise<NseSchemeRow | null> => {
  const normalized = (isin || "").trim().toUpperCase();
  if (!normalized) return null;

  let { byIsin } = await loadSchemeMasterWithCache(forceRefresh);
  let match = byIsin.get(normalized) || null;

  // Cache-miss safety: if the requested ISIN isn't in a stale cache, force a
  // refresh once in case NSE just added the scheme. Avoids a thundering herd
  // on truly unknown ISINs because we only retry when the cache exists.
  if (!match && !forceRefresh && schemeMasterCache) {
    ({ byIsin } = await loadSchemeMasterWithCache(true));
    match = byIsin.get(normalized) || null;
  }
  return match;
};

// ════════════════════════════════════════════════════════════════════════════
// NSE Scheme List — server-side paginated / filtered view on the cached
// MASTER_DOWNLOAD feed. Returns rows in a shape that matches the MFU
// fund-explore table so the same UI can render both data sources with zero
// branching in the render layer.
// ════════════════════════════════════════════════════════════════════════════
export interface NseSchemeListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  amc?: string;
  onlyPurchaseAllowed?: boolean;
}

export const nseSchemeList = async (params: NseSchemeListParams) => {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(params.limit) || 50));
  const search = (params.search || "").toString().trim().toLowerCase();
  const category = (params.category || "").toString().trim().toLowerCase();
  const amc = (params.amc || "").toString().trim().toLowerCase();
  const onlyPurchaseAllowed = params.onlyPurchaseAllowed !== false;

  const { rows } = await loadSchemeMasterWithCache(false);

  // Filtering
  const filtered = rows.filter((r) => {
    if (onlyPurchaseAllowed && (r.purchase_allowed || "").toUpperCase() !== "Y") {
      return false;
    }
    if (category && (r.sub_category || "").toLowerCase() !== category) {
      return false;
    }
    if (amc && (r.amc_name || "").toLowerCase() !== amc) {
      return false;
    }
    if (search) {
      const hay = [
        r.scheme_name,
        r.amc_name,
        r.scheme_code,
        r.isin,
      ]
        .map((v) => (v || "").toString().toLowerCase())
        .join(" | ");
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  // Unique sub_category list for the filter dropdown (unfiltered universe)
  const categories = Array.from(
    new Set(
      rows
        .map((r) => (r.sub_category || "").trim())
        .filter((s) => s.length > 0)
    )
  ).sort();

  // Sort alphabetically by scheme_name so the UI is stable.
  filtered.sort((a, b) =>
    (a.scheme_name || "").localeCompare(b.scheme_name || "")
  );

  const total = filtered.length;
  const offset = (page - 1) * limit;
  const page_rows = filtered.slice(offset, offset + limit);

  // Shape each row to look like a Morningstar `SchemeMaster` row so the
  // existing fund-explore table can render without conditional reads.
  const normalized = page_rows.map((r) => {
    const navValue = parseFloat(r.nav || "");
    const performance = {
      Nav: Number.isFinite(navValue) ? navValue : null,
      AUM: null,
      OverallRating: null,
      Return1d: null,
      Return1w: null,
      Return1mth: null,
      Return3mth: null,
      Return6mth: null,
      Return1yr: null,
      Return2yr: null,
      Return3yr: null,
      Return5yr: null,
      Return7yr: null,
      Return10yr: null,
    };
    return {
      // Primary keys
      id: r.scheme_code,
      schemeISIN: r.isin,
      // Display fields
      name: r.scheme_name,
      ms_fullname: r.scheme_name,
      net_expense_ratio: null,
      // Joins the MFU table expects
      AMCMaster: {
        id: null,
        name: r.amc_name || "",
        amc_logo: null,
      },
      SchemeCategory: { Name: r.sub_category || "" },
      SchemeSubcategory: { Name: r.sub_category || "" },
      SchemePerformances: [performance],
      // NSE-specific extras the Transact button needs
      nse_scheme_code: r.scheme_code,
      nse_amc_code: r.amc_code,
      nse_min_purchase_amount: r.min_purchase_amount,
      nse_purchase_allowed: (r.purchase_allowed || "").toUpperCase() === "Y",
      nse_sip_allowed: (r.sip_allowed || "").toUpperCase() === "Y",
      nse_scheme_type: r.scheme_type,
      _source: "NSE" as const,
    };
  });

  return {
    rows: normalized,
    count: total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
    categories,
    source: "NSE",
  };
};

// Get Short URL Link
export const nseGetLink = async (linkParams: any) => {
  try {
    console.log("========== NSE Get Link STARTED ==========");
    const apiResponse = await nseGetLinkApi(linkParams);
    console.log("NSE Get Link Response:", apiResponse);
    return apiResponse;
  } catch (err) {
    console.log("NSE get link error =", err);
    throw err;
  }
};

// Resend Communication
export const nseResendComm = async (commParams: any) => {
  try {
    console.log("========== NSE Resend Comm STARTED ==========");
    const apiResponse = await nseResendCommApi(commParams);
    console.log("NSE Resend Comm Response:", apiResponse);
    return apiResponse;
  } catch (err) {
    console.log("NSE resend comm error =", err);
    throw err;
  }
};

// Scan Mandate Image Upload
export const nseMandateImageUpload = async (uploadParams: {
  client_code: string;
  mandate_id: string;
  file_name: string;
  file_data: string;
}) => {
  try {
    console.log("========== NSE Mandate Image Upload STARTED ==========");
    const apiResponse = await nseMandateImageUploadApi(uploadParams);

    // Update the mandate log with upload outcome if a matching row exists.
    try {
      const uploadStatus = apiResponse?.status === "100" ? "UPLOADED" : "UPLOAD_FAILED";
      const uploadRemark = apiResponse?.message || "";
      await NseMandateLog.update(
        {
          status: uploadStatus,
          remark: uploadRemark,
        },
        {
          where: {
            clientCode: uploadParams.client_code,
            regId: uploadParams.mandate_id,
          },
        }
      );
    } catch (dbErr) {
      console.log("NseMandateLog update on image upload failed:", dbErr);
    }

    console.log("========== NSE Mandate Image Upload COMPLETED ==========");
    return apiResponse;
  } catch (err) {
    console.log("NSE mandate image upload error =", err);
    throw err;
  }
};

// Mandate Status Report
export const nseMandateStatus = async (statusParams: any) => {
  try {
    console.log("========== NSE Mandate Status STARTED ==========");
    // NSEMF v1.9.6 §"Mandate Status Report API" mandates YYYY-MM-DD for
    // both from_date and to_date. Frontend historically sent DD-MM-YYYY;
    // normalize so either format works without breaking existing callers.
    const normalized = {
      ...statusParams,
      from_date: toReportDate(statusParams?.from_date),
      to_date: toReportDate(statusParams?.to_date),
    };
    console.log("NSE Mandate Status payload:", JSON.stringify(normalized, null, 2));
    const apiResponse = await nseMandateStatusApi(normalized);
    console.log("NSE Mandate Status Response:", apiResponse);
    return apiResponse;
  } catch (err) {
    console.log("NSE mandate status error =", err);
    throw err;
  }
};

// Purchase Payment
export const nsePurchasePayment = async (paymentParams: any) => {
  try {
    console.log("========== NSE Purchase Payment STARTED ==========");
    const apiResponse = await nsePurchasePaymentApi(paymentParams);
    console.log("NSE Purchase Payment Response:", apiResponse);
    return apiResponse;
  } catch (err) {
    console.log("NSE purchase payment error =", err);
    throw err;
  }
};

// UPI Status Check
export const nseUpiStatusCheck = async (upiParams: any) => {
  try {
    console.log("========== NSE UPI Status Check STARTED ==========");
    const apiResponse = await nseUpiStatusCheckApi(upiParams);
    console.log("NSE UPI Status Check Response:", apiResponse);
    return apiResponse;
  } catch (err) {
    console.log("NSE UPI status check error =", err);
    throw err;
  }
};

// SIP Cancellation
export const nseSipCancellation = async (canData: any[]) => {
  try {
    console.log("========== NSE SIP Cancellation STARTED ==========");
    const apiResponse = await nseSipCancellationApi({ can_data: canData });
    await NseCancellationLog.create({
      cancellationType: "SIP",
      clientCode: canData[0]?.client_code || "",
      requestPayload: canData,
      responsePayload: apiResponse,
      status: apiResponse?.reg_data?.[0]?.can_status || "UNKNOWN",
      remark: apiResponse?.reg_data?.[0]?.can_remark || "",
    });
    console.log("========== NSE SIP Cancellation COMPLETED ==========");
    return apiResponse;
  } catch (err) {
    console.log("NSE SIP cancellation error =", err);
    throw err;
  }
};

// XSIP Cancellation
export const nseXsipCancellation = async (canData: any[]) => {
  try {
    console.log("========== NSE XSIP Cancellation STARTED ==========");
    const apiResponse = await nseXsipCancellationApi({ can_data: canData });
    await NseCancellationLog.create({
      cancellationType: "XSIP",
      clientCode: canData[0]?.client_code || "",
      requestPayload: canData,
      responsePayload: apiResponse,
      status: apiResponse?.reg_data?.[0]?.can_status || "UNKNOWN",
      remark: apiResponse?.reg_data?.[0]?.can_remark || "",
    });
    console.log("========== NSE XSIP Cancellation COMPLETED ==========");
    return apiResponse;
  } catch (err) {
    console.log("NSE XSIP cancellation error =", err);
    throw err;
  }
};

// SWP Cancellation
export const nseSwpCancellation = async (canData: any[]) => {
  try {
    console.log("========== NSE SWP Cancellation STARTED ==========");
    const apiResponse = await nseSwpCancellationApi({ can_data: canData });
    await NseCancellationLog.create({
      cancellationType: "SWP",
      clientCode: canData[0]?.client_code || "",
      requestPayload: canData,
      responsePayload: apiResponse,
      status: apiResponse?.reg_data?.[0]?.can_status || "UNKNOWN",
      remark: apiResponse?.reg_data?.[0]?.can_remark || "",
    });
    console.log("========== NSE SWP Cancellation COMPLETED ==========");
    return apiResponse;
  } catch (err) {
    console.log("NSE SWP cancellation error =", err);
    throw err;
  }
};

// XSIP Pause/Resume
export const nseXsipPause = async (pauseData: any[]) => {
  try {
    console.log("========== NSE XSIP Pause STARTED ==========");
    const apiResponse = await nseXsipPauseApi({ pause_data: pauseData });
    console.log("NSE XSIP Pause Response:", apiResponse);
    return apiResponse;
  } catch (err) {
    console.log("NSE XSIP pause error =", err);
    throw err;
  }
};

// FATCA Upload
export const nseFatcaUpload = async (fatcaData: any) => {
  try {
    console.log("========== NSE FATCA Upload STARTED ==========");
    const apiResponse = await nseFatcaUploadApi(fatcaData);
    console.log("NSE FATCA Upload Response:", apiResponse);
    return apiResponse;
  } catch (err) {
    console.log("NSE FATCA upload error =", err);
    throw err;
  }
};

// KYC Check
export const nseKycCheck = async (kycParams: any) => {
  try {
    console.log("========== NSE KYC Check STARTED ==========");
    const apiResponse = await nseKycCheckApi(kycParams);
    console.log("NSE KYC Check Response:", apiResponse);
    return apiResponse;
  } catch (err) {
    console.log("NSE KYC check error =", err);
    throw err;
  }
};

// Client Authorization Report
export const nseClientAuthReport = async (reportParams: any) => {
  try {
    console.log("========== NSE Client Auth Report STARTED ==========");
    const apiResponse = await nseClientAuthReportApi(reportParams);
    console.log("NSE Client Auth Report Response:", apiResponse);
    return apiResponse;
  } catch (err) {
    console.log("NSE client auth report error =", err);
    throw err;
  }
};

// AOF Image Upload
export const nseAofUpload = async (aofData: any) => {
  try {
    console.log("========== NSE AOF Upload STARTED ==========");
    const apiResponse = await nseAofUploadApi(aofData);
    console.log("NSE AOF Upload Response:", apiResponse);
    return apiResponse;
  } catch (err) {
    console.log("NSE AOF upload error =", err);
    throw err;
  }
};

// Allotment Statement
export const nseAllotmentStatement = async (reportParams: any) => {
  try {
    console.log("========== NSE Allotment Statement STARTED ==========");
    const apiResponse = await nseAllotmentStatementApi(reportParams);
    console.log("NSE Allotment Statement Response:", apiResponse);
    return apiResponse;
  } catch (err) {
    console.log("NSE allotment statement error =", err);
    throw err;
  }
};

// Redemption Payout
export const nseRedemptionPayout = async (reportParams: any) => {
  try {
    console.log("========== NSE Redemption Payout STARTED ==========");
    const apiResponse = await nseRedemptionPayoutApi(reportParams);
    console.log("NSE Redemption Payout Response:", apiResponse);
    return apiResponse;
  } catch (err) {
    console.log("NSE redemption payout error =", err);
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
      aadhaar_no,
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
      taxStatus: tax_status,
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
      aadhaarNo: aadhaar_no,
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

    // Map snake_case nominee fields from body → camelCase Sequelize attributes.
    // (Sequelize silently ignores unknown attribute names, so the snake_case
    //  keys must be converted before calling .update().)
    const snakeKeyToCamelSuffix: Record<string, string> = {
      name: "Name",
      relationship: "Relationship",
      dob: "Dob",
      share: "Share",
      email: "Email",
      mobile: "Mobile",
      identity_type: "IdentityType",
      identity_number: "IdentityNumber",
      minor_flag: "MinorFlag",
      guardian: "Guardian",
      guardian_pan: "GuardianPan",
      same_address: "SameAddress",
      address1: "Address1",
      address2: "Address2",
      address3: "Address3",
      pin: "Pin",
      city: "City",
      country: "Country",
    };

    const nomineeFields: Record<string, any> = {};
    [1, 2, 3].forEach((idx) => {
      Object.entries(snakeKeyToCamelSuffix).forEach(([snake, camelSuffix]) => {
        const bodyKey = `nominee_${idx}_${snake}`;
        if (body[bodyKey] !== undefined) {
          const modelKey = `nominee${idx}${camelSuffix}`;
          nomineeFields[modelKey] = body[bodyKey];
        }
      });
    });

    console.log("[saveUCCStep2] >>> nominee fields to update:", nomineeFields);

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
