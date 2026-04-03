import { Sequelize } from "sequelize/types";
import { ROLE, USER_TYPE } from "../../utils/constant";

const users = [
  {
    email: "admin@gmail.com",
    password: "$2a$10$PAPE5WbuLTxiuO6rDV6.8et1LAAki8IowrqsZ.7lpfnzAs.sVvp26", //123456(un-encypted)
    name: 'Admin',
    mobile: 9854565455,
    isEmailOTPVerified: true,
    isMobileOTPVerified: true,
    tempPassword: "",
    isTempPasswordReq: false,
    fcmToken: false,
    refreshToken: false,
    deviceId: false,
    roleId: ROLE.superAdmin,
    userTypeId: USER_TYPE.superAdmin,
    isPartner: false,
    isActive: true,
    createdBy: 0,
    modifiedBy: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const seedUser = async (sequelize: Sequelize) => {
  return sequelize.getQueryInterface().bulkInsert("Users", users);
};
