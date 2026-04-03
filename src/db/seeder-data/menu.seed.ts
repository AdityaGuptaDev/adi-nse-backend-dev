import { Sequelize } from "sequelize/types";


const menu = [
  { id: 1, link: "/", parentID: null, title: "Dashboard", icon: "FiGrid", isActive: true, sequenceNumber: 1 },
  { id: 2, link: "/user-management", parentID: null, title: "User Management", icon: "FaUsers", isActive: true, sequenceNumber: 2 },
  { id: 3, link: "/user-management/user", parentID: 2, title: "User", icon: "FaUser", isActive: true, sequenceNumber: 3 },
  { id: 4, link: "/user-management/permission", parentID: 2, title: "Permission", icon: "BsFillShieldLockFill", isActive: true, sequenceNumber: 4 },
  { id: 5, link: "/user-management/role", parentID: 2, title: "Roles", icon: "FaCaretRight", isActive: true, sequenceNumber: 5 },

  // Activity Log
  // {id: 10, link: "/activity-logger/list", parentID: null, title: "Activity Log", icon: "fa-solid fa-tag"  , isActive:true, sequenceNumber: 10},

];

export const seedMenu = async (sequelize: Sequelize) => { 
  return sequelize.getQueryInterface().bulkInsert("Menu", menu);
};