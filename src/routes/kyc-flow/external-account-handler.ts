import { Op } from "sequelize";
import { ExternalAccountDetail } from "../../db/core/init-control-db";

const { MakeQuery } = require("../../services/model-service");

export const getAllExternalAccountList = (query: any) => {
  const { limit, offset, modelOption, orderBy, attributes, forExcel } =
    MakeQuery({
      query: query,
      Model: ExternalAccountDetail,
    });

  if (forExcel) {
    return ExternalAccountDetail.findAll({
      where: modelOption,
      attributes,
      order: orderBy,
      raw: true,
    });
  } else {
    return ExternalAccountDetail.findAndCountAll({
      where: modelOption,
      attributes,
      order: orderBy,
      raw: true,
      limit,
      offset,
    });
  }
};

export const addExternalAccount = (body: any) => {
  return ExternalAccountDetail.create(body);
};

export const updateExternalAccount = (body: any, params: any) => {
  return ExternalAccountDetail.update(body, { where: { id: params.id } });
};

export const checkAccountData = (body: any, params?: any) => {
  const { external_source, account_type } = body;

  //for update time
  if (params && params.id) {
    return ExternalAccountDetail.findOne({
      where: { external_source, account_type, id: { [Op.ne]: params.id } },
      raw: true,
    });

    // for add time
  } else {
    return ExternalAccountDetail.findOne({
      where: { external_source, account_type },
      raw: true,
    });
  }
};

export const getExternalAccountByExternalSource = (body: any) => {
  return ExternalAccountDetail.findOne({
    where: { external_source: body.external_source, account_type: body.account_type }
  });
};
