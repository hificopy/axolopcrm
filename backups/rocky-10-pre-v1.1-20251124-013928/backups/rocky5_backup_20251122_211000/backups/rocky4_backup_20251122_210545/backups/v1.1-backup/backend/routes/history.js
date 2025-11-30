import express from 'express';
import historyService from '../services/historyService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all history events for the authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = {
      eventType: req.query.eventType,
      entityType: req.query.entityType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    // Get regular history events
    const history = await historyService.getHistory(userId, filters);

    // Get today's bookings
    const todaysBookings = await historyService.getTodaysBookings(userId);

    // Merge and sort by created_at descending
    const allEvents = [...history, ...todaysBookings].sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    );

    res.status(200).json(allEvents);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
});

// Get history events for a specific entity
router.get('/:entityType/:entityId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { entityType, entityId } = req.params;
    const history = await historyService.getEntityHistory(userId, entityType, entityId);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching entity history:', error);
    res.status(500).json({ message: 'Failed to fetch entity history', error: error.message });
  }
});

// Create a history event (typically called internally by other services)
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const newEvent = await historyService.createHistoryEvent(userId, req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating history event:', error);
    res.status(500).json({ message: 'Failed to create history event', error: error.message });
  }
});

// Delete old history events
router.delete('/cleanup', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { olderThan } = req.body;

    if (!olderThan) {
      return res.status(400).json({ message: 'olderThan date is required' });
    }

    await historyService.deleteOldHistory(userId, olderThan);
    res.status(200).json({ message: 'Old history events deleted successfully' });
  } catch (error) {
    console.error('Error deleting old history:', error);
    res.status(500).json({ message: 'Failed to delete old history', error: error.message });
  }
});

export default router;
