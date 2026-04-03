import fs from "fs";
import dbInstance from "../db/core/control-db";
import { addSchemeHoldings, bulkCreateSchemeHistoricalNav, createBanchMark, createBanchMarkMapping, createBulkScheme_historical_allocation, createFundManager, createNFOSchemeMaster, createSchemeFundManager, createSchemeHistoricalNav, createSchemePerformance, createSchemeRiskRatio, createScheme_marketcapalloc, destroyScheme_historical_allocation, findNFOSchemeMaster, findSchemeHistoricalNav, getBanchMarkByName, getBanchMarkMapping, getFundManagersbyMangerId, getSchemeFundManagers, getSchemeMaster, getSchemeMasterCount, getSchemeMasterCountfilter, getSchemePerformance, getSchemeRiskRatio, getScheme_marketcapalloc, updateExternalAccountDetailsById, updateNFOSchemeMaster, updateSchemeMasterById, updateSchemePerformance, updateSchemeRiskRatio, updateScheme_marketcapalloc } from "../routes/scheme/mornig-star-handler";
import { SCHEME_DIVIDEND_OPTION, SCHEME_OPTION } from "../utils/constant";
import { calculateAge, dateFormat, isLessThanOneDayAway, isWeekend } from "../utils/helper";
const axios = require("axios");


