import express from "express";
import prosesjwt from "proses-jwt";
import { other, serverError } from "proses-response";
import { sendEncryptedResponse } from "../../services/encryptResponse-service";
import {
  addPermission,
  getAllActiveMenu,
  getRolebyID,
} from "../role/role-handler";
import { dataWriteRateLimit, dataReadRateLimit } from "../../middlewares/rateLimit";
const router = express.Router();
// import { assignUserTypeId } from "../../db/handlers/assignUserType-handler";
const { tokenMiddleWare } = prosesjwt;

/**
 * to get all menu list with permission
 */
router.get("/getMenuPermissionList", dataReadRateLimit, tokenMiddleWare, async (req, res) => {
  try {
    // get the menu list
    const menu = await getAllActiveMenu();

    if (!menu) {
      throw other(res, "Did not get menu");
    }

    const getPermission: any = await getRolebyID({ id: req.query.id });
    if (!getPermission) {
      throw other(res, "Did not get permission");
    }

    const prepareMenu = await adjustMenu(menu, null);
    const menuSetPermission = await setPermission(
      prepareMenu,
      JSON.parse(getPermission?.permission)
    );
    sendEncryptedResponse(res, menuSetPermission, "get Menu permission");
  } catch (error) {
    serverError(res, error);
  }
});

router.post("/addMenuPermission", dataWriteRateLimit, tokenMiddleWare,async (req, res) => {
  try {
    let updatedPermission: any = await addPermission(req.body);
    sendEncryptedResponse(res, updatedPermission, "Add permission Success");
    // sendEncryptedResponse(res, updatedPermission, "Add permission Success");

  } catch (error) {
    serverError(res, error);
  }
});

export const adjustMenu = (data: any, parent_id: any) => {
  if (!data) return;

  let tempMenu: any = [];

  data.forEach((ele: any) => {
    if (ele.parentID == parent_id) {
      let obj;

      if (parent_id == null) {
        obj = {
          type: "parent",
          id: ele.id,
          title: ele.title,
          icon: ele.icon,
          link: ele.link,
          children: adjustMenu(data, ele.id),
        };
      } else {
        obj = {
          id: ele.id,
          title: ele.title,
          link: ele.link,
          parentID: parent_id,
          type: "child",
          children: [],
        };
      }

      tempMenu.push(obj);
    }
  });

  return tempMenu;
};

/** role based permited menu */
export const getPermission = (singleMenu: any, permission: any) => {
  if (!singleMenu.children.length) {
    return [
      permission?.[singleMenu?.id]?.["view"],
      [],
      permission?.[singleMenu?.id],
    ];
  }

  const children = singleMenu.children
    .filter((i: any) => permission?.[i.id]?.["view"])
    .map((j: any) => ({ ...j, permission: permission?.[j.id] }));

  return [!!children.length, children, null];
};

/** return the permission based menu */
export function permitedMenu(menu: any, permission: any) {
  const MENU = adjustMenu(menu, null);
  // return MENU
  let tempMenu: any = [];

  for (let item of MENU) {
    const [flag, children, perm] = getPermission(item, permission);

    if (flag) {
      if (perm) {
        tempMenu.push({
          ...item,
          children,
          permission: perm,
        });
      } else {
        tempMenu.push({
          ...item,
          children,
        });
      }
    }
  }

  return tempMenu;
}

/**
 *  menu - if menu/submenu hav view permission then it is in sidebar
 */
export var setPermission = function (menu: any, perm: any) {
  let d = setMenuOfViewPermission(menu, perm, false);
  return d;
  function setMenuOfViewPermission(
    menu: any,
    permission: any,
    isChild = false
  ) {
    return menu.filter((item: any) => {
      const basePerm = {
        view: false,
        add: false,
        edit: false,
        delete: false,
        disabled: false,
      };

      const singlePerm = permission ? permission[item?.id] : basePerm;

      if (item?.children?.length == 0) {
        item.permission = singlePerm;
        return true;
      } else if (item?.children?.length > 0) {
        /**if menu have children then recursive call for pemission set in child menu */
        item.children = setMenuOfViewPermission(item.children, perm, true);
        return item.children.length > 0;
      } else {
        return false;
      }
    });
  }
};

module.exports = router;
