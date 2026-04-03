import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'



export class NFOSchemeMaster extends Model {
    declare id: number;
    declare amc: string;
    declare mstar_id: string;
    declare schemeISIN: string;
    declare benchmark_id: number;
    declare name: string;
    declare ms_fullname: string;
    declare categoryid: number;
    declare subcategory: number;
    declare scheme_type: string;
    declare option_id: number;
    declare div_option: string;
    declare iscloseended: boolean;
    declare ProductCode: string;
    declare purchase_allowed: boolean;
    declare redemption_allowed: boolean;
    declare sip_flag: boolean;
    declare stp_flag: boolean;
    declare swp_flag: boolean;
    declare switch_flag: boolean;
    declare inception_date: Date;
    declare inception_age: number;
    declare net_expense_ratio: number;
    declare net_expense_ratio_dt: Date;
    declare riskLevel: string;
    declare nfo_start_date: Date;
    declare nfo_end_date: Date;
    declare bse_amc_code: string;
    declare min_amount: number;
    declare bse_scheme_name: string;
    declare overall_score: number;
    declare performance_score: number;
    declare safety_score: number;
    declare volatility_score: number;
    declare overall_rank: number;
    declare morningstar_rank: number;
    declare pe_ratio: number;
    declare pb_ratio: number;
    declare exit_load: string;
    declare initial_lockup_period: number
    declare avgMarketCap: number;
    declare noOfStocks: number
    declare isETF: boolean
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof NFOSchemeMaster {
        NFOSchemeMaster.init(
            {
                id: {
                    type: DataTypes.BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true,

                },
                amc: {
                    type: DataTypes.INTEGER,
                },
                mstar_id: {
                    type: DataTypes.STRING,
                },
                schemeISIN: {
                    type: DataTypes.STRING,
                },
                benchmark_id: {
                    type: DataTypes.INTEGER,
                },
                name: {
                    type: DataTypes.STRING,
                },
                ms_fullname: {
                    type: DataTypes.STRING,
                },
                categoryid: {
                    type: DataTypes.INTEGER,
                },
                subcategory: {
                    type: DataTypes.INTEGER,
                },
                scheme_type: {
                    type: DataTypes.STRING,
                },
                option_id: {
                    type: DataTypes.INTEGER,
                },
                min_amount: {
                    type: DataTypes.FLOAT,
                },
                div_option: {
                    type: DataTypes.STRING,
                },
                iscloseended: {
                    type: DataTypes.BOOLEAN,
                },
                ProductCode: {
                    type: DataTypes.STRING,
                },
                purchase_allowed: {
                    type: DataTypes.BOOLEAN,
                },
                redemption_allowed: {
                    type: DataTypes.BOOLEAN,
                },
                sip_flag: {
                    type: DataTypes.BOOLEAN,
                },
                stp_flag: {
                    type: DataTypes.BOOLEAN,
                },
                swp_flag: {
                    type: DataTypes.BOOLEAN,
                },
                switch_flag: {
                    type: DataTypes.BOOLEAN,
                },
                inception_date: {
                    type: DataTypes.DATE,
                },
                inception_age: {
                    type: DataTypes.INTEGER,
                },
                net_expense_ratio: {
                    type: DataTypes.FLOAT,
                },
                net_expense_ratio_dt: {
                    type: DataTypes.DATE,
                },
                riskLevel: {
                    type: DataTypes.STRING,
                },
                nfo_start_date: {
                    type: DataTypes.DATE,
                },
                nfo_end_date: {
                    type: DataTypes.DATE,
                },
                bse_amc_code: {
                    type: DataTypes.STRING,
                },
                bse_scheme_name: {
                    type: DataTypes.STRING,
                },
                overall_score: {
                    type: DataTypes.FLOAT,
                },
                performance_score: {
                    type: DataTypes.FLOAT,
                },
                safety_score: {
                    type: DataTypes.FLOAT,
                },
                volatility_score: {
                    type: DataTypes.FLOAT,
                },
                overall_rank: {
                    type: DataTypes.FLOAT,
                },
                morningstar_rank: {
                    type: DataTypes.FLOAT,
                },
                pe_ratio: {
                    type: DataTypes.FLOAT,
                },
                pb_ratio: {
                    type: DataTypes.FLOAT,
                },
                exit_load: {
                    type: DataTypes.STRING,
                },
                avgMarketCap: {
                    type: DataTypes.FLOAT,
                },
                initial_lockup_period: {
                    type: DataTypes.FLOAT,

                },
                noOfStocks: {
                    type: DataTypes.INTEGER,
                },
                isETF: {
                    type: DataTypes.BOOLEAN,
                },
                createdBy: {
                    type: DataTypes.INTEGER,
                },
                modifiedBy: {
                    type: DataTypes.INTEGER
                },
                createdAt: {
                    type: DataTypes.DATE
                },
                updatedAt: {
                    type: DataTypes.DATE
                }
            },
            {
                sequelize,
            }
        );

        return NFOSchemeMaster;
    }
}
