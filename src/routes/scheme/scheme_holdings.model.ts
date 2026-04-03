import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeHoldings extends Model {
  declare Id: CreationOptional<number>
  declare name: string
  declare ticker: string
  declare ISIN: string
  declare holdingISIN: string
  declare CUSIP: string
  declare portfolio_weighting: number
  declare position_market_value: number
  declare shares: number
  declare share_change: number
  declare currency: string
  declare country: string
  declare maturity_date: string
  declare coupon: string
  declare sector: string
  declare detail_holding_type: string
  declare holding_type: string
  declare payment_type: string
  declare rule144A_eligible: string
  declare alt_min_tax_eligible: string
  declare secondary_sector: string
  declare less_than_one_year_bond: string
  declare less_than_92days_bond: string
  declare first_bought_date: Date
  declare company_Id: string
  declare note_effective_date: string
  declare equity_profile_report_date: string
  declare holding_local_name: string
  declare as_on_date: Date
  declare credit_classification: string
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeHoldings {
    SchemeHoldings.init({
      Id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      name: {
        type: DataTypes.STRING
      },
      ticker: {
        type: DataTypes.STRING
      },
      ISIN: {
        type: DataTypes.STRING
      },
      holdingISIN: {
        type: DataTypes.STRING
      },
      CUSIP: {
        type: DataTypes.STRING
      },
      portfolio_weighting: {
        type: DataTypes.FLOAT
      },
      position_market_value: {
        type: DataTypes.FLOAT
      },
      shares: {
        type: DataTypes.FLOAT
      },
      share_change: {
        type: DataTypes.FLOAT
      },
      currency: {
        type: DataTypes.STRING
      },
      country: {
        type: DataTypes.STRING
      },
      maturity_date: {
        type: DataTypes.STRING
      },
      coupon: {
        type: DataTypes.STRING
      },
      sector: {
        type: DataTypes.STRING
      },
      detail_holding_type: {
        type: DataTypes.STRING
      },
      holding_type: {
        type: DataTypes.STRING
      },
      payment_type: {
        type: DataTypes.STRING
      },
      rule144A_eligible: {
        type: DataTypes.STRING
      },
      alt_min_tax_eligible: {
        type: DataTypes.STRING
      },
      secondary_sector: {
        type: DataTypes.STRING
      },
      less_than_one_year_bond: {
        type: DataTypes.STRING
      },
      less_than_92days_bond: {
        type: DataTypes.STRING
      },
      first_bought_date: {
        type: DataTypes.DATE
      },
      company_Id: {
        type: DataTypes.STRING
      },
      note_effective_date: {
        type: DataTypes.STRING
      },
      equity_profile_report_date: {
        type: DataTypes.STRING
      },
      holding_local_name: {
        type: DataTypes.STRING
      },
      as_on_date: {
        type: DataTypes.DATE
      },
      credit_classification: {
        type: DataTypes.STRING
      },
      createdBy: {
        type: DataTypes.INTEGER
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
    }, {
      sequelize
    })

    return SchemeHoldings
  }
}
