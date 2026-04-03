import colors from "colors/safe";
import log4js from "log4js";

const date = new Date();
const currentTime = date.toLocaleTimeString("en-US");

let logger = log4js.getLogger("zano_logs");
let severErrorLogger = log4js.getLogger("error_logs");


export const errorLog = (err: any) => {
  logger.error(`[${currentTime}], ${err}`);
};

export const warningLog = (warning: string) => {
  logger.warn(`[${currentTime}], ${warning}`);
};

export const infoLog = (info: string) => {
  logger.info(`[${currentTime}], ${info}`);
};

export const loggingOptions = {
  benchmark: true,
  logging: (logStr: string, execTime: number | undefined, options: any) => {
    if (!options) {
      options = execTime;
      execTime = undefined;
    }

    let col: any = null;
    switch (options.type) {
      case "SELECT":
        col = colors.blue;
        break;
      case "UPDATE":
        col = colors.yellow;
        break;
      case "INSERT":
        col = colors.green;
        break;
      default:
        col = colors.white;
        break;
    }
    if (execTime) {
      if (execTime >= 100) {
        col = colors.red;
        console.log(colors.magenta(`[${execTime} ms]`), col(logStr));
      } else {
        //console.log(colors.green(`[${execTime} ms]`), col(logStr));
      }
    }
  },
};

// for email and sms logs
const smsEmailFile = `./logs/smsEmailZano.log`;
log4js.configure({
  appenders: {
    console: { type: "console" },
    file: { type: "file", filename: smsEmailFile },
  },
  categories: {
    zano_smsemail_logs: { appenders: ["file"], level: "info" },
    default: { appenders: ["console"], level: "info" },
  },
});
let smsEmailLogger = log4js.getLogger("zano_smsemail_logs");

log4js.configure({
  appenders: {
    console: { type: "console" },
    file: { type: "file", filename: './logs/error-logs.log' },
  },
  categories: {
    error_logs: { appenders: ["file"], level: "info" },
    default: { appenders: ["console"], level: "info" },
  },
});

export const logApiError = (err: any, info:any, type: 'err'|'success') => {
  if(type == 'err') {
    severErrorLogger.error(`[${currentTime}], Error: ${err} api is ${info}`)
  }
}

export const cronJobError = (err: any, name: any) => {
  severErrorLogger.error(`[${currentTime}], Error: ${err} in cronjob ${name}`)
}

export const logSmsEmail = (info: any, type: "err" | "success") => {
  if (type == "err") {
    smsEmailLogger.error(`[${currentTime}], Error: ${info}`);
  } else {
    smsEmailLogger.info(`[${currentTime}], ${info}`);
  }
};
