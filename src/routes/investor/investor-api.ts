import express from "express";
import prosesjwt from "proses-jwt";
import { serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import {
  addHolidingAccount,
  getAccountHolding,
  getInvestor,
  getInvestorBank,
} from "../../services/investor.service";
import { getUserSummary } from "../kyc-flow/kyc-handler";
import { preparePayload } from "../mfu/preparePayload";
import {
  deleteInvestor,
  findFamilyHeadList,
  getAllBcList,
  getAllFamilyHeadList,
  getAllInvestorList,
  getAllInvestorListWithCan,
  getAllPartnerList,
  getAllRMList,
  getBasicUserDetailByUserId,
  getInvestorUserDetailByUserId,
  getPartnerBasicUserDetailByUserId,
  investorMappingUpdate,
  updateIvestor,
  updateUserRegistration,
} from "./investor-handler";
import { MFUCanFillEezzService } from "../../services/mfu.service";
import { ACCOUNT_TYPE } from "../../utils/constant";
import { group } from "console";
let { tokenMiddleWare } = prosesjwt;
import { dataReadRateLimit, dataWriteRateLimit } from "../../middlewares/rateLimit";
const router = express.Router();

router.post("/cart", dataReadRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    const user_id = req?.user?.id;

    // let findUser: any = await getBasicUserDetailByUserId(user_id);
    let findUser: any = await getInvestorUserDetailByUserId(user_id);
    findUser = JSON.parse(JSON.stringify(findUser));

    // let result: any = findUser.map((item: any) => {
    //     return { ...item, account_holdings: [...item.FirstAppUser, ...item.SecondAppUser, ...item.ThirdAppUser] }
    // })

    sendEncryptedResponse(res, findUser, "Cart List");
  } catch (error: any) {
    ErrorLogger.write({ type: "cart error", error });
    serverError(res, error);
  }
});

router.post("/kyc-users", dataReadRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    const investor_id = req?.body?.investor_id;

    let findUser: any = await getBasicUserDetailByUserId(investor_id);
    findUser = JSON.parse(JSON.stringify(findUser));
    const percentage = (Number(findUser?.last_kyc_step) / 8) * 100;

    const updatedMembers = findUser.GroupMemmber?.map((member: any) => {
      const memberPercentage = (Number(member?.last_kyc_step) / 8) * 100;
      return {
        ...member,
        percentage: memberPercentage,
      };
    });
    const finalData = {
      ...findUser,
      percentage,
      GroupMemmber: updatedMembers,
    };

    sendEncryptedResponse(res, finalData, "Users Investor List");
  } catch (error: any) {
    console.log(error);
    ErrorLogger.write({ type: "by-users error", error });
    serverError(res, error);
  }
});

router.post("/partner-kyc-users", dataReadRateLimit, tokenMiddleWare, async (req: any, res: any) => {
  try {
    const investor_id = req?.body?.partnerId;

    let findUser: any = await getPartnerBasicUserDetailByUserId(investor_id);
    findUser = JSON.parse(JSON.stringify(findUser));
    const percentage = (Number(findUser?.last_kyc_step) / 8) * 100;

    const updatedMembers = findUser.GroupMemmber?.map((member: any) => {
      const memberPercentage = (Number(member?.last_kyc_step) / 8) * 100;
      return {
        ...member,
        percentage: memberPercentage,
      };
    });
    const finalData = {
      ...findUser,
      percentage,
      GroupMemmber: updatedMembers,
    };

    sendEncryptedResponse(res, finalData, "Users Investor List");
  } catch (error: any) {
    console.log(error);
    ErrorLogger.write({ type: "by-users error", error });
    serverError(res, error);
  }
});

//Added by rakesh sinha on dated 07-Aug-2025

router.get("/search/:id", dataReadRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const results = await getInvestor(id);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "search Investor By Id"
    );
  } catch (error) {
    ErrorLogger.write({ type: "search by Investor Id error :- ", error });
    serverError(res, error);
  }
});

router.post("/create-holding", dataWriteRateLimit, async (req, res) => {
  try {
    const investorId = req.body.investorId;
    const secondInvestorId = req.body.secondInvestorId || null;
    const thirdInvestorId = req.body.thirdInvestorId || null;
    const accountType = req.body.accountType;

    let investorData = await getUserSummary(investorId);
    let secondInvestorData = await getUserSummary(secondInvestorId);

    let parsedInvestor = JSON.parse(JSON.stringify(investorData));
    let groupLeaderId = parsedInvestor?.group_leader_id;


    const payload = preparePayload(parsedInvestor);
    let response: any = await MFUCanFillEezzService(payload);
    const result = response?.CANIndFillEezzResp
    /*const response = {
      CANIndFillEezzResp: {
        RESP_HEADER: {
          ENTITY_ID: "40008I",
          UNIQUE_ID: "REQ_00000081",
          REQUEST_TYPE: "CANINDREG",
          VERSION_NO: "1.00",
          TIMESTAMP: "2025-08-12T17:54:40",
          RES_CODE: "0",
          RES_MSG: "Success",
        },
        RESP_BODY: {
          CAN: "32224FF002",
          NOM_VER_LINK_H1:
            "https://14.141.212.169:4091/CanCDNVLinkViewAction.do?key=KnA8HPA3c2xzCTBrhpsUO9q7hS5atIQ37+o38kIlLMCn+YVLXcGnD6OGsOsCDSQcYMURVdsQTbNbh3rmar4EhHAHMnBII2dhvsDbXQaLN75pshaQ4BvYLUm/+t9DNh3YGGctE72s0E1iQP2Q7FucNkhJlbzA676jQG/Wmk1jBaujl8P8w3jYmjqt6ua31Sdx",
          NOM_VER_LINK_H2: "",
          NOM_VER_LINK_H3: "",
        },
      },
    };*/



    if (result?.RESP_HEADER?.RES_CODE == "0") {
      const _result = await addHolidingAccount({
        investor_id: accountType === "SI" ? investorId : groupLeaderId,
        first_investor_id: investorId,
        second_investor_id: secondInvestorId,
        third_investor_id: thirdInvestorId,
        account_holding_type: ACCOUNT_TYPE.find((opt: any) => opt.value === accountType)?.code,
        CAN_Id: result?.RESP_BODY?.CAN,
      })
    }

    sendEncryptedResponse(
      res,
      {
        data: response,
        count: parsedInvestor,
      },
      "search Investor By Id"
    );
  } catch (error) {
    ErrorLogger.write({ type: "search by Investor Id error :- ", error });
    serverError(res, error);
  }
});

