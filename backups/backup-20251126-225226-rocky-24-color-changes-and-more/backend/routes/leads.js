import express from "express";
import leadService from "../services/leadService.js";
import { authenticateUser } from "../middleware/auth.js";
import {
  extractAgencyContext,
  requireEditPermissions,
} from "../middleware/agency-access.js";

const router = express.Router();

// Apply agency context extraction to all routes
router.use(extractAgencyContext);

// Get all leads for the authenticated user (filtered by agency if provided)
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.agencyId; // From extractAgencyContext middleware
    const leads = await leadService.getLeads(userId, agencyId);
    res.status(200).json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch leads", error: error.message });
  }
});

// Get a single lead by ID for the authenticated user
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const leadId = req.params.id;
    const agencyId = req.agencyId; // From extractAgencyContext middleware
    const lead = await leadService.getLeadById(userId, leadId, agencyId);
    if (!lead) {
      return res
        .status(404)
        .json({ message: "Lead not found or not authorized" });
    }
    res.status(200).json(lead);
  } catch (error) {
    console.error("Error fetching lead by ID:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch lead", error: error.message });
  }
});

// Create a new lead for the authenticated user
router.post("/", authenticateUser, requireEditPermissions, async (req, res) => {
  try {
    const userId = req.user.id;
    const agencyId = req.agencyId; // From extractAgencyContext middleware
    const newLead = await leadService.createLead(userId, req.body, agencyId);
    res.status(201).json(newLead);
  } catch (error) {
    console.error("Error creating lead:", error);
    res
      .status(500)
      .json({ message: "Failed to create lead", error: error.message });
  }
});

// Update an existing lead for the authenticated user
router.put(
  "/:id",
  authenticateUser,
  requireEditPermissions,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const leadId = req.params.id;
      const agencyId = req.agencyId; // From extractAgencyContext middleware
      const updatedLead = await leadService.updateLead(
        userId,
        leadId,
        req.body,
        agencyId,
      );
      if (!updatedLead) {
        return res
          .status(404)
          .json({ message: "Lead not found or not authorized" });
      }
      res.status(200).json(updatedLead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res
        .status(500)
        .json({ message: "Failed to update lead", error: error.message });
    }
  },
);

// Delete a lead for the authenticated user
router.delete(
  "/:id",
  authenticateUser,
  requireEditPermissions,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const leadId = req.params.id;

      await leadService.deleteLead(userId, leadId);
      res.status(204).send(); // No content for successful deletion
    } catch (error) {
      console.error("Error deleting lead:", error);

      // Handle cascade delete validation errors specifically
      if (
        error.message.includes("Cannot delete") ||
        error.message.includes("dependent records exist")
      ) {
        return res.status(409).json({
          message: "Cannot delete lead",
          error: error.message,
          type: "CASCADE_DELETE_VIOLATION",
        });
      }

      // Handle not found errors
      if (
        error.message.includes("not found") ||
        error.message.includes("not authorized")
      ) {
        return res.status(404).json({
          message: "Lead not found or not authorized",
          error: error.message,
        });
      }

      res.status(500).json({
        message: "Failed to delete lead",
        error: error.message,
      });
    }
  },
);

// Route to upload CSV and import leads (legacy)
router.post(
  "/import",
  authenticateUser,
  requireEditPermissions,
  async (req, res) => {
    try {
      // This will require a file upload middleware like 'multer'
      // For now, let's assume req.file.buffer contains the CSV data
      if (
        !req.files ||
        Object.keys(req.files).length === 0 ||
        !req.files.csvFile
      ) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      const csvBuffer = req.files.csvFile.data; // Assuming 'express-fileupload' or similar
      const userId = req.user.id; // Assuming user ID is available from auth middleware
      const { presetId, mapping, industryId } = req.body; // presetId, dynamic mapping, or industryId

      // Parse mapping if it's a string
      let parsedMapping = mapping;
      if (typeof mapping === "string") {
        try {
          parsedMapping = JSON.parse(mapping);
        } catch (e) {
          return res.status(400).json({ message: "Invalid mapping format" });
        }
      }

      // Use industry-specific import if industryId is provided
      if (industryId) {
        const result = await leadService.importLeadsWithIndustry(
          userId,
          csvBuffer,
          industryId,
          parsedMapping,
        );
        return res.status(200).json({
          message: "Leads imported successfully",
          count: result.successCount,
          leads: result.imported,
          errors: result.errors,
          errorCount: result.errorCount,
        });
      }

      // Fallback to legacy import
      const importedLeads = await leadService.importLeadsFromCsv(
        userId,
        csvBuffer,
        presetId,
        parsedMapping,
      );
      res.status(200).json({
        message: "Leads imported successfully",
        count: importedLeads.length,
        leads: importedLeads,
      });
    } catch (error) {
      console.error("Error importing leads:", error);
      res
        .status(500)
        .json({ message: "Failed to import leads", error: error.message });
    }
  },
);

// Route to get all lead import presets for a user
router.get("/presets", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const presets = await leadService.getLeadImportPresets(userId);
    res.status(200).json(presets);
  } catch (error) {
    console.error("Error fetching presets:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch presets", error: error.message });
  }
});

// Route to create a new lead import preset
router.post(
  "/presets",
  authenticateUser,
  requireEditPermissions,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { presetName, source, mapping } = req.body;
      const newPreset = await leadService.createLeadImportPreset(
        userId,
        presetName,
        source,
        mapping,
      );
      res.status(201).json(newPreset);
    } catch (error) {
      console.error("Error creating preset:", error);
      res
        .status(500)
        .json({ message: "Failed to create preset", error: error.message });
    }
  },
);

