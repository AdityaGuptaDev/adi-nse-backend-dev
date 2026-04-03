import { Sequelize } from "sequelize/types";

const goalTypes = [
    {
        id: 1,
        goal_name: "Bike",
        goal_icon: "bike.png",
        isActive: true
    },
    {
        id: 2,
        goal_name: "Vacation",
        goal_icon: "vacation.png",
        isActive: true
    },
    {
        id: 3,
        goal_name: "Education",
        goal_icon: "education.png",
        isActive: true
    },
    {
        id: 4,
        goal_name: "Wedding",
        goal_icon: "wedding.png",
        isActive: true
    },
    {
        id: 5,
        goal_name: "Car",
        goal_icon: "car.png",
        isActive: true
    },
    {
        id: 6,
        goal_name: "Property",
        goal_icon: "property.png",
        isActive: true
    },
    {
        id: 7,
        goal_name: "Emergency",
        goal_icon: "emergency.png",
        isActive: true
    },
    {
        id: 8,
        goal_name: "Business",
        goal_icon: "business.png",
        isActive: true
    },
    {
        id: 9,
        goal_name: "Custom",
        goal_icon: "custom.png",
        isActive: true
    },
    {
        id: 10,
        goal_name: "Electronics",
        goal_icon: "electronics.png",
        isActive: true
    },
    {
        id: 11,
        goal_name: "Family",
        goal_icon: "family.png",
        isActive: true
    },
    {
        id: 12,
        goal_name: "Retirement",
        goal_icon: "retirement.png",
        isActive: true
    },
];

export const seedGoalType = async (sequelize: Sequelize) => {
    return sequelize.getQueryInterface().bulkInsert("GoalType", goalTypes);
};
