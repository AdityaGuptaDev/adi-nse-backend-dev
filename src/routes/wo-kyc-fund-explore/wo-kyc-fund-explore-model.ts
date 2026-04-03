import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'


export class WithoutKYCFundExplore extends Model {
  declare id: CreationOptional<number>
  declare scheme_id: number
  declare schemeISIN: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof WithoutKYCFundExplore {
    WithoutKYCFundExplore.init({
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      scheme_id: {
        type: DataTypes.INTEGER,
      },
      schemeISIN: {
        type: DataTypes.STRING,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    }, {
      sequelize,
      freezeTableName: true,
    });

    return WithoutKYCFundExplore
  }
}
