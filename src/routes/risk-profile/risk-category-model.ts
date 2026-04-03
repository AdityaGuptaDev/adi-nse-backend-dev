import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class RiskCategory extends Model {
    declare id: CreationOptional<number>
    declare risk_type: string
    declare from_duration: number
    declare to_duration: number
    declare err_perc: number
    declare from_score: number
    declare to_score: number
    declare risk_desc: string
    declare isActive: boolean
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof RiskCategory {
        RiskCategory.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            risk_type: {
                type: DataTypes.STRING(255),
                allowNull: false
            },
            from_duration: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            to_duration: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            err_perc: {
                type: DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0
            },
            from_score: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            to_score: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            risk_desc: {
                type: DataTypes.STRING,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
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

        return RiskCategory
    }
}
