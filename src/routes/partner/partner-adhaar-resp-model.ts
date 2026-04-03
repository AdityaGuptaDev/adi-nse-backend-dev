import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
  CreationOptional,
} from 'sequelize';

export interface PartnerAdhaarResDtlAttributes {
  resId: number;
  mobile: string;
  aadhaar: string;
  responseData: object;
  createdAt?: Date;
}

export type PartnerAdhaarResDtlCreationAttributes = Optional<PartnerAdhaarResDtlAttributes, 'resId' | 'createdAt'>;

export class PartnerAdhaarResDtl
  extends Model<PartnerAdhaarResDtlAttributes, PartnerAdhaarResDtlCreationAttributes>
  implements PartnerAdhaarResDtlAttributes {

  declare resId: CreationOptional<number>;
  declare mobile: string;
  declare aadhaar: string;
  declare responseData: object;
  declare createdAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof PartnerAdhaarResDtl {
    PartnerAdhaarResDtl.init(
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
        tableName: 'partner_adhaar_res_dtl',
        timestamps: false,
      }
    );

    return PartnerAdhaarResDtl;
  }
}
