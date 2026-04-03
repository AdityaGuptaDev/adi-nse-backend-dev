import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class RiskProfileAnswer extends Model {
    declare id: CreationOptional<number>
    declare question_id: number
    declare question_type: number
    declare answer: string
    declare range_min: number
    declare range_max: number
    declare point: number
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof RiskProfileAnswer {
        RiskProfileAnswer.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            question_id: {
                type: DataTypes.INTEGER,
            },
            question_type: {
                type: DataTypes.INTEGER,
            },
            answer: {
                type: DataTypes.STRING,
            },
            range_min: {
                type: DataTypes.INTEGER,
            },
            range_max: {
                type: DataTypes.INTEGER,
            },
            point: {
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

        return RiskProfileAnswer
    }
}
