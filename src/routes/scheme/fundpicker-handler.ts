import { Op, literal } from "sequelize";
import { AMCMaster } from "../amc_master/amc_master-model";
import { SchemeCategory } from "./scheme_category.model";
import { SchemeMaster } from "./scheme_master.model";
import { SchemeOption } from "./scheme_option.model";
import { SchemeSubcategory } from "./scheme_subcategory.model";
import { SchemePerformance } from "./scheme_performance.model";
import { SchemeRiskRatio } from "./scheme_riskratio.model";
import { SchemeHistoricalNav } from "./scheme_historical_nav.model";
import { SchemeSubcategoryAvg } from "./scheme_subcategory_avg.model";
import { SchemeBenchmarksValues } from "./scheme_benchmarks_values.model";
import { SchemeMarketCapAlloc } from "./scheme_marketcapalloc.model";
import { SchemeHoldings } from "./scheme_holdings.model";
import { SchemeBenchmarksMapping } from "./scheme_benchmark_mapping.model";
import { SchemeFundManager } from "./scheme_fundmanagers.model";
import { FundManagersMaster } from "../fund_managers_master/fund_managers_master.model";
import { AdminFundExploreFilter } from "./admin-fund-filter-model";
import { SchemeBenchmarksMaster } from "./scheme_benchmark_master.model";
const { MakeQuery } = require("../../services/model-service");

export const getFundPickerData = async (query: any) => {
    const { limit, offset, modelOption, orderBy, attributes, forExcel } =
        MakeQuery({
            query: query,
            Model: SchemeMaster,
        });
    let modalParam = {};
    let customQuery = query.filters ? JSON.parse(query.filters) : query.filters;

    modelOption.push({
        scheme_type: 'R',
    });
    modelOption.push({
        option_id: customQuery.option_id ? customQuery.option_id : 1,
    });
    if (customQuery) {
        if (customQuery.subcategory_id && customQuery.subcategory_id.length > 0) {
            modelOption.push({
                subcategory_id: { [Op.in]: customQuery.subcategory_id },
            });
        }
        if (customQuery.categoryid && customQuery.categoryid.length > 0) {
            modelOption.push({
                categoryid: { [Op.in]: customQuery.categoryid },
            });
        }

        if (customQuery.amc_id) {
            modelOption.push({
                amc_id: { [Op.in]: customQuery.amc_id },
            });
        }

        if (customQuery.selectInclude) {
            if (customQuery.selectInclude.selectCloseEnded && !customQuery.selectInclude.selectOpenEnded) {
                modelOption.push({
                    iscloseended: true
                })
            }

            if (customQuery.selectInclude.selectOpenEnded && !customQuery.selectInclude.selectCloseEnded) {
                modelOption.push({
                    iscloseended: false
                })
            }

            if (customQuery.selectInclude.selectIndex) {
                let schemeCatArr = await findSubCategoryData();
                modelOption.push({
                    subcategory_id: { [Op.in]: schemeCatArr },
                })
            }

            if (customQuery.selectInclude.selectETF) {
                modelOption.push({
                    isETF: true
                })
            }
        }


    }
    console.log(modelOption, 'modelOption')
    let include = [
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
        // {
        //     model: SchemeMarketCapAlloc,
        //     required: false,
        //     attributes: {
        //         exclude: ['marketcap_giant',
        //             'marketcap_small',
        //             'marketcap_micro',
        //             'marketcap_asondate',
        //             'assetalloc_equity',
        //             'assetalloc_bond',
        //             'assetalloc_cash',
        //             'assetalloc_others',
        //             'assetalloc_asondate',
        //             'equistyle_largeValue',
        //             'equistyle_largeCore',
        //             'equistyle_largeGrowth',
        //             'equistyle_midValue',
        //             'equistyle_midCore',
        //             'equistyle_midGrowth',
        //             'equistyle_smallValue',
        //             'equistyle_smallCore',
        //             'equistyle_smallGrowth',
        //             'equistyle_asondate'
        //         ]
        //     },
        // },
        // {
        //     model: SchemeHoldings,
        //     attributes: ['Id'],
        //     separate: true,
        //     where: {
        //         detail_holding_type: 'EQUITY'
        //     },
        //     required: true
        // },
        // {
        //     model: SchemeBenchmarksMapping,
        //     attributes: ['benchmark_id_FK'],
        //     required: false
        // },
        // {
        //     model: SchemeFundManager,
        //     attributes: ['scheme_manager_id', 'manager_id', 'lead_manager'],
        //     include: [{
        //         model: FundManagersMaster,
        //         attributes: ['manager_id', 'manager_name'],

        //     }],
        //     // required: true
        // },
        {
            model: AMCMaster
        }

    ];
    if (forExcel) {
        modalParam = {
            where: modelOption,
            attributes,
            order: orderBy,
            // raw: true,
            include,
        };
        return SchemeMaster.findAll(modalParam);
    } else {
        modalParam = {
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
            // raw: true,
            order: orderBy,
            limit,
            offset,
            include,
        };
        return SchemeMaster.findAndCountAll(modalParam);
    }
};

export const getCategoryWithSubCategory = (query: any) => {
    return SchemeCategory.findAll({
        include: [{ model: SchemeSubcategory }],
        order: [
            ["ID", "ASC"],
            [SchemeSubcategory, "Name", "ASC"],
        ],
    });
};

export const getNatureList = (query: any) => {
    return SchemeOption.findAll();
};
export const getAMC = (query: any) => {
    return AMCMaster.findAll({
        where: {
            isActive: true,
        },
    });
};


export const getSchemeDataBySubCatAvg = (body: any) => {
    return SchemeMaster.findAll({
        attributes: ['subcategory_id'],
        where: {
            id: body.id,
        },
        include: [
            {
                model: SchemeSubcategoryAvg,
                required: true,
                // where: {
                //     nav_date: {
                //         [Op.and]: {
                //             [Op.gte]: body.fromDate,
                //             [Op.lte]: body.toDate,
                //         },
                //     },
                // },
            },
        ],
        raw: true,
    })
}

export const getSchemeDataByFindBenchMark = (body: any) => {
    return SchemeMaster.findAll({
        attributes: ['benchmark_id'],
        where: {
            id: body.id,
        },
        include: [
            {
                model: SchemeBenchmarksValues,
                required: true,
                // where: {
                //     index_date: {
                //         [Op.and]: {
                //             [Op.gte]: body.fromDate,
                //             [Op.lte]: body.toDate,
                //         },
                //     },
                // },
            },
        ],
        raw: true,
    })
}

const findSubCategoryData = async () => {
    let schemeCatArr: any = [];
    let schemeCat: any = await SchemeSubcategory.findAll({
        where: {
            isIndex: true
        }
    })

    for (let item of schemeCat) {
        schemeCatArr.push(item.Id)
    }

    return schemeCatArr
}

export const createAdminFilterForInvester = (body: any) => {
    return AdminFundExploreFilter.create(body);
}

export const findAdminFilterForInvester = () => {
    return AdminFundExploreFilter.findOne();
}

export const updateAdminFilterForInvester = (body: any, id: any) => {
    return AdminFundExploreFilter.update(body, {
        where: {
            id: id
        }
    })
}