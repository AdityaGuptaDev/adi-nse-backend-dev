import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class GoalPlanUserAlloc extends Model {
    declare id: CreationOptional<number>
    declare goal_plan_id: number
    declare risk_category_id: number
    declare scheme_cate_id: number
    declare scheme_subcate_id: number
    declare scheme_id: number
    declare weightage: number
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof GoalPlanUserAlloc {
        GoalPlanUserAlloc.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            goal_plan_id: {
                type: DataTypes.INTEGER,
            },
            risk_category_id: {
                type: DataTypes.INTEGER,
            },
            scheme_cate_id: {
                type: DataTypes.INTEGER,
            },
            scheme_subcate_id: {
                type: DataTypes.INTEGER,
            },
            scheme_id: {
                type: DataTypes.INTEGER,
            },
            weightage: {
                type: DataTypes.FLOAT,
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

        return GoalPlanUserAlloc
    }
}
