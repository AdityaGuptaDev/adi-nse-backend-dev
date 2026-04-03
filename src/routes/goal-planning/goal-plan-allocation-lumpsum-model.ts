import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class GoalPlanAllocationLumpsum extends Model {
    declare id: CreationOptional<number>
    declare goal_plan_id: number
    declare scheme_id: number
    declare lumpsum_amount: number
    declare lumpsum_duration: number
    declare bse_order_id: string
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof GoalPlanAllocationLumpsum {
        GoalPlanAllocationLumpsum.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            goal_plan_id: {
                type: DataTypes.INTEGER,
            },
            scheme_id: {
                type: DataTypes.INTEGER,
            },
            lumpsum_amount: {
                type: DataTypes.INTEGER,
            },
            lumpsum_duration: {
                type: DataTypes.INTEGER,
            },
            bse_order_id: {
                type: DataTypes.STRING(255),
            },
            createdBy: {
                type: DataTypes.INTEGER,
            },
            modifiedBy: {
                type: DataTypes.INTEGER,
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
            },
        }, {
            sequelize,
            freezeTableName: true,
        });

        return GoalPlanAllocationLumpsum
    }
}
