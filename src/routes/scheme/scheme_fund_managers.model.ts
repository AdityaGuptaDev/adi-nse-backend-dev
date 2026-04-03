import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeFundManagers extends Model {
  declare manager_id: CreationOptional<number>
  declare scheme_isin: string
  declare manager_name: string
  declare manager_startdate: string
  declare manager_biography: string
  declare manager_education: string
  declare manager_pic: string
  declare manager_age: string
  declare inxits_score: string
  declare manager_exp: string
  declare lead_manager: string
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeFundManagers {
    SchemeFundManagers.init({
      manager_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      scheme_isin: {
        type: DataTypes.STRING
      },
      manager_name: {
        type: DataTypes.STRING
      },
      manager_startdate: {
        type: DataTypes.STRING
      },
      manager_biography: {
        type: DataTypes.STRING
      },
      manager_education: {
        type: DataTypes.STRING
      },
      manager_pic: {
        type: DataTypes.STRING
      },
      manager_age: {
        type: DataTypes.STRING
      },
      inxits_score: {
        type: DataTypes.STRING
      },
      manager_exp: {
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

    return SchemeFundManagers
  }
}
