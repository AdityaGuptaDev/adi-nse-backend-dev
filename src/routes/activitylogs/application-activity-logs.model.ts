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

  
  export class ApplicationActivityLogs extends Model {
    declare id: CreationOptional<number>
    declare userId: Number
    declare request: string
    declare response: string
    declare requestType: string
    declare createdBy: number
    declare modifiedBy: number
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>

    static initModel(sequelize: Sequelize): typeof ApplicationActivityLogs {
      ApplicationActivityLogs.init({
        id: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          unique: true
        },
        userId: {
          type: DataTypes.INTEGER   
        },
        request: {
          type: DataTypes.TEXT      
        },
        response: {
          type: DataTypes.TEXT      
        },
        requestType: {
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
      
      return ApplicationActivityLogs
    }
  }
  