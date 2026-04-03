import configs from "../../config/config";
import { Options, Sequelize, QueryTypes } from "sequelize";
import environment from "../../environment";

const config = (configs as { [key: string]: Options })[environment];

export const db: Sequelize = new Sequelize({
  dialect: config.dialect,
  database: config.database,
  username: config.username,
  password: config.password,
  host: config.host,
  logging: false,
});

export const getInvestorQuery = () => ({
  text: `
    SELECT *
    FROM "InvestorRegistration"
    WHERE id = :id OR group_leader_id = :id;
  `
});

export const getAccountHoldingQuery = () => ({
  text: `select ir.*,ia.* from "InvestorRegistration" ir inner join "InvestorAccountHolding" ia on ia.first_investor_id=ir.id where ir.id=:id`
})
