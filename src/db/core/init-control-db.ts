import type { Sequelize } from "sequelize";
import { Users } from "../../routes/user/user-model";
import { UserType } from "../../routes/user/usertype-model";
import { RMRegistration } from "../../routes/user/rm-registration-model";
import { BackOfficeRegistration } from "../../routes/user/back-office-registration-model";
import { Role } from "../../routes/role/role-model";
import { Menu } from "../../routes/menu/menu-model";
import { UserMapping } from "../../routes/user/user-mapping-model";
import { ActivityLogs } from "../../routes/activitylogs/activitylogs-model";
import { SchemeBenchmarksMapping } from "../../routes/scheme/scheme_benchmark_mapping.model";
import { SchemeBenchmarksMaster } from "../../routes/scheme/scheme_benchmark_master.model";
import { SchemeBenchmarksValues } from "../../routes/scheme/scheme_benchmarks_values.model";
import { SchemeCapitalInflow } from "../../routes/scheme/scheme_capital_inflow.model";
import { SchemeCategory } from "../../routes/scheme/scheme_category.model";
import { SchemeFileMaster } from "../../routes/scheme/scheme_file_master.model";
import { SchemeFundManagers } from "../../routes/scheme/scheme_fund_managers.model";
import { SchemeFundManagerHistory } from "../../routes/scheme/scheme_fundmanager_history.model";
import { SchemeFundManager } from "../../routes/scheme/scheme_fundmanagers.model";
import { SchemeHistoricalAllocation } from "../../routes/scheme/scheme_historical_allocation.model";
import { SchemeHistoricalNav } from "../../routes/scheme/scheme_historical_nav.model";
import { SchemeHoldings } from "../../routes/scheme/scheme_holdings.model";
import { SchemeMarketCapAlloc } from "../../routes/scheme/scheme_marketcapalloc.model";
import { SchemeMaster } from "../../routes/scheme/scheme_master.model";
import { SchemeOption } from "../../routes/scheme/scheme_option.model";
import { SchemeOverallRank } from "../../routes/scheme/scheme_overallrank.model";
import { SchemePerformance } from "../../routes/scheme/scheme_performance.model";
import { SchemeRiskRatio } from "../../routes/scheme/scheme_riskratio.model";
import { SchemeSubcategoryAvg } from "../../routes/scheme/scheme_subcategory_avg.model";
import { SchemeSubcategoryReturns } from "../../routes/scheme/scheme_subcategory_returns.model";
import { SchemeSubcategory } from "../../routes/scheme/scheme_subcategory.model";
import { AMCMaster } from "../../routes/amc_master/amc_master-model";
import { FundManagersMaster } from "../../routes/fund_managers_master/fund_managers_master.model";
import { GoalType } from "./../../routes/goal-planning/goal-type-model";
import { RiskCategory } from "../../routes/risk-profile/risk-category-model";
import { RiskProfileQuestion } from "../../routes/risk-profile/risk-profile-question-model";
import { RiskProfileAnswer } from "../../routes/risk-profile/risk-profile-answer-model";
import { UserRiskProfile } from "../../routes/risk-profile/user-risk-profile-model";
import { UserRiskProfileDetail } from "../../routes/risk-profile/user-risk-profile-detail-model";
import { GoalPlanAlloc } from "../../routes/goal-planning/goal_plan_alloc-model";
import { SubCategoryErr } from "../../routes/scheme/sub_category_err.model";
import { GoalPlan } from "../../routes/goal-planning/goal-plan-model";
import { GoalPlanAllocationSIP } from "../../routes/goal-planning/Goal-plan-allocation-sip-model";
import { GoalPlanAllocationLumpsum } from "../../routes/goal-planning/goal-plan-allocation-lumpsum-model";
import { GoalPlanUserAlloc } from "../../routes/goal-planning/goal-plan-user-alloc-model";
import { InvestorCart } from "../../routes/cart/investor-cart-model";
import { InvestorRegistration } from "../../routes/kyc-flow/user_basic_detail-model";
import { ExternalAccountDetail } from "../../routes/kyc-flow/external_account_detail-model";
import { OtpDetail } from "../../routes/user/otp-detail-model";
import { CountryMaster } from "../../routes/country_master/country_master-model";
import { StateMaster } from "../../routes/state_master/state_master-model";
import { AddressType } from "../../routes/address_type/address_type_model";
import { AddressDetail } from "../../routes/kyc-flow/address-detail-model";
import { Gender } from "../../routes/kyc-flow/gender-model";
import { MaritalStatus } from "../../routes/kyc-flow/marital-status-model";
import { MobileRelation } from "../../routes/kyc-flow/mobile-relation-model";
import { RelationshipPrimaryHolder } from "../../routes/kyc-flow/relationship-primary-holder-model";
import { RelationshipProof } from "../../routes/kyc-flow/relationship-proof-model";
import { TaxStatus } from "../../routes/kyc-flow/tax-status-model";
import { InvestorDeclaration } from "../../routes/kyc-flow/invester_declaration-model";
import { BankAccountDetail } from "../../routes/kyc-flow/bank-account-detail-model";
import { BankAccountDetailHistory } from "../../routes/kyc-flow/bank-account-detail-model-history";
import { InvestorAdditionalKyc } from "../../routes/kyc-flow/investor-additional-kyc-model";
import { InvestorFatcaDetails } from "../../routes/kyc-flow/investor-fatca-model";

import { InvestorBasicDetails } from "../../routes/kyc-flow/investor_basic_details";

import { DecentroLog } from "../../routes/decentro/DecentroLog";

