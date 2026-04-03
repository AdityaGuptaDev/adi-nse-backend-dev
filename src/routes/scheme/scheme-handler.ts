import { Op, col, fn, literal } from "sequelize";
import { AMCMaster, FundManagersMaster, SchemeBenchmarksMapping, SchemeBenchmarksMaster, SchemeCategory, SchemeFundManager, SchemeHistoricalNav, SchemeHoldings, SchemeMaster, SchemeOption, SchemePerformance, SchemeRiskRatio, SchemeSubcategory, SubCategoryErr } from "../../db/core/init-control-db"
import { endOfMonth, subMonths } from "date-fns";
const { MakeQuery } = require("../../services/model-service");



export const getAllSchemeCategory = () => {
    return SchemeCategory.findAll();
}

export const getAllSchemeSubCategorybyId = (params: any) => {
    return SchemeSubcategory.findAll({
        where: {
            category_id: params.id
        }
    })
}

export const getSubCategoryErrList = () => {
    return SubCategoryErr.findAll();
}

export const getSchemeDataById = (id: any) => {
    return SchemeMaster.findOne({
        where: {
            id: id
        },
        attributes: {
            exclude: [
                "ProductCode",
                "switch_flag",
                "stp_flag",
                "swp_flag",
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
                model: SchemeRiskRatio,
                attributes: {
                    exclude: [
                        "StandardDeviation10Yr",
                        "SharpeRatio10Yr",
                        "SortinoRatio10Yr",
                        "Alpha10Yr",
                        "SIPReturn10Yr",
                        "Beta10Yr",
                        "RSquared1Yr",
                        "RSquared3Yr",
                        "RSquared5Yr",
                        "RSquared10Yr",
                        "CaptureUpside1Yr",
                        "CaptureUpside3Yr",
                        "CaptureUpside5Yr",
                        "CaptureUpside10Yr",
                        "CaptureDownside3Yr",
                        "CaptureDownside5Yr",
                        "CaptureDownside10Yr",
                        "MaxDrawdown1Yr",
                        "MaxDrawdown3Yr",
                        "MaxDrawdown5Yr",
                        "MaxDrawdown10Yr",
                        "Treynor1Yr",
                        "Treynor3Yr",
                        "Treynor5Yr",
                        "Treynor10Yr",
                        "Information1Yr",
                        "Information3Yr",
                        "Information5Yr",
                        "Information10Yr",
                        "Mean1Yr",
                        "Mean3Yr",
                        "Mean5Yr",
                        "Mean10Yr",
                        "TrackingError1Yr",
                        "TrackingError3Yr",
                        "TrackingError5Yr",
                        "TrackingError10Yr",
                        "AnnualReportTurnoverRatioDate",
                    ],
                },
            },
            {
                model: AMCMaster,
                attributes: ["id", "Name", "amc_reg_name", "amc_logo"]
            },
            {
                model: SchemeBenchmarksMapping,
                attributes: ["schemeISIN", "benchmark_id_FK"],
                include: [
                    {
                        model: SchemeBenchmarksMaster,
                        attributes: ["benchmark_id", "benchmark_name"]
                    }
                ]
            },
            {
                model: SchemeOption,
                attributes: ["id", "option"]
            }
        ]
    })
}


export const getAllSchemeByISIN = (body: any) => {
    return SchemeMaster.findOne({
        where: {
            schemeISIN: body.schemeISIN
        },
    })
}

export const getAllSchemeByAMCId = (body: any) => {
    return SchemeMaster.findAll({
        where: {
            amc_id: body.amc_id
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
                model: AMCMaster,
                attributes: ["id", "Name", "amc_reg_name", "amc_logo"]
            }
        ]
    })
}

export const findPERatioData = (body: any) => {
    return SchemeMaster.findAll({
        attributes: [
            [fn('AVG', col('pe_ratio')), 'pe_ratio_AVG'],
            [fn('MIN', col('pe_ratio')), 'min_pe_ratio'],
            [fn('MAX', col('pe_ratio')), 'max_pe_ratio'],
            [fn('COUNT', col('*')), 'total_schemes']
        ],
        where: {
            categoryid: body.categoryId,
            subcategory_id: body.subCategoryId,
            scheme_type: 'R',
            option_id: 1
        },
        raw: true
    })
}

