import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import calendarService from "../services/calendarService";
import { meetingsApi } from "../lib/api";
import CalendarVisibilityControls from "../components/calendar/CalendarVisibilityControls";
import EventDetailModal from "../components/calendar/EventDetailModal";
import CreateEventModal from "../components/calendar/CreateEventModal";
import CreateBookingDialog from "../components/meetings/CreateBookingDialog";
import BookingEmbedModal from "../components/meetings/BookingEmbedModal";
import { useToast } from "../components/ui/use-toast";
import { useAgency } from "@/hooks/useAgency";
import ViewOnlyBadge from "@/components/ui/view-only-badge";
import { demoDataService } from "../services/demoDataService";
import { CRMMenuConfigs } from "@/components/ui/ContextMenuProvider";
import {
  Calendar as CalendarIcon,
  Settings,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  Sparkles,
  BarChart3,
  Target,
  Link as LinkIcon,
  Users,
  Clock,
  PhoneCall,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {} from "../components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

/**
 * Enhanced Calendar Page - Calendar + Meetings Complete Integration
 *
 * Features:
 * - Full calendar functionality with Google sync
 * - Complete meetings analytics and booking links management
 * - Sales analytics with conversion funnels
 * - Scheduling analytics with insights
 * - Unified booking link creation and management
 * - Beautiful UI with smooth animations
 */
export default function Calendar() {
  const { toast } = useToast();
  const calendarRef = useRef(null);
  const { isReadOnly, canEdit, canCreate, isDemoAgencySelected } = useAgency();

  // Mode Management
  const [activeMode, setActiveMode] = useState("calendar"); // 'calendar' | 'analytics'
  const [analyticsTab, setAnalyticsTab] = useState("overview"); // 'overview' | 'sales-analytics' | 'scheduling-analytics' | 'booking-links'

  // Calendar State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [preset, setPreset] = useState(null);
  const [googleCalendars, setGoogleCalendars] = useState([]);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [showVisibilityControls, setShowVisibilityControls] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Meetings State
  const [bookingLinks, setBookingLinks] = useState([]);
  const [showCreateBookingDialog, setShowCreateBookingDialog] = useState(false);
  const [showEditBookingDialog, setShowEditBookingDialog] = useState(false);
  const [showDeleteBookingDialog, setShowDeleteBookingDialog] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedBookingLink, setSelectedBookingLink] = useState(null);
  const [editingBookingLink, setEditingBookingLink] = useState(null);
  const [deletingBookingLink, setDeletingBookingLink] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [generalAnalytics, setGeneralAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Utility functions for analytics calculations
  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const getShowRate = () => {
    if (!salesAnalytics?.conversionFunnel) return 0;
    return calculatePercentage(
      salesAnalytics.conversionFunnel.showed,
      salesAnalytics.conversionFunnel.booked,
    );
  };

  const getCloseRate = () => {
    if (!salesAnalytics?.conversionFunnel) return 0;
    return calculatePercentage(
      salesAnalytics.conversionFunnel.closed,
      salesAnalytics.conversionFunnel.showed,
    );
  };

  const getDropOffRate = () => {
    if (!salesAnalytics?.conversionFunnel) return 0;
    const { booked, closed } = salesAnalytics.conversionFunnel;
    return calculatePercentage(booked - closed, booked);
  };

  const getOutcomePercentages = () => {
    if (!salesAnalytics?.outcomes) return { won: 0, lost: 0, pending: 0 };
    const { won, lost, pending } = salesAnalytics.outcomes;
    const total = won + lost + pending;
    return {
      won: calculatePercentage(won, total),
      lost: calculatePercentage(lost, total),
      pending: calculatePercentage(pending, total),
    };
  };

  const getAttendanceRate = () => {
    if (!generalAnalytics) return 0;
    const { noShowRate = 0, cancellationRate = 0 } = generalAnalytics;
    return 100 - noShowRate - cancellationRate;
  };

  const getMaxValue = (array, key) => {
    if (!array || array.length === 0) return 1;
    return Math.max(...array.map((item) => item[key] || 0));
  };

  // Event color utility function
  const getEventColor = (category, subcategory) => {
    const colorMap = {
      meeting: "#3F0D28",
      call: "#2563eb",
      task: "#16a34a",
      reminder: "#eab308",
      google: "#4285f4",
      default: "#6b7280",
    };
    return colorMap[category] || colorMap[subcategory] || colorMap.default;
  };

  // Calendar functions
  const loadEvents = useCallback(async () => {
    try {
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) return;

      const view = calendarApi.view;
      const timeMin = view.activeStart.toISOString();
      const timeMax = view.activeEnd.toISOString();

      let allEvents;
      if (isDemoAgencySelected()) {
        console.log("[Calendar] Using demo data");
        const response = await demoDataService.getCalendarEvents(
          new Date(timeMin),
          new Date(timeMax),
        );
        allEvents = response.data;
      } else {
        allEvents = await calendarService.getAllEvents({
          timeMin,
          timeMax,
        });
      }

      // Transform events for FullCalendar
      const transformedEvents = allEvents.map((event) => ({
        id: event.id,
        title: event.title || event.summary,
        start: event.start,
        end: event.end,
        allDay: event.allDay || false,
        backgroundColor:
          event.color || getEventColor(event.category, event.subcategory),
        borderColor:
          event.color || getEventColor(event.category, event.subcategory),
        extendedProps: {
          ...event,
        },
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error("Error loading events:", error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const [presetData, connected] = await Promise.all([
        calendarService.getPreset(),
        calendarService.checkGoogleStatus(),
      ]);

      setPreset(presetData);
      setIsGoogleConnected(connected);

      if (connected) {
        try {
          const calendars = await calendarService.listGoogleCalendars();
          setGoogleCalendars(calendars);
        } catch (error) {
          console.error("Error loading Google calendars:", error);
          toast({
            title: "Warning",
            description: "Could not load Google calendars",
            variant: "default",
          });
        }
      }

      await loadEvents();
    } catch (error) {
      console.error("Error loading calendar data:", error);
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [loadEvents, toast]);

  // Meetings functions
  const loadBookingLinks = useCallback(async () => {
    try {
      const response = await meetingsApi.getBookingLinks();
      setBookingLinks(response.data || []);
    } catch (error) {
      console.error("Error loading booking links:", error);
      setBookingLinks([]);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const response = await meetingsApi.getOverviewAnalytics();
      setAnalytics(
        response.data || {
          totalBookings: 0,
          showRate: 0,
          closeRate: 0,
          avgBookingValue: 0,
        },
      );
    } catch (error) {
      console.error("Error loading analytics:", error);
      setAnalytics({
        totalBookings: 0,
        showRate: 0,
        closeRate: 0,
        avgBookingValue: 0,
      });
    }
  }, []);

  const loadSalesAnalytics = useCallback(async () => {
    try {
      const response = await meetingsApi.getSalesAnalytics();
      setSalesAnalytics(
        response.data || {
          conversionFunnel: { booked: 0, showed: 0, closed: 0 },
          outcomes: { won: 0, lost: 0, pending: 0 },
          topObjections: [],
          revenueMetrics: { totalRevenue: 0, avgDealSize: 0, pipelineValue: 0 },
          topClosers: [],
          leadSources: [],
        },
      );
    } catch (error) {
      console.error("Error loading sales analytics:", error);
      setSalesAnalytics({
        conversionFunnel: { booked: 0, showed: 0, closed: 0 },
        outcomes: { won: 0, lost: 0, pending: 0 },
        topObjections: [],
        revenueMetrics: { totalRevenue: 0, avgDealSize: 0, pipelineValue: 0 },
        topClosers: [],
        leadSources: [],
      });
    }
  }, []);

  const loadGeneralAnalytics = useCallback(async () => {
    try {
      const response = await meetingsApi.getSchedulingAnalytics();
      setGeneralAnalytics(
        response.data || {
          bookingTrends: [],
          cancellationRate: 0,
          rescheduleRate: 0,
          noShowRate: 0,
          popularTimeSlots: [],
          eventTypes: [],
          busiestDays: [],
        },
      );
    } catch (error) {
      console.error("Error loading general analytics:", error);
      setGeneralAnalytics({
        bookingTrends: [],
        cancellationRate: 0,
        rescheduleRate: 0,
        noShowRate: 0,
        popularTimeSlots: [],
        eventTypes: [],
        busiestDays: [],
      });
    }
  }, []);

  // Load all data - with loop prevention
  const loadAllData = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (analyticsLoading) return;

    try {
      setAnalyticsLoading(true);
      await Promise.all([
        loadCalendarData(),
        loadBookingLinks(),
        loadAnalytics(),
        loadSalesAnalytics(),
        loadGeneralAnalytics(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load some data. Please refresh.",
        variant: "destructive",
      });
    } finally {
      setAnalyticsLoading(false);
    }
  }, [toast]); // Only depend on toast, not other functions

  // Initialize data - run once on mount only
  useEffect(() => {
    loadAllData();
  }, []); // Empty dependency array - prevent infinite loops

  // Check URL params for connection status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("connected") === "true") {
      const services = urlParams.get("services") || "calendar";
      const servicesList = services
        .split(",")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(", ");

      toast({
        title: "🎉 Google Services Connected!",
        description: `Successfully connected: ${servicesList}. Your events are syncing now!`,
      });

      setTimeout(() => {
        loadCalendarData();
      }, 1500);

      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get("error") === "auth_failed") {
      toast({
        title: "Connection Failed",
        description: "Failed to connect Google services. Please try again.",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, loadCalendarData]);

  // Format date range for display
  const formatDateRange = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return "";

    const view = calendarApi.view;
    const start = view.currentStart;
    const end = view.currentEnd;

    const options = { month: "long", year: "numeric" };

    if (currentView === "dayGridMonth") {
      return start.toLocaleDateString("en-US", options);
    } else if (currentView === "timeGridWeek") {
      const startStr = start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const endStr = end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${startStr} - ${endStr}`;
    } else if (currentView === "timeGridDay") {
      return start.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    return "";
  };

  // ==================== Handler Functions ====================

  // Refresh calendar and analytics data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAllData();
      toast({
        title: "Refreshed",
        description: "Calendar and analytics data updated",
      });
    } catch (error) {
      console.error("Error refreshing:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  }, [loadAllData, toast]);

  // Navigate calendar (today/prev/next)
  const handleNavigate = useCallback((action) => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    switch (action) {
      case "today":
        calendarApi.today();
        break;
      case "prev":
        calendarApi.prev();
        break;
      case "next":
        calendarApi.next();
        break;
    }
  }, []);

  // Switch calendar view (month/week/day/list)
  const handleViewChange = useCallback((view) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
      setCurrentView(view);
    }
  }, []);

  // Handle calendar event click
  const handleEventClick = useCallback(
    (info) => {
      setSelectedEvent(info);
      setShowEventModal(true);
    },
    [toast],
  );

  // Handle date click for creating new events
  const handleDateClick = useCallback(
    (info) => {
      if (canCreate()) {
        setShowCreateModal(true);
      }
    },
    [canCreate],
  );

  // Context menu handlers for calendar events
  const handleEventEdit = (event) => {
    toast({
      title: "Edit Event",
      description: `Editing ${event.title}`,
    });
  };

  const handleEventDelete = async (event) => {
    try {
      await calendarService.deleteEvent(event.id);
      setEvents((prev) => prev.filter((e) => e.id !== event.id));

      toast({
        title: "Event Deleted",
        description: `${event.title} has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEventDuplicate = async (event) => {
    try {
      const duplicatedEvent = await calendarService.createEvent({
        ...event,
        title: `${event.title} (Copy)`,
        id: undefined, // Remove ID to create new record
        created_at: undefined,
        updated_at: undefined,
      });

      setEvents((prev) => [duplicatedEvent.data, ...prev]);

      toast({
        title: "Event Duplicated",
        description: `${event.title} has been duplicated.`,
      });
    } catch (error) {
      console.error("Error duplicating event:", error);
      toast({
        title: "Duplicate Failed",
        description: "Failed to duplicate event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEventShare = (event) => {
    const shareUrl = `${window.location.origin}/calendar/event/${event.id}`;

    navigator.clipboard.writeText(shareUrl);

    toast({
      title: "Share Link Copied",
      description: "Event share link has been copied to clipboard.",
    });
  };

  const handleEventAddNote = (event) => {
    toast({
      title: "Add Note",
      description: `Adding note to ${event.title}.`,
    });
  };

  const handleEventConvertToBooking = (event) => {
    toast({
      title: "Convert to Booking",
      description: `Converting ${event.title} to booking.`,
      badge: "Pro",
      badgeVariant: "info",
    });
  };

  // Context menu configuration for calendar events
  const eventContextMenuConfig = (event) =>
    CRMMenuConfigs.widget(event, {
      onEdit: handleEventEdit,
      onDelete: handleEventDelete,
      onDuplicate: handleEventDuplicate,
      onShare: handleEventShare,
      onAddNote: handleEventAddNote,
      onConvertToBooking: handleEventConvertToBooking,
    });

  // Connect Google services
  const handleConnectGoogle = useCallback(async () => {
    try {
      const authUrl = await calendarService.getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error connecting Google:", error);
      toast({
        title: "Error",
        description: "Failed to connect Google services",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Disconnect Google services
  const handleDisconnectGoogle = useCallback(async () => {
    try {
      await calendarService.disconnectGoogle();
      setIsGoogleConnected(false);
      setGoogleCalendars([]);
      toast({
        title: "Disconnected",
        description: "Google services disconnected successfully",
      });
    } catch (error) {
      console.error("Error disconnecting Google:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect Google services",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Create new booking link
  const handleCreateBookingLink = useCallback(
    async (data) => {
      try {
        await meetingsApi.createBookingLink(data);
        await loadBookingLinks();
        setShowCreateBookingDialog(false);
        toast({
          title: "Success",
          description: "Booking link created successfully",
        });
      } catch (error) {
        console.error("Error creating booking link:", error);
        toast({
          title: "Error",
          description: "Failed to create booking link",
          variant: "destructive",
        });
      }
    },
    [loadBookingLinks, toast],
  );

  // Edit existing booking link
  const handleEditBookingLink = useCallback((link) => {
    setEditingBookingLink(link);
    setShowEditBookingDialog(true);
  }, []);

  // Delete booking link
  const handleDeleteBookingLink = useCallback((link) => {
    setDeletingBookingLink(link);
    setShowDeleteBookingDialog(true);
  }, []);

  // Save edited booking link
  const handleSaveEditedBookingLink = useCallback(
    async (data) => {
      try {
        await meetingsApi.updateBookingLink(editingBookingLink.id, data);
        await loadBookingLinks();
        setShowEditBookingDialog(false);
        setEditingBookingLink(null);
        toast({
          title: "Success",
          description: "Booking link updated successfully",
        });
      } catch (error) {
        console.error("Error updating booking link:", error);
        toast({
          title: "Error",
          description: "Failed to update booking link",
          variant: "destructive",
        });
      }
    },
    [editingBookingLink, loadBookingLinks, toast],
  );

  // Confirm booking link deletion
  const handleConfirmDeleteBookingLink = useCallback(async () => {
    try {
      await meetingsApi.deleteBookingLink(deletingBookingLink.id);
      await loadBookingLinks();
      setShowDeleteBookingDialog(false);
      setDeletingBookingLink(null);
      toast({
        title: "Deleted",
        description: "Booking link deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting booking link:", error);
      toast({
        title: "Error",
        description: "Failed to delete booking link",
        variant: "destructive",
      });
    }
  }, [deletingBookingLink, loadBookingLinks, toast]);

  // Copy booking link to clipboard
  const copyBookingLink = useCallback(
    async (slug) => {
      try {
        const url = `${window.location.origin}/book/${slug}`;
        await navigator.clipboard.writeText(url);
        toast({
          title: "Copied!",
          description: "Booking link copied to clipboard",
        });
      } catch (error) {
        console.error("Error copying link:", error);
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  // Keyboard shortcuts for enhanced UX
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only trigger shortcuts when not typing in inputs
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      )
        return;

      // Ctrl/Cmd + N for new meeting
      if ((event.ctrlKey || event.metaKey) && event.key === "n") {
        event.preventDefault();
        if (canCreate()) {
          // Focus and click the new meeting button
          const newMeetingBtn = document.querySelector(
            "[data-new-meeting-btn]",
          );
          if (newMeetingBtn) {
            newMeetingBtn.click();
          }
        }
      }

      // Ctrl/Cmd + E for regular event
      if ((event.ctrlKey || event.metaKey) && event.key === "e") {
        event.preventDefault();
        if (canCreate()) {
          setShowCreateModal(true);
        }
      }

      // Ctrl/Cmd + B for booking link
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        if (canCreate()) {
          setShowCreateBookingDialog(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canCreate, setShowCreateModal, setShowCreateBookingDialog]);

  // Loading state
  if (loading || analyticsLoading) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center pt-[150px] bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#3F0D28] mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-pulse">
              <div className="rounded-full h-16 w-16 border-4 border-[#3F0D28]/20 mx-auto"></div>
            </div>
          </div>
          <p className="text-gray-700 font-medium text-lg">
            Loading Calendar & Analytics...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Syncing events, bookings, and insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Enhanced Header */}
      <div className="relative bg-white border-b border-gray-200 px-4 sm:px-6 py-6 shadow-sm">
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                      {activeMode === "calendar"
                        ? "Calendar"
                        : "Meeting Analytics"}
                    </h1>
                    {isReadOnly() && <ViewOnlyBadge />}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {isReadOnly()
                      ? "View meetings, calls & events - Read-only access"
                      : activeMode === "calendar"
                        ? "Manage all your meetings, calls & events"
                        : "Track performance, bookings, and scheduling insights"}
                  </p>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1.5 w-fit shadow-inner">
                <button
                  onClick={() => setActiveMode("calendar")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    activeMode === "calendar"
                      ? "bg-gradient-to-r from-[#3F0D28] to-[#2a0919] text-white shadow-lg scale-105"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Calendar</span>
                </button>
                <button
                  onClick={() => setActiveMode("analytics")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    activeMode === "analytics"
                      ? "bg-gradient-to-r from-[#3F0D28] to-[#2a0919] text-white shadow-lg scale-105"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons - Contextual */}
          <div className="flex flex-wrap items-center gap-3">
            {activeMode === "calendar" ? (
              /* Calendar Actions */
              <>
                {/* Date Navigation */}
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-200">
                  <button
                    onClick={() => handleNavigate("today")}
                    className="px-3 py-1.5 text-sm font-semibold text-gray-700 hover:text-[#3F0D28] hover:bg-gray-100 rounded-lg transition-all"
                  >
                    Today
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleNavigate("prev")}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleNavigate("next")}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                  <span className="text-base font-bold text-gray-900 ml-2 min-w-[180px] text-center">
                    {formatDateRange()}
                  </span>
                </div>

                {/* View Switcher */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1.5 shadow-inner">
                  <button
                    onClick={() => handleViewChange("dayGridMonth")}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                      currentView === "dayGridMonth"
                        ? "bg-white text-[#3F0D28] shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => handleViewChange("timeGridWeek")}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                      currentView === "timeGridWeek"
                        ? "bg-white text-[#3F0D28] shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => handleViewChange("timeGridDay")}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                      currentView === "timeGridDay"
                        ? "bg-white text-[#3F0D28] shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => handleViewChange("listWeek")}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                      currentView === "listWeek"
                        ? "bg-white text-[#3F0D28] shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    List
                  </button>
                </div>

                {/* Calendar Actions */}
                <button
                  onClick={handleRefresh}
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition-all shadow-sm bg-white border border-gray-200"
                  disabled={refreshing}
                  title="Refresh calendar"
                >
                  <RefreshCw
                    className={`h-5 w-5 text-gray-600 ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>

                <button
                  onClick={() =>
                    setShowVisibilityControls(!showVisibilityControls)
                  }
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition-all shadow-sm bg-white border border-gray-200"
                  title="Calendar settings"
                >
                  <Settings className="h-5 w-5 text-gray-600" />
                </button>

                {canCreate() && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 bg-gradient-to-r from-[#3F0D28] to-[#2a0919] text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-semibold shadow-md hover:scale-105">
                        <Plus className="h-5 w-5" />
                        <span>New Meeting</span>
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        Regular Event
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowCreateBookingDialog(true)}
                        className="flex items-center gap-2"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Booking Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            ) : (
              /* Analytics Actions */
              <>
                <button
                  onClick={handleRefresh}
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition-all shadow-sm bg-white border border-gray-200"
                  disabled={refreshing}
                  title="Refresh analytics"
                >
                  <RefreshCw
                    className={`h-5 w-5 text-gray-600 ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>

                {canCreate() && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 bg-gradient-to-r from-[#3F0D28] to-[#2a0919] text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-semibold shadow-md hover:scale-105">
                        <Plus className="h-5 w-5" />
                        <span>New Meeting</span>
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        Regular Event
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowCreateBookingDialog(true)}
                        className="flex items-center gap-2"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Booking Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Google Services Connection Banner - Only show in Calendar mode */}
      {activeMode === "calendar" && !isGoogleConnected && (
        <div className="bg-gradient-to-r from-[#3F0D28]/5 via-[#3F0D28]/10 to-[#2a0919]/5 border-b border-[#3F0D28]/20 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#3F0D28] to-[#2a0919] flex items-center justify-center shadow-lg animate-pulse">
                <CalendarIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Connect Your Google Account
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </h3>
                <p className="text-sm text-gray-700 mt-1">
                  One-click connection unlocks: Calendar, Gmail & Contacts sync
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#3F0D28]/10 text-[#3F0D28] text-xs font-semibold">
                    <CalendarIcon className="h-3 w-3" />
                    Calendar
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#3F0D28]/10 text-[#3F0D28] text-xs font-semibold">
                    <svg
                      className="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Gmail
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#3F0D28]/10 text-[#3F0D28] text-xs font-semibold">
                    <svg
                      className="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Contacts
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleConnectGoogle}
              className="flex items-center gap-2 bg-gradient-to-r from-[#3F0D28] to-[#2a0919] text-white px-6 py-3 rounded-xl hover:shadow-2xl transition-all font-bold hover:scale-105 shadow-lg"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Connect with Google
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {activeMode === "calendar" ? (
          /* Calendar View */
          <div className="flex-1 p-6">
            <div className="h-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <style>{`
                /* FullCalendar Custom Styling for Axolop */
                .fc {
                  --fc-border-color: #e5e7eb;
                  --fc-button-bg-color: #3F0D28;
                  --fc-button-border-color: #3F0D28;
                  --fc-button-hover-bg-color: #2a0919;
                  --fc-button-hover-border-color: #2a0919;
                  --fc-button-active-bg-color: #6b1a12;
                  --fc-button-active-border-color: #6b1a12;
                  --fc-today-bg-color: rgba(118, 27, 20, 0.05);
                  --fc-event-bg-color: #3F0D28;
                  --fc-event-border-color: #3F0D28;
                }

                .fc .fc-button-primary {
                  background: linear-gradient(to right, #3F0D28, #2a0919);
                  border: none;
                  border-radius: 0.5rem;
                  font-weight: 600;
                  text-transform: capitalize;
                  padding: 0.5rem 1rem;
                  box-shadow: 0 2px 4px rgba(118, 27, 20, 0.2);
                  transition: all 0.3s;
                }

                .fc .fc-button-primary:hover {
                  box-shadow: 0 4px 8px rgba(118, 27, 20, 0.3);
                  transform: translateY(-1px);
                }

                .fc .fc-button-primary:disabled {
                  opacity: 0.5;
                  transform: none;
                }

                .fc-event {
                  border-radius: 0.5rem;
                  padding: 2px 4px;
                  font-weight: 600;
                  border-left-width: 3px;
                  cursor: pointer;
                  transition: all 0.2s;
                }

                .fc-event:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }

                .fc-daygrid-day-number {
                  font-weight: 600;
                  color: #374151;
                  padding: 0.5rem;
                }

                .fc-col-header-cell-cushion {
                  font-weight: 700;
                  color: #1f2937;
                  text-transform: uppercase;
                  font-size: 0.75rem;
                  letter-spacing: 0.05em;
                }

                .fc-daygrid-day.fc-day-today {
                  background: linear-gradient(135deg, rgba(118, 27, 20, 0.03), rgba(160, 58, 46, 0.03));
                }

                .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
                  background: linear-gradient(to right, #3F0D28, #2a0919);
                  color: white;
                  border-radius: 50%;
                  width: 2rem;
                  height: 2rem;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0.25rem;
                }
              `}</style>
              <FullCalendar
                ref={calendarRef}
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  interactionPlugin,
                  listPlugin,
                ]}
                initialView={currentView}
                headerToolbar={false}
                events={events}
                eventClick={handleEventClick}
                dateClick={canCreate() ? handleDateClick : undefined}
                editable={canEdit()}
                selectable={canCreate()}
                selectMirror={canCreate()}
                dayMaxEvents={true}
                weekends={true}
                height="100%"
                eventContent={renderEventContent}
                datesSet={(dateInfo) => {
                  loadEvents();
                }}
              />
            </div>
          </div>
        ) : (
          /* Analytics View */
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {/* Analytics Tabs */}
              <Tabs
                value={analyticsTab}
                onValueChange={setAnalyticsTab}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="sales-analytics" className="gap-2">
                    <Target className="h-4 w-4" />
                    Sales Analytics
                  </TabsTrigger>
                  <TabsTrigger value="scheduling-analytics" className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Scheduling Analytics
                  </TabsTrigger>
                  <TabsTrigger value="booking-links" className="gap-2">
                    <Users className="h-4 w-4" />
                    Meetings
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <OverviewTab
                    analytics={analytics}
                    salesAnalytics={salesAnalytics}
                    generalAnalytics={generalAnalytics}
                    bookingLinks={bookingLinks}
                    onTabChange={setAnalyticsTab}
                  />
                </TabsContent>

                {/* Sales Analytics Tab */}
                <TabsContent value="sales-analytics" className="space-y-4">
                  <SalesAnalyticsTab
                    salesAnalytics={salesAnalytics}
                    getShowRate={getShowRate}
                    getCloseRate={getCloseRate}
                    getDropOffRate={getDropOffRate}
                    getOutcomePercentages={getOutcomePercentages}
                    getMaxValue={getMaxValue}
                  />
                </TabsContent>

                {/* Scheduling Analytics Tab */}
                <TabsContent value="scheduling-analytics" className="space-y-4">
                  <SchedulingAnalyticsTab
                    generalAnalytics={generalAnalytics}
                    getAttendanceRate={getAttendanceRate}
                    getMaxValue={getMaxValue}
                  />
                </TabsContent>

                {/* Booking Links Tab */}
                <TabsContent value="booking-links" className="space-y-4">
                  <BookingLinksTab
                    bookingLinks={bookingLinks}
                    onCopyLink={copyBookingLink}
                    onEditLink={handleEditBookingLink}
                    onDeleteLink={handleDeleteBookingLink}
                    onEmbedLink={(link) => {
                      setSelectedBookingLink(link);
                      setShowEmbedModal(true);
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Visibility Controls Sidebar - Only in Calendar mode */}
        {activeMode === "calendar" && showVisibilityControls && (
          <CalendarVisibilityControls
            preset={preset}
            googleCalendars={googleCalendars}
            isGoogleConnected={isGoogleConnected}
            onClose={() => setShowVisibilityControls(false)}
            onPresetUpdate={async (updatedPreset) => {
              setPreset(updatedPreset);
              await loadEvents();
            }}
            onConnectGoogle={handleConnectGoogle}
            onDisconnectGoogle={handleDisconnectGoogle}
          />
        )}
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          canEdit={canEdit()}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onDelete={async () => {
            await loadEvents();
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onUpdate={async () => {
            await loadEvents();
          }}
        />
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          canCreate={canCreate()}
          onClose={() => setShowCreateModal(false)}
          onCreate={async () => {
            await loadEvents();
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Create Booking Link Modal */}
      <CreateBookingDialog
        open={showCreateBookingDialog}
        onOpenChange={setShowCreateBookingDialog}
        onSave={handleCreateBookingLink}
      />

      {/* Edit Booking Link Modal */}
      <CreateBookingDialog
        open={showEditBookingDialog}
        onOpenChange={(open) => {
          setShowEditBookingDialog(open);
          if (!open) setEditingBookingLink(null);
        }}
        onSave={handleSaveEditedBookingLink}
        initialData={editingBookingLink}
        isEditing={true}
      />

      {/* Delete Booking Link Confirmation */}
      <AlertDialog
        open={showDeleteBookingDialog}
        onOpenChange={setShowDeleteBookingDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingBookingLink?.name}"?
              This action cannot be undone. All bookings associated with this
              link will remain in your calendar, but booking page will no longer
              be accessible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingBookingLink(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteBookingLink}
              className="btn-premium-red"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Booking Embed Modal */}
      <BookingEmbedModal
        open={showEmbedModal}
        onOpenChange={setShowEmbedModal}
        bookingLink={selectedBookingLink}
      />
    </div>
  );
}

// Custom event rendering
function renderEventContent(eventInfo) {
  return (
    <div className="px-1 py-0.5 text-xs font-medium truncate">
      {eventInfo.timeText && <span className="mr-1">{eventInfo.timeText}</span>}
      <span>{eventInfo.event.title}</span>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ analytics, bookingLinks, onTabChange }) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalBookings || 0}
            </div>
            <div className="flex items-center text-sm text-emerald-700 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Show Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.showRate || 0}%
            </div>
            <div className="flex items-center text-sm text-emerald-700 mt-1">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Above average</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Close Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.closeRate || 0}%
            </div>
            <div className="flex items-center text-sm text-emerald-700 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg. Booking Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics?.avgBookingValue?.toLocaleString() || 0}
            </div>
            <div className="flex items-center text-sm text-emerald-700 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+8% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onTabChange("sales-analytics")}
        >
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 text-teal-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Sales Analytics
            </h3>
            <p className="text-sm text-gray-600">
              View conversion funnels and revenue
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onTabChange("scheduling-analytics")}
        >
          <CardContent className="p-6 text-center">
            <CalendarDays className="h-12 w-12 text-[#3F0D28] mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Scheduling Insights
            </h3>
            <p className="text-sm text-gray-600">
              Booking trends and attendance
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onTabChange("booking-links")}
        >
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Meetings</h3>
            <p className="text-sm text-gray-600">
              {bookingLinks.length} active links
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Team Performance
            </h3>
            <p className="text-sm text-gray-600">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Sales Analytics Tab Component
function SalesAnalyticsTab({
  salesAnalytics,
  getShowRate,
  getCloseRate,
  getDropOffRate,
  getOutcomePercentages,
  getMaxValue,
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              $
              {(
                salesAnalytics?.revenueMetrics.totalRevenue || 0
              ).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From {salesAnalytics?.conversionFunnel.closed || 0} closed deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg. Deal Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {(
                salesAnalytics?.revenueMetrics.avgDealSize || 0
              ).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Per closed opportunity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              $
              {(
                salesAnalytics?.revenueMetrics.pipelineValue || 0
              ).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {salesAnalytics?.outcomes.pending || 0} pending deals
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Conversion Funnel</CardTitle>
            <CardDescription>
              Track every stage of your sales process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Calls Booked</span>
                <span className="font-bold text-lg">
                  {salesAnalytics?.conversionFunnel.booked || 0}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-teal-500 to-teal-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: "100%" }}
                >
                  100%
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Showed Up</span>
                <span className="font-bold text-lg">
                  {salesAnalytics?.conversionFunnel.showed || 0}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${getShowRate()}%` }}
                >
                  {getShowRate()}% show rate
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Deals Closed</span>
                <span className="font-bold text-lg">
                  {salesAnalytics?.conversionFunnel.closed || 0}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${getCloseRate()}%` }}
                >
                  {getCloseRate()}% close rate
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Drop-off Rate</span>
                <span className="text-sm font-semibold text-[#3F0D28]">
                  {getDropOffRate()}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call Outcomes */}
        <Card>
          <CardHeader>
            <CardTitle>Call Outcomes</CardTitle>
            <CardDescription>Win/Loss/Pending breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-emerald-700" />
                  <div>
                    <p className="font-semibold text-green-900">Won Deals</p>
                    <p className="text-xs text-green-700">
                      Successfully closed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-700">
                    {salesAnalytics?.outcomes.won || 0}
                  </p>
                  <p className="text-xs text-green-700">
                    {getOutcomePercentages().won}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#3F0D28]/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-[#3F0D28]" />
                  <div>
                    <p className="font-semibold text-[#3F0D28]">Lost Deals</p>
                    <p className="text-xs text-[#3F0D28]">Did not convert</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#3F0D28]">
                    {salesAnalytics?.outcomes.lost || 0}
                  </p>
                  <p className="text-xs text-[#3F0D28]">
                    {getOutcomePercentages().lost}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-900">Pending</p>
                    <p className="text-xs text-orange-700">
                      Follow-up required
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">
                    {salesAnalytics?.outcomes.pending || 0}
                  </p>
                  <p className="text-xs text-orange-700">
                    {getOutcomePercentages().pending}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Scheduling Analytics Tab Component
function SchedulingAnalyticsTab({
  generalAnalytics,
  getAttendanceRate,
  getMaxValue,
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              No-show Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#3F0D28]">
              {generalAnalytics?.noShowRate || 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Below industry avg (12%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Cancellation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {generalAnalytics?.cancellationRate || 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Within normal range</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Reschedule Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#3F0D28]">
              {generalAnalytics?.rescheduleRate || 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Flexibility appreciated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {getAttendanceRate()}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Above industry avg</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Booking Hours</CardTitle>
            <CardDescription>Most requested time slots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generalAnalytics?.popularTimeSlots
                ?.slice(0, 5)
                .map((slot, idx) => {
                  const maxBookings = getMaxValue(
                    generalAnalytics.popularTimeSlots,
                    "bookings",
                  );
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {slot.time}
                          </span>
                          <span className="text-sm font-bold">
                            {slot.bookings}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${(slot.bookings / maxBookings) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Busiest Days */}
        <Card>
          <CardHeader>
            <CardTitle>Busiest Days</CardTitle>
            <CardDescription>Weekly booking distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generalAnalytics?.busiestDays?.map((day, idx) => {
                const maxBookings = getMaxValue(
                  generalAnalytics.busiestDays,
                  "bookings",
                );
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{day.day}</span>
                      <span className="text-sm font-bold">
                        {day.bookings} bookings
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                        style={{
                          width: `${(day.bookings / maxBookings) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Booking Links Tab Component
function BookingLinksTab({
  bookingLinks,
  onCopyLink,
  onEditLink,
  onDeleteLink,
  onEmbedLink,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Links</CardTitle>
        <CardDescription>
          Create and manage your meeting booking links
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookingLinks.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No meeting links yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first meeting link to start accepting meetings
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button data-new-meeting-btn>
                  <Plus className="h-4 w-4 mr-2" />
                  New Meeting
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => window.open("/calendar?create=true", "_self")}
                  className="flex items-center gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Regular Event
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => window.open("/calendar?create=true", "_self")}
                  className="flex items-center gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  Booking Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          bookingLinks.map((link) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 border rounded-lg hover:border-teal-600 transition-colors"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{link.name}</h3>
                    <Badge variant={link.is_active ? "default" : "secondary"}>
                      {link.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">
                      {link.type === "sales" ? "Sales" : "General"}
                    </Badge>
                  </div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {window.location.origin}/book/{link.slug}
                  </code>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {link.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <PhoneCall className="h-3 w-3" />
                      {link.total_bookings} bookings
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {link.conversion_rate}% conversion
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopyLink(link.slug)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEmbedLink(link)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditLink(link)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteLink(link)}
                >
                  <Trash2 className="h-3 w-3 text-[#3F0D28]" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
