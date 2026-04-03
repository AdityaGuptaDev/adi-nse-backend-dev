import { UserType } from "../../routes/user/usertype-model";

export const UserTypeSeeder = async () => {
    try {
        const data = [
            { userType: "Supar Admin", isActive: true, init_path: null },
            { userType: "Investor", isActive: true, init_path: null },
            { userType: "RM", isActive: true, init_path: null },
            { userType: "Partner", isActive: true, init_path: null },


        ];

        await UserType.bulkCreate(data, {
            ignoreDuplicates: true
        });

        console.log("✅ User types seeded successfully");
    } catch (error) {
        console.error("❌ Error seeding User types:", error);
        throw error;
    }
};
