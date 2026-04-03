import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
  CreationOptional,
} from 'sequelize';

export interface TestingMfuCanMasterAttributes {
  mfuCanMstId: number;
  canId?: string;
  bankId?: string;
  bankName?: string;
  micr?: string;
  ifsc?: string;
  accNumber?: string;
  accType?: string;
  SupportForePayEezz?: string;
}

export type TestingMfuCanMasterCreationAttributes = Optional<
  TestingMfuCanMasterAttributes,
  'mfuCanMstId'
>;

export class TestingMfuCanMaster
  extends Model<
    TestingMfuCanMasterAttributes,
    TestingMfuCanMasterCreationAttributes
  >
  implements TestingMfuCanMasterAttributes
{
  declare mfuCanMstId: CreationOptional<number>;
  declare canId: string ;
  declare bankId: string ;
  declare bankName: string ;
  declare micr: string ;
  declare ifsc: string ;
  declare accNumber: string ;
  declare accType: string;
  declare SupportForePayEezz: string ;

  static initModel(sequelize: Sequelize): typeof TestingMfuCanMaster {
    TestingMfuCanMaster.init(
      {
        mfuCanMstId: {
          type: DataTypes.BIGINT,
          primaryKey: true,
          autoIncrement: true,
          field: 'mfuCanMstId',
        },
        canId: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'canId',
        },
        bankId: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'bankId',
        },
        bankName: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'bankName',
        },
        micr: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'micr',
        },
        ifsc: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'ifsc',
        },
        accNumber: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'accNumber',
        },
        accType: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'accType',
        },
        SupportForePayEezz: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'SupportForePayEezz',
        },
      },
      {
        sequelize,
        tableName: 'testing_mfu_can_master',
        timestamps: false,
      }
    );

    return TestingMfuCanMaster;
  }
}
