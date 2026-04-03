import { success } from "proses-response";
import { encryptData } from "./encryptDecrypt-service";

export const sendEncryptedResponse = async (res: any, data: any, msg: any) => {
  // req.logger.info(
  //   `[${req.route.path}, ${stringifyMethod(req.route.methods)}][${currentTime}], ${msg}`
  // );
  let encryptedData = await encryptData(data);
  return success(res, encryptedData, msg)
  //return success(res, data, msg)
}