import { Op, QueryTypes, Transaction } from "sequelize";
import { AddressType, AddressDetail, BankAccountDetail, BankProof, CountryMaster, Gender, InvestorDeclaration, KYCPincode, MaritalStatus, MobileRelation, NomineeDetail, NomineeGuardianRelationship, OtpDetail, PersonalDocuments, RelationshipPrimaryHolder, RelationshipProof, NominineeRelationshipType, StateMaster, TaxStatus, InvestorRegistration, OccupationMaster, IncomeSource, AnnuaIincomeMaster, NomineeIdentity, BankMaster, Users, UserMapping, UserRegistration, BcRegistration, InvestorBasicDetails, InvestorAdditionalKyc, InvestorFatcaDetails } from "../../db/core/init-control-db";
import db from "../../db/core/control-db";
import sequelize from "sequelize/types/sequelize";
import { randomBytes } from "crypto";
import { addHolidingAccount } from "../../services/investor.service";
import { ACCOUNT_TYPE } from "../../utils/constant";
import { preparePayload } from "../mfu/preparePayload";
import { MFUCanFillEezzService } from "../../services/mfu.service";
import { sendEmail2 } from "../../services/email.service2";
import ErrorLogger from "../../db/core/logger/error-logger";
import e from "express";
import { updateUser } from "../user/user-handler";


export const findInvestorRegistrationByPanNo = (pan_no: any) => {
    return InvestorRegistration.findOne({
        where: {
            pan_no: pan_no
        }
    })
}


export const getAddressDetail = (investor_id: number) => {
    return AddressDetail.findOne({
        where: { investor_id: investor_id },
    });
}


export const findUserBasicMainDetailByUserID = (user_id: any, t?: Transaction) => {
    if (t) {
        return InvestorRegistration.findOne({
            where: {
                user_id: user_id, group_leader_id: 0
            },
            transaction: t
        })
    } else {
        return InvestorRegistration.findOne({
            where: {
                user_id: user_id, group_leader_id: 0
            }
        })
    }

}

export const findUserDataByPanNoUserId = (body: any) => {
    return InvestorRegistration.findOne({
        where: {
            user_id: body.user_id,
            pan_no: body.pan_no
        }
    })
}

export const findUserDataByNotUserId = (body: any) => {
    return InvestorRegistration.findOne({
        where: { user_id: { [Op.not]: body.user_id }, pan_no: body.pan_no }
    })
}

export const addUserInvestorData = (body: any, t: any) => {
    return InvestorRegistration.create(body, { transaction: t });
}

export const addUserPartnerData = (body: any, t: any) => {
    return UserRegistration.create(body, { transaction: t });
}

export const addUserBcData = (body: any, t: any) => {
    return BcRegistration.create(body, { transaction: t });
}

export const findOtpDetail = (value: any) => {
    console.log(value, 'value')
    return OtpDetail.findOne({
        where: {
            [Op.or]: [
                { email: value.email },
                { mobile: value.mobile },
            ],
        },
    })
}
export const findMobileInOtpDetail = (mobile: any) => {
    return OtpDetail.findOne({
        where: { mobile: mobile },
    })
}

export const updateEmailInOtpDetail = (otpbody: any, email: any) => {
    return OtpDetail.update(otpbody, {
        where: {
            email: email,
        },
    })
}

export const updateOtpDetail = (otpbody: any, value: any) => {
    return OtpDetail.update(otpbody, {
        where: {
            [Op.or]: [
                { email: value.email },
                { mobile: value.mobile },
            ],
        },
    })
}

export const addEmailInOtpDetail = (otpbody: any) => {
    return OtpDetail.create(otpbody);
}

export const findUserDataById = (id: any) => {
    return InvestorRegistration.findOne({
        where: { id: id }
    })
}


