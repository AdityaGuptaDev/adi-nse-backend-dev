import { CreationOptional, DataTypes, Model, Sequelize } from 'sequelize'

export class InvestorAdditionalKyc extends Model {
    declare id: CreationOptional<number>
    declare investor_id: number
    declare gross_annual_income: string | null
    declare networth: string | null
    declare networth_as_on: string | null
    declare source_of_wealth: string | null
    declare occupation: string | null
    declare political_exposure: string | null
    declare kra_address_type: string | null
    declare created_at: CreationOptional<Date>
    declare updated_at: CreationOptional<Date>
    declare date_of_birth: Date;
    declare pan_pek: string;

    static initModel(sequelize: Sequelize): typeof InvestorAdditionalKyc {
        InvestorAdditionalKyc.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            investor_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            gross_annual_income: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            networth: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            networth_as_on: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            source_of_wealth: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            occupation: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            political_exposure: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            kra_address_type: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            date_of_birth: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            pan_pek: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
        }, {
            sequelize,
            tableName: "InvestorAdditionalKyc",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at"
        });

        return InvestorAdditionalKyc
    }
}
