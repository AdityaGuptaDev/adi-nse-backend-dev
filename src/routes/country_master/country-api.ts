import express from "express";
import { alreadyExist, other, serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import { getAllCountry } from "./country-handler";
import { tokenMiddleWare } from "../../middlewares/tokenMiddleware";
import { dataReadRateLimit } from "../../middlewares/rateLimit";
const router = express.Router();


//Get all countries for dropdown
router.get("/getAllCountry", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
    try {

        let country: any = await getAllCountry();
        sendEncryptedResponse(res, country, "Get Data successfully");

    } catch (error) {
        ErrorLogger.write({ type: "getAllCountry error", error });
        serverError(res, error);
    }
});




module.exports = router;