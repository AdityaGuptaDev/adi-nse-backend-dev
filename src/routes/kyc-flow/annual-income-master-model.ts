import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class AnnuaIincomeMaster extends Model {
    declare source_id: CreationOptional<number>
    declare source_name: string
    declare bse_code: string
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof AnnuaIincomeMaster {
        AnnuaIincomeMaster.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            income_range: {
                type: DataTypes.STRING,
            },
            ai_code: {
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

        return AnnuaIincomeMaster
    }
}
