import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class UserRiskProfile extends Model {
    declare id: CreationOptional<number>
    declare userId: number
    declare riskProfileId: number
    declare totalPoints: number
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof UserRiskProfile {
        UserRiskProfile.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            userId: {
                type: DataTypes.INTEGER,
            },
            riskProfileId: {
                type: DataTypes.INTEGER,
            },
            totalPoints: {
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

        return UserRiskProfile
    }
}
