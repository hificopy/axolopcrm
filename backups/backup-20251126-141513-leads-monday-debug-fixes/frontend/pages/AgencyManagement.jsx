/**
 * Agency Management Page
 * Central hub for agency overview and quick actions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgency } from '../hooks/useAgency';
import { useIsAdmin } from '../hooks/usePermission';
import {
  Building2,
  Users,
  Plus,
  Settings,
  Crown,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Edit,
  Trash2,
  Shield,
  CreditCard,
  Zap
} from 'lucide-react';

export default function AgencyManagement() {
  const navigate = useNavigate();
  const { 
    agencies, 
    currentAgency, 
    createAgency, 
    deleteAgency, 
    switchAgency,
    refreshAgency 
  } = useAgency();
  const { isAdmin } = useIsAdmin();
  
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalInvites: 0,
    storageUsed: 0,
    lastActivity: null
  });

  useEffect(() => {
    // Calculate agency statistics
    if (agencies.length > 0) {
      const totalMembers = agencies.reduce((sum, agency) => sum + (agency.current_users_count || 0), 0);
      const activeMembers = totalMembers; // All members are considered active
      const totalInvites = agencies.reduce((sum, agency) => sum + (agency.pending_invites || 0), 0);
      
      // Calculate storage (placeholder - would need actual storage API)
      const storageUsed = Math.random() * 100; // Mock storage usage
      
      setStats({
        totalMembers,
        activeMembers,
        totalInvites,
        storageUsed,
        lastActivity: new Date().toISOString()
      });
    }
  }, [agencies]);

  const handleCreateAgency = () => {
    navigate('/app/settings/agency?action=create');
  };

  const handleEditAgency = (agencyId) => {
    navigate(`/app/settings/agency?id=${agencyId}`);
  };

  const handleViewAnalytics = (agencyId) => {
    navigate(`/app/analytics/agency/${agencyId}`);
  };

  const getSubscriptionColor = (tier) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      starter: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800',
      god_mode: 'bg-red-100 text-red-800'
    };
    return colors[tier] || colors.free;
  };

  const getSubscriptionIcon = (tier) => {
    const icons = {
      free: Building2,
      starter: Shield,
      pro: Crown,
      enterprise: Zap,
      god_mode: Users
    };
    const IconComponent = icons[tier] || Building2;
    return <IconComponent className="h-4 w-4" />;
  };

  if (!currentAgency && agencies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Axolop CRM</h2>
          <p className="text-gray-600 mb-6">Create your first agency to get started</p>
          <button
            onClick={handleCreateAgency}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Your First Agency
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agency Management</h1>
          <p className="text-gray-600">Manage your agencies, settings, and team members</p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Create Agency Card */}
          <button
            onClick={handleCreateAgency}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Plus className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Create New Agency</h3>
                <p className="text-sm text-gray-600">Start a new agency or workspace</p>
              </div>
            </div>
          </button>

          {/* Stats Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalMembers}</div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-emerald-700 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.activeMembers}</div>
                <div className="text-sm text-gray-600">Active Members</div>
              </div>
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalInvites}</div>
                <div className="text-sm text-gray-600">Pending Invites</div>
              </div>
              <div className="text-center">
                <div className="h-8 w-8 text-blue-600 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-800 font-semibold text-xs">{Math.round(stats.storageUsed)}%</span>
                </div>
                <div className="text-sm text-gray-600">Storage Used</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/app/settings/agency')}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all"
            >
              <Settings className="h-5 w-5 text-gray-600" />
              <div className="text-left flex-1">
                <div className="font-medium text-gray-900">Agency Settings</div>
                <div className="text-sm text-gray-600">Manage themes and billing</div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/app/settings/roles')}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all"
            >
              <Shield className="h-5 w-5 text-gray-600" />
              <div className="text-left flex-1">
                <div className="font-medium text-gray-900">Roles & Permissions</div>
                <div className="text-sm text-gray-600">Manage access control</div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/app/settings/agency')}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all"
            >
              <Users className="h-5 w-5 text-gray-600" />
              <div className="text-left flex-1">
                <div className="font-medium text-gray-900">Team Members</div>
                <div className="text-sm text-gray-600">Invite and manage team</div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/app/agency-analytics')}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all"
            >
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <div className="text-left flex-1">
                <div className="font-medium text-gray-900">Analytics</div>
                <div className="text-sm text-gray-600">Health metrics & insights</div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/app/activity-log')}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all"
            >
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <div className="text-left flex-1">
                <div className="font-medium text-gray-900">Activity Log</div>
                <div className="text-sm text-gray-600">Audit trail & history</div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Agency Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency) => (
            <div
              key={agency.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleEditAgency(agency.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {agency.logo_url ? (
                      <img 
                        src={agency.logo_url} 
                        alt={agency.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{agency.name}</h3>
                    <p className="text-sm text-gray-600">
                      {agency.description || 'No description available'}
                    </p>
                  </div>
                </div>
                <Edit className="h-5 w-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSubscriptionColor(agency.subscription_tier)}`}>
                  {agency.subscription_tier || 'Free'}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {agency.current_users_count || 0} / {agency.max_users || 3} members
                  </div>
                  <div className="text-xs text-gray-400">
                    {getSubscriptionIcon(agency.subscription_tier)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {agency.current_users_count || 0} members
                </div>
                {agency.updated_at && (
                  <div className="text-xs text-gray-400">
                    Last updated {new Date(agency.updated_at).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    switchAgency(agency.id);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  Switch to Agency
                </button>
                
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAgency(agency.id);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create Agency CTA for when no agencies */}
        {agencies.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
              <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Agencies Yet</h2>
              <p className="text-gray-600 mb-6">You haven't created any agencies yet. Get started by creating your first agency.</p>
              <button
                onClick={handleCreateAgency}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create Your First Agency
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}