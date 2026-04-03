import environment from "../environment";
import configs from "../config/config";
import { apiRequest } from "./apirequest.service";
import { MfuTransaction } from "../routes/mfu/mfu-transaction.model";
import { convertJsonToXml, convertXmlToJson } from "../utils/parser";
import { encrypt, decrypt } from "../utils/aesmfu";
import { CanRegisterResponse } from "../routes/mfu/can-register-response-dtl";

import { Mandate } from "../routes/mfu/mandate-model";
const fs = require('fs');
import FormData from "form-data";
const crypto = require('crypto');
const qs = require('qs');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = (configs as { [key: string]: any })[environment];
const mfu = config.mfu;

interface CreateTransactionPayload {
    txnType: string;
    entGroupRefNo: string;
    orderMode: string;

    folioTxnFlag?: string;
    folioDetSec?: object;
    can?: string;
    reqPrntEnt?: string;
    riaCode?: string;
    arnCode?: string;
    subArnCode?: string;
    euin?: string;
    euinDeclaration?: string;
    subBrokCode?: string;
    branchRMIntCode?: string;
    totAmt?: string;
    schList?: object;
    dpSecFlag?: string;
    dpSec?: object;
    paySecFlag?: string;
    paySec?: object;
    logDtl?: object;
    status?: string;
    investor_id: string;
    isin?: string;
}


export const createTransaction = async (reqBody: CreateTransactionPayload, investor_id: any, isin: any): Promise<any> => {
    try {
        console.log("Request Body :------", reqBody);
        const newTransaction = await MfuTransaction.create({
            txn_type: reqBody.txnType,
            ent_group_ref_no: reqBody.entGroupRefNo,
            order_mode: reqBody.orderMode,

            folio_txn_flag: reqBody.folioTxnFlag ?? null,
            folio_det_sec: reqBody.folioDetSec ?? null,
            can: reqBody.can ?? null,
            req_prnt_ent: reqBody.reqPrntEnt ?? null,
            ria_code: reqBody.riaCode ?? null,
            arn_code: reqBody.arnCode ?? null,
            sub_arn_code: reqBody.subArnCode ?? null,
            euin: reqBody.euin ?? null,
            euin_declaration: reqBody.euinDeclaration ?? null,
            sub_brok_code: reqBody.subBrokCode ?? null,
            branch_rm_int_code: reqBody.branchRMIntCode ?? null,
            tot_amt: reqBody.totAmt ?? null,
            sch_list: reqBody.schList ?? null,
            dp_sec_flag: reqBody.dpSecFlag ?? null,
            dp_sec: reqBody.dpSec ?? null,
            pay_sec_flag: reqBody.paySecFlag ?? null,
            pay_sec: reqBody.paySec ?? null,
            log_dtl: reqBody.logDtl ?? null,
            status: 'pending',
            investor_id: investor_id,

            isin: isin ?? null,
        });

        return newTransaction;
    } catch (error: any) {
        console.error("Error creating transaction:", JSON.stringify(error, null, 2));

        if (error.name === 'SequelizeValidationError') {
            console.error("Validation errors:", error.errors);

            throw new Error(error.errors.map((e: any) => e.message).join(', '));
        }

        throw new Error("Failed to create transaction.");
    }
};

export const transactionCallback = async (resBody: any): Promise<string> => {
    try {
        // Choose a safe folder + file name
        const logsDir = path.join(process.cwd(), "logs");
        const filePath = path.join(logsDir, "transactions.txt");
        console.log(filePath)

        // Ensure the "logs" folder exists
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        // Your JSON body
        const dataToSave = JSON.stringify(resBody, null, 2);

        // Append with timestamp
        const logEntry = `[${new Date().toISOString()}]\n${dataToSave}\n\n`;

        // Return a promise for async handling
        return new Promise((resolve, reject) => {
            fs.appendFile(filePath, logEntry, (err: any) => {
                if (err) {
                    console.error("Error writing file:", err);
                    reject("Error writing file");
                } else {
                    console.log("Data appended successfully:", filePath);
                    resolve("Transaction saved successfully");
                }
            });
        });
    } catch (err) {
        console.error("Error saving transaction:", err);
        throw new Error("Error saving transaction");
    }
};