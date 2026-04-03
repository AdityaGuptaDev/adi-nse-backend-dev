export class BirthdayQueryBuilder {
  constructor() {
  }

  public getQuery(): string {
    return `
      SELECT DISTINCT ON (inv_name, inv_dob, mobile_no, email) *
      FROM (
        ${this.camSelect()} 
        UNION ALL 
        ${this.kfinSelect()}
      ) AS birthday_investors
      ORDER BY inv_name, inv_dob, mobile_no, email, source_table
    `;
  }

  private camSelect(): string {
    return `
      SELECT 
        inv_name,
        inv_dob,
        mobile_no,
        email,
        'cams' AS source_table
      FROM cam_investor_details_wbr9
    `;
  }

  private kfinSelect(): string {
    return `
      SELECT 
        invname AS inv_name,
        dob::date AS inv_dob,
        mobile AS mobile_no,
        email,
        'kfintech' AS source_table
      FROM kfintech_investor_master
    `;
  }
}
