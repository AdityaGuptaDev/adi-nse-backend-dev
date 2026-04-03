import express from "express";
import prosesjwt from "proses-jwt";
import { alreadyExist, serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import { ImageUploder } from "../../services/multer";
let { tokenMiddleWare } = prosesjwt;
const router = express.Router();
import configs from "../../config/config";
import environment from "../../environment";
const config = (configs as { [key: string]: any })[environment];


router.post("/uploadImages", tokenMiddleWare, ImageUploder.single('FILE'), async (req: any, res) => {
    try {

        console.log(req.body, req.file, req.files)
        const url = `${config.ApiUrl}/static/${req.body.folder}/${req.file.filename}`
        const fileName = `${req.file.filename}`

        let data = {
            secure_url: url, fileName: fileName
        }

        sendEncryptedResponse(res, data, "Upload file Successfully!");
    } catch (error) {
        ErrorLogger.write({ type: "upload file error", error });
        serverError(res, error);
    }
});

module.exports = router;
