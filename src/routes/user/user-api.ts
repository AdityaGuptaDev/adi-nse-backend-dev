import express from "express";
import dbInstance from "../../db/core/control-db";
import {
  addUser,
  checkPassword,
  checkUserData,
  createUserMapping,
  createRMRegistration,
  createBackOfficeRegistration,
  deleteUser,
  getAllUser,
  getAllUserType,
  getUserByEmail,
  getUserByEmailOrMobile,
  getUserByFindEmailOrMobile,
  getUserByid,
  getUserMapping,
  updateUser,
  updateUserPassword,
  UserData,
  findUserByEmailOrMobile,
  getUserTypeById,
  getRefData,
  getUserTypesByEmailOrMobile,
  getBackOfficeUsers,
  updateRMRegistration,
  getUserByEmailInvestor,
  getUserByMobileInvestor,
  getUserByInvestorId,
  getUserMappingPartnerToInvestor,
  updateUser1,
} from "./user-handler";

import prosesjwt from "proses-jwt";
import {
  alreadyExist,
  other,
  serverError,
  unauthorized,
} from "proses-response";
let { tokenMiddleWare, generateToken } = prosesjwt;

import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import { sendEmail } from "../../services/mailService";

import { sendEmail2 } from "../../services/email.service2";
import { SmsService } from "../../services/sms.service";
import { securityMonitor } from "../../services/security-monitor.service";

import {
  generateRandomOTP,
  generateRandomPassword,
} from "../../services/password-service";
import { ROLE, USER_TYPE } from "../../utils/constant";
import { getUserTypeFromID } from "../../utils/helper";
import { getAllActiveMenu, getMultipleRoleData } from "../role/role-handler";
import { findAdminFilterForInvester } from "../scheme/fundpicker-handler";

// SMS wrapper function with fallback
const sendSmsWithFallback = async (to: string, message: string) => {
  try {
    console.log('Attempting to send SMS via Nimbus...');
    await SmsService.sendSmsUsingNimbus(to, message);
    console.log('SMS sent successfully via Nimbus');
  } catch (error: any) {
    console.error('SMS via Nimbus failed, using fallback:', error.message);
    try {
      await SmsService.sendSmsConsole(to, message);
      console.log('SMS sent via console fallback');
    } catch (fallbackError: any) {
      console.error('SMS fallback also failed:', fallbackError.message);
      // Don't throw error - continue without SMS
    }
  }
};
import { authRateLimit, authFailureLimiter, dataReadRateLimit, dataWriteRateLimit, debugRateLimit } from "../../middlewares/rateLimit";
import { OtpDetail } from "./otp-detail-model";
import { Users } from "./user-model";
import { addUserBcData, addUserInvestorData, addUserPartnerData } from "../kyc-flow/kyc-handler";
import {
  findRMInvestorMapping,
  findRMInvestorRegistration,
  findRMPartner,
  findRMPartnerMapping,
  findRMRegistrationData,
  updateRMRegistrationData,
  destroyUserMapping,
} from "../investor/investor-handler";
import { UserType } from "./usertype-model";
import { mobileToAccount, partnerMobileToAccount } from "../decentro/decentro-handler";
import { date } from "zod";
import { InvestorRegistration } from "../kyc-flow/user_basic_detail-model";

const router = express.Router();

//login endpoint
router.post("/login", authRateLimit, async (req, res) => {
  try {
    const { userName, password, loginOTP, userTypeId } = req.body;
     console.log("******************Inside /login **********************");
    console.log("userName------------", userName)
    console.log("password------------", password)
    console.log("loginOTP------------", loginOTP)
    console.log("userTypeId------------", userTypeId)

    let user: any = await getUserByFindEmailOrMobile(userName);
    user = JSON.parse(JSON.stringify(user));
    console.log("******************User from getUserByFindEmailOrMobile **********************");
    console.log(user);

    let findFilterData: any = await findAdminFilterForInvester();
    findFilterData = JSON.parse(JSON.stringify(findFilterData));

    console.log("******************findFilterData from findAdminFilterForInvester **********************");
    console.log(findFilterData);

    // check weather user exist or not
    if (!user) {
      throw unauthorized(res, "Invalid credentials");
    }

    let data: any;
    if (!user.isMobileOTPVerified) {
      data = {
        user: user,
      };
    } else {
      // compare pwd
      console.log(password);
      console.log(user.password);
      // console.log(checkPassword(password, user.password));

      if (password && !loginOTP) {
        if (!checkPassword(password, user.password)) {
          throw unauthorized(res, "Invalid Credentials");
        }
      }
let otpToCompare;

if (user.mobileOTP && !user.loginOTP) {
  // Sirf mobileOTP hai, loginOTP nahi — mobileOTP use karo
  otpToCompare = user.mobileOTP;
} else if (user.loginOTP) {
  // loginOTP available hai — loginOTP use karo
  otpToCompare = user.loginOTP;
}
if(!password){
if (!otpToCompare || otpToCompare !== loginOTP) {
  console.log("invalid otp entered");
  throw other(res, "Invalid OTP");
}
}

      let userTypeData = await getUserMapping(user.id, req.body.userTypeId);

      // If userTypeId is provided, filter to only that user type
      if (userTypeId) {
        userTypeData = userTypeData.filter(
          (mapping: any) => mapping.userType_id === userTypeId
        );
        if (userTypeData.length === 0) {
          throw unauthorized(res, "Invalid user type for this account");
        }
      }

      let meta: any = {};
      let allUser: any = [];

      await Promise.all(
        userTypeData.map(async (element) => {
          // console.log(element.userTypeID,'elementelementelementelement')
          let type: any = getUserTypeFromID(element.userType_id);

          let meta1: any = await getRefData(
            element.userType_id,
            element.ref_id
          );
          meta1 = JSON.parse(JSON.stringify(meta1));

          if (meta1 && meta1.isDelete) {
            throw unauthorized(
              res,
              "This investor is deactivated, so login is not allowed."
            );
          }

          console.log(meta1, 'type')
          if (meta1 == null) {
            meta1 = {
              userType_id: element.userType_id,
              ref_id: element.ref_id,
              role_id: element.role_id,
              user_id: element.user_id,
            };
            meta[type] = meta1;
            allUser.push(meta1);
          } else {
            meta1.userType_id = element.userType_id;
            meta1.ref_id = element.ref_id;
            meta1.role_id = element.role_id;
            meta1.user_id = element.user_id;
          }
          meta[type] = meta1;
          allUser.push(meta1);
        })
      );
      const result: any = {
        id: user.id,
        //email: user.email.toLowerCase(),
        mobile: user.mobile,
        roleId: user.roleId,
        userTypeData: meta,
      };
      //token
      const token = generateToken(result);

      let rolesIDS = allUser.map((x: any) => x?.role_id);

      let menu = await getAllActiveMenu();

      //  get the permission list
      const roles: any = await getMultipleRoleData(rolesIDS);
      let permission = mergePermissions(roles);

      // let menuwithPermission = await insertPermission(menu, permission);
      let perMenu: any = await permitedMenu(menu, permission);

      // Use the selected userTypeId or the first available one
      const selectedUserTypeId =
        userTypeId ||
        (userTypeData.length > 0
          ? userTypeData[0].userType_id
          : user.userTypeId);
      const userType = await getUserTypeById(selectedUserTypeId);

      data = {
        token,
        user: user,
        menu: perMenu,
        meta,
        initPath: userType?.init_path,
        // flatMenu: menuwithPermission,
        findFilterData: findFilterData,
      };
    }
    console.log(data, 'userTypeDatauserTypeDatauserTypeData')

    sendEncryptedResponse(res, data, "login successfully");

    // Clear failed login attempts on successful login
    securityMonitor.clearFailedAttempts(userName);
    authFailureLimiter.clearFailures(req);

  } catch (error: any) {
    console.log(error?.message || error, "errorrrrr");

    // Track failed login attempt with SIEM
    const { userName: failedUserName } = req.body;
    const identifier = failedUserName || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    securityMonitor.trackFailedLogin(identifier, ipAddress, userAgent, error?.message || error);
    authFailureLimiter.recordFailure(req);

    ErrorLogger.write({ type: "login error", error });
    serverError(res, error);
  }
});

