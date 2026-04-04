import express from "express";
import prosesjwt from "proses-jwt";

let { tokenMiddleWare, generateToken } = prosesjwt;
import {
    alreadyExist,
    other,
    serverError,
    unauthorized
} from "proses-response";
import { getAMC, getCategoryWithSubCategory, getFundPickerData, getNatureList, createAdminFilterForInvester, findAdminFilterForInvester, updateAdminFilterForInvester } from "./fundpicker-handler";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import ErrorLogger from "../../db/core/logger/error-logger";
import configs from "../../config/config";
import environment from "../../environment";
import { generateExcel, printPDF } from "../../services/pdf-service";
import { unlink } from "fs";
import { convertToCrores, dateFormat, toFixedData, toFixedDataForReturn } from "../../utils/helper";
import { dataReadRateLimit, exportRateLimit } from "../../middlewares/rateLimit";
const config = (configs as { [key: string]: any })[environment];


const router = express.Router();

router.get("/getFundPickerData", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
    try {
        console.log(req.query, "req.queryreq.query")
        let gf: any = await getFundPickerData(req.query);
        sendEncryptedResponse(res, gf, "get data successfully");
    } catch (error) {
        console.log(error, "errorrrrrrrrrrrr")
        ErrorLogger.write({ type: "getFundPickerData error", error });
        serverError(res, error);
    }
});

router.get("/get-category-with-subCategory", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
    try {
        let gcws: any = await getCategoryWithSubCategory(req.query);
        sendEncryptedResponse(res, gcws, "get data successfully");
    } catch (error) {
        ErrorLogger.write({ type: "get-category-with-subCategory error", error });
        serverError(res, error);
    }
});

router.get("/get-nature-list", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
    try {
        let gN: any = await getNatureList(req.query);
        sendEncryptedResponse(res, gN, "get data successfully");
    } catch (error) {
        ErrorLogger.write({ type: "get-nature-list error", error });
        serverError(res, error);
    }
});
router.get("/get-AMC", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
    try {
        let gAMC: any = await getAMC(req.query);
        sendEncryptedResponse(res, gAMC, "get data successfully");
    } catch (error) {
        console.log(error)
        ErrorLogger.write({ type: "get-AMC", error });
        serverError(res, error);
    }
});

router.post("/get-FundPicker-schemes-pdf-export", exportRateLimit, tokenMiddleWare, async (req, res) => {
    try {

        for (let data of req.body.exportData) {

            data.net_expense_ratio = toFixedData(data.net_expense_ratio);
            data.inception_date = data.inception_date
                ? (() => {
                    const d = new Date(data.inception_date);
                    const day = String(d.getDate()).padStart(
                        2,
                        "0"
                    );
                    const month = String(d.getMonth() + 1).padStart(
                        2,
                        "0"
                    );
                    const year = d.getFullYear();
                    return `${day}/${month}/${year}`;
                })()
                : "--"

            const perf = data.SchemePerformances?.[0];

            perf.Nav = toFixedData(perf.Nav);
            perf.AUM = convertToCrores(perf.AUM);
            perf.Return1d = toFixedDataForReturn(perf.Return1d);
            perf.Return1w = toFixedDataForReturn(perf.Return1w);
            perf.Return1mth = toFixedDataForReturn(perf.Return1mth);
            perf.Return3mth = toFixedDataForReturn(perf.Return3mth);
            perf.Return6mth = toFixedDataForReturn(perf.Return6mth);
            perf.Return1yr = toFixedDataForReturn(perf.Return1yr);
            perf.Returns2yr = toFixedDataForReturn(perf.Returns2yr);
            perf.Returns3yr = toFixedDataForReturn(perf.Returns3yr);
            perf.Returns5yr = toFixedDataForReturn(perf.Returns5yr);
            perf.Returns7yr = toFixedDataForReturn(perf.Returns7yr);
            perf.Returns10yr = toFixedDataForReturn(perf.Returns10yr);
            perf.ReturnSinceIncep = toFixedDataForReturn(perf.ReturnSinceIncep);

        }

        const pdfPayload = {
            columnData: req.body.exportData,
            visibleColumns: req.body.visibleColumns,
            visibleColumnsCount: req.body.visibleColumnsCount
        };

        const pdfargs = {
            template: `${config.templatePath}/Fund.html`,
            fileName: "Fund.pdf",
            data: pdfPayload,
            uploadRoute: `${config.publicPath}/Fundpdf/`,
        };

        const pdf = await printPDF(pdfargs);

        let filePath = `${pdfargs.uploadRoute}/${pdfargs.fileName}`;

        setTimeout(() => {
            unlink(`${filePath}`, (err) => { });
        }, 1000);

        sendEncryptedResponse(res, pdf, "PDF Generate successfully");
    } catch (error) {
        console.log(error)
        ErrorLogger.write({ type: "get-FundPicker-schemes-pdf-export", error });
        serverError(res, error);
    }
});

router.post("/get-FundPicker-schemes-xlsx-export", exportRateLimit, tokenMiddleWare, async (req, res) => {
    try {

        let uploadRoute: any = `${config.publicPath}/FundXLSX/`;
        let fileName: any = `Funds.xlsx`;

        let geXls: any =  await generateExcel(req, res, uploadRoute, fileName);

        // const pdf = await printPDF(pdfargs);

        let filePath = `${uploadRoute}/${fileName}`;
        setTimeout(() => {
            unlink(`${filePath}`, (err) => { });
        }, 1000);

        sendEncryptedResponse(res, geXls, "PDF Generate successfully");
    } catch (error) {
        console.log(error)
        ErrorLogger.write({ type: "get-FundPicker-schemes-pdf-export", error });
        serverError(res, error);
    }
});

router.post("/admin-filter-for-invester", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
    try {

        let findData: any = await findAdminFilterForInvester();
        findData = JSON.parse(JSON.stringify(findData));

        let data: any;

        if (findData) {
            data = await updateAdminFilterForInvester(req.body, findData.id);
        } else {
            data = await createAdminFilterForInvester(req.body);
        }

        console.log(data, "datadata")

        sendEncryptedResponse(res, data, "Add data successfully");
    } catch (error) {
        console.log(error, "error")
        ErrorLogger.write({ type: "admin-filter-for-invester error", error });
        serverError(res, error);
    }
});

module.exports = router;
