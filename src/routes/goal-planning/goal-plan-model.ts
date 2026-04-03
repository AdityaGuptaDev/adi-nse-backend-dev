import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class GoalPlan extends Model {
    declare id: CreationOptional<number>
    declare goal_type_id: number
    declare goal_label: string
    declare user_id: number
    declare target_amt: number
    declare calc_amt: number
    declare lumpsum_amt: number
    declare duration_mts: number
    declare err_perc: number
    declare risk_category_id: number
    declare sip_amt: number
    declare sip_duration_mts: number
    declare second_field: number
    declare is_completed: boolean
    declare goal_exec_date: Date
    declare inflation_perc: number
    declare lumpsum_current_amt: number
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof GoalPlan {
        GoalPlan.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            goal_type_id: {
                type: DataTypes.INTEGER,
            },
            goal_label: {
                type: DataTypes.STRING(255),
            },
            user_id: {
                type: DataTypes.INTEGER,
            },
            target_amt: {
                type: DataTypes.INTEGER,
            },
            calc_amt: {
                type: DataTypes.INTEGER,
            },
            lumpsum_amt: {
                type: DataTypes.INTEGER,
            },
            duration_mts: {
                type: DataTypes.INTEGER,
            },
            err_perc: {
                type: DataTypes.FLOAT,
            },
            risk_category_id: {
                type: DataTypes.INTEGER,
            },
            sip_amt: {
                type: DataTypes.INTEGER,
            },
            sip_duration_mts: {
                type: DataTypes.INTEGER,
            },
            second_field: {
                type: DataTypes.INTEGER,
            },
            is_completed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            goal_exec_date: {
                type: DataTypes.DATE,
            },
            inflation_perc: {
                type: DataTypes.FLOAT,
            },
            lumpsum_current_amt: {
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
                defaultValue: sequelize.literal("CURRENT_TIMESTAMP")
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        }, {
            sequelize,
            freezeTableName: true,
        });

        return GoalPlan
    }
}