export const getUserSummary = async (investor_id: any) => {
    return InvestorRegistration.findOne({
        where: { id: investor_id },
        include: [
            {
                model: AddressDetail, include: [
                    { model: CountryMaster },
                    { model: StateMaster },
                    { model: AddressType },
                    { model: CountryMaster, as: "CorrCountry" },
                    { model: StateMaster, as: "CorrState" },
                    { model: AddressType, as: "CorrAddressType" }
                ]
            },
            { model: Gender },
            { model: MaritalStatus },
            {
                model: InvestorDeclaration,
                include: [
                    { model: OccupationMaster },
                    { model: CountryMaster, as: "ContryOfBirth" },
                    { model: CountryMaster, as: "CitizenshipCountry" },
                    { model: IncomeSource },
                    { model: AnnuaIincomeMaster },
                    { model: StateMaster }
                ]
            },
            {
                model: BankAccountDetail,
                include: [{
                    model: BankProof
                }, {
                    model: BankMaster
                }]
            },
            {
                model: NomineeDetail,
                include: [
                    {
                        model: NominineeRelationshipType
                    },
                    {
                        model: NomineeGuardianRelationship,
                    },
                    {
                        model: CountryMaster
                    },
                    {
                        model: StateMaster
                    },
                    {
                        model: NomineeIdentity
                    }
                ]
            },
            {
                model: PersonalDocuments
            }

        ]
    });
}


export const updateInvestorRegistration = (body: any, id: any, t?: Transaction) => {
    if (t) {
        return InvestorRegistration.update(body, {
            where: { id: id },
            returning: true,
            transaction: t
        })
    } else {
        return InvestorRegistration.update(body, {
            where: { id: id },
            returning: true
        })
    }

}

export const createAddressDetail = (body: any) => {
    return AddressDetail.create(body);
}

export const updateAddressDetail = (body: any, id: any) => {
    return AddressDetail.update(body, {
        where: { investor_id: id },
        returning: true
    })
}

export const getAllGender = () => {
    return Gender.findAll()
}

export const getAllMaritalStatus = () => {
    return MaritalStatus.findAll()
}

export const getAllMobileRelation = () => {
    return MobileRelation.findAll()
}
export const getAllRelationshipPrimaryHolder = () => {
    return RelationshipPrimaryHolder.findAll()
}
export const getAllRelationshipProof = () => {
    return RelationshipProof.findAll()
}
export const getAllTaxStatus = () => {
    return TaxStatus.findAll()
}

//declaration

export const getInvestorDeclaration = (investor_id: number) => {
    return InvestorDeclaration.findOne({
        where: { investor_id: investor_id },
    });
}

export const createInvestorDeclaration = (body: any) => {
    return InvestorDeclaration.create({ ...body });
}
export const updateInvestorDeclaration = (body: any, id: number) => {
    return InvestorDeclaration.update({ ...body }, { where: { investor_id: id } }
    );
}

//bank details

export const getBankDetails = (investor_id: number) => {
    return BankAccountDetail.findAll({
        where: { investor_id: investor_id },
    });
}

export const createBankDetails = (body: any) => {
    return BankAccountDetail.bulkCreate(body);
}
export const updateBankDetails = (body: any, id: number) => {
    return BankAccountDetail.update({ ...body }, { where: { id } }
    );
}
export const destroyBankAcccountDetails = (id: number) => {
    return BankAccountDetail.destroy({ where: { investor_id: id } }
    );
}


//nominees

export const getNomineeDetails = (investor_id: number) => {
    return NomineeDetail.findAll({
        where: { investor_id: investor_id },
    });
}

export const createNomineesDetails = (body: any) => {
    return NomineeDetail.bulkCreate(body);
}

export const deleteNomineesDetails = (id: any) => {
    return NomineeDetail.destroy({ where: { investor_id: id } });
}

export const updateNomineesDetails = (body: any, id: number) => {
    return NomineeDetail.update({ ...body }, { where: { id } }
    );
}


//personal verification

export const getPersonalDetails = (investor_id: number) => {
    return PersonalDocuments.findOne({
        where: { investor_id: investor_id },
    });
}

export const createPersonalDetails = (body: any) => {
    return PersonalDocuments.create(body);
}

export const updatePersonalByInvestorDetails = (body: any, id: number) => {
    return PersonalDocuments.update(body, {
        where: { investor_id: id },
        returning: true
    })
}


