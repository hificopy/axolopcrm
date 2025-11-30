import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import demoDataService from '../services/demoDataService.js';

const router = express.Router();

/**
 * POST /api/demo-data/seed
 * Seed demo data for the authenticated user
 */
router.post('/seed', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user already has placeholder data
    const hasData = await demoDataService.hasPlaceholderData(userId);

    if (hasData) {
      return res.status(400).json({
        success: false,
        error: 'User already has placeholder data. Clear it first to reseed.'
      });
    }

    // Seed demo data
    const result = await demoDataService.seedDemoData(userId);

    res.json({
      success: true,
      message: 'Demo data seeded successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Error seeding demo data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed demo data',
      message: error.message
    });
  }
});

/**
 * DELETE /api/demo-data/clear
 * Clear all placeholder data for the authenticated user
 */
router.delete('/clear', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear all placeholder data
    const result = await demoDataService.clearPlaceholderData(userId);

    res.json({
      success: true,
      message: 'All placeholder data cleared successfully',
      cleared: result.cleared
    });
  } catch (error) {
    console.error('Error clearing placeholder data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear placeholder data',
      message: error.message
    });
  }
});

/**
 * GET /api/demo-data/status
 * Check if user has placeholder data
 */
router.get('/status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const hasData = await demoDataService.hasPlaceholderData(userId);

    res.json({
      success: true,
      has_placeholder_data: hasData
    });
  } catch (error) {
    console.error('Error checking placeholder data status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check placeholder data status',
      message: error.message
    });
  }
});

export default router;