router.post("/investor-login", authRateLimit, async (req, res) => {
  try {
    const { userName, userTypeId } = req.body;

    console.log("userName-", userName)

    console.log("userTypeId-", userTypeId)


    let user: any = await getUserByFindEmailOrMobile(userName);
    user = JSON.parse(JSON.stringify(user));

    let findFilterData: any = await findAdminFilterForInvester();
    findFilterData = JSON.parse(JSON.stringify(findFilterData));

    // check weather user exist or not
    if (!user) {
      throw other(res, "User not found");
    }

    let data: any;





    let userTypeData = await getUserMapping(user.id, userTypeId);

    // If userTypeId is provided, filter to only that user type
    if (userTypeId) {
      userTypeData = userTypeData.filter(
        (mapping: any) => mapping.userType_id === userTypeId
      );
      if (userTypeData.length === 0) {
        throw other(res, "Invalid user type for this account");
      }
    }

    let meta: any = {};
    let allUser: any = [];

    await Promise.all(
      userTypeData.map(async (element) => {
        // console.log(element.userTypeID,'elementelementelementelement')
        let type: any = getUserTypeFromID(element.userType_id);

        let meta1: any = await getRefData(
          element.userType_id,
          element.ref_id
        );
        meta1 = JSON.parse(JSON.stringify(meta1));

        if (meta1 && meta1.isDelete) {
          throw other(
            res,
            "This investor is deactivated, so login is not allowed."
          );
        }

        // console.log(meta1, 'type')
        if (meta1 == null) {
          meta1 = {
            userType_id: element.userType_id,
            ref_id: element.ref_id,
            role_id: element.role_id,
            user_id: element.user_id,
          };
          meta[type] = meta1;
          allUser.push(meta1);
        } else {
          meta1.userType_id = element.userType_id;
          meta1.ref_id = element.ref_id;
          meta1.role_id = element.role_id;
          meta1.user_id = element.user_id;
        }
        meta[type] = meta1;
        allUser.push(meta1);
      })
    );
    const result: any = {
      id: user.id,
      email: user.email?.toLowerCase() || null,
      mobile: user.mobile,
      roleId: user.roleId,
      userTypeData: meta,
    };
    //token
    const token = generateToken(result);

    let rolesIDS = allUser.map((x: any) => x?.role_id);

    let menu = await getAllActiveMenu();
    //  get the permission list
    const roles: any = await getMultipleRoleData(rolesIDS);
    let permission = mergePermissions(roles);

    // console.log(menuwithPermission, "menuwithPermissionmenuwithPermission");
    let perMenu: any = await permitedMenu(menu, permission);

    // Use the selected userTypeId or the first available one
    const selectedUserTypeId =
      userTypeId ||
      (userTypeData.length > 0
        ? userTypeData[0].userType_id
        : user.userTypeId);
    const userType = await getUserTypeById(selectedUserTypeId);

    data = {
      token,
      user: user,
      menu: perMenu,
      meta,
      initPath: userType?.init_path,
      findFilterData: findFilterData,
    };
    // console.log(data, 'userTypeDatauserTypeDatauserTypeData')

    sendEncryptedResponse(res, data, "login successfully");
    authFailureLimiter.clearFailures(req);
  } catch (error: any) {
    console.log(error?.message || error, "errorrrrr");

    // Track failed login attempt with SIEM
    const { userName: failedUserName } = req.body;
    const identifier = failedUserName || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    securityMonitor.trackFailedLogin(identifier, ipAddress, userAgent, error?.message || error);
    authFailureLimiter.recordFailure(req);

    ErrorLogger.write({ type: "login error", error });
    serverError(res, error);
  }
});

//partner-login from registeration process
router.post("/partner-login", authRateLimit, async (req, res) => {
  try {

    const { userName, userTypeName } = req.body;

    console.log("userName-", userName)
    console.log("userTypeName-", userTypeName)


    //get userTypeId from userTypeName
    const findUserType = await UserType.findOne({
      where: { userType: userTypeName, isActive: true }
    });
    if (!findUserType) {
      throw other(res, "Invalid user type");
    }
    const userTypeId = findUserType.id;
    console.log("Mapped userTypeId:", userTypeId);

    let user: any = await getUserByFindEmailOrMobile(userName);
    user = JSON.parse(JSON.stringify(user));

    let findFilterData: any = await findAdminFilterForInvester();
    findFilterData = JSON.parse(JSON.stringify(findFilterData));

    // check weather user exist or not
    if (!user) {
      throw other(res, "User not found");
    }
    console.log("user.id-", user.id);
    console.log("userTypeId-", userTypeId);

    let data: any;
    let userTypeData = await getUserMapping(user.id, Number(userTypeId));
    console.log("userTypeData-", userTypeData);

    console.log("userTypeId-", userTypeId);

    // If userTypeId is provided, filter to only that user type
    if (userTypeId) {
      userTypeData = userTypeData.filter(
        (mapping: any) => mapping.userType_id === userTypeId
      );

      console.log("userTypeData.length-", userTypeData.length);

      // if (userTypeData.length === 0) {
      //   throw other(res, "Invalid user type for this account");
      // }
    }

    let meta: any = {};
    let allUser: any = [];

    await Promise.all(
      userTypeData.map(async (element) => {
        // console.log(element.userTypeID,'elementelementelementelement')
        let type: any = getUserTypeFromID(element.userType_id);

        let meta1: any = await getRefData(
          element.userType_id,
          element.ref_id
        );
        meta1 = JSON.parse(JSON.stringify(meta1));

        if (meta1 && meta1.isDelete) {
          throw other(
            res,
            "This partner is deactivated, so login is not allowed."
          );
        }

        // console.log(meta1, 'type')
        if (meta1 == null) {
          meta1 = {
            userType_id: element.userType_id,
            ref_id: element.ref_id,
            role_id: element.role_id,
            user_id: element.user_id,
          };
          meta[type] = meta1;
          allUser.push(meta1);
        } else {
          meta1.userType_id = element.userType_id;
          meta1.ref_id = element.ref_id;
          meta1.role_id = element.role_id;
          meta1.user_id = element.user_id;
        }
        meta[type] = meta1;
        allUser.push(meta1);
      })
    );
    const result: any = {
      id: user.id,
      //email: user.email.toLowerCase(),
      mobile: user.mobile,
      roleId: user.roleId,
      userTypeData: meta,
    };
    //token
    const token = generateToken(result);

    let rolesIDS = allUser.map((x: any) => x?.role_id);

    let menu = await getAllActiveMenu();
    //  get the permission list
    const roles: any = await getMultipleRoleData(rolesIDS);
    let permission = mergePermissions(roles);

    // console.log(menuwithPermission, "menuwithPermissionmenuwithPermission");
    let perMenu: any = await permitedMenu(menu, permission);

    // Use the selected userTypeId or the first available one
    const selectedUserTypeId =
      userTypeId ||
      (userTypeData.length > 0
        ? userTypeData[0].userType_id
        : user.userTypeId);
    const userType = await getUserTypeById(selectedUserTypeId);

    data = {
      token,
      user: user,
      menu: perMenu,
      meta,
      initPath: userType?.init_path,
      findFilterData: findFilterData,
    };
    // console.log(data, 'userTypeDatauserTypeDatauserTypeData')

    sendEncryptedResponse(res, data, "login successfully");
    authFailureLimiter.clearFailures(req);
  } catch (error: any) {
    console.log(error?.message || error, "errorrrrr");

    // Track failed login attempt with SIEM
    const { userName: failedUserName } = req.body;
    const identifier = failedUserName || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    securityMonitor.trackFailedLogin(identifier, ipAddress, userAgent, error?.message || error);
    authFailureLimiter.recordFailure(req);

    ErrorLogger.write({ type: "login error", error });
    serverError(res, error);
  }
});

