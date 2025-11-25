import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "./ui/use-toast";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { Badge } from "./ui/badge";
import api from "@/lib/api";

// Industry mappings (matching backend configuration)
const INDUSTRY_CATEGORIES = {
  B2B: "B2B",
  B2C: "B2C",
};

const INDUSTRIES = {
  B2B_SAAS: {
    id: "b2b_saas",
    name: "B2B SaaS",
    category: "B2B",
    requiredFields: [
      "company_name",
      "website",
      "email",
      "industry",
      "company_size",
    ],
    optionalFields: [
      "phone",
      "linkedin_url",
      "contact_name",
      "contact_title",
      "tech_stack",
      "annual_revenue",
      "funding_stage",
      "location",
      "country",
    ],
  },
  B2B_ENTERPRISE_SOFTWARE: {
    id: "b2b_enterprise_software",
    name: "Enterprise Software",
    category: "B2B",
    requiredFields: [
      "company_name",
      "website",
      "email",
      "industry",
      "company_size",
      "decision_maker_name",
      "decision_maker_title",
    ],
    optionalFields: [
      "phone",
      "linkedin_url",
      "it_budget",
      "current_vendors",
      "contract_end_date",
      "pain_points",
      "headquarters",
      "num_locations",
    ],
  },
  B2B_CONSULTING: {
    id: "b2b_consulting",
    name: "Consulting Services",
    category: "B2B",
    requiredFields: [
      "company_name",
      "website",
      "email",
      "industry_focus",
      "company_size",
    ],
    optionalFields: [
      "phone",
      "contact_name",
      "contact_title",
      "linkedin_url",
      "service_types",
      "project_budget_range",
      "location",
      "referral_source",
    ],
  },
  B2B_MANUFACTURING: {
    id: "b2b_manufacturing",
    name: "Manufacturing & Distribution",
    category: "B2B",
    requiredFields: [
      "company_name",
      "website",
      "email",
      "product_category",
      "company_size",
    ],
    optionalFields: [
      "phone",
      "contact_name",
      "contact_title",
      "annual_production_volume",
      "certifications",
      "facility_locations",
      "order_frequency",
      "average_order_value",
    ],
  },
  B2B_FINANCIAL_SERVICES: {
    id: "b2b_financial_services",
    name: "Financial Services",
    category: "B2B",
    requiredFields: [
      "company_name",
      "website",
      "email",
      "institution_type",
      "assets_under_management",
    ],
    optionalFields: [
      "phone",
      "contact_name",
      "contact_title",
      "regulatory_compliance",
      "number_of_branches",
      "target_markets",
      "linkedin_url",
    ],
  },
  B2B_HEALTHCARE: {
    id: "b2b_healthcare",
    name: "Healthcare & Medical",
    category: "B2B",
    requiredFields: [
      "facility_name",
      "website",
      "email",
      "facility_type",
      "bed_count",
    ],
    optionalFields: [
      "phone",
      "contact_name",
      "contact_title",
      "specialties",
      "patient_volume",
      "emr_system",
      "location",
      "hipaa_compliance",
    ],
  },
  B2C_ECOMMERCE: {
    id: "b2c_ecommerce",
    name: "E-commerce & Retail",
    category: "B2C",
    requiredFields: ["first_name", "last_name", "email", "phone"],
    optionalFields: [
      "shipping_address",
      "city",
      "state",
      "zip_code",
      "country",
      "customer_since",
      "lifetime_value",
      "order_count",
      "preferred_category",
      "acquisition_source",
    ],
  },
  B2C_REAL_ESTATE: {
    id: "b2c_real_estate",
    name: "Real Estate",
    category: "B2C",
    requiredFields: [
      "first_name",
      "last_name",
      "email",
      "phone",
      "interest_type",
    ],
    optionalFields: [
      "property_type",
      "budget_range",
      "preferred_locations",
      "bedrooms",
      "bathrooms",
      "timeline",
      "pre_approved",
      "current_situation",
      "referral_source",
    ],
  },
  B2C_FITNESS: {
    id: "b2c_fitness",
    name: "Fitness & Wellness",
    category: "B2C",
    requiredFields: ["first_name", "last_name", "email", "phone"],
    optionalFields: [
      "age",
      "fitness_goals",
      "membership_type",
      "preferred_classes",
      "emergency_contact",
      "medical_conditions",
      "preferred_schedule",
      "join_date",
    ],
  },
  B2C_EDUCATION: {
    id: "b2c_education",
    name: "Education & Courses",
    category: "B2C",
    requiredFields: ["first_name", "last_name", "email", "phone"],
    optionalFields: [
      "age",
      "education_level",
      "course_interest",
      "career_goals",
      "current_occupation",
      "budget",
      "preferred_format",
      "timezone",
      "referral_source",
    ],
  },
  B2C_INSURANCE: {
    id: "b2c_insurance",
    name: "Insurance",
    category: "B2C",
    requiredFields: [
      "first_name",
      "last_name",
      "email",
      "phone",
      "date_of_birth",
    ],
    optionalFields: [
      "policy_type_interest",
      "current_insurer",
      "policy_renewal_date",
      "address",
      "city",
      "state",
      "zip_code",
      "marital_status",
      "dependents",
      "coverage_needs",
    ],
  },
  B2C_AUTOMOTIVE: {
    id: "b2c_automotive",
    name: "Automotive Sales",
    category: "B2C",
    requiredFields: ["first_name", "last_name", "email", "phone"],
    optionalFields: [
      "vehicle_interest",
      "preferred_make",
      "preferred_model",
      "budget_range",
      "purchase_timeline",
      "trade_in_vehicle",
      "trade_in_value",
      "financing_needed",
      "credit_score_range",
      "preferred_color",
    ],
  },
};