// Route to update an existing lead import preset
router.put(
  "/presets/:id",
  authenticateUser,
  requireEditPermissions,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const presetId = req.params.id;
      const { presetName, source, mapping } = req.body;
      const updatedPreset = await leadService.updateLeadImportPreset(
        userId,
        presetId,
        presetName,
        source,
        mapping,
      );
      if (!updatedPreset) {
        return res
          .status(404)
          .json({ message: "Preset not found or not authorized" });
      }
      res.status(200).json(updatedPreset);
    } catch (error) {
      console.error("Error updating preset:", error);
      res
        .status(500)
        .json({ message: "Failed to update preset", error: error.message });
    }
  },
);

// Route to delete a lead import preset
router.delete(
  "/presets/:id",
  authenticateUser,
  requireEditPermissions,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const presetId = req.params.id;
      const deleted = await leadService.deleteLeadImportPreset(
        userId,
        presetId,
      );
      if (!deleted) {
        return res
          .status(404)
          .json({ message: "Preset not found or not authorized" });
      }
      res.status(204).send(); // No content for successful deletion
    } catch (error) {
      console.error("Error deleting preset:", error);
      res
        .status(500)
        .json({ message: "Failed to delete preset", error: error.message });
    }
  },
);

// Route to get CSV template for an industry
router.get(
  "/industry-template/:industryId",
  authenticateUser,
  async (req, res) => {
    try {
      const { industryId } = req.params;
      const csvTemplate = leadService.generateIndustryTemplate(industryId);

      if (!csvTemplate) {
        return res.status(404).json({ message: "Invalid industry ID" });
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${industryId}_template.csv"`,
      );
      res.send(csvTemplate);
    } catch (error) {
      console.error("Error generating industry template:", error);
      res.status(500).json({
        message: "Failed to generate industry template",
        error: error.message,
      });
    }
  },
);

// Route to get import history for a user
router.get("/import-history", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await leadService.getImportHistory(userId);
    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching import history:", error);
    res.status(500).json({
      message: "Failed to fetch import history",
      error: error.message,
    });
  }
});

// Route to verify/approve a draft lead
router.post(
  "/:id/verify",
  authenticateUser,
  requireEditPermissions,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const leadId = req.params.id;

      // Get the lead and ensure it belongs to the user
      const lead = await leadService.getLeadById(userId, leadId);
      if (!lead) {
        return res
          .status(404)
          .json({ message: "Lead not found or not authorized" });
      }

      // Only allow verification of DRAFT leads
      if (lead.status !== "DRAFT") {
        return res
          .status(400)
          .json({ message: "Only draft leads can be verified" });
      }

      // Update lead status to NEW (verified)
      const updatedLead = await leadService.updateLead(userId, leadId, {
        status: "NEW",
        custom_fields: {
          ...lead.custom_fields,
          verified_at: new Date().toISOString(),
          verified: true,
        },
      });

      res.status(200).json({
        message: "Lead verified successfully",
        lead: updatedLead,
      });
    } catch (error) {
      console.error("Error verifying lead:", error);
      res
        .status(500)
        .json({ message: "Failed to verify lead", error: error.message });
    }
  },
);

// Route to convert a lead to an opportunity and/or contact
router.post(
  "/:id/convert",
  authenticateUser,
  requireEditPermissions,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const leadId = req.params.id;
      const { createOpportunity = true, createContact = true } = req.body;

      // Get the lead
      const lead = await leadService.getLeadById(userId, leadId);
      if (!lead) {
        return res
          .status(404)
          .json({ message: "Lead not found or not authorized" });
      }

      const results = { lead, opportunity: null, contact: null };

      // Create opportunity if requested
      if (createOpportunity) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
        );

        const { data: opportunity, error: oppError } = await supabase
          .from("opportunities")
          .insert({
            user_id: userId,
            lead_id: leadId,
            name: `${lead.name} - Opportunity`,
            amount: lead.value || 0,
            stage: "NEW",
            status: "OPEN",
            probability: 10,
            expected_close_date: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 30 days from now
          })
          .select()
          .single();

        if (oppError) {
          console.error("Error creating opportunity:", oppError);
        } else {
          results.opportunity = opportunity;
        }
      }

      // Create contact if requested
      if (createContact) {
        const [firstName, ...lastNameParts] = (lead.name || "Unknown").split(
          " ",
        );
        const lastName = lastNameParts.join(" ") || firstName;

        try {
          const contact = await leadService.createContact(
            userId,
            leadId,
            firstName,
            lastName,
            lead.email,
            lead.phone,
            "Primary Contact",
            true,
            lead.custom_fields || {},
          );
          results.contact = contact;
        } catch (error) {
          console.error("Error creating contact:", error);
        }
      }

      // Update lead status to CONVERTED
      await leadService.updateLead(userId, leadId, { status: "CONVERTED" });
      results.lead = { ...lead, status: "CONVERTED" };

      res.status(200).json({
        message: "Lead converted successfully",
        ...results,
      });
    } catch (error) {
      console.error("Error converting lead:", error);
      res
        .status(500)
        .json({ message: "Failed to convert lead", error: error.message });
    }
  },
);

// Route to export leads to CSV
router.get("/export", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { exportLeads } = await import("../utils/export.js");

    // Get filter parameters from query string
    const filters = {
      status: req.query.status,
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const csv = await exportLeads(userId, filters);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="leads_export.csv"',
    );
    res.send(csv);
  } catch (error) {
    console.error("Error exporting leads:", error);
    res
      .status(500)
      .json({ message: "Failed to export leads", error: error.message });
  }
});

export default router;
