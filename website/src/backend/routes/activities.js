import express from 'express';
import activityService from '../services/activityService.js';
import { protect } from '../middleware/authMiddleware.js';
import { extractAgencyContext, requireEditPermissions } from '../middleware/agency-access.js';

const router = express.Router();

// Apply agency context extraction to all routes
router.use(extractAgencyContext);

// Get all activities for the authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const activities = await activityService.getActivities(userId);
    res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Failed to fetch activities', error: error.message });
  }
});

// Get a single activity by ID for the authenticated user
router.get('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const activityId = req.params.id;
    const activity = await activityService.getActivityById(userId, activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found or not authorized' });
    }
    res.status(200).json(activity);
  } catch (error) {
    console.error('Error fetching activity by ID:', error);
    res.status(500).json({ message: 'Failed to fetch activity', error: error.message });
  }
});

// Get activities by lead ID
router.get('/lead/:leadId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const leadId = req.params.leadId;
    const activities = await activityService.getActivitiesByLead(userId, leadId);
    res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching activities by lead:', error);
    res.status(500).json({ message: 'Failed to fetch activities', error: error.message });
  }
});

// Get activities by opportunity ID
router.get('/opportunity/:opportunityId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const opportunityId = req.params.opportunityId;
    const activities = await activityService.getActivitiesByOpportunity(userId, opportunityId);
    res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching activities by opportunity:', error);
    res.status(500).json({ message: 'Failed to fetch activities', error: error.message });
  }
});

// Create a new activity for the authenticated user
router.post('/', protect, requireEditPermissions, async (req, res) => {
  try {
    const userId = req.user.id;
    const newActivity = await activityService.createActivity(userId, req.body);
    res.status(201).json(newActivity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: 'Failed to create activity', error: error.message });
  }
});

// Update an existing activity for the authenticated user
router.put('/:id', protect, requireEditPermissions, async (req, res) => {
  try {
    const userId = req.user.id;
    const activityId = req.params.id;
    const updatedActivity = await activityService.updateActivity(userId, activityId, req.body);
    if (!updatedActivity) {
      return res.status(404).json({ message: 'Activity not found or not authorized' });
    }
    res.status(200).json(updatedActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Failed to update activity', error: error.message });
  }
});

// Delete an activity for the authenticated user
router.delete('/:id', protect, requireEditPermissions, async (req, res) => {
  try {
    const userId = req.user.id;
    const activityId = req.params.id;
    const deleted = await activityService.deleteActivity(userId, activityId);
    if (!deleted) {
      return res.status(404).json({ message: 'Activity not found or not authorized' });
    }
    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Failed to delete activity', error: error.message });
  }
});

export default router;
