import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, MapPin, X, RefreshCw, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import calendarService from '../services/calendarService';

export default function MeetingsPanel({ className = '' }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Load meetings from Google Calendar and CRM
  const loadMeetings = async (date = selectedDate) => {
    try {
      setLoading(true);

      // Get start and end of selected day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch all events from Calendar API
      const response = await calendarService.getAllEvents({
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
      });

      // Transform events to meetings format
      const transformedMeetings = response.map(event => {
        const startTime = new Date(event.start?.dateTime || event.start?.date);
        const endTime = new Date(event.end?.dateTime || event.end?.date);

        return {
          id: event.id,
          title: event.summary || event.title || 'Untitled Meeting',
          time: `${startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
          attendees: event.attendees?.length ? `${event.attendees.length} attendee${event.attendees.length > 1 ? 's' : ''}` : null,
          location: event.location || (event.conferenceData?.entryPoints?.[0]?.uri ? 'Video call' : null),
          type: event.eventType || (event.type === 'google' ? 'Google Meet' : 'CRM Meeting'),
          source: event.type || 'crm',
          link: event.htmlLink || event.conferenceData?.entryPoints?.[0]?.uri,
        };
      });

      setMeetings(transformedMeetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  // Check Google Calendar connection status
  const checkGoogleConnection = async () => {
    try {
      const connected = await calendarService.checkGoogleStatus();
      setIsGoogleConnected(connected);
    } catch (error) {
      console.error('Error checking Google connection:', error);
      setIsGoogleConnected(false);
    }
  };

  // Load meetings when component mounts or selected date changes
  useEffect(() => {
    checkGoogleConnection();
    loadMeetings(selectedDate);
  }, [selectedDate]);

  // Refresh meetings every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadMeetings(selectedDate);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [selectedDate]);

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    const today = new Date();

    // Empty cells for days before the month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all ${
            isToday
              ? 'bg-[#761B14] text-white font-bold'
              : isSelected
              ? 'bg-gray-200 text-gray-900 font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={`w-72 lg:w-80 bg-white border-l border-gray-200 flex flex-col hidden md:flex ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#761B14]" />
            Meetings
          </h2>
          <button
            onClick={() => loadMeetings(selectedDate)}
            disabled={loading}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh meetings"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        {isGoogleConnected && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Google Calendar synced</span>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="h-8 flex items-center justify-center text-xs font-semibold text-gray-500">
              {day}
            </div>
          ))}
          {/* Calendar days */}
          {renderCalendar()}
        </div>
      </div>

      {/* Meetings List */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {selectedDate.toDateString() === new Date().toDateString()
              ? "Today's Schedule"
              : "Schedule"}
            {meetings.length > 0 && (
              <span className="ml-2 text-xs text-gray-500 font-normal">
                ({meetings.length} meeting{meetings.length !== 1 ? 's' : ''})
              </span>
            )}
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mb-3" />
              <p className="text-sm text-gray-500">Loading meetings...</p>
            </div>
          ) : meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Calendar className="h-10 w-10 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                No meetings scheduled
              </p>
              <p className="text-xs text-gray-500">
                {selectedDate.toDateString() === new Date().toDateString()
                  ? 'Your scheduled meetings will appear here'
                  : 'No meetings on this day'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting, index) => (
                <Card
                  key={meeting.id || index}
                  className={`border hover:shadow-md transition-all ${
                    meeting.source === 'google'
                      ? 'border-blue-200 bg-blue-50/30'
                      : 'border-gray-200'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate flex-1">
                            {meeting.title}
                          </h4>
                          {meeting.link && (
                            <a
                              href={meeting.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-gray-200 rounded transition-colors shrink-0"
                              title="Open meeting link"
                            >
                              <ExternalLink className="h-3 w-3 text-gray-600" />
                            </a>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span className="truncate">{meeting.time}</span>
                          </div>
                          {meeting.attendees && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Users className="h-3 w-3 shrink-0" />
                              <span className="truncate">{meeting.attendees}</span>
                            </div>
                          )}
                          {meeting.location && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{meeting.location}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              meeting.source === 'google'
                                ? 'border-blue-300 text-blue-700 bg-blue-50'
                                : 'border-[#761B14]/30 text-[#761B14] bg-red-50'
                            }`}
                          >
                            {meeting.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
