import { Op, where } from "sequelize";
import {
  AddressDetail,
  CountryMaster,
  InvestorCart,
  SchemeCategory,
  SchemeMaster,
  SchemeSubcategory,
  StateMaster,
  InvestorRegistration,
  Gender,
  TaxStatus,
  UserRegistration,
  RMRegistration,
  RmInvestorMapping,
  RmPartnerMapping,
  UserMapping,
  InvestorAccountHolding,
  BcRegistration,
} from "../../db/core/init-control-db";
import { ROLE, USER_TYPE } from "../../utils/constant";
const { MakeQuery } = require("../../services/model-service");

export const getBasicUserDetailByUserId = (investor_id: any) => {
  return InvestorRegistration.findOne({
    where: { id: investor_id },
    include: [
      {
        model: InvestorRegistration,
        as: "GroupMemmber",
        include: [
          {
            model: AddressDetail,
            attributes: ["id", "investor_id", "address1"],
          },
        ],
      },
      {
        model: AddressDetail,
        attributes: ["id", "investor_id", "address1"],
      },
    ],
    order: [["id", "asc"]],
  });
};

export const getPartnerBasicUserDetailByUserId = (investor_id: any) => {
  return UserRegistration.findOne({
    where: { regId: investor_id },
    order: [["regId", "asc"]],
  });
};

export const getInvestorUserDetailByUserId = (user_id: any) => {
  return InvestorCart.findAll({
    where: {
      user_id: user_id,
    },
    include: [
      {
        model: SchemeMaster,
        include: [
          {
            model: SchemeCategory,
            attributes: ["ID", "Name"],
          },
          {
            model: SchemeSubcategory,
            attributes: ["Id", "Name"],
          },
        ],
      },
    ],
  });
};

export const getAllInvestorList = (query: any) => {
  const { limit, offset, modelOption, orderBy, attributes, forExcel } =
    MakeQuery({
      query: query,
      Model: InvestorRegistration,
    });

  const userTypeData = query?.user?.userTypeData;

  if (userTypeData) {
    if (userTypeData.RM) {
      modelOption.push({ rm_id: userTypeData.RM.id });
    }

    if (userTypeData.partner) {
      modelOption.push({ partner_id: userTypeData.partner.regId });
    }
    if (userTypeData.bc) {
      modelOption.push({ bc_id: userTypeData.bc.regId });
    }
  }

  let customFilter = query.filters ? JSON.parse(query.filters) : query.filters;

  let modelOption2: any = [];

  if (customFilter) {
    if (customFilter.dob) {
      const stepFromIndex = modelOption.findIndex((item: any) => {
        return "dob" in item;
      });

      if (stepFromIndex > -1) {
        modelOption.splice(stepFromIndex, 1);
      }

      modelOption.push({
        dob: customFilter.dob,
      });
    }

    if (customFilter["TaxStatus.status"]) {
      const stepFromIndex = modelOption.findIndex((item: any) => {
        return "TaxStatus.status" in item;
      });

      if (stepFromIndex > -1) {
        modelOption.splice(stepFromIndex, 1);
      }

      modelOption2.push({
        status: { [Op.like]: `%${customFilter["TaxStatus.status"]}%` },
      });
    }
  } else {
    modelOption.push({
      isDelete: false,
    });
  }

  if (query.filters && customFilter.isDelete == true) {
    // modelOption.push({ isDelete: true });
  }
  // if (query.filters && customFilter.isDelete == false) {
  //   modelOption.push({ isDelete: false });
  // }

  let includeOption: any = [
    {
      model: InvestorRegistration,
      as: "GroupLeader",
      // separate: true,
      attributes: ["id", "name", "group_leader_id"],
    },
    {
      model: Gender,
      attributes: ["id", "gender"],
    },
    {
      model: TaxStatus,
      where: customFilter ? modelOption2 : null,
      required: false,
      attributes: ["id", "status"],
    },
    {
      model: UserRegistration,
      attributes: ["regId", "adhaarName"],
    },
    {
      model: BcRegistration,
      attributes: ["regId", "adhaarName"],
    },
    {
      model: RMRegistration,
      attributes: ["id", "Name"],
    },

  ];

  console.log("modelOption", modelOption);
  if (forExcel) {
    return InvestorRegistration.findAll({
      where: modelOption,
      attributes,
      include: includeOption,
      order: orderBy,
      raw: true,
    });
  } else {
    return InvestorRegistration.findAndCountAll({
      where: modelOption,
      attributes,
      include: includeOption,
      order: orderBy,
      raw: true,
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });
  }
};

//added by rakesh sinha on dated 29-08-2025


