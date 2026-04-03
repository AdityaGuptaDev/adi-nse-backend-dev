import { Op } from "sequelize";
import { RMRegistration, UserRegistration } from "../../db/core/init-control-db";
const { MakeQuery } = require("../../services/model-service");

export const getBcList = (query: any) => {
  
  const { limit, offset, modelOption, orderBy, attributes, forExcel } =
    MakeQuery({
      query: query,
      Model: UserRegistration,
    });

  const userTypeData = query?.user?.userTypeData;

  if (userTypeData) {
    if (userTypeData.RM) {
      modelOption.push({ rm_id: userTypeData.RM.id });
    }
  }

  let customFilter = query.filters ? JSON.parse(query.filters) : query.filters;

  if (customFilter) {
    if (customFilter.adhaarName) {
      const stepFromIndex = modelOption.findIndex((item: any) => {
        return "adhaarName" in item;
      });

      if (stepFromIndex > -1) {
        modelOption.splice(stepFromIndex, 1);
      }

      modelOption.push({
        adhaar_name: { [Op.like]: `%${customFilter.adhaarName}%` },
      });
    }
  }
  if (query.filters && customFilter.is_delete == true) {
    modelOption.push({ is_delete: true });
  }else {
    modelOption.push({ is_delete: false });
  }
  let includeOption: any = [
    {
      model: RMRegistration,
      attributes: ["id", "Name"],
    },
  ];

  if (forExcel) {
    return UserRegistration.findAll({
      where: modelOption,
      attributes,
      include: includeOption,
      order: [["regId", "DESC"]],
      raw: true,
    });
  } else {
    return UserRegistration.findAndCountAll({
      where: modelOption,
      attributes,
      include: includeOption,
      order: [["regId", "DESC"]],
      raw: true,
      limit,
      offset,
    });
  }
};

