import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class RmInvestorMapping extends Model {
    declare id: CreationOptional<number>
    declare rm_id: number
    declare investor_id: number
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof RmInvestorMapping {
        RmInvestorMapping.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            rm_id: {
                type: DataTypes.INTEGER,
            },
            investor_id: {
                type: DataTypes.INTEGER,
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
        }, {
            sequelize,
            freezeTableName: true,
        });

        return RmInvestorMapping
    }
}
