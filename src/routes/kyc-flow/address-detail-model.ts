import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class AddressDetail extends Model {
    declare id: CreationOptional<number>
    declare investor_id: number
    declare doc_no: string
    declare doc_holder_name: string
    declare address_proof_type: string
    declare address_front_doc: string
    declare address_back_doc: string
    declare address1: string
    declare address2: string
    declare address_type: number
    declare district: string
    declare city: string
    declare state_id: number
    declare pincode: number
    declare country_id: number
    declare poaConsent: boolean
    declare corr_doc_no: string
    declare corr_address1: string
    declare corr_address2: string
    declare corr_address_type: number
    declare corr_district: string
    declare corr_city: string
    declare corr_state_id: number
    declare corr_pincode: number
    declare corr_country_id: number
    declare same_as_permanent: boolean
    declare corr_aadhaar_back_doc: string
    declare corr_aadhaar_front_doc: string
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof AddressDetail {
        AddressDetail.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            investor_id: {
                type: DataTypes.INTEGER,
            },
            doc_no: {
                type: DataTypes.STRING,
            },
            doc_holder_name: {
                type: DataTypes.STRING,
            },
            address_proof_type: {
                type: DataTypes.STRING,
            },
            address_front_doc: {
                type: DataTypes.STRING,
            },
            address_back_doc: {
                type: DataTypes.STRING,
            },
            address1: {
                type: DataTypes.STRING,
            },
            address2: {
                type: DataTypes.STRING,
            },
            address_type: {
                type: DataTypes.INTEGER,
            },
            pincode: {
                type: DataTypes.INTEGER,
            },
            district: {
                type: DataTypes.STRING,
            },
            city: {
                type: DataTypes.STRING,
            },
            state_id: {
                type: DataTypes.INTEGER,
            },
            country_id: {
                type: DataTypes.INTEGER,
            },
            poaConsent: {
                type: DataTypes.BOOLEAN,
                defaultValue: false

            },
            corr_doc_no: {
                type: DataTypes.STRING,
            },
            corr_address1: {
                type: DataTypes.STRING,
            },
            corr_address2: {
                type: DataTypes.STRING,
            },
            corr_address_type: {
                type: DataTypes.INTEGER,
            },
            corr_district: {
                type: DataTypes.STRING,
            },
            corr_city: {
                type: DataTypes.STRING,
            },
            corr_state_id: {
                type: DataTypes.INTEGER,
            },
            corr_pincode: {
                type: DataTypes.INTEGER,
            },
            corr_country_id: {
                type: DataTypes.INTEGER,
            },
            corr_aadhaar_back_doc: {
                type: DataTypes.STRING,
            },
            corr_aadhaar_front_doc: {
                type: DataTypes.STRING,
            },

            same_as_permanent: {
                type: DataTypes.BOOLEAN,
                defaultValue: true

            },
            createdAt: {
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
            },
        }, {
            sequelize,
            freezeTableName: true,
        });

        return AddressDetail
    }
}
