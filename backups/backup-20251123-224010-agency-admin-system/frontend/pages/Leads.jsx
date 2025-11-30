import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Filter, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getLeadStatusColor, formatDate, formatCurrency } from '@/lib/utils';
import LeadImportModal from '@/components/LeadImportModal';
import EnhancedLeadImportModal from '@/components/EnhancedLeadImportModal';
import CreateLeadModal from '@/components/CreateLeadModal';
import FilterModal from '@/components/FilterModal';
import { MondayTable } from '@/components/MondayTable';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { InfoTooltipInline } from '@/components/ui/info-tooltip';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEnhancedImportModalOpen, setIsEnhancedImportModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const { toast } = useToast();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.get(`${API_BASE_URL}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(response.data);
      setFilteredLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leads.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleLeadCreated = (newLead) => {
    setLeads((prevLeads) => [newLead, ...prevLeads]);
    setFilteredLeads((prevLeads) => [newLead, ...prevLeads]);
  };

  // Handle filter
  const handleFilter = () => {
    setIsFilterModalOpen(true);
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);

    let filtered = [...leads];

    if (filters.status) {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter(lead => lead.type === filters.type);
    }

    if (filters.minValue) {
      filtered = filtered.filter(lead => (lead.value || 0) >= filters.minValue);
    }
    if (filters.maxValue) {
      filtered = filtered.filter(lead => (lead.value || 0) <= filters.maxValue);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(lead =>
        new Date(lead.created_at) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(lead =>
        new Date(lead.created_at) <= new Date(filters.dateTo + 'T23:59:59')
      );
    }

    setFilteredLeads(filtered);

    const activeFilterCount = Object.keys(filters).filter(key => filters[key]).length;
    if (activeFilterCount > 0) {
      toast({
        title: "Filters Applied",
        description: `Showing ${filtered.length} of ${leads.length} leads with ${activeFilterCount} filter(s) active.`,
      });
    }
  };

  // Handle export leads to CSV
  const handleExport = () => {
    try {
      const csvHeaders = ['Name', 'Email', 'Phone', 'Status', 'Type', 'Value', 'Created'];
      const csvRows = leads.map(lead => [
        lead.name,
        lead.email,
        lead.phone || '',
        lead.status,
        lead.type || '',
        lead.value || 0,
        formatDate(lead.created_at),
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${leads.length} leads to CSV.`,
      });
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export leads. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle import
  const handleImport = () => {
    setIsEnhancedImportModalOpen(true);
  };

  const handleLeadsImported = (importedLeads) => {
    setLeads((prevLeads) => [...importedLeads, ...prevLeads]);
    setIsEnhancedImportModalOpen(false);
    toast({
      title: "Import Successful",
      description: `Successfully imported ${importedLeads.length} leads.`,
    });
  };

  // Handle convert to opportunity
  const handleConvertToOpportunity = async () => {
    if (!selectedLead) return;

    try {
      const token = localStorage.getItem('supabase.auth.token');
      await axios.post(`${API_BASE_URL}/api/opportunities`, {
        name: selectedLead.name,
        email: selectedLead.email,
        phone: selectedLead.phone,
        value: selectedLead.value,
        leadId: selectedLead.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Converted to Opportunity",
        description: `${selectedLead.name} has been converted to an opportunity.`,
      });

      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      console.error('Error converting to opportunity:', error);
      toast({
        title: "Conversion Failed",
        description: "Failed to convert lead to opportunity. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle add contact
  const handleAddContact = async () => {
    if (!selectedLead) return;

    try {
      const token = localStorage.getItem('supabase.auth.token');
      await axios.post(`${API_BASE_URL}/api/contacts`, {
        name: selectedLead.name,
        email: selectedLead.email,
        phone: selectedLead.phone,
        leadId: selectedLead.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Contact Added",
        description: `${selectedLead.name} has been added to contacts.`,
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Failed to Add Contact",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle cell edit
  const handleCellEdit = async (leadId, columnKey, value) => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      await axios.patch(
        `${API_BASE_URL}/api/leads/${leadId}`,
        { [columnKey]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === leadId ? { ...lead, [columnKey]: value } : lead
        )
      );
      setFilteredLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === leadId ? { ...lead, [columnKey]: value } : lead
        )
      );

      toast({
        title: "Updated",
        description: "Lead updated successfully.",
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update lead. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Monday table columns configuration
  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        editable: true,
        width: 200,
      },
      {
        key: 'email',
        label: 'Email',
        type: 'text',
        editable: true,
        width: 220,
      },
      {
        key: 'phone',
        label: 'Phone',
        type: 'text',
        editable: true,
        width: 150,
      },
      {
        key: 'status',
        label: 'Status',
        type: 'status',
        editable: false,
        width: 150,
      },
      {
        key: 'type',
        label: 'Type',
        type: 'text',
        editable: true,
        width: 140,
      },
      {
        key: 'owner_id',
        label: 'People',
        type: 'person',
        editable: false,
        width: 150,
      },
      {
        key: 'created_at',
        label: 'Date',
        type: 'date',
        editable: false,
        width: 140,
      },
      {
        key: 'value',
        label: 'Value',
        type: 'text',
        editable: true,
        width: 120,
      },
    ],
    []
  );

  // Transform leads data for Monday table
  const tableData = useMemo(() => {
    return filteredLeads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      type: lead.type,
      owner_id: lead.owner_id || 'Unassigned',
      created_at: lead.created_at,
      value: formatCurrency(lead.value || 0),
      _original: lead, // Keep original for detail panel
    }));
  }, [filteredLeads]);

  return (
    <div className="h-full flex flex-col crm-page-wrapper bg-white">
      {/* Page Header - KEEPING AS IS */}
      <div className="relative bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Leads
              <span className="ml-3 text-[#791C14]">●</span>
            </h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Manage and track your sales leads with powerful filtering
            </p>
          </div>

          <div className="crm-button-group">
            <Button variant="outline" size="default" className="gap-2" onClick={handleFilter}>
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" size="default" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button variant="outline" size="default" className="gap-2" onClick={handleImport}>
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </Button>
            <Button variant="default" size="default" className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>New Lead</span>
            </Button>
          </div>
        </div>

        {/* Stats - KEEPING AS IS */}
        <div className="crm-stats-grid mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
              Total Leads
              <InfoTooltipInline content="All leads in your pipeline" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {leads.length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide flex items-center">
              Qualified
              <InfoTooltipInline content="Leads marked as qualified and ready for conversion" />
            </div>
            <div className="text-3xl font-bold text-emerald-600 mt-2">
              {leads.filter((l) => l.status === 'QUALIFIED').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center">
              Contacted
              <InfoTooltipInline content="Leads you've already reached out to" />
            </div>
            <div className="text-3xl font-bold text-amber-600 mt-2">
              {leads.filter((l) => l.status === 'CONTACTED').length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-[#791C14]/30 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-[#791C14] uppercase tracking-wide flex items-center">
              Total Value
              <InfoTooltipInline content="Combined potential value of all leads" />
            </div>
            <div className="text-3xl font-bold text-[#791C14] mt-2">
              {formatCurrency(leads.reduce((sum, l) => sum + (l.value || 0), 0))}
            </div>
          </div>
        </div>
      </div>

      {/* Monday Table - NEW */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#791C14] mb-4"></div>
              <p className="text-gray-600 font-medium">Loading leads...</p>
            </div>
          </div>
        ) : (
          <MondayTable
            data={tableData}
            columns={columns}
            groups="status"
            onAddItem={() => setIsCreateModalOpen(true)}
            onRowClick={(row) => setSelectedLead(row._original)}
            onCellEdit={handleCellEdit}
            searchPlaceholder="Search leads..."
            newItemLabel="New Lead"
            enableSearch={true}
            enableGroups={true}
          />
        )}
      </div>

      {/* Lead Detail Panel (Right Sidebar) */}
      {selectedLead && (
        <div className="fixed inset-0 sm:right-0 sm:left-auto sm:top-16 sm:bottom-0 w-full sm:w-96 bg-white dark:bg-[#1a1d24] border-l border-crm-border shadow-lg overflow-y-auto z-50 sm:z-auto">
          <div className="p-6 pt-20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{selectedLead.name}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLead(null)}>
                Close
              </Button>
            </div>
            <p className="text-sm text-crm-text-secondary mt-1">
              {selectedLead.email}
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <div className="text-xs font-semibold text-crm-text-secondary uppercase">
                  Status
                </div>
                <Badge variant={getLeadStatusColor(selectedLead.status)} className="mt-1">
                  {selectedLead.status}
                </Badge>
              </div>

              <div>
                <div className="text-xs font-semibold text-crm-text-secondary uppercase">
                  Type
                </div>
                <div className="mt-1">{selectedLead.type}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-crm-text-secondary uppercase">
                  Potential Value
                </div>
                <div className="text-lg font-semibold mt-1">
                  {formatCurrency(selectedLead.value)}
                </div>
              </div>

              {selectedLead.phone && (
                <div>
                  <div className="text-xs font-semibold text-crm-text-secondary uppercase">
                    Phone
                  </div>
                  <div className="mt-1">{selectedLead.phone}</div>
                </div>
              )}

              {selectedLead.website && (
                <div>
                  <div className="text-xs font-semibold text-crm-text-secondary uppercase">
                    Website
                  </div>
                  <div className="mt-1">
                    <a href={selectedLead.website} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
                      {selectedLead.website}
                    </a>
                  </div>
                </div>
              )}

              {selectedLead.address && (
                <div>
                  <div className="text-xs font-semibold text-crm-text-secondary uppercase">
                    Address
                  </div>
                  <div className="mt-1">
                    {selectedLead.address.street && <div>{selectedLead.address.street}</div>}
                    {selectedLead.address.city && <div>{selectedLead.address.city}, {selectedLead.address.state} {selectedLead.address.zip}</div>}
                    {selectedLead.address.country && <div>{selectedLead.address.country}</div>}
                  </div>
                </div>
              )}

              {selectedLead.owner_id && (
                <div>
                  <div className="text-xs font-semibold text-crm-text-secondary uppercase">
                    Owner
                  </div>
                  <div className="mt-1">{selectedLead.owner_id}</div>
                </div>
              )}

              <div>
                <div className="text-xs font-semibold text-crm-text-secondary uppercase">
                  Created
                </div>
                <div className="mt-1">{formatDate(selectedLead.created_at)}</div>
              </div>

              {Object.keys(selectedLead.custom_fields || {}).length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-crm-text-secondary uppercase">
                    Custom Fields
                  </div>
                  {Object.entries(selectedLead.custom_fields).map(([key, value]) => (
                    <div key={key} className="mt-1 text-sm">
                      <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {value}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="default" className="flex-1" onClick={handleConvertToOpportunity}>
                Convert to Opportunity
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleAddContact}>
                Add Contact
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onLeadCreated={handleLeadCreated}
      />

      <EnhancedLeadImportModal
        isOpen={isEnhancedImportModalOpen}
        onClose={() => setIsEnhancedImportModalOpen(false)}
        onLeadsImported={handleLeadsImported}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={applyFilters}
        filterType="leads"
        currentFilters={activeFilters}
      />
    </div>
  );
}
