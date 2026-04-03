import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class BankMaster extends Model {
    declare id: CreationOptional<number>
    declare bank_name: string
    declare mfu_bk_id: number
    declare net_banking_pz: boolean
    declare db_card_pz: boolean
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof BankMaster {
        BankMaster.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            bank_name: {
                type: DataTypes.STRING,
            },

            mfu_bk_id: {
                type: DataTypes.INTEGER,
            },
            net_banking_pz: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            db_card_pz: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
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

        return BankMaster
    }
}
