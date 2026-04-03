import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize
} from "sequelize";

export class FundManagersMaster extends Model<
    InferAttributes<FundManagersMaster>,
    InferCreationAttributes<FundManagersMaster>
> {
    declare manager_id: CreationOptional<number>;
    declare ms_managerId: string;
    declare manager_name: string;
    declare manager_biography: string;
    declare manager_education: string;
    declare manager_pic: string;
    declare manager_age: string;
    declare inxits_score: string;
    declare manager_exp: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare createdBy: number;
    declare modifiedBy: number;

    declare static associations: {};

    static initModel(sequelize: Sequelize): typeof FundManagersMaster {
        FundManagersMaster.init(
            {
                manager_id: {
                    type: DataTypes.BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true

                },
                ms_managerId: {
                    type: DataTypes.STRING
                },
                manager_name: {
                    type: DataTypes.STRING
                },
                manager_biography: {
                    type: DataTypes.STRING
                },
                manager_education: {
                    type: DataTypes.STRING
                },
                manager_pic: {
                    type: DataTypes.STRING
                },
                manager_age: {
                    type: DataTypes.STRING
                },
                inxits_score: {
                    type: DataTypes.STRING
                },
                manager_exp: {
                    type: DataTypes.STRING
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

        return FundManagersMaster;
    }
}
