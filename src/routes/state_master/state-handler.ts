import { CountryMaster, StateMaster } from "../../db/core/init-control-db";



//for get all state for dropdown
export const getAllStateByCountry = (params: any) => {
    return StateMaster.findAll({
      where: { country_id: params.id },
    //   include: [
    //     {
    //       model: CountryMaster,
    //       attributes: ['id', "name"]
    //     }
    //   ],
    });
  }