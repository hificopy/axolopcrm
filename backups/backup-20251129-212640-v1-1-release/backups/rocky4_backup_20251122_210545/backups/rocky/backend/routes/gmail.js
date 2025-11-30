import express from 'express';
import gmailService from '../services/gmailService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to initiate Gmail OAuth flow
router.get('/auth', protect, (req, res) => {
  try {
    const userId = req.user.id; // Assuming userId is available from protect middleware
    const authUrl = gmailService.getAuthUrl(userId);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Gmail OAuth:', error);
    res.status(500).json({ message: 'Failed to initiate Gmail OAuth', error: error.message });
  }
});

// Route to handle Gmail OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state: userId } = req.query; // 'state' contains the userId
    if (!code || !userId) {
      return res.status(400).json({ message: 'Authorization code or user ID missing.' });
    }

    await gmailService.handleOAuthCallback(code, userId);
    
    // Redirect back to frontend, perhaps to a success page or the inbox
    res.redirect(`${process.env.FRONTEND_URL}/inbox?gmail_auth_success=true`);
  } catch (error) {
    console.error('Error handling Gmail OAuth callback:', error);
    res.status(500).json({ message: 'Failed to handle Gmail OAuth callback', error: error.message });
  }
});

// Route to get Gmail profile (e.g., email address)
router.get('/profile', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await gmailService.getGmailProfile(userId);
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching Gmail profile:', error);
    res.status(500).json({ message: 'Failed to fetch Gmail profile', error: error.message });
  }
});

// Route to get Gmail signature
router.get('/signature', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const signature = await gmailService.getGmailSignature(userId);
    res.status(200).json({ signature });
  } catch (error) {
    console.error('Error fetching Gmail signature:', error);
    res.status(500).json({ message: 'Failed to fetch Gmail signature', error: error.message });
  }
});

export default router;
