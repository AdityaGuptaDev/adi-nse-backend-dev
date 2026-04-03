import express from "express";
import { serverError, success } from "proses-response";
import { getActivityLogsFilterWise } from "./activitylogs-handler";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import { tokenMiddleWare } from "../../middlewares/tokenMiddleware";
const router = express.Router();

//list-api
router.get("/getActivityLogsFilterWise", tokenMiddleWare, async (req, res) => {
    try {      
      let allActivityLogs: any = await getActivityLogsFilterWise(req.query);
      sendEncryptedResponse(res, allActivityLogs, "Get all ActivityLogss");
      // sendEncryptedResponse(res,  allActivityLogs, "Get all ActivityLogss");
 
    } catch (error) {
      serverError(res, error);
    }
  });
  module.exports = router;