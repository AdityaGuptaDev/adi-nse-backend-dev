import configs from "../config/config";
import { Sequelize, QueryTypes } from "sequelize";

const environment = process.env.NODE_ENV || "development";
const config = (configs as any)[environment];

const db = new Sequelize({
  dialect: config.dialect,
  database: config.database,
  username: config.username,
  password: config.password,
  host: config.host,
  logging: false,
});

export interface SchemeConfig {
  id?: number;
  color_id: number;
  description: string;
  scheme_name: string;
  fund_name: string;
  scheme_isin: string;
  category_name: string;
  risk_level?: string;
  percentage?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ColorAllocation {
  color_id: number;
  color_name: string;
  total_allocation: number;
  remaining_allocation: number;
  is_fully_allocated: boolean;
}

// Interface for function response
export interface VedantFunctionFund {
  isin: string;
  scheme_id: number;
  scheme_name: string;
  risk_level: string;
  return_1d?: number;
  return_1w?: number;
  return_1mth?: number;
  return_3mth?: number;
  return_6mth?: number;
  return_1yr?: number;
  return_2yr?: number;
  return_3yr?: number;
  return_5yr?: number;
  return_7yr?: number;
  return_10yr?: number;
  return_15yr?: number;
}

// Interface for saved funds - UPDATED to match actual table structure
export interface SavedVedantFund {
  id?: number;
  scheme_id: number;
  scheme_isin: string;
  scheme_name: string;
  risk_level: string;
  // Note: category_name is not in your table, so we'll manage categories differently
  return_1d?: number;
  return_1w?: number;
  return_1m?: number;
  return_3m?: number;
  return_6m?: number;
  return_1y?: number;
  return_2y?: number;
  return_3y?: number;
  return_5y?: number;
  return_7y?: number;
  return_10y?: number;
  return_15y?: number;
  record_status?: number;
  created_by?: number;
  updated_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

class ConfigurationService {
  
  static async getAllColors() {
    try {
      const query = `
        SELECT id, color_name, description
        FROM color_master
        ORDER BY id;
      `;
      return await db.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error fetching colors:", error);
      throw new Error("Failed to fetch color list");
    }
  }

 
  static async getAllSchemes() {
    try {
      const query = `
        SELECT 
          scheme_name,
          fund_name, 
          scheme_isin, 
          risk_level, 
          category_name
        FROM get_all_schemes();
      `;
      return await db.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error fetching schemes:", error);
      throw new Error("Failed to fetch scheme data");
    }
  }

 
  static async getBcSchemes() {
    try {
      const query = `
        SELECT 
          scheme_id,
          scheme_name,
          fund_name,
          scheme_isin,
          category_name,
          risk_level,
          percentage,
          color_id,
          color_name,
          color_description
        FROM bc_scheme();
      `;
      return await db.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error fetching BC scheme data:", error);
      throw new Error("Failed to fetch BC scheme data");
    }
  }

