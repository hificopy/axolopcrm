import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Download, Upload, Eye, Edit3, Trash2, Target, DollarSign, Calendar, User, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { dealsApi } from '@/lib/api';
import { useAgency } from '@/hooks/useAgency';
import ViewOnlyBadge from '@/components/ui/view-only-badge';

const Pipeline = () => {
  const { toast } = useToast();
  const { isReadOnly, canEdit, canCreate } = useAgency();
  const [opportunities, setOpportunities] = useState([]);
  const [stages, setStages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch opportunities from API
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await dealsApi.getAll();
      const data = response.data;
      setOpportunities(data);

      // Group opportunities by stage
      const stageMap = {
        'NEW': { id: 'new', name: 'New', displayOrder: 1, category: 'ACTIVE', probabilityDefault: 10, deals: [] },
        'QUALIFIED': { id: 'qualified', name: 'Qualified', displayOrder: 2, category: 'ACTIVE', probabilityDefault: 40, deals: [] },
        'PROPOSAL': { id: 'proposal', name: 'Proposal Sent', displayOrder: 3, category: 'ACTIVE', probabilityDefault: 70, deals: [] },
        'NEGOTIATION': { id: 'negotiation', name: 'Negotiation', displayOrder: 4, category: 'ACTIVE', probabilityDefault: 85, deals: [] },
        'WON': { id: 'won', name: 'Won', displayOrder: 5, category: 'WON', probabilityDefault: 100, deals: [] },
        'LOST': { id: 'lost', name: 'Lost', displayOrder: 6, category: 'LOST', probabilityDefault: 0, deals: [] },
      };

      // Group opportunities by stage
      data.forEach(opp => {
        const stage = opp.stage || 'NEW';
        if (stageMap[stage]) {
          stageMap[stage].deals.push({
            id: opp.id,
            name: opp.name,
            leadId: opp.lead_id,
            leadName: opp.lead?.name || 'Unknown',
            leadCompany: opp.lead?.company || 'Unknown Company',
            amount: opp.amount || 0,
            currency: opp.currency || 'USD',
            probability: opp.probability || stageMap[stage].probabilityDefault,
            expectedCloseDate: opp.expected_close_date ? new Date(opp.expected_close_date) : null,
            status: opp.status || 'OPEN',
            closedAt: opp.closed_at ? new Date(opp.closed_at) : null,
            wonAt: opp.won_at ? new Date(opp.won_at) : null,
            lostAt: opp.lost_at ? new Date(opp.lost_at) : null,
            closedReason: opp.closed_reason,
            createdAt: new Date(opp.created_at),
            ownerId: opp.owner_id,
            ownerName: opp.owner?.name || 'Unassigned',
            productType: opp.product_type || 'General',
            tags: opp.tags || [],
            notes: opp.notes || '',
          });
        }
      });

      setStages(Object.values(stageMap));
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pipeline data.',
        variant: 'destructive',
      });

      // Set empty stages structure on error
      setStages([
        { id: 'new', name: 'New', displayOrder: 1, category: 'ACTIVE', probabilityDefault: 10, deals: [] },
        { id: 'qualified', name: 'Qualified', displayOrder: 2, category: 'ACTIVE', probabilityDefault: 40, deals: [] },
        { id: 'proposal', name: 'Proposal Sent', displayOrder: 3, category: 'ACTIVE', probabilityDefault: 70, deals: [] },
        { id: 'negotiation', name: 'Negotiation', displayOrder: 4, category: 'ACTIVE', probabilityDefault: 85, deals: [] },
        { id: 'won', name: 'Won', displayOrder: 5, category: 'WON', probabilityDefault: 100, deals: [] },
        { id: 'lost', name: 'Lost', displayOrder: 6, category: 'LOST', probabilityDefault: 0, deals: [] },
      ]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleDealSelect = (deal) => {
    setSelectedDeal(deal);
  };

  const handleCreateDeal = () => {
    toast({
      title: "Create Deal",
      description: "Deal creation form coming soon!",
    });
  };

  const handleExport = () => {
    try {
      const csvHeaders = ['Name', 'Stage', 'Amount', 'Probability', 'Expected Close', 'Status', 'Owner'];
      const csvRows = opportunities.map(opp => [
        opp.name,
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
      link.setAttribute('download', `pipeline-export-${new Date().toISOString().split('T')[0]}.csv`);
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
      console.error('Error exporting pipeline:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export pipeline. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  const calculateStageMetrics = (deals) => {
    const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);
    const weightedValue = deals.reduce((sum, deal) => sum + (deal.amount * deal.probability / 100), 0);
    return {
      totalValue,
      weightedValue,
      count: deals.length
    };
  };

  if (loading) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center pt-[150px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F0D28] mx-auto mb-4"></div>
          <p className="text-crm-text-secondary">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#1a1d24] border-b border-crm-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-crm-text-primary">Pipeline</h1>
              {isReadOnly() && <ViewOnlyBadge />}
            </div>
            <p className="text-sm text-crm-text-secondary mt-1">
              {isReadOnly()
                ? 'View deals through your sales process - Read-only access'
                : 'Track deals through your sales process'
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-crm-text-secondary" />
              <Input
                placeholder="Search deals..."
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
            {canCreate() && (
              <Button variant="default" size="default" className="gap-2" onClick={handleCreateDeal}>
                <Plus className="h-4 w-4" />
                <span>New Deal</span>
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-crm-text-secondary">Total Opportunities</div>
                <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                  {stages.reduce((total, stage) => total + stage.deals.length, 0)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-green/10">
                <DollarSign className="h-5 w-5 text-primary-green" />
              </div>
              <div>
                <div className="text-sm text-crm-text-secondary">Potential Value</div>
                <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                  {formatCurrency(stages.reduce((total, stage) =>
                    total + stage.deals.reduce((sum, deal) => sum + deal.amount, 0), 0))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-yellow/10">
                <TrendingUp className="h-5 w-5 text-primary-yellow" />
              </div>
              <div>
                <div className="text-sm text-crm-text-secondary">Weighted Value</div>
                <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                  {formatCurrency(stages.reduce((total, stage) =>
                    total + stage.deals.reduce((sum, deal) => sum + (deal.amount * deal.probability / 100), 0), 0))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-crm-text-secondary">Avg. Win Rate</div>
                <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                  {stages.length > 0
                    ? Math.round((stages.find(s => s.id === 'won')?.deals.length || 0) /
                      (stages.reduce((total, stage) => total + stage.deals.length, 0) - (stages.find(s => s.id === 'lost')?.deals.length || 0)) * 100) + '%'
                    : '0%'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex gap-6 min-w-max">
          {stages.map((stage) => {
            const metrics = calculateStageMetrics(stage.deals);
            return (
              <div key={stage.id} className="w-72 flex-shrink-0">
                <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-crm-text-primary">{stage.name}</h3>
                    <Badge variant="secondary">{metrics.count} deals</Badge>
                  </div>
                  <div className="mt-2 text-sm text-crm-text-secondary">
                    {formatCurrency(metrics.totalValue)}
                  </div>
                </div>

                <div className="space-y-3 min-h-96">
                  {stage.deals.map((deal) => (
                    <Card
                      key={deal.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleDealSelect(deal)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-crm-text-primary">{deal.name}</h4>
                          <Badge variant={deal.status === 'WON' ? 'success' : deal.status === 'LOST' ? 'destructive' : 'default'}>
                            {deal.status}
                          </Badge>
                        </div>

                        <p className="text-sm text-crm-text-secondary mb-2">{deal.leadName} - {deal.leadCompany}</p>

                        <div className="flex items-center gap-4 text-sm mb-2">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-primary-green" />
                            <span>{formatCurrency(deal.amount)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-primary-yellow" />
                            <span>{deal.probability}%</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-xs text-crm-text-secondary">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(deal.expectedCloseDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{deal.ownerName}</span>
                          </div>
                        </div>

                        {deal.tags && deal.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {deal.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {stages.every(stage => stage.deals.length === 0) && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="p-6 rounded-full bg-crm-bg-light mb-4">
              <Target className="h-12 w-12 text-crm-text-secondary mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-crm-text-primary mb-2">Your pipeline is empty</h3>
            <p className="text-crm-text-secondary mb-6">
              Get started by creating your first deal opportunity
            </p>
            {canCreate() && (
              <Button variant="default" size="default" className="gap-2" onClick={handleCreateDeal}>
                <Plus className="h-4 w-4" />
                <span>Create Your First Deal</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Deal Detail Panel (Right Sidebar) - Added pt-20 to avoid Chat/Tasks buttons overlap */}
      {selectedDeal && (
        <div className="fixed inset-0 sm:right-0 sm:left-auto sm:top-16 sm:bottom-0 w-full sm:w-96 bg-white dark:bg-[#1a1d24] border-l border-crm-border shadow-lg z-50 overflow-y-auto">
          <div className="p-6 pt-20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold">{selectedDeal.name}</h2>
                <p className="text-sm text-crm-text-secondary">{selectedDeal.leadName} - {selectedDeal.leadCompany}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDeal(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                  Deal Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Value</span>
                    <span className="text-sm font-medium">{formatCurrency(selectedDeal.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Probability</span>
                    <span className="text-sm font-medium">{selectedDeal.probability}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Expected Close</span>
                    <span className="text-sm font-medium">{formatDate(selectedDeal.expectedCloseDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Status</span>
                    <Badge variant={selectedDeal.status === 'WON' ? 'success' : selectedDeal.status === 'LOST' ? 'destructive' : 'default'}>
                      {selectedDeal.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Owner</span>
                    <span className="text-sm font-medium">{selectedDeal.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Product</span>
                    <span className="text-sm font-medium">{selectedDeal.productType}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                  Lead Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Name</span>
                    <span className="text-sm">{selectedDeal.leadName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">Company</span>
                    <span className="text-sm">{selectedDeal.leadCompany}</span>
                  </div>
                </div>
              </div>

              {selectedDeal.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                    Notes
                  </h3>
                  <p className="text-sm">{selectedDeal.notes}</p>
                </div>
              )}

              {selectedDeal.tags && selectedDeal.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDeal.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {canEdit() && (
                  <Button variant="default" className="min-w-[40px] flex-1 sm:flex-none">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Deal
                  </Button>
                )}
                <Button variant="outline" className="min-w-[40px] flex-1 sm:flex-none">
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
};

export default Pipeline;
