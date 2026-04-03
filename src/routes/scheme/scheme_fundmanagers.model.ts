import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeFundManager extends Model {
  declare scheme_manager_id: CreationOptional<number>
  declare mstar_id: string
  declare scheme_isin: string
  declare manager_id: number
  declare manager_startdate: string
  declare lead_manager: string
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeFundManager {
    SchemeFundManager.init({
      scheme_manager_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      mstar_id: {
        type: DataTypes.STRING
      },
      scheme_isin: {
        type: DataTypes.STRING
      },
      manager_id: {
        type: DataTypes.INTEGER
      },
      manager_startdate: {
        type: DataTypes.STRING
      },
      lead_manager: {
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

    return SchemeFundManager
  }
}
