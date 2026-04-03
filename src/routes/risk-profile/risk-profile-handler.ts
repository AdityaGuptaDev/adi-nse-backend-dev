import { Op } from "sequelize";
import { RiskCategory, RiskProfileAnswer, RiskProfileQuestion, UserRiskProfile, UserRiskProfileDetail, Users } from "../../db/core/init-control-db";



export const getAllRiskQuestion = () => {
    return RiskProfileQuestion.findAll({
        include: [
            {
                model: RiskProfileAnswer,
                separate: true,
                order: [["id", "ASC"]]
            },
            {
                model: UserRiskProfileDetail,
                where: {
                    userId: 1,
                },
                required: false,
            },
        ],
        order: [["seqNumber", "ASC"]],
    })
}

export const getRiskCategoryByTotalPoint = (totalPoints: any) => {
    return RiskCategory.findOne({
        where: {
            [Op.and]: [
                {
                    from_score: {
                        [Op.lte]: totalPoints,
                    },
                },
                {
                    to_score: {
                        [Op.gte]: totalPoints,
                    },
                },
            ],
        },
    })
}

export const getUserRiskProfileById = (userId: any) => {
    return UserRiskProfile.findOne({
        where: {
            userId: userId
        }
    })
}

export const updateUserRiskProfile = (body: any, userId: any, t: any) => {
    return UserRiskProfile.update(body, {
        where: { userId: userId },
        transaction: t,
        returning: true
    })
}

// export const updateInvestorRegistration = (id: any, userId: any, t: any) => {
//     return InvestorRegistration.update({ risk_category_id: id },
//         {
//             where: {
//                 user_id: userId,
//             },
//             transaction: t,
//         })
// }

export const deleteUserProfileDetail = (userId: any, t: any) => {
    return UserRiskProfileDetail.destroy({
        where: { userId },
        transaction: t,
    })
}

export const addBulkUserProfileDetail = (answer: any, t: any) => {
    return UserRiskProfileDetail.bulkCreate(answer, { transaction: t });
}

export const addUserRiskProfile = (body: any, t: any) => {
    return UserRiskProfile.create(body, { transaction: t })
}

export const getRiskProfileInvestorByUserId = (id: any) => {
   return UserRiskProfile.findOne({
    where:{
        userId: id
    },
    include: [{ model: RiskCategory }],
   })
}

export const getRiskCategoryById = (params: any) => {
    return RiskCategory.findOne({
        where: {
            id: params?.id
        },
    })
}

export const getAllRiskCategory = () => {
    return RiskCategory.findAll({
        where: {
            isActive: true
        }
    })
}

export const findInvestorRiskCategory = (user_id: any) => {
    return UserRiskProfile.findOne({
        attributes: ["riskProfileId"],
        include: [
          {
            model: Users,
            required: true,
            where: {
              id: user_id,
            },
          },
        ],
      });
}