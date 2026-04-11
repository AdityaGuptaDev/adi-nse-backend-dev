import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
  CreationOptional,
} from "sequelize";

export interface UCCRegistrationAttributes {
  id: number;
  investorId?: number | null;

  // Step 0: Identity & PAN
  taxStatus?: string | null;
  primaryHolderPan?: string | null;
  primaryHolderFirstName?: string | null;
  primaryHolderMiddleName?: string | null;
  primaryHolderLastName?: string | null;
  primaryHolderDobIncorporation?: string | null;
  primaryHolderPanExempt?: string | null;
  primaryHolderExemptCategory?: string | null;
  primaryHolderKycType?: string | null;
  primaryHolderCkycNumber?: string | null;
  aadhaarUpdated?: string | null;
  aadhaarNo?: string | null;
  mapinId?: string | null;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  gender?: string | null;
  occupationCode?: string | null;
  email?: string | null;
  indianMobileNo?: string | null;
  mobileDeclarationFlag?: string | null;
  emailDeclarationFlag?: string | null;

  // Guardian (Minor)
  guardianPan?: string | null;
  guardianPanExempt?: string | null;
  guardianExemptCategory?: string | null;
  guardianFirstName?: string | null;
  guardianMiddleName?: string | null;
  guardianLastName?: string | null;
  guardianDob?: string | null;

  // Second Holder
  secondHolderPan?: string | null;
  secondHolderPanExempt?: string | null;
  secondHolderExemptCategory?: string | null;
  secondHolderFirstName?: string | null;
  secondHolderMiddleName?: string | null;
  secondHolderLastName?: string | null;
  secondHolderDob?: string | null;
  secondHolderMobile?: string | null;
  secondHolderMobileRelation?: string | null;
  secondHolderEmail?: string | null;
  secondHolderEmailRelation?: string | null;
  secondHolderOccupation?: string | null;
  secondHolderAnnualIncome?: string | null;
  secondHolderWealthSource?: string | null;
  secondHolderAddressType?: string | null;
  secondHolderCityOfBirth?: string | null;
  secondHolderCountryOfBirth?: string | null;
  secondHolderPep?: string | null;
  secondHolderTaxIndiaOnly?: boolean | null;

  // Third Holder
  thirdHolderPan?: string | null;
  thirdHolderPanExempt?: string | null;
  thirdHolderExemptCategory?: string | null;
  thirdHolderFirstName?: string | null;
  thirdHolderMiddleName?: string | null;
  thirdHolderLastName?: string | null;
  thirdHolderDob?: string | null;
  thirdHolderMobile?: string | null;
  thirdHolderMobileRelation?: string | null;
  thirdHolderEmail?: string | null;
  thirdHolderEmailRelation?: string | null;
  thirdHolderOccupation?: string | null;
  thirdHolderAnnualIncome?: string | null;
  thirdHolderWealthSource?: string | null;
  thirdHolderAddressType?: string | null;
  thirdHolderCityOfBirth?: string | null;
  thirdHolderCountryOfBirth?: string | null;
  thirdHolderPep?: string | null;
  thirdHolderTaxIndiaOnly?: boolean | null;

  // Step 1: Holding Pattern & Personal
  clientCode?: string | null;
  holdingNature?: string | null;
  maritalStatus?: string | null;
  annualIncome?: string | null;
  wealthSource?: string | null;
  addressType?: string | null;
  cityOfBirth?: string | null;
  countryOfBirth?: string | null;
  pepStatus?: string | null;
  taxIndiaOnly?: boolean | null;
  taxResidencyCountry?: string | null;
  taxIdDocType?: string | null;
  taxIdNumber?: string | null;

  // Step 2: Nominees
  nominationOpt?: string | null;
  nominationAuthentication?: string | null;
  nomineeSoa?: string | null;
  doNotWishToNominate?: boolean | null;
  showNomineeInSoa?: boolean | null;

  // Nominee 1
  nominee1Name?: string | null;
  nominee1Relationship?: string | null;
  nominee1Dob?: string | null;
  nominee1Share?: string | null;
  nominee1Email?: string | null;
  nominee1Mobile?: string | null;
  nominee1IdentityType?: string | null;
  nominee1IdentityNumber?: string | null;
  nominee1MinorFlag?: string | null;
  nominee1Guardian?: string | null;
  nominee1GuardianPan?: string | null;
  nominee1SameAddress?: boolean | null;
  nominee1Address1?: string | null;
  nominee1Address2?: string | null;
  nominee1Address3?: string | null;
  nominee1Pin?: string | null;
  nominee1City?: string | null;
  nominee1Country?: string | null;