export const findPBRatioData = (body: any) => {
    return SchemeMaster.findAll({
        attributes: [
            [fn('AVG', col('pb_ratio')), 'pb_ratio_AVG'],
            [fn('MIN', col('pb_ratio')), 'min_pb_ratio'],
            [fn('MAX', col('pb_ratio')), 'max_pb_ratio'],
            [fn('COUNT', col('*')), 'total_schemes']
        ],
        where: {
            categoryid: body.categoryId,
            subcategory_id: body.subCategoryId,
            scheme_type: 'R',
            option_id: 1
        },
        raw: true
    })
}


export const findAnnualReportTurnoveRatioData = (body: any) => {
    return SchemeRiskRatio.findAll({
        attributes: [
            // [col("SchemeMaster.id"), "schemeMasterId"],
            [fn("AVG", col("AnnualReportTurnoverRatio")), "AnnualReportTurnoverRatio_AVG"],
            [fn("MIN", col("AnnualReportTurnoverRatio")), "min_AnnualReportTurnoverRatio"],
            [fn("MAX", col("AnnualReportTurnoverRatio")), "max_AnnualReportTurnoverRatio"],
            [fn("COUNT", col('*')), "total_schemes"],
        ],
        include: [
            {
                model: SchemeMaster,
                attributes: ['subcategory_id'],
                where: {
                    categoryid: body.categoryId,
                    subcategory_id: body.subCategoryId,
                    scheme_type: "R",
                    option_id: 1,
                },
            },
        ],
        group: ['subcategory_id'],
        raw: true,
    });
};

export const findRelatedSchemeData = (body: any) => {
    return SchemeMaster.findAll({
        where: {
            option_id: { [Op.ne]: body.optionId },
            id: { [Op.ne]: body.schemeId },
            amc_id: body.amcId,
            scheme_type: 'R'
        },
        attributes: ["id", "ms_fullname"],
        include: [
            {
                model: SchemePerformance,
                attributes: ["id", "scheme_id", "Nav", "Return1d", "Return1w", "Return1mth", "Return3mth", "Return6mth", "Return1yr", "Returns3yr", "Returns5yr"]
            }
        ]
    })
}

export const findReturnAVGSchemeData = (body: any) => {
    return SchemePerformance.findAll({
        attributes: [
            [fn('AVG', col('Return1d')), 'Return1d_AVG'],
            [fn('AVG', col('Return1w')), 'Return1w_AVG'],
            [fn('AVG', col('Return1mth')), 'Return1mth_AVG'],
            [fn('AVG', col('Return3mth')), 'Return3mth_AVG'],
            [fn('AVG', col('Return6mth')), 'Return6mth_AVG'],
            [fn('AVG', col('Return1yr')), 'Return1yr_AVG'],
            [fn('AVG', col('Returns2yr')), 'Returns2yr_AVG'],
            [fn('AVG', col('Returns3yr')), 'Returns3yr_AVG'],
            [fn('AVG', col('Returns5yr')), 'Returns5yr_AVG'],
            [fn('AVG', col('Returns10yr')), 'Returns10yr_AVG'],
        ],
        include: [
            {
                model: SchemeMaster,
                attributes: [],
                where: {
                    categoryid: body.categoryId,
                    subcategory_id: body.subCategoryId,
                    scheme_type: 'R',
                    option_id: 1
                },
            },
        ],
        group: ['subcategory_id'],
        raw: true,
    });
}

export const getFundManagerDataBySchemeId = (body: any) => {
    return SchemeFundManager.findAll({
        where: {
            scheme_isin: body.schemeISINNo
        },
        include: [
            {
                model: FundManagersMaster
            }
        ]
    })
}

export const getFundManagerDataById = (body: any) => {
    return SchemeFundManager.findOne({
        where: {
            scheme_manager_id: body.managerId
        },
        include: [
            {
                model: FundManagersMaster
            }
        ]
    })
}

export const getSchemeDataByManager = (body: any) => {
    return SchemeFundManager.findAll({
        where: {
            manager_id: body.managerId
        },
        include: [
            {
                model: SchemeMaster,
                attributes: ["id", "ms_fullname", "categoryid"],
                where: {
                    categoryid: body.categoryId
                },
                include: [
                    {
                        model: SchemePerformance,
                        attributes: ["id", "scheme_id", "AUM", "Nav", "Return1yr", "Returns3yr", "Returns5yr", "Returns10yr"]
                    }
                ]
            }
        ]
    })
}

