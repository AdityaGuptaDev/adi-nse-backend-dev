import express from "express";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import ErrorLogger from "../../db/core/logger/error-logger";
import { serverError } from "proses-response";
import { getBcList } from "./bc-handler";
import { tokenMiddleWare } from "../../middlewares/tokenMiddleware";


const router = express.Router();

router.get(
  "/getBcList",
  tokenMiddleWare,
  async (req: any, res: any) => {
    try {
      let query: any = { ...req.query, user: req.user };
      console.log("query-111111111111" + JSON.stringify(req.query));

      let allData: any = await getBcList(query);

      sendEncryptedResponse(res, allData, "Got all partner list");
    } catch (error) {
     
      
      ErrorLogger.write({ type: "getAllPartnerList error", error });
      serverError(res, error);
    }
  }
);

module.exports = router;


