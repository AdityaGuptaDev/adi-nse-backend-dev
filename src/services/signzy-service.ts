import axios from "axios";
import { ExternalEntity, SIGNZY_PLATFORM } from "../utils/constant";
const FormData = require("form-data");
const fs = require('fs');
import configs from "../config/config";
import environment from "../environment";
import { getExternalCred } from "./credentialService";
const config = (configs as { [key: string]: any })[environment];

const POST_METHOD = 'post';
const GET_METHOD = 'get';

// const SIGNZY_PREPROD_URL = "https://multi-channel-preproduction.signzy.tech/api";


///used to login to the onboarding channel
export const loginChannel = async () => {

    let creObj: any = {
        type: ExternalEntity.Signzy,
    }

    let credentialsData: any = await getExternalCred(creObj);

    const body = {
        // username: SIGNZY_CREDS.username,
        // password: SIGNZY_CREDS.password,
        username: credentialsData.username,
        password: credentialsData.password,
    }

    return await handleAxiosCall(POST_METHOD, "channels/login", false, body, null);
};

//use this method to initiate the onboarding process
export const investorOnboarding = async (onBoardingData: any) => {

    let creObj: any = {
        type: ExternalEntity.Signzy,
    }

    let credentialsData: any = await getExternalCred(creObj);

    const body = {
        email: onBoardingData?.email,
        username: onBoardingData?.username,
        phone: onBoardingData?.phone,
        name: onBoardingData?.name,
        channelEmail: onBoardingData?.channelEmail
    }

    const headers = {
        Authorization: onBoardingData?.channel_token
    }

    // return await handleApiCall(`${SIGNZY_BASE_URL}/channels/${onBoardingData?.channel_id}/onboardings`, body, headers)
    return await handleAxiosCall(POST_METHOD,
        `channels/${onBoardingData?.channel_id}/onboardings`, false, body, headers);
}

//use this method to initiate the login into Signzy portal
export const investorLogin = async (investorLoginData: any) => {
    const body = {
        username: investorLoginData?.username,
        password: investorLoginData?.password,//this value is received as id in "createdObj"
        platform: SIGNZY_PLATFORM
    }

    console.log("inside rthe handler--",investorLoginData?.username);

    return await handleAxiosCall(POST_METHOD
        , `onboardings/login?ns=${investorLoginData?.username}`
        , false, body, false);
}

//use this method to upload the file and get the url
export const uploadFile = async (investorDocumentObj: any, investorDocuments: any) => {
    const filePath = investorDocuments?.path;

    const formDataObj = new FormData();
    formDataObj.append(investorDocuments?.fieldname, fs.createReadStream(filePath));
    formDataObj.append("ttl", investorDocumentObj?.ttl);

    let headers = {
        "Content-Type": "multipart/form-data",
        "Authorization": investorDocumentObj?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/upload`
        , true, formDataObj, headers);
}

//use this method to scan the uploaded POI document
export const executePOI = async (investorPOIData: any) => {
    const body = {
        merchantId: investorPOIData?.user_id,//user_id
        inputData: {
            service: "identity",
            type: "individualPan",
            task: "autoRecognition",
            data: {
                images: [
                    investorPOIData?.file_url
                ],
                toVerifyData: {},
                searchParam: {},
                proofType: "identity"
            }
        }
    }

    let headers = {
        "Authorization": investorPOIData?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);

}

export const executePOIFromDigiLocker = async (investorPOIData: any) => {
        console.log("merchantId--",investorPOIData?.user_id);
        console.log("userToken--",investorPOIData?.user_token);

    const body = {
        
        merchantId: investorPOIData?.user_id,//user_id
        



        
        inputData: {
            service: "identity",
            type: investorPOIData.type, //“aadhaarDigiLocker” / “panDigiLocker” / “dlDigiLocker”
            task: "createUrl",
            data: {
                images: [],
                proofType: "identity",
                toVerifyData: {},
                searchParam: {},

            }
        }
    }

    let headers = {
        "Authorization": investorPOIData?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);
}

export const getDetailsPOIFromDigiLocker = async (investorPOIData: any) => {
    const body = {
        merchantId: investorPOIData?.user_id,//user_id
        inputData: {
            service: "identity",
            type: investorPOIData?.type, //“aadhaarDigiLocker” / “panDigiLocker” / “dlDigiLocker”
            task: "getDetails",
            data: {
                images: [],
                toVerifyData: {},
                searchParam: {},
                proofType: "identity"
            }
        }
    }

    let headers = {
        "Authorization": investorPOIData?.user_token
    }
    return await handleDlAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);
}


//use this method to update the POI data
export const updatePOI = async (investorPOIUpdatedData: any) => {
    const body = {
        merchantId: investorPOIUpdatedData?.user_id,//user_id
        save: "formData",
        type: "identityProof",
        data: {
            type: "individualPan",
            name: investorPOIUpdatedData?.name,
            dob: investorPOIUpdatedData?.dob,
            number: investorPOIUpdatedData?.number,
            fatherName: investorPOIUpdatedData?.fatherName
        }
    }

    let headers = {
        "Authorization": investorPOIUpdatedData?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/updateForm`
        , false, body, headers);

}

