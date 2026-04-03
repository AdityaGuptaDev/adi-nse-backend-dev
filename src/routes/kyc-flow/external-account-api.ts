import express from "express";
import prosesjwt from "proses-jwt";
import { alreadyExist, other, serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
let { tokenMiddleWare } = prosesjwt;
import dbInstance from "../../db/core/control-db";
import {
  addExternalAccount,
  checkAccountData,
  getAllExternalAccountList,
  updateExternalAccount,
} from "./external-account-handler";
const router = express.Router();

router.get("/getAllExternalAccountList", tokenMiddleWare, async (req, res) => {
  try {
    let allData: any = await getAllExternalAccountList(req.query);
    sendEncryptedResponse(res, allData, "Got all External Account List");
  } catch (error) {
    ErrorLogger.write({ type: "getAllExternalAccountList error", error });
    serverError(res, error);
  }
});

router.post("/addExternalAccount", tokenMiddleWare, async (req, res) => {
  try {
    const nameData = await checkAccountData(req.body);

    if (nameData) {
      throw alreadyExist(res, "This Data already exists");
    }

    let addData: any = await addExternalAccount(req.body);
    sendEncryptedResponse(res, addData, "Data Added successfully");
  } catch (error) {
    ErrorLogger.write({ type: "addExternalAccount error", error });
    serverError(res, error);
  }
});

router.put("/updateExternalAccount/:id", tokenMiddleWare, async (req, res) => {
  try {

    const nameData = await checkAccountData(req.body, req.params);

    if (nameData) {
      throw alreadyExist(res, "This Data already exists");
    }

    let updateData: any = await updateExternalAccount(req.body, req.params);
    sendEncryptedResponse(res, updateData, "Data Updated successfully");
  } catch (error) {
    ErrorLogger.write({ type: "updateExternalAccount error", error });
    serverError(res, error);
  }
});

module.exports = router;
