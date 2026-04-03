import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize
} from "sequelize";

export class CountryMaster extends Model<
    InferAttributes<CountryMaster>,
    InferCreationAttributes<CountryMaster>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare ansi_code: string;
    declare bse_code: string;
    declare kyc_code: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
    declare createdBy: number;
    declare modifiedBy: number;

    declare static associations: {};

    static initModel(sequelize: Sequelize): typeof CountryMaster {
        CountryMaster.init(
            {
                id: {
                    type: DataTypes.BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true

                },
                name: {
                    type: DataTypes.STRING,
                },
                ansi_code: {
                    type: DataTypes.STRING,
                },
                bse_code: {
                    type: DataTypes.STRING,
                },
                kyc_code: {
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

        return CountryMaster;
    }
}