export const updatePOIFormDigiLocker = async (investorPOIUpdatedData: any) => {
    const body = {
        merchantId: investorPOIUpdatedData?.user_id,//user_id
        save: "formData",
        type: "identityProof",
        data: {
            type: "aadhaarDigiLocker",
            // name: investorPOIUpdatedData?.name,
            // dob: investorPOIUpdatedData?.dob,
            // number: investorPOIUpdatedData?.number,
            // fatherName: investorPOIUpdatedData?.fatherName
            name: investorPOIUpdatedData?.name,
            uid: investorPOIUpdatedData?.uid,
            address: investorPOIUpdatedData?.address,
            city: investorPOIUpdatedData?.city,
            state: investorPOIUpdatedData?.state,
            district: investorPOIUpdatedData?.district,
            pincode: investorPOIUpdatedData?.pincode,
            dob: investorPOIUpdatedData?.dob

        }
    }

    let headers = {
        "Authorization": investorPOIUpdatedData?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/updateForm`
        , false, body, headers);

}

//use this method to scan the uploaded POA document
export const executePOA = async (investorPOADataObj: any) => {
    let ImgArr: any = []
    if (investorPOADataObj?.front_page_url) {
        ImgArr = [...ImgArr, investorPOADataObj?.front_page_url]
    }

    if (investorPOADataObj?.back_page_url) {
        ImgArr = [...ImgArr, investorPOADataObj?.back_page_url]
    }
    const body = {
        merchantId: investorPOADataObj?.user_id,//user_id
        inputData: {
            service: "identity",
            type: investorPOADataObj?.type,
            task: "autoRecognition",
            data: {
                images: ImgArr,
                toVerifyData: {},
                searchParam: {},
                proofType: "address"
            }
        }
    }

    let headers = {
        "Authorization": investorPOADataObj?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}

export const executePOAFromDigiLocker = async (investorPOADataObj: any) => {
    const body = {
        merchantId: investorPOADataObj?.user_id,//user_id
        inputData: {
            service: "identity",
            type: investorPOADataObj?.type, //“aadhaarDigiLocker” / “dlDigiLocker”
            task: "createUrl",
            data: {
                images: [],
                toVerifyData: {},
                searchParam: {},
                proofType: "address"
            }
        }
    }

    let headers = {
        "Authorization": investorPOADataObj?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}

export const getDetailsPOAFromDigiLocker = async (investorPOADataObj: any) => {
    const body = {
        merchantId: investorPOADataObj?.user_id,//user_id
        inputData: {
            service: "identity",
            type: investorPOADataObj?.type.toString(), //“aadhaarDigiLocker” / “dlDigiLocker”
            task: "getDetails",
            data: {
                images: [],
                toVerifyData: {},
                searchParam: {},
                proofType: "address"
            }
        }
    }

    let headers = {
        "Authorization": investorPOADataObj?.user_token
    }

    return await handleDlAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);
}

//use this method to update the Proof of address details
export const UpdatePOA = async (investorPOAUpdatedData: any) => {
    const body = {
        merchantId: investorPOAUpdatedData?.user_id,//user_id
        save: "formData",
        type: "addressProof",
        data: await getPOAObjectByType(investorPOAUpdatedData)
    }

    let headers = {
        "Authorization": investorPOAUpdatedData?.user_token
    }
    return await handleAxiosCall(POST_METHOD
        , `onboardings/updateForm`
        , false, body, headers);


}

export const executeCorrespondencePOA = async (investorPOADataObj: any) => {
    const body = {
        merchantId: investorPOADataObj?.user_id,//user_id
        inputData: {
            service: "identity",
            type: investorPOADataObj?.type,
            task: "autoRecognition",
            data: {
                images: [
                    investorPOADataObj?.front_page_url,
                    investorPOADataObj?.back_page_url
                ],
                toVerifyData: {},
                searchParam: {},
                proofType: "corrAddress"
            }
        }
    }

    let headers = {
        "Authorization": investorPOADataObj?.user_token
    }

    console.log(body, 'body')
    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}

export const executeCorrespondencePOAFromDigiLocker = async (investorPOADataObj: any) => {
    const body = {
        merchantId: investorPOADataObj?.user_id,//user_id
        inputData: {
            service: "identity",
            type: investorPOADataObj?.type,
            task: "createUrl",
            data: {
                images: [
                ],
                proofType: "corrAddress"
            }
        }
    }

    let headers = {
        "Authorization": investorPOADataObj?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}

export const getDetailsCorrespondencePOAFromDigiLocker = async (investorPOADataObj: any) => {
    const body = {
        merchantId: investorPOADataObj?.user_id,//user_id
        inputData: {
            service: "identity",
            type: investorPOADataObj?.type,
            task: "getDetails",
            data: {
                images: [
                ],
                proofType: "corrAddress"
            }
        }
    }

    let headers = {
        "Authorization": investorPOADataObj?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}

export const UpdateCorrespondencePOA = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id
        save: "formData",
        type: "corrAddressProof",
        data: await getPOAObjectByType(data)
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/updateForm`
        , false, body, headers);


}
export const UpdateCorrespondencePOASameAsPermanent = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id
        save: "formData",
        type: "corrAddressProof",
        data: {
            sameAsPermanent: true
        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/updateForm`
        , false, body, headers);


}

export const UpdateUserForensicsPOA = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id
        save: "formData",
        type: "userForensics",
        data: {
            type: 'usersData',
            usersData: getForensicsDataObj(data)
        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/updateForm`
        , false, body, headers);


}

