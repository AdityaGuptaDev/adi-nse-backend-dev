import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeFileMaster extends Model {
  declare id: CreationOptional<number>
  declare schmstrhy_file: string
  declare stpsch_file: string
  declare sipsch_file: string
  declare swpAmcSch_file: string
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeFileMaster {
    SchemeFileMaster.init({
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      schmstrhy_file: {
        type: DataTypes.STRING
      },
      stpsch_file: {
        type: DataTypes.STRING
      },
      sipsch_file: {
        type: DataTypes.STRING
      },
      swpAmcSch_file: {
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

    return SchemeFileMaster
  }
}
