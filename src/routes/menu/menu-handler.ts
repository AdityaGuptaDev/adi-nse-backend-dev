import { Sequelize } from "sequelize/types";
import { Menu } from "./menu-model";

export const getMenu$ = async (instance: Sequelize) => {
  try {
    return Menu.findAll({
      where: { isActive: true },
    });
  } catch (error) {
    return error;
  }
};
