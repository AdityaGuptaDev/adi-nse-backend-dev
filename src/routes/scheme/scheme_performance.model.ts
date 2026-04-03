import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemePerformance extends Model {
  declare id: CreationOptional<number>
  declare scheme_id: number
  declare ISIN: string
  declare MStarId: string
  declare OverallRating: number
  declare Rating3Year: string
  declare Rating5Year: string
  declare Rating10Year: string
  declare Return1d: number
  declare Return1w: number
  declare Return1mth: number
  declare Return3mth: number
  declare Return6mth: number
  declare Return1yr: number
  declare Returns2yr: number
  declare Returns3yr: number
  declare Returns5yr: number
  declare Returns7yr: number
  declare Returns10yr: number
  declare Returns15yr: number
  declare ReturnSinceIncep: number
  declare ReturnYTD: number
  declare SIPReturn1Yr: number
  declare SIPReturn3Yr: number
  declare SIPReturn5Yr: number
  declare SIPReturn10Yr: number
  declare AUM: number
  declare AUMDate: string
  declare Nav: number
  declare NavDate: Date
  declare NavChange: number
  declare NavChangePercentage: number
  declare internalOverallRating: number
  declare performanceRating: number
  declare safetyRating: number
  declare volatilityRating: number
  declare CategoryAvgReturn1yr: number
  declare CategoryAvgReturns2yr: number
  declare CategoryAvgReturns3yr: number
  declare CategoryAvgReturns5yr: number
  declare CategoryAvgReturns10yr: number
  declare CategoryAvgReturns15yr: number
  declare AUMPrevMonth: number
  declare AUMPrevMonthDate: Date
  declare AUMPrevYear: number
  declare AUMPrevYearDate: Date
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemePerformance {
    SchemePerformance.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true

      },
      scheme_id: {
        type: DataTypes.INTEGER,
      },
      ISIN: {
        type: DataTypes.STRING,
      },
      MStarId: {
        type: DataTypes.STRING,
      },
      OverallRating: {
        type: DataTypes.INTEGER,
      },
      Rating3Year: {
        type: DataTypes.STRING,
      },
      Rating5Year: {
        type: DataTypes.STRING,
      },
      Rating10Year: {
        type: DataTypes.STRING,
      },
      Return1d: {
        type: DataTypes.FLOAT,
      },
      Return1w: {
        type: DataTypes.FLOAT,
      },
      Return1mth: {
        type: DataTypes.FLOAT,
      },
      Return3mth: {
        type: DataTypes.FLOAT,
      },
      Return6mth: {
        type: DataTypes.FLOAT,
      },
      Return1yr: {
        type: DataTypes.FLOAT,
      },
      Returns2yr: {
        type: DataTypes.FLOAT,
      },
      Returns3yr: {
        type: DataTypes.FLOAT,
      },
      Returns5yr: {
        type: DataTypes.FLOAT,
      },
      Returns7yr: {
        type: DataTypes.FLOAT,
      },
      Returns10yr: {
        type: DataTypes.FLOAT,
      },
      Returns15yr: {
        type: DataTypes.FLOAT,
      },
      ReturnSinceIncep: {
        type: DataTypes.FLOAT,
      },
      ReturnYTD: {
        type: DataTypes.FLOAT,
      },
      SIPReturn1Yr: {
        type: DataTypes.FLOAT,
      },
      SIPReturn3Yr: {
        type: DataTypes.FLOAT,
      },
      SIPReturn5Yr: {
        type: DataTypes.FLOAT,
      },
      SIPReturn10Yr: {
        type: DataTypes.FLOAT,
      },
      AUM: {
        type: DataTypes.FLOAT,
      },
      AUMDate: {
        type: DataTypes.STRING,
      },
      Nav: {
        type: DataTypes.FLOAT,
      },
      NavDate: {
        type: DataTypes.DATE,
      },
      NavChange: {
        type: DataTypes.FLOAT,
      },
      NavChangePercentage: {
        type: DataTypes.FLOAT,
      },
      internalOverallRating: {
        type: DataTypes.FLOAT,
      },
      performanceRating: {
        type: DataTypes.FLOAT,
      },
      safetyRating: {
        type: DataTypes.FLOAT,
      },
      volatilityRating: {
        type: DataTypes.FLOAT,
      },
      CategoryAvgReturn1yr: {
        type: DataTypes.FLOAT,
      },
      CategoryAvgReturns2yr: {
        type: DataTypes.FLOAT,
      },
      CategoryAvgReturns3yr: {
        type: DataTypes.FLOAT,
      },
      CategoryAvgReturns5yr: {
        type: DataTypes.FLOAT,
      },
      CategoryAvgReturns10yr: {
        type: DataTypes.FLOAT,
      },
      CategoryAvgReturns15yr: {
        type: DataTypes.FLOAT,
      },
      AUMPrevMonth: {
        type: DataTypes.FLOAT,
      },
      AUMPrevMonthDate: {
        type: DataTypes.DATE,
      },
      AUMPrevYear: {
        type: DataTypes.FLOAT,
      },
      AUMPrevYearDate: {
        type: DataTypes.DATE,
      },
      createdBy: {
        type: DataTypes.INTEGER,
      },
      modifiedBy: {
        type: DataTypes.INTEGER,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    }, {
      sequelize,
    });

    return SchemePerformance
  }
}
