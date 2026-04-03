import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize
} from "sequelize";

export class UserMapping extends Model {
    declare id: CreationOptional<number>;
    declare user_id: number;
    declare role_id: number;
    declare userType_id: number;
    declare ref_id: number;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;


    static initModel(sequelize: Sequelize): typeof UserMapping {
        UserMapping.init(
            {
                id: {
                    type: DataTypes.BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                user_id: {
                    type: DataTypes.INTEGER,
                },
                role_id: {
                    type: DataTypes.INTEGER,
                },
                userType_id: {
                    type: DataTypes.INTEGER,
                },
                ref_id: {
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

        return UserMapping;
    }
}
