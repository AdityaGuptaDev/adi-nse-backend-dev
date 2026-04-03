import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";

export class InvestorRequestDecentroLogs extends Model {
  declare id: CreationOptional<number>;
  declare mobile_number: string;
  declare investor_id: number | null;
  declare api_name: string;
  declare request_payload: object | null;
  declare response_payload: object | null;
  declare status: string | null;
  declare remark: string | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof InvestorRequestDecentroLogs {
    InvestorRequestDecentroLogs.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        mobile_number: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        investor_id: {
          type: DataTypes.BIGINT,
          allowNull: true,
        },
        api_name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        request_payload: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        response_payload: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        status: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        remark: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "investor_request_logs",
        timestamps: true,          // Sequelize manages timestamps
        createdAt: "created_at",   // Map to DB column
        updatedAt: "updated_at",   // Map to DB column
      }
    );

    return InvestorRequestDecentroLogs;
  }
}
