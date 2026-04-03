import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
  CreationOptional,
} from "sequelize";

// Transaction Log Attributes (for Purchase, Redemption, Switch)
export interface NseTransactionLogAttributes {
  id: number;
  clientCode?: string | null;
  transactionType?: string | null; // PURCHASE, REDEMPTION, SWITCH
  transactionRefNo?: string | null;

  requestPayload?: object | null;
  responsePayload?: object | null;

  status?: string | null;
  remark?: string | null;

  orderId?: string | null;
  orderStatus?: string | null;
  orderRemark?: string | null;

  createdAt?: Date | null;
  updatedAt?: Date | null;
}

type NseTransactionLogCreationAttributes = Optional<
  NseTransactionLogAttributes,
  "id"
>;

export class NseTransactionLog
  extends Model<
    NseTransactionLogAttributes,
    NseTransactionLogCreationAttributes
  >
  implements NseTransactionLogAttributes
{
  declare id: CreationOptional<number>;
  declare clientCode: string | null;
  declare transactionType: string | null;
  declare transactionRefNo: string | null;

  declare requestPayload: object | null;
  declare responsePayload: object | null;

  declare status: string | null;
  declare remark: string | null;

  declare orderId: string | null;
  declare orderStatus: string | null;
  declare orderRemark: string | null;

  declare createdAt: Date | null;
  declare updatedAt: Date | null;

  static initModel(sequelize: Sequelize): typeof NseTransactionLog {
    NseTransactionLog.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        clientCode: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "client_code",
        },
        transactionType: {
          type: DataTypes.STRING(20),
          allowNull: true,
          field: "transaction_type",
        },
        transactionRefNo: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "transaction_ref_no",
        },
        requestPayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "request_payload",
        },
        responsePayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "response_payload",
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        remark: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        orderId: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "order_id",
        },
        orderStatus: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "order_status",
        },
        orderRemark: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "order_remark",
        },
        createdAt: {
          type: DataTypes.DATE,
          field: "created_at",
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updated_at",
        },
      },
      {
        sequelize,
        tableName: "nse_transaction_logs",
        timestamps: false,
      }
    );

    return NseTransactionLog;
  }
}

// SIP/XSIP/STP/SWP Registration Log Attributes
export interface NseSipRegistrationLogAttributes {
  id: number;
  clientCode?: string | null;
  registrationType?: string | null; // SIP, XSIP, STP, SWP
  sipRegNo?: string | null;

  requestPayload?: object | null;
  responsePayload?: object | null;

  status?: string | null;
  remark?: string | null;

  regId?: string | null;
  regStatus?: string | null;
  regRemark?: string | null;

  createdAt?: Date | null;
  updatedAt?: Date | null;
}

type NseSipRegistrationLogCreationAttributes = Optional<
  NseSipRegistrationLogAttributes,
  "id"
>;

export class NseSipRegistrationLog
  extends Model<
    NseSipRegistrationLogAttributes,
    NseSipRegistrationLogCreationAttributes
  >
  implements NseSipRegistrationLogAttributes
{
  declare id: CreationOptional<number>;
  declare clientCode: string | null;
  declare registrationType: string | null;
  declare sipRegNo: string | null;

  declare requestPayload: object | null;
  declare responsePayload: object | null;

  declare status: string | null;
  declare remark: string | null;

  declare regId: string | null;
  declare regStatus: string | null;
  declare regRemark: string | null;

  declare createdAt: Date | null;
  declare updatedAt: Date | null;

  static initModel(sequelize: Sequelize): typeof NseSipRegistrationLog {
    NseSipRegistrationLog.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        clientCode: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "client_code",
        },
        registrationType: {
          type: DataTypes.STRING(10),
          allowNull: true,
          field: "registration_type",
        },
        sipRegNo: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "sip_reg_no",
        },
        requestPayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "request_payload",
        },
        responsePayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "response_payload",
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        remark: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        regId: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "reg_id",
        },
        regStatus: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "reg_status",
        },
        regRemark: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "reg_remark",
        },
        createdAt: {
          type: DataTypes.DATE,
          field: "created_at",
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updated_at",
        },
      },
      {
        sequelize,
        tableName: "nse_sip_registration_logs",
        timestamps: false,
      }
    );

    return NseSipRegistrationLog;
  }
}

// Cancellation Log Attributes (Order Cancellation, STP Cancellation)
export interface NseCancellationLogAttributes {
  id: number;
  clientCode?: string | null;
  cancellationType?: string | null; // ORDER, STP
  originalOrderId?: string | null;

  requestPayload?: object | null;
  responsePayload?: object | null;

