import express from "express";
import prosesjwt from "proses-jwt";
import { alreadyExist, other, serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
let { tokenMiddleWare } = prosesjwt;
import {
  addARNData,
  checkARNData,
  deleteARNData,
  getAllARNList,
  updateARNData,
} from "./arn-handler";

const router = express.Router();

router.get("/getAllARNList", tokenMiddleWare, async (req, res) => {
  try {
    let allData: any = await getAllARNList(req.query);
    sendEncryptedResponse(res, allData, "Got all ARN List");
  } catch (error) {
    ErrorLogger.write({ type: "getAllARNList error", error });
    serverError(res, error);
  }
});

router.post("/addARNData", tokenMiddleWare, async (req, res) => {
  try {
    const nameData = await checkARNData(req.body);

    if (nameData) {
      throw alreadyExist(res, "This ARN already exists");
    }

    let addData: any = await addARNData(req.body);
    sendEncryptedResponse(res, addData, "Data Added successfully");
  } catch (error) {
    ErrorLogger.write({ type: "addARNData error", error });
    serverError(res, error);
  }
});

router.put("/updateARNData/:id", tokenMiddleWare, async (req, res) => {
  try {
    const nameData = await checkARNData(req.body, req.params);

    if (nameData) {
      throw alreadyExist(res, "This ARN already exists");
    }

    let updateData: any = await updateARNData(req.body, req.params);
    sendEncryptedResponse(res, updateData, "Data Updated successfully");
  } catch (error) {
    ErrorLogger.write({ type: "updateARNData error", error });
    serverError(res, error);
  }
});

router.delete("/deleteARNData/:id", tokenMiddleWare, async (req, res) => {
  try {
    let deleteData: any = await deleteARNData(req.params);
    sendEncryptedResponse(res, deleteData, "Data Deleted successfully");
  } catch (error) {
    ErrorLogger.write({ type: "deleteARNData error", error });
    serverError(res, error);
  }
});

module.exports = router;
