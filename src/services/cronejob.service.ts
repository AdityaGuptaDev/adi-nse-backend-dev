


import cron from "node-cron";
import { getMSAccessCode, manageAMCDetailsForSchemes, manageHoldingDetailsForSchemes, manageMarketCapAllocData, manageNFOSchemeMasterFroMS, manageSchemeAUMData, manageSchemeMasterAdditionalParameters, manageSchemePerformanceData, manageSchemeRiskRatioData, manageSchemesHistoricalNavData } from "./mornig-star-service";
import { ExternalEntity } from "../utils/constant";
import { getExternalCred } from "./credentialService";
const MSAPI_BASE_URL = '/service/mf/';
const MSAPI_BASE_URL_PREDefinedAPI = 'https://api.morningstar.com/service/mf/';

const cronTimings = {
    evevry5sec: "17 17 * * *",
    everyDayAt5pm: "0 17 * * *",
    everyDayAt10pm: "0 22 * * *",
    everyDayAt9pm: "0 21 * * *",
    everyDayAt9AndHalfpm: "30 21 * * *",
    everyDayAt11pm: "0 23 * * *",
    everyDayAt1230AM: "30 0 * * *",
    everyDatAt7AM: "0 7 * * *",//Note: this timings are set considering current server
    everyDatAt1AM: "0 1 * * *",//Note: this timings are set considering current server
    everyMonthOn14thAt7PM: "0 19 14 * *",//Note: this timings are set considering current server
    testTime: "11 10 * * *",
} as const;

export class Cronjob {
    static startAll() {
        this.dailyUpdateData();
        //this.monthlyUpdateData();

    }

    private static async dailyUpdateData(): Promise<void> {
        cron.schedule(cronTimings.everyDatAt1AM, async () => {
            let creObj: any = {
                type: ExternalEntity.MORNINGSTAR,
            }

            let credentialsData: any = await getExternalCred(creObj);
            const msAccessCode = await getMSAccessCode(credentialsData);
            console.log("Cron Job - MS Access Code fetched ...", msAccessCode);

            //await manageNFOSchemeMasterFroMS(`${credentialsData.api_base_url}${MSAPI_BASE_URL}tkrb9ibplheheg6i/universeid/a474jn2umh8ld7w6?accesscode=${msAccessCode}&format=json`, false);
            //console.log("Cron Job - Scheme Master updated ...");
            //await manageSchemePerformanceData(`${credentialsData.api_base_url}${MSAPI_BASE_URL}mv40tu9ban46nnr0/isin/<schemeISIN>?accesscode=${msAccessCode}&format=json`);
            //console.log("Cron Job - Performance data updated ...");

            await manageSchemesHistoricalNavData(`${credentialsData.api_base_url}${MSAPI_BASE_URL}Price/isin/<schemeISIN>?accesscode=${msAccessCode}&format=json`, `${MSAPI_BASE_URL_PREDefinedAPI}Price/isin/<schemeISIN>?accesscode=${msAccessCode}&startdate=<startdate>&enddate=<enddate>&format=json`);
            console.log("Cron Job - Historical Nav data updated ...");
        })


        //    for scheme master update
        // await manageAMCDetailsForSchemes(`${credentialsData.api_base_url}${MSAPI_BASE_URL}gnie2ggqx3zeyn2q/isin/<schemeISIN>?accesscode=${msAccessCode}&format=json`) for amc master update

    }

    private static monthlyUpdateData(): void {

        cron.schedule(cronTimings.testTime, async () => {
            let creObj: any = {
                type: ExternalEntity.MORNINGSTAR,
            }

            let credentialsData: any = await getExternalCred(creObj);
            const msAccessCode = await getMSAccessCode(credentialsData);

            await manageSchemeRiskRatioData(`${credentialsData.api_base_url}${MSAPI_BASE_URL}hji6d9g8bj0juzj7/isin/<schemeISIN>?accesscode=${msAccessCode}&format=json`);
            console.log("Cron Job - Risk Ratio updated ...");
            //Done - 2025-12-04 - incomplete - exception occured

            //await manageHoldingDetailsForSchemes(`${credentialsData.api_base_url}${MSAPI_BASE_URL}iu0emrnlxh113lv5/isin/<schemeISIN>?accesscode=${msAccessCode}&format=json`);
            //console.log("Cron Job - Holdings Data updated...");
            //Done - 2025-12-04

            //await manageMarketCapAllocData(`${credentialsData.api_base_url}${MSAPI_BASE_URL}af1a0w0cbi1ja6bc/isin/<schemeISIN>?accesscode=${msAccessCode}&format=json`);
            //console.log("Cron Job - Market Cap Alloc Data Updated...");
            //Done - 2025-12-04

            //await manageSchemeMasterAdditionalParameters(`${credentialsData.api_base_url}${MSAPI_BASE_URL}tzg3nrz5hmd9i9vu/isin/<schemeISIN>?accesscode=${msAccessCode}&format=json`);
            //console.log("Cron Job - Additional Parameters Updated...");
            //Done - 2025-12-04
        })
    }


}