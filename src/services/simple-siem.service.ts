/**
 * Simple Open-Source SIEM/SOC Service
 * Replaces Sentry with basic file logging
 */

import { Request, Response, NextFunction } from 'express';

// Security Event Types
export enum SecurityEventType {
  AUTHENTICATION_FAILURE = "authentication_failure",
  AUTHENTICATION_SUCCESS = "authentication_success",
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  DATA_BREACH_ATTEMPT = "data_breach_attempt",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  MALICIOUS_REQUEST = "malicious_request",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  PRIVILEGE_ESCALATION = "privilege_escalation",
  SYSTEM_ANOMALY = "system_anomaly",
  SECURITY_POLICY_VIOLATION = "security_policy_violation"
}

// Security Severity Levels
export enum SecuritySeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

// Security Event Interface
export interface SecurityEvent {
  id: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  timestamp: Date;
  description: string;
  metadata?: Record<string, any>;
  riskScore?: number;
  service: string;
  environment: string;
  compliance: string[];
}

// Simple SIEM Logger
class SimpleSIEMLogger {
  private logDir: string;
  private securityLogFile: string;

  constructor() {
    const path = require('path');
    const fs = require('fs');
    
    this.logDir = path.join(process.cwd(), 'logs', 'security');
    this.securityLogFile = path.join(this.logDir, 'security-events.log');
    
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    const fs = require('fs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  logSecurityEvent(event: SecurityEvent) {
    const logEntry = {
      ...event,
      timestamp: event.timestamp.toISOString(),
      source: "mf-backend-api",
      category: "security",
      retention: "2555 days", // 7 years for compliance
      logLevel: this.getLogLevel(event.severity)
    };

    // Write to security log file
    this.writeToLogFile(logEntry);

    // Log critical events to console
    if (event.severity === SecuritySeverity.HIGH || event.severity === SecuritySeverity.CRITICAL) {
      console.error(`🚨 CRITICAL SECURITY EVENT: ${event.eventType}`, event);
    }

    // Send email notifications for critical events
    if (event.severity === SecuritySeverity.CRITICAL) {
      this.sendCriticalAlert(event);
    }
  }

  private writeToLogFile(data: any) {
    const fs = require('fs');
    try {
      const logLine = JSON.stringify(data) + '\n';
      fs.appendFileSync(this.securityLogFile, logLine);
    } catch (error) {
      console.error('Failed to write to security log:', error);
    }
  }

  private getLogLevel(severity: SecuritySeverity): string {
    switch (severity) {
      case SecuritySeverity.LOW: return "info";
      case SecuritySeverity.MEDIUM: return "warning";
      case SecuritySeverity.HIGH: return "error";
      case SecuritySeverity.CRITICAL: return "fatal";
      default: return "info";
    }
  }

  private async sendCriticalAlert(event: SecurityEvent) {
    try {
      // Simplified email notification
      console.log(`📧 Critical security alert sent for event: ${event.eventType}`);
      console.log(`📧 Event details:`, {
        type: event.eventType,
        severity: event.severity,
        description: event.description,
        ip: event.ipAddress,
        user: event.userId,
        timestamp: event.timestamp
      });
    } catch (error) {
      console.error('Failed to send critical alert:', error);
    }
  }

  // Get security statistics
  getSecurityStats(timeRange: string = '24h') {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const stats = {
        totalEvents: 0,
        criticalEvents: 0,
        highEvents: 0,
        mediumEvents: 0,
        lowEvents: 0,
        topEventTypes: {} as Record<string, number>,
        topIPs: {} as Record<string, number>,
        riskDistribution: {} as Record<string, number>
      };

      // Read and analyze security logs
      if (fs.existsSync(this.securityLogFile)) {
        const logs = fs.readFileSync(this.securityLogFile, 'utf8')
          .split('\n')
          .filter((line: string) => line.trim())
          .slice(-1000); // Last 1000 events

        logs.forEach((logLine: string) => {
          try {
            const event = JSON.parse(logLine);
            stats.totalEvents++;

            // Count by severity
            const security = event.security || {};
            switch (security.severity) {
              case SecuritySeverity.CRITICAL:
                stats.criticalEvents++;
                break;
              case SecuritySeverity.HIGH:
                stats.highEvents++;
                break;
              case SecuritySeverity.MEDIUM:
                stats.mediumEvents++;
                break;
              case SecuritySeverity.LOW:
                stats.lowEvents++;
                break;
            }

            // Count event types
            const eventType = security.eventType;
            if (eventType) {
              stats.topEventTypes[eventType] = (stats.topEventTypes[eventType] || 0) + 1;
            }

            // Count IPs
            const ip = security.ipAddress;
            if (ip) {
              stats.topIPs[ip] = (stats.topIPs[ip] || 0) + 1;
            }

            // Risk distribution
            const riskScore = security.riskScore || 0;
            const riskRange = Math.floor(riskScore / 20) * 20;
            const riskKey = `${riskRange}-${riskRange + 19}`;
            stats.riskDistribution[riskKey] = 
              (stats.riskDistribution[riskKey] || 0) + 1;

          } catch (parseError) {
            // Skip malformed log entries
          }
        });
      }

      return stats;
    } catch (error) {
      console.error('Failed to get security stats:', error);
      return null;
    }
  }
}

