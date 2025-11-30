/**
 * Invitation Templates Component
 * Manage email templates for member invitations
 */

import { useState, useEffect } from 'react';
import { useAgency } from '../../context/AgencyContext';
import api from '../../lib/api';
import {
  Mail,
  Plus,
  Edit,
  Trash2,
  Star,
  Eye,
  Send,
  X,
  Check,
  AlertCircle,
  FileText,
  Code
} from 'lucide-react';
import toast from 'react-hot-toast';

// Default template variables
const TEMPLATE_VARIABLES = [
  { name: 'invitee_name', description: 'Name of the person being invited' },
  { name: 'invitee_email', description: 'Email of the person being invited' },
  { name: 'agency_name', description: 'Name of your agency' },
  { name: 'agency_logo', description: 'URL of your agency logo' },
  { name: 'inviter_name', description: 'Name of the person sending the invite' },
  { name: 'inviter_email', description: 'Email of the person sending the invite' },
  { name: 'invite_link', description: 'The invitation acceptance link' },
  { name: 'role', description: 'Role being assigned to the invitee' },
  { name: 'expire_date', description: 'When the invite expires' }
];

export default function InvitationTemplates() {
  const { currentAgency } = useAgency();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body_html: '',
    body_text: ''
  });

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!currentAgency?.id) return;

      try {
        const response = await api.get('/api/v1/invitation-templates', {
          headers: { 'X-Agency-ID': currentAgency.id }
        });

        if (response.data.success) {
          setTemplates(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        toast.error('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [currentAgency?.id]);

  // Open editor for new template
  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: "You've been invited to join {{agency_name}}",
      body_html: getDefaultHtml(),
      body_text: ''
    });
    setShowEditor(true);
  };

  // Open editor for existing template
  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body_html: template.body_html,
      body_text: template.body_text || ''
    });
    setShowEditor(true);
  };

  // Save template
  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.subject || !formData.body_html) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      let response;
      if (editingTemplate) {
        response = await api.put(`/api/v1/invitation-templates/${editingTemplate.id}`, formData, {
          headers: { 'X-Agency-ID': currentAgency.id }
        });
      } else {
        response = await api.post('/api/v1/invitation-templates', formData, {
          headers: { 'X-Agency-ID': currentAgency.id }
        });
      }

      if (response.data.success) {
        toast.success(editingTemplate ? 'Template updated' : 'Template created');

        // Refresh templates
        const templatesRes = await api.get('/api/v1/invitation-templates', {
          headers: { 'X-Agency-ID': currentAgency.id }
        });
        if (templatesRes.data.success) {
          setTemplates(templatesRes.data.data || []);
        }

        setShowEditor(false);
      }
    } catch (err) {
      console.error('Error saving template:', err);
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  // Delete template
  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await api.delete(`/api/v1/invitation-templates/${templateId}`, {
        headers: { 'X-Agency-ID': currentAgency.id }
      });

      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success('Template deleted');
    } catch (err) {
      console.error('Error deleting template:', err);
      toast.error('Failed to delete template');
    }
  };

  // Set as default
  const handleSetDefault = async (templateId) => {
    try {
      await api.post(`/api/v1/invitation-templates/${templateId}/set-default`, {}, {
        headers: { 'X-Agency-ID': currentAgency.id }
      });

      setTemplates(prev => prev.map(t => ({
        ...t,
        is_default: t.id === templateId
      })));

      toast.success('Default template updated');
    } catch (err) {
      console.error('Error setting default:', err);
      toast.error('Failed to set default template');
    }
  };

  // Preview template
  const handlePreview = async () => {
    try {
      const response = await api.post('/api/v1/invitation-templates/preview', {
        subject: formData.subject,
        body_html: formData.body_html,
        body_text: formData.body_text
      }, {
        headers: { 'X-Agency-ID': currentAgency.id }
      });

      if (response.data.success) {
        setPreviewHtml(response.data.data.html);
        setShowPreview(true);
      }
    } catch (err) {
      console.error('Error previewing template:', err);
      toast.error('Failed to preview template');
    }
  };

  // Send test email
  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setSendingTest(true);
    try {
      await api.post('/api/v1/invitation-templates/send-test', {
        template_id: editingTemplate?.id,
        test_email: testEmail
      }, {
        headers: { 'X-Agency-ID': currentAgency.id }
      });

      toast.success(`Test email sent to ${testEmail}`);
      setTestEmail('');
    } catch (err) {
      console.error('Error sending test email:', err);
      toast.error('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  // Insert variable into editor
  const insertVariable = (varName) => {
    const textarea = document.getElementById('template-body');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.body_html;
      const newText = text.substring(0, start) + `{{${varName}}}` + text.substring(end);
      setFormData(prev => ({ ...prev, body_html: newText }));
    }
  };

  // Default HTML template
  function getDefaultHtml() {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">You're Invited!</h2>
  <p>Hi {{invitee_name}},</p>
  <p>{{inviter_name}} has invited you to join <strong>{{agency_name}}</strong> as a <strong>{{role}}</strong>.</p>
  <p style="margin: 30px 0;">
    <a href="{{invite_link}}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Accept Invitation
    </a>
  </p>
  <p style="color: #666; font-size: 14px;">This invitation link will expire in {{expire_date}}.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="color: #999; font-size: 12px;">Powered by Axolop CRM</p>
</div>`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Invitation Templates</h3>
          <p className="text-sm text-gray-600">
            Customize the emails sent when inviting team members
          </p>
        </div>
        <button
          onClick={handleNewTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {/* Templates List */}
      <div className="grid gap-4">
        {templates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No custom templates yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first template to customize invitation emails</p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      {template.is_default && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          <Star className="h-3 w-3" />
                          Default
                        </span>
                      )}
                      {!template.agency_id && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          System
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {template.agency_id && !template.is_default && (
                    <button
                      onClick={() => handleSetDefault(template.id)}
                      className="p-1.5 text-gray-400 hover:text-yellow-600 rounded"
                      title="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {template.agency_id && (
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </h3>
              <button
                onClick={() => setShowEditor(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Editor */}
                <div className="col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-md px-3 py-2"
                      placeholder="e.g., Sales Team Invite"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Subject *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full border border-gray-200 rounded-md px-3 py-2"
                      placeholder="You've been invited to join {{agency_name}}"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Body (HTML) *
                    </label>
                    <textarea
                      id="template-body"
                      value={formData.body_html}
                      onChange={(e) => setFormData(prev => ({ ...prev, body_html: e.target.value }))}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 font-mono text-sm"
                      rows={15}
                      placeholder="<html>...</html>"
                    />
                  </div>

                  {/* Test Email */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Send Test Email
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-md px-3 py-2"
                        placeholder="test@example.com"
                      />
                      <button
                        onClick={handleSendTest}
                        disabled={sendingTest}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                      >
                        {sendingTest ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Send Test
                      </button>
                    </div>
                  </div>
                </div>

                {/* Variables Panel */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Available Variables</h4>
                    <p className="text-xs text-gray-500 mb-3">
                      Click to insert into the email body
                    </p>
                    <div className="space-y-2">
                      {TEMPLATE_VARIABLES.map((variable) => (
                        <button
                          key={variable.name}
                          onClick={() => insertVariable(variable.name)}
                          className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                        >
                          <code className="text-xs text-blue-600">
                            {`{{${variable.name}}}`}
                          </code>
                          <p className="text-xs text-gray-500 mt-1">{variable.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Template Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div
                className="border border-gray-200 rounded-lg p-4"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
