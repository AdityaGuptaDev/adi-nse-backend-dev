import ErrorLogger from '../db/core/logger/error-logger';
import InfoLogger from '../db/core/logger/info-logger';
import SmsEmailLogger from '../db/core/logger/sms-email-logger';
import { sendEmail } from './mailService';
import { SmsService } from './sms.service';
import configs from '../config/config';
import environment from '../environment';

const config = (configs as { [key: string]: any })[environment];

// Security Event Types
export enum SecurityEventType {
  FAILED_LOGIN = 'failed_login',
  BRUTE_FORCE_ATTACK = 'brute_force_attack',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  MULTIPLE_FAILED_LOGINS = 'multiple_failed_logins',
  ACCOUNT_LOCKOUT = 'account_lockout',
  SECURITY_ALERT = 'security_alert',
  EMAIL_SENT = 'email_sent',
  SMS_SENT = 'sms_sent',
  SYSTEM_ERROR = 'system_error'
}

// Security Severity Levels
export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Security Event Interface
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: Date;
  source: {
    ipAddress: string;
    userAgent: string;
    userId?: string;
    identifier: string;
  };
  details: {
    description: string;
    attemptCount?: number;
    timeWindow?: number;
    previousAttempts?: any[];
    errorCode?: string;
    errorMessage?: string;
  };
  actions: {
    emailSent: boolean;
    smsSent: boolean;
    accountLocked: boolean;
    alertTriggered: boolean;
  };
  metadata: {
    sessionId?: string;
    requestId?: string;
    correlationId?: string;
    environment: string;
  };
}

class SIEMService {
  private events: SecurityEvent[] = [];
  private readonly MAX_EVENTS = 1000;
  private readonly EVENT_RETENTION_HOURS = 24;
  private readonly FAILED_LOGIN_THRESHOLD = 5;
  private readonly TIME_WINDOW_MINUTES = 15;
  private readonly BRUTE_FORCE_THRESHOLD = 10;
  private readonly SECURITY_EMAIL = config.adminEmail || 'ujjwalsingh.vedant@gmail.com';
  private readonly SECURITY_SMS = config.securitySms || '9304955503';

  /**
   * Create a new security event
   */
  createEvent(
    type: SecurityEventType,
    severity: SecuritySeverity,
    source: SecurityEvent['source'],
    details: SecurityEvent['details'],
    actions?: Partial<SecurityEvent['actions']>
  ): SecurityEvent {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type,
      severity,
      timestamp: new Date(),
      source,
      details,
      actions: {
        emailSent: false,
        smsSent: false,
        accountLocked: false,
        alertTriggered: false,
        ...actions
      },
      metadata: {
        environment: environment,
        correlationId: this.generateCorrelationId()
      }
    };

