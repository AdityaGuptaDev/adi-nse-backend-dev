export const preparePayload = (parsedInvestor: any) => {
    const rawHolders = parsedInvestor.basicDetails || [];
    const banks = parsedInvestor.BankAccountDetails || [];
    const nominees = parsedInvestor.NomineeDetails || [];

    // MFU requires HOLDING_TYPE and the number of HOLDER_RECORDS to agree, or
    // it rejects with "Holder Count should be equal to holder details"
    // (RES_CODE 10287). SI = Single (exactly 1), JO = Joint / AS = Anyone or
    // Survivor (2–3). We had a stray secondary-holder row in the DB from an
    // earlier attempt that was being shipped even when HOLDING_TYPE was SI —
    // slice the holders list to what the declared holding type allows so the
    // request is always internally consistent.
    const holdingType = parsedInvestor.holding_nature || "SI";
    const maxHoldersForType = holdingType === "SI" ? 1 : 3;

    // Deduplicate by date_of_birth, keeping the NEWEST row (highest id) per
    // holder. Legacy data created before the updateHolderDetails fix may
    // contain multiple rows per holder (each PAN edit inserted a new row
    // instead of updating in place). Taking the newest row ensures the most
    // recently saved PAN/name/etc is what reaches MFU — otherwise `slice(0,1)`
    // picks the oldest row with the bad original PAN and the "Edit PAN and
    // Retry" flow keeps failing.
    const byNewestPerDob = new Map<string, any>();
    for (const h of rawHolders) {
        const key = String(h?.date_of_birth ?? h?.id);
        const existing = byNewestPerDob.get(key);
        if (!existing || (h?.id ?? 0) > (existing?.id ?? 0)) {
            byNewestPerDob.set(key, h);
        }
    }
    const dedupedHolders = Array.from(byNewestPerDob.values()).sort(
        (a, b) => (a?.id ?? 0) - (b?.id ?? 0),
    );
    const holders = dedupedHolders.slice(0, maxHoldersForType);
    const holderCount = holders.length || 1;

    const getHolderType = (index: number) =>
        ["PR", "SE", "TH", "GD"][index] || "PR";

    // Pair KYC and FATCA rows to their holder by PAN (primary) or DOB (fallback)
    // instead of by array index. Index-matching was unreliable once the DB
    // contained legacy duplicates — we'd pair holder[0] with a stale kyc row
    // belonging to a since-deleted registration attempt.
    const findMatch = (arr: any[], basic: any) => {
        if (!Array.isArray(arr) || arr.length === 0) return {};
        const byPan = arr.find(
            (x: any) => x?.pan_pek && basic?.pan_pek && x.pan_pek === basic.pan_pek,
        );
        if (byPan) return byPan;
        const byDob = arr.find(
            (x: any) =>
                x?.date_of_birth &&
                basic?.date_of_birth &&
                String(x.date_of_birth) === String(basic.date_of_birth),
        );
        if (byDob) return byDob;
        return arr[0] || {};
    };

    /* -------------------- HOLDER RECORDS -------------------- */
    const createHolderRecords = () => {
        return holders.map((basic: any, index: number) => {
            const kyc = findMatch(parsedInvestor.additionalKyc, basic);
            const fatca = findMatch(parsedInvestor.fatcaDetails, basic);

            return {
                HOLDER_TYPE: getHolderType(index),
                NAME: basic.name,
                DOB: basic.date_of_birth,
                PAN_EXEMPT_FLAG: "N",
                PAN_PEKRN_NO: basic.pan_pek,
                AADHAAR_NO: basic.aadhaar_no || "",

                CONTACT_DETAIL: {
                    RES_ISD: "91",
                    RES_STD: "",
                    RES_PHONE_NO: "",
                    MOB_ISD_CODE: "91",
                    PRI_MOB_NO: basic.mobile_number,
                    PRI_MOB_BELONGSTO: basic.mobile_declaration || "SE",
                    ALT_MOB_NO: "",
                    OFF_ISD: "91",
                    OFF_STD: "",
                    OFF_PHONE_NO: "",
                    PRI_EMAIL: basic.email,
                    PRI_EMAIL_BELONGSTO: basic.email_declaration || "SE",
                    ALT_EMAIL: ""
                },

                OTHER_DETAIL: {
                    GROSS_INCOME: kyc.gross_annual_income || "01",
                    NET_WORTH: kyc.networth || "",
                    NET_DATE: kyc.networth_as_on || "",
                    SOURCE_OF_WEALTH: kyc.source_of_wealth || "02",
                    KRA_ADDR_TYPE: kyc.kra_address_type || "2",
                    OCCUPATION: kyc.occupation || "02",
                    PEP: kyc.political_exposure === "Y" ? "PEP" : "NA"
                },

                FATCA_DETAIL: {
                    BIRTH_CITY: fatca.place_of_birth || "",
                    BIRTH_COUNTRY: fatca.country_of_birth || "101",
                    CITIZENSHIP: fatca.country_of_citizenship || "101",
                    NATIONALITY: fatca.country_of_nationality || "101",
                    IDENTI_TYPE: "C",
                    TAX_RES_FLAG: "Y",
                    TAXS_RECORDS: {
                        TAX_RECORD: [{
                            SEQ_NUM: 1,
                            TAX_COUNTRY: "101",
                            TAX_REF_NO: basic.pan_pek,
                            IDENTI_TYPE: "C"
                        }]
                    }
                }
            };
        });
    };

    /* -------------------- BANK RECORDS -------------------- */
    const createBankRecords = () => {
        return banks.map((bank: any, index: number) => ({
            SEQ_NUM: index + 1,
            DEFAULT_ACC_FLAG: index === 0 ? "Y" : "N",
            ACCOUNT_NO: bank.account_no,
            ACCOUNT_TYPE: bank.account_type,
            BANK_ID: bank.bank_id,
            MICR_CODE: bank.micr,
            IFSC_CODE: bank.ifsc,
            PROOF: bank.bank_proof?.toString()
        }));
    };

    /* -------------------- NOMINEE RECORDS -------------------- */
    const createNomineeRecords = () => {
        return nominees.map((nom: any, index: number) => {
            const isMinor =
                new Date().getFullYear() -
                new Date(nom.nominee_DOB).getFullYear() <
                18;

            return {
                SEQ_NUM: index + 1,
                NOMINEE_NAME: nom.nominee_name,
                RELATION: nom.NominineeRelationshipType.mfu_code,
                PERCENTAGE: nom.percentage_allocation || 100,
                DOB: nom.nominee_DOB,

                ...(isMinor && {
                    NOM_GURI_NAME: nom.guardian_name,
                    NOM_GURI_REL: nom.guardian_relationship,
                    NOM_GURI_DOB: nom.guardian_dob
                }),

                NOM_PI_TYPE: "PA",
                NOM_PI_NO: nom.identity_number,
                NOM_MOBILE: nom.mobile_number,
                NOM_EMAIL: nom.email_address,
                NOM_ADDR1: nom.address_line_1,
                NOM_ADDR2: nom.address_line_2 || "",
                NOM_ADDR3: nom.address_line_3 || "",
                NOM_PINCODE: nom.pin_code,
                NOM_CITY: nom.city,
                NOM_COUNTRY: nom.country_code || "101"
            };
        });
    };

    /* -------------------- FINAL PAYLOAD -------------------- */
    return {
        REQ_HEADER: {
            ENTITY_ID: process.env.ENTITY_ID || "40008I",
            UNIQUE_ID: `REQ${Date.now()}`,
            REQUEST_TYPE: "CANINDREG",
            LOG_USER_ID: "igo8E1D5ABb68LLGoPUfrw==",
            EN_ENCR_PASSWORD: "Zo-xw82Q5IIQKxM8rNn_1A==",
            VERSION_NO: "1.00",
            TIMESTAMP: new Date().toISOString()
        },

        REQ_BODY: {
            REQ_ENT_VIA: "API",
            REQ_EVENT: parsedInvestor.request_event || "CR",
            ...(parsedInvestor.request_event === "CM" && {
                CAN: parsedInvestor.can_number
            }),

            REG_TYPE: parsedInvestor.registration_type || "E",
            PROOF_UPLOAD_BY_CAN: "Y",
            ENABLE_ONLINE_ACCESS_FLAG: "Y",

            ENTITY_EMAIL_DETAILS: [{
                EMAIL_ID: parsedInvestor.reg_email
            }],

            HOLDING_TYPE: holdingType,
            INV_CATEGORY: parsedInvestor.investor_category || "I",
            TAX_STATUS: "RI",

            HOLDER_COUNT: holderCount,
            HOLDER_RECORDS: {
                HOLDER_RECORD: createHolderRecords()
            },

            ARN_DETAILS: {
                ARN_NO: "ARN-104974",
                EUIN_CODE: "E136761"
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
                BANK_RECORD: createBankRecords()
            },

            NOMINEE_DETAILS: {
                NOM_DECL_LVL: "C",
                NOMIN_OPT_FLAG: nominees.length ? "Y" : "N",
                NOM_FOLIO_SOA: "Y",
                ...(nominees.length && {
                    NOMINEES_RECORDS: {
                        NOMINEE_RECORD: createNomineeRecords()
                    }
                })
            }
        }
    };
};
