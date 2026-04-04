import express from "express";
import prosesjwt from "proses-jwt";
import { alreadyExist, other, serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
let { tokenMiddleWare } = prosesjwt;
import dbInstance from "../../db/core/control-db";
import {
  findByISINNo,
  findCategoryAvg,
  findSubCategoryAvg,
  getAllAMCList,
  getAllFundManagerList,
  getAllSchemeList,
  getFundManagerDataById,
  getNewFundOfferList,
  getSchemeByAMCId,
  getSchemeByIds,
  getSchemeDataByAMCId,
  getTopAMCList,
  getTopPerformingSchemeList,
  getTopSchemeListByCatId,
  getTopSchemeListBySubCatId,
} from "./mutual-fund-handler";
import {
  getAllSchemeCategory,
  getAllSchemeSubCategorybyId,
} from "../scheme/scheme-handler";
import { sub } from "date-fns";
import { dataReadRateLimit, publicRateLimit } from "../../middlewares/rateLimit";
const router = express.Router();

router.get("/get-top-performing-funds", publicRateLimit, async (req, res) => {
  try {
    let allScheme: any = await getTopPerformingSchemeList();
    allScheme = JSON.parse(JSON.stringify(allScheme));

    allScheme = await Promise.all(
      allScheme.map(async (item: any) => {
        let findCatAvg: any = await findCategoryAvg(
          item?.SchemeMaster?.SchemeCategory?.ID
        );

        return {
          ...item,
          categoryReturnAvg: findCatAvg[0]?.Return1yrAVG,
        };
      })
    );

    sendEncryptedResponse(res, allScheme, "get top scheme list");
  } catch (error) {
    ErrorLogger.write({ type: "top-performing-schemes error", error });
    serverError(res, error);
  }
});

router.get("/get-top-performing-schemes", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    let getCategory: any = await getAllSchemeCategory();
    getCategory = JSON.parse(JSON.stringify(getCategory));

    let getAllSchemeData = await Promise.all(
      getCategory.map(async (item: any) => {
        let allScheme: any = await getTopSchemeListByCatId(item.ID);
        allScheme = JSON.parse(JSON.stringify(allScheme));

        allScheme = await Promise.all(
          allScheme.map(async (item: any) => {
            let findCatAvg: any = await findCategoryAvg(
              item?.SchemeMaster?.SchemeCategory?.ID
            );

            let findMinAmount: any = await findByISINNo(
              item?.SchemeMaster?.schemeISIN
            );

            return {
              ...item,
              categoryReturnAvg: findCatAvg[0]?.Return1yrAVG,
              minAmount: findMinAmount?.length
                ? findMinAmount[0]?.min_amt
                : null,
            };
          })
        );

        return {
          id: item.ID,
          categoryName: item.Name,
          scheme: allScheme,
        };
      })
    );

    sendEncryptedResponse(res, getAllSchemeData, "get top scheme list");
  } catch (error) {
    console.log(error, "errorrrrrrr");
    ErrorLogger.write({ type: "top-performing-schemes error", error });
    serverError(res, error);
  }
});

router.get(
  "/get-top-mutual-fund-catdata",
  dataReadRateLimit,
  tokenMiddleWare,
  async (req, res) => {
    try {
      let getCategory: any = await getAllSchemeCategory();
      getCategory = JSON.parse(JSON.stringify(getCategory));

      let getAllSchemeData = await Promise.all(
        getCategory.map(async (item: any) => {
          let allSubCategory: any = await getAllSchemeSubCategorybyId({
            id: item.ID,
          });
          allSubCategory = JSON.parse(JSON.stringify(allSubCategory));

          allSubCategory = await Promise.all(
            allSubCategory.map(async (subItem: any) => {
              let findSubCatAvg: any = await findSubCategoryAvg(subItem?.Id);

              let getScheme: any = await getTopSchemeListBySubCatId(
                subItem?.Id
              );
              getScheme = JSON.parse(JSON.stringify(getScheme));

              return {
                subCategoryId: subItem.Id,
                subCategoryName: subItem.Name,
                subCategoryReturnAvg: findSubCatAvg[0]?.Returns3yrAVG,
                scheme: getScheme,
              };
            })
          );

          const top3SubCategories = allSubCategory
            .filter((d: any) => d.subCategoryReturnAvg != null)
            .sort(
              (a: any, b: any) =>
                b.subCategoryReturnAvg - a.subCategoryReturnAvg
            )
            .slice(0, 3);

          return {
            id: item.ID,
            categoryName: item.Name,
            subCategory: top3SubCategories,
          };
        })
      );

      sendEncryptedResponse(res, getAllSchemeData, "get top scheme list");
    } catch (error) {
      ErrorLogger.write({ type: "get-top-mutual-fund-catdata error", error });
      serverError(res, error);
    }
  }
);

