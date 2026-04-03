import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
  CreationOptional,
} from "sequelize";

export interface UccRegistrationLogAttributes {
  id: number;
  mobile?: string | null;
  userType?: number | null;
  clientCode?: string | null;

  requestPayload?: object | null;
  responsePayload?: object | null;

  status?: string | null;
  remark?: string | null;

  regId?: string | null;
  regStatus?: string | null;
  regRemark?: string | null;

  createdAt?: Date | null;
  updatedAt?: Date | null;
}

type UccRegistrationLogCreationAttributes = Optional<
  UccRegistrationLogAttributes,
  "id"
>;

export class UccRegistrationLog
  extends Model<
    UccRegistrationLogAttributes,
    UccRegistrationLogCreationAttributes
  >
  implements UccRegistrationLogAttributes
{
  declare id: CreationOptional<number>;
  declare mobile: string | null;
  declare userType: number | null;
  declare clientCode: string | null;

  declare requestPayload: object | null;
  declare responsePayload: object | null;

  declare status: string | null;
  declare remark: string | null;

  declare regId: string | null;
  declare regStatus: string | null;
  declare regRemark: string | null;

  declare createdAt: Date | null;
  declare updatedAt: Date | null;

  static initModel(sequelize: Sequelize): typeof UccRegistrationLog {
    UccRegistrationLog.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        mobile: {
          type: DataTypes.STRING(15),
          allowNull: true,
        },
        userType: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "user_type",
        },
        clientCode: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "client_code",
        },
        requestPayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "request_payload",
        },
        responsePayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "response_payload",
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        remark: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        regId: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "reg_id",
        },
        regStatus: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "reg_status",
        },
        regRemark: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "reg_remark",
        },
        createdAt: {
          type: DataTypes.DATE,
          field: "created_at",
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updated_at",
        },
      },
      {
        sequelize,
        tableName: "ucc_registration_logs",
        timestamps: false,
      }
    );

    return UccRegistrationLog;
  }
}