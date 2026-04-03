import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
  CreationOptional,
} from "sequelize";

export interface UserRegistrationAttributes {
  regId: number;
  userType?: number | null;
  mobile?: string | null;
  mobileVerified?: number | null;
  mobileVerifiedAt?: Date | null;
  aadhaar?: string | null;
  aadhaarVerified?: number | null;
  aadhaarVerifiedAt?: Date | null;
  pan?: string | null;
  panVerified?: number | null;
  panVerifiedAt?: Date | null;
  bankAcNo?: string | null;
  bankAcIfsc?: string | null;
  bankAcNameInBank?: string | null;
  bankAcBankName?: string | null;
  bankAcMicr?: string | null;
  bankAcNoVerified?: number | null;
  bankAcNoVerifiedAt?: Date | null;
  nism?: string | null;
  nismVerified?: number | null;
  nismVerifiedAt?: Date | null;
  email?: string | null;
  emailVerified?: number | null;
  emailVerifiedAt?: Date | null;
  agreement?: string | null;
  agreementSigned?: number | null;
  agreementSignedAt?: Date | null;
  nomineeName?: string | null;
  nomineeRelation?: number | null;
  nomineeType?: number | null;
  nomineeDob?: Date | null;
  nomineePan?: string | null;
  nomineeCreatedAt?: Date | null;
  userCreated?: number | null;
  userId?: number | null;
  userCreatedAt?: Date | null;
  adhaarName?: String | null;
  adhaarDob?: String | null;
  adhaarAddress?: String | null;
  adhaarPincode?: String | null;
  rm_id: number | null;
  arn_no: String | null;
  euin_no: String | null;
  is_delete: boolean | null;
}

type UserRegistrationCreationAttributes = Optional<
  UserRegistrationAttributes,
  "regId"
>;

export class UserRegistration
  extends Model<UserRegistrationAttributes, UserRegistrationCreationAttributes>
  implements UserRegistrationAttributes {
  declare regId: CreationOptional<number>;
  declare userType: number | null;
  declare mobile: string | null;
  declare mobileVerified: number | null;
  declare mobileVerifiedAt: Date | null;
  declare aadhaar: string | null;
  declare aadhaarVerified: number | null;
  declare aadhaarVerifiedAt: Date | null;
  declare pan: string | null;
  declare panVerified: number | null;
  declare panVerifiedAt: Date | null;
  declare bankAcNo: string | null;
  declare bankAcIfsc: string | null;
  declare bankAcNameInBank: string | null;
  declare bankAcBankName: string | null;
  declare bankAcMicr: string | null;
  declare bankAcNoVerified: number | null;
  declare bankAcNoVerifiedAt: Date | null;
  declare nism: string | null;
  declare nismVerified: number | null;
  declare nismVerifiedAt: Date | null;
  declare email: string | null;
  declare emailVerified: number | null;
  declare emailVerifiedAt: Date | null;
  declare agreement: string | null;
  declare agreementSigned: number | null;
  declare agreementSignedAt: Date | null;
  declare nomineeName: string | null;
  declare nomineeRelation: number | null;
  declare nomineeType: number | null;
  declare nomineeDob: Date | null;
  declare nomineePan: string | null;
  declare nomineeCreatedAt: Date | null;
  declare userCreated: number | null;
  declare userId: number | null;
  declare userCreatedAt: Date | null;
  declare adhaarName: String | null;
  declare adhaarDob: String | null;
  declare adhaarAddress: String | null;
  declare adhaarPincode: String | null;
  declare rm_id: number | null;
  declare arn_no: String | null;
  declare euin_no: String | null;
  declare is_delete: boolean | null;
  reg_id: unknown;
  emailAddress: string | null | undefined;
  static initModel(sequelize: Sequelize): typeof UserRegistration {
    UserRegistration.init(
      {
        regId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field: "reg_id",
        },
        userType: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "user_type",
          comment: "1-Partner, 2-Investor",
        },
        mobile: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        mobileVerified: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "mobile_verified",
        },
        mobileVerifiedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "mobile_verified_at",
        },
        aadhaar: {
          type: DataTypes.STRING(12),
          allowNull: true,
        },
        aadhaarVerified: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "aadhaar_verified",
        },
        aadhaarVerifiedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "aadhaar_verified_at",
        },
        pan: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        panVerified: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "pan_verified",
        },
        panVerifiedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "pan_verified_at",
        },
        bankAcNo: {
          type: DataTypes.STRING(20),
          allowNull: true,
          field: "bank_ac_no",
        },
        bankAcIfsc: {
          type: DataTypes.STRING(20),
          allowNull: true,
          field: "bank_ac_ifsc",
        },
        bankAcNameInBank: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: "bank_ac_name_in_bank",
        },
        bankAcBankName: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: "bank_ac_bank_name",
        },
        bankAcMicr: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: "bank_ac_micr",
        },
        bankAcNoVerified: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "bank_ac_no_verified",
        },
        bankAcNoVerifiedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "bank_ac_no_verified_at",
        },
        nism: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        nismVerified: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "nism_verified",
        },
        nismVerifiedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "nism_verified_at",
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        emailVerified: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "email_verified",
        },
        emailVerifiedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "email_verified_at",
        },
        agreement: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        agreementSigned: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "agreement_signed",
        },
        agreementSignedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "agreement_signed_at",
        },
        nomineeName: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: "nominee_name",
        },
        nomineeRelation: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "nominee_relation",
        },
        nomineeType: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "nominee_type",
        },
        nomineeDob: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: "nominee_dob",
        },
        nomineePan: {
          type: DataTypes.STRING(10),
          allowNull: true,
          field: "nominee_pan",
        },
        nomineeCreatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "nominee_created_at",
        },
        userCreated: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "user_created",
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "user_id",
        },
        userCreatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: "user_created_at",
        },
        adhaarName: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "adhaar_name",
        },
        adhaarDob: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "adhaar_dob",
        },
        adhaarAddress: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "adhaar_address",
        },
        adhaarPincode: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "adhaar_pincode",
        },
        rm_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "rm_id",
        },
        arn_no: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "arn_no",
        },
        euin_no: {
          type: DataTypes.STRING,
          allowNull: true,
          field: "euin_no",
        },
        is_delete: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          field: "is_delete",
        },
      },
      {
        sequelize,
        tableName: "user_registrations",
        timestamps: false,
      }
    );

    return UserRegistration;
  }
}
