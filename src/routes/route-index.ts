import { Application } from "express";

export default (app: Application) => {
  //for copy-paste
  // app.use("", require(""))
  app.use("/activitylogs", require("./activitylogs/activitylogs-api"));
  app.use("/menu", require("./menu/menu-api"));
  app.use("/role", require("./role/role-api"));
  app.use("/user", require("./user/user-api"));
  app.use("/permission", require("./user/permission.api"));
  app.use("/fund-picker", require("./scheme/fundpicker-api"));
  app.use("/app-api", require("./app-api/app-api"));
  app.use("/other", require("./other/other-api"));
  app.use("/goal-plan", require("./goal-planning/goal-planning-api"));
  app.use("/risk-profile", require("./risk-profile/risk-profile-api"));
  app.use("/upload", require("./uploadFile/upload-file-api"));
  app.use("/scheme", require("./scheme/scheme-api"));
  app.use("/cart", require("./cart/cart-api"));
  app.use("/kyc", require("./kyc-flow/kyc-api"));
  app.use("/mfu", require("./mfu/mfu.api"));
  app.use("/investor", require("./investor/investor-api"));
  app.use("/country", require("./country_master/country-api"));
  app.use("/state", require("./state_master/state-api"));
  app.use("/addressType", require("./address_type/address_type_api"));
  app.use("/partner", require("./partner/partner-api"));

  app.use("/decentro", require("./decentro/decentro-api"));

  app.use("/cashfree", require("./cashfree/cashfree-api"));
  app.use("/wo-kyc-fund", require("./wo-kyc-fund-explore/wo-kyc-fund-explore-api"));
  app.use("/mutual-fund", require("./mutual-fund/mutual-fund-api"));
  app.use("/external-account", require("./kyc-flow/external-account-api"));
  app.use("/arn", require("./arn-master/arn-api"));
  app.use("/bc", require("./buisnessCorrespondent/bc-api"));
  app.use("/scheme-configuration", require("./scheme-configuration/configuration-api"));

  //nse module -14-06-2024
  app.use("/nse", require("./nse/nse-api"));
  
  // app.use("/dashboard", require("./dashboard/dashboard-api"));

  //admin purpose only

};
