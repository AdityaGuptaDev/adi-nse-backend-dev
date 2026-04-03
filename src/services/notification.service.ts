import nodemailer from 'nodemailer';
import axios from 'axios';

// Notification Configuration
interface NotificationConfig {
  email: {
    enabled: boolean;
    fromName: string;
    fromEmail: string;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    recipients: {
      critical: string[];
      high: string[];
    };
  };
  sms: {
    enabled: boolean;
    provider: string;
    apiKey: string;
    recipients: {
      critical: string[];
      high: string[];
    };
  };
}

// Security Event Notification Levels
export enum NotificationLevel {
  LOW = "low",
  MEDIUM = "medium", 
  HIGH = "high",
  CRITICAL = "critical",
  HIGHLY_CRITICAL = "highly_critical"
}

// Security Event Notification Interface
export interface SecurityNotification {
  event: {
    id: string;
    type: string;
    severity: NotificationLevel;
    timestamp: Date;
    description: string;
    userId?: string;
    ipAddress?: string;
    endpoint?: string;
    riskScore?: number;
    metadata?: Record<string, any>;
  };
  recipients: {
    emails: string[];
    phoneNumbers: string[];
  };
}

class NotificationService {
  private config: NotificationConfig;
  private emailTransporter!: nodemailer.Transporter;

  constructor() {
    this.config = this.loadConfig();
    this.initializeEmailTransporter();
  }

  private loadConfig(): NotificationConfig {
    return {
      email: {
        enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === "true",
        fromName: process.env.SMTP_FROM_NAME || "Vedant MF Security",
        fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "",
        smtp: {
          host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: false,
          auth: {
            user: process.env.SMTP_USER || "90f215001@smtp-brevo.com",
            pass: process.env.SMTP_PASS || "tNYhXmFDREvJSKU8"
          }
        },
        recipients: {
          critical: [process.env.CRITICAL_EMAIL_RECIPIENT || "ujjwalsingh.vedant@gmail.com"],
          high: [process.env.HIGH_EMAIL_RECIPIENT || "ujjwalsingh.vedant@gmail.com"]
        }
      },
      sms: {
        enabled: process.env.SMS_NOTIFICATIONS_ENABLED === "true",
        provider: process.env.SMS_PROVIDER || "fast2sms",
        apiKey: process.env.SMS_API_KEY || "",
        recipients: {
          critical: [process.env.CRITICAL_SMS_RECIPIENT || "9304955503"],
          high: [] // Only critical events send SMS as per specification
        }
      }
    };
  }

  private initializeEmailTransporter() {
    this.emailTransporter = nodemailer.createTransport({
      host: this.config.email.smtp.host,
      port: this.config.email.smtp.port,
      secure: this.config.email.smtp.secure,
      auth: this.config.email.smtp.auth
    });
  }

  // Determine notification recipients based on severity
  private getRecipients(severity: NotificationLevel) {
    const emails: string[] = [];
    const phoneNumbers: string[] = [];

    // Email recipients
    if (severity === NotificationLevel.CRITICAL || severity === NotificationLevel.HIGHLY_CRITICAL) {
      emails.push(...this.config.email.recipients.critical);
    } else if (severity === NotificationLevel.HIGH) {
      emails.push(...this.config.email.recipients.high);
    }

    // SMS recipients (only for critical and highly critical as per specification)
    if (severity === NotificationLevel.CRITICAL || severity === NotificationLevel.HIGHLY_CRITICAL) {
      phoneNumbers.push(...this.config.sms.recipients.critical);
    }

    return { emails, phoneNumbers };
  }

  // Send email notification
  private async sendEmail(notification: SecurityNotification): Promise<boolean> {
    try {
      if (!this.config.email.enabled || notification.recipients.emails.length === 0) {
        return false;
      }

      const emailSubject = `🚨 SECURITY ALERT: ${notification.event.severity.toUpperCase()} - ${notification.event.type}`;
      const emailHtml = this.generateEmailTemplate(notification);

      const mailOptions = {
        from: `"${this.config.email.fromName}" <${this.config.email.fromEmail}>`,
        to: notification.recipients.emails.join(', '),
        subject: emailSubject,
        html: emailHtml,
        priority: notification.event.severity === NotificationLevel.HIGHLY_CRITICAL ? 'high' as const : 'normal' as const
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`✅ Email notification sent for ${notification.event.severity} event: ${notification.event.type}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to send email notification:`, error);
      return false;
    }
  }

