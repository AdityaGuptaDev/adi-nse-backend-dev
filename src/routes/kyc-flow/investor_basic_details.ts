import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize';

export class InvestorBasicDetails extends Model {
    declare id: CreationOptional<number>;
    declare investor_id: number;

    declare name: string;
    declare date_of_birth: Date;
    declare pan_pek: string;
    declare gender: string;

    // RESIDENCE PHONE (ISD + STD + NUMBER)
    declare residence_isd?: string | null;
    declare residence_std?: string | null;
    declare residence_phone?: string | null;

    // MOBILE
    declare mobile_isd?: string | null;
    declare mobile_number: string;

    // EMAIL
    declare email: string;

    // DECLARATIONS
    declare mobile_declaration?: string | null;
    declare email_declaration?: string | null;

    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    static initModel(sequelize: Sequelize): typeof InvestorBasicDetails {
        InvestorBasicDetails.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            investor_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(150),
                allowNull: false,
            },
            date_of_birth: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            pan_pek: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            gender: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },

            // RESIDENCE phone components
            residence_isd: {
                type: DataTypes.STRING(10),
                allowNull: true,
            },
            residence_std: {
                type: DataTypes.STRING(10),
                allowNull: true,
            },
            residence_phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },

            // MOBILE
            mobile_isd: {
                type: DataTypes.STRING(10),
                allowNull: true,
            },
            mobile_number: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },

            // EMAIL
            email: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },

            // DECLARATIONS
            mobile_declaration: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            email_declaration: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },

            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        }, {
            sequelize,
            tableName: "InvestorBasicDetails",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at"
        });

        return InvestorBasicDetails;
    }
}
