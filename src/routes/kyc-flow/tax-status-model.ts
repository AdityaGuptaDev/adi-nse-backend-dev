import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class TaxStatus extends Model {
    declare id: CreationOptional<number>
    declare code: string
    declare status: string
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof TaxStatus {
        TaxStatus.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            code: {
                type: DataTypes.STRING,
            },
            status: {
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

        return TaxStatus
    }
}
