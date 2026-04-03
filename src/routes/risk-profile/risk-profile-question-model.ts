import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class RiskProfileQuestion extends Model {
    declare id: CreationOptional<number>
    declare question: string
    declare question_type: number
    declare seqNumber: number
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof RiskProfileQuestion {
        RiskProfileQuestion.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            question: {
                type: DataTypes.STRING(255),
            },
            question_type: {
                type: DataTypes.INTEGER,
            },
            seqNumber: {
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

        return RiskProfileQuestion
    }
}
