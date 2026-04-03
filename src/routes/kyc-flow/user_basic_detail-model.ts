import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";

export class InvestorRegistration extends Model {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare group_leader_id: number;
  declare name: string;
  declare annualFund: string;
  // declare last_name: string
  declare fathers_name: string;
  declare father_relation: string;
  declare father_title: string;

  declare dob: Date;
  declare pan_no: string;
  declare pan_doc: string;
  declare gender: string;
  declare marital_status: string;
  declare mothers_name: string;
  declare isKYCDone: boolean;
  declare member_type: number;
  declare risk_category_id: number;
  declare signzy_kyc_id: string;
  declare signzy_user_name: string;
  declare last_kyc_step: string;
  declare is_kyc_complete: boolean;
  declare is_CAN_registered: boolean;
  declare reg_email: string;
  declare email_relation: string;
  declare reg_mobile: string;
  declare mobile_relation: string;
  declare tax_status: number;
  declare guardian_pan_no: string;
  declare guardian_name: string;
  declare guardian_dob: Date;
  declare relationship_primary: string;
  declare relationship_proof: string;
  declare guardian_mobile: string;
  declare guardian_mobile_relation: string;
  declare relationship_proof_document: string;
  declare guardian_email: string;
  declare guardian_email_relation: string;
  declare user_type: string;
  declare poiConsent: boolean;
  declare partner_id: number;
  declare rm_id: number;
  declare isDelete: boolean;
  declare createdBy: number;
  declare modifiedBy: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare investor_category: string;
  declare holding_nature: string;
  declare holders: number;

  static initModel(sequelize: Sequelize): typeof InvestorRegistration {
    InvestorRegistration.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
        },
        group_leader_id: {
          type: DataTypes.INTEGER,
        },
        name: {
          type: DataTypes.STRING,
        },
        annualFund: {
          type: DataTypes.STRING,
        },
        fathers_name: {
          type: DataTypes.STRING,
        },
        father_relation: {
          type: DataTypes.STRING,
        },
        father_title: {
          type: DataTypes.STRING,
        },
        dob: {
          type: DataTypes.DATEONLY,
        },
        pan_no: {
          type: DataTypes.STRING,
        },
        pan_doc: {
          type: DataTypes.STRING,
        },
        gender: {
          type: DataTypes.INTEGER,
        },
        marital_status: {
          type: DataTypes.INTEGER,
        },
        mothers_name: {
          type: DataTypes.STRING,
        },

        isKYCDone: {
          type: DataTypes.BOOLEAN,
        },
        member_type: {
          type: DataTypes.INTEGER,
        },
        risk_category_id: {
          type: DataTypes.INTEGER,
        },
        signzy_kyc_id: {
          type: DataTypes.STRING,
        },
        signzy_user_name: {
          type: DataTypes.STRING,
        },
        last_kyc_step: {
          type: DataTypes.STRING,
        },
        is_kyc_complete: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        is_CAN_registered: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        reg_email: {
          type: DataTypes.STRING,
        },
        email_relation: {
          type: DataTypes.INTEGER,
        },
        reg_mobile: {
          type: DataTypes.STRING,
        },
        mobile_relation: {
          type: DataTypes.INTEGER,
        },
        tax_status: {
          type: DataTypes.INTEGER,
        },
        guardian_pan_no: {
          type: DataTypes.STRING,
        },
        guardian_name: {
          type: DataTypes.STRING,
        },
        guardian_dob: {
          type: DataTypes.DATEONLY,
        },
        relationship_primary: {
          type: DataTypes.INTEGER,
        },
        relationship_proof: {
          type: DataTypes.INTEGER,
        },
        guardian_mobile: {
          type: DataTypes.STRING,
        },
        guardian_mobile_relation: {
          type: DataTypes.INTEGER,
        },
        guardian_email: {
          type: DataTypes.STRING,
        },
        guardian_email_relation: {
          type: DataTypes.INTEGER,
        },
        relationship_proof_document: {
          type: DataTypes.STRING,
        },
        user_type: {
          type: DataTypes.STRING,
        },
        poiConsent: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        partner_id: {
          type: DataTypes.INTEGER,
        },
        rm_id: {
          type: DataTypes.INTEGER,
        },
        isDelete: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
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
        investor_category: {
          type: DataTypes.STRING,
        },
        holding_nature: {
          type: DataTypes.STRING,
        },
        holders: {
          type: DataTypes.INTEGER,
        },
        next_kyc_step: {
          type: DataTypes.STRING,
        },
        mode_of_registration: {
          type: DataTypes.STRING,
        }
      },
      {
        sequelize,
        freezeTableName: true,
      }
    );

    return InvestorRegistration;
  }
}
