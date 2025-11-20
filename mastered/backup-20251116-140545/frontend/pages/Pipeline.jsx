import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Upload, Eye, Edit3, Trash2, Target, DollarSign, Calendar, User, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Pipeline = () => {
  const [stages, setStages] = useState([
    {
      id: 'new',
      name: 'New',
      displayOrder: 1,
      category: 'ACTIVE',
      probabilityDefault: 10,
      deals: [
        {
          id: 'deal_1',
          name: 'Acme Corporation Deal',
          leadId: 'lead_1',
          leadName: 'Sarah Johnson',
          leadCompany: 'Acme Corporation',
          amount: 50000,
          currency: 'USD',
          probability: 15,
          expectedCloseDate: new Date('2025-03-15'),
          status: 'OPEN',
          createdAt: new Date('2025-10-20'),
          ownerId: 'user_1',
          ownerName: 'Juan Romero',
          productType: 'AXOLOP_ECOMMERCE',
          tags: ['Hot Lead', 'Enterprise'],
          notes: 'Initial contact made, very interested in solution',
        },
        {
          id: 'deal_2',
          name: 'TechStart Inc Contract',
          leadId: 'lead_2',
          leadName: 'Michael Chen',
          leadCompany: 'TechStart Inc',
          amount: 75000,
          currency: 'USD',
          probability: 25,
          expectedCloseDate: new Date('2025-04-01'),
          status: 'OPEN',
          createdAt: new Date('2025-10-22'),
          ownerId: 'user_1',
          ownerName: 'Juan Romero',
          productType: 'AXOLOP_B2B',
          tags: ['Product Qualified', 'Startup'],
          notes: 'Demo scheduled for next week',
        },
      ]
    },
    {
      id: 'qualified',
      name: 'Qualified',
      displayOrder: 2,
      category: 'ACTIVE',
      probabilityDefault: 40,
      deals: [
        {
          id: 'deal_3',
          name: 'Digital Ventures Project',
          leadId: 'lead_3',
          leadName: 'Emma Rodriguez',
          leadCompany: 'Digital Ventures',
          amount: 120000,
          currency: 'USD',
          probability: 50,
          expectedCloseDate: new Date('2025-02-28'),
          status: 'OPEN',
          createdAt: new Date('2025-10-15'),
          ownerId: 'user_1',
          ownerName: 'Juan Romero',
          productType: 'AXOLOP_ECOMMERCE',
          tags: ['Hot Lead', 'Enterprise'],
          notes: 'Proposal sent, waiting for feedback',
        },
      ]
    },
    {
      id: 'proposal',
      name: 'Proposal Sent',
      displayOrder: 3,
      category: 'ACTIVE',
      probabilityDefault: 70,
      deals: [
        {
          id: 'deal_4',
          name: 'Innovate Solutions Contract',
          leadId: 'lead_4',
          leadName: 'David Kim',
          leadCompany: 'Innovate Solutions',
          amount: 85000,
          currency: 'USD',
          probability: 75,
          expectedCloseDate: new Date('2025-01-31'),
          status: 'OPEN',
          createdAt: new Date('2025-10-10'),
          ownerId: 'user_1',
          ownerName: 'Juan Romero',
          productType: 'AXOLOP_REAL_ESTATE',
          tags: ['Warm Lead'],
          notes: 'Proposal under review, positive feedback received',
        }
      ]
    },
    {
      id: 'negotiation',
      name: 'Negotiation',
      displayOrder: 4,
      category: 'ACTIVE',
      probabilityDefault: 85,
      deals: [
        {
          id: 'deal_5',
          name: 'Global Corp Deal',
          leadId: 'lead_5',
          leadName: 'James Wilson',
          leadCompany: 'Global Corp',
          amount: 200000,
          currency: 'USD',
          probability: 90,
          expectedCloseDate: new Date('2025-01-15'),
          status: 'OPEN',
          createdAt: new Date('2025-10-05'),
          ownerId: 'user_1',
          ownerName: 'Juan Romero',
          productType: 'AXOLOP_ECOMMERCE',
          tags: ['Hot Lead', 'Enterprise'],
          notes: 'Final negotiations in progress',
        }
      ]
    },
    {
      id: 'won',
      name: 'Won',
      displayOrder: 5,
      category: 'WON',
      probabilityDefault: 100,
      deals: [
        {
          id: 'deal_6',
          name: 'Success Inc Partnership',
          leadId: 'lead_6',
          leadName: 'Lisa Thompson',
          leadCompany: 'Success Inc',
          amount: 65000,
          currency: 'USD',
          probability: 100,
          expectedCloseDate: new Date('2025-09-30'),
          status: 'WON',
          closedAt: new Date('2025-10-01'),
          wonAt: new Date('2025-10-01'),
          createdAt: new Date('2025-08-15'),
          ownerId: 'user_1',
          ownerName: 'Juan Romero',
          productType: 'AXOLOP_B2B',
          tags: ['Hot Lead'],
          notes: 'Deal closed successfully',
        }
      ]
    },
    {
      id: 'lost',
      name: 'Lost',
      displayOrder: 6,
      category: 'LOST',
      probabilityDefault: 0,
      deals: [
        {
          id: 'deal_7',
          name: 'Competitor Corp Deal',
          leadId: 'lead_7',
          leadName: 'Robert Davis',
          leadCompany: 'Competitor Corp',
          amount: 45000,
          currency: 'USD',
          probability: 0,
          expectedCloseDate: new Date('2025-08-15'),
          status: 'LOST',
          closedAt: new Date('2025-09-15'),
          lostAt: new Date('2025-09-15'),
          closedReason: 'Competitor offered better price',
          createdAt: new Date('2025-07-01'),
          ownerId: 'user_1',
          ownerName: 'Juan Romero',
          productType: 'AXOLOP_ECOMMERCE',
          tags: ['Warm Lead'],
          notes: 'Lost to competitor',
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeal, setSelectedDeal] = useState(null);

  const handleDealSelect = (deal) => {
    setSelectedDeal(deal);
  };

  const handleCreateDeal = () => {
    // In a real app, this would open a form to create a new deal
    console.log('Create new deal');
  };

  const handleExport = () => {
    // In a real app, this would export the pipeline data
    alert('Exporting pipeline...');
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

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-crm-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-crm-text-primary">Pipeline</h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              Track deals through your sales process
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
            <Button variant="default" size="default" className="gap-2" onClick={handleCreateDeal}>
              <Plus className="h-4 w-4" />
              <span>New Deal</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-blue/10">
                <Target className="h-5 w-5 text-primary-blue" />
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
              <div className="p-2 rounded-lg bg-primary-blue/10">
                <Calendar className="h-5 w-5 text-primary-blue" />
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
                <div className="mb-4 p-3 rounded-lg bg-primary-blue/10 border border-primary-blue/20">
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
                        
                        <div className="mt-2 flex flex-wrap gap-1">
                          {deal.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
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
            <Button variant="default" size="default" className="gap-2" onClick={handleCreateDeal}>
              <Plus className="h-4 w-4" />
              <span>Create Your First Deal</span>
            </Button>
          </div>
        )}
      </div>

      {/* Deal Detail Panel (Right Sidebar) */}
      {selectedDeal && (
        <div className="fixed right-0 top-16 bottom-0 w-96 bg-white border-l border-crm-border shadow-lg z-50">
          <div className="p-6">
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

              <div className="flex gap-2">
                <Button variant="default" className="flex-1">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Deal
                </Button>
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
};

export default Pipeline;