import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize';

export class Mandate extends Model {
    declare id: CreationOptional<number>;
    declare investor_id: number;
    declare can_id: string;
    declare mandate_type: string;
    declare mmrn: string;
    declare prn: string;
    declare unique_refno: string;
    declare reg_mode: string;
    declare acc_no: string;
    declare acc_type: string;
    declare bank_id: number;
    declare ifsc: string;
    declare micr: string;
    declare max_amt: number;
    declare start_date: Date;
    declare end_date: Date;
    declare mandate_status: string;
    declare createdAt: CreationOptional<Date>;
    declare mmrnAggrStatus: string;
    declare mmrnRegStatus: string;


    static initModel(sequelize: Sequelize): typeof Mandate {
        Mandate.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                investor_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                can_id: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                mandate_type: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                mmrn: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                prn: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                unique_refno: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                reg_mode: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                acc_no: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                acc_type: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                bank_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                ifsc: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                micr: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                max_amt: {
                    type: DataTypes.FLOAT,
                    allowNull: false,
                },
                start_date: {
                    type: DataTypes.DATEONLY,
                    allowNull: false,
                },
                end_date: {
                    type: DataTypes.DATEONLY,
                    allowNull: false,
                },
                mandate_status: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                mmrnaggrstatus: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                mmrnregstatus: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                }
            },
            {
                sequelize,
                tableName: 'investor_mandates',
                timestamps: false,
            }
        );

        return Mandate;
    }
}