const insertPermission = (menu: any, perm: any) => {
  // filter out only permitted menu in flat menu array for searching
  let keys = Object.keys(perm);
  let tempArr: any[] = [];
  for (let item of menu) {
    let grantPerm = keys?.includes(item.id.toString());

    if (grantPerm) {
      tempArr.push({ ...item, permission: perm?.[item.id] });
    }
  }

  return tempArr;
};
const mergePermissions = (rolesData: any[]) => {
  let permissions = rolesData.map((x) => {
    let { viewAll, addAll, editAll, deleteAll, disabled, ...valid } =
      JSON.parse(x.permission);
    return {
      id: x.id,
      permission: valid,
      menuIDs: Object.keys(valid),
    };
  });
  let result: any = {};
  for (let p of permissions) {
    for (let m of p.menuIDs) {
      let rest = permissions.filter((x) => x.id != p.id);
      result[m] = p.permission[m];

      for (let subp of rest) {
        if (subp.permission[m]) {
          let compared = compare(subp.permission[m], p.permission[m]);
          result[m] = compare(result[m], compared);
        }
      }
    }
  }

  return result;
};

const compare = (one: any, two: any) => {
  let keys: any = Object.keys(one);
  let obj: any = {};
  for (let k of keys) {
    let val = false;
    if (one[k] == true) {
      val = true;
    }
    if (two[k] == true) {
      val = true;
    }
    obj[k] = val;
  }
  return obj;
};
/**
 * to get all menu list with permission
 */

//findAllUser
router.get("/getAllUser", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    let allUser: any = await getAllUser(req.query);
    allUser = JSON.parse(JSON.stringify(allUser));
    sendEncryptedResponse(res, allUser, "Got all users");
    // sendEncryptedResponse(res,  allUser, "Got all users");
  } catch (error: any) {
    console.log(error?.message || error, "errorrrrr");
    ErrorLogger.write({ type: "getAllUser error", error });
    serverError(res, error);
  }
});

router.get("/userByID/:id", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    let user = await getUserByid(req.params.id);
    sendEncryptedResponse(res, user, "got user by id");
    // sendEncryptedResponse(res,  user, "got user by id");
  } catch (error) {
    ErrorLogger.write({ type: "userByID error", error });
    serverError(res, error);
  }
});

//addUser
router.post("/addUser", dataWriteRateLimit, tokenMiddleWare, async (req: any, res) => {
  let t = await dbInstance.transaction();
  try {
    let userID: any;
    if (req.user) {
      userID = req.user.id;
    }

    req.body = { ...req.body, createdBy: userID };
    let userData: any = await findUserByEmailOrMobile(req.body);
    userData = JSON.parse(JSON.stringify(userData));
    if (userData) {
      let findUserMapping: any = await getUserMapping(userData.id, req.body.userTypeId);
      findUserMapping = JSON.parse(JSON.stringify(findUserMapping));
      if (findUserMapping.length > 0) {
        throw alreadyExist(res, "User already exists");
      }

    }

    // Create user first

    let refId: any = null;
    let roleId: any = null;

    switch (req.body.userTypeId) {
      case USER_TYPE.backOffice:
        // Create Back Office Registration record
        const backOfficeData = {
          Name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile.toString(),
        };
        const backOfficeRegistration = await createBackOfficeRegistration(
          backOfficeData,
          t
        );
        refId = backOfficeRegistration.id;
        roleId = ROLE.backOffice;
        break;

      case USER_TYPE.RM:
        // Create RM Registration record
        const rmData = {
          Name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile.toString(),
          ARN: req.body.ARN || null,
          EUIN: req.body.EUIN || null,
          created_by: userID,
          isActive: req.body.isActive,
        };
        const rmRegistration = await createRMRegistration(rmData, t);
        refId = rmRegistration.id;
        roleId = ROLE.RM;
        break;
      case USER_TYPE.superAdmin:
        roleId = ROLE.superAdmin;
        break;
      default:
        throw other(res, "Invalid User Type");
    }
    if (!userData) {
      userData = await addUser(req.body, t);
      userData = JSON.parse(JSON.stringify(userData));
      // throw alreadyExist(res, "Email or Mobile already exists");
    }
    // Create user mapping with ref_id
    const userMapping = {
      user_id: userData.id,
      role_id: roleId,
      userType_id: req.body.userTypeId,
      ref_id: refId,
    };
    console.log(userMapping);
    await createUserMapping(userMapping, t);

    await t.commit();
    sendEncryptedResponse(res, userData, "New User is added");
  } catch (error) {
    console.log(error);
    await t.rollback();
    ErrorLogger.write({ type: "addUser error", error });
    serverError(res, error);
  }
});

//updateUser
router.put("/updateUser/:id", dataWriteRateLimit, tokenMiddleWare, async (req: any, res) => {
  let t = await dbInstance.transaction();
  try {
    let userID = req.user.id;
    req.body = { ...req.body, modifiedBy: userID };
    const nameData: any = await checkUserData(req.body, req.params);
    console.log(nameData, "nameData");

    if (nameData) {
      if (nameData.email.toLowerCase() == req.body.email.toLowerCase()) {
        throw alreadyExist(res, "Email already exists");
      }
      if (nameData.mobile == req.body.mobile) {
        throw alreadyExist(res, "Mobile No. already exists");
      }
    }

    let user: any = await updateUser(req.body, req.params.id);

    // If user type is RM and RM fields are provided, update RM registration
    if (
      req.body.userTypeId == USER_TYPE.RM &&
      (req.body.ARN || req.body.EUIN)
    ) {
      // Get user mapping to find ref_id
      const userMapping = await getUserMapping(req.params.id, USER_TYPE.RM);
      const rmMapping = userMapping[0]; // Since we're filtering by RM user type, take the first result

      if (rmMapping && rmMapping.ref_id) {
        const rmUpdateData: any = {
          modified_by: userID,
          isActive: req.body.isActive,
          ARN: req.body.ARN,
          EUIN: req.body.EUIN,
        };

        await updateRMRegistration(rmUpdateData, rmMapping.ref_id, t);
      }
    }

    await t.commit();
    sendEncryptedResponse(res, user, "Data updated successfully");
  } catch (error) {
    await t.rollback();
    ErrorLogger.write({ type: "updateUser error", error });
    serverError(res, error);
  }
});