export const CancelledChequeExecute = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id
        inputData: {
            service: "identity",
            type: "cheque",
            task: "autoRecognition",
            data: {
                images: [
                    data?.front_page_url
                ],
                toVerifyData: {},
                searchParam: {},
                proofType: "cheque"
            }
        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}

export const UpdateFormCancelledCheque = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id
        save: "formData",
        type: "bankAccount",
        data: {
            accountNumber: data?.accountNumber,
            name: data?.name,
            ifsc: data?.ifsc,
            contact: data?.contact, //valid 10 digit mobile number
            micrCode: data?.micr, //Micr code on cancelled cheque
            address: data?.address
        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/updateForm`
        , false, body, headers);


}

export const BankAccountPennyTransfer = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id
        "inputData": {
            "service": "nonRoc",
            "type": "bankaccountverifications",
            "task": "bankTransfer",
            "data": {
                "images": [data?.file_url
                ],
                "toVerifyData": {},
                "searchParam": {
                    "beneficiaryAccount": data?.beneficiaryAccount,
                    "beneficiaryIFSC": data?.beneficiaryIFSC,
                    "beneficiaryName": data?.beneficiaryName,
                    "beneficiaryMobile": data?.beneficiaryMobile
                }
            }
        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}

export const ExecuteVerifyBankAccountVerifyAccount = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id
        "inputData": {
            "service": "nonRoc",
            "type": "bankaccountverifications",
            "task": "verifyAmount",
            "data": {
                "images": [data?.file_url],
                "toVerifyData": {},
                "searchParam": {
                    "amount": data?.amount,
                    "signzyId": data?.signzyId,
                }
            }
        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}

export const UpdateFormCallFORMSSection = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id
        save: "formData",
        type: "kycdata",
        data: {
            "type": "kycdata",
            "kycData": {
                "gender": data?.gender, //“F” / “M” / “T” 
                "maritalStatus": data?.maritalStatus, //“MARRIED” / “UNMARRIED” / “OTHERS”
                "emailId": data?.emailId,    //Email Id of Investor
                "nomineeRelationShip": data?.nomineeRelationShip,   //Pass either “FATHER” or “SPOUSE”, accordingly pass the name in “fatherName”
                "fatherTitle": data?.fatherTitle,
                "maidenTitle": data?.maidenTitle,
                "maidenName": data?.maidenName,
                "panNumber": data?.panNumber,
                "cvlExemptCode": data?.cvlExemptCode,
                "aadhaarNumber": data?.aadhaarNumber,
                "motherTitle": data?.motherTitle,
                "residentialStatus": data?.residentialStatus,
                "occupationDescription": data?.occupationDescription,
                "occupationCode": data?.occupationCode,
                "occupationOther": data?.occupationOther,
                "kycAccountCode": data?.kycAccountCode,
                "kycAccountDescription": data?.kycAccountDescription,
                "communicationAddressCode": data?.communicationAddressCode,
                "communicationAddressType": data?.communicationAddressType,
                "permanentAddressCode": data?.permanentAddressCode,
                "permanentAddressType": data?.permanentAddressType,
                "citizenshipCountryCode": data?.citizenshipCountryCode,
                "citizenshipCountry": data?.citizenshipCountry,
                "applicationStatusCode": data?.applicationStatusCode,
                "applicationStatusDescription": data?.applicationStatusDescription,
                "mobileNumber": data?.mobileNumber,
                "countryCode": data?.countryCode,

                "fatherName": data?.fatherName,
                "motherName": data?.motherName,
                "placeOfBirth": data?.placeOfBirth,
                "annualIncome": data?.annualIncome,
                "name": data?.name,
                "dob": data?.dob
            }
        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/updateForm`
        , false, body, headers);


}

