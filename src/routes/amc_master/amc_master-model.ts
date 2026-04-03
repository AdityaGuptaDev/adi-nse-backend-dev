import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize
} from "sequelize";

export class AMCMaster extends Model<
    InferAttributes<AMCMaster>,
    InferCreationAttributes<AMCMaster>
> {
    declare id: CreationOptional<number>;
    declare Name: string;
    declare bseAMC: string;
    declare AMCCode: string;
    declare amc_logo: string;
    declare amc_reg_name: string;
    declare office_address: string;
    declare city: string;
    declare contact: number;
    declare fax: string;
    declare website: string;
    declare amc_registrar: string;
    declare isActive: boolean;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare createdBy: number;
    declare modifiedBy: number;

    declare static associations: {};

    static initModel(sequelize: Sequelize): typeof AMCMaster {
        AMCMaster.init(
            {
                id: {
                    type: DataTypes.BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true

                },
                Name: {
                    type: DataTypes.STRING,
                },
                bseAMC: {
                    type: DataTypes.STRING,
                },
                AMCCode: {
                    type: DataTypes.STRING,
                },
                amc_logo: {
                    type: DataTypes.STRING,
                },
                amc_reg_name: {
                    type: DataTypes.STRING,
                },
                office_address: {
                    type: DataTypes.STRING,
                },
                city: {
                    type: DataTypes.STRING,
                },
                contact: {
                    type: DataTypes.BIGINT,
                },
                fax: {
                    type: DataTypes.STRING,
                },
                website: {
                    type: DataTypes.STRING,
                },
                amc_registrar: {
                    type: DataTypes.STRING,
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
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

        return AMCMaster;
    }
}
