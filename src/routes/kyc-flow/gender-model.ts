import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class Gender extends Model {
    declare id: CreationOptional<number>
    declare code: string
    declare gender: string
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof Gender {
        Gender.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            code: {
                type: DataTypes.STRING,
            },
            gender: {
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

        return Gender
    }
}
