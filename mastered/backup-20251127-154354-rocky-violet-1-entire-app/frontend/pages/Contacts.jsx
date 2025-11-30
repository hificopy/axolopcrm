import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FullPageLoader } from "../components/ui/loading-states";
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit3,
  Trash2,
  User,
  Mail,
  Phone,
  Building2,
  Tag,
  Calendar,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import CreateContactModal from "../components/CreateContactModal";
import FilterModal from "../components/FilterModal";
import { contactsApi } from "../lib/api";
import { useToast } from "../components/ui/use-toast";
import { InfoTooltipInline } from "../components/ui/info-tooltip";
import { useAgency } from "../hooks/useAgency";
import ViewOnlyBadge from "../components/ui/view-only-badge";
import { MondayTable } from "../components/MondayTable";
import {
  LeadTableSkeleton,
  StatsCardSkeleton,
} from "../components/ui/skeletons";

const Contacts = () => {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const { toast } = useToast();
  const { isReadOnly, canEdit, canCreate } = useAgency();

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await contactsApi.getAll();
      setContacts(response.data);
      setFilteredContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);

      // Handle specific error types
      let errorMessage = "Failed to load contacts.";
      if (
        error?.error === "Unauthorized" ||
        error?.message?.includes("Authentication")
      ) {
        errorMessage = "Please sign in to access your contacts.";
      } else if (error?.error === "Network Error") {
        errorMessage =
          "Network connection failed. Please check your internet connection.";
      } else if (error?.status === 401) {
        errorMessage = "Your session has expired. Please sign in again.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]); // State setters are stable

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Filter contacts based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredContacts(contacts);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = contacts.filter(
        (contact) =>
          (contact.first_name?.toLowerCase() || "").includes(searchLower) ||
          (contact.last_name?.toLowerCase() || "").includes(searchLower) ||
          (contact.email?.toLowerCase() || "").includes(searchLower) ||
          (contact.title?.toLowerCase() || "").includes(searchLower),
      );
      setFilteredContacts(filtered);
    }
  }, [searchTerm, contacts]);

  const handleContactSelect = async (contactId) => {
    try {
      const response = await contactsApi.getById(contactId);
      setSelectedContact(response.data);
    } catch (error) {
      console.error("Error fetching contact details:", error);
      toast({
        title: "Error",
        description: "Failed to load contact details.",
        variant: "destructive",
      });
    }
  };

  const handleCreateContact = () => {
    setIsCreateModalOpen(true);
  };

  const handleContactCreated = (newContact) => {
    setContacts((prevContacts) => [newContact, ...prevContacts]);
    setFilteredContacts((prevContacts) => [newContact, ...prevContacts]);
    setIsCreateModalOpen(false);
    toast({
      title: "Contact Created",
      description: "New contact has been added successfully.",
    });
  };

  const handleFilter = () => {
    setIsFilterModalOpen(true);
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);

    let filtered = [...contacts];

    // Apply company filter
    if (filters.hasCompany === "yes") {
      filtered = filtered.filter(
        (contact) => contact.company && contact.company.trim() !== "",
      );
    } else if (filters.hasCompany === "no") {
      filtered = filtered.filter(
        (contact) => !contact.company || contact.company.trim() === "",
      );
    }

    // Apply title filter
    if (filters.hasTitle === "yes") {
      filtered = filtered.filter(
        (contact) => contact.title && contact.title.trim() !== "",
      );
    } else if (filters.hasTitle === "no") {
      filtered = filtered.filter(
        (contact) => !contact.title || contact.title.trim() === "",
      );
    }

    // Apply date range filters
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (contact) => new Date(contact.created_at) >= new Date(filters.dateFrom),
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (contact) =>
          new Date(contact.created_at) <=
          new Date(filters.dateTo + "T23:59:59"),
      );
    }

    setFilteredContacts(filtered);

    // Show toast with filter results
    const activeFilterCount = Object.keys(filters).filter(
      (key) => filters[key],
    ).length;
    if (activeFilterCount > 0) {
      toast({
        title: "Filters Applied",
        description: `Showing ${filtered.length} of ${contacts.length} contacts with ${activeFilterCount} filter(s) active.`,
      });
    }
  };

  const handleExport = () => {
    try {
      const csvHeaders = [
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Company",
        "Title",
        "Created",
      ];
      const csvRows = contacts.map((contact) => [
        contact.first_name,
        contact.last_name,
        contact.email,
        contact.phone || "",
        contact.company || "",
        contact.title || "",
        formatDate(contact.created_at),
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `contacts-export-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${contacts.length} contacts to CSV.`,
      });
    } catch (error) {
      console.error("Error exporting contacts:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export contacts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : "N/A";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Handle cell edit
  const handleCellEdit = async (contactId, columnKey, value) => {
    try {
      await contactsApi.update(contactId, { [columnKey]: value });

      // Update local state
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === contactId
            ? { ...contact, [columnKey]: value }
            : contact,
        ),
      );
      setFilteredContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === contactId
            ? { ...contact, [columnKey]: value }
            : contact,
        ),
      );

      toast({
        title: "Updated",
        description: "Contact updated successfully.",
      });
    } catch (error) {
      console.error("Error updating contact:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Monday table columns configuration
  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        type: "text",
        editable: false,
        width: 200,
      },
      {
        key: "email",
        label: "Email",
        type: "text",
        editable: true,
        width: 220,
      },
      {
        key: "phone",
        label: "Phone",
        type: "text",
        editable: true,
        width: 150,
      },
      {
        key: "company",
        label: "Company",
        type: "text",
        editable: true,
        width: 180,
      },
      {
        key: "title",
        label: "Title",
        type: "text",
        editable: true,
        width: 160,
      },
      {
        key: "created_at",
        label: "Created",
        type: "date",
        editable: false,
        width: 140,
      },
    ],
    [],
  );

  // Transform contacts data for Monday table
  const tableData = useMemo(() => {
    return filteredContacts.map((contact) => ({
      id: contact.id,
      name: `${contact.first_name} ${contact.last_name}`,
      email: contact.email,
      phone: contact.phone,
      company: contact.leads?.name || contact.company || "No Company",
      title: contact.title || "No Title",
      created_at: contact.created_at,
      _original: contact,
    }));
  }, [filteredContacts]);

  // Define groups for company-based grouping
  const contactGroups = useMemo(
    () => [
      {
        key: "with-company",
        label: "With Company",
        color: "#3F0D28",
        filter: (contact) =>
          contact.company && contact.company !== "No Company",
      },
      {
        key: "no-company",
        label: "No Company",
        color: "#c4c4c4",
        filter: (contact) =>
          !contact.company || contact.company === "No Company",
      },
    ],
    [],
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Contacts
                <span className="ml-3 text-[#3F0D28]">●</span>
              </h1>
              {isReadOnly() && <ViewOnlyBadge />}
            </div>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              {isReadOnly()
                ? "View business contacts - Read-only access"
                : "Manage and track your business contacts with powerful search"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
              Total Contacts
              <InfoTooltipInline content="All contacts in your database" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {contacts.length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#1A777B]/5 to-[#1A777B]/10 rounded-xl p-5 border border-[#1A777B]/20 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-[#1A777B] uppercase tracking-wide flex items-center">
              Active This Month
              <InfoTooltipInline content="Contacts you've interacted with this month" />
            </div>
            <div className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
              {contacts.length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#3F0D28]/5 to-[#3F0D28]/10 rounded-xl p-5 border border-[#3F0D28]/20 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-[#3F0D28] uppercase tracking-wide flex items-center">
              Companies
              <InfoTooltipInline content="Number of unique companies represented" />
            </div>
            <div className="text-3xl font-bold text-[#3F0D28] mt-2">
              {
                [...new Set(contacts.map((c) => c.lead_id))].filter(Boolean)
                  .length
              }
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#3F0D28]/5 to-[#3F0D28]/10 rounded-xl p-5 border border-[#3F0D28]/30 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-[#3F0D28] uppercase tracking-wide flex items-center">
              With Titles
              <InfoTooltipInline content="Contacts with job titles specified" />
            </div>
            <div className="text-3xl font-bold text-[#3F0D28] mt-2">
              {contacts.filter((c) => c.title).length}
            </div>
          </div>
        </div>
      </div>

      {/* Monday Table */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
        {loading ? (
          <div className="animate-fadeIn">
            <LeadTableSkeleton rows={8} />
          </div>
        ) : (
          <div className="animate-fadeIn">
            <MondayTable
              data={tableData}
              columns={columns}
              groups={contactGroups}
              onAddItem={canCreate() ? handleCreateContact : undefined}
              onRowClick={(row) => handleContactSelect(row._original.id)}
              onCellEdit={canEdit() ? handleCellEdit : undefined}
              onExport={handleExport}
              searchPlaceholder="Search contacts..."
              newItemLabel="New Contact"
              enableSearch={true}
              enableGroups={true}
              enablePlaceholderRows={!isReadOnly()}
              placeholderRowCount={3}
            />
          </div>
        )}
      </div>

      {/* Contact Detail Panel (Right Sidebar) - Added pt-20 to avoid Chat/Tasks buttons overlap */}
      {selectedContact && (
        <div className="fixed inset-0 sm:right-0 sm:left-auto sm:top-16 sm:bottom-0 w-full sm:w-96 bg-white dark:bg-[#1a1d24] border-l border-crm-border shadow-lg z-50 overflow-y-auto">
          <div className="p-6 pt-20">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-2xl">
                  {selectedContact.first_name?.charAt(0)}
                  {selectedContact.last_name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedContact.first_name} {selectedContact.last_name}
                  </h2>
                  <p className="text-sm text-crm-text-secondary">
                    {selectedContact.title}
                  </p>
                  {selectedContact.leads?.name && (
                    <p className="text-sm text-crm-text-secondary">
                      Company: {selectedContact.leads.name}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedContact(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">
                      Email
                    </span>
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {selectedContact.email}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">
                      Phone
                    </span>
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {selectedContact.phone}
                    </a>
                  </div>
                </div>
              </div>

              {selectedContact.leads?.name && (
                <div>
                  <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                    Associated Lead
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-crm-text-secondary">
                        Lead Name
                      </span>
                      <span className="text-sm">
                        {selectedContact.leads.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-crm-text-secondary">
                        Primary Contact
                      </span>
                      <span className="text-sm">
                        {selectedContact.is_primary_contact ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                  Engagement
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">
                      Created At
                    </span>
                    <span className="text-sm">
                      {formatDate(selectedContact.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-crm-text-secondary">
                      Updated At
                    </span>
                    <span className="text-sm">
                      {formatDate(selectedContact.updated_at)}
                    </span>
                  </div>
                </div>
              </div>

              {Object.keys(selectedContact.custom_fields || {}).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-crm-text-secondary uppercase mb-3">
                    Custom Fields
                  </h3>
                  {Object.entries(selectedContact.custom_fields).map(
                    ([key, value]) => (
                      <div key={key} className="mt-1 text-sm">
                        <span className="font-medium capitalize">
                          {key.replace(/_/g, " ")}:
                        </span>{" "}
                        {value}
                      </div>
                    ),
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="default"
                  className="min-w-[40px] flex-1 sm:flex-none"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  className="min-w-[40px] flex-1 sm:flex-none"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Contact Modal */}
      <CreateContactModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onContactCreated={handleContactCreated}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={applyFilters}
        filterType="contacts"
        currentFilters={activeFilters}
      />
    </div>
  );
};

export default Contacts;
