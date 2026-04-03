import { Sequelize } from "sequelize/types";

const bankProofData = [
  {
    mfu_code: 14,
    bank_proof: "Latest Bank Passbook"
  },
  {
    mfu_code: 15,
    bank_proof: "Latest Bank Account Statement"
  },
  {
    mfu_code: 77,
    bank_proof: "Cheque Copy"
  },
  {
    mfu_code: 78,
    bank_proof: "Bank Letter"
  }
];

export const seedBankProof = async (sequelize: Sequelize) => {
  return sequelize.getQueryInterface().bulkInsert("BankProof", bankProofData);
};
