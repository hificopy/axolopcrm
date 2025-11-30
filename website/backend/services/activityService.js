/**
 * Enhanced Activity Service
 * Provides consistent error handling and standardized responses
 */

import { supabaseServer } from "../config/supabase-auth.js";
import {
  withServiceErrorHandling,
  createServiceSuccess,
} from "../utils/service-error-handler.js";

// Use the shared supabaseServer client (service role key) from config
const supabase = supabaseServer;

const activityService = {
  /**
   * Get all activities for a user
   */
  getActivities: withServiceErrorHandling(
    async (userId) => {
      const { data, error } = await supabase
        .from("activities")
        .select(
          `
          *,
          lead:lead_id (
            id,
            name,
            email
          ),
          contact:contact_id (
            id,
            first_name,
            last_name,
            email
          ),
          opportunity:opportunity_id (
            id,
            name,
            amount
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to include computed name for contacts
      const transformedData = (data || []).map((activity) => ({
        ...activity,
        contact: activity.contact
          ? {
              ...activity.contact,
              name: `${activity.contact.first_name || ""} ${activity.contact.last_name || ""}`.trim(),
            }
          : null,
      }));

      return createServiceSuccess(
        transformedData,
        "Activities retrieved successfully",
      );
    },
    "getActivities",
    "activityService",
  ),

  /**
   * Get a single activity by ID
   */
  getActivityById: withServiceErrorHandling(
    async (userId, activityId) => {
      const { data, error } = await supabase
        .from("activities")
        .select(
          `
           *,
           lead:lead_id (
             id,
             name,
             email
           ),
           contact:contact_id (
             id,
             first_name,
             last_name,
             email
           ),
           opportunity:opportunity_id (
             id,
             name,
             amount
           )
         `,
        )
        .eq("id", activityId)
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      // Transform contact to include computed name
      if (data && data.contact) {
        data.contact.name =
          `${data.contact.first_name || ""} ${data.contact.last_name || ""}`.trim();
      }

      return createServiceSuccess(data, "Activity retrieved successfully");
    },
    "getActivityById",
    "activityService",
  ),

  /**
   * Create a new activity
   */
  createActivity: withServiceErrorHandling(
    async (userId, activityData) => {
      const { data, error } = await supabase
        .from("activities")
        .insert([
          {
            user_id: userId,
            type: activityData.type,
            title: activityData.title,
            description: activityData.description,
            status: activityData.status || "PENDING",
            due_date: activityData.due_date,
            lead_id: activityData.lead_id,
            contact_id: activityData.contact_id,
            opportunity_id: activityData.opportunity_id,
            notes: activityData.notes,
            metadata: activityData.metadata || {},
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return createServiceSuccess(data, "Activity created successfully");
    },
    "createActivity",
    "activityService",
  ),

  /**
   * Update an existing activity
   */
  updateActivity: withServiceErrorHandling(
    async (userId, activityId, activityData) => {
      const { data, error } = await supabase
        .from("activities")
        .update({
          type: activityData.type,
          title: activityData.title,
          description: activityData.description,
          status: activityData.status || "PENDING",
          due_date: activityData.due_date,
          lead_id: activityData.lead_id,
          contact_id: activityData.contact_id,
          opportunity_id: activityData.opportunity_id,
          notes: activityData.notes,
          metadata: activityData.metadata || {},
        })
        .eq("id", activityId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return createServiceSuccess(data, "Activity updated successfully");
    },
    "updateActivity",
    "activityService",
  ),

  /**
   * Delete an activity
   */
  deleteActivity: withServiceErrorHandling(
    async (userId, activityId) => {
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId)
        .eq("user_id", userId);

      if (error) throw error;
      return createServiceSuccess(true, "Activity deleted successfully");
    },
    "deleteActivity",
    "activityService",
  ),

  /**
   * Get activities by opportunity ID
   */
  getActivitiesByOpportunity: withServiceErrorHandling(
    async (userId, opportunityId) => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .eq("opportunity_id", opportunityId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return createServiceSuccess(
        data || [],
        "Activities retrieved successfully",
      );
    },
    "getActivitiesByOpportunity",
    "activityService",
  ),

  /**
   * Get activities by lead ID
   */
  getActivitiesByLead: withServiceErrorHandling(
    async (userId, leadId) => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return createServiceSuccess(
        data || [],
        "Activities retrieved successfully",
      );
    },
    "getActivitiesByLead",
    "activityService",
  ),

  /**
   * Get activities by contact ID
   */
  getActivitiesByContact: withServiceErrorHandling(
    async (userId, contactId) => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return createServiceSuccess(
        data || [],
        "Activities retrieved successfully",
      );
    },
    "getActivitiesByContact",
    "activityService",
  ),

  /**
   * Get activities by date range
   */
  getActivitiesByDateRange: withServiceErrorHandling(
    async (userId, startDate, endDate) => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return createServiceSuccess(
        data || [],
        "Activities retrieved successfully",
      );
    },
    "getActivitiesByDateRange",
    "activityService",
  ),
};

export default activityService;
