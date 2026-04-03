import { col, fn, literal, Op, QueryTypes, Sequelize } from "sequelize";
import {
  SchemeMaster,
  SchemePerformance,
  SchemeCategory,
  SchemeSubcategory,
  AMCMaster,
  FundManagersMaster,
  SchemeFundManager,
  SchemeBenchmarksMaster,
  SchemeBenchmarksMapping,
  NFOSchemeMaster,
} from "../../db/core/init-control-db";
import db from "../../db/core/control-db";
const { MakeQuery } = require("../../services/model-service");

export const getTopPerformingSchemeList = () => {
  return SchemePerformance.findAll({
    where: {
      Return1yr: {
        [Op.not]: null,
      },
    },
    order: [["Return1yr", "DESC"]],
    limit: 5,
    include: [
      {
        model: SchemeMaster,
        where: {
          scheme_type: "R",
          option_id: 1,
        },
        attributes: ["id", "ms_fullname", "name", "riskLevel"],
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

export const getTopSchemeListByCatId = (catId: any) => {
  return SchemePerformance.findAll({
    where: {
      Return1yr: {
        [Op.not]: null,
      },
    },
    order: [["Return1yr", "DESC"]],
    limit: 5,
    include: [
      {
        model: SchemeMaster,
        where: {
          categoryid: catId,
          scheme_type: "R",
          option_id: 1,
        },
        attributes: ["id", "ms_fullname", "name", "riskLevel", "schemeISIN"],
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

export const findCategoryAvg = (id: any) => {
  return SchemePerformance.findAll({
    attributes: [
      [fn("AVG", col("Return1yr")), "Return1yrAVG"],
      [col("SchemeMaster.categoryid"), "categoryid"], // include it!
    ],
    include: [
      {
        model: SchemeMaster,
        attributes: [],
        where: {
          categoryid: id,
          scheme_type: "R",
          option_id: 1,
        },
      },
    ],
    group: ["SchemeMaster.categoryid"], // ✅ this solves it!
    raw: true,
  });
};

export const findSubCategoryAvg = (id: any) => {
  return SchemePerformance.findAll({
    attributes: [
      [fn("AVG", col("Returns3yr")), "Returns3yrAVG"],
      [col("SchemeMaster.subcategory_id"), "subcategory_id"], // include it!
    ],
    include: [
      {
        model: SchemeMaster,
        attributes: [],
        where: {
          subcategory_id: id,
          scheme_type: "R",
          option_id: 1,
        },
      },
    ],
    group: ["SchemeMaster.subcategory_id"], // ✅ this solves it!
    raw: true,
  });
};

export const getTopSchemeListBySubCatId = (id: any) => {
  return SchemePerformance.findAll({
    where: {
      Returns3yr: {
        [Op.not]: null,
      },
    },
    attributes: ["id", "scheme_id", "Returns3yr"],
    order: [["Returns3yr", "DESC"]],
    limit: 3,
    include: [
      {
        model: SchemeMaster,
        where: {
          subcategory_id: id,
          scheme_type: "R",
          option_id: 1,
        },
        attributes: ["id", "ms_fullname", "name", "riskLevel"],
      },
    ],
  });
};

export const getAllSchemeList = (id: any, query: any) => {
  const { limit, offset, modelOption, orderBy, attributes, forExcel } =
    MakeQuery({
      query: query,
      Model: SchemeMaster,
    });

  let customQuery = query.filters ? JSON.parse(query.filters) : query.filters;

  if (customQuery) {
    if (customQuery.subCategory) {
      modelOption.push({
        categoryid: id,
        subcategory_id: { [Op.in]: customQuery.subCategory },
        scheme_type: "R",
        option_id: 1,
      });
    }
  }

  modelOption.push({
    categoryid: id,
    scheme_type: "R",
    option_id: 1,
  });

  let includeOption: any = [
    // {
    //     model: SchemeCategory,
    //     attributes: ["ID", "Name"],
    // },
    {
      model: SchemeSubcategory,
      attributes: ["Id", "Name"],
    },
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
  ];

  if (forExcel) {
    return SchemeMaster.findAll({
      where: modelOption,
      attributes: {
        exclude: [
          "ProductCode",
          "switch_flag",
          "stp_flag",
          "swp_flag",
          "riskLevel",
          "nfo_start_date",
          "nfo_end_date",
          "bse_amc_code",
          "bse_scheme_name",
          "morningstar_rank",
          "initial_lockup_period",
        ],
      },
      order: orderBy,
      include: includeOption,
    });
  } else {
    return SchemeMaster.findAndCountAll({
      where: modelOption,
      attributes: {
        exclude: [
          "ProductCode",
          "switch_flag",
          "stp_flag",
          "swp_flag",
          "riskLevel",
          "nfo_start_date",
          "nfo_end_date",
          "bse_amc_code",
          "bse_scheme_name",
          "morningstar_rank",
          "initial_lockup_period",
        ],
      },
      include: includeOption,
      order: orderBy,
      limit,
      offset,
    });
  }
};

export const getNewFundOfferList = (query: any) => {
  let modelOption: any = [];

  if (query.search) {
    modelOption.push({
      name: {
        [Op.like]: `%${query.search}%`,
      },
      nfo_end_date: {
        [Op.gte]: new Date(),
      },
      scheme_type: "R",
      option_id: 1,
    });
  } else {
    modelOption.push({
      nfo_end_date: {
        [Op.gte]: new Date(),
      },
      scheme_type: "R",
      option_id: 1,
    });
  }

  return NFOSchemeMaster.findAll({
    where: modelOption,

    order: [["id", "DESC"]],
  });
};

export const getAllAMCList = () => {
  return AMCMaster.findAll();
};

export const getTopAMCList = () => {
  return SchemeMaster.findAll({
    where: {
      scheme_type: "R",
      option_id: 1,
    },
    attributes: ["amc_id"],
    group: ["amc_id"],
    order: [["id", "DESC"]],
  });
};

export const getSchemeByAMCId = (id: any) => {
  return SchemeMaster.findAll({
    where: {
      amc_id: id,
      scheme_type: "R",
      option_id: 1,
    },
    attributes: [
      "amc_id",
      [fn("COUNT", col("SchemeMaster.id")), "total_schemes"],
      [fn("SUM", col("SchemePerformances.AUM")), "total_AUM"],
      [fn("MAX", col("SchemePerformances.AUMDate")), "AUMDate"], //  get latest AUMDate only
    ],
    include: [
      {
        model: SchemePerformance,
        // attributes: ["id", "scheme_id", "AUM", "AUMDate"]
        attributes: [],
      },
    ],
    group: ["SchemeMaster.amc_id"],
    raw: true,
  });
};

export const getAllFundManagerList = () => {
  return FundManagersMaster.findAll({
    attributes: [
      "manager_id",
      "manager_name",
      "manager_exp",
      "manager_education",
    ],
    include: [
      {
        model: SchemeFundManager,
        attributes: [
          "scheme_manager_id",
          "scheme_isin",
          "manager_id",
          "lead_manager",
        ],
        // where: {
        //     lead_manager: "Lead"
        // },
        include: [
          {
            model: SchemeMaster,
            where: {
              scheme_type: "R",
              option_id: 1,
            },
            attributes: ["id", "ms_fullname", "name", "riskLevel"],
            include: [
              {
                model: SchemePerformance,
                attributes: ["id", "scheme_id", "AUM", "Returns3yr"],
              },
            ],
          },
        ],
      },
    ],
  });
};

export const getSchemeByIds = (Ids: any) => {
  return SchemeMaster.findAll({
    where: {
      id: { [Op.in]: Ids },
      scheme_type: "R",
      option_id: 1,
    },
    attributes: [
      [fn("COUNT", col("SchemeMaster.id")), "total_schemes"],
      [fn("SUM", col("SchemePerformances.AUM")), "total_AUM"],
      [fn("AVG", col("Returns5yr")), "Returns5yr_AVG"],
    ],
    include: [
      {
        model: SchemePerformance,
        // attributes: ["id", "scheme_id", "AUM", "AUMDate"]
        attributes: [],
      },
    ],
    raw: true,
  });
};

export const getFundManagerDataById = (id: any) => {
  return FundManagersMaster.findOne({
    where: {
      manager_id: id,
    },
    attributes: [
      "manager_id",
      "manager_name",
      "manager_exp",
      "manager_education",
      "manager_biography",
    ],
    include: [
      {
        model: SchemeFundManager,
        attributes: [
          "scheme_manager_id",
          "scheme_isin",
          "manager_id",
          "lead_manager",
          "manager_startdate",
        ],
        order: [["manager_startdate", "ASC"]],
        // where: {
        //     lead_manager: "Lead"
        // },
        include: [
          {
            model: SchemeMaster,
            // order: [["inception_date", "ASC"]],
            where: {
              scheme_type: "R",
              option_id: 1,
            },
            attributes: {
              exclude: [
                "ProductCode",
                "switch_flag",
                "stp_flag",
                "swp_flag",
                "riskLevel",
                "nfo_start_date",
                "nfo_end_date",
                "bse_amc_code",
                "bse_scheme_name",
                "morningstar_rank",
                "initial_lockup_period",
              ],
            },
            include: [
              {
                model: SchemeCategory,
                attributes: ["ID", "Name"],
              },
              {
                model: SchemeSubcategory,
                attributes: ["Id", "Name"],
              },
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

export const getSchemeDataByAMCId = (categoryId: any, id: any, query: any) => {
  const { limit, offset, modelOption, orderBy, attributes, forExcel } =
    MakeQuery({
      query: query,
      Model: SchemeMaster,
    });

  let customQuery = query.filters ? JSON.parse(query.filters) : query.filters;

  if (customQuery) {
    if (customQuery.subCategory) {
      modelOption.push({
        amc_id: id,
        scheme_type: "R",
        option_id: 1,
        categoryid: categoryId,
        subcategory_id: { [Op.in]: customQuery.subCategory },
      });
    }
  }

  modelOption.push({
    amc_id: id,
    scheme_type: "R",
    option_id: 1,
    categoryid: categoryId,
  });

  let includeOption: any = [
    {
      model: SchemeCategory,
      attributes: ["ID", "Name"],
    },
    {
      model: SchemeSubcategory,
      attributes: ["Id", "Name"],
    },
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
    {
      model: AMCMaster,
      attributes: [
        "id",
        "Name",
        "amc_reg_name",
        "amc_logo",
        "office_address",
        "city",
        "contact",
        "fax",
        "website",
        "amc_registrar",
      ],
    },
  ];

  if (forExcel) {
    return SchemeMaster.findAll({
      where: modelOption,
      attributes: {
        exclude: [
          "ProductCode",
          "switch_flag",
          "stp_flag",
          "swp_flag",
          "riskLevel",
          "nfo_start_date",
          "nfo_end_date",
          "bse_amc_code",
          "bse_scheme_name",
          "morningstar_rank",
          "initial_lockup_period",
        ],
      },
      order: orderBy,
      include: includeOption,
    });
  } else {
    return SchemeMaster.findAndCountAll({
      where: modelOption,
      attributes: {
        exclude: [
          "ProductCode",
          "switch_flag",
          "stp_flag",
          "swp_flag",
          "riskLevel",
          "nfo_start_date",
          "nfo_end_date",
          "bse_amc_code",
          "bse_scheme_name",
          "morningstar_rank",
          "initial_lockup_period",
        ],
      },
      include: includeOption,
      order: orderBy,
      limit,
      offset,
    });
  }
};

export const findByISINNo = async (pri_isin: string): Promise<any[]> => {
  if (!pri_isin || pri_isin.trim() === "") {
    throw new Error("ISIN is required");
  }

  const query = `
      SELECT min_amt FROM vw_mfu_scheme_master_threshold
      WHERE pri_isin = :pri_isin AND txn_type = 'B'
      
    `;

  try {
    const results = await db.query(query, {
      replacements: { pri_isin: pri_isin.trim().toUpperCase() },
      type: QueryTypes.SELECT,
    });

    // console.log(`Found ${results.length} records for ISIN: ${pri_isin}`);
    return results as any[];
  } catch (error) {
    console.error(`Error searching by ISIN ${pri_isin}:`, error);
    throw new Error(`Failed to search by ISIN: ${(error as Error).message}`);
  }
};
