import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeCapitalInflow extends Model {
  declare inflow_id: CreationOptional<number>
  declare schemeISIN: string
  declare capitalInflowAmount: number
  declare asOnDate: Date
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeCapitalInflow {
    SchemeCapitalInflow.init({
      inflow_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      schemeISIN: {
        type: DataTypes.STRING
      },
      capitalInflowAmount: {
        type: DataTypes.FLOAT
      },
      asOnDate: {
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

    return SchemeCapitalInflow
  }
}
