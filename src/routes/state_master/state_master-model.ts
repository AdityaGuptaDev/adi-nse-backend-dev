import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize
} from "sequelize";

export class StateMaster extends Model<
    InferAttributes<StateMaster>,
    InferCreationAttributes<StateMaster>
> {
    declare id: CreationOptional<number>;
    declare country_id: number;
    declare name: string;
    declare state_code: string;
    declare bse_code: string;
    declare kyc_code: string;
    declare country_code: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare createdBy: number;
    declare modifiedBy: number;

    declare static associations: {};

    static initModel(sequelize: Sequelize): typeof StateMaster {
        StateMaster.init(
            {
                id: {
                    type: DataTypes.BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                country_id: {
                    type: DataTypes.INTEGER,
                },
                name: {
                    type: DataTypes.STRING,
                },
                state_code: {
                    type: DataTypes.STRING,
                },
                bse_code: {
                    type: DataTypes.STRING,
                },
                kyc_code: {
                    type: DataTypes.STRING,
                },
                country_code: {
                    type: DataTypes.STRING,
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

        return StateMaster;
    }
}
