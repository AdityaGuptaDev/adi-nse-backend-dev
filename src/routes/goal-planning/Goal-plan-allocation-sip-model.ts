import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class GoalPlanAllocationSIP extends Model {
    declare id: CreationOptional<number>
    declare goal_plan_id: number
    declare scheme_id: number
    declare sip_amount: number
    declare sip_duration: number
    declare sip_frequency: number
    declare bse_order_id: string
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof GoalPlanAllocationSIP {
        GoalPlanAllocationSIP.init({
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
            sip_amount: {
                type: DataTypes.INTEGER,
            },
            sip_duration: {
                type: DataTypes.INTEGER,
            },
            sip_frequency: {
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

        return GoalPlanAllocationSIP
    }
}