import { NomineeDetail } from "../../routes/kyc-flow/nominee-detail-model";
import {
  MfuAccessToken,
  MfuFundScheme,
  MfuSchemeTransaction,
  ReferenceNumber,
} from "../../routes/mfu/mfu-model";
import { PersonalDocuments } from "../../routes/kyc-flow/personal_documents-model";
import { KYCPincode } from "../../routes/kyc-flow/kyc-pincode-model";
import { AdminFundExploreFilter } from "../../routes/scheme/admin-fund-filter-model";
import { OccupationMaster } from "../../routes/kyc-flow/occupation-model";
import { IncomeSource } from "../../routes/kyc-flow/incomeSource-model";
import { AnnuaIincomeMaster } from "../../routes/kyc-flow/annual-income-master-model";
import { BankProof } from "../../routes/kyc-flow/bank-proof-model";
import { NominineeRelationshipType } from "../../routes/kyc-flow/nominee-relationship-type-model";
import { NomineeGuardianRelationship } from "../../routes/kyc-flow/nominee-guardian-relationship-model";

//Addition by Aditya Gupta
import { CanRegisterResponse } from "../../routes/mfu/can-register-response-dtl";

//added by rakesh sinha for mfu related models
import { Mandate } from "../../routes/mfu/mandate-model";
import {
  MfuTransaction,
  MfuTransactionAuditLog,
} from "../../routes/mfu/mfu-transaction.model";
//added by rakesh sinha for mfu related models

//added by Aditya

//cashfree and partner modal
import { OtpLog } from "../../routes/partner/otplog.model";
import { PartnerAdhaarReqDtl } from "../../routes/partner/partner-adhaar-req-model";
import { PartnerAdhaarResDtl } from "../../routes/partner/partner-adhaar-resp-model";
import { PartnerAadhaarOtpReqDtl } from "../../routes/partner/partner-adhaar-otp-req-model";
import { PartnerAadhaarOtpResDtl } from "../../routes/partner/partner-adhaar-otp-resp-model";
import { AadhaarVerification } from "../../routes/partner/adhaar-verifications-model";
import { UserRegistration } from "../../routes/partner/partner-model";
import { WithoutKYCFundExplore } from "../../routes/wo-kyc-fund-explore/wo-kyc-fund-explore-model";
import { NomineeIdentity } from "../../routes/kyc-flow/nominee-identity-model";

import { TestingMfuCanMaster } from "../../routes/partner/testing_mfu_can_master";
import { BankMaster } from "../../routes/kyc-flow/bank-master-model";
import { InvestorAccountHolding } from "../../routes/investor/investor-account-holding.model";
import { InvestorPortfolio } from "../../routes/investor/investor-portfolio.model";
import { ApplicationActivityLogs } from "../../routes/activitylogs/application-activity-logs.model";
import { RmPartnerMapping } from "../../routes/mapping_role/rm-partner-model";
import { PartnerInvestorMapping } from "../../routes/mapping_role/investor-partner-model";
import { RmInvestorMapping } from "../../routes/mapping_role/investor-rm-model";
import { ARNMaster } from "../../routes/arn-master/arn-model";
import { NFOSchemeMaster } from "../../routes/scheme/nfo-scheme-master-model";
import { USER_TYPE } from "../../utils/constant";
import { CANModificationLogs } from "../../routes/kyc-flow/CANModificationLogs";

import { InvestorRequestDecentroLogs } from "../../routes/decentro/InvestorRequestDecentroLogs"
import { BcRegistration } from "../../routes/buisnessCorrespondent/bc-model";
import { PanVerification } from "../../routes/partner/pan-verifications-model";
import { UccRegistrationLog } from "../../routes/nse/nse-ucc-reg-logs";
import { UCCRegistration } from "../../routes/nse/ucc-registration-model";
import { NseTransactionLog, NseSipRegistrationLog, NseCancellationLog, NseBankDetailsLog, NseMandateLog, NseReportLog, NseElogLog } from "../../routes/nse/nse-api-logs";

export {
  Menu,
  Role,
  UserType,
  Users,
  RMRegistration,
  BackOfficeRegistration,
  UserMapping,
  ActivityLogs,
  SchemeBenchmarksMapping,
  SchemeBenchmarksMaster,
  SchemeBenchmarksValues,
  SchemeCapitalInflow,
  SchemeCategory,
  SchemeFileMaster,
  SchemeFundManagers,
  SchemeFundManagerHistory,
  SchemeFundManager,
  SchemeHistoricalAllocation,
  SchemeHistoricalNav,
  SchemeHoldings,
  SchemeMarketCapAlloc,
  SchemeMaster,
  SchemeOption,
  SchemeOverallRank,
  SchemePerformance,
  SchemeRiskRatio,
  SchemeSubcategoryAvg,
  SchemeSubcategoryReturns,
  SchemeSubcategory,
  AMCMaster,
  FundManagersMaster,
  GoalType,
  RiskCategory,
  RiskProfileQuestion,
  RiskProfileAnswer,
  UserRiskProfile,
  UserRiskProfileDetail,
  GoalPlanAlloc,
  SubCategoryErr,
  GoalPlan,
  GoalPlanAllocationSIP,
  GoalPlanAllocationLumpsum,
  GoalPlanUserAlloc,
  MfuAccessToken,
  MfuFundScheme,
  InvestorCart,
  InvestorRegistration,
  ExternalAccountDetail,
  OtpDetail,
  CountryMaster,
  StateMaster,
  AddressType,
  AddressDetail,
  Gender,
  MaritalStatus,
  MobileRelation,
  RelationshipPrimaryHolder,
  RelationshipProof,
  TaxStatus,
  InvestorDeclaration,
  BankAccountDetail,
  BankMaster,
  NomineeDetail,
  OtpLog,
  PartnerAdhaarReqDtl,
  PartnerAdhaarResDtl,
  PartnerAadhaarOtpReqDtl,
  PartnerAadhaarOtpResDtl,
  AadhaarVerification,
  PanVerification,
  KYCPincode,
  AdminFundExploreFilter,
  PersonalDocuments,
  UserRegistration,
  OccupationMaster,
  IncomeSource,
  AnnuaIincomeMaster,
  TestingMfuCanMaster,
  BankProof,
  NominineeRelationshipType,
  NomineeGuardianRelationship,
  WithoutKYCFundExplore,
  NomineeIdentity,
  CanRegisterResponse,
  Mandate,
  InvestorAccountHolding,
  InvestorPortfolio,
  ApplicationActivityLogs,
  RmPartnerMapping,
  PartnerInvestorMapping,
  RmInvestorMapping,
  MfuTransaction,
  MfuTransactionAuditLog,
  ARNMaster,
  NFOSchemeMaster,
  DecentroLog,
  BankAccountDetailHistory,
  CANModificationLogs,
  InvestorRequestDecentroLogs,
  BcRegistration,
  InvestorAdditionalKyc,
  InvestorFatcaDetails,
  InvestorBasicDetails,
  UccRegistrationLog,
  UCCRegistration,
  NseTransactionLog,
  NseSipRegistrationLog,
  NseCancellationLog,
  NseBankDetailsLog,
  NseMandateLog,
  NseReportLog,
  NseElogLog,
};

