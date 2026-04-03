import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class AddressType extends Model {
    declare id: CreationOptional<number>
    declare at_code: string
    declare address_type: string
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof AddressType {
        AddressType.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            at_code: {
                type: DataTypes.STRING,
            },
            address_type: {
                type: DataTypes.STRING,
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

        return AddressType
    }
}
