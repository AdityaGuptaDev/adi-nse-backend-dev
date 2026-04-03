import {
  CreationOptional,
  DataTypes,
  Model,
  Sequelize
} from 'sequelize'



export class SchemeMarketCapAlloc extends Model {
  declare marketcap_id: CreationOptional<number>;
  declare mstar_id: string;
  declare scheme_id: number;
  declare scheme_isin: string;
  declare marketcap_giant: number;
  declare marketcap_large: number;
  declare marketcap_mid: number;
  declare marketcap_small: number;
  declare marketcap_micro: number;
  declare assetalloc_equity: number;
  declare assetalloc_bond: number;
  declare assetalloc_cash: number;
  declare assetalloc_others: number;
  declare equistyle_largeValue: number;
  declare equistyle_largeCore: number;
  declare equistyle_largeGrowth: number;
  declare equistyle_midValue: number;
  declare equistyle_midCore: number;
  declare equistyle_midGrowth: number;
  declare equistyle_smallValue: number;
  declare equistyle_smallCore: number;
  declare equistyle_smallGrowth: number;
  declare createdBy: number
  declare modifiedBy: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof SchemeMarketCapAlloc {
    SchemeMarketCapAlloc.init(
      {
        marketcap_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          unique: true

        },
        mstar_id: {
          type: DataTypes.STRING,
        },
        scheme_id: {
          type: DataTypes.INTEGER,
        },
        scheme_isin: {
          type: DataTypes.STRING,
        },
        marketcap_giant: {
          type: DataTypes.FLOAT,
        },
        marketcap_large: {
          type: DataTypes.FLOAT,
        },
        marketcap_mid: {
          type: DataTypes.FLOAT,
        },
        marketcap_small: {
          type: DataTypes.FLOAT,
        },
        marketcap_micro: {
          type: DataTypes.FLOAT,
        },
        assetalloc_equity: {
          type: DataTypes.FLOAT,
        },
        assetalloc_bond: {
          type: DataTypes.FLOAT,
        },
        assetalloc_cash: {
          type: DataTypes.FLOAT,
        },
        assetalloc_others: {
          type: DataTypes.FLOAT,
        },
        equistyle_largeValue: {
          type: DataTypes.FLOAT,
        },
        equistyle_largeCore: {
          type: DataTypes.FLOAT,
        },
        equistyle_largeGrowth: {
          type: DataTypes.FLOAT,
        },
        equistyle_midValue: {
          type: DataTypes.FLOAT,
        },
        equistyle_midCore: {
          type: DataTypes.FLOAT,
        },
        equistyle_midGrowth: {
          type: DataTypes.FLOAT,
        },
        equistyle_smallValue: {
          type: DataTypes.FLOAT,
        },
        equistyle_smallCore: {
          type: DataTypes.FLOAT,
        },
        equistyle_smallGrowth: {
          type: DataTypes.FLOAT,
        },
        createdBy: {
          type: DataTypes.INTEGER
        },
        modifiedBy: {
          type: DataTypes.INTEGER
        },
        createdAt: {
          type: DataTypes.DATE
        },
        updatedAt: {
          type: DataTypes.DATE
        }
      },
      {
        sequelize,
      }
    );

    return SchemeMarketCapAlloc;
  }
}
