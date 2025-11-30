import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Users,
  Mail,
  FileText,
  Percent,
  LayoutGrid,
  Filter,
} from "lucide-react";

// Available widget types
const WIDGET_CATEGORIES = {
  metrics: {
    name: "Metrics",
    icon: BarChart3,
    widgets: [
      {
        id: "total-revenue",
        name: "Total Revenue",
        icon: DollarSign,
        component: "MetricCard",
        props: {
          title: "Total Revenue",
          color: "accent",
          subtitle: "Current period",
          additionalInfo: [
            { label: "This Month", value: "$0" },
            { label: "Last Month", value: "$0" },
          ],
        },
        description: "Revenue metrics with trend",
      },
      {
        id: "active-deals",
        name: "Active Deals",
        icon: TrendingUp,
        component: "MetricCard",
        props: {
          title: "Active Deals",
          color: "blue",
          subtitle: "In pipeline",
          additionalInfo: [
            { label: "Won", value: "0" },
            { label: "Lost", value: "0" },
          ],
        },
        description: "Active deal count with status",
      },
      {
        id: "new-leads",
        name: "New Leads",
        icon: Users,
        component: "MetricCard",
        props: {
          title: "New Leads",
          color: "green",
          subtitle: "This period",
          additionalInfo: [
            { label: "Qualified", value: "0" },
            { label: "Unqualified", value: "0" },
          ],
        },
        description: "New leads with qualification",
      },
      {
        id: "conversion-rate",
        name: "Conversion Rate",
        icon: Percent,
        component: "MetricCard",
        props: {
          title: "Conversion Rate",
          color: "yellow",
          subtitle: "Lead to customer",
          additionalInfo: [
            { label: "This Month", value: "0%" },
            { label: "Last Month", value: "0%" },
          ],
        },
        description: "Conversion rate with history",
      },
      {
        id: "avg-deal-size",
        name: "Avg. Deal Size",
        icon: DollarSign,
        component: "MetricCard",
        props: {
          title: "Avg. Deal Size",
          color: "green",
          subtitle: "Per closed deal",
          additionalInfo: [
            { label: "Smallest", value: "$0" },
            { label: "Largest", value: "$0" },
          ],
        },
        description: "Average deal value metrics",
      },
      {
        id: "active-accounts",
        name: "Active Accounts",
        icon: Users,
        component: "MetricCard",
        props: {
          title: "Active Accounts",
          color: "blue",
          subtitle: "Customer base",
          additionalInfo: [
            { label: "New", value: "0" },
            { label: "Churned", value: "0" },
          ],
        },
        description: "Account metrics",
      },
      {
        id: "customer-ltv",
        name: "Customer LTV",
        icon: DollarSign,
        component: "MetricCard",
        props: {
          title: "Customer LTV",
          color: "accent",
          subtitle: "Average lifetime value",
          additionalInfo: [
            { label: "Avg. Revenue", value: "$0" },
            { label: "Retention", value: "0 mo" },
          ],
        },
        description: "Customer lifetime value",
      },
    ],
  },
  full: {
    name: "Full",
    icon: LayoutGrid,
    widgets: [
      {
        id: "full-sales",
        name: "Sales Overview",
        icon: TrendingUp,
        component: "FullSalesWidget",
        props: {},
        description: "Complete sales metrics dashboard",
      },
      {
        id: "full-marketing",
        name: "Marketing Performance",
        icon: Mail,
        component: "FullMarketingWidget",
        props: {},
        description: "Complete marketing analytics",
      },
      {
        id: "revenue-chart",
        name: "Revenue Chart",
        icon: BarChart3,
        component: "RevenueChart",
        props: { title: "Revenue Overview" },
        description: "Revenue over time visualization",
      },
      {
        id: "conversion-funnel",
        name: "Conversion Funnel",
        icon: Filter,
        component: "ConversionFunnelWidget",
        props: {},
        description: "Lead conversion funnel",
      },
      {
        id: "profit-margin",
        name: "Profit & Loss",
        icon: DollarSign,
        component: "ProfitMarginWidget",
        props: {},
        description: "Profit and loss analysis",
      },
      {
        id: "email-marketing",
        name: "Email Marketing",
        icon: Mail,
        component: "EmailMarketingWidget",
        props: {},
        description: "Email campaign metrics",
      },
      {
        id: "form-submissions",
        name: "Form Submissions",
        icon: FileText,
        component: "FormSubmissionsWidget",
        props: {},
        description: "Form submission analytics",
      },
    ],
  },
};

export default function WidgetSelector({ isOpen, onClose, onAddWidget }) {
  const [selectedCategory, setSelectedCategory] = useState("metrics");
  const [searchQuery, setSearchQuery] = useState("");
  const [addingWidget, setAddingWidget] = useState(null); // Track which widget is being added

  const handleAddWidget = async (widget) => {
    if (addingWidget) return; // Prevent multiple simultaneous additions

    setAddingWidget(widget.id);

    try {
      const widgetId = `${widget.id}-${Date.now()}`;
      const isMetric = widget.component === "MetricCard";
      const isFull = widget.component.startsWith("Full");
      const newWidget = {
        i: widgetId,
        x: 0,
        y: Infinity, // Add to the bottom
        w: isMetric ? 3 : isFull ? 6 : 6,
        h: isMetric ? 2 : isFull ? 4 : 3,
        minW: isMetric ? 2 : isFull ? 4 : 4,
        minH: isMetric ? 2 : isFull ? 4 : 3,
        component: widget.component,
        props: widget.props,
      };

      await onAddWidget(newWidget);

      // Close the selector after successful addition
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error adding widget:", error);
    } finally {
      setAddingWidget(null);
    }
  };

  const filteredWidgets = searchQuery
    ? Object.values(WIDGET_CATEGORIES).flatMap((cat) =>
        cat.widgets.filter(
          (w) =>
            w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.description.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    : WIDGET_CATEGORIES[selectedCategory]?.widgets || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-[#1a1d24] border-l border-crm-border shadow-2xl z-50 flex flex-col pt-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-crm-border">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3F0D28] to-[#3F0D28] flex items-center justify-center">
                  <LayoutGrid className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-crm-text-primary">
                    Add Widgets
                  </h2>
                  <p className="text-xs text-crm-text-secondary">
                    Customize your dashboard
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-crm-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search widgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories */}
            {!searchQuery && (
              <div className="flex gap-2 p-4 border-b border-crm-border overflow-x-auto">
                {Object.entries(WIDGET_CATEGORIES).map(([key, category]) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        selectedCategory === key
                          ? "bg-[#3F0D28] text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Widget List */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {filteredWidgets.map((widget) => {
                  const Icon = widget.icon;
                  return (
                    <motion.div
                      key={widget.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group border border-crm-border rounded-lg p-4 hover:border-[#3F0D28] hover:shadow-md transition-all cursor-pointer ${
                        addingWidget === widget.id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => !addingWidget && handleAddWidget(widget)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center group-hover:from-[#3F0D28]/10 group-hover:to-[#3F0D28]/20 transition-colors">
                          <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-[#3F0D28] dark:group-hover:text-[#3F0D28]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm text-crm-text-primary group-hover:text-[#3F0D28] transition-colors">
                            {widget.name}
                          </h3>
                          <p className="text-xs text-crm-text-secondary mt-1">
                            {widget.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddWidget(widget);
                          }}
                          disabled={addingWidget === widget.id}
                        >
                          {addingWidget === widget.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-[#3F0D28]" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredWidgets.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-sm text-crm-text-secondary">
                    No widgets found
                  </p>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
