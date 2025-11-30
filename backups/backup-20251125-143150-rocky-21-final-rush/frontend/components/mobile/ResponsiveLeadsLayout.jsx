import { useState, useMemo, useEffect } from 'react';
import { Users, Phone, Mail, Building2, Calendar, DollarSign, MoreVertical, Edit3, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getLeadStatusColor, formatDate, formatCurrency } from '@/lib/utils';

// Mobile lead card component
export const MobileLeadCard = ({ lead, onEdit, onDelete, onView, onSelect, isSelected }) => {
  const statusColor = getLeadStatusColor(lead.status);
  
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:shadow-md hover:border-gray-300'}
      `}
      onClick={() => onSelect?.(lead)}
    >
      {/* Header with name and status */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base">{lead.name}</h3>
            <p className="text-sm text-gray-600">{lead.email}</p>
          </div>
        </div>
        <Badge variant={statusColor} className="text-xs">
          {lead.status}
        </Badge>
      </div>
      
      {/* Contact information */}
      <div className="space-y-2 mb-3">
        {lead.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{lead.phone}</span>
          </div>
        )}
        
        {lead.company && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="h-4 w-4" />
            <span>{lead.company}</span>
          </div>
        )}
        
        {lead.value && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span className="font-semibold">{formatCurrency(lead.value)}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(lead.created_at)}</span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onView?.(lead);
          }}
          className="flex-1"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">View</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(lead);
          }}
          className="flex-1"
        >
          <Edit3 className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Edit</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(lead);
          }}
          className="text-red-600 border-red-300 hover:bg-red-50 flex-1"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Delete</span>
        </Button>
      </div>
    </div>
  );
};

// Mobile stats card component
export const MobileStatsCard = ({ title, value, icon: Icon, color = "blue", trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };
  
  return (
    <div className={`
      bg-white rounded-xl p-4 border border-gray-200 shadow-sm
      ${colorClasses[color] || colorClasses.blue}
    `}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-white/50">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">{title}</span>
        </div>
        {trend && (
          <div className={`text-xs font-medium ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold">
        {value}
      </div>
    </div>
  );
};

// Mobile filter component
export const MobileFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  totalLeads,
  filteredLeads 
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  return (
    <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
      {/* Filter toggle and results count */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2"
        >
          <span>Filters</span>
          {Object.keys(filters).length > 0 && (
            <Badge className="bg-blue-600 text-white">
              {Object.keys(filters).length}
            </Badge>
          )}
        </Button>
        
        <div className="text-sm text-gray-600">
          {filteredLeads} of {totalLeads} leads
        </div>
      </div>
      
      {/* Expandable filter panel */}
      {isFilterOpen && (
        <div className="space-y-3 pb-3 border-t border-gray-100 pt-3">
          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
          </div>
          
          {/* Date range filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm"
                placeholder="From"
              />
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => onFilterChange('dateTo', e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm"
                placeholder="To"
              />
            </div>
          </div>
          
          {/* Value range filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Value Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={filters.minValue || ''}
                onChange={(e) => onFilterChange('minValue', e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Min Value"
              />
              <input
                type="number"
                value={filters.maxValue || ''}
                onChange={(e) => onFilterChange('maxValue', e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Max Value"
              />
            </div>
          </div>
          
          {/* Clear filters button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

// Mobile action bar component
export const MobileActionBar = ({ 
  selectedCount, 
  onBulkEdit, 
  onBulkDelete, 
  onAddNew,
  onImport,
  onExport 
}) => {
  return (
    <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10">
      {selectedCount > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {selectedCount} lead{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Clear selection
                onBulkEdit?.([]);
              }}
            >
              Clear Selection
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkEdit}
              className="flex-1"
            >
              <Edit3 className="h-4 w-4" />
              <span className="ml-1">Edit</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDelete}
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              <span className="ml-1">Delete</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            onClick={onImport}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Import
          </Button>
          
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Export
          </Button>
          
          <Button
            onClick={onAddNew}
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <span className="text-lg">+</span>
            <span className="ml-1">Add Lead</span>
          </Button>
        </div>
      )}
    </div>
  );
};

// Responsive wrapper component
export const ResponsiveLeadsLayout = ({ 
  children, 
  stats,
  filters,
  totalLeads,
  filteredLeads,
  selectedLeads,
  onFilterChange,
  onClearFilters,
  onSelectLead,
  onEditLead,
  onDeleteLead,
  onAddLead,
  onImportLeads,
  onExportLeads
}) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (isMobile) {
    // Mobile layout
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile stats */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-white border-b border-gray-200">
          <MobileStatsCard
            title="Total Leads"
            value={totalLeads}
            icon={Users}
            color="blue"
          />
          <MobileStatsCard
            title="Qualified"
            value={stats.qualified || 0}
            icon={Users}
            color="green"
          />
          <MobileStatsCard
            title="Contacted"
            value={stats.contacted || 0}
            icon={Users}
            color="amber"
          />
          <MobileStatsCard
            title="Total Value"
            value={formatCurrency(stats.totalValue || 0)}
            icon={DollarSign}
            color="red"
          />
        </div>
        
        {/* Mobile filters */}
        <MobileFilters
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          totalLeads={totalLeads}
          filteredLeads={filteredLeads.length}
        />
        
        {/* Mobile leads list */}
        <div className="p-4 pb-20">
          {filteredLeads.map((lead) => (
            <MobileLeadCard
              key={lead.id}
              lead={lead}
              isSelected={selectedLeads.includes(lead.id)}
              onSelect={() => onSelectLead(lead)}
              onView={onEditLead}
              onEdit={onEditLead}
              onDelete={onDeleteLead}
            />
          ))}
        </div>
        
        {/* Mobile action bar */}
        <MobileActionBar
          selectedCount={selectedLeads.length}
          onBulkEdit={() => {
            // Handle bulk edit
          }}
          onBulkDelete={() => {
            // Handle bulk delete
          }}
          onAddNew={onAddLead}
          onImport={onImportLeads}
          onExport={onExportLeads}
        />
      </div>
    );
  }
  
  // Desktop layout - render original children
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

export default ResponsiveLeadsLayout;