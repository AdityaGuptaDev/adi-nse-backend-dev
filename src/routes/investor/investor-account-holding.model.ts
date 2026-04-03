import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class InvestorAccountHolding extends Model {
    declare id: CreationOptional<number>
    declare investor_id: number
    declare first_investor_id: number
    declare second_investor_id: number
    declare third_investor_id: number
    declare account_holding_type: number
    declare CAN_Id: string
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof InvestorAccountHolding {
        InvestorAccountHolding.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            investor_id: {
                type: DataTypes.INTEGER,
            },

            first_investor_id: {
                type: DataTypes.INTEGER,
            },
            second_investor_id: {
                type: DataTypes.INTEGER,
            },
            third_investor_id: {
                type: DataTypes.INTEGER,
            },
            account_holding_type: {
                type: DataTypes.INTEGER,
            },
            CAN_Id: {
                type: DataTypes.STRING,
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

        return InvestorAccountHolding
    }
}
