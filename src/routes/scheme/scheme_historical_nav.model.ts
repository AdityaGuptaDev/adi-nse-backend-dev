import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeHistoricalNav extends Model {
  declare Id: CreationOptional<number>
  declare scheme_id: number
  declare Value: number
  declare Value_Date: Date
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeHistoricalNav {
    SchemeHistoricalNav.init({
      Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      scheme_id: {
        type: DataTypes.INTEGER
      },
      Value: {
        type: DataTypes.FLOAT
      },
      Value_Date: {
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

    return SchemeHistoricalNav
  }
}
