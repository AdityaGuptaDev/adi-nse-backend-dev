import { CountryMaster } from "../../db/core/init-control-db";



//for get all country for dropdown
export const getAllCountry = () => {
    return CountryMaster.findAll();
}

export const findCountrybyName = (name: string) => {
    return CountryMaster.findOne({
        where: {
            name
        }
    });
}