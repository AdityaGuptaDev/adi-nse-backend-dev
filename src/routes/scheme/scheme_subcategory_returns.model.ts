import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeSubcategoryReturns extends Model {
  declare Id: CreationOptional<number>
  declare subcategory_id: number
  declare return_1yr: number
  declare return_3yr: number
  declare return_5yr: number
  declare return_10yr: number
  declare return_tilldate: Date
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeSubcategoryReturns {
    SchemeSubcategoryReturns.init({
      Id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      subcategory_id: {
        type: DataTypes.INTEGER
      },
      return_1yr: {
        type: DataTypes.FLOAT
      },
      return_3yr: {
        type: DataTypes.FLOAT
      },
      return_5yr: {
        type: DataTypes.FLOAT
      },
      return_10yr: {
        type: DataTypes.FLOAT
      },
      return_tilldate: {
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

    return SchemeSubcategoryReturns
  }
}
