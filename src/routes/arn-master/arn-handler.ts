import { Op } from "sequelize";
import { ARNMaster } from "../../db/core/init-control-db";

const { MakeQuery } = require("../../services/model-service");

export const getAllARNList = (query: any) => {
  const { limit, offset, modelOption, orderBy, attributes, forExcel } =
    MakeQuery({
      query: query,
      Model: ARNMaster,
    });

  if (forExcel) {
    return ARNMaster.findAll({
      where: modelOption,
      attributes,
      order: orderBy,
      raw: true,
    });
  } else {
    return ARNMaster.findAndCountAll({
      where: modelOption,
      attributes,
      order: orderBy,
      raw: true,
      limit,
      offset,
    });
  }
};

export const addARNData = (body: any) => {
  return ARNMaster.create(body);
};

export const updateARNData = (body: any, params: any) => {
  return ARNMaster.update(body, { where: { id: params.id } });
};

export const deleteARNData = (params: any) => {
  return ARNMaster.destroy({ where: { id: params.id } });
};

export const checkARNData = (body: any, params?: any) => {
  const { ARNNo } = body;

  //for update time
  if (params && params.id) {
    return ARNMaster.findOne({
      where: { ARNNo, id: { [Op.ne]: params.id } },
      raw: true,
    });

    // for add time
  } else {
    return ARNMaster.findOne({
      where: { ARNNo },
      raw: true,
    });
  }
};
