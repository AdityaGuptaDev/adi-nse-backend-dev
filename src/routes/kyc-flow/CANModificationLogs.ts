import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";

export class CANModificationLogs extends Model {
  declare id: CreationOptional<number>;
  declare investor_id: number;
  declare request_xml: string;
  declare response_xml: string | null;
  declare response_code: string | null;
  declare response_message: string | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare process_type: string;

  static initModel(sequelize: Sequelize): typeof CANModificationLogs {
    CANModificationLogs.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        investor_id: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        request_xml: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        response_xml: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        response_code: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        response_message: {
          type: DataTypes.STRING(255),
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
        process_type: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
      },
      {
        sequelize,
    tableName: "can_modification_logs",
    timestamps: true,          // enables automatic timestamps
    createdAt: "created_at",   // <-- map to your snake_case column
    updatedAt: "updated_at",   // <-- map to your snake_case column
      }
    );

    return CANModificationLogs;
  }
}
