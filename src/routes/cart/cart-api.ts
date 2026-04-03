import express from "express";
import prosesjwt from "proses-jwt";
import { alreadyExist, other, serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
let { tokenMiddleWare } = prosesjwt;
import dbInstance from "../../db/core/control-db";
import { questionType } from "../../utils/constant";
import { addInvestorCartData, deleteInvestorCartItem, deleteInvestorMultiCartItem, findCartDataCount, findInvestorCartData, getAllInvestorCartData } from "./cart-handler";
import { Op } from "sequelize";
import { getUserByFindEmail } from "../user/user-handler";
const router = express.Router();


//find by id
router.post("/addfundExploreCardData", tokenMiddleWare, async (req: any, res) => {
    try {

        const body = req.body;
        console.log(body);

        let passObj = {
            investor_id: body.investor_id,
            scheme_id: body.scheme_id,
            user_id: body.user_id
        }

        let findData = await findInvestorCartData(passObj);
        findData = JSON.parse(JSON.stringify(findData));

        if (findData) {
            throw other(res, 'This fund is already in your cart.')
        }

        const payload = {
            user_id: body.user_id,
            investor_id: body.investor_id,
            account_holding_id: body.account_holding_id,
            cart_type: body.cart_type,
            scheme_id: body.scheme_id,
            to_scheme_id: body.to_scheme_id || null,
            folio_number: body.folio_number,
            trans_amount: body.trans_amount,
            trans_units: body.trans_units || null,
            trans_start_date: body.trans_start_date,
            trans_end_date: body.trans_end_date || null,
            trans_type: body.trans_type,
            trans_months: body.trans_months || null,
            redeem_type: body.redeem_type || null,
            mandate_code: body.mandate_code || null,
            sip_exe_firstTrans: body.sip_exe_firstTrans || null,
            SchemeCode: body.SchemeCode || null,
            toSchemeCode: body.toSchemeCode || null,
            frequency: body.frequency || null,
            day: body.day || null,
            start_month: body.start_month || null,
            start_year: body.start_year || null,
            end_month: body.end_month || null,
            end_year: body.end_year || null,
            rta_amc_code: body.rta_amc_code || null,
            rta_sch_code: body.rta_sch_code || null,
            out_rta_sch_code: body.out_rta_sch_code || null,
            tx_vol_type: body.tx_vol_type || null,
            vol: body.vol || null,

        };
        const result = await addInvestorCartData(payload);

        sendEncryptedResponse(res, result, "Cart added");

    } catch (error) {
        ErrorLogger.write({ type: "addfundExploreCardData error", error });
        serverError(res, error);
    }
});

router.get(`/getAllInvestorCartData`, tokenMiddleWare, async (req: any, res: any) => {
    try {

        const query = req?.query?.data;

        let where = [];

        if (query && query !== undefined && query !== 'undefined' && query !== 'null') {

            const body = JSON.parse(req?.query.data);

            if (body?.InvestorId) {
                where.push({
                    // investor_id: body.InvestorId
                    user_id: body.user_id
                })
            }

            if (body?.AccountHolder) {
                where.push({
                    account_holding_id: body.AccountHolder
                })
            }

        } else {

            let findUser: any = await getUserByFindEmail(req.user?.email);
            findUser = JSON.parse(JSON.stringify(findUser));

            // const investorsIDs = findUser.UserRiskProfile.map((item: any) => {
            //     return item.id
            //   })
            //   if (investorsIDs?.length > 0) {
            //     where.push({
            //       investor_id: {
            //         [Op.in]: investorsIDs
            //       }
            //     })
            //   }

            if (findUser?.UserRiskProfile) {
                where.push({
                    // investor_id: findUser?.UserRiskProfile?.id
                    user_id: findUser?.UserRiskProfile?.id
                })
            }


        }

        const result = await getAllInvestorCartData(where);

        sendEncryptedResponse(res, result, "get Cart List");


    } catch (error) {
        ErrorLogger.write({ type: "getAllInvestorCartData error", error });
        serverError(res, error);
    }
})

router.delete(`/deleteCartItem/:id`, tokenMiddleWare, async (req: any, res: any) => {
    try {

        const { id } = req.params;

        const result = await deleteInvestorCartItem(id);

        sendEncryptedResponse(res, result, "Cart Deleted");

    } catch (error) {
        ErrorLogger.write({ type: "deleteCartItem error", error });
        serverError(res, error);
    }
})

router.post(`/deleteMultiCartItem`, tokenMiddleWare, async (req: any, res: any) => {
    try {

        const data = req.body;

        const result = await deleteInvestorMultiCartItem(data);

        sendEncryptedResponse(res, result, "Cart Deleted");

    } catch (error) {
        ErrorLogger.write({ type: "deleteCartItem error", error });
        serverError(res, error);
    }
})

router.get("/findCartDataCount", tokenMiddleWare, async (req: any, res: any) => {
    try {

        let user_id = req.user.id;

        let cartCount: any = await findCartDataCount(user_id);

        sendEncryptedResponse(res, cartCount, "get Cart Count");

    } catch (error) {
        ErrorLogger.write({ type: "findCartDataCount error", error });
        serverError(res, error);
    }
})







module.exports = router;
