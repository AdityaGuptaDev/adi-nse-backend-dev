import configs from "../config/config";
import { Options, Sequelize, QueryTypes } from "sequelize";
import environment from "../environment";
import { string } from "zod";

const config = (configs as { [key: string]: Options })[environment];

const db: Sequelize = new Sequelize({
  dialect: config.dialect,
  database: config.database,
  username: config.username,
  password: config.password,
  host: config.host,
  logging: false,
});

interface ThresholdSearchParams {
  pri_isin?: string | string[];
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'effective_date' | 'pri_isin';
  sort_order?: 'ASC' | 'DESC';
}

interface SearchResult {
  data: any[];
  total: number;
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}


export const searchByISIN = async (pri_isin: string): Promise<any[]> => {
  if (!pri_isin || pri_isin.trim() === '') {
    throw new Error('ISIN is required');
  }

  const query = `
      SELECT * FROM vw_mfu_scheme_master_threshold
      WHERE pri_isin = :pri_isin
      
    `;

  try {
    const results = await db.query(query, {
      replacements: { pri_isin: pri_isin.trim().toUpperCase() },
      type: QueryTypes.SELECT,
    });

    console.log(`Found ${results.length} records for ISIN: ${pri_isin}`);
    return results as any[];
  } catch (error) {
    console.error(`Error searching by ISIN ${pri_isin}:`, error);
    throw new Error(`Failed to search by ISIN: ${(error as Error).message}`);
  }
}

export const searchMorningstarFundByName = async (ms_fullname: string): Promise<any> => {

  const query = `
     select * from "SchemeMasters" where ms_fullname=:ms_fullname
      
    `;

  try {
    const results = await db.query(query, {
      replacements: { pri_isin: ms_fullname.trim().toUpperCase() },
      type: QueryTypes.SELECT,
    });

    console.log(`Found ${results.length} records for ms_fullname: ${ms_fullname}`);
    return results as any[];
  } catch (error) {
    console.error(`Error searching by ms_fullname  ${ms_fullname}:`, error);
    throw new Error(`Failed to search by ms_fullname: ${(error as Error).message}`);
  }
};



export const searchByCan = async (can_id: string): Promise<any[]> => {
  if (!can_id || can_id.trim() === '') {
    throw new Error('can Id is required');
  }

  const query = `select DISTINCT ON (can_id)  * from testing_mfu_can_master_details where can_id = :can_id `;

  try {
    const results = await db.query(query, {
      replacements: { can_id: can_id.trim().toUpperCase() },
      type: QueryTypes.SELECT,
    });
    console.log("query-" + query);
    return results as any[];
  } catch (error) {
    console.error(`Error searching by CAN ID ${can_id}:`, error);

    throw error; // this ensures function always throws or returns
  }
};



export const searchByAmcId = async (amc_id: string): Promise<any[]> => {
  if (!amc_id || amc_id.trim() === '') {
    throw new Error('amc Id is required');
  }

  //const query = `select * from "SchemeMasters" where amc_id=:amc_id`;

  const query = `
    SELECT sm.*
    FROM "SchemeMasters" sm
    INNER JOIN "mfu_scheme_master" msm
      ON UPPER(TRIM(sm."schemeISIN")) = UPPER(TRIM(msm."pri_isin"))
    WHERE sm."amc_id" = :amc_id and sm.scheme_type<>'D'
  `;

  try {
    const results = await db.query(query, {
      replacements: { amc_id: amc_id.trim().toUpperCase() },
      type: QueryTypes.SELECT,
    });
    return results as any[];
  } catch (error) {
    console.error(`Error searching by AMC ID ${amc_id}:`, error);
    throw error; // this ensures function always throws or returns
  }
  if (!amc_id || amc_id.trim() === '') {
    throw new Error('amc Id is required');
  }

};



export const searchByCanIdmfuBankDetails = async (can_id: string): Promise<any[]> => {
  if (!can_id || can_id.trim() === '') {
    throw new Error('can Id is required');
  }

  const query = `SELECT DISTINCT ON (ac_no) * FROM testing_mfu_bank_details WHERE can_id = :can_id ORDER BY ac_no;`;

  try {
    const results = await db.query(query, {
      replacements: { can_id: can_id.trim().toUpperCase() },
      type: QueryTypes.SELECT,
    });
    return results as any[];
  } catch (error) {
    console.error(`Error searching by CAN ID ${can_id}:`, error);
    throw error; // this ensures function always throws or returns
  }
  if (!can_id || can_id.trim() === '') {
    throw new Error('can Id is required');
  }

};

