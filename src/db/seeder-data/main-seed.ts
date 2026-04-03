import { Sequelize } from "sequelize";

import { seedUser } from "./user-seed";
import { seedRoles } from "./role-seed";
import { seedMenu } from "./menu.seed";
import { seedGoalType } from "./goal-type-seed";
import { seedKYCPincode } from "./kyc-pincode";
import { seedBankProof } from "./bank-proof-seed";
import { relationshipTypeSeeder } from "./relationship-type-seed";
import { nomineeGuardianRelationshipSeeder } from "./nominee-guardian-relationship-seed";
import { UserTypeSeeder } from "./user-type-seed";
import { MfuTransaction } from "../core/init-control-db";

export const runSeeders = async (sequelize: Sequelize) => {
    console.log("running seeders")
    await UserTypeSeeder();
    await seedRoles(sequelize);
    await seedUser(sequelize);
    await seedMenu(sequelize);
    await seedGoalType(sequelize);

    await seedKYCPincode(sequelize);
    await seedBankProof(sequelize);
    await relationshipTypeSeeder();
    await nomineeGuardianRelationshipSeeder();








    // await seedCountry(sequelize, 101); // if country wise data dump pass contryid other wise pass null
    // await seedState(sequelize, 101);  // if country wise data dump pass contryid other wise pass null
    // await seedCity(sequelize, 101);  // if country wise data dump pass contryid other wise pass null


}