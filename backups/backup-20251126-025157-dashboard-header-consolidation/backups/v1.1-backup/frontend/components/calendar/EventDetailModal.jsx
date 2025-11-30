import { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Trash2, ExternalLink, Edit } from 'lucide-react';
import calendarService from '../../services/calendarService';
import { useToast } from '../ui/use-toast';

export default function EventDetailModal({ event, onClose, onDelete, onUpdate }) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const eventData = event.extendedProps || {};
  const isGoogleEvent = eventData.type === 'google';
  const isCRMEvent = eventData.type === 'crm';

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      setDeleting(true);

      if (isGoogleEvent) {
        await calendarService.deleteGoogleEvent(event.id, eventData.calendarId);
      } else {
        // Handle CRM event deletion (would need separate API endpoints)
        toast({
          title: 'Not Implemented',
          description: 'CRM event deletion will be added soon',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Event Deleted',
        description: 'The event has been successfully deleted',
      });

      onDelete();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getEventTypeLabel = () => {
    if (isGoogleEvent) return 'Google Calendar';
    if (isCRMEvent) {
      const category = eventData.category;
      const subcategory = eventData.subcategory;
      return `${category?.charAt(0).toUpperCase()}${category?.slice(1)} - ${subcategory}`;
    }
    return 'Event';
  };

  const getEventColor = () => {
    return event.backgroundColor || '#6366f1';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header with Color Bar */}
        <div
          className="h-2"
          style={{ backgroundColor: getEventColor() }}
        />

        <div className="p-6">
          {/* Title and Close */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${getEventColor()}20`,
                    color: getEventColor(),
                  }}
                >
                  {getEventTypeLabel()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-crm-text">{event.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-crm-bg rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-crm-text-secondary" />
            </button>
          </div>

          {/* Event Details */}
          <div className="space-y-4 mb-6">
            {/* Date and Time */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-crm-text-secondary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-crm-text">{formatDate(event.start)}</p>
                {!event.allDay && (
                  <p className="text-sm text-crm-text-secondary">
                    {formatTime(event.start)} - {formatTime(event.end)}
                  </p>
                )}
                {event.allDay && (
                  <p className="text-sm text-crm-text-secondary">All day</p>
                )}
              </div>
            </div>

            {/* Location */}
            {eventData.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-crm-text-secondary mt-0.5" />
                <p className="text-sm text-crm-text">{eventData.location}</p>
              </div>
            )}

            {/* Description */}
            {eventData.description && (
              <div className="flex items-start gap-3">
                <div className="h-5 w-5" /> {/* Spacer */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-crm-text mb-1">Description</p>
                  <p className="text-sm text-crm-text-secondary whitespace-pre-wrap">
                    {eventData.description}
                  </p>
                </div>
              </div>
            )}

            {/* Attendees */}
            {eventData.attendees && eventData.attendees.length > 0 && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-crm-text-secondary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-crm-text mb-2">Attendees</p>
                  <div className="space-y-1">
                    {eventData.attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-crm-accent" />
                        <p className="text-sm text-crm-text-secondary">
                          {attendee.email}
                          {attendee.responseStatus === 'accepted' && (
                            <span className="ml-2 text-xs text-green-600">(Accepted)</span>
                          )}
                          {attendee.responseStatus === 'declined' && (
                            <span className="ml-2 text-xs text-red-600">(Declined)</span>
                          )}
                          {attendee.responseStatus === 'tentative' && (
                            <span className="ml-2 text-xs text-yellow-600">(Maybe)</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Google Calendar Link */}
            {isGoogleEvent && eventData.htmlLink && (
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-crm-text-secondary mt-0.5" />
                <a
                  href={eventData.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-crm-accent hover:text-crm-accent-hover underline"
                >
                  View in Google Calendar
                </a>
              </div>
            )}

            {/* CRM Metadata */}
            {isCRMEvent && eventData.metadata && (
              <div className="mt-4 p-4 bg-crm-bg rounded-lg">
                <p className="text-xs font-semibold text-crm-text-secondary uppercase tracking-wide mb-2">
                  Additional Information
                </p>
                {eventData.metadata.status && (
                  <p className="text-sm text-crm-text mb-1">
                    <span className="font-medium">Status:</span> {eventData.metadata.status}
                  </p>
                )}
                {eventData.metadata.outcome && (
                  <p className="text-sm text-crm-text">
                    <span className="font-medium">Outcome:</span> {eventData.metadata.outcome}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-crm-border">
            {isGoogleEvent && (
              <>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete Event'}
                </button>
                <div className="flex-1" />
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-crm-text-secondary hover:bg-crm-bg rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