//table name -testing_mfu_folio_details
export const searchByCanIdMfuFolioDtl = async (can_id: string): Promise<any[]> => {
  if (!can_id || can_id.trim() === '') {
    throw new Error('can Id is required');
  }

  const query = `select * from testing_mfu_can_folio_details where can_id = :can_id `;
  try {
    const results = await db.query(query, {
      replacements: { can_id: can_id.trim().toUpperCase() },
      type: QueryTypes.SELECT,
    });
    return results as any[];
  } catch (error) {
    console.error(`Error searching by CAN ID ${can_id}:`, error);
    throw error; // this ensures function always throws or returns
  }
  if (!can_id || can_id.trim() === '') {
    throw new Error('can Id is required');
  }

};

//table name -viewCanDetails
export const viewCanDetails = async (can_id: String): Promise<any[]> => {

  const query = `select  * from vw_mfu_can_details where can_id=:can_id `;
  try {
    const results = await db.query(query, {
      replacements: { can_id: can_id.trim().toUpperCase() },
      type: QueryTypes.SELECT,
    });
    return results as any[];
  } catch (error) {
    console.error(`Error showing details`, error);
    throw error; // this ensures function always throws or returns
  }
};



//table name -testing_mfu_payezz_details
export const searchByCanPayEzz = async (can_id: String): Promise<any[]> => {

  const query = `select * from testing_mfu_payezz_details where can=:can_id`;
  try {
    const results = await db.query(query, {
      replacements: { can_id: can_id.trim().toUpperCase() },
      type: QueryTypes.SELECT,
    });
    return results as any[];
  } catch (error) {
    console.error(`Error showing details`, error);
    throw error; // this ensures function always throws or returns
  }
};


//table name -testing_mfu_payez_details
export const portfolioValuationData = async (): Promise<any[]> => {

  const query = `select *from cam_investor_trxn_wbr2 `;
  try {
    const results = await db.query(query, {
      type: QueryTypes.SELECT,
    });
    return results as any[];
  } catch (error) {
    console.error(`Error showing details`, error);
    throw error; // this ensures function always throws or returns
  }
};

