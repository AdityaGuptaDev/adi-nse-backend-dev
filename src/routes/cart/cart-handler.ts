import { Op } from "sequelize";
import { AMCMaster, InvestorCart, SchemeMaster, SchemePerformance } from "../../db/core/init-control-db";


export const findInvestorCartData = (body: any) => {
    // Scope the duplicate check to (investor, user, scheme, trans_type) so the
    // same fund can live in the cart as both a Lumpsum and a SIP — they are
    // distinct transactions and should each be addable independently.
    const where: any = {
        investor_id: body.investor_id,
        scheme_id: body.scheme_id,
        user_id: body.user_id,
    };
    if (body.trans_type !== undefined && body.trans_type !== null) {
        where.trans_type = body.trans_type;
    }
    return InvestorCart.findOne({ where });
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