router.get(
  "/get-mutual-fund-classes-scheme",
  dataReadRateLimit,
  tokenMiddleWare,
  async (req, res) => {
    try {
      let getCategory: any = await getAllSchemeCategory();
      getCategory = JSON.parse(JSON.stringify(getCategory));

      let allScheme = await Promise.all(
        getCategory.map(async (item: any) => {
          let allSubCategory: any = await getAllSchemeSubCategorybyId({
            id: item.ID,
          });
          allSubCategory = JSON.parse(JSON.stringify(allSubCategory));

          let findAllScheme: any = await getAllSchemeList(item?.ID, req.query);
          findAllScheme = JSON.parse(JSON.stringify(findAllScheme));

          return {
            id: item.ID,
            categoryName: item.Name,
            subCategoryList: allSubCategory,
            schemeList: findAllScheme,
          };
        })
      );

      sendEncryptedResponse(res, allScheme, "get top scheme list");
    } catch (error) {
      ErrorLogger.write({
        type: "get-mutual-fund-classes-scheme error",
        error,
      });
      serverError(res, error);
    }
  }
);

router.get("/get-new-fund-offer-list", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    let getnewFund: any = await getNewFundOfferList(req.query);
    getnewFund = JSON.parse(JSON.stringify(getnewFund));

    let newFundList = await Promise.all(
      getnewFund.map(async (item: any) => {
        const nfoDate = new Date(item.nfo_start_date);
        const nfoEndDate: any = item.nfo_end_date
          ? new Date(item.nfo_end_date)
          : null;
        const today = new Date();
        // const diffDays = (nfoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

        const diffDays =
          (nfoEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

        if (nfoEndDate && diffDays) {
          if (diffDays >= 0 && diffDays <= 4) {
            item.fundStatus = "Closing Soon";
          } else {
            item.fundStatus = "Open";
          }
        }

        return item;
      })
    );

    sendEncryptedResponse(res, newFundList, "get top scheme list");
  } catch (error) {
    ErrorLogger.write({ type: "get-new-fund-offer-list error", error });
    serverError(res, error);
  }
});

router.get("/get-top-amc-list", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    let amcList: any = await getAllAMCList();
    amcList = JSON.parse(JSON.stringify(amcList));

    let topAMCList = await Promise.all(
      amcList.map(async (item: any) => {
        let getAMCData: any = await getSchemeByAMCId(item.id);

        return {
          ...item,
          total_schemes: getAMCData[0]?.total_schemes,
          total_AUM: getAMCData[0]?.total_AUM,
          AUMDate: getAMCData[0]?.AUMDate,
        };
      })
    );

    const searchTerm = req.query.search?.toString()?.toLowerCase();
    let top12AMC: any;

    if (searchTerm) {
      top12AMC = topAMCList
        .filter((d: any) => d.total_AUM != null)
        .filter((d: any) => d.Name.toLowerCase().includes(searchTerm))
        .sort((a: any, b: any) => b.total_AUM - a.total_AUM)
        .slice(0, 12);
    } else {
      top12AMC = topAMCList
        .filter((d: any) => d.total_AUM != null)
        .sort((a: any, b: any) => b.total_AUM - a.total_AUM)
        .slice(0, 12);
    }

    sendEncryptedResponse(res, top12AMC, "get top AMC list");
  } catch (error) {
    ErrorLogger.write({ type: "get-top-amc-list error", error });
    serverError(res, error);
  }
});

