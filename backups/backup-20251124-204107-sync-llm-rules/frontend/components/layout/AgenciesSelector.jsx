import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAgency } from '@/hooks/useAgency';
import { ChevronDown, Building2, Plus, Lock, Sparkles, Zap, Crown, X, Check, Upload, Image as ImageIcon } from 'lucide-react';

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
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);

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
      setLogoPreview(null);
      setLogoFile(null);
    } catch (error) {
      console.error('Error creating agency:', error);
      alert('Failed to create agency. Please try again.');
    }
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatWebsiteUrl = (url) => {
    if (!url || url.trim() === '') return '';
    let formatted = url.trim();
    // If it starts with www., add https://
    if (formatted.startsWith('www.')) {
      formatted = 'https://' + formatted;
    }
    // If it doesn't have a protocol, add https://
    else if (!formatted.match(/^https?:\/\//i)) {
      formatted = 'https://' + formatted;
    }
    return formatted;
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
      build: 'from-white to-gray-100',
      scale: 'from-purple-500 to-purple-600',
      god_mode: 'from-red-500 via-pink-500 to-purple-600'
    };
    return styles[tier] || 'from-gray-500 to-gray-600';
  };

  return (
    <>
      {/* Sidebar Trigger Button */}
      <div className="px-2 py-1.5 -ml-1">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1 px-2 -ml-1 truncate flex items-center justify-between">
          <span>Agencies</span>
          <span className="text-xs font-bold text-gray-500">
            {agencyCount}/{tierLimit === 999 ? '∞' : tierLimit}
          </span>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(true)}
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
                  <div className="p-1 rounded mr-2 bg-gradient-to-br from-white/20 to-gray-100/20">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="text-xs font-bold text-white truncate">
                  {currentAgency?.name || agencies[0]?.agency_name || 'No Agency'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 ml-auto text-gray-400" />
              </div>
            </button>

            {/* Add Agency Button */}
            <button
              onClick={handleAddAgency}
              className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center ${
                canCreateMore
                  ? 'bg-gradient-to-r from-white/20 to-gray-100/20 hover:from-white/30 hover:to-gray-100/30 text-white hover:text-gray-100 border border-white/20 hover:border-white/30 shadow-lg hover:shadow-white/20'
                  : 'bg-gradient-to-r from-gray-700/50 to-gray-800/50 text-gray-500 border border-gray-600/30 cursor-not-allowed opacity-60'
              }`}
              title={canCreateMore ? 'Create new agency' : 'Upgrade to create more agencies'}
            >
              {canCreateMore ? <Plus className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Agency Selector Modal - Centered (Portal) */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-white/10">
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all duration-200 border border-white/20 shadow-lg"
              >
                <X size={16} />
              </button>

              {/* Content */}
              <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white/20 to-gray-100/20 ring-1 ring-white/30">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Switch Agency</h2>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {agencyCount}/{tierLimit === 999 ? '∞' : tierLimit} agencies
                      </p>
                    </div>
                  </div>

                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search agencies..."
                    className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Agencies List */}
                <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <div className="px-2 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    My Agencies
                  </div>

                  {filteredAgencies.length === 0 && searchTerm && (
                    <div className="px-4 py-8 text-sm text-gray-400 text-center">
                      No agencies found
                    </div>
                  )}
                  {filteredAgencies.length === 0 && !searchTerm && (
                    <div className="px-4 py-8 text-sm text-gray-400 text-center">
                      No agencies yet. Create one to get started!
                    </div>
                  )}

                  {filteredAgencies.map((agency) => (
                    <button
                      key={agency.agency_id}
                      onClick={() => handleAgencyChange(agency.agency_id)}
                      className="w-full p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/10"
                    >
                      <div className="flex items-center w-full">
                        {agency.agency_logo_url ? (
                          <img
                            src={agency.agency_logo_url}
                            alt={agency.agency_name}
                            className="h-10 w-10 rounded-lg mr-3 object-cover ring-1 ring-white/20"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg mr-3 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ring-1 ring-white/10">
                            <Building2 className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-sm font-semibold truncate text-white">
                            {agency.agency_name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {agency.user_role === 'admin' ? 'Admin' : agency.user_role === 'member' ? 'Member' : 'Viewer'}
                          </div>
                        </div>
                        {currentAgency?.id === agency.agency_id && (
                          <Check className="h-5 w-5 text-green-400 ml-2 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create Agency Modal - Visually Stunning (Portal) */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl relative overflow-hidden">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-white/20 to-gray-100/20 ring-1 ring-white/30">
                  <Building2 className="h-6 w-6 text-white" />
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
                    website: formatWebsiteUrl(formData.get('website')),
                    description: formData.get('description'),
                    logoFile: logoFile
                  };
                  if (data.name) {
                    handleCreateAgency(data);
                  }
                }}
                className="space-y-4"
              >
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Agency Logo (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer h-20 w-20 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ring-1 ring-white/10 hover:ring-white/30 transition-all group relative overflow-hidden"
                    >
                      {logoPreview ? (
                        <>
                          <img
                            src={logoPreview}
                            alt="Agency logo preview"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="h-6 w-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2">
                          <ImageIcon className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
                          <span className="text-xs text-gray-500 group-hover:text-gray-300 mt-1">Upload</span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      className="hidden"
                    />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">
                        Click to upload your agency logo
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Max 5MB • PNG, JPG, or SVG
                      </p>
                      {logoFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setLogoFile(null);
                            setLogoPreview(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="text-xs text-red-400 hover:text-red-300 mt-1"
                        >
                          Remove logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Agency Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                    placeholder="Enter agency name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="text"
                    name="website"
                    className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                    placeholder="www.yourwebsite.com or yourwebsite.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    https:// is optional - we'll add it automatically
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all resize-none"
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
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black font-bold transition-all shadow-lg hover:shadow-white/50 flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Create Agency
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Upgrade Modal - Visually Stunning Upsell (Portal) */}
      {showUpgradeModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-200">
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
                  <Zap className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
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
                    <span className="text-white font-bold">${ADDITIONAL_AGENCY_PRICE}/mo</span>
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
        </div>,
        document.body
      )}
    </>
  );
}

export default AgenciesSelector;