//deleteUser
router.delete("/deleteUser/:id", dataWriteRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    console.log(req.params, "req.paramsreq.params");

    let findUser: any = await getUserByid(req.params.id);
    findUser = JSON.parse(JSON.stringify(findUser));

    let findRM: any = await findRMRegistrationData(findUser.email);
    findRM = JSON.parse(JSON.stringify(findRM));

    let findInvestor: any = await findRMInvestorRegistration(findRM.id);
    let findPartner: any = await findRMPartner(findRM.id);

    if (findInvestor || findPartner) {
      throw other(res, "Cannot delete: User already in use");
    }

    // return
    await destroyUserMapping(findRM.id);

    let updateRM: any = await updateRMRegistrationData(findUser.email);

    // return

    // let user: any = await deleteUser(req.params);
    sendEncryptedResponse(res, updateRM, "Data Deleted successfully");
  } catch (error) {
    ErrorLogger.write({ type: "deleteUser error", error });
    serverError(res, error);
  }
});

const adjustMenu = (data: any, parent_id: any) => {
  if (!data) return;

  let tempMenu: any = [];

  data.forEach((ele: any) => {
    if (ele.parentID == parent_id) {
      let obj;

      if (parent_id == null) {
        obj = {
          type: "parent",
          id: ele.id,
          title: ele.title,
          icon: ele.icon,
          link: ele.link,
          children: adjustMenu(data, ele.id),
        };
      } else {
        obj = {
          type: "child",
          id: ele.id,
          title: ele.title,
          link: ele.link,
          icon: ele.icon,
          parentID: parent_id,
          children: [],
        };
      }

      tempMenu.push(obj);
    }
  });

  return tempMenu;
};

/** role based permited menu */
const getPermission = (singleMenu: any, permission: any) => {
  if (!singleMenu.children.length) {
    return [
      permission?.[singleMenu?.id]?.["view"],
      [],
      permission?.[singleMenu?.id],
    ];
  }

  const children = singleMenu.children
    .filter((i: any) => permission?.[i.id]?.["view"])
    .map((j: any) => ({ ...j, permission: permission?.[j.id] }));
  return [!!children.length, children, null];
};

/** return the permission based menu */
export function permitedMenu(menu: any, permission: any) {
  const MENU = adjustMenu(menu, null);
  let tempMenu: any = [];

  for (let item of MENU) {
    const [flag, children, perm] = getPermission(item, permission);
    if (flag) {
      if (perm) {
        tempMenu.push({
          ...item,
          children,
          permission: perm,
        });
      } else {
        tempMenu.push({
          ...item,
          children,
        });
      }
    }
  }

  return tempMenu;
}

/**
 *  menu - if menu/submenu hav view permission then it is in sidebar
 */
export var setPermission = function (menu: any, perm: any) {
  let d = setMenuOfViewPermission(menu, perm, false);
  return d;
  function setMenuOfViewPermission(
    menu: any,
    permission: any,
    isChild = false
  ) {
    return menu.filter((item: any) => {
      const basePerm = {
        view: false,
        add: false,
        edit: false,
        delete: false,
        disabled: false,
      };

      const singlePerm = permission ? permission[item?.id] : basePerm;

      if (item?.children?.length == 0) {
        item.permission = singlePerm;
        return true;
      } else if (item?.children?.length > 0) {
        /**if menu have children then recursive call for pemission set in child menu */
        item.children = setMenuOfViewPermission(item.children, perm, true);
        return item.children.length > 0;
      } else {
        return false;
      }
    });
  }
};

//forgot password
router.post("/forgotPassword", authRateLimit, async (req, res) => {
  try {
    const { email } = req.body;
    let user = await UserData(req.body);
    if (!user) {
      throw unauthorized(res, "Invalid Email");
    }

    const newPWD = generateRandomPassword();

    //send email - forgot pass
    const mailData: any = {
      to: email.toLowerCase(),
      subject: "Vedant-New Password",
      html: `<div>
      Your login details for Vedant is given below<br/><br/>
      UserName : ${user.email.toLowerCase()}<br/><br/>
      Password : ${newPWD} <br/><br/>
      Thanks & Regards<br/>Massarreal              
    </div>`,
    };

    sendEmail(mailData);

    // update newly generated password
    const usr = await Users.update(
      { password: newPWD },
      { where: { email: email.toLowerCase() } }
    );

    sendEncryptedResponse(res, user, "New Password Sent via Email");
    authFailureLimiter.clearFailures(req);
  } catch (error) {
    authFailureLimiter.recordFailure(req);
    ErrorLogger.write({ type: "forgotPassword error", error });
    serverError(res, error);
  }
});

//Update Password
router.post("/changePassword", authRateLimit, tokenMiddleWare, async (req: any, res) => {
  try {
    let { oldPassword, newPassword } = req.body;
    let user: any = await Users.findOne({
      where: { id: req.user.id },
      attributes: ["email", "id", "password"],
      raw: true,
    });

    if (oldPassword === newPassword) {
      throw other(res, "Your old password and new password both are same");
    }

    if (!checkPassword(oldPassword, user.password)) {
      throw other(res, "Your old Password is wrong");
    }

    let newValue = await updateUserPassword(req.body, req.user.id);
    sendEncryptedResponse(
      res,
      newValue,
      "Your Password has been successfully updated!!"
    );
    authFailureLimiter.clearFailures(req);
  } catch (error) {
    authFailureLimiter.recordFailure(req);
    ErrorLogger.write({ type: "changePassword error", error });
    serverError(res, error);
  }
});

//Added on 08-01-2025
/************************Investor Registration ******************/

router.post("/add-investor", authRateLimit, async (req: any, res: any) => {

  const t = await dbInstance.transaction();

  try {
    const { mobile, userType, partnerId,parentId } = req.body;

    console.log("mobile--",mobile);
    console.log("userType--",userType);
    console.log("partnerId--",partnerId);
    console.log("parentId-____",parentId);


    if (!mobile || !userType) {
      return res.status(400).json({ message: "mobile and userType are required" });
    }

    const userTypeRecord = await UserType.findOne({
      where: { userType, isActive: true },
    });

    if (!userTypeRecord) {
      return res.status(400).json({ message: "Invalid userType" });
    }

    const userTypeId = userTypeRecord.id;
    const mobileOTP = generateRandomOTP();

    let msg: any = `Register User OTP - ${mobileOTP} is the OTP for your transaction. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`;


console.log("userType---Investor---",userType);
console.log("mobile------",mobile);

   let user = await findUserByEmailOrMobile({ mobile });

if (!user) {
  return other(res, "User not found with this mobile number");
}

user = JSON.parse(JSON.stringify(user)) as Users;
console.log("User details--", user);

const payload = {
  mobile,
  userTypeId,
  mobileOTP,
};

 // Update user table with mobileOTP
await updateUser1({ loginOTP: mobileOTP }, user.id, t);

// Create OTP detail record
await OtpDetail.create(
  { userId: user.id, kyc_mobile_otp: mobileOTP, mobile },
  { transaction: t }
);
// console.log("parentId---",parentId);
// // Create InvestorRegistration row
// const existingInvestor = await InvestorRegistration.findOne({
//   where: { reg_mobile: mobile },
// });

// if (!existingInvestor) {
//   await InvestorRegistration.create(
//     {
//       user_id: user.id,
//       reg_mobile: mobile,
//       partner_id: parentId,
//       is_kyc_complete: false,
//       is_CAN_registered: false,
//       isKYCDone: false,
//       isDelete: false,
//       poiConsent: false,
//     },
//     { transaction: t }
//   );
//   console.log("InvestorRegistration row created for mobile:", mobile);
// } else {
//   console.log("InvestorRegistration already exists for mobile:", mobile);
// }
    await t.commit();
    await SmsService.sendSmsUsingNimbus(mobile, msg);

    /*await SmsService.sendSmsUsingNimbus(
      mobile,
      `Your OTP is ${mobileOTP}. Valid for 30 minutes.`
    );*/

    sendEncryptedResponse(res, user, "OTP sent successfully");
    authFailureLimiter.clearFailures(req);
  } catch (error) {
    await t.rollback();
    authFailureLimiter.recordFailure(req);
    ErrorLogger.write({ type: "register-user", error });
    serverError(res, error);
  }



});

