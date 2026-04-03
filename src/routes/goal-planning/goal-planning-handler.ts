import { Op } from "sequelize";
import {
  AMCMaster,
  GoalPlan,
  GoalPlanAlloc,
  GoalPlanAllocationLumpsum,
  GoalPlanAllocationSIP,
  GoalPlanUserAlloc,
  GoalType,
  RiskCategory,
  SchemeCategory,
  SchemeMaster,
  SchemePerformance,
  SchemeSubcategory,
} from "../../db/core/init-control-db";

export const getAllGoalType = () => {
  return GoalType.findAll({
    where: {
      isActive: true,
    },
    include: [
      {
        model: GoalPlanAlloc,
        include: [
          {
            model: RiskCategory,
            attributes: ["id", "risk_type"],
          },
          {
            model: SchemeCategory,
            attributes: ["ID", "Name"],
          },
          {
            model: SchemeSubcategory,
            attributes: ["Id", "category_id", "Name"],
          },
          {
            model: SchemeMaster,
            attributes: ["id", "ms_fullname", "name", "amc_id"],
            include: [
              {
                model: AMCMaster
              }
            ]
          },
        ],
      },
    ],
  });
};

export const addGoalTypeData = (body: any, t: any) => {
  return GoalType.create(body, { transaction: t });
};

export const addGoalPlanAllocData = (body: any, t: any) => {
  return GoalPlanAlloc.create(body, { transaction: t });
};

export const findGoalPlanAlloc = (params: any) => {
  return GoalPlanAlloc.findAll({
    where: {
      goal_id: params.id,
    },
  });
};

export const deleteGoalPlanAllocData = (ids: any, t: any) => {
  return GoalPlanAlloc.destroy({
    where: {
      id: { [Op.in]: ids },
    },
    transaction: t,
  });
};

export const deleteGoalPlan = (params: any, t: any) => {
  return GoalType.destroy({
    where: {
      id: params.id,
    },
    transaction: t,
  });
};

export const updateGoalTypeData = (body: any, params: any, t: any) => {
  return GoalType.update(body, {
    where: {
      id: params.id,
    },
    transaction: t,
  });
};

//for check unique role name
export const checkGoalTypeName = (body: any, params?: any) => {
  const { goal_name } = body;

  //for update time
  if (params && params.id) {
    return GoalType.findOne({
      where: { goal_name, id: { [Op.ne]: params.id } },
      raw: true,
    });

    // for add time
  } else {
    return GoalType.findOne({
      where: { goal_name },
      raw: true,
    });
  }
};

export const getRiskCatWiseSchemeData = (params: any) => {
  return GoalPlanAlloc.findAll({
    where: {
      risk_category_id: params.id,
      goal_id: params.goal_type_id,
    },
    attributes: [
      "id",
      "goal_id",
      "risk_category_id",
      "scheme_cate_id",
      "scheme_subcate_id",
      "scheme_id",
      "weightage",
    ],
    include: [
      {
        model: GoalType,
        attributes: ["id", "goal_name"],
      },
      {
        model: RiskCategory,
        attributes: ["id", "risk_type"],
      },
      {
        model: SchemeCategory,
        attributes: ["ID", "Name"],
      },
      {
        model: SchemeSubcategory,
        attributes: ["Id", "category_id", "Name"],
      },
      {
        model: SchemeMaster,
        attributes: ["id", "ms_fullname", "name", "schemeISIN"],
        include: [
          {
            model: SchemePerformance,
            attributes: {
              exclude: [
                "MStarId",
                "ReturnYTD",
                "SIPReturn1Yr",
                "SIPReturn3Yr",
                "SIPReturn10Yr",
                "AUMDate",
                "NavDate",
                "internalOverallRating",
                "volatilityRating",
                "safetyRating",
                "performanceRating",
                "AUMPrevMonth",
                "AUMPrevMonthDate",
                "AUMPrevYear",
                "AUMPrevYearDate",
              ],
            },
          },
        ],
      },
    ],
  });
};

export const findSuggestedSchemeList = (body: any) => {
  return SchemeMaster.findAll({
    where: {
      subcategory_id: body.subcategory_id,
      scheme_type: "R",
      option_id: 1,
    },
    limit: 3,
    order: [["overall_score", "DESC"]],
    include: [
      {
        model: SchemePerformance,
        attributes: {
          exclude: [
            "MStarId",
            "ReturnYTD",
            "SIPReturn1Yr",
            "SIPReturn3Yr",
            "SIPReturn10Yr",
            "AUMDate",
            "NavDate",
            "internalOverallRating",
            "volatilityRating",
            "safetyRating",
            "performanceRating",
            "AUMPrevMonth",
            "AUMPrevMonthDate",
            "AUMPrevYear",
            "AUMPrevYearDate",
          ],
        },
      },

      ///////////////////   modal pending      /////////////////

      // { model: BseLumpsumParam },
      // { model: bseSipParam , where :{frequency : { [Op.like]: '%MONTHLY%' }} },
    ],
  });
};

