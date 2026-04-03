/**
 * Security Monitor Service
 * - Every failed login attempt  → written to logs/error-logs.log (via ErrorLogger)
 * - 5 failed attempts in 15 min → email to ujjwalsingh.vedant@gmail.com + SMS to 9304955503
 * - 10 attempts                 → CRITICAL SMS escalation
 */

import fs from 'fs';
import path from 'path';
import ErrorLogger from '../db/core/logger/error-logger';
import { sendEmail } from './mailService';
import { SmsService } from './sms.service';

// ─── Security Contacts ────────────────────────────────────────────────────────
const SECURITY_EMAIL = 'ujjwalsingh.vedant@gmail.com';
const SECURITY_PHONE = '9304955503';

// ─── Thresholds ───────────────────────────────────────────────────────────────
const MAX_FAILED_ATTEMPTS = 5;          // alert threshold
const TIME_WINDOW_MS = 15 * 60 * 1000; // 15-minute sliding window

// ─── Security Log (SIEM detail log — separate from error-logs.log) ────────────
const SECURITY_LOG = path.join(process.cwd(), 'logs', 'security.log');
const SMS_EMAIL_LOG = path.join(process.cwd(), 'logs', 'sms-email.log');

// Ensure logs/ directory exists at startup
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// ─── Types ────────────────────────────────────────────────────────────────────
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface FailedAttempt {
  identifier: string;
  ip: string;
  userAgent: string;
  error: string;
  time: Date;
}

// ─── Security Monitor ─────────────────────────────────────────────────────────
class SecurityMonitor {
  private failedAttempts = new Map<string, FailedAttempt[]>();

  // ── Internal log writers ───────────────────────────────────────────────────

  /** Writes to logs/security.log — full SIEM detail */
  private writeSecurityLog(severity: Severity, event: string, data: object) {
    const line = `[${new Date().toISOString()}] [${severity}] [${event}] ${JSON.stringify(data)}\n`;
    try { fs.appendFileSync(SECURITY_LOG, line); } catch { /* silent */ }
  }