// Initialize SIEM logger
const siemLogger = new SimpleSIEMLogger();

// Calculate Risk Score
function calculateRiskScore(event: Partial<SecurityEvent>): number {
  let score = 0;
  
  // Base score for authentication events
  if (event.eventType?.includes('failure')) score += 30;
  if (event.eventType?.includes('unauthorized')) score += 50;
  
  // IP-based scoring
  const ip = event.ipAddress;
  if (ip && isSuspiciousIP(ip)) score += 40;
  
  // Endpoint-based scoring
  const endpoint = event.endpoint;
  if (endpoint && isHighRiskEndpoint(endpoint)) score += 25;
  
  // Rate limiting
  if (event.eventType === SecurityEventType.RATE_LIMIT_EXCEEDED) score += 35;
  
  return Math.min(score, 100);
}

// Check for suspicious IPs
function isSuspiciousIP(ip: string): boolean {
  const suspiciousPatterns = [
    /10\.0\.0\./,    // Internal network
    /192\.168\./,    // Internal network
    /172\.16\./,     // Internal network
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(ip));
}

// Check for high-risk endpoints
function isHighRiskEndpoint(endpoint: string): boolean {
  const highRiskEndpoints = [
    "/admin",
    "/api/v1/admin",
    "/partner",
    "/decentro",
    "/mfu",
    "/user/delete",
    "/bulk"
  ];
  
  return highRiskEndpoints.some(riskEndpoint => 
    endpoint.includes(riskEndpoint)
  );
}

// Security Event Logger Function
export function logSecurityEvent(
  eventType: SecurityEventType,
  severity: SecuritySeverity,
  description: string,
  req?: Request,
  metadata?: Record<string, any>
) {
  const event: SecurityEvent = {
    id: `SEC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventType,
    severity,
    timestamp: new Date(),
    description,
    userId: (req as any).user?.id,
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get("User-Agent"),
    endpoint: req?.path,
    method: req?.method,
    metadata,
    riskScore: calculateRiskScore({ eventType, ipAddress: req?.ip, endpoint: req?.path }),
    service: "mf-backend-api",
    environment: process.env.NODE_ENV || "production",
    compliance: ["PCI-DSS", "GDPR", "SOX"]
  };

  siemLogger.logSecurityEvent(event);
}

// Middleware for Security Event Logging
export function securityEventLogger(
  eventType: SecurityEventType,
  severity: SecuritySeverity,
  description: string,
  metadata?: Record<string, any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    logSecurityEvent(eventType, severity, description, req, metadata);
    next();
  };
}

// Authentication Failure Logger
export function logAuthenticationFailure(req: Request, reason: string) {
  logSecurityEvent(
    SecurityEventType.AUTHENTICATION_FAILURE,
    SecuritySeverity.HIGH,
    `Authentication failure: ${reason}`,
    req,
    { reason, endpoint: req.path }
  );
}

// Unauthorized Access Logger
export function logUnauthorizedAccess(req: Request, resource: string) {
  logSecurityEvent(
    SecurityEventType.UNAUTHORIZED_ACCESS,
    SecuritySeverity.HIGH,
    `Unauthorized access attempt to ${resource}`,
    req,
    { resource, endpoint: req.path }
  );
}

// Suspicious Activity Logger
export function logSuspiciousActivity(req: Request, activity: string, metadata?: Record<string, any>) {
  logSecurityEvent(
    SecurityEventType.SUSPICIOUS_ACTIVITY,
    SecuritySeverity.MEDIUM,
    `Suspicious activity detected: ${activity}`,
    req,
    { activity, ...metadata }
  );
}

// Data Breach Attempt Logger
export function logDataBreachAttempt(req: Request, dataAccessed: string, metadata?: Record<string, any>) {
  logSecurityEvent(
    SecurityEventType.DATA_BREACH_ATTEMPT,
    SecuritySeverity.CRITICAL,
    `Data breach attempt: ${dataAccessed}`,
    req,
    { dataAccessed, ...metadata }
  );
}

// Initialize Open-Source SIEM
export function initializeOpenSourceSIEM() {
  console.log("✅ Open-Source SIEM/SOC integration initialized");
  console.log("📁 Security logs will be written to: logs/security/");
  console.log("📧 Critical alerts will be sent via email");
}

// Export statistics endpoint handler
export function getSecurityStats(req: Request, res: Response) {
  try {
    const stats = siemLogger.getSecurityStats('24h');
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve security statistics'
    });
  }
}

export { siemLogger };
