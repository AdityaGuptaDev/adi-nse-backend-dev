import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class ARNMaster extends Model {
    declare id: CreationOptional<number>
    declare ARNNo: number
    declare holder_name: string
    declare EUIN: string
    declare RIA: string
    declare MFU: string
    declare isActive: boolean
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof ARNMaster {
        ARNMaster.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            ARNNo: {
                type: DataTypes.INTEGER,
            },
            holder_name: {
                type: DataTypes.STRING(255),
            },
            EUIN: {
                type: DataTypes.STRING(255),
            },
            RIA: {
                type: DataTypes.STRING(255),
            },
            MFU: {
                type: DataTypes.STRING(255),
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

        return ARNMaster
    }
}
