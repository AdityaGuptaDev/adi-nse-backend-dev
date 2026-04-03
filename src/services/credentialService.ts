import environment, { env } from "../environment";
import { getExternalAccountByExternalSource } from "../routes/kyc-flow/external-account-handler";
import { ExternalEntity } from "../utils/constant";

export const getExternalCred = async (typeObj: any) => {

    try {

        let externalObj: any = {};

        if (environment == env.production) {
            //console.log("In Production");
            externalObj = {
                external_source: typeObj.type,
                account_type: "LIVE",
            }

            if (typeObj.type === ExternalEntity.CVLKRA) {
                externalObj.AES_KEY = "4c8c98585cfb425bb8ee3a003d535c8c";
                externalObj.API_KEY = "8b08a0c1489749bc8b99e12f7eb41dd9";
            }

        } else if (environment == env.staging) {

            externalObj = {
                external_source: typeObj.type,
                account_type: "UAT",
            }

            if (typeObj.type === ExternalEntity.CVLKRA) {
                externalObj.AES_KEY = "3qygPsdo4w9bv24H3bQmt4asOpI0dwf6";
                externalObj.API_KEY = "4299db2a694d4af68f838a65a8408af2";
            }

        } else {

            externalObj = {
                external_source: typeObj.type,
                account_type: "UAT",
            }

            if (typeObj.type === ExternalEntity.CVLKRA) {
                externalObj.AES_KEY = "3qygPsdo4w9bv24H3bQmt4asOpI0dwf6";
                externalObj.API_KEY = "4299db2a694d4af68f838a65a8408af2";
            }
        }

        let findBseCred: any = await getExternalAccountByExternalSource(externalObj);
        findBseCred = JSON.parse(JSON.stringify(findBseCred));

        if (!findBseCred) {
            throw new Error("External Credentials Not Found!");
        }

        // External_account_details.findOne({
        //     where: {
        //         external_source: external_sourceType,
        //         account_type: account_type,
        //     },
        // });


        return { ...findBseCred, externalObj };

    } catch (error: any) {
        console.log(error, "error")
        throw new Error(error);

    }
};