import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAgency } from "@/hooks/useAgency";
import {
  ChevronDown,
  Building2,
  Plus,
  Lock,
  Sparkles,
  Zap,
  Crown,
  X,
  Check,
  Upload,
  Image as ImageIcon,
  Trash2,
  Info,
  UserPlus,
  Link2,
  Edit,
  Eye,
} from "lucide-react";
import DeleteAgencyModal from "@/components/DeleteAgencyModal";
import JoinAgencyModal from "@/components/JoinAgencyModal";
import InviteMemberModal from "@/components/InviteMemberModal";
import { isDemoAgency } from "@/data/demoAgencyData";

// Agency limits per subscription tier
const AGENCY_LIMITS = {
  sales: 0, // Sales tier: No agencies
  build: 1, // Build tier: 1 agency
  scale: 3, // Scale tier: 3 agencies
  god_mode: 999, // God mode: Unlimited
};

const ADDITIONAL_AGENCY_PRICE = 47; // $47/month per additional agency

const AgenciesSelector = () => {
  const {
    agencies,
    currentAgency,
    switchAgency,
    loading,
    loadFailed,
    createAgency,
    deleteAgency,
    getSubscriptionTier,
    isAdmin,
  } = useAgency();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);
  const plusMenuRef = useRef(null);

  const subscriptionTier = getSubscriptionTier
    ? getSubscriptionTier()
    : "sales";
  const tierLimit = AGENCY_LIMITS[subscriptionTier] || 0;
  const agencyCount = agencies.length;
  const canCreateMore =
    agencyCount < tierLimit || subscriptionTier === "god_mode";

  // Filter agencies based on search term
  const filteredAgencies = agencies.filter((agency) => {
    const name = agency.agency_name || agency.name;
    return name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAgencyChange = async (agencyId) => {
    console.log("[AgenciesSelector] Agency change requested:", {
      agencyId,
      isDemoAgency: isDemoAgency({ id: agencyId }),
      currentAgencyId: currentAgency?.id || currentAgency?.agency_id,
    });

    await switchAgency(agencyId);
    setIsOpen(false);
    setSearchTerm("");

    // Force a re-render to ensure state is updated
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Click outside handler for plus menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
        setShowPlusMenu(false);
      }
    };

    if (showPlusMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPlusMenu]);

  const handleAddAgency = () => {
    console.log("Plus button clicked");
    console.log("isAdmin:", isAdmin && isAdmin());
    console.log("canCreateMore:", canCreateMore);
    console.log("subscriptionTier:", subscriptionTier);
    console.log("agencyCount:", agencyCount);
    console.log("tierLimit:", tierLimit);

    setIsOpen(false);

    // Simplified logic - check if user can create agencies
    const canCreateAgency =
      (isAdmin && isAdmin()) ||
      canCreateMore ||
      subscriptionTier === "god_mode";

    if (canCreateAgency) {
      console.log("User can create agencies - showing create modal");
      setShowCreateModal(true);
    } else {
      console.log("User cannot create agencies - showing upgrade modal");
      setShowUpgradeModal(true);
    }
  };

  const handleCreateAgencyOption = () => {
    console.log("Create agency clicked");
    console.log(
      "canCreateMore:",
      canCreateMore,
      "subscriptionTier:",
      subscriptionTier,
    );
    setShowPlusMenu(false);
    if (!canCreateMore && subscriptionTier !== "god_mode") {
      console.log("Showing upgrade modal");
      setShowUpgradeModal(true);
    } else {
      console.log("Showing create modal");
      setShowCreateModal(true);
    }
  };

  const handleInviteUserOption = () => {
    console.log("Invite user clicked");
    console.log("currentAgency:", currentAgency);
    console.log("currentAgency.id:", currentAgency?.id);

    // Only show invite modal if we have a current agency
    if (currentAgency?.id) {
      setShowPlusMenu(false);
      setShowInviteModal(true);
      console.log("showInviteModal set to true");
    } else {
      console.log("No current agency selected - cannot invite user");
      // Optionally show an error message or toast
      alert("Please select an agency first before inviting team members");
    }
  };

  const handleJoinAgency = () => {
    setIsOpen(false);
    setShowJoinModal(true);
  };

  const handleCreateAgency = async (formData) => {
    try {
      await createAgency(formData);
      setShowCreateModal(false);
      setLogoPreview(null);
      setLogoFile(null);
    } catch (error) {
      console.error("Error creating agency:", error);
      alert("Failed to create agency. Please try again.");
    }
  };

  const handleDeleteClick = (agency, e) => {
    e.stopPropagation(); // Prevent agency selection
    // Don't allow deletion of demo agency
    if (isDemoAgency(agency)) {
      return;
    }
    setAgencyToDelete(agency);
    setShowDeleteModal(true);
    setIsOpen(false); // Close selector modal
  };

  const handleEditClick = (agency, e) => {
    e.stopPropagation(); // Prevent agency selection
    // Don't allow editing of demo agency
    if (isDemoAgency(agency)) {
      return;
    }
    setIsOpen(false); // Close selector modal
    // Navigate to agency settings page
    window.location.href = `/app/settings/agency`;
  };

  const handleConfirmDelete = async () => {
    if (!agencyToDelete) return;

    try {
      setIsDeleting(true);
      await deleteAgency(agencyToDelete.agency_id);
      setShowDeleteModal(false);
      setAgencyToDelete(null);
    } catch (error) {
      console.error("Error deleting agency:", error);
      alert(error.message || "Failed to delete agency. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
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
    if (!url || url.trim() === "") return "";
    let formatted = url.trim();
    // If it starts with www., add https://
    if (formatted.startsWith("www.")) {
      formatted = "https://" + formatted;
    }
    // If it doesn't have a protocol, add https://
    else if (!formatted.match(/^https?:\/\//i)) {
      formatted = "https://" + formatted;
    }
    return formatted;
  };

  // Only show loading state if we're loading AND we don't already have agency data
  // This prevents the loading flash when navigating between sections
  // IMPORTANT: Don't show loading if loadFailed - show "No Agency" instead to allow creation
  if (loading && agencies.length === 0 && !currentAgency && !loadFailed) {
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

  return (
    <>
      {/* Sidebar Trigger Button */}
      <div className="px-2 py-1.5 -ml-1">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1 px-2 -ml-1 truncate flex items-center justify-between">
          <div className="flex items-center gap-1.5 relative">
            <span>Agencies</span>
            <button
              onMouseEnter={() => setShowInfoTooltip(true)}
              onMouseLeave={() => setShowInfoTooltip(false)}
              className="p-0.5 rounded hover:bg-[#3F0D28]/30 transition-colors"
            >
              <Info className="h-3 w-3 text-gray-300 hover:text-white" />
            </button>
            {/* Info Tooltip */}
            {showInfoTooltip && (
              <div className="absolute left-0 top-full mt-1 z-50 w-48 p-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl text-xs text-gray-300 font-normal normal-case tracking-normal">
                <p className="font-medium text-white mb-1">
                  What are Agencies?
                </p>
                <p>
                  Agencies are separate workspaces for different clients or
                  projects. Each agency has its own data, team members, and
                  settings.
                </p>
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-gray-300">
            {agencyCount}/{tierLimit === 999 ? "∞" : tierLimit}
          </span>
        </div>
        <div className="relative">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center justify-between cursor-pointer rounded-lg transition-all duration-300 ease-out overflow-hidden border border-[#3F0D28]/30 bg-gradient-to-r from-[#2a0919]/80 via-[#3F0D28]/80 to-[#2a0919]/80 hover:from-[#3F0D28]/90 hover:via-[#5a1a3a]/90 hover:to-[#3F0D28]/90 hover:border-[#3F0D28]/50 flex-1 shadow-lg hover:shadow-xl hover:shadow-[#3F0D28]/20 backdrop-blur-sm"
            >
              <div className="flex items-center flex-1 px-2 py-1.5">
                {currentAgency?.logo_url ? (
                  <img
                    src={currentAgency.logo_url}
                    alt={currentAgency.name || currentAgency.agency_name}
                    className="h-5 w-5 rounded mr-2 object-cover ring-1 ring-white/20"
                  />
                ) : (
                  <div className="p-1 rounded mr-2 bg-gradient-to-br from-[#3F0D28] to-[#5a1a3a] shadow-inner">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="text-xs font-bold text-white truncate">
                  {currentAgency?.name ||
                    currentAgency?.agency_name ||
                    agencies[0]?.agency_name ||
                    agencies[0]?.name ||
                    "No Agency"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 ml-auto text-gray-200" />
              </div>
            </button>

            {/* Add Agency Button with Dropdown Menu */}
            <div className="relative" ref={plusMenuRef}>
              <button
                onClick={handleAddAgency}
                className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center ${
                  isAdmin && isAdmin()
                    ? "bg-gradient-to-br from-[#3F0D28] to-[#5a1a3a] hover:from-[#5a1a3a] hover:to-[#3F0D28] text-white border border-[#3F0D28]/30 hover:border-[#3F0D28]/50 shadow-lg hover:shadow-xl hover:shadow-[#3F0D28]/30"
                    : canCreateMore
                      ? "bg-gradient-to-br from-[#3F0D28] to-[#5a1a3a] hover:from-[#5a1a3a] hover:to-[#3F0D28] text-white border border-[#3F0D28]/30 hover:border-[#3F0D28]/50 shadow-lg hover:shadow-xl hover:shadow-[#3F0D28]/30"
                      : "bg-gradient-to-r from-gray-700/50 to-gray-800/50 text-gray-500 border border-gray-600/30 cursor-not-allowed opacity-60"
                }`}
                title={
                  isAdmin && isAdmin()
                    ? "Agency options"
                    : canCreateMore
                      ? "Create new agency"
                      : "Upgrade to create more agencies"
                }
              >
                {(isAdmin && isAdmin()) || canCreateMore ? (
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  <Lock className="h-4 w-4 stroke-[2.5]" />
                )}
              </button>

              {/* Plus Menu Dropdown rendered via portal to float on top */}
              {showPlusMenu &&
                createPortal(
                  <div
                    className="fixed w-48 rounded-lg border border-gray-700 shadow-2xl shadow-black/30 z-[9999] overflow-hidden backdrop-blur-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)",
                      bottom:
                        window.innerHeight -
                        plusMenuRef.current?.getBoundingClientRect().top +
                        8 +
                        "px",
                      left:
                        plusMenuRef.current?.getBoundingClientRect().left +
                        "px",
                    }}
                  >
                    <div className="py-1">
                      {/* Create Agency Option */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateAgencyOption();
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#3F0D28]/30 transition-all duration-200 flex items-center gap-3"
                      >
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#3F0D28] to-[#5a1a3a] shadow-sm">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <span className="font-medium">Create Agency</span>
                          <p className="text-xs text-gray-300">
                            Start a new workspace
                          </p>
                        </div>
                      </button>

                      {/* Invite User Option */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInviteUserOption();
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#3F0D28]/30 transition-all duration-200 flex items-center gap-3"
                      >
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#3F0D28] to-[#5a1a3a] shadow-sm">
                          <UserPlus className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <span className="font-medium">Invite User</span>
                          <p className="text-xs text-gray-300">
                            Add to {currentAgency?.name || "agency"}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>,
                  document.body,
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Agency Selector Modal - Centered (Portal) */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl">
              <div
                className="rounded-xl border border-gray-700"
                style={{
                  background:
                    "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)",
                }}
              >
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
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#3F0D28] to-[#5a1a3a] shadow-sm ring-1 ring-white/30">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Switch Agency
                        </h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {agencyCount}/{tierLimit === 999 ? "∞" : tierLimit}{" "}
                          agencies
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

                    {filteredAgencies.map((agency) => {
                      const isDemo = isDemoAgency(agency);
                      const agencyId = agency.agency_id || agency.id;
                      const agencyName = agency.agency_name || agency.name;
                      const agencyLogo =
                        agency.agency_logo_url || agency.logo_url;

                      return (
                        <div
                          key={agencyId}
                          className="group w-full p-3 rounded-lg hover:bg-[#3F0D28]/30 transition-all cursor-pointer border border-transparent hover:border-white/10"
                        >
                          <div className="flex items-center w-full">
                            <div
                              className="flex items-center flex-1 min-w-0"
                              onClick={() => handleAgencyChange(agencyId)}
                            >
                              {agencyLogo ? (
                                <img
                                  src={agencyLogo}
                                  alt={agencyName}
                                  className="h-10 w-10 rounded-lg mr-3 object-cover ring-1 ring-white/20"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg mr-3 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ring-1 ring-white/10">
                                  <Building2 className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-semibold truncate text-white">
                                    {agencyName}
                                  </div>
                                  {/* Demo badge */}
                                  {isDemo && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-medium rounded-full">
                                      <Eye className="h-3 w-3" />
                                      DEMO
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {isDemo
                                    ? "$31k/mo · Marketing Sample"
                                    : agency.user_role === "admin"
                                      ? "Admin"
                                      : agency.user_role === "member"
                                        ? "Member"
                                        : "Viewer"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              {(currentAgency?.id === agencyId ||
                                currentAgency?.agency_id === agencyId) && (
                                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                              )}
                              {/* Edit and Delete buttons - only for real agencies */}
                              {!isDemo && agency.user_role === "admin" && (
                                <>
                                  <button
                                    onClick={(e) => handleEditClick(agency, e)}
                                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all bg-blue-500/0 hover:bg-blue-500/20 text-gray-300 hover:text-white"
                                    title="Edit agency"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      handleDeleteClick(agency, e)
                                    }
                                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all bg-red-500/0 hover:bg-red-500/20 text-gray-300 hover:text-red-400"
                                    title="Delete agency"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Divider */}
                    <div className="my-3 border-t border-white/10" />

                    {/* Join Other Agencies Option */}
                    <div className="px-2 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                      Other Options
                    </div>
                    <button
                      onClick={handleJoinAgency}
                      className="w-full p-3 rounded-lg hover:bg-[#3F0D28]/10 transition-all cursor-pointer border border-transparent hover:border-[#3F0D28]/20 flex items-center gap-3"
                    >
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#3F0D28]/20 to-[#5a1a3a]/20 flex items-center justify-center ring-1 ring-[#3F0D28]/30">
                        <Link2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-white">
                          Join other agencies
                        </div>
                        <div className="text-xs text-gray-400">
                          Use an invite link to join
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Create Agency Modal - Visually Stunning (Portal) */}
      {showCreateModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-200">
            <div
              className="border border-gray-700 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)",
              }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-[#3F0D28]/5 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#3F0D28] to-[#5a1a3a] shadow-sm ring-1 ring-white/30">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Create New Agency
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Set up your agency profile
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = {
                      name: formData.get("name"),
                      website: formatWebsiteUrl(formData.get("website")),
                      description: formData.get("description"),
                      logoFile: logoFile,
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
                            <span className="text-xs text-gray-500 group-hover:text-gray-300 mt-1">
                              Upload
                            </span>
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
                                fileInputRef.current.value = "";
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
          document.body,
        )}

      {/* Upgrade Modal - Visually Stunning Upsell (Portal) */}
      {showUpgradeModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-200">
            <div
              className="border border-gray-700 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)",
              }}
            >
              {/* Animated Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#3F0D28]/10 via-[#EBB207]/10 to-[#2a0919]/10 animate-pulse pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#3F0D28]/20 to-yellow-500/20 ring-2 ring-[#3F0D28]/30 animate-pulse">
                    <Crown className="h-6 w-6 text-[#3F0D28]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3F0D28] via-yellow-400 to-[#3F0D28] bg-clip-text text-transparent">
                      Agency Limit Reached
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Upgrade to create more agencies
                    </p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gradient-to-r from-[#3F0D28]/10 to-[#EBB207]/10 rounded-xl border border-[#3F0D28]/20">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold mb-1">
                        Current Plan: {subscriptionTier.toUpperCase()}
                      </p>
                      <p className="text-gray-300 text-sm">
                        You've reached your limit of{" "}
                        <span className="font-bold text-white">
                          {tierLimit}
                        </span>{" "}
                        {tierLimit === 1 ? "agency" : "agencies"}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-white">
                        Additional Agency
                      </span>
                      <span className="text-white font-bold">
                        ${ADDITIONAL_AGENCY_PRICE}/mo
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Add one more agency to your current plan
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-[#3F0D28]/10 to-[#EBB207]/10 rounded-lg border border-[#3F0D28]/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-white flex items-center gap-2">
                        <Crown className="h-4 w-4 text-[#3F0D28]" />
                        Upgrade to Scale
                      </span>
                      <span className="text-[#3F0D28] font-bold">$279/mo</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Get up to 3 agencies + unlimited features
                    </p>
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
                      window.location.href = "/app/upgrade";
                    }}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#3F0D28] via-[#5a1a3a] to-[#3F0D28] hover:from-[#5a1a3a] hover:via-[#2a0919] hover:to-[#5a1a3a] text-white font-bold transition-all shadow-lg hover:shadow-[#3F0D28]/50 flex items-center gap-2"
                  >
                    <Crown className="h-4 w-4" />
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Delete Agency Modal */}
      <DeleteAgencyModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAgencyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        agencyName={agencyToDelete?.agency_name}
        agencyLogo={agencyToDelete?.agency_logo_url}
        isDeleting={isDeleting}
      />

      {/* Join Agency Modal */}
      <JoinAgencyModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={(data) => {
          console.log("Joined agency:", data);
          setIsOpen(false);
        }}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={(data) => {
          console.log("Member invited:", data);
        }}
      />
    </>
  );
};

export default AgenciesSelector;
