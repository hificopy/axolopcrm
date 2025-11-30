import { useState, useEffect } from 'react';
import { useAgency } from '@/context/AgencyContext';
import { ChevronDown, Building2, Plus, Lock, Sparkles, Zap, Crown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Agency limits per subscription tier
const AGENCY_LIMITS = {
  sales: 0,        // Sales tier: No agencies
  build: 1,        // Build tier: 1 agency
  scale: 3,        // Scale tier: 3 agencies
  god_mode: 999    // God mode: Unlimited
};

const ADDITIONAL_AGENCY_PRICE = 47; // $47/month per additional agency

const AgenciesSelector = () => {
  const {
    agencies,
    currentAgency,
    switchAgency,
    loading,
    createAgency,
    getSubscriptionTier
  } = useAgency();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const subscriptionTier = getSubscriptionTier ? getSubscriptionTier() : 'sales';
  const tierLimit = AGENCY_LIMITS[subscriptionTier] || 0;
  const agencyCount = agencies.length;
  const canCreateMore = agencyCount < tierLimit || subscriptionTier === 'god_mode';
  const additionalCost = agencyCount >= tierLimit ? (agencyCount - tierLimit + 1) * ADDITIONAL_AGENCY_PRICE : 0;

  // Filter agencies based on search term
  const filteredAgencies = agencies.filter(agency =>
    agency.agency_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAgencyChange = async (agencyId) => {
    await switchAgency(agencyId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddAgency = () => {
    setIsOpen(false);
    if (!canCreateMore && subscriptionTier !== 'god_mode') {
      setShowUpgradeModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleCreateAgency = async (formData) => {
    try {
      await createAgency(formData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating agency:', error);
      alert('Failed to create agency. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center justify-between cursor-pointer rounded-lg mb-1 transition-all duration-200 ease-out overflow-hidden transform-gpu">
          <div className="flex items-center flex-1">
            <div className="p-2 rounded-lg mr-3 text-gray-400">
              <Building2 className="h-5 w-5 animate-pulse" />
            </div>
            <span className="font-semibold text-gray-300">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Get tier badge colors
  const getTierBadgeStyle = (tier) => {
    const styles = {
      sales: 'from-blue-500 to-blue-600',
      build: 'from-yellow-500 to-yellow-600',
      scale: 'from-purple-500 to-purple-600',
      god_mode: 'from-red-500 via-pink-500 to-purple-600'
    };
    return styles[tier] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="px-2 py-1.5 -ml-1">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1 px-2 -ml-1 truncate flex items-center justify-between">
        <span>Agencies</span>
        <span className="text-xs font-bold text-gray-500">
          {agencyCount}/{tierLimit === 999 ? '∞' : tierLimit}
        </span>
      </div>
      <div className="relative">
        <div className="flex items-center gap-2">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-between cursor-pointer rounded-lg transition-all duration-300 ease-out overflow-hidden border border-white/10 bg-gradient-to-r from-gray-800/80 via-gray-900/80 to-gray-800/80 hover:from-white/20 hover:via-white/15 hover:to-white/20 hover:border-white/20 flex-1 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center flex-1 px-2 py-1.5">
                  {currentAgency?.logo_url ? (
                    <img
                      src={currentAgency.logo_url}
                      alt={currentAgency.name}
                      className="h-5 w-5 rounded mr-2 object-cover ring-1 ring-white/20"
                    />
                  ) : (
                    <div className="p-1 rounded mr-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20">
                      <Building2 className="h-4 w-4 text-yellow-500" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-white truncate">
                    {currentAgency?.name || agencies[0]?.agency_name || 'No Agency'}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 ml-auto text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl overflow-hidden"
            >
              {/* Search */}
              <div className="p-3 border-b border-white/10 bg-black/20">
                <input
                  type="text"
                  placeholder="Search agencies..."
                  className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Agencies List */}
              <div className="py-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold">My Agencies</div>
                {filteredAgencies.length === 0 && searchTerm && (
                  <div className="px-3 py-3 text-sm text-gray-400 text-center">
                    No agencies found
                  </div>
                )}
                {filteredAgencies.length === 0 && !searchTerm && (
                  <div className="px-3 py-3 text-sm text-gray-400 text-center">
                    No agencies yet. Create one to get started!
                  </div>
                )}
                {filteredAgencies.map((agency) => (
                  <DropdownMenuItem
                    key={agency.agency_id}
                    onSelect={() => handleAgencyChange(agency.agency_id)}
                    className="mx-2 my-1 rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center w-full py-1">
                      {agency.agency_logo_url ? (
                        <img
                          src={agency.agency_logo_url}
                          alt={agency.agency_name}
                          className="h-8 w-8 rounded-lg mr-3 object-cover ring-1 ring-white/20"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-lg mr-3 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ring-1 ring-white/10">
                          <Building2 className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate text-white">{agency.agency_name}</div>
                        <div className="text-xs text-gray-400">
                          {agency.user_role === 'admin' ? 'Admin' : agency.user_role === 'member' ? 'Member' : 'Viewer'}
                        </div>
                      </div>
                      {currentAgency?.id === agency.agency_id && (
                        <div className="ml-2 h-2 w-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/50 animate-pulse"></div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Agency Button */}
          <button
            onClick={handleAddAgency}
            className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center ${
              canCreateMore
                ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 hover:from-yellow-500/30 hover:to-yellow-600/30 text-yellow-500 hover:text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/30 shadow-lg hover:shadow-yellow-500/20'
                : 'bg-gradient-to-r from-gray-700/50 to-gray-800/50 text-gray-500 border border-gray-600/30 cursor-not-allowed opacity-60'
            }`}
            title={canCreateMore ? 'Create new agency' : 'Upgrade to create more agencies'}
          >
            {canCreateMore ? <Plus className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Create Agency Modal - Visually Stunning */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl relative overflow-hidden">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 ring-1 ring-yellow-500/30">
                  <Building2 className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create New Agency</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Set up your agency profile</p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const data = {
                    name: formData.get('name'),
                    website: formData.get('website'),
                    description: formData.get('description')
                  };
                  if (data.name) {
                    handleCreateAgency(data);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Agency Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all"
                    placeholder="Enter agency name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    name="website"
                    className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all resize-none"
                    placeholder="Brief description of your agency"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold transition-all shadow-lg hover:shadow-yellow-500/50 flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Create Agency
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal - Visually Stunning Upsell */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-2 border-purple-500/30 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl relative overflow-hidden">
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-yellow-500/10 animate-pulse pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 ring-2 ring-purple-500/30 animate-pulse">
                  <Crown className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                    Agency Limit Reached
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">Upgrade to create more agencies</p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold mb-1">Current Plan: {subscriptionTier.toUpperCase()}</p>
                    <p className="text-gray-300 text-sm">
                      You've reached your limit of <span className="font-bold text-white">{tierLimit}</span> {tierLimit === 1 ? 'agency' : 'agencies'}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">Additional Agency</span>
                    <span className="text-yellow-400 font-bold">${ADDITIONAL_AGENCY_PRICE}/mo</span>
                  </div>
                  <p className="text-sm text-gray-400">Add one more agency to your current plan</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-400" />
                      Upgrade to Scale
                    </span>
                    <span className="text-purple-400 font-bold">$279/mo</span>
                  </div>
                  <p className="text-sm text-gray-300">Get up to 3 agencies + unlimited features</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-6 py-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    window.location.href = '/app/upgrade';
                  }}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-400 hover:via-pink-400 hover:to-purple-500 text-white font-bold transition-all shadow-lg hover:shadow-purple-500/50 flex items-center gap-2"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgenciesSelector;
