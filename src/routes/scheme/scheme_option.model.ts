import { BlobOptions } from 'buffer'
import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeOption extends Model {
  declare id: CreationOptional<number>
  declare option: string
  declare isDividend: boolean
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeOption {
    SchemeOption.init({
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      option: {
        type: DataTypes.STRING
      },
      isDividend: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
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

    return SchemeOption
  }
}
