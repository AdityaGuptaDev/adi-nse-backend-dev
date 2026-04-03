import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
  CreationOptional,
} from 'sequelize';

export interface PanVerificationAttributes {
  id: number;
  panNumber: string;
  nameOnPan?: string | null;
  dateOfBirth?: string | null;

  panResponse?: Record<string, any> | null;

  recordStatus: number;
  createdBy: number;
  createdAt?: Date;
  updatedBy: number;
  updatedAt?: Date;
}

type PanVerificationCreationAttributes = Optional<
  PanVerificationAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class PanVerification
  extends Model<PanVerificationAttributes, PanVerificationCreationAttributes>
  implements PanVerificationAttributes
{
  declare id: CreationOptional<number>;
  declare panNumber: string;
  declare nameOnPan: string | null;
  declare dateOfBirth: string | null;
  declare panResponse: Record<string, any> | null;

  declare recordStatus: number;
  declare createdBy: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedBy: number;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof PanVerification {
    PanVerification.init(
      {
        id: {
          type: DataTypes.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },

        panNumber: {
          type: DataTypes.STRING(10),
          allowNull: false,
          field: 'pan_number',
        },

        nameOnPan: {
          type: DataTypes.STRING(100),
          allowNull: true,
          field: 'name_on_pan',
        },

        dateOfBirth: {
          type: DataTypes.STRING(10),
          allowNull: true,
          field: 'date_of_birth',
        },

        panResponse: {
          type: DataTypes.JSONB,
          allowNull: true,
          field: 'pan_response',
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
          allowNull: false,
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
        tableName: 'pan_verifications',
        timestamps: false,
      }
    );

    return PanVerification;
  }
}