export const getKYCPincodeList = () => {
    return KYCPincode.findAll();
}

export const CheckPinCodeData = (body: any) => {
    return KYCPincode.findOne({
        where: {
            pincode: body.pincode,
        }
    })
}

export const getAllBankProof = () => {
    return BankProof.findAll()
}

export const getAllRelationshipTypes = () => {
    return NominineeRelationshipType.findAll()
}

export const getAllNomineeGuardianRelationshipTypes = () => {
    return NomineeGuardianRelationship.findAll()
}

export const getAllIdentityTypes = () => {
    return NomineeIdentity.findAll()
}
export const getAllBank = () => {
    return BankMaster.findAll()
}

export const getUserDataForNomineeForm = async (investor_id: number) => {
    const userData = await InvestorRegistration.findOne({
        where: { id: investor_id },
        include: [
            { model: AddressDetail, include: [{ model: CountryMaster }, { model: StateMaster }, { model: AddressType }] },
            { model: Gender },
            { model: MaritalStatus },
            {
                model: InvestorDeclaration,
                include: [
                    { model: OccupationMaster },
                    { model: CountryMaster, as: "ContryOfBirth" },
                    { model: CountryMaster, as: "CitizenshipCountry" },

                ]
            }

        ]
    });
    return userData;
}

export const findAddressType = (id: any) => {
    return AddressType.findOne({
        where: {
            id: id
        }
    })
}
export const findState = (id: any) => {
    return StateMaster.findOne({
        where: {
            id: id
        }
    })
}
export const findCountry = (id: any) => {
    return CountryMaster.findOne({
        where: {
            id: id
        }
    })
}


export const getInvBankUpdate = async (id: string): Promise<any[]> => {
    const query = `select badh.account_no from "BankAccountDetailHistory" badh where badh.investor_id =:id `;

    try {
        const results = await db.query(query, {
            replacements: { id: id.trim().toUpperCase() },
            type: QueryTypes.SELECT,
        });
        console.log("query-" + query);
        return results as any[];
    } catch (error) {
        console.error(`Error searching by ID ${id}:`, error);

        throw error; // this ensures function always throws or returns
    }
};



export const gteCanDetailsInvestor = async (pan: string): Promise<any[]> => {
    const query = `select ir.reg_email,ir.reg_mobile,bad.account_no,bad.ifsc ,bad.branch,bm.bank_name,bad.micr ,
nd.nominee_name ,nd."nominee_DOB" ,nd.identity_number ,ni."type" ,nd.percentage_allocation ,nd.pin_code ,nd.city ,nd.state ,nd.country ,
nd.address_line_1 ,nd.email_address ,nd.mobile_number 
from "InvestorRegistration" ir
inner join "BankAccountDetail" bad on ir.id = bad.investor_id 
inner join "BankMaster" bm on bm.id =bad.bank_id
inner join "NomineeDetail" nd on ir.id =nd.investor_id
inner join "NomineeIdentity" ni on nd.identity_type =ni.id
where ir.pan_no =:pan `;

    try {
        const results = await db.query(query, {
            replacements: { pan: pan.trim().toUpperCase() },
            type: QueryTypes.SELECT,
        });
        console.log("query-" + query);
        return results as any[];
    } catch (error) {
        console.error(`Error searching by ID ${pan}:`, error);

        throw error; // this ensures function always throws or returns
    }
};




