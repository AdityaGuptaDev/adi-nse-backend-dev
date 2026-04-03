import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class InvestorCart extends Model {
    declare id: CreationOptional<number>
    declare user_id: number
    declare investor_id: number
    declare account_holding_id: number
    declare cart_type: number
    declare trans_option: string
    declare duration: number
    declare durationType: string
    declare scheme_id: number
    declare to_scheme_id: number
    declare SchemeCode: string
    declare toSchemeCode: string
    declare folio_number: string
    declare trans_amount: number
    declare trans_units: number
    declare trans_start_date: Date
    declare trans_end_date: Date
    declare trans_type: number
    declare trans_months: number
    declare redeem_type: number
    declare cart_added_date: CreationOptional<Date>
    declare mandate_code: string
    declare sip_exe_firstTrans: boolean
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>
    declare frequency: string
    declare day: number
    declare start_month: number
    declare start_year: number
    declare end_month: number
    declare end_year: number
    declare rta_amc_code: string
    declare rta_sch_code: string
    declare out_rta_sch_code: string
    declare tx_vol_type: string
    declare vol: string

    static initModel(sequelize: Sequelize): typeof InvestorCart {
        InvestorCart.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            user_id: {
                type: DataTypes.INTEGER
            },
            investor_id: {
                type: DataTypes.INTEGER
            },
            account_holding_id: {
                type: DataTypes.INTEGER,
            },
            cart_type: {
                type: DataTypes.INTEGER,
            },
            trans_option: {
                type: DataTypes.STRING,
            },
            duration: {
                type: DataTypes.INTEGER,
            },
            durationType: {
                type: DataTypes.STRING,
            },
            scheme_id: {
                type: DataTypes.INTEGER,
            },
            to_scheme_id: {
                type: DataTypes.INTEGER,
            },
            SchemeCode: {
                type: DataTypes.STRING,
            },
            toSchemeCode: {
                type: DataTypes.STRING,
            },
            folio_number: {
                type: DataTypes.STRING,
            },
            trans_amount: {
                type: DataTypes.FLOAT,
            },
            trans_units: {
                type: DataTypes.FLOAT,
            },
            trans_start_date: {
                type: DataTypes.DATE,
            },
            trans_end_date: {
                type: DataTypes.DATE,
            },
            trans_type: {
                type: DataTypes.INTEGER,
            },
            trans_months: {
                type: DataTypes.INTEGER,
            },
            redeem_type: {
                type: DataTypes.INTEGER,
            },
            cart_added_date: {
                type: DataTypes.DATE,
                defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
            },
            mandate_code: {
                type: DataTypes.STRING,
            },
            sip_exe_firstTrans: {
                type: DataTypes.BOOLEAN,
            },
            createdBy: {
                type: DataTypes.INTEGER,
            },
            modifiedBy: {
                type: DataTypes.INTEGER,
            },
            createdAt: {
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
            },
            frequency: {
                type: DataTypes.STRING
            },
            day: {
                type: DataTypes.INTEGER
            },
            start_month: {
                type: DataTypes.INTEGER
            },
            start_year: {
                type: DataTypes.INTEGER
            },
            end_month: {
                type: DataTypes.INTEGER
            },
            end_year: {
                type: DataTypes.INTEGER
            },
            rta_amc_code: {
                type: DataTypes.INTEGER
            },
            rta_sch_code: {
                type: DataTypes.INTEGER
            },
            out_rta_sch_code: {
                type: DataTypes.INTEGER
            },
            tx_vol_type: {
                type: DataTypes.INTEGER
            },
            vol: {
                type: DataTypes.INTEGER
            },

        }, {
            sequelize,
            freezeTableName: true,
        });

        return InvestorCart
    }
}
