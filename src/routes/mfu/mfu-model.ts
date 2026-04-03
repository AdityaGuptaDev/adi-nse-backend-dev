import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize';

export class MfuAccessToken extends Model {
  declare id: CreationOptional<number>;
  declare access_token: string;
  declare token_type: string;
  declare expires_in: number;
  declare expires_at: Date;
  declare createdAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof MfuAccessToken {
    MfuAccessToken.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        access_token: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        token_type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        expires_in: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'mfu_access_tokens',
        timestamps: false,
      }
    );

    return MfuAccessToken;
  }
}
//model for mfu scheme maser


export class MfuFundScheme extends Model {
  declare scheme_code: string;
  declare fund_code: string;
  declare plan_name: string;
  declare scheme_type: string | null;
  declare plan_type: string | null;
  declare plan_opt: string | null;
  declare div_opt: string | null;
  declare amfi_id: string | null;
  declare pri_isin: string | null;
  declare sec_isin: string | null;
  declare nfo_start: string | null;
  declare nfo_end: string | null;
  declare allot_date: string | null;
  declare reopen_date: string | null;
  declare maturity_date: string | null;
  declare entry_load: string | null;
  declare exit_load: string | null;
  declare pur_allowed: string | null;
  declare nfo_allowed: string | null;
  declare redeem_allowed: string | null;
  declare sip_allowed: string | null;
  declare switch_out_allowed: string | null;
  declare switch_in_allowed: string | null;
  declare stp_out_allowed: string | null;
  declare stp_in_allowed: string | null;
  declare swp_allowed: string | null;
  declare demat_allowed: string | null;
  declare catg_id: string | null;
  declare sub_catg_id: string | null;
  declare scheme_flag: string | null;


  static initModel(sequelize: Sequelize): typeof MfuFundScheme {
    MfuFundScheme.init(
      {
        scheme_code: {
          type: DataTypes.STRING(20),
          primaryKey: true,
        },
        fund_code: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        plan_name: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        scheme_type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        plan_type: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        plan_opt: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        div_opt: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        amfi_id: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        pri_isin: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        sec_isin: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        nfo_start: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        nfo_end: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        allot_date: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        reopen_date: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        maturity_date: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        entry_load: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        exit_load: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        pur_allowed: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: { isIn: [['Y', 'N']] },
        },
        nfo_allowed: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: { isIn: [['Y', 'N']] },
        },
        redeem_allowed: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: { isIn: [['Y', 'N']] },
        },
        sip_allowed: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: { isIn: [['Y', 'N']] },
        },
        switch_out_allowed: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: { isIn: [['Y', 'N']] },
        },
        switch_in_allowed: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: { isIn: [['Y', 'N']] },
        },
        stp_out_allowed: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: { isIn: [['Y', 'N']] },
        },
        stp_in_allowed: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: { isIn: [['Y', 'N']] },
        },
        swp_allowed: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: { isIn: [['Y', 'N']] },
        },
        demat_allowed: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: { isIn: [['Y', 'N']] },
        },
        catg_id: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        sub_catg_id: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        scheme_flag: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'mfu_fund_schemes',
        timestamps: false,
      }
    );

    return MfuFundScheme;
  }
}

//scheme transaction modal

export class MfuSchemeTransaction extends Model {
  declare id: CreationOptional<number>;
  declare fund_code: number | null;
  declare scheme_code: string;
  declare txn_type: string | null;
  declare sys_freq: number | null;
  declare sys_freq_opt: string | null;
  declare sys_date: number | null;
  declare min_amt: number | null;
  declare max_amt: number | null;
  declare multiple_amt: number | null;
  declare min_units: number | null;
  declare multiple_units: number | null;
  declare min_inst: number | null;
  declare max_inst: number | null;
  declare sys_perpetual: string | null;
  declare min_cum_amt: number | null;
  declare start_date: Date | null;
  declare end_date: Date | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof MfuSchemeTransaction {
    MfuSchemeTransaction.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        fund_code: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        scheme_code: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        txn_type: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        sys_freq: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        sys_freq_opt: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        sys_date: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        min_amt: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: true,
        },
        max_amt: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: true,
        },
        multiple_amt: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: true,
        },
        min_units: {
          type: DataTypes.DECIMAL(15, 6),
          allowNull: true,
        },
        multiple_units: {
          type: DataTypes.DECIMAL(15, 6),
          allowNull: true,
        },
        min_inst: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        max_inst: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        sys_perpetual: {
          type: DataTypes.CHAR(1),
          allowNull: true,
          validate: { isIn: [['Y', 'N']] },
        },
        min_cum_amt: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: true,
        },
        start_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        end_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'mfu_scheme_transactions',
        timestamps: false,
      }
    );

    return MfuSchemeTransaction;
  }
}


//Reference No

export class ReferenceNumber extends Model {
  declare id: CreationOptional<number>;
  declare reference_no: string;
  declare sequence: number;
  declare createdAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof ReferenceNumber {
    ReferenceNumber.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        reference_no: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        sequence: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "reference_numbers",
        timestamps: true,
        updatedAt: false,
        createdAt: "createdAt",
      }
    );

    return ReferenceNumber;
  }
}