export const findSchemeHoldingData = async (body: any) => {

    let maxDate: Date | null | any = null;

    for (let i = 0; i < 12; i++) {
        maxDate = await SchemeHoldings.max("as_on_date", {
            where: {
                ISIN: body?.schemeISINNo,
                as_on_date: {
                    [Op.lte]: body.endOfPreviousMonth,
                },
            },
        });

        if (maxDate) {
            // Convert to Date if needed
            const date = new Date(maxDate);
            // Force to month end
            maxDate = endOfMonth(date);

            const rawMaxDate = new Date(maxDate);  // Your string → Date

            rawMaxDate.setUTCHours(0, 0, 0, 0); // OR setHours if you want localconst rawMaxDate = new Date(maxDate);  // Your string → Date

            rawMaxDate.setUTCHours(0, 0, 0, 0); // OR setHours if you want local

            maxDate = rawMaxDate
        }

        // if (maxDate) break;

        // Try previous month
        // body.endOfPreviousMonth = endOfMonth(subMonths(body.endOfPreviousMonth, 1));
    }


    // // 1️⃣ Get latest date
    // let maxDate: any = await SchemeHoldings.max("as_on_date", {
    //     where: {
    //         ISIN: body?.schemeISINNo,
    //         as_on_date: {
    //             [Op.lte]: body.endOfPreviousMonth,
    //         },
    //         // detail_holding_type: type
    //     },
    // });

    if (!maxDate) return [];

    // 2️⃣ Get all rows for that date
    return await SchemeHoldings.findAll({
        where: {
            ISIN: body?.schemeISINNo,
            as_on_date: maxDate,
            detail_holding_type: { [Op.in]: ["EQUITY", "CASH", "DEBT"] },
        },
        attributes: [
            "detail_holding_type",
            [fn("AVG", col("portfolio_weighting")), "portfolio_weighting_AVG"],
        ],
        // order: [["as_on_date", "DESC"]],
        group: ["detail_holding_type"],
        raw: true,
    });
}

export const findHoldingTypeData = async (body: any) => {

    let maxDate: Date | null | any = null;

    for (let i = 0; i < 12; i++) {
        maxDate = await SchemeHoldings.max("as_on_date", {
            where: {
                ISIN: body?.schemeISINNo,
                as_on_date: {
                    [Op.lte]: body.endOfPreviousMonth,
                },
            },
        });

        if (maxDate) {
            // Convert to Date if needed
            const date = new Date(maxDate);
            // Force to month end
            maxDate = endOfMonth(date);

            const rawMaxDate = new Date(maxDate);  // Your string → Date

            rawMaxDate.setUTCHours(0, 0, 0, 0); // OR setHours if you want localconst rawMaxDate = new Date(maxDate);  // Your string → Date

            rawMaxDate.setUTCHours(0, 0, 0, 0); // OR setHours if you want local

            maxDate = rawMaxDate
        }

        // if (maxDate) break;

        // Try previous month
        // body.endOfPreviousMonth = endOfMonth(subMonths(body.endOfPreviousMonth, 1));
    }

    // 1️⃣ Get latest date
    // const maxDate = await SchemeHoldings.max("as_on_date", {
    //     where: {
    //         ISIN: body?.schemeISINNo,
    //         as_on_date: {
    //             [Op.lte]: body.endOfPreviousMonth,
    //         },
    //     },
    // });

    if (!maxDate) return [];

    // 2️⃣ Get all rows for that date
    return await SchemeHoldings.findAll({
        where: {
            ISIN: body?.schemeISINNo,
            as_on_date: maxDate,
        },
        order: [["as_on_date", "DESC"]],
    });
}