router.post("/verify-otp", authRateLimit, async (req: any, res: any) => {
  const t = await dbInstance.transaction();
  try {
    const { mobile, mobileOTP, userId, userTypeId, source } = req.body;
    //onst userId = req.params.id;
    const parentData = req.body.parentData;

    if (!mobile || !mobileOTP) {
      return res.status(400).json({ message: "mobile and OTP are required" });
    }

    const user = await getUserByMobileInvestor(mobile);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.loginOTP !== mobileOTP) {
      authFailureLimiter.recordFailure(req);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const randomPassword = generateRandomPassword();

    const updatedUser = await updateUser(
      {
        password: randomPassword,
        isMobileOTPVerified: true,
      },
      userId
    );

    const savedUser = JSON.parse(JSON.stringify(updatedUser[1][0]));
    console.log("User finalized:", parentData);


    const finalUserTypeId = source === "partner-add-investor" ? 2 : user.userTypeId;

    await handleUserFinalization(
      finalUserTypeId,
      savedUser,
      parentData?.userId || "",
      t
    );


    await t.commit();

    if ([USER_TYPE.partner, USER_TYPE.BC].includes(user.userTypeId)) {
      callMobileToAccount(savedUser).catch(console.error);
    }

    sendEncryptedResponse(res, savedUser, "OTP verified successfully");
    authFailureLimiter.clearFailures(req);
  } catch (error: any) {
    console.log(error?.message || error, "errorrrrr");
    await t.rollback();
    authFailureLimiter.recordFailure(req);
    ErrorLogger.write({ type: "register-otp", error });
    serverError(res, error);
  }

  // sendEncryptedResponse(res, {}, "OTP sent successfully");

  //USER_TYPE.partner
});


async function handleUserFinalization(userTypeId: any, user: any, partnerId: string, t: any) {
  if (userTypeId === USER_TYPE.InvestorRegistration) {

    const investor = await addUserInvestorData(
      {
        reg_mobile: user.mobile,
        user_id: parseInt(user.id),
        user_type: USER_TYPE.InvestorRegistration,
        partner_id: partnerId,
      },
      t
    );

    await createUserMapping(
      {
        user_id: user.id,
        role_id: ROLE.investor,
        userType_id: USER_TYPE.InvestorRegistration,
        ref_id: investor.id,
      },
      t
    );
  }

  if (userTypeId === USER_TYPE.partner) {
    const partner = await addUserPartnerData(
      {
        mobile: user.mobile,
        user_id: user.id,
        mobileVerified: 1,
        mobileVerifiedAt: new Date(),
      },
      t
    );

    await createUserMapping(
      {
        user_id: user.id,
        role_id: ROLE.partner,
        userType_id: USER_TYPE.partner,
        ref_id: partner.regId,
      },
      t
    );
  }

  if (userTypeId === USER_TYPE.BC) {
    const bc = await addUserBcData(
      {
        mobile: user.mobile,
        user_id: user.id,
        mobileVerified: 1,
        mobileVerifiedAt: new Date(),
      },
      t
    );

    await createUserMapping(
      {
        user_id: user.id,
        role_id: ROLE.BC,
        userType_id: USER_TYPE.BC,
        ref_id: bc.regId,
      },
      t
    );
  }
}

async function callMobileToAccount(user: any) {
  try {
    await partnerMobileToAccount(user.mobile, user.id);
  } catch (err) {
    ErrorLogger.write({ type: "mobile-to-account", error: err });
  }
}


/************************End of Registration ******************/

//  register




router.post("/register-user", authRateLimit, async (req: any, res: any) => {
  let t = await dbInstance.transaction();
  try {
    let body = req.body;
    console.log("userType-", body.userType)

    const userTypeName = body.userType; // e.g. "partner" | "client" | "admin"

    if (!userTypeName) {
      return res.status(400).json({ message: "userType is required!" });
    }

    // Fetch UserType record
    const findUserType = await UserType.findOne({
      where: { userType: userTypeName, isActive: true }
    });

    if (!findUserType) {
      return res.status(400).json({ message: "Invalid userType" });
    }

    // Extract ID
    const userTypeId = findUserType.id;
    console.log("Mapped userTypeId:", userTypeId);

    let getUser: any = await findUserByEmailOrMobile({
      //email: body.email.toLowerCase(),
      mobile: body.mobile,
    });
    getUser = JSON.parse(JSON.stringify(getUser));




    console.log("==========", getUser?.isEmailOTPVerified)
    let mobileOTP: any = generateRandomOTP();
    let userType = body.userType;

    //let emailOTP: any = generateRandomOTP();

    console.log("mobileOTP-", mobileOTP);
    //console.log("emailOTP-",emailOTP);

    let payload = { ...body, mobileOTP: mobileOTP, userTypeId: userTypeId };

    let user: any;

   

    let msg: any = `Register User OTP - ${mobileOTP} is the OTP for your transaction. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`;

    console.log(msg, "====", body.mobile)

    if (getUser) {
      
      console.log("User exists, checking mapping...")
      console.log("getUser.id-", getUser.id); 

      let userType_id: any;

      if(body.userType === "Partner"){
       userType_id=USER_TYPE.partner;
      } 
      else{
        userType_id=USER_TYPE.InvestorRegistration;
      }
      console.log("Determined userType_id:", userType_id);

    const userMapping = await getUserMappingPartnerToInvestor(getUser.id, userType_id);

if (userMapping) {
  throw alreadyExist(res, `This mobile number is already registered as ${userTypeName}`);
}

      console.log("==rt4tpeirtpreitre[t=======", userMapping)


      await updateUser(payload, getUser.id);
      user = { ...getUser, ...payload };




      //sendEmail(mailData);

      //let msg: any = `Register User OTP - ${mobileOTP} is the OTP for your transaction. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`;

      await SmsService.sendSmsUsingNimbus(body.mobile, msg)
      // }
    } else {


      user = await addUser(payload, t);
      console.log(user, "useruseruseruseruseruseruseruser");
      user = JSON.parse(JSON.stringify(user));

      const otpbody = {
        userId: user.id,
        //email: req.body.email,
        mobile: req.body.mobile,
      };

      await OtpDetail.create(otpbody, { transaction: t });
      // sendEmail(mailData);

      //let msg: any = `Register User OTP - ${mobileOTP} is the OTP for your transaction. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`;
      await SmsService.sendSmsUsingNimbus(body.mobile, msg);
    }
    await t.commit();
    sendEncryptedResponse(res, user, "New Register successfully Addred!!");
    authFailureLimiter.clearFailures(req);
  } catch (error) {
    console.log(error, "error");
    await t.rollback();
    authFailureLimiter.recordFailure(req);
    ErrorLogger.write({ type: "register-user error", error });
    serverError(res, error);
  }
});


