import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeSubcategory extends Model {
  declare Id: CreationOptional<number>
  declare category_id: number
  declare Name: string
  declare msname: string
  declare icon_name: string
  declare short_name: string
  declare isIndex: boolean
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeSubcategory {
    SchemeSubcategory.init({
      Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      category_id: {
        type: DataTypes.INTEGER,
      },
      Name: {
        type: DataTypes.STRING,
      },
      msname: {
        type: DataTypes.STRING,
      },
      icon_name: {
        type: DataTypes.STRING,
      },
      short_name: {
        type: DataTypes.STRING,
      },
      isIndex: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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

    return SchemeSubcategory
  }
}
