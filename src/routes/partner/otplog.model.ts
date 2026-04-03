import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
  CreationOptional,
} from 'sequelize';

export interface OtpLogAttributes {
  otpId: number;
  userId: number;
  mobile: string;
  email?: string | null;
  otp: string;
  purpose: string;
  expiresAt: Date;
  verifiedAt?: Date | null;
  attempts: number;
  isUsed: number;
  status: number;
  createdAt?: Date;
  updatedAt?: Date | null;
}

type OtpLogCreationAttributes = Optional<OtpLogAttributes, 'otpId' | 'email' | 'verifiedAt' | 'createdAt' | 'updatedAt'>;

export class OtpLog extends Model<OtpLogAttributes, OtpLogCreationAttributes>
  implements OtpLogAttributes {
  declare otpId: CreationOptional<number>;
  declare userId: number;
  declare mobile: string;
  declare email: string | null;
  declare otp: string;
  declare purpose: string;
  declare expiresAt: Date;
  declare verifiedAt: Date | null;
  declare attempts: number;
  declare isUsed: number;
  declare status: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: Date | null;

  static initModel(sequelize: Sequelize): typeof OtpLog {
    OtpLog.init({
      otpId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'otp_id',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
      },
      mobile: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          len: [10, 10],
        }
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          isEmail: true,
        }
      },
      otp: {
        type: DataTypes.STRING(6),
        allowNull: false,
        validate: {
          len: [6, 6],
        }
      },
      purpose: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
        defaultValue: DataTypes.NOW,
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'verified_at',
      },
      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isUsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'is_used',
        defaultValue: 0,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'updated_at',
      },
    }, {
      sequelize,
      tableName: 'otp_logs',
      timestamps: false,
    });

    return OtpLog;
  }
}