  // Nominee 2
  nominee2Name?: string | null;
  nominee2Relationship?: string | null;
  nominee2Dob?: string | null;
  nominee2Share?: string | null;
  nominee2Email?: string | null;
  nominee2Mobile?: string | null;
  nominee2IdentityType?: string | null;
  nominee2IdentityNumber?: string | null;
  nominee2MinorFlag?: boolean | null;
  nominee2Guardian?: string | null;
  nominee2GuardianPan?: string | null;
  nominee2SameAddress?: boolean | null;
  nominee2Address1?: string | null;
  nominee2Address2?: string | null;
  nominee2Address3?: string | null;
  nominee2Pin?: string | null;
  nominee2City?: string | null;
  nominee2Country?: string | null;

  // Nominee 3
  nominee3Name?: string | null;
  nominee3Relationship?: string | null;
  nominee3Dob?: string | null;
  nominee3Share?: string | null;
  nominee3Email?: string | null;
  nominee3Mobile?: string | null;
  nominee3IdentityType?: string | null;
  nominee3IdentityNumber?: string | null;
  nominee3MinorFlag?: boolean | null;
  nominee3Guardian?: string | null;
  nominee3GuardianPan?: string | null;
  nominee3SameAddress?: boolean | null;
  nominee3Address1?: string | null;
  nominee3Address2?: string | null;
  nominee3Address3?: string | null;
  nominee3Pin?: string | null;
  nominee3City?: string | null;
  nominee3Country?: string | null;

  // Step 3: Bank 1
  accountType1?: string | null;
  accountNo1?: string | null;
  micrNo1?: string | null;
  ifscCode1?: string | null;
  defaultBankFlag1?: string | null;
  bankName1?: string | null;
  branchName1?: string | null;
  bankAddress1?: string | null;
  bankCity1?: string | null;
  bankPincode1?: string | null;

  // Bank 2
  accountType2?: string | null;
  accountNo2?: string | null;
  micrNo2?: string | null;
  ifscCode2?: string | null;
  defaultBankFlag2?: string | null;
  bankName2?: string | null;
  branchName2?: string | null;
  bankAddress2?: string | null;
  bankCity2?: string | null;
  bankPincode2?: string | null;

  divPayMode?: string | null;
  communicationMode?: string | null;
  paperlessFlag?: string | null;
  chequeName?: string | null;
  resiPhone?: string | null;
  resiFax?: string | null;
  officePhone?: string | null;
  officeFax?: string | null;

  // Foreign address
  foreignAddress1?: string | null;
  foreignAddress2?: string | null;
  foreignAddress3?: string | null;
  foreignAddressCity?: string | null;
  foreignAddressPincode?: string | null;
  foreignAddressState?: string | null;
  foreignAddressCountry?: string | null;

  // Registration status
  regId?: string | null;
  regStatus?: string | null;
  regRemark?: string | null;

  // FATCA status — tracks the mandatory FATCA upload that must precede UCC
  fatcaRegId?: string | null;
  fatcaStatus?: string | null;
  fatcaRemark?: string | null;
  fatcaSubmittedAt?: Date | null;

  // Form progress tracking
  formStep?: number | null;

  // UCC creation status (0 = not created, 1 = created successfully on NSE)
  uccCreated?: number | null;

  createdAt?: Date | null;
  updatedAt?: Date | null;
}

type UCCRegistrationCreationAttributes = Optional<
  UCCRegistrationAttributes,
  "id"
>;

