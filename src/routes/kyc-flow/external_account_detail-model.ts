import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";

export class ExternalAccountDetail extends Model {
  declare id: CreationOptional<number>;
  declare username: string;
  declare password: string;
  declare membercode: string;
  declare account_type: string;
  declare external_source: string;
  declare token: string;
  declare tokenExpiry: Date;
  declare api_base_url: string;
  declare mfu_secret: string;
  declare mfu_IV: string;
  declare sender_id: string;
  declare entity_id: string;
  declare template_id: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof ExternalAccountDetail {
    ExternalAccountDetail.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        username: {
          type: DataTypes.TEXT,
        },
        password: {
          type: DataTypes.TEXT,
        },
        membercode: {
          type: DataTypes.TEXT,
        },
        account_type: {
          type: DataTypes.TEXT,
        },
        external_source: {
          type: DataTypes.TEXT,
        },
        token: {
          type: DataTypes.TEXT,
        },
        tokenExpiry: {
          type: DataTypes.DATE,
        },
        api_base_url: {
          type: DataTypes.TEXT,
        },
        mfu_secret: {
          type: DataTypes.TEXT,
        },
        mfu_IV: {
          type: DataTypes.TEXT,
        },
        sender_id: {
          type: DataTypes.TEXT,
        },
        entity_id: {
          type: DataTypes.TEXT,
        },
        template_id: {
          type: DataTypes.TEXT,
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
      }
    );

    return ExternalAccountDetail;
  }
}
