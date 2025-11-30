import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Download, Upload, Eye, Edit3, Trash2, User, Mail, Phone, Building2, Tag, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CreateContactModal from '@/components/CreateContactModal';
import FilterModal from '@/components/FilterModal';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { InfoTooltipInline } from '@/components/ui/info-tooltip';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const { toast } = useToast();

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.get(`${API_BASE_URL}/api/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(response.data);
      setFilteredContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contacts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]); // State setters are stable

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Filter contacts based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.title && contact.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredContacts(filtered);
    }
  }, [searchTerm, contacts]);

  const handleContactSelect = async (contactId) => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.get(`${API_BASE_URL}/api/contacts/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedContact(response.data);
    } catch (error) {
      console.error('Error fetching contact details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contact details.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateContact = () => {
    setIsCreateModalOpen(true);
  };

  const handleContactCreated = (newContact) => {
    setContacts((prevContacts) => [newContact, ...prevContacts]);
    setFilteredContacts((prevContacts) => [newContact, ...prevContacts]);
    setIsCreateModalOpen(false);
    toast({
      title: "Contact Created",
      description: "New contact has been added successfully.",
    });
  };

  const handleFilter = () => {
    setIsFilterModalOpen(true);
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);

    let filtered = [...contacts];

    // Apply company filter
    if (filters.hasCompany === 'yes') {
      filtered = filtered.filter(contact => contact.company && contact.company.trim() !== '');
    } else if (filters.hasCompany === 'no') {
      filtered = filtered.filter(contact => !contact.company || contact.company.trim() === '');
    }

    // Apply title filter
    if (filters.hasTitle === 'yes') {
      filtered = filtered.filter(contact => contact.title && contact.title.trim() !== '');
    } else if (filters.hasTitle === 'no') {
      filtered = filtered.filter(contact => !contact.title || contact.title.trim() === '');
    }

    // Apply date range filters
    if (filters.dateFrom) {
      filtered = filtered.filter(contact =>
        new Date(contact.created_at) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(contact =>
        new Date(contact.created_at) <= new Date(filters.dateTo + 'T23:59:59')
      );
    }

    setFilteredContacts(filtered);

    // Show toast with filter results
    const activeFilterCount = Object.keys(filters).filter(key => filters[key]).length;
    if (activeFilterCount > 0) {
      toast({
        title: "Filters Applied",
        description: `Showing ${filtered.length} of ${contacts.length} contacts with ${activeFilterCount} filter(s) active.`,
      });
    }
  };

  const handleExport = () => {
    try {
      const csvHeaders = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Title', 'Created'];
      const csvRows = contacts.map(contact => [
        contact.first_name,
        contact.last_name,
        contact.email,
        contact.phone || '',
        contact.company || '',
        contact.title || '',
        formatDate(contact.created_at),
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `contacts-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${contacts.length} contacts to CSV.`,
      });
    } catch (error) {
      console.error('Error exporting contacts:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export contacts. Please try again.",
        variant: "destructive",
      });
    }
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
    <div className="h-full flex flex-col bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Contacts
              <span className="ml-3 text-[#7b1c14]">●</span>
            </h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Manage and track your business contacts with powerful search
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
            <Button variant="outline" size="default" className="gap-2" onClick={handleFilter}>
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
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
              Total Contacts
              <InfoTooltipInline content="All contacts in your database" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {contacts.length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide flex items-center">
              Active This Month
              <InfoTooltipInline content="Contacts you've interacted with this month" />
            </div>
            <div className="text-3xl font-bold text-emerald-600 mt-2">
              {contacts.length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center">
              Companies
              <InfoTooltipInline content="Number of unique companies represented" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {[...new Set(contacts.map(c => c.lead_id))].filter(Boolean).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-[#7b1c14]/30 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-[#7b1c14] uppercase tracking-wide flex items-center">
              With Titles
              <InfoTooltipInline content="Contacts with job titles specified" />
            </div>
            <div className="text-3xl font-bold text-[#7b1c14] mt-2">
              {contacts.filter(c => c.title).length}
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
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#7b1c14] mb-6"></div>
            <p className="text-gray-700 font-medium text-lg">Loading contacts...</p>
            <p className="text-gray-500 text-sm mt-2">Fetching your business contacts</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="p-6 rounded-full bg-[#7b1c14]/10 mx-auto mb-6">
              <User className="h-16 w-16 text-[#7b1c14]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No contacts found</h3>
            <p className="text-gray-600 mb-6 max-w-md text-center">
              {searchTerm
                ? 'No contacts match your search. Try different keywords.'
                : 'Get started by creating your first contact.'}
            </p>
            <Button variant="default" size="default" className="gap-2 bg-[#7b1c14] hover:bg-[#6b1a12] px-8 py-3 text-base font-semibold shadow-lg" onClick={handleCreateContact}>
              <Plus className="h-5 w-5" />
              <span>Create Your First Contact</span>
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-gray-50 border-b-2 border-gray-200">
                  <TableHead className="font-bold text-gray-700">Name</TableHead>
                  <TableHead className="font-bold text-gray-700">Company</TableHead>
                  <TableHead className="font-bold text-gray-700">Title</TableHead>
                  <TableHead className="font-bold text-gray-700">Email</TableHead>
                  <TableHead className="font-bold text-gray-700">Phone</TableHead>
                  <TableHead className="font-bold text-gray-700">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    onClick={() => handleContactSelect(contact.id)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {contact.first_name?.charAt(0)}
                          {contact.last_name?.charAt(0)}
                        </div>
                        <span>{contact.first_name} {contact.last_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-crm-text-secondary" />
                        <span>{contact.leads?.name || 'N/A'}</span> {/* Display lead name */}
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
                    <TableCell>{formatDate(contact.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          // Cards view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <Card 
                key={contact.id} 
                className="hover:shadow-crm-hover transition-shadow cursor-pointer"
                onClick={() => handleContactSelect(contact.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                        {contact.first_name?.charAt(0)}
                        {contact.last_name?.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{contact.first_name} {contact.last_name}</CardTitle>
                        <p className="text-sm text-crm-text-secondary">{contact.title}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-crm-text-secondary" />
                      <span>{contact.lead_id || 'N/A'}</span>
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
                        <span className="text-crm-text-secondary">Created At</span>
                        <span className="font-medium">{formatDate(contact.created_at)}</span>
                      </div>
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

      {/* Contact Detail Panel (Right Sidebar) - Added pt-20 to avoid Chat/Tasks buttons overlap */}
      {selectedContact && (
        <div className="fixed inset-0 sm:right-0 sm:left-auto sm:top-16 sm:bottom-0 w-full sm:w-96 bg-white dark:bg-[#1a1d24] border-l border-crm-border shadow-lg z-50 overflow-y-auto">
          <div className="p-6 pt-20">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-2xl">
                  {selectedContact.first_name?.charAt(0)}
                  {selectedContact.last_name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedContact.first_name} {selectedContact.last_name}</h2>
                  <p className="text-sm text-crm-text-secondary">{selectedContact.title}</p>
                  {selectedContact.leads?.name && <p className="text-sm text-crm-text-secondary">Company: {selectedContact.leads.name}</p>}
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
                    <a href={`mailto:${selectedContact.email}`} className="text-sm text-primary hover:underline">
                      {selectedContact.email}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Phone</span>
                    <a href={`tel:${selectedContact.phone}`} className="text-sm text-primary hover:underline">
                      {selectedContact.phone}
                    </a>
                  </div>
                </div>
              </div>

              {selectedContact.leads?.name && (
                <div>
                  <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                    Associated Lead
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-crm-text-secondary">Lead Name</span>
                      <span className="text-sm">{selectedContact.leads.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-crm-text-secondary">Primary Contact</span>
                      <span className="text-sm">{selectedContact.is_primary_contact ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                  Engagement
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Created At</span>
                    <span className="text-sm">{formatDate(selectedContact.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Updated At</span>
                    <span className="text-sm">{formatDate(selectedContact.updated_at)}</span>
                  </div>
                </div>
              </div>

              {Object.keys(selectedContact.custom_fields || {}).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                    Custom Fields
                  </h3>
                  {Object.entries(selectedContact.custom_fields).map(([key, value]) => (
                    <div key={key} className="mt-1 text-sm">
                      <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {value}
                    </div>
                  ))}
                </div>
              )}

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

      {/* Create Contact Modal */}
      <CreateContactModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onContactCreated={handleContactCreated}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={applyFilters}
        filterType="contacts"
        currentFilters={activeFilters}
      />
    </div>
  );
};

export default Contacts;