import { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, Download, Eye, Edit3, Trash2, DollarSign, Calendar, User, TrendingUp, Target, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';
import { dealsApi } from '@/lib/api';
import { InfoTooltipInline } from '@/components/ui/info-tooltip';
import { useAgency } from '@/context/AgencyContext';
import ViewOnlyBadge from '@/components/ui/view-only-badge';

export default function Opportunities() {
  const { toast } = useToast();
  const { isReadOnly, canEdit, canCreate } = useAgency();
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('ALL');

  // Fetch opportunities from API
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await dealsApi.getAll();
      setOpportunities(response.data);
      setFilteredOpportunities(response.data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load opportunities.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Filter opportunities based on search and stage
  useEffect(() => {
    let filtered = opportunities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(opp =>
        opp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.lead?.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by stage
    if (filterStage !== 'ALL') {
      filtered = filtered.filter(opp => opp.stage === filterStage);
    }

    setFilteredOpportunities(filtered);
  }, [searchTerm, filterStage, opportunities]);

  const handleExport = () => {
    try {
      const csvHeaders = ['Name', 'Lead', 'Company', 'Stage', 'Amount', 'Probability', 'Expected Close', 'Status', 'Owner'];
      const csvRows = opportunities.map(opp => [
        opp.name,
        opp.lead?.name || 'N/A',
        opp.lead?.company || 'N/A',
        opp.stage || 'NEW',
        opp.amount || 0,
        opp.probability || 0,
        opp.expected_close_date || '',
        opp.status || 'OPEN',
        opp.owner?.name || 'Unassigned',
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `opportunities-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${opportunities.length} opportunities to CSV.`,
      });
    } catch (error) {
      console.error('Error exporting opportunities:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export opportunities. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      'NEW': 'default',
      'QUALIFIED': 'secondary',
      'PROPOSAL': 'outline',
      'NEGOTIATION': 'outline',
      'WON': 'success',
      'LOST': 'destructive',
    };
    return colors[stage] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      'OPEN': 'default',
      'WON': 'success',
      'LOST': 'destructive',
      'CANCELLED': 'secondary',
    };
    return colors[status] || 'default';
  };

  const calculateStats = () => {
    const totalValue = opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
    const weightedValue = opportunities.reduce((sum, opp) =>
      sum + ((opp.amount || 0) * (opp.probability || 0) / 100), 0
    );
    const wonDeals = opportunities.filter(opp => opp.status === 'WON').length;
    const totalDeals = opportunities.filter(opp => opp.status !== 'CANCELLED').length;
    const winRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;

    return { totalValue, weightedValue, winRate };
  };

  const stats = calculateStats();

  return (
    <div className="h-full flex flex-col crm-page-wrapper bg-white">
      {/* Page Header */}
      <div className="relative bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Opportunities
                <span className="ml-3 text-[#791C14]">●</span>
              </h1>
              {isReadOnly() && <ViewOnlyBadge />}
            </div>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              {isReadOnly()
                ? 'View sales opportunities throughout your pipeline - Read-only access'
                : 'Track and manage sales opportunities throughout your pipeline'
              }
            </p>
          </div>

          <div className="crm-button-group">
            <Button variant="outline" size="default" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            {canCreate() && (
              <Button variant="default" size="default" className="gap-2 bg-[#791C14] hover:bg-[#6b1a12]">
                <Plus className="h-4 w-4" />
                <span>New Opportunity</span>
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="crm-stats-grid mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-blue/10">
                <Target className="h-5 w-5 text-primary-blue" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
                  Total Opportunities
                  <InfoTooltipInline content="All active opportunities in your pipeline" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{opportunities.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-green/10">
                <DollarSign className="h-5 w-5 text-primary-green" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide flex items-center">
                  Potential Value
                  <InfoTooltipInline content="Total value of all opportunities if all close" />
                </div>
                <div className="text-3xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.totalValue)}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-yellow/10">
                <TrendingUp className="h-5 w-5 text-primary-yellow" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center">
                  Weighted Value
                  <InfoTooltipInline content="Expected value based on probability of each deal closing" />
                </div>
                <div className="text-3xl font-bold text-amber-600 mt-1">{formatCurrency(stats.weightedValue)}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-[#791C14]/30 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#791C14]/10">
                <TrendingUp className="h-5 w-5 text-[#791C14]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#791C14] uppercase tracking-wide flex items-center">
                  Win Rate
                  <InfoTooltipInline content="Percentage of opportunities that result in won deals" />
                </div>
                <div className="text-3xl font-bold text-[#791C14] mt-1">{stats.winRate}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mt-6">
          <div className="flex-1">
            <Input
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#791C14]"
          >
            <option value="ALL">All Stages</option>
            <option value="NEW">New</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-gray-50 border-b-2 border-gray-200">
                <TableHead className="font-bold text-gray-700">Name</TableHead>
                <TableHead className="font-bold text-gray-700">Lead</TableHead>
                <TableHead className="font-bold text-gray-700">Company</TableHead>
                <TableHead className="font-bold text-gray-700">Stage</TableHead>
                <TableHead className="font-bold text-gray-700">Amount</TableHead>
                <TableHead className="font-bold text-gray-700">Probability</TableHead>
                <TableHead className="font-bold text-gray-700">Expected Close</TableHead>
                <TableHead className="font-bold text-gray-700">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#791C14] mb-4"></div>
                      <p className="text-gray-600 font-medium">Loading opportunities...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredOpportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <Target className="h-16 w-16 text-[#791C14]/30 mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No opportunities found</h3>
                      <p className="text-gray-600 mb-6">
                        {searchTerm || filterStage !== 'ALL'
                          ? 'Try adjusting your filters'
                          : 'Get started by creating your first opportunity'}
                      </p>
                      {!searchTerm && filterStage === 'ALL' && canCreate() && (
                        <Button variant="default" size="default" className="gap-2 bg-[#791C14] hover:bg-[#6b1a12]">
                          <Plus className="h-4 w-4" />
                          <span>Add Your First Opportunity</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOpportunities.map((opp) => (
                  <TableRow
                    key={opp.id}
                    onClick={() => setSelectedOpportunity(opp)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
                  >
                    <TableCell className="font-semibold text-gray-900">{opp.name}</TableCell>
                    <TableCell className="text-gray-600">{opp.lead?.name || 'N/A'}</TableCell>
                    <TableCell className="text-gray-600">{opp.lead?.company || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getStageColor(opp.stage)} className="font-medium">
                        {opp.stage || 'NEW'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-[#791C14]">
                      {formatCurrency(opp.amount || 0)}
                    </TableCell>
                    <TableCell className="text-gray-600">{opp.probability || 0}%</TableCell>
                    <TableCell className="text-gray-500">
                      {formatDate(opp.expected_close_date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(opp.status)} className="font-medium">
                        {opp.status || 'OPEN'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Opportunity Detail Panel - Added pt-20 to avoid Chat/Tasks buttons overlap */}
      {selectedOpportunity && (
        <div className="fixed inset-0 sm:right-0 sm:left-auto sm:top-16 sm:bottom-0 w-full sm:w-96 bg-white dark:bg-[#1a1d24] border-l border-crm-border shadow-lg z-50 overflow-y-auto">
          <div className="p-6 pt-20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selectedOpportunity.name}</h2>
                <p className="text-sm text-crm-text-secondary">
                  {selectedOpportunity.lead?.name} - {selectedOpportunity.lead?.company}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOpportunity(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                  Opportunity Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Value</span>
                    <span className="text-sm font-medium">{formatCurrency(selectedOpportunity.amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Probability</span>
                    <span className="text-sm font-medium">{selectedOpportunity.probability || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Stage</span>
                    <Badge variant={getStageColor(selectedOpportunity.stage)}>
                      {selectedOpportunity.stage || 'NEW'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Status</span>
                    <Badge variant={getStatusColor(selectedOpportunity.status)}>
                      {selectedOpportunity.status || 'OPEN'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Expected Close</span>
                    <span className="text-sm font-medium">{formatDate(selectedOpportunity.expected_close_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Owner</span>
                    <span className="text-sm font-medium">{selectedOpportunity.owner?.name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              {selectedOpportunity.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                    Notes
                  </h3>
                  <p className="text-sm">{selectedOpportunity.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                {canEdit() && (
                  <Button variant="default" className="flex-1">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button variant="outline" className="flex-1">
                  <User className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
