import axios from "axios";
import environment, { env } from "../environment";
import { getDecryptedKYCData, getEncryptedKYCData } from "./encryptDecrypt-service";
import { ExternalAccountDetail } from "../routes/kyc-flow/external_account_detail-model";
import { getExternalCred } from "./credentialService";
import { ExternalEntity } from "../utils/constant";
import { updateExternalAccount } from "../routes/kyc-flow/external-account-handler";


// const AES_UAT_KEY = "3qygPsdo4w9bv24H3bQmt4asOpI0dwf6";
// const API_UAT_KEY = "4299db2a694d4af68f838a65a8408af2";

// const AES_LIVE_KEY = "4c8c98585cfb425bb8ee3a003d535c8c";
// const API_LIVE_KEY = "f0e4c86165654825bdc891061dc6bfeb";

// const UserObj = {
//     username: "WEBVEDANTASSETADVISOR",
//     poscode: "VEDANTASSETADVISOR",
//     password: "web@1234",
// };

// const UserLiveObj = {
//     username: "WEBADMIN",
//     poscode: "5100162514",
//     password: "R1jjgbF9Sv",
// };

const KYC_URL = "https://krapancheck.cvlindia.com/V3/api";
// const KYC_URL = "https://vedantasset.my-portfolio.co.in/webapi/op/checkKYC";

// const KYC_LIVE_URL = "https://api.kracvl.com/int/api";

async function getToken(apiUrl: any, body: any, headers: any) {
    try {
        const result = await axios.post(apiUrl, body, { headers });
        const final = result?.data;
        return [final, null];
    } catch (error: any) {
        console.log("Error in processing handleApiCall", error.response.data.error);
        return [null, error];
    }
}

async function GetPanStatus(apiUrl: any, body: any, kyc_token: any) {
    const headers = {
        'Token': kyc_token,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'PostmanRuntime/7.37.3'
    }
    try {
        const result = await axios.post(apiUrl, body, { headers });
        const final = result?.data;
        return [final, null];
    } catch (error) {
        console.log("Error in processing GetPanStatus handleApiCall", error);
        return [103, error];
    }
}


export const getKycStatusFromCVLKra = async (payload: any) => {
    try {

        // generate kyc status token
        // let credentialsObj: any = {};
        let getTokenBaseURL = "";
        let aesKey = "";
        let apiKey = "";

        // if (environment == env.production) {

        //     credentialsObj = UserLiveObj;
        //     getTokenBaseURL = KYC_LIVE_URL;
        //     aesKey = AES_LIVE_KEY;
        //     apiKey = API_LIVE_KEY;
        // }
        // else if (environment == env.staging) {

        //     credentialsObj = UserObj;
        //     getTokenBaseURL = KYC_URL;
        //     aesKey = AES_UAT_KEY;
        //     apiKey = API_UAT_KEY;
        // }
        // else {

        // credentialsObj = UserObj;
        // getTokenBaseURL = KYC_URL;
        // aesKey = AES_UAT_KEY;
        // apiKey = API_UAT_KEY;
        // }

        let creObj: any = {
            type: ExternalEntity.CVLKRA,
        }

        let credentialsData: any = await getExternalCred(creObj);


        const credentialsObj = {
            username: credentialsData?.username,
            poscode: credentialsData?.membercode,
            password: credentialsData?.password,
        };

        // const { encryptedData, iv }: any = getEncryptedKYCData(JSON.stringify(credentialsObj), aesKey);
        const { encryptedData, iv }: any = getEncryptedKYCData(JSON.stringify(credentialsObj), credentialsData?.externalObj?.AES_KEY);

        const headers = {
            'api_key': credentialsData?.externalObj?.API_KEY,
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'PostmanRuntime/7.37.3'
        }
        let kyc_token = null;

        let body = `${iv}:${encryptedData}`;

        // let findToken: any = await ExternalAccountDetail.findOne({
        //     where: {
        //         external_source: 'CVLKRA'
        //     }
        // });
        // findToken = JSON.parse(JSON.stringify(findToken));

        const currentDateTime: any = new Date();
        const tokenExpiryTime: any = new Date(credentialsData?.tokenExpiry);
        // const diffInMilliseconds = Math.abs(currentDateTime - tokenExpiryTime);
        const diffInMilliseconds = tokenExpiryTime.getTime() - currentDateTime.getTime();
        const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

        if (diffInHours > 0 && diffInHours <= 24) {

            kyc_token = credentialsData.token

        } else {

            const [result, error] = await getToken(credentialsData?.api_base_url + "/GetToken", body, headers);

            console.log("Decrcypted Data ---------", result, error)


            if (error) {
                return [400, error];
            }

            const getData: any = getDecryptedKYCData(result, credentialsData?.externalObj?.AES_KEY);

            console.log("Decrcypted Data ---------", getData)



            if (getData?.decryptedData?.success !== '1') {
                return [400, getData];
            }

            kyc_token = getData?.decryptedData.token;

            const obj = {
                tokenExpiry: new Date(),
                token: kyc_token
            }

            await updateExternalAccount(obj, { id: credentialsData.id });
            // await ExternalAccountDetail.update(obj, {
            //     where: {
            //         external_source: 'CVLKRA'
            //     }
            // })
        }

        let pan_status_obj = {
            "pan": payload,
            "poscode": credentialsObj.poscode
        }

        const { encryptedData: panStatusData, iv: panStatusIV }: any = getEncryptedKYCData(JSON.stringify(pan_status_obj), credentialsData?.externalObj?.AES_KEY);

        const Pan_status_body = `${panStatusIV}:${panStatusData}`

        const [GetPanStatusResult, GetPanStatusError] = await GetPanStatus(credentialsData?.api_base_url + "/GetPanStatus", Pan_status_body, kyc_token);

        if (GetPanStatusError) {
            return [400, GetPanStatusError];
        }

        const GetPanStatusResultData: any = getDecryptedKYCData(GetPanStatusResult as any, credentialsData?.externalObj?.AES_KEY);

        if (GetPanStatusResultData?.decryptedData?.error_message) {
            return [400, GetPanStatusResultData];

        } else {

            return [200, GetPanStatusResultData];
        }
    } catch (err) {
        // Sentry.captureException(err)
        return [103, err];
    }
}

export const getCheckKYCPanStatus = async (body: any) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
        }

        let passBody = {
            panNo: [
                body.pan_no
            ]
        }

        const result: any = await axios.post(KYC_URL, passBody, { headers });

        if (result.status === 200) {
            return [result.status, result.data?.result?.data];
        } else {
            console.log(result,"resultresult")
            return [result.status, result?.data?.result?.data];
        }
    } catch (err) {
        return [103, err];
    }
}