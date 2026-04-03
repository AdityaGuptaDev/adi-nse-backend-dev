import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class InvestorPortfolio extends Model {
    declare id: CreationOptional<number>
    declare investor_id: number
    declare can_id: string
    declare scheme_id: number
    declare folio_number: string
    declare units_available: number
    declare invested_value: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof InvestorPortfolio {
        InvestorPortfolio.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            investor_id: {
                type: DataTypes.INTEGER,
            },

            can_id: {
                type: DataTypes.STRING,
            },
            scheme_id: {
                type: DataTypes.INTEGER,
            },
            folio_number: {
                type: DataTypes.STRING,
            },
            units_available: {
                type: DataTypes.FLOAT,
            },
            invested_value: {
                type: DataTypes.FLOAT,
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

        return InvestorPortfolio
    }
}
