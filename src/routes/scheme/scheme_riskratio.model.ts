import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeRiskRatio extends Model {
  declare id: CreationOptional<number>
  declare mstar_id: string
  declare scheme_id: number
  declare ISIN: string
  declare StandardDeviation1Yr: number
  declare StandardDeviation3Yr: number
  declare StandardDeviation5Yr: number
  declare StandardDeviation10Yr: number
  declare SharpeRatio1Yr: number
  declare SharpeRatio3Yr: number
  declare SharpeRatio5Yr: number
  declare SharpeRatio10Yr: number
  declare SortinoRatio1Yr: number
  declare SortinoRatio3Yr: number
  declare SortinoRatio5Yr: number
  declare SortinoRatio10Yr: number
  declare Alpha1Yr: number
  declare Alpha3Yr: number
  declare Alpha5Yr: number
  declare Alpha10Yr: number
  declare Beta1Yr: number
  declare Beta3Yr: number
  declare Beta5Yr: number
  declare Beta10Yr: number
  declare RSquared1Yr: number
  declare RSquared3Yr: number
  declare RSquared5Yr: number
  declare RSquared10Yr: number
  declare CaptureUpside1Yr: number
  declare CaptureUpside3Yr: number
  declare CaptureUpside5Yr: number
  declare CaptureUpside10Yr: number
  declare CaptureDownside1Yr: number
  declare CaptureDownside3Yr: number
  declare CaptureDownside5Yr: number
  declare CaptureDownside10Yr: number
  declare MaxDrawdown1Yr: number
  declare MaxDrawdown3Yr: number
  declare MaxDrawdown5Yr: number
  declare MaxDrawdown10Yr: number
  declare Treynor1Yr: number
  declare Treynor3Yr: number
  declare Treynor5Yr: number
  declare Treynor10Yr: number
  declare Information1Yr: number
  declare Information3Yr: number
  declare Information5Yr: number
  declare Information10Yr: number
  declare Mean1Yr: number
  declare Mean3Yr: number
  declare Mean5Yr: number
  declare Mean10Yr: number
  declare TrackingError1Yr: number
  declare TrackingError3Yr: number
  declare TrackingError5Yr: number
  declare TrackingError10Yr: number
  declare AnnualReportTurnoverRatio: number
  declare AnnualReportTurnoverRatioDate: Date
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeRiskRatio {
    SchemeRiskRatio.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true

      },
      mstar_id: {
        type: DataTypes.STRING,
      },
      scheme_id: {
        type: DataTypes.INTEGER,
      },
      ISIN: {
        type: DataTypes.STRING,
      },
      StandardDeviation1Yr: {
        type: DataTypes.FLOAT,
      },
      StandardDeviation3Yr: {
        type: DataTypes.FLOAT,
      },
      StandardDeviation5Yr: {
        type: DataTypes.FLOAT,
      },
      StandardDeviation10Yr: {
        type: DataTypes.FLOAT,
      },
      SharpeRatio1Yr: {
        type: DataTypes.FLOAT,
      },
      SharpeRatio3Yr: {
        type: DataTypes.FLOAT,
      },
      SharpeRatio5Yr: {
        type: DataTypes.FLOAT,
      },
      SharpeRatio10Yr: {
        type: DataTypes.FLOAT,
      },
      SortinoRatio1Yr: {
        type: DataTypes.FLOAT,
      },
      SortinoRatio3Yr: {
        type: DataTypes.FLOAT,
      },
      SortinoRatio5Yr: {
        type: DataTypes.FLOAT,
      },
      SortinoRatio10Yr: {
        type: DataTypes.FLOAT,
      },
      Alpha1Yr: {
        type: DataTypes.FLOAT,
      },
      Alpha3Yr: {
        type: DataTypes.FLOAT,
      },
      Alpha5Yr: {
        type: DataTypes.FLOAT,
      },
      Alpha10Yr: {
        type: DataTypes.FLOAT,
      },
      Beta1Yr: {
        type: DataTypes.FLOAT,
      },
      Beta3Yr: {
        type: DataTypes.FLOAT,
      },
      Beta5Yr: {
        type: DataTypes.FLOAT,
      },
      Beta10Yr: {
        type: DataTypes.FLOAT,
      },
      RSquared1Yr: {
        type: DataTypes.FLOAT,
      },
      RSquared3Yr: {
        type: DataTypes.FLOAT,
      },
      RSquared5Yr: {
        type: DataTypes.FLOAT,
      },
      RSquared10Yr: {
        type: DataTypes.FLOAT,
      },
      CaptureUpside1Yr: {
        type: DataTypes.FLOAT,
      },
      CaptureUpside3Yr: {
        type: DataTypes.FLOAT,
      },
      CaptureUpside5Yr: {
        type: DataTypes.FLOAT,
      },
      CaptureUpside10Yr: {
        type: DataTypes.FLOAT,
      },
      CaptureDownside1Yr: {
        type: DataTypes.FLOAT,
      },
      CaptureDownside3Yr: {
        type: DataTypes.FLOAT,
      },
      CaptureDownside5Yr: {
        type: DataTypes.FLOAT,
      },
      CaptureDownside10Yr: {
        type: DataTypes.FLOAT,
      },
      MaxDrawdown1Yr: {
        type: DataTypes.FLOAT,
      },
      MaxDrawdown3Yr: {
        type: DataTypes.FLOAT,
      },
      MaxDrawdown5Yr: {
        type: DataTypes.FLOAT,
      },
      MaxDrawdown10Yr: {
        type: DataTypes.FLOAT,
      },
      Treynor1Yr: {
        type: DataTypes.FLOAT,
      },
      Treynor3Yr: {
        type: DataTypes.FLOAT,
      },
      Treynor5Yr: {
        type: DataTypes.FLOAT,
      },
      Treynor10Yr: {
        type: DataTypes.FLOAT,
      },
      Information1Yr: {
        type: DataTypes.FLOAT,
      },
      Information3Yr: {
        type: DataTypes.FLOAT,
      },
      Information5Yr: {
        type: DataTypes.FLOAT,
      },
      Information10Yr: {
        type: DataTypes.FLOAT,
      },
      Mean1Yr: {
        type: DataTypes.FLOAT,
      },
      Mean3Yr: {
        type: DataTypes.FLOAT,
      },
      Mean5Yr: {
        type: DataTypes.FLOAT,
      },
      Mean10Yr: {
        type: DataTypes.FLOAT,
      },
      TrackingError1Yr: {
        type: DataTypes.FLOAT,
      },
      TrackingError3Yr: {
        type: DataTypes.FLOAT,
      },
      TrackingError5Yr: {
        type: DataTypes.FLOAT,
      },
      TrackingError10Yr: {
        type: DataTypes.FLOAT,
      },
      AnnualReportTurnoverRatio: {
        type: DataTypes.FLOAT,
      },
      AnnualReportTurnoverRatioDate: {
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

    return SchemeRiskRatio
  }
}
