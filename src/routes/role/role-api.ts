import express from "express";
import prosesjwt from "proses-jwt";
import { alreadyExist, serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { validate } from "../../middlewares/validation.middleware";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import { v_params } from "../../validations/zod-params";
import {
  addRole,
  checkRoleName,
  deleteRole,
  getAllActiveRole,
  getAllRole,
  getAllRoles,
  getRolebyID,
  updateRole,
} from "./role-handler";
import { v_role } from "./role-validation";
import { dataWriteRateLimit, dataReadRateLimit } from "../../middlewares/rateLimit";
let { tokenMiddleWare } = prosesjwt;
const router = express.Router();

// Apply rate limiters at router level based on HTTP method
router.use((req, res, next) => {
  if (req.method === 'GET') {
    return dataReadRateLimit(req, res, next);
  }
  return dataWriteRateLimit(req, res, next);
});

//findAllRoles dropdown
router.get("/getRoles",
  tokenMiddleWare,
  async (req, res) => {
    try {
      let allRoles: any = await getAllRoles();
      sendEncryptedResponse(res, allRoles, "get Roles");
    } catch (error) {
      ErrorLogger.write({ type: "getRoles error", error });
      serverError(res, error);
    }
  });

//findAllRoles
router.get("/getAllRoles",
  tokenMiddleWare,
  async (req, res) => {
    try {
      let allRoles: any = await getAllRole(req.query);
      sendEncryptedResponse(res, allRoles, "login successfull");
    } catch (error) {
      ErrorLogger.write({ type: "getAllRoles error", error });
      serverError(res, error);
    }
  });

//Get all role for dropdown
router.get("/getAllActiveRole",
  tokenMiddleWare,
  async (req, res) => {
    try {
      let country: any = await getAllActiveRole();
      sendEncryptedResponse(res, country, "Get Data successfully");
    } catch (error) {
      ErrorLogger.write({ type: "getAllActiveRole error", error });
      serverError(res, error);
    }
  });

//get by id
router.get("/getRolebyID/:id",
  validate({ params: v_params }),
  tokenMiddleWare, async (req, res) => {
    try {
      let role: any = await getRolebyID(req.params);
      sendEncryptedResponse(res, role, "Get Data Successfully by ID");
    } catch (error) {
      ErrorLogger.write({ type: "getRolebyID error", error });
      serverError(res, error);
    }
  });

//addrole
router.post("/addRole",
  validate({ body: v_role }),
  tokenMiddleWare, async (req, res) => {
    try {
      //validates the request body
      const body: any = v_role.parse(req.body);
      const nameData = await checkRoleName(body);
      if (nameData) {
        throw alreadyExist(res, "Role already exist");
      };

      body.permission = '{\"1\":{\"view\":true,\"add\":false,\"edit\":false,\"delete\":true,\"disabled\":true},\"viewAll\":true,\"addAll\":true,\"editAll\":true,\"deleteAll\":true,\"disabled\":true}';

      let role: any = await addRole(body);
      sendEncryptedResponse(res, role, "New Role is Added");
    } catch (error) {
      ErrorLogger.write({ type: "addRole error", error });
      serverError(res, error);
    }
  });

//updateRole
router.put("/updateRole/:id",
  validate({ body: v_role, params: v_params }),
  tokenMiddleWare, async (req, res) => {
    try {
      const body = v_role.parse(req.body);
      const nameData = await checkRoleName(body, req.params);

      if (nameData) {
        throw alreadyExist(res, "This Role already exists");
      }

      let role: any = await updateRole(body, req.params);
      sendEncryptedResponse(res, role, "Data updated successfully");
    } catch (error) {
      ErrorLogger.write({ type: "updateRole error", error });
      serverError(res, error);
    }
  });

//deleteRole
router.delete("/deleteRole/:id",
  tokenMiddleWare,
  async (req, res) => {
    try {
      let role: any = await deleteRole(req.params);
      sendEncryptedResponse(res, role, "Data Deleted successfully");
    } catch (error) {
      console.log(error,"errorrrrrrrrr")
      ErrorLogger.write({ type: "deleteRole error", error });
      serverError(res, error);
    }
  });

module.exports = router;