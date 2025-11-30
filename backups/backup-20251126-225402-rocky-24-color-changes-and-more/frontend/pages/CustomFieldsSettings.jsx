import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: '📝' },
  { value: 'textarea', label: 'Text Area', icon: '📄' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Phone', icon: '📞' },
  { value: 'url', label: 'URL', icon: '🔗' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'boolean', label: 'Yes/No', icon: '✓' },
  { value: 'select', label: 'Dropdown', icon: '▼' },
  { value: 'multiselect', label: 'Multi-Select', icon: '☑' },
];

const ENTITY_TYPES = [
  { value: 'lead', label: 'Leads Only' },
  { value: 'contact', label: 'Contacts Only' },
  { value: 'opportunity', label: 'Opportunities Only' },
  { value: 'all', label: 'All Entities' },
];

export default function CustomFieldsSettings() {
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('all');
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    field_name: '',
    display_name: '',
    field_type: 'text',
    entity_type: 'lead',
    is_required: false,
    help_text: '',
    group_name: '',
    options: [], // For select/multiselect types
  });

  const [optionInput, setOptionInput] = useState({ value: '', label: '' });

  useEffect(() => {
    fetchCustomFields();
  }, [selectedEntityFilter]);

  const fetchCustomFields = async () => {
    setLoading(true);
    try {
      const params = selectedEntityFilter !== 'all' ? `?entityType=${selectedEntityFilter}` : '';
      const response = await api.get(`/custom-fields/definitions${params}`);
      setCustomFields(response.data);
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      toast({
        title: 'Error',
        description: 'Failed to load custom fields.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (field = null) => {
    if (field) {
      setEditingField(field);
      setFormData({
        field_name: field.field_name,
        display_name: field.display_name,
        field_type: field.field_type,
        entity_type: field.entity_type,
        is_required: field.is_required,
        help_text: field.help_text || '',
        group_name: field.group_name || '',
        options: field.options || [],
      });
    } else {
      setEditingField(null);
      setFormData({
        field_name: '',
        display_name: '',
        field_type: 'text',
        entity_type: 'lead',
        is_required: false,
        help_text: '',
        group_name: '',
        options: [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingField(null);
    setFormData({
      field_name: '',
      display_name: '',
      field_type: 'text',
      entity_type: 'lead',
      is_required: false,
      help_text: '',
      group_name: '',
      options: [],
    });
    setOptionInput({ value: '', label: '' });
  };

  const handleSave = async () => {
    // Validate
    if (!formData.display_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Display name is required.',
        variant: 'destructive',
      });
      return;
    }

    // Auto-generate field_name from display_name if not editing
    const fieldName = editingField
      ? formData.field_name
      : formData.display_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '');

    // Validate options for select/multiselect
    if (['select', 'multiselect'].includes(formData.field_type) && formData.options.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one option for dropdown fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        field_name: fieldName,
      };

      if (editingField) {
        await api.put(`/custom-fields/definitions/${editingField.id}`, payload);
        toast({
          title: 'Success',
          description: 'Custom field updated successfully!',
        });
      } else {
        await api.post('/custom-fields/definitions', payload);
        toast({
          title: 'Success',
          description: 'Custom field created successfully!',
        });
      }

      fetchCustomFields();
      closeModal();
    } catch (error) {
      console.error('Error saving custom field:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save custom field.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (field) => {
    if (!confirm(`Are you sure you want to delete the custom field "${field.display_name}"?`)) {
      return;
    }

    try {
      await api.delete(`/custom-fields/definitions/${field.id}`);
      toast({
        title: 'Success',
        description: 'Custom field deleted successfully!',
      });
      fetchCustomFields();
    } catch (error) {
      console.error('Error deleting custom field:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete custom field.',
        variant: 'destructive',
      });
    }
  };

  const addOption = () => {
    if (!optionInput.label.trim() || !optionInput.value.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Both value and label are required for options.',
        variant: 'destructive',
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { value: optionInput.value, label: optionInput.label }],
    }));
    setOptionInput({ value: '', label: '' });
  };

  const removeOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Page Header */}
      <div className="relative bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Settings className="h-8 w-8 text-[#761B14]" />
              Custom Fields
            </h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Create and manage custom fields for leads, contacts, and opportunities
            </p>
          </div>

          <Button
            variant="default"
            size="default"
            className="gap-2 btn-premium-red"
            onClick={() => openModal()}
          >
            <Plus className="h-4 w-4" />
            <span>New Custom Field</span>
          </Button>
        </div>

        {/* Filter */}
        <div className="mt-4 flex items-center gap-4">
          <Label className="font-semibold text-gray-700">Filter by Entity:</Label>
          <Select value={selectedEntityFilter} onValueChange={setSelectedEntityFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="lead">Leads</SelectItem>
              <SelectItem value="contact">Contacts</SelectItem>
              <SelectItem value="opportunity">Opportunities</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Custom Fields List */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#761B14]"></div>
          </div>
        ) : customFields.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
            <Settings className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Custom Fields Yet</h3>
            <p className="text-gray-600 mb-6">Create your first custom field to get started</p>
            <Button
              variant="default"
              className="gap-2 btn-premium-red"
              onClick={() => openModal()}
            >
              <Plus className="h-4 w-4" />
              <span>Create Custom Field</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customFields.map((field) => {
              const fieldType = FIELD_TYPES.find((t) => t.value === field.field_type);
              const entityType = ENTITY_TYPES.find((t) => t.value === field.entity_type);

              return (
                <div
                  key={field.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{fieldType?.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-900">{field.display_name}</h3>
                        <p className="text-xs text-gray-500">{field.field_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openModal(field)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(field)}
                        className="h-8 w-8 p-0 text-[#761B14] hover:text-[#3D1515] hover:bg-[#761B14]/5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {fieldType?.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {entityType?.label}
                      </Badge>
                      {field.is_required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>

                    {field.help_text && (
                      <p className="text-xs text-gray-600 italic">{field.help_text}</p>
                    )}

                    {field.group_name && (
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold">Group:</span> {field.group_name}
                      </p>
                    )}

                    {field.options && field.options.length > 0 && (
                      <div className="text-xs">
                        <span className="font-semibold text-gray-700">Options:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {field.options.slice(0, 3).map((opt, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {opt.label}
                            </Badge>
                          ))}
                          {field.options.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{field.options.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingField ? 'Edit Custom Field' : 'Create Custom Field'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Display Name */}
            <div>
              <Label htmlFor="display_name" className="font-semibold">
                Display Name *
              </Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="e.g., Company Size"
              />
            </div>

            {/* Field Type */}
            <div>
              <Label htmlFor="field_type" className="font-semibold">
                Field Type *
              </Label>
              <Select
                value={formData.field_type}
                onValueChange={(value) => setFormData({ ...formData, field_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity Type */}
            <div>
              <Label htmlFor="entity_type" className="font-semibold">
                Apply To *
              </Label>
              <Select
                value={formData.entity_type}
                onValueChange={(value) => setFormData({ ...formData, entity_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options (for select/multiselect) */}
            {['select', 'multiselect'].includes(formData.field_type) && (
              <div>
                <Label className="font-semibold">Options *</Label>
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Value (e.g., small)"
                      value={optionInput.value}
                      onChange={(e) =>
                        setOptionInput({ ...optionInput, value: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Label (e.g., Small 1-10)"
                      value={optionInput.label}
                      onChange={(e) =>
                        setOptionInput({ ...optionInput, label: e.target.value })
                      }
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={addOption} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>

                  {formData.options.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {formData.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span className="text-sm">
                            <span className="font-semibold">{opt.value}:</span> {opt.label}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(idx)}
                            className="h-6 w-6 p-0 text-[#761B14] hover:text-[#3D1515]"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Help Text */}
            <div>
              <Label htmlFor="help_text" className="font-semibold">
                Help Text (Optional)
              </Label>
              <Textarea
                id="help_text"
                value={formData.help_text}
                onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
                placeholder="Provide guidance for users filling this field"
                rows={2}
              />
            </div>

            {/* Group Name */}
            <div>
              <Label htmlFor="group_name" className="font-semibold">
                Group Name (Optional)
              </Label>
              <Input
                id="group_name"
                value={formData.group_name}
                onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                placeholder="e.g., Company Info, Contact Preferences"
              />
            </div>

            {/* Is Required */}
            <div className="flex items-center justify-between">
              <Label htmlFor="is_required" className="font-semibold">
                Required Field
              </Label>
              <Switch
                id="is_required"
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              className="btn-premium-red"
            >
              <Save className="h-4 w-4 mr-2" />
              {editingField ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