export const getAllInvestorListWithCan = (query: any) => {
  const { limit, offset, modelOption, orderBy, attributes, forExcel } =
    MakeQuery({
      query: query,
      Model: InvestorRegistration,
    });

  const userTypeData = query?.user?.userTypeData;

  if (userTypeData) {
    if (userTypeData.RM) {
      modelOption.push({ rm_id: userTypeData.RM.id });
    }

    if (userTypeData.partner) {
      modelOption.push({ partner_id: userTypeData.partner.regId });
    }
  }

  let customFilter = query.filters ? JSON.parse(query.filters) : query.filters;

  let modelOption2: any = [];

  if (customFilter) {
    if (customFilter.dob) {
      const stepFromIndex = modelOption.findIndex((item: any) => {
        return "dob" in item;
      });

      if (stepFromIndex > -1) {
        modelOption.splice(stepFromIndex, 1);
      }

      modelOption.push({
        dob: customFilter.dob,
      });
    }

    if (customFilter["TaxStatus.status"]) {
      const stepFromIndex = modelOption.findIndex((item: any) => {
        return "TaxStatus.status" in item;
      });

      if (stepFromIndex > -1) {
        modelOption.splice(stepFromIndex, 1);
      }

      modelOption2.push({
        status: { [Op.like]: `%${customFilter["TaxStatus.status"]}%` },
      });
    }
  } else {
    modelOption.push({
      isDelete: false,
    });
  }

  if (query.filters && customFilter.isDelete == true) {
    modelOption.push({ isDelete: true });
  }
  if (query.filters && customFilter.isDelete == false) {
    modelOption.push({ isDelete: false });
  }

  let includeOption: any = [

    {
      model: Gender,
      attributes: ["id", "gender"],
    },
    {
      model: TaxStatus,
      where: customFilter ? modelOption2 : null,
      required: false,
      attributes: ["id", "status"],
    },

    {
      model: InvestorAccountHolding,

    },
  ];


  if (forExcel) {
    return InvestorRegistration.findAll({
      where: modelOption,
      attributes,
      include: includeOption,
      order: orderBy,
      raw: true,
    });
  } else {
    return InvestorRegistration.findAndCountAll({
      where: modelOption,
      attributes,
      include: includeOption,
      order: orderBy,

      limit,
      offset,
      distinct: true,
      subQuery: false,
    });
  }
};



export const getAllFamilyHeadList = () => {
  return InvestorRegistration.findAll({
    where: {
      group_leader_id: 0,
    },
    attributes: ["id", "name", "partner_id", "rm_id"],
    raw: true,
  });
};

export const getAllPartnerList = () => {
  return UserRegistration.findAll({
    where: {
      userCreated: 1,
    },
    attributes: ["regId", "adhaar_name", "rm_id"],
    raw: true,
  });
};

export const getAllBcList = () => {
  return BcRegistration.findAll({
    where: {
      userCreated: 1,
    },
    attributes: ["regId", "adhaar_name", "rm_id"],
    raw: true,
  });
};

export const getAllRMList = () => {
  return RMRegistration.findAll({
    where: {
      isDelete: false,
    },
    attributes: ["id", "Name"],
    raw: true,
  });
};

export const updateIvestor = (body: any, params: any) => {
  return InvestorRegistration.update(body, {
    where: { id: params.id },
  });
};

export const updateUserRegistration = (body: any, id: any) => {
  return UserRegistration.update(body, {
    where: { regId: id },
  });
};

export const findRMInvestorRegistration = (id: any) => {
  return InvestorRegistration.findOne({
    where: { rm_id: id },
  });
};

export const findRMPartner = (id: any) => {
  return UserRegistration.findOne({
    where: { rm_id: id },
  });
};

export const findRMInvestorMapping = (id: any) => {
  return RmInvestorMapping.findOne({
    where: { rm_id: id },
  });
};

export const findRMPartnerMapping = (id: any) => {
  return RmPartnerMapping.findOne({
    where: { rm_id: id },
  });
};

export const updateRMRegistrationData = (email: any) => {
  return RMRegistration.update(
    { isDelete: true },
    {
      where: { email: email },
    }
  );
};

export const findRMRegistrationData = (email: any) => {
  return RMRegistration.findOne({
    where: { email: email },
  });
};

export const findFamilyHeadList = (params: any) => {
  return InvestorRegistration.findAll({
    where: { group_leader_id: params.id },
    include: [
      {
        model: TaxStatus,
        attributes: ["id", "status"],
      },
    ],
  });
};

export const deleteInvestor = (params: any) => {
  return InvestorRegistration.update(
    { isDelete: true },
    {
      where: { id: params.id },
    }
  );
};

export const investorMappingUpdate = (Ids: any) => {
  return InvestorRegistration.update(
    { group_leader_id: 0 },
    {
      where: { id: { [Op.in]: Ids } },
    }
  );
};
export const destroyUserMapping = (id: any) => {
  return UserMapping.destroy({
    where: { role_id: ROLE.RM, userType_id: USER_TYPE.RM, ref_id: id },
  });
};

export const findInvestorsByPartnerId = (partnerId: string) => {
  return InvestorRegistration.findAll({
    where: {
      partner_id: partnerId,
      isDelete: false
    },
    attributes: ["id", "name", "partner_id"],
    raw: true,
  });
};
