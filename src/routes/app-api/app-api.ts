import express from "express";

import prosesjwt from "proses-jwt";
import {
    alreadyExist,
    other,
    serverError,
    unauthorized
} from "proses-response";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import ErrorLogger from "../../db/core/logger/error-logger";
import { checkPassword, getRefData, getUserByEmail, getUserByFindEmail, getUserByFindEmailOrMobile, getUserMapping, updateUser } from "../user/user-handler";
import { findAdminFilterForInvester } from "../scheme/fundpicker-handler";
import { ROLE, USER_TYPE } from "../../utils/constant";
import { getUserTypeFromID } from "../../utils/helper";
let { tokenMiddleWare, generateToken } = prosesjwt;
import { authRateLimit, authFailureLimiter } from "../../middlewares/rateLimit";

const router = express.Router();



//login endpoint
router.post("/app-login", authRateLimit, async (req, res) => {
    try {
        const { userName, password, fcmToken, deviceId, loginOTP } = req.body;
        let user: any = await getUserByFindEmailOrMobile(userName);
        // user = JSON.parse(JSON.stringify(user));

        let findFilterData: any = await findAdminFilterForInvester();
        findFilterData = JSON.parse(JSON.stringify(findFilterData));

        // check weather user exist or not
        if (!user) {
            throw unauthorized(res, "Invalid credentials");
        }

        let data: any;

        if (!user.isEmailOTPVerified && !user.isMobileOTPVerified) {
            data = {
                user: user,
            };

        } else {

            // compare pwd
            if (password && !loginOTP) {
                if (!checkPassword(password, user.password)) {
                    throw unauthorized(res, "Invalid Credentials");
                }
            }

            if (loginOTP) {
                if (user.loginOTP !== loginOTP) {
                    throw other(res, "Invalid OTP")
                }
            }
            let userTypeData = await getUserMapping(user.id, USER_TYPE.InvestorRegistration);
            console.log(userTypeData, "userTypeDatauserTypeDatauserTypeData");

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
                email: user.email.toLowerCase(),
                mobile: user.mobile,
                roleId: user.roleId,
                userTypeData: meta,
            };

            //token
            const token = generateToken(result);

            const { password: p, ...plainUser } = user?.get({ plain: true });

            let obj = {
                fcmToken: fcmToken,
                deviceId: deviceId,
            };
            await updateUser(obj, user?.id); //update fcmToken

            data = {
                token,
                user: user,
                meta,
                findFilterData: findFilterData,
            };

        }



        sendEncryptedResponse(res, data, "login successfully");
        authFailureLimiter.clearFailures(req);
    } catch (error) {
        authFailureLimiter.recordFailure(req);
        ErrorLogger.write({ type: "login error", error });
        serverError(res, error);
    }
});


module.exports = router;