  // Send SMS notification
  private async sendSMS(notification: SecurityNotification): Promise<boolean> {
    try {
      if (!this.config.sms.enabled || notification.recipients.phoneNumbers.length === 0) {
        return false;
      }

      const smsMessage = this.generateSMSMessage(notification);

      // Using Fast2SMS API (you can replace with your preferred SMS provider)
      const smsData = {
        route: 'dlt',
        numbers: notification.recipients.phoneNumbers.join(',')
      };

      const response = await axios.post('https://www.fast2sms.com/dev/bulk', smsData, {
        headers: {
          'authorization': this.config.sms.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.return === true) {
        console.log(`✅ SMS notification sent for ${notification.event.severity} event: ${notification.event.type}`);
        return true;
      } else {
        console.error(`❌ SMS notification failed:`, response.data);
        return false;
      }

    } catch (error) {
      console.error(`❌ Failed to send SMS notification:`, error);
      return false;
    }
  }

  // Generate email HTML template
  private generateEmailTemplate(notification: SecurityNotification): string {
    const severityColor = this.getSeverityColor(notification.event.severity);
    const severityIcon = this.getSeverityIcon(notification.event.severity);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert - Vedant MF</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .alert-icon { font-size: 48px; margin-bottom: 10px; }
        .content { padding: 30px 20px; }
        .severity-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: 600; margin-bottom: 20px; background-color: ${severityColor}; }
        .event-details { background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #e9ecef; padding-bottom: 10px; }
        .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .detail-label { font-weight: 600; color: #495057; }
        .detail-value { color: #212529; text-align: right; }
        .risk-score { font-size: 24px; font-weight: bold; color: ${severityColor}; text-align: center; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        .action-button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .timestamp { color: #6c757d; font-size: 14px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="alert-icon">${severityIcon}</div>
            <h1>SECURITY ALERT</h1>
            <div class="severity-badge">${notification.event.severity.toUpperCase()}</div>
        </div>
        
        <div class="content">
            <h2>${notification.event.type}</h2>
            <p style="font-size: 16px; color: #495057; margin-bottom: 20px;">${notification.event.description}</p>
            
            <div class="risk-score">
                Risk Score: ${notification.event.riskScore || 'N/A'}/100
            </div>
            
            <div class="event-details">
                <div class="detail-row">
                    <span class="detail-label">Event ID:</span>
                    <span class="detail-value">${notification.event.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Timestamp:</span>
                    <span class="detail-value">${notification.event.timestamp.toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">IP Address:</span>
                    <span class="detail-value">${notification.event.ipAddress || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Endpoint:</span>
                    <span class="detail-value">${notification.event.endpoint || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">User ID:</span>
                    <span class="detail-value">${notification.event.userId || 'N/A'}</span>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="https://your-dashboard-url.com/siem" class="action-button">View in SIEM Dashboard</a>
            </div>
            
            <div class="timestamp">
                This is an automated security alert from Vedant MF Security Operations Center
            </div>
        </div>
        
        <div class="footer">
            <p>© 2026 Vedant Asset Management. All rights reserved.</p>
            <p>This is a confidential security communication. Do not forward or share.</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Generate SMS message
  private generateSMSMessage(notification: SecurityNotification): string {
    return `🚨 VEDANT MF SECURITY ALERT
Type: ${notification.event.type}
Severity: ${notification.event.severity.toUpperCase()}
Time: ${notification.event.timestamp.toLocaleString()}
IP: ${notification.event.ipAddress || 'N/A'}
Risk Score: ${notification.event.riskScore || 'N/A'}
Immediate action required. Check SIEM dashboard.`;
  }

  // Get severity color for styling
  private getSeverityColor(severity: NotificationLevel): string {
    switch (severity) {
      case NotificationLevel.HIGHLY_CRITICAL: return '#dc3545';
      case NotificationLevel.CRITICAL: return '#fd7e14';
      case NotificationLevel.HIGH: return '#ffc107';
      case NotificationLevel.MEDIUM: return '#17a2b8';
      case NotificationLevel.LOW: return '#28a745';
      default: return '#6c757d';
    }
  }

  // Get severity icon
  private getSeverityIcon(severity: NotificationLevel): string {
    switch (severity) {
      case NotificationLevel.HIGHLY_CRITICAL: return '🔴';
      case NotificationLevel.CRITICAL: return '🟠';
      case NotificationLevel.HIGH: return '🟡';
      case NotificationLevel.MEDIUM: return '🔵';
      case NotificationLevel.LOW: return '🟢';
      default: return '⚪';
    }
  }

  // Main notification method
  public async sendSecurityNotification(
    eventId: string,
    eventType: string,
    severity: NotificationLevel,
    description: string,
    metadata?: {
      userId?: string;
      ipAddress?: string;
      endpoint?: string;
      riskScore?: number;
      additionalData?: Record<string, any>;
    }
  ): Promise<{ emailSent: boolean; smsSent: boolean }> {
    
    const recipients = this.getRecipients(severity);
    
    const notification: SecurityNotification = {
      event: {
        id: eventId,
        type: eventType,
        severity,
        timestamp: new Date(),
        description,
        userId: metadata?.userId,
        ipAddress: metadata?.ipAddress,
        endpoint: metadata?.endpoint,
        riskScore: metadata?.riskScore,
        metadata: metadata?.additionalData
      },
      recipients
    };

    // Send notifications in parallel
    const [emailSent, smsSent] = await Promise.all([
      this.sendEmail(notification),
      this.sendSMS(notification)
    ]);

    return { emailSent, smsSent };
  }

  // Test notification system
  public async testNotificationSystem(): Promise<void> {
    console.log('🧪 Testing notification system...');
    
    const testResult = await this.sendSecurityNotification(
      'TEST_001',
      'System Test',
      NotificationLevel.MEDIUM,
      'This is a test notification from the SIEM/SOC system',
      {
        userId: 'test_user',
        ipAddress: '127.0.0.1',
        endpoint: '/test',
        riskScore: 25
      }
    );

    console.log(`📧 Email test: ${testResult.emailSent ? 'SUCCESS' : 'FAILED'}`);
    console.log(`📱 SMS test: ${testResult.smsSent ? 'SUCCESS' : 'FAILED'}`);
  }
}

// Singleton instance
export const notificationService = new NotificationService();
export default notificationService;
