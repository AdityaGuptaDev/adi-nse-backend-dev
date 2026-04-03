import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeHistoricalAllocation extends Model {
  declare Id: CreationOptional<number>
  declare isin: string
  declare detail_holding_type: string
  declare holding_percent: number
  declare as_on_date: Date
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeHistoricalAllocation {
    SchemeHistoricalAllocation.init({
      Id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      isin: {
        type: DataTypes.STRING
      },
      detail_holding_type: {
        type: DataTypes.STRING
      },
      holding_percent: {
        type: DataTypes.FLOAT
      },
      as_on_date: {
        type: DataTypes.DATE
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

    return SchemeHistoricalAllocation
  }
}
