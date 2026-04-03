import { ExternalEntity } from "../utils/constant";
import { getExternalCred } from "./credentialService";
import SmsEmailLogger from "../db/core/logger/sms-email-logger";

const axios = require("axios");

export class SmsService {
  static async sendSmsUsingNimbus(to: string, message: string) {
    console.log("to = " + to);
    console.log("message = " + message);

    try {
      let creObj: any = {
        type: ExternalEntity.SMS,
      };

      let credentialsData: any = await getExternalCred(creObj);
      
      // Check if credentials were found
      if (!credentialsData) {
        console.error("SMS credentials not found in database");
        SmsEmailLogger.logSms(to, message, false, "SMS credentials not found in database");
        throw new Error("SMS credentials not found");
      }

      const username = credentialsData.username;
      const password = credentialsData.password;
      const sender = credentialsData.sender_id;
      const entityID = credentialsData.entity_id;
      const templateID = credentialsData.template_id;

      // Validate required fields
      if (!username || !password || !sender || !entityID || !templateID) {
        console.error("Missing required SMS credentials:", {
          username: !!username,
          password: !!password,
          sender: !!sender,
          entityID: !!entityID,
          templateID: !!templateID
        });
        SmsEmailLogger.logSms(to, message, false, "Missing required SMS credentials");
        throw new Error("Missing required SMS credentials");
      }

      console.log("username-", username);
      console.log("password-", password);

      const apiUrl = `${
        credentialsData.api_base_url || 'http://nimbusit.co.in/api/swsendSingle.asp?'
      }UserID=${username}&Password=${password}&SenderID=${sender}&Phno=${to}&EntityID=${entityID}&TemplateID=${templateID}&Msg=${encodeURIComponent(
       message
      )}`;
     
      console.log("SMS API URL:", apiUrl);

      const response = await axios.get(apiUrl);
      console.log(response.data, "SMS response.data");
      
      // Log successful SMS
      SmsEmailLogger.logSms(to, message, true);
      
      return response.data;
      
    } catch (error: any) {
      console.error("Error sending SMS:", error.message);
      
      // Log failed SMS
      SmsEmailLogger.logSms(to, message, false, error.message);
      
      throw new Error("Failed to send SMS: " + error.message);
    }
  }

  // Fallback method for testing (sends to console only)
  static async sendSmsConsole(to: string, message: string) {
    console.log("=== SMS FALLBACK (CONSOLE ONLY) ===");
    console.log("To:", to);
    console.log("Message:", message);
    console.log("Timestamp:", new Date().toISOString());
    console.log("=====================================");
    
    // Log console fallback
    SmsEmailLogger.logSms(to, message, true, "Console fallback method");
    
    return { success: true, method: "console_fallback" };
  }
}
