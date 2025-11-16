import { useState } from 'react';
import { Plus, Filter, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getLeadStatusColor, formatDate, formatCurrency } from '@/lib/utils';
import LeadImportModal from '@/components/LeadImportModal'; // Import LeadImportModal

// Mock data for demonstration
const mockLeads = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '(555) 123-4567',
    status: 'QUALIFIED',
    source: 'Website',
    value: 50000,
    owner: 'Juan Romero',
    createdAt: new Date('2025-11-01'),
  },
  {
    id: '2',
    name: 'TechStart Inc',
    email: 'hello@techstart.com',
    phone: '(555) 234-5678',
    status: 'CONTACTED',
    source: 'Referral',
    value: 75000,
    owner: 'Juan Romero',
    createdAt: new Date('2025-11-05'),
  },
  {
    id: '3',
    name: 'Digital Ventures',
    email: 'info@digitalventures.com',
    phone: '(555) 345-6789',
    status: 'NEW',
    source: 'LinkedIn',
    value: 35000,
    owner: 'Juan Romero',
    createdAt: new Date('2025-11-08'),
  },
];

export default function Leads() {
  const [leads] = useState(mockLeads);
  const [selectedLead, setSelectedLead] = useState(null);

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
            <Button variant="default" size="default" className="gap-2">
              <Plus className="h-4 w-4" />
              <span>New Lead</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="crm-stats-grid mt-4">
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="text-sm text-crm-text-secondary">Total Leads</div>
            <div className="text-2xl font-semibold text-crm-text-primary mt-1">
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
            <div className="text-2xl font-semibold text-primary-yellow mt-1">
              {leads.filter((l) => l.status === 'CONTACTED').length}
            </div>
          </div>
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="text-sm text-crm-text-secondary">Total Value</div>
            <div className="text-2xl font-semibold text-crm-text-primary mt-1">
              {formatCurrency(leads.reduce((sum, l) => sum + l.value, 0))}
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
                <TableHead>Source</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
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
                  <TableCell>{lead.source}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(lead.value)}
                  </TableCell>
                  <TableCell>{lead.owner}</TableCell>
                  <TableCell>
                    {formatDate(lead.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Empty State */}
          {leads.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">No leads found</div>
              <Button variant="default" size="default" className="gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Your First Lead</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Lead Detail Panel (Right Sidebar) */}
      {selectedLead && (
        <div className="fixed right-0 top-16 bottom-0 w-96 bg-white border-l border-crm-border shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold">{selectedLead.name}</h2>
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
                  Potential Value
                </div>
                <div className="text-lg font-semibold mt-1">
                  {formatCurrency(selectedLead.value)}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-crm-text-secondary uppercase">
                  Owner
                </div>
                <div className="mt-1">{selectedLead.owner}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-crm-text-secondary uppercase">
                  Created
                </div>
                <div className="mt-1">{formatDate(selectedLead.createdAt)}</div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="default" className="flex-1">
                Convert to Contact
              </Button>
              <Button variant="outline" onClick={() => setSelectedLead(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