export const UpdateFatcaForm = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id
        save: "formData",
        type: "fatca",
        data: {
            "type": "fatca",
            "fatcaData": {
                "pep": data?.pep, //whether a 'politically exposed person’ values: “YES” / “NO”
                "rpep": data?.rpep, //whether a 'related to a politically exposed person’ values: “YES” / “NO”
                "residentForTaxInIndia": data?.residentForTaxInIndia, //data?.residentForTaxInIndia,
                "relatedPerson": data?.relatedPerson,
                // "addressType": data?.addressType,
                // "countryCodeJurisdictionResidence": data?.countryCodeJurisdictionResidence,
                // "countryJurisdictionResidence": data?.countryJurisdictionResidence,
                // "taxIdentificationNumber": data?.taxIdentificationNumber,
                "placeOfBirth": data?.placeOfBirth ? data?.placeOfBirth : "",
                "countryCodeOfBirth": data?.countryCodeOfBirth ? data?.countryCodeOfBirth : "",
                "fatcaAdditionalDetails": data?.fatcaAdditionalDetails ? data?.fatcaAdditionalDetails : [],
                // "countryOfBirth": data?.countryOfBirth,
                // "addressCity": data?.addressCity,
                // "addressDistrict": data?.addressDistrict,
                // "addressStateCode": data?.addressStateCode,
                // "addressState": data?.addressState,
                // "addressCountryCode": data?.addressCountryCode,
                // "addressCountry": data?.addressCountry,
                // "addressPincode": data?.addressPincode,
                "address": data?.address ? data?.address : "",
                // "relatedPersonType": data?.relatedPersonType || "",
                // "relatedPersonKycNumber": data?.relatedPersonKycNumber,
                // "relatedPersonKycNumberExists": data?.relatedPersonKycNumberExists,
                // "relatedPersonTitle": data?.relatedPersonTitle || "",
                // "relatedPersonName": data?.relatedPersonName || "",
                // "relatedPersonIdentityProof": data?.relatedPersonIdentityProofType ? await getFatcaObjectByType(data) : "",
                // "relatedPersonIdentityProofType": data?.relatedPersonIdentityProofType //: “individualPan” / “aadhaar” / “passport” / “drivingLicence” / “voterId”
            }
        }
    }
    console.log(body, 'body')



    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/updateForm`
        , false, body, headers);
}
export const UpdateFatcawhenTaxInIndiaForm = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id
        save: "formData",
        type: "fatca",
        data: {
            "type": "fatca",
            "fatcaData": {
                "pep": data?.pep, //whether a 'politically exposed person’ values: “YES” / “NO”
                "rpep": data?.rpep, //whether a 'related to a politically exposed person’ values: “YES” / “NO”
                "residentForTaxInIndia": data?.residentForTaxInIndia, //data?.residentForTaxInIndia,
                "relatedPerson": data?.relatedPerson,
                "addressType": data?.addressType,
                // "countryCodeJurisdictionResidence": data?.countryCodeJurisdictionResidence,
                // "countryJurisdictionResidence": data?.countryJurisdictionResidence,
                // "taxIdentificationNumber": data?.taxIdentificationNumber,
                "placeOfBirth": data?.placeOfBirth,
                "countryCodeOfBirth": data?.countryCodeOfBirth,
                "countryOfBirth": data?.countryOfBirth,
                "addressCity": data?.addressCity,
                "addressDistrict": data?.addressDistrict,
                "addressStateCode": data?.addressStateCode,
                "addressState": data?.addressState,
                "addressCountryCode": data?.addressCountryCode,
                "addressCountry": data?.addressCountry,
                "addressPincode": data?.addressPincode,
                "address": data?.address,
                "relatedPersonType": data?.relatedPersonType || "",
                "relatedPersonKycNumber": data?.relatedPersonKycNumber,
                "relatedPersonKycNumberExists": data?.relatedPersonKycNumberExists,
                "relatedPersonTitle": data?.relatedPersonTitle || "",
                "relatedPersonName": data?.relatedPersonName || "",
                "relatedPersonIdentityProof": data?.relatedPersonIdentityProofType ? await getFatcaObjectByType(data) : "",
                "relatedPersonIdentityProofType": data?.relatedPersonIdentityProofType //: “individualPan” / “aadhaar” / “passport” / “drivingLicence” / “voterId”
            }
        }
    }
    console.log(body, 'body')



    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/updateForm`
        , false, body, headers);
}

