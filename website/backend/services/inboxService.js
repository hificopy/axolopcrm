const { createClient } = require('@supabase/supabase-js');
const { identifyPotential } = require('./emailIdentificationService');
const gmailService = require('./gmailService'); // Import gmailService

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all emails for a user
const getEmails = async (userId) => {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('user_id', userId)
    .order('received_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch emails error:', error);
    throw new Error(`Failed to fetch emails: ${error.message}`);
  }
  return data;
};

// Get a single email by ID
const getEmailById = async (userId, emailId) => {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('id', emailId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Supabase fetch email by ID error:', error);
    throw new Error(`Failed to fetch email: ${error.message}`);
  }
  return data;
};

// Ingest a new email (e.g., from a webhook or Gmail sync)
const ingestEmail = async (userId, emailData) => {
  const { sender, sender_email, subject, body, received_at, read, starred, labels, gmail_message_id } = emailData;

  // Check for duplicate based on gmail_message_id if provided
  if (gmail_message_id) {
    const { data: existingEmail, error: existingError } = await supabase
      .from('emails')
      .select('id')
      .eq('user_id', userId)
      .eq('gmail_message_id', gmail_message_id)
      .single();

    if (existingEmail) {
      console.log(`Email with Gmail message ID ${gmail_message_id} already exists, skipping ingestion.`);
      return existingEmail; // Return existing email to avoid re-processing
    }
    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking for existing email:', existingError);
      throw new Error(`Failed to check for existing email: ${existingError.message}`);
    }
  }

  // Identify potential lead/contact
  const potential = await identifyPotential(userId, subject, body);

  const { data, error } = await supabase
    .from('emails')
    .insert({
      user_id: userId,
      sender,
      sender_email,
      subject,
      body,
      received_at,
      read,
      starred,
      labels,
      potential, // Store the identified potential info
      gmail_message_id, // Store Gmail's message ID
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase ingest email error:', error);
    throw new Error(`Failed to ingest email: ${error.message}`);
  }
  return data;
};

// Update an existing email (e.g., mark as read, star, move to folder)
const updateEmail = async (userId, emailId, updateData) => {
  const { data, error } = await supabase
    .from('emails')
    .update({ ...updateData, updated_at: new Date() })
    .eq('id', emailId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Supabase update email error:', error);
    throw new Error(`Failed to update email: ${error.message}`);
  }
  return data;
};

// Delete an email
const deleteEmail = async (userId, emailId) => {
  const { error } = await supabase
    .from('emails')
    .delete()
    .eq('id', emailId)
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase delete email error:', error);
    throw new Error(`Failed to delete email: ${error.message}`);
  }
  return true;
};

// Sync emails from Gmail
const syncGmailEmails = async (userId) => {
  try {
    const messages = await gmailService.listGmailMessages(userId, 'in:inbox'); // Fetch messages from inbox
    const syncedEmails = [];

    for (const msg of messages) {
      const fullMessage = await gmailService.getGmailMessage(userId, msg.id);
      const parsedEmail = gmailService.parseGmailMessage(fullMessage);

      // Ingest the parsed email into our database
      const ingested = await ingestEmail(userId, parsedEmail);
      syncedEmails.push(ingested);
    }
    return syncedEmails;
  } catch (error) {
    console.error('Error syncing Gmail emails:', error);
    throw new Error(`Failed to sync Gmail emails: ${error.message}`);
  }
};

  }
};

// Send an email using Gmail API and record it
const sendEmail = async (userId, { to, subject, body, inReplyToMessageId = null }) => {
  try {
    const sentGmailMessage = await gmailService.sendEmail(userId, { to, subject, body, inReplyToMessageId });
    const userProfile = await gmailService.getGmailProfile(userId);
    const fromEmail = userProfile.emailAddress;

    // Record the sent email in our database
    const sentEmailData = {
      user_id: userId,
      sender: userProfile.emailAddress, // The CRM user is the sender
      sender_email: userProfile.emailAddress,
      subject,
      body,
      received_at: new Date().toISOString(), // Use current time for sent email
      read: true, // Sent emails are considered read
      starred: false,
      labels: ['sent'], // Mark as sent
      gmail_message_id: sentGmailMessage.id, // Store Gmail's message ID
    };

    const { data, error } = await supabase
      .from('emails')
      .insert(sentEmailData)
      .select()
      .single();

    if (error) {
      console.error('Error recording sent email in Supabase:', error);
      throw new Error(`Failed to record sent email: ${error.message}`);
    }
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  getEmails,
  getEmailById,
  ingestEmail,
  updateEmail,
  deleteEmail,
  syncGmailEmails,
  sendEmail, // Export the new sendEmail function
};

