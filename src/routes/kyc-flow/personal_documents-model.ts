import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";

export class PersonalDocuments extends Model {
  declare id: CreationOptional<number>;
  declare code: string;
  declare gender: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof PersonalDocuments {
    PersonalDocuments.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        investor_id: {
          type: DataTypes.INTEGER,
        },
        photo: {
          type: DataTypes.STRING,
        },
        signature: {
          type: DataTypes.STRING,
        },
        self_video: {
          type: DataTypes.STRING,
        },
        video_otp: {
          type: DataTypes.INTEGER,
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

    return PersonalDocuments;
  }
}