export const UpdateFormSignature = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id
        save: "formData",
        type: "signature",
        data: {
            type: "signature",
            signatureImageUrl: data.signatureImageUrl,
            consent: "true"
        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/updateForm`
        , false, body, headers);


}

export const UpdateFormPhoto = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id
        save: "formData",
        type: "userPhoto",
        data: {
            photoUrl: data.photoUrl,

        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/updateForm`
        , false, body, headers);


}

export const VideoStart = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id

        inputData: {
            service: "video",
            type: "video",
            task: "start",
            data: {}
        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}

export const VideoVerification = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id

        inputData: {
            service: "video",
            type: "video",
            task: "verify",
            data: {
                type: 'video',
                video: data.videoUrl,
                transactionId: data.transactionId,
                matchImage: data.matchImageUrl
            }
        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}

export const CreatePDFURL = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id

        inputData: {
            service: "esign",
            task: "createPdf",
            data: {}
        }

        // inputData: {
        //     service: "esign",
        //     task: "createEsignUrl",
        //     data: {
        //         inputFile: data?.PDFContractURL,
        //         signatureType: 'aadhaaresign',

        //     }
        // }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}

export const Genearte_Aadhar = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id

        inputData: {
            service: "esign",
            type: "",
            task: "createEsignUrl",
            data: {
                inputFile: data?.fileName,
                signatureType: "aadhaaresign",
                redirectUrl: `${config.reactUrl}/kyc-final-process`,
                redirectTime: 1,
                eventCallbackUrl: `${config.ApiUrl}/kyc/Signzy`,
                eventCallbackHeaders: {}
            }
        }

        // inputData: {
        //     service: "esign",
        //     task: "createEsignUrl",
        //     data: {
        //         inputFile: data?.PDFContractURL,
        //         signatureType: 'aadhaaresign',

        //     }
        // }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}
export const save_aaddher_PDF = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id

        inputData: {
            service: "esign",
            task: "getEsignData",

        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}

