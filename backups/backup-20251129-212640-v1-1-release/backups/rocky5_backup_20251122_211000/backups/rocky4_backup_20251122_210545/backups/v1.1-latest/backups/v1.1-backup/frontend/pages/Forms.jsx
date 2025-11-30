import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Share2, Eye, Edit3, Trash2, BarChart3, Calendar, Users, FileText, Zap, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import formsApi from '@/services/formsApi';
import { useToast } from '@/components/ui/use-toast';
import FormEmbedModal from '@/components/FormEmbedModal';

export default function Forms() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [forms, setForms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  const loadForms = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedForms = await formsApi.getForms({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });

      console.log('Fetched forms:', fetchedForms);

      // Handle case where API returns null or undefined
      if (!fetchedForms) {
        setForms([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Transform API data to match component format
      const transformedForms = fetchedForms.map(form => ({
        id: form.id,
        name: form.title,
        description: form.description || '',
        responses: form.total_responses || 0,
        conversionRate: form.conversion_rate || 0,
        status: form.is_active ? 'active' : 'inactive',
        createdAt: new Date(form.created_at),
        lastUpdated: new Date(form.updated_at),
        thumbnail: null,
      }));

      setForms(transformedForms);
      setError(null);
    } catch (err) {
      console.error('Error loading forms:', err);

      // If database table doesn't exist, show empty state instead of error
      if (err.message.includes('table') || err.message.includes('schema cache')) {
        console.warn('Forms table not initialized. Showing empty state.');
        setForms([]);
        setError(null);
        toast({
          title: "Database Not Initialized",
          description: "The forms table hasn't been created yet. Forms will be empty until the database is set up.",
        });
      } else if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        setError(new Error('Unable to connect to server. Please ensure the backend is running.'));
        setForms([]);
      } else {
        setError(err);
        setForms([]);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, toast]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateForm = async () => {
    navigate('/app/forms/builder/new');
  };

  const handleEditForm = (formId) => {
    navigate(`/app/forms/builder/${formId}`);
  };

  const handleShareForm = (form) => {
    setSelectedForm(form);
    setShowEmbedModal(true);
  };

  const handleDuplicateForm = async (formId) => {
    try {
      const duplicatedForm = await formsApi.duplicateForm(formId);
      toast({
        title: "Form Duplicated",
        description: `Form has been duplicated successfully.`,
      });

      // Reload forms
      loadForms();
    } catch (error) {
      console.error('Error duplicating form:', error);
      toast({
        title: "Duplicate Failed",
        description: `Error duplicating form: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteForm = async (formId) => {
    if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      try {
        await formsApi.deleteForm(formId);
        toast({
          title: "Form Deleted",
          description: "Form has been deleted successfully.",
        });

        // Reload forms
        loadForms();
      } catch (error) {
        console.error('Error deleting form:', error);
        toast({
          title: "Delete Failed",
          description: `Error deleting form: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-white">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#7b1c14] mx-auto"></div>
            <div className="absolute inset-0 animate-pulse">
              <div className="rounded-full h-16 w-16 border-4 border-[#7b1c14]/20 mx-auto"></div>
            </div>
          </div>
          <p className="text-gray-700 font-medium text-lg">Loading forms...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your form builder</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-crm-text-primary mb-2">Error Loading Forms</h2>
          <p className="text-crm-text-secondary mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }


  return (
    <div className="h-full flex flex-col bg-white form-builder-content">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Forms
              <span className="ml-3 text-[#7b1c14]">●</span>
            </h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Create and manage conversational forms
            </p>
          </div>

          <Button variant="default" size="default" className="gap-2 bg-[#7b1c14] hover:bg-[#6b1a12] shadow-lg" onClick={handleCreateForm}>
            <Plus className="h-4 w-4" />
            <span>Create Form</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#7b1c14]/10">
                <FileText className="h-5 w-5 text-[#7b1c14]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Forms</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {forms.length}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-600/10">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Total Responses</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">
                  {forms.reduce((sum, form) => sum + form.responses, 0)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-600/10">
                <BarChart3 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Avg. Conversion</div>
                <div className="text-2xl font-bold text-amber-600 mt-1">
                  {forms.length > 0 ? (forms.reduce((sum, form) => sum + form.conversionRate, 0) / forms.length).toFixed(1) + '%' : '0%'}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600/10">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Active Forms</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {forms.filter(f => f.status === 'active').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7b1c14] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7b1c14] focus:border-transparent bg-white text-gray-900 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {filteredForms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 shadow-lg">
            <div className="p-6 rounded-full bg-[#7b1c14]/10 mx-auto mb-6">
              <FileText className="h-16 w-16 text-[#7b1c14]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No forms yet</h3>
            <p className="text-gray-600 mb-6 max-w-md text-center">
              Create your first conversational form to get started
            </p>
            <Button
              variant="default"
              size="default"
              className="gap-2 bg-[#7b1c14] hover:bg-[#6b1a12] shadow-lg"
              onClick={handleCreateForm}
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Form</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div key={form.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate text-lg">{form.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {form.description}
                    </p>
                  </div>
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    form.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {form.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Responses</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">{form.responses}</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Conv. Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-600">{form.conversionRate}%</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Updated: {form.lastUpdated.toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-300 hover:border-[#7b1c14] hover:text-[#7b1c14]"
                    onClick={() => handleEditForm(form.id)}
                    title="Edit form"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-300 hover:border-[#7b1c14] hover:text-[#7b1c14]"
                    onClick={() => handleDuplicateForm(form.id)}
                    title="Duplicate form"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-300 hover:border-[#7b1c14] hover:text-[#7b1c14]"
                    onClick={() => handleShareForm(form)}
                    title="Share form"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Link to={`/forms/preview/${form.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-300 hover:border-[#7b1c14] hover:text-[#7b1c14]"
                      title="View form"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to={`/forms/analytics/${form.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-300 hover:border-[#7b1c14] hover:text-[#7b1c14]"
                      title="View analytics"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-500 hover:border-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteForm(form.id)}
                    title="Delete form"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Embed Modal */}
      <FormEmbedModal
        open={showEmbedModal}
        onOpenChange={setShowEmbedModal}
        form={selectedForm}
      />
    </div>
  );
}