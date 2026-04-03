import loggerInstance from "proses-logger";
import { responseHandler } from "proses-response";
import prosesjwt from "proses-jwt";
import { info } from "console";
import { logApiError } from "../services/logging-service";

export const initProsesConfig = () => {
  loggerInstance.init({ path: "./logs/info.log" });
  responseHandler.registerLoggers({
    err: (err: any, info: any) => {
      if(err.name == 'SequelizeDatabaseError'){
        logApiError(JSON.stringify(err),info, 'err')

      }else{
        let finalErr = formatErrorMessage(err, info)
        logApiError(finalErr, info, 'err')

      }
    },
  });
  responseHandler.registerDialect("mysql");
  prosesjwt.init({
    secret: "va*proses",
    expiry: "12h",
  });

  const formatErrorMessage = (rawError:any, apiinfo:any) => {
    let wholeErr = JSON.stringify(rawError.stack);
    let message:any = rawError.message
    return `${message} at FilePath: ${wholeErr} ` 
  }
};
