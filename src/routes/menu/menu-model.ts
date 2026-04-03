import {
  CreationOptional,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class Menu extends Model<
  InferAttributes<Menu>,
  InferCreationAttributes<Menu>
> {
  declare id: CreationOptional<number>;
  declare parentID: number;
  declare title: string;
  declare icon: string;
  declare link: string | null;
  declare isActive: number;
  declare sequenceNumber: number;
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof Menu {
    Menu.init(
      {
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          unique: true

        },
        parentID: {
          type: DataTypes.INTEGER,
          defaultValue: null,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        link: {
          type: DataTypes.STRING,
          defaultValue: null,
        },
        icon: {
          type: DataTypes.STRING,
          defaultValue: null,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: null,
        },
        createdBy: {
          type: DataTypes.INTEGER
        },
        modifiedBy: {
          type: DataTypes.INTEGER 
        },
        sequenceNumber: {
          type: DataTypes.SMALLINT,
          defaultValue: null,
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

    return Menu;
  }
}
