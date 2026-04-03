import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeBenchmarksValues extends Model {
  declare Id: CreationOptional<number>
  declare benchmark_id: number
  declare index_date: Date
  declare index_value: number
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeBenchmarksValues {
    SchemeBenchmarksValues.init({
      Id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      benchmark_id: {
        type: DataTypes.INTEGER
      },
      index_date: {
        type: DataTypes.DATE
      },
      index_value: {
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

    return SchemeBenchmarksValues
  }
}