router.get("/account-holding/:id", dataReadRateLimit, async (req, res) => {
  try {
    const body = req.body;
    const header = req.headers;
    const { id } = req.params;

    const results = await getAccountHolding(id);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "search Investor By Id"
    );
  } catch (error) {
    ErrorLogger.write({ type: "search by Investor Id error :- ", error });
    serverError(res, error);
  }
});

router.get("/investor-bank/:id", dataReadRateLimit, async (req, res) => {
  try {
    const body = req.body;
    const header = req.headers;
    const { id } = req.params;

    const results = await getInvestorBank(id);

    sendEncryptedResponse(
      res,
      {
        data: results,
        count: results.length,
      },
      "search Investor Bank List"
    );
  } catch (error) {
    ErrorLogger.write({
      type: "search by Investor Bank List error :- ",
      error,
    });
    serverError(res, error);
  }
});

router.get(
  "/getAllInvestorList",
  tokenMiddleWare,
  async (req: any, res: any) => {
    try {
      let query: any = { ...req.query, user: req.user };

      let allData: any = await getAllInvestorList(query);

      sendEncryptedResponse(res, allData, "Got all investor list");
    } catch (error) {
      ErrorLogger.write({ type: "getAllInvestorList error", error });
      serverError(res, error);
    }
  }
);

router.get(
  "/getAllInvestorListWithCan",
  tokenMiddleWare,
  async (req: any, res: any) => {
    try {
      let query: any = { ...req.query, user: req.user };

      let allData: any = await getAllInvestorListWithCan(query);

      sendEncryptedResponse(res, allData, "Got all investor list");
    } catch (error) {
      ErrorLogger.write({ type: "getAllInvestorList error", error });
      serverError(res, error);
    }
  }
);


router.get("/getAllFamilyHeadList", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    let allData: any = await getAllFamilyHeadList();
    sendEncryptedResponse(res, allData, "Got all family head list");
  } catch (error) {
    ErrorLogger.write({ type: "getAllFamilyHeadList error", error });
    serverError(res, error);
  }
});

router.get("/getAllPartnerList", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    let allData: any = await getAllPartnerList();
    sendEncryptedResponse(res, allData, "Got all partner list");
  } catch (error) {
    ErrorLogger.write({ type: "getAllPartnerList error", error });
    serverError(res, error);
  }
});


router.get("/getAllBcList", dataReadRateLimit, async (req, res) => {
  try {
    let allData: any = await getAllBcList();
    sendEncryptedResponse(res, allData, "Got all bc list");
  } catch (error) {
    ErrorLogger.write({ type: "getAllBcList error", error });
    serverError(res, error);
  }
});

router.get("/getAllRMList", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    let allData: any = await getAllRMList();
    sendEncryptedResponse(res, allData, "Got all rm list");
  } catch (error) {
    ErrorLogger.write({ type: "getAllRMList error", error });
    serverError(res, error);
  }
});

router.put("/updateIvestor/:id", dataWriteRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    let updateData: any = await updateIvestor(req.body, req.params);
    updateData = JSON.parse(JSON.stringify(updateData[1][0]));

    let payload: any = {
      rm_id: req.body.rm_id,
    };

    // await updateUserRegistration(payload, updateData.partner_id);

    sendEncryptedResponse(res, updateData, "Data Updated Successfully");
  } catch (error) {
    ErrorLogger.write({ type: "updateIvestor error", error });
    serverError(res, error);
  }
});

router.get("/findFamilyHeadList/:id", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {

    const results = await findFamilyHeadList(req.params);
    sendEncryptedResponse(res, results, "search Family Head List");

  } catch (error) {
    ErrorLogger.write({ type: "findFamilyHeadList error :- ", error });
    serverError(res, error);
  }
});

router.delete("/deleteInvestor/:id", dataWriteRateLimit, tokenMiddleWare, async (req, res) => {
  try {

    const results = await deleteInvestor(req.params);
    sendEncryptedResponse(res, results, "delete Investor");

  } catch (error) {
    ErrorLogger.write({ type: "deleteInvestor error :- ", error });
    serverError(res, error);
  }
});

router.delete("/investorMappingUpdate/:id", dataWriteRateLimit, tokenMiddleWare, async (req, res) => {
  try {

    let findInvestor: any = await findFamilyHeadList(req.params);
    findInvestor = JSON.parse(JSON.stringify(findInvestor));

    let findIds = findInvestor.map((investor: any) => investor.id);

    let results: any = await investorMappingUpdate(findIds);

    sendEncryptedResponse(res, results, "delete investorMappingUpdate");

  } catch (error) {
    ErrorLogger.write({ type: "investorMappingUpdate error :- ", error });
    serverError(res, error);
  }
});

module.exports = router;
