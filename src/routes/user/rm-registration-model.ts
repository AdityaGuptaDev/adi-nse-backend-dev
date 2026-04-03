import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class RMRegistration extends Model<
  InferAttributes<RMRegistration>,
  InferCreationAttributes<RMRegistration>
> {
  declare id: CreationOptional<number>;
  declare Name: string;
  declare email: string;
  declare mobile: string;
  declare ARN: string;
  declare EUIN: string;
  declare isActive: boolean;
  declare isDelete: boolean;
  declare created_by: number;
  declare modified_by: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare static associations: {};

  static initModel(sequelize: Sequelize): typeof RMRegistration {
    RMRegistration.init(
      {
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        Name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isEmail: true,
          },
        },
        mobile: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        ARN: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        EUIN: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        isDelete: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        created_by: {
          type: DataTypes.INTEGER,
        },
        modified_by: {
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

    return RMRegistration;
  }
}
