import { useState, useEffect } from 'react';
import { Plus, Search, Share2, Eye, Edit3, Trash2, BarChart3, Calendar, Users, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Forms() {
  const [forms, setForms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch from API
    // formsApi.getForms().then(setForms).finally(() => setLoading(false));
    // For demo purposes, using mock data
    const mockForms = [
      {
        id: '1',
        name: 'Customer Feedback Survey',
        description: 'Gather feedback on our products and services',
        responses: 42,
        conversionRate: 68.5,
        status: 'active',
        createdAt: new Date('2025-10-15'),
        lastUpdated: new Date('2025-11-10'),
        thumbnail: null,
      },
      {
        id: '2',
        name: 'Lead Qualification Form',
        description: 'Qualify potential customers and leads',
        responses: 18,
        conversionRate: 45.2,
        status: 'active',
        createdAt: new Date('2025-10-22'),
        lastUpdated: new Date('2025-11-08'),
        thumbnail: null,
      },
      {
        id: '3',
        name: 'Event Registration',
        description: 'Register attendees for our upcoming webinar',
        responses: 7,
        conversionRate: 82.1,
        status: 'inactive',
        createdAt: new Date('2025-11-01'),
        lastUpdated: new Date('2025-11-05'),
        thumbnail: null,
      },
    ];
    setForms(mockForms);
    setLoading(false);
  }, []);

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateForm = async () => {
    try {
      // In a real app, this would create a new form via API
      // const newForm = await formsApi.createForm({ 
      //   name: 'Untitled Form',
      //   title: 'Untitled Form',
      //   description: 'New form created',
      //   fields: [],
      //   isActive: false,
      //   isPublished: false
      // });
      // window.location.href = `/forms/builder/${newForm.id}`;
      
      // For now, redirect to form builder with new form ID (which will create it on load)
      const newFormId = 'new-' + Date.now(); // Simulate a new form ID
      window.location.href = `/forms/builder/${newFormId}`;
    } catch (error) {
      console.error('Error creating form:', error);
      alert('Error creating form. Please try again.');
    }
  };

  const handleEditForm = (formId) => {
    // In a real app, this would navigate to the form builder
    window.location.href = `/forms/builder/${formId}`;
  };



  const handleShareForm = (formId) => {
    // In a real app, this would generate and copy a shareable form link
    const formUrl = `${window.location.origin}/forms/preview/${formId}`;
    navigator.clipboard.writeText(formUrl);
    alert(`Form link copied to clipboard: ${formUrl}`);
  };

  const handleDeleteForm = async (formId) => {
    if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      try {
        // In a real app, this would delete the form via API
        // await formsApi.deleteForm(formId);
        
        // For demo, just show success
        alert(`Form ${formId} deleted successfully`);
        
        // Update local state to remove the form
        setForms(forms.filter(form => form.id !== formId));
      } catch (error) {
        console.error('Error deleting form:', error);
        alert('Error deleting form. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-blue border-t-transparent"></div>
          <p className="text-crm-text-secondary">Loading forms...</p>
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
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-crm-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-crm-text-primary">Forms</h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              Create and manage TypeForm-style conversational forms
            </p>
          </div>

          <Button variant="default" size="default" className="gap-2" onClick={handleCreateForm}>
            <Plus className="h-4 w-4" />
            <span>Create Form</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-blue/10">
                <FileText className="h-5 w-5 text-primary-blue" />
              </div>
              <div>
                <div className="text-sm text-crm-text-secondary">Total Forms</div>
                <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                  {forms.length}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-green/10">
                <Users className="h-5 w-5 text-primary-green" />
              </div>
              <div>
                <div className="text-sm text-crm-text-secondary">Total Responses</div>
                <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                  {forms.reduce((sum, form) => sum + form.responses, 0)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-yellow/10">
                <BarChart3 className="h-5 w-5 text-primary-yellow" />
              </div>
              <div>
                <div className="text-sm text-crm-text-secondary">Avg. Conversion</div>
                <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                  {forms.length > 0 ? (forms.reduce((sum, form) => sum + form.conversionRate, 0) / forms.length).toFixed(1) + '%' : '0%'}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-crm-bg-light rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-blue/10">
                <Calendar className="h-5 w-5 text-primary-blue" />
              </div>
              <div>
                <div className="text-sm text-crm-text-secondary">Active Forms</div>
                <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                  {forms.filter(f => f.status === 'active').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-crm-border px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-crm-text-secondary" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-crm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-crm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredForms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-6 rounded-full bg-crm-bg-light mb-4">
              <FileText className="h-12 w-12 text-crm-text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-crm-text-primary mb-2">No forms yet</h3>
            <p className="text-crm-text-secondary mb-6">
              Create your first TypeForm-style conversational form to get started
            </p>
            <Button variant="default" size="default" className="gap-2" onClick={handleCreateForm}>
              <Plus className="h-4 w-4" />
              <span>Create Your First Form</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div key={form.id} className="bg-white rounded-lg border border-crm-border p-5 hover:shadow-crm-hover transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-crm-text-primary truncate">{form.name}</h3>
                    <p className="text-sm text-crm-text-secondary mt-1 line-clamp-2">
                      {form.description}
                    </p>
                  </div>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    form.status === 'active' 
                      ? 'bg-primary-green/10 text-primary-green' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {form.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-crm-text-secondary mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{form.responses} responses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      <span>{form.conversionRate}% rate</span>
                    </div>
                  </div>
                  <div>
                    <span>Updated: {form.lastUpdated.toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-crm-border">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditForm(form.id)}
                      title="Edit form"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Link to={`/forms/analytics/${form.id}`}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        title="View analytics"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={`/forms/integrations/${form.id}`}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        title="Configure integrations"
                      >
                        <Zap className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleShareForm(form.id)}
                      title="Share form"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Link to={`/forms/preview/${form.id}`}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        title="View form"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600"
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
    </div>
  );
}