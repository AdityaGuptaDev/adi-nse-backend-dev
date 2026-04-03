import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class RelationshipPrimaryHolder extends Model {
    declare id: CreationOptional<number>
    declare code: string
    declare relationship: string
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof RelationshipPrimaryHolder {
        RelationshipPrimaryHolder.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            code: {
                type: DataTypes.STRING,
            },
            relationship: {
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

        return RelationshipPrimaryHolder
    }
}
