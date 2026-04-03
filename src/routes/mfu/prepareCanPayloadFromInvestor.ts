export const prepareCanPayloadFromInvestor = (parsedInvestor: any) => {
  const nominee = parsedInvestor.NomineeDetails?.[0];
  const bank = parsedInvestor.BankAccountDetails?.[0];
  const addr = parsedInvestor.AddressDetail;
  const declaration = parsedInvestor.InvestorDeclaration;
  const occupationCode = declaration?.OccupationMaster?.occ_code || "01";
  const incomeCode = declaration?.AnnuaIincomeMaster?.ai_code || "03";

  return {
    REQ_HEADER: {
      ENTITY_ID: process.env.ENTITY_ID,//"40008I",
      UNIQUE_ID: `REQ_${parsedInvestor.id.toString().padStart(8, '0')}`,
      REQUEST_TYPE: "CANINDREG",
      LOG_USER_ID: "M0eGG0WiaLN9kgiiVfS3Ug==",
      EN_ENCR_PASSWORD: "NWbbHpz1kHpDjBBCHV8z7A==",
      VERSION_NO: "1.00",
      TIMESTAMP: new Date(parsedInvestor.createdAt).toISOString()
    },
    REQ_BODY: {
      REQ_ENT_VIA: "API",
      REQ_EVENT: "CR",
      REG_TYPE: "E",
      PROOF_UPLOAD_BY_CAN: "Y",
      ENABLE_ONLINE_ACCESS_FLAG: "N",
      ENTITY_EMAIL_DETAILS: {
        EMAIL_ID: parsedInvestor.reg_email
      },
      HOLDING_TYPE: "SI",
      INV_CATEGORY: "I",
      TAX_STATUS: "RI",
      HOLDER_COUNT: 1,
      HOLDER_RECORDS: {
        HOLDER_RECORD: {
          HOLDER_TYPE: "PR",
          NAME: parsedInvestor.name,
          DOB: parsedInvestor.dob,
          PAN_EXEMPT_FLAG: "N",
          PAN_PEKRN_NO: parsedInvestor.pan_no,
          AADHAAR_NO: "",
          CONTACT_DETAIL: {
            MOB_ISD_CODE: "91",
            PRI_MOB_NO: parsedInvestor.reg_mobile,
            PRI_MOB_BELONGSTO: "SE",
            PRI_EMAIL: parsedInvestor.reg_email,
            PRI_EMAIL_BELONGSTO: "SE"
          },
          OTHER_DETAIL: {
            GROSS_INCOME: incomeCode,
            OCCUPATION: occupationCode,
            PEP: declaration?.is_politically_exposed === "no" ? "RPEP" : "PEP",
            KRA_ADDR_TYPE: addr?.AddressType?.at_code || "1"
          },
          FATCA_DETAIL: {
            BIRTH_CITY: declaration?.POB || "NA",
            BIRTH_COUNTRY: "101",
            CITIZENSHIP: "101",
            NATIONALITY: "IN",
            TAX_RES_FLAG: "Y",
            TAXS_RECORDS: {
              TAX_RECORD: {
                SEQ_NUM: 1
              }
            }
          }
        }
      },
      ARN_DETAILS: {
        ARN_NO: "ARN-104974",
        EUIN_CODE: "E123456"
      },
      CONSENT_DETAILS: {
        CONSENT_RECORD: [
          { DATA_SET: "PD", ENABLED_CONSENT: "Y" },
          { DATA_SET: "CD", ENABLED_CONSENT: "Y" },
          { DATA_SET: "MF", ENABLED_CONSENT: "Y" },
          { DATA_SET: "HD", ENABLED_CONSENT: "N" }
        ]
      },
      BANK_DETAILS: {
        BANK_RECORD: [{
          SEQ_NUM: 1,
          DEFAULT_ACC_FLAG: "Y",
          ACCOUNT_NO: bank?.account_no,
          ACCOUNT_TYPE: "SB",
          BANK_ID: "240",
          MICR_CODE: bank?.micr,
          IFSC_CODE: bank?.ifsc,
          PROOF: bank?.bank_proof?.toString() || "1"
        }]
      },
      NOMINEE_DETAILS: {
        NOM_DECL_LVL: "C",
        NOMIN_OPT_FLAG: "Y",
        NOM_FOLIO_SOA: "Y",
        NOM_VERIFY_TYPE: "E",
        NOMINEES_RECORDS: {
          NOMINEE_RECORD: [
            {
              SEQ_NUM: 1,
              NOMINEE_NAME: nominee?.nominee_name,
              RELATION: "MFU22",
              PERCENTAGE: nominee?.percentage_allocation,
              DOB: nominee?.nominee_DOB,
              NOM_PI_TYPE: "PA",
              NOM_PI_NO: nominee?.identity_number,
              NOM_MOBILE: nominee?.mobile_number,
              NOM_EMAIL: nominee?.email_address,
              NOM_ADDR1: nominee?.address_line_1,
              NOM_ADDR2: nominee?.address_line_2 || "",
              NOM_ADDR3: "",
              NOM_PINCODE: nominee?.pin_code,
              NOM_CITY: nominee?.city,
              NOM_COUNTRY: "101"
            }
          ]
        }
      }
    }
  };
};
