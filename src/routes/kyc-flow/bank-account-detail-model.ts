import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class BankAccountDetail extends Model {
    declare id: CreationOptional<number>
    declare investor_id: number
    declare cancelled_cheque: string
    declare account_no: string
    declare bank_id: number
    declare account_type: string
    declare ifsc: string
    declare micr: string
    declare branch: string
    declare bank_proof: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof BankAccountDetail {
        BankAccountDetail.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            investor_id: {
                type: DataTypes.INTEGER,
            },
            cancelled_cheque: {
                type: DataTypes.STRING,
            },
            account_no: {
                type: DataTypes.STRING,
            },
            bank_id: {
                type: DataTypes.INTEGER,
            },
            account_type: {
                type: DataTypes.STRING,
            },
            ifsc: {
                type: DataTypes.STRING,
            },

            micr: {
                type: DataTypes.STRING,
            },
            branch: {
                type: DataTypes.STRING,
            },
            bank_proof: {
                type: DataTypes.INTEGER,
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

        return BankAccountDetail
    }
}