export function initControlDB(sequelize: Sequelize) {
  ActivityLogs.initModel(sequelize);
  Role.initModel(sequelize);
  Users.initModel(sequelize);
  RMRegistration.initModel(sequelize);
  BackOfficeRegistration.initModel(sequelize);
  Menu.initModel(sequelize);
  UserType.initModel(sequelize);
  UserMapping.initModel(sequelize);
  SchemeBenchmarksMapping.initModel(sequelize);
  SchemeBenchmarksMaster.initModel(sequelize);
  SchemeBenchmarksValues.initModel(sequelize);
  SchemeCapitalInflow.initModel(sequelize);
  SchemeCategory.initModel(sequelize);
  SchemeFileMaster.initModel(sequelize);
  SchemeFundManagers.initModel(sequelize);
  SchemeFundManagerHistory.initModel(sequelize);
  SchemeFundManager.initModel(sequelize);
  SchemeHistoricalAllocation.initModel(sequelize);
  SchemeHistoricalNav.initModel(sequelize);
  SchemeHoldings.initModel(sequelize);
  SchemeMarketCapAlloc.initModel(sequelize);
  SchemeMaster.initModel(sequelize);
  SchemeOption.initModel(sequelize);
  SchemeOverallRank.initModel(sequelize);
  SchemePerformance.initModel(sequelize);
  SchemeRiskRatio.initModel(sequelize);
  SchemeSubcategoryAvg.initModel(sequelize);
  SchemeSubcategoryReturns.initModel(sequelize);
  SchemeSubcategory.initModel(sequelize);
  AMCMaster.initModel(sequelize);
  FundManagersMaster.initModel(sequelize);
  GoalType.initModel(sequelize);
  RiskCategory.initModel(sequelize);
  RiskProfileQuestion.initModel(sequelize);
  RiskProfileAnswer.initModel(sequelize);
  UserRiskProfile.initModel(sequelize);
  UserRiskProfileDetail.initModel(sequelize);
  GoalPlanAlloc.initModel(sequelize);
  SubCategoryErr.initModel(sequelize);
  GoalPlan.initModel(sequelize);
  GoalPlanAllocationSIP.initModel(sequelize);
  GoalPlanAllocationLumpsum.initModel(sequelize);
  GoalPlanUserAlloc.initModel(sequelize);
  InvestorCart.initModel(sequelize);
  InvestorRegistration.initModel(sequelize);
  ExternalAccountDetail.initModel(sequelize);
  OtpDetail.initModel(sequelize);
  CountryMaster.initModel(sequelize);
  StateMaster.initModel(sequelize);
  AddressType.initModel(sequelize);
  AddressDetail.initModel(sequelize);
  MfuAccessToken.initModel(sequelize);
  MfuFundScheme.initModel(sequelize);
  Gender.initModel(sequelize);
  MaritalStatus.initModel(sequelize);
  MobileRelation.initModel(sequelize);
  RelationshipPrimaryHolder.initModel(sequelize);
  RelationshipProof.initModel(sequelize);
  TaxStatus.initModel(sequelize);
  InvestorDeclaration.initModel(sequelize);
  BankAccountDetail.initModel(sequelize);
  NomineeDetail.initModel(sequelize);
  ReferenceNumber.initModel(sequelize);
  OtpLog.initModel(sequelize);
  PartnerAdhaarReqDtl.initModel(sequelize);
  PartnerAdhaarResDtl.initModel(sequelize);
  PartnerAadhaarOtpReqDtl.initModel(sequelize);
  PartnerAadhaarOtpResDtl.initModel(sequelize);
  AadhaarVerification.initModel(sequelize);
  PanVerification.initModel(sequelize);
  ReferenceNumber.initModel(sequelize);

  PersonalDocuments.initModel(sequelize);
  KYCPincode.initModel(sequelize);
  AdminFundExploreFilter.initModel(sequelize);
  OccupationMaster.initModel(sequelize);
  IncomeSource.initModel(sequelize);
  AnnuaIincomeMaster.initModel(sequelize);
  BankProof.initModel(sequelize);
  NominineeRelationshipType.initModel(sequelize);
  NomineeGuardianRelationship.initModel(sequelize);

  UserRegistration.initModel(sequelize);
  TestingMfuCanMaster.initModel(sequelize);
  WithoutKYCFundExplore.initModel(sequelize);
  NomineeIdentity.initModel(sequelize);
  CanRegisterResponse.initModel(sequelize);
  Mandate.initModel(sequelize);
  InvestorAccountHolding.initModel(sequelize);
  BankMaster.initModel(sequelize);
  InvestorPortfolio.initModel(sequelize);
  ApplicationActivityLogs.initModel(sequelize);
  RmPartnerMapping.initModel(sequelize);
  PartnerInvestorMapping.initModel(sequelize);
  RmInvestorMapping.initModel(sequelize);
  MfuTransaction.initModel(sequelize);
  MfuTransactionAuditLog.initModel(sequelize);
  ARNMaster.initModel(sequelize);
  NFOSchemeMaster.initModel(sequelize);
  DecentroLog.initModel(sequelize);
  BankAccountDetailHistory.initModel(sequelize);
  CANModificationLogs.initModel(sequelize);
  InvestorRequestDecentroLogs.initModel(sequelize);
  BcRegistration.initModel(sequelize);
  InvestorAdditionalKyc.initModel(sequelize);
  InvestorFatcaDetails.initModel(sequelize);
  InvestorBasicDetails.initModel(sequelize);
  UccRegistrationLog.initModel(sequelize);
  UCCRegistration.initModel(sequelize);
  NseTransactionLog.initModel(sequelize);
  NseSipRegistrationLog.initModel(sequelize);
  NseCancellationLog.initModel(sequelize);
  NseBankDetailsLog.initModel(sequelize);
  NseMandateLog.initModel(sequelize);
  NseReportLog.initModel(sequelize);
  NseElogLog.initModel(sequelize);

  //User and Role Association
  Users.belongsTo(Role, {
    as: "role",
    foreignKey: "roleId",
  });

  Role.hasMany(Users, {
    as: "users",
    foreignKey: "roleId",
  });
  UserMapping.belongsTo(Users, {
    foreignKey: "user_id",
  });
  Users.hasMany(UserMapping, {
    foreignKey: "user_id",
  });
  UserMapping.belongsTo(Role, {
    foreignKey: "role_id",
  });
  Role.hasMany(UserMapping, {
    foreignKey: "role_id",
  });

  UserMapping.belongsTo(RMRegistration, {
    foreignKey: "ref_id",
    constraints: false
  });
  RMRegistration.hasMany(UserMapping, {
    foreignKey: "ref_id",
    scope: {
      userType_id: USER_TYPE.RM
    },
    constraints: false
  });



  UserMapping.belongsTo(UserType, {
    foreignKey: "userType_id",
  });

  UserType.hasMany(UserMapping, {
    foreignKey: "userType_id",
  });

  //User and Role Association

  //User and ActivityLogs Association
  Users.hasMany(ActivityLogs, {
    foreignKey: "userId",
  });

  ActivityLogs.belongsTo(Users, {
    foreignKey: "userId",
  });
  AMCMaster.hasMany(SchemeMaster, {
    foreignKey: "amc_id",
  });

  SchemeMaster.belongsTo(AMCMaster, {
    foreignKey: "amc_id",
  });

  //InvestorRegistration and AccountHoldings Association

  //SchemeBenchmarksMaster and SchemeBenchmarksMapping Association
  SchemeBenchmarksMaster.hasMany(SchemeBenchmarksMapping, {
    foreignKey: "benchmark_id_FK",
  });

  SchemeBenchmarksMapping.belongsTo(SchemeBenchmarksMaster, {
    foreignKey: "benchmark_id_FK",
  });

  //SchemeMaster and SchemeBenchmarksValues Association
  SchemeBenchmarksMaster.hasMany(SchemeMaster, {
    foreignKey: "benchmark_id",
  });

  SchemeMaster.belongsTo(SchemeBenchmarksMaster, {
    foreignKey: "benchmark_id",
  });

  SchemeBenchmarksMaster.hasMany(SchemeBenchmarksValues, {
    foreignKey: "benchmark_id",
  });

  SchemeBenchmarksValues.belongsTo(SchemeBenchmarksMaster, {
    foreignKey: "benchmark_id",
  });

  // SchemeBenchmarksValues and  Association
  SchemeBenchmarksValues.belongsTo(SchemeMaster, {
    foreignKey: "benchmark_id",
  });

  SchemeMaster.hasMany(SchemeBenchmarksValues, {
    foreignKey: "benchmark_id",
  });

  //SchemeCategory and SchemeMaster Association
  SchemeCategory.hasMany(SchemeMaster, {
    foreignKey: "categoryid",
  });

  SchemeMaster.belongsTo(SchemeCategory, {
    foreignKey: "categoryid",
  });

  //SchemeSubcategory and SchemeMaster Association
  SchemeSubcategory.hasMany(SchemeMaster, {
    foreignKey: "subcategory_id",
  });

  SchemeMaster.belongsTo(SchemeSubcategory, {
    foreignKey: "subcategory_id",
  });

  //SchemeOption and SchemeMaster Association
  SchemeOption.hasMany(SchemeMaster, {
    foreignKey: "option_id",
  });

  SchemeMaster.belongsTo(SchemeOption, {
    foreignKey: "option_id",
  });

  //SchemeMaster and SchemeSubcategoryAvg Association
  SchemeMaster.hasMany(SchemeSubcategoryAvg, {
    foreignKey: "scheme_subcategory_id",
  });

  SchemeSubcategoryAvg.belongsTo(SchemeMaster, {
    foreignKey: "scheme_subcategory_id",
  });

  //SchemeSubcategory and SchemeSubcategoryReturns Association
  SchemeSubcategory.hasMany(SchemeSubcategoryReturns, {
    foreignKey: "scheme_subcategory_id",
  });

  SchemeSubcategoryReturns.belongsTo(SchemeSubcategory, {
    foreignKey: "scheme_subcategory_id",
  });

  //SchemeCategory and SchemeSubcategory Association
  SchemeCategory.hasMany(SchemeSubcategory, {
    foreignKey: "category_id",
  });

  SchemeSubcategory.belongsTo(SchemeCategory, {
    foreignKey: "category_id",
  });

  FundManagersMaster.hasMany(SchemeFundManager, {
    foreignKey: "manager_id",
  });

  SchemeFundManager.belongsTo(FundManagersMaster, {
    foreignKey: "manager_id",
  });

  SchemeMaster.hasMany(SchemeRiskRatio, {
    foreignKey: "ISIN",
    sourceKey: "schemeISIN",
  });

  SchemeRiskRatio.belongsTo(SchemeMaster, {
    foreignKey: "ISIN",
    targetKey: "schemeISIN",
  });

  SchemeMaster.hasMany(SchemePerformance, {
    foreignKey: "ISIN",
    sourceKey: "schemeISIN",
  });

  SchemePerformance.belongsTo(SchemeMaster, {
    foreignKey: "ISIN",
    targetKey: "schemeISIN",
  });

  //RiskProfileAnswer and RiskProfileQuestion Association
  RiskProfileAnswer.belongsTo(RiskProfileQuestion, {
    foreignKey: "question_id",
  });

  RiskProfileQuestion.hasMany(RiskProfileAnswer, {
    foreignKey: "question_id",
  });

  //RiskProfileAnswer and RiskProfileQuestion Association
  RiskProfileAnswer.belongsTo(RiskProfileQuestion, {
    foreignKey: "question_id",
  });

  RiskProfileQuestion.hasMany(RiskProfileAnswer, {
    foreignKey: "question_id",
  });

  //UserRiskProfileDetail and RiskProfileQuestion Association
  UserRiskProfileDetail.belongsTo(RiskProfileQuestion, {
    foreignKey: "queId",
  });

  RiskProfileQuestion.hasMany(UserRiskProfileDetail, {
    foreignKey: "queId",
  });

  //UserRiskProfile and RiskCategory Association
  UserRiskProfile.belongsTo(RiskCategory, {
    foreignKey: "riskProfileId",
  });

  RiskCategory.hasMany(UserRiskProfile, {
    foreignKey: "riskProfileId",
  });

  //GoalPlanAlloc and GoalType Association
  GoalPlanAlloc.belongsTo(GoalType, {
    foreignKey: "goal_id",
  });

  GoalType.hasMany(GoalPlanAlloc, {
    foreignKey: "goal_id",
  });

  //GoalPlanAlloc and RiskCategory Association
  GoalPlanAlloc.belongsTo(RiskCategory, {
    foreignKey: "risk_category_id",
  });

  RiskCategory.hasMany(GoalPlanAlloc, {
    foreignKey: "risk_category_id",
  });

  //GoalPlanAlloc and SchemeCategory Association
  GoalPlanAlloc.belongsTo(SchemeCategory, {
    foreignKey: "scheme_cate_id",
  });

  SchemeCategory.hasMany(GoalPlanAlloc, {
    foreignKey: "scheme_cate_id",
  });

  //GoalPlanAlloc and SchemeSubcategory Association
  GoalPlanAlloc.belongsTo(SchemeSubcategory, {
    foreignKey: "scheme_subcate_id",
  });

  SchemeSubcategory.hasMany(GoalPlanAlloc, {
    foreignKey: "scheme_subcate_id",
  });

  //GoalPlanAlloc and SchemeMaster Association
  GoalPlanAlloc.belongsTo(SchemeMaster, {
    foreignKey: "scheme_id",
  });

  SchemeMaster.hasMany(GoalPlanAlloc, {
    foreignKey: "scheme_id",
  });

  //UserRiskProfile and Users Association
  UserRiskProfile.belongsTo(Users, {
    foreignKey: "userId",
  });

  Users.hasOne(UserRiskProfile, {
    foreignKey: "userId",
  });

  //GoalPlan and GoalType Association
  GoalPlan.belongsTo(GoalType, {
    foreignKey: "goal_type_id",
  });

  GoalType.hasMany(GoalPlan, {
    foreignKey: "goal_type_id",
  });

  //GoalPlanUserAlloc and GoalPlan Association
  GoalPlanUserAlloc.belongsTo(GoalPlan, {
    foreignKey: "goal_plan_id",
  });

  GoalPlan.hasMany(GoalPlanUserAlloc, {
    foreignKey: "goal_plan_id",
  });

  //GoalPlanUserAlloc and RiskCategory Association
  GoalPlanUserAlloc.belongsTo(RiskCategory, {
    foreignKey: "risk_category_id",
  });

  RiskCategory.hasMany(GoalPlanUserAlloc, {
    foreignKey: "risk_category_id",
  });

  //GoalPlanUserAlloc and SchemeCategory Association
  GoalPlanUserAlloc.belongsTo(SchemeCategory, {
    foreignKey: "scheme_cate_id",
  });

  SchemeCategory.hasMany(GoalPlanUserAlloc, {
    foreignKey: "scheme_cate_id",
  });

  //GoalPlanUserAlloc and SchemeSubcategory Association
  GoalPlanUserAlloc.belongsTo(SchemeSubcategory, {
    foreignKey: "scheme_subcate_id",
  });

  SchemeSubcategory.hasMany(GoalPlanUserAlloc, {
    foreignKey: "scheme_subcate_id",
  });

  //GoalPlanUserAlloc and SchemeMaster Association
  GoalPlanUserAlloc.belongsTo(SchemeMaster, {
    foreignKey: "scheme_id",
  });

  SchemeMaster.hasMany(GoalPlanUserAlloc, {
    foreignKey: "scheme_id",
  });

  //GoalPlanAllocationSIP and GoalPlan Association
  GoalPlanAllocationSIP.belongsTo(GoalPlan, {
    foreignKey: "goal_plan_id",
  });

  GoalPlan.hasOne(GoalPlanAllocationSIP, {
    foreignKey: "goal_plan_id",
  });

  //GoalPlanAllocationLumpsum and GoalPlan Association
  GoalPlanAllocationLumpsum.belongsTo(GoalPlan, {
    foreignKey: "goal_plan_id",
  });

  GoalPlan.hasOne(GoalPlanAllocationLumpsum, {
    foreignKey: "goal_plan_id",
  });

  //InvestorCart and SchemeMaster Association
  InvestorCart.belongsTo(SchemeMaster, {
    foreignKey: "scheme_id",
  });

  SchemeMaster.hasMany(InvestorCart, {
    foreignKey: "scheme_id",
  });

  //InvestorCart and SchemeMaster Association
  InvestorCart.belongsTo(SchemeMaster, {
    foreignKey: "to_scheme_id",
    as: "ToScheme",
  });

  SchemeMaster.hasMany(InvestorCart, {
    foreignKey: "to_scheme_id",
    as: "ToScheme",
  });

  //SchemeMarketCapAlloc and SchemeMaster Association
  SchemeMarketCapAlloc.belongsTo(SchemeMaster, {
    foreignKey: "scheme_id",
  });

  SchemeMaster.hasMany(SchemeMarketCapAlloc, {
    foreignKey: "scheme_id",
  });

  //SchemeHoldings and SchemeMaster Association
  SchemeHoldings.belongsTo(SchemeMaster, {
    foreignKey: "ISIN",
    targetKey: "schemeISIN",
  });

  SchemeMaster.hasMany(SchemeHoldings, {
    foreignKey: "ISIN",
    sourceKey: "schemeISIN",
  });

  //SchemeBenchmarksMapping and SchemeMaster Association
  SchemeBenchmarksMapping.belongsTo(SchemeMaster, {
    foreignKey: "schemeISIN",
    targetKey: "schemeISIN",
  });

  SchemeMaster.hasMany(SchemeBenchmarksMapping, {
    foreignKey: "schemeISIN",
    sourceKey: "schemeISIN",
  });

  //SchemeFundManager and SchemeMaster Association
  SchemeFundManager.belongsTo(SchemeMaster, {
    foreignKey: "scheme_isin",
    targetKey: "schemeISIN",
  });

  SchemeMaster.hasMany(SchemeFundManager, {
    foreignKey: "scheme_isin",
    sourceKey: "schemeISIN",
  });

  //SchemeHistoricalNav and SchemeMaster Association
  SchemeHistoricalNav.belongsTo(SchemeMaster, {
    foreignKey: "scheme_id",
  });

  SchemeMaster.hasMany(SchemeHistoricalNav, {
    foreignKey: "scheme_id",
  });

  //OtpDetail and Users Association
  OtpDetail.belongsTo(Users, {
    foreignKey: "userId",
  });

  Users.hasMany(OtpDetail, {
    foreignKey: "userId",
  });

  //InvestorRegistration and Users Association
  InvestorRegistration.belongsTo(Users, {
    foreignKey: "user_id",
  });

  Users.hasOne(InvestorRegistration, {
    foreignKey: "user_id",
  });
  InvestorRegistration.belongsTo(InvestorRegistration, {
    foreignKey: "group_leader_id",
    as: "GroupLeader",
  });

  InvestorRegistration.hasMany(InvestorRegistration, {
    foreignKey: "group_leader_id",
    as: "GroupMemmber",
  });

  //InvestorRegistration and declaration Association
  InvestorDeclaration.belongsTo(InvestorRegistration, {
    foreignKey: "investor_id",
  });

  InvestorRegistration.hasOne(InvestorDeclaration, {
    foreignKey: "investor_id",
  });

  //InvestorRegistration and declaration Association
  BankAccountDetail.belongsTo(InvestorRegistration, {
    foreignKey: "investor_id",
  });

  InvestorRegistration.hasMany(BankAccountDetail, {
    foreignKey: "investor_id",
  });

  //InvestorRegistration and nominee Association
  NomineeDetail.belongsTo(InvestorRegistration, {
    foreignKey: "investor_id",
  });

  InvestorRegistration.hasMany(NomineeDetail, {
    foreignKey: "investor_id",
  });

  //InvestorRegistration and address Association
  AddressDetail.belongsTo(InvestorRegistration, {
    foreignKey: "investor_id",
  });

  InvestorRegistration.hasOne(AddressDetail, {
    foreignKey: "investor_id",
  });

  //country and address Association
  AddressDetail.belongsTo(CountryMaster, {
    foreignKey: "country_id",
  });
  CountryMaster.hasMany(AddressDetail, {
    foreignKey: "country_id",
  });
  AddressDetail.belongsTo(CountryMaster, {
    foreignKey: "corr_country_id",
    as: "CorrCountry",
  });
  CountryMaster.hasMany(AddressDetail, {
    foreignKey: "corr_country_id",
    as: "CorrCountry",
  });

  //state and address Association
  AddressDetail.belongsTo(StateMaster, {
    foreignKey: "state_id",
  });
  StateMaster.hasMany(AddressDetail, {
    foreignKey: "state_id",
  });

  AddressDetail.belongsTo(StateMaster, {
    foreignKey: "corr_state_id",
    as: "CorrState",
  });
  StateMaster.hasMany(AddressDetail, {
    foreignKey: "corr_state_id",
    as: "CorrState",
  });

  AddressDetail.belongsTo(AddressType, {
    foreignKey: "address_type",
  });
  AddressType.hasMany(AddressDetail, {
    foreignKey: "address_type",
  });

  AddressDetail.belongsTo(AddressType, {
    foreignKey: "corr_address_type",
    as: "CorrAddressType",
  });
  AddressType.hasMany(AddressDetail, {
    foreignKey: "corr_address_type",
    as: "CorrAddressType",
  });

  //InvestorRegistration and personal docs Association
  PersonalDocuments.belongsTo(InvestorRegistration, {
    foreignKey: "investor_id",
  });

  InvestorRegistration.hasOne(PersonalDocuments, {
    foreignKey: "investor_id",
  });

  //InvestorRegistration and gender Association
  InvestorRegistration.belongsTo(Gender, {
    foreignKey: "gender",
  });

  Gender.hasMany(InvestorRegistration, {
    foreignKey: "gender",
  });

  InvestorRegistration.belongsTo(MaritalStatus, {
    foreignKey: "gender",
  });

  MaritalStatus.hasMany(InvestorRegistration, {
    foreignKey: "gender",
  });

  InvestorDeclaration.belongsTo(OccupationMaster, {
    foreignKey: "occupation",
  });

  OccupationMaster.hasMany(InvestorDeclaration, {
    foreignKey: "occupation",
  });

  InvestorDeclaration.belongsTo(CountryMaster, {
    foreignKey: "COB",
    as: "ContryOfBirth",
  });

  CountryMaster.hasMany(InvestorDeclaration, {
    foreignKey: "COB",
    as: "ContryOfBirth",
  });
  InvestorDeclaration.belongsTo(CountryMaster, {
    foreignKey: "citizenship_country",
    as: "CitizenshipCountry",
  });

  CountryMaster.hasMany(InvestorDeclaration, {
    foreignKey: "citizenship_country",
    as: "CitizenshipCountry",
  });
  InvestorDeclaration.belongsTo(IncomeSource, {
    foreignKey: "income_source_id",
  });

  IncomeSource.hasMany(InvestorDeclaration, {
    foreignKey: "income_source_id",
  });
  InvestorDeclaration.belongsTo(AnnuaIincomeMaster, {
    foreignKey: "salary_slab_id",
  });

  AnnuaIincomeMaster.hasMany(InvestorDeclaration, {
    foreignKey: "salary_slab_id",
  });
  InvestorDeclaration.belongsTo(StateMaster, {
    foreignKey: "foreign_state",
  });

  StateMaster.hasMany(InvestorDeclaration, {
    foreignKey: "foreign_state",
  });

  NomineeDetail.belongsTo(NominineeRelationshipType, {
    foreignKey: "relation",
  });

  NominineeRelationshipType.hasMany(NomineeDetail, {
    foreignKey: "relation",
  });

  NomineeDetail.belongsTo(NomineeGuardianRelationship, {
    foreignKey: "guardian_relationship",
  });

  NomineeGuardianRelationship.hasMany(NomineeDetail, {
    foreignKey: "guardian_relationship",
  });
  NomineeDetail.belongsTo(CountryMaster, {
    foreignKey: "country",
  });

  CountryMaster.hasMany(NomineeDetail, {
    foreignKey: "country",
  });
  NomineeDetail.belongsTo(StateMaster, {
    foreignKey: "state",
  });

  StateMaster.hasMany(NomineeDetail, {
    foreignKey: "state",
  });

  //WithoutKYCFundExplore and SchemeMaster Association
  WithoutKYCFundExplore.belongsTo(SchemeMaster, {
    foreignKey: "scheme_id",
  });

  SchemeMaster.hasMany(WithoutKYCFundExplore, {
    foreignKey: "scheme_id",
  });

  BankAccountDetail.belongsTo(BankProof, {
    foreignKey: "bank_proof",
  });

  BankProof.hasMany(BankAccountDetail, {
    foreignKey: "bank_proof",
  });
  BankAccountDetail.belongsTo(BankMaster, {
    foreignKey: "bank_id",
  });

  BankMaster.hasMany(BankAccountDetail, {
    foreignKey: "bank_id",
  });

  NomineeDetail.belongsTo(NomineeIdentity, {
    foreignKey: "identity_type",
  });

  NomineeIdentity.hasMany(NomineeDetail, {
    foreignKey: "identity_type",
  });

  Mandate.belongsTo(InvestorRegistration, {
    foreignKey: "user_id",
  });

  InvestorAccountHolding.belongsTo(InvestorRegistration, {
    foreignKey: "investor_id",
  });
  InvestorRegistration.hasMany(InvestorAccountHolding, {
    foreignKey: "investor_id",
  });

  InvestorAccountHolding.belongsTo(InvestorRegistration, {
    foreignKey: "first_investor_id",
    as: "FirstAppUser",
  });
  InvestorRegistration.hasMany(InvestorAccountHolding, {
    foreignKey: "first_investor_id",
    as: "FirstAppUser",
  });

  InvestorAccountHolding.belongsTo(InvestorRegistration, {
    foreignKey: "second_investor_id",
    as: "SecondAppUser",
  });
  InvestorRegistration.hasMany(InvestorAccountHolding, {
    foreignKey: "second_investor_id",
    as: "SecondAppUser",
  });

  InvestorAccountHolding.belongsTo(InvestorRegistration, {
    foreignKey: "third_investor_id",
    as: "ThirdAppUser",
  });
  InvestorRegistration.hasMany(InvestorAccountHolding, {
    foreignKey: "third_investor_id",
    as: "ThirdAppUser",
  });
  InvestorPortfolio.belongsTo(InvestorRegistration, {
    foreignKey: "investor_id",
  });
  InvestorRegistration.hasMany(InvestorPortfolio, {
    foreignKey: "investor_id",
  });

  ApplicationActivityLogs.belongsTo(Users, {
    foreignKey: "userId",
  });
  Users.hasMany(ApplicationActivityLogs, {
    foreignKey: "userId",
  });

  // RM-partner Mapping relation
  RmPartnerMapping.belongsTo(RMRegistration, {
    foreignKey: "rm_id",
  });
  RMRegistration.hasMany(RmPartnerMapping, {
    foreignKey: "rm_id",
  });

  RmPartnerMapping.belongsTo(UserRegistration, {
    foreignKey: "partner_id",
  });
  UserRegistration.hasMany(RmPartnerMapping, {
    foreignKey: "partner_id",
  });

  //partner-investor Mapping relation
  PartnerInvestorMapping.belongsTo(UserRegistration, {
    foreignKey: "partner_id",
  });
  UserRegistration.hasMany(PartnerInvestorMapping, {
    foreignKey: "partner_id",
  });
  PartnerInvestorMapping.belongsTo(InvestorRegistration, {
    foreignKey: "investor_id",
  });
  InvestorRegistration.hasMany(PartnerInvestorMapping, {
    foreignKey: "investor_id",
  });

  //rm-investor Mapping relation
  RmInvestorMapping.belongsTo(RMRegistration, {
    foreignKey: "rm_id",
  });
  RMRegistration.hasMany(RmInvestorMapping, {
    foreignKey: "rm_id",
  });
  RmInvestorMapping.belongsTo(InvestorRegistration, {
    foreignKey: "investor_id",
  });
  InvestorRegistration.hasMany(RmInvestorMapping, {
    foreignKey: "investor_id",
  });

  //InvestorRegistration and TaxStatus Association
  InvestorRegistration.belongsTo(TaxStatus, {
    foreignKey: "tax_status",
  });

  TaxStatus.hasMany(InvestorRegistration, {
    foreignKey: "tax_status",
  });

  //InvestorRegistration and UserRegistration Association
  InvestorRegistration.belongsTo(UserRegistration, {
    foreignKey: "partner_id",
  });

  InvestorRegistration.belongsTo(BcRegistration, {
    foreignKey: "bc_id",
  });

  UserRegistration.hasMany(InvestorRegistration, {
    foreignKey: "partner_id",
  });

  //InvestorRegistration and RMRegistration Association
  InvestorRegistration.belongsTo(RMRegistration, {
    foreignKey: "rm_id",
  });

  RMRegistration.hasMany(InvestorRegistration, {
    foreignKey: "rm_id",
  });

  //UserRegistration and RMRegistration Association
  UserRegistration.belongsTo(RMRegistration, {
    foreignKey: "rm_id",
  });

  RMRegistration.hasMany(UserRegistration, {
    foreignKey: "rm_id",
  });

  InvestorRegistration.hasMany(InvestorAccountHolding, {
    foreignKey: 'first_investor_id',
    as: 'InvestorAccountHolding',
  });

  /*InvestorRegistration.hasOne(InvestorAdditionalKyc, {
    foreignKey: "investor_id",
  });

  InvestorAdditionalKyc.belongsTo(InvestorRegistration, {
    foreignKey: "investor_id",
  });

  InvestorRegistration.hasOne(InvestorBasicDetails, { as: "basicDetails", foreignKey: "investor_id" });


  InvestorRegistration.hasMany(NomineeDetail, { foreignKey: 'investor_id', as: 'nominees' });
  NomineeDetail.belongsTo(InvestorRegistration, { foreignKey: 'investor_id', as: 'investor' });*/

  InvestorRegistration.hasMany(InvestorBasicDetails, {
    foreignKey: "investor_id",
    as: "basicDetails"
  });

  InvestorBasicDetails.belongsTo(InvestorRegistration, {
    foreignKey: "investor_id",
    as: "investor"
  });

  InvestorRegistration.hasMany(InvestorAdditionalKyc, {
    foreignKey: "investor_id",
    as: "additionalKyc"
  });

  InvestorAdditionalKyc.belongsTo(InvestorRegistration, {
    foreignKey: "investor_id",
    as: "investor"
  });



  //InvestorRegistration.hasOne(InvestorBasicDetails, { foreignKey: "investor_id", as: "basicDetails" });
  //InvestorBasicDetails.belongsTo(InvestorRegistration, { foreignKey: "investor_id", as: "investor" });

  //InvestorRegistration.hasOne(InvestorAdditionalKyc, { foreignKey: "investor_id", as: "additionalKyc" });
  //InvestorAdditionalKyc.belongsTo(InvestorRegistration, { foreignKey: "investor_id", as: "investor" });

  InvestorRegistration.hasMany(NomineeDetail, { foreignKey: "investor_id", as: "nominees" });
  NomineeDetail.belongsTo(InvestorRegistration, { foreignKey: "investor_id", as: "investor" });


  InvestorRegistration.hasMany(InvestorFatcaDetails, { foreignKey: "investor_id", as: "fatcaDetails" });
  InvestorFatcaDetails.belongsTo(InvestorRegistration, { foreignKey: "investor_id", as: "investor" });

  return {
    Role,
    Users,
    Menu,
    UserType,
    UserMapping,
    ActivityLogs,
    SchemeBenchmarksMapping,
    SchemeBenchmarksMaster,
    SchemeBenchmarksValues,
    SchemeCapitalInflow,
    SchemeCategory,
    SchemeFileMaster,
    SchemeFundManagers,
    SchemeFundManagerHistory,
    SchemeFundManager,
    SchemeHistoricalAllocation,
    SchemeHistoricalNav,
    SchemeHoldings,
    SchemeMarketCapAlloc,
    SchemeMaster,
    SchemeOption,
    SchemeOverallRank,
    SchemePerformance,
    SchemeRiskRatio,
    SchemeSubcategoryAvg,
    SchemeSubcategoryReturns,
    SchemeSubcategory,
    MfuAccessToken,

    AMCMaster,
    FundManagersMaster,
    GoalType,
    RiskCategory,
    RiskProfileQuestion,
    RiskProfileAnswer,
    UserRiskProfile,
    UserRiskProfileDetail,
    GoalPlanAlloc,
    SubCategoryErr,
    GoalPlan,
    GoalPlanAllocationSIP,
    GoalPlanAllocationLumpsum,
    GoalPlanUserAlloc,
    MfuFundScheme,
    InvestorCart,
    InvestorRegistration,
    ExternalAccountDetail,
    OtpDetail,
    CountryMaster,
    StateMaster,
    AddressType,
    AddressDetail,
    Gender,
    MaritalStatus,
    MobileRelation,
    RelationshipPrimaryHolder,
    RelationshipProof,
    TaxStatus,
    InvestorDeclaration,
    BankAccountDetail,
    BankMaster,
    NomineeDetail,
    ReferenceNumber,
    OtpLog,
    PartnerAdhaarReqDtl,
    PartnerAdhaarResDtl,
    PartnerAadhaarOtpReqDtl,
    PartnerAadhaarOtpResDtl,
    AadhaarVerification,
    PanVerification,

    PersonalDocuments,
    KYCPincode,
    AdminFundExploreFilter,
    UserRegistration,
    OccupationMaster,
    IncomeSource,
    AnnuaIincomeMaster,
    TestingMfuCanMaster,
    WithoutKYCFundExplore,
    NomineeIdentity,
    CanRegisterResponse,
    Mandate,
    InvestorAccountHolding,
    InvestorPortfolio,
    ApplicationActivityLogs,
    MfuTransaction,
    MfuTransactionAuditLog,
    RmPartnerMapping,
    PartnerInvestorMapping,
    RmInvestorMapping,
    ARNMaster,
    NFOSchemeMaster,
    DecentroLog,
    BankAccountDetailHistory,
    CANModificationLogs,
    InvestorRequestDecentroLogs,
    BcRegistration,
    InvestorAdditionalKyc,
    InvestorFatcaDetails,
    InvestorBasicDetails,
    UccRegistrationLog,
    UCCRegistration,
    NseTransactionLog,
    NseSipRegistrationLog,
    NseCancellationLog,
    NseBankDetailsLog,
    NseMandateLog,
    NseReportLog,
    NseElogLog,
  };
}
