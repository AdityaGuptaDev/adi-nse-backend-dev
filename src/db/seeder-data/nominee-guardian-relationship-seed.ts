import { NomineeGuardianRelationship } from "../../routes/kyc-flow/nominee-guardian-relationship-model";

export const nomineeGuardianRelationshipSeeder = async () => {
    try {
        const guardianRelationshipTypes = [
            { mfu_code: "MFU24", relationship: "FATHER" },
            { mfu_code: "MFU25", relationship: "MOTHER" },
            { mfu_code: "MFU26", relationship: "COURT APPOINTED LEGAL GUARDIAN" }
        ];

        await NomineeGuardianRelationship.bulkCreate(guardianRelationshipTypes, {
            ignoreDuplicates: true
        });

        console.log(" Nominee guardian relationship types seeded successfully");
    } catch (error) {
        console.error(" Error seeding nominee guardian relationship types:", error);
        throw error;
    }
};