  // ----------------------------------------------------------
  // Save multiple scheme configurations (existing logic retained)
  // ----------------------------------------------------------
  static async saveSchemeConfiguration(configs: SchemeConfig[]): Promise<void> {
    try {
      const existingConfigs = await this.getSavedConfigurations();

      for (const config of configs) {
        const existingConfig = existingConfigs.find(
          (ec) => ec.color_id === config.color_id && ec.scheme_isin === config.scheme_isin
        );

        if (existingConfig) {
          await this.updateConfiguration(existingConfig.id!, config);
        } else {
          
          const currentAllocation = await this.getColorAllocation(config.color_id);
          const newTotalAllocation = currentAllocation.total_allocation + (config.percentage || 0);
          
          if (newTotalAllocation > 100) {
            throw new Error(`Cannot add scheme. Total allocation for color ID ${config.color_id} would exceed 100%. Current: ${currentAllocation.total_allocation}%, New: ${config.percentage}%`);
          }

          const query = `
            INSERT INTO scheme_configurations 
              (color_id, description, scheme_name, fund_name, scheme_isin, category_name, risk_level, percentage, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
          `;
          await db.query(query, {
            type: QueryTypes.INSERT,
            replacements: [
              config.color_id,
              config.description,
              config.scheme_name,
              config.fund_name,
              config.scheme_isin,
              config.category_name,
              config.risk_level || null,
              config.percentage || 0,
            ],
          });
        }
      }
    } catch (error) {
      console.error("Error saving configurations:", error);
      throw new Error("Failed to save configurations");
    }
  }

 
  static async getSavedConfigurations(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          sc.id,
          sc.color_id,
          cm.color_name,
          cm.description AS color_description,
          sc.description AS scheme_description,
          sc.scheme_name,
          sc.fund_name,
          sc.scheme_isin,
          sc.category_name,
          sc.risk_level,
          sc.percentage, 
          sc.created_at,
          sc.updated_at
        FROM scheme_configurations sc
        LEFT JOIN color_master cm ON sc.color_id = cm.id
        ORDER BY sc.color_id, sc.scheme_name;
      `;
      return await db.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error fetching configurations:", error);
      throw new Error("Failed to fetch saved configurations");
    }
  }

  
  static async updateConfiguration(id: number, config: Partial<SchemeConfig>): Promise<void> {
    try {
      
      if (config.percentage !== undefined && config.color_id !== undefined) {
        const currentConfig = await this.getConfigurationById(id);
        const currentAllocation = await this.getColorAllocation(config.color_id);
        
        
        const newTotalAllocation = currentAllocation.total_allocation - (currentConfig?.percentage || 0) + config.percentage;
        
        if (newTotalAllocation > 100) {
          throw new Error(`Cannot update scheme. Total allocation for color ID ${config.color_id} would exceed 100%. Maximum allowed: ${100 - (currentAllocation.total_allocation - (currentConfig?.percentage || 0))}%`);
        }
      }

      const fields: string[] = [];
      const values: any[] = [];

      if (config.color_id !== undefined) {
        fields.push("color_id = ?");
        values.push(config.color_id);
      }
      if (config.description !== undefined) {
        fields.push("description = ?");
        values.push(config.description);
      }
      if (config.scheme_name !== undefined) {
        fields.push("scheme_name = ?");
        values.push(config.scheme_name);
      }
      if (config.fund_name !== undefined) {
        fields.push("fund_name = ?");
        values.push(config.fund_name);
      }
      if (config.scheme_isin !== undefined) {
        fields.push("scheme_isin = ?");
        values.push(config.scheme_isin);
      }
      if (config.category_name !== undefined) {
        fields.push("category_name = ?");
        values.push(config.category_name);
      }
      if (config.risk_level !== undefined) {
        fields.push("risk_level = ?");
        values.push(config.risk_level);
      }
      if (config.percentage !== undefined) {
        fields.push("percentage = ?");
        values.push(config.percentage);
      }

      fields.push("updated_at = NOW()");
      values.push(id);

      const query = `UPDATE scheme_configurations SET ${fields.join(", ")} WHERE id = ?`;
      await db.query(query, { type: QueryTypes.UPDATE, replacements: values });
    } catch (error) {
      console.error("Error updating configuration:", error);
      throw new Error("Failed to update configuration");
    }
  }

  static async deleteConfiguration(id: number): Promise<void> {
    try {
      const query = `DELETE FROM scheme_configurations WHERE id = ?`;
      await db.query(query, { type: QueryTypes.DELETE, replacements: [id] });
    } catch (error) {
      console.error("Error deleting configuration:", error);
      throw new Error("Failed to delete configuration");
    }
  }

 
  static async getConfigurationById(id: number): Promise<any> {
    try {
      const query = `
        SELECT * FROM scheme_configurations WHERE id = ?
      `;
      const results = await db.query(query, { 
        type: QueryTypes.SELECT, 
        replacements: [id] 
      });
      return results[0] || null;
    } catch (error) {
      console.error("Error fetching configuration by ID:", error);
      throw new Error("Failed to fetch configuration");
    }
  }


  static async getColorAllocation(colorId: number): Promise<ColorAllocation> {
    try {
      const query = `
        SELECT 
          cm.id as color_id,
          cm.color_name,
          COALESCE(SUM(sc.percentage), 0) as total_allocation,
          (100 - COALESCE(SUM(sc.percentage), 0)) as remaining_allocation,
          (COALESCE(SUM(sc.percentage), 0) >= 100) as is_fully_allocated
        FROM color_master cm
        LEFT JOIN scheme_configurations sc ON cm.id = sc.color_id
        WHERE cm.id = ?
        GROUP BY cm.id, cm.color_name;
      `;
      
      const results = await db.query(query, { 
        type: QueryTypes.SELECT, 
        replacements: [colorId] 
      });
      
      return results[0] as ColorAllocation || {
        color_id: colorId,
        color_name: '',
        total_allocation: 0,
        remaining_allocation: 100,
        is_fully_allocated: false
      };
    } catch (error) {
      console.error("Error fetching color allocation:", error);
      throw new Error("Failed to fetch color allocation");
    }
  }

  static async getAllColorAllocations(): Promise<ColorAllocation[]> {
    try {
      const query = `
        SELECT 
          cm.id as color_id,
          cm.color_name,
          COALESCE(SUM(sc.percentage), 0) as total_allocation,
          (100 - COALESCE(SUM(sc.percentage), 0)) as remaining_allocation,
          (COALESCE(SUM(sc.percentage), 0) >= 100) as is_fully_allocated
        FROM color_master cm
        LEFT JOIN scheme_configurations sc ON cm.id = sc.color_id
        GROUP BY cm.id, cm.color_name
        ORDER BY cm.id;
      `;
      
      return await db.query(query, { type: QueryTypes.SELECT }) as ColorAllocation[];
    } catch (error) {
      console.error("Error fetching all color allocations:", error);
      throw new Error("Failed to fetch color allocations");
    }
  }

  // NEW: Get available funds from function (for modal)
  static async getAvailableVedantFunds(): Promise<VedantFunctionFund[]> {
    try {
      const query = `SELECT * FROM vedant_recommended_fund()`;
      const result = await db.query(query, { type: QueryTypes.SELECT });
      return result as VedantFunctionFund[];
    } catch (error) {
      console.error("Error fetching available vedant funds:", error);
      throw new Error("Failed to fetch available vedant funds");
    }
  }

  // UPDATED: Save vedant recommended funds - REMOVED category_name since it doesn't exist in table
  static async saveVedantRecommendedFunds(payload: any, userId: number | null) {
    try {
      console.log("Saving vedant funds:", payload);
      
      const rows = Array.isArray(payload) ? payload : [payload];
      const inserted: any[] = [];

      for (const fund of rows) {
        if (!fund || (!fund.scheme_isin && !fund.isin)) {
          console.warn("Skipping fund with missing scheme_isin or isin:", fund);
          continue;
        }

        // Use isin from function as scheme_isin in table
        const schemeIsin = fund.scheme_isin || fund.isin;
        
        // Check if fund already exists with same scheme_isin
        const checkQuery = `
          SELECT * FROM vedant_recommended_funds 
          WHERE scheme_isin = :scheme_isin 
          AND record_status = 1 
          LIMIT 1
        `;
        
        const existing = await db.query(checkQuery, { 
          replacements: { 
            scheme_isin: schemeIsin
          }, 
          type: QueryTypes.SELECT 
        });

        if (existing && existing.length > 0) {
          // Update existing fund
          const idToUpdate = (existing[0] as any).id;
          console.log(`Updating existing fund ID: ${idToUpdate}`);
          const updateResult = await this.updateVedantRecommendedFund(idToUpdate, fund, userId);
          inserted.push(updateResult);
        } else {
          // Insert new fund
          console.log(`Inserting new fund: ${schemeIsin}`);
          const insertQuery = `
            INSERT INTO vedant_recommended_funds (
              scheme_id, scheme_isin, scheme_name, risk_level,
              return_1d, return_1w, return_1m,
              return_3m, return_6m, return_1y,
              return_2y, return_3y, return_5y,
              return_7y, return_10y, return_15y,
              record_status, created_by, updated_by, created_at, updated_at
            ) VALUES (
              :scheme_id, :scheme_isin, :scheme_name, :risk_level,
              :return_1d, :return_1w, :return_1m,
              :return_3m, :return_6m, :return_1y,
              :return_2y, :return_3y, :return_5y,
              :return_7y, :return_10y, :return_15y,
              1, :created_by, :updated_by, NOW(), NOW()
            ) RETURNING *;
          `;

          const replacements = {
            scheme_id: fund.scheme_id || null,
            scheme_isin: schemeIsin,
            scheme_name: fund.scheme_name || null,
            risk_level: fund.risk_level || null,

           
            return_1d: fund.return_1d ?? null,
            return_1w: fund.return_1w ?? null,
            return_1m: fund.return_1mth ?? null,
            return_3m: fund.return_3mth ?? null,
            return_6m: fund.return_6mth ?? null,
            return_1y: fund.return_1yr ?? null,
            return_2y: fund.return_2yr ?? null,
            return_3y: fund.return_3yr ?? null,
            return_5y: fund.return_5yr ?? null,
            return_7y: fund.return_7yr ?? null,
            return_10y: fund.return_10yr ?? null,
            return_15y: fund.return_15yr ?? null,

            created_by: userId || null,
            updated_by: userId || null,
          };

          const result = await db.query(insertQuery, { replacements, type: QueryTypes.INSERT });
          
       
          const selectQuery = `SELECT * FROM vedant_recommended_funds WHERE id = (SELECT max(id) FROM vedant_recommended_funds WHERE scheme_isin = :scheme_isin)`;
          const insertedRecord = await db.query(selectQuery, { 
            replacements: { scheme_isin: schemeIsin }, 
            type: QueryTypes.SELECT 
          });
          
          inserted.push(insertedRecord[0] || null);
        }
      }

      return inserted;
    } catch (error) {
      console.error("Error saving vedant recommended funds:", error);
      throw new Error("Failed to save vedant recommended funds");
    }
  }

  
  static async getAllVedantRecommendedFunds(): Promise<SavedVedantFund[]> {
    try {
      const query = `
        SELECT 
          id,
          scheme_id,
          scheme_isin,
          scheme_name,
          risk_level,
          return_1d,
          return_1w,
          return_1m,
          return_3m,
          return_6m,
          return_1y,
          return_2y,
          return_3y,
          return_5y,
          return_7y,
          return_10y,
          return_15y,
          record_status,
          created_at,
          updated_at
        FROM vedant_recommended_funds 
        WHERE record_status = 1
        ORDER BY scheme_name;
      `;

      const result = await db.query(query, { type: QueryTypes.SELECT });
      return result as SavedVedantFund[];
    } catch (error) {
      console.error("Error fetching vedant recommended funds:", error);
      throw new Error("Failed to fetch vedant recommended funds");
    }
  }


  static async updateVedantRecommendedFund(id: number, body: any, userId: number | null) {
    try {
      console.log(`Updating vedant fund ID: ${id}`, body);
      
      const fields: string[] = [];
      const replacements: any = { id, updated_by: userId || null };

     
      const fieldMappings: { [key: string]: string } = {
        scheme_id: "scheme_id",
        scheme_isin: "scheme_isin",
        scheme_name: "scheme_name",
        risk_level: "risk_level",
        
   
        return_1d: "return_1d",
        return_1w: "return_1w",
        return_1mth: "return_1m",
        return_3mth: "return_3m",
        return_6mth: "return_6m",
        return_1yr: "return_1y",
        return_2yr: "return_2y",
        return_3yr: "return_3y",
        return_5yr: "return_5y",
        return_7yr: "return_7y",
        return_10yr: "return_10y",
        return_15yr: "return_15y",
      };

      for (const [sourceField, tableField] of Object.entries(fieldMappings)) {
        if (body[sourceField] !== undefined) {
          fields.push(`${tableField} = :${sourceField}`);
          replacements[sourceField] = body[sourceField];
        }
      }

      if (fields.length === 0) {
        console.log("No fields to update, returning existing record");
        const existing = await db.query(`SELECT * FROM vedant_recommended_funds WHERE id = :id`, { 
          replacements: { id }, 
          type: QueryTypes.SELECT 
        });
        return existing[0] || null;
      }

      fields.push("updated_by = :updated_by");
      fields.push("updated_at = NOW()");

      const query = `UPDATE vedant_recommended_funds SET ${fields.join(", ")} WHERE id = :id RETURNING *`;
      const result = await db.query(query, { replacements, type: QueryTypes.UPDATE });
      
      return result[0] || null;
    } catch (error) {
      console.error("Error updating vedant recommended fund:", error);
      throw new Error("Failed to update vedant recommended fund");
    }
  }

  static async deleteVedantRecommendedFund(id: number, userId: number | null) {
    try {
      console.log(`Deleting vedant fund ID: ${id}`);
      const query = `UPDATE vedant_recommended_funds SET record_status = 3, updated_by = :updated_by, updated_at = NOW() WHERE id = :id RETURNING *`;
      const result = await db.query(query, { 
        replacements: { id, updated_by: userId || null }, 
        type: QueryTypes.UPDATE 
      });
      return result[0] || null;
    } catch (error) {
      console.error("Error deleting vedant recommended fund:", error);
      throw new Error("Failed to delete vedant recommended fund");
    }
  }
}

export default ConfigurationService;