import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
  CreationOptional,
} from 'sequelize';

export interface AadhaarVerificationAttributes {
  id: number;
  aadhaarNumber: string;
  aadhaarResponse?: object | null;
  recordStatus: number;
  createdBy: number;
  createdAt?: Date;
  updatedBy?: number | null;
  updatedAt?: Date;
}

type AadhaarVerificationCreationAttributes = Optional<
  AadhaarVerificationAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class AadhaarVerification
  extends Model<AadhaarVerificationAttributes, AadhaarVerificationCreationAttributes>
  implements AadhaarVerificationAttributes
{
  declare id: CreationOptional<number>;
  declare aadhaarNumber: string;
  declare aadhaarResponse: object | null;
  declare recordStatus: number;
  declare createdBy: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedBy: number | null;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof AadhaarVerification {
    AadhaarVerification.init(
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        aadhaarNumber: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: false,
          field: 'aadhaar_number',
        },
        aadhaarResponse: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'aadhaar_response',
        },
        recordStatus: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'record_status',
        },
        createdBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'created_by',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
        },
        updatedBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'updated_by',
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'updated_at',
        },
      },
      {
        sequelize,
        tableName: 'aadhaar_verifications',
        timestamps: false,
      }
    );

    return AadhaarVerification;
  }
}
