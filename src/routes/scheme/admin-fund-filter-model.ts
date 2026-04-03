import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
  } from 'sequelize'  
  
  
  export class AdminFundExploreFilter extends Model {
    declare id: CreationOptional<number>
    declare filter_data: string
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>
  
    static initModel(sequelize: Sequelize): typeof AdminFundExploreFilter {
      AdminFundExploreFilter.init({
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        filter_data: {
          type: DataTypes.TEXT,
        },
        createdAt: {
          type: DataTypes.DATE,
        },
        updatedAt: {
          type: DataTypes.DATE,
        },
      }, {
        sequelize,
        freezeTableName: true,
      });
  
      return AdminFundExploreFilter
    }
  }
  