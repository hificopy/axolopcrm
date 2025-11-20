import express from 'express';
import inboxService from '../services/inboxService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all emails for the authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const emails = await inboxService.getEmails(userId);
    res.status(200).json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ message: 'Failed to fetch emails', error: error.message });
  }
});

// Get a single email by ID for the authenticated user
router.get('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const emailId = req.params.id;
    const email = await inboxService.getEmailById(userId, emailId);
    if (!email) {
      return res.status(404).json({ message: 'Email not found or not authorized' });
    }
    res.status(200).json(email);
  } catch (error) {
    console.error('Error fetching email by ID:', error);
    res.status(500).json({ message: 'Failed to fetch email', error: error.message });
  }
});

// Ingest a new email (e.g., from a webhook)
router.post('/ingest', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const newEmail = await inboxService.ingestEmail(userId, req.body);
    res.status(201).json(newEmail);
  } catch (error) {
    console.error('Error ingesting email:', error);
    res.status(500).json({ message: 'Failed to ingest email', error: error.message });
  }
});

// Update an existing email (e.g., mark as read, star, move to folder)
router.put('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const emailId = req.params.id;
    const updatedEmail = await inboxService.updateEmail(userId, emailId, req.body);
    if (!updatedEmail) {
      return res.status(404).json({ message: 'Email not found or not authorized' });
    }
    res.status(200).json(updatedEmail);
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ message: 'Failed to update email', error: error.message });
  }
});

// Delete an email
router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const emailId = req.params.id;
    const deleted = await inboxService.deleteEmail(userId, emailId);
    if (!deleted) {
      return res.status(404).json({ message: 'Email not found or not authorized' });
    }
    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).json({ message: 'Failed to delete email', error: error.message });
  }
});

// Route to trigger Gmail email sync
router.post('/sync-gmail', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const syncedEmails = await inboxService.syncGmailEmails(userId);
    res.status(200).json({ message: 'Gmail emails synced successfully', count: syncedEmails.length, syncedEmails });
  } catch (error) {
    console.error('Error syncing Gmail emails:', error);
    res.status(500).json({ message: 'Failed to sync Gmail emails', error: error.message });
  }
});

// Route to send an email
router.post('/send', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { to, subject, body, inReplyToMessageId } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ message: 'To, Subject, and Body are required.' });
    }
    const sentEmail = await inboxService.sendEmail(userId, { to, subject, body, inReplyToMessageId });
    res.status(200).json({ message: 'Email sent successfully', email: sentEmail });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

export default router;
