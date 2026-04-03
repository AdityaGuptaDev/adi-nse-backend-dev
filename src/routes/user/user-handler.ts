import { Sequelize } from "sequelize/types";
const { MakeQuery } = require("../../services/model-service");
import { Op } from "sequelize";
import {
  Role,
  InvestorRegistration,
  UserRiskProfile,
  Users,
  UserType,
  UserMapping,
  RMRegistration,
  BackOfficeRegistration,
  UserRegistration,
  InvestorBasicDetails,
  BcRegistration,
} from "../../db/core/init-control-db";
import bcrypt from "bcryptjs";
import { USER_TYPE } from "../../utils/constant";
// import { userTypesModels, userTypesTS } from "../../utils/userTypes";
// import { GLOBAL_CONSTANTS } from "../../utils/constants";

export const tenantUserByEmail$ = (email: string, instance: Sequelize) => {
  return Users.findOne({
    where: { email },
    attributes: [
      "name",
      "email",
      "mobile",
      "designation",
      "roleId",
      "password",
    ],
  });
};

//function to check password in db
export const checkPassword = (pass: string, hash: string) => {
  return bcrypt.compareSync(pass, hash);
};

//function to check email in db
export const getUserByEmail = (email: string) => {
  return Users.findOne({ where: { email } });
};

export const getUserByEmailInvestor = (email: string) => {
  return Users.findOne({
    where: { email },
    order: [["createdAt", "DESC"]], // or ["id", "DESC"] if no createdAt column
  });
};


export const getUserByMobileInvestor = (mobile: string) => {
  return Users.findOne({
    where: { mobile },
    order: [["createdAt", "DESC"]], // or ["id", "DESC"] if no createdAt column
  });
};


//function to check email in db
export const getUserByEmailOrMobile = (value: any) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  return Users.findOne({
    where: isEmail ? { email: value } : { mobile: value },
  });
};

export const findUserByEmailOrMobile = (value: any) => {
  return Users.findOne({
    where: {
      [Op.or]: [{ mobile: value.mobile }],
    },
  });
};

//function to check email in db
export const getUserByFindEmail = (email: string) => {
  return Users.findOne({
    where: { email },
    include: [
      {
        model: InvestorRegistration,
      },
      { model: UserRiskProfile, required: false },
      { model: InvestorBasicDetails, required: false },
    ],
    // raw: true,
  });
};

//commented the previous code -
export const getUserByFindEmailOrMobile = (value: any) => {
  // Determine type of input
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isMobile = /^[0-9]{10}$/.test(value); // assuming 10-digit mobile numbers
  const isUserInvId = /^INV\d{8}[A-Z0-9]{4}$/i.test(value); // e.g., INV20251007W3AT

  console.log("value-", value);

  // Build WHERE condition dynamically
  let whereCondition: any = {};

  if (isEmail) {
    whereCondition = { email: value.toLowerCase() };
  } else if (isMobile) {
    whereCondition = { mobile: value };
  } else if (isUserInvId) {
    whereCondition = { user_inv_id: value.toUpperCase() };
  } else {
    // fallback if no match
    return null;
  }

  // Find the latest user matching the condition
  return Users.findOne({
    where: whereCondition,
    include: [{ model: UserRiskProfile, required: false }

    ],
    order: [["createdAt", "DESC"]], // pick the latest record if multiple
  });
};



//function a get user by id
export const getUserByid = (id: string) => {
  return Users.findOne({
    where: { id },
    raw: true,
  });
};

export const getUserMapping = (id: any, userType_id: number) => {
  return UserMapping.findAll({
    where: { user_id: id, userType_id: userType_id },
    raw: true,
  });
};

export const getUserMappingPartnerToInvestor = (id: any, userType_id: number) => {
  return UserMapping.findOne({
    where: { user_id: id, userType_id: userType_id },
    raw: true,
  });
};

//for get user filter
export const getAllUser = (query: any) => {
  const { limit, offset, modelOption, orderBy, attributes, forExcel } =
    MakeQuery({
      query: query,
      Model: Users,
    });

  let modalParam = {};

  let include = [
    {
      model: UserMapping,
      where: {
        userType_id: {
          [Op.in]: [USER_TYPE.superAdmin, USER_TYPE.RM],
        },
      },
      include: [
        {
          model: Role,
          attributes: ["roleName"],
        },
        {
          model: RMRegistration,
          attributes: ["ARN", "EUIN"],
          // required: false,
          // where: { isDelete: false },
        },
      ],
    },
  ];

  if (forExcel) {
    modalParam = {
      where: modelOption,
      attributes,
      order: orderBy,
      raw: true,
      include,
    };
    return Users.findAll(modalParam);
  } else {
    modalParam = {
      where: modelOption,
      attributes,
      order: orderBy,
      subQuery: false,

      raw: true,
      limit,
      offset,
      include,
    };
    return Users.findAndCountAll(modalParam);
  }
};

