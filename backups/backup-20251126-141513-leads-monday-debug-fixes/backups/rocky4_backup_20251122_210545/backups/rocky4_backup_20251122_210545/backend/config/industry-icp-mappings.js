// Industry-specific Ideal Customer Profile (ICP) field mappings
// This configuration defines required and optional fields for different B2B and B2C industries

export const INDUSTRY_CATEGORIES = {
  B2B: 'B2B',
  B2C: 'B2C'
};

export const INDUSTRIES = {
  // B2B Industries
  B2B_SAAS: {
    id: 'b2b_saas',
    name: 'B2B SaaS',
    category: INDUSTRY_CATEGORIES.B2B,
    description: 'Software as a Service companies',
    requiredFields: [
      { key: 'company_name', label: 'Company Name', type: 'text', example: 'Acme Corp' },
      { key: 'website', label: 'Website', type: 'url', example: 'www.acmecorp.com' },
      { key: 'email', label: 'Email', type: 'email', example: 'contact@acmecorp.com' },
      { key: 'industry', label: 'Industry', type: 'text', example: 'Technology' },
      { key: 'company_size', label: 'Company Size', type: 'number', example: '50-200' },
    ],
    optionalFields: [
      { key: 'phone', label: 'Phone', type: 'phone', example: '+1-555-0123' },
      { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url', example: 'linkedin.com/company/acme' },
      { key: 'contact_name', label: 'Contact Name', type: 'text', example: 'John Smith' },
      { key: 'contact_title', label: 'Contact Title', type: 'text', example: 'VP of Sales' },
      { key: 'tech_stack', label: 'Tech Stack', type: 'text', example: 'React, Node.js, AWS' },
      { key: 'annual_revenue', label: 'Annual Revenue', type: 'currency', example: '5000000' },
      { key: 'funding_stage', label: 'Funding Stage', type: 'text', example: 'Series B' },
      { key: 'location', label: 'Location', type: 'text', example: 'San Francisco, CA' },
      { key: 'country', label: 'Country', type: 'text', example: 'United States' },
    ],
    columnOrder: ['company_name', 'website', 'email', 'phone', 'industry', 'company_size', 'contact_name', 'contact_title', 'linkedin_url', 'tech_stack', 'annual_revenue', 'funding_stage', 'location', 'country']
  },

  B2B_ENTERPRISE_SOFTWARE: {
    id: 'b2b_enterprise_software',
    name: 'Enterprise Software',
    category: INDUSTRY_CATEGORIES.B2B,
    description: 'Enterprise-level software solutions',
    requiredFields: [
      { key: 'company_name', label: 'Company Name', type: 'text', example: 'Global Systems Inc' },
      { key: 'website', label: 'Website', type: 'url', example: 'www.globalsystems.com' },
      { key: 'email', label: 'Email', type: 'email', example: 'procurement@globalsystems.com' },
      { key: 'industry', label: 'Industry', type: 'text', example: 'Financial Services' },
      { key: 'company_size', label: 'Company Size', type: 'text', example: '1000+' },
      { key: 'decision_maker_name', label: 'Decision Maker Name', type: 'text', example: 'Sarah Johnson' },
      { key: 'decision_maker_title', label: 'Decision Maker Title', type: 'text', example: 'CTO' },
    ],
    optionalFields: [
      { key: 'phone', label: 'Phone', type: 'phone', example: '+1-555-0456' },
      { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url', example: 'linkedin.com/company/globalsys' },
      { key: 'it_budget', label: 'IT Budget', type: 'currency', example: '10000000' },
      { key: 'current_vendors', label: 'Current Vendors', type: 'text', example: 'Oracle, SAP, Salesforce' },
      { key: 'contract_end_date', label: 'Contract End Date', type: 'date', example: '2024-12-31' },
      { key: 'pain_points', label: 'Pain Points', type: 'text', example: 'Legacy systems, slow performance' },
      { key: 'headquarters', label: 'Headquarters', type: 'text', example: 'New York, NY' },
      { key: 'num_locations', label: 'Number of Locations', type: 'number', example: '45' },
    ],
    columnOrder: ['company_name', 'website', 'email', 'phone', 'industry', 'company_size', 'decision_maker_name', 'decision_maker_title', 'linkedin_url', 'it_budget', 'current_vendors', 'contract_end_date', 'pain_points', 'headquarters', 'num_locations']
  },

  B2B_CONSULTING: {
    id: 'b2b_consulting',
    name: 'Consulting Services',
    category: INDUSTRY_CATEGORIES.B2B,
    description: 'Professional consulting and advisory services',
    requiredFields: [
      { key: 'company_name', label: 'Company Name', type: 'text', example: 'ABC Consulting Group' },
      { key: 'website', label: 'Website', type: 'url', example: 'www.abcconsulting.com' },
      { key: 'email', label: 'Email', type: 'email', example: 'info@abcconsulting.com' },
      { key: 'industry_focus', label: 'Industry Focus', type: 'text', example: 'Healthcare, Finance' },
      { key: 'company_size', label: 'Company Size', type: 'text', example: '20-50' },
    ],
    optionalFields: [
      { key: 'phone', label: 'Phone', type: 'phone', example: '+1-555-0789' },
      { key: 'contact_name', label: 'Contact Name', type: 'text', example: 'Michael Chen' },
      { key: 'contact_title', label: 'Contact Title', type: 'text', example: 'Managing Partner' },
      { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url', example: 'linkedin.com/company/abc-consulting' },
      { key: 'service_types', label: 'Service Types', type: 'text', example: 'Strategy, Operations, Technology' },
      { key: 'project_budget_range', label: 'Project Budget Range', type: 'text', example: '$100k-$500k' },
      { key: 'location', label: 'Location', type: 'text', example: 'Chicago, IL' },
      { key: 'referral_source', label: 'Referral Source', type: 'text', example: 'Partner network' },
    ],
    columnOrder: ['company_name', 'website', 'email', 'phone', 'industry_focus', 'company_size', 'contact_name', 'contact_title', 'linkedin_url', 'service_types', 'project_budget_range', 'location', 'referral_source']
  },

  B2B_MANUFACTURING: {
    id: 'b2b_manufacturing',
    name: 'Manufacturing & Distribution',
    category: INDUSTRY_CATEGORIES.B2B,
    description: 'Manufacturing and distribution companies',
    requiredFields: [
      { key: 'company_name', label: 'Company Name', type: 'text', example: 'XYZ Manufacturing' },
      { key: 'website', label: 'Website', type: 'url', example: 'www.xyzmanufacturing.com' },
      { key: 'email', label: 'Email', type: 'email', example: 'sales@xyzmanufacturing.com' },
      { key: 'product_category', label: 'Product Category', type: 'text', example: 'Industrial Equipment' },
      { key: 'company_size', label: 'Company Size', type: 'text', example: '200-500' },
    ],
    optionalFields: [
      { key: 'phone', label: 'Phone', type: 'phone', example: '+1-555-0321' },
      { key: 'contact_name', label: 'Contact Name', type: 'text', example: 'Robert Williams' },
      { key: 'contact_title', label: 'Contact Title', type: 'text', example: 'Procurement Manager' },
      { key: 'annual_production_volume', label: 'Annual Production Volume', type: 'text', example: '1M units' },
      { key: 'certifications', label: 'Certifications', type: 'text', example: 'ISO 9001, ISO 14001' },
      { key: 'facility_locations', label: 'Facility Locations', type: 'text', example: 'Detroit, MI; Mexico City' },
      { key: 'order_frequency', label: 'Order Frequency', type: 'text', example: 'Monthly' },
      { key: 'average_order_value', label: 'Average Order Value', type: 'currency', example: '150000' },
    ],
    columnOrder: ['company_name', 'website', 'email', 'phone', 'product_category', 'company_size', 'contact_name', 'contact_title', 'annual_production_volume', 'certifications', 'facility_locations', 'order_frequency', 'average_order_value']
  },

  B2B_FINANCIAL_SERVICES: {
    id: 'b2b_financial_services',
    name: 'Financial Services',
    category: INDUSTRY_CATEGORIES.B2B,
    description: 'Banks, investment firms, and financial institutions',
    requiredFields: [
      { key: 'company_name', label: 'Company Name', type: 'text', example: 'First Capital Bank' },
      { key: 'website', label: 'Website', type: 'url', example: 'www.firstcapitalbank.com' },
      { key: 'email', label: 'Email', type: 'email', example: 'business@firstcapital.com' },
      { key: 'institution_type', label: 'Institution Type', type: 'text', example: 'Commercial Bank' },
      { key: 'assets_under_management', label: 'Assets Under Management', type: 'currency', example: '5000000000' },
    ],
    optionalFields: [
      { key: 'phone', label: 'Phone', type: 'phone', example: '+1-555-0654' },
      { key: 'contact_name', label: 'Contact Name', type: 'text', example: 'Jennifer Martinez' },
      { key: 'contact_title', label: 'Contact Title', type: 'text', example: 'VP of Operations' },
      { key: 'regulatory_compliance', label: 'Regulatory Compliance', type: 'text', example: 'SOC 2, PCI DSS, GDPR' },
      { key: 'number_of_branches', label: 'Number of Branches', type: 'number', example: '150' },
      { key: 'target_markets', label: 'Target Markets', type: 'text', example: 'SMB, Enterprise' },
      { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url', example: 'linkedin.com/company/firstcapital' },
    ],
    columnOrder: ['company_name', 'website', 'email', 'phone', 'institution_type', 'assets_under_management', 'contact_name', 'contact_title', 'regulatory_compliance', 'number_of_branches', 'target_markets', 'linkedin_url']
  },

  B2B_HEALTHCARE: {
    id: 'b2b_healthcare',
    name: 'Healthcare & Medical',
    category: INDUSTRY_CATEGORIES.B2B,
    description: 'Healthcare providers and medical facilities',
    requiredFields: [
      { key: 'facility_name', label: 'Facility Name', type: 'text', example: 'City General Hospital' },
      { key: 'website', label: 'Website', type: 'url', example: 'www.citygeneral.com' },
      { key: 'email', label: 'Email', type: 'email', example: 'admin@citygeneral.com' },
      { key: 'facility_type', label: 'Facility Type', type: 'text', example: 'Hospital' },
      { key: 'bed_count', label: 'Bed Count', type: 'number', example: '300' },
    ],
    optionalFields: [
      { key: 'phone', label: 'Phone', type: 'phone', example: '+1-555-0987' },
      { key: 'contact_name', label: 'Contact Name', type: 'text', example: 'Dr. Amanda Lee' },
      { key: 'contact_title', label: 'Contact Title', type: 'text', example: 'Chief Medical Officer' },
      { key: 'specialties', label: 'Specialties', type: 'text', example: 'Cardiology, Oncology, Pediatrics' },
      { key: 'patient_volume', label: 'Annual Patient Volume', type: 'number', example: '50000' },
      { key: 'emr_system', label: 'EMR System', type: 'text', example: 'Epic' },
      { key: 'location', label: 'Location', type: 'text', example: 'Boston, MA' },
      { key: 'hipaa_compliance', label: 'HIPAA Compliance', type: 'boolean', example: 'Yes' },
    ],
    columnOrder: ['facility_name', 'website', 'email', 'phone', 'facility_type', 'bed_count', 'contact_name', 'contact_title', 'specialties', 'patient_volume', 'emr_system', 'location', 'hipaa_compliance']
  },

  // B2C Industries
  B2C_ECOMMERCE: {
    id: 'b2c_ecommerce',
    name: 'E-commerce & Retail',
    category: INDUSTRY_CATEGORIES.B2C,
    description: 'Direct-to-consumer online retail',
    requiredFields: [
      { key: 'first_name', label: 'First Name', type: 'text', example: 'Jane' },
      { key: 'last_name', label: 'Last Name', type: 'text', example: 'Doe' },
      { key: 'email', label: 'Email', type: 'email', example: 'jane.doe@email.com' },
      { key: 'phone', label: 'Phone', type: 'phone', example: '+1-555-1234' },
    ],
    optionalFields: [
      { key: 'shipping_address', label: 'Shipping Address', type: 'text', example: '123 Main St, Apt 4B' },
      { key: 'city', label: 'City', type: 'text', example: 'Los Angeles' },
      { key: 'state', label: 'State', type: 'text', example: 'CA' },
      { key: 'zip_code', label: 'ZIP Code', type: 'text', example: '90001' },
      { key: 'country', label: 'Country', type: 'text', example: 'United States' },
      { key: 'customer_since', label: 'Customer Since', type: 'date', example: '2023-01-15' },
      { key: 'lifetime_value', label: 'Lifetime Value', type: 'currency', example: '1500' },
      { key: 'order_count', label: 'Order Count', type: 'number', example: '12' },
      { key: 'preferred_category', label: 'Preferred Category', type: 'text', example: 'Electronics' },
      { key: 'acquisition_source', label: 'Acquisition Source', type: 'text', example: 'Facebook Ads' },
    ],
    columnOrder: ['first_name', 'last_name', 'email', 'phone', 'shipping_address', 'city', 'state', 'zip_code', 'country', 'customer_since', 'lifetime_value', 'order_count', 'preferred_category', 'acquisition_source']
  },

  B2C_REAL_ESTATE: {
    id: 'b2c_real_estate',
    name: 'Real Estate',
    category: INDUSTRY_CATEGORIES.B2C,
    description: 'Residential real estate buyers and sellers',
    requiredFields: [
      { key: 'first_name', label: 'First Name', type: 'text', example: 'Michael' },
      { key: 'last_name', label: 'Last Name', type: 'text', example: 'Thompson' },
      { key: 'email', label: 'Email', type: 'email', example: 'michael.t@email.com' },
      { key: 'phone', label: 'Phone', type: 'phone', example: '+1-555-5678' },
      { key: 'interest_type', label: 'Interest Type', type: 'text', example: 'Buying' },
    ],
    optionalFields: [
      { key: 'property_type', label: 'Property Type', type: 'text', example: 'Single Family Home' },
      { key: 'budget_range', label: 'Budget Range', type: 'text', example: '$400k-$600k' },
      { key: 'preferred_locations', label: 'Preferred Locations', type: 'text', example: 'Austin, Round Rock' },
      { key: 'bedrooms', label: 'Bedrooms', type: 'number', example: '3' },
      { key: 'bathrooms', label: 'Bathrooms', type: 'number', example: '2' },
      { key: 'timeline', label: 'Timeline', type: 'text', example: '3-6 months' },
      { key: 'pre_approved', label: 'Pre-Approved', type: 'boolean', example: 'Yes' },
      { key: 'current_situation', label: 'Current Situation', type: 'text', example: 'Renting' },
      { key: 'referral_source', label: 'Referral Source', type: 'text', example: 'Zillow' },
    ],
    columnOrder: ['first_name', 'last_name', 'email', 'phone', 'interest_type', 'property_type', 'budget_range', 'preferred_locations', 'bedrooms', 'bathrooms', 'timeline', 'pre_approved', 'current_situation', 'referral_source']
  },

  B2C_FITNESS: {
    id: 'b2c_fitness',
    name: 'Fitness & Wellness',
    category: INDUSTRY_CATEGORIES.B2C,
    description: 'Gym memberships, personal training, wellness services',
    requiredFields: [
      { key: 'first_name', label: 'First Name', type: 'text', example: 'Emily' },
      { key: 'last_name', label: 'Last Name', type: 'text', example: 'Rodriguez' },
      { key: 'email', label: 'Email', type: 'email', example: 'emily.r@email.com' },
      { key: 'phone', label: 'Phone', type: 'phone', example: '+1-555-9012' },
    ],
    optionalFields: [
      { key: 'age', label: 'Age', type: 'number', example: '32' },
      { key: 'fitness_goals', label: 'Fitness Goals', type: 'text', example: 'Weight loss, Strength training' },
      { key: 'membership_type', label: 'Membership Type', type: 'text', example: 'Premium' },
      { key: 'preferred_classes', label: 'Preferred Classes', type: 'text', example: 'Yoga, HIIT' },
      { key: 'emergency_contact', label: 'Emergency Contact', type: 'text', example: 'John Rodriguez - 555-9013' },
      { key: 'medical_conditions', label: 'Medical Conditions', type: 'text', example: 'None' },
      { key: 'preferred_schedule', label: 'Preferred Schedule', type: 'text', example: 'Mornings, Weekends' },
      { key: 'join_date', label: 'Join Date', type: 'date', example: '2024-01-10' },
    ],
    columnOrder: ['first_name', 'last_name', 'email', 'phone', 'age', 'fitness_goals', 'membership_type', 'preferred_classes', 'emergency_contact', 'medical_conditions', 'preferred_schedule', 'join_date']
  },

  B2C_EDUCATION: {
    id: 'b2c_education',
    name: 'Education & Courses',
    category: INDUSTRY_CATEGORIES.B2C,
    description: 'Educational programs, online courses, training',
    requiredFields: [
      { key: 'first_name', label: 'First Name', type: 'text', example: 'David' },
      { key: 'last_name', label: 'Last Name', type: 'text', example: 'Kim' },
      { key: 'email', label: 'Email', type: 'email', example: 'david.kim@email.com' },
      { key: 'phone', label: 'Phone', type: 'phone', example: '+1-555-3456' },
    ],
    optionalFields: [
      { key: 'age', label: 'Age', type: 'number', example: '28' },
      { key: 'education_level', label: 'Education Level', type: 'text', example: "Bachelor's Degree" },
      { key: 'course_interest', label: 'Course Interest', type: 'text', example: 'Data Science' },
      { key: 'career_goals', label: 'Career Goals', type: 'text', example: 'Transition to tech industry' },
      { key: 'current_occupation', label: 'Current Occupation', type: 'text', example: 'Marketing Manager' },
      { key: 'budget', label: 'Budget', type: 'currency', example: '5000' },
      { key: 'preferred_format', label: 'Preferred Format', type: 'text', example: 'Online, Self-paced' },
      { key: 'timezone', label: 'Timezone', type: 'text', example: 'PST' },
      { key: 'referral_source', label: 'Referral Source', type: 'text', example: 'LinkedIn Ad' },
    ],
    columnOrder: ['first_name', 'last_name', 'email', 'phone', 'age', 'education_level', 'course_interest', 'career_goals', 'current_occupation', 'budget', 'preferred_format', 'timezone', 'referral_source']
  },

  B2C_INSURANCE: {
    id: 'b2c_insurance',
    name: 'Insurance',
    category: INDUSTRY_CATEGORIES.B2C,
    description: 'Individual insurance policies',
    requiredFields: [
      { key: 'first_name', label: 'First Name', type: 'text', example: 'Sarah' },
      { key: 'last_name', label: 'Last Name', type: 'text', example: 'Anderson' },
      { key: 'email', label: 'Email', type: 'email', example: 'sarah.a@email.com' },
      { key: 'phone', label: 'Phone', type: 'phone', example: '+1-555-7890' },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date', example: '1985-06-15' },
    ],
    optionalFields: [
      { key: 'policy_type_interest', label: 'Policy Type Interest', type: 'text', example: 'Auto, Home' },
      { key: 'current_insurer', label: 'Current Insurer', type: 'text', example: 'State Farm' },
      { key: 'policy_renewal_date', label: 'Policy Renewal Date', type: 'date', example: '2024-08-01' },
      { key: 'address', label: 'Address', type: 'text', example: '789 Oak Avenue' },
      { key: 'city', label: 'City', type: 'text', example: 'Denver' },
      { key: 'state', label: 'State', type: 'text', example: 'CO' },
      { key: 'zip_code', label: 'ZIP Code', type: 'text', example: '80202' },
      { key: 'marital_status', label: 'Marital Status', type: 'text', example: 'Married' },
      { key: 'dependents', label: 'Number of Dependents', type: 'number', example: '2' },
      { key: 'coverage_needs', label: 'Coverage Needs', type: 'text', example: 'Comprehensive coverage' },
    ],
    columnOrder: ['first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'policy_type_interest', 'current_insurer', 'policy_renewal_date', 'address', 'city', 'state', 'zip_code', 'marital_status', 'dependents', 'coverage_needs']
  },

  B2C_AUTOMOTIVE: {
    id: 'b2c_automotive',
    name: 'Automotive Sales',
    category: INDUSTRY_CATEGORIES.B2C,
    description: 'Car dealerships and automotive sales',
    requiredFields: [
      { key: 'first_name', label: 'First Name', type: 'text', example: 'Tom' },
      { key: 'last_name', label: 'Last Name', type: 'text', example: 'Wilson' },
      { key: 'email', label: 'Email', type: 'email', example: 'tom.w@email.com' },
      { key: 'phone', label: 'Phone', type: 'phone', example: '+1-555-2468' },
    ],
    optionalFields: [
      { key: 'vehicle_interest', label: 'Vehicle Interest', type: 'text', example: 'SUV' },
      { key: 'preferred_make', label: 'Preferred Make', type: 'text', example: 'Toyota' },
      { key: 'preferred_model', label: 'Preferred Model', type: 'text', example: 'RAV4' },
      { key: 'budget_range', label: 'Budget Range', type: 'text', example: '$30k-$40k' },
      { key: 'purchase_timeline', label: 'Purchase Timeline', type: 'text', example: '1-3 months' },
      { key: 'trade_in_vehicle', label: 'Trade-in Vehicle', type: 'text', example: '2018 Honda Civic' },
      { key: 'trade_in_value', label: 'Estimated Trade-in Value', type: 'currency', example: '15000' },
      { key: 'financing_needed', label: 'Financing Needed', type: 'boolean', example: 'Yes' },
      { key: 'credit_score_range', label: 'Credit Score Range', type: 'text', example: '700-750' },
      { key: 'preferred_color', label: 'Preferred Color', type: 'text', example: 'Blue, Silver' },
    ],
    columnOrder: ['first_name', 'last_name', 'email', 'phone', 'vehicle_interest', 'preferred_make', 'preferred_model', 'budget_range', 'purchase_timeline', 'trade_in_vehicle', 'trade_in_value', 'financing_needed', 'credit_score_range', 'preferred_color']
  },
};

// Helper function to get all industries by category
export const getIndustriesByCategory = (category) => {
  return Object.values(INDUSTRIES).filter(industry => industry.category === category);
};

// Helper function to get industry by ID
export const getIndustryById = (industryId) => {
  return Object.values(INDUSTRIES).find(industry => industry.id === industryId);
};

// Helper function to get all fields for an industry
export const getAllFields = (industryId) => {
  const industry = getIndustryById(industryId);
  if (!industry) return [];
  return [...industry.requiredFields, ...industry.optionalFields];
};

// Helper function to validate lead data against industry requirements
export const validateLeadData = (industryId, leadData) => {
  const industry = getIndustryById(industryId);
  if (!industry) {
    return { valid: false, errors: ['Invalid industry ID'] };
  }

  const errors = [];

  // Check required fields
  industry.requiredFields.forEach(field => {
    if (!leadData[field.key] || leadData[field.key].trim() === '') {
      errors.push(`${field.label} is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

// Generate CSV template for an industry
export const generateCsvTemplate = (industryId) => {
  const industry = getIndustryById(industryId);
  if (!industry) return null;

  const headers = industry.columnOrder.map(key => {
    const field = [...industry.requiredFields, ...industry.optionalFields].find(f => f.key === key);
    return field ? field.label : key;
  });

  const exampleRow = industry.columnOrder.map(key => {
    const field = [...industry.requiredFields, ...industry.optionalFields].find(f => f.key === key);
    return field ? field.example : '';
  });

  return {
    headers,
    exampleRow,
    columnOrder: industry.columnOrder
  };
};

export default {
  INDUSTRY_CATEGORIES,
  INDUSTRIES,
  getIndustriesByCategory,
  getIndustryById,
  getAllFields,
  validateLeadData,
  generateCsvTemplate
};
