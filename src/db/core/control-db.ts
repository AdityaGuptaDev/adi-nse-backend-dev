import { Options, Sequelize } from "sequelize";
import configs from "../../config/config";
import environment from "../../environment";
import { runSeeders } from "../seeder-data/main-seed";
import currentUser from "../../services/current-user";
import { ActivityLogs } from "../../routes/activitylogs/activitylogs-model";
import { seedUser } from "../seeder-data/user-seed";
import { seedMenu } from "../seeder-data/menu.seed";

const config = (configs as { [key: string]: Options })[environment];

const db: Sequelize = new Sequelize({
  dialect: config.dialect,
  database: config.database,
  username: config.username,
  password: config.password,
  host: config.host,
  // dialectOptions: {
  //   options: {
  //     encrypt: false
  //   }
  // }
});

const authenticate = () => {
  db.authenticate()
    .then(() => {
      console.log(`Db connected`);
    })
    .catch((err) => {
      console.log(err);
    });
};
authenticate();

// const syncControlledDB = () => {
//   db.sync({ force: false })
//     .then(async () => {
//       try {
//         await runSeeders(db);
//         //await seedMenu(db);
//       } catch (error) {
//         console.log(error);
//       }
//       // await seedUser(db);
//       console.log(`model synced for control DB`);
//     })
//     .catch((err) => {
//       console.log(err, "error in synccc");
//     });
// };
// syncControlledDB();

export default db;

// insert data to activity log table
export const insertLog = async (instance: any, options: any) => {
  try {

    if (instance.constructor.name == "ActivityLogs") return;
    // if(environment == 'development') {

    let changes: { prevObj: any; newObj: any } | undefined =
      fetchChanges(instance);
    let oldData = JSON.stringify(instance?._previousDataValues);

    const { old: oldData1, current: newData } = _getData(changes);
    const user: any = currentUser.getCurrentUser();
    if (user) {
      let auditLogObj = {
        userId: user?.id,
        oldData,
        newData,
        activityType: options?.type ? "UPDATE" : "INSERT",
        createdBy: user?.id,
        modifiedBy: user?.id
      };

      // console.log("auditLogObj", auditLogObj)
      // await ActivityLogs.create();
      await ActivityLogs.create(auditLogObj);
    }

  } catch (error) {
    console.log(error);
  }
};

function initHooks() {
  db.addHook("beforeBulkUpdate", (model: any) => {
    model.individualHooks = true;
  });
  db.addHook("beforeCreate", (model: any) => {
    model.individualHooks = true;
  });

  db.addHook("afterSave", (model: any, options: any) => {
    insertLog(model, options);
  });
}
initHooks();

const js = (d: any) => JSON.stringify(d);

function _getData(model: any): { old: string; current: string } {
  return { old: js(model.prevObj), current: js(model.newObj) };
}

//fetch prev and current change from hooks
const fetchChanges = (model: any) => {

  // keys that have changes
  let changes = model?._changed;

  if (!changes) return;
  // previous values
  let prviousValues = model._previousDataValues;
  // current values
  let currentValues = model.dataValues;

  let prevObj: any = {};
  let newObj: any = {};

  // genearte trial
  for (let keys of changes?.values()) {
    prevObj[keys] = prviousValues?.[keys];
    newObj[keys] = currentValues?.[keys];
  }
  return { prevObj, newObj };
};
