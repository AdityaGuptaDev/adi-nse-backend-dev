import { AMCMaster, SchemeCategory, SchemeMaster, SchemePerformance, SchemeSubcategory, WithoutKYCFundExplore } from "../../db/core/init-control-db"


export const getSchemeDataByWithoutKYC = () => {
    return WithoutKYCFundExplore.findAll({
        include: [
            {
                model: SchemeMaster,
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
                    {
                        model: AMCMaster,
                        attributes: ["id", "Name", "amc_reg_name", "amc_logo"]
                    }
                ]
            }

        ]
    });
}