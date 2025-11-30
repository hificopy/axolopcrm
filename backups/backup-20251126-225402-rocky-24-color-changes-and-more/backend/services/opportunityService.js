import { createClient } from "@supabase/supabase-js";
import { safeDelete } from "../utils/transaction-handler.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all opportunities for a user (with optional agency filtering)
const getOpportunities = async (userId, agencyId = null) => {
  let query = supabase
    .from("opportunities")
    .select(
      `
      *,
      lead:lead_id (
        id,
        name,
        email,
        phone,
        type
      )
    `,
    );

  // Filter by agency if provided (RLS handles role-based visibility)
  if (agencyId) {
    query = query.eq("agency_id", agencyId);
  } else {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch opportunities error:", error);
    throw new Error(`Failed to fetch opportunities: ${error.message}`);
  }

  // Transform data to add company field from lead name for B2B leads
  const transformedData = (data || []).map((opp) => ({
    ...opp,
    lead: opp.lead
      ? {
          ...opp.lead,
          company: opp.lead.type === "B2B_COMPANY" ? opp.lead.name : null,
        }
      : null,
  }));

  return transformedData;
};

// Get a single opportunity by ID
const getOpportunityById = async (userId, opportunityId) => {
  const { data, error } = await supabase
    .from("opportunities")
    .select(
      `
      *,
      lead:lead_id (
        id,
        name,
        email,
        phone,
        website,
        type
      )
    `,
    )
    .eq("id", opportunityId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Supabase fetch opportunity by ID error:", error);
    throw new Error(`Failed to fetch opportunity: ${error.message}`);
  }

  // Transform data to add company field
  if (data && data.lead) {
    data.lead.company =
      data.lead.type === "B2B_COMPANY" ? data.lead.name : null;
  }

  return data;
};

// Create a new opportunity (with optional agency_id)
const createOpportunity = async (userId, opportunityData, agencyId = null) => {
  const insertData = { user_id: userId, ...opportunityData };

  // Add agency_id if provided
  if (agencyId) {
    insertData.agency_id = agencyId;
  }

  const { data, error } = await supabase
    .from("opportunities")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Supabase create opportunity error:", error);
    throw new Error(`Failed to create opportunity: ${error.message}`);
  }
  return data;
};

// Update an existing opportunity
const updateOpportunity = async (userId, opportunityId, opportunityData) => {
  const { data, error } = await supabase
    .from("opportunities")
    .update({ ...opportunityData, updated_at: new Date() })
    .eq("id", opportunityId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Supabase update opportunity error:", error);
    throw new Error(`Failed to update opportunity: ${error.message}`);
  }
  return data;
};

// Delete an opportunity with cascade validation
const deleteOpportunity = async (userId, opportunityId) => {
  // Define dependent tables that would be orphaned
  const dependentTables = [
    {
      table: "activities",
      foreignKey: "opportunity_id",
      action: "Cannot delete opportunity with associated activities",
    },
    {
      table: "notes",
      foreignKey: "opportunity_id",
      action: "Cannot delete opportunity with associated notes",
    },
    {
      table: "documents",
      foreignKey: "opportunity_id",
      action: "Cannot delete opportunity with associated documents",
    },
  ];

  // Use safe delete with cascade validation
  const result = await safeDelete(
    "opportunities",
    opportunityId,
    userId,
    dependentTables,
    `opportunity-delete-${opportunityId}`,
  );

  if (!result.success) {
    throw new Error(result.error);
  }

  return true;
};

export default {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
};
