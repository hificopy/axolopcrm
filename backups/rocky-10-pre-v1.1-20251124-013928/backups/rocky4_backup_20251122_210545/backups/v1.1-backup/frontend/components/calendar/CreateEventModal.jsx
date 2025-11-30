import { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Plus } from 'lucide-react';
import calendarService from '../../services/calendarService';
import { useToast } from '../ui/use-toast';

export default function CreateEventModal({ onClose, onCreate }) {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    location: '',
    start: '',
    end: '',
    timeZone: 'America/New_York',
    attendees: [],
    colorId: '',
  });

  const [attendeeEmail, setAttendeeEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.summary || !formData.start || !formData.end) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);

      const eventData = {
        summary: formData.summary,
        description: formData.description,
        location: formData.location,
        start: new Date(formData.start).toISOString(),
        end: new Date(formData.end).toISOString(),
        timeZone: formData.timeZone,
        attendees: formData.attendees.map(email => ({ email })),
        colorId: formData.colorId || undefined,
      };

      await calendarService.createGoogleEvent(eventData);

      toast({
        title: 'Event Created',
        description: 'The event has been successfully created',
      });

      onCreate();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event. Make sure Google Calendar is connected.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleAddAttendee = () => {
    if (!attendeeEmail || !attendeeEmail.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    if (formData.attendees.includes(attendeeEmail)) {
      toast({
        title: 'Duplicate',
        description: 'This attendee has already been added',
        variant: 'destructive',
      });
      return;
    }

    setFormData({
      ...formData,
      attendees: [...formData.attendees, attendeeEmail],
    });
    setAttendeeEmail('');
  };

  const handleRemoveAttendee = (email) => {
    setFormData({
      ...formData,
      attendees: formData.attendees.filter(e => e !== email),
    });
  };

  const colors = [
    { id: '1', name: 'Lavender', color: '#a4bdfc' },
    { id: '2', name: 'Sage', color: '#7ae7bf' },
    { id: '3', name: 'Grape', color: '#dbadff' },
    { id: '4', name: 'Flamingo', color: '#ff887c' },
    { id: '5', name: 'Banana', color: '#fbd75b' },
    { id: '6', name: 'Tangerine', color: '#ffb878' },
    { id: '7', name: 'Peacock', color: '#46d6db' },
    { id: '8', name: 'Graphite', color: '#e1e1e1' },
    { id: '9', name: 'Blueberry', color: '#5484ed' },
    { id: '10', name: 'Basil', color: '#51b749' },
    { id: '11', name: 'Tomato', color: '#dc2127' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-crm-accent to-crm-accent-hover px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Create New Event</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-crm-text mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-4 py-2 border border-crm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-crm-accent"
                placeholder="Enter event title"
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-crm-text mb-2">
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.start}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  className="w-full px-4 py-2 border border-crm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-crm-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-crm-text mb-2">
                  End Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.end}
                  onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                  className="w-full px-4 py-2 border border-crm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-crm-accent"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-crm-text mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-crm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-crm-accent resize-none"
                rows={3}
                placeholder="Add event description..."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-crm-text mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-crm-text-secondary" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-crm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-crm-accent"
                  placeholder="Add location"
                />
              </div>
            </div>

            {/* Attendees */}
            <div>
              <label className="block text-sm font-medium text-crm-text mb-2">
                Attendees
              </label>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-crm-text-secondary" />
                  <input
                    type="email"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAttendee();
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-crm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-crm-accent"
                    placeholder="Add attendee email"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddAttendee}
                  className="px-4 py-2 bg-crm-accent text-white rounded-lg hover:bg-crm-accent-hover transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {formData.attendees.length > 0 && (
                <div className="space-y-2">
                  {formData.attendees.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-crm-bg rounded-lg"
                    >
                      <span className="text-sm text-crm-text">{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(email)}
                        className="p-1 hover:bg-white rounded transition-colors"
                      >
                        <X className="h-4 w-4 text-crm-text-secondary" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-crm-text mb-3">
                Event Color
              </label>
              <div className="grid grid-cols-11 gap-2">
                {colors.map((colorOption) => (
                  <button
                    key={colorOption.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, colorId: colorOption.id })}
                    className={`h-10 w-10 rounded-lg transition-all ${
                      formData.colorId === colorOption.id
                        ? 'ring-2 ring-crm-accent ring-offset-2 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: colorOption.color }}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-crm-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-crm-text-secondary hover:bg-crm-bg rounded-lg transition-colors"
            >
              Cancel
            </button>
            <div className="flex-1" />
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 text-sm font-medium bg-crm-accent text-white rounded-lg hover:bg-crm-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
