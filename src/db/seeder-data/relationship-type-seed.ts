import { NominineeRelationshipType } from "../../routes/kyc-flow/nominee-relationship-type-model";

export const relationshipTypeSeeder = async () => {
    try {
        const relationshipTypes = [
            { mfu_code: "MFU01", relationship: "FATHER" },
            { mfu_code: "MFU02", relationship: "MOTHER" },
            { mfu_code: "MFU03", relationship: "COURT APPOINTED LEGAL GUARDIAN" },
            { mfu_code: "MFU04", relationship: "AUNT" },
            { mfu_code: "MFU05", relationship: "BROTHER-IN-LAW" },
            { mfu_code: "MFU06", relationship: "BROTHER" },
            { mfu_code: "MFU07", relationship: "DAUGHTER" },
            { mfu_code: "MFU08", relationship: "DAUGHTER-IN-LAW" },
            { mfu_code: "MFU09", relationship: "FATHER-IN-LAW" },
            { mfu_code: "MFU10", relationship: "GRAND DAUGHTER" },
            { mfu_code: "MFU11", relationship: "GRAND FATHER" },
            { mfu_code: "MFU12", relationship: "GRAND MOTHER" },
            { mfu_code: "MFU13", relationship: "GRAND SON" },
            { mfu_code: "MFU14", relationship: "MOTHER-IN-LAW" },
            { mfu_code: "MFU15", relationship: "NEPHEW" },
            { mfu_code: "MFU16", relationship: "NIECE" },
            { mfu_code: "MFU17", relationship: "SISTER" },
            { mfu_code: "MFU18", relationship: "SISTER-IN-LAW" },
            { mfu_code: "MFU19", relationship: "SON" },
            { mfu_code: "MFU20", relationship: "SON-IN-LAW" },
            { mfu_code: "MFU21", relationship: "SPOUSE" },
            { mfu_code: "MFU22", relationship: "UNCLE" },
            { mfu_code: "MFU23", relationship: "OTHERS" }
        ];

        await NominineeRelationshipType.bulkCreate(relationshipTypes, {
            ignoreDuplicates: true
        });

        console.log("✅ Relationship types seeded successfully");
    } catch (error) {
        console.error("❌ Error seeding relationship types:", error);
        throw error;
    }
};
