// src/utils/PortfolioQueryBuilder.ts
export class folioListQueryBuilder {
  private pan: string | null;

  constructor(pan?: string) {
    this.pan = pan || null;
  }

  /** WHERE condition for CAM table */
  private camWhere(): string {
    return this.pan
      ? `:pan_no IN (pan_no, joint1_pan, joint2_pan, guard_pan)`
      : `1=1`;
  }

  /** WHERE condition for KFin table */
  private kfinWhere(): string {
    return this.pan
      ? `:pan_no IN (pangno, pan2, pan3, guardpanno)`
      : `1=1`;
  }


public getQuery(): string {
  return `
    SELECT DISTINCT ON (foliochk, pan_no) *
    FROM (
      ${this.camSelect()}
      UNION ALL
      ${this.kfinSelect()}
    ) AS portfolio
    ORDER BY foliochk, pan_no, created_at DESC NULLS LAST
  `;
}


  /** Query for CAM table */
/** Query for CAM table */
private camSelect(): string {
  return `
    SELECT 
      foliochk,
      inv_name,
      address1,
      address2,
      address3,
      city,
      pincode,
      product,
      sch_name,
      rep_date,
      clos_bal,
      rupee_bal,
      jnt_name1,
      jnt_name2,
      phone_off,
      phone_res,
      email,
      holding_na,
      uin_no,
      pan_no,
      joint1_pan,
      joint2_pan,
      guard_pan,
      tax_status,
      broker_cod,
      subbroker,
      reinv_flag,
      bank_name,
      branch,
      ac_type,
      ac_no,
      b_address1,
      b_address2,
      b_address3,
      b_city,
      b_pincode,
      inv_dob,
      mobile_no,
      occupation,
      inv_iin,
      nom_name,
      relation,
      nom_addr1,
      nom_addr2,
      nom_addr3,
      nom_city,
      nom_state,
      nom_pincod,
      nom_ph_off,
      nom_ph_res,
      nom_email,
      nom_percen,
      nom2_name,
      nom2_relat,
      nom2_addr1,
      nom2_addr2,
      nom2_addr3,
      nom2_city,
      nom2_state,
      nom2_pinco,
      nom2_ph_of,
      nom2_ph_re,
      nom2_email,
      nom2_perce,
      nom3_name,
      nom3_relat,
      nom3_addr1,
      nom3_addr2,
      nom3_addr3,
      nom3_city,
      nom3_state,
      nom3_pinco,
      nom3_ph_of,
      nom3_ph_re,
      nom3_email,
      nom3_perce,
      ifsc_code,
      dp_id,
      demat,
      guard_name,
      brokcode,
      folio_date,
      aadhaar,
      tpa_linked,
      fh_ckyc_no,
      jh1_ckyc,
      jh2_ckyc,
      g_ckyc_no,
      jh1_dob,
      jh2_dob,
      guardian_d,
      amc_code,
      gst_state_,
      folio_old,
      scheme_fol,
      country,
      file_path,
      created_at,
      updated_at,
      -- 👇 NEW FIELD: First word from scheme + " Mutual Fund"
      (split_part(sch_name, ' ', 1) || ' Mutual Fund') AS mutual_fund,
      'cams' AS source_table
    FROM cam_investor_details_wbr9
    WHERE ${this.camWhere()} 
  `;
}

/** Query for KFin table */
private kfinSelect(): string {
  return `
    SELECT 
      prcode AS foliochk,
      invname AS inv_name,
      add1 AS address1,
      add2 AS address2,
      add3 AS address3,
      city,
      pin AS pincode,
      NULL AS product,
      funddesc AS sch_name,
      NULL AS rep_date,
      NULL AS clos_bal,
      NULL AS rupee_bal,
      jtname1 AS jnt_name1,
      jtname2 AS jnt_name2,
      rphone AS phone_off,
      ph_res1 AS phone_res,
      email,
      NULL AS holding_na,
      tpin AS uin_no,
      pangno AS pan_no,
      pan2 AS joint1_pan,
      pan3 AS joint2_pan,
      guardpanno AS guard_pan,
      status AS tax_status,
      brokcode AS broker_cod,
      NULL AS subbroker,
      NULL AS reinv_flag,
      bname AS bank_name,
      branch,
      bnkactype AS ac_type,
      bnkacno AS ac_no,
      badd1 AS b_address1,
      badd2 AS b_address2,
      badd3 AS b_address3,
      bcity AS b_city,
      pin AS b_pincode,
      dob::date AS inv_dob,
      mobile AS mobile_no,
      occpn AS occupation,
      inv_id AS inv_iin,
      nominee AS nom_name,
      nomineerel AS relation,
      nominee_a8 AS nom_addr1,
      nominee_a9 AS nom_addr2,
      nominee_10 AS nom_addr3,
      nominee_11 AS nom_city,
      nominee_12 AS nom_state,
      nominee_13 AS nom_pincod,
      nominee_14 AS nom_ph_off,
      nominee_15 AS nom_ph_res,
      NULL AS nom_email,
      NULL AS nom_percen,
      nominee2 AS nom2_name,
      nominee2r3 AS nom2_relat,
      nominee216 AS nom2_addr1,
      nominee217 AS nom2_addr2,
      nominee218 AS nom2_addr3,
      nominee219 AS nom2_city,
      nominee220 AS nom2_state,
      nominee221 AS nom2_pinco,
      nominee222 AS nom2_ph_of,
      nominee223 AS nom2_ph_re,
      NULL AS nom2_email,
      NULL AS nom2_perce,
      nominee3 AS nom3_name,
      nominee3r4 AS nom3_relat,
      nominee324 AS nom3_addr1,
      nominee325 AS nom3_addr2,
      nominee326 AS nom3_addr3,
      nominee327 AS nom3_city,
      nominee328 AS nom3_state,
      nominee329 AS nom3_pinco,
      nominee330 AS nom3_ph_of,
      nominee331 AS nom3_ph_re,
      NULL AS nom3_email,
      NULL AS nom3_perce,
      ifsc AS ifsc_code,
      dpid AS dp_id,
      dmtacno AS demat,
      guardiann0 AS guard_name,
      brokcode,
      crdate::date AS folio_date,
      NULL AS aadhaar,
      NULL AS tpa_linked,
      ckyc_no AS fh_ckyc_no,
      jh1_ckyc,
      jh2_ckyc,
      NULL AS g_ckyc_no,
      NULL AS jh1_dob,
      NULL AS jh2_dob,
      NULLIF(NULLIF(guardian32,'0'),'')::date AS guardian_d,
      NULL AS amc_code,
      NULL AS gst_state_,
      NULL AS folio_old,
      NULL AS scheme_fol,
      country,
      file_path,
      created_at,
      updated_at,
      -- 👇 NEW FIELD
      (split_part(funddesc, ' ', 1) || ' Mutual Fund') AS mutual_fund,
      'kfintech' AS source_table
    FROM kfintech_investor_master
    WHERE ${this.kfinWhere()} 
  `;
}

}
