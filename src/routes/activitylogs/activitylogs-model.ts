import {
    Association,
    CreationOptional,
    DataTypes,
    Model,
    Sequelize,
    TextDataType,
    NonAttribute
  } from 'sequelize'

  import { Users } from '../user/user-model'

  type ActivityLogsAssociations = 'user'
  
  export class ActivityLogs extends Model {
    declare id: CreationOptional<number>
    declare userId: Number
    declare oldData: string
    declare newData: string
    declare activityType: string
    declare pageName: string
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    declare user?: NonAttribute<Users>

    declare static associations: {
      user: Association<ActivityLogs, Users>;
    }
  
    static initModel(sequelize: Sequelize): typeof ActivityLogs {
      ActivityLogs.init({
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          unique: true
        },
        userId: {
          type: DataTypes.INTEGER   
        },
        oldData: {
          type: DataTypes.TEXT      
        },
        newData: {
          type: DataTypes.TEXT      
        },
        activityType: {
          type: DataTypes.STRING      
        },
        createdBy: {
          type: DataTypes.INTEGER
        },
        modifiedBy: {
          type: DataTypes.INTEGER
        },
        createdAt: {
          type: DataTypes.DATE
        },
        updatedAt: {
          type: DataTypes.DATE
        }
      }, {
        sequelize
      })
      
      return ActivityLogs
    }
  }
  