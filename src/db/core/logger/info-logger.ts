import { BaseLogger } from "./base-logger";

class InfoLoggerClass extends BaseLogger {
  constructor(filename: string) {
    super(filename, 'info');
  }

  write(data: any) {
    this.logger.info(`[${new Date().toLocaleString()}]  ${JSON.stringify(data)}`);
  }
}
 
const InfoLogger = new InfoLoggerClass("info.log");
export default InfoLogger;
