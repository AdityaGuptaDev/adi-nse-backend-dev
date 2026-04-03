import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize,
} from "sequelize";

export class BankAccountDetailHistory extends Model {
  declare id: CreationOptional<number>;
  declare bank_account_detail_id: number;
  declare investor_id: number;
  declare cancelled_cheque: string;
  declare account_no: string;
  declare account_type: string;
  declare ifsc: string;
  declare bank_id: number;
  declare micr: string;
  declare branch: string;
  declare bank_proof: string;
  declare action_type: string; // INSERT / UPDATE / DELETE
  declare action_timestamp: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof BankAccountDetailHistory {
    BankAccountDetailHistory.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        bank_account_detail_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        investor_id: {
          type: DataTypes.INTEGER,
        },
        cancelled_cheque: {
          type: DataTypes.STRING,
        },
        account_no: {
          type: DataTypes.STRING(100),
        },
        account_type: {
          type: DataTypes.STRING(50),
        },
        ifsc: {
          type: DataTypes.STRING(20),
        },
        bank_id: {
          type: DataTypes.INTEGER,
        },
        micr: {
          type: DataTypes.STRING(20),
        },
        branch: {
          type: DataTypes.STRING,
        },
        bank_proof: {
          type: DataTypes.STRING(255),
        },
        action_type: {
          type: DataTypes.STRING(50),
          comment: "INSERT / UPDATE / DELETE",
        },
        action_timestamp: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        createdAt: {
          type: DataTypes.DATE,
        },
        updatedAt: {
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        freezeTableName: true,
        tableName: "BankAccountDetailHistory",
      }
    );

    return BankAccountDetailHistory;
  }
}
