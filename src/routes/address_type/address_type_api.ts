import express from "express";
import { alreadyExist, other, serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import { getAllAddressType } from "./address_type_handler";
import { tokenMiddleWare } from "../../middlewares/tokenMiddleware";
import { dataReadRateLimit } from "../../middlewares/rateLimit";
const router = express.Router();


//Get all data
router.get("/getAllAddressType", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
    try {

        let address: any = await getAllAddressType();
        sendEncryptedResponse(res, address, "Get Data successfully");

    } catch (error) {
        ErrorLogger.write({ type: "getAllAddressType error", error });
        serverError(res, error);
    }
});




module.exports = router;