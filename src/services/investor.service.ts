// services/getInvestor.ts
import { db, getAccountHoldingQuery, getInvestorQuery } from "../db/sql-queries/queries";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { InvestorAccountHolding } from "../routes/investor/investor-account-holding.model";
import { BankMaster } from "../routes/kyc-flow/bank-master-model";
import { BankAccountDetail } from "../routes/kyc-flow/bank-account-detail-model";
import { InvestorRegistration } from "../routes/kyc-flow/user_basic_detail-model";
import { NomineeDetail } from "../routes/kyc-flow/nominee-detail-model";

export const getInvestor = async (id: string): Promise<any[]> => {
    if (!id || id.trim() === "") {
        throw new Error("Investor id is required");
    }

    try {
        /*const query = getInvestorQuery();

        const results = await db.query(query.text, {
            replacements: { id },
            type: QueryTypes.SELECT,
        });

        console.log(`Found ${results.length} records for Investor: ${id}`);*/

        const results = await InvestorRegistration.findAll({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { id: id },
                            { group_leader_id: id }
                        ]
                    },
                    { isDelete: false }
                ]


            },
            include: [
                {
                    model: InvestorAccountHolding,
                    as: 'InvestorAccountHolding'
                },
                {
                    model: NomineeDetail,
                    as: "NomineeDetails"
                }
            ]

        });
        return results;
    } catch (error) {
        console.error(`Error searching by Investor ${id}:`, error);
        throw new Error(`Failed to search by Investor: ${(error as Error).message}`);
    }
};

export const addHolidingAccount = async (data: any): Promise<any> => {
    const result = ""
    try {
        const newAccountHolding = await InvestorAccountHolding.create({
            investor_id: data?.investor_id,
            first_investor_id: data?.first_investor_id,
            second_investor_id: data?.second_investor_id,
            third_investor_id: data?.third_investor_id,
            account_holding_type: data?.account_holding_type,
            CAN_Id: data?.CAN_Id,
        });

        return newAccountHolding;
    }

    catch (error) {
        console.error(`Error adding account holding :`, error);
        throw new Error(`Failed to add account holding: ${(error as Error).message}`);

    }
}

export const getAccountHolding = async (id: string): Promise<any[]> => {
    if (!id || id.trim() === "") {
        throw new Error("Investor id is required");
    }

    try {

        const query = getAccountHoldingQuery();

        const results = await db.query(query.text, {
            replacements: { id },
            type: QueryTypes.SELECT,
        });

        console.log(`Found ${results.length} records for Investor: ${id}`);
        return results;
    } catch (error) {
        console.error(`Error searching by Investor ${id}:`, error);
        throw new Error(`Failed to search by Investor: ${(error as Error).message}`);
    }
};





export const getInvestorBank = async (id: string): Promise<any[]> => {
    try {

        /*const banks = await BankAccountDetail.findAll({
            where: {
                investor_id: id,
            },
            include: {
                model: BankMaster,
                as: 'BankMaster',

            }
        });

        return banks;*/
        const finalBank: any = [];
        const banks = await BankAccountDetail.findAll({
            where: {
                investor_id: id,
            }
        });

        const bankMasterList = await Promise.all(
            banks.map(async (element) => {
                return await BankMaster.findOne({
                    where: { mfu_bk_id: element.bank_id },
                });
            })
        );
        /*banks.forEach(async (element) => {
            const response = await BankMaster.findAll({
                where: {
                    mfu_bk_id: element.bank_id,
                },
            });
            console.log("dfsdfdsfs", response)
            finalBank.push(response?.BankMaster)
        });
        console.log(finalBank)*/

        //finalBank.push(banks)

        //banks.push(finalBank) as any
        return banks.map((bank, index) => ({
            ...bank.toJSON(),
            BankMaster: bankMasterList[index],
        }));

    } catch (error) {
        console.error(`Error fetching banks for investor_id:`, error);
        throw new Error(`Failed to fetch banks by investor_id: ${(error as Error).message}`);
    }
};



