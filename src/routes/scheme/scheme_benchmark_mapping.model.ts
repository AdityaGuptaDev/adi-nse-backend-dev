import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeBenchmarksMapping extends Model {
  declare id: CreationOptional<number>
  declare schemeISIN: string
  declare ms_index_id: string
  declare benchmark_id_FK: number
  declare index_weighting: number
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeBenchmarksMapping {
    SchemeBenchmarksMapping.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      schemeISIN: {
        type: DataTypes.STRING
      },
      ms_index_id: {
        type: DataTypes.STRING
      },
      benchmark_id_FK: {
        type: DataTypes.INTEGER
      },
      index_weighting: {
        type: DataTypes.INTEGER
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

    return SchemeBenchmarksMapping
  }
}