export const portfolioSearch = async (filters: any) => {
  try {
    const camsWhereParts: string[] = [];
    const kfintechWhereParts: string[] = [];
    const replacements: any = {};

    // PAN filter
    if (filters.pan) {
      camsWhereParts.push(`TRIM(UPPER(pan)) = TRIM(UPPER(:cams_pan))`);
      kfintechWhereParts.push(`TRIM(UPPER(pan1)) = TRIM(UPPER(:kfin_pan))`);
      replacements.cams_pan = filters.pan;
      replacements.kfin_pan = filters.pan;
    }

    // Folio filter
    if (filters.folio_no) {
      camsWhereParts.push(`TRIM(UPPER(folio_no)) = TRIM(UPPER(:cams_folio))`);
      kfintechWhereParts.push(`TRIM(UPPER(td_acno)) = TRIM(UPPER(:kfin_folio))`);
      replacements.cams_folio = filters.folio_no;
      replacements.kfin_folio = filters.folio_no;
    }
    // Scheme filter
    if (filters.scheme) {
      camsWhereParts.push(`TRIM(UPPER(scheme)) = TRIM(UPPER(:scheme))`);
      kfintechWhereParts.push(`TRIM(UPPER(funddesc)) = TRIM(UPPER(:scheme))`);
      replacements.scheme = filters.scheme;
    }

    const camsWhereClause = camsWhereParts.length > 0 ? `WHERE ${camsWhereParts.join(' AND ')}` : '';
    const kfintechWhereClause = kfintechWhereParts.length > 0 ? `WHERE ${kfintechWhereParts.join(' AND ')}` : '';

    const query = `

 SELECT * FROM (
    SELECT 
     id::bigint AS id,
     td_acno::text AS folio_no,  
      td_fund::text AS amc_code,
      td_acno::text AS td_acno,
      funddesc::text AS scheme,
      invname::text AS inv_name,
      td_trtype::text AS trxntype,
      td_trno::text AS trxnno,
      trnmode::text AS trxnmode,
      trnstat::text AS trxnstat,
      td_agent::text AS brokcode,
      NULL::text AS usrtrxno,
      td_trdt::date AS traddate,
      td_prdt::date AS postdate,
      td_nav::numeric AS purprice,
      td_units::numeric AS units,
      CASE WHEN trdesc LIKE '%Out%' THEN -td_amt ELSE td_amt END::numeric AS amount,
      NULL::text AS subbrok,
      brokper::numeric AS brokperc,
      brokcomm::numeric,
      NULL::text AS altfolio,
      td_trdt::date AS rep_date,
      crtime::text AS time1,
      trnsub::text AS trxnsubtyp,
      td_appno::text AS applicatio,
      NULL::text AS trxn_natur,
      NULL::numeric AS tax,
      NULL::numeric AS total_tax,
      NULL::text AS te_15h,
      NULL::text AS micr_no,
      trdesc::text AS trxn_type_,
      NULL::text AS swflag,
      NULL::text AS old_folio,
      NULL::text AS seq_no,
      NULL::text AS reinvest_f,
      NULL::text AS mult_brok,
      stt::text,
      NULL::text AS location,
      NULL::text AS scheme_typ,
      NULL::text AS tax_status,
      load1::numeric AS load,
      NULL::text AS scanrefno,
      pan1::text AS pan,
      NULL::text AS inv_iin,
      NULL::text AS targ_src_s,
      trdesc::text AS trxn_type_,
      NULL::text AS ticob_trty,
      NULL::text AS ticob_trno,
      NULL::text AS ticob_post,
      dpid::text AS dp_id,
      trcharges::numeric AS trxn_charg,
      NULL::numeric AS eligib_amt,
      NULL::text AS src_of_txn,
      NULL::text AS trxn_suffi,
      NULL::text AS siptrxnno,
      NULL::text AS ter_locati,
      euin::text,
      NULL::text AS euin_valid,
      NULL::text AS euin_opted,
      NULL::text AS sub_brk_ar,
      NULL::text AS exch_dc_fl,
      NULL::text AS src_brk_co,
      NULL::date AS sys_regn_d,
      NULL::text AS ac_no,
      chqbank::text AS bank_name,
      NULL::text AS reversal_c,
      NULL::text AS exchange_f,
      NULL::text AS ca_initiat,
      invstate::text AS gst_state_,
      NULL::numeric AS igst_amoun,
      NULL::numeric AS cgst_amoun,
      NULL::numeric AS sgst_amoun,
      NULL::text AS rev_remark,
      NULL::text AS original_t,
      stampduty::numeric,
      NULL::text AS folio_old,
      NULL::text AS scheme_fol,
      NULL::text AS amc_ref_no,
      NULL::text AS request_re,
      NULL::text AS transmissi,
      file_path::text,
      created_at::timestamp,
      updated_at::timestamp,
      -- 👇 NEW FIELD
      (split_part(funddesc::text, ' ', 1) || ' Mutual Fund') AS mutual_fund,
      'kfintech'::text AS source
    FROM kafintech_trxn_report
   ${kfintechWhereClause}

    UNION ALL
    SELECT 
     id::bigint AS id, 
      folio_no::text AS folio_no,  
      amc_code::text,
      NULL::text AS td_acno,
      scheme::text AS scheme,
      inv_name::text,
      trxntype::text,
      trxnno::text,
      trxnmode::text,
      trxnstat::text,
      brokcode::text AS brokcode,
      usrtrxno::text,
      traddate::date,
      postdate::date,
      purprice::numeric,
      units::numeric,
      CASE WHEN trxn_type_ LIKE '%Out%' THEN -amount ELSE amount END::numeric AS amount,
      subbrok::text,
      brokperc::numeric,
      brokcomm::numeric,
      altfolio::text,
      rep_date::date,
      time1::text,
      trxnsubtyp::text,
      applicatio::text,
      trxn_natur::text,
      tax::numeric,
      total_tax::numeric,
      te_15h::text,
      micr_no::text,
      remarks::text AS trxn_type_,
      swflag::text,
      old_folio::text,
      seq_no::text,
      reinvest_f::text,
      mult_brok::text,
      stt::text,
      location::text,
      scheme_typ::text,
      tax_status::text,
      load::numeric,
      scanrefno::text,
      pan::text,
      inv_iin::text,
      targ_src_s::text,
      trxn_type_::text,
      ticob_trty::text,
      ticob_trno::text,
      ticob_post::text,
      dp_id::text,
      trxn_charg::numeric,
      eligib_amt::numeric,
      src_of_txn::text,
      trxn_suffi::text,
      siptrxnno::text,
      ter_locati::text,
      euin::text,
      euin_valid::text,
      euin_opted::text,
      sub_brk_ar::text,
      exch_dc_fl::text,
      src_brk_co::text,
      sys_regn_d::date,
      ac_no::text,
      bank_name::text,
      reversal_c::text,
      exchange_f::text,
      ca_initiat::text,
      gst_state_::text,
      igst_amoun::numeric,
      cgst_amoun::numeric,
      sgst_amoun::numeric,
      rev_remark::text,
      original_t::text,
      stamp_duty::numeric AS stampduty,
      folio_old::text,
      scheme_fol::text,
      amc_ref_no::text,
      request_re::text,
      transmissi::text,
      file_path::text,
      created_at::timestamp,
      updated_at::timestamp,
      -- 👇 NEW FIELD
      (split_part(scheme::text, ' ', 1) || ' Mutual Fund') AS mutual_fund,
      'cams'::text AS source
    FROM cam_investor_trxn_wbr2
  ${camsWhereClause}

  ) combined_data
  ORDER BY traddate DESC 
`;



    const result = await db.query(query, {
      type: QueryTypes.SELECT,
      replacements,
    });

    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return [];
  }
};


