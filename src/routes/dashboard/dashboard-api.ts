// import express from "express";
// import { serverError } from "proses-response";
// import { sendEncryptedResponse } from "../../services/encryptResponse-service";
// import { getAssetsCount, getLocationCount, getPieData } from "./dashboard-handler";

// const router = express.Router();


// router.get("/getAssetsCount", async (req, res) => {
//     try {
//       let assetsCount: any = await getAssetsCount();
//       sendEncryptedResponse(res, assetsCount, "Get Data Successfully");
//     } catch (error) {
//       serverError(res, error);
//     }
//   });

// router.get("/getLocationCount", async (req, res) => {
//     try {
//       let locationCount: any = await getLocationCount();
//       sendEncryptedResponse(res, locationCount, "Get Data Successfully");
//     } catch (error) {
//       serverError(res, error);
//     }
//   });

//   router.get("/getPieData", async (req, res) => {
//     try {
//       let pieData: any = await getPieData();
//       sendEncryptedResponse(res, pieData, "Get Data Successfully");
//     } catch (error) {
//       serverError(res, error);
//     }
//   });

//   module.exports = router; 
  