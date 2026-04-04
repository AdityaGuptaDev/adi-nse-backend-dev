/**
 * Security API Endpoints
 * Provides access to security monitoring and statistics
 */

import express, { Request, Response } from 'express';
import { siemLogger } from '../../services/simple-siem.service';
import { publicRateLimit } from "../../middlewares/rateLimit";

const router = express.Router();

// Get security statistics
router.get('/stats', publicRateLimit, async (req: Request, res: Response) => {
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
});

// Get security health status
router.get('/health', publicRateLimit, async (req: Request, res: Response) => {
  try {
    const stats = siemLogger.getSecurityStats('24h');
    const hasStats = stats !== null && typeof stats === 'object';
    const healthStatus = {
      siem: 'operational',
      logs: hasStats ? 'active' : 'inactive',
      alerts: (hasStats && (stats as any).criticalEvents > 0) ? 'active' : 'clear',
      lastEvent: 'recent',
      uptime: process.uptime()
    };

    res.json({
      success: true,
      data: healthStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check security health'
    });
  }
});

module.exports = router;
