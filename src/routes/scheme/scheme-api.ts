import express from "express";
import prosesjwt from "proses-jwt";
import { alreadyExist, serverError } from "proses-response";
import ErrorLogger from "../../db/core/logger/error-logger";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
let { tokenMiddleWare } = prosesjwt;
import dbInstance from "../../db/core/control-db";
import { questionType } from "../../utils/constant";
import { findAnnualReportTurnoveRatioData, findHoldingTypeData, findMutualHoldingTypeData, findMutualRelatedSchemeData, findPBRatioData, findPERatioData, findRelatedSchemeData, findReturnAVGSchemeData, findSchemeHoldingData, getAllSchemeByAMCId, getAllSchemeByISIN, getAllSchemeCategory, getAllSchemeSubCategorybyId, getFundManagerDataById, getFundManagerDataBySchemeId, getRatioSchemeData, getSchemeDataById, getSchemeDataByManager, getSchemeHistoricalInceptiionData, getSchemeHistoricalNavData, getSchemeSinceInceptionData } from "./scheme-handler";
import { endOfMonth, format, parse, parseISO, subMonths } from "date-fns";
import { dateFormat } from "../../utils/helper";
const router = express.Router();



//find by id
router.get("/get-allscheme-category", tokenMiddleWare, async (req: any, res) => {
    try {

        let data: any = await getAllSchemeCategory();
        sendEncryptedResponse(res, data, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-allscheme-category error", error });
        serverError(res, error);
    }
});

//find by id
router.get("/get-allscheme-subcategory/:id", tokenMiddleWare, async (req: any, res) => {
    try {

        let data: any = await getAllSchemeSubCategorybyId(req.params);
        sendEncryptedResponse(res, data, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-allscheme-subcategory error", error });
        serverError(res, error);
    }
});

router.get("/get-scheme-by-id/:id", tokenMiddleWare, async (req: any, res: any) => {
    try {

        let data: any = await getSchemeDataById(req.params.id);
        sendEncryptedResponse(res, data, "get data successfully");

    } catch (error) {
        ErrorLogger.write({ type: "get-scheme-by-id error", error });
        serverError(res, error);
    }
})


//
router.post("/get-scheme-by-ISIN", tokenMiddleWare, async (req: any, res) => {
    try {

        let data: any = await getAllSchemeByISIN(req.body);
        data = JSON.parse(JSON.stringify(data))

        let findAMCData: any = await getAllSchemeByAMCId(data);

        sendEncryptedResponse(res, findAMCData, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-scheme-by-ISIN error", error });
        serverError(res, error);
    }
});

router.post("/get-scheme-nav-graph-detail", tokenMiddleWare, async (req: any, res: any) => {
    try {
        let id = req.body.id;
        let schemeType = req.body.scheme_type;
        let schemeName = req.body.schemeName;
        let schemeData: any;
        let inception_date: any;

        let passObj: any;

        if (req?.body?.tab == 'sinceInception') {
            passObj = {
                scheme_id: id,
                schemeName: schemeName,
                schemeType: schemeType,
            }
        } else {
            passObj = {
                scheme_id: id,
                schemeName: schemeName,
                schemeType: schemeType,
                fromDate: format(parse(req.body.fromDate, 'yyyy-M-d', new Date()), 'yyyy-MM-dd'),
                toDate: format(parse(req.body.toDate, 'yyyy-M-d', new Date()), 'yyyy-MM-dd'),
            }
        }

        if (req?.body?.tab == 'sinceInception') {
            let getMax: any = await getSchemeSinceInceptionData(passObj);
            getMax = JSON.parse(JSON.stringify(getMax));
            passObj.inception_date = getMax.inception_date;
            schemeData = await getSchemeHistoricalInceptiionData(passObj);
            inception_date = getMax.inception_date;
        } else {
            schemeData = await getSchemeHistoricalNavData(passObj);
            inception_date = req.body.fromDate;
        }

        let findMinMax = [];
        let schemeArray = [];
        let nav;
        let navpercentage;

        if (schemeData && schemeData.length > 0) {
            // Store the first NAV value to calculate percentage growth
            let firstNavValue = schemeData[0].Value;
            
            for (let i = 0; i < schemeData.length; i++) {
                if (schemeData[i].Value) {
                    // Option 1: Show actual NAV values (recommended)
                    let actualNAV = schemeData[i].Value;
                    
                    // Option 2: If you want to show growth from first point
                    // let normalizedValue = (schemeData[i].Value / firstNavValue) * 10000;
                    
                    schemeArray.push([
                        dateFormat(schemeData[i].Value_Date), 
                        actualNAV  // Use actual NAV value
                    ]);
                    
                    findMinMax.push(actualNAV);
                    
                    if (i == (schemeData.length - 1)) {
                        nav = actualNAV;
                        // Calculate percentage change from first value
                        navpercentage = ((nav - firstNavValue) / firstNavValue) * 100;
                    }
                }
            }
        }

        let getMinValue = findMinMax.length > 0 ? Math.floor(Math.min(...findMinMax)) : 0;
        let getMaxValue = findMinMax.length > 0 ? Math.ceil(Math.max(...findMinMax)) : 0;

        let minFromDate = schemeArray.length > 0 ? schemeArray[0][0] : '-';
        let maxToDate = schemeArray.length > 0 ? schemeArray[schemeArray.length - 1][0] : '-';

        let finalObj: any = { 
            schemeArray, 
            getMinValue, 
            getMaxValue, 
            minFromDate, 
            maxToDate, 
            nav, 
            navpercentage, 
            inception_date: inception_date 
        };

        sendEncryptedResponse(res, finalObj, "graph data");

    } catch (error) {
        ErrorLogger.write({ type: "get-scheme-benchmark-graph-detail", error });
        serverError(res, error);
    }
});


router.post("/get-scheme-keyparameter-data", tokenMiddleWare, async (req: any, res: any) => {
    try {

        let body: any = req.body;

        let findPERatio: any = await findPERatioData(body);

        let findPBRatio: any = await findPBRatioData(body);

        let findAnnualReportTurnoveRatio: any = await findAnnualReportTurnoveRatioData(body);

        let data = { findPERatio, findPBRatio, findAnnualReportTurnoveRatio };

        sendEncryptedResponse(res, data, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-scheme-keyparameter-data error", error });
        serverError(res, error);
    }
})

router.post("/get-related-scheme-data", tokenMiddleWare, async (req: any, res: any) => {
    try {

        let body: any = req.body;

        let findData: any = await findRelatedSchemeData(body);

        sendEncryptedResponse(res, findData, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-related-scheme-data error", error });
        serverError(res, error);
    }
})

router.post("/get-performance-scheme-data", tokenMiddleWare, async (req: any, res: any) => {
    try {

        let body: any = req.body;

        let findReturnAVGData: any = await findReturnAVGSchemeData(body);

        sendEncryptedResponse(res, findReturnAVGData, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-performance-scheme-data error", error });
        serverError(res, error);
    }
})

router.post("/get-fundmanager-data", tokenMiddleWare, async (req: any, res: any) => {
    try {

        let body: any = req.body;

        let findFundManagerData: any = await getFundManagerDataBySchemeId(body);

        sendEncryptedResponse(res, findFundManagerData, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-fundmanager-data error", error });
        serverError(res, error);
    }
})

router.post("/get-fundmanager-data-byId", tokenMiddleWare, async (req: any, res: any) => {
    try {

        let body: any = req.body;

        let findFundManagerData: any = await getFundManagerDataById(body);

        sendEncryptedResponse(res, findFundManagerData, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-fundmanager-data-byId error", error });
        serverError(res, error);
    }
})

router.post("/get-schemeData-bymanager", tokenMiddleWare, async (req: any, res: any) => {
    try {

        let body: any = req.body;

        let findFundManagerData: any = await getSchemeDataByManager(body);

        sendEncryptedResponse(res, findFundManagerData, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-schemeData-bymanager error", error });
        serverError(res, error);
    }
})

router.post("/get-holdingData", tokenMiddleWare, async (req: any, res: any) => {
    try {

        const currentDate = new Date();

        // Calculate the first day of the previous month (June 1st)
        // const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 2);

        // Get the current date
        // const now = new Date();

        // Subtract 1 month
        // const previousMonth = subMonths(now, 1);

        // Get the last day of the previous month
        // const endOfLastMonth = endOfMonth(previousMonth);

        const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);

        let body: any = {
            ...req.body,
            // startOfPreviousMonth: startOfPreviousMonth,
            endOfPreviousMonth: endOfLastMonth
        }

        let summaryData: any = await findSchemeHoldingData(body);

        let holdingTypeWiseData: any = {};

        summaryData.forEach((item: any) => {

            if (!holdingTypeWiseData[item.detail_holding_type]) {
                holdingTypeWiseData[item.detail_holding_type] = 0;
            }

            holdingTypeWiseData[item.detail_holding_type] += item.portfolio_weighting_AVG;
        })


        let getData: any = await findHoldingTypeData(body);
        getData = JSON.parse(JSON.stringify(getData));

        let domesticEquityData: any = [];
        let otherData: any = [];

        getData.forEach((item: any) => {

            // if (!holdingTypeWiseData[item.detail_holding_type]) {
            //     holdingTypeWiseData[item.detail_holding_type] = 0;
            // }

            // holdingTypeWiseData[item.detail_holding_type] += item.portfolio_weighting;

            if (item?.detail_holding_type == "EQUITY") {
                domesticEquityData.push(item);
            } else {
                otherData.push(item);
            }
        });

        let findAllData: any = {
            holdingTypeWiseData, domesticEquityData, otherData
        }

        sendEncryptedResponse(res, findAllData, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-holdingData error", error });
        serverError(res, error);
    }
})

router.post(`/get-ratio-scheme-data`, tokenMiddleWare, async (req: any, res: any) => {
    try {

        let body: any = req.body;

        let findRatio: any = await getRatioSchemeData(body);

        sendEncryptedResponse(res, findRatio, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-ratio-scheme-data error", error });
        serverError(res, error);
    }
}
)


router.post("/get-mutual-related-scheme-data", tokenMiddleWare, async (req: any, res: any) => {
    try {

        let body: any = req.body;

        let findData: any = await findMutualRelatedSchemeData(body);

        sendEncryptedResponse(res, findData, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-mutual-related-scheme-data error", error });
        serverError(res, error);
    }
})

router.get("/get-mutual-holdingData", tokenMiddleWare, async (req: any, res: any) => {
    try {

        const currentDate = new Date();

        // Calculate the first day of the previous month (June 1st)
        // const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 2);

        // Get the current date
        // const now = new Date();

        // Subtract 1 month
        // const previousMonth = subMonths(now, 1);

        // Get the last day of the previous month
        // const endOfLastMonth = endOfMonth(previousMonth);

        const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);

        let query: any = {
            ...req.query,
            // startOfPreviousMonth: startOfPreviousMonth,
            endOfPreviousMonth: endOfLastMonth
        }

        let getData: any = await findMutualHoldingTypeData(query);

        sendEncryptedResponse(res, getData, "get data");

    } catch (error) {
        ErrorLogger.write({ type: "get-mutual-holdingData error", error });
        serverError(res, error);
    }
})




module.exports = router;
