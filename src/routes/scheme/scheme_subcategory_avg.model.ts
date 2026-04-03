import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeSubcategoryAvg extends Model {
  declare Id: CreationOptional<number>
  declare scheme_subcategory_id: number
  declare nav_date: Date
  declare avg_value: number
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeSubcategoryAvg {
    SchemeSubcategoryAvg.init({
      Id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      scheme_subcategory_id: {
        type: DataTypes.INTEGER
      },
      nav_date: {
        type: DataTypes.DATE
      },
      avg_value: {
        type: DataTypes.FLOAT
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

    return SchemeSubcategoryAvg
  }
}
