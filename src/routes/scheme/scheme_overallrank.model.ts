import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeOverallRank extends Model {
  declare rank_id: CreationOptional<number>
  declare scheme_isin: string
  declare performance_rank: number
  declare performance_score: number
  declare safety_rank: number
  declare safety_score: number
  declare volatility_rank: number
  declare volatility_score: number
  declare overall_rank: number
  declare overall_score: number
  declare addedOn: Date
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeOverallRank {
    SchemeOverallRank.init({
      rank_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      scheme_isin: {
        type: DataTypes.STRING
      },
      performance_rank: {
        type: DataTypes.FLOAT
      },
      performance_score: {
        type: DataTypes.FLOAT
      },
      safety_rank: {
        type: DataTypes.FLOAT
      },
      safety_score: {
        type: DataTypes.FLOAT
      },
      volatility_rank: {
        type: DataTypes.FLOAT
      },
      volatility_score: {
        type: DataTypes.FLOAT
      },
      overall_rank: {
        type: DataTypes.FLOAT
      },
      overall_score: {
        type: DataTypes.FLOAT
      },
      addedOn: {
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

    return SchemeOverallRank
  }
}
