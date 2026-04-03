import { Sequelize } from "sequelize/types";
import fs from "fs";
import path from "path"
const rawdata: any = fs.readFileSync(path.resolve(__dirname, './KYCPincode.json'));

const kyc_pincode = JSON.parse(rawdata);

export const seedKYCPincode = async (sequelize: Sequelize) => {
  return sequelize.getQueryInterface().bulkInsert("KYCPincode", kyc_pincode);
};
