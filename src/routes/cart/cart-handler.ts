import { Op } from "sequelize";
import { AMCMaster, InvestorCart, SchemeMaster, SchemePerformance } from "../../db/core/init-control-db";


export const findInvestorCartData = (body: any) => {
    return InvestorCart.findOne({
        where: {
            investor_id: body.investor_id,
            scheme_id: body.scheme_id,
            user_id: body.user_id
        }
    })
}

export const addInvestorCartData = (body: any) => {
    return InvestorCart.create(body)
}

export const getAllInvestorCartData = (where: any) => {
    return InvestorCart.findAll({
        where,
        include: [{
            model: SchemeMaster,
            required: true,
            include: [
                {
                    model: AMCMaster,
                }, {

                    model: SchemePerformance,
                },
                // {
                //   model: BseLumpsumParam,
                //   required: true

                // },
                // {
                //   model: bseSipParam,
                //   separate: true,
                //   where: {
                //     frequency: "MONTHLY"
                //   },
                //   required: true

                // }
            ]
        }]
    });
}

export const deleteInvestorCartItem = (id: any) => {
    return InvestorCart.destroy({
        where: { id: id }
    })
}

export const deleteInvestorMultiCartItem = (data: any) => {
    return InvestorCart.destroy({
        where: { id: { [Op.in]: data.cartIds } }
    })
}

export const findCartDataCount = (userId: any) => {
    return InvestorCart.count({
        where: {
            user_id: userId
        }
    })
}