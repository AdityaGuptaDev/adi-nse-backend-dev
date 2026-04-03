import express from "express";
import prosesjwt from "proses-jwt";
import { alreadyExist, serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import { addBulkUserProfileDetail, addUserRiskProfile, deleteUserProfileDetail, getAllRiskCategory, getAllRiskQuestion, getRiskCategoryById, getRiskCategoryByTotalPoint, getRiskProfileInvestorByUserId, getUserRiskProfileById, updateUserRiskProfile } from "./risk-profile-handler";
let { tokenMiddleWare } = prosesjwt;
import dbInstance from "../../db/core/control-db";
import { questionType } from "../../utils/constant";
const router = express.Router();

//findAll dropdown
router.get("/getAllRiskQuestion", tokenMiddleWare, async (req, res) => {
    try {

        let allQuestion: any = await getAllRiskQuestion();
        sendEncryptedResponse(res, allQuestion, "get AllQuestion");

    } catch (error) {
        ErrorLogger.write({ type: "getAllRiskQuestion error", error });
        serverError(res, error);
    }
});


//post api
router.post("/add-question-answer",
    tokenMiddleWare,
    async (req: any, res: any) => {
        let t = await dbInstance.transaction();

        try {

            let data = req.body;
            let userId = req.user.id;

            const findOptionlQue = data?.answerList.filter((item: any) => {
                return item.queType == questionType.optional;
            });
            const findInputQue = data?.answerList.filter((item: any) => {
                return item.queType == questionType.input;
            });
            const findRangeQue = data?.answerList.filter((item: any) => {
                return item.queType == questionType.range;
            });

            const optionlPoints = findOptionlQue?.reduce(
                (n: any, { point }: any) => n + Number(point),
                0
            );
            const inputPoints = findInputQue?.reduce((n: any, { point }: any) => n + Number(point), 0);
            const rangePoints = findRangeQue?.reduce((n: any, { point }: any) => n + Number(point), 0);

            let totalPoints: any =
                optionlPoints +
                inputPoints +
                rangePoints;

            let getRiskCategory: any = await getRiskCategoryByTotalPoint(totalPoints);
            getRiskCategory = JSON.parse(JSON.stringify(getRiskCategory));

            const obj = {
                userId: userId,
                totalPoints,
                riskProfileId: getRiskCategory.id,
            };



            let userRiskProfile = await getUserRiskProfileById(userId);
            let userRiskProfileData: any = {};


            if (userRiskProfile) {
                // If user already has a risk profile, update it
                userRiskProfileData = await updateUserRiskProfile(obj, userId, t);

                userRiskProfileData = userRiskProfileData[1][0]
                // await updateInvestorRegistration(getRiskCategory.id, userId, t);


                // Update UserRiskProfileDetail
                const answer = data?.answerList.map((item: any) => {
                    return { ...item, userId: userId };
                });
                ;
                await deleteUserProfileDetail(userId, t);

                await addBulkUserProfileDetail(answer, t);

            } else {

                // If user does not have a risk profile, create it

                userRiskProfileData = await addUserRiskProfile(obj, t);
                // await updateInvestorRegistration(getRiskCategory.id, userId, t);

                const answer = data?.answerList.map((item: any) => {
                    return { ...item, userId: userId };
                });

                await addBulkUserProfileDetail(answer, t);
            }
            const responseObj = {
                totalPoints,
                porfile: getRiskCategory?.risk_type,
                risk_desc: getRiskCategory?.risk_desc,
                userRiskProfileData: JSON.parse(JSON.stringify(userRiskProfileData))
            };

            await t.commit();

            sendEncryptedResponse(res, responseObj, "Answers submitted successfully!");
        } catch (error) {
            await t.rollback();
            ErrorLogger.write({ type: "add-question-answer error", error });
            serverError(res, error);
        }
    });

//findAll dropdown
router.get("/get-risk-profile-investor", tokenMiddleWare, async (req: any, res) => {
    try {

        let userId = req.user.id;
        let data: any = await getRiskProfileInvestorByUserId(userId);
        sendEncryptedResponse(res, data, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-risk-profile-investor error", error });
        serverError(res, error);
    }
});

//find by id
router.get("/get-risk-category-id/:id", tokenMiddleWare, async (req: any, res) => {
    try {

        let data: any = await getRiskCategoryById(req.params);
        sendEncryptedResponse(res, data, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-risk-profile-investor error", error });
        serverError(res, error);
    }
});

//find by id
router.get("/get-allrisk-category", tokenMiddleWare, async (req: any, res) => {
    try {

        let data: any = await getAllRiskCategory();
        sendEncryptedResponse(res, data, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-allrisk-category error", error });
        serverError(res, error);
    }
});

module.exports = router;
