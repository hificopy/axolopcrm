import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Share2,
  Eye,
  Edit3,
  Trash2,
  BarChart3,
  Calendar,
  Users,
  FileText,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import formsApi from "@/services/formsApi";
import { useToast } from "@/components/ui/use-toast";
import { InfoTooltipInline } from "@/components/ui/info-tooltip";
import { useSupabase } from "../context/SupabaseContext";
import { useAgency } from "@/hooks/useAgency";
import ViewOnlyBadge from "@/components/ui/view-only-badge";
import { FormCardSkeleton, StatsCardSkeleton } from "@/components/ui/skeletons";
import { demoDataService } from "../services/demoDataService";
import { CRMMenuConfigs } from "@/components/ui/ContextMenuProvider";
import FormEmbedModal from "@/components/FormEmbedModal";
import { Tooltip } from "@/components/ui/tooltip";

export default function Forms() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useSupabase(); // Get auth state
  const { isReadOnly, canEdit, canCreate, isDemoAgencySelected } = useAgency();
  const [forms, setForms] = useState([]);
  const [allForms, setAllForms] = useState([]); // Store ALL forms for accurate metrics
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  // Context menu handlers for forms
  const handleFormEdit = (form) => {
    navigate(`/forms/builder/${form.id}`);
  };

  const handleFormDelete = async (form) => {
    try {
      await formsApi.deleteForm(form.id);
      setForms((prev) => prev.filter((f) => f.id !== form.id));
      setAllForms((prev) => prev.filter((f) => f.id !== form.id));

      toast({
        title: "Form Deleted",
        description: `${form.name} has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting form:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFormDuplicate = async (form) => {
    try {
      const duplicatedForm = await formsApi.createForm({
        ...form,
        name: `${form.name} (Copy)`,
        id: undefined, // Remove ID to create new record
        created_at: undefined,
        updated_at: undefined,
      });

      setForms((prev) => [duplicatedForm.data, ...prev]);
      setAllForms((prev) => [duplicatedForm.data, ...prev]);

      toast({
        title: "Form Duplicated",
        description: `${form.name} has been duplicated.`,
      });
    } catch (error) {
      console.error("Error duplicating form:", error);
      toast({
        title: "Duplicate Failed",
        description: "Failed to duplicate form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFormPreview = (form) => {
    navigate(`/forms/preview/${form.id}`);
  };

  const handleFormShare = (form) => {
    const shareUrl = `${window.location.origin}/f/${form.agency_alias}/${form.slug}`;

    navigator.clipboard.writeText(shareUrl);

    toast({
      title: "Share Link Copied",
      description: "Form share link has been copied to clipboard.",
    });
  };

  const handleFormViewSubmissions = (form) => {
    navigate(`/forms/analytics/${form.id}`);
  };

  // Context menu configuration for forms
  const formContextMenuConfig = (form) =>
    CRMMenuConfigs.form(form, {
      onEdit: handleFormEdit,
      onDelete: handleFormDelete,
      onDuplicate: handleFormDuplicate,
      onPreview: handleFormPreview,
      onShare: handleFormShare,
      onViewSubmissions: handleFormViewSubmissions,
    });

  const loadForms = useCallback(async () => {
    setLoading(true);
    try {
      let fetchedForms, allFormsData;

      // If demo agency is selected, use demo data
      if (isDemoAgencySelected()) {
        console.log("[Forms] Using demo data");
        const demoResponse = await demoDataService.getForms();
        fetchedForms = demoResponse.data;
        allFormsData = demoResponse.data;
      } else {
        // Fetch filtered forms for display
        fetchedForms = await formsApi.getForms({
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchTerm || undefined,
        });

        // Fetch ALL forms for accurate metrics (without filters)
        allFormsData = await formsApi.getForms({});
      }

      // Handle case where API returns null or undefined
      if (!fetchedForms) {
        setForms([]);
        setAllForms([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Transform API data to match component format
      const transformedForms = fetchedForms.map((form) => ({
        id: form.id,
        name: form.title || "Untitled Form",
        description: form.description || "",
        responses: form.total_responses || 0,
        conversionRate: form.conversion_rate || 0,
        status: form.is_active ? "active" : "inactive",
        createdAt: new Date(form.created_at),
        lastUpdated: new Date(form.updated_at),
        thumbnail: null,
        displayMode: form.settings?.displayMode || "sequential", // Default to sequential
      }));

      // Transform ALL forms for metrics
      const transformedAllForms = allFormsData.map((form) => ({
        id: form.id,
        name: form.title || "Untitled Form",
        responses: form.total_responses || 0,
        conversionRate: form.conversion_rate || 0,
        status: form.is_active ? "active" : "inactive",
      }));

      setForms(transformedForms);
      setAllForms(transformedAllForms);
      setError(null);
    } catch (err) {
      console.error("Error loading forms:", err);

      // If database table doesn't exist, show empty state instead of error
      if (
        err.message.includes("table") ||
        err.message.includes("schema cache")
      ) {
        console.warn("Forms table not initialized. Showing empty state.");
        setForms([]);
        setError(null);
      }
      // Check if it's an authentication error
      else if (
        err.message.includes("Authentication required") ||
        err.message.includes("Session expired")
      ) {
        console.warn("Authentication error, redirecting to login");
        setForms([]);
        setError("authentication_required");
        toast({
          title: "Authentication required",
          description: "Please sign in to view your forms.",
          variant: "destructive",
        });
      }
      // For any other error, just show empty forms - don't block the UI
      else {
        console.warn("Error loading forms, showing empty state:", err.message);
        setForms([]);
        setError(null);
        // Don't show toast for general errors - just show empty state
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, isDemoAgencySelected]); // Removed user dependency - let API handle auth

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || form.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateForm = async () => {
    navigate("/app/forms/builder/new");
  };

  const handleEditForm = (formId) => {
    navigate(`/app/forms/builder/${formId}`);
  };

  const handleShareForm = (form) => {
    setSelectedForm(form);
    setShowEmbedModal(true);
  };

  const handleDuplicateForm = async (formId) => {
    try {
      const duplicatedForm = await formsApi.duplicateForm(formId);
      toast({
        title: "Form Duplicated",
        description: `Form has been duplicated successfully.`,
      });

      // Reload forms
      loadForms();
    } catch (error) {
      console.error("Error duplicating form:", error);

      // If it's an authentication error, redirect to sign-in
      if (error.message.startsWith("AUTH_ERROR:")) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });

        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
      } else {
        toast({
          title: "Duplicate Failed",
          description: `Error duplicating form: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteForm = async (formId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this form? This action cannot be undone.",
      )
    ) {
      try {
        await formsApi.deleteForm(formId);
        toast({
          title: "Form Deleted",
          description: "Form has been deleted successfully.",
        });

        // Reload forms
        loadForms();
      } catch (error) {
        console.error("Error deleting form:", error);

        // If it's an authentication error, redirect to sign-in
        if (
          error.message.includes("Authentication token is invalid or expired")
        ) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          });

          // Redirect to sign-in after a delay to allow toast to show
          setTimeout(() => {
            window.location.href = "/signin";
          }, 3000);
        } else {
          toast({
            title: "Delete Failed",
            description: `Error deleting form: ${error.message}`,
            variant: "destructive",
          });
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center pt-[150px] p-6 bg-white">
        <div className="text-center max-w-md w-full">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#3F0D28] mx-auto"></div>
            <div className="absolute inset-0 animate-pulse">
              <div className="rounded-full h-16 w-16 border-4 border-[#3F0D28]/20 mx-auto"></div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Loading forms...
            </h2>
            <p className="text-gray-600">Preparing your form builder</p>
          </div>

          {/* Progress indicator */}
          <div className="mt-8">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#3F0D28] to-[#2a0919] h-2 rounded-full animate-pulse"
                style={{ width: "70%" }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Almost there...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Forms
              </h1>
              {isReadOnly() && <ViewOnlyBadge />}
            </div>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              {isReadOnly()
                ? "View conversational forms - Read-only access"
                : "Create and manage conversational forms"}
            </p>
          </div>

          {canCreate() && (
            <Button
              variant="default"
              size="default"
              className="gap-2"
              onClick={handleCreateForm}
            >
              <Plus className="h-4 w-4" />
              <span>Create Form</span>
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#3F0D28]/10">
                <FileText className="h-5 w-5 text-[#3F0D28]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
                  Total Forms
                  <InfoTooltipInline content="Total number of forms you've created" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {allForms.length}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#1A777B]/5 to-[#1A777B]/10 rounded-xl p-5 border border-[#1A777B]/20 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#1A777B]/10">
                <Users className="h-5 w-5 text-[#1A777B]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#1A777B] uppercase tracking-wide flex items-center">
                  Total Responses
                  <InfoTooltipInline content="Combined responses across all your forms" />
                </div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {allForms.reduce((sum, form) => sum + form.responses, 0)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-600/10">
                <BarChart3 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center">
                  Avg. Conversion
                  <InfoTooltipInline content="Average conversion rate across all forms (% of visitors who submit)" />
                </div>
                <div className="text-2xl font-bold text-amber-600 mt-1">
                  {allForms.length > 0
                    ? (
                        allForms.reduce(
                          (sum, form) => sum + form.conversionRate,
                          0,
                        ) / allForms.length
                      ).toFixed(1) + "%"
                    : "0%"}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#3F0D28]/10">
                <Calendar className="h-5 w-5 text-[#3F0D28]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center">
                  Active Forms
                  <InfoTooltipInline content="Forms currently published and collecting responses" />
                </div>
                <div className="text-2xl font-bold text-[#3F0D28] mt-1">
                  {allForms.filter((f) => f.status === "active").length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F0D28] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F0D28] focus:border-transparent bg-white text-gray-900 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {loading ? (
          <FormCardSkeleton count={6} />
        ) : filteredForms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 shadow-lg">
            <div className="p-6 rounded-full bg-[#3F0D28]/10 mx-auto mb-6">
              <FileText className="h-16 w-16 text-[#3F0D28]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No forms yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md text-center">
              Create your first conversational form to get started
            </p>
            {canCreate() && (
              <Button
                variant="default"
                size="default"
                className="gap-2"
                onClick={handleCreateForm}
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Form</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-xl transition-all duration-300"
                onClick={() => setSelectedForm(form)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const items = formContextMenuConfig(form);

                  // Use global context menu
                  import("@/components/ui/ContextMenuProvider").then(
                    ({ useContextMenu }) => {
                      const { showContextMenu } = useContextMenu();
                      showContextMenu({
                        items,
                        position: { x: e.clientX, y: e.clientY },
                        data: form,
                      });
                    },
                  );
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate text-lg">
                      {form.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {form.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 ml-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        form.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {form.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        form.displayMode === "sequential"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {form.displayMode === "sequential"
                        ? "Sequential"
                        : "Regular"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="bg-gradient-to-br from-[#1A777B]/5 to-[#1A777B]/10 rounded-lg p-3 border border-[#1A777B]/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-[#1A777B]" />
                      <span className="text-xs font-semibold text-[#1A777B] uppercase tracking-wide">
                        Responses
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {form.responses}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                        Conv. Rate
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-amber-600">
                      {form.conversionRate}%
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Updated: {form.lastUpdated.toLocaleDateString()}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {canEdit() && (
                    <Tooltip content="Edit form" position="bottom" delay={1500}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-w-[40px] flex-1 sm:flex-none border-gray-300 hover:border-[#3F0D28] hover:text-[#3F0D28]"
                        onClick={() => handleEditForm(form.id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  )}
                  {canCreate() && (
                    <Tooltip
                      content="Duplicate form"
                      position="bottom"
                      delay={1500}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-w-[40px] flex-1 sm:flex-none border-gray-300 hover:border-[#3F0D28] hover:text-[#3F0D28]"
                        onClick={() => handleDuplicateForm(form.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip
                    content="Share & embed form"
                    position="bottom"
                    delay={1500}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-[40px] flex-1 sm:flex-none border-gray-300 hover:border-[#3F0D28] hover:text-[#3F0D28]"
                      onClick={() => handleShareForm(form)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    content="Preview form"
                    position="bottom"
                    delay={1500}
                  >
                    <Link
                      to={`/app/forms/preview/${form.id}`}
                      className="min-w-[40px] flex-1 sm:flex-none"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-gray-300 hover:border-[#3F0D28] hover:text-[#3F0D28]"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </Tooltip>
                  <Tooltip
                    content="View analytics"
                    position="bottom"
                    delay={1500}
                  >
                    <Link
                      to={`/app/forms/analytics/${form.id}`}
                      className="min-w-[40px] flex-1 sm:flex-none"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-gray-300 hover:border-[#3F0D28] hover:text-[#3F0D28]"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </Link>
                  </Tooltip>
                  {canEdit() && (
                    <Tooltip
                      content="Delete form"
                      position="bottom"
                      delay={1500}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-w-[40px] flex-1 sm:flex-none border-[#3F0D28]/30 text-[#3F0D28] hover:border-[#3F0D28] hover:bg-[#3F0D28]/5"
                        onClick={() => handleDeleteForm(form.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Embed Modal */}
      <FormEmbedModal
        open={showEmbedModal}
        onOpenChange={setShowEmbedModal}
        form={selectedForm}
      />
    </div>
  );
}
