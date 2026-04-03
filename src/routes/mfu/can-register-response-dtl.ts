import { CreationOptional, DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface CanRegisterResponseAttributes {
  id: number;
  investor_id:number;
  rawResponse: object;
  createdAt?: Date;
}

export type CanRegisterResponseCreationAttributes = Optional<
  CanRegisterResponseAttributes,
  'id' | 'createdAt'
>;

export class CanRegisterResponse
  extends Model<CanRegisterResponseAttributes, CanRegisterResponseCreationAttributes>
  implements CanRegisterResponseAttributes {
  
  declare id: CreationOptional<number>;
  declare investor_id: CreationOptional<number>;
  declare rawResponse: object;
  declare createdAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof CanRegisterResponse {
    CanRegisterResponse.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field: 'id',
        },
        investor_id: {
          type: DataTypes.INTEGER,
          primaryKey: false,
          autoIncrement: false,
          field: 'investor_id',
        },
        rawResponse: {
          type: DataTypes.JSONB,
          allowNull: false,
          field: 'raw_response',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'created_at',
        },
      },
      {
        sequelize,
        tableName: 'can_register_response',
        timestamps: false,
      }
    );

    return CanRegisterResponse;
  }
}
