import ErrorLogger from '../db/core/logger/error-logger';
import SmsEmailLogger from '../db/core/logger/sms-email-logger';
import { sendEmail } from './mailService';
import configs from '../config/config';
import environment from '../environment';

const config = (configs as { [key: string]: any })[environment];

interface FailedLoginAttempt {
  identifier: string; // email or mobile
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  error: string;
}

class FailedLoginTracker {
  private attempts: Map<string, FailedLoginAttempt[]> = new Map();
  private readonly MAX_ATTEMPTS = 5; // Maximum failed attempts before notification
  private readonly TIME_WINDOW = 15 * 60 * 1000; // 15 minutes window
  private readonly NOTIFICATION_EMAIL = config.adminEmail || 'admin@vedantmf.com';

  /**
   * Track a failed login attempt
   */
  trackFailedAttempt(identifier: string, ipAddress: string, userAgent: string, error: string) {
    const attempt: FailedLoginAttempt = {
      identifier,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      error
    };

    // Get existing attempts for this identifier
    const existingAttempts = this.attempts.get(identifier) || [];
    
    // Add new attempt
    existingAttempts.push(attempt);
    
    // Clean old attempts (outside time window)
    const now = new Date();
    const validAttempts = existingAttempts.filter(
      a => now.getTime() - a.timestamp.getTime() < this.TIME_WINDOW
    );
    
    this.attempts.set(identifier, validAttempts);

    // Log the failed attempt
    ErrorLogger.write({
      type: 'failed_login_attempt',
      identifier,
      ipAddress,
      userAgent,
      error,
      attemptCount: validAttempts.length,
      timestamp: attempt.timestamp.toISOString()
    });

    // Check if threshold is reached
    if (validAttempts.length >= this.MAX_ATTEMPTS) {
      this.sendSecurityAlert(identifier, validAttempts);
    }

    console.log(`[FailedLoginTracker] Failed login attempt ${validAttempts.length}/${this.MAX_ATTEMPTS} for ${identifier}`);
  }

  /**
   * Send security alert email
   */
  private async sendSecurityAlert(identifier: string, attempts: FailedLoginAttempt[]) {
    try {
      const subject = `SECURITY ALERT: Multiple Failed Login Attempts for ${identifier}`;
      
      const htmlContent = this.generateSecurityEmail(identifier, attempts);
      
      const mailData = {
        from: config.SENDER_EMAIL_ID || 'security@vedantmf.com',
        to: this.NOTIFICATION_EMAIL,
        toName: 'Security Team',
        subject: subject,
        text: `Multiple failed login attempts detected for ${identifier}. Please review the attached details.`,
        replacements: {},
        htmlFile: '',
        attachments: [],
        html: htmlContent,
        cc: '',
        replyTo: ''
      };

      await sendEmail(mailData);
      
      // Log the notification
      SmsEmailLogger.logEmail(this.NOTIFICATION_EMAIL, subject, true);
      
      console.log(`[FailedLoginTracker] Security alert sent to ${this.NOTIFICATION_EMAIL}`);
      
      // Also log to error logger for audit trail
      ErrorLogger.write({
        type: 'security_alert_sent',
        identifier,
        attemptCount: attempts.length,
        notificationSent: this.NOTIFICATION_EMAIL,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('[FailedLoginTracker] Failed to send security alert:', error.message);
      
      // Log failed notification
      SmsEmailLogger.logEmail(this.NOTIFICATION_EMAIL, 'Security Alert', false, error.message);
      
      ErrorLogger.write({
        type: 'security_alert_failed',
        identifier,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Generate security alert email content
   */
  private generateSecurityEmail(identifier: string, attempts: FailedLoginAttempt[]): string {
    const latestAttempt = attempts[attempts.length - 1];
    const timeWindow = this.TIME_WINDOW / (60 * 1000); // Convert to minutes
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #721c24;">🚨 SECURITY ALERT</h2>
          <p style="margin: 5px 0;">Multiple failed login attempts detected</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #dee2e6;">
          <h3 style="color: #495057; margin-top: 0;">Attack Details</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold; width: 150px;">Target:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${identifier}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Total Attempts:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; color: #dc3545; font-weight: bold;">${attempts.length}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Time Window:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">Last ${timeWindow} minutes</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Latest Attempt:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${latestAttempt.timestamp.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">IP Address:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${latestAttempt.ipAddress}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">User Agent:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-size: 12px;">${latestAttempt.userAgent}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Last Error:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; color: #dc3545;">${latestAttempt.error}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
          <h4 style="color: #856404; margin-top: 0;">⚠️ Recommended Actions:</h4>
          <ul style="color: #856404; margin: 10px 0; padding-left: 20px;">
            <li>Review the IP address for suspicious activity</li>
            <li>Consider blocking the IP if attempts continue</li>
            <li>Contact the user if this seems unusual</li>
            <li>Monitor account activity closely</li>
          </ul>
        </div>
        
        <div style="margin-top: 20px; padding: 10px; text-align: center; color: #6c757d; font-size: 12px;">
          <p>This is an automated security alert from Vedant Asset Management System.</p>
          <p>Generated at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
  }

  /**
   * Clear failed attempts for a user (after successful login)
   */
  clearAttempts(identifier: string) {
    this.attempts.delete(identifier);
    console.log(`[FailedLoginTracker] Cleared failed attempts for ${identifier}`);
  }

  /**
   * Get current attempt count for a user
   */
  getAttemptCount(identifier: string): number {
    const attempts = this.attempts.get(identifier) || [];
    const now = new Date();
    const validAttempts = attempts.filter(
      a => now.getTime() - a.timestamp.getTime() < this.TIME_WINDOW
    );
    return validAttempts.length;
  }
}

// Export singleton instance
export const failedLoginTracker = new FailedLoginTracker();
export default failedLoginTracker;