  /** Writes notification delivery result to logs/sms-email.log */
  private writeNotifyLog(channel: 'EMAIL' | 'SMS', to: string, success: boolean, detail?: string) {
    const line = `[${new Date().toISOString()}] [${channel}] to=${to} success=${success}${detail ? ' | ' + detail : ''}\n`;
    try { fs.appendFileSync(SMS_EMAIL_LOG, line); } catch { /* silent */ }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Call on every failed login.
   * Writes to error-logs.log immediately.
   * Fires email + SMS when attempt count hits threshold.
   */
  trackFailedLogin(identifier: string, ip: string, userAgent: string, error: string) {
    // Slide the window — drop attempts older than TIME_WINDOW_MS
    const existing = (this.failedAttempts.get(identifier) || [])
      .filter(a => Date.now() - a.time.getTime() < TIME_WINDOW_MS);

    existing.push({ identifier, ip, userAgent, error, time: new Date() });
    this.failedAttempts.set(identifier, existing);

    const count = existing.length;

    // ── 1. Write to error-logs.log on EVERY attempt ─────────────────────────
    ErrorLogger.write({
      type: 'failed_login_attempt',
      identifier,
      ip,
      userAgent,
      error,
      attemptCount: count,
      timestamp: new Date().toISOString()
    });

    // ── 2. Write to security.log (SIEM detail) ──────────────────────────────
    this.writeSecurityLog('MEDIUM', 'FAILED_LOGIN', { identifier, ip, count, error });

    console.log(`[Security] Failed login ${count}/${MAX_FAILED_ATTEMPTS} for ${identifier}`);

    // ── 3. Alert at threshold (5 attempts) ──────────────────────────────────
    if (count === MAX_FAILED_ATTEMPTS) {
      ErrorLogger.write({
        type: 'brute_force_detected',
        identifier,
        ip,
        attemptCount: count,
        severity: 'HIGH',
        message: `${count} failed login attempts in 15 minutes`,
        timestamp: new Date().toISOString()
      });
      this.writeSecurityLog('HIGH', 'BRUTE_FORCE_DETECTED', { identifier, ip, count });
      this.sendAlert(identifier, existing, 'HIGH').catch(() => { /* errors logged inside */ });
    }

    // ── 4. Critical escalation at 10 attempts ───────────────────────────────
    if (count === 10) {
      ErrorLogger.write({
        type: 'account_under_attack',
        identifier,
        ip,
        attemptCount: count,
        severity: 'CRITICAL',
        timestamp: new Date().toISOString()
      });
      this.writeSecurityLog('CRITICAL', 'ACCOUNT_UNDER_ATTACK', { identifier, ip, count });
      this.sendSmsAlert(
        `CRITICAL: ${count} brute-force attempts on ${identifier} from IP ${ip}. Immediate action required.`
      ).catch(() => { /* errors logged inside */ });
    }
  }

  /** Call on successful login to reset the counter */
  clearFailedAttempts(identifier: string) {
    if (this.failedAttempts.has(identifier)) {
      this.failedAttempts.delete(identifier);
      this.writeSecurityLog('LOW', 'LOGIN_SUCCESS_CLEARED', { identifier });
    }
  }

  /** Returns current in-window failed attempt count */
  getFailedCount(identifier: string): number {
    return (this.failedAttempts.get(identifier) || [])
      .filter(a => Date.now() - a.time.getTime() < TIME_WINDOW_MS).length;
  }

  /** Returns all active failed-attempt counters */
  getStats() {
    const result: Record<string, number> = {};
    this.failedAttempts.forEach((attempts, identifier) => {
      const valid = attempts.filter(a => Date.now() - a.time.getTime() < TIME_WINDOW_MS);
      if (valid.length > 0) result[identifier] = valid.length;
    });
    return result;
  }

  /** Log any custom security event; sends alerts for HIGH/CRITICAL */
  logSecurityEvent(event: string, severity: Severity, details: object) {
    ErrorLogger.write({ type: event, severity, ...details, timestamp: new Date().toISOString() });
    this.writeSecurityLog(severity, event, details);

    if (severity === 'HIGH' || severity === 'CRITICAL') {
      const subject = `[${severity}] Security Alert: ${event}`;
      const html = this.buildGenericEmailHtml(event, severity, details);
      this.sendEmailAlert(subject, html).catch(() => { /* errors logged inside */ });
      if (severity === 'CRITICAL') {
        this.sendSmsAlert(`VEDANT MF CRITICAL: ${event}. Check email immediately.`).catch(() => { /* */ });
      }
    }
  }

  // ── Internal: send email + SMS alert ──────────────────────────────────────

  private async sendAlert(identifier: string, attempts: FailedAttempt[], severity: string) {
    const subject = `[${severity}] ${attempts.length} Failed Login Attempts – ${identifier}`;
    const html    = this.buildLoginAlertHtml(identifier, attempts);
    const sms     = `VEDANT MF ALERT: ${attempts.length} failed logins for ${identifier} from IP ${attempts[attempts.length - 1].ip}. Check email.`;

    await Promise.allSettled([
      this.sendEmailAlert(subject, html),
      this.sendSmsAlert(sms)
    ]);
  }

  private async sendEmailAlert(subject: string, html: string) {
    try {
      await sendEmail({
        from: 'no-reply@vedantasset.in',
        to: SECURITY_EMAIL,
        toName: 'IT Security',
        subject,
        text: subject,
        replacements: {},
        htmlFile: '',
        attachments: [],
        html,
        cc: '',
        replyTo: ''
      });
      this.writeNotifyLog('EMAIL', SECURITY_EMAIL, true, subject);
      console.log(`[Security] Alert email sent → ${SECURITY_EMAIL}`);
    } catch (err: any) {
      this.writeNotifyLog('EMAIL', SECURITY_EMAIL, false, err.message);
      ErrorLogger.write({ type: 'email_alert_failed', to: SECURITY_EMAIL, error: err.message, timestamp: new Date().toISOString() });
    }
  }

  private async sendSmsAlert(message: string) {
    try {
      await SmsService.sendSmsUsingNimbus(SECURITY_PHONE, message);
      this.writeNotifyLog('SMS', SECURITY_PHONE, true, message.substring(0, 80));
      console.log(`[Security] Alert SMS sent → ${SECURITY_PHONE}`);
    } catch (err: any) {
      this.writeNotifyLog('SMS', SECURITY_PHONE, false, err.message);
      ErrorLogger.write({ type: 'sms_alert_failed', to: SECURITY_PHONE, error: err.message, timestamp: new Date().toISOString() });
    }
  }

  // ── HTML email templates ───────────────────────────────────────────────────

  private buildLoginAlertHtml(identifier: string, attempts: FailedAttempt[]): string {
    const latest = attempts[attempts.length - 1];
    const rows = attempts.map((a, i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${i + 1}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${a.time.toLocaleString('en-IN')}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${a.ip}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;color:#c0392b;">${a.error}</td>
      </tr>`).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body{font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;margin:0;}
    .wrap{max-width:650px;margin:auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.12);}
    .hdr{background:#c0392b;color:#fff;padding:24px;text-align:center;}
    .hdr h2{margin:0 0 6px;font-size:22px;}
    .hdr p{margin:0;font-size:13px;opacity:.85;}
    .body{padding:24px;}
    .row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #f0f0f0;}
    .lbl{font-weight:bold;color:#555;font-size:13px;}
    .val{font-size:13px;color:#222;text-align:right;}
    table{width:100%;border-collapse:collapse;margin-top:18px;font-size:13px;}
    th{background:#f8f9fa;padding:10px;text-align:left;border-bottom:2px solid #ddd;color:#333;}
    td{color:#444;}
    .tip{margin-top:20px;padding:14px 18px;background:#fff8e1;border-left:4px solid #ffc107;border-radius:4px;font-size:13px;}
    .tip ul{margin:8px 0;padding-left:18px;}
    .ftr{background:#f8f9fa;padding:14px;text-align:center;color:#888;font-size:11px;}
  </style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <h2>&#x26A0; SECURITY ALERT — VEDANT MF</h2>
    <p>Multiple Failed Login Attempts Detected</p>
  </div>
  <div class="body">
    <div class="row"><span class="lbl">Target Account</span><span class="val">${identifier}</span></div>
    <div class="row"><span class="lbl">Total Attempts</span><span class="val" style="color:#c0392b;font-weight:bold;">${attempts.length}</span></div>
    <div class="row"><span class="lbl">Time Window</span><span class="val">Last 15 minutes</span></div>
    <div class="row"><span class="lbl">Latest Attempt</span><span class="val">${latest.time.toLocaleString('en-IN')}</span></div>
    <div class="row"><span class="lbl">Source IP</span><span class="val">${latest.ip}</span></div>
    <div class="row"><span class="lbl">User Agent</span><span class="val" style="font-size:11px;">${latest.userAgent.substring(0, 80)}</span></div>
    <div class="row"><span class="lbl">Last Error</span><span class="val" style="color:#c0392b;">${latest.error}</span></div>
    <table>
      <thead><tr><th>#</th><th>Time</th><th>IP Address</th><th>Error</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="tip">
      <strong>Recommended Actions:</strong>
      <ul>
        <li>Review and consider blocking IP: <strong>${latest.ip}</strong></li>
        <li>Verify the account holder is aware</li>
        <li>Check activity logs for further suspicious behaviour</li>
      </ul>
    </div>
  </div>
  <div class="ftr">
    Automated Security Alert &bull; Vedant Asset Management &bull; ${new Date().toLocaleString('en-IN')}
  </div>
</div>
</body>
</html>`;
  }

  private buildGenericEmailHtml(event: string, severity: Severity, details: object): string {
    const colours: Record<Severity, string> = {
      LOW: '#28a745', MEDIUM: '#ffc107', HIGH: '#fd7e14', CRITICAL: '#dc3545'
    };
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body{font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;margin:0;}
    .wrap{max-width:600px;margin:auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.12);}
    .hdr{background:${colours[severity]};color:#fff;padding:24px;text-align:center;}
    .hdr h2{margin:0 0 6px;font-size:20px;}
    .body{padding:24px;font-size:13px;color:#333;}
    pre{background:#f8f9fa;padding:14px;border-radius:4px;font-size:12px;overflow:auto;}
    .ftr{background:#f8f9fa;padding:12px;text-align:center;color:#888;font-size:11px;}
  </style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <h2>${severity} — ${event}</h2>
    <p style="margin:0;font-size:12px;opacity:.85;">Vedant MF Security Operations</p>
  </div>
  <div class="body">
    <p><strong>Event:</strong> ${event}</p>
    <p><strong>Severity:</strong> ${severity}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN')}</p>
    <p><strong>Details:</strong></p>
    <pre>${JSON.stringify(details, null, 2)}</pre>
  </div>
  <div class="ftr">Automated Security Alert &bull; Vedant Asset Management</div>
</div>
</body>
</html>`;
  }
}

// Singleton export
export const securityMonitor = new SecurityMonitor();
export default securityMonitor;
