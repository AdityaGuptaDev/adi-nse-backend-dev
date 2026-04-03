const { MakeQuery } = require("../../services/model-service");
import { Op } from "sequelize";
import { Role } from "./role-model";
import { Menu } from "../menu/menu-model";

//roles dropdown api
export const getAllRoles = async () => {
  return Role.findAll({
    where: { isActive: true },
  });
};

//for get role filter
export const getAllRole = (query: any) => {
  const { limit, offset, modelOption, orderBy, attributes, forExcel } =
    MakeQuery({
      query: query,
      Model: Role,
    });

  let modalParam = {};
  if (forExcel) {
    modalParam = {
      where: modelOption,
      attributes,
      order: orderBy,
      raw: true,
    };
    return Role.findAll(modalParam);
  } else {
    modalParam = {
      where: modelOption,
      attributes,
      order: orderBy,
      raw: true,
      limit,
      offset,
    };
    return Role.findAndCountAll(modalParam);
  }
};

//create role
export const addRole = async (body: any) => {
  return Role.create(body);
};

//for get by id
export const getRolebyID = (params: any) => {
  return Role.findOne({
    where: {
      id: params.id,
    },
  });
};

export const getMultipleRoleData = (ids: number[]) => {
  return Role.findAll({
    where: {
      id: ids
    },
    raw: true
  })
};

//for update role
export const updateRole = (body: any, params: any) => {
  return Role.update(body, { where: { id: params.id }});
};

//for delete role
export const deleteRole = (params: any) => {
  return Role.destroy({
    where: {
      id: params.id,
    },
  });
};

//for check unique role name
export const checkRoleName = (body: any, params?: any) => {
  const { roleName, id } = body;

  //for update time
  if (params && params.id) {
    return Role.findOne({
      where: { roleName, id: { [Op.ne]: params.id } },
      raw: true,
    });

    // for add time
  } else {
    return Role.findOne({
      where: { roleName },
      raw: true,
    });
  }
};

//for get all role for dropdown
export const getAllActiveRole = () => {
  return Role.findAll({ where: { isActive: true } });
};

//for get all user for dropdown
export const getAllActiveMenu = () => {
  return Menu.findAll({
    where: { isActive: true },
    raw: true,
    order: [["sequenceNumber", "ASC"]],
  });
};

//add Permission
export const addPermission = (body: any) => {
  const { permission, id } = body;

  return Role.update({ permission }, { where: { id } });
};
