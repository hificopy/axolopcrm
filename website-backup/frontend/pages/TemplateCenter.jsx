import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  FileText,
  Mail,
  Calendar,
  Users,
  Target,
  Zap,
  Star,
  Download,
  Eye,
  Plus,
  ChevronRight,
  Layout,
  MessageSquare,
  Phone,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// Card components - using simple divs for now to avoid missing dependencies
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const templateCategories = [
  { id: 'all', label: 'All Templates', icon: Layout },
  { id: 'forms', label: 'Forms', icon: FileText },
  { id: 'emails', label: 'Email Templates', icon: Mail },
  { id: 'workflows', label: 'Workflows', icon: Zap },
  { id: 'campaigns', label: 'Campaigns', icon: Target },
  { id: 'meetings', label: 'Meeting Templates', icon: Calendar },
  { id: 'reports', label: 'Report Templates', icon: BarChart3 }
];

const mockTemplates = [
  {
    id: 1,
    name: 'Lead Capture Form',
    category: 'forms',
    description: 'High-converting lead capture form with essential fields',
    icon: FileText,
    uses: 1234,
    rating: 4.8,
    featured: true,
    tags: ['lead generation', 'contact form', 'essential']
  },
  {
    id: 2,
    name: 'Welcome Email Series',
    category: 'emails',
    description: '3-part welcome email sequence for new subscribers',
    icon: Mail,
    uses: 892,
    rating: 4.9,
    featured: true,
    tags: ['automation', 'welcome', 'nurture']
  },
  {
    id: 3,
    name: 'Sales Follow-up Workflow',
    category: 'workflows',
    description: 'Automated follow-up sequence for new leads',
    icon: Zap,
    uses: 756,
    rating: 4.7,
    featured: false,
    tags: ['automation', 'sales', 'follow-up']
  },
  {
    id: 4,
    name: 'Product Demo Booking',
    category: 'meetings',
    description: 'Meeting template for product demonstrations',
    icon: Calendar,
    uses: 623,
    rating: 4.6,
    featured: false,
    tags: ['demo', 'sales', 'meeting']
  },
  {
    id: 5,
    name: 'Monthly Sales Report',
    category: 'reports',
    description: 'Comprehensive monthly sales performance report',
    icon: BarChart3,
    uses: 445,
    rating: 4.5,
    featured: false,
    tags: ['analytics', 'sales', 'monthly']
  },
  {
    id: 6,
    name: 'Customer Feedback Form',
    category: 'forms',
    description: 'Collect customer feedback and testimonials',
    icon: FileText,
    uses: 389,
    rating: 4.8,
    featured: false,
    tags: ['feedback', 'customer', 'satisfaction']
  }
];

export default function TemplateCenter() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [filteredTemplates, setFilteredTemplates] = useState(mockTemplates);

  useEffect(() => {
    let filtered = mockTemplates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.uses - a.uses);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredTemplates(filtered);
  }, [searchTerm, selectedCategory, sortBy]);

  const getCategoryIcon = (categoryId) => {
    const category = templateCategories.find(cat => cat.id === categoryId);
    return category ? category.icon : Layout;
  };

  const handleUseTemplate = (template) => {
    // Navigate to appropriate creation page with template
    switch (template.category) {
      case 'forms':
        navigate(`/app/forms?template=${template.id}`);
        break;
      case 'emails':
        navigate(`/app/email-marketing?template=${template.id}`);
        break;
      case 'workflows':
        navigate(`/app/workflows?template=${template.id}`);
        break;
      case 'meetings':
        navigate(`/app/meetings?template=${template.id}`);
        break;
      case 'reports':
        navigate(`/app/reports?template=${template.id}`);
        break;
      default:
        console.log('Use template:', template);
    }
  };

  const handlePreviewTemplate = (template) => {
    // Open preview modal or navigate to preview page
    console.log('Preview template:', template);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Template Center</h1>
            <p className="text-gray-400">
              Save time with pre-built templates for forms, emails, workflows, and more.
            </p>
          </div>
          <Button className="bg-primary-green hover:bg-primary-green/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {templateCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <SelectItem key={category.id} value={category.id} className="text-white">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {category.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="popular" className="text-white">Most Popular</SelectItem>
              <SelectItem value="rating" className="text-white">Highest Rated</SelectItem>
              <SelectItem value="newest" className="text-white">Newest</SelectItem>
              <SelectItem value="name" className="text-white">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {templateCategories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-primary-green text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          
          return (
            <div key={template.id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg transition-all group">
              <div className="p-6 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                      <Icon className="h-5 w-5 text-primary-green" />
                    </div>
                    <div>
                      <h3 className="text-lg text-white group-hover:text-primary-green transition-colors font-semibold">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                          {template.category}
                        </Badge>
                        {template.featured && (
                          <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 pt-0">
                <p className="text-gray-400 mb-4 line-clamp-2 text-sm">
                  {template.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs text-gray-500 border-gray-600">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs text-gray-500 border-gray-600">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>{template.uses.toLocaleString()} uses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{template.rating}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewTemplate(template)}
                    className="flex-1 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 bg-primary-green hover:bg-primary-green/90 text-white"
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No templates found</h3>
          <p className="text-gray-400 mb-4">
            Try adjusting your search terms or browse different categories.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}