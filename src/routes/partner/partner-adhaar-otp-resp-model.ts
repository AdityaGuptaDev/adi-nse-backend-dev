import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
  CreationOptional,
} from 'sequelize';

export interface PartnerAadhaarOtpResDtlAttributes {
  resId: number;
  mobile: string;
  aadhaar: string;
  otp: string;
  refId: string;
  responseData: object;
  createdAt?: Date;
}

export type PartnerAadhaarOtpResDtlCreationAttributes = Optional<PartnerAadhaarOtpResDtlAttributes, 'resId' | 'createdAt'>;

export class PartnerAadhaarOtpResDtl
  extends Model<PartnerAadhaarOtpResDtlAttributes, PartnerAadhaarOtpResDtlCreationAttributes>
  implements PartnerAadhaarOtpResDtlAttributes {

  declare resId: CreationOptional<number>;
  declare mobile: string;
  declare aadhaar: string;
  declare otp: string;
  declare refId: string;
  declare responseData: object;
  declare createdAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof PartnerAadhaarOtpResDtl {
    PartnerAadhaarOtpResDtl.init(
      {
        resId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field: 'res_id',
        },
        mobile: {
          type: DataTypes.STRING(15),
          allowNull: false,
        },
        aadhaar: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        otp: {
          type: DataTypes.STRING(10),
          allowNull: false,
        },
        refId: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: 'ref_id',
        },
        responseData: {
          type: DataTypes.JSONB,
          allowNull: false,
          field: 'response_data',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
        },
      },
      {
        sequelize,
        tableName: 'partner_aadhaar_otp_res_dtl',
        timestamps: false,
      }
    );

    return PartnerAadhaarOtpResDtl;
  }
}
