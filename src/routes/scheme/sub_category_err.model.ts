import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
  } from 'sequelize'  
  
  
  export class SubCategoryErr extends Model {
    declare id: CreationOptional<number>
    declare subcategory_id: number
    declare err_perc: number
    declare createdBy: number 
    declare modifiedBy: number 
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>
  
    static initModel(sequelize: Sequelize): typeof SubCategoryErr {
      SubCategoryErr.init({
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        subcategory_id: {
          type: DataTypes.INTEGER,
        },
        err_perc: {
          type: DataTypes.FLOAT,
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
      }, {
        sequelize,
        freezeTableName: true,
      });
  
      return SubCategoryErr
    }
  }