// function to add user to the db
export const addUser = async (body: any, t: any) => {
  return Users.create(body, { transaction: t });
};

export const createUserMapping = async (body: any, t: any) => {
  return UserMapping.create(body, { transaction: t });
};

//for update user ??
export const updateUser = (body: any, params: any) => {
  return Users.update(body, { where: { id: params }, returning: true });
};

// function to delete user from the db
export const deleteUser = (params: any) => {
  return Users.destroy({
    where: {
      id: params.id,
    },
  });
};

//for check unique user name
export const checkUserData = (body: any, params?: any) => {
  const { email, mobile } = body;
  //for update time
  if (params && params.id) {
    return Users.findOne({
      where: {
        [Op.or]: [{ email: email }, { mobile: mobile }],
        id: { [Op.ne]: params.id },
      },
      raw: true,
    });

    // for add time
  } else {
    return Users.findOne({
      where: {
        [Op.or]: [{ email: email }, { mobile: mobile }],
      },
      raw: true,
    });
  }
};

//for get all user for dropdown

export const UserData = (body: any) => {
  const { email, id } = body;
  return Users.findOne({
    where: { email },
    attributes: ["email", "id", "name"],
    raw: true,
  });
};

export const updateUserPassword = (body: any, id: number) => {
  return Users.update({ password: body.newPassword }, { where: { id } });
};

export const getUserByMobile = (mobile: string) => {
  return Users.findOne({ where: { mobile } });
};

export const getAllUserType = () => {
  return UserType.findAll({
    where: { isActive: true },
  });
};
export const getUserTypeById = (id: number) => {
  return UserType.findOne({
    where: { id, isActive: true },
  });
};

//commented the previous code -
export const getUserTypesByEmailOrMobile = async (value: string) => {
  // Detect type of input (email, mobile, or user_inv_id)
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isMobile = /^[0-9]{10}$/.test(value); // assuming 10-digit mobile numbers
  const isUserInvId = /^INV\d{8}[A-Z0-9]{4}$/i.test(value); // e.g. INV20251007W3AT

  // 🔹 Build WHERE condition dynamically
  let whereCondition: any = {};

  if (isEmail) {
    whereCondition = { email: value.toLowerCase() };
  } else if (isMobile) {
    whereCondition = { mobile: value };
  } else if (isUserInvId) {
    whereCondition = { user_inv_id: value.toUpperCase() };
  } else {
    // if nothing matches, return empty
    return [];
  }

  // 🔹 Get the last user (latest entry) matching the condition
  const user = await Users.findOne({
    where: whereCondition,
    order: [["createdAt", "DESC"]], // ensures latest record is picked
  });

  console.log("getUserTypesByEmailOrMobile - user:", user);

  if (!user) {
    return [];
  }

  // 🔹 Get all user mappings for this user
  const userMappings = await UserMapping.findAll({
    where: { user_id: user.id },
    include: [
      {
        model: UserType,
        attributes: ["id", "userType", "init_path"],
        where: { isActive: true },
      },
    ],
    raw: false,
  });

  return userMappings;
};


// Function to create RM Registration
export const createRMRegistration = async (body: any, t: any) => {
  return RMRegistration.create(body, { transaction: t });
};


// Function to create Back Office Registration
export const createBackOfficeRegistration = async (body: any, t: any) => {
  return BackOfficeRegistration.create(body, { transaction: t });
};

// Function to update RM Registration
export const updateRMRegistration = async (body: any, id: number, t?: any) => {
  const options: any = { where: { id }, returning: true };
  if (t) options.transaction = t;
  return RMRegistration.update(body, options);
};

export const getRefData = (userTypeID: number, refID: number) => {
  if (!refID) return null;

  console.log("getRefData====================================", userTypeID)

  switch (userTypeID) {
    case USER_TYPE.InvestorRegistration:
      return InvestorRegistration.findOne({ where: { id: refID } });
    case USER_TYPE.partner:
      return UserRegistration.findOne({ where: { regId: refID } });
    case USER_TYPE.RM:
      return RMRegistration.findOne({ where: { id: refID } });
    case USER_TYPE.BC:
      return BcRegistration.findOne({ where: { regId: refID } });
    case USER_TYPE.backOffice:
      return BackOfficeRegistration.findOne({ where: { id: refID } });
    default:
      return null;
  }
};

// Function to get all back office users for dropdown
export const getBackOfficeUsers = async () => {
  return BackOfficeRegistration.findAll({
    attributes: ["id", "Name", "email"],
  });
};


//Added by rakesh sinha on dated 09-01-2026

export const getUserByInvestorId = (id: string) => {
  return Users.findOne({
    where: { id },

    include: [
      {
        model: InvestorRegistration,
      },
      { model: UserRiskProfile, required: false },

    ],
  });
};

