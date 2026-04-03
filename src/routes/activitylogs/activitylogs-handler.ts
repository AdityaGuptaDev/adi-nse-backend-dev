import { ActivityLogs } from "./activitylogs-model";
import { Users } from "../user/user-model";
import sequelize from "sequelize";

const { MakeQuery } = require("../../services/model-service");


//get all ActivityLogs filterwise
export const getActivityLogsFilterWise = (query: any) => {
    const { limit,id, offset, modelOption, orderBy, attributes, forExcel } = MakeQuery({
      query: query,
      Model: ActivityLogs,
      orderSetting: {
        NoDefault: false,
      },
    });
    let includeOption: any = [
      {
        model: Users,
        attributes:['id', 'email']
      }
    ]
    if (id) {
      modelOption.push({ id });
      return ActivityLogs.findOne({
        where: modelOption,
        include: includeOption,
        attributes: attributes,
        raw: true
      });
    }else if (forExcel) { 
      return ActivityLogs.findAll({
        where: modelOption,
        include: includeOption,
        attributes,
        order: [["id", "desc"]],
        raw: true,
      }); 
    }else{
        return ActivityLogs.findAndCountAll({
        // where:
          attributes,
          include: includeOption,
          raw: true,
          offset,
          limit,
          logging: false,
          order: [["id", "desc"]],
      })
  }
  }