export const completeRegistration = async (
    partner: any,
    verification: any,
    fatca: any,
    nominees: any
) => {
    console.log("---- Inside completeRegistration ----");

    const mobile = partner.mobile || partner.phone;
    if (!mobile) throw new Error("Mobile number is required");

    let genderValue = null;
    if (partner?.gender === "Male") genderValue = 1;
    else if (partner?.gender === "Female") genderValue = 2;

    // 🔹 1️⃣ Check if Investor already exists
    let investor = await InvestorRegistration.findOne({ where: { reg_mobile: mobile } });
    //const pan ='CYUPG2638P';

    if (!investor) {
        console.log("Creating new InvestorRegistration...");

        investor = await InvestorRegistration.create({
            name: partner.name,
            dob: partner.dob || null,
            pan_no: partner.pan || null,
            reg_email: partner.email || null,
            reg_mobile: mobile,
            gender: genderValue || null,
            marital_status: partner.marital_status || null,
            fathers_name: partner.fathers_name || null,
            father_relation: partner.father_relation || null,
            father_title: partner.father_title || null,
            mothers_name: partner.mothers_name || null,
            isKYCDone: true,
            is_kyc_complete: true,
            last_kyc_step: 100,
            poiConsent: partner.poiConsent || false,
            tax_status: fatca.tax_status || null,
            annualFund: partner.annualFund || null,
            guardian_name: partner.guardian_name || null,
            guardian_pan_no: partner.guardian_pan_no || null,
            guardian_dob: partner.guardian_dob || null,
            relationship_primary: partner.relationship_primary || null,
            createdBy: partner.createdBy || 1,
            modifiedBy: partner.modifiedBy || 1,
        });

        console.log(`✅ Investor created with ID: ${investor.id}`);
    } else {
        console.log(`Updating existing InvestorRegistration ID: ${investor.id}`);

        await investor.update({
            name: partner.name,
            dob: partner.dob || null,
            pan_no: partner.pan || null,
            reg_email: partner.email || null,
            gender: genderValue || null,
            marital_status: partner.marital_status || null,
            fathers_name: partner.fathers_name || null,
            father_relation: partner.father_relation || null,
            father_title: partner.father_title || null,
            mothers_name: partner.mothers_name || null,
            isKYCDone: true,
            is_kyc_complete: true,
            last_kyc_step: 100,
            poiConsent: partner.poiConsent || false,
            tax_status: fatca.tax_status || null,
            annualFund: partner.annualFund || null,
            guardian_name: partner.guardian_name || null,
            guardian_pan_no: partner.guardian_pan_no || null,
            guardian_dob: partner.guardian_dob || null,
            relationship_primary: partner.relationship_primary || null,
            modifiedBy: partner.modifiedBy || 1,
        });
    }

    // 🔹 2️⃣ Save related details
    await saveRelatedDetails(investor.id, verification, fatca, nominees);

    // 🔹 3️⃣ Create User & Mapping + Trigger CAN
    const userCreationResult = await createUserAndMapping(investor, partner);

    return {
        success: true,
        message: "Investor registration completed successfully",
        canResponse: userCreationResult.canResponse,
    };
};

// ======================== RELATED DETAILS =========================

