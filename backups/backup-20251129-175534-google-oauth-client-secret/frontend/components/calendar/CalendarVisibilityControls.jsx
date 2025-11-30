import { useState } from 'react';
import { X, Eye, EyeOff, RotateCcw, Calendar } from 'lucide-react';
import calendarService from '../../services/calendarService';
import { useToast } from '../ui/use-toast';

export default function CalendarVisibilityControls({
  preset,
  googleCalendars,
  isGoogleConnected,
  onClose,
  onPresetUpdate,
  onConnectGoogle,
  onDisconnectGoogle,
}) {
  const { toast } = useToast();
  const [localPreset, setLocalPreset] = useState(preset);
  const [saving, setSaving] = useState(false);

  const categoryLabels = {
    sales: 'Sales',
    marketing: 'Marketing',
    service: 'Service',
  };

  const subcategoryLabels = {
    // Sales
    salesCalls: 'Sales Calls',
    meetings: 'Meetings',
    demos: 'Product Demos',
    followUps: 'Follow-ups',
    closingEvents: 'Closing Events',
    // Marketing
    emailCampaigns: 'Email Campaigns',
    webinars: 'Webinars',
    contentPublishing: 'Content Publishing',
    socialMediaPosts: 'Social Media Posts',
    adCampaigns: 'Ad Campaigns',
    // Service
    supportCalls: 'Support Calls',
    maintenanceWindows: 'Maintenance Windows',
    customerCheckIns: 'Customer Check-ins',
    trainingsSessions: 'Training Sessions',
    renewalReminders: 'Renewal Reminders',
  };

  const handleToggleCategory = async (category) => {
    try {
      const currentEnabled = localPreset.visible_categories[category].enabled;
      const newEnabled = !currentEnabled;

      setSaving(true);
      const updatedPreset = await calendarService.updateCategoryVisibility(category, null, newEnabled);

      setLocalPreset(updatedPreset);
      onPresetUpdate(updatedPreset);

      toast({
        title: 'Updated',
        description: `${categoryLabels[category]} events ${newEnabled ? 'shown' : 'hidden'}`,
      });
    } catch (error) {
      console.error('Error toggling category:', error);
      toast({
        title: 'Error',
        description: 'Failed to update visibility',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSubcategory = async (category, subcategory) => {
    try {
      const currentEnabled = localPreset.visible_categories[category].subcategories[subcategory];
      const newEnabled = !currentEnabled;

      setSaving(true);
      const updatedPreset = await calendarService.updateCategoryVisibility(category, subcategory, newEnabled);

      setLocalPreset(updatedPreset);
      onPresetUpdate(updatedPreset);

      toast({
        title: 'Updated',
        description: `${subcategoryLabels[subcategory]} ${newEnabled ? 'shown' : 'hidden'}`,
      });
    } catch (error) {
      console.error('Error toggling subcategory:', error);
      toast({
        title: 'Error',
        description: 'Failed to update visibility',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleGoogleCalendar = async (calendarId) => {
    try {
      const currentlyVisible = localPreset.visible_google_calendars?.includes(calendarId) || false;
      const newVisible = !currentlyVisible;

      setSaving(true);
      const updatedPreset = await calendarService.updateGoogleCalendarVisibility(calendarId, newVisible);

      setLocalPreset(updatedPreset);
      onPresetUpdate(updatedPreset);

      toast({
        title: 'Updated',
        description: `Calendar ${newVisible ? 'shown' : 'hidden'}`,
      });
    } catch (error) {
      console.error('Error toggling Google calendar:', error);
      toast({
        title: 'Error',
        description: 'Failed to update visibility',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPreset = async () => {
    try {
      setSaving(true);
      const updatedPreset = await calendarService.resetPreset();

      setLocalPreset(updatedPreset);
      onPresetUpdate(updatedPreset);

      toast({
        title: 'Reset Complete',
        description: 'Calendar visibility has been reset to defaults',
      });
    } catch (error) {
      console.error('Error resetting preset:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset preset',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      sales: 'bg-blue-500',
      marketing: 'bg-pink-500',
      service: 'bg-indigo-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="w-96 bg-white border-l border-crm-border flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-crm-border px-6 py-4 bg-gradient-to-r from-crm-bg-light to-white">
        <div>
          <h2 className="text-lg font-semibold text-crm-text">Calendar Visibility</h2>
          <p className="text-sm text-crm-text-secondary">Control what appears on your calendar</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-crm-bg rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-crm-text-secondary" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Google Calendars Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-crm-text uppercase tracking-wide">
              Google Calendars
            </h3>
          </div>

          {!isGoogleConnected ? (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-[#3F0D28]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Not Connected</h4>
                  <p className="text-xs text-gray-600 mb-3">
                    Connect your Google Calendar to sync events and manage them alongside your CRM activities.
                  </p>
                  <button
                    onClick={onConnectGoogle}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium w-full"
                  >
                    Connect Google Calendar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {googleCalendars.length === 0 ? (
                <p className="text-sm text-crm-text-secondary italic">No calendars found</p>
              ) : (
                googleCalendars.map((calendar) => {
                  const isVisible = localPreset.visible_google_calendars?.includes(calendar.id) || false;
                  return (
                    <button
                      key={calendar.id}
                      onClick={() => handleToggleGoogleCalendar(calendar.id)}
                      disabled={saving}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-crm-bg transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: calendar.backgroundColor || '#4285f4' }}
                        />
                        <div className="text-left">
                          <p className="text-sm font-medium text-crm-text">
                            {calendar.summary}
                            {calendar.primary && (
                              <span className="ml-2 text-xs text-crm-accent">(Primary)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      {isVisible ? (
                        <Eye className="h-4 w-4 text-crm-accent" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-crm-text-secondary group-hover:text-crm-text" />
                      )}
                    </button>
                  );
                })
              )}

              <button
                onClick={onDisconnectGoogle}
                className="w-full mt-4 text-sm text-red-600 hover:text-red-700 font-medium py-2"
              >
                Disconnect Google Calendar
              </button>
            </div>
          )}
        </div>

        {/* CRM Events Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-crm-text uppercase tracking-wide">
              CRM Events
            </h3>
            <button
              onClick={handleResetPreset}
              disabled={saving}
              className="flex items-center gap-1 text-xs text-crm-text-secondary hover:text-crm-accent transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          <div className="space-y-4">
            {Object.keys(categoryLabels).map((category) => {
              const categoryData = localPreset.visible_categories[category];
              const isEnabled = categoryData?.enabled || false;

              return (
                <div key={category} className="space-y-2">
                  {/* Category Header */}
                  <button
                    onClick={() => handleToggleCategory(category)}
                    disabled={saving}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-crm-bg transition-colors group border border-crm-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${getCategoryColor(category)}`} />
                      <span className="text-sm font-semibold text-crm-text">
                        {categoryLabels[category]}
                      </span>
                    </div>
                    {isEnabled ? (
                      <Eye className="h-4 w-4 text-crm-accent" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-crm-text-secondary group-hover:text-crm-text" />
                    )}
                  </button>

                  {/* Subcategories */}
                  {isEnabled && categoryData.subcategories && (
                    <div className="ml-6 space-y-1 border-l-2 border-crm-border pl-3">
                      {Object.keys(categoryData.subcategories).map((subcategory) => {
                        const isSubEnabled = categoryData.subcategories[subcategory];
                        return (
                          <button
                            key={subcategory}
                            onClick={() => handleToggleSubcategory(category, subcategory)}
                            disabled={saving}
                            className="w-full flex items-center justify-between p-2 rounded-md hover:bg-crm-bg/50 transition-colors group text-left"
                          >
                            <span className="text-sm text-crm-text-secondary group-hover:text-crm-text">
                              {subcategoryLabels[subcategory]}
                            </span>
                            {isSubEnabled ? (
                              <Eye className="h-3.5 w-3.5 text-crm-accent" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5 text-crm-text-secondary group-hover:text-crm-text" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer with info */}
      <div className="border-t border-crm-border px-6 py-4 bg-gradient-to-r from-crm-bg-light to-white">
        <p className="text-xs text-crm-text-secondary">
          Your visibility settings are automatically saved and will be remembered when you return to the calendar.
        </p>
      </div>
    </div>
  );
}
