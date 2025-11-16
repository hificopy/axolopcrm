import { useState, useEffect } from 'react';
import { Plus, Filter, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getLeadStatusColor, formatDate, formatCurrency } from '@/lib/utils';
import LeadImportModal from '@/components/LeadImportModal'; // Import LeadImportModal
import CreateLeadModal from '@/components/CreateLeadModal'; // Import CreateLeadModal
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // State for CreateLeadModal
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('supabase.auth.token'); // Assuming token is stored here
      const response = await axios.get(`${API_BASE_URL}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(response.data);
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
  };

  const handleLeadCreated = (newLead) => {
    setLeads((prevLeads) => [newLead, ...prevLeads]);
  };

  return (
    <div className="h-full flex flex-col crm-page-wrapper">
      {/* Page Header */}
      <div className="bg-white border-b border-crm-border px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-crm-text-primary">Leads</h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              Manage and track your sales leads
            </p>
          </div>

          <div className="crm-button-group">
            <Button variant="outline" size="default" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" size="default" className="gap-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <LeadImportModal> {/* Wrap the Import button with LeadImportModal */}
              <Button variant="outline" size="default" className="gap-2">
                <Upload className="h-4 w-4" />
                <span>Import</span>
              </Button>
            </LeadImportModal>
            <Button variant="default" size="default" className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>New Lead</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="crm-stats-grid mt-4">
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="text-sm text-crm-text-secondary">Total Leads</div>
            <div className="2xl font-semibold text-crm-text-primary mt-1">
              {leads.length}
            </div>
          </div>
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="text-sm text-crm-text-secondary">Qualified</div>
            <div className="2xl font-semibold text-primary-green mt-1">
              {leads.filter((l) => l.status === 'QUALIFIED').length}
            </div>
          </div>
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="text-sm text-crm-text-secondary">Contacted</div>
            <div className="2xl font-semibold text-primary-yellow mt-1">
              {leads.filter((l) => l.status === 'CONTACTED').length}
            </div>
          </div>
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="text-sm text-crm-text-secondary">Total Value</div>
            <div className="2xl font-semibold text-crm-text-primary mt-1">
              {formatCurrency(leads.reduce((sum, l) => sum + (l.value || 0), 0))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="card-crm rounded-lg border border-crm-border crm-table-wrapper">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading leads...</TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No leads found.</TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow 
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">
                      {lead.name}
                    </TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>
                      <Badge variant={getLeadStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.type}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(lead.value)}
                    </TableCell>
                    <TableCell>
                      {formatDate(lead.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Empty State */}
          {!loading && leads.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">No leads found</div>
              <Button variant="default" size="default" className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4" />
                <span>Add Your First Lead</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Lead Detail Panel (Right Sidebar) */}
      {selectedLead && (
        <div className="fixed right-0 top-16 bottom-0 w-96 bg-white border-l border-crm-border shadow-lg overflow-y-auto">
          <div className="p-6">
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
                    <a href={selectedLead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
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
                  {/* This would ideally fetch owner name from user_id */}
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
              <Button variant="default" className="flex-1">
                Convert to Opportunity
              </Button>
              <Button variant="outline" className="flex-1">
                Add Contact
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