const saveRelatedDetails = async (investorId: number, verification: any, fatca: any, nominees: any[]) => {
    console.log(`Saving related details for investorId: ${investorId}`);

    // 🔸 Bank Details
    if (verification.bank) {
        const existingBank = await BankAccountDetail.findOne({ where: { investor_id: investorId } });
        const bankData = {
            investor_id: investorId,
            account_no: verification.bank.accountNumber || null,
            ifsc: verification.bank.ifsc || null,
            account_type: verification.bank.accountType || null,
            branch: verification.bank.branch || null,
            cancelled_cheque: verification.bank.cancelledCheque || null,
            bank_id: verification.bank.bankId || null,
            micr: verification.bank.micr || null,
            bank_proof: verification.bank.bankProof || null,
        };

        if (existingBank) {
            await existingBank.update(bankData);
            console.log("Bank details updated");
        } else {
            await BankAccountDetail.create(bankData);
            console.log("Bank details inserted");
        }
    }

    // 🔸 FATCA
    const existingFatca = await InvestorDeclaration.findOne({ where: { investor_id: investorId } });
    const fatcaData = {
        investor_id: investorId,
        is_indian_citizen: fatca.citizenship === "India" ? 1 : 0,
        is_politically_exposed: fatca.politically_exposed === "Yes" ? 1 : 0,
        is_indian_taxpayer: fatca.tax_resident_other === "No" ? 1 : 0,
        is_related_to_pep: 0,
        occupation: Number(fatca.occupation) || null,
        income_source_id: Number(fatca.wealth_source) || null,
        salary_slab_id: Number(fatca.income_slab) || null,
        COB: null,
        POB: fatca.place_of_birth || null,
        citizenship_country: null,
    };

    if (existingFatca) {
        await existingFatca.update(fatcaData);
        console.log("FATCA updated");
    } else {
        await InvestorDeclaration.create(fatcaData);
        console.log("FATCA inserted");
    }

    // 🔸 Nominees
    if (nominees && nominees.length > 0) {
        await NomineeDetail.destroy({ where: { investor_id: investorId } });
        for (const nominee of nominees) {
            await NomineeDetail.create({
                investor_id: investorId,
                nominee_name: nominee.nominee_name,
                nominee_DOB: nominee.nominee_DOB,
                nominee_Type: nominee.nominee_Type,
                relation: nominee.relation,
                mobile_number: nominee.mobile_number,
                email_address: nominee.email_address,
                percentage_allocation: nominee.percentage_allocation,
                country: Number(nominee.country) || null,
                state: Number(nominee.state) || null,
                city: nominee.city,
                pin_code: nominee.pin_code,
                address_line_1: nominee.address_line_1,
                address_line_2: nominee.address_line_2,
                guardian_name: nominee.nominee_Type === "Minor" ? nominee.guardian_name : null,
                guardian_PAN: nominee.nominee_Type === "Minor" ? nominee.guardian_PAN : null,
                guardian_DOB: nominee.nominee_Type === "Minor" ? nominee.guardian_DOB : null,
                guardian_relationship: nominee.nominee_Type === "Minor" ? nominee.guardian_relationship : null,
                guardian_mobile: nominee.nominee_Type === "Minor" ? nominee.guardian_mobile : null,
                guardian_email: nominee.nominee_Type === "Minor" ? nominee.guardian_email : null,
                identity_type: Number(nominee.identity_type) || null,
                identity_number: nominee.identity_number,
            });
        }
        console.log("Nominee details inserted");
    }
};



