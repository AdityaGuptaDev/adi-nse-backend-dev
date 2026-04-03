import express from "express";
import prosesjwt from "proses-jwt";
import { serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import ConfigurationService from "../../services/configuration.service";

const router = express.Router();
let { tokenMiddleWare } = prosesjwt;

// ---------------------- GET ALL COLORS ----------------------
router.get("/getColors", async (req: any, res: any) => {
  try {
    const colors = await ConfigurationService.getAllColors();
    sendEncryptedResponse(res, colors, "Fetched all color options successfully");
  } catch (error) {
    ErrorLogger.write({ type: "getColors error", error });
    serverError(res, error);
  }
});

// ---------------------- GET ALL SCHEMES ----------------------
router.get("/getAllSchemes", async (req: any, res: any) => {
  try {
    const data = await ConfigurationService.getAllSchemes();
    sendEncryptedResponse(res, data, "Fetched all schemes successfully");
  } catch (error) {
    ErrorLogger.write({ type: "getAllSchemes error", error });
    serverError(res, error);
  }
});

// ---------------------- GET BC SCHEMES ----------------------
router.get("/getBcSchemes", async (req: any, res: any) => {
  try {
    const data = await ConfigurationService.getBcSchemes();
    sendEncryptedResponse(res, data, "Fetched all BC scheme data successfully");
  } catch (error) {
    ErrorLogger.write({ type: "getBcSchemes error", error });
    serverError(res, error);
  }
});

// ---------------------- SAVE CONFIGURATION ----------------------
router.post("/saveConfiguration", async (req: any, res: any) => {
  try {
    const configurations = req.body.configurations;
    await ConfigurationService.saveSchemeConfiguration(configurations);
    sendEncryptedResponse(res, {}, "Scheme configuration saved successfully");
  } catch (error) {
    ErrorLogger.write({ type: "saveConfiguration error", error });
    serverError(res, error);
  }
});

// ---------------------- GET CONFIGURATIONS ----------------------
router.get("/getConfigurations", async (req: any, res: any) => {
  try {
    const data = await ConfigurationService.getSavedConfigurations();
    sendEncryptedResponse(res, data, "Fetched configurations successfully");
  } catch (error) {
    ErrorLogger.write({ type: "getConfigurations error", error });
    serverError(res, error);
  }
});

// ---------------------- UPDATE CONFIGURATION ----------------------
router.put("/updateConfiguration/:id", async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const configData = req.body;
    await ConfigurationService.updateConfiguration(id, configData);
    sendEncryptedResponse(res, {}, "Configuration updated successfully");
  } catch (error) {
    ErrorLogger.write({ type: "updateConfiguration error", error });
    serverError(res, error);
  }
});

// ---------------------- DELETE CONFIGURATION ----------------------
router.delete("/deleteConfiguration/:id", async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    await ConfigurationService.deleteConfiguration(id);
    sendEncryptedResponse(res, {}, "Configuration deleted successfully");
  } catch (error) {
    ErrorLogger.write({ type: "deleteConfiguration error", error });
    serverError(res, error);
  }
});

// ---------------------- GET COLOR ALLOCATION ----------------------
router.get("/getColorAllocation/:colorId", async (req: any, res: any) => {
  try {
    const colorId = parseInt(req.params.colorId);
    const allocation = await ConfigurationService.getColorAllocation(colorId);
    sendEncryptedResponse(res, allocation, "Fetched color allocation successfully");
  } catch (error) {
    ErrorLogger.write({ type: "getColorAllocation error", error });
    serverError(res, error);
  }
});

// ---------------------- GET ALL COLOR ALLOCATIONS ----------------------
router.get("/getAllColorAllocations", async (req: any, res: any) => {
  try {
    const allocations = await ConfigurationService.getAllColorAllocations();
    sendEncryptedResponse(res, allocations, "Fetched all color allocations successfully");
  } catch (error) {
    ErrorLogger.write({ type: "getAllColorAllocations error", error });
    serverError(res, error);
  }
});

// ---------------------- VEDANT RECOMMENDED FUNDS CRUD ----------------------

// NEW: Get available funds from function (for modal)
router.get("/vedantRecommended/available", async (req: any, res: any) => {
  try {
    const data = await ConfigurationService.getAvailableVedantFunds();
    sendEncryptedResponse(res, data, "Fetched available Vedant funds successfully");
  } catch (error) {
    ErrorLogger.write({ type: "vedantRecommended.available error", error });
    serverError(res, error);
  }
});

// Get saved funds from table
router.get("/vedantRecommended/all", async (req: any, res: any) => {
  try {
    const data = await ConfigurationService.getAllVedantRecommendedFunds();
    sendEncryptedResponse(res, data, "Fetched Vedant recommended funds successfully");
  } catch (error) {
    ErrorLogger.write({ type: "vedantRecommended.getAll error", error });
    serverError(res, error);
  }
});

// Save funds to table
router.post("/vedantRecommended/add", async (req: any, res: any) => {
  try {
    const payload = req.body.recommendedFunds || req.body;
    const userId = (req as any).user?.id || null;
    const result = await ConfigurationService.saveVedantRecommendedFunds(payload, userId);
    sendEncryptedResponse(res, result, "Vedant recommended fund(s) saved successfully");
  } catch (error) {
    ErrorLogger.write({ type: "vedantRecommended.add error", error });
    serverError(res, error);
  }
});

// Update fund in table
router.put("/vedantRecommended/update/:id", async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || null;
    const data = req.body;
    const result = await ConfigurationService.updateVedantRecommendedFund(id, data, userId);
    sendEncryptedResponse(res, result, "Vedant recommended fund updated successfully");
  } catch (error) {
    ErrorLogger.write({ type: "vedantRecommended.update error", error });
    serverError(res, error);
  }
});

// Delete fund from table (soft delete)
router.delete("/vedantRecommended/delete/:id", async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || null;
    const result = await ConfigurationService.deleteVedantRecommendedFund(id, userId);
    sendEncryptedResponse(res, result, "Vedant recommended fund deleted successfully");
  } catch (error) {
    ErrorLogger.write({ type: "vedantRecommended.delete error", error });
    serverError(res, error);
  }
});

module.exports = router;