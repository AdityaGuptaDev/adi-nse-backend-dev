import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeFundManagerHistory extends Model {
  declare sf_history_id: CreationOptional<number>
  declare scheme_isin: string
  declare manager_id: number
  declare start_date: string
  declare end_date: string
  declare tenure: string
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeFundManagerHistory {
    SchemeFundManagerHistory.init({
      sf_history_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      scheme_isin: {
        type: DataTypes.STRING
      },
      manager_id: {
        type: DataTypes.INTEGER
      },
      start_date: {
        type: DataTypes.STRING
      },
      end_date: {
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

    return SchemeFundManagerHistory
  }
}
