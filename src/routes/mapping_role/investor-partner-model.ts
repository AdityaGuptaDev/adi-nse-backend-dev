import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class PartnerInvestorMapping extends Model {
    declare id: CreationOptional<number>
    declare partner_id: number
    declare investor_id: number
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>
    declare is_delete: boolean

    static initModel(sequelize: Sequelize): typeof PartnerInvestorMapping {
        PartnerInvestorMapping.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            partner_id: {
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
            is_delete: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        }, {
            sequelize,
            freezeTableName: true,
        });

        return PartnerInvestorMapping
    }
}
