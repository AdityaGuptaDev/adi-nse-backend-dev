import { BaseLogger } from "./base-logger";

class SmsEmailLoggerClass extends BaseLogger {
  constructor(filename: string) {
    super(filename, 'info');
  }

  write(data: any) {
    this.logger.info(`[${new Date().toLocaleString()}]  ${JSON.stringify(data)}`);
  }
  
  // Specific methods for SMS and Email logging
  logSms(to: string, message: string, success: boolean, error?: string) {
    const logData = {
      type: 'SMS',
      to: to,
      message: message,
      success: success,
      error: error,
      timestamp: new Date().toISOString()
    };
    this.write(logData);
  }
  
  logEmail(to: string, subject: string, success: boolean, error?: string) {
    const logData = {
      type: 'EMAIL',
      to: to,
      subject: subject,
      success: success,
      error: error,
      timestamp: new Date().toISOString()
    };
    this.write(logData);
  }
}
 
const SmsEmailLogger = new SmsEmailLoggerClass("smsEmailZano.log");
export default SmsEmailLogger;
