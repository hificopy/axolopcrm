import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Send,
  FileText as Drafts,
  Archive,
  Trash2,
  Star,
  AlertCircle,
  Search,
  Plus,
  User,
  Briefcase,
  Tag,
  ChevronDown,
  ChevronRight,
  RefreshCcw,
  Link,
  Phone,
  MessageSquare,
  CheckSquare,
  Bell,
  Users,
  Filter,
  Calendar,
  Settings,
  Inbox as InboxIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import ComposeEmailModal from '@/components/ComposeEmailModal'; // Import ComposeEmailModal
import MeetingsPanel from '@/components/MeetingsPanel'; // Import MeetingsPanel

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [activeTab, setActiveTab] = useState('primary'); // New tab state
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false); // State for compose modal
  const { toast } = useToast();

  // Tab configuration
  const tabs = [
    { id: 'primary', label: 'Primary', count: 48, icon: InboxIcon },
    { id: 'emails', label: 'Emails', count: 3, icon: Mail },
    { id: 'calls', label: 'Calls', count: 0, icon: Phone },
    { id: 'messages', label: 'Messages', count: 0, icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', count: 0, icon: CheckSquare },
    { id: 'reminders', label: 'Reminders', count: 0, icon: Bell },
    { id: 'potential', label: 'Potential Contacts', count: 46, icon: Users },
  ];

  const checkGmailConnection = useCallback(async () => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.get(`${API_BASE_URL}/api/gmail/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.emailAddress) {
        setIsGmailConnected(true);
      }
    } catch (error) {
      setIsGmailConnected(false);
      console.error('Gmail not connected:', error);
    }
  }, []);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.get(`${API_BASE_URL}/api/inbox`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast({
        title: 'Error',
        description: 'Failed to load emails.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    checkGmailConnection();
    fetchEmails();
  }, [checkGmailConnection, fetchEmails]);

  // Filter emails based on active folder and search term
  const filteredEmails = emails.filter((email) => {
    const folderMatch = email.labels.includes(activeFolder);
    const searchMatch =
      email.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body.toLowerCase().includes(searchTerm.toLowerCase());
    return folderMatch && searchMatch;
  });

  const handleEmailSelect = async (email) => {
    setSelectedEmail(email);
    // Mark as read if not already
    if (!email.read) {
      try {
        const token = localStorage.getItem('supabase.auth.token');
        const response = await axios.put(
          `${API_BASE_URL}/api/inbox/${email.id}`,
          { read: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmails((prevEmails) =>
          prevEmails.map((e) => (e.id === email.id ? { ...e, read: true } : e))
        );
        setSelectedEmail(response.data); // Update selected email with latest data
      } catch (error) {
        console.error('Error marking email as read:', error);
        toast({
          title: 'Error',
          description: 'Failed to mark email as read.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleAction = async (action, emailId) => {
    const token = localStorage.getItem('supabase.auth.token');
    let updateData = {};
    let successMessage = '';
    let errorMessage = '';

    const emailToUpdate = emails.find(e => e.id === emailId);
    if (!emailToUpdate) return;

    switch (action) {
      case 'star':
        updateData = { starred: !emailToUpdate.starred };
        successMessage = emailToUpdate.starred ? 'Email unstarred.' : 'Email starred.';
        errorMessage = 'Failed to star or unstar email.';
        break;
      case 'archive':
        updateData = { labels: [...emailToUpdate.labels.filter(label => label !== 'inbox'), 'archive'] };
        successMessage = 'Email archived.';
        errorMessage = 'Failed to archive email.';
        break;
      case 'trash':
        updateData = { labels: [...emailToUpdate.labels.filter(label => label !== 'inbox'), 'trash'] };
        successMessage = 'Email moved to trash.';
        errorMessage = 'Failed to move email to trash.';
        break;
      case 'mark_read':
        updateData = { read: true };
        successMessage = 'Email marked as read.';
        errorMessage = 'Failed to mark email as read.';
        break;
      case 'mark_unread':
        updateData = { read: false };
        successMessage = 'Email marked as unread.';
        errorMessage = 'Failed to mark email as unread.';
        break;
      default:
        return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/inbox/${emailId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmails((prevEmails) =>
        prevEmails.map((e) => (e.id === emailId ? response.data : e))
      );
      setSelectedEmail(response.data); // Update selected email with latest data
      toast({ title: 'Success', description: successMessage });

      // If selected email is moved from current folder, deselect it
      if (selectedEmail && selectedEmail.id === emailId && (action === 'archive' || action === 'trash')) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error(`Error performing action ${action} on email:`, error);
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleConvertLead = async (email) => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const leadData = {
        name: email.sender,
        email: email.sender_email, // Use sender_email from backend
        website: '', // Can be extracted from email body if available
        phone: '', // Can be extracted from email body if available
        type: email.potential?.type === 'Contact' ? 'B2C_CUSTOMER' : 'B2B_COMPANY', // Default based on potential type
        status: 'NEW',
        custom_fields: {
          source_email_id: email.id,
          original_subject: email.subject,
          original_body: email.body,
          identified_industry: email.potential?.industry,
          identified_descriptors: email.potential?.descriptors,
        },
      };
      const response = await axios.post(`${API_BASE_URL}/api/leads`, leadData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: `Lead "${response.data.name}" created successfully.`,
      });
      // Optionally, update the email to reflect it's been converted
      // handleAction('mark_converted', email.id); // A new action type could be added to backend
    } catch (error) {
      console.error('Error converting to lead:', error);
      toast({
        title: 'Error',
        description: `Failed to convert to lead: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleAddContact = async (email) => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const contactData = {
        first_name: email.sender.split(' ')[0],
        last_name: email.sender.split(' ').slice(1).join(' ') || '',
        email: email.sender_email, // Use sender_email from backend
        title: email.potential?.type === 'Contact' ? 'Potential Contact' : '',
        custom_fields: {
          source_email_id: email.id,
          original_subject: email.subject,
          original_body: email.body,
          identified_industry: email.potential?.industry,
          identified_descriptors: email.potential?.descriptors,
        },
      };
      const response = await axios.post(`${API_BASE_URL}/api/contacts`, contactData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: `Contact "${response.data.first_name} ${response.data.last_name}" created successfully.`,
      });
      // Optionally, update the email to reflect it's been added as a contact
      // handleAction('mark_contact_added', email.id); // A new action type could be added to backend
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: 'Error',
        description: `Failed to add contact: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleSyncGmail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.post(`${API_BASE_URL}/api/inbox/sync-gmail`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Sync Complete',
        description: `${response.data.count} emails synced from Gmail.`,
      });
      await fetchEmails(); // Await to ensure emails are fetched before loading state changes
    } catch (error) {
      console.error('Error syncing Gmail emails:', error);
      toast({
        title: 'Error',
        description: `Failed to sync Gmail emails: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGmail = () => {
    const token = localStorage.getItem('supabase.auth.token');
    window.location.href = `${API_BASE_URL}/api/gmail/auth?token=${token}`; // Pass token for backend auth
  };

  const getFolderCount = (folder) => emails.filter((email) => email.labels.includes(folder)).length;
  const getUnreadCount = (folder) => emails.filter((email) => email.labels.includes(folder) && !email.read).length;

  return (
    <div className="flex h-full bg-[#0f1014]">
      {/* Left Sidebar - Folders */}
      <div className="w-48 md:w-52 border-r border-gray-800 bg-[#13151a] flex flex-col hidden sm:flex">
        <div className="p-3">
          <Button
            className="w-full flex items-center justify-center gap-2 bg-[#791C14] hover:bg-[#6b1a12] text-white"
            onClick={() => setIsComposeModalOpen(true)}
          >
            <Plus className="h-4 w-4" /> Compose
          </Button>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <a
              href="#"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-crm-text-secondary transition-all hover:text-crm-text-primary ${
                activeFolder === 'inbox' ? 'bg-crm-hover text-crm-text-primary' : ''
              }`}
              onClick={() => setActiveFolder('inbox')}
            >
              <Mail className="h-4 w-4" />
              Inbox
              {getUnreadCount('inbox') > 0 && (
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  {getUnreadCount('inbox')}
                </Badge>
              )}
            </a>
            <a
              href="#"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-crm-text-secondary transition-all hover:text-crm-text-primary ${
                activeFolder === 'starred' ? 'bg-crm-hover text-crm-text-primary' : ''
              }`}
              onClick={() => setActiveFolder('starred')}
            >
              <Star className="h-4 w-4" />
              Starred
              {getUnreadCount('starred') > 0 && (
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  {getUnreadCount('starred')}
                </Badge>
              )}
            </a>
            <a
              href="#"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-crm-text-secondary transition-all hover:text-crm-text-primary ${
                activeFolder === 'sent' ? 'bg-crm-hover text-crm-text-primary' : ''
              }`}
              onClick={() => setActiveFolder('sent')}
            >
              <Send className="h-4 w-4" />
              Sent
            </a>
            <a
              href="#"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-crm-text-secondary transition-all hover:text-crm-text-primary ${
                activeFolder === 'drafts' ? 'bg-crm-hover text-crm-text-primary' : ''
              }`}
              onClick={() => setActiveFolder('drafts')}
            >
              <Drafts className="h-4 w-4" />
              Drafts
            </a>
            <a
              href="#"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-crm-text-secondary transition-all hover:text-crm-text-primary ${
                activeFolder === 'archive' ? 'bg-crm-hover text-crm-text-primary' : ''
              }`}
              onClick={() => setActiveFolder('archive')}
            >
              <Archive className="h-4 w-4" />
              Archive
            </a>
            <a
              href="#"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-crm-text-secondary transition-all hover:text-crm-text-primary ${
                activeFolder === 'spam' ? 'bg-crm-hover text-crm-text-primary' : ''
              }`}
              onClick={() => setActiveFolder('spam')}
            >
              <AlertCircle className="h-4 w-4" />
              Spam
            </a>
            <a
              href="#"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-crm-text-secondary transition-all hover:text-crm-text-primary ${
                activeFolder === 'trash' ? 'bg-crm-hover text-crm-text-primary' : ''
              }`}
              onClick={() => setActiveFolder('trash')}
            >
              <Trash2 className="h-4 w-4" />
              Trash
            </a>
          </nav>
        </ScrollArea>
      </div>

      {/* Center - Email List */}
      <div className="flex-1 md:max-w-2xl border-r border-gray-800 bg-[#13151a] flex flex-col">
        {/* Top Bar - Tabs and Actions */}
        <div className="border-b border-gray-800 bg-[#13151a]">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 pt-3 overflow-x-auto">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#1e2128] text-white border-t border-x border-gray-700'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-[#1a1c22]'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {tab.count > 0 && (
                    <Badge className="ml-1 bg-[#791C14] text-white text-xs px-1.5 py-0">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#1e2128]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full bg-[#13151a] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Calendar className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Archive className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 border-b border-crm-border">
          <span className="text-sm text-crm-text-secondary">
            {filteredEmails.length} {filteredEmails.length === 1 ? 'email' : 'emails'} in {activeFolder}
          </span>
          <div className="flex gap-2">
            {!isGmailConnected ? (
              <Button variant="outline" size="sm" onClick={handleConnectGmail}>
                <Link className="h-4 w-4 mr-2" /> Connect Gmail
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleSyncGmail} disabled={loading}>
                <RefreshCcw className={`h-4 w-4 text-crm-text-secondary ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 text-center text-crm-text-secondary">Loading emails...</div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-4 text-center text-crm-text-secondary">No emails in this folder.</div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                className={`flex flex-col gap-1 p-3 border-b border-crm-border cursor-pointer hover:bg-crm-hover ${
                  selectedEmail?.id === email.id ? 'bg-crm-hover' : ''
                } ${email.read ? 'text-crm-text-secondary' : 'font-semibold text-crm-text-primary'}`}
                onClick={() => handleEmailSelect(email)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{email.sender}</span>
                  <span className="text-xs text-crm-text-secondary">
                    {new Date(email.received_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm truncate">{email.subject}</p>
                {email.potential && (
                  <div className="flex gap-1 mt-1">
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      <Briefcase className="h-3 w-3 mr-1" /> Potential {email.potential.type}
                    </Badge>
                    <Badge variant="outline" className="bg-primary-green/10 text-primary-green">
                      <Tag className="h-3 w-3 mr-1" /> {email.potential.industry}
                    </Badge>
                  </div>
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Email Detail View */}
      <div className="flex-1 bg-white dark:bg-[#1a1d24] flex flex-col">
        {selectedEmail ? (
          <>
            <div className="p-4 border-b border-crm-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-crm-text-primary">{selectedEmail.subject}</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleAction('star', selectedEmail.id)}>
                  <Star className={`h-4 w-4 ${selectedEmail.starred ? 'text-primary-yellow' : 'text-crm-text-secondary'}`} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronDown className="h-4 w-4 text-crm-text-secondary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAction('archive', selectedEmail.id)}>Archive</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('trash', selectedEmail.id)}>Move to Trash</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAction('mark_read', selectedEmail.id)}>Mark as Read</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction('mark_unread', selectedEmail.id)}>Mark as Unread</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {selectedEmail.sender.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-crm-text-primary">{selectedEmail.sender}</p>
                  <p className="text-sm text-crm-text-secondary">to me</p>
                </div>
              </div>
              <div className="prose max-w-none text-crm-text-primary">
                <p>{selectedEmail.body}</p>
              </div>

              {selectedEmail.potential && (
                <Card className="mt-6 border-primary">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> Potential {selectedEmail.potential.type} Identified
                    </CardTitle>
                    <Tag className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-crm-text-primary">
                      {selectedEmail.potential.industry}
                    </p>
                    <p className="text-xs text-crm-text-secondary mt-1">
                      Keywords: {selectedEmail.potential.descriptors.join(', ')}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => handleConvertLead(selectedEmail)}>
                        <Plus className="h-4 w-4 mr-2" /> Convert to Lead
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleAddContact(selectedEmail)}>
                        <User className="h-4 w-4 mr-2" /> Add to Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-crm-text-secondary">
            Select an email to view its content
          </div>
        )}
      </div>

      {/* Meetings Panel on the Right */}
      <MeetingsPanel />

      <ComposeEmailModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        onEmailSent={fetchEmails} // Re-fetch emails after sending
      />
    </div>
  );
};

export default Inbox;