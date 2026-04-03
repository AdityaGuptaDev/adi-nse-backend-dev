import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize
} from "sequelize";

export class UserType extends Model {
    declare id: CreationOptional<number>;
    declare userType: string;
    declare isActive: boolean;
    declare init_path: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    

    static initModel(sequelize: Sequelize): typeof UserType {
        UserType.init(
            {
                id: {
                    type: DataTypes.BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                userType: {
                    type: DataTypes.STRING,
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true
                },
                init_path: {
                    type: DataTypes.STRING,
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

        return UserType;
    }
}
