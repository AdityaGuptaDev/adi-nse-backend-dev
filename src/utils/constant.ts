import configs from "../config/config";
import environment from "../environment";
const config = (configs as { [key: string]: any })[environment];

export const AI_TYPE = {
  Traditional_AI: 1,
  Generative_AI: 2,
  Predictive_AI: 3,
};

export const GLOBAL_CONSTANTS = {
  // Assets_Header: [ 'Unique Code', 'Asset Name', 'Assets Code', 'Sub-Assets Code', 'Serial No', 'Comp Code', 'Location Code', 'Location Name', 'Location Site', 'Cap Date', 'Asset Cost', 'Responsible Person', 'Tag Type', 'Tag Status', 'Tag Date', 'Is Written'],
  Assets_Header: [
    "Unique Code",
    "Assets Code",
    "Serial No",
    "Sub-Assets Code",
    "Comp Code",
    "Cap Date",
    "Location Code",
    "Location Name",
    "Asset Name",
    // 'Location Site',
    //// 'BA',
    //// 'Asset Class',
    //// 'Asset Class Description',
    //// 'Cost Center',
    //// 'ICC',
    //// 'ICC Description',
    // 'Business Group',
    // 'Asset Current APC',
    // 'Asset Current BK Value (Local)',
    // 'Asset Current BK Value (London)',
    // 'Responsible Person',
    // 'Tag Type',
    // 'Tag Status',
    // 'Tag Date',
    // 'Is Written Off'
  ],
  CompCodeList: ["HUL", "UIPL"],
  TagTypeList: ["Metal", "Label"],
};

export const MONTHS_IN_A_YEAR = 12;

export const questionType = {
  optional: 1,
  input: 2,
  range: 3,
};

export const ROLE = {
  superAdmin: 1,
  investor: 2,
  RM: 3,
  partner: 4,
  backOffice: 5,
  BC:6
};
export const USER_TYPE = {
  superAdmin: 1,
  InvestorRegistration: 2,
  RM: 3,
  partner: 4,
  backOffice: 5,
  BC:6
};

export const SIGNZY_CREDS = {
  username: "vedantasset_preprod_absl",
  password: "yB17Fc2YJblQ",
};
export const DIGILOCKER_TYPE = {
  panDigiLocker: "panDigiLocker",
  aadhaarDigiLocker: "aadhaarDigiLocker",
  dlDigiLocker: "dlDigiLocker",
};
export const SCHEME_DIVIDEND_OPTION = {
  Payout: 'DP',
  ReInvest: 'DR',
  Growth: 'GR',
};
export const SCHEME_OPTION = {
  Growth: 1,
  Dividend: 2,
};
export const MEMBER_TYPE = {
  OWNER: 1,
  MEMBER: 2,
};

export const SIGNZY_BASE_URL =
  "https://multi-channel-preproduction.signzy.tech/api";

export const SIGNZY_PLATFORM = 1;

export const DEFAULT_SIGNZY_PLATFORM = 1;
//added by rakesh sinha

export const ACCOUNT_TYPE = [
  { code: 1, value: "SI" },
  { code: 2, value: "JO" },
  { code: 3, value: "AS" }
]


export const ExternalEntity: any = {
  CVLKRA: "CVLKRA",
  MORNINGSTAR: "MORNINGSTAR",
  MFU: "MFU",
  Cashfree: "Cashfree",
  Signzy: "Signzy",
  SMS: "SMS",
  Email: "Email",
};
