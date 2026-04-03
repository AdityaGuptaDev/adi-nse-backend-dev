import {
  Association,
  CreationOptional,
  DataTypes,
  HasManyGetAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyCountAssociationsMixin,
  InferCreationAttributes,
  InferAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from "sequelize";
import type { Users } from "../user/user-model";

type RoleAssociations = "users";

export class Role extends Model<
  InferAttributes<Role, { omit: RoleAssociations }>,
  InferCreationAttributes<Role, { omit: RoleAssociations }>
> {
  declare id: CreationOptional<number>;
  declare userTypeId: number;
  declare roleName: string;
  declare permission: string;
  declare isActive: boolean;
  declare createdBy: number;
  declare modifiedBy: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Role hasMany User
  declare users?: NonAttribute<Users[]>;
  declare getUsers: HasManyGetAssociationsMixin<Users>;
  declare setUsers: HasManySetAssociationsMixin<Users, number>;
  declare addUser: HasManyAddAssociationMixin<Users, number>;
  declare addUsers: HasManyAddAssociationsMixin<Users, number>;
  declare createUser: HasManyCreateAssociationMixin<Users>;
  declare removeUser: HasManyRemoveAssociationMixin<Users, number>;
  declare removeUsers: HasManyRemoveAssociationsMixin<Users, number>;
  declare hasUser: HasManyHasAssociationMixin<Users, number>;
  declare hasUsers: HasManyHasAssociationsMixin<Users, number>;
  declare countUsers: HasManyCountAssociationsMixin;

  declare static associations: {
    users: Association<Role, Users>;
  };

  static initModel(sequelize: Sequelize): typeof Role {
    Role.init(
      {
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        userTypeId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        roleName: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        permission: {
          type: DataTypes.TEXT,

          allowNull: true,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        createdBy: {
          type: DataTypes.INTEGER,
        },
        modifiedBy: {
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

    return Role;
  }
}
