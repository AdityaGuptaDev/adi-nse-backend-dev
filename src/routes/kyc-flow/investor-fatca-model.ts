import { CreationOptional, DataTypes, Model, Sequelize } from 'sequelize'

export class InvestorFatcaDetails extends Model {
    declare id: CreationOptional<number>
    declare investor_id: number
    declare is_tax_resident_other_than_india: boolean
    declare place_of_birth: string | null
    declare country_of_birth: string | null
    declare country_of_citizenship: string | null
    declare country_of_nationality: string | null
    declare tax_residency_countries: string | null
    declare tax_identification_numbers: string | null
    declare tax_identification_types: string | null
    declare created_at: CreationOptional<Date>
    declare updated_at: CreationOptional<Date>
    declare date_of_birth: Date;
    declare pan_pek: string;

    static initModel(sequelize: Sequelize): typeof InvestorFatcaDetails {
        InvestorFatcaDetails.init({
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
            is_tax_resident_other_than_india: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            place_of_birth: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            country_of_birth: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            country_of_citizenship: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            country_of_nationality: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            tax_residency_countries: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            tax_identification_numbers: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            tax_identification_types: {
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
            tableName: "InvestorFatcaDetails",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        });

        return InvestorFatcaDetails;
    }
}
