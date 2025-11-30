import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit3,
  Trash2,
  Target,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  X,
  LayoutGrid,
  List,
  Grid3X3,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useToast } from "../components/ui/use-toast";
import { formatDate, formatCurrency } from "../lib/utils";
import { dealsApi } from "../lib/api";
import { InfoTooltipInline } from "../components/ui/info-tooltip";
import { useAgency } from "../hooks/useAgency";
import ViewOnlyBadge from "../components/ui/view-only-badge";
import { demoDataService } from "../services/demoDataService";
import { CRMMenuConfigs } from "../components/ui/ContextMenuProvider";

/**
 * Unified Pipeline/Opportunities Page
 * Combines the best of both Pipeline and Opportunities pages
 * Features: Kanban view, Table view, Advanced filtering, Real-time updates
 */
export default function UnifiedPipeline() {
  const { toast } = useToast();
  const { isReadOnly, canEdit, canCreate, isDemoAgencySelected } = useAgency();

  // State
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" or "table"
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("ALL");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pipeline stages configuration
  const pipelineStages = [
    { id: "new", name: "New", color: "#3F0D28", probability: 10, order: 1 },
    {
      id: "qualified",
      name: "Qualified",
      color: "#1A777B",
      probability: 40,
      order: 2,
    },
    {
      id: "proposal",
      name: "Proposal",
      color: "#F59E0B",
      probability: 70,
      order: 3,
    },
    {
      id: "negotiation",
      name: "Negotiation",
      color: "#F97316",
      probability: 85,
      order: 4,
    },
    { id: "won", name: "Won", color: "#10B981", probability: 100, order: 5 },
    { id: "lost", name: "Lost", color: "#EF4444", probability: 0, order: 6 },
  ];

  // Fetch opportunities
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      if (isDemoAgencySelected()) {
        console.log("[UnifiedPipeline] Using demo data");
        const response = await demoDataService.getOpportunities();
        setOpportunities(response.data);
        setFilteredOpportunities(response.data);
      } else {
        const response = await dealsApi.getAll();
        setOpportunities(response.data);
        setFilteredOpportunities(response.data);
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      toast({
        title: "Error",
        description: "Failed to load opportunities.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, isDemoAgencySelected]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Filter and sort opportunities
  useEffect(() => {
    let filtered = opportunities;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (opp) =>
          opp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.lead?.company?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply stage filter
    if (filterStage !== "ALL") {
      filtered = filtered.filter((opp) => opp.stage === filterStage);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle numeric values
      if (sortBy === "amount" || sortBy === "probability") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredOpportunities(filtered);
  }, [opportunities, searchTerm, filterStage, sortBy, sortOrder]);

  // Calculate metrics
  const metrics = {
    total: filteredOpportunities.length,
    totalValue: filteredOpportunities.reduce(
      (sum, opp) => sum + (opp.amount || 0),
      0,
    ),
    weightedValue: filteredOpportunities.reduce(
      (sum, opp) => sum + ((opp.amount || 0) * (opp.probability || 0)) / 100,
      0,
    ),
    byStage: pipelineStages.reduce((acc, stage) => {
      acc[stage.id] = filteredOpportunities.filter(
        (opp) => opp.stage === stage.id,
      ).length;
      return acc;
    }, {}),
    conversionRate:
      opportunities.length > 0
        ? Math.round(
            (filteredOpportunities.filter((opp) => opp.stage === "won").length /
              filteredOpportunities.length) *
              100,
          )
        : 0,
  };

  // Context menu handlers for opportunities
  const handleOpportunityEdit = (opportunity) => {
    setSelectedOpportunity(opportunity);
  };

  const handleOpportunityDelete = async (opportunity) => {
    try {
      await dealsApi.delete(opportunity.id);
      setOpportunities((prev) => prev.filter((o) => o.id !== opportunity.id));
      setFilteredOpportunities((prev) =>
        prev.filter((o) => o.id !== opportunity.id),
      );

      toast({
        title: "Opportunity Deleted",
        description: `${opportunity.name} has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete opportunity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpportunityDuplicate = async (opportunity) => {
    try {
      const duplicatedOpportunity = await dealsApi.create({
        ...opportunity,
        name: `${opportunity.name} (Copy)`,
        id: undefined, // Remove ID to create new record
        created_at: undefined,
        updated_at: undefined,
      });

      setOpportunities((prev) => [duplicatedOpportunity.data, ...prev]);
      setFilteredOpportunities((prev) => [duplicatedOpportunity.data, ...prev]);

      toast({
        title: "Opportunity Duplicated",
        description: `${opportunity.name} has been duplicated.`,
      });
    } catch (error) {
      console.error("Error duplicating opportunity:", error);
      toast({
        title: "Duplicate Failed",
        description: "Failed to duplicate opportunity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpportunityMoveStage = (opportunity) => {
    toast({
      title: "Move Opportunity",
      description: `Moving ${opportunity.name} to a different stage.`,
    });
  };

  const handleOpportunityViewActivities = (opportunity) => {
    toast({
      title: "View Activities",
      description: `Viewing activities for ${opportunity.name}.`,
    });
  };

  const handleOpportunityAddNote = (opportunity) => {
    toast({
      title: "Add Note",
      description: `Adding note to ${opportunity.name}.`,
    });
  };

  // Context menu configuration for opportunities
  const opportunityContextMenuConfig = (opportunity) =>
    CRMMenuConfigs.deal(opportunity, {
      onEdit: handleOpportunityEdit,
      onDelete: handleOpportunityDelete,
      onDuplicate: handleOpportunityDuplicate,
      onMoveStage: handleOpportunityMoveStage,
      onViewActivities: handleOpportunityViewActivities,
      onAddNote: handleOpportunityAddNote,
    });

  // Kanban view component
  const KanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {pipelineStages.map((stage) => (
        <div key={stage.id} className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-lg font-semibold text-gray-900"
              style={{ color: stage.color }}
            >
              {stage.name}
            </h3>
            <Badge variant="secondary" className="text-sm">
              {metrics.byStage[stage.id] || 0} deals
            </Badge>
          </div>

          <div className="flex-1 min-h-[400px] bg-gray-50 rounded-lg p-4 space-y-3">
            {filteredOpportunities
              .filter((opp) => opp.stage === stage.id)
              .map((opportunity) => (
                <Card
                  key={opportunity.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] border-l-4"
                  style={{ borderLeftColor: stage.color }}
                  onClick={() => setSelectedOpportunity(opportunity)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">
                        {opportunity.name}
                      </h4>
                      <Badge
                        style={{
                          backgroundColor:
                            pipelineStages.find(
                              (s) => s.id === opportunity.stage,
                            )?.color || "#6B7280",
                          color: "white",
                        }}
                      >
                        {opportunity.stage}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {opportunity.lead?.name} - {opportunity.lead?.company}
                    </p>

                    <div className="flex items-center gap-4 text-sm mb-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          {formatCurrency(opportunity.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-yellow-600" />
                        <span>{opportunity.probability}%</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate(opportunity.expected_close_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{opportunity.owner_name || "Unassigned"}</span>
                      </div>
                    </div>

                    {opportunity.tags && opportunity.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {opportunity.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

            {filteredOpportunities.filter((opp) => opp.stage === stage.id)
              .length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="mb-4">
                  <Target className="h-12 w-12 text-gray-300 mx-auto" />
                </div>
                <p className="text-sm">
                  No deals in {stage.name.toLowerCase()}
                </p>
                {canCreate() && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      /* Handle create new opportunity */
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deal
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // Table view component
  const TableView = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-3 font-medium text-gray-700">Name</th>
              <th className="text-left p-3 font-medium text-gray-700">Lead</th>
              <th className="text-left p-3 font-medium text-gray-700">
                Amount
              </th>
              <th className="text-left p-3 font-medium text-gray-700">
                Probability
              </th>
              <th className="text-left p-3 font-medium text-gray-700">Stage</th>
              <th className="text-left p-3 font-medium text-gray-700">Owner</th>
              <th className="text-left p-3 font-medium text-gray-700">
                Created
              </th>
              <th className="text-left p-3 font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOpportunities.map((opportunity) => (
              <tr
                key={opportunity.id}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedOpportunity(opportunity)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const items = opportunityContextMenuConfig(opportunity);

                  // Use global context menu
                  import("@/components/ui/ContextMenuProvider").then(
                    ({ useContextMenu }) => {
                      const { showContextMenu } = useContextMenu();
                      showContextMenu({
                        items,
                        position: { x: e.clientX, y: e.clientY },
                        data: opportunity,
                      });
                    },
                  );
                }}
              >
                <td className="p-3">
                  <div className="font-medium text-gray-900">
                    {opportunity.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {opportunity.lead?.name} - {opportunity.lead?.company}
                  </div>
                </td>
                <td className="p-3 text-right font-medium">
                  {formatCurrency(opportunity.amount)}
                </td>
                <td className="p-3 text-center">
                  <Badge variant="secondary">{opportunity.probability}%</Badge>
                </td>
                <td className="p-3">
                  <Badge
                    variant={
                      opportunity.stage === "won"
                        ? "success"
                        : opportunity.stage === "lost"
                          ? "destructive"
                          : "default"
                    }
                  >
                    {opportunity.stage}
                  </Badge>
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {opportunity.owner_name || "Unassigned"}
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {formatDate(opportunity.created_at)}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpportunityEdit(opportunity)}
                      disabled={!canEdit()}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpportunityDelete(opportunity)}
                      disabled={!canEdit()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center pt-[150px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F0D28] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Pipeline
              </h1>
              {isReadOnly() && <ViewOnlyBadge />}
            </div>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              {isReadOnly()
                ? "View deals through your sales process - Read-only access"
                : "Track deals through your sales process with advanced Kanban and Table views"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="px-3 py-2"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="px-3 py-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F0D28] focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-3 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F0D28] focus:border-transparent"
            >
              <option value="ALL">All Stages</option>
              {pipelineStages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F0D28] focus:border-transparent"
            >
              <option value="created_at">Created Date</option>
              <option value="amount">Deal Amount</option>
              <option value="probability">Probability</option>
            </select>

            <Button
              variant={sortOrder === "asc" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2"
            >
              <TrendingUp
                className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`}
              />
            </Button>

            {/* Actions */}
            {canCreate() && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setSelectedOpportunity({})}
                className="bg-[#3F0D28] hover:bg-[#8B2318] text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Deal
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-900">
              {metrics.total}
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Deals</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-[#3F0D28]">
              {formatCurrency(metrics.totalValue)}
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Value</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.weightedValue)}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Weighted Value
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.conversionRate}%
            </div>
            <div className="text-sm text-gray-600 font-medium">Win Rate</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {viewMode === "kanban" ? <KanbanView /> : <TableView />}
      </div>

      {/* Opportunity Detail Panel */}
      {selectedOpportunity && (
        <div className="fixed inset-0 sm:right-0 sm:left-auto sm:top-16 sm:bottom-0 w-full sm:w-96 bg-white border-l border-gray-200 shadow-lg z-50 overflow-y-auto">
          <div className="p-6 pt-20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedOpportunity.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedOpportunity.lead?.name} -{" "}
                  {selectedOpportunity.lead?.company}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOpportunity(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Deal Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="font-medium">
                      {formatCurrency(selectedOpportunity.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Probability:</span>
                    <span className="font-medium">
                      {selectedOpportunity.probability}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Stage:</span>
                    <span className="font-medium">
                      {selectedOpportunity.stage}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Expected Close:
                    </span>
                    <span className="font-medium">
                      {formatDate(selectedOpportunity.expected_close_date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
