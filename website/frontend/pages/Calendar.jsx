import { useState, useEffect, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import calendarService from '../services/calendarService';
import CalendarVisibilityControls from '../components/calendar/CalendarVisibilityControls';
import EventDetailModal from '../components/calendar/EventDetailModal';
import CreateEventModal from '../components/calendar/CreateEventModal';
import { useToast } from '../components/ui/use-toast';
import { useAgency } from '@/hooks/useAgency';
import ViewOnlyBadge from '@/components/ui/view-only-badge';
import {
  Calendar as CalendarIcon,
  Settings,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Palette,
  CalendarDays,
  Sparkles,
} from 'lucide-react';

export default function Calendar() {
  const { toast } = useToast();
  const calendarRef = useRef(null);
  const { isReadOnly, canEdit, canCreate } = useAgency();

  // State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [preset, setPreset] = useState(null);
  const [googleCalendars, setGoogleCalendars] = useState([]);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showVisibilityControls, setShowVisibilityControls] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Calendar Mode: 'calendar' or 'content'
  const [calendarMode, setCalendarMode] = useState('calendar');

  // Memoized loadEvents function to prevent infinite loops in callbacks
  const loadEvents = useCallback(async () => {
    try {
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) return;

      const view = calendarApi.view;
      const timeMin = view.activeStart.toISOString();
      const timeMax = view.activeEnd.toISOString();

      const allEvents = await calendarService.getAllEvents({ timeMin, timeMax });

      // Transform events for FullCalendar
      const transformedEvents = allEvents.map(event => ({
        id: event.id,
        title: event.title || event.summary,
        start: event.start,
        end: event.end,
        allDay: event.allDay || false,
        backgroundColor: event.color || getEventColor(event.category, event.subcategory),
        borderColor: event.color || getEventColor(event.category, event.subcategory),
        extendedProps: {
          ...event,
        },
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Memoized loadCalendarData function
  const loadCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      // Load preset and connection status
      const [presetData, connected] = await Promise.all([
        calendarService.getPreset(),
        calendarService.checkGoogleStatus(),
      ]);

      setPreset(presetData);
      setIsGoogleConnected(connected);

      // If Google is connected, load calendars
      if (connected) {
        try {
          const calendars = await calendarService.listGoogleCalendars();
          setGoogleCalendars(calendars);
        } catch (error) {
          console.error('Error loading Google calendars:', error);
          toast({
            title: 'Warning',
            description: 'Could not load Google calendars',
            variant: 'default',
          });
        }
      }

      // Load events
      await loadEvents();
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calendar data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loadEvents, toast]);

  // Load initial data
  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Check URL params for connection status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('connected') === 'true') {
      const services = urlParams.get('services') || 'calendar';
      const servicesList = services.split(',').map(s =>
        s.charAt(0).toUpperCase() + s.slice(1)
      ).join(', ');

      toast({
        title: '🎉 Google Services Connected!',
        description: `Successfully connected: ${servicesList}. Your events are syncing now!`,
      });

      // Reload calendar data to show synced events
      setTimeout(() => {
        loadCalendarData();
      }, 1500);

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('error') === 'auth_failed') {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect Google services. Please try again.',
        variant: 'destructive',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount to check URL params

  const getEventColor = (category, subcategory) => {
    const colors = {
      sales: {
        salesCalls: '#3b82f6',
        meetings: '#8b5cf6',
        demos: '#10b981',
        followUps: '#f59e0b',
        closingEvents: '#ef4444',
      },
      marketing: {
        emailCampaigns: '#ec4899',
        webinars: '#06b6d4',
        contentPublishing: '#8b5cf6',
        socialMediaPosts: '#14b8a6',
        adCampaigns: '#f97316',
      },
      service: {
        supportCalls: '#6366f1',
        maintenanceWindows: '#71717a',
        customerCheckIns: '#10b981',
        trainingsSessions: '#3b82f6',
        renewalReminders: '#f59e0b',
      },
      google: '#4285f4',
    };

    if (category === 'google') return colors.google;
    return colors[category]?.[subcategory] || '#6366f1';
  };

  const handleConnectGoogle = async () => {
    try {
      const authUrl = await calendarService.getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect Google Calendar',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await calendarService.disconnectGoogle();
      setIsGoogleConnected(false);
      setGoogleCalendars([]);
      toast({
        title: 'Disconnected',
        description: 'Google Calendar has been disconnected',
      });
      await loadEvents();
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect Google Calendar',
        variant: 'destructive',
      });
    }
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setShowEventModal(true);
  };

  const handleDateClick = (dateInfo) => {
    setShowCreateModal(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleViewChange = (view) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
      setCurrentView(view);
    }
  };

  const handleNavigate = (direction) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (direction === 'prev') calendarApi.prev();
      else if (direction === 'next') calendarApi.next();
      else calendarApi.today();

      setCurrentDate(calendarApi.getDate());
      loadEvents();
    }
  };

  const formatDateRange = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return '';

    const view = calendarApi.view;
    const start = view.currentStart;
    const end = view.currentEnd;

    const options = { month: 'long', year: 'numeric' };

    if (currentView === 'dayGridMonth') {
      return start.toLocaleDateString('en-US', options);
    } else if (currentView === 'timeGridWeek') {
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    } else if (currentView === 'timeGridDay') {
      return start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }

    return '';
  };

  if (loading) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center pt-[150px] bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#761B14] mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-pulse">
              <div className="rounded-full h-16 w-16 border-4 border-[#761B14]/20 mx-auto"></div>
            </div>
          </div>
          <p className="text-gray-700 font-medium text-lg">Loading your calendar...</p>
          <p className="text-gray-500 text-sm mt-2">Syncing events and meetings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Page Header */}
      <div className="relative bg-white border-b border-gray-200 px-4 sm:px-6 py-6 shadow-sm">
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#761B14] to-[#9A392D] flex items-center justify-center shadow-lg">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                      Calendar
                    </h1>
                    {isReadOnly() && <ViewOnlyBadge />}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {isReadOnly()
                      ? 'View meetings, calls & events - Read-only access'
                      : calendarMode === 'calendar'
                        ? 'Manage all your meetings, calls & events'
                        : 'Plan your content marketing strategy'
                    }
                  </p>
                </div>
              </div>

              {/* Calendar Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1.5 w-fit shadow-inner">
                <button
                  onClick={() => setCalendarMode('calendar')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    calendarMode === 'calendar'
                      ? 'bg-gradient-to-r from-[#761B14] to-[#9A392D] text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Calendar</span>
                </button>
                <button
                  onClick={null} // Content Calendar is locked
                  disabled={true}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 cursor-not-allowed opacity-50 ${
                    calendarMode === 'content'
                      ? 'bg-gradient-to-r from-[#761B14] to-[#9A392D] text-white shadow-lg scale-105'
                      : 'text-gray-600'
                  }`}
                >
                  <Palette className="h-4 w-4" />
                  <span>Content Calendar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons - Only show for Calendar mode */}
          {calendarMode === 'calendar' && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Navigation */}
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-200">
                <button
                  onClick={() => handleNavigate('today')}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-700 hover:text-[#761B14] hover:bg-gray-100 rounded-lg transition-all"
                >
                  Today
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleNavigate('prev')}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleNavigate('next')}
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
                  onClick={() => handleViewChange('dayGridMonth')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    currentView === 'dayGridMonth'
                      ? 'bg-white text-[#761B14] shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => handleViewChange('timeGridWeek')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    currentView === 'timeGridWeek'
                      ? 'bg-white text-[#761B14] shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => handleViewChange('timeGridDay')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    currentView === 'timeGridDay'
                      ? 'bg-white text-[#761B14] shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => handleViewChange('listWeek')}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    currentView === 'listWeek'
                      ? 'bg-white text-[#761B14] shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleRefresh}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all shadow-sm bg-white border border-gray-200"
                disabled={refreshing}
                title="Refresh calendar"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setShowVisibilityControls(!showVisibilityControls)}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all shadow-sm bg-white border border-gray-200"
                title="Calendar settings"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>

              {canCreate() && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#761B14] to-[#9A392D] text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all font-semibold shadow-md hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  <span>New Event</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Google Services Connection Banner */}
      {!isGoogleConnected && calendarMode === 'calendar' && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
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
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-semibold">
                    <CalendarIcon className="h-3 w-3" />
                    Calendar
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Gmail
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-semibold">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Contacts
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleConnectGoogle}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-2xl transition-all font-bold hover:scale-105 shadow-lg"
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
        {calendarMode === 'calendar' ? (
          /* Calendar View */
          <div className="flex-1 p-6">
            <div className="h-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <style>{`
                /* FullCalendar Custom Styling for Axolop */
                .fc {
                  --fc-border-color: #e5e7eb;
                  --fc-button-bg-color: #761B14;
                  --fc-button-border-color: #761B14;
                  --fc-button-hover-bg-color: #9A392D;
                  --fc-button-hover-border-color: #9A392D;
                  --fc-button-active-bg-color: #6b1a12;
                  --fc-button-active-border-color: #6b1a12;
                  --fc-today-bg-color: rgba(118, 27, 20, 0.05);
                  --fc-event-bg-color: #761B14;
                  --fc-event-border-color: #761B14;
                }

                .fc .fc-button-primary {
                  background: linear-gradient(to right, #761B14, #9A392D);
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
                  background: linear-gradient(to right, #761B14, #9A392D);
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
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
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
          /* Content Calendar View - LOCKED FOR v1.5 */
          <div className="flex-1 p-6">
            <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border-2 border-gray-700 overflow-auto relative">
              {/* Lock overlay pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)',
                }}></div>
              </div>

              <div className="relative p-8 text-center">
                <div className="max-w-3xl mx-auto">
                  {/* Lock Icon */}
                  <div className="relative mb-8">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                      <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">🔒</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <h2 className="text-4xl font-black text-white mb-3 flex items-center justify-center gap-3">
                      <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                        Content Calendar
                      </span>
                    </h2>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 mb-4">
                      <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-yellow-400 font-bold text-sm uppercase tracking-wider">Locked - v1.5 Release</span>
                    </div>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                      Advanced content planning and marketing automation coming in our next major release
                    </p>
                  </div>

                  {/* Feature Preview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                          <CalendarDays className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-white text-lg">Monday.com Integration</h4>
                          <span className="text-xs text-gray-400 uppercase font-semibold">Coming Soon</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 text-left">
                        Sync tasks and project timelines directly to your content calendar with two-way integration
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <CalendarDays className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-white text-lg">ClickUp Integration</h4>
                          <span className="text-xs text-gray-400 uppercase font-semibold">Coming Soon</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 text-left">
                        Manage all your content tasks, deadlines, and dependencies in one unified calendar view
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                          <Palette className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-white text-lg">Content Templates</h4>
                          <span className="text-xs text-gray-400 uppercase font-semibold">Coming Soon</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 text-left">
                        Pre-built templates for blog posts, social media, and email campaigns with AI assistance
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-white text-lg">Analytics Overlay</h4>
                          <span className="text-xs text-gray-400 uppercase font-semibold">Coming Soon</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 text-left">
                        Track content performance metrics directly on your calendar with real-time insights
                      </p>
                    </div>
                  </div>

                  {/* Release Info */}
                  <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-2 border-yellow-500/30 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Sparkles className="h-6 w-6 text-yellow-400" />
                      <h3 className="text-2xl font-bold text-white">v1.5 Release Feature</h3>
                    </div>
                    <p className="text-gray-300 mb-4 text-lg">
                      Content Calendar will be unlocked in our v1.5 release with full Monday.com and ClickUp integration
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-600">
                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-sm text-gray-300 font-semibold">Currently: Calendar Mode Available</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-600">
                        <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-300 font-semibold">Next: Content Calendar in v1.5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visibility Controls Sidebar */}
        {showVisibilityControls && (
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
