// models/DecentroLog.ts
import { CreationOptional, DataTypes, Model, Sequelize } from 'sequelize';

export class DecentroLog extends Model {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare reference_id: string;
  declare api_type: string;
  declare request_payload: any;
  declare response_data: any;
  declare status: string;
  declare remark: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare user_type_id: number;
  declare mobile_no:string;

  static initModel(sequelize: Sequelize): typeof DecentroLog {
    DecentroLog.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reference_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      api_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      request_payload: {
        type: DataTypes.JSONB,
      },
      response_data: {
        type: DataTypes.JSONB,
      },
      status: {
        type: DataTypes.STRING,
      },
      remark: {
        type: DataTypes.TEXT,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
       user_type_id: {
  type: DataTypes.INTEGER,
},
mobile_no: {
  type: DataTypes.STRING,
},
    }, {
      sequelize,
      tableName: 'DecentroLogs',
      freezeTableName: true,
    });

    return DecentroLog;
  }
}