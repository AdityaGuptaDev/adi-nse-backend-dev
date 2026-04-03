import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";

export class InvestorDeclaration extends Model {
  declare id: CreationOptional<number>;
  declare investor_id: number;
  declare is_indian_citizen: string;
  declare is_politically_exposed: string;
  declare is_indian_taxpayer: string;
  declare is_related_to_pep: string;
  declare occupation: string;
  declare income_source_id: number;
  declare salary_slab_id: number;
  declare signZy_user_id: string;
  declare signZy_user_Token: string;
  declare COB: string;
  declare POB: string;
  declare citizenship_country: number;
  declare foreign_address: string;
  declare foreign_pincode: string;
  declare foreign_city: string;
  declare foreign_district: string;
  declare foreign_state: string;
  declare foreign_country: string;
  declare annual_income: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof InvestorDeclaration {
    InvestorDeclaration.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        investor_id: {
          type: DataTypes.INTEGER,
        },
        is_indian_citizen: {
          type: DataTypes.STRING,
        },
        is_politically_exposed: {
          type: DataTypes.STRING,
        },
        is_indian_taxpayer: {
          type: DataTypes.STRING,
        },
        is_related_to_pep: {
          type: DataTypes.STRING,
        },
      
        occupation: {
          type: DataTypes.INTEGER,

        },
        income_source_id: {
          type: DataTypes.INTEGER,
        },
        salary_slab_id: {
          type: DataTypes.INTEGER,
        },

        COB: {
          type: DataTypes.INTEGER,
          allowNull: true,

        },
        POB: {
          type: DataTypes.STRING,
        },
        citizenship_country: {
          type: DataTypes.INTEGER,
          allowNull: true,

        },
        foreign_address: {
          type: DataTypes.STRING,
          allowNull: true,

        },
        foreign_pincode: {
          type: DataTypes.STRING,
          allowNull: true,

        },
        foreign_city: {
          type: DataTypes.STRING,
          allowNull: true,

        },
        foreign_district: {
          type: DataTypes.STRING,
          allowNull: true,

        },
        foreign_state: {
          type: DataTypes.INTEGER,
          allowNull: true,

        },
        foreign_country: {
          type: DataTypes.INTEGER,
          allowNull: true,

        },
  
        createdAt: {
          type: DataTypes.DATE,
        },
        updatedAt: {
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        freezeTableName: true,
      }
    );

    return InvestorDeclaration;
  }
}
