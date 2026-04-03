import { GoalPlanAlloc } from './goal_plan_alloc-model';
import express from "express";
import prosesjwt from "proses-jwt";
import { alreadyExist, other, serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import { addGoalPlanAllocData, addGoalPlanAllocLumpsum, addGoalPlanAllocSIP, addGoalPlanData, addGoalPlanUseAlloc, addGoalTypeData, checkGoalTypeName, deleteGoalPlan, deleteGoalPlanAllocData, deleteGoalPlanAllocLumpsum, deleteGoalPlanAllocSIP, deleteGoalPlanUserAllocData, deleteGoalplanData, findGoalPlanAlloc, findSuggestedSchemeList, findSuggestedSchemeWithoutIdList, getAllGoalPlanAllocationLumpsum, getAllGoalPlanAllocationSIP, getAllGoalPlanList, getAllGoalType, getCustomGoalType, getGoalPlanById, getGoalPlanDataById, getGoalPlanWiseSchemeData, getRiskCatWiseSchemeData, updateGoalPlanData, updateGoalTypeData } from "./goal-planning-handler";
let { tokenMiddleWare } = prosesjwt;
import dbInstance from "../../db/core/control-db";
import { MONTHS_IN_A_YEAR } from "../../utils/constant";
import { findInvestorRiskCategory, getRiskCategoryById } from "../risk-profile/risk-profile-handler";
import { getSubCategoryErrList } from "../scheme/scheme-handler";
import { getRoundOFValue, getRoundValue } from "../../utils/helper";
const router = express.Router();


//findAllRoles dropdown
router.get("/getAllGoalType", tokenMiddleWare, async (req, res) => {
    try {
        let allTypes: any = await getAllGoalType();
        sendEncryptedResponse(res, allTypes, "get GoalType");
    } catch (error) {
        ErrorLogger.write({ type: "getGoalType error", error });
        serverError(res, error);
    }
});


router.post("/addGoalPlanAllocData", tokenMiddleWare, async (req, res) => {
    let t = await dbInstance.transaction();

    try {

        let body = req.body;

        let goalPayload: any = {
            goal_name: body.goal_name,
            goal_icon: body.image
        }

        const nameData = await checkGoalTypeName(goalPayload);
        if (nameData) {
            throw alreadyExist(res, "Goal Name already exist");
        };

        let goalType: any = await addGoalTypeData(goalPayload, t);
        goalType = JSON.parse(JSON.stringify(goalType));

        let index = 0;
        let schemeA: any = body.schemeArr;

        while (index < schemeA.length) {

            const scheme = schemeA[index];

            let j = 0;
            while (j < scheme.selectedScheme.length) {

                let schePayload = {
                    goal_id: goalType.id,
                    risk_category_id: scheme.riskCategoryId,
                    scheme_cate_id: scheme.selectedScheme[j].schemeCategoryId,
                    scheme_subcate_id: scheme.selectedScheme[j].schemeSubCategoryId,
                    scheme_id: scheme.selectedScheme[j].schemeId,
                    weightage: scheme.selectedScheme[j].weightage,
                }

                await addGoalPlanAllocData(schePayload, t);
                j++;
            }
            index++;
        }

        await t.commit();
        sendEncryptedResponse(res, goalType, "get GoalType");
    } catch (error) {
        await t.rollback();
        ErrorLogger.write({ type: "getGoalType error", error });
        serverError(res, error);
    }
});

router.put("/updateGoalPlan/:id", tokenMiddleWare, async (req: any, res: any) => {
    let t = await dbInstance.transaction();
    try {

        let body = req.body;

        let goalPayload: any = {
            goal_name: body.goal_name,
            goal_icon: body.image
        }

        const nameData = await checkGoalTypeName(goalPayload, req.params);
        if (nameData) {
            throw alreadyExist(res, "Goal Name already exist");
        };

        let goalType: any = await updateGoalTypeData(goalPayload, req.params, t);
        goalType = JSON.parse(JSON.stringify(goalType));

        let goalPlanAlloc: any = await findGoalPlanAlloc(req.params);
        goalPlanAlloc = JSON.parse(JSON.stringify(goalPlanAlloc))

        let goalAllocIds: any = []

        for (let data of goalPlanAlloc) {
            goalAllocIds.push(data.id);
        }

        await deleteGoalPlanAllocData(goalAllocIds, t);

        let index = 0;
        let schemeA: any = body.schemeArr;

        while (index < schemeA.length) {

            const scheme = schemeA[index];

            let j = 0;
            while (j < scheme.selectedScheme.length) {

                let schePayload = {
                    goal_id: req.params.id,
                    risk_category_id: scheme.riskCategoryId,
                    scheme_cate_id: scheme.selectedScheme[j].schemeCategoryId,
                    scheme_subcate_id: scheme.selectedScheme[j].schemeSubCategoryId,
                    scheme_id: scheme.selectedScheme[j].schemeId,
                    weightage: scheme.selectedScheme[j].weightage,
                }

                await addGoalPlanAllocData(schePayload, t);
                j++;
            }
            index++;
        }

        await t.commit();
        sendEncryptedResponse(res, goalType, "update GoalType");


    } catch (error) {
        await t.rollback();
        ErrorLogger.write({ type: "getGoalType error", error });
        serverError(res, error);
    }
})

router.delete("/deleteGoalPlan/:id", tokenMiddleWare, async (req: any, res: any) => {
    let t = await dbInstance.transaction();

    try {

        let goalPlanAlloc: any = await findGoalPlanAlloc(req.params);
        goalPlanAlloc = JSON.parse(JSON.stringify(goalPlanAlloc))

        let goalAllocIds: any = []

        for (let data of goalPlanAlloc) {
            goalAllocIds.push(data.id);
        }

        await deleteGoalPlanAllocData(goalAllocIds, t);

        let goalType: any = await deleteGoalPlan(req.params, t);

        await t.commit();
        sendEncryptedResponse(res, goalType, "delet GoalType");

    } catch (error) {
        await t.rollback();
        ErrorLogger.write({ type: "deleteGoalPlan error", error });
        serverError(res, error);
    }
})

router.post("/calculator/goal", async (req: any, res: any) => {
    try {

        /**
  *    
   FV = Future Value
   PV = Present Value
   r = Rate of interest
   t = Number of years
  * 
  */

        const result: any = {
            lumpsum_calculated_value: 0,
            sip_calculated_value: 0,
            profile_risk_category_id: null,
            profile_risk_category_name: null,
            goal_risk_category_id: null,
            goal_risk_category_name: null,
            goal_projected_value: null,
            goal_sip_projected_value: null,
            err_perc: 0,
        };


        function checkNegative(num: any) {
            return num < 0 ? 0 : num;
        }

        //input values
        //investor_id
        //months
        //target_amount
        //risk_category_id

        const body = req.body;

        const month = body?.months;
        const risk_category_id = body?.risk_category_id;

        let no_of_year = month / MONTHS_IN_A_YEAR;
        let target_amount = body?.target_amount;
        let rate_of_interest = 0;

        //profile_risk
        let riskCategoryData: any = {};


        if (risk_category_id) {

            riskCategoryData = await getRiskCategoryById({ id: risk_category_id });

            if (riskCategoryData) {
                result.goal_risk_category_id =
                    riskCategoryData?.id;
                result.goal_risk_category_name = riskCategoryData?.risk_type;
            }
        }

        if (body?.user_id) {
            let investorRiskCategory = await findInvestorRiskCategory(body.user_id);

            if (
                investorRiskCategory?.riskProfileId ==
                riskCategoryData?.id
            ) {
                result.profile_risk_category_id = riskCategoryData?.id;
                result.profile_risk_category_name = riskCategoryData?.risk_type;
            }
        }

        let findCustomGoal: any = await getCustomGoalType();
        findCustomGoal = JSON.parse(JSON.stringify(findCustomGoal));

        ////   getGoalPlanAllocList
        let parse_risk_array: any = await getRiskCatWiseSchemeData({ id: risk_category_id, goal_type_id: body.goal_type_id })
        parse_risk_array = JSON.parse(JSON.stringify(parse_risk_array));


        if (!parse_risk_array.length) {
            let risk_arr = await getRiskCatWiseSchemeData({ id: risk_category_id, goal_type_id: findCustomGoal.id })
            parse_risk_array = JSON.parse(JSON.stringify(risk_arr));
        }

        // console.log(parse_risk_array,"parse_risk_array")

        let SubcategoryErr = await getSubCategoryErrList();
        let Subcategory_errList = JSON.parse(JSON.stringify(SubcategoryErr));

        let mapped_mfrisk: any = [];
        let indexs = 0;

        while (indexs < parse_risk_array.length) {

            let err_value = Subcategory_errList.filter(
                (err: any) => err.subcategory_id == parse_risk_array[indexs]?.scheme_subcate_id
            );

            let err_percentage =
                Number(((parse_risk_array[indexs]?.weightage / 100) * err_value?.[0]?.err_perc).toFixed(2));

            mapped_mfrisk.push({
                ...parse_risk_array[indexs],
                err_value: err_value ? err_value?.[0]?.err_perc : 12,
                err_percentage: err_percentage || 12,
            });

            indexs++;
        }

        const totalErrPercentage = mapped_mfrisk.reduce(
            (sum: any, item: any) => sum + (item.err_percentage || 0),
            0
        );

        //goal_risk
        if (month) {
            const where = {};
            let months = 0;
            if (month <= 6) {
                months = 6;
            } else if (month >= 360) {
                months = 359;
            } else {
                months = month;
            }
            result.err_perc = totalErrPercentage;
            rate_of_interest = totalErrPercentage;
        }


        let final_target_amount = target_amount;

        if (req.body.inflation_rate) {
            let inflation_perc = Number(req.body.inflation_rate);

            final_target_amount =
                target_amount * Math.pow(1 + inflation_perc / 100, no_of_year);
        }

        let resultsValue = await getValuesForGoalPlanning(final_target_amount, rate_of_interest, no_of_year, month);


        result.lumpsum_calculated_value = resultsValue.lumpsum_calculated_value
        result.sip_calculated_value = resultsValue.sip_calculated_value
        result.goal_sip_projected_value = resultsValue.goal_sip_projected_value
        result.goal_projected_value = resultsValue.goal_lumpsum_projected_value

        //get schemes collection
        let schemesList: any = [];
        let index = 0;
        let allocated_amount = 0;
        let balance_amount = 0,
            balance_lumpsum_amt = 0,
            lumpsum_alloc_amount = 0;
        let allocation_percentage_total = 0;
        let schemesMFAllocation: any = [];


        while (index < mapped_mfrisk.length) {
            //alloc_perc
            if (mapped_mfrisk[index]?.SchemeMaster) {

                let ParsedScheme = mapped_mfrisk[index];

                let uniquescheme = ParsedScheme;

                //get total allocated amount
                // if mapped_mfrisk.length == 1
                if (mapped_mfrisk.length == 1) {
                    // then set amount == sip_amount
                    uniquescheme.sip_amount = resultsValue?.sip_calculated_value;
                    uniquescheme.lumpsum_amount = resultsValue?.lumpsum_calculated_value;
                } else if (
                    resultsValue?.sip_calculated_value - allocated_amount < 1000 ||
                    index == mapped_mfrisk.length - 1
                ) {
                    //if the (sipcalculated_value - allocated amount) < 1000
                    //simply set balance amount to the current scheme.
                    balance_amount = resultsValue?.sip_calculated_value - allocated_amount;

                    //////////////////////////////   bse_sip_params  calculation pending    //////////////////////////////////         



                    // //if the balance amount >= sip_min_inv amount
                    // let sipObj = uniquescheme?.bse_sip_params.filter((sip) => {
                    //   if (
                    //     !sip.scheme_bseCode.match("/*-L1/") &&
                    //     sip.frequency.toLowerCase() == "monthly" &&
                    //     sip.min_installment_amount <= balance_amount
                    //   ) {
                    //     return sip;
                    //   }
                    // });

                    // if (sipObj.length) {
                    //   //then set balance amount to the current scheme
                    //   //else add this amount to the scheme with highest priority.
                    //   uniquescheme.sip_amount = balance_amount;

                    //   uniquescheme.bse_sip_params = sipObj
                    //   // uniquescheme.lumpsum_amount = balance_lumpsum_amt;
                    // } else {
                    //   if(schemesList.length){
                    //     schemesList[0].sip_amount += balance_amount;
                    //   }
                    //   // schemesList[0].lumpsum_amount += balance_lumpsum_amt;
                    // }

                    uniquescheme.sip_amount = balance_amount;
                    // schemesList[0].sip_amount += balance_amount;

                    allocated_amount += balance_amount;


                } else if (index == 0 || resultsValue?.sip_calculated_value != allocated_amount) {
                    //if index == 0 or sipcalculated_value!= allocated_amount
                    ////calculate amt based on %age

                    uniquescheme.sip_amount = getRoundOFValue(
                        (resultsValue?.sip_calculated_value * uniquescheme.weightage) / 100,
                        500,
                        50
                    );
                    allocated_amount += uniquescheme.sip_amount;
                }

                if (index != mapped_mfrisk.length - 1) {

                    let lumpsumValue = getRoundOFValue(
                        (
                            (resultsValue?.lumpsum_calculated_value * uniquescheme.weightage) /
                            100
                        ).toFixed(0),
                        500,
                        50
                    );

                    uniquescheme.lumpsum_amount = checkNegative(lumpsumValue);
                    lumpsum_alloc_amount += uniquescheme?.lumpsum_amount;
                    allocation_percentage_total += Number(uniquescheme.weightage);

                } else {
                    let lumpsumValue = resultsValue?.lumpsum_calculated_value - lumpsum_alloc_amount;
                    uniquescheme.lumpsum_amount = checkNegative(lumpsumValue);
                }

                //   //if min
                if (uniquescheme?.sip_amount && uniquescheme?.sip_amount < 1000) {

                    let body: any = {
                        subcategory_id: uniquescheme.scheme_subcate_id
                    }

                    let scheme = await findSuggestedSchemeList(body);
                    scheme = JSON.parse(JSON.stringify(scheme));

                    let alternatescheme = scheme[0];

                    uniquescheme.scheme_id = alternatescheme.id
                    uniquescheme.SchemeMaster = alternatescheme
                }

                if (!uniquescheme?.sip_amount) {
                    uniquescheme.sip_amount = 0
                }

                schemesList.push(uniquescheme);

                schemesMFAllocation.push({
                    Id: uniquescheme?.SchemeSubcategory?.Id,
                    Name: uniquescheme?.SchemeSubcategory?.Name,
                    scheme_cate_id: uniquescheme?.SchemeCategory?.ID,
                    categoryName: uniquescheme?.SchemeCategory?.Name,
                    weightage: uniquescheme.weightage,
                    scheme_id: uniquescheme?.scheme_id
                });
            }

            index++;
        } //while (index < mapped_mfrisk.length)


        result.schemesList = schemesList;
        result.allocArr = schemesMFAllocation;

        sendEncryptedResponse(res, result, "get Data");


    } catch (error) {
        ErrorLogger.write({ type: "calculator/goal error", error });
        serverError(res, error);
    }
})


///use this method to get the projected values for Goal Planning
//final_target_amount, r, t
export const getValuesForGoalPlanning = async (target_amount: any,
    err_percentage: any, durationInMonths: any, month: any) => {

    let result = {
        lumpsum_calculated_value: 0,
        sip_calculated_value: 0,
        goal_sip_projected_value: 0,
        goal_lumpsum_projected_value: 0,
    };
    //lumpsum
    const numerator_lum = target_amount;
    const denominator_lum = Math.pow(1 + err_percentage / 100, durationInMonths);
    let lumpsum_value = numerator_lum / denominator_lum;

    // result.lumpsum_calculated_value = getRoundOFValue(
    //   Math.round(lumpsum_value / 100) * 100,
    //   500,
    //   50
    // );
    result.lumpsum_calculated_value = getRoundValue(
        Math.round(lumpsum_value / 100) * 100,
        500
    );

    //sip
    //APR/100
    //1+APR/100
    const return_rate = 1 + err_percentage / 100;

    //1+APR/100^1/n
    const positive_power = Math.pow(return_rate, 1 / MONTHS_IN_A_YEAR);

    //1+APR/100^-(1/n)
    const negative_power = Math.pow(return_rate, -(1 / MONTHS_IN_A_YEAR));

    //(1+APR/100^1/n)-1
    const numerator_sip =
        target_amount * (positive_power - 1) * negative_power;

    const denominator_sip = Math.pow(positive_power, durationInMonths * MONTHS_IN_A_YEAR) - 1;

    const sip_value = numerator_sip / denominator_sip;

    let sipcalculated_value;
    //if sip value is less than 50 ex:1001 ,1002, 1050 consider 1000
    // if value is greater than 50 ex : 1051 , 1151 , 1330 consider 1500
    // sipcalculated_value = getRoundOFValue(Math.round(sip_value, 4), 500, 50);
    sipcalculated_value = getRoundValue(Math.round(sip_value), 500);
    result.sip_calculated_value = sipcalculated_value;

    //calculate projected value
    //lumpum projected value
    let ratesPerYear = err_percentage / 100;

    let totalLumpsumProjectedAmount = Math.round(
        result?.lumpsum_calculated_value * Math.pow(1 + ratesPerYear / 1, 1 * durationInMonths)
    );

    let ratesPerMonth = err_percentage / MONTHS_IN_A_YEAR / 100;

    let totalSIPProjectedAmount = Math.round(
        (result?.sip_calculated_value * (Math.pow(1 + ratesPerMonth, month) - 1)) /
        ratesPerMonth
    );

    // result.goal_sip_projected_value = getRoundOFValue(
    //   totalSIPProjectedAmount,
    //   500,
    //   50
    // );
    result.goal_sip_projected_value = getRoundValue(
        totalSIPProjectedAmount,
        500
    );

    // result.goal_lumpsum_projected_value = getRoundOFValue(
    //   totalLumpsumProjectedAmount,
    //   500,
    //   50
    // );
    result.goal_lumpsum_projected_value = getRoundValue(
        totalLumpsumProjectedAmount,
        500
    );

    return result
};



router.post("/suggested-subcategory-schemes", tokenMiddleWare, async (req: any, res: any) => {
    try {

        if (!req.body.subcategory_id) {
            throw other(res, "Sub Category Id Not Found!");
        }

        let findData = await findSuggestedSchemeWithoutIdList(req.body);
        sendEncryptedResponse(res, findData, "get Data");

    } catch (error) {
        ErrorLogger.write({ type: "suggested-subcategory-schemes error", error });
        serverError(res, error);
    }
})


router.post("/addGoalPlanData", tokenMiddleWare, async (req: any, res: any) => {
    let t = await dbInstance.transaction();

    try {

        const user_id = req?.user?.id;

        let body = { ...req.body, user_id: user_id };

        if (body?.isExecuteNow) {
            body = { ...body, goal_exec_date: new Date() };
        }

        let { suggested_scheme, ...rest } = body;

        let plans = await addGoalPlanData(rest, t);

        let modifiedArr = suggested_scheme.map((scheme: any) => {
            return { ...scheme, goal_plan_id: plans?.id };
        });

        let scheme_list;
        if (rest.investment_type == "sip") {
            scheme_list = await addGoalPlanAllocSIP(modifiedArr, t);
        }

        if (rest.investment_type == "lumpsum") {
            scheme_list = await addGoalPlanAllocLumpsum(modifiedArr, t);
        }

        let addData = { plans, scheme_list }

        await t.commit();
        sendEncryptedResponse(res, addData, "Goal Plan Created Successfully");

    } catch (error) {
        await t.rollback();
        ErrorLogger.write({ type: "addGoalPlanData error", error });
        serverError(res, error);
    }
})

router.post("/add-user-alloc", tokenMiddleWare, async (req: any, res: any) => {
    let t = await dbInstance.transaction();

    try {

        let body = req.body;

        if (body?.goal_plan_id) {
            await deleteGoalPlanUserAllocData(body?.goal_plan_id, t);
        }

        let plans = await addGoalPlanUseAlloc(body.allocationList, t);

        await t.commit();
        sendEncryptedResponse(res, plans, "Set Goal Plans Allocation Successfully");
    } catch (error) {
        await t.rollback();
        ErrorLogger.write({ type: "add-user-alloc error", error });
        serverError(res, error);
    }
})

router.get("/getAllGoalPalnList", tokenMiddleWare, async (req: any, res: any) => {
    try {

        const user_id = req?.user?.id;

        let allPlan: any = await getAllGoalPlanList(user_id);
        allPlan = JSON.parse(JSON.stringify(allPlan));

        const onGoingGoalDetails = [];
        const completedGoalDetails = [];

        if (allPlan.length) {
            let goal_index = 0
            while (allPlan.length > goal_index) {

                //   let transaction = await InvestorTransaction.findAll({
                //     where : {goal_id : allPlan?.[goal_index].goal_plan_id}
                //   })




                let goal = allPlan[goal_index]
                //   let parsedTransaction = JSON.parse(JSON.stringify(transaction))
                //   if(transaction.length){
                //     let totalAlloc = {
                //       Invested : 0,
                //       Current : 0,
                //       transaction_month : transaction.length
                //     }

                //     let allocationArr = []
                //     for(let data of goal?.goal_plans_allocs){
                //         let filtredScheme = parsedTransaction.filter(sch => sch?.scheme_id == data?.scheme_id)
                //         if(filtredScheme?.length){
                //           let selectedScheme = filtredScheme[0]
                //           allocationArr.push({...data, 
                //             folio_no :selectedScheme?.folio_no,
                //             units :selectedScheme?.units,
                //             nav :selectedScheme?.nav,
                //             amount :selectedScheme?.amount,
                //             })
                //             totalAlloc = {...totalAlloc, 
                //               Invested : totalAlloc.Invested + selectedScheme?.amount,
                //               Current : totalAlloc.Current + (selectedScheme?.units * selectedScheme?.nav)
                //             }
                //         }else{
                //           allocationArr.push(data)
                //         }
                //         goal = {...goal, goal_plans_allocs : allocationArr , totalAlloc}
                //     }

                //   }else{
                let totalAlloc = {
                    Invested: 0,
                    Current: 0,
                    transaction_month: 0
                }
                goal = { ...goal, totalAlloc }

                //   }

                if (goal?.target_amt <= goal?.totalAlloc?.Current) {
                    completedGoalDetails.push(goal);
                } else {
                    onGoingGoalDetails.push(goal);
                }
                goal_index++
            }
        }

        let data = { onGoingGoalDetails, completedGoalDetails };

        sendEncryptedResponse(res, data, "Getting Goal Plans Successfully");

    } catch (error) {
        ErrorLogger.write({ type: "getAllGoalPalnList error", error });
        serverError(res, error);
    }
})


router.put("/updateGoalPlanData/:id", tokenMiddleWare, async (req: any, res: any) => {
    let t = await dbInstance.transaction();

    try {

        if (!req.params.id) {
            throw other(res, "Goal plan id not found!")
        }

        const user_id = req?.user?.id;

        let body = { ...req.body, user_id: user_id };

        if (body?.isExecuteNow) {
            body = { ...body, goal_exec_date: new Date() };
        }

        let { suggested_scheme, ...rest } = body;

        if (!suggested_scheme?.length) {
            throw other(res, "suggested Scheme Not Found!")
        }

        let passObj = {
            user_id: user_id, goal_plan_id: req.params.id
        }

        let findPlan: any = await getGoalPlanById(passObj, t);

        if (!findPlan) {
            throw other(res, "Goal plan not Found!");
        }

        let updateObj = {
            user_id: user_id,
            goal_plan_id: req.params.id,
            rest: rest
        }

        let updatedplans = await updateGoalPlanData(updateObj, t);

        let findGoalPlan: any = await getGoalPlanById(passObj, t);
        findGoalPlan = JSON.parse(JSON.stringify(findGoalPlan));


        //delete exsiting data
        await deleteGoalPlanAllocSIP(findGoalPlan?.id, t);

        await deleteGoalPlanAllocLumpsum(findGoalPlan?.id, t);

        let modifiedArr = suggested_scheme?.map((scheme: any) => {
            return { ...scheme, goal_plan_id: findGoalPlan?.id };
        });

        let scheme_list;

        if (rest.investment_type == "sip") {
            scheme_list = await addGoalPlanAllocSIP(modifiedArr, t);
        }

        if (rest.investment_type == "lumpsum") {
            scheme_list = await addGoalPlanAllocLumpsum(modifiedArr, t);
        }

        let updateData = { findGoalPlan, scheme_list }

        await t.commit();
        sendEncryptedResponse(res, updateData, "Goal Plan Updated Successfully");

    } catch (error) {
        await t.rollback();
        ErrorLogger.write({ type: "updateGoalPlanData error", error });
        serverError(res, error);
    }
})

router.get("/getGoalPlanWiseSchemeData/:id", tokenMiddleWare, async (req: any, res: any) => {
    try {

        let planData: any = await getGoalPlanWiseSchemeData(req.params);
        planData = JSON.parse(JSON.stringify(planData));

        let schemeList: any = [];
        let tempArr: any = [];

        for (let data of planData) {
            tempArr.push({
                Id: data?.SchemeSubcategory?.Id,
                Name: data?.SchemeSubcategory?.Name,
                scheme_cate_id: data?.SchemeCategory?.ID,
                categoryName: data?.SchemeCategory?.Name,
                weightage: data.weightage,
                scheme_id: data?.scheme_id
            })
        }
        for (let item of planData) {
            schemeList.push({
                ...item,
                sip_amount: item?.GoalPlan?.GoalPlanAllocationSIP ? item?.GoalPlan?.GoalPlanAllocationSIP?.sip_amount : 0,
                lumpsum_amount: item?.GoalPlan?.GoalPlanAllocationLumpsum ? item?.GoalPlan?.GoalPlanAllocationLumpsum?.lumpsum_amount : 0,
            })
        }

        let finalresult: any = {
            schemeList: schemeList,
            allocArr: tempArr,
        }

        sendEncryptedResponse(res, finalresult, "get Scheme");

    } catch (error) {
        ErrorLogger.write({ type: "getGoalPlanWiseSchemeData error", error });
        serverError(res, error);
    }
})

router.delete("/deleteGoalPlanData/:id", tokenMiddleWare, async (req: any, res: any) => {
    let t = await dbInstance.transaction();
    try {

        const user_id = req.user.id;

        let body = {
            user_id: user_id,
            goal_plan_id: req.params.id,
        }

        let plans = await getGoalPlanById(body, t)

        if (!plans) {
            throw other(res, "Goal Plans not found!");
        }

        await deleteGoalPlanUserAllocData(plans.id, t);
        await deleteGoalPlanAllocSIP(plans.id, t);
        await deleteGoalPlanAllocLumpsum(plans.id, t);


        let goalplans = await deleteGoalplanData(body, t);

        await t.commit();
        sendEncryptedResponse(res, goalplans, "Goal Plan Deleted Successfully",);


    } catch (error) {
        await t.rollback();
        ErrorLogger.write({ type: "deleteGoalPlanData error", error });
        serverError(res, error);
    }
})

router.get("/getGoalPlanData/:id", tokenMiddleWare, async (req: any, res: any) => {
    try {

        let goal: any = await getGoalPlanDataById(req.params);
        goal = JSON.parse(JSON.stringify(goal));

        if (!goal) {
            throw other(res, "Goal Planning Not Found!")
        }

        let transaction: any = [];

        if (transaction.length) {

            let totalAlloc = {
                Invested: 0,
                Current: 0
            }

            let allocationArr = []
            // for (let data of result?.GoalPlanUserAllocs) {
            //     // let filtredScheme = parsedTransaction.filter(sch => sch?.scheme_id == data?.scheme_id)
            //     if (filtredScheme?.length) {
            //         let selectedScheme = filtredScheme[0]
            //         allocationArr.push({
            //             ...data,
            //             folio_no: selectedScheme?.folio_no,
            //             units: selectedScheme?.units,
            //             nav: selectedScheme?.nav,
            //             amount: selectedScheme?.amount,
            //         })
            //         totalAlloc = {
            //             ...totalAlloc,
            //             Invested: totalAlloc.Invested + selectedScheme?.amount,
            //             Current: totalAlloc.Current + (selectedScheme?.units * selectedScheme?.nav)
            //         }
            //     } else {
            //         allocationArr.push(data)
            //     }
            //     goal = { ...goal, goal_plans_allocs: allocationArr, totalAlloc }
            // }

        }

        let schemeList: any = [];
        let lumpsumScheme = await getAllGoalPlanAllocationLumpsum(req.params.id);
        lumpsumScheme = JSON.parse(JSON.stringify(lumpsumScheme))
        if (lumpsumScheme) {
            schemeList = [...schemeList, ...lumpsumScheme]
        }

        let sipScheme = await getAllGoalPlanAllocationSIP(req.params.id);
        sipScheme = JSON.parse(JSON.stringify(sipScheme))

        if (sipScheme) {
            schemeList = [...schemeList, ...sipScheme]
        }

        let data = { goal, schemeList }

        sendEncryptedResponse(res, data, "get GoalPlanData");

    } catch (error) {
        ErrorLogger.write({ type: "getGoalPlanData error", error });
        serverError(res, error);
    }
})


module.exports = router;
