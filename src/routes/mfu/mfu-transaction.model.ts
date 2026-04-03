import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
} from 'sequelize';

export class MfuTransaction extends Model {
    declare txn_id: CreationOptional<string>;
    declare txn_type: string;
    declare ent_group_ref_no: string;
    declare order_mode: string;

    declare folio_txn_flag: string | null;
    declare folio_det_sec: object | null;
    declare can: string | null;
    declare req_prnt_ent: string | null;
    declare ria_code: string | null;
    declare arn_code: string | null;
    declare sub_arn_code: string | null;
    declare euin: string | null;
    declare euin_declaration: string | null;
    declare sub_brok_code: string | null;
    declare branch_rm_int_code: string | null;
    declare tot_amt: string | number | null;
    declare sch_list: object | null;
    declare dp_sec_flag: string | null;
    declare dp_sec: object | null;
    declare pay_sec_flag: string | null;
    declare pay_sec: object | null;
    declare log_dtl: object | null;
    declare createdAt: CreationOptional<Date | null>;
    declare updatedAt: CreationOptional<Date | null>;
    declare status: string;
    declare goal_id: number;
    declare investor_id: string;
    declare isin: string;


    static initModel(sequelize: Sequelize): typeof MfuTransaction {
        MfuTransaction.init(
            {
                txn_id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.literal('uuid_generate_v4()'),
                },
                txn_type: {
                    type: DataTypes.STRING(10),
                    allowNull: false,
                },
                ent_group_ref_no: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    unique: true
                },
                order_mode: {
                    type: DataTypes.STRING(10),
                    allowNull: false,
                },

                folio_txn_flag: {
                    type: DataTypes.CHAR(1),
                    allowNull: true,
                },
                folio_det_sec: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                can: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                req_prnt_ent: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                ria_code: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                arn_code: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                sub_arn_code: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                euin: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                euin_declaration: {
                    type: DataTypes.CHAR(1),
                    allowNull: true,
                },
                sub_brok_code: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                branch_rm_int_code: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                tot_amt: {
                    type: DataTypes.DECIMAL(18, 2),
                    allowNull: true,
                },
                sch_list: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                dp_sec_flag: {
                    type: DataTypes.CHAR(1),
                    allowNull: true,
                },
                dp_sec: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                pay_sec_flag: {
                    type: DataTypes.CHAR(1),
                    allowNull: true,
                },
                pay_sec: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                log_dtl: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    field: 'created_at',
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    field: 'updated_at',
                },
                status: {
                    type: DataTypes.STRING(20),
                    allowNull: false,
                    defaultValue: 'pending',
                },
                goal_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,

                },
                investor_id: {
                    type: DataTypes.STRING,
                    allowNull: true,

                },
                isin: {
                    type: DataTypes.STRING,
                    allowNull: true,

                },



            },
            {
                sequelize,
                tableName: 'mfu_transactions',
                timestamps: true,
                underscored: true
            }
        );

        return MfuTransaction;
    }
}

export class MfuTransactionAuditLog extends Model {
    declare id: CreationOptional<string>;
    declare transaction_id: string | null;
    declare log_timestamp: CreationOptional<Date>;
    declare event_type: string;
    declare event_description: string | null;
    declare old_values: object | null;
    declare new_values: object | null;
    declare changed_fields: string[] | null;
    declare changed_by: string | null;
    declare user_ip: string | null;
    declare user_agent: string | null;
    declare session_id: string | null;
    declare api_endpoint: string | null;
    declare request_method: string | null;
    declare request_payload: object | null;
    declare response_payload: object | null;
    declare response_status_code: number | null;
    declare response_time_ms: number | null;
    declare error_code: string | null;
    declare error_message: string | null;
    declare stack_trace: string | null;
    declare transaction_status: string | null;
    declare processing_stage: string | null;
    declare external_ref_no: string | null;
    declare tags: string[] | null;
    declare severity: string | null;
    declare additional_data: object | null;

    static initModel(sequelize: Sequelize): typeof MfuTransactionAuditLog {
        MfuTransactionAuditLog.init(
            {
                id: {
                    type: DataTypes.UUID,
                    primaryKey: true,
                    defaultValue: Sequelize.literal('uuid_generate_v4()'),
                },
                transaction_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'mfu_transactions',
                        key: 'txn_id',
                    },
                    onDelete: 'SET NULL',
                    onUpdate: 'CASCADE',
                },
                log_timestamp: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },


                event_type: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                },
                event_description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },

                old_values: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                new_values: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                changed_fields: {
                    type: DataTypes.ARRAY(DataTypes.TEXT),
                    allowNull: true,
                },

                changed_by: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                },
                user_ip: {
                    type: DataTypes.STRING(20),
                    allowNull: true,
                },
                user_agent: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                session_id: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                },
                api_endpoint: {
                    type: DataTypes.STRING(200),
                    allowNull: true,
                },
                request_method: {
                    type: DataTypes.STRING(10),
                    allowNull: true,
                },
                request_payload: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                response_payload: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                response_status_code: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                response_time_ms: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                error_code: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                error_message: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                stack_trace: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                transaction_status: {
                    type: DataTypes.STRING(20),
                    allowNull: true,
                },
                processing_stage: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                external_ref_no: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                tags: {
                    type: DataTypes.ARRAY(DataTypes.TEXT),
                    allowNull: true,
                },
                severity: {
                    type: DataTypes.STRING(20),
                    allowNull: true,
                    defaultValue: 'INFO',
                },
                additional_data: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
            },
            {
                sequelize,
                tableName: 'mfu_transaction_audit_log',
                timestamps: false,
            }
        );

        return MfuTransactionAuditLog;
    }
}