export const findSuggestedSchemeWithoutIdList = (body: any) => {
  let tblName: any;
  if (body.sort) {
    if (
      Object.keys(body.sort)[0] == "OverallRating" ||
      Object.keys(body.sort)[0] == "AUM" ||
      Object.keys(body.sort)[0] == "Return1mth" ||
      Object.keys(body.sort)[0] == "Return3mth" ||
      Object.keys(body.sort)[0] == "Return6mth"
    ) {
      tblName = SchemePerformance;
    }
  }

  return SchemeMaster.findAll({
    where: {
      [Op.and]: [
        {
          subcategory_id: body.subcategory_id,
          inception_age: {
            [Op.gte]: 3,
          },
          iscloseended: false,
          id: { [Op.ne]: body.currentSchemeId },
          scheme_type: "R",
          option_id: 1,
        },
      ],
    },
    limit: 10,
    order: body.sort
      ? tblName == "" || tblName == undefined
        ? Object.keys(body.sort)[0] == "name"
          ? [
            [Object.keys(body.sort)[0], body.sort[Object.keys(body.sort)[0]]],
            ["overall_score", "DESC"],
          ]
          : [
            [Object.keys(body.sort)[0], body.sort[Object.keys(body.sort)[0]]],
            ["name", "ASC"],
          ]
        : [
          [
            tblName,
            Object.keys(body.sort)[0],
            body.sort[Object.keys(body.sort)[0]],
          ],
          ["name", "ASC"],
        ]
      : [
        ["overall_score", "DESC"],
        ["name", "ASC"],
      ],
    include: [
      {
        model: SchemePerformance,
        where: {
          [Op.and]: [
            { Returns3yr: { [Op.ne]: null } },
            { Returns5yr: { [Op.ne]: null } },
            {
              Return1yr: { [Op.ne]: null },
            },
          ],
        },
        required: true,
        attributes: {
          exclude: [
            "MStarId",
            "ReturnYTD",
            "SIPReturn1Yr",
            "SIPReturn3Yr",
            "SIPReturn10Yr",
            "AUMDate",
            "NavDate",
            "internalOverallRating",
            "volatilityRating",
            "safetyRating",
            "performanceRating",
            "AUMPrevMonth",
            "AUMPrevMonthDate",
            "AUMPrevYear",
            "AUMPrevYearDate",
          ],
        },
      },

      /////////////    modal pending     //////////////////

      // { model: BseLumpsumParam },
      // { model: bseSipParam , where: {min_installment_amount : {[Op.gte] : sip_amount  } ,  frequency : { [Op.like]: '%MONTHLY%' }} },
    ],
  });
};

export const addGoalPlanData = (body: any, t: any) => {
  return GoalPlan.create(body, { transaction: t });
};

export const addGoalPlanAllocSIP = (body: any, t: any) => {
  return GoalPlanAllocationSIP.bulkCreate(body, { transaction: t });
};

export const addGoalPlanAllocLumpsum = (body: any, t: any) => {
  return GoalPlanAllocationLumpsum.bulkCreate(body, { transaction: t });
};

export const addGoalPlanUseAlloc = (body: any, t: any) => {
  return GoalPlanUserAlloc.bulkCreate(body, { transaction: t });
};

export const getAllGoalPlanList = (user_id: any) => {
  return GoalPlan.findAll({
    where: { user_id: user_id },
    include: [
      {
        model: GoalPlanUserAlloc,
        include: [{ model: SchemeSubcategory }, { model: SchemeMaster }],
      },
      { model: GoalType },
    ],
  });
};

export const getGoalPlanById = (body: any, t: any) => {
  return GoalPlan.findOne({
    where: { user_id: body.user_id, id: body.goal_plan_id },
    transaction: t,
  });
};

export const updateGoalPlanData = (body: any, t: any) => {
  return GoalPlan.update(body.rest, {
    where: { user_id: body.user_id, id: body.goal_plan_id },
    transaction: t,
  });
};

export const deleteGoalPlanAllocSIP = (id: any, t: any) => {
  return GoalPlanAllocationSIP.destroy({
    where: { goal_plan_id: id },
    transaction: t,
  });
};

export const deleteGoalPlanAllocLumpsum = (id: any, t: any) => {
  return GoalPlanAllocationLumpsum.destroy({
    where: { goal_plan_id: id },
    transaction: t,
  });
};