const POST_METHOD = 'post';
let axiosPreConfig = {
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Accept": "*/*",
        "User-Agent": "PostmanRuntime/7.39.0"
    },
};

export const manageNFOSchemeMasterFroMS = async (requestPath: any, isCloseEnded: any) => {
    let t = await dbInstance.transaction();
    try {
        let final_url = requestPath;
        // console.log(final_url, "Final URL ...");
        const response = await handleAxiosCall(POST_METHOD, final_url, false, null, null);
        if (response) {
            const responseData = response?.data;
            // console.log(responseData, "Response Data ...");
            console.log(responseData.length, "Response Data Length ...");

            let currentScheme: any = {};

            let counter = 0;

            while (counter < responseData.length) {
                currentScheme = responseData[counter];

                console.log("Counter ..." + counter);

                if (currentScheme) {

                    const schemeData = {
                        mstar_id: currentScheme?.api?.['FSCBI-MStarID'] || null,
                        schemeISIN: currentScheme?.api?.['FSCBI-ISIN'] || null,
                        amc: currentScheme?.api?.['AMCBI-AdministratorCompanies']?.length > 0 ? currentScheme?.api?.['AMCBI-AdministratorCompanies'][0].CompanyName : null,
                        name: currentScheme?.api?.['FSCBI-FundLegalName'] || null,
                        subcategory: currentScheme?.api?.['FSCBI-CategoryName'] || null,
                        ms_fullname: currentScheme?.api?.['FSCBI-FundName'] || null,
                        scheme_type: currentScheme?.api?.['FSCBI-PurchaseMode'] == 1 ? 'R' : 'D',
                        option_id: (currentScheme?.api?.['FSCBI-DistributionStatus']?.toString().toLowerCase() === "income") ? SCHEME_OPTION.Dividend : SCHEME_OPTION.Growth,
                        div_option: (currentScheme?.api?.['FSCBI-DistributionStatus']?.toString().toLowerCase() == "accumulated") ? SCHEME_DIVIDEND_OPTION.Growth : (currentScheme?.api?.['AT-DividendInvestmentPlan'] === true ? SCHEME_DIVIDEND_OPTION.ReInvest : SCHEME_DIVIDEND_OPTION.Payout),
                        iscloseended: currentScheme.api?.['FSCBI-LegalStructure'].includes('Open Ended') ? false : true,
                        ProductCode: currentScheme?.api?.['FSCBI-RTACode'] || null,
                        min_amount: currentScheme?.api?.['PIV-MinimumInvestments']?.length > 0 ? currentScheme?.api?.['PIV-MinimumInvestments'][0]?.MinimumInitial : null,

                        inception_date: currentScheme?.api?.['FSCBI-InceptionDate'] || null,
                        inception_age: calculateAge(currentScheme?.api?.['FSCBI-InceptionDate']) || 0,
                        net_expense_ratio: parseFloat(currentScheme?.api?.['ARF-NetExpenseRatio']) || 0.0,
                        riskLevel: currentScheme?.api?.['FSCBI-IndianRiskLevel'] || null,
                        nfo_start_date: (currentScheme?.api?.['TEIV2-SubscriptionStartDate']) ? new Date(currentScheme?.api?.['TEIV2-SubscriptionStartDate']) : null,
                        nfo_end_date: (currentScheme?.api?.['TEIV2-IPODate']) ? new Date(currentScheme?.api?.['TEIV2-IPODate']) : null,

                        pe_ratio: parseFloat(currentScheme?.api?.['PSRP-PERatioTTMLong']) || 0.0,
                        pb_ratio: parseFloat(currentScheme?.api?.['PSRP-PBRatioTTMLong']) || 0.0,
                        exit_load: await getExitLoad(currentScheme?.api?.['LS-DeferLoads']) || null,
                        initial_lockup_period: parseFloat(currentScheme?.api?.['FSCBI-InitialLockupPeriod']) || 0.0,
                        avgMarketCap: parseFloat(currentScheme?.api?.['PSRP-AverageMarketCapMilLong']) || 0.0,
                        noOfStocks: currentScheme?.api?.['PSRP-NumberOfStockHoldings'] || 0,
                        isETF: currentScheme?.api?.['AT-ExchangeTradedShare']
                    }
                    const today = new Date();
                    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const givenDateOnly = schemeData.nfo_start_date ? new Date(schemeData.nfo_start_date.getFullYear(), schemeData.nfo_start_date.getMonth(), schemeData.nfo_start_date.getDate()) : null;
                    if (givenDateOnly && currentScheme?.api?.['FSCBI-ISIN'] && givenDateOnly.getTime() >= todayDateOnly.getTime()) {

                        const find = await findNFOSchemeMaster(schemeData, t)
                        if (find) {
                            await updateNFOSchemeMaster(schemeData, t)
                        } else {
                            await createNFOSchemeMaster(schemeData, t)
                        }
                    }


                }
                counter++;
            }


            await t.commit();

        }

    } catch (error) {
        console.log(error)
        await t.rollback();
        console.log(error, "Error ...");
    }
}

export const manageSchemeFundManager = async (requestPath: string) => {
    const final_url = requestPath;
    const pageSize = 100;

    const totalRecords = await getSchemeMasterCount(); // Only count once
    let pageNo = 1;

    while ((pageNo - 1) * pageSize < totalRecords) {
        const schemeBatch = await getSchemeMaster(
            pageSize,
            pageNo,
        );

        if (schemeBatch.length === 0) break; // Safety check

        await addFundManagersData(final_url, schemeBatch);
        pageNo++;
    }

    console.log("Fund Managers Data added ...");
};

export const manageAMCDetailsForSchemes = async (requestPath: string) => {
    const final_url = requestPath;
    const pageSize = 100;

    const totalRecords = await getSchemeMasterCount(); // Only count once
    let pageNo = 1;

    while ((pageNo - 1) * pageSize < totalRecords) {
        const schemeBatch = await getSchemeMaster(
            pageSize,
            pageNo,
        );

        if (schemeBatch.length === 0) break; // Safety check

        await updateAMCData(final_url, schemeBatch);
        pageNo++;
    }

    console.log("AMC Details Updated ...");
};

export const manageHoldingDetailsForSchemes = async (requestPath: string) => {
    try {
        let final_url = requestPath;

        let qry = `(SELECT "schemeISIN" FROM "SchemeMasters" WHERE (option_id = 1 AND scheme_type = 'R' AND "isETF" = false) OR (scheme_type = 'D' AND option_id = 1 AND "isETF" = true))`;
        // let qry1 = `SELECT DISTINCT(schemeISIN)
        //               FROM [OceanFinvest_QA].[dbo].[scheme_master]
        //               where option_id = 1 AND scheme_type = 'R' AND subcategory_id 
        //               IN (select id from scheme_subcategory where category_id = 4)`;

        const temp: any = await dbInstance.query(qry);
        const currentDate = new Date();

        const as_on_date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);

        for (let j = 0; j < temp[0].length; j++) {
            // const api_url = 'https://api.morningstar.com/v2/service/mf/dzgcrkw2vnh4vela/isin/' + temp[0][j].schemeISIN + '?accesscode=vvmt2lgo4v6yqt0f2ubfphl214gp9z7q&format=json'

            const api_url = final_url.replace("<schemeISIN>", temp[0][j].schemeISIN);

            console.log(temp[0][j].schemeISIN, "Scheme ISIN ...");

            // const response = await handleApiCallWithHeader(api_url)
            console.log(api_url, "API URL ..");

            const response = await handleAxiosCall(POST_METHOD, api_url, false, null, null);

            if (!response) {
                console.log("No Response ....");
                return
            }

            let holdingArray = response?.data?.[0].api['FHV2-HoldingDetail'];

            // console.log(holdingArray,"Holding Array ....");

            const HLD = holdingArray ? holdingArray : []
            let ObjArray = []
            let i = 0;

            while (i < HLD.length) {
                let Name = (HLD[i].Name != undefined) ? HLD[i].Name : null
                let HoldingISIN = (HLD[i].ISIN != undefined) ? HLD[i].ISIN : null
                let Weighting = (HLD[i].Weighting != undefined) ? parseFloat(HLD[i].Weighting).toFixed(2) : null
                let MarketValue = (HLD[i].MarketValue != undefined) ? HLD[i].MarketValue : null
                let NumberOfShare = (HLD[i].NumberOfShare != undefined) ? HLD[i].NumberOfShare : null
                let ShareChange = (HLD[i].ShareChange != undefined) ? HLD[i].ShareChange : null
                let HoldingType = (HLD[i].HoldingType != undefined) ? HLD[i].HoldingType : 'UNKNOWN'
                let CurrencyId = (HLD[i].CurrencyId != undefined) ? HLD[i].CurrencyId : null
                let Country = (HLD[i].Country != undefined) ? HLD[i].Country : null
                let Ticker = (HLD[i].Ticker != undefined) ? HLD[i].Ticker : null
                let FirstBoughtDate = (HLD[i].FirstBoughtDate != undefined) ? HLD[i].FirstBoughtDate : null
                let Sector = (HLD[i].Sector != undefined) ? HLD[i].Sector : null
                let GlobalIndustry = (HLD[i].GlobalIndustry != undefined) ? HLD[i].GlobalIndustry : null
                let MaturityDate = (HLD[i].MaturityDate != undefined) ? HLD[i].MaturityDate : null
                let Coupon = (HLD[i].Coupon != undefined) ? HLD[i].Coupon : null
                let IndianCreditQualityClassification = (HLD[i].IndianCreditQualityClassification != undefined) ? HLD[i].IndianCreditQualityClassification : null

                if (Name) {
                    if (Name.includes("'s") || Name.includes("'S")) {
                        let f = Name.split("'")
                        const filteredArray = f.filter((item: any) => { return item !== '' });
                        let l = "'" + filteredArray[0] + "''" + filteredArray[1] + "'"
                        Name = l
                    }
                }
                if (Sector) {
                    if (Sector.includes("'s") || Sector.includes("'S")) {
                        let f = Sector.split("'")
                        const filteredArray1 = f.filter((item: any) => { return item !== '' });
                        let l = "'" + filteredArray1[0] + "''" + filteredArray1[1] + "'"
                        Sector = l
                    }
                }
                if (GlobalIndustry) {
                    if (GlobalIndustry.includes("'s") || GlobalIndustry.includes("'S")) {
                        let f = GlobalIndustry.split("'")
                        const filteredArray2 = f.filter((item: any) => { return item !== '' });
                        let l = "'" + filteredArray2[0] + "''" + filteredArray2[1] + "'"
                        GlobalIndustry = l
                    }
                }
                if (Ticker) {
                    if (Ticker.includes("'s") || Ticker.includes("'S")) {
                        let f = Ticker.split("'")
                        const filteredArray3 = f.filter((item: any) => { return item !== '' });
                        let l = "'" + filteredArray3[0] + "''" + filteredArray3[1] + "'"
                        Ticker = l
                    }
                }
                if (HLD[i].HoldingType) {
                    if (HLD[i].HoldingType == 'E' || HLD[i].HoldingType == 'P') {

                        console.log('if......');
                        const obj = {
                            name: Name,
                            ticker: Ticker,
                            ISIN: temp[0][j].schemeISIN,
                            holdingISIN: HoldingISIN,
                            portfolio_weighting: Weighting,
                            position_market_value: MarketValue,
                            shares: NumberOfShare,
                            share_change: ShareChange,
                            currency: CurrencyId,
                            country: Country,
                            sector: Sector,
                            secondary_sector: GlobalIndustry,
                            detail_holding_type: 'EQUITY',
                            holding_type: HoldingType,
                            first_bought_date: FirstBoughtDate,
                            as_on_date: as_on_date
                        }
                        ObjArray.push(obj)
                    } else {
                        console.log('else.......');
                        let holdingdetailtype = 'UNKNOWN'
                        if (HLD[i].HoldingType == 'CR' || HLD[i].HoldingType == 'CA' || HLD[i].HoldingType == 'C' || HLD[i].HoldingType == 'CQ' || HLD[i].HoldingType == 'QQ') {
                            holdingdetailtype = 'CASH'
                        }
                        if (HLD[i].HoldingType == 'DG' || HLD[i].HoldingType == 'EL' || HLD[i].HoldingType == 'DH' || HLD[i].HoldingType == 'EP') {
                            holdingdetailtype = 'DERIVATIVES'
                        }
                        if (HLD[i].HoldingType == 'ER') {
                            holdingdetailtype = 'REITS & INVIT'
                        }
                        if (HLD[i].HoldingType == 'DM' || HLD[i].HoldingType == 'DD') {
                            holdingdetailtype = 'COMMODITIES'
                        }
                        if (HLD[i].HoldingType == 'CP' || HLD[i].HoldingType == 'GS' || HLD[i].HoldingType == 'BC' || HLD[i].HoldingType == 'B' || HLD[i].HoldingType == 'BY' || HLD[i].HoldingType == 'CD' || HLD[i].HoldingType == 'SI' || HLD[i].HoldingType == 'BD' || HLD[i].HoldingType == 'BT' || HLD[i].HoldingType == 'EX' || HLD[i].HoldingType == 'DS' || HLD[i].HoldingType == 'DE' || HLD[i].HoldingType == 'FC') {
                            holdingdetailtype = 'DEBT'
                        }

                        const searchWordsETF = ["Gold", "GOLD", "ETF"];

                        if (HLD[i].HoldingType == 'FO') {
                            if (Name.includes('GOLD') || Name.includes('Gold') || Name.includes('gold')) {
                                holdingdetailtype = 'COMMODITIES'
                            } else {
                                holdingdetailtype = 'DEBT'
                            }
                        }
                        if (HLD[i].HoldingType == 'DG') {
                            if (Name.includes('GOLD') || Name.includes('Gold') || Name.includes('gold')) {
                                holdingdetailtype = 'COMMODITIES'
                            } else {
                                holdingdetailtype = 'DEBT'
                            }
                        }
                        if (HLD[i].HoldingType == 'FE') {
                            // let arrayWord = findWords(Name, searchWordsETF)
                            if (Name.includes('GOLD') || Name.includes('Gold') || Name.includes('gold')) {
                                holdingdetailtype = 'COMMODITIES'
                            } else {
                                holdingdetailtype = 'ETF'
                            }
                            // if(Name.includes('GOLD ETF')){
                            //   holdingdetailtype = 'COMMODITIES'
                            // }else{
                            //   holdingdetailtype = 'ETF'
                            // }
                        }

                        const obj = {
                            name: Name,
                            ticker: Ticker,
                            ISIN: temp[0][j].schemeISIN,
                            holdingISIN: HoldingISIN,
                            portfolio_weighting: Weighting,
                            position_market_value: MarketValue,
                            shares: NumberOfShare,
                            share_change: ShareChange,
                            currency: CurrencyId,
                            country: Country,
                            sector: Sector,
                            secondary_sector: GlobalIndustry,
                            maturity_date: MaturityDate,
                            coupon: Coupon,
                            detail_holding_type: holdingdetailtype,
                            holding_type: HoldingType,
                            first_bought_date: FirstBoughtDate,
                            as_on_date: as_on_date,
                            credit_classification: IndianCreditQualityClassification
                        }

                        ObjArray.push(obj)
                    }
                } else {
                    const obj = {
                        name: Name,
                        ticker: Ticker,
                        ISIN: temp[0][j].schemeISIN,
                        holdingISIN: HoldingISIN,
                        portfolio_weighting: Weighting,
                        position_market_value: MarketValue,
                        shares: NumberOfShare,
                        share_change: ShareChange,
                        currency: CurrencyId,
                        country: Country,
                        sector: Sector,
                        secondary_sector: GlobalIndustry,
                        detail_holding_type: 'UNKNOWN',
                        holding_type: 'UNKNOWN',
                        first_bought_date: FirstBoughtDate,
                        as_on_date: as_on_date
                    }

                    ObjArray.push(obj)
                }

                i++
            }
            // return
            console.log("Scheme Holdings to be added in database ...");

            if (ObjArray && ObjArray.length > 0)

                await addSchemeHoldings(ObjArray)
        }

        console.log("Scheme Holdings details added ....");
    } catch (error) {
        console.log(error)
    }

}


export const manageMarketCapAllocData = async (requestPath: string) => {
    let final_url = requestPath;

    const sqlQuery: any = await dbInstance.query(`SELECT 
    sm.id, 
    sm."schemeISIN", 
    sm.mstar_id, 
    sm."name", 
    sc."Name" AS "Category", 
    ssc."Name" AS "SubCategory"
FROM "SchemeMasters" sm
INNER JOIN "SchemeSubcategories" ssc 
    ON ssc."Id" = sm.subcategory_id
INNER JOIN "SchemeCategories" sc 
    ON sc."ID" = sm."categoryid"
WHERE 
    (sm.option_id = 1 AND sm.scheme_type = 'R' AND sm."isETF" = false)
    OR 
    (sm.scheme_type = 'D' AND sm.option_id = 1 AND sm."isETF" = true)
ORDER BY sc."Name";`);

    let schemeISIN = "";
    let mstarId = "";
    let schemeId = 0;
    let api_url = "";

    let marketcap_asondate, assetalloc_asondate, equistyle_asondate;

    let failedObjectsLog = [];

    for (let counter = 0; counter < sqlQuery[0].length; counter++) {
        schemeISIN = sqlQuery[0][counter]['schemeISIN'];
        schemeId = sqlQuery[0][counter]['id'];
        mstarId = sqlQuery[0][counter]['mstar_id'];

        api_url = final_url.replace("<schemeISIN>", schemeISIN);

        const response = await handleAxiosCall(POST_METHOD, api_url, false, null, null);

        if (!response) {
            return;
        }

        if (response) {
            console.log(api_url, "API URL ..");

            console.log(schemeISIN, "Scheme ISIN ..");

            let marketCapArray = response?.data?.[0].api;


            const HLD = marketCapArray ? marketCapArray : [];

            let marketCapAllocObj = {};

            marketcap_asondate = (HLD['IMCBD-PortfolioDate']) ? new Date(HLD['IMCBD-PortfolioDate']) : null;
            assetalloc_asondate = (HLD['AABRP-PortfolioDate']) ? new Date(HLD['AABRP-PortfolioDate']) : null;
            equistyle_asondate = (HLD['SBRP-PortfolioDate']) ? new Date(HLD['SBRP-PortfolioDate']) : null;

            if (schemeId) {
                const schemeMarketCapAllocObj: any = await getScheme_marketcapalloc(schemeISIN, mstarId)


                if (schemeMarketCapAllocObj) {
                    marketCapAllocObj = {
                        mstar_id: mstarId,
                        scheme_id: schemeId,
                        scheme_isin: schemeISIN
                    }

                    if (!schemeMarketCapAllocObj?.marketcap_asondate ||
                        (schemeMarketCapAllocObj?.marketcap_asondate
                            && marketcap_asondate && marketcap_asondate > schemeMarketCapAllocObj?.marketcap_asondate)) {
                        marketCapAllocObj = {
                            ...marketCapAllocObj,
                            marketcap_giant: 0,
                            marketcap_large: (HLD['IMCBD-IndiaLargeCapNet']) ? HLD['IMCBD-IndiaLargeCapNet'] : null,
                            marketcap_mid: (HLD['IMCBD-IndiaMidCapNet']) ? HLD['IMCBD-IndiaMidCapNet'] : null,
                            marketcap_small: (HLD['IMCBD-IndiaSmallCapNet']) ? HLD['IMCBD-IndiaSmallCapNet'] : null,
                            marketcap_micro: 0,
                            marketcap_asondate: marketcap_asondate
                        }
                    }
                    else {
                        failedObjectsLog.push({ isin: schemeISIN, message: "Indian Market Cap Data is not updated." });
                    }

                    if (!schemeMarketCapAllocObj?.assetalloc_asondate ||
                        (schemeMarketCapAllocObj?.assetalloc_asondate
                            && assetalloc_asondate && assetalloc_asondate > schemeMarketCapAllocObj?.assetalloc_asondate)) {
                        marketCapAllocObj = {
                            ...marketCapAllocObj,
                            assetalloc_equity: (HLD['AABRP-AssetAllocEquityNet']) ? HLD['AABRP-AssetAllocEquityNet'] : null,
                            assetalloc_bond: (HLD['AABRP-AssetAllocBondNet']) ? HLD['AABRP-AssetAllocBondNet'] : null,
                            assetalloc_cash: (HLD['AABRP-AssetAllocCashNet']) ? HLD['AABRP-AssetAllocCashNet'] : null,
                            assetalloc_others: (HLD['AABRP-OtherNet']) ? HLD['AABRP-OtherNet'] : null,
                            assetalloc_asondate: assetalloc_asondate
                        }
                    }
                    else {
                        failedObjectsLog.push({ isin: schemeISIN, message: "Indian Asset Alloc Data is not updated." });
                    }

                    if (!schemeMarketCapAllocObj?.equistyle_asondate ||
                        (schemeMarketCapAllocObj?.equistyle_asondate && equistyle_asondate && equistyle_asondate > schemeMarketCapAllocObj?.equistyle_asondate)) {
                        marketCapAllocObj = {
                            ...marketCapAllocObj,
                            equistyle_largeValue: (HLD['SBRP-EquityStyleLargeValueLongRescaled']) ? HLD['SBRP-EquityStyleLargeValueLongRescaled'] : null,
                            equistyle_largeCore: (HLD['SBRP-EquityStyleLargeCoreLongRescaled']) ? HLD['SBRP-EquityStyleLargeCoreLongRescaled'] : null,
                            equistyle_largeGrowth: (HLD['SBRP-EquityStyleLargeGrowthLongRescaled']) ? HLD['SBRP-EquityStyleLargeGrowthLongRescaled'] : null,
                            equistyle_midValue: (HLD['SBRP-EquityStyleMidValueLongRescaled']) ? HLD['SBRP-EquityStyleMidValueLongRescaled'] : null,
                            equistyle_midCore: (HLD['SBRP-EquityStyleMidCoreLongRescaled']) ? HLD['SBRP-EquityStyleMidCoreLongRescaled'] : null,
                            equistyle_midGrowth: (HLD['SBRP-EquityStyleMidGrowthLongRescaled']) ? HLD['SBRP-EquityStyleMidGrowthLongRescaled'] : null,
                            equistyle_smallValue: (HLD['SBRP-EquityStyleSmallValueLongRescaled']) ? HLD['SBRP-EquityStyleSmallValueLongRescaled'] : null,
                            equistyle_smallCore: (HLD['SBRP-EquityStyleSmallCoreLongRescaled']) ? HLD['SBRP-EquityStyleSmallCoreLongRescaled'] : null,
                            equistyle_smallGrowth: (HLD['SBRP-EquityStyleSmallGrowthLongRescaled']) ? HLD['SBRP-EquityStyleSmallGrowthLongRescaled'] : null,
                            equistyle_asondate: equistyle_asondate
                        }
                    }
                    else {
                        failedObjectsLog.push({ isin: schemeISIN, message: "Equity Style Data is not updated." });
                    }
                    console.log(sqlQuery[0][counter]['Category'])
                    if (sqlQuery[0][counter]['Category'] == 'Hybrid') {
                        await destroyScheme_historical_allocation(schemeISIN, assetalloc_asondate)


                        let historicalNewEquityObj: string | any[] = [];

                        if (schemeMarketCapAllocObj?.assetalloc_equity)
                            historicalNewEquityObj = [{
                                isin: schemeISIN,
                                as_on_date: schemeMarketCapAllocObj?.assetalloc_asondate ? schemeMarketCapAllocObj?.assetalloc_asondate : '2025-01-31',
                                detail_holding_type: 'Equity',
                                holding_percent: schemeMarketCapAllocObj?.assetalloc_equity
                            }]

                        if (schemeMarketCapAllocObj?.assetalloc_bond)
                            historicalNewEquityObj = [
                                ...historicalNewEquityObj,
                                {
                                    isin: schemeISIN,
                                    as_on_date: schemeMarketCapAllocObj?.assetalloc_asondate ? schemeMarketCapAllocObj?.assetalloc_asondate : '2025-01-31',
                                    detail_holding_type: 'Debt',
                                    holding_percent: schemeMarketCapAllocObj?.assetalloc_bond
                                }]

                        if (schemeMarketCapAllocObj?.assetalloc_cash)
                            historicalNewEquityObj = [
                                ...historicalNewEquityObj,
                                {
                                    isin: schemeISIN,
                                    as_on_date: schemeMarketCapAllocObj?.assetalloc_asondate ? schemeMarketCapAllocObj?.assetalloc_asondate : '2025-01-31',
                                    detail_holding_type: 'Cash',
                                    holding_percent: schemeMarketCapAllocObj?.assetalloc_cash
                                }]

                        if (schemeMarketCapAllocObj?.assetalloc_others)
                            historicalNewEquityObj = [
                                ...historicalNewEquityObj,
                                {
                                    isin: schemeISIN,
                                    as_on_date: schemeMarketCapAllocObj?.assetalloc_asondate ? schemeMarketCapAllocObj?.assetalloc_asondate : '2025-01-31',
                                    detail_holding_type: 'Others',
                                    holding_percent: schemeMarketCapAllocObj?.assetalloc_others
                                }]

                        if (historicalNewEquityObj &&
                            historicalNewEquityObj.length > 0)
                            await createBulkScheme_historical_allocation(historicalNewEquityObj);
                    }

                    if (marketCapAllocObj) {
                        const historicalAllocObj = {
                            mstar_id: schemeMarketCapAllocObj?.mstar_id,
                            scheme_id: schemeMarketCapAllocObj?.scheme_id,
                            scheme_isin: schemeMarketCapAllocObj?.scheme_isin,
                            marketcap_giant: schemeMarketCapAllocObj?.marketcap_giant,
                            marketcap_large: schemeMarketCapAllocObj?.marketcap_large,
                            marketcap_mid: schemeMarketCapAllocObj?.marketcap_mid,
                            marketcap_small: schemeMarketCapAllocObj?.marketcap_small,
                            marketcap_micro: schemeMarketCapAllocObj?.marketcap_micro,
                            marketcap_asondate: schemeMarketCapAllocObj?.marketcap_asondate,
                            assetalloc_equity: schemeMarketCapAllocObj?.assetalloc_equity,
                            assetalloc_bond: schemeMarketCapAllocObj?.assetalloc_bond,
                            assetalloc_cash: schemeMarketCapAllocObj?.assetalloc_cash,
                            assetalloc_others: schemeMarketCapAllocObj?.assetalloc_others,
                            asondate: schemeMarketCapAllocObj?.assetalloc_asondate
                        };

                        const updatedData = await updateScheme_marketcapalloc(marketCapAllocObj, schemeMarketCapAllocObj)


                        // if (updatedData && updatedData[0] > 0) {
                        //     await scheme_historical_marketcapalloc.create(historicalAllocObj);
                        //     console.log(historicalAllocObj, "Market Cap Alloc Historical Obj Created - " + schemeISIN);
                        // }

                        console.log("Market Cap Alloc Obj Updated - " + schemeISIN);
                    }
                }
                else {
                    const obj = {
                        mstar_id: mstarId,
                        scheme_id: schemeId,
                        scheme_isin: schemeISIN,
                        marketcap_giant: 0,//(HLD['MCBRP-MarketCapGiantLongRescaled']) ? HLD['MCBRP-MarketCapGiantLongRescaled'] : null,
                        marketcap_large: (HLD['IMCBD-IndiaLargeCapNet']) ? HLD['IMCBD-IndiaLargeCapNet'] : null,
                        marketcap_mid: (HLD['IMCBD-IndiaMidCapNet']) ? HLD['IMCBD-IndiaMidCapNet'] : null,
                        marketcap_small: (HLD['IMCBD-IndiaSmallCapNet']) ? HLD['IMCBD-IndiaSmallCapNet'] : null,
                        marketcap_micro: 0,//(HLD['MCBRP-MarketCapMicroLongRescaled']) ? HLD['MCBRP-MarketCapMicroLongRescaled'] : null,
                        marketcap_asondate: marketcap_asondate,
                        assetalloc_equity: (HLD['AABRP-AssetAllocEquityNet']) ? HLD['AABRP-AssetAllocEquityNet'] : null,
                        assetalloc_bond: (HLD['AABRP-AssetAllocBondNet']) ? HLD['AABRP-AssetAllocBondNet'] : null,
                        assetalloc_cash: (HLD['AABRP-AssetAllocCashNet']) ? HLD['AABRP-AssetAllocCashNet'] : null,
                        assetalloc_others: (HLD['AABRP-OtherNet']) ? HLD['AABRP-OtherNet'] : null,
                        assetalloc_asondate: assetalloc_asondate,
                        equistyle_largeValue: (HLD['SBRP-EquityStyleLargeValueLongRescaled']) ? HLD['SBRP-EquityStyleLargeValueLongRescaled'] : null,
                        equistyle_largeCore: (HLD['SBRP-EquityStyleLargeCoreLongRescaled']) ? HLD['SBRP-EquityStyleLargeCoreLongRescaled'] : null,
                        equistyle_largeGrowth: (HLD['SBRP-EquityStyleLargeGrowthLongRescaled']) ? HLD['SBRP-EquityStyleLargeGrowthLongRescaled'] : null,
                        equistyle_midValue: (HLD['SBRP-EquityStyleMidValueLongRescaled']) ? HLD['SBRP-EquityStyleMidValueLongRescaled'] : null,
                        equistyle_midCore: (HLD['SBRP-EquityStyleMidCoreLongRescaled']) ? HLD['SBRP-EquityStyleMidCoreLongRescaled'] : null,
                        equistyle_midGrowth: (HLD['SBRP-EquityStyleMidGrowthLongRescaled']) ? HLD['SBRP-EquityStyleMidGrowthLongRescaled'] : null,
                        equistyle_smallValue: (HLD['SBRP-EquityStyleSmallValueLongRescaled']) ? HLD['SBRP-EquityStyleSmallValueLongRescaled'] : null,
                        equistyle_smallCore: (HLD['SBRP-EquityStyleSmallCoreLongRescaled']) ? HLD['SBRP-EquityStyleSmallCoreLongRescaled'] : null,
                        equistyle_smallGrowth: (HLD['SBRP-EquityStyleSmallGrowthLongRescaled']) ? HLD['SBRP-EquityStyleSmallGrowthLongRescaled'] : null,
                        equistyle_asondate: equistyle_asondate
                    }

                    await createScheme_marketcapalloc(obj);

                    console.log(obj, "Market Cap Alloc Obj Created - " + schemeISIN);
                }
            }
        }
    }

    if (failedObjectsLog && failedObjectsLog.length > 0) {
        const filePath = 'failedObjectsLog.csv';

        // Get headers from the keys of the first object
        const headers = Object.keys(failedObjectsLog[0]).join(',');

        // Map each object to a comma-separated string of its values
        const rows = failedObjectsLog.map(obj => Object.values(obj).join(',')).join('\n');

        const csvContent = headers + '\n' + rows;

        fs.writeFile(filePath, csvContent, (err: any) => {
            if (err) {
                console.error('Error writing CSV file:', err);
            } else {
                console.log(`Array successfully saved to ${filePath}`);
            }
        });
    }

    console.log("Market Cap Alloc Data Synced ...");
}

export const manageSchemePerformanceData = async (requestPath: string) => {
    let final_url = requestPath;

    let pageNo = 1, pageSize = 100

    let totalRecords = await getSchemeMasterCount(); // Only count once
    console.log(totalRecords, "Total Records ...");

    while ((pageNo - 1) * pageSize < totalRecords) {
        const schemeBatch = await getSchemeMaster(
            pageSize,
            pageNo,
        );
        console.log(pageNo, "Scheme Batch ...");
        if (schemeBatch.length === 0) break; // Safety check
        await handleSchemesPerformanceData(final_url, schemeBatch);
        pageNo++;
    }


    console.log("Scheme Performance Data updated ...")
}

export const manageSchemeAUMData = async (requestPath: string) => {
    let final_url = requestPath;
    const pageSize = 100;

    const totalRecords = await getSchemeMasterCount(); // Only count once
    let pageNo = 1;

    while ((pageNo - 1) * pageSize < totalRecords) {
        const schemeBatch = await getSchemeMaster(
            pageSize,
            pageNo,
        );

        if (schemeBatch.length === 0) break; // Safety check

        await handleSchemesAUMData(final_url, schemeBatch);
        pageNo++;
    }

    console.log("Scheme AUM Data updated ...");



}

export const manageSchemeRiskRatioData = async (requestPath: string) => {
    let final_url = requestPath;

    let pageNo = 1, pageSize = 100

    let totalRecords = await getSchemeMasterCount(); // Only count once


    while ((pageNo - 1) * pageSize < totalRecords) {
        const schemeBatch = await getSchemeMaster(
            pageSize,
            pageNo,
        );

        if (schemeBatch.length === 0) break; // Safety check
        await handleSchemesRiskRatioData(final_url, schemeBatch);
        pageNo++;
    }


    console.log("Scheme Performance Data updated ...")
}

export const manageSchemesHistoricalNavData = async (requestPath: string, requestPathWithDateFilter: string) => {
    let final_url = requestPath;
    let final_url_with_date_filter = requestPathWithDateFilter;

    let pageNo = 1, pageSize = 100;
    let totalRecords = await getSchemeMasterCountfilter();


    while ((pageNo - 1) * pageSize < totalRecords) {
        const schemeBatch = await getSchemeMaster(
            pageSize,
            pageNo,
        );

        if (schemeBatch.length === 0) break; // Safety check
        await handleSchemesHistoricalNavData(final_url, final_url_with_date_filter, schemeBatch);
        pageNo++;
    }



    console.log("Scheme Historical NAV Data updated ...");
}
export const manageSchemeMasterAdditionalParameters = async (requestPath: any) => {
    let final_url = requestPath;
    const pageSize = 100;

    const totalRecords = await getSchemeMasterCount(); // Only count once
    let pageNo = 1;

    while ((pageNo - 1) * pageSize < totalRecords) {
        const schemeBatch = await getSchemeMaster(
            pageSize,
            pageNo,
        );

        if (schemeBatch.length === 0) break; // Safety check

        await handleSchemeMasterAdditionalParams(final_url, schemeBatch);
        pageNo++;
    }

    console.log("Scheme Additional Parameters updated ...");


}

export const getMSAccessCode = async (credentialsData: any) => {



    if (credentialsData) {
        if (!isLessThanOneDayAway(credentialsData?.tokenExpiry)) {
            return credentialsData?.token
        }
        else {

            // Token is expired, so let's create a new one.

            let final_url = `${credentialsData.api_base_url}/service/account/CreateAccesscode/90d?account_code=${credentialsData.username}&account_password=${credentialsData.password}&format=json`

            const response = await handleAxiosCall(POST_METHOD, final_url, false, null, null);

            if (response) {
                const newAccessCode = response?.data?.api?.AccessCode;
                const newExpiryDate = response?.data?.api?.ExpireTime;
                const payload = {
                    token: newAccessCode,
                    tokenExpiry: newExpiryDate
                }
                await updateExternalAccountDetailsById(payload, credentialsData?.id)

                console.log(newAccessCode, "New Access Code ...");
                return newAccessCode;
            }
        }
    }
}


const handleAxiosCall = async (axiosMethod: string, api_url: string, isFormData: boolean, body: null, axiosHeaders: { Authorization: any; } | null) => {
    try {
        let headersObj: any = (axiosHeaders) ? {
            ...axiosPreConfig?.headers, "Authorization": axiosHeaders.Authorization,
        } : { ...axiosPreConfig?.headers }

        if (isFormData)
            headersObj = axiosHeaders

        let result: any
        await axios.post(api_url, body, {
            headers: headersObj
        }).then((response: any) => {
            result = response
        })
            .catch((error: any) => {
                console.log("Error Occured in Axios ...");
                throw error
            });

        return result?.data;
    } catch (error) {
        throw error;
    }
};
const addFundManagersData = async (final_url: string, schemeMasterColl: any) => {
    let bSuccess = false;
    if (!schemeMasterColl || schemeMasterColl.length == 0) return bSuccess;

    let counter = 0;
    let fundManagerCollRespObj: any = {}
    let fundManagersRespObj = []
    let fundManagersDetailObj: any[] = []
    let fundManagersEducationObj: any[] = []
    let mstarId = '', schemeISIN = ''


    let schemeFundManagerObj = {
        mstar_id: '',
        scheme_isin: '',
        manager_id: 0,
        manager_startdate: '',
        lead_manager: ''
    }

    while ((counter < schemeMasterColl.length)) {
        let schemeMasterObj = schemeMasterColl[counter];

        schemeISIN = schemeMasterObj?.schemeISIN

        const fundManagersData = await getSchemeFundManagers(schemeISIN)   //shruti mam ne galat kiya

        if (fundManagersData && fundManagersData?.length > 0) {
            counter++;

            continue;

        }

        let request_url = final_url.replace("<schemeISIN>", schemeISIN);

        await handleAxiosCall(POST_METHOD, request_url, false, null, null)
            .then(async (response) => {
                if (response) {
                    fundManagerCollRespObj = response?.data?.[0]?.api;
                    mstarId = response?.data?.[0]?.['_MstarId']

                    fundManagersRespObj = []
                    fundManagersDetailObj = []
                    fundManagersEducationObj = []

                    fundManagersRespObj = fundManagerCollRespObj?.['FM-Managers'];
                    fundManagersDetailObj = fundManagerCollRespObj?.['FMB-ManagerDetail'];
                    fundManagersEducationObj = fundManagerCollRespObj?.['FMCE-CollegeEducationDetail'];

                    await fundManagersRespObj?.map(async (managersObj: any) => {
                        const fundManagerEducationObj = await fundManagersEducationObj?.filter((eduObj) => eduObj?.ManagerId === managersObj?.ManagerId)

                        const fundManagerDetObj = await fundManagersDetailObj?.filter((detObj) => detObj?.ManagerId === managersObj?.ManagerId)

                        let fundManagerMasterObj = await getFundManagersbyMangerId(managersObj?.ManagerId)


                        let fundManagerId = null;
                        if (!fundManagerMasterObj) {
                            const obj = {
                                ms_managerId: managersObj?.ManagerId,
                                manager_name: managersObj?.Name,
                                manager_biography: fundManagerDetObj?.[0]?.ManagerProvidedBiography?.toString() || '',
                                manager_education: (await getEducationByColl(fundManagerEducationObj)).toString() || '',
                                manager_pic: '',
                                manager_age: (await getAgeByYearOfBirth(fundManagerDetObj?.[0]?.year_of_birth)).toString() || '',
                                inxits_score: '',
                                manager_exp: managersObj?.Tenure,
                            }

                            const add = await createFundManager(obj)
                            fundManagerId = add?.manager_id
                        }
                        else {
                            fundManagerId = fundManagerMasterObj?.manager_id;

                            schemeFundManagerObj = {
                                mstar_id: mstarId,
                                scheme_isin: schemeMasterObj?.schemeISIN,
                                manager_id: fundManagerId,
                                manager_startdate: managersObj?.StartDate,
                                lead_manager: (managersObj?.Display.toString().toLowerCase() === 'display as lead') ? 'Lead' : 'Co-Managed',
                            }

                            await createSchemeFundManager(schemeFundManagerObj)
                        }


                    })
                }
            })
            .catch((err) => console.log(err, "Error Occurred in Call ..." + schemeISIN));

        counter++;
    }
}
const handleSchemesAUMData = async (final_url: string, schemeMasterColl: any[]) => {
    let bSuccess = false;
    if (!schemeMasterColl || schemeMasterColl.length == 0) return bSuccess;

    let counter = 0;

    let schemePerformanceData = {}, schemeAUMData = {}, schemeAUMNewData: any = {};

    while ((counter < schemeMasterColl.length)) {
        let schemeMasterObj = schemeMasterColl[counter];

        const schemeISIN = schemeMasterObj?.schemeISIN;

        console.log(schemeISIN, "Scheme ISIN Current ...");

        let schemePerformanceData = await getSchemePerformance(schemeISIN)


        let schemeAUMData = {
            AUM: schemePerformanceData?.AUM,
            AUMDate: schemePerformanceData?.AUMDate,
            AUMPrevMonth: schemePerformanceData?.AUMPrevMonth,
            AUMPrevMonthDate: schemePerformanceData?.AUMPrevMonthDate,
        }

        let request_url = final_url.replace("<schemeISIN>", schemeISIN);

        let schemeAUMDetails: any = null;

        let schemePreviousMonthAUM: any = 0;
        let schemePreviousMonthAUMDate: any = "";

        await handleAxiosCall(POST_METHOD, request_url, false, null, null)
            .then(async (response) => {
                if (response) {
                    schemeAUMDetails = response?.data?.[0]?.api;

                    if (schemeAUMDetails
                    ) {
                        if (schemeAUMData) {
                            if ((schemeAUMDetails?.['FNA-AsOfOriginalReported']) &&
                                (schemeAUMDetails?.['FNA-AsOfOriginalReportedDate']) &&
                                await isNewDate(schemeAUMDetails?.['FNA-AsOfOriginalReportedDate'], schemeAUMData?.AUMDate)
                            ) {
                                schemePreviousMonthAUM = schemeAUMData?.AUM;
                                schemePreviousMonthAUMDate = schemeAUMData?.AUMDate;

                                schemeAUMNewData.AUM = (schemeAUMDetails?.['FNA-AsOfOriginalReported']) ? schemeAUMDetails?.['FNA-AsOfOriginalReported'] : 0;
                                schemeAUMNewData.AUMDate = (schemeAUMDetails?.['FNA-AsOfOriginalReportedDate']) ? schemeAUMDetails?.['FNA-AsOfOriginalReportedDate'] : null;
                                schemeAUMNewData.AUMPrevMonth = schemePreviousMonthAUM;
                                schemeAUMNewData.AUMPrevMonthDate = schemePreviousMonthAUMDate;
                            }

                            const schemePerformanceDetailId: any = schemePerformanceData?.id;
                            const updateData = await updateSchemePerformance(schemeAUMNewData, schemePerformanceDetailId)


                            console.log("Scheme AUM details updated for - ", schemeISIN);
                        }
                    }
                    //update the nav details for the scheme.
                    //also add the details in historical nav table.
                }
            })
            .catch((err) => {
                console.log(err, "Error Occurred in Call ..." + schemeISIN);
            });

        counter++;
    }
}

const handleSchemesPerformanceData = async (final_url: string, schemeMasterColl: any[]) => {
    let bSuccess = false;
    if (!schemeMasterColl || schemeMasterColl.length == 0) return bSuccess;

    let counter = 0;

    let schemePerformanceData: any = {}, schemePerformanceNewData: any = {};

    while ((counter < schemeMasterColl.length)) {
        let schemeMasterObj = schemeMasterColl[counter];
        console.log(counter, "Counter ...");
        const schemeISIN = schemeMasterObj?.schemeISIN;

        schemePerformanceData = await getSchemePerformance(schemeISIN)

        let request_url = final_url.replace("<schemeISIN>", schemeISIN);

        let schemePerformanceDetails: any = {};

        let schemePreviousNav = 0;
        let schemePreviousNavDate = "";
        let schemePreviousMonthAUM = 0;
        let schemePreviousMonthAUMDate = "";
        let schemeHistoricalNavObj = null;

        let newNavDateFound = false;

        await handleAxiosCall(POST_METHOD, request_url, false, null, null)
            .then(async (response) => {
                if (response) {
                    schemePerformanceDetails = response?.data?.[0]?.api;

                    if (schemePerformanceDetails
                    ) {
                        if (!schemePerformanceData)//if available found, then update performance data.
                        {
                            schemePerformanceData.scheme_id = schemeMasterObj?.id;
                            schemePerformanceData.MStarId = response?.data?.[0]?.['_MstarId'];
                            schemePerformanceData.ISIN = schemeISIN;
                            schemePerformanceData.OverallRating = (schemePerformanceDetails?.['MR-RatingOverall']) ? schemePerformanceDetails?.['MR-RatingOverall'] : null;
                            schemePerformanceData.Rating3Year = (schemePerformanceDetails?.['MR-Rating3Year']) ? schemePerformanceDetails?.['MR-Rating3Year'] : null;
                            schemePerformanceData.Rating5Year = (schemePerformanceDetails?.['MR-Rating5Year']) ? schemePerformanceDetails?.['MR-Rating5Year'] : null;
                            schemePerformanceData.Rating10Year = (schemePerformanceDetails?.['MR-Rating10Year']) ? schemePerformanceDetails?.['MR-Rating10Year'] : null;
                            schemePerformanceData.Return1d = (schemePerformanceDetails?.['DP-Return1Day']) ? schemePerformanceDetails?.['DP-Return1Day'] : null;
                            schemePerformanceData.Return1w = (schemePerformanceDetails?.['DP-Return1Week']) ? schemePerformanceDetails?.['DP-Return1Week'] : null;
                            schemePerformanceData.Return1mth = (schemePerformanceDetails?.['DP-Return1Mth']) ? schemePerformanceDetails?.['DP-Return1Mth'] : null;
                            schemePerformanceData.Return3mth = (schemePerformanceDetails?.['DP-Return3Mth']) ? schemePerformanceDetails?.['DP-Return3Mth'] : null;
                            schemePerformanceData.Return6mth = (schemePerformanceDetails?.['DP-Return6Mth']) ? schemePerformanceDetails?.['DP-Return6Mth'] : null;
                            schemePerformanceData.Return1yr = (schemePerformanceDetails?.['DP-Return1Yr']) ? schemePerformanceDetails?.['DP-Return1Yr'] : null;
                            schemePerformanceData.Returns2yr = (schemePerformanceDetails?.['DP-Return2Yr']) ? schemePerformanceDetails?.['DP-Return2Yr'] : null;
                            schemePerformanceData.Returns3yr = (schemePerformanceDetails?.['DP-Return3Yr']) ? schemePerformanceDetails?.['DP-Return3Yr'] : null;
                            schemePerformanceData.Returns5yr = (schemePerformanceDetails?.['DP-Return5Yr']) ? schemePerformanceDetails?.['DP-Return5Yr'] : null;
                            schemePerformanceData.Returns7yr = (schemePerformanceDetails?.['DP-Return7Yr']) ? schemePerformanceDetails?.['DP-Return7Yr'] : null;
                            schemePerformanceData.Returns10yr = (schemePerformanceDetails?.['DP-Return10Yr']) ? schemePerformanceDetails?.['DP-Return10Yr'] : null;
                            schemePerformanceData.Returns15yr = (schemePerformanceDetails?.['DP-Return15Yr']) ? schemePerformanceDetails?.['DP-Return15Yr'] : null;
                            schemePerformanceData.ReturnSinceIncep = (schemePerformanceDetails?.['DP-ReturnSinceInception']) ? schemePerformanceDetails?.['DP-ReturnSinceInception'] : null;
                            schemePerformanceData.ReturnYTD = (schemePerformanceDetails?.['DP-ReturnYTD']) ? schemePerformanceDetails?.['DP-ReturnYTD'] : null;
                            schemePerformanceData.CategoryAvgReturn1yr = (schemePerformanceDetails?.['DP-CategoryReturn1Yr']) ? schemePerformanceDetails?.['DP-CategoryReturn1Yr'] : null;
                            schemePerformanceData.CategoryAvgReturns2yr = (schemePerformanceDetails?.['TTR-CategoryReturn2Yr']) ? schemePerformanceDetails?.['TTR-CategoryReturn2Yr'] : null;
                            schemePerformanceData.CategoryAvgReturns3yr = (schemePerformanceDetails?.['DP-CategoryReturn3Yr']) ? schemePerformanceDetails?.['DP-CategoryReturn3Yr'] : null;
                            schemePerformanceData.CategoryAvgReturns5yr = (schemePerformanceDetails?.['DP-CategoryReturn5Yr']) ? schemePerformanceDetails?.['DP-CategoryReturn5Yr'] : null;
                            schemePerformanceData.CategoryAvgReturns10yr = (schemePerformanceDetails?.['DP-CategoryReturn10Yr']) ? schemePerformanceDetails?.['DP-CategoryReturn10Yr'] : null;
                            schemePerformanceData.CategoryAvgReturns15yr = (schemePerformanceDetails?.['DP-CategoryReturn15Yr']) ? schemePerformanceDetails?.['DP-CategoryReturn15Yr'] : null;
                            schemePerformanceData.AUMPrevMonth = 0;
                            schemePerformanceData.AUMPrevMonthDate = new Date(schemePerformanceDetails?.['FNA-AsOfOriginalReportedDate']);
                            schemePerformanceData.AUMPrevYear = 0;

                            schemePerformanceData.AUM = (schemePerformanceDetails?.['FNA-AsOfOriginalReported']) ? schemePerformanceDetails?.['FNA-AsOfOriginalReported'] : 0;
                            schemePerformanceData.AUMDate = (schemePerformanceDetails?.['FNA-AsOfOriginalReportedDate']) ? schemePerformanceDetails?.['FNA-AsOfOriginalReportedDate'] : null;

                            if (schemePerformanceDetails?.['TS-DayEndNAV']) {
                                schemePerformanceData.Nav = parseFloat(schemePerformanceDetails?.['TS-DayEndNAV']);
                                schemePerformanceData.NavDate = schemePerformanceDetails?.['TS-DayEndNAVDate'];
                            }
                            await createSchemePerformance(schemePerformanceData)
                            console.log("Scheme performance details created for - ", schemeISIN);
                        }
                        else {//create new performance entry for a scheme.
                            schemePerformanceNewData.OverallRating = (schemePerformanceDetails?.['MR-RatingOverall']) ? schemePerformanceDetails?.['MR-RatingOverall'] : null;
                            schemePerformanceNewData.Rating3Year = (schemePerformanceDetails?.['MR-Rating3Year']) ? schemePerformanceDetails?.['MR-Rating3Year'] : null;
                            schemePerformanceNewData.Rating5Year = (schemePerformanceDetails?.['MR-Rating5Year']) ? schemePerformanceDetails?.['MR-Rating5Year'] : null;
                            schemePerformanceNewData.Rating10Year = (schemePerformanceDetails?.['MR-Rating10Year']) ? schemePerformanceDetails?.['MR-Rating10Year'] : null;
                            schemePerformanceNewData.Return1d = (schemePerformanceDetails?.['DP-Return1Day']) ? schemePerformanceDetails?.['DP-Return1Day'] : null;
                            schemePerformanceNewData.Return1w = (schemePerformanceDetails?.['DP-Return1Week']) ? schemePerformanceDetails?.['DP-Return1Week'] : null;
                            schemePerformanceNewData.Return1mth = (schemePerformanceDetails?.['DP-Return1Mth']) ? schemePerformanceDetails?.['DP-Return1Mth'] : null;
                            schemePerformanceNewData.Return3mth = (schemePerformanceDetails?.['DP-Return3Mth']) ? schemePerformanceDetails?.['DP-Return3Mth'] : null;
                            schemePerformanceNewData.Return6mth = (schemePerformanceDetails?.['DP-Return6Mth']) ? schemePerformanceDetails?.['DP-Return6Mth'] : null;
                            schemePerformanceNewData.Return1yr = (schemePerformanceDetails?.['DP-Return1Yr']) ? schemePerformanceDetails?.['DP-Return1Yr'] : null;
                            schemePerformanceNewData.Returns2yr = (schemePerformanceDetails?.['DP-Return2Yr']) ? schemePerformanceDetails?.['DP-Return2Yr'] : null;
                            schemePerformanceNewData.Returns3yr = (schemePerformanceDetails?.['DP-Return3Yr']) ? schemePerformanceDetails?.['DP-Return3Yr'] : null;
                            schemePerformanceNewData.Returns5yr = (schemePerformanceDetails?.['DP-Return5Yr']) ? schemePerformanceDetails?.['DP-Return5Yr'] : null;
                            schemePerformanceNewData.Returns7yr = (schemePerformanceDetails?.['DP-Return7Yr']) ? schemePerformanceDetails?.['DP-Return7Yr'] : null;
                            schemePerformanceNewData.Returns10yr = (schemePerformanceDetails?.['DP-Return10Yr']) ? schemePerformanceDetails?.['DP-Return10Yr'] : null;
                            schemePerformanceNewData.Returns15yr = (schemePerformanceDetails?.['DP-Return15Yr']) ? schemePerformanceDetails?.['DP-Return15Yr'] : null;
                            schemePerformanceNewData.ReturnSinceIncep = (schemePerformanceDetails?.['DP-ReturnSinceInception']) ? schemePerformanceDetails?.['DP-ReturnSinceInception'] : null;
                            schemePerformanceNewData.ReturnYTD = (schemePerformanceDetails?.['DP-ReturnYTD']) ? schemePerformanceDetails?.['DP-ReturnYTD'] : null;
                            schemePerformanceNewData.CategoryAvgReturn1yr = (schemePerformanceDetails?.['DP-CategoryReturn1Yr']) ? schemePerformanceDetails?.['DP-CategoryReturn1Yr'] : null;
                            schemePerformanceNewData.CategoryAvgReturns2yr = (schemePerformanceDetails?.['TTR-CategoryReturn2Yr']) ? schemePerformanceDetails?.['TTR-CategoryReturn2Yr'] : null;
                            schemePerformanceNewData.CategoryAvgReturns3yr = (schemePerformanceDetails?.['DP-CategoryReturn3Yr']) ? schemePerformanceDetails?.['DP-CategoryReturn3Yr'] : null;
                            schemePerformanceNewData.CategoryAvgReturns5yr = (schemePerformanceDetails?.['DP-CategoryReturn5Yr']) ? schemePerformanceDetails?.['DP-CategoryReturn5Yr'] : null;
                            schemePerformanceNewData.CategoryAvgReturns10yr = (schemePerformanceDetails?.['DP-CategoryReturn10Yr']) ? schemePerformanceDetails?.['DP-CategoryReturn10Yr'] : null;
                            schemePerformanceNewData.CategoryAvgReturns15yr = (schemePerformanceDetails?.['DP-CategoryReturn15Yr']) ? schemePerformanceDetails?.['DP-CategoryReturn15Yr'] : null;
                            schemePerformanceNewData.AUMPrevYear = 0

                            if ((schemePerformanceDetails?.['FNA-AsOfOriginalReported']) &&
                                (schemePerformanceDetails?.['FNA-AsOfOriginalReportedDate']) &&
                                await isNewDate(schemePerformanceDetails?.['FNA-AsOfOriginalReportedDate'], schemePerformanceData?.AUMDate)
                            ) {
                                schemePreviousMonthAUM = schemePerformanceData?.AUM;
                                schemePreviousMonthAUMDate = schemePerformanceData?.AUMDate;
                                schemePerformanceNewData.AUM = (schemePerformanceDetails?.['FNA-AsOfOriginalReported']) ? schemePerformanceDetails?.['FNA-AsOfOriginalReported'] : 0;
                                schemePerformanceNewData.AUMDate = (schemePerformanceDetails?.['FNA-AsOfOriginalReportedDate']) ? schemePerformanceDetails?.['FNA-AsOfOriginalReportedDate'] : null;
                                schemePerformanceNewData.AUMPrevMonth = schemePreviousMonthAUM;
                                schemePerformanceNewData.AUMPrevMonthDate = schemePreviousMonthAUMDate;
                                schemePerformanceNewData.AUMPrevYear = 0;
                                schemePerformanceNewData.AUMPrevYearDate = null;
                            }
                            if (schemePerformanceDetails?.['TS-DayEndNAV']
                                && schemePerformanceDetails?.['TS-DayEndNAVDate']
                                && await isNewDate(schemePerformanceDetails?.['TS-DayEndNAVDate'], schemePerformanceData?.NavDate)
                            ) {
                                schemePreviousNav = schemePerformanceData?.Nav;
                                schemePreviousNavDate = schemePerformanceData?.NavDate;
                                schemePerformanceNewData.Nav = parseFloat(schemePerformanceDetails?.['TS-DayEndNAV']);
                                schemePerformanceNewData.NavDate = schemePerformanceDetails?.['TS-DayEndNAVDate'];

                                newNavDateFound = true;
                            }

                            const schemePerformanceDetailId = schemePerformanceData?.id;
                            if (newNavDateFound) {
                                schemeHistoricalNavObj = {
                                    scheme_id: schemePerformanceDetailId,
                                    Value: schemePreviousNav,
                                    Value_Date: schemePreviousNavDate
                                }
                            } else {
                                schemeHistoricalNavObj = null
                            }

                            const updateData = await updateSchemePerformance(schemePerformanceNewData, schemePerformanceDetailId)

                            // if (updateData) {
                            //     console.log("newNavDateFound ", newNavDateFound);
                            //     if (newNavDateFound) {
                            //         if ( schemeHistoricalNavObj && schemeHistoricalNavObj.Value_Date && !isWeekend(schemeHistoricalNavObj.Value_Date)) {
                            //         await createSchemeHistoricalNav(schemeHistoricalNavObj);
                            //         console.log("Scheme historical nav details created for - ", schemeISIN);
                            //         }
                            //     }

                            //     console.log("Scheme performance details updated for - ", schemeISIN);
                            // }
                        }
                    }


                    //update the nav details for the scheme.
                    //also add the details in historical nav table.
                }
                counter++;
            })
            .catch((err) => {

                counter++;
            }
            );

    }
}

const handleSchemesRiskRatioData = async (final_url: string, schemeMasterColl: any[]) => {
    let bSuccess = false;
    if (!schemeMasterColl || schemeMasterColl.length == 0) return bSuccess;

    let counter = 0;

    let schemeRiskRatioData: any = {}, schemeRiskRatioNewData: any = {};

    let schemesFailedLogs: any[] = [];

    while ((counter < schemeMasterColl.length)) {
        let schemeMasterObj = schemeMasterColl[counter];

        const schemeISIN = schemeMasterObj?.schemeISIN;

        schemeRiskRatioData = await getSchemeRiskRatio(schemeISIN)

        let request_url = final_url.replace("<schemeISIN>", schemeISIN);

        let schemeRiskRatioDetails: any = {};

        await handleAxiosCall(POST_METHOD, request_url, false, null, null)
            .then(async (response) => {
                if (response) {
                    schemeRiskRatioDetails = response?.data?.[0]?.api;

                    if (schemeRiskRatioDetails
                    ) {
                        if (!schemeRiskRatioData)//if available found, then update performance data.
                        {
                            schemeRiskRatioData.scheme_id = schemeMasterObj?.id;
                            schemeRiskRatioData.MStarId = response?.data?.[0]?.['_MstarId'];
                            schemeRiskRatioData.ISIN = schemeISIN;
                            schemeRiskRatioData.StandardDeviation1Yr = (schemeRiskRatioDetails?.['RM-StdDev1Yr']) ? schemeRiskRatioDetails?.['RM-StdDev1Yr'] : null;
                            schemeRiskRatioData.StandardDeviation3Yr = (schemeRiskRatioDetails?.['RM-StdDev3Yr']) ? schemeRiskRatioDetails?.['RM-StdDev3Yr'] : null;
                            schemeRiskRatioData.StandardDeviation5Yr = (schemeRiskRatioDetails?.['RM-StdDev5Yr']) ? schemeRiskRatioDetails?.['RM-StdDev5Yr'] : null;
                            schemeRiskRatioData.StandardDeviation10Yr = (schemeRiskRatioDetails?.['RM-StdDev10Yr']) ? schemeRiskRatioDetails?.['RM-StdDev10Yr'] : null;
                            schemeRiskRatioData.SharpeRatio1Yr = (schemeRiskRatioDetails?.['RM-SharpeRatio1Yr']) ? schemeRiskRatioDetails?.['RM-SharpeRatio1Yr'] : null;
                            schemeRiskRatioData.SharpeRatio3Yr = (schemeRiskRatioDetails?.['RM-SharpeRatio3Yr']) ? schemeRiskRatioDetails?.['RM-SharpeRatio3Yr'] : null;
                            schemeRiskRatioData.SharpeRatio5Yr = (schemeRiskRatioDetails?.['RM-SharpeRatio5Yr']) ? schemeRiskRatioDetails?.['RM-SharpeRatio5Yr'] : null;
                            schemeRiskRatioData.SharpeRatio10Yr = (schemeRiskRatioDetails?.['RM-SharpeRatio10Yr']) ? schemeRiskRatioDetails?.['RM-SharpeRatio10Yr'] : null;
                            schemeRiskRatioData.SortinoRatio1Yr = (schemeRiskRatioDetails?.['RM-SortinoRatio1Yr']) ? schemeRiskRatioDetails?.['RM-SortinoRatio1Yr'] : null;
                            schemeRiskRatioData.SortinoRatio3Yr = (schemeRiskRatioDetails?.['RM-SortinoRatio3Yr']) ? schemeRiskRatioDetails?.['RM-SortinoRatio3Yr'] : null;
                            schemeRiskRatioData.SortinoRatio5Yr = (schemeRiskRatioDetails?.['RM-SortinoRatio5Yr']) ? schemeRiskRatioDetails?.['RM-SortinoRatio5Yr'] : null;
                            schemeRiskRatioData.SortinoRatio10Yr = (schemeRiskRatioDetails?.['RM-SortinoRatio10Yr']) ? schemeRiskRatioDetails?.['RM-SortinoRatio10Yr'] : null;
                            schemeRiskRatioData.Alpha1Yr = (schemeRiskRatioDetails?.['RMP-Alpha1Yr']) ? schemeRiskRatioDetails?.['RMP-Alpha1Yr'] : null;
                            schemeRiskRatioData.Alpha3Yr = (schemeRiskRatioDetails?.['RMP-Alpha3Yr']) ? schemeRiskRatioDetails?.['RMP-Alpha3Yr'] : null;
                            schemeRiskRatioData.Alpha5Yr = (schemeRiskRatioDetails?.['RMP-Alpha5Yr']) ? schemeRiskRatioDetails?.['RMP-Alpha5Yr'] : null;
                            schemeRiskRatioData.Alpha10Yr = (schemeRiskRatioDetails?.['RMP-Alpha10Yr']) ? schemeRiskRatioDetails?.['RMP-Alpha10Yr'] : null;
                            schemeRiskRatioData.Beta1Yr = (schemeRiskRatioDetails?.['RMP-Beta1Yr']) ? schemeRiskRatioDetails?.['RMP-Beta1Yr'] : null;
                            schemeRiskRatioData.Beta3Yr = (schemeRiskRatioDetails?.['RMP-Beta3Yr']) ? schemeRiskRatioDetails?.['RMP-Beta3Yr'] : null;
                            schemeRiskRatioData.Beta5Yr = (schemeRiskRatioDetails?.['RMP-Beta5Yr']) ? schemeRiskRatioDetails?.['RMP-Beta5Yr'] : null;
                            schemeRiskRatioData.Beta10Yr = (schemeRiskRatioDetails?.['RMP-Beta10Yr']) ? schemeRiskRatioDetails?.['RMP-Beta10Yr'] : null;
                            schemeRiskRatioData.RSquared1Yr = (schemeRiskRatioDetails?.['RMP-Rsquared1Yr']) ? schemeRiskRatioDetails?.['RMP-Rsquared1Yr'] : null;
                            schemeRiskRatioData.RSquared1Yr = (schemeRiskRatioDetails?.['RMP-Rsquared3Yr']) ? schemeRiskRatioDetails?.['RMP-Rsquared3Yr'] : null;
                            schemeRiskRatioData.RSquared1Yr = (schemeRiskRatioDetails?.['RMP-Rsquared5Yr']) ? schemeRiskRatioDetails?.['RMP-Rsquared5Yr'] : null;
                            schemeRiskRatioData.RSquared1Yr = (schemeRiskRatioDetails?.['RMP-Rsquared10Yr']) ? schemeRiskRatioDetails?.['RMP-Rsquared10Yr'] : null;
                            schemeRiskRatioData.CaptureUpside1Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioUpside1Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioUpside1Yr'] : null;
                            schemeRiskRatioData.CaptureUpside3Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioUpside3Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioUpside3Yr'] : null;
                            schemeRiskRatioData.CaptureUpside5Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioUpside5Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioUpside5Yr'] : null;
                            schemeRiskRatioData.CaptureUpside10Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioUpside10Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioUpside10Yr'] : null;
                            schemeRiskRatioData.CaptureDownside1Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioDownside1Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioDownside1Yr'] : null;
                            schemeRiskRatioData.CaptureDownside3Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioDownside3Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioDownside3Yr'] : null;
                            schemeRiskRatioData.CaptureDownside5Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioDownside5Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioDownside5Yr'] : null;
                            schemeRiskRatioData.CaptureDownside10Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioDownside10Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioDownside10Yr'] : null;
                            schemeRiskRatioData.MaxDrawdown1Yr = (schemeRiskRatioDetails?.['RM-MaxDrawdown1Yr']) ? schemeRiskRatioDetails?.['RM-MaxDrawdown1Yr'] : null;
                            schemeRiskRatioData.MaxDrawdown3Yr = (schemeRiskRatioDetails?.['RM-MaxDrawdown3Yr']) ? schemeRiskRatioDetails?.['RM-MaxDrawdown3Yr'] : null;
                            schemeRiskRatioData.MaxDrawdown5Yr = (schemeRiskRatioDetails?.['RM-MaxDrawdown5Yr']) ? schemeRiskRatioDetails?.['RM-MaxDrawdown5Yr'] : null;
                            schemeRiskRatioData.MaxDrawdown10Yr = (schemeRiskRatioDetails?.['RM-MaxDrawdown10Yr']) ? schemeRiskRatioDetails?.['RM-MaxDrawdown10Yr'] : null;
                            schemeRiskRatioData.Treynor1Yr = (schemeRiskRatioDetails?.['RMP-TreynorRatio1Yr']) ? schemeRiskRatioDetails?.['RMP-TreynorRatio1Yr'] : null;
                            schemeRiskRatioData.Treynor3Yr = (schemeRiskRatioDetails?.['RMP-TreynorRatio3Yr']) ? schemeRiskRatioDetails?.['RMP-TreynorRatio3Yr'] : null;
                            schemeRiskRatioData.Treynor5Yr = (schemeRiskRatioDetails?.['RMP-TreynorRatio5Yr']) ? schemeRiskRatioDetails?.['RMP-TreynorRatio5Yr'] : null;
                            schemeRiskRatioData.Treynor10Yr = (schemeRiskRatioDetails?.['RMP-TreynorRatio10Yr']) ? schemeRiskRatioDetails?.['RMP-TreynorRatio10Yr'] : null;
                            schemeRiskRatioData.Information1Yr = (schemeRiskRatioDetails?.['RMP-InformationRatio1Yr']) ? schemeRiskRatioDetails?.['RMP-InformationRatio1Yr'] : null;
                            schemeRiskRatioData.Information3Yr = (schemeRiskRatioDetails?.['RMP-InformationRatio3Yr']) ? schemeRiskRatioDetails?.['RMP-InformationRatio3Yr'] : null;
                            schemeRiskRatioData.Information5Yr = (schemeRiskRatioDetails?.['RMP-InformationRatio5Yr']) ? schemeRiskRatioDetails?.['RMP-InformationRatio5Yr'] : null;
                            schemeRiskRatioData.Information10Yr = (schemeRiskRatioDetails?.['RMP-InformationRatio10Yr']) ? schemeRiskRatioDetails?.['RMP-InformationRatio10Yr'] : null;
                            schemeRiskRatioData.Mean1Yr = (schemeRiskRatioDetails?.['RM-Mean1Yr']) ? schemeRiskRatioDetails?.['RM-Mean1Yr'] : null;
                            schemeRiskRatioData.Mean3Yr = (schemeRiskRatioDetails?.['RM-Mean3Yr']) ? schemeRiskRatioDetails?.['RM-Mean3Yr'] : null;
                            schemeRiskRatioData.Mean5Yr = (schemeRiskRatioDetails?.['RM-Mean5Yr']) ? schemeRiskRatioDetails?.['RM-Mean5Yr'] : null;
                            schemeRiskRatioData.Mean10Yr = (schemeRiskRatioDetails?.['RM-Mean10Yr']) ? schemeRiskRatioDetails?.['RM-Mean10Yr'] : null;
                            schemeRiskRatioData.TrackingError1Yr = (schemeRiskRatioDetails?.['RMP-TrackingError1Yr']) ? schemeRiskRatioDetails?.['RMP-TrackingError1Yr'] : null;
                            schemeRiskRatioData.TrackingError3Yr = (schemeRiskRatioDetails?.['RMP-TrackingError3Yr']) ? schemeRiskRatioDetails?.['RMP-TrackingError3Yr'] : null;
                            schemeRiskRatioData.TrackingError5Yr = (schemeRiskRatioDetails?.['RMP-TrackingError5Yr']) ? schemeRiskRatioDetails?.['RMP-TrackingError5Yr'] : null;
                            schemeRiskRatioData.TrackingError10Yr = (schemeRiskRatioDetails?.['RMP-TrackingError10Yr']) ? schemeRiskRatioDetails?.['RMP-TrackingError10Yr'] : null;


                            if ((schemeRiskRatioDetails?.['ARFS-AnnualReportTurnoverRatio']) &&
                                (schemeRiskRatioDetails?.['ARFS-AnnualReportTurnoverRatioDate'])) {
                                schemeRiskRatioData.AnnualReportTurnoverRatio = (schemeRiskRatioDetails?.['ARFS-AnnualReportTurnoverRatio']) ? schemeRiskRatioDetails?.['ARFS-AnnualReportTurnoverRatio'] : null;
                                schemeRiskRatioData.AnnualReportTurnoverRatioDate = (schemeRiskRatioDetails?.['ARFS-AnnualReportTurnoverRatioDate']) ? schemeRiskRatioDetails?.['ARFS-AnnualReportTurnoverRatioDate'] : null;
                            }

                            await createSchemeRiskRatio(schemeRiskRatioData);
                            console.log("Scheme risk ratio details created for - ", schemeISIN);
                        }
                        else {//create new performance entry for a scheme.

                            schemeRiskRatioNewData.StandardDeviation1Yr = (schemeRiskRatioDetails?.['RM-StdDev1Yr']) ? schemeRiskRatioDetails?.['RM-StdDev1Yr'] : null;
                            schemeRiskRatioNewData.StandardDeviation3Yr = (schemeRiskRatioDetails?.['RM-StdDev3Yr']) ? schemeRiskRatioDetails?.['RM-StdDev3Yr'] : null;
                            schemeRiskRatioNewData.StandardDeviation5Yr = (schemeRiskRatioDetails?.['RM-StdDev5Yr']) ? schemeRiskRatioDetails?.['RM-StdDev5Yr'] : null;
                            schemeRiskRatioNewData.StandardDeviation10Yr = (schemeRiskRatioDetails?.['RM-StdDev10Yr']) ? schemeRiskRatioDetails?.['RM-StdDev10Yr'] : null;
                            schemeRiskRatioNewData.SharpeRatio1Yr = (schemeRiskRatioDetails?.['RM-SharpeRatio1Yr']) ? schemeRiskRatioDetails?.['RM-SharpeRatio1Yr'] : null;
                            schemeRiskRatioNewData.SharpeRatio3Yr = (schemeRiskRatioDetails?.['RM-SharpeRatio3Yr']) ? schemeRiskRatioDetails?.['RM-SharpeRatio3Yr'] : null;
                            schemeRiskRatioNewData.SharpeRatio5Yr = (schemeRiskRatioDetails?.['RM-SharpeRatio5Yr']) ? schemeRiskRatioDetails?.['RM-SharpeRatio5Yr'] : null;
                            schemeRiskRatioNewData.SharpeRatio10Yr = (schemeRiskRatioDetails?.['RM-SharpeRatio10Yr']) ? schemeRiskRatioDetails?.['RM-SharpeRatio10Yr'] : null;
                            schemeRiskRatioNewData.SortinoRatio1Yr = (schemeRiskRatioDetails?.['RM-SortinoRatio1Yr']) ? schemeRiskRatioDetails?.['RM-SortinoRatio1Yr'] : null;
                            schemeRiskRatioNewData.SortinoRatio3Yr = (schemeRiskRatioDetails?.['RM-SortinoRatio3Yr']) ? schemeRiskRatioDetails?.['RM-SortinoRatio3Yr'] : null;
                            schemeRiskRatioNewData.SortinoRatio5Yr = (schemeRiskRatioDetails?.['RM-SortinoRatio5Yr']) ? schemeRiskRatioDetails?.['RM-SortinoRatio5Yr'] : null;
                            schemeRiskRatioNewData.SortinoRatio10Yr = (schemeRiskRatioDetails?.['RM-SortinoRatio10Yr']) ? schemeRiskRatioDetails?.['RM-SortinoRatio10Yr'] : null;
                            schemeRiskRatioNewData.Alpha1Yr = (schemeRiskRatioDetails?.['RMP-Alpha1Yr']) ? schemeRiskRatioDetails?.['RMP-Alpha1Yr'] : null;
                            schemeRiskRatioNewData.Alpha3Yr = (schemeRiskRatioDetails?.['RMP-Alpha3Yr']) ? schemeRiskRatioDetails?.['RMP-Alpha3Yr'] : null;
                            schemeRiskRatioNewData.Alpha5Yr = (schemeRiskRatioDetails?.['RMP-Alpha5Yr']) ? schemeRiskRatioDetails?.['RMP-Alpha5Yr'] : null;
                            schemeRiskRatioNewData.Alpha10Yr = (schemeRiskRatioDetails?.['RMP-Alpha10Yr']) ? schemeRiskRatioDetails?.['RMP-Alpha10Yr'] : null;
                            schemeRiskRatioNewData.Beta1Yr = (schemeRiskRatioDetails?.['RMP-Beta1Yr']) ? schemeRiskRatioDetails?.['RMP-Beta1Yr'] : null;
                            schemeRiskRatioNewData.Beta3Yr = (schemeRiskRatioDetails?.['RMP-Beta3Yr']) ? schemeRiskRatioDetails?.['RMP-Beta3Yr'] : null;
                            schemeRiskRatioNewData.Beta5Yr = (schemeRiskRatioDetails?.['RMP-Beta5Yr']) ? schemeRiskRatioDetails?.['RMP-Beta5Yr'] : null;
                            schemeRiskRatioNewData.Beta10Yr = (schemeRiskRatioDetails?.['RMP-Beta10Yr']) ? schemeRiskRatioDetails?.['RMP-Beta10Yr'] : null;
                            schemeRiskRatioNewData.RSquared1Yr = (schemeRiskRatioDetails?.['RMP-Rsquared1Yr']) ? schemeRiskRatioDetails?.['RMP-Rsquared1Yr'] : null;
                            schemeRiskRatioNewData.RSquared3Yr = (schemeRiskRatioDetails?.['RMP-Rsquared3Yr']) ? schemeRiskRatioDetails?.['RMP-Rsquared3Yr'] : null;
                            schemeRiskRatioNewData.RSquared5Yr = (schemeRiskRatioDetails?.['RMP-Rsquared5Yr']) ? schemeRiskRatioDetails?.['RMP-Rsquared5Yr'] : null;
                            schemeRiskRatioNewData.RSquared10Yr = (schemeRiskRatioDetails?.['RMP-Rsquared10Yr']) ? schemeRiskRatioDetails?.['RMP-Rsquared10Yr'] : null;
                            schemeRiskRatioNewData.CaptureUpside1Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioUpside1Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioUpside1Yr'] : null;
                            schemeRiskRatioNewData.CaptureUpside3Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioUpside3Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioUpside3Yr'] : null;
                            schemeRiskRatioNewData.CaptureUpside5Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioUpside5Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioUpside5Yr'] : null;
                            schemeRiskRatioNewData.CaptureUpside10Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioUpside10Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioUpside10Yr'] : null;
                            schemeRiskRatioNewData.CaptureDownside1Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioDownside1Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioDownside1Yr'] : null;
                            schemeRiskRatioNewData.CaptureDownside3Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioDownside3Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioDownside3Yr'] : null;
                            schemeRiskRatioNewData.CaptureDownside5Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioDownside5Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioDownside5Yr'] : null;
                            schemeRiskRatioNewData.CaptureDownside10Yr = (schemeRiskRatioDetails?.['RMP-CaptureRatioDownside10Yr']) ? schemeRiskRatioDetails?.['RMP-CaptureRatioDownside10Yr'] : null;
                            schemeRiskRatioNewData.MaxDrawdown1Yr = (schemeRiskRatioDetails?.['RM-MaxDrawdown1Yr']) ? schemeRiskRatioDetails?.['RM-MaxDrawdown1Yr'] : null;
                            schemeRiskRatioNewData.MaxDrawdown3Yr = (schemeRiskRatioDetails?.['RM-MaxDrawdown3Yr']) ? schemeRiskRatioDetails?.['RM-MaxDrawdown3Yr'] : null;
                            schemeRiskRatioNewData.MaxDrawdown5Yr = (schemeRiskRatioDetails?.['RM-MaxDrawdown5Yr']) ? schemeRiskRatioDetails?.['RM-MaxDrawdown5Yr'] : null;
                            schemeRiskRatioNewData.MaxDrawdown10Yr = (schemeRiskRatioDetails?.['RM-MaxDrawdown10Yr']) ? schemeRiskRatioDetails?.['RM-MaxDrawdown10Yr'] : null;
                            schemeRiskRatioNewData.Treynor1Yr = (schemeRiskRatioDetails?.['RMP-TreynorRatio1Yr']) ? schemeRiskRatioDetails?.['RMP-TreynorRatio1Yr'] : null;
                            schemeRiskRatioNewData.Treynor3Yr = (schemeRiskRatioDetails?.['RMP-TreynorRatio3Yr']) ? schemeRiskRatioDetails?.['RMP-TreynorRatio3Yr'] : null;
                            schemeRiskRatioNewData.Treynor5Yr = (schemeRiskRatioDetails?.['RMP-TreynorRatio5Yr']) ? schemeRiskRatioDetails?.['RMP-TreynorRatio5Yr'] : null;
                            schemeRiskRatioNewData.Treynor10Yr = (schemeRiskRatioDetails?.['RMP-TreynorRatio10Yr']) ? schemeRiskRatioDetails?.['RMP-TreynorRatio10Yr'] : null;
                            schemeRiskRatioNewData.Information1Yr = (schemeRiskRatioDetails?.['RMP-InformationRatio1Yr']) ? schemeRiskRatioDetails?.['RMP-InformationRatio1Yr'] : null;
                            schemeRiskRatioNewData.Information3Yr = (schemeRiskRatioDetails?.['RMP-InformationRatio3Yr']) ? schemeRiskRatioDetails?.['RMP-InformationRatio3Yr'] : null;
                            schemeRiskRatioNewData.Information5Yr = (schemeRiskRatioDetails?.['RMP-InformationRatio5Yr']) ? schemeRiskRatioDetails?.['RMP-InformationRatio5Yr'] : null;
                            schemeRiskRatioNewData.Information10Yr = (schemeRiskRatioDetails?.['RMP-InformationRatio10Yr']) ? schemeRiskRatioDetails?.['RMP-InformationRatio10Yr'] : null;
                            schemeRiskRatioNewData.Mean1Yr = (schemeRiskRatioDetails?.['RM-Mean1Yr']) ? schemeRiskRatioDetails?.['RM-Mean1Yr'] : null;
                            schemeRiskRatioNewData.Mean3Yr = (schemeRiskRatioDetails?.['RM-Mean3Yr']) ? schemeRiskRatioDetails?.['RM-Mean3Yr'] : null;
                            schemeRiskRatioNewData.Mean5Yr = (schemeRiskRatioDetails?.['RM-Mean5Yr']) ? schemeRiskRatioDetails?.['RM-Mean5Yr'] : null;
                            schemeRiskRatioNewData.Mean10Yr = (schemeRiskRatioDetails?.['RM-Mean10Yr']) ? schemeRiskRatioDetails?.['RM-Mean10Yr'] : null;
                            schemeRiskRatioNewData.TrackingError1Yr = (schemeRiskRatioDetails?.['RMP-TrackingError1Yr']) ? schemeRiskRatioDetails?.['RMP-TrackingError1Yr'] : null;
                            schemeRiskRatioNewData.TrackingError3Yr = (schemeRiskRatioDetails?.['RMP-TrackingError3Yr']) ? schemeRiskRatioDetails?.['RMP-TrackingError3Yr'] : null;
                            schemeRiskRatioNewData.TrackingError5Yr = (schemeRiskRatioDetails?.['RMP-TrackingError5Yr']) ? schemeRiskRatioDetails?.['RMP-TrackingError5Yr'] : null;
                            schemeRiskRatioNewData.TrackingError10Yr = (schemeRiskRatioDetails?.['RMP-TrackingError10Yr']) ? schemeRiskRatioDetails?.['RMP-TrackingError10Yr'] : null;

                            if ((schemeRiskRatioDetails?.['ARFS-AnnualReportTurnoverRatio']) &&
                                (schemeRiskRatioDetails?.['ARFS-AnnualReportTurnoverRatioDate']) &&
                                await isNewDate(schemeRiskRatioDetails?.['ARFS-AnnualReportTurnoverRatioDate'], schemeRiskRatioData?.AnnualReportTurnoverRatioDate)
                            ) {
                                schemeRiskRatioNewData.AnnualReportTurnoverRatio = (schemeRiskRatioDetails?.['ARFS-AnnualReportTurnoverRatio']) ? schemeRiskRatioDetails?.['ARFS-AnnualReportTurnoverRatio'] : null;
                                schemeRiskRatioNewData.AnnualReportTurnoverRatioDate = (schemeRiskRatioDetails?.['ARFS-AnnualReportTurnoverRatioDate']) ? schemeRiskRatioDetails?.['ARFS-AnnualReportTurnoverRatioDate'] : null;
                            }

                            const schemeRiskRatioDetailId = schemeRiskRatioData?.id;
                            const updateData = await updateSchemeRiskRatio(schemeRiskRatioNewData, schemeRiskRatioDetailId)
                            console.log("Scheme risk ratio details updated for - ", schemeISIN);

                        }
                    }
                    //update the nav details for the scheme.
                    //also add the details in historical nav table.
                }
            })
            .catch((err) => {
                schemesFailedLogs.push(schemeISIN);
            });

        counter++;
    }

    if (schemesFailedLogs && schemesFailedLogs.length > 0)
        console.log("Failed logs ", schemesFailedLogs);
}
const handleSchemesHistoricalNavData = async (final_url: string, final_url_with_date_filter: string, schemeMasterColl: any[]) => {
    let bSuccess = false;
    if (!schemeMasterColl || schemeMasterColl.length == 0) return bSuccess;

    let counter = 0;
    let schemeISIN = '', schemeId = 0;
    let schemeHistoricalNavObj = null;
    let schemeNavMaxDate = null;
    let currentDate = new Date();
    let previousDate = new Date(currentDate);

    previousDate.setDate(currentDate.getDate() - 1);

    while ((counter < schemeMasterColl.length)) {
        let schemeMasterObj = schemeMasterColl[counter];

        schemeISIN = schemeMasterObj?.schemeISIN;
        schemeId = schemeMasterObj?.id;

        try {
            schemeHistoricalNavObj = await findSchemeHistoricalNav(schemeId)

            let request_url = "";

            if (schemeHistoricalNavObj) {
                // schemeNavMaxDate = new Date(Math.max(...schemeHistoricalNavObj.map(navObj => navObj?.Value_Date?.getTime())));
                let maxDate = new Date(schemeHistoricalNavObj.Value_Date);
                maxDate.setDate(maxDate.getDate() + 1); // Increment by one day to get the next date
                console.log(maxDate, "Max Date ...", previousDate);

                request_url = final_url_with_date_filter.replace("<schemeISIN>", schemeISIN)
                    .replace("<startdate>", dateFormat(maxDate))
                    .replace("<enddate>", dateFormat(previousDate));
            }
            else {
                request_url = final_url.replace("<schemeISIN>", schemeISIN);
            }

            console.log(request_url, "Scheme Historical NAV URL ...");

            let schemeHistoricalNavDetails = [];

            let historicalNavArray = [];

            let navCounter = 0;

            await handleAxiosCall(POST_METHOD, request_url, false, null, null)
                .then(async (response) => {
                    if (response?.data) {
                     
                        schemeHistoricalNavDetails = response?.data?.Prices;

                        if (schemeHistoricalNavDetails && schemeHistoricalNavDetails.length > 0) {
                            while (navCounter < schemeHistoricalNavDetails.length) {
                                let schemeHistoricalNavObj = schemeHistoricalNavDetails[navCounter];

                                if (schemeHistoricalNavObj?.['d'] && schemeHistoricalNavObj?.['v']
                                    && !isWeekend(schemeHistoricalNavObj?.['d'])) {
                                    schemeHistoricalNavObj = {
                                        scheme_id: schemeId,
                                        Value: (schemeHistoricalNavObj?.['v']) ? schemeHistoricalNavObj?.['v'] : null,
                                        Value_Date: (schemeHistoricalNavObj?.['d']) ? new Date(schemeHistoricalNavObj?.['d']) : null,
                                    }

                                    historicalNavArray.push(schemeHistoricalNavObj);
                                }

                                navCounter += 1;
                            }

                            await bulkCreateSchemeHistoricalNav(historicalNavArray);
                        }

                        console.log("Scheme Historical NAV Added");
                    }
                })
                .catch((err) =>
                    console.log(err, "Error Occured ...")
                );

            counter += 1;
        }
        catch (err) {
            console.log(err, "Error Occured ...");
        }
    }
}
const handleSchemeMasterAdditionalParams = async (final_url: string, schemeMasterColl: any) => {
    let bSuccess = false;
    if (!schemeMasterColl || schemeMasterColl.length == 0) return bSuccess;

    let counter = 0;
    let schemeISIN = '', schemeId = 0;
    let schemeMasterParamsObj = {}, responseObj: any = {};

    while ((counter < schemeMasterColl.length)) {
        let schemeMasterObj = schemeMasterColl[counter];

        schemeISIN = schemeMasterObj?.schemeISIN;
        schemeId = schemeMasterObj?.id;

        let request_url = final_url.replace("<schemeISIN>", schemeISIN);

        console.log(request_url, "Scheme Master Additional Params URL ...");

        await handleAxiosCall(POST_METHOD, request_url, false, null, null)
            .then(async (response) => {
                if (response?.data) {
                    responseObj = response?.data?.[0]?.api;

                    if (responseObj) {
                        let exitLoad = await getExitLoad(responseObj?.['LS-DeferLoads'])

                        let schemeMasterNewObj = {
                            ROE: responseObj?.['PSRP-ROETTMLong'],
                            ROA: responseObj?.['PSRP-ROATTMLong'],
                            NetMargin: responseObj?.['PSRP-NetMarginTrailingLong'],
                            exit_load: exitLoad,
                            ProductCode: responseObj?.['FSCBI-channel_partner_code'],
                            net_expense_ratio: responseObj?.['ARF-InterimNetExpenseRatio'] ? parseFloat(responseObj?.['ARF-InterimNetExpenseRatio']) : null,
                            net_expense_ratio_dt: responseObj?.['ARF-InterimNetExpenseRatioDate'] ? new Date((responseObj?.['ARF-InterimNetExpenseRatioDate'])) : null,
                        }
                        await updateSchemeMasterById(schemeMasterNewObj, schemeId)

                    }
                }
            }).catch((err) => {
                console.log(err, "Error Occured ...");
            })

        counter++;
    }
}

const updateAMCData = async (final_url: string, schemeMasterColl: any) => {
    let bSuccess = false;
    if (!schemeMasterColl || schemeMasterColl.length == 0) return bSuccess;

    let counter = 0;
    let schemeISIN = '', schemeId = 0;
    let schemeMasterParamsObj = {}, responseObj: any = {};

    while ((counter < schemeMasterColl.length)) {
        let schemeMasterObj = schemeMasterColl[counter];

        schemeISIN = schemeMasterObj?.schemeISIN;
        schemeId = schemeMasterObj?.id;

        let request_url = final_url.replace("<schemeISIN>", schemeISIN);

        console.log(request_url, "Scheme Master Additional Params URL ...");

        await handleAxiosCall(POST_METHOD, request_url, false, null, null)
            .then(async (response) => {
                if (response?.data) {
                    responseObj = response?.data?.[0]?.api;

                    if (responseObj) {
                        console.log(responseObj, 'responseObj')
                        // let exitLoad = await getExitLoad(responseObj?.['LS-DeferLoads'])

                        // let schemeMasterNewObj = {
                        //     ROE: responseObj?.['PSRP-ROETTMLong'],
                        //     ROA: responseObj?.['PSRP-ROATTMLong'],
                        //     NetMargin: responseObj?.['PSRP-NetMarginTrailingLong'],
                        //     exit_load: exitLoad,
                        //     ProductCode: responseObj?.['FSCBI-channel_partner_code'],
                        //     net_expense_ratio: responseObj?.['ARF-InterimNetExpenseRatio'] ? parseFloat(responseObj?.['ARF-InterimNetExpenseRatio']) : null,
                        //     net_expense_ratio_dt: responseObj?.['ARF-InterimNetExpenseRatioDate'] ? new Date((responseObj?.['ARF-InterimNetExpenseRatioDate'])) : null,
                        // }
                        // await updateSchemeMasterById(schemeMasterNewObj, schemeId)

                    }
                }
            }).catch((err) => {
                console.log(err, "Error Occured ...");
            })

        counter++;
    }
}



const getEducationByColl = async (educationCollectionObj: any) => {
    if (educationCollectionObj.length == 0) return '';

    let educationDetails = '';

    await educationCollectionObj.map((eduDetObj: any) => {
        educationDetails += eduDetObj?.Degree + ((eduDetObj?.Major) ? '(' + eduDetObj?.Major + '), ' : ', ')
            + eduDetObj?.School + '; '
    })

    return educationDetails;
}

const getAgeByYearOfBirth = async (year_of_birth: string) => {
    if (!year_of_birth) return ''

    let currentDate = new Date();

    return (currentDate.getFullYear() - parseFloat(year_of_birth));
}
const isNewDate = async (cmpDate1FromMS: any, cmpDate2frmDB: any) => {
    if (!cmpDate1FromMS)
        return false;

    const dtCompare1 = new Date(cmpDate1FromMS);

    const dtCompare2 = new Date(cmpDate2frmDB);
    if (dtCompare1.getDate() === dtCompare2.getDate()
        && (dtCompare1.getMonth() + 1 === dtCompare2.getMonth() + 1)
        && dtCompare1.getFullYear() === dtCompare2.getFullYear()) {
        return false;
    }
    else if (dtCompare1 < dtCompare2) {

        return false;
    }
    else
        return true;
}




//used to get value of id for scheme benchmark
const getBenchmarkId = async (benchMarkData: any, transactionObj: any, schemeISIN: string) => {
    const results: any[] = [];
    let index = 0;

    while (index < benchMarkData.length) {
        const benchMarkName = benchMarkData[index]?.IndexName;
        let benchmarkObj: any = await getBanchMarkByName(benchMarkName);

        if (!benchmarkObj) {
            const createbenchmarkObj = {
                benchmark_name: benchMarkName,
                ms_index_id: benchMarkData[index]?.IndexId
            };

            const responseData = await createBanchMark(createbenchmarkObj, transactionObj);

            if (responseData) {
                const mappingpayload = {
                    schemeISIN: schemeISIN,
                    ms_index_id: benchMarkData[index]?.IndexId,
                    benchmark_id_FK: responseData?.benchmark_id,
                    index_weighting: benchMarkData[index]?.IndexWeighting
                };
                await createBanchMarkMapping(mappingpayload, transactionObj);

                results.push({
                    action: "created",
                    benchmark: responseData,
                    mapping: mappingpayload
                });
            }
        } else {
            const mappingObj = await getBanchMarkMapping(benchmarkObj?.benchmark_id, schemeISIN);

            if (!mappingObj) {
                const mappingpayload = {
                    schemeISIN: schemeISIN,
                    ms_index_id: benchMarkData[index]?.IndexId,
                    benchmark_id_FK: benchmarkObj?.benchmark_id,
                    index_weighting: benchMarkData[index]?.Weighting
                };
                await createBanchMarkMapping(mappingpayload, transactionObj);

                results.push({
                    action: "mapped",
                    benchmark: benchmarkObj,
                    mapping: mappingpayload
                });
            } else {
                results.push({
                    action: "skipped",
                    benchmark: benchmarkObj
                });
            }
        }

        index++;
    }

    return results;
};
const getExitLoad = async (exitLoadCollection: any[]) => {
    if (exitLoadCollection) {
        let exitLoad = '';

        exitLoadCollection?.map((exitLoadObj) => {

            if (Number(exitLoadObj?.HighBreakpoint) > 0 && Number(exitLoadObj?.LowBreakpoint) >= 0) {

                exitLoad += Math.round(exitLoadObj?.Value) + (exitLoadObj?.Unit === 'Percentage' ? '%' : exitLoadObj?.Unit) + " - " +
                    (Number(exitLoadObj?.LowBreakpoint) == 0 ? 'Within' : exitLoadObj?.LowBreakpoint)
                    + " " + exitLoadObj?.HighBreakpoint + ' ' + exitLoadObj?.BreakpointUnit
            }
            else if (!Number(exitLoadObj?.HighBreakpoint) && Number(exitLoadObj?.LowBreakpoint) > 0) {
                if (Math.round(exitLoadObj?.Value) > 0)
                    exitLoad += '\n' + Math.round(exitLoadObj?.Value) + ' ' + exitLoadObj?.Unit + " - For >" + exitLoadObj?.LowBreakpoint + ' ' + exitLoadObj?.BreakpointUnit
            }
            else {
                exitLoad = 'No Exit Load';
            }
        })

        return exitLoad;
    }
    else
        return ''
}
