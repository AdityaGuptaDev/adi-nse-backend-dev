import { Request, Response } from 'express';
import { notificationService, NotificationLevel } from '../services/notification.service';

export class NotificationTestController {
  
  // Test email and SMS notifications
  async testNotifications(req: Request, res: Response) {
    try {
      const { severity = 'medium' } = req.query;
      
      let notificationLevel: NotificationLevel;
      switch (severity) {
        case 'critical':
          notificationLevel = NotificationLevel.CRITICAL;
          break;
        case 'high':
          notificationLevel = NotificationLevel.HIGH;
          break;
        case 'medium':
          notificationLevel = NotificationLevel.MEDIUM;
          break;
        case 'low':
          notificationLevel = NotificationLevel.LOW;
          break;
        default:
          notificationLevel = NotificationLevel.MEDIUM;
      }

      const result = await notificationService.sendSecurityNotification(
        `TEST_${Date.now()}`,
        'SIEM/SOC Notification Test',
        notificationLevel,
        `This is a test ${severity} security event notification from Vedant MF SIEM/SOC system.`,
        {
          userId: 'test_user',
          ipAddress: req.ip,
          endpoint: '/siem/test-notifications',
          riskScore: severity === 'critical' ? 95 : severity === 'high' ? 75 : 50,
          additionalData: {
            testEvent: true,
            triggeredBy: 'admin',
            timestamp: new Date().toISOString()
          }
        }
      );

      res.status(200).json({
        success: true,
        message: 'Test notifications sent successfully',
        data: {
          severity: notificationLevel,
          emailSent: result.emailSent,
          smsSent: result.smsSent,
          recipients: {
            email: notificationLevel === NotificationLevel.CRITICAL ? 'ujjwalsingh.vedant@gmail.com' : 'ujjwalsingh.vedant@gmail.com',
            sms: notificationLevel === NotificationLevel.CRITICAL ? '9304955503' : 'None (only critical events send SMS)'
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to send test notifications',
        error: error.message
      });
    }
  }

  // Test notification system health
  async testSystemHealth(req: Request, res: Response) {
    try {
      await notificationService.testNotificationSystem();
      
      res.status(200).json({
        success: true,
        message: 'Notification system test completed',
        data: {
          emailService: 'configured',
          smsService: 'configured',
          recipients: {
            critical_email: 'ujjwalsingh.vedant@gmail.com',
            critical_sms: '9304955503',
            high_email: 'ujjwalsingh.vedant@gmail.com'
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Notification system test failed',
        error: error.message
      });
    }
  }
}