export const investorSearch = async (filters: any) => {
  try {
    if (!filters.pan) {
      throw new Error("PAN is required for investor search");
    }

    const replacements: any = {
      cams_pan: filters.pan,
      kfin_pan: filters.pan,
      cams_inv_name: filters.inv_name ? `%${filters.inv_name}%` : null,
      kfin_inv_name: filters.inv_name ? `%${filters.inv_name}%` : null
    };

    let kfinCondition = `TRIM(UPPER(pan1)) = TRIM(UPPER(:kfin_pan))`;
    let camsCondition = `TRIM(UPPER(pan)) = TRIM(UPPER(:cams_pan))`;

    if (filters.inv_name) {
      kfinCondition += ` AND UPPER(invname) LIKE UPPER(:kfin_inv_name)`;
      camsCondition += ` AND UPPER(inv_name) LIKE UPPER(:cams_inv_name)`;
    }

    const query = `
      SELECT * FROM (
        SELECT 
          funddesc::text AS scheme,
          invname::text AS inv_name,
          fmcode::text AS folio_no,
          td_trtype::text AS trxntype,
          td_nav::numeric AS purprice,
          td_units::numeric AS units,
          td_amt::numeric AS amount,
          pan1::text AS pan,
          td_trdt::date AS traddate,
          file_path::text,
          created_at::timestamp,
          updated_at::timestamp,
          'kfintech'::text AS source
        FROM kafintech_trxn_report
        WHERE ${kfinCondition}

        UNION ALL

        SELECT 
          scheme::text AS scheme,
          inv_name::text,
          folio_no::text,
          trxntype::text,
          purprice::numeric,
          units::numeric,
          amount::numeric,
          pan::text,
          traddate::date,
          file_path::text,
          created_at::timestamp,
          updated_at::timestamp,
          'cams'::text AS source
        FROM cam_investor_trxn_wbr2
        WHERE ${camsCondition}
      ) combined_data
      ORDER BY traddate DESC
    `;

    const result = await db.query(query, {
      type: QueryTypes.SELECT,
      replacements,
    });

    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    throw error;
  }
};



export const getFoliosByPanAndScheme = async (pan: string, scheme: string): Promise<any[]> => {
  const query = `SELECT DISTINCT folio_no FROM cam_investor_trxn_wbr2 WHERE pan = :pan AND scheme = :scheme `;
  try {
    const results = await db.query(query, {
      type: QueryTypes.SELECT,
      replacements: { pan, scheme },
    });
    return results as any[];
  } catch (error) {
    console.error(`Error fetching folio numbers by pan and scheme:`, error);
    throw error;
  }
};

