import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
  CreationOptional,
} from 'sequelize';

export interface PartnerAdhaarReqDtlAttributes {
  reqId: number;
  mobile: string;
  adhaar: string;
  createdAt?: Date;
}

export type PartnerAdhaarReqDtlCreationAttributes = Optional<PartnerAdhaarReqDtlAttributes, 'reqId' | 'createdAt'>;

export class PartnerAdhaarReqDtl
  extends Model<PartnerAdhaarReqDtlAttributes, PartnerAdhaarReqDtlCreationAttributes>
  implements PartnerAdhaarReqDtlAttributes {

  declare reqId: CreationOptional<number>;
  declare mobile: string;
  declare adhaar: string;
  declare createdAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof PartnerAdhaarReqDtl {
    PartnerAdhaarReqDtl.init(
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
        adhaar: {
          type: DataTypes.STRING(20),
          allowNull: false,
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
        tableName: 'partner_adhaar_req_dtl',
        timestamps: false,
      }
    );

    return PartnerAdhaarReqDtl;
  }
}
