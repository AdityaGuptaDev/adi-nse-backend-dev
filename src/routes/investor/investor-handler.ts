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
  UCCRegistration,
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

export const getPartnerBasicUserDetailByUserId = async (investor_id: any) => {
  const partner = await UserRegistration.findOne({
    where: { regId: investor_id },
    order: [["regId", "asc"]],
  });

  const investors = await InvestorRegistration.findAll({
    where: {
      partner_id: investor_id,
      isDelete: false,
    },
    include: [
      {
        model: AddressDetail,
        attributes: ["id", "investor_id", "address1", "city", "state_id", "pincode"],
      },
    ],
    order: [["id", "asc"]],
  });

  const partnerData = partner ? JSON.parse(JSON.stringify(partner)) : null;
  const investorData = JSON.parse(JSON.stringify(investors));

  // Enrich NSE-only investors: InvestorRegistration may be a stub (mobile only)
  // for the UCC onboarding lane, so back-fill name/PAN/DOB/email/address from
  // UCCRegistration keyed by mobile or PAN. CAN-onboarded investors keep their
  // existing values (preferred source). UCC record is also returned for UI use.
  const mobiles = investorData
    .map((i: any) => i?.reg_mobile)
    .filter((m: any) => m);
  const pans = investorData
    .map((i: any) => i?.pan_no)
    .filter((p: any) => p);

  const uccOrClauses: any[] = [];
  if (mobiles.length) uccOrClauses.push({ indianMobileNo: { [Op.in]: mobiles } });
  if (pans.length) uccOrClauses.push({ primaryHolderPan: { [Op.in]: pans } });

  let uccRecords: any[] = [];
  if (uccOrClauses.length) {
    uccRecords = await UCCRegistration.findAll({
      where: { [Op.or]: uccOrClauses },
      raw: true,
    });
  }

  const uccByMobile = new Map<string, any>();
  const uccByPan = new Map<string, any>();
  for (const u of uccRecords) {
    if (u?.indianMobileNo) uccByMobile.set(String(u.indianMobileNo), u);
    if (u?.primaryHolderPan) uccByPan.set(String(u.primaryHolderPan).toUpperCase(), u);
  }

  const firstNonEmpty = (...vals: any[]) => {
    for (const v of vals) {
      if (v !== undefined && v !== null && `${v}`.trim() !== "") return v;
    }
    return null;
  };

  const enrichedInvestors = investorData.map((inv: any) => {
    const ucc =
      (inv?.pan_no && uccByPan.get(String(inv.pan_no).toUpperCase())) ||
      (inv?.reg_mobile && uccByMobile.get(String(inv.reg_mobile))) ||
      null;

    if (!ucc) return inv;

    const uccName = [
      ucc.primaryHolderFirstName,
      ucc.primaryHolderMiddleName,
      ucc.primaryHolderLastName,
    ]
      .filter((p: any) => p && `${p}`.trim() !== "")
      .join(" ")
      .trim();

    const hasUcc =
      ucc.uccCreated === 1 ||
      ucc.uccCreated === true ||
      !!ucc.clientCode;

    return {
      ...inv,
      // Prefer existing InvestorRegistration values (CAN lane is authoritative
      // when populated); only fall back to UCC when the primary source is blank.
      name: firstNonEmpty(inv?.name, uccName),
      pan_no: firstNonEmpty(inv?.pan_no, ucc.primaryHolderPan),
      dob: firstNonEmpty(inv?.dob, ucc.primaryHolderDobIncorporation),
      reg_email: firstNonEmpty(inv?.reg_email, ucc.email),
      reg_mobile: firstNonEmpty(inv?.reg_mobile, ucc.indianMobileNo),
      AddressDetail: inv?.AddressDetail || {
        address1: [ucc.address1, ucc.address2, ucc.address3]
          .filter((p: any) => p && `${p}`.trim() !== "")
          .join(", ") || null,
        city: ucc.city || null,
        pincode: ucc.pincode || null,
      },
      ucc_client_code: ucc.clientCode || null,
      has_ucc: hasUcc,
      uccDetails: ucc,
    };
  });

  return {
    ...partnerData,
    investors: enrichedInvestors,
  };
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
