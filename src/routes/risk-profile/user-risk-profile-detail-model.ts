import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class UserRiskProfileDetail extends Model {
    declare id: CreationOptional<number>
    declare userId: number
    declare queId: number
    declare queType: number
    declare selectedAnswer: string
    declare selectedTag: string
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof UserRiskProfileDetail {
        UserRiskProfileDetail.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            userId: {
                type: DataTypes.INTEGER,
            },
            queId: {
                type: DataTypes.INTEGER,
            },
            queType: {
                type: DataTypes.INTEGER,
            },
            selectedAnswer: {
                type: DataTypes.STRING,
            },
            selectedTag: {
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

        return UserRiskProfileDetail
    }
}
