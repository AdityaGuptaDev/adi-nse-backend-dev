import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize'


export class OccupationMaster extends Model {
    declare id: CreationOptional<number>
    declare occupation: string
    declare occ_code: string
    declare bse_occ_code: string
    declare occ_type: string
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof OccupationMaster {
        OccupationMaster.init({
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
            },
            occupation: {
                type: DataTypes.STRING,
            },
            occ_code: {
                type: DataTypes.STRING,
            },
            bse_occ_code: {
                type: DataTypes.STRING,
            },
            occ_type: {
                type: DataTypes.STRING,
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

        return OccupationMaster
    }
}