  status?: string | null;
  remark?: string | null;

  cancellationId?: string | null;
  cancellationStatus?: string | null;
  cancellationRemark?: string | null;

  createdAt?: Date | null;
  updatedAt?: Date | null;
}

type NseCancellationLogCreationAttributes = Optional<
  NseCancellationLogAttributes,
  "id"
>;

export class NseCancellationLog
  extends Model<
    NseCancellationLogAttributes,
    NseCancellationLogCreationAttributes
  >
  implements NseCancellationLogAttributes
{
  declare id: CreationOptional<number>;
  declare clientCode: string | null;
  declare cancellationType: string | null;
  declare originalOrderId: string | null;

  declare requestPayload: object | null;
  declare responsePayload: object | null;

  declare status: string | null;
  declare remark: string | null;

  declare cancellationId: string | null;
  declare cancellationStatus: string | null;
  declare cancellationRemark: string | null;

  declare createdAt: Date | null;
  declare updatedAt: Date | null;

  static initModel(sequelize: Sequelize): typeof NseCancellationLog {
    NseCancellationLog.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        clientCode: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "client_code",
        },
        cancellationType: {
          type: DataTypes.STRING(10),
          allowNull: true,
          field: "cancellation_type",
        },
        originalOrderId: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "original_order_id",
        },
        requestPayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "request_payload",
        },
        responsePayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "response_payload",
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        remark: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        cancellationId: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "cancellation_id",
        },
        cancellationStatus: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "cancellation_status",
        },
        cancellationRemark: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "cancellation_remark",
        },
        createdAt: {
          type: DataTypes.DATE,
          field: "created_at",
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updated_at",
        },
      },
      {
        sequelize,
        tableName: "nse_cancellation_logs",
        timestamps: false,
      }
    );

    return NseCancellationLog;
  }
}

// Bank Details Log Attributes
export interface NseBankDetailsLogAttributes {
  id: number;
  clientCode?: string | null;

  requestPayload?: object | null;
  responsePayload?: object | null;

  status?: string | null;
  remark?: string | null;

  bankDetailId?: string | null;
  bankDetailStatus?: string | null;
  bankDetailRemark?: string | null;

  createdAt?: Date | null;
  updatedAt?: Date | null;
}

type NseBankDetailsLogCreationAttributes = Optional<
  NseBankDetailsLogAttributes,
  "id"
>;

export class NseBankDetailsLog
  extends Model<
    NseBankDetailsLogAttributes,
    NseBankDetailsLogCreationAttributes
  >
  implements NseBankDetailsLogAttributes
{
  declare id: CreationOptional<number>;
  declare clientCode: string | null;

  declare requestPayload: object | null;
  declare responsePayload: object | null;

  declare status: string | null;
  declare remark: string | null;

  declare bankDetailId: string | null;
  declare bankDetailStatus: string | null;
  declare bankDetailRemark: string | null;

  declare createdAt: Date | null;
  declare updatedAt: Date | null;

  static initModel(sequelize: Sequelize): typeof NseBankDetailsLog {
    NseBankDetailsLog.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        clientCode: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "client_code",
        },
        requestPayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "request_payload",
        },
        responsePayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "response_payload",
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        remark: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        bankDetailId: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "bank_detail_id",
        },
        bankDetailStatus: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "bank_detail_status",
        },
        bankDetailRemark: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "bank_detail_remark",
        },
        createdAt: {
          type: DataTypes.DATE,
          field: "created_at",
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updated_at",
        },
      },
      {
        sequelize,
        tableName: "nse_bank_details_logs",
        timestamps: false,
      }
    );

    return NseBankDetailsLog;
  }
}

// Mandate Registration Log Attributes
export interface NseMandateLogAttributes {
  id: number;
  clientCode?: string | null;
  mandateType?: string | null; // PURCHASE, REDEMPTION
  mandateId?: string | null;

  requestPayload?: object | null;
  responsePayload?: object | null;

  status?: string | null;
  remark?: string | null;

  regId?: string | null;
  regStatus?: string | null;
  regRemark?: string | null;

  createdAt?: Date | null;
  updatedAt?: Date | null;
}

type NseMandateLogCreationAttributes = Optional<
  NseMandateLogAttributes,
  "id"
>;

