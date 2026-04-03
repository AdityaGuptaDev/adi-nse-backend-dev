import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'
import { hashPassword } from '../../services/password-service'



export class Users extends Model {
  declare id: CreationOptional<number>
  declare email: string
  declare password: string
  declare name: string
  declare mobile: number
  declare isEmailOTPVerified: boolean
  declare isMobileOTPVerified: boolean
  declare mobileOTP: string
  declare emailOTP: string
  declare loginOTP: string
  declare tempPassword: string
  declare isTempPasswordReq: boolean
  declare fcmToken: string
  declare refreshToken: boolean
  declare deviceId: string
  declare roleId: number
  declare userTypeId: number
  declare isPartner: boolean
  declare isActive: boolean
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare user_inv_id: string

  static initModel(sequelize: Sequelize): typeof Users {
    Users.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true

      },
      email: {
        type: DataTypes.STRING,
        set(this: Users, value: string) {
          this.setDataValue("email", value.toLowerCase());
        },
        unique: {
          name: "email",
          msg: "email must be unique",
        },
      },
      password: {
        type: DataTypes.STRING,
        set(this: Users, value: string) {
          let hash = null;
          if (value?.includes('$2a$10$')) {
            hash = value
          } else {
            hash = hashPassword(value)
          }
          this.setDataValue("password", hash);
        },
      },
      name: {
        type: DataTypes.STRING,
      },
      mobile: {
        type: DataTypes.BIGINT,
      },
      isEmailOTPVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isMobileOTPVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      emailOTP: {
        type: DataTypes.STRING(6),
      },
      mobileOTP: {
        type: DataTypes.STRING(6),
      },
      loginOTP: {
        type: DataTypes.STRING(6),
      },
      tempPassword: {
        type: DataTypes.STRING,
      },
      isTempPasswordReq: {
        type: DataTypes.BOOLEAN,
      },
      fcmToken: {
        type: DataTypes.STRING,
      },
      refreshToken: {
        type: DataTypes.BOOLEAN,
      },
      deviceId: {
        type: DataTypes.STRING,
      },
      roleId: {
        type: DataTypes.INTEGER,
      },
      userTypeId: {
        type: DataTypes.INTEGER,

      },
      isPartner: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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
       user_inv_id: {
        type: DataTypes.STRING,
      },
    }, {
      sequelize,
    });

    return Users
  }
}
