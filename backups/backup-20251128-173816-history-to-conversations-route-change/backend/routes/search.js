/**
 * Enhanced Master Search API Routes
 * Unified search across all CRM entities with command palette support
 */

import express from "express";
import comprehensiveSearchService from "../services/comprehensive-search-service.js";
import enhancedSearchService from "../services/enhanced-search-service.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/search
 * Search across all entities with enhanced coverage
 */
router.get("/", protect, async (req, res) => {
  try {
    // Try to get user from auth, but allow search to work without auth for navigation
    let userId = null;
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      try {
        const { data } = await import("@supabase/supabase-js").then((mod) => {
          const supabase = mod.createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
          );
          return supabase.auth.getUser(token);
        });
        userId = data?.user?.id || null;
      } catch (authError) {
        console.log("Auth failed, continuing with navigation-only search");
      }
    }

    const { q, limit, categories } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const options = {
      limit: limit ? parseInt(limit) : 8,
    };

    if (categories) {
      options.categories = categories;
    }

    // Use comprehensive search service for full coverage across all entity types
    const results = await comprehensiveSearchService.searchAll(userId, q, options);

    res.json({
      success: true,
      query: q,
      data: results,
      ...results,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform search",
      error: error.message,
    });
  }
});

/**
 * GET /api/search/suggestions
 * Get search suggestions with enhanced functionality
 */
router.get("/suggestions", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get enhanced suggestions
    const [recentSearches, quickActions, popularEntities] = await Promise.all([
      enhancedSearchService.getRecentCommands(userId),
      enhancedSearchService.getQuickActions(),
      enhancedSearchService.getPopularEntities(userId),
    ]);

    res.json({
      success: true,
      data: {
        recent_searches: recentSearches,
        quick_actions: quickActions,
        popular_entities: popularEntities,
      },
    });
  } catch (error) {
    console.error("Suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch suggestions",
      error: error.message,
    });
  }
});

/**
 * POST /api/search/command
 * Execute command from command palette with enhanced functionality
 */
router.post("/command", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { command, commandType, entityType, entityId } = req.body;

    if (!command) {
      return res.status(400).json({
        success: false,
        message: "Command is required",
      });
    }

    // Execute command using enhanced search service
    const startTime = Date.now();
    const result = await enhancedSearchService.executeCommand(userId, {
      command,
      commandType,
      entityType,
      entityId,
    });

    const executionTime = Date.now() - startTime;

    // Log execution
    await enhancedSearchService.logCommandExecution(
      userId,
      command,
      commandType,
      entityType,
      entityId,
      result.success,
      executionTime,
      result.error,
    );

    res.json({
      success: result.success,
      data: result.data,
      message: result.message,
      execution_time_ms: executionTime,
    });
  } catch (error) {
    console.error("Command execution error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to execute command",
      error: error.message,
    });
  }
});

/**
 * GET /api/search/quick-actions
 * Get all available quick actions
 */
router.get("/quick-actions", async (req, res) => {
  try {
    const userId = req.user?.id;

    const quickActions = await enhancedSearchService.getQuickActions();

    res.json({
      success: true,
      data: quickActions,
    });
  } catch (error) {
    console.error("Quick actions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quick actions",
      error: error.message,
    });
  }
});

/**
 * GET /api/search/schema/:entity
 * Get entity creation form schema
 */
router.get("/schema/:entity", protect, async (req, res) => {
  try {
    const { entity } = req.params;
    const userId = req.user.id;

    // Return basic schema for entity creation
    // In a real implementation, this would fetch from database
    const schemas = {
      lead: {
        title: "Create New Lead",
        fields: [
          {
            name: "first_name",
            label: "First Name",
            type: "text",
            required: true,
          },
          {
            name: "last_name",
            label: "Last Name",
            type: "text",
            required: true,
          },
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
          {
            name: "source",
            label: "Lead Source",
            type: "text",
            required: false,
          },
          { name: "notes", label: "Notes", type: "textarea", required: false },
        ],
      },
      contact: {
        title: "Create New Contact",
        fields: [
          {
            name: "first_name",
            label: "First Name",
            type: "text",
            required: true,
          },
          {
            name: "last_name",
            label: "Last Name",
            type: "text",
            required: true,
          },
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
        fields: [
          {
            name: "name",
            label: "Campaign Name",
            type: "text",
            required: true,
          },
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
        fields: [
          {
            name: "title",
            label: "Meeting Title",
            type: "text",
            required: true,
          },
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
          {
            name: "location",
            label: "Location",
            type: "text",
            required: false,
          },
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
        fields: [
          { name: "name", label: "Deal Name", type: "text", required: true },
          {
            name: "value",
            label: "Deal Value",
            type: "number",
            required: false,
          },
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
        fields: [
          { name: "title", label: "Note Title", type: "text", required: true },
          {
            name: "content",
            label: "Content",
            type: "textarea",
            required: true,
          },
          {
            name: "folder_id",
            label: "Folder",
            type: "select",
            required: false,
          },
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
        fields: [
          {
            name: "name",
            label: "Workflow Name",
            type: "text",
            required: true,
          },
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
      opportunity: {
        title: "Create New Opportunity",
        fields: [
          {
            name: "name",
            label: "Opportunity Name",
            type: "text",
            required: true,
          },
          {
            name: "value",
            label: "Opportunity Value",
            type: "number",
            required: false,
          },
          {
            name: "stage",
            label: "Stage",
            type: "select",
            options: [
              "prospecting",
              "qualification",
              "proposal",
              "negotiation",
            ],
            default: "prospecting",
          },
          {
            name: "close_probability",
            label: "Win Probability (%)",
            type: "number",
            min: 0,
            max: 100,
            default: 50,
          },
          {
            name: "expected_close_date",
            label: "Expected Close Date",
            type: "date",
            required: false,
          },
        ],
      },
    };

    const schema = schemas[entity];
    if (!schema) {
      return res.status(404).json({
        success: false,
        message: `Unknown entity type: ${entity}`,
      });
    }

    res.json({
      success: true,
      data: schema,
    });
  } catch (error) {
    console.error("Schema error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch schema",
      error: error.message,
    });
  }
});

export default router;