export const getGoalPlanWiseSchemeData = (params: any) => {
  return GoalPlanUserAlloc.findAll({
    where: {
      goal_plan_id: params.id,
    },
    attributes: [
      "id",
      "goal_plan_id",
      "risk_category_id",
      "scheme_cate_id",
      "scheme_subcate_id",
      "scheme_id",
      "weightage",
    ],
    include: [
      // {
      //     model: GoalType,
      //     attributes: ["id", "goal_name"]
      // },
      {
        model: GoalPlan,
        attributes: ["id", "goal_type_id", "goal_label"],
        include: [
          {
            model: GoalPlanAllocationSIP,
            attributes: ["id", "goal_plan_id", "scheme_id", "sip_amount"],
          },
          {
            model: GoalPlanAllocationLumpsum,
            attributes: ["id", "goal_plan_id", "scheme_id", "lumpsum_amount"],
          },
        ],
      },
      {
        model: RiskCategory,
        attributes: ["id", "risk_type"],
      },
      {
        model: SchemeCategory,
        attributes: ["ID", "Name"],
      },
      {
        model: SchemeSubcategory,
        attributes: ["Id", "category_id", "Name"],
      },
      {
        model: SchemeMaster,
        attributes: ["id", "ms_fullname", "name", "schemeISIN"],
        include: [
          {
            model: SchemePerformance,
            attributes: {
              exclude: [
                "MStarId",
                "ReturnYTD",
                "SIPReturn1Yr",
                "SIPReturn3Yr",
                "SIPReturn10Yr",
                "AUMDate",
                "NavDate",
                "internalOverallRating",
                "volatilityRating",
                "safetyRating",
                "performanceRating",
                "AUMPrevMonth",
                "AUMPrevMonthDate",
                "AUMPrevYear",
                "AUMPrevYearDate",
              ],
            },
          },
        ],
      },
    ],
  });
};

export const getCustomCatWiseSchemeData = (params: any) => {
  return GoalPlanAlloc.findAll({
    where: {
      risk_category_id: params.id,
      goal_id: params.goal_type_id,
    },
    attributes: [
      "id",
      "goal_id",
      "risk_category_id",
      "scheme_cate_id",
      "scheme_subcate_id",
      "scheme_id",
      "weightage",
    ],
    include: [
      {
        model: GoalType,
        attributes: ["id", "goal_name"],
      },
      {
        model: RiskCategory,
        attributes: ["id", "risk_type"],
      },
      {
        model: SchemeCategory,
        attributes: ["ID", "Name"],
      },
      {
        model: SchemeSubcategory,
        attributes: ["Id", "category_id", "Name"],
      },
      {
        model: SchemeMaster,
        attributes: ["id", "ms_fullname", "name"],
        include: [
          {
            model: SchemePerformance,
            attributes: {
              exclude: [
                "MStarId",
                "ReturnYTD",
                "SIPReturn1Yr",
                "SIPReturn3Yr",
                "SIPReturn10Yr",
                "AUMDate",
                "NavDate",
                "internalOverallRating",
                "volatilityRating",
                "safetyRating",
                "performanceRating",
                "AUMPrevMonth",
                "AUMPrevMonthDate",
                "AUMPrevYear",
                "AUMPrevYearDate",
              ],
            },
          },
        ],
      },
    ],
  });
};

export const getCustomGoalType = () => {
  return GoalType.findOne({
    where: {
      isActive: true,
      goal_name: "Custom",
    },
  });
};

export const deleteGoalPlanUserAllocData = (goalPlanId: number, t?: any) => {
  return GoalPlanUserAlloc.destroy({
    where: { goal_plan_id: goalPlanId },
    transaction: t,
  });
};

export const deleteGoalplanData = (body: any, t: any) => {
  return GoalPlan.destroy({
    where: { user_id: body.user_id, id: body.goal_plan_id },
    transaction: t,
  });
};

export const getGoalPlanDataById = (params: any) => {
  return GoalPlan.findOne({
    where: {
      id: params.id,
    },
    include: [
      {
        model: GoalType,
      },
      {
        model: GoalPlanUserAlloc,
        include: [
          {
            model: RiskCategory,
            attributes: ["id", "risk_type"],
          },
          {
            model: SchemeCategory,
            attributes: ["ID", "Name"],
          },
          {
            model: SchemeSubcategory,
            attributes: ["Id", "category_id", "Name"],
          },
          {
            model: SchemeMaster,
            attributes: ["id", "ms_fullname", "name"],
            include: [
              {
                model: SchemePerformance,
                attributes: {
                  exclude: [
                    "MStarId",
                    "ReturnYTD",
                    "SIPReturn1Yr",
                    "SIPReturn3Yr",
                    "SIPReturn10Yr",
                    "AUMDate",
                    "NavDate",
                    "internalOverallRating",
                    "volatilityRating",
                    "safetyRating",
                    "performanceRating",
                    "AUMPrevMonth",
                    "AUMPrevMonthDate",
                    "AUMPrevYear",
                    "AUMPrevYearDate",
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  });
};

export const getAllGoalPlanAllocationLumpsum = (id: any) => {
  return GoalPlanAllocationLumpsum.findAll({
    where: { goal_plan_id: id },
    include: [
      {
        model: GoalPlan,
        include: [
          {
            model: GoalPlanUserAlloc,
            include: [{ model: SchemeSubcategory }, { model: SchemeCategory }],
          },
          { model: GoalType },
        ],
      },
    ],
  });
};

export const getAllGoalPlanAllocationSIP = (id: any) => {
  return GoalPlanAllocationSIP.findAll({
    where: { goal_plan_id: id },
    include: [
      {
        model: GoalPlan,
        include: [
          {
            model: GoalPlanUserAlloc,
            include: [{ model: SchemeSubcategory }, { model: SchemeCategory }],
          },
          { model: GoalType },
        ],
      },
    ],
  });
};
