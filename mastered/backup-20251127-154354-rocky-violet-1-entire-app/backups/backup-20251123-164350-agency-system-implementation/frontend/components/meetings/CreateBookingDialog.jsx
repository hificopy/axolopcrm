import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Link as LinkIcon,
  Users,
  Settings,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  Save,
  Phone,
  Video,
  MapPin,
  Mail,
  Bell,
  Sparkles,
  Palette,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Search,
  Upload,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../ui/use-toast';
import ColorPickerPopover from './ColorPickerPopover';
import BookingLinkPreview from './BookingLinkPreview';

/**
 * Comprehensive Create Booking Link Dialog
 * Full-featured booking link creation with advanced scheduling options
 * Integrated with form builder and workflow system
 */
export default function CreateBookingDialog({ open, onOpenChange, onSave }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [previewPanelWidth, setPreviewPanelWidth] = useState(800);
  const [isResizing, setIsResizing] = useState(false);
  const [manualScale, setManualScale] = useState(1); // Manual zoom level
  const [formData, setFormData] = useState({
    // Basic Details
    name: '',
    slug: '',
    description: '',
    internalNote: '',
    color: '#7b1c14',

    // Location
    locationType: 'phone',
    locationDetails: {},

    // Timing
    duration: 30,
    dateRangeType: 'calendar_days',
    dateRangeValue: 14,
    startTimeIncrement: 15,
    timeFormat: '12h',
    bufferBefore: 0,
    bufferAfter: 0,

    // Limitations
    minNoticeHours: 1,
    allowReschedule: true,
    preventDuplicateBookings: false,
    maxBookingsPerDay: null,

    // Team/Hosts
    hosts: [],
    assignmentType: 'round_robin',
    hostPriority: 'optimize_manually',

    // Questions
    primaryQuestions: [
      { id: '1', type: 'phone', label: 'Phone Number', required: true, order: 1 },
      { id: '2', type: 'text', label: 'Name', required: true, order: 2 },
    ],
    secondaryQuestions: [],
    hidePrimaryLabels: false,
    collapseRadioCheckbox: false,
    enablePrefillSkipping: false,
    useSequentialQuestions: true, // Typeform-style one question at a time (30% more conversions)

    // Workflows & Automation
    workflowEnabled: false,
    workflowConfig: {
      nodes: [],
      edges: [],
    },

    // Notifications
    sendConfirmationEmail: true,
    sendCancellationEmail: true,
    sendReminderEmails: false,
    reminderTimes: [],
    replyToType: 'host_email',
    customReplyTo: '',

    // Confirmation Page
    confirmationRedirectType: 'default',
    confirmationRedirectUrl: '',

    // Customization
    theme: 'light',
    brandColorPrimary: '#7b1c14',
    brandColorSecondary: '#4a0f0a',
    useGradient: true,
    schedulerBackground: '#FFFFFF',
    fontColor: '#1F2A37',
    borderColor: '#D1D5DB',
    inputFieldsColor: '#F9FAFB',
    buttonFontColor: '#FFFFFF',
    companyLogoUrl: '',

    // Status
    isActive: true,
  });

  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'Juan Romero', email: 'juan@hificopy.com', avatar: null },
  ]);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColorField, setActiveColorField] = useState(null);

  // Navigation steps
  const steps = [
    { id: 'details', name: 'Event Details', icon: Calendar },
    { id: 'hosts', name: 'Hosts', icon: Users },
    { id: 'timing', name: 'Event Time & Limits', icon: Clock },
    { id: 'questions', name: 'Invitee Questions', icon: HelpCircle },
    { id: 'workflows', name: 'Workflows & Automation', icon: Sparkles },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'confirmation', name: 'Confirmation Page', icon: CheckCircle },
    { id: 'customization', name: 'Customizations', icon: Palette },
  ];

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      updateFormData('slug', slug);
    }
  }, [formData.name]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.name) {
        toast({
          title: 'Missing Required Field',
          description: 'Please provide a booking link name',
          variant: 'destructive',
        });
        setCurrentStep(0);
        return;
      }

      if (formData.hosts.length === 0) {
        toast({
          title: 'Missing Required Field',
          description: 'Please add at least one host',
          variant: 'destructive',
        });
        setCurrentStep(1);
        return;
      }

      // Call save handler
      await onSave(formData);

      toast({
        title: 'Booking Link Created!',
        description: 'Your booking link is now ready to share',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error creating booking link:', error);
      toast({
        title: 'Error',
        description: 'Failed to create booking link. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const addHost = (user) => {
    if (!formData.hosts.find(h => h.userId === user.id)) {
      updateFormData('hosts', [
        ...formData.hosts,
        { userId: user.id, name: user.name, email: user.email, priority: 'medium', priorityOrder: formData.hosts.length },
      ]);
    }
  };

  const removeHost = (userId) => {
    updateFormData('hosts', formData.hosts.filter(h => h.userId !== userId));
  };

  const updateHostPriority = (userId, priority) => {
    updateFormData(
      'hosts',
      formData.hosts.map(h => (h.userId === userId ? { ...h, priority } : h))
    );
  };

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now().toString(),
      type: 'secondary',
      fieldType: 'text',
      label: '',
      placeholder: '',
      helpText: '',
      isRequired: false,
      options: [],
      order: (type === 'primary' ? formData.primaryQuestions : formData.secondaryQuestions).length,
    };

    if (type === 'primary') {
      updateFormData('primaryQuestions', [...formData.primaryQuestions, newQuestion]);
    } else {
      updateFormData('secondaryQuestions', [...formData.secondaryQuestions, newQuestion]);
    }
  };

  const removeQuestion = (type, questionId) => {
    if (type === 'primary') {
      updateFormData('primaryQuestions', formData.primaryQuestions.filter(q => q.id !== questionId));
    } else {
      updateFormData('secondaryQuestions', formData.secondaryQuestions.filter(q => q.id !== questionId));
    }
  };

  const updateQuestion = (type, questionId, field, value) => {
    if (type === 'primary') {
      updateFormData(
        'primaryQuestions',
        formData.primaryQuestions.map(q => (q.id === questionId ? { ...q, [field]: value } : q))
      );
    } else {
      updateFormData(
        'secondaryQuestions',
        formData.secondaryQuestions.map(q => (q.id === questionId ? { ...q, [field]: value } : q))
      );
    }
  };

  // Workflow management functions
  const updateWorkflowConfig = (nodes, edges) => {
    updateFormData('workflowConfig', { nodes, edges });
  };

  // Calculate optimal scale to fit content
  const fitToWidth = () => {
    // Base width of preview content is approximately 1200px at full size
    const baseContentWidth = 1200;
    // Account for padding (6 * 4px = 24px on each side)
    const availableWidth = previewPanelWidth - 48;
    const optimalScale = Math.min(1, availableWidth / baseContentWidth);
    setManualScale(Math.max(0.3, optimalScale));
  };

  // Auto-fit when panel width changes
  useEffect(() => {
    // Only auto-fit if scale is close to the previous optimal scale
    // This prevents fighting with manual zoom adjustments
    const baseContentWidth = 1200;
    const availableWidth = previewPanelWidth - 48;
    const optimalScale = Math.min(1, availableWidth / baseContentWidth);

    // If current scale is very different from optimal, don't auto-adjust
    // (user has manually zoomed)
    if (Math.abs(manualScale - optimalScale) < 0.1) {
      setManualScale(Math.max(0.3, optimalScale));
    }
  }, [previewPanelWidth]);

  // Resize handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Add/remove mouse event listeners
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      // Calculate new width based on mouse position
      const dialogElement = document.querySelector('.dialog-content');
      if (!dialogElement) return;

      const dialogRect = dialogElement.getBoundingClientRect();
      const newWidth = dialogRect.right - e.clientX;

      // Clamp width between min and max
      const clampedWidth = Math.max(400, Math.min(1400, newWidth));
      setPreviewPanelWidth(clampedWidth);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-content max-w-[95vw] h-[95vh] p-0 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create Booking Link</DialogTitle>
            <DialogDescription>
              Set up a new booking link for your team
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Navigation */}
          <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
            <nav className="space-y-1">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : isCompleted
                        ? 'text-green-700 hover:bg-green-50'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{step.name}</span>
                    {isCompleted && <CheckCircle className="h-3 w-3 ml-auto" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* Step 0: Event Details */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Event Details</h3>

                      <div className="space-y-4">
                        {/* Event Name */}
                        <div>
                          <Label>Event Name *</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Input
                              placeholder="e.g., Discovery Call, Product Demo"
                              value={formData.name}
                              onChange={(e) => updateFormData('name', e.target.value)}
                              className="flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => setShowColorPicker(!showColorPicker)}
                              className="w-10 h-10 rounded-lg border-2"
                              style={{ backgroundColor: formData.color }}
                            />
                          </div>
                        </div>

                        {/* Event Link */}
                        <div>
                          <Label>Event Link *</Label>
                          <div className="mt-2">
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <span>{window.location.origin}/book/</span>
                            </div>
                            <Input
                              placeholder="Add link prefix"
                              value={formData.slug}
                              onChange={(e) => updateFormData('slug', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Location */}
                        <div>
                          <Label>Location *</Label>
                          <Select
                            value={formData.locationType}
                            onValueChange={(value) => updateFormData('locationType', value)}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="phone">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  Phone Call
                                </div>
                              </SelectItem>
                              <SelectItem value="google_meet">
                                <div className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  Google Meet
                                </div>
                              </SelectItem>
                              <SelectItem value="zoom">
                                <div className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  Zoom
                                </div>
                              </SelectItem>
                              <SelectItem value="in_person">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  In Person
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Description */}
                        <div>
                          <Label>Description/ Instructions</Label>
                          <Textarea
                            placeholder="Write instructions or any details that your invitee must know about"
                            className="mt-2"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => updateFormData('description', e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.description.length}/1500 characters
                          </p>
                        </div>

                        {/* Internal Note */}
                        <div>
                          <Label>Internal description/note about the event</Label>
                          <p className="text-xs text-gray-500 mb-2">
                            This will only be visible to you and your team
                          </p>
                          <Textarea
                            placeholder="e.g. marketing sales funnel event"
                            className="mt-2"
                            rows={2}
                            value={formData.internalNote}
                            onChange={(e) => updateFormData('internalNote', e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formData.internalNote.length}/100 characters
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Hosts */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Hosts</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Select hosts of the event and optimize their priority
                      </p>

                      {/* Team Member Search */}
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search member by name or email"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Selected Hosts */}
                      {formData.hosts.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg font-medium text-sm">
                            <span>Host(s)</span>
                            <span>Priority</span>
                          </div>

                          {formData.hosts.map((host) => (
                            <div key={host.userId} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-700">
                                    {host.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold">{host.name}</p>
                                  <p className="text-xs text-gray-600">{host.email}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <Select
                                  value={host.priority}
                                  onValueChange={(value) => updateHostPriority(host.userId, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">
                                      <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-red-500 rounded"></span>
                                        Low
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="medium">
                                      <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-orange-500 rounded"></span>
                                        Medium
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="high">
                                      <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 bg-green-500 rounded"></span>
                                        High
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeHost(host.userId)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-6 border rounded-lg border-dashed">
                          <p className="text-gray-500">No hosts added yet</p>
                        </div>
                      )}

                      {/* Add Hosts Button */}
                      <Button
                        variant="outline"
                        onClick={() => addHost(teamMembers[0])}
                        className="w-full"
                        disabled={formData.hosts.length >= teamMembers.length}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Invite Users
                      </Button>

                      {/* Priority Optimization */}
                      <div className="mt-4">
                        <Label>Priority Optimization</Label>
                        <Select
                          value={formData.hostPriority}
                          onValueChange={(value) => updateFormData('hostPriority', value)}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="optimize_manually">Optimize manually</SelectItem>
                            <SelectItem value="optimize_automatically">Optimize automatically</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Event Time & Limits */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Event Time & Limits</h3>

                    {/* Date Range */}
                    <div>
                      <Label>Date Range</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        Select the date range within which invitees will be shown time slots on your scheduler
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={formData.dateRangeValue}
                          onChange={(e) => updateFormData('dateRangeValue', parseInt(e.target.value))}
                          className="w-20"
                        />
                        <Select
                          value={formData.dateRangeType}
                          onValueChange={(value) => updateFormData('dateRangeType', value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="calendar_days">Calendar days</SelectItem>
                            <SelectItem value="business_days">Business days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {formData.dateRangeType === 'calendar_days'
                          ? 'Include weekends in date range. Counts from Mon - Sun.'
                          : 'Exclude weekend from date range. Only counts Mon - Fri.'}
                      </p>
                    </div>

                    {/* Duration */}
                    <div>
                      <Label>Duration</Label>
                      <p className="text-sm text-gray-600 mb-2">Select the duration of your event</p>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={formData.duration}
                          onChange={(e) => updateFormData('duration', parseInt(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-600">minutes</span>
                      </div>
                    </div>

                    {/* Start Time Increments */}
                    <div>
                      <Label>Start time increments</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        The intervals with which available time slots will be shown on your scheduler
                      </p>
                      <Select
                        value={formData.startTimeIncrement.toString()}
                        onValueChange={(value) => updateFormData('startTimeIncrement', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Time Format */}
                    <div>
                      <Label>Time format</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        Show available times in 12 or 24 hour format on scheduler
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={formData.timeFormat === '12h' ? 'default' : 'outline'}
                          onClick={() => updateFormData('timeFormat', '12h')}
                        >
                          12h
                        </Button>
                        <Button
                          type="button"
                          variant={formData.timeFormat === '24h' ? 'default' : 'outline'}
                          onClick={() => updateFormData('timeFormat', '24h')}
                        >
                          24h
                        </Button>
                      </div>
                    </div>

                    {/* Buffer Time */}
                    <div>
                      <Label>Do you want to add break time before or after your events?</Label>
                      <p className="text-sm text-gray-600 mb-2">
                        Select the time buffer that you might want to give yourself before or after an event
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Before the Event</Label>
                          <Select
                            value={formData.bufferBefore.toString()}
                            onValueChange={(value) => updateFormData('bufferBefore', parseInt(value))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0 minutes</SelectItem>
                              <SelectItem value="5">5 minutes</SelectItem>
                              <SelectItem value="10">10 minutes</SelectItem>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">After the Event</Label>
                          <Select
                            value={formData.bufferAfter.toString()}
                            onValueChange={(value) => updateFormData('bufferAfter', parseInt(value))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0 minutes</SelectItem>
                              <SelectItem value="5">5 minutes</SelectItem>
                              <SelectItem value="10">10 minutes</SelectItem>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Limitations */}
                    <div>
                      <Label>Set the limitations</Label>
                      <p className="text-sm text-gray-600 mb-3">
                        Set limitations on booking and rescheduling of this event
                      </p>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Guest cannot schedule within</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              value={formData.minNoticeHours}
                              onChange={(e) => updateFormData('minNoticeHours', parseInt(e.target.value))}
                              className="w-20"
                            />
                            <span className="text-sm text-gray-600">hour(s)</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Reschedule Event</Label>
                            <p className="text-xs text-gray-500">Allow closers to reschedule this event</p>
                          </div>
                          <Switch
                            checked={formData.allowReschedule}
                            onCheckedChange={(checked) => updateFormData('allowReschedule', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Prevent duplicate bookings</Label>
                            <p className="text-xs text-gray-500">
                              When enabled, leads with an upcoming scheduled call for this event cannot book again
                            </p>
                          </div>
                          <Switch
                            checked={formData.preventDuplicateBookings}
                            onCheckedChange={(checked) => updateFormData('preventDuplicateBookings', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Invitee Questions */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Invitee Questions</h3>
                    <p className="text-sm text-gray-600">
                      To capture lead as Potential, we will ask invitees 2 Primary questions, once they have answered
                      Primary questions, all Secondary questions will appear on the form.
                    </p>

                    {/* Primary Questions */}
                    <div>
                      <Label className="text-base font-semibold">Primary Questions</Label>
                      <div className="mt-3 space-y-3">
                        {formData.primaryQuestions.map((question, index) => (
                          <div key={question.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <span className="text-sm font-medium text-gray-600">{index + 1}.</span>
                            <div className="flex-1">
                              <Input
                                placeholder="Question label"
                                value={question.label}
                                onChange={(e) => updateQuestion('primary', question.id, 'label', e.target.value)}
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Move to secondary
                                const updatedPrimary = formData.primaryQuestions.filter(q => q.id !== question.id);
                                const updatedSecondary = [...formData.secondaryQuestions, question];
                                updateFormData('primaryQuestions', updatedPrimary);
                                updateFormData('secondaryQuestions', updatedSecondary);
                              }}
                              title="Move to Secondary Questions"
                              className="h-8 w-8 p-0"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion('primary', question.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Secondary Questions */}
                    <div>
                      <Label className="text-base font-semibold">Secondary Questions</Label>
                      <div className="mt-3 space-y-3">
                        {formData.secondaryQuestions.length === 0 ? (
                          <div className="text-center p-6 border rounded-lg border-dashed">
                            <p className="text-gray-500 text-sm">No secondary questions yet</p>
                          </div>
                        ) : (
                          formData.secondaryQuestions.map((question, index) => (
                            <div key={question.id} className="flex items-start gap-3 p-3 border rounded-lg">
                              <span className="text-sm font-medium text-gray-600">
                                {formData.primaryQuestions.length + index + 1}.
                              </span>
                              <div className="flex-1 space-y-2">
                                <Select
                                  value={question.fieldType}
                                  onValueChange={(value) => updateQuestion('secondary', question.id, 'fieldType', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select field type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="select">Dropdown</SelectItem>
                                    <SelectItem value="radio">Radio</SelectItem>
                                    <SelectItem value="checkbox">Checkbox</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  placeholder="Question label"
                                  value={question.label}
                                  onChange={(e) => updateQuestion('secondary', question.id, 'label', e.target.value)}
                                />
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Move to primary
                                  const updatedSecondary = formData.secondaryQuestions.filter(q => q.id !== question.id);
                                  const updatedPrimary = [...formData.primaryQuestions, question];
                                  updateFormData('secondaryQuestions', updatedSecondary);
                                  updateFormData('primaryQuestions', updatedPrimary);
                                }}
                                title="Move to Primary Questions"
                                className="h-8 w-8 p-0"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion('secondary', question.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => addQuestion('secondary')}
                        className="mt-3 w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Question
                      </Button>
                    </div>

                    {/* Customization Options */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Hide labels form Primary Questions</Label>
                          <p className="text-xs text-gray-500">
                            Primary question will only display the input fields with help text inside
                          </p>
                        </div>
                        <Switch
                          checked={formData.hidePrimaryLabels}
                          onCheckedChange={(checked) => updateFormData('hidePrimaryLabels', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Collapse answers for radio button and checkbox questions</Label>
                          <p className="text-xs text-gray-500">Answers will be displayed in a dropdown</p>
                        </div>
                        <Switch
                          checked={formData.collapseRadioCheckbox}
                          onCheckedChange={(checked) => updateFormData('collapseRadioCheckbox', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Pre-qualified form skipping</Label>
                          <p className="text-xs text-gray-500">
                            Enabling this option checks for pre-fill URL parameters, bypasses the questionnaire, and
                            redirects invitees to the time selection page. Any additional questions are skipped
                          </p>
                        </div>
                        <Switch
                          checked={formData.enablePrefillSkipping}
                          onCheckedChange={(checked) => updateFormData('enablePrefillSkipping', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Label className="text-sm font-semibold text-blue-900">Sequential Questions (Recommended)</Label>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                              +30% Conversions
                            </Badge>
                          </div>
                          <p className="text-xs text-blue-700 mb-2">
                            Enable Typeform-style one-question-at-a-time flow for better engagement and higher completion rates.
                            Questions appear progressively with smooth animations, reducing cognitive load and form abandonment.
                          </p>
                          <p className="text-xs text-blue-600 font-medium">
                            When disabled: All questions appear at once (standard form layout)
                          </p>
                        </div>
                        <Switch
                          checked={formData.useSequentialQuestions}
                          onCheckedChange={(checked) => updateFormData('useSequentialQuestions', checked)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Workflows & Automation */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Workflows & Automation</h3>
                    <p className="text-sm text-gray-600">
                      Use workflows to automatically qualify/disqualify leads, route them to the right team member, and trigger actions based on their booking responses.
                    </p>

                    {/* Workflow Enable Toggle */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="text-sm font-semibold">Enable Workflow Automation</Label>
                        <p className="text-xs text-gray-500 mt-1">
                          Automatically process bookings using your custom workflow logic
                        </p>
                      </div>
                      <Switch
                        checked={formData.workflowEnabled}
                        onCheckedChange={(checked) => updateFormData('workflowEnabled', checked)}
                      />
                    </div>

                    {formData.workflowEnabled && (
                      <div className="space-y-4">
                        {/* Workflow Info */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900 mb-1">Workflow Integration</p>
                              <p className="text-xs text-blue-700 mb-3">
                                Your booking workflow can:
                              </p>
                              <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                                <li>Qualify or disqualify leads based on their answers</li>
                                <li>Route leads to specific team members</li>
                                <li>Send custom notifications and emails</li>
                                <li>Update lead status and tags</li>
                                <li>Trigger external webhooks and integrations</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Workflow Builder Link */}
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm font-medium mb-2">Workflow Configuration</p>
                          <p className="text-xs text-gray-600 mb-3">
                            Configure your booking workflow in the Workflow Builder. Create triggers for form submissions and add actions for routing, notifications, and more.
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => window.open('/workflow-builder', '_blank')}
                            className="w-full"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Open Workflow Builder
                          </Button>
                        </div>

                        {/* Quick Tips */}
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>💡 <strong>Tip:</strong> Create a "Form Submitted" trigger in the workflow builder</p>
                          <p>💡 <strong>Tip:</strong> Use conditions to check form responses and route accordingly</p>
                          <p>💡 <strong>Tip:</strong> Add "Update Lead" actions to disqualify leads or assign them</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Notifications */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Notifications</h3>

                    {/* Reply-to Address */}
                    <div>
                      <Label>Reply-to address:</Label>
                      <p className="text-sm text-gray-500 mb-2">
                        Following email will be used for email communications. All email communication will use the same
                        option
                      </p>
                      <Select
                        value={formData.replyToType}
                        onValueChange={(value) => updateFormData('replyToType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="host_email">Host's email address</SelectItem>
                          <SelectItem value="no_reply">System no-reply address</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Confirmation Email */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <Label className="text-sm">Confirmation Email</Label>
                          <p className="text-xs text-gray-500">Your invitee will receive an email confirmation</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Switch
                          checked={formData.sendConfirmationEmail}
                          onCheckedChange={(checked) => updateFormData('sendConfirmationEmail', checked)}
                        />
                      </div>
                    </div>

                    {/* Cancellation Email */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <X className="h-6 w-6 text-red-600" />
                        <div>
                          <Label className="text-sm">Cancellation Email</Label>
                          <p className="text-xs text-gray-500">
                            Email notification will be sent to the invitee if you cancel the event
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Switch
                          checked={formData.sendCancellationEmail}
                          onCheckedChange={(checked) => updateFormData('sendCancellationEmail', checked)}
                        />
                      </div>
                    </div>

                    {/* Email Reminders */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="h-6 w-6 text-blue-600" />
                        <div>
                          <Label className="text-sm">Email Reminders</Label>
                          <p className="text-xs text-gray-500">
                            Invitee will receive reminder emails before the scheduled events at specified times
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Switch
                          checked={formData.sendReminderEmails}
                          onCheckedChange={(checked) => updateFormData('sendReminderEmails', checked)}
                        />
                      </div>
                    </div>

                    {/* SMS Reminders */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Phone className="h-6 w-6 text-purple-600" />
                        <div>
                          <Label className="text-sm">SMS Reminders</Label>
                          <p className="text-xs text-gray-500">
                            Invitee will receive SMS reminders before the scheduled events at specified times
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Switch disabled />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Confirmation Page */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Confirmation Page</h3>
                    <p className="text-sm text-gray-600">
                      Select where to redirect invitee after call is booked
                    </p>

                    <Select
                      value={formData.confirmationRedirectType}
                      onValueChange={(value) => updateFormData('confirmationRedirectType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Redirect to confirmation page</SelectItem>
                        <SelectItem value="custom_url">Redirect to an external URL</SelectItem>
                      </SelectContent>
                    </Select>

                    {formData.confirmationRedirectType === 'custom_url' && (
                      <div>
                        <Label>External URL</Label>
                        <Input
                          type="url"
                          placeholder="https://example.com/thank-you"
                          value={formData.confirmationRedirectUrl}
                          onChange={(e) => updateFormData('confirmationRedirectUrl', e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Step 7: Customizations */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Customizations</h3>

                    <Tabs defaultValue="web">
                      <TabsList>
                        <TabsTrigger value="web">Web</TabsTrigger>
                        <TabsTrigger value="mobile">Mobile</TabsTrigger>
                      </TabsList>

                      <TabsContent value="web" className="space-y-6 mt-4">
                        {/* Scheduler Step */}
                        <div>
                          <Label>Scheduler step</Label>
                          <Select defaultValue="booking_page">
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="booking_page">Booking page - Step 1</SelectItem>
                              <SelectItem value="booking_page_2">Booking page - Step 2</SelectItem>
                              <SelectItem value="time_selection">Time selection page</SelectItem>
                              <SelectItem value="thank_you">Thank you page</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Theme */}
                        <div>
                          <Label>Scheduler theme</Label>
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <button
                              type="button"
                              onClick={() => updateFormData('theme', 'light')}
                              className={`p-3 border-2 rounded-lg text-left ${
                                formData.theme === 'light' ? 'border-blue-600' : 'border-gray-200'
                              }`}
                            >
                              <div className="text-sm font-medium">Light</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateFormData('theme', 'dark')}
                              className={`p-3 border-2 rounded-lg text-left ${
                                formData.theme === 'dark' ? 'border-blue-600' : 'border-gray-200'
                              }`}
                            >
                              <div className="text-sm font-medium">Dark</div>
                            </button>
                          </div>
                        </div>

                        {/* Brand Color */}
                        <div>
                          <Label>Brand color</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              type="button"
                              variant={formData.useGradient ? 'outline' : 'default'}
                              onClick={() => updateFormData('useGradient', false)}
                            >
                              Solid
                            </Button>
                            <Button
                              type="button"
                              variant={formData.useGradient ? 'default' : 'outline'}
                              onClick={() => updateFormData('useGradient', true)}
                            >
                              Gradient
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="relative">
                              <div
                                className="w-full h-12 rounded border cursor-pointer hover:border-blue-400 transition-colors"
                                style={{ backgroundColor: formData.brandColorPrimary }}
                                onClick={() => {
                                  setActiveColorField('brandColorPrimary');
                                  setShowColorPicker(true);
                                }}
                              />
                              <Input
                                value={formData.brandColorPrimary}
                                onChange={(e) => updateFormData('brandColorPrimary', e.target.value)}
                                className="mt-2 font-mono"
                                onClick={() => {
                                  setActiveColorField('brandColorPrimary');
                                  setShowColorPicker(true);
                                }}
                              />
                              {showColorPicker && activeColorField === 'brandColorPrimary' && (
                                <ColorPickerPopover
                                  color={formData.brandColorPrimary}
                                  onChange={(color) => updateFormData('brandColorPrimary', color)}
                                  onClose={() => {
                                    setShowColorPicker(false);
                                    setActiveColorField(null);
                                  }}
                                />
                              )}
                            </div>
                            {formData.useGradient && (
                              <div className="relative">
                                <div
                                  className="w-full h-12 rounded border cursor-pointer hover:border-blue-400 transition-colors"
                                  style={{ backgroundColor: formData.brandColorSecondary }}
                                  onClick={() => {
                                    setActiveColorField('brandColorSecondary');
                                    setShowColorPicker(true);
                                  }}
                                />
                                <Input
                                  value={formData.brandColorSecondary}
                                  onChange={(e) => updateFormData('brandColorSecondary', e.target.value)}
                                  className="mt-2 font-mono"
                                  onClick={() => {
                                    setActiveColorField('brandColorSecondary');
                                    setShowColorPicker(true);
                                  }}
                                />
                                {showColorPicker && activeColorField === 'brandColorSecondary' && (
                                  <ColorPickerPopover
                                    color={formData.brandColorSecondary}
                                    onChange={(color) => updateFormData('brandColorSecondary', color)}
                                    onClose={() => {
                                      setShowColorPicker(false);
                                      setActiveColorField(null);
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Advanced Color Customizations */}
                        <div>
                          <Label className="mb-3 block">Advanced color customizations</Label>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Scheduler background</Label>
                              <div className="flex items-center gap-2 relative">
                                <div
                                  className="w-8 h-8 rounded border cursor-pointer hover:border-blue-400 transition-colors"
                                  style={{ backgroundColor: formData.schedulerBackground }}
                                  onClick={() => {
                                    setActiveColorField('schedulerBackground');
                                    setShowColorPicker(true);
                                  }}
                                />
                                <Input
                                  value={formData.schedulerBackground}
                                  onChange={(e) => updateFormData('schedulerBackground', e.target.value)}
                                  className="w-28 font-mono text-xs"
                                  onClick={() => {
                                    setActiveColorField('schedulerBackground');
                                    setShowColorPicker(true);
                                  }}
                                />
                                {showColorPicker && activeColorField === 'schedulerBackground' && (
                                  <ColorPickerPopover
                                    color={formData.schedulerBackground}
                                    onChange={(color) => updateFormData('schedulerBackground', color)}
                                    onClose={() => {
                                      setShowColorPicker(false);
                                      setActiveColorField(null);
                                    }}
                                    position="top"
                                  />
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Font color</Label>
                              <div className="flex items-center gap-2 relative">
                                <div
                                  className="w-8 h-8 rounded border cursor-pointer hover:border-blue-400 transition-colors"
                                  style={{ backgroundColor: formData.fontColor }}
                                  onClick={() => {
                                    setActiveColorField('fontColor');
                                    setShowColorPicker(true);
                                  }}
                                />
                                <Input
                                  value={formData.fontColor}
                                  onChange={(e) => updateFormData('fontColor', e.target.value)}
                                  className="w-28 font-mono text-xs"
                                  onClick={() => {
                                    setActiveColorField('fontColor');
                                    setShowColorPicker(true);
                                  }}
                                />
                                {showColorPicker && activeColorField === 'fontColor' && (
                                  <ColorPickerPopover
                                    color={formData.fontColor}
                                    onChange={(color) => updateFormData('fontColor', color)}
                                    onClose={() => {
                                      setShowColorPicker(false);
                                      setActiveColorField(null);
                                    }}
                                    position="top"
                                  />
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Border color</Label>
                              <div className="flex items-center gap-2 relative">
                                <div
                                  className="w-8 h-8 rounded border cursor-pointer hover:border-blue-400 transition-colors"
                                  style={{ backgroundColor: formData.borderColor }}
                                  onClick={() => {
                                    setActiveColorField('borderColor');
                                    setShowColorPicker(true);
                                  }}
                                />
                                <Input
                                  value={formData.borderColor}
                                  onChange={(e) => updateFormData('borderColor', e.target.value)}
                                  className="w-28 font-mono text-xs"
                                  onClick={() => {
                                    setActiveColorField('borderColor');
                                    setShowColorPicker(true);
                                  }}
                                />
                                {showColorPicker && activeColorField === 'borderColor' && (
                                  <ColorPickerPopover
                                    color={formData.borderColor}
                                    onChange={(color) => updateFormData('borderColor', color)}
                                    onClose={() => {
                                      setShowColorPicker(false);
                                      setActiveColorField(null);
                                    }}
                                    position="top"
                                  />
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Input fields color</Label>
                              <div className="flex items-center gap-2 relative">
                                <div
                                  className="w-8 h-8 rounded border cursor-pointer hover:border-blue-400 transition-colors"
                                  style={{ backgroundColor: formData.inputFieldsColor }}
                                  onClick={() => {
                                    setActiveColorField('inputFieldsColor');
                                    setShowColorPicker(true);
                                  }}
                                />
                                <Input
                                  value={formData.inputFieldsColor}
                                  onChange={(e) => updateFormData('inputFieldsColor', e.target.value)}
                                  className="w-28 font-mono text-xs"
                                  onClick={() => {
                                    setActiveColorField('inputFieldsColor');
                                    setShowColorPicker(true);
                                  }}
                                />
                                {showColorPicker && activeColorField === 'inputFieldsColor' && (
                                  <ColorPickerPopover
                                    color={formData.inputFieldsColor}
                                    onChange={(color) => updateFormData('inputFieldsColor', color)}
                                    onClose={() => {
                                      setShowColorPicker(false);
                                      setActiveColorField(null);
                                    }}
                                    position="top"
                                  />
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Button font color</Label>
                              <div className="flex items-center gap-2 relative">
                                <div
                                  className="w-8 h-8 rounded border cursor-pointer hover:border-blue-400 transition-colors"
                                  style={{ backgroundColor: formData.buttonFontColor }}
                                  onClick={() => {
                                    setActiveColorField('buttonFontColor');
                                    setShowColorPicker(true);
                                  }}
                                />
                                <Input
                                  value={formData.buttonFontColor}
                                  onChange={(e) => updateFormData('buttonFontColor', e.target.value)}
                                  className="w-28 font-mono text-xs"
                                  onClick={() => {
                                    setActiveColorField('buttonFontColor');
                                    setShowColorPicker(true);
                                  }}
                                />
                                {showColorPicker && activeColorField === 'buttonFontColor' && (
                                  <ColorPickerPopover
                                    color={formData.buttonFontColor}
                                    onChange={(color) => updateFormData('buttonFontColor', color)}
                                    onClose={() => {
                                      setShowColorPicker(false);
                                      setActiveColorField(null);
                                    }}
                                    position="top"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Company Logo */}
                        <div>
                          <Label>Company logo</Label>
                          <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-blue-600 font-medium">Click to upload</p>
                            <p className="text-xs text-gray-500 mt-1">PNG or JPG (max size 5MB)</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Live Preview (Resizable) */}
          <div
            className="relative border-l bg-gray-50 flex flex-col overflow-hidden"
            style={{ width: `${previewPanelWidth}px`, minWidth: '400px', maxWidth: '1400px' }}
          >
            {/* Resize Handle - Very Visible */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-6 cursor-ew-resize z-50 group flex items-center justify-center transition-all ${
                isResizing ? 'bg-blue-500/30 border-r-2 border-blue-600' : 'hover:bg-blue-500/10 hover:border-r-2 hover:border-blue-400'
              }`}
              onMouseDown={handleMouseDown}
              style={{ cursor: 'ew-resize' }}
              title="Drag to resize preview panel"
            >
              {/* Drag Indicator - 3 Dots Vertical */}
              <div className="flex flex-col gap-1.5 items-center">
                <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isResizing ? 'bg-blue-700' : 'bg-gray-500 group-hover:bg-blue-600'
                }`}></div>
                <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isResizing ? 'bg-blue-700' : 'bg-gray-500 group-hover:bg-blue-600'
                }`}></div>
                <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isResizing ? 'bg-blue-700' : 'bg-gray-500 group-hover:bg-blue-600'
                }`}></div>
                <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isResizing ? 'bg-blue-700' : 'bg-gray-500 group-hover:bg-blue-600'
                }`}></div>
                <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isResizing ? 'bg-blue-700' : 'bg-gray-500 group-hover:bg-blue-600'
                }`}></div>
              </div>

              {/* Tooltip on hover */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Drag to resize
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-gray-700">Live Preview</div>
                  <div className="text-xs text-gray-500">- Fully Interactive</div>
                </div>
                <div className="flex items-center gap-1 border-l pl-3">
                  <button
                    className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
                    onClick={() => setManualScale(prev => Math.max(0.3, prev - 0.1))}
                    title="Zoom out"
                  >
                    -
                  </button>
                  <span className="text-xs text-gray-600 min-w-[40px] text-center">{Math.round(manualScale * 100)}%</span>
                  <button
                    className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
                    onClick={() => setManualScale(prev => Math.min(1.5, prev + 0.1))}
                    title="Zoom in"
                  >
                    +
                  </button>
                  <div className="border-l ml-1 pl-1 flex gap-1">
                    <button
                      className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
                      onClick={fitToWidth}
                      title="Fit preview to panel width"
                    >
                      Fit
                    </button>
                    <button
                      className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
                      onClick={() => setManualScale(1)}
                      title="Reset zoom to 100%"
                    >
                      100%
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                ✓ Sequential Questions Enabled
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="w-full h-full flex items-start justify-center">
                <div
                  className="origin-top transition-transform duration-150"
                  style={{
                    transform: `scale(${manualScale})`,
                    maxWidth: '100%',
                  }}
                >
                  <div style={{ width: 'fit-content', maxWidth: '1200px' }}>
                    <BookingLinkPreview formData={formData} />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-2 border-t bg-gray-100 text-center">
              <p className="text-xs text-gray-500">← Drag left edge to resize | Click "Fit" to auto-scale | Panel: {previewPanelWidth}px</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between bg-white">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save & Continue
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