router.put("/register-otp/:id", authRateLimit, async (req: any, res: any) => {
  let t = await dbInstance.transaction();
  try {
    let body = req.body;

    // let getUser: any = await getUserByEmailInvestor(body.email.toLowerCase());
    let getUser: any = await getUserByMobileInvestor(body.mobile);

    console.log("getUser.emailOTP-", getUser.mobile);

    console.log("userTypeId--", getUser.userTypeId);
    console.log("partner_id---", body.partner_id);

    // if (getUser.mobileOTP !== body.mobileOTP) {
    //   throw other(res, "Invalid Mobile OTP");
    // }

    console.log("getUser.mobileOTP-", getUser.mobileOTP);
    console.log("body.mobileOTP-", body.mobileOTP);

    if (getUser.mobileOTP !== body.mobileOTP) {
      throw other(res, "Invalid mobile OTP");
    }
    const randompassword = generateRandomPassword();
    body.password = randompassword;
    console.log("randompassword-", randompassword);

    let payload = {
      ...body,
      password: randompassword,
      //  isEmailOTPVerified: true,
      isMobileOTPVerified: true,
    };

    let user: any = await updateUser(payload, req.params.id);
    user = JSON.parse(JSON.stringify(user[1][0]));
    let investorPayload;
    let partnerPayload;
    let bcpayload;
    let partner_id = body.partner_id;

    if (getUser.userTypeId === 2) {
      investorPayload = {
        // reg_email: user.email,
        reg_mobile: user.mobile,
        user_id: user.id,
        user_type: USER_TYPE.InvestorRegistration,
        partner_id: partner_id
      };

      const investor = await addUserInvestorData(investorPayload, t);

      console.log("Investorssfdsfdsfdsfdsfsd", investor)

      let userMapping = {
        user_id: user.id,
        role_id: ROLE.investor,
        userType_id: USER_TYPE.InvestorRegistration,
        ref_id: investor.id,
      };
      await createUserMapping(userMapping, t);

    }

    if (getUser.userTypeId === 4) {
      partnerPayload = {
        // email: user.email,
        mobile: user.mobile,
        user_id: user.id,
        userType: USER_TYPE.partner,
        mobileVerified: 1,
        mobileVerifiedAt: new Date(),
        //emailVerified:1,
        //emailVerifiedAt:new Date()
      };

      const partner = await addUserPartnerData(partnerPayload, t);

      let userMapping = {
        user_id: user.id,
        role_id: ROLE.partner,
        userType_id: USER_TYPE.partner,
        ref_id: partner.regId,
      };
      await createUserMapping(userMapping, t);

    }
    if (getUser.userTypeId === 6) {
      bcpayload = {
        // email: user.email,
        mobile: user.mobile,
        user_id: user.id,
        userType: USER_TYPE.BC,
        mobileVerified: 1,
        mobileVerifiedAt: new Date(),
        //emailVerified:1,
        //emailVerifiedAt:new Date()
      };

      const bc = await addUserBcData(bcpayload, t);

      let userMapping = {
        user_id: user.id,
        role_id: ROLE.BC,
        userType_id: USER_TYPE.BC,
        ref_id: bc.regId,
      };
      await createUserMapping(userMapping, t);

    }

    await t.commit();

    /* const welcomeHtml = `
   <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:20px;">
     <div style="max-width: 600px; margin:auto; background:white; border-radius:8px; padding:30px; text-align:center;">
       <h2 style="color:#28a745;">🎉 Congratulations! Your account is created</h2>
       <p>Your account has been successfully created on Vedant Asset.</p>
       <p><strong>User ID:</strong> ${getUser.user_inv_id}</p>
       <p>Please keep this information safe and do not share it with anyone.</p>
       <p>Thank you for joining us!</p>
       <p style="font-size:12px; color:#999; margin-top:20px;">© ${new Date().getFullYear()} Vedant Asset Limited. All rights reserved.</p>
     </div>
   </div>
 `;
 
     await sendEmail2(body.email, "Vedant Asset", "Welcome to Vedant Asset!", welcomeHtml);*/

    //calling decentro API when its partner and BC-

    if (getUser.userTypeId === 4) {
      try {
        const mobileToAccountReq = {
          mobile_number: user.mobile,
          investor_id: user.id,
        };
        console.log("userTypeId-", getUser.userTypeId);

        console.log("mobile_number-", mobileToAccountReq.mobile_number);
        console.log(" mobileToAccountReq.investor_id-", mobileToAccountReq.investor_id);

        console.log("Calling /log-mobile-to-account", mobileToAccountReq);

        const mobileToAccountResponse = await partnerMobileToAccount(
          mobileToAccountReq.mobile_number,
          mobileToAccountReq.investor_id
        );

        ///console.log("mobile-to-account response:", mobileToAccountResponse);
      } catch (apiErr) {
        console.log("Error calling mobile-to-account:", apiErr);
      }
    }

    if (getUser.userTypeId === 6) {
      try {
        const mobileToAccountReq = {
          mobile_number: user.mobile,
          investor_id: user.id,
        };
        console.log("userTypeId-", getUser.userTypeId);

        console.log("mobile_number-", mobileToAccountReq.mobile_number);
        console.log(" mobileToAccountReq.investor_id-", mobileToAccountReq.investor_id);

        console.log("Calling /log-mobile-to-account", mobileToAccountReq);

        const mobileToAccountResponse = await partnerMobileToAccount(
          mobileToAccountReq.mobile_number,
          mobileToAccountReq.investor_id
        );

        ///console.log("mobile-to-account response:", mobileToAccountResponse);
      } catch (apiErr) {
        console.log("Error calling mobile-to-account:", apiErr);
      }
    }




    sendEncryptedResponse(res, user, "Your OTP is verified successfully!!");
    authFailureLimiter.clearFailures(req);
  } catch (error) {
    console.log("Otp Verificatpon Error ====", error)
    await t.rollback();
    authFailureLimiter.recordFailure(req);
    ErrorLogger.write({ type: "register-otp error", error });
    serverError(res, error);
  }
});

router.post("/login-otp", authRateLimit, async (req: any, res: any) => {
  try {
    let body = req.body;
    console.log(body, "body");
    if (!body.userName) {
      throw other(res, "User Name can not be empty!");
    }
    let getUser: any = await getUserByEmailOrMobile(body.userName);
    getUser = JSON.parse(JSON.stringify(getUser));

    if (!getUser) {
      throw unauthorized(res, "Invalid user");
    }

    let user: any;

    if (getUser.isMobileOTPVerified) {
      let otp: any = generateRandomOTP();

      let payload = { loginOTP: otp };

      let upUser: any = await updateUser(payload, getUser.id);

      user = JSON.parse(JSON.stringify(upUser[1][0]));

      //send email
      // const mailData: any = {
      //   to: getUser.email.toLowerCase(),
      //   subject: "Register User OTP",
      //   html: `<div>
      //             Email : ${getUser.email.toLowerCase()}<br/><br/>
      //             OTP : ${otp} <br/><br/>
      //           </div>`,
      // };

      // sendEmail(mailData);

      let msg: any = `Register User OTP - ${otp} is the OTP for your transaction. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`;

      await SmsService.sendSmsUsingNimbus(getUser.mobile, msg);
    } else {
      // user = getUser
      // console.log(user, 'useruseruseruseruseruseruseruser')
      let mobileOTP: any = generateRandomOTP();

      //let emailOTP: any = generateRandomOTP();

      let payload = { ...getUser, mobileOTP: mobileOTP };
      await updateUser(payload, getUser.id);
      user = payload;

      //send email
      // const mailData: any = {
      //   to: getUser.email?.toLowerCase(),
      //   subject: "Register User OTP",
      //   html: `<div>
      //           Email : ${getUser.email.toLowerCase()}<br/><br/>
      //           Email - OTP : ${emailOTP} <br/><br/>
      //         </div>`,
      // };

      // sendEmail(mailData);

      let msg: any = `Register User OTP - ${mobileOTP} is the OTP for your transaction. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`;

      await SmsService.sendSmsUsingNimbus(getUser.mobile, msg);
    }

    sendEncryptedResponse(res, user, "Your OTP send successfully!!");
    authFailureLimiter.clearFailures(req);
  } catch (error) {
    console.log(error, "error");
    authFailureLimiter.recordFailure(req);
    ErrorLogger.write({ type: "login-otp error", error });
    serverError(res, error);
  }
});