    this.addEvent(event);
    return event;
  }

  /**
   * Track failed login attempt with SIEM integration
   */
  trackFailedLogin(
    identifier: string,
    ipAddress: string,
    userAgent: string,
    error: string,
    existingEvents?: SecurityEvent[]
  ): SecurityEvent {
    console.log(`[SIEM] Tracking failed login for ${identifier} from ${ipAddress}`);

    const recentEvents = this.getRecentEvents(identifier, SecurityEventType.FAILED_LOGIN);
    const attemptCount = recentEvents.length + 1;

    let severity: SecuritySeverity = SecuritySeverity.LOW;
    if (attemptCount >= this.FAILED_LOGIN_THRESHOLD) {
      severity = SecuritySeverity.HIGH;
    }
    if (attemptCount >= this.BRUTE_FORCE_THRESHOLD) {
      severity = SecuritySeverity.CRITICAL;
    }

    const event = this.createEvent(
      SecurityEventType.FAILED_LOGIN,
      severity,
      { ipAddress, userAgent, identifier },
      {
        description: `Failed login attempt: ${error}`,
        attemptCount,
        timeWindow: this.TIME_WINDOW_MINUTES,
        previousAttempts: recentEvents,
        errorMessage: error
      }
    );

    // Trigger security actions asynchronously
    this.triggerSecurityActionsAsync(identifier, recentEvents, event);

    return event;
  }

  /**
   * Trigger security actions (async wrapper)
   */
  private async triggerSecurityActionsAsync(
    identifier: string,
    previousEvents: SecurityEvent[],
    currentEvent: SecurityEvent
  ): Promise<void> {
    console.log(`[SIEM] Triggering security actions for ${identifier}`);

    try {
      // Send email alert
      await this.sendSecurityEmail(identifier, previousEvents, currentEvent);
      currentEvent.actions.emailSent = true;

      // Send SMS alert
      await this.sendSecuritySms(identifier, previousEvents, currentEvent);
      currentEvent.actions.smsSent = true;

      // Mark alert as triggered
      currentEvent.actions.alertTriggered = true;

      // Consider account lockout for critical cases
      if (currentEvent.severity === SecuritySeverity.CRITICAL) {
        currentEvent.actions.accountLocked = true;
        await this.lockAccount(identifier);
      }

      console.log(`[SIEM] Security actions completed for ${identifier}`);

    } catch (error: any) {
      console.error(`[SIEM] Failed to trigger security actions: ${error.message}`);
      
      ErrorLogger.write({
        type: 'siem_action_failure',
        identifier,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Generate security email HTML content
   */
  private generateSecurityEmail(
    identifier: string,
    previousEvents: SecurityEvent[],
    currentEvent: SecurityEvent
  ): string {
    const severityColors = {
      [SecuritySeverity.LOW]: '#28a745',
      [SecuritySeverity.MEDIUM]: '#ffc107',
      [SecuritySeverity.HIGH]: '#dc3545',
      [SecuritySeverity.CRITICAL]: '#721c24'
    };

    const severityColor = severityColors[currentEvent.severity] || '#6c757d';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🚨 Security Alert - ${identifier}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
          .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
          .alert-box { background: ${severityColor}; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .details-table th { background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: bold; }
          .details-table td { padding: 12px; border-bottom: 1px solid #dee2e6; }
          .timeline { margin: 20px 0; }
          .timeline-item { border-left: 3px solid ${severityColor}; padding-left: 20px; margin-bottom: 15px; }
          .timeline-time { font-size: 12px; color: #6c757d; font-weight: bold; }
          .timeline-content { margin-bottom: 5px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 12px; }
          .severity-badge { display: inline-block; padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 SECURITY ALERT</h1>
            <p style="margin: 0; font-size: 18px;">Vedant Asset Management System</p>
            <div class="severity-badge" style="background: ${severityColor};">
              ${currentEvent.severity.toUpperCase()}
            </div>
          </div>

          <div class="alert-box">
            <h3 style="margin: 0 0 10px 0;">🔍 Security Event Detected</h3>
            <p><strong>Type:</strong> ${currentEvent.type.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Target:</strong> ${identifier}</p>
            <p><strong>Severity:</strong> <span class="severity-badge" style="background: ${severityColor};">${currentEvent.severity.toUpperCase()}</span></p>
            <p><strong>Time:</strong> ${currentEvent.timestamp.toLocaleString()}</p>
            <p><strong>Description:</strong> ${currentEvent.details.description}</p>
            <p><strong>Source IP:</strong> ${currentEvent.source.ipAddress}</p>
            <p><strong>Attempts:</strong> ${currentEvent.details.attemptCount} in ${currentEvent.details.timeWindow} minutes</p>
          </div>

          <div class="timeline">
            <h3>📅 Recent Activity Timeline</h3>
            ${previousEvents.map((event, index) => `
              <div class="timeline-item">
                <div class="timeline-time">${event.timestamp.toLocaleString()}</div>
                <div class="timeline-content">
                  <strong>Failed Login Attempt ${index + 1}</strong><br>
                  ${event.details.errorMessage}<br>
                  <small>IP: ${event.source.ipAddress} | Agent: ${event.source.userAgent.substring(0, 50)}...</small>
                </div>
              </div>
            `).join('')}
          </div>

          <table class="details-table">
            <tr>
              <th colspan="2">🔧 Recommended Actions</th>
            </tr>
            <tr>
              <td width="50%">📧 Email Notification</td>
              <td>${currentEvent.actions.emailSent ? '✅ Sent' : '❌ Failed'}</td>
            </tr>
            <tr>
              <td>📱 SMS Notification</td>
              <td>${currentEvent.actions.smsSent ? '✅ Sent' : '❌ Failed'}</td>
            </tr>
            <tr>
              <td>🔒 Account Status</td>
              <td>${currentEvent.actions.accountLocked ? '🔒 Locked' : '🔓 Active'}</td>
            </tr>
            <tr>
              <td>🌐 Investigation Required</td>
              <td style="color: ${severityColor}; font-weight: bold;">
                ${currentEvent.severity === SecuritySeverity.CRITICAL || currentEvent.severity === SecuritySeverity.HIGH ? 'IMMEDIATE' : 'Recommended'}
              </td>
            </tr>
          </table>

          <div class="footer">
            <p><strong>🔐 Security Information:</strong></p>
            <p>Event ID: ${currentEvent.id}</p>
            <p>Correlation ID: ${currentEvent.metadata.correlationId}</p>
            <p>Environment: ${currentEvent.metadata.environment}</p>
            <p>This is an automated security alert from Vedant Asset Management System.</p>
            <p>Generated at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send comprehensive security email
   */
  private async sendSecurityEmail(
    identifier: string,
    previousEvents: SecurityEvent[],
    currentEvent: SecurityEvent
  ): Promise<void> {
    try {
      const subject = `🚨 SECURITY ALERT: ${currentEvent.severity.toUpperCase()} - ${identifier}`;
      
      const htmlContent = this.generateSecurityEmail(identifier, previousEvents, currentEvent);
      
      const mailData = {
        from: config.SENDER_EMAIL_ID || 'no-reply@vedantasset.in',
        to: this.SECURITY_EMAIL,
        toName: 'Security Team',
        subject: subject,
        text: `Security alert: ${currentEvent.severity} - ${identifier}`,
        replacements: {},
        htmlFile: '',
        attachments: [],
        html: htmlContent,
        cc: '',
        replyTo: ''
      };

      await sendEmail(mailData);
      
      SmsEmailLogger.logEmail(this.SECURITY_EMAIL, subject, true);
      
      console.log(`[SIEM] Security email sent to ${this.SECURITY_EMAIL}`);

    } catch (error: any) {
      console.error(`[SIEM] Failed to send security email: ${error.message}`);
      
      SmsEmailLogger.logEmail(this.SECURITY_EMAIL, 'Security Alert', false, error.message);
      
      ErrorLogger.write({
        type: 'security_email_failed',
        identifier,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Send security SMS
   */
  private async sendSecuritySms(
    identifier: string,
    previousEvents: SecurityEvent[],
    currentEvent: SecurityEvent
  ): Promise<void> {
    try {
      const message = `SECURITY ALERT: ${currentEvent.severity.toUpperCase()} detected for ${identifier}. Please check your email immediately.`;
      
      await SmsService.sendSmsUsingNimbus(this.SECURITY_SMS, message);
      
      SmsEmailLogger.logSms(this.SECURITY_SMS, message, true);
      
      console.log(`[SIEM] Security SMS sent to ${this.SECURITY_SMS}`);

    } catch (error: any) {
      console.error(`[SIEM] Failed to send security SMS: ${error.message}`);
      
      SmsEmailLogger.logSms(this.SECURITY_SMS, 'Security Alert', false, error.message);
      
      ErrorLogger.write({
        type: 'security_sms_failed',
        identifier,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Lock user account (implementation needed)
   */
  private async lockAccount(identifier: string): Promise<void> {
    console.log(`[SIEM] Account lockout triggered for ${identifier}`);
    
    ErrorLogger.write({
      type: 'account_locked',
      identifier,
      timestamp: new Date().toISOString(),
      details: {
        reason: 'Multiple failed login attempts',
        duration: '1 hour',
        autoUnlock: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    });
  }

  /**
   * Get recent events for a user
   */
  private getRecentEvents(identifier: string, eventType: SecurityEventType): SecurityEvent[] {
    const cutoffTime = new Date(Date.now() - this.EVENT_RETENTION_HOURS * 60 * 60 * 1000);
    
    return this.events
      .filter(event => 
        event.source.identifier === identifier && 
        event.type === eventType &&
        event.timestamp > cutoffTime
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Add event to storage
   */
  private addEvent(event: SecurityEvent): void {
    this.events.push(event);
    
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    ErrorLogger.write({
      type: 'security_event',
      eventId: event.id,
      eventType: event.type,
      severity: event.severity,
      identifier: event.source.identifier,
      ipAddress: event.source.ipAddress,
      details: event.details,
      timestamp: event.timestamp.toISOString()
    });

    InfoLogger.write({
      type: 'siem_event',
      eventId: event.id,
      severity: event.severity,
      description: event.details.description,
      timestamp: event.timestamp.toISOString()
    });
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Clear events for a user (after successful login)
   */
  clearUserEvents(identifier: string): void {
    const beforeCount = this.events.length;
    this.events = this.events.filter(event => event.source.identifier !== identifier);
    
    console.log(`[SIEM] Cleared ${beforeCount - this.events.length} events for ${identifier}`);
    
    InfoLogger.write({
      type: 'user_events_cleared',
      identifier,
      eventsCleared: beforeCount - this.events.length,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): any {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(event => event.timestamp > last24Hours);
    
    const stats = {
      totalEvents: recentEvents.length,
      failedLogins: recentEvents.filter(e => e.type === SecurityEventType.FAILED_LOGIN).length,
      bruteForceAttempts: recentEvents.filter(e => e.type === SecurityEventType.BRUTE_FORCE_ATTACK).length,
      securityAlerts: recentEvents.filter(e => e.type === SecurityEventType.SECURITY_ALERT).length,
      emailsSent: recentEvents.filter(e => e.actions.emailSent).length,
      smsSent: recentEvents.filter(e => e.actions.smsSent).length,
      accountsLocked: recentEvents.filter(e => e.actions.accountLocked).length,
      severityBreakdown: {
        low: recentEvents.filter(e => e.severity === SecuritySeverity.LOW).length,
        medium: recentEvents.filter(e => e.severity === SecuritySeverity.MEDIUM).length,
        high: recentEvents.filter(e => e.severity === SecuritySeverity.HIGH).length,
        critical: recentEvents.filter(e => e.severity === SecuritySeverity.CRITICAL).length
      }
    };

    console.log(`[SIEM] Security stats:`, stats);
    return stats;
  }

  /**
   * Run security commands
   */
  async runSecurityCommand(command: string, params: any = {}): Promise<any> {
    console.log(`[SIEM] Running security command: ${command}`, params);
    
    try {
      switch (command) {
        case 'stats':
          return this.getSecurityStats();
          
        case 'events':
          return this.events.slice(-50);
          
        case 'user-events':
          return this.getRecentEvents(params.identifier, SecurityEventType.FAILED_LOGIN);
          
        case 'clear-user':
          this.clearUserEvents(params.identifier);
          return { success: true, message: `Events cleared for ${params.identifier}` };
          
        case 'test-email':
          await this.testEmailNotifications(params.testEmail);
          return { success: true, message: 'Test email sent' };
          
        case 'test-sms':
          await this.testSmsNotifications(params.testPhone);
          return { success: true, message: 'Test SMS sent' };
          
        default:
          throw new Error(`Unknown security command: ${command}`);
      }
    } catch (error: any) {
      console.error(`[SIEM] Command ${command} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Test email notifications
   */
  private async testEmailNotifications(testEmail: string): Promise<void> {
    const testEvent: SecurityEvent = {
      id: this.generateEventId(),
      type: SecurityEventType.SECURITY_ALERT,
      severity: SecuritySeverity.MEDIUM,
      timestamp: new Date(),
      source: {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        identifier: testEmail
      },
      details: {
        description: 'Test security alert from SIEM system',
        attemptCount: 1
      },
      actions: {
        emailSent: false,
        smsSent: false,
        accountLocked: false,
        alertTriggered: false
      },
      metadata: {
        environment: environment,
        correlationId: this.generateCorrelationId()
      }
    };

    await this.sendSecurityEmail(testEmail, [], testEvent);
    testEvent.actions.emailSent = true;
  }

  /**
   * Test SMS notifications
   */
  private async testSmsNotifications(testPhone: string): Promise<void> {
    const message = `TEST: Security alert from SIEM system for ${testPhone}`;
    await SmsService.sendSmsConsole(testPhone, message);
  }
}

// Export singleton instance
export const siemService = new SIEMService();
export default siemService;
