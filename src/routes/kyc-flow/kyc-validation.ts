import { z } from "zod";
import { messages } from "../../validations/zod-messages";

export const v_pan = z.object({
    pan_no: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    taxStatus: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),

});

export const kyc_personal = z.object({
    investor_id: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    request_type: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
});

export const kyc_personal_updateSignZy = z.object({
    investor_id: z.number({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    request_type: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    userToken: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    synzyuserId: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    pan_no: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
});

export const kyc_personal_updatePOI = z.object({
    investor_id: z.number({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    request_type: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    father_title: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    father_relation: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    user_id: z.number({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    taxStatus: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    gender: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    poiConsent: z.boolean({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    marital_status: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    member_type: z.number({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    mothers_name: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
});

export const address_updateSignZy = z.object({
    userToken: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    synzyuserId: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    request_type: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    investor_id: z.number({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
});

export const address_updatePOA = z.object({
    request_type: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    investor_id: z.number({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    POAConsent: z.boolean({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    kycStatus: z.boolean({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    address_type: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    dob: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    doc_holder_name: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    doc_no: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    address_front_doc: z.string().optional().nullable(),
    address_back_doc: z.string().optional().nullable(),
    userToken: z.string().optional().nullable(),
    synzyuserId: z.string().optional().nullable(),
    address1: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    district: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    pincode: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    city: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    state_id: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    country_id: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    corr_doc_no: z.string().optional().nullable(),
    corr_aadhaar_back_doc: z.string().optional().nullable(),
    corr_aadhaar_front_doc: z.string().optional().nullable(),
    corr_address1: z.string().optional().nullable(),
    corr_address2: z.string().optional().nullable(),
    corr_address_type: z.string().optional().nullable(),
    corr_city: z.string().optional().nullable(),
    corr_country_id: z.string().optional().nullable(),
    corr_district: z.string().optional().nullable(),
    corr_pincode: z.string().optional().nullable(),
    corr_state_id: z.string().optional().nullable(),
    same_as_permanent: z.boolean().optional().nullable(),
});

export const declaration_validation = z.object({
    investor_id: z.number({
        required_error: "investor_id is required",
    }),
    kycStatus: z.boolean({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    is_indian_citizen: z.string({
        required_error: "is_indian_citizen is required",
    }),
    signZy_user_Token: z.string().optional().nullable(),
    signZy_user_id: z.string().optional().nullable(),
    is_politically_exposed: z.string({
        required_error: "is_politically_exposed is required",
    }),
    is_indian_taxpayer: z.string({
        required_error: "is_indian_taxpayer is required",
    }),
    is_related_to_pep: z.string({
        required_error: "is_related_to_pep is required",
    }),

    occupation: z.string({
        required_error: "occupation is required",
    }),
    income_source_id: z.number({
        required_error: "income_source_id is required",
    }),
    salary_slab_id: z.number({
        required_error: "salary_slab_id is required",
    }),

    COB: z.string().optional().nullable(),
    POB: z.string({
        required_error: "Place of birth is required",
    }),

    citizenship_country: z.string().optional().nullable(),
    foreign_address: z.string().optional().nullable(),
    foreign_pincode: z.string().optional().nullable(),
    foreign_city: z.string().optional().nullable(),
    foreign_district: z.string().optional().nullable(),
    foreign_state: z.string().optional().nullable(),
    foreign_country: z.string().optional().nullable(),


    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});


export const bank_updateSignZy = z.object({
    userToken: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    synzyuserId: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    request_type: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    investor_id: z.number({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
});

export const bank_update = z.object({
    request_type: z.string({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    investor_id: z.number({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    userToken: z.string().optional().nullable(),
    synzyuserId: z.string().optional().nullable(),
    kycStatus: z.boolean({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    bankAccounts: z.array(z.object({
        cancelled_cheque: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        account_no: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        account_type: z.number({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        ifsc: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        bank_id: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        micr: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        branch: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        bank_proof: z.number({
            required_error: messages.required,
            invalid_type_error: messages.type,
        })
    })).min(1, "At least one bank account is required")
});

export const nominee_update = z.object({
    investor_id: z.number({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    kycStatus: z.boolean({
        required_error: messages.required,
        invalid_type_error: messages.type,
    }),
    userToken: z.string().optional().nullable(),
    synzyuserId: z.string().optional().nullable(),

    nominee_details: z.array(z.object({
        nominee_Type: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        guardian_relationship: z.string().optional(),
        guardian_email: z.string().optional(),
        guardian_mobile: z.string().optional(),
        guardian_DOB: z.string().optional(),
        guardian_PAN: z.string().optional(),
        guardian_name: z.string().optional(),
        country: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        pin_code: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        identity_type: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        identity_number: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        state: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        city: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        address_line_2: z.string().optional(),
        address_line_1: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        email_address: z.string().email({
            message: "Invalid email format"
        }),
        mobile_number: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        percentage_allocation: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        relation: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        nominee_DOB: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        }),
        nominee_name: z.string({
            required_error: messages.required,
            invalid_type_error: messages.type,
        })
    })).min(1, "At least one nominee is required")
});