export const save_signed_PDF = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id
        save: "esign",

        data: {
            signedPdf: data.signedPdf
        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/updateForm`
        , false, body, headers);


}

export const execute_verification_engine = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id

        inputData: {
            service: "verificationEngine",
            merchantId: data?.user_id,

        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}


// export const CreatePDFURL = async (data: any) => {
//     const body = {
//         merchantId: data?.user_id,//user_id

//         inputData: {
//             service: "esign",
//             task: "createEsignUrl",
//             data: {
//                 inputFile: data?.PDFContractURL,
//                 signatureType: 'aadhaaresign',

//             }
//         }
//     }

//     let headers = {
//         "Authorization": data?.user_token
//     }

//     return await handleAxiosCall(POST_METHOD
//         , `${SIGNZY_BASE_URL}/onboardings/execute`
//         , false, body, headers);


// }

export const saveAadhaarSignedPDF = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id

        inputData: {
            service: "esign",
            task: "getEsignData",
            data: {

            }
        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}

export const ExecuteVerificationEngine = async (data: any) => {
    const body = {
        merchantId: data?.user_id,//user_id

        inputData: {
            service: "verificationEngine",
            task: "getEsignData",
            merchantId: data?.merchantId,
        }
    }

    let headers = {
        "Authorization": data?.user_token
    }

    return await handleAxiosCall(POST_METHOD
        , `onboardings/execute`
        , false, body, headers);


}



//#region AXIOS CONFIG
let axiosPreConfig = {
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Accept": "*/*",
        "User-Agent": "PostmanRuntime/7.39.0"
    },
};

const handleAxiosCall = async (axiosMethod: any, api_url: any, isFormData: any, body: any, axiosHeaders?: any) => {
    try {

        let creObj: any = {
            type: ExternalEntity.Signzy,
        }

        let credentialsData: any = await getExternalCred(creObj);
        // let headersObj = (axiosHeaders) ? {
        //     ...axiosPreConfig?.headers, "Authorization": axiosHeaders.Authorization,
        //     // ...axiosHeaders
        // } : { ...axiosPreConfig?.headers }

        let headersObj = axiosHeaders
            ? {
                ...axiosPreConfig?.headers,
                Authorization: axiosHeaders.Authorization,
            }
            : { ...axiosPreConfig?.headers };

        if (isFormData) {
            headersObj = axiosHeaders
        }

        let axiosConfig = {
            method: axiosMethod,
            url: api_url ? `${credentialsData.api_base_url}/${api_url}` : credentialsData.api_base_url,
            headers: headersObj,
            data: body || {}
        }

        // let result: any = { body };

        const response = await axios(axiosConfig);

        return response.data;

        // await axios(axiosConfig)
        // await axios.post(api_url, body, {
        //     headers: headersObj
        // })
        //     .then((response) => {
        //         console.log(response, "response")
        //         result = response;
        //     })
        //     .catch((error) => {
        //         const errRes = error?.response;
        //         console.error("Axios error response:", errRes?.data || error.message);

        //         // You can throw a custom error here if you want
        //         throw {
        //             status: errRes?.status || 500,
        //             message: errRes?.data?.message || "Something went wrong",
        //             error: errRes?.data || error.message,
        //         };
        //     });

        // await axios.post(api_url, body, {
        //     headers: headersObj
        // }).then(response => {
        //     console.log(response, "response>>>>>>>>>>>>>")
        //     result = response
        // })
        //     .catch(error => {
        //         console.log(error.response, "errorrrrrrrr")
        //         throw error
        //     });

        // await axios(axiosConfig)
        //     .then((response) => {
        //         result = response
        //     });

        // console.log(result,"resultresult")

        // return result?.data;
    } catch (error: any) {
        const errRes = error?.response;
        console.error("Axios error:", errRes?.data || error.message);

        throw {
            status: errRes?.status || 500,
            message: errRes?.data?.message || "Something went wrong",
            error: errRes?.data || error.message,
        };
        // serverError(null, error);
        // throw error;
    }
};


const handleDlAxiosCall = async (axiosMethod: any, api_url: any, isFormData: any, body: any, axiosHeaders?: any) => {
    try {
        // let headersObj = (axiosHeaders) ? {
        //     ...axiosPreConfig?.headers, "Authorization": axiosHeaders.Authorization,
        //     // ...axiosHeaders
        // } : { ...axiosPreConfig?.headers }

        let creObj: any = {
            type: ExternalEntity.Signzy,
        }

        let credentialsData: any = await getExternalCred(creObj);

        let headersObj = axiosHeaders
            ? {
                ...axiosPreConfig?.headers,
                Authorization: axiosHeaders.Authorization,
            }
            : { ...axiosPreConfig?.headers };

        if (isFormData) {
            headersObj = axiosHeaders
        }

        let axiosConfig = {
            method: axiosMethod,
            url: api_url ? `${credentialsData.api_base_url}/${api_url}` : credentialsData.api_base_url,
            headers: headersObj,
            data: (body) ? body : {}
        }

        let result: any = { body };

        const response = await axios(axiosConfig);
        return response.data;

        // await axios.post(api_url, body, {
        //     headers: headersObj
        // }).then(response => {
        //     result = response
        // })
        //     .catch(error => {
        //         result = { data: { error: error.response.data.error } }
        //         // throw error
        //     });

        // return result?.data;
    } catch (error: any) {
        const errRes = error?.response;

        throw {
            status: errRes?.status || 500,
            message: errRes?.data?.message || "Something went wrong",
            error: errRes?.data || error.message,
        };
    }
    // serverError(null, error);
    // throw error;
};

//#endregion{


const getFatcaObjectByType = async (data: any) => {

    let response = {}
    switch (data?.relatedPersonIdentityProofType) {
        case 'individualPan':
            response = {
                type: data?.relatedPersonIdentityProofType,
                name: data?.name,
                fatherName: data?.fatherName,
                dob: data?.dob,//date of birth as string in DD/MM/YYYY or DD-MM-YYYY format
                number: data?.number  //PAN number on POI document


            }
            break;
        case 'aadhaar':
            response = {
                type: data?.relatedPersonIdentityProofType,
                uid: data?.uid,
                name: data?.name,
                address: data?.address,
                city: data?.city,
                state: data?.state,
                district: data?.district,
                pincode: data?.pincode,
                dob: data?.dob,//date of birth as string in DD/MM/YYYY or DD-MM-YYYY format
                number: data?.number  //PAN number on POI document


            }
            break;
        case 'drivingLicence':
            response = {
                type: data?.relatedPersonIdentityProofType,
                name: data?.name,
                number: data?.number,
                address: data?.address,
                city: data?.city,
                state: data?.state,
                district: data?.district,
                dob: data?.dob, //date of birth as string in DD/MM/YYYY or DD-MM-YYYY format
                pincode: data?.pincode,
                issueDate: data?.issueDate, //Issue Date as string in DD/MM/YYYY or DD-MM-YYYY format, should be a past Date
                expiryDate: data?.issueDate //Expiry Date as string in DD/MM/YYYY or DD-MM-YYYY format, should be a future Date

            }
            break;

        case 'passport':
            response = {
                type: data?.relatedPersonIdentityProofType,
                name: data?.name,
                passportNumber: data?.passportNumber,
                address: data?.address,
                city: data?.city,
                state: data?.state,
                district: data?.district,
                birthDate: data?.birthDate, //date of birth as string in DD/MM/YYYY or DD-MM-YYYY format
                pincode: data?.pincode,
                issueDate: data?.issueDate, //Issue Date as string in DD/MM/YYYY or DD-MM-YYYY format, should be a past Date
                expiryDate: data?.issueDate //Expiry Date as string in DD/MM/YYYY or DD-MM-YYYY format, should be a future Date

            }
            break;
        case 'voterId':
            response = {
                type: data?.relatedPersonIdentityProofType,
                name: data?.name,
                epicNumber: data?.epicNumber,
                address: data?.address,
                city: data?.city,
                state: data?.state,
                district: data?.district,
                dob: data?.dob, //date of birth as string in DD/MM/YYYY or DD-MM-YYYY format
                pincode: data?.pincode,

            }
            break;

        default:
            break;


    }
    return data

}


const getPOAObjectByType = async (poaObject: any) => {

    let data: any = {}
    switch (poaObject?.type) {
        case 'aadhaar':
            data = {
                type: poaObject?.type,
                name: poaObject?.doc_holder_name,
                uid: poaObject?.doc_no,
                address: poaObject?.address1,
                city: poaObject?.city,
                state: poaObject?.stateCode,
                district: poaObject?.district,
                pincode: poaObject?.pincode,
                dob: poaObject?.dob //date of birth as string in DD/MM/YYYY or DD-MM-YYYY format


            }
            break;
        case 'passport':
            data = {
                type: poaObject?.type,
                name: poaObject?.name,
                passportNumber: poaObject?.passportNumber,
                address: poaObject?.address,
                city: poaObject?.city,
                state: poaObject?.state,
                district: poaObject?.district,
                birthDate: poaObject?.birthDate, //date of birth as string in DD/MM/YYYY or DD-MM-YYYY format
                pincode: poaObject?.pincode,
                issueDate: poaObject?.issueDate, //Issue Date as string in DD/MM/YYYY or DD-MM-YYYY format, should be a past Date
                expiryDate: poaObject?.issueDate //Expiry Date as string in DD/MM/YYYY or DD-MM-YYYY format, should be a future Date

            }
            break;
        case 'drivingLicence':
            data = {
                type: poaObject?.type,
                name: poaObject?.doc_holder_name,
                number: poaObject?.number,
                address: poaObject?.address,
                city: poaObject?.city,
                state: poaObject?.state,
                district: poaObject?.district,
                dob: poaObject?.dob, //date of birth as string in DD/MM/YYYY or DD-MM-YYYY format
                pincode: poaObject?.pincode,
                issueDate: poaObject?.issueDate, //Issue Date as string in DD/MM/YYYY or DD-MM-YYYY format, should be a past Date
                expiryDate: poaObject?.issueDate //Expiry Date as string in DD/MM/YYYY or DD-MM-YYYY format, should be a future Date

            }
            break;
        case 'voterId':
            data = {
                type: poaObject?.type,
                name: poaObject?.name,
                epicNumber: poaObject.epicNumber,
                address: poaObject.address,
                city: poaObject.city,
                state: poaObject.state,
                district: poaObject.district,
                dob: poaObject.dob, //date of birth as string in DD/MM/YYYY or DD-MM-YYYY format
                pincode: poaObject.pincode,

            }
            break;
        case 'aadhaarDigiLocker':
            data = {
                type: poaObject?.type,
                name: poaObject?.doc_holder_name,
                uid: poaObject?.doc_no,
                address: poaObject?.address1,
                city: poaObject?.city,
                state: poaObject?.stateCode,
                district: poaObject?.district,
                pincode: poaObject?.pincode,
                dob: poaObject?.dob //date of birth as string in DD/MM/YYYY or DD-MM-YYYY format

            }
            break;
        case 'dlDigiLocker':
            data = {
                type: poaObject?.type,
                name: poaObject?.name,
                number: poaObject?.number,
                address: poaObject?.address,
                city: poaObject?.city,
                state: poaObject?.state,
                district: poaObject?.district,
                dob: poaObject?.dob, //date of birth as string in DD/MM/YYYY or DD-MM-YYYY format
                pincode: poaObject?.pincode,
                issueDate: poaObject?.issueDate, //Issue Date as string in DD/MM/YYYY or DD-MM-YYYY format, should be a past Date
                expiryDate: poaObject?.issueDate //Expiry Date as string in DD/MM/YYYY or DD-MM-YYYY format, should be a future Date
            }
            break;

        default:
            break;
    }
    return data

}

const getForensicsDataObj = async (data: any) => {
    let response = {}
    switch (data.updateType) {
        case 'identity':
            response = {
                'identity': {
                    geoLocationData: data?.geoLocationData, //Object as feteched from https://ipapi.co/jsonp
                    browserData: {
                        "browserName": data?.browserData?.browserName,
                        "cookieEnabled": data?.browserData?.cookieEnabled,
                        "browserLanguage": data?.browserData?.browserLanguage,
                        "os": data?.browserData?.os,
                        "userAgent": data?.browserData?.userAgent,
                        "pluginsInstalled": data?.browserData?.pluginsInstalled, //Array of string
                        "browserVersion": data?.browserData?.browserVersion,
                        "screenWidth": data?.browserData?.screenWidth,
                        "screenHeight": data?.browserData?.screenHeight,
                        "screenPixelDepth": data?.browserData?.screenPixelDepth,
                        "screenColorDepth": data?.browserData?.screenColorDepth,
                        "deviceInfo": {
                            "complete_device_name": data?.browserData?.complete_device_name,
                            "form_factor": data?.browserData?.form_factor,
                            "is_mobile": false
                        },
                        "signzyPlatformUsed": data?.browserData?.signzyPlatformUsed,
                        "userLat": data?.browserData?.userLat,
                        "userLong": data?.browserData?.userLong
                    },
                    "pageName": data?.pageName
                }
            }

            break;
        case 'address':
            response = {
                'address': {
                    geoLocationData: data?.geoLocationData, //Object as feteched from https://ipapi.co/jsonp
                    browserData: {
                        "browserName": data?.browserData?.browserName,
                        "cookieEnabled": data?.browserData?.cookieEnabled,
                        "browserLanguage": data?.browserData?.browserLanguage,
                        "os": data?.browserData?.os,
                        "userAgent": data?.browserData?.userAgent,
                        "pluginsInstalled": data?.browserData?.pluginsInstalled, //Array of string
                        "browserVersion": data?.browserData?.browserVersion,
                        "screenWidth": data?.browserData?.screenWidth,
                        "screenHeight": data?.browserData?.screenHeight,
                        "screenPixelDepth": data?.browserData?.screenPixelDepth,
                        "screenColorDepth": data?.browserData?.screenColorDepth,
                        "deviceInfo": {
                            "complete_device_name": data?.browserData?.complete_device_name,
                            "form_factor": data?.browserData?.form_factor,
                            "is_mobile": false
                        },
                        "signzyPlatformUsed": data?.browserData?.signzyPlatformUsed,
                        "userLat": data?.browserData?.userLat,
                        "userLong": data?.browserData?.userLong
                    },
                    "pageName": data?.pageName
                }
            }

            break;
        case 'bankaccount':
            response = {
                'bankaccount': {
                    geoLocationData: data?.geoLocationData, //Object as feteched from https://ipapi.co/jsonp
                    browserData: {
                        "browserName": data?.browserData?.browserName,
                        "cookieEnabled": data?.browserData?.cookieEnabled,
                        "browserLanguage": data?.browserData?.browserLanguage,
                        "os": data?.browserData?.os,
                        "userAgent": data?.browserData?.userAgent,
                        "pluginsInstalled": data?.browserData?.pluginsInstalled, //Array of string
                        "browserVersion": data?.browserData?.browserVersion,
                        "screenWidth": data?.browserData?.screenWidth,
                        "screenHeight": data?.browserData?.screenHeight,
                        "screenPixelDepth": data?.browserData?.screenPixelDepth,
                        "screenColorDepth": data?.browserData?.screenColorDepth,
                        "deviceInfo": {
                            "complete_device_name": data?.browserData?.complete_device_name,
                            "form_factor": data?.browserData?.form_factor,
                            "is_mobile": false
                        },
                        "signzyPlatformUsed": data?.browserData?.signzyPlatformUsed,
                        "userLat": data?.browserData?.userLat,
                        "userLong": data?.browserData?.userLong
                    },
                    "pageName": data?.pageName
                }
            }

            break;


        default:
            break;
    }
    return response
}