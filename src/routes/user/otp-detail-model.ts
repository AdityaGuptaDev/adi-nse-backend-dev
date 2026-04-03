import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'


export class OtpDetail extends Model {
  declare id: CreationOptional<number>
  declare userId: number
  declare email: string
  declare mobile: string
  declare kyc_email_otp: string
  declare kyc_mobile_otp: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof OtpDetail {
    OtpDetail.init({
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      email: {
        type: DataTypes.STRING,
      },
      mobile: {
        type: DataTypes.STRING,
      },
      kyc_email_otp: {
        type: DataTypes.STRING,
      },
      kyc_mobile_otp: {
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

    return OtpDetail
  }
}