export const investmentGetFolio = async (pan: string): Promise<any[]> => {

  //const query = `SELECT * FROM cam_investor_trxn_wbr2 WHERE pan = :pan `;
  const query = `SELECT id, amc_code, folio_no, prodcode, scheme, inv_name, trxntype, trxnno, trxnmode, trxnstat, usercode, usrtrxno, traddate, postdate, purprice, units, amount, brokcode, subbrok, brokperc, brokcomm, altfolio, rep_date, time1, trxnsubtyp, applicatio, trxn_natur, tax, total_tax, te_15h, micr_no, remarks, swflag, old_folio, seq_no, reinvest_f, mult_brok, stt, "location", scheme_typ, tax_status, "load", scanrefno, pan, inv_iin, targ_src_s, trxn_type_, ticob_trty, ticob_trno, ticob_post, dp_id, trxn_charg, eligib_amt, src_of_txn, trxn_suffi, siptrxnno, ter_locati, euin, euin_valid, euin_opted, sub_brk_ar, exch_dc_fl, src_brk_co, sys_regn_d, ac_no, bank_name, reversal_c, exchange_f, ca_initiat, gst_state_, igst_amoun, cgst_amoun, sgst_amoun, rev_remark, original_t, stamp_duty, folio_old, scheme_fol, amc_ref_no, request_re, transmissi, file_path, created_at, updated_at FROM cam_investor_trxn_wbr2 WHERE TRIM(UPPER(pan)) = :pan UNION ALL SELECT NULL AS id, fmcode AS amc_code, td_acno AS folio_no, td_scheme AS prodcode, funddesc AS scheme, invname AS inv_name, td_trtype AS trxntype, td_trno AS trxnno, trnmode AS trxnmode, trnstat AS trxnstat, NULL AS usercode, td_trno AS usrtrxno, td_trdt AS traddate, td_prdt AS postdate, td_nav AS purprice, td_units AS units, td_amt AS amount, td_broker AS brokcode, NULL AS subbrok, brokper AS brokperc, brokcomm AS brokcomm, NULL AS altfolio, NULL AS rep_date, NULL AS time1, trnsub AS trxnsubtyp, td_appno AS applicatio, trdesc AS trxn_natur, NULL AS tax, tdsamount AS total_tax, NULL AS te_15h, chqno AS micr_no, nctremarks AS remarks, td_trxnmo5 AS swflag, NULL AS old_folio, NULL AS seq_no, NULL AS reinvest_f, NULL AS mult_brok, stt AS stt, citycateg0 AS "location", assettype AS scheme_typ, NULL AS tax_status, load1 AS "load", NULL AS scanrefno, pan1 AS pan, NULL AS inv_iin, NULL AS targ_src_s, td_trtype AS trxn_type_, NULL AS ticob_trty, NULL AS ticob_trno, NULL AS ticob_post, dpid AS dp_id, trcharges AS trxn_charg, NULL AS eligib_amt, NULL AS src_of_txn, NULL AS trxn_suffi, newunqno AS siptrxnno, NULL AS ter_locati, euin AS euin, NULL AS euin_valid, NULL AS euin_opted, NULL AS sub_brk_ar, NULL AS exch_dc_fl, NULL AS src_brk_co, NULL AS sys_regn_d, null AS ac_no,chqbank AS bank_name, NULL AS reversal_c, exchorgtr6 AS exchange_f, NULL AS ca_initiat, invstate AS gst_state_, NULL AS igst_amoun, NULL AS cgst_amoun, NULL AS sgst_amoun, nctremarks AS rev_remark, NULL AS original_t, stampduty AS stamp_duty, NULL AS folio_old, NULL AS scheme_fol, NULL AS amc_ref_no, NULL AS request_re, NULL AS transmissi, file_path, created_at, updated_at FROM kafintech_trxn_report WHERE TRIM(UPPER(pan1)) = :pan `;

  try {
    const results = await db.query(query, {
      type: QueryTypes.SELECT,
      replacements: { pan },
    });
    return results as any[];
  } catch (error) {
    console.error(`Error fetching folio numbers by pan:`, error);
    throw error;
  }
};


export const getBankByFolio = async (folio: String): Promise<any[]> => {

  const query = `SELECT * FROM public.search_by_folio(:folio)`;

  try {
    const results = await db.query(query, {
      replacements: { folio: folio.trim() },
      type: QueryTypes.SELECT,
    });

    return results as any[];

  } catch (error) {
    console.error(`Error fetching bank details by folio`, error);
    throw error;
  }
};

export const getSchemeByName = async (schemeName: String): Promise<any[]> => {

  //const query = `SELECT * FROM public.search_by_folio(:folio)`;

  const query = `SELECT * FROM "SchemeMasters" where scheme_type='R' and name like '%${schemeName}%' `;

  try {
    const results = await db.query(query, {
      // replacements: { folio: folio.trim() },
      type: QueryTypes.SELECT,
    });

    return results as any[];

  } catch (error) {
    console.error(`Error fetching bank details by folio`, error);
    throw error;
  }
};

