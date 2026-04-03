import nodemailer from "nodemailer";

import fs from "fs";
import handleBars from "handlebars";
import environment from "../environment";
// import { makePromise } from "../utils/helpers";
import { errorLog, infoLog, logSmsEmail } from "./logging-service";
import { getExternalCred } from "./credentialService";
import { ExternalEntity } from "../utils/constant";

const config = require("../config/config")[environment];
const emailConfig = config.email; // mail configuration in config file

handleBars.registerHelper("isTrue", function (value) {
  return value === true || value === "true";
});

// mail setup //
// const nodemailerTransporter = nodemailer.createTransport({
//   //service: "gmail",
//   host: emailConfig.SENDER_EMAIL_HOST,
//   port: emailConfig.SENDER_EMAIL_PORT,
//   auth: {
//     user: emailConfig.SENDER_EMAIL_ID,
//     pass: emailConfig.SENDER_EMAIL_PASSWORD,
//   },
// });

type emailargs = {
  from: String;
  to: String;
  toName: String;
  subject: String;
  text: String;
  replacements: any;
  htmlFile: String;
  attachments: any;
  html: any;
  cc: any;
  replyTo: any;
};

//send mail using nodemailer for both simple text or html file
//history[hasmukh]
export const sendEmail = async (mailData: emailargs) => {
  try {
    let res;
    if (!mailData) {
      console.log("NO MAIL DATA FOUND");
      return false;
    }

    let mailOptions: any = {
      from:
        mailData.from || '"Vedant Asset Limited" <no-reply@vedantasset.com>',
      // to: mailData.to || emailConfig.SENDER_EMAIL_ID,
      to:
        `${mailData.toName ? mailData.toName : ""} <${mailData.to}>` ||
        emailConfig.SENDER_EMAIL_ID,
      subject: mailData.subject || "Vedant Email",
      attachments: mailData.attachments ? mailData.attachments : null,
    };

    if (mailData.replyTo) {
      mailOptions = { ...mailOptions, replyTo: mailData.replyTo };
    }

    let creObj: any = {
      type: ExternalEntity.Email, // Or whatever type is needed
    };

    let credentialsData: any = await getExternalCred(creObj);

    if (!credentialsData) {
      throw new Error("Email credentials not found");
    }

    // 2️⃣ Create transporter using fetched credentials
    const nodemailerTransporter = nodemailer.createTransport({
      host: credentialsData.api_base_url,
      port: credentialsData.membercode,
      // secure: credentialsData.membercode === 465, // true for 465, false for others
      auth: {
        user: credentialsData.username,
        pass: credentialsData.password,
      },
    });

    // email with FILE
    if (mailData.htmlFile) {
      await fs.readFile(
        `${config.templatePath}/${mailData.htmlFile}.html`,
        { encoding: "utf8" },
        async function (err: any, hbHtml: any) {
          if (err) {
            console.log(err);
            throw err;
          } else {
            mailOptions.html = await handleBars.compile(hbHtml)(
              mailData.replacements
            );

            res = await nodemailerTransporter.sendMail(mailOptions);

            let { htmlFile, attachments, html, replacements, ...rest } =
              mailData;
            logSmsEmail(JSON.stringify({ ...rest, res }), "success");
            return res;
          }
        }
      );
    } else {
      // email without FILE
      mailOptions.text = mailData.text ? mailData.text : "No Text";
      if (mailData?.html) {
        mailOptions.html = mailData.html;
      }

      if (environment == "production") {
        if (mailData?.cc) {
          mailOptions.cc = mailData.cc;
        }
      }

      res = await nodemailerTransporter.sendMail(mailOptions);
      let { htmlFile, html, attachments, replacements, ...rest } = mailData;
      logSmsEmail(JSON.stringify({ ...rest, res }), "success");
      return res;
    }
  } catch (error) {
    logSmsEmail(error, "err");
  }
};
