import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Upload, Eye, Edit3, Trash2, User, Mail, Phone, Building2, Tag, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  // Mock data for demonstration
  useEffect(() => {
    const mockContacts = [
      {
        id: '1',
        name: 'Sarah Johnson',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@acmecorp.com',
        phone: '(555) 123-4567',
        mobilePhone: '(555) 987-6543',
        title: 'Marketing Director',
        company: 'Acme Corporation',
        companySize: '500-1000',
        industry: 'Technology',
        address: '123 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94105',
        tags: ['Hot Lead', 'Enterprise'],
        lastContactedAt: new Date('2025-10-28'),
        lastEmailSent: new Date('2025-10-25'),
        lastEmailReceived: new Date('2025-10-20'),
        lastMeeting: new Date('2025-10-15'),
        totalInteractions: 12,
        isActive: true,
        createdAt: new Date('2025-08-15'),
        convertedFromLeadId: 'lead_1',
      },
      {
        id: '2',
        name: 'Michael Chen',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael@techstart.io',
        phone: '(555) 234-5678',
        mobilePhone: '(555) 876-5432',
        title: 'CTO',
        company: 'TechStart Inc',
        companySize: '100-500',
        industry: 'Software',
        address: '456 Innovation Blvd',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        zipCode: '78701',
        tags: ['Product Qualified', 'Startup'],
        lastContactedAt: new Date('2025-10-29'),
        lastEmailSent: new Date('2025-10-28'),
        lastEmailReceived: new Date('2025-10-26'),
        lastMeeting: new Date('2025-10-18'),
        totalInteractions: 8,
        isActive: true,
        createdAt: new Date('2025-09-01'),
        convertedFromLeadId: 'lead_2',
      },
      {
        id: '3',
        name: 'Emma Rodriguez',
        firstName: 'Emma',
        lastName: 'Rodriguez',
        email: 'emma@digitalventures.com',
        phone: '(555) 345-6789',
        mobilePhone: '(555) 765-4321',
        title: 'Head of Sales',
        company: 'Digital Ventures',
        companySize: '1000+',
        industry: 'Digital Marketing',
        address: '789 Strategy St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        tags: ['Hot Lead', 'Enterprise'],
        lastContactedAt: new Date('2025-10-27'),
        lastEmailSent: new Date('2025-10-22'),
        lastEmailReceived: new Date('2025-10-20'),
        lastMeeting: new Date('2025-10-10'),
        totalInteractions: 15,
        isActive: true,
        createdAt: new Date('2025-08-20'),
        convertedFromLeadId: 'lead_3',
      },
      {
        id: '4',
        name: 'David Kim',
        firstName: 'David',
        lastName: 'Kim',
        email: 'david@innovate.com',
        phone: '(555) 456-7890',
        mobilePhone: '(555) 654-3210',
        title: 'Product Manager',
        company: 'Innovate Solutions',
        companySize: '50-100',
        industry: 'SaaS',
        address: '321 Progress Ave',
        city: 'Seattle',
        state: 'WA',
        country: 'USA',
        zipCode: '98101',
        tags: ['Warm Lead'],
        lastContactedAt: new Date('2025-10-25'),
        lastEmailSent: new Date('2025-10-18'),
        lastEmailReceived: new Date('2025-10-15'),
        lastMeeting: new Date('2025-10-05'),
        totalInteractions: 6,
        isActive: true,
        createdAt: new Date('2025-09-10'),
        convertedFromLeadId: 'lead_4',
      },
    ];
    setContacts(mockContacts);
    setFilteredContacts(mockContacts);
  }, []);

  // Filter contacts based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  }, [searchTerm, contacts]);

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
  };

  const handleCreateContact = () => {
    // In a real app, this would open a form to create a new contact
    console.log('Create new contact');
  };

  const handleExport = () => {
    // In a real app, this would export the contacts data
    alert('Exporting contacts...');
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-crm-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-crm-text-primary">Contacts</h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              Manage and track your business contacts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-crm-text-secondary" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="default" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" size="default" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button variant="default" size="default" className="gap-2" onClick={handleCreateContact}>
              <Plus className="h-4 w-4" />
              <span>New Contact</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="text-sm text-crm-text-secondary">Total Contacts</div>
            <div className="text-2xl font-semibold text-crm-text-primary mt-1">
              {contacts.length}
            </div>
          </div>
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="text-sm text-crm-text-secondary">Active This Month</div>
            <div className="text-2xl font-semibold text-primary-green mt-1">
              {contacts.filter(c => new Date(c.lastContactedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
            </div>
          </div>
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="text-sm text-crm-text-secondary">Companies</div>
            <div className="text-2xl font-semibold text-primary-yellow mt-1">
              {[...new Set(contacts.map(c => c.company))].length}
            </div>
          </div>
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="text-sm text-crm-text-secondary">Avg. Interactions</div>
            <div className="text-2xl font-semibold text-crm-text-primary mt-1">
              {contacts.length > 0 
                ? (contacts.reduce((sum, c) => sum + c.totalInteractions, 0) / contacts.length).toFixed(1) 
                : '0'}
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white border-b border-crm-border px-6 py-3 flex items-center justify-between">
        <div className="text-sm text-crm-text-secondary">
          Showing {filteredContacts.length} of {contacts.length} contacts
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-crm-text-secondary">View:</span>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            Cards
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'table' ? (
          <div className="card-crm rounded-lg border border-crm-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Last Contacted</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    onClick={() => handleContactSelect(contact)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue font-semibold">
                          {contact.firstName?.charAt(0)}
                          {contact.lastName?.charAt(0)}
                        </div>
                        <span>{contact.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-crm-text-secondary" />
                        <span>{contact.company}</span>
                      </div>
                    </TableCell>
                    <TableCell>{contact.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-crm-text-secondary" />
                        <span>{contact.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-crm-text-secondary" />
                        <span>{contact.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(contact.lastContactedAt)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Empty State */}
            {filteredContacts.length === 0 && (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-crm-bg-light mx-auto mb-4">
                  <User className="h-12 w-12 text-crm-text-secondary mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-crm-text-primary mb-2">No contacts found</h3>
                <p className="text-crm-text-secondary mb-6">
                  {searchTerm 
                    ? 'No contacts match your search. Try different keywords.' 
                    : 'Get started by creating your first contact.'}
                </p>
                <Button variant="default" size="default" className="gap-2" onClick={handleCreateContact}>
                  <Plus className="h-4 w-4" />
                  <span>Create Your First Contact</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Cards view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <Card 
                key={contact.id} 
                className="hover:shadow-crm-hover transition-shadow cursor-pointer"
                onClick={() => handleContactSelect(contact)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue font-semibold text-lg">
                        {contact.firstName?.charAt(0)}
                        {contact.lastName?.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{contact.name}</CardTitle>
                        <p className="text-sm text-crm-text-secondary">{contact.title}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-crm-text-secondary" />
                      <span>{contact.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-crm-text-secondary" />
                      <span>{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-crm-text-secondary" />
                      <span>{contact.phone}</span>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-crm-text-secondary">Last Contacted</span>
                        <span className="font-medium">{formatDate(contact.lastContactedAt)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-crm-text-secondary">Interactions</span>
                        <span className="font-medium">{contact.totalInteractions}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 pt-2">
                      {contact.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Contact Detail Panel (Right Sidebar) */}
      {selectedContact && (
        <div className="fixed right-0 top-16 bottom-0 w-96 bg-white border-l border-crm-border shadow-lg z-50">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue font-semibold text-2xl">
                  {selectedContact.firstName?.charAt(0)}
                  {selectedContact.lastName?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedContact.name}</h2>
                  <p className="text-sm text-crm-text-secondary">{selectedContact.title}</p>
                  <p className="text-sm text-crm-text-secondary">{selectedContact.company}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedContact(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Email</span>
                    <a href={`mailto:${selectedContact.email}`} className="text-sm text-primary-blue hover:underline">
                      {selectedContact.email}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Phone</span>
                    <a href={`tel:${selectedContact.phone}`} className="text-sm text-primary-blue hover:underline">
                      {selectedContact.phone}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Mobile</span>
                    <a href={`tel:${selectedContact.mobilePhone}`} className="text-sm text-primary-blue hover:underline">
                      {selectedContact.mobilePhone}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                  Company Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Company</span>
                    <span className="text-sm">{selectedContact.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Industry</span>
                    <span className="text-sm">{selectedContact.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Company Size</span>
                    <span className="text-sm">{selectedContact.companySize}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                  Location
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-crm-text-secondary">Address</span>
                    <p className="text-sm">{selectedContact.address}</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">City</span>
                    <span className="text-sm">{selectedContact.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">State</span>
                    <span className="text-sm">{selectedContact.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Country</span>
                    <span className="text-sm">{selectedContact.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">ZIP Code</span>
                    <span className="text-sm">{selectedContact.zipCode}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                  Engagement
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Last Contacted</span>
                    <span className="text-sm">{formatDate(selectedContact.lastContactedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Last Email Sent</span>
                    <span className="text-sm">{formatDate(selectedContact.lastEmailSent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Total Interactions</span>
                    <span className="text-sm">{selectedContact.totalInteractions}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedContact.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="default" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;