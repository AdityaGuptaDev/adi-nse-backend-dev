import express from "express";
import { alreadyExist, other, serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import { getAllStateByCountry } from "./state-handler";
import { tokenMiddleWare } from "../../middlewares/tokenMiddleware";
const router = express.Router();


//Get all countries for dropdown
router.get("/getAllStateByCountry/:id", tokenMiddleWare, async (req, res) => {
    try {

        let country: any = await getAllStateByCountry(req.params);
        sendEncryptedResponse(res, country, "Get Data successfully");

    } catch (error) {
        ErrorLogger.write({ type: "getAllStateByCountry error", error });
        serverError(res, error);
    }
});




module.exports = router;