router.get("/get-top-fund-managers-list", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    let findAllManager: any = await getAllFundManagerList();
    findAllManager = JSON.parse(JSON.stringify(findAllManager));

    let topFundManagerList = await Promise.all(
      findAllManager.map(async (item: any) => {
        let scheme_manager: any = item.SchemeFundManagers;

        let schemeIds: any = [];

        scheme_manager?.map((d: any) => {
          schemeIds.push(d?.SchemeMaster?.id);
        });

        let topScheme: any = null;

        let getAMCData: any = await getSchemeByIds(schemeIds);

        if (scheme_manager?.length) {
          topScheme = scheme_manager?.reduce((max: any, current: any) => {
            const currentReturn =
              current.SchemeMaster?.SchemePerformances?.[0]?.Returns3yr || 0;
            const maxReturn =
              max.SchemeMaster?.SchemePerformances?.[0]?.Returns3yr || 0;
            return currentReturn > maxReturn ? current : max;
          }, scheme_manager[0]);
        }

        delete item.SchemeFundManagers;

        return {
          ...item,
          total_schemes: getAMCData[0]?.total_schemes,
          total_AUM: getAMCData[0]?.total_AUM,
          Avg_5yrs_Return: getAMCData[0]?.Returns5yr_AVG,
          topScheme: topScheme,
        };
      })
    );

    let top12AMC = topFundManagerList
      .filter((d: any) => d.total_AUM != null)
      .sort((a: any, b: any) => b.total_AUM - a.total_AUM)
      .slice(0, 12);

    sendEncryptedResponse(res, top12AMC, "get top fund managers list");
  } catch (error) {
    ErrorLogger.write({ type: "get-top-fund-managers-list error", error });
    serverError(res, error);
  }
});

router.get(
  "/get-fund-manager-detail/:id",
  dataReadRateLimit,
  tokenMiddleWare,
  async (req, res) => {
    try {
      let findManagerData: any = await getFundManagerDataById(req.params.id);
      findManagerData = JSON.parse(JSON.stringify(findManagerData));

      let schemeIds: any = [];

      findManagerData?.SchemeFundManagers.map(async (item: any) => {
        schemeIds.push(item?.SchemeMaster?.id);
      });

      let getAMCData: any = await getSchemeByIds(schemeIds);

      if (findManagerData?.SchemeFundManagers?.length) {
        findManagerData.SchemeFundManagers =
          findManagerData.SchemeFundManagers.slice(0, 12);
      }

      let finalObj = {
        ...findManagerData,
        total_schemes: getAMCData[0]?.total_schemes,
        total_AUM: getAMCData[0]?.total_AUM,
        Avg_5yrs_Return: getAMCData[0]?.Returns5yr_AVG,
        managerStartDate:
          findManagerData?.SchemeFundManagers[0]?.manager_startdate,
      };

      sendEncryptedResponse(res, finalObj, "get fund manager detail");
    } catch (error) {
      ErrorLogger.write({ type: "get-fund-manager-detail error", error });
      serverError(res, error);
    }
  }
);

router.get("/get-scheme-by-amc-id/:id", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    let getCategory: any = await getAllSchemeCategory();
    getCategory = JSON.parse(JSON.stringify(getCategory));

    let ovObj: any;

    let allScheme = await Promise.all(
      getCategory.map(async (item: any) => {
        let allSubCategory: any = await getAllSchemeSubCategorybyId({
          id: item.ID,
        });
        allSubCategory = JSON.parse(JSON.stringify(allSubCategory));

        let getSchemeData: any = await getSchemeDataByAMCId(
          item?.ID,
          req.params.id,
          req.query
        );
        getSchemeData = JSON.parse(JSON.stringify(getSchemeData));

        let schemeOverview: any = await getSchemeByAMCId(req.params.id);

        ovObj = {
          total_schemes: schemeOverview[0]?.total_schemes,
          total_AUM: schemeOverview[0]?.total_AUM,
          AUMDate: schemeOverview[0]?.AUMDate,
          amc_name: getSchemeData?.rows[0]?.AMCMaster?.Name,
          amc_id: getSchemeData?.rows[0]?.AMCMaster?.id,
        };

        return {
          id: item.ID,
          categoryName: item.Name,
          subCategoryList: allSubCategory,
          schemeList: getSchemeData,
        //   overview: ovObj,
        };
      })
    );

    let finalObj = {
      categoryData: allScheme,
      overview: ovObj,
    };

    sendEncryptedResponse(res, finalObj, "get scheme data");
  } catch (error) {
    ErrorLogger.write({ type: "get-scheme-by-amc-id error", error });
    serverError(res, error);
  }
});

module.exports = router;
