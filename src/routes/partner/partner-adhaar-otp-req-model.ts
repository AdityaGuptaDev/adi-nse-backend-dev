import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
  CreationOptional,
} from 'sequelize';

export interface PartnerAadhaarOtpReqDtlAttributes {
  reqId: number;
  mobile: string;
  aadhaar: string;
  otp: string;
  refId: string;
  createdAt?: Date;
}

export type PartnerAadhaarOtpReqDtlCreationAttributes = Optional<PartnerAadhaarOtpReqDtlAttributes, 'reqId' | 'createdAt'>;

export class PartnerAadhaarOtpReqDtl
  extends Model<PartnerAadhaarOtpReqDtlAttributes, PartnerAadhaarOtpReqDtlCreationAttributes>
  implements PartnerAadhaarOtpReqDtlAttributes {

  declare reqId: CreationOptional<number>;
  declare mobile: string;
  declare aadhaar: string;
  declare otp: string;
  declare refId: string;
  declare createdAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof PartnerAadhaarOtpReqDtl {
    PartnerAadhaarOtpReqDtl.init(
      {
        reqId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field: 'req_id',
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
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
        },
      },
      {
        sequelize,
        tableName: 'partner_aadhaar_otp_req_dtl',
        timestamps: false,
      }
    );

    return PartnerAadhaarOtpReqDtl;
  }
}