router.post("/resend-otp", authRateLimit, async (req: any, res: any) => {
  try {
    let body = req.body;

    // let getUser: any = await getUserByEmail(body.email?.toLowerCase());
    let getUser: any = await getUserByEmailOrMobile(body.userName);
    getUser = JSON.parse(JSON.stringify(getUser));

    if (!getUser) {
      throw unauthorized(res, "Invalid user");
    }

    let user: any;

    if (body.isRegister) {
      let mobileOTP: any = generateRandomOTP();

      let emailOTP: any = generateRandomOTP();

      let payload = { emailOTP: emailOTP, mobileOTP: mobileOTP };

      /// update user
      let upUser: any = await updateUser(payload, getUser.id);
      user = JSON.parse(JSON.stringify(upUser[1][0]));

      //send email
      const mailData: any = {
        to: getUser.email?.toLowerCase(),
        subject: "Register User OTP",
        html: `<div>
                Email : ${getUser.email?.toLowerCase()}<br/><br/>
                Email - OTP : ${emailOTP} <br/><br/>
                Mobile - OTP : ${mobileOTP} <br/><br/>
              </div>`,
      };

      sendEmail(mailData);

      let msg: any = `Register User OTP - ${mobileOTP} is the OTP for your transaction. This is usable once & valid for 30 mins only. Please do not share with anyone. Vedant Asset Thank you`;
      await SmsService.sendSmsUsingNimbus(getUser.mobile, msg);
    } else {
      let otp: any = generateRandomOTP();

      let payload = { loginOTP: otp };

      let upUser: any = await updateUser(payload, getUser.id);

      user = JSON.parse(JSON.stringify(upUser[1][0]));

      //send email
      const mailData: any = {
        to: getUser.email.toLowerCase(),
        subject: "Register User OTP",
        html: `<div>
                  Email : ${getUser.email.toLowerCase()}<br/><br/>
                  OTP : ${otp} <br/><br/>
                </div>`,
      };

      sendEmail(mailData);
    }

    sendEncryptedResponse(res, user, "Your OTP send successfully!!");
    authFailureLimiter.clearFailures(req);
  } catch (error) {
    console.log(error, "errrorrrrrrrr");
    authFailureLimiter.recordFailure(req);
    ErrorLogger.write({ type: "resend-otp error", error });
    serverError(res, error);
  }
});

router.get("/getAllUserType", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    let allUserType: any = await getAllUserType();
    sendEncryptedResponse(res, allUserType, "Get all user types");
  } catch (error) {
    ErrorLogger.write({ type: "getAllUserType error", error });

    serverError(res, error);
  }
});

