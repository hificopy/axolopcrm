import express from 'express';
import contactService from '../services/contactService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all contacts for the authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const contacts = await contactService.getContacts(userId);
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Failed to fetch contacts', error: error.message });
  }
});

// Get a single contact by ID for the authenticated user
router.get('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const contactId = req.params.id;
    const contact = await contactService.getContactById(userId, contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found or not authorized' });
    }
    res.status(200).json(contact);
  } catch (error) {
    console.error('Error fetching contact by ID:', error);
    res.status(500).json({ message: 'Failed to fetch contact', error: error.message });
  }
});

// Create a new contact for the authenticated user
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const newContact = await contactService.createContact(userId, req.body);
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ message: 'Failed to create contact', error: error.message });
  }
});

// Update an existing contact for the authenticated user
router.put('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const contactId = req.params.id;
    const updatedContact = await contactService.updateContact(userId, contactId, req.body);
    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found or not authorized' });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ message: 'Failed to update contact', error: error.message });
  }
});

// Delete a contact for the authenticated user
router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const contactId = req.params.id;
    const deleted = await contactService.deleteContact(userId, contactId);
    if (!deleted) {
      return res.status(404).json({ message: 'Contact not found or not authorized' });
    }
    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Failed to delete contact', error: error.message });
  }
});

// Route to export contacts to CSV
router.get('/export', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { exportContacts } = await import('../utils/export.js');

    // Get filter parameters from query string
    const filters = {
      leadId: req.query.leadId
    };

    const csv = await exportContacts(userId, filters);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts_export.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting contacts:', error);
    res.status(500).json({ message: 'Failed to export contacts', error: error.message });
  }
});

export default router;
