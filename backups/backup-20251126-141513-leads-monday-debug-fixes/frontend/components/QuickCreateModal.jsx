import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Users,
  Building2,
  FileText,
  Calendar,
  Mail,
  Target,
  CheckCircle,
  Zap,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { searchApi } from "../lib/api";

// ============================================
// QUICK CREATE MODAL COMPONENT
// ============================================

const QuickCreateModal = ({
  isOpen,
  onClose,
  entityType,
  initialData = {},
  onSave,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState(null);
  const { toast } = useToast();

  // Entity type configuration
  const entityConfig = {
    lead: {
      title: "Create New Lead",
      icon: Users,
      color: "blue",
      fields: [
        {
          name: "first_name",
          label: "First Name",
          type: "text",
          required: true,
        },
        { name: "last_name", label: "Last Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "tel", required: false },
        { name: "company", label: "Company", type: "text", required: false },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED"],
          default: "NEW",
        },
        { name: "source", label: "Lead Source", type: "text", required: false },
        { name: "notes", label: "Notes", type: "textarea", required: false },
      ],
    },
    contact: {
      title: "Create New Contact",
      icon: Building2,
      color: "green",
      fields: [
        {
          name: "first_name",
          label: "First Name",
          type: "text",
          required: true,
        },
        { name: "last_name", label: "Last Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "tel", required: false },
        { name: "company", label: "Company", type: "text", required: false },
        { name: "title", label: "Title", type: "text", required: false },
        { name: "address", label: "Address", type: "text", required: false },
        { name: "city", label: "City", type: "text", required: false },
        { name: "country", label: "Country", type: "text", required: false },
      ],
    },
    form: {
      title: "Create New Form",
      icon: FileText,
      color: "purple",
      fields: [
        { name: "name", label: "Form Name", type: "text", required: true },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          required: false,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["draft", "published", "archived"],
          default: "draft",
        },
        {
          name: "collect_email",
          label: "Collect Email",
          type: "checkbox",
          default: false,
        },
        {
          name: "collect_phone",
          label: "Collect Phone",
          type: "checkbox",
          default: false,
        },
        {
          name: "redirect_url",
          label: "Redirect URL",
          type: "url",
          required: false,
        },
      ],
    },
    campaign: {
      title: "Create New Campaign",
      icon: Mail,
      color: "red",
      fields: [
        { name: "name", label: "Campaign Name", type: "text", required: true },
        {
          name: "subject",
          label: "Email Subject",
          type: "text",
          required: true,
        },
        {
          name: "from_email",
          label: "From Email",
          type: "email",
          required: true,
        },
        {
          name: "reply_to",
          label: "Reply To Email",
          type: "email",
          required: false,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["draft", "scheduled", "sending", "sent", "paused"],
          default: "draft",
        },
        {
          name: "scheduled_for",
          label: "Schedule For",
          type: "datetime",
          required: false,
        },
      ],
    },
    meeting: {
      title: "Schedule New Meeting",
      icon: Calendar,
      color: "orange",
      fields: [
        { name: "title", label: "Meeting Title", type: "text", required: true },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          required: false,
        },
        {
          name: "start_time",
          label: "Start Time",
          type: "datetime",
          required: true,
        },
        {
          name: "end_time",
          label: "End Time",
          type: "datetime",
          required: true,
        },
        { name: "location", label: "Location", type: "text", required: false },
        {
          name: "attendees",
          label: "Attendees",
          type: "email-multi",
          required: false,
        },
        {
          name: "meeting_type",
          label: "Meeting Type",
          type: "select",
          options: ["in-person", "video", "phone"],
          default: "video",
        },
      ],
    },
    deal: {
      title: "Create New Deal",
      icon: Target,
      color: "yellow",
      fields: [
        { name: "name", label: "Deal Name", type: "text", required: true },
        { name: "value", label: "Deal Value", type: "number", required: false },
        {
          name: "currency",
          label: "Currency",
          type: "select",
          options: ["USD", "EUR", "GBP"],
          default: "USD",
        },
        {
          name: "stage",
          label: "Pipeline Stage",
          type: "select",
          options: [
            "prospecting",
            "qualification",
            "proposal",
            "negotiation",
            "closed-won",
            "closed-lost",
          ],
          default: "prospecting",
        },
        {
          name: "contact_id",
          label: "Primary Contact",
          type: "select",
          required: false,
        },
        {
          name: "company_id",
          label: "Company",
          type: "select",
          required: false,
        },
        {
          name: "expected_close_date",
          label: "Expected Close Date",
          type: "date",
          required: false,
        },
        {
          name: "probability",
          label: "Win Probability (%)",
          type: "number",
          min: 0,
          max: 100,
          default: 50,
        },
      ],
    },
    task: {
      title: "Create New Task",
      icon: CheckCircle,
      color: "lime",
      fields: [
        { name: "title", label: "Task Title", type: "text", required: true },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          required: false,
        },
        {
          name: "due_date",
          label: "Due Date",
          type: "datetime",
          required: false,
        },
        {
          name: "priority",
          label: "Priority",
          type: "select",
          options: ["low", "normal", "high", "urgent"],
          default: "normal",
        },
        {
          name: "assigned_to",
          label: "Assigned To",
          type: "select",
          required: false,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["todo", "in-progress", "review", "completed"],
          default: "todo",
        },
      ],
    },
    note: {
      title: "Create New Note",
      icon: FileText,
      color: "amber",
      fields: [
        { name: "title", label: "Note Title", type: "text", required: true },
        { name: "content", label: "Content", type: "textarea", required: true },
        { name: "folder_id", label: "Folder", type: "select", required: false },
        { name: "tags", label: "Tags", type: "tags", required: false },
        {
          name: "is_public",
          label: "Public",
          type: "checkbox",
          default: false,
        },
      ],
    },
    workflow: {
      title: "Create New Workflow",
      icon: Zap,
      color: "indigo",
      fields: [
        { name: "name", label: "Workflow Name", type: "text", required: true },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          required: false,
        },
        {
          name: "trigger_type",
          label: "Trigger Type",
          type: "select",
          options: ["manual", "webhook", "schedule", "event"],
          default: "manual",
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["draft", "active", "paused", "archived"],
          default: "draft",
        },
      ],
    },
  };

  const config = entityConfig[entityType];
  if (!config) return null;

  // Load schema if available
  useEffect(() => {
    const loadSchema = async () => {
      try {
        const response = await searchApi.getEntitySchema(entityType);
        if (response.data?.success) {
          setSchema(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load schema:", error);
      }
    };

    if (isOpen) {
      loadSchema();
    }
  }, [entityType, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await searchApi.createEntity(entityType, formData);

      if (response.data?.success) {
        toast({
          title: "Success!",
          description: `${config.title.replace("Create New ", "")} created successfully.`,
        });

        onSave(response.data.data);
        onClose();
      } else {
        throw new Error(response.data?.message || "Creation failed");
      }
    } catch (error) {
      console.error("Creation error:", error);
      toast({
        title: "Creation Failed",
        description:
          error.response?.data?.error ||
          error.message ||
          "Failed to create entity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const renderField = (field) => {
    const value = formData[field.name] || field.default || "";

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        );

      case "email":
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        );

      case "tel":
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        );

      case "url":
        return (
          <input
            type="url"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) =>
              handleInputChange(field.name, parseFloat(e.target.value))
            }
            placeholder={field.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
            min={field.min}
            max={field.max}
          />
        );

      case "date":
      case "datetime":
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.label}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label className="ml-2 text-gray-700">{field.label}</label>
          </div>
        );

      case "tags":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) =>
              handleInputChange(
                field.name,
                e.target.value.split(",").map((tag) => tag.trim()),
              )
            }
            placeholder={field.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        );

      case "email-multi":
        return (
          <textarea
            value={Array.isArray(value) ? value.join(", ") : value}
            onChange={(e) =>
              handleInputChange(
                field.name,
                e.target.value.split(",").map((email) => email.trim()),
              )
            }
            placeholder={field.label}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        );
    }
  };

  if (!isOpen) return null;

  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-lg bg-${config.color}-100 flex items-center justify-center`}
            >
              <IconComponent className={`h-4 w-4 text-${config.color}-600`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {config.title}
              </h2>
              <p className="text-sm text-gray-500">Fill in the details below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]"
        >
          <div className="space-y-4">
            {config.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && (
                    <span className="text-[#761B14] ml-1">*</span>
                  )}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-24">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-blue-600"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create {config.title.replace("Create New ", "")}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickCreateModal;
