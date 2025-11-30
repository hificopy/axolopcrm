import { useState, useEffect, useCallback } from "react";
import {
  Filter,
  Download,
  History as HistoryIcon,
  UserPlus,
  Mail,
  Phone,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";
import api from "@/lib/api";
import MeetingsPanel from "@/components/MeetingsPanel";

const EVENT_TYPES = {
  LEAD_CREATED: { icon: UserPlus, label: "Lead Created", color: "bg-blue-500" },
  LEAD_UPDATED: { icon: Edit, label: "Lead Updated", color: "bg-yellow-500" },
  LEAD_DELETED: { icon: Trash2, label: "Lead Deleted", color: "bg-[#3F0D28]" },
  OPPORTUNITY_CREATED: {
    icon: DollarSign,
    label: "Opportunity Created",
    color: "bg-[#1A777B]",
  },
  OPPORTUNITY_UPDATED: {
    icon: Edit,
    label: "Opportunity Updated",
    color: "bg-[#EBB207]",
  },
  OPPORTUNITY_WON: {
    icon: CheckCircle,
    label: "Opportunity Won",
    color: "bg-[#1A777B]",
  },
  OPPORTUNITY_LOST: {
    icon: XCircle,
    label: "Opportunity Lost",
    color: "bg-[#3F0D28]",
  },
  EMAIL_SENT: { icon: Mail, label: "Email Sent", color: "bg-purple-500" },
  CALL_MADE: { icon: Phone, label: "Call Made", color: "bg-indigo-500" },
  NOTE_ADDED: { icon: FileText, label: "Note Added", color: "bg-gray-500" },
  STATUS_CHANGED: {
    icon: Edit,
    label: "Status Changed",
    color: "bg-orange-500",
  },
  MEETING_BOOKED: {
    icon: Calendar,
    label: "Meeting Booked",
    color: "bg-cyan-500",
  },
  OTHER: { icon: HistoryIcon, label: "Other", color: "bg-gray-400" },
};

export default function History() {
  const { toast } = useToast();
  const [historyEvents, setHistoryEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [filterDateRange, setFilterDateRange] = useState("ALL");

  // Fetch history events from API
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/history");

      setHistoryEvents(response.data);
      setFilteredEvents(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast({
        title: "Error",
        description: "Failed to load history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Filter history events
  useEffect(() => {
    let filtered = historyEvents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by type
    if (filterType !== "ALL") {
      filtered = filtered.filter((event) => event.event_type === filterType);
    }

    // Filter by date range
    if (filterDateRange !== "ALL") {
      const now = new Date();
      let startDate;

      switch (filterDateRange) {
        case "TODAY":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "WEEK":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "MONTH":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "QUARTER":
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(
          (event) => new Date(event.created_at) >= startDate,
        );
      }
    }

    setFilteredEvents(filtered);
  }, [searchTerm, filterType, filterDateRange, historyEvents]);

  const handleExport = () => {
    try {
      const csvHeaders = [
        "Date",
        "Event Type",
        "Title",
        "Description",
        "Entity",
        "User",
      ];
      const csvRows = historyEvents.map((event) => [
        formatDate(event.created_at),
        event.event_type,
        event.title,
        event.description || "",
        event.entity_name || "N/A",
        event.user?.name || "System",
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `history-export-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${historyEvents.length} history events to CSV.`,
      });
    } catch (error) {
      console.error("Error exporting history:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateStats = () => {
    const totalEvents = historyEvents.length;
    const todayEvents = historyEvents.filter((event) => {
      const eventDate = new Date(event.created_at);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }).length;
    const thisWeekEvents = historyEvents.filter((event) => {
      const eventDate = new Date(event.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return eventDate >= weekAgo;
    }).length;
    const thisMonthEvents = historyEvents.filter((event) => {
      const eventDate = new Date(event.created_at);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return eventDate >= monthAgo;
    }).length;

    return { totalEvents, todayEvents, thisWeekEvents, thisMonthEvents };
  };

  const stats = calculateStats();

  const EventIcon = ({ type }) => {
    const eventType = EVENT_TYPES[type] || EVENT_TYPES.OTHER;
    const Icon = eventType.icon;
    return (
      <div className={`p-2 rounded-lg ${eventType.color} text-white`}>
        <Icon className="h-4 w-4" />
      </div>
    );
  };

  const groupEventsByDate = (events) => {
    const groups = {};
    events.forEach((event) => {
      const date = new Date(event.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
    });
    return groups;
  };

  const groupedEvents = groupEventsByDate(filteredEvents);

  return (
    <div className="h-full flex crm-page-wrapper bg-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Header */}
        <div className="relative bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                History & Meetings
              </h1>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                Complete activity log, audit trail, and today's meeting schedule
              </p>
            </div>

            <div className="crm-button-group">
              <Button
                variant="outline"
                size="default"
                className="gap-2"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="crm-stats-grid mt-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary-blue/10">
                  <HistoryIcon className="h-5 w-5 text-primary-blue" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Total Events
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalEvents}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1A777B]/5 to-[#1A777B]/10 rounded-xl p-5 border border-[#1A777B]/20 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#1A777B]/10">
                  <Clock className="h-5 w-5 text-[#1A777B]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#1A777B] uppercase tracking-wide">
                    Today
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">
                    {stats.todayEvents}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary-yellow/10">
                  <Clock className="h-5 w-5 text-primary-yellow" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                    This Week
                  </div>
                  <div className="text-3xl font-bold text-amber-600 mt-1">
                    {stats.thisWeekEvents}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-[#3F0D28]/30 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#3F0D28]/10">
                  <Clock className="h-5 w-5 text-[#3F0D28]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#3F0D28] uppercase tracking-wide">
                    This Month
                  </div>
                  <div className="text-3xl font-bold text-[#3F0D28] mt-1">
                    {stats.thisMonthEvents}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mt-6">
            <div className="flex-1">
              <Input
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3F0D28]"
            >
              <option value="ALL">All Types</option>
              <option value="LEAD_CREATED">Lead Created</option>
              <option value="LEAD_UPDATED">Lead Updated</option>
              <option value="OPPORTUNITY_CREATED">Opportunity Created</option>
              <option value="OPPORTUNITY_WON">Opportunity Won</option>
              <option value="OPPORTUNITY_LOST">Opportunity Lost</option>
              <option value="EMAIL_SENT">Email Sent</option>
              <option value="CALL_MADE">Call Made</option>
              <option value="NOTE_ADDED">Note Added</option>
              <option value="MEETING_BOOKED">Meeting Booked</option>
            </select>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3F0D28]"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 30 Days</option>
              <option value="QUARTER">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* History Timeline */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#3F0D28] mb-4"></div>
              <p className="text-gray-600 font-medium">Loading history...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <HistoryIcon className="h-16 w-16 text-[#3F0D28]/30 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No history events found
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== "ALL" || filterDateRange !== "ALL"
                  ? "Try adjusting your filters"
                  : "History will appear here as you use the CRM"}
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {Object.entries(groupedEvents).map(([date, events]) => (
                <div key={date} className="mb-8">
                  <div className="sticky top-0 bg-gray-50 py-2 mb-4 z-10">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {date}
                    </h3>
                  </div>
                  <div className="space-y-3 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200">
                    {events.map((event) => (
                      <Card
                        key={event.id}
                        className="ml-12 hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="absolute -left-6 mt-1">
                              <EventIcon type={event.event_type} />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {event.title}
                                  </h4>
                                  {event.description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {event.description}
                                    </p>
                                  )}

                                  {/* Enhanced meeting details */}
                                  {event.event_type === "MEETING_BOOKED" &&
                                    event.metadata && (
                                      <div className="mt-3 p-3 bg-cyan-50 border border-cyan-200 rounded-lg space-y-2">
                                        {event.metadata.scheduled_time && (
                                          <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-cyan-600" />
                                            <span className="font-medium text-cyan-900">
                                              {new Date(
                                                event.metadata.scheduled_time,
                                              ).toLocaleString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                                hour12: true,
                                              })}
                                            </span>
                                            {event.metadata.duration && (
                                              <span className="text-cyan-700">
                                                ({event.metadata.duration} min)
                                              </span>
                                            )}
                                          </div>
                                        )}
                                        <div className="flex flex-wrap gap-3 text-xs text-cyan-800">
                                          {event.metadata.email && (
                                            <div className="flex items-center gap-1">
                                              <Mail className="h-3 w-3" />
                                              <span>
                                                {event.metadata.email}
                                              </span>
                                            </div>
                                          )}
                                          {event.metadata.phone && (
                                            <div className="flex items-center gap-1">
                                              <Phone className="h-3 w-3" />
                                              <span>
                                                {event.metadata.phone}
                                              </span>
                                            </div>
                                          )}
                                          {event.metadata.company && (
                                            <div className="flex items-center gap-1">
                                              <span className="font-medium">
                                                {event.metadata.company}
                                              </span>
                                            </div>
                                          )}
                                          {event.metadata.status && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs bg-white"
                                            >
                                              {event.metadata.status}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                  {new Date(
                                    event.created_at,
                                  ).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                                {event.entity_name &&
                                  event.event_type !== "MEETING_BOOKED" && (
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">
                                        Entity:
                                      </span>
                                      <span>{event.entity_name}</span>
                                    </div>
                                  )}
                                {event.user && (
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">By:</span>
                                    <span>{event.user.name}</span>
                                  </div>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {EVENT_TYPES[event.event_type]?.label ||
                                    event.event_type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Meetings Panel on the Right */}
      <MeetingsPanel />
    </div>
  );
}