const EnhancedLeadImportModal = ({ isOpen, onClose, onLeadsImported }) => {
  const [step, setStep] = useState(1); // 1: Industry Selection, 2: Upload & Map, 3: Review & Import, 4: Success
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [importResults, setImportResults] = useState(null);
  const { toast } = useToast();

  const currentIndustry = selectedIndustry
    ? INDUSTRIES[selectedIndustry]
    : null;

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedCategory("");
      setSelectedIndustry("");
      setCsvFile(null);
      setCsvHeaders([]);
      setColumnMapping({});
      setValidationErrors([]);
    }
  }, [isOpen]);

  // Get industries by category
  const getIndustriesByCategory = (category) => {
    return Object.values(INDUSTRIES).filter(
      (industry) => industry.category === category,
    );
  };

  // Handle file upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      parseCsvHeaders(file);
    } else {
      setCsvFile(null);
      setCsvHeaders([]);
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
    }
  };

  // Parse CSV headers
  const parseCsvHeaders = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n");
      if (lines.length > 0) {
        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/"/g, ""));
        setCsvHeaders(headers);
        autoMapColumns(headers);
      }
    };
    reader.readAsText(file);
  };

  // Auto-map columns based on header names
  const autoMapColumns = (headers) => {
    if (!currentIndustry) return;

    const mapping = {};
    const allFields = [
      ...currentIndustry.requiredFields,
      ...currentIndustry.optionalFields,
    ];

    headers.forEach((header) => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const matchedField = allFields.find(
        (field) =>
          field.toLowerCase().replace(/[^a-z0-9]/g, "_") === normalizedHeader ||
          field.toLowerCase().includes(normalizedHeader) ||
          normalizedHeader.includes(field.toLowerCase()),
      );
      if (matchedField) {
        mapping[header] = matchedField;
      }
    });

    setColumnMapping(mapping);
  };

  // Handle column mapping change
  const handleColumnMappingChange = (csvHeader, crmField) => {
    setColumnMapping((prev) => ({ ...prev, [csvHeader]: crmField }));
  };

  // Validate mapping
  const validateMapping = () => {
    if (!currentIndustry) return false;

    const errors = [];
    const mappedFields = Object.values(columnMapping).filter((v) => v);

    // Check if all required fields are mapped
    currentIndustry.requiredFields.forEach((field) => {
      if (!mappedFields.includes(field)) {
        errors.push(
          `Required field "${field.replace(/_/g, " ")}" is not mapped`,
        );
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Download template
  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get(
        `/api/leads/industry-template/${selectedIndustry}`,
        { responseType: "blob" },
      );

      const blob = new Blob([response.data], { type: "text/csv" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${currentIndustry.name.replace(/\s+/g, "_")}_template.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Template Downloaded",
        description: `${currentIndustry.name} template downloaded successfully.`,
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download template. Creating local version...",
        variant: "destructive",
      });

      // Fallback: create template locally
      createLocalTemplate();
    }
  };

  // Create template locally if API fails
  const createLocalTemplate = () => {
    if (!currentIndustry) return;

    const allFields = [
      ...currentIndustry.requiredFields,
      ...currentIndustry.optionalFields,
    ];
    const headers = allFields.map((field) =>
      field
        .replace(/_/g, " ")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    );
    const csvContent = headers.join(",");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${currentIndustry.name.replace(/\s+/g, "_")}_template.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle import
  const handleImport = async () => {
    if (!validateMapping()) {
      toast({
        title: "Validation Failed",
        description: "Please map all required fields before importing.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("csvFile", csvFile);
      formData.append("mapping", JSON.stringify(columnMapping));
      formData.append("industryId", selectedIndustry);

      const response = await api.post("/api/leads/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setImportResults(response.data);
      setStep(4); // Move to success step

      if (onLeadsImported) {
        onLeadsImported(response.data.leads);
      }
    } catch (error) {
      console.error("Error importing leads:", error);
      toast({
        title: "Import Failed",
        description:
          error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render industry diagram
  const renderIndustryDiagram = () => {
    if (!currentIndustry) return null;

    const allFields = [
      ...currentIndustry.requiredFields,
      ...currentIndustry.optionalFields,
    ];

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">
              {currentIndustry.name} - Spreadsheet Format
            </h3>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {/* Headers */}
            <div className="grid grid-cols-12 gap-px bg-gray-200">
              {allFields.slice(0, 12).map((field, index) => {
                const isRequired =
                  currentIndustry.requiredFields.includes(field);
                return (
                  <div
                    key={index}
                    className={`px-3 py-3 text-xs font-bold text-center ${
                      isRequired
                        ? "bg-red-100 text-red-900"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {isRequired && <AlertCircle className="h-3 w-3" />}
                      <span className="truncate w-full">
                        {field
                          .replace(/_/g, " ")
                          .split(" ")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Example Row */}
            <div className="grid grid-cols-12 gap-px bg-gray-100">
              {allFields.slice(0, 12).map((field, index) => (
                <div
                  key={index}
                  className="px-3 py-3 bg-white text-xs text-gray-600 text-center truncate"
                >
                  Example...
                </div>
              ))}
            </div>

            {allFields.length > 12 && (
              <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 text-center border-t">
                + {allFields.length - 12} more columns...
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded flex items-center justify-center">
                <AlertCircle className="h-3 w-3 text-red-900" />
              </div>
              <span className="text-gray-700 font-medium">
                Required Fields ({currentIndustry.requiredFields.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded"></div>
              <span className="text-gray-700 font-medium">
                Optional Fields ({currentIndustry.optionalFields.length})
              </span>
            </div>
          </div>

          {/* Field List */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-sm text-red-900 mb-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Required Fields
              </h4>
              <ul className="space-y-1">
                {currentIndustry.requiredFields.map((field, index) => (
                  <li
                    key={index}
                    className="text-xs text-gray-700 flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-3 w-3 text-red-600" />
                    {field
                      .replace(/_/g, " ")
                      .split(" ")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-1">
                <Info className="h-4 w-4" />
                Optional Fields
              </h4>
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {currentIndustry.optionalFields.map((field, index) => (
                  <li
                    key={index}
                    className="text-xs text-gray-600 flex items-center gap-2"
                  >
                    <div className="h-3 w-3 border border-gray-400 rounded-full"></div>
                    {field
                      .replace(/_/g, " ")
                      .split(" ")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Button
          onClick={handleDownloadTemplate}
          variant="outline"
          className="w-full gap-2"
        >
          <Download className="h-4 w-4" />
          Download {currentIndustry.name} Template
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Import Leads - Industry-Specific
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={step === 1 ? "default" : "outline"}>
              Step 1: Industry
            </Badge>
            <Badge variant={step === 2 ? "default" : "outline"}>
              Step 2: Upload & Map
            </Badge>
            <Badge variant={step === 3 ? "default" : "outline"}>
              Step 3: Review
            </Badge>
            <Badge variant={step === 4 ? "default" : "outline"}>
              Step 4: Success
            </Badge>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Step 1: Industry Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-bold mb-3 block">
                  Select Business Type
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedCategory(INDUSTRY_CATEGORIES.B2B)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      selectedCategory === INDUSTRY_CATEGORIES.B2B
                        ? "border-[#761B14] bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <h3 className="text-xl font-bold mb-2">B2B</h3>
                    <p className="text-sm text-gray-600">
                      Business to Business
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Companies, Organizations, Enterprises
                    </p>
                  </button>
                  <button
                    onClick={() => setSelectedCategory(INDUSTRY_CATEGORIES.B2C)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      selectedCategory === INDUSTRY_CATEGORIES.B2C
                        ? "border-[#761B14] bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <h3 className="text-xl font-bold mb-2">B2C</h3>
                    <p className="text-sm text-gray-600">
                      Business to Consumer
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Individual Customers, End Users
                    </p>
                  </button>
                </div>
              </div>

              {selectedCategory && (
                <div>
                  <Label
                    htmlFor="industry"
                    className="text-lg font-bold mb-3 block"
                  >
                    Select Industry
                  </Label>
                  <Select
                    value={selectedIndustry}
                    onValueChange={setSelectedIndustry}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue
                        placeholder={`Choose your ${selectedCategory} industry`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getIndustriesByCategory(selectedCategory).map(
                        (industry) => (
                          <SelectItem
                            key={industry.id}
                            value={Object.keys(INDUSTRIES).find(
                              (key) => INDUSTRIES[key].id === industry.id,
                            )}
                          >
                            {industry.name}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentIndustry && (
                <div className="mt-6">{renderIndustryDiagram()}</div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedIndustry}
                  className="bg-[#761B14] hover:bg-[#6b1a12]"
                >
                  Continue to Upload
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Upload & Map */}
          {step === 2 && (
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="mb-4"
              >
                ← Back to Industry Selection
              </Button>

              <div>
                <Label
                  htmlFor="csvFile"
                  className="text-lg font-bold mb-3 block"
                >
                  Upload CSV File
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#761B14] transition-colors">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="max-w-md mx-auto"
                  />
                  {csvFile && (
                    <p className="mt-2 text-sm text-green-600 font-medium">
                      File uploaded: {csvFile.name}
                    </p>
                  )}
                </div>
              </div>

              {csvHeaders.length > 0 && (
                <div>
                  <Label className="text-lg font-bold mb-3 block">
                    Column Mapping
                  </Label>
                  <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4 mb-2 font-bold text-sm">
                      <div>Your CSV Column</div>
                      <div>CRM Field</div>
                    </div>
                    {csvHeaders.map((header, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-2 gap-4 mb-3 items-center"
                      >
                        <div className="font-medium text-sm">{header}</div>
                        <Select
                          value={columnMapping[header] || ""}
                          onValueChange={(value) =>
                            handleColumnMappingChange(header, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Skip Column</SelectItem>
                            <SelectItem
                              value="__divider__"
                              disabled
                              className="font-bold text-red-900"
                            >
                              Required Fields
                            </SelectItem>
                            {currentIndustry.requiredFields.map((field) => (
                              <SelectItem
                                key={field}
                                value={field}
                                className="text-red-900"
                              >
                                {field
                                  .replace(/_/g, " ")
                                  .split(" ")
                                  .map(
                                    (w) =>
                                      w.charAt(0).toUpperCase() + w.slice(1),
                                  )
                                  .join(" ")}
                              </SelectItem>
                            ))}
                            <SelectItem
                              value="__divider2__"
                              disabled
                              className="font-bold text-gray-700"
                            >
                              Optional Fields
                            </SelectItem>
                            {currentIndustry.optionalFields.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field
                                  .replace(/_/g, " ")
                                  .split(" ")
                                  .map(
                                    (w) =>
                                      w.charAt(0).toUpperCase() + w.slice(1),
                                  )
                                  .join(" ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>

                  {validationErrors.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Mapping Errors
                      </h4>
                      <ul className="list-disc list-inside text-sm text-red-800">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (validateMapping()) {
                      setStep(3);
                    }
                  }}
                  disabled={!csvFile || csvHeaders.length === 0}
                  className="bg-[#761B14] hover:bg-[#6b1a12]"
                >
                  Review Import
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={() => setStep(2)}
                className="mb-4"
              >
                ← Back to Mapping
              </Button>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Ready to Import
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Industry:</strong> {currentIndustry.name}
                  </p>
                  <p>
                    <strong>File:</strong> {csvFile?.name}
                  </p>
                  <p>
                    <strong>Mapped Columns:</strong>{" "}
                    {Object.values(columnMapping).filter((v) => v).length}
                  </p>
                  <p>
                    <strong>Required Fields Mapped:</strong>{" "}
                    {
                      currentIndustry.requiredFields.filter((field) =>
                        Object.values(columnMapping).includes(field),
                      ).length
                    }{" "}
                    / {currentIndustry.requiredFields.length}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={isLoading}
                  className="bg-[#761B14] hover:bg-[#6b1a12]"
                >
                  {isLoading ? "Importing..." : "Import Leads"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && importResults && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Import Complete!
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Industry:</strong> {currentIndustry.name}
                  </p>
                  <p>
                    <strong>File:</strong> {csvFile?.name}
                  </p>
                  <p>
                    <strong>Status:</strong> {importResults.count} leads
                    imported successfully
                  </p>
                  {importResults.errors && importResults.errors.length > 0 && (
                    <p className="text-red-600">
                      <strong>Errors:</strong> {importResults.errorCount}{" "}
                      records had issues
                    </p>
                  )}
                </div>
              </div>

              {importResults.errors && importResults.errors.length > 0 && (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-bold text-red-900 mb-2">Import Errors</h4>
                  <div className="max-h-48 overflow-y-auto">
                    <ul className="space-y-1 text-sm text-red-800">
                      {importResults.errors.map((error, index) => (
                        <li key={index}>
                          <span className="font-medium">Row {error.row}:</span>{" "}
                          {error.errors.join(", ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  onClick={() => {
                    setStep(1);
                    setCsvFile(null);
                    setCsvHeaders([]);
                    setColumnMapping({});
                    setValidationErrors([]);
                    setImportResults(null);
                  }}
                  className="bg-[#761B14] hover:bg-[#6b1a12]"
                >
                  Import More Leads
                </Button>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedLeadImportModal;
