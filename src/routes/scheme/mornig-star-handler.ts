import { AMCMaster } from "../amc_master/amc_master-model"
import { FundManagersMaster } from "../fund_managers_master/fund_managers_master.model"
import { ExternalAccountDetail } from "../kyc-flow/external_account_detail-model"
import { NFOSchemeMaster } from "./nfo-scheme-master-model"
import { SchemeBenchmarksMapping } from "./scheme_benchmark_mapping.model"
import { SchemeBenchmarksMaster } from "./scheme_benchmark_master.model"
import { SchemeFundManagers } from "./scheme_fund_managers.model"
import { SchemeHistoricalAllocation } from "./scheme_historical_allocation.model"
import { SchemeHistoricalNav } from "./scheme_historical_nav.model"
import { SchemeHoldings } from "./scheme_holdings.model"
import { SchemeMarketCapAlloc } from "./scheme_marketcapalloc.model"
import { SchemeMaster } from "./scheme_master.model"
import { SchemePerformance } from "./scheme_performance.model"
import { SchemeRiskRatio } from "./scheme_riskratio.model"
import { SchemeSubcategory } from "./scheme_subcategory.model"

export const addSchemeHoldings = (ObjArray: any) => {
    return SchemeHoldings.bulkCreate(ObjArray)

}

export const getSchemeMaster = (pageSize: number, pageNo: number) => {
    return SchemeMaster.findAll({
        limit: pageSize,
        offset: (pageNo - 1) * Number(pageSize),
        order: [["id", "DESC"]],
    });

}

export const getSchemeMasterCount = () => {
    return SchemeMaster.count()
}
export const getSchemeMasterCountfilter = () => {
    return SchemeMaster.count()
}
export const createSchemeMaster = (data: any, t: any) => {
    return SchemeMaster.create(data, { transaction: t })
}
export const updateSchemeMaster = (data: any, isin: string, t: any) => {
    return SchemeMaster.update(data, { where: { schemeISIN: isin }, transaction: t })
}

export const updateSchemeMasterById = (data: any, schemeId: number) => {
    return SchemeMaster.update(data, {
        where: {
            id: schemeId
        },
    })
}

export const updateExternalAccountDetailsById = (data: any, id: number) => {
    return ExternalAccountDetail.update(data, {
        where: {
            id: id
        },
    })
}







export const getSchemeFundManagers = (schemeISIN: string) => {
    return SchemeFundManagers.findAll({
        where: {
            scheme_isin: schemeISIN
        }
    })
}

export const getFundManagersbyMangerId = (ManagerId: number) => {
    return FundManagersMaster
        .findOne({
            where: {
                ms_managerId: ManagerId
            }
        })
}


export const createFundManager = (obj: any) => {
    return FundManagersMaster.create(obj)
}
export const createSchemeFundManager = (obj: any) => {
    return SchemeFundManagers.create(obj)

}

export const getScheme_marketcapalloc = (schemeISIN: any, mstarId: any) => {
    return SchemeMarketCapAlloc.findOne({
        where: {
            scheme_isin: schemeISIN,
            mstar_id: mstarId
        }
    })
}
export const destroyScheme_historical_allocation = (schemeISIN: any, assetalloc_asondate: any) => {
    return SchemeHistoricalAllocation.destroy({
        where: {
            isin: schemeISIN,
            as_on_date: assetalloc_asondate
        }
    })
}

export const createBulkScheme_historical_allocation = (data: any) => {
    return SchemeHistoricalAllocation.bulkCreate(data)
}


export const createScheme_marketcapalloc = (obj: any) => {
    return SchemeMarketCapAlloc.create(obj);
}

export const updateScheme_marketcapalloc = (marketCapAllocObj: any, schemeMarketCapAllocObj: any) => {
    return SchemeMarketCapAlloc.update(marketCapAllocObj, {
        where: {
            marketcap_id: schemeMarketCapAllocObj?.marketcap_id
        }
    })
}

export const getSchemePerformance = (schemeISIN: any) => {
    return SchemePerformance.findOne({
        where: {
            ISIN: schemeISIN
        }
    });
}
export const createSchemePerformance = (data: any) => {
    return SchemePerformance.create(data)
}

export const updateSchemePerformance = (data: any, schemePerformanceDetailId: number) => {
    return SchemePerformance.update(data, {
        where: {
            id: schemePerformanceDetailId
        }
    })
}

export const createSchemeHistoricalNav = (data: any) => {
    return SchemeHistoricalNav.create(data)
}

export const bulkCreateSchemeHistoricalNav = (data: any) => {
    return SchemeHistoricalNav.bulkCreate(data)
}
export const findSchemeHistoricalNav = (schemeId: any) => {
    return SchemeHistoricalNav.findOne({
        where: {
            scheme_id: schemeId
        },
        order: [['Value_Date', 'DESC']],
    });
}

export const getSchemeRiskRatio = (schemeISIN: any) => {
    return SchemeRiskRatio.findOne({
        where: {
            ISIN: schemeISIN
        }
    });
}

export const createSchemeRiskRatio = (data: any) => {
    return SchemeRiskRatio.create(data)
}

export const updateSchemeRiskRatio = (data: any, schemeRiskRatioDetailId: number) => {
    return SchemePerformance.update(data, {
        where: {
            id: schemeRiskRatioDetailId
        }
    })
}

export const getSubCategoryBYMSName = (msCategoryName: any) => {
    return SchemeSubcategory.findOne(
        {
            where: {
                msname: msCategoryName
            }
        }
    )
}

export const createSubCategory = (data: any, t: any) => {
    return SchemeSubcategory.create(data, { transaction: t })

}

export const getBanchMarkByName = (benchMarkName: any) => {
    return SchemeBenchmarksMaster.findOne(
        {
            where: {
                benchmark_name: benchMarkName
            },
        }
    )
}
export const createBanchMark = (data: any, t: any) => {
    return SchemeBenchmarksMaster.create(data, { transaction: t })

}
export const createBanchMarkMapping = (data: any, t: any) => {
    return SchemeBenchmarksMapping.create(data, { transaction: t })

}
export const getAMCByamc_reg_name = (amcName: any) => {
    return AMCMaster.findOne(
        {
            where: {
                amc_reg_name: amcName,
                isActive: true
            }
        }
    )
}
export const createAMC = (data: any, t: any) => {
    return AMCMaster.create(data, { transaction: t })

}

export const updateAMC = (data: any, amcId: number) => {
    return AMCMaster.update(data, {
        where: {
            id: amcId
        }
    })
}
export const getBanchMarkMapping = (benchmark_id: any, schemeISIN: any) => {
    return SchemeBenchmarksMapping.findOne(
        {
            where: {
                benchmark_id_FK: benchmark_id,
                schemeISIN: schemeISIN
            }
        }
    )
}

export const createNFOSchemeMaster = (data: any, t: any) => {
    return NFOSchemeMaster.create(data, { transaction: t })
}
export const findNFOSchemeMaster = (data: any, t: any) => {
    return NFOSchemeMaster.findOne({
        where: {
            schemeISIN: data.schemeISIN
        },
        transaction: t
    })
}
export const updateNFOSchemeMaster = (data: any, t: any) => {
    return NFOSchemeMaster.update(data, {
        where: {
            schemeISIN: data.schemeISIN
        },
        transaction: t
    })
}
