const express = require('express');
const router = express.Router();
const opportunityService = require('../services/opportunityService');
const { protect } = require('../middleware/authMiddleware');

// Get all opportunities for the authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const opportunities = await opportunityService.getOpportunities(userId);
    res.status(200).json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ message: 'Failed to fetch opportunities', error: error.message });
  }
});

// Get a single opportunity by ID for the authenticated user
router.get('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const opportunityId = req.params.id;
    const opportunity = await opportunityService.getOpportunityById(userId, opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found or not authorized' });
    }
    res.status(200).json(opportunity);
  } catch (error) {
    console.error('Error fetching opportunity by ID:', error);
    res.status(500).json({ message: 'Failed to fetch opportunity', error: error.message });
  }
});

// Create a new opportunity for the authenticated user
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const newOpportunity = await opportunityService.createOpportunity(userId, req.body);
    res.status(201).json(newOpportunity);
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ message: 'Failed to create opportunity', error: error.message });
  }
});

// Update an existing opportunity for the authenticated user
router.put('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const opportunityId = req.params.id;
    const updatedOpportunity = await opportunityService.updateOpportunity(userId, opportunityId, req.body);
    if (!updatedOpportunity) {
      return res.status(404).json({ message: 'Opportunity not found or not authorized' });
    }
    res.status(200).json(updatedOpportunity);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ message: 'Failed to update opportunity', error: error.message });
  }
});

// Delete an opportunity for the authenticated user
router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const opportunityId = req.params.id;
    const deleted = await opportunityService.deleteOpportunity(userId, opportunityId);
    if (!deleted) {
      return res.status(404).json({ message: 'Opportunity not found or not authorized' });
    }
    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ message: 'Failed to delete opportunity', error: error.message });
  }
});

module.exports = router;
