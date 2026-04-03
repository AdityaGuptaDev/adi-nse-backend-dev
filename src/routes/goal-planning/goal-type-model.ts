import {
    CreationOptional,
    DataTypes,
    Model,
    Sequelize
  } from 'sequelize'  
  
  
  export class GoalType extends Model {
    declare id: CreationOptional<number>
    declare goal_name: string
    declare goal_icon: string
    declare isActive: boolean
    declare createdBy: number 
    declare modifiedBy: number 
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>
  
    static initModel(sequelize: Sequelize): typeof GoalType {
      GoalType.init({
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          unique: true,
        },
        goal_name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        goal_icon: {
          type: DataTypes.STRING,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
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
  
      return GoalType
    }
  }
  