const createUserAndMapping = async (investor: any, partner: any) => {
    console.log("Creating user and user mapping...");

    const plainPassword = randomBytes(6).toString("base64");

    console.log("plainPassword----", plainPassword);

    let existingUser = await Users.findOne({ where: { mobile: investor.reg_mobile } });
    let canResponse: any = null;

    if (!existingUser) {
        existingUser = await Users.create({
            name: investor.name,
            email: investor.reg_email,
            mobile: investor.reg_mobile,
            password: plainPassword,
            isMobileOTPVerified: true,
            isEmailOTPVerified: true,
            roleId: 2,
            userTypeId: 2,
            isPartner: false,
            createdBy: partner.createdBy || 1,
            modifiedBy: partner.modifiedBy || 1,
            user_inv_id: investor.id.toString(),
        });

        console.log(`✅ User created with ID: ${existingUser.id}`);

        // 🔹 AUTO-TRIGGER CAN REGISTRATION
        try {
            console.log("🚀 Initiating CAN registration for investor:", investor.id);
            const investorData = await getUserSummary(investor.id);

            console.log("investorData---", investorData);

            const parsedInvestor = JSON.parse(JSON.stringify(investorData));

            console.log("parsedInvestor---", parsedInvestor);

            const payload = preparePayload(parsedInvestor);

            console.log("payload---", payload);

            const response: any = await MFUCanFillEezzService(payload);
            const result = response?.CANIndFillEezzResp;

            canResponse = result;

            if (result?.RESP_HEADER?.RES_CODE === "0") {
                const CAN = result?.RESP_BODY?.CAN;
                await addHolidingAccount({
                    investor_id: investor.id,
                    first_investor_id: investor.id,
                    second_investor_id: null,
                    third_investor_id: null,
                    account_holding_type: ACCOUNT_TYPE.find((opt: any) => opt.value === "SI")?.code,
                    CAN_Id: CAN,
                });
                await updateInvestorRegistration(
                    { is_kyc_complete: true, is_CAN_registered: true },
                    investor.id
                );
                console.log(`✅ CAN registered successfully for investor ${investor.id}: ${CAN}`);


            } else {
                console.warn(
                    `⚠️ CAN registration failed for investor ${investor.id}:`,
                    result?.RESP_HEADER?.RES_MSG
                );
            }

            // ✅ SEND EMAIL AFTER CAN REGISTRATION
            const emailToUse = partner.email || investor.reg_email || "";
            const nameToUse = investor.name || "Investor";

            if (emailToUse) {
                const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>
                  body { background-color: #f4f4f4; font-family: Arial, sans-serif; }
                  .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 30px; text-align: center; }
                  .logo img { width: 120px; margin-bottom: 20px; }
                  .title { font-size: 22px; color: #333; margin-bottom: 20px; }
                  .otp-box { font-size: 28px; color: #007bff; font-weight: bold; letter-spacing: 2px; background: #eef4ff; padding: 15px 0; border-radius: 6px; margin: 20px 0; }
                  .message { font-size: 15px; color: #555; margin: 10px 0 20px; }
                  .footer { font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 15px; margin-top: 30px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="logo">
                    <img src="https://vedantasset.com/wp-content/uploads/2024/03/cropped-vedant-asset-logo.webp" alt="Vedant Asset Logo" />
                  </div>
                  <div class="title">Your Account Credentials</div>
                  <div class="message">Dear ${nameToUse},</div>
                  <div class="message">Your account has been successfully created and CAN registration is complete. Please use the password below to log in:</div>
                  <div class="otp-box">${plainPassword}</div>
                  <div class="message">We recommend changing your password after your first login.</div>
                  <div class="footer">© ${new Date().getFullYear()} Vedant Asset Limited. All rights reserved.</div>
                </div>
              </body>
            </html>`;

                try {
                    await sendEmail2(emailToUse, "Customer", "Your Account Password", htmlContent);
                    console.log("📧 Email sent successfully to:", emailToUse);
                } catch (err) {
                    console.error(" Failed to send email:", err);
                }
            }

        } catch (canError) {
            console.error(" Error during CAN registration:", canError);
            canResponse = { error: true, message: canError };
        }
    } else {
        console.log("ℹ️ User already exists, skipping creation");
    }

    // 🔹 Update InvestorRegistration with user_id
    if (!investor.user_id) {
        await InvestorRegistration.update(
            { user_id: existingUser.id },
            { where: { id: investor.id } }
        );
    }

    const existingMapping = await UserMapping.findOne({
        where: { user_id: existingUser.id, ref_id: investor.id },
    });

    if (!existingMapping) {
        await UserMapping.create({
            user_id: existingUser.id,
            role_id: existingUser.roleId,
            userType_id: existingUser.userTypeId,
            ref_id: investor.id,
        });
    }

    return { userId: existingUser.id, canResponse };
};




export const updateHolderDetails = async (
    investor_id: number,
    last_kyc_step: string,
    next_kyc_step: string,
    reg_email: string,
    user_id: string,

    data: any
) => {
    // Which holder is being saved? 'sole-secondary' means holder index 1,
    // anything else (sole-primary, etc.) means holder index 0. We use the
    // step signal as the source of truth instead of matching on DOB, because
    // DOB-based matching broke in two ways:
    //   1) A PAN edit used to change the lookup key and duplicate the primary row.
    //   2) A blank/mistyped DOB on the secondary step silently overwrote the
    //      primary row — which is exactly why the Summary only ever showed one
    //      holder after a Joint save.
    // With the step-based routing below, each step always touches its own row.
    const holderIndex = last_kyc_step === "sole-secondary" ? 1 : 0;

    const basicDetailsPayload = data?.investorBasicDetails || {};
    const { pan_pek, date_of_birth, name } = basicDetailsPayload;

    await updateInvestorRegistration(
        { last_kyc_step, next_kyc_step, reg_email },
        investor_id
    );

    let email = reg_email;

    if (user_id) {
        const userData = await Users.findOne({
            where: { id: user_id },
        });
        if (userData && (userData.email == null || userData.email === "")) {
            await updateUser({ email, name }, user_id);
        }
    }

    // Resolve the specific row for this holder index. `order: [[id, ASC]]`
    // gives us a stable ordering — primary was inserted first, secondary
    // later. If the row at the requested index doesn't exist yet, we create
    // one; otherwise we update it in place. This also cleans up any extra
    // rows beyond the declared count at save time.
    const pickHolderRow = async <T extends { update: Function }>(
        model: any,
    ): Promise<T | null> => {
        const rows = await model.findAll({
            where: { investor_id },
            order: [["id", "ASC"]],
        });
        return rows[holderIndex] ?? null;
    };

    const existingBasic = await pickHolderRow<any>(InvestorBasicDetails);
    if (existingBasic) {
        await existingBasic.update(basicDetailsPayload);
    } else {
        await InvestorBasicDetails.create({ investor_id, ...basicDetailsPayload });
    }

    const additionalKycPayload = {
        ...data?.additionalKyc,
        pan_pek,
        date_of_birth,
    };

    const existingKyc = await pickHolderRow<any>(InvestorAdditionalKyc);
    if (existingKyc) {
        await existingKyc.update(additionalKycPayload);
    } else {
        await InvestorAdditionalKyc.create({ investor_id, ...additionalKycPayload });
    }

    const fatcaPayload = {
        ...data?.fatca,
        pan_pek,
        date_of_birth,
    };

    const existingFatca = await pickHolderRow<any>(InvestorFatcaDetails);
    if (existingFatca) {
        await existingFatca.update(fatcaPayload);
    } else {
        await InvestorFatcaDetails.create({ investor_id, ...fatcaPayload });
    }

    return {
        message: "Investor details updated successfully",
        investor_id,
        holder_index: holderIndex,
    };
};

export const getHolderDetails = async (investor_id: number) => {
    try {
        if (!investor_id) {
            throw new Error("Investor ID is required");
        }

        // Order by id ASC so primary (inserted first) is always at index 0
        // and secondary at index 1. The frontend's SolePrimaryHolder and
        // SoleSecondaryHolder steps both index into these arrays by holder
        // position, so the ordering must be stable and consistent with the
        // write-side holder-index picking in updateHolderDetails.
        const orderAsc: any = [["id", "ASC"]];

        const basicDetails = await InvestorBasicDetails.findAll({
            where: { investor_id },
            order: orderAsc,
            raw: true,
        });

        const additionalKyc = await InvestorAdditionalKyc.findAll({
            where: { investor_id },
            order: orderAsc,
            raw: true,
        });

        const fatca = await InvestorFatcaDetails.findAll({
            where: { investor_id },
            order: orderAsc,
            raw: true,
        });

        // Registration (optional but usually needed)
        const registration = await InvestorRegistration.findOne({
            where: { id: investor_id },
            raw: true,
        });

        const bankdetails = await BankAccountDetail.findAll({
            where: { investor_id: investor_id },
            raw: true,
        });

        const nominee = await NomineeDetail.findAll({
            where: { investor_id: investor_id },
            raw: true,
        });



        return {
            message: "Investor details fetched successfully",
            investor_id,
            data: {
                basicDetails: basicDetails || {},
                additionalKyc: additionalKyc || {},
                fatca: fatca || {},
                registration: registration || {},
                bankDetails: bankdetails || {},
                nomineeDetails: nominee || {},
            },
        };
    } catch (error) {
        console.error("Error fetching investor details:", error);
        throw error;
    }
};


export const saveAdditionalKycDetails = async (investor_id: number, data: any) => {
    const existing = await InvestorAdditionalKyc.findOne({ where: { investor_id } });

    if (existing) {
        return existing.update(data);
    }

    return InvestorAdditionalKyc.create({ investor_id, ...data });
};

export const saveFatcaDetails = async (investor_id: number, data: any) => {
    const existing = await InvestorFatcaDetails.findOne({ where: { investor_id } });

    if (existing) {
        return existing.update(data);
    }

    return InvestorFatcaDetails.create({ investor_id, ...data });
};



export const saveBankAccountDetails = async (investor_id: number,
    next_kyc_step: string,
    last_kyc_step: string,
    bank_details: any[]) => {
    await updateInvestorRegistration(
        { last_kyc_step, next_kyc_step },
        investor_id
    );

    // Remove old bank accounts for this investor
    await BankAccountDetail.destroy({ where: { investor_id } });

    // Insert new bank accounts
    const results = await Promise.all(
        bank_details.map((acc) =>
            BankAccountDetail.create({
                investor_id,
                cancelled_cheque: acc.cancelled_cheque || "",
                account_no: acc.account_number,   // mapping payload → model
                account_type: acc.account_type,
                bank_id: Number(acc.bank_id),
                ifsc: acc.ifsc,
                micr: acc.micr,
                branch: acc.branch || "",
                bank_proof: Number(acc.bank_proof)
            })
        )
    );

    return results;
};


export const saveNomineeDetails = async (next_kyc_step: string,
    last_kyc_step: string, investorId: number, nomineeDetails: any[]) => {
    await updateInvestorRegistration(
        { last_kyc_step, next_kyc_step },
        investorId
    );

    // Delete existing nominees
    await NomineeDetail.destroy({
        where: { investor_id: investorId }
    });

    // Insert new nominees
    const inserted = await NomineeDetail.bulkCreate(
        nomineeDetails.map(n => ({
            investor_id: investorId,
            nominee_name: n.nominee_name,
            nominee_DOB: n.nominee_DOB,
            nominee_Type: n.nominee_Type,
            relation: n.relation,
            mobile_number: n.mobile_number,
            email_address: n.email_address,
            percentage_allocation: n.percentage_allocation,
            guardian_name: n.guardian_name,
            guardian_PAN: n.guardian_PAN,
            guardian_DOB: n.guardian_DOB,
            guardian_relationship: n.guardian_relationship,
            guardian_mobile: n.guardian_mobile,
            guardian_email: n.guardain_email,
            country: n.country,
            state: n.state,
            city: n.city,
            pin_code: n.pin_code,
            address_line_1: n.address_line_1,
            address_line_2: n.address_line_2,
            identity_type: n.identity_type,
            identity_number: n.identity_number,
            nominee_folio_soa: n.nominee_folio_soa
        }))
    );

    return inserted;
};


export const getCanSummary = async (investor_id: number) => {
    try {
        const user = await InvestorRegistration.findOne({
            where: { id: investor_id },
            include: [

                { model: InvestorBasicDetails, as: "basicDetails" },

                { model: InvestorAdditionalKyc, as: "additionalKyc" },

                { model: InvestorFatcaDetails, as: "fatcaDetails" }, // no alias assumed

                {
                    model: BankAccountDetail,
                    include: [
                        { model: BankProof },
                        { model: BankMaster }
                    ]
                },
                {
                    model: NomineeDetail,
                    include: [
                        { model: NominineeRelationshipType }
                    ]
                    /*include: [
                        {
                            model: NominineeRelationshipType
                        },
                        {
                            model: NomineeGuardianRelationship,
                        },
                        {
                        },
                        {
                            model: StateMaster
                        },
                        {
                            model: NomineeIdentity
                        }
                    ]*/
                },


            ]
        });



        const investorData = user?.dataValues;
        const parsedInvestor = {
            ...investorData,
            //basicDetails: investorData.basicDetails?.dataValues || {},
            //additionalKyc: investorData.additionalKyc?.dataValues || {},
            basicDetails: investorData.basicDetails?.map((f: any) => ({
                ...f.dataValues
            })) || [],
            additionalKyc: investorData.additionalKyc?.map((f: any) => ({
                ...f.dataValues
            })) || [],
            fatcaDetails: investorData.fatcaDetails?.map((f: any) => ({
                ...f.dataValues
            })) || [],

            BankAccountDetails: investorData.BankAccountDetails?.map((b: any) => ({
                ...b.dataValues,
                BankProof: b.BankProof?.dataValues || null,
                BankMaster: b.BankMaster?.dataValues || null
            })) || []


        }

        //console.log(parsedInvestor)

        return parsedInvestor || null;

    } catch (error: any) {
        console.error(" Error in getCanSummary:", error);

        if (ErrorLogger?.write) {
            ErrorLogger.write({
                type: "getCanSummary error",
                error: error.message || error.toString(),
                stack: error.stack
            });
        }

        return null;
    }
};


