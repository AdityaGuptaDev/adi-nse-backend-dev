import { Console } from "console";

export const preparePayload = (parsedInvestor: any) => {
    // Determine holding type and holder count
    const holdingType = parsedInvestor.holding_type || "SI"; // SI, JO, AS
    //const holderCount = parsedInvestor.holders?.length || 1;
    //const holders = parsedInvestor.holders || [parsedInvestor];

    const holders = parsedInvestor.basicDetails || [];
    const holderCount = holders.length || 1;








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
        const types = ["PR", "SE", "TH", "GD"];
        return types[index] || "PR";
    };

    // Helper function to create holder record

    const createHolderRecord = (holder: any) => {
        // Determine how many holders exist based on basicDetails array
        const holderCount = Array.isArray(holder.basicDetails) ? holder.basicDetails.length : 1;

        // Map over each holder index and create HOLDER_RECORD
        return Array.from({ length: holderCount }).map((_, index) => {
            const basicDetails = Array.isArray(holder.basicDetails)
                ? holder.basicDetails[index]
                : holder.basicDetails;

            const additionalKyc = Array.isArray(holder.additionalKyc)
                ? holder.additionalKyc[index]
                : holder.additionalKyc;

            const fatcaDetails = Array.isArray(holder.fatcaDetails)
                ? holder.fatcaDetails[index]
                : holder.fatcaDetails;

            return {
                HOLDER_TYPE: getHolderType(index),
                NAME: basicDetails.name || holder.name,
                DOB: basicDetails.date_of_birth || holder.dob,
                PAN_EXEMPT_FLAG: "N",
                PAN_PEKRN_NO: basicDetails.pan_pek || holder.pan_no,
                CONTACT_DETAIL: {
                    ES_ISD: basicDetails.residence_isd || "91",
                    RES_STD: basicDetails.residence_std || "",
                    RES_PHONE_NO: basicDetails.residence_phone || "",
                    MOB_ISD_CODE: basicDetails.mobile_isd || "91",
                    PRI_MOB_NO: basicDetails.mobile_number || holder.mobile,
                    PRI_MOB_BELONGSTO: basicDetails.mobile_declaration || "SE",
                    ALT_MOB_NO: basicDetails.alt_mobile || "",
                    OFF_ISD: basicDetails.off_isd || "91",
                    OFF_STD: basicDetails.off_std || "",
                    OFF_PHONE_NO: basicDetails.off_phone || "",
                    PRI_EMAIL: basicDetails.email || holder.email,
                    PRI_EMAIL_BELONGSTO: basicDetails.email_declaration || "SE",
                    ALT_EMAIL: basicDetails.alt_email || "",
                },
                OTHER_DETAIL: {
                    GROSS_INCOME: additionalKyc?.gross_annual_income || "",
                    NET_WORTH: additionalKyc?.networth || "",
                    NET_DATE: additionalKyc?.networth_as_on || "",
                    SOURCE_OF_WEALTH: additionalKyc?.source_of_wealth || "01",
                    SOURCE_OF_WEALTH_OTH: holder.source_of_wealth === "08" ? holder.source_of_wealth_other : "",
                    KRA_ADDR_TYPE: additionalKyc?.kra_address_type || "",
                    OCCUPATION: additionalKyc?.occupation || "",
                    OCCUPATION_OTH: additionalKyc?.occupation_oth || "",
                    PEP: additionalKyc?.political_exposure || "",
                    ANY_OTH_INFO: holder.other_info || ""
                },
                FATCA_DETAIL: {
                    BIRTH_CITY: fatcaDetails?.place_of_birth || "",
                    BIRTH_COUNTRY: fatcaDetails?.country_of_birth || "101",
                    BIRTH_COUNTRY_OTH: fatcaDetails?.birth_country === "999" ? holder.birth_country_other : "",
                    CITIZENSHIP: fatcaDetails?.country_of_citizenship || "101",
                    CITIZENSHIP_OTH: holder.citizenship === "999" ? holder.citizenship_other : "",
                    NATIONALITY: fatcaDetails?.country_of_nationality || "101",
                    NATIONALITY_OTH: holder.nationality === "999" ? holder.nationality_other : "",
                    TAX_RES_FLAG: fatcaDetails?.is_tax_resident_other_than_india ? "Y" : "N",
                    TAXS_RECORDS: ""
                }
            };
        });
    };

    /*const createHolderRecord = (holder: any) => {

        const basicDetails = Array.isArray(holder.basicDetails)
            ? holder.basicDetails[index]
            : holder.basicDetails;

        const additionalKyc = Array.isArray(holder.additionalKyc)
            ? holder.additionalKyc[index]
            : holder.additionalKyc;

        const fatcaDetails = Array.isArray(holder.fatcaDetails)
            ? holder.fatcaDetails[index]
            : holder.fatcaDetails;


        return {
            HOLDER_TYPE: getHolderType(index),
            NAME: holder.name,
            DOB: holder?.basicDetails.date_of_birth,
            PAN_EXEMPT_FLAG: "N",
            PAN_PEKRN_NO: holder.pan_no,
            //PAN_PEKRN_NO: "BNVPS8096Z",
            CONTACT_DETAIL: {
                ES_ISD: basicDetails.residence_isd || "91",
                RES_STD: basicDetails.residence_std || "",
                RES_PHONE_NO: basicDetails.residence_phone || "",
                MOB_ISD_CODE: basicDetails.residence_phone || "91",
                PRI_MOB_NO: basicDetails.mobile_number || holder.mobile,
                PRI_MOB_BELONGSTO: basicDetails.mobile_declaration || "SE",
                ALT_MOB_NO: basicDetails.alt_mobile || "",
                OFF_ISD: basicDetails.off_isd || "91",
                OFF_STD: basicDetails.off_std || "",
                OFF_PHONE_NO: basicDetails.off_phone || "",
                PRI_EMAIL: basicDetails.email || holder.email,
                PRI_EMAIL_BELONGSTO: basicDetails.email_declaration || "SE",
                ALT_EMAIL: basicDetails.alt_email || "",
            },
            OTHER_DETAIL: {
                GROSS_INCOME: additionalKyc?.gross_annual_income,
                NET_WORTH: additionalKyc.networth || "",
                NET_DATE: additionalKyc.networth_as_on || "",
                SOURCE_OF_WEALTH: additionalKyc.source_of_wealth || "01",
                SOURCE_OF_WEALTH_OTH: holder.source_of_wealth === "08" ? holder.source_of_wealth_other : "",
                KRA_ADDR_TYPE: additionalKyc.kra_address_type || "",
                OCCUPATION: additionalKyc.occupation || "",
                OCCUPATION_OTH: additionalKyc.occupation_oth || "",
                PEP: additionalKyc.political_exposure || "",
                ANY_OTH_INFO: holder.other_info || ""
            },
            FATCA_DETAIL: {
                BIRTH_CITY: fatcaDetails[index]?.place_of_birth,
                BIRTH_COUNTRY: fatcaDetails.country_of_birth || "101",
                BIRTH_COUNTRY_OTH: fatcaDetails.birth_country === "999" ? holder.birth_country_other : "",
                CITIZENSHIP: fatcaDetails.country_of_citizenship || "101",
                CITIZENSHIP_OTH: holder.citizenship === "999" ? holder.citizenship_other : "",
                NATIONALITY: fatcaDetails.country_of_nationality || "101",
                NATIONALITY_OTH: fatcaDetails.nationality === "999" ? holder.nationality_other : "",
                TAX_RES_FLAG: fatcaDetails.is_tax_resident_other_than_india ? "Y" : "N",
                TAXS_RECORDS: ""
                /*...(holder.is_tax_resident_other_than_india === "Y" && holder.tax_records?.length > 0 && {
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

        }

    };*/

    // Create nominee records
    const createNomineeRecords = () => {
        if (!nominees.length) return [];


        return nominees.map((nominee: any, index: number) => {
            const isMinor = nominee.nominee_DOB &&
                new Date().getFullYear() - new Date(nominee.nominee_DOB).getFullYear() < 18;

            const IDENTIFICATION_TYPE: Record<number, string> = {
                1: "PA", // PAN
                2: "AD", // Aadhaar
                3: "DL", // Driving License
                4: "PS", // Passport
            };



            return {
                SEQ_NUM: index + 1,
                NOMINEE_NAME: nominee.nominee_name,
                RELATION: nominee.NominineeRelationshipType.mfu_code,
                PERCENTAGE: nominee.percentage_allocation || (100 / nominees.length),
                DOB: nominee.nominee_DOB,

                // Guardian details for minors
                ...(isMinor && {
                    NOM_GURI_NAME: nominee.guardian_name,
                    NOM_GURI_REL: nominee.guardian_relationship,
                    NOM_GURI_DOB: nominee.guardian_dob
                }),




                NOM_PI_TYPE: IDENTIFICATION_TYPE[nominee.identity_type] || "PA",
                NOM_PI_NO: nominee.identity_number,
                NOM_MOBILE: nominee.mobile_number,
                NOM_EMAIL: nominee.email_address,
                NOM_ADDR1: nominee.address_line_1,
                NOM_ADDR2: nominee.address_line_2,
                NOM_ADDR3: nominee.address_line_3,
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
            ACCOUNT_TYPE: bank.account_type,
            BANK_ID: bank.bank_id,
            MICR_CODE: bank.micr,
            IFSC_CODE: bank.ifsc,
            PROOF: bank.bank_proof?.toString(),

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

        /*REQ_HEADER: {
            ENTITY_ID: "40008I",
            UNIQUE_ID: `REQ_${(parsedInvestor.id || Date.now()).toString().padStart(8, '0')}`,
            REQUEST_TYPE: "CANINDREG",
            LOG_USER_ID: parsedInvestor.log_user_id || "M0eGG0WiaLN9kgiiVfS3Ug==",
            EN_ENCR_PASSWORD: parsedInvestor.encrypted_password || "NWbbHpz1kHpDjBBCHV8z7A==",
            VERSION_NO: "1.00",
            TIMESTAMP: new Date(parsedInvestor.createdAt || Date.now()).toISOString()
        },*/
        REQ_BODY: {
            REQ_ENT_VIA: "API",
            REQ_EVENT: parsedInvestor.request_event || "CR", // CR = Create, CM = Modify
            ...(parsedInvestor.request_event === "CM" && { CAN: parsedInvestor.can_number }),
            REG_TYPE: parsedInvestor.registration_type || "E", // P = Physical, E = Electronic
            PROOF_UPLOAD_BY_CAN: parsedInvestor.proof_upload_by_can || "Y",
            ENABLE_ONLINE_ACCESS_FLAG: parsedInvestor.enable_online_access || "Y",

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
            /*HOLDER_RECORDS: {
                HOLDER_RECORD:
                    holderCount === 1
                        ? createHolderRecord(parsedInvestor, 0)
                        : createHolderRecord(parsedInvestor, 0)
            },*/
            HOLDER_RECORDS: {
                HOLDER_RECORD: createHolderRecord(parsedInvestor)
            },
            ARN_DETAILS: {
                ARN_NO: "ARN-104974",
                RIA_CODE: "",
                EUIN_CODE: "E136761"
            },
            CONSENT_DETAILS: {
                CONSENT_RECORD: [
                    { DATA_SET: "PD", ENABLED_CONSENT: parsedInvestor.consent_payeezz || "Y" },
                    { DATA_SET: "CD", ENABLED_CONSENT: parsedInvestor.consent_can_data || "Y" },
                    { DATA_SET: "MF", ENABLED_CONSENT: parsedInvestor.consent_mapped_folio || "Y" },
                    { DATA_SET: "HD", ENABLED_CONSENT: parsedInvestor.consent_holding_data || "Y" }
                ]
            },
            BANK_DETAILS: {
                BANK_RECORD: createBankRecords()
            },
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