export const getSchemeHistoricalNavData = async (body: any) => {

    // const ids = await SchemeMaster.findAll({
    //     attributes: ['id'],
    //     where: {
    //         name: body.schemeName,
    //         option_id: 1,
    //         scheme_type: body.schemeType,
    //     },
    //     raw: true,
    // });

    // const schemeIds = ids.map((item) => item.id);

    return SchemeHistoricalNav.findAll({
        where: {
            scheme_id: body.scheme_id,
            Value_Date: {
                [Op.and]: {
                    [Op.gte]: body.fromDate,
                    [Op.lte]: body.toDate,
                },
            },
        },
        order: [['Value_Date', 'ASC']],
        raw: true,
    })

    // return SchemeHistoricalNav.findAll({
    //     include: [{
    //         model: SchemeMaster,
    //         where: {
    //             name: body.schemeName,
    //             option_id: 1,
    //             scheme_type: body.schemeType,
    //         },
    //         attributes: [], // if you don’t want master fields in output
    //     }],
    //     where: {
    //         Value_Date: {
    //             [Op.gte]: body.fromDate,
    //             [Op.lte]: body.toDate,
    //         },
    //     },
    //     raw: true,
    // });

}

export const getSchemeSinceInceptionData = async (body: any) => {
    return SchemeMaster.findOne({
        attributes: ['inception_date'],
        where: {
            id: body.scheme_id,
        },
        raw: true,
    });
}

export const getSchemeHistoricalInceptiionData = (body: any) => {
    return SchemeHistoricalNav.findAll({
        where: {
            scheme_id: body.scheme_id,
            Value_Date: {
                [Op.and]: {
                    [Op.gte]: body.inception_date,
                    [Op.lte]: new Date(),
                },
            },
        },
        raw: true,
        order: [['Value_Date', 'ASC']],
        // logging: true
    });
}

export const findMutualRelatedSchemeData = (body: any) => {
    console.log(body, "body")
    return SchemeMaster.findAll({
        where: {
            option_id: body.optionId,
            // option_id: 1,
            id: { [Op.ne]: body.schemeId },
            // amc_id: body.amcId,
            categoryid: body.categoryid,
            subcategory_id: body.subcategory_id,
            scheme_type: 'R'
        },
        attributes: ["id", "ms_fullname", "categoryid", "subcategory_id"],
        include: [
            {
                model: SchemePerformance,
                attributes: ["id", "scheme_id", "Nav", "Return1d", "Return1w", "Return1mth", "Return3mth", "Return6mth", "Return1yr", "Returns3yr", "Returns5yr"]
            }
        ]
    })
}

export const findMutualHoldingTypeData = async (query: any) => {

    const { limit, offset, modelOption, orderBy, attributes, forExcel } =
        MakeQuery({
            query: query,
            Model: SchemeMaster,
        });


    let maxDate: Date | null | any = null;

    for (let i = 0; i < 12; i++) {
        maxDate = await SchemeHoldings.max("as_on_date", {
            where: {
                ISIN: query?.schemeISINNo,
                as_on_date: {
                    [Op.lte]: query.endOfPreviousMonth,
                },
            },
        });

        if (maxDate) {
            // Convert to Date if needed
            const date = new Date(maxDate);
            // Force to month end
            maxDate = endOfMonth(date);

            const rawMaxDate = new Date(maxDate);  // Your string → Date

            rawMaxDate.setUTCHours(0, 0, 0, 0); // OR setHours if you want localconst rawMaxDate = new Date(maxDate);  // Your string → Date

            rawMaxDate.setUTCHours(0, 0, 0, 0); // OR setHours if you want local

            maxDate = rawMaxDate
        }

        // if (maxDate) break;

        // Try previous month
        // body.endOfPreviousMonth = endOfMonth(subMonths(body.endOfPreviousMonth, 1));
    }

    // 1️⃣ Get latest date
    // const maxDate = await SchemeHoldings.max("as_on_date", {
    //     where: {
    //         ISIN: body?.schemeISINNo,
    //         as_on_date: {
    //             [Op.lte]: body.endOfPreviousMonth,
    //         },
    //     },
    // });

    if (!maxDate) return [];

    modelOption.push({
        ISIN: query?.schemeISINNo,
        as_on_date: maxDate,
    });

    // 2️⃣ Get all rows for that date
    return await SchemeHoldings.findAndCountAll({
        where: modelOption,
        limit,
        offset,
        order: [["as_on_date", "DESC"]],
    });
}

export const getRatioSchemeData = (body: any) => {
    return SchemeRiskRatio.findOne({
        where: {
            scheme_id: body.schemeId,
            ISIN: body.schemeISINNo
        }
    })
}
