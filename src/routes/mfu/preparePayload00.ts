import { Console } from "console";

export const preparePayload = (parsedInvestor: any) => {
    // Determine holding type and holder count
    const holdingType = parsedInvestor.holding_type || "SI"; // SI, JO, AS
    const holderCount = parsedInvestor.holders?.length || 1;
    const holders = parsedInvestor.holders || [parsedInvestor];

    // Get common data
    const nominee = parsedInvestor.NomineeDetails?.[0];
    const nominees = parsedInvestor.NomineeDetails || [];
    const bank = parsedInvestor.BankAccountDetails?.[0];
    const banks = parsedInvestor.BankAccountDetails || [];
    const addr = parsedInvestor.AddressDetail;
    const declaration = parsedInvestor.InvestorDeclaration;
    const tax_status = [
        { code: 1, value: 'RI' },
        { code: 2, value: 'RM' }
    ]

    // Helper function to get occupation and income codes
    const getOccupationCode = (holder: any) => {
        return holder?.InvestorDeclaration?.OccupationMaster?.occ_code ||
            declaration?.OccupationMaster?.occ_code || "01";
    };

    const getIncomeCode = (holder: any) => {
        return holder?.InvestorDeclaration?.AnnuaIincomeMaster?.ai_code ||
            declaration?.AnnuaIincomeMaster?.ai_code || "03";
    };

    // Helper function to get PEP status
    const getPepStatus = (holder: any) => {
        const isPoliticallyExposed = holder?.InvestorDeclaration?.is_politically_exposed ||
            declaration?.is_politically_exposed;
        return isPoliticallyExposed === "yes" ? "PEP" : "NA";
    };

    // Helper function to get holder type based on index
    const getHolderType = (index: number) => {
        const types = ["PR", "SE", "TH"];
        return types[index] || "PR";
    };

    // Helper function to create holder record
    const createHolderRecord = (holder: any, index: number) => {
        const holderAddr = holder.AddressDetail || addr;
        const holderDeclaration = holder.InvestorDeclaration || declaration;

        return {
            HOLDER_TYPE: getHolderType(index),
            NAME: holder.name,
            DOB: holder.dob,
            PAN_EXEMPT_FLAG: "N",
            PAN_PEKRN_NO: holder.pan_no,
            AADHAAR_NO: "",
            RELATIONSHIP: holder.relationship || "",
            REL_PROOF: holder.relationship_proof || "",
            NOM_VER_FLAG: holder.nominee_verify_flag || "",
            NOM_VER_IP: holder.nominee_verify_ip || "",

            // KYC Data - conditional based on entity configuration
            ...(holder.kyc_required && {
                KYC_DATA: {
                    KYC_STATUS: holder.kyc_status || "VRF",
                    SOURCE_KRA: holder.kra_source || "CAMS",
                    RES_ADDR_DETAIL: {
                        ADDR1: holderAddr?.residential_address_line_1 || holderAddr?.address_line_1,
                        ADDR2: holderAddr?.residential_address_line_2 || holderAddr?.address_line_2 || "",
                        ADDR3: holderAddr?.residential_address_line_3 || "",
                        CITY: holderAddr?.residential_city || holderAddr?.city,
                        PINCODE: holderAddr?.residential_pin_code || holderAddr?.pin_code,
                        STATE: holderAddr?.residential_state_code || holderAddr?.state_code,
                        COUNTRY: holderAddr?.residential_country_code || "101"
                    },
                    PER_ADDR_DETAIL: {
                        ADDR1: holderAddr?.permanent_address_line_1 || holderAddr?.address_line_1,
                        ADDR2: holderAddr?.permanent_address_line_2 || holderAddr?.address_line_2 || "",
                        ADDR3: holderAddr?.permanent_address_line_3 || "",
                        CITY: holderAddr?.permanent_city || holderAddr?.city,
                        PINCODE: holderAddr?.permanent_pin_code || holderAddr?.pin_code,
                        STATE: holderAddr?.permanent_state_code || holderAddr?.state_code,
                        COUNTRY: holderAddr?.permanent_country_code || "101"
                    }
                }
            }),

            CONTACT_DETAIL: {
                RES_ISD: holder.res_isd || "91",
                RES_STD: holder.res_std || "",
                RES_PHONE_NO: holder.res_phone || "",
                MOB_ISD_CODE: "91",
                PRI_MOB_NO: holder.reg_mobile || holder.mobile,
                PRI_MOB_BELONGSTO: "SE",
                ALT_MOB_NO: holder.alt_mobile || "",
                OFF_ISD: holder.off_isd || "91",
                OFF_STD: holder.off_std || "",
                OFF_PHONE_NO: holder.off_phone || "",
                PRI_EMAIL: holder.reg_email || holder.email,
                PRI_EMAIL_BELONGSTO: "SE",
                ALT_EMAIL: holder.alt_email || "",

                // Contact verification fields - conditional
                ...(holder.contact_verify_enabled && {
                    PRI_MOB_VER_FLAG: "Y",
                    PRI_EMAIL_VER_FLAG: "Y",
                    PRI_MOB_IP_ADDR: holder.mobile_verify_ip || "192.168.1.100",
                    PRI_EMAIL_IP_ADDR: holder.email_verify_ip || "192.168.1.100",
                    PRI_MOB_VER_TS: holder.mobile_verify_timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
                    PRI_EMAIL_VER_TS: holder.email_verify_timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19)
                })
            },

            OTHER_DETAIL: {
                GROSS_INCOME: getIncomeCode(holder),
                NET_WORTH: holder.net_worth || "",
                NET_DATE: holder.net_worth_date || "",
                SOURCE_OF_WEALTH: holder.source_of_wealth || "01",
                SOURCE_OF_WEALTH_OTH: holder.source_of_wealth === "08" ? holder.source_of_wealth_other : "",
                KRA_ADDR_TYPE: holderAddr?.AddressType?.at_code || "1",
                OCCUPATION: getOccupationCode(holder),
                OCCUPATION_OTH: getOccupationCode(holder) === "99" ? holder.occupation_other : "",
                PEP: getPepStatus(holder),
                ANY_OTH_INFO: holder.other_info || ""
            },

            FATCA_DETAIL: {
                BIRTH_CITY: holderDeclaration?.POB || holder.birth_city || "",
                BIRTH_COUNTRY: holder.birth_country || "101",
                BIRTH_COUNTRY_OTH: holder.birth_country === "999" ? holder.birth_country_other : "",
                CITIZENSHIP: holder.citizenship || "101",
                CITIZENSHIP_OTH: holder.citizenship === "999" ? holder.citizenship_other : "",
                NATIONALITY: holder.nationality || "101",
                NATIONALITY_OTH: holder.nationality === "999" ? holder.nationality_other : "",
                TAX_RES_FLAG: holder.tax_resident_flag || "N",

                // Tax records - conditional based on tax resident flag
                ...(holder.tax_resident_flag === "Y" && holder.tax_records?.length > 0 && {
                    TAXS_RECORDS: {
                        TAX_RECORD: holder.tax_records.map((taxRecord: any, idx: number) => ({
                            SEQ_NUM: idx + 1,
                            TAX_COUNTRY: taxRecord.tax_country,
                            TAX_COUNTRY_OTH: taxRecord.tax_country === "999" ? taxRecord.tax_country_other : "",
                            TAX_REF_NO: taxRecord.tax_reference_number,
                            IDENTI_TYPE: taxRecord.identification_type,
                            IDENTI_TYPE_OTH: taxRecord.identification_type === "O" ? taxRecord.identification_type_other : ""
                        }))
                    }
                })
            }
        };
    };

    // Create nominee records
    const createNomineeRecords = () => {
        if (!nominees.length) return [];


        return nominees.map((nominee: any, index: number) => {
            const isMinor = nominee.nominee_DOB &&
                new Date().getFullYear() - new Date(nominee.nominee_DOB).getFullYear() < 18;

            return {
                SEQ_NUM: index + 1,
                NOMINEE_NAME: nominee.nominee_name,
                RELATION: nominee.relationship_code || "MFU22",
                PERCENTAGE: nominee.percentage_allocation || (100 / nominees.length),
                DOB: nominee.nominee_DOB,

                // Guardian details for minors
                ...(isMinor && {
                    NOM_GURI_NAME: nominee.guardian_name,
                    NOM_GURI_REL: nominee.guardian_relationship || "MFU24",
                    NOM_GURI_DOB: nominee.guardian_dob
                }),


                NOM_PI_TYPE: nominee?.NomineeIdentity?.mfu_code || "PA",
                NOM_PI_NO: nominee.identity_number,
                NOM_MOBILE: nominee.mobile_number,
                NOM_EMAIL: nominee.email_address,
                NOM_ADDR1: nominee.address_line_1,
                NOM_ADDR2: nominee.address_line_2 || "",
                NOM_ADDR3: nominee.address_line_3 || "",
                NOM_PINCODE: nominee.pin_code,
                NOM_CITY: nominee.city,
                NOM_COUNTRY: nominee.country_code || "101"
            };
        });
    };

    // Create bank records
    const createBankRecords = () => {
        if (!banks.length) return [];

        return banks.map((bank: any, index: number) => ({
            SEQ_NUM: index + 1,
            DEFAULT_ACC_FLAG: index === 0 ? "Y" : "N", // First bank as default
            ACCOUNT_NO: bank.account_no,
            ACCOUNT_TYPE: bank.account_type || "SB",
            BANK_ID: bank.bank_id || "240",
            MICR_CODE: bank.micr,
            IFSC_CODE: bank.ifsc,
            PROOF: bank.bank_proof?.toString() || "14",

            // Rupee drop verification - conditional
            ...(bank.rupee_drop_enabled && {
                RUP_VER_FLG: "Y",
                RUP_BENE_NAME: bank.beneficiary_name || holders[0].name,
                RUP_THRESHOLD: bank.threshold || "85.00",
                RUP_IP_ADDR: bank.verify_ip || "192.168.1.100",
                RUP_TS: bank.verify_timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19)
            })
        }));
    };

    return {
        REQ_HEADER: {
            ENTITY_ID: process.env.ENTITY_ID || "40008I",
            UNIQUE_ID: `REQ_${(parsedInvestor.id || Date.now()).toString().padStart(8, '0')}`,
            REQUEST_TYPE: "CANINDREG",
            LOG_USER_ID: "igo8E1D5ABb68LLGoPUfrw==",
            EN_ENCR_PASSWORD: "Zo-xw82Q5IIQKxM8rNn_1A==",
            VERSION_NO: "1.00",
            TIMESTAMP: new Date(parsedInvestor.createdAt || Date.now()).toISOString()
            //   ENTITY_ID: process.env.ENTITY_ID,
            // UNIQUE_ID: 'REQ_${parsedInvestor.id.toString().padStart(8, '0')}',
            // REQUEST_TYPE: "CANINDREG",
            // LOG_USER_ID: "igo8E1D5ABb68LLGoPUfrw==",
            // EN_ENCR_PASSWORD: "Zo-xw82Q5IIQKxM8rNn_1A==",
            // VERSION_NO: "1.00",
            // TIMESTAMP: new Date(parsedInvestor.createdAt).toISOString()

        },

        REQ_BODY: {
            REQ_ENT_VIA: parsedInvestor.request_via || "API",
            REQ_EVENT: parsedInvestor.request_event || "CR", // CR = Create, CM = Modify
            ...(parsedInvestor.request_event === "CM" && { CAN: parsedInvestor.can_number }),
            REG_TYPE: parsedInvestor.registration_type || "E", // P = Physical, E = Electronic
            PROOF_UPLOAD_BY_CAN: parsedInvestor.proof_upload_by_can || "Y",
            ENABLE_ONLINE_ACCESS_FLAG: parsedInvestor.enable_online_access || "Y",
            /*ENTITY_EMAIL_DETAILS: [
                { EMAIL_ID: "727adi@gmail.com" }
            ],*/


            // Entity email details
            ENTITY_EMAIL_DETAILS: (
                Array.isArray(parsedInvestor.entity_emails)
                    ? parsedInvestor.entity_emails
                    : [parsedInvestor.reg_email, parsedInvestor.entity_email].filter(Boolean)
            ).map((email: string) => ({ EMAIL_ID: email })),




            HOLDING_TYPE: holdingType,
            INV_CATEGORY: parsedInvestor.investor_category || "I",
            TAX_STATUS: tax_status.find((opt: any) => opt.code === parsedInvestor.tax_status)?.value || "RI",
            HOLDER_COUNT: holderCount,

            // Create holder records based on holding type
            HOLDER_RECORDS: {
                HOLDER_RECORD: holdingType === "SI"
                    ? createHolderRecord(holders[0], 0)
                    : holders.map((holder: any, index: number) => createHolderRecord(holder, index))
            },

            // ARN Details - conditional based on ARN/RIA presence
            ...(parsedInvestor.arn_no || parsedInvestor.ria_code) && {
                ARN_DETAILS: {
                    ARN_NO: parsedInvestor.arn_no || "",
                    RIA_CODE: parsedInvestor.ria_code || "",
                    EUIN_CODE: parsedInvestor.euin_code || ""
                }
            },

            // Consent details - mandatory if ARN/RIA is present
            ...(parsedInvestor.arn_no || parsedInvestor.ria_code) && {
                CONSENT_DETAILS: {
                    CONSENT_RECORD: [
                        { DATA_SET: "PD", ENABLED_CONSENT: parsedInvestor.consent_payeezz || "Y" },
                        { DATA_SET: "CD", ENABLED_CONSENT: parsedInvestor.consent_can_data || "Y" },
                        { DATA_SET: "MF", ENABLED_CONSENT: parsedInvestor.consent_mapped_folio || "Y" },
                        { DATA_SET: "HD", ENABLED_CONSENT: parsedInvestor.consent_holding_data || "Y" }
                    ]
                }
            },

            // DP Details - conditional
            ...(parsedInvestor.nsdl_dp_id || parsedInvestor.cdsl_dp_id) && {
                DP_DETAILS: {
                    NSDL_DP_ID: parsedInvestor.nsdl_dp_id || "",
                    NSDL_CLIENT_ID: parsedInvestor.nsdl_client_id || "",
                    NSDL_PROOF_ID: parsedInvestor.nsdl_proof_id || "",
                    NSDL_VER_FLAG: parsedInvestor.nsdl_verify_flag || "",
                    CDSL_DP_ID: parsedInvestor.cdsl_dp_id || "",
                    CDSL_CLIENT_ID: parsedInvestor.cdsl_client_id || "",
                    CDSL_PROOF_ID: parsedInvestor.cdsl_proof_id || "",
                    CDSL_VER_FLAG: parsedInvestor.cdsl_verify_flag || ""
                }
            },

            // Bank details
            BANK_DETAILS: {
                BANK_RECORD: createBankRecords()
            },

            // Nominee details
            NOMINEE_DETAILS: {
                NOM_DECL_LVL: parsedInvestor.nominee_declaration_level || "C",
                NOMIN_OPT_FLAG: nominees.length === 0 ? "N" : "Y", // Y = No nominees intended
                NOM_FOLIO_SOA: parsedInvestor.nominee_folio_soa || "Y",
                ...(nominees.length > 0 && {
                    NOMINEES_RECORDS: {
                        NOMINEE_RECORD: createNomineeRecords()
                    }
                })
            }
        }
    };
};