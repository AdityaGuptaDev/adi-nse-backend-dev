import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize
} from "sequelize";

export class BackOfficeRegistration extends Model<
    InferAttributes<BackOfficeRegistration>,
    InferCreationAttributes<BackOfficeRegistration>
> {
    declare id: CreationOptional<number>;
    declare Name: string;
    declare email: string;
    declare mobile: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare static associations: {};

    static initModel(sequelize: Sequelize): typeof BackOfficeRegistration {
        BackOfficeRegistration.init(
            {
                id: {
                    type: DataTypes.BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                Name: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    validate: {
                        isEmail: true
                    }
                },
                mobile: {
                    type: DataTypes.STRING,
                    allowNull: false
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

        return BackOfficeRegistration;
    }
}
