import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'

export class NomineeDetail extends Model {
    declare id: CreationOptional<number>
    declare investor_id: number
    declare nominee_name: string
    declare nominee_DOB: string
    declare nominee_Type: string
    declare relation: string
    declare mobile_number: string
    declare email_address: string
    declare percentage_allocation: number
    declare guardian_name: string
    declare guardian_PAN: string
    declare guardian_DOB: string
    declare guardian_relationship: number
    declare guardian_mobile: number
    declare guardian_email: number
    declare country: number
    declare state: number
    declare identity_type: number
    declare identity_number: string
    declare city: string
    declare pin_code: string
    declare address_line_1: string
    declare address_line_2: string
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>
    declare nominee_folio_soa: string

    static initModel(sequelize: Sequelize): typeof NomineeDetail {
        NomineeDetail.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            investor_id: {
                type: DataTypes.INTEGER,
            },
            nominee_name: {
                type: DataTypes.STRING,
            },
            nominee_DOB: {
                type: DataTypes.DATEONLY,
            },
            nominee_Type: {
                type: DataTypes.STRING,
            },
            relation: {
                type: DataTypes.INTEGER,
            },
            mobile_number: {
                type: DataTypes.STRING,
            },
            email_address: {
                type: DataTypes.STRING,
            },
            percentage_allocation: {
                type: DataTypes.INTEGER,
            },
            guardian_name: {
                type: DataTypes.STRING,
                allowNull: true,

            },
            guardian_PAN: {
                type: DataTypes.STRING,
                allowNull: true,

            },
            guardian_DOB: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            guardian_relationship: {
                type: DataTypes.INTEGER,
                allowNull: true,

            },
            guardian_mobile: {
                type: DataTypes.STRING,
                allowNull: true,

            },
            guardian_email: {
                type: DataTypes.STRING,
                allowNull: true,

            },
            country: {
                type: DataTypes.INTEGER,
            },
            state: {
                type: DataTypes.INTEGER,
            },
            identity_type: {
                type: DataTypes.INTEGER,

            },
            identity_number: {
                type: DataTypes.STRING,

            },

            city: {
                type: DataTypes.STRING,
            },
            pin_code: {
                type: DataTypes.STRING,
            },
            address_line_1: {
                type: DataTypes.STRING,
            },
            address_line_2: {
                type: DataTypes.STRING,
            },
            createdAt: {
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
            },
            nominee_folio_soa: {
                type: DataTypes.STRING,
            },

        }, {
            sequelize,
            freezeTableName: true,
        });

        return NomineeDetail
    }
}
