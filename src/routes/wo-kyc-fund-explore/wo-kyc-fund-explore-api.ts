import express from "express";
import prosesjwt from "proses-jwt";
import { alreadyExist, other, serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
let { tokenMiddleWare } = prosesjwt;
import dbInstance from "../../db/core/control-db";
import { getSchemeDataByWithoutKYC } from "./wo-kyc-fund-explore-handler";
const router = express.Router();


router.get("/get-scheme-by-wo-kyc", tokenMiddleWare, async (req: any, res: any) => {
    try {

        let data: any = await getSchemeDataByWithoutKYC();
        sendEncryptedResponse(res, data, "get data successfully");

    } catch (error) {
        ErrorLogger.write({ type: "get-scheme-by-id error", error });
        serverError(res, error);
    }
})



module.exports = router;