export class NseMandateLog
  extends Model<
    NseMandateLogAttributes,
    NseMandateLogCreationAttributes
  >
  implements NseMandateLogAttributes
{
  declare id: CreationOptional<number>;
  declare clientCode: string | null;
  declare mandateType: string | null;
  declare mandateId: string | null;

  declare requestPayload: object | null;
  declare responsePayload: object | null;

  declare status: string | null;
  declare remark: string | null;

  declare regId: string | null;
  declare regStatus: string | null;
  declare regRemark: string | null;

  declare createdAt: Date | null;
  declare updatedAt: Date | null;

  static initModel(sequelize: Sequelize): typeof NseMandateLog {
    NseMandateLog.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        clientCode: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "client_code",
        },
        mandateType: {
          type: DataTypes.STRING(20),
          allowNull: true,
          field: "mandate_type",
        },
        mandateId: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "mandate_id",
        },
        requestPayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "request_payload",
        },
        responsePayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "response_payload",
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        remark: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        regId: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "reg_id",
        },
        regStatus: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "reg_status",
        },
        regRemark: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "reg_remark",
        },
        createdAt: {
          type: DataTypes.DATE,
          field: "created_at",
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updated_at",
        },
      },
      {
        sequelize,
        tableName: "nse_mandate_logs",
        timestamps: false,
      }
    );

    return NseMandateLog;
  }
}

// Report Log Attributes (Provisional Report, Order Status, 2FA Report, Member Fund Allocation)
export interface NseReportLogAttributes {
  id: number;
  reportType?: string | null; // PROVISIONAL, ORDER_STATUS, 2FA, FUND_ALLOCATION
  clientCode?: string | null;

  requestPayload?: object | null;
  responsePayload?: object | null;

  status?: string | null;
  remark?: string | null;

  reportId?: string | null;
  reportStatus?: string | null;
  reportRemark?: string | null;

  createdAt?: Date | null;
  updatedAt?: Date | null;
}

type NseReportLogCreationAttributes = Optional<
  NseReportLogAttributes,
  "id"
>;

export class NseReportLog
  extends Model<
    NseReportLogAttributes,
    NseReportLogCreationAttributes
  >
  implements NseReportLogAttributes
{
  declare id: CreationOptional<number>;
  declare reportType: string | null;
  declare clientCode: string | null;

  declare requestPayload: object | null;
  declare responsePayload: object | null;

  declare status: string | null;
  declare remark: string | null;

  declare reportId: string | null;
  declare reportStatus: string | null;
  declare reportRemark: string | null;

  declare createdAt: Date | null;
  declare updatedAt: Date | null;

  static initModel(sequelize: Sequelize): typeof NseReportLog {
    NseReportLog.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        reportType: {
          type: DataTypes.STRING(20),
          allowNull: true,
          field: "report_type",
        },
        clientCode: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "client_code",
        },
        requestPayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "request_payload",
        },
        responsePayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "response_payload",
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        remark: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        reportId: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "report_id",
        },
        reportStatus: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "report_status",
        },
        reportRemark: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "report_remark",
        },
        createdAt: {
          type: DataTypes.DATE,
          field: "created_at",
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updated_at",
        },
      },
      {
        sequelize,
        tableName: "nse_report_logs",
        timestamps: false,
      }
    );

    return NseReportLog;
  }
}

// Bank eLog Upload Log Attributes
export interface NseElogLogAttributes {
  id: number;
  clientCode?: string | null;

  requestPayload?: object | null;
  responsePayload?: object | null;

  status?: string | null;
  remark?: string | null;

  elogId?: string | null;
  elogStatus?: string | null;
  elogRemark?: string | null;

  createdAt?: Date | null;
  updatedAt?: Date | null;
}

type NseElogLogCreationAttributes = Optional<
  NseElogLogAttributes,
  "id"
>;

export class NseElogLog
  extends Model<
    NseElogLogAttributes,
    NseElogLogCreationAttributes
  >
  implements NseElogLogAttributes
{
  declare id: CreationOptional<number>;
  declare clientCode: string | null;

  declare requestPayload: object | null;
  declare responsePayload: object | null;

  declare status: string | null;
  declare remark: string | null;

  declare elogId: string | null;
  declare elogStatus: string | null;
  declare elogRemark: string | null;

  declare createdAt: Date | null;
  declare updatedAt: Date | null;

  static initModel(sequelize: Sequelize): typeof NseElogLog {
    NseElogLog.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        clientCode: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "client_code",
        },
        requestPayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "request_payload",
        },
        responsePayload: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: "response_payload",
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        remark: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        elogId: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "elog_id",
        },
        elogStatus: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "elog_status",
        },
        elogRemark: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: "elog_remark",
        },
        createdAt: {
          type: DataTypes.DATE,
          field: "created_at",
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updated_at",
        },
      },
      {
        sequelize,
        tableName: "nse_elog_logs",
        timestamps: false,
      }
    );

    return NseElogLog;
  }
}
