import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import { Base64 } from 'js-base64';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// Function to generate an authentication URL
const getAuthUrl = (userId) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request a refresh token
    scope: GMAIL_SCOPES,
    state: userId, // Pass userId as state to retrieve it in the callback
    prompt: 'consent', // Ensure refresh token is always returned
  });
  return authUrl;
};

// Function to handle the OAuth callback and store tokens
const handleOAuthCallback = async (code, userId) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const { access_token, refresh_token, expiry_date, scope, token_type } = tokens;

  // Store tokens in Supabase
  const { data, error } = await supabase
    .from('gmail_tokens')
    .upsert(
      {
        user_id: userId,
        access_token,
        refresh_token,
        scope,
        token_type,
        expiry_date: new Date(expiry_date).toISOString(),
      },
      { onConflict: 'user_id' } // Update if user_id already exists
    )
    .select()
    .single();

  if (error) {
    console.error('Error storing Gmail tokens:', error);
    throw new Error(`Failed to store Gmail tokens: ${error.message}`);
  }
  return data;
};

// Function to get an authenticated Gmail client
const getGmailClient = async (userId) => {
  const { data: tokenData, error } = await supabase
    .from('gmail_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !tokenData) {
    throw new Error('Gmail tokens not found for user. Please connect your Gmail account.');
  }

  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expiry_date: new Date(tokenData.expiry_date).getTime(),
  });

  // Refresh token if expired
  if (oauth2Client.isTokenExpired()) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    // Update tokens in Supabase
    await supabase
      .from('gmail_tokens')
      .update({
        access_token: credentials.access_token,
        expiry_date: new Date(credentials.expiry_date).toISOString(),
      })
      .eq('user_id', userId);
  }

  return google.gmail({ version: 'v1', auth: oauth2Client });
};

// Function to fetch user's Gmail profile (to get email address)
const getGmailProfile = async (userId) => {
  const gmail = await getGmailClient(userId);
  const res = await gmail.users.getProfile({ userId: 'me' });
  return res.data;
};

// Function to fetch user's Gmail signature
const getGmailSignature = async (userId) => {
  const gmail = await getGmailClient(userId);
  const res = await gmail.users.settings.sendAs.list({ userId: 'me' });
  const sendAs = res.data.sendAs;
  if (sendAs && sendAs.length > 0) {
    // Assuming the first sendAs entry is the primary one
    return sendAs[0].signature;
  }
  return null;
};

// Function to list Gmail messages
const listGmailMessages = async (userId, query = '') => {
  const gmail = await getGmailClient(userId);
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: query, // e.g., 'is:unread in:inbox'
    maxResults: 10, // Limit for testing, can be increased
  });
  return res.data.messages || [];
};

// Function to get a specific Gmail message
const getGmailMessage = async (userId, messageId) => {
  const gmail = await getGmailClient(userId);
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full', // 'full' includes headers and body
  });
  return res.data;
};

// Helper to extract header value
const getHeader = (headers, name) => {
  const header = headers.find((h) => h.name === name);
  return header ? header.value : null;
};

// Function to parse a raw Gmail message into our internal email format
const parseGmailMessage = (gmailMessage) => {
  const headers = gmailMessage.payload.headers;
  const subject = getHeader(headers, 'Subject');
  const from = getHeader(headers, 'From');
  const date = getHeader(headers, 'Date');

  let sender = from;
  let senderEmail = from;

  // Extract sender name and email from "From" header
  const emailMatch = from.match(/(.*)<(.*)>/);
  if (emailMatch && emailMatch.length > 2) {
    sender = emailMatch[1].trim().replace(/"/g, '');
    senderEmail = emailMatch[2].trim();
  }

  let body = '';
  const parts = gmailMessage.payload.parts;

  if (parts) {
    // Prioritize text/html, then text/plain
    const htmlPart = parts.find((part) => part.mimeType === 'text/html');
    const plainTextPart = parts.find((part) => part.mimeType === 'text/plain');

    if (htmlPart && htmlPart.body && htmlPart.body.data) {
      body = Base64.decode(htmlPart.body.data);
    } else if (plainTextPart && plainTextPart.body && plainTextPart.body.data) {
      body = Base64.decode(plainTextPart.body.data);
    }
  } else if (gmailMessage.payload.body && gmailMessage.payload.body.data) {
    // Handle cases where there are no parts (e.g., simple plain text emails)
    body = Base64.decode(gmailMessage.payload.body.data);
  }

  return {
    gmail_message_id: gmailMessage.id, // Store Gmail's message ID for future reference
    sender,
    sender_email: senderEmail,
    subject,
    body,
    received_at: date ? new Date(date).toISOString() : new Date().toISOString(),
    read: !gmailMessage.labelIds.includes('UNREAD'),
    starred: gmailMessage.labelIds.includes('STARRED'),
    labels: gmailMessage.labelIds.map(label => label.toLowerCase()), // Store Gmail labels
  };
};

// Function to send an email using Gmail API
const sendEmail = async (userId, { to, subject, body, inReplyToMessageId = null }) => {
  const gmail = await getGmailClient(userId);
  const userProfile = await getGmailProfile(userId);
  const fromEmail = userProfile.emailAddress;

  const emailLines = [];
  emailLines.push(`From: ${fromEmail}`);
  emailLines.push(`To: ${to}`);
  emailLines.push(`Subject: ${subject}`);
  emailLines.push('MIME-Version: 1.0');
  emailLines.push('Content-Type: text/html; charset=utf-8');
  emailLines.push('Content-Transfer-Encoding: base64');

  if (inReplyToMessageId) {
    emailLines.push(`In-Reply-To: <${inReplyToMessageId}>`);
    emailLines.push(`References: <${inReplyToMessageId}>`);
  }

  emailLines.push('');
  emailLines.push(Base64.encodeURI(body));

  const rawEmail = emailLines.join('\n');

  const encodedMessage = Base64.encodeURI(rawEmail);

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
  return res.data;
};


export default {
  getAuthUrl,
  handleOAuthCallback,
  getGmailClient,
  getGmailProfile,
  getGmailSignature,
  listGmailMessages,
  getGmailMessage,
  parseGmailMessage,
  sendEmail,
};