// Test endpoint to simulate failed login attempts
router.post("/test-failed-login", debugRateLimit, async (req, res) => {
  try {
    const { userName, attempts = 6 } = req.body;

    for (let i = 1; i <= attempts; i++) {
      const identifier = userName || `testuser${i}`;
      securityMonitor.trackFailedLogin(identifier, `192.168.1.${i}`, `Test Browser ${i}`, `Invalid credentials - attempt ${i}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    res.json({
      success: true,
      message: `Simulated ${attempts} failed login attempts for ${userName}`,
      currentAttemptCount: securityMonitor.getFailedCount(userName || 'testuser1'),
      securityAlertTriggered: attempts >= 5
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SIEM/Security Management endpoints
router.post("/siem/stats", debugRateLimit, async (_req, res) => {
  try {
    const stats = securityMonitor.getStats();
    sendEncryptedResponse(res, stats, "Security statistics retrieved successfully");
  } catch (error: any) {
    ErrorLogger.write({ type: "siem_stats_error", error });
    serverError(res, error);
  }
});

router.post("/siem/events", debugRateLimit, async (_req, res) => {
  try {
    const stats = securityMonitor.getStats();
    sendEncryptedResponse(res, stats, "Security events retrieved successfully");
  } catch (error: any) {
    ErrorLogger.write({ type: "siem_events_error", error });
    serverError(res, error);
  }
});

router.post("/siem/user-events", debugRateLimit, async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: "Identifier is required" });
    const data = { identifier, failedCount: securityMonitor.getFailedCount(identifier) };
    sendEncryptedResponse(res, data, "User security events retrieved successfully");
  } catch (error: any) {
    ErrorLogger.write({ type: "siem_user_events_error", error });
    serverError(res, error);
  }
});

router.post("/siem/clear-user", debugRateLimit, async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: "Identifier is required" });
    securityMonitor.clearFailedAttempts(identifier);
    sendEncryptedResponse(res, { success: true, message: `Events cleared for ${identifier}` }, "User security events cleared successfully");
  } catch (error: any) {
    ErrorLogger.write({ type: "siem_clear_user_error", error });
    serverError(res, error);
  }
});

router.post("/siem/test-email", debugRateLimit, async (req, res) => {
  try {
    const { testEmail } = req.body;
    if (!testEmail) return res.status(400).json({ error: "Test email is required" });
    securityMonitor.logSecurityEvent("TEST_EMAIL", "LOW", { testEmail, triggeredAt: new Date().toISOString() });
    sendEncryptedResponse(res, { success: true, message: "Test event logged" }, "Test email sent successfully");
  } catch (error: any) {
    ErrorLogger.write({ type: "siem_test_email_error", error });
    serverError(res, error);
  }
});

router.post("/siem/test-sms", debugRateLimit, async (req, res) => {
  try {
    const { testPhone } = req.body;
    if (!testPhone) return res.status(400).json({ error: "Test phone is required" });
    securityMonitor.logSecurityEvent("TEST_SMS", "LOW", { testPhone, triggeredAt: new Date().toISOString() });
    sendEncryptedResponse(res, { success: true, message: "Test event logged" }, "Test SMS sent successfully");
  } catch (error: any) {
    console.log('[SIEM] Test SMS error:', error.message);
    ErrorLogger.write({ type: "siem_test_sms_error", error });
    serverError(res, error);
  }
});

// Test endpoint to verify all logging systems
router.post("/test-all-logging", debugRateLimit, async (req, res) => {
  try {
    console.log('[TEST] Testing all logging systems...');
    
    // Test error logger
    ErrorLogger.write({ 
      type: "test_error", 
      message: "Testing error logger functionality",
      timestamp: new Date().toISOString(),
      test: true 
    });
    
    // Test info logger
    const InfoLogger = require('../db/core/logger/info-logger').default;
    InfoLogger.write({ 
      type: "test_info", 
      message: "Testing info logger functionality",
      timestamp: new Date().toISOString(),
      test: true 
    });
    
    // Test SMS/Email logger
    const SmsEmailLogger = require('../db/core/logger/sms-email-logger').default;
    SmsEmailLogger.logSms('9999999999', 'Test SMS message', true);
    SmsEmailLogger.logEmail('test@example.com', 'Test Email Subject', true);
    
    // Test SMS service
    await SmsService.sendSmsConsole('9999999999', 'Test SMS from logging test');
    
    console.log('[TEST] All logging tests completed');
    
    res.json({
      success: true,
      message: "All logging systems tested successfully",
      tests: [
        "Error logger - ✅",
        "Info logger - ✅", 
        "SMS/Email logger - ✅",
        "SMS service - ✅"
      ]
    });
    
  } catch (error: any) {
    console.log('[TEST] Error during logging test:', error.message);
    ErrorLogger.write({ 
      type: "logging_test_error", 
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint to force error logging
router.post("/test-error-logging", debugRateLimit, async (req, res) => {
  try {
    // Force an error to test logging
    throw new Error("Test error for logging verification");
  } catch (error: any) {
    console.log('[TEST] Forcing error log...');
    ErrorLogger.write({ 
      type: "test_error", 
      error: error.message,
      timestamp: new Date().toISOString(),
      test: true 
    });
    
    res.json({
      success: false,
      message: "Error logged successfully",
      error: error.message
    });
  }
});

// Simple test endpoint to verify standardized decryption
router.post("/test-standard-decrypt", debugRateLimit, async (req, res) => {
  try {
    const { standardDecrypt } = require('../utils/standardEncryption');
    
    // Test the exact cipher from your logs
    const testCipher = "U2FsdGVkX1#x2FzBHCfA7qf8li6JrP#x2F49vdqZRKeNZZbLI=";
    console.log('[TEST] Input cipher:', testCipher);
    
    const result = standardDecrypt(testCipher);
    console.log('[TEST] Decryption result:', result);
    
    res.json({
      input: testCipher,
      output: result,
      success: result !== testCipher
    });
  } catch (error: any) {
    console.log('[TEST] Error:', error?.message || error);
    res.status(500).json({ error: error?.message || error });
  }
});

// Temporary test endpoint for debugging PII decryption
router.post("/test-pii-decryption", debugRateLimit, async (req, res) => {
  try {
    console.log('[TEST] Request body:', JSON.stringify(req.body, null, 2));
    
    const { userName } = req.body;
    console.log('[TEST] userName received:', userName);
    
    // Import the standardized utility and config for testing
    const { standardDecrypt, decodeFromTransmission } = require('../utils/standardEncryption');
    const configs = require('../config/config');
    const environment = require('../environment');
    const config = (configs as { [key: string]: any })[environment];
    
    console.log('[TEST] Current environment:', environment);
    console.log('[TEST] Crypto key from config:', config.cryptoKey);
    
    // Manually test decryption
    if (userName && typeof userName === 'string') {
      console.log('[TEST] userName is string, length:', userName.length);
      console.log('[TEST] userName starts with U2FsdGVkX1:', userName.startsWith('U2FsdGVkX1'));
      console.log('[TEST] userName contains #x2:', userName.includes('#x2'));
      
      // Test URL decoding first
      let decodedCipher = userName;
      if (userName.includes('#x2')) {
        decodedCipher = userName
          .replace(/#x2F/g, '/')
          .replace(/#x2B/g, '+')
          .replace(/#x3D/g, '=')
          .replace(/#x2f/g, '/')
          .replace(/#x2b/g, '+')
          .replace(/#x3d/g, '=');
        console.log('[TEST] After URL decoding:', decodedCipher);
      }
      
      // Test manual CryptoJS decryption
      const CryptoJS = require('crypto-js');
      try {
        console.log('[TEST] Attempting manual CryptoJS decryption...');
        const bytes = CryptoJS.AES.decrypt(decodedCipher, config.cryptoKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        console.log('[TEST] Manual decryption result:', decrypted);
        console.log('[TEST] Manual decryption successful:', decrypted.length > 0);
      } catch (decryptError: any) {
        console.log('[TEST] Manual decryption failed:', decryptError.message);
      }
      
      // Test the standardized decryption
      try {
        const decrypted = standardDecrypt(userName);
        console.log('[TEST] Standard decryption result:', decrypted);
        console.log('[TEST] Standard decryption successful:', decrypted !== userName && decrypted.length > 0);
      } catch (decryptError: any) {
        console.log('[TEST] Standard decryption failed:', decryptError.message);
      }
    }
    
    res.json({
      success: true,
      userName: userName,
      userNameType: typeof userName,
      environment: environment,
      cryptoKey: config.cryptoKey,
      message: "PII decryption test completed"
    });
  } catch (error: any) {
    console.log('[TEST] Error:', error?.message || error);
    res.status(500).json({
      success: false,
      error: error?.message || error
    });
  }
});

// API to check user types for email/mobile
router.post("/check-user-types", authRateLimit, async (req, res) => {
  const { userName } = req.body;
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  try {
    if (!userName) {
      return other(res, "Username (email or mobile) is required");
    }

    console.log("username---------------------------", userName);

    const userTypes = await getUserTypesByEmailOrMobile(userName);

    console.log("userTypes----", userTypes);

    // User not found — track as failed login attempt (username enumeration / invalid user)
    if (!userTypes || userTypes.length === 0) {
      securityMonitor.trackFailedLogin(userName, ipAddress, userAgent, 'User not found');
      return other(res, "User not found");
    }

    // Successful lookup — clear any previous failed attempts for this identifier
    securityMonitor.clearFailedAttempts(userName);

    const response = {
      userTypesCount: userTypes.length,
      userTypes: userTypes.map((mapping: any) => ({
        id: mapping.UserType.id,
        userType: mapping.UserType.userType,
        init_path: mapping.UserType.init_path,
        userTypeId: mapping.userType_id,
        roleId: mapping.role_id,
      })),
    };

    sendEncryptedResponse(res, response, "User types retrieved successfully");
    authFailureLimiter.clearFailures(req);
  } catch (error: any) {
    const identifier = userName || 'unknown';
    securityMonitor.trackFailedLogin(identifier, ipAddress, userAgent, error?.message || String(error));
    authFailureLimiter.recordFailure(req);
    ErrorLogger.write({ type: "check-user-types error", error });
    serverError(res, error);
  }
});

// API to get back office users for dropdown
router.get("/getBackOfficeUsers", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    const backOfficeUsers = await getBackOfficeUsers();

    sendEncryptedResponse(
      res,
      backOfficeUsers,
      "Back office users retrieved successfully"
    );
  } catch (error) {
    ErrorLogger.write({ type: "getBackOfficeUsers error", error });
    serverError(res, error);
  }
});

//added by rakesh sinha on datedd 07-01-2026

router.get("/userByInvestorId/:investorId", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    let user = await getUserByInvestorId(req.params.investorId);
    sendEncryptedResponse(res, user, "got user by investor id");
    // sendEncryptedResponse(res,  user, "got user by id");
  } catch (error) {
    ErrorLogger.write({ type: "userByInvestorId error", error });
    serverError(res, error);
  }
});

//




//code writen by Aditya Gupta

module.exports = router;
