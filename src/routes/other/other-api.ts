import express from "express";
import { alreadyExist, serverError, success } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { decryptData } from "../../services/encryptDecrypt-service";
import { tokenMiddleWare } from "../../middlewares/tokenMiddleware";

const router = express.Router();


router.post("/convertData", tokenMiddleWare, async (req: any, res) => {
  try {
    let data: any = decryptData(req.body.data);
    res.status(200).send(data);
  } catch (error: any) {
    ErrorLogger.write({ type: "convertData", error });
    serverError(res, error);
  }
});


module.exports = router;