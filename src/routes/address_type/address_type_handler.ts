import { AddressType } from "../../db/core/init-control-db";


export const getAllAddressType = () => {
    return AddressType.findAll();
}