export class UCCRegistration
  extends Model<UCCRegistrationAttributes, UCCRegistrationCreationAttributes>
  implements UCCRegistrationAttributes
{
  declare id: CreationOptional<number>;
  declare investorId: number | null;

  declare taxStatus: string | null;
  declare primaryHolderPan: string | null;
  declare primaryHolderFirstName: string | null;
  declare primaryHolderMiddleName: string | null;
  declare primaryHolderLastName: string | null;
  declare primaryHolderDobIncorporation: string | null;
  declare primaryHolderPanExempt: string | null;
  declare primaryHolderExemptCategory: string | null;
  declare primaryHolderKycType: string | null;
  declare primaryHolderCkycNumber: string | null;
  declare aadhaarUpdated: string | null;
  declare aadhaarNo: string | null;
  declare mapinId: string | null;
  declare address1: string | null;
  declare address2: string | null;
  declare address3: string | null;
  declare city: string | null;
  declare state: string | null;
  declare pincode: string | null;
  declare country: string | null;
  declare gender: string | null;
  declare occupationCode: string | null;
  declare email: string | null;
  declare indianMobileNo: string | null;
  declare mobileDeclarationFlag: string | null;
  declare emailDeclarationFlag: string | null;

  declare guardianPan: string | null;
  declare guardianPanExempt: string | null;
  declare guardianExemptCategory: string | null;
  declare guardianFirstName: string | null;
  declare guardianMiddleName: string | null;
  declare guardianLastName: string | null;
  declare guardianDob: string | null;

  declare secondHolderPan: string | null;
  declare secondHolderPanExempt: string | null;
  declare secondHolderExemptCategory: string | null;
  declare secondHolderFirstName: string | null;
  declare secondHolderMiddleName: string | null;
  declare secondHolderLastName: string | null;
  declare secondHolderDob: string | null;
  declare secondHolderMobile: string | null;
  declare secondHolderMobileRelation: string | null;
  declare secondHolderEmail: string | null;
  declare secondHolderEmailRelation: string | null;
  declare secondHolderOccupation: string | null;
  declare secondHolderAnnualIncome: string | null;
  declare secondHolderWealthSource: string | null;
  declare secondHolderAddressType: string | null;
  declare secondHolderCityOfBirth: string | null;
  declare secondHolderCountryOfBirth: string | null;
  declare secondHolderPep: string | null;
  declare secondHolderTaxIndiaOnly: boolean | null;

  declare thirdHolderPan: string | null;
  declare thirdHolderPanExempt: string | null;
  declare thirdHolderExemptCategory: string | null;
  declare thirdHolderFirstName: string | null;
  declare thirdHolderMiddleName: string | null;
  declare thirdHolderLastName: string | null;
  declare thirdHolderDob: string | null;
  declare thirdHolderMobile: string | null;
  declare thirdHolderMobileRelation: string | null;
  declare thirdHolderEmail: string | null;
  declare thirdHolderEmailRelation: string | null;
  declare thirdHolderOccupation: string | null;
  declare thirdHolderAnnualIncome: string | null;
  declare thirdHolderWealthSource: string | null;
  declare thirdHolderAddressType: string | null;
  declare thirdHolderCityOfBirth: string | null;
  declare thirdHolderCountryOfBirth: string | null;
  declare thirdHolderPep: string | null;
  declare thirdHolderTaxIndiaOnly: boolean | null;

  declare clientCode: string | null;
  declare holdingNature: string | null;
  declare maritalStatus: string | null;
  declare annualIncome: string | null;
  declare wealthSource: string | null;
  declare addressType: string | null;
  declare cityOfBirth: string | null;
  declare countryOfBirth: string | null;
  declare pepStatus: string | null;
  declare taxIndiaOnly: boolean | null;
  declare taxResidencyCountry: string | null;
  declare taxIdDocType: string | null;
  declare taxIdNumber: string | null;

  declare nominationOpt: string | null;
  declare nominationAuthentication: string | null;
  declare nomineeSoa: string | null;
  declare doNotWishToNominate: boolean | null;
  declare showNomineeInSoa: boolean | null;

  declare nominee1Name: string | null;
  declare nominee1Relationship: string | null;
  declare nominee1Dob: string | null;
  declare nominee1Share: string | null;
  declare nominee1Email: string | null;
  declare nominee1Mobile: string | null;
  declare nominee1IdentityType: string | null;
  declare nominee1IdentityNumber: string | null;
  declare nominee1MinorFlag: string | null;
  declare nominee1Guardian: string | null;
  declare nominee1GuardianPan: string | null;
  declare nominee1SameAddress: boolean | null;
  declare nominee1Address1: string | null;
  declare nominee1Address2: string | null;
  declare nominee1Address3: string | null;
  declare nominee1Pin: string | null;
  declare nominee1City: string | null;
  declare nominee1Country: string | null;

  declare nominee2Name: string | null;
  declare nominee2Relationship: string | null;
  declare nominee2Dob: string | null;
  declare nominee2Share: string | null;
  declare nominee2Email: string | null;
  declare nominee2Mobile: string | null;
  declare nominee2IdentityType: string | null;
  declare nominee2IdentityNumber: string | null;
  declare nominee2MinorFlag: boolean | null;
  declare nominee2Guardian: string | null;
  declare nominee2GuardianPan: string | null;
  declare nominee2SameAddress: boolean | null;
  declare nominee2Address1: string | null;
  declare nominee2Address2: string | null;
  declare nominee2Address3: string | null;
  declare nominee2Pin: string | null;
  declare nominee2City: string | null;
  declare nominee2Country: string | null;

  declare nominee3Name: string | null;
  declare nominee3Relationship: string | null;
  declare nominee3Dob: string | null;
  declare nominee3Share: string | null;
  declare nominee3Email: string | null;
  declare nominee3Mobile: string | null;
  declare nominee3IdentityType: string | null;
  declare nominee3IdentityNumber: string | null;
  declare nominee3MinorFlag: boolean | null;
  declare nominee3Guardian: string | null;
  declare nominee3GuardianPan: string | null;
  declare nominee3SameAddress: boolean | null;
  declare nominee3Address1: string | null;
  declare nominee3Address2: string | null;
  declare nominee3Address3: string | null;
  declare nominee3Pin: string | null;
  declare nominee3City: string | null;
  declare nominee3Country: string | null;

  declare accountType1: string | null;
  declare accountNo1: string | null;
  declare micrNo1: string | null;
  declare ifscCode1: string | null;
  declare defaultBankFlag1: string | null;
  declare bankName1: string | null;
  declare branchName1: string | null;
  declare bankAddress1: string | null;
  declare bankCity1: string | null;
  declare bankPincode1: string | null;

  declare accountType2: string | null;
  declare accountNo2: string | null;
  declare micrNo2: string | null;
  declare ifscCode2: string | null;
  declare defaultBankFlag2: string | null;
  declare bankName2: string | null;
  declare branchName2: string | null;
  declare bankAddress2: string | null;
  declare bankCity2: string | null;
  declare bankPincode2: string | null;

  declare divPayMode: string | null;
  declare communicationMode: string | null;
  declare paperlessFlag: string | null;
  declare chequeName: string | null;
  declare resiPhone: string | null;
  declare resiFax: string | null;
  declare officePhone: string | null;
  declare officeFax: string | null;

  declare foreignAddress1: string | null;
  declare foreignAddress2: string | null;
  declare foreignAddress3: string | null;
  declare foreignAddressCity: string | null;
  declare foreignAddressPincode: string | null;
  declare foreignAddressState: string | null;
  declare foreignAddressCountry: string | null;

  declare regId: string | null;
  declare regStatus: string | null;
  declare regRemark: string | null;
  declare fatcaRegId: string | null;
  declare fatcaStatus: string | null;
  declare fatcaRemark: string | null;
  declare fatcaSubmittedAt: Date | null;

  declare formStep: number | null;
  declare uccCreated: number | null;

  declare createdAt: Date | null;
  declare updatedAt: Date | null;

  static initModel(sequelize: Sequelize): typeof UCCRegistration {
    UCCRegistration.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        investorId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: "investor_id",
        },

        // Step 0: Identity & PAN
        taxStatus: { type: DataTypes.STRING(10), allowNull: true, field: "tax_status" },
        primaryHolderPan: { type: DataTypes.STRING(10), allowNull: true, field: "primary_holder_pan" },
        primaryHolderFirstName: { type: DataTypes.STRING(100), allowNull: true, field: "primary_holder_first_name" },
        primaryHolderMiddleName: { type: DataTypes.STRING(100), allowNull: true, field: "primary_holder_middle_name" },
        primaryHolderLastName: { type: DataTypes.STRING(100), allowNull: true, field: "primary_holder_last_name" },
        primaryHolderDobIncorporation: { type: DataTypes.STRING(20), allowNull: true, field: "primary_holder_dob_incorporation" },
        primaryHolderPanExempt: { type: DataTypes.STRING(2), allowNull: true, defaultValue: "N", field: "primary_holder_pan_exempt" },
        primaryHolderExemptCategory: { type: DataTypes.STRING(10), allowNull: true, field: "primary_holder_exempt_category" },
        primaryHolderKycType: { type: DataTypes.STRING(5), allowNull: true, field: "primary_holder_kyc_type" },
        primaryHolderCkycNumber: { type: DataTypes.STRING(20), allowNull: true, field: "primary_holder_ckyc_number" },
        aadhaarUpdated: { type: DataTypes.STRING(2), allowNull: true, defaultValue: "Y", field: "aadhaar_updated" },
        aadhaarNo: { type: DataTypes.STRING(20), allowNull: true, field: "aadhaar_no" },
        mapinId: { type: DataTypes.STRING(20), allowNull: true, field: "mapin_id" },
        address1: { type: DataTypes.STRING(255), allowNull: true, field: "address_1" },
        address2: { type: DataTypes.STRING(255), allowNull: true, field: "address_2" },
        address3: { type: DataTypes.STRING(255), allowNull: true, field: "address_3" },
        city: { type: DataTypes.STRING(100), allowNull: true },
        state: { type: DataTypes.STRING(100), allowNull: true },
        pincode: { type: DataTypes.STRING(10), allowNull: true },
        country: { type: DataTypes.STRING(100), allowNull: true },
        gender: { type: DataTypes.STRING(5), allowNull: true },
        occupationCode: { type: DataTypes.STRING(5), allowNull: true, field: "occupation_code" },
        email: { type: DataTypes.STRING(150), allowNull: true },
        indianMobileNo: { type: DataTypes.STRING(15), allowNull: true, field: "indian_mobile_no" },
        mobileDeclarationFlag: { type: DataTypes.STRING(5), allowNull: true, field: "mobile_declaration_flag" },
        emailDeclarationFlag: { type: DataTypes.STRING(5), allowNull: true, field: "email_declaration_flag" },

        // Guardian (Minor)
        guardianPan: { type: DataTypes.STRING(10), allowNull: true, field: "guardian_pan" },
        guardianPanExempt: { type: DataTypes.STRING(2), allowNull: true, defaultValue: "N", field: "guardian_pan_exempt" },
        guardianExemptCategory: { type: DataTypes.STRING(10), allowNull: true, field: "guardian_exempt_category" },
        guardianFirstName: { type: DataTypes.STRING(100), allowNull: true, field: "guardian_first_name" },
        guardianMiddleName: { type: DataTypes.STRING(100), allowNull: true, field: "guardian_middle_name" },
        guardianLastName: { type: DataTypes.STRING(100), allowNull: true, field: "guardian_last_name" },
        guardianDob: { type: DataTypes.STRING(20), allowNull: true, field: "guardian_dob" },

        // Second Holder
        secondHolderPan: { type: DataTypes.STRING(10), allowNull: true, field: "second_holder_pan" },
        secondHolderPanExempt: { type: DataTypes.STRING(2), allowNull: true, defaultValue: "N", field: "second_holder_pan_exempt" },
        secondHolderExemptCategory: { type: DataTypes.STRING(10), allowNull: true, field: "second_holder_exempt_category" },
        secondHolderFirstName: { type: DataTypes.STRING(100), allowNull: true, field: "second_holder_first_name" },
        secondHolderMiddleName: { type: DataTypes.STRING(100), allowNull: true, field: "second_holder_middle_name" },
        secondHolderLastName: { type: DataTypes.STRING(100), allowNull: true, field: "second_holder_last_name" },
        secondHolderDob: { type: DataTypes.STRING(20), allowNull: true, field: "second_holder_dob" },
        secondHolderMobile: { type: DataTypes.STRING(15), allowNull: true, field: "second_holder_mobile" },
        secondHolderMobileRelation: { type: DataTypes.STRING(5), allowNull: true, field: "second_holder_mobile_relation" },
        secondHolderEmail: { type: DataTypes.STRING(150), allowNull: true, field: "second_holder_email" },
        secondHolderEmailRelation: { type: DataTypes.STRING(5), allowNull: true, field: "second_holder_email_relation" },
        secondHolderOccupation: { type: DataTypes.STRING(5), allowNull: true, field: "second_holder_occupation" },
        secondHolderAnnualIncome: { type: DataTypes.STRING(5), allowNull: true, field: "second_holder_annual_income" },
        secondHolderWealthSource: { type: DataTypes.STRING(5), allowNull: true, field: "second_holder_wealth_source" },
        secondHolderAddressType: { type: DataTypes.STRING(5), allowNull: true, field: "second_holder_address_type" },
        secondHolderCityOfBirth: { type: DataTypes.STRING(100), allowNull: true, field: "second_holder_city_of_birth" },
        secondHolderCountryOfBirth: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "INDIA", field: "second_holder_country_of_birth" },
        secondHolderPep: { type: DataTypes.STRING(2), allowNull: true, defaultValue: "N", field: "second_holder_pep" },
        secondHolderTaxIndiaOnly: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true, field: "second_holder_tax_india_only" },

        // Third Holder
        thirdHolderPan: { type: DataTypes.STRING(10), allowNull: true, field: "third_holder_pan" },
        thirdHolderPanExempt: { type: DataTypes.STRING(2), allowNull: true, defaultValue: "N", field: "third_holder_pan_exempt" },
        thirdHolderExemptCategory: { type: DataTypes.STRING(10), allowNull: true, field: "third_holder_exempt_category" },
        thirdHolderFirstName: { type: DataTypes.STRING(100), allowNull: true, field: "third_holder_first_name" },
        thirdHolderMiddleName: { type: DataTypes.STRING(100), allowNull: true, field: "third_holder_middle_name" },
        thirdHolderLastName: { type: DataTypes.STRING(100), allowNull: true, field: "third_holder_last_name" },
        thirdHolderDob: { type: DataTypes.STRING(20), allowNull: true, field: "third_holder_dob" },
        thirdHolderMobile: { type: DataTypes.STRING(15), allowNull: true, field: "third_holder_mobile" },
        thirdHolderMobileRelation: { type: DataTypes.STRING(5), allowNull: true, field: "third_holder_mobile_relation" },
        thirdHolderEmail: { type: DataTypes.STRING(150), allowNull: true, field: "third_holder_email" },
        thirdHolderEmailRelation: { type: DataTypes.STRING(5), allowNull: true, field: "third_holder_email_relation" },
        thirdHolderOccupation: { type: DataTypes.STRING(5), allowNull: true, field: "third_holder_occupation" },
        thirdHolderAnnualIncome: { type: DataTypes.STRING(5), allowNull: true, field: "third_holder_annual_income" },
        thirdHolderWealthSource: { type: DataTypes.STRING(5), allowNull: true, field: "third_holder_wealth_source" },
        thirdHolderAddressType: { type: DataTypes.STRING(5), allowNull: true, field: "third_holder_address_type" },
        thirdHolderCityOfBirth: { type: DataTypes.STRING(100), allowNull: true, field: "third_holder_city_of_birth" },
        thirdHolderCountryOfBirth: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "INDIA", field: "third_holder_country_of_birth" },
        thirdHolderPep: { type: DataTypes.STRING(2), allowNull: true, defaultValue: "N", field: "third_holder_pep" },
        thirdHolderTaxIndiaOnly: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true, field: "third_holder_tax_india_only" },

        // Step 1: Holding Pattern & Personal
        clientCode: { type: DataTypes.STRING(10), allowNull: true, field: "client_code" },
        holdingNature: { type: DataTypes.STRING(5), allowNull: true, field: "holding_nature" },
        maritalStatus: { type: DataTypes.STRING(5), allowNull: true, field: "marital_status" },
        annualIncome: { type: DataTypes.STRING(5), allowNull: true, field: "annual_income" },
        wealthSource: { type: DataTypes.STRING(5), allowNull: true, field: "wealth_source" },
        addressType: { type: DataTypes.STRING(5), allowNull: true, field: "address_type" },
        cityOfBirth: { type: DataTypes.STRING(100), allowNull: true, field: "city_of_birth" },
        countryOfBirth: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "INDIA", field: "country_of_birth" },
        pepStatus: { type: DataTypes.STRING(2), allowNull: true, defaultValue: "N", field: "pep_status" },
        taxIndiaOnly: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true, field: "tax_india_only" },
        taxResidencyCountry: { type: DataTypes.STRING(100), allowNull: true, field: "tax_residency_country" },
        taxIdDocType: { type: DataTypes.STRING(20), allowNull: true, field: "tax_id_doc_type" },
        taxIdNumber: { type: DataTypes.STRING(50), allowNull: true, field: "tax_id_number" },

        // Step 2: Nominees
        nominationOpt: { type: DataTypes.STRING(2), allowNull: true, defaultValue: "Y", field: "nomination_opt" },
        nominationAuthentication: { type: DataTypes.STRING(2), allowNull: true, defaultValue: "O", field: "nomination_authentication" },
        nomineeSoa: { type: DataTypes.STRING(2), allowNull: true, defaultValue: "Y", field: "nominee_soa" },
        doNotWishToNominate: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false, field: "do_not_wish_to_nominate" },
        showNomineeInSoa: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true, field: "show_nominee_in_soa" },

        // Nominee 1
        nominee1Name: { type: DataTypes.STRING(150), allowNull: true, field: "nominee_1_name" },
        nominee1Relationship: { type: DataTypes.STRING(5), allowNull: true, field: "nominee_1_relationship" },
        nominee1Dob: { type: DataTypes.STRING(20), allowNull: true, field: "nominee_1_dob" },
        nominee1Share: { type: DataTypes.STRING(10), allowNull: true, field: "nominee_1_share" },
        nominee1Email: { type: DataTypes.STRING(150), allowNull: true, field: "nominee_1_email" },
        nominee1Mobile: { type: DataTypes.STRING(15), allowNull: true, field: "nominee_1_mobile" },
        nominee1IdentityType: { type: DataTypes.STRING(5), allowNull: true, field: "nominee_1_identity_type" },
        nominee1IdentityNumber: { type: DataTypes.STRING(50), allowNull: true, field: "nominee_1_identity_number" },
        nominee1MinorFlag: { type: DataTypes.STRING(2), allowNull: true, defaultValue: "N", field: "nominee_1_minor_flag" },
        nominee1Guardian: { type: DataTypes.STRING(150), allowNull: true, field: "nominee_1_guardian" },
        nominee1GuardianPan: { type: DataTypes.STRING(10), allowNull: true, field: "nominee_1_guardian_pan" },
        nominee1SameAddress: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true, field: "nominee_1_same_address" },
        nominee1Address1: { type: DataTypes.STRING(255), allowNull: true, field: "nominee_1_address1" },
        nominee1Address2: { type: DataTypes.STRING(255), allowNull: true, field: "nominee_1_address2" },
        nominee1Address3: { type: DataTypes.STRING(255), allowNull: true, field: "nominee_1_address3" },
        nominee1Pin: { type: DataTypes.STRING(10), allowNull: true, field: "nominee_1_pin" },
        nominee1City: { type: DataTypes.STRING(100), allowNull: true, field: "nominee_1_city" },
        nominee1Country: { type: DataTypes.STRING(100), allowNull: true, field: "nominee_1_country" },

        // Nominee 2
        nominee2Name: { type: DataTypes.STRING(150), allowNull: true, field: "nominee_2_name" },
        nominee2Relationship: { type: DataTypes.STRING(5), allowNull: true, field: "nominee_2_relationship" },
        nominee2Dob: { type: DataTypes.STRING(20), allowNull: true, field: "nominee_2_dob" },
        nominee2Share: { type: DataTypes.STRING(10), allowNull: true, field: "nominee_2_share" },
        nominee2Email: { type: DataTypes.STRING(150), allowNull: true, field: "nominee_2_email" },
        nominee2Mobile: { type: DataTypes.STRING(15), allowNull: true, field: "nominee_2_mobile" },
        nominee2IdentityType: { type: DataTypes.STRING(5), allowNull: true, field: "nominee_2_identity_type" },
        nominee2IdentityNumber: { type: DataTypes.STRING(50), allowNull: true, field: "nominee_2_identity_number" },
        nominee2MinorFlag: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false, field: "nominee_2_minor_flag" },
        nominee2Guardian: { type: DataTypes.STRING(150), allowNull: true, field: "nominee_2_guardian" },
        nominee2GuardianPan: { type: DataTypes.STRING(10), allowNull: true, field: "nominee_2_guardian_pan" },
        nominee2SameAddress: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true, field: "nominee_2_same_address" },
        nominee2Address1: { type: DataTypes.STRING(255), allowNull: true, field: "nominee_2_address1" },
        nominee2Address2: { type: DataTypes.STRING(255), allowNull: true, field: "nominee_2_address2" },
        nominee2Address3: { type: DataTypes.STRING(255), allowNull: true, field: "nominee_2_address3" },
        nominee2Pin: { type: DataTypes.STRING(10), allowNull: true, field: "nominee_2_pin" },
        nominee2City: { type: DataTypes.STRING(100), allowNull: true, field: "nominee_2_city" },
        nominee2Country: { type: DataTypes.STRING(100), allowNull: true, field: "nominee_2_country" },

        // Nominee 3
        nominee3Name: { type: DataTypes.STRING(150), allowNull: true, field: "nominee_3_name" },
        nominee3Relationship: { type: DataTypes.STRING(5), allowNull: true, field: "nominee_3_relationship" },
        nominee3Dob: { type: DataTypes.STRING(20), allowNull: true, field: "nominee_3_dob" },
        nominee3Share: { type: DataTypes.STRING(10), allowNull: true, field: "nominee_3_share" },
        nominee3Email: { type: DataTypes.STRING(150), allowNull: true, field: "nominee_3_email" },
        nominee3Mobile: { type: DataTypes.STRING(15), allowNull: true, field: "nominee_3_mobile" },
        nominee3IdentityType: { type: DataTypes.STRING(5), allowNull: true, field: "nominee_3_identity_type" },
        nominee3IdentityNumber: { type: DataTypes.STRING(50), allowNull: true, field: "nominee_3_identity_number" },
        nominee3MinorFlag: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false, field: "nominee_3_minor_flag" },
        nominee3Guardian: { type: DataTypes.STRING(150), allowNull: true, field: "nominee_3_guardian" },
        nominee3GuardianPan: { type: DataTypes.STRING(10), allowNull: true, field: "nominee_3_guardian_pan" },
        nominee3SameAddress: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true, field: "nominee_3_same_address" },
        nominee3Address1: { type: DataTypes.STRING(255), allowNull: true, field: "nominee_3_address1" },
        nominee3Address2: { type: DataTypes.STRING(255), allowNull: true, field: "nominee_3_address2" },
        nominee3Address3: { type: DataTypes.STRING(255), allowNull: true, field: "nominee_3_address3" },
        nominee3Pin: { type: DataTypes.STRING(10), allowNull: true, field: "nominee_3_pin" },
        nominee3City: { type: DataTypes.STRING(100), allowNull: true, field: "nominee_3_city" },
        nominee3Country: { type: DataTypes.STRING(100), allowNull: true, field: "nominee_3_country" },

        // Step 3: Bank 1
        accountType1: { type: DataTypes.STRING(5), allowNull: true, defaultValue: "SB", field: "account_type_1" },
        accountNo1: { type: DataTypes.STRING(30), allowNull: true, field: "account_no_1" },
        micrNo1: { type: DataTypes.STRING(15), allowNull: true, field: "micr_no_1" },
        ifscCode1: { type: DataTypes.STRING(15), allowNull: true, field: "ifsc_code_1" },
        defaultBankFlag1: { type: DataTypes.STRING(2), allowNull: true, defaultValue: "Y", field: "default_bank_flag_1" },
        bankName1: { type: DataTypes.STRING(150), allowNull: true, field: "bank_name_1" },
        branchName1: { type: DataTypes.STRING(150), allowNull: true, field: "branch_name_1" },
        bankAddress1: { type: DataTypes.STRING(255), allowNull: true, field: "bank_address_1" },
        bankCity1: { type: DataTypes.STRING(100), allowNull: true, field: "bank_city_1" },
        bankPincode1: { type: DataTypes.STRING(10), allowNull: true, field: "bank_pincode_1" },

        // Bank 2
        accountType2: { type: DataTypes.STRING(5), allowNull: true, field: "account_type_2" },
        accountNo2: { type: DataTypes.STRING(30), allowNull: true, field: "account_no_2" },
        micrNo2: { type: DataTypes.STRING(15), allowNull: true, field: "micr_no_2" },
        ifscCode2: { type: DataTypes.STRING(15), allowNull: true, field: "ifsc_code_2" },
        defaultBankFlag2: { type: DataTypes.STRING(2), allowNull: true, field: "default_bank_flag_2" },
        bankName2: { type: DataTypes.STRING(150), allowNull: true, field: "bank_name_2" },
        branchName2: { type: DataTypes.STRING(150), allowNull: true, field: "branch_name_2" },
        bankAddress2: { type: DataTypes.STRING(255), allowNull: true, field: "bank_address_2" },
        bankCity2: { type: DataTypes.STRING(100), allowNull: true, field: "bank_city_2" },
        bankPincode2: { type: DataTypes.STRING(10), allowNull: true, field: "bank_pincode_2" },

        divPayMode: { type: DataTypes.STRING(5), allowNull: true, defaultValue: "01", field: "div_pay_mode" },
        communicationMode: { type: DataTypes.STRING(5), allowNull: true, defaultValue: "E", field: "communication_mode" },
        paperlessFlag: { type: DataTypes.STRING(2), allowNull: true, defaultValue: "Z", field: "paperless_flag" },
        chequeName: { type: DataTypes.STRING(150), allowNull: true, field: "cheque_name" },
        resiPhone: { type: DataTypes.STRING(20), allowNull: true, field: "resi_phone" },
        resiFax: { type: DataTypes.STRING(20), allowNull: true, field: "resi_fax" },
        officePhone: { type: DataTypes.STRING(20), allowNull: true, field: "office_phone" },
        officeFax: { type: DataTypes.STRING(20), allowNull: true, field: "office_fax" },

        // Foreign address
        foreignAddress1: { type: DataTypes.STRING(255), allowNull: true, field: "foreign_address_1" },
        foreignAddress2: { type: DataTypes.STRING(255), allowNull: true, field: "foreign_address_2" },
        foreignAddress3: { type: DataTypes.STRING(255), allowNull: true, field: "foreign_address_3" },
        foreignAddressCity: { type: DataTypes.STRING(100), allowNull: true, field: "foreign_address_city" },
        foreignAddressPincode: { type: DataTypes.STRING(10), allowNull: true, field: "foreign_address_pincode" },
        foreignAddressState: { type: DataTypes.STRING(100), allowNull: true, field: "foreign_address_state" },
        foreignAddressCountry: { type: DataTypes.STRING(100), allowNull: true, field: "foreign_address_country" },

        // Registration status
        regId: { type: DataTypes.STRING(50), allowNull: true, field: "reg_id" },
        regStatus: { type: DataTypes.STRING(20), allowNull: true, field: "reg_status" },
        regRemark: { type: DataTypes.STRING(500), allowNull: true, field: "reg_remark" },

        // FATCA upload status — NSE requires FATCA to succeed before UCC.
        fatcaRegId: { type: DataTypes.STRING(50), allowNull: true, field: "fatca_reg_id" },
        fatcaStatus: { type: DataTypes.STRING(20), allowNull: true, field: "fatca_status" },
        fatcaRemark: { type: DataTypes.STRING(500), allowNull: true, field: "fatca_remark" },
        fatcaSubmittedAt: { type: DataTypes.DATE, allowNull: true, field: "fatca_submitted_at" },

        // Form progress tracking
        formStep: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0, field: "form_step" },
        uccCreated: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0, field: "ucc_created" },

        createdAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: DataTypes.NOW,
          field: "createdAt",
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: DataTypes.NOW,
          field: "updatedAt",
        },
      },
      {
        sequelize,
        tableName: "UCCRegistration",
        schema: "public",
        timestamps: true,
      }
    );

    return UCCRegistration;
  }
}
