/**
 * CRM Workflow Service
 * Handles conditional logic for lead-to-opportunity conversion, status changes, and automated workflows
 */

class CRMWorkflowService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.workflowRules = {
      leadToOpportunity: {
        conditions: [
          { field: "status", operator: "equals", value: "qualified" },
          { field: "email", operator: "is_not_empty", value: null },
          { field: "phone", operator: "is_not_empty", value: null },
        ],
        actions: [
          {
            type: "create_opportunity",
            config: { stage: "new", probability: 10 },
          },
          { type: "update_lead_status", config: { status: "converted" } },
          {
            type: "create_activity",
            config: {
              type: "conversion",
              description: "Lead converted to opportunity",
            },
          },
        ],
      },
      leadStatusChange: {
        "new-to-contacted": {
          conditions: [
            { field: "status", operator: "changes_from", value: "new" },
            { field: "status", operator: "changes_to", value: "contacted" },
          ],
          actions: [
            {
              type: "create_activity",
              config: {
                type: "status_change",
                description: "Status changed from New to Contacted",
              },
            },
            { type: "update_lead_score", config: { increment: 10 } },
          ],
        },
        "contacted-to-qualified": {
          conditions: [
            { field: "status", operator: "changes_from", value: "contacted" },
            { field: "status", operator: "changes_to", value: "qualified" },
          ],
          actions: [
            {
              type: "create_activity",
              config: {
                type: "status_change",
                description: "Status changed from Contacted to Qualified",
              },
            },
            { type: "update_lead_score", config: { increment: 25 } },
            {
              type: "send_notification",
              config: {
                type: "lead_qualified",
                template: "lead_qualified_notification",
              },
            },
          ],
        },
        "qualified-to-conversion": {
          conditions: [
            { field: "status", operator: "changes_from", value: "qualified" },
            { field: "status", operator: "changes_to", value: "converted" },
          ],
          actions: [
            {
              type: "create_activity",
              config: {
                type: "status_change",
                description: "Lead qualified and ready for conversion",
              },
            },
            { type: "update_lead_score", config: { increment: 50 } },
          ],
        },
      },
      dealStageChange: {
        "new-to-qualified": {
          conditions: [
            { field: "stage", operator: "changes_from", value: "new" },
            { field: "stage", operator: "changes_to", value: "qualified" },
          ],
          actions: [
            { type: "update_deal_probability", config: { probability: 40 } },
            {
              type: "create_activity",
              config: {
                type: "stage_change",
                description: "Deal moved from New to Qualified",
              },
            },
          ],
        },
        "qualified-to-proposal": {
          conditions: [
            { field: "stage", operator: "changes_from", value: "qualified" },
            { field: "stage", operator: "changes_to", value: "proposal" },
          ],
          actions: [
            { type: "update_deal_probability", config: { probability: 70 } },
            {
              type: "create_activity",
              config: {
                type: "stage_change",
                description: "Deal moved from Qualified to Proposal",
              },
            },
            {
              type: "send_notification",
              config: {
                type: "proposal_sent",
                template: "proposal_notification",
              },
            },
          ],
        },
        "proposal-to-negotiation": {
          conditions: [
            { field: "stage", operator: "changes_from", value: "proposal" },
            { field: "stage", operator: "changes_to", value: "negotiation" },
          ],
          actions: [
            { type: "update_deal_probability", config: { probability: 85 } },
            {
              type: "create_activity",
              config: {
                type: "stage_change",
                description: "Deal moved from Proposal to Negotiation",
              },
            },
          ],
        },
        "negotiation-to-closed": {
          conditions: [
            { field: "stage", operator: "changes_from", value: "negotiation" },
            { field: "stage", operator: "changes_to", value: "won" },
          ],
          actions: [
            { type: "update_deal_probability", config: { probability: 100 } },
            { type: "update_deal_status", config: { status: "won" } },
            {
              type: "create_activity",
              config: { type: "deal_won", description: "Deal won!" },
            },
            {
              type: "send_notification",
              config: { type: "deal_won", template: "deal_won_notification" },
            },
          ],
        },
      },
    };
  }

  /**
   * Evaluate workflow conditions
   */
  evaluateConditions(conditions, data, previousData = null) {
    return conditions.every((condition) => {
      const fieldValue = data[condition.field];
      const previousValue = previousData ? previousData[condition.field] : null;

      switch (condition.operator) {
        case "equals":
          return fieldValue === condition.value;
        case "not_equals":
          return fieldValue !== condition.value;
        case "is_not_empty":
          return (
            fieldValue !== null &&
            fieldValue !== undefined &&
            fieldValue.toString().trim() !== ""
          );
        case "is_empty":
          return (
            fieldValue === null ||
            fieldValue === undefined ||
            fieldValue.toString().trim() === ""
          );
        case "changes_from":
          return previousValue === condition.value;
        case "changes_to":
          return fieldValue === condition.value;
        case "contains":
          return (
            fieldValue &&
            fieldValue
              .toString()
              .toLowerCase()
              .includes(condition.value.toLowerCase())
          );
        case "greater_than":
          return parseFloat(fieldValue) > parseFloat(condition.value);
        case "less_than":
          return parseFloat(fieldValue) < parseFloat(condition.value);
        default:
          return true;
      }
    });
  }

  /**
   * Execute workflow actions
   */
  async executeActions(actions, data, userId, agencyId = null) {
    const results = [];

    for (const action of actions) {
      try {
        const result = await this.executeAction(action, data, userId, agencyId);
        results.push({ action: action.type, success: true, result });
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
        results.push({
          action: action.type,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Execute a single workflow action
   */
  async executeAction(action, data, userId, agencyId) {
    switch (action.type) {
      case "create_opportunity":
        return await this.createOpportunity(
          data,
          action.config,
          userId,
          agencyId,
        );
      case "update_lead_status":
        return await this.updateLeadStatus(
          data.id,
          action.config.status,
          userId,
          agencyId,
        );
      case "create_activity":
        return await this.createActivity(data, action.config, userId, agencyId);
      case "update_lead_score":
        return await this.updateLeadScore(
          data.id,
          action.config.increment,
          userId,
          agencyId,
        );
      case "send_notification":
        return await this.sendNotification(
          data,
          action.config,
          userId,
          agencyId,
        );
      case "update_deal_probability":
        return await this.updateDealProbability(
          data.id,
          action.config.probability,
          userId,
          agencyId,
        );
      case "update_deal_status":
        return await this.updateDealStatus(
          data.id,
          action.config.status,
          userId,
          agencyId,
        );
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Create opportunity from lead
   */
  async createOpportunity(leadData, config, userId, agencyId) {
    const opportunityData = {
      user_id: userId,
      agency_id: agencyId,
      lead_id: leadData.id,
      name: `Opportunity: ${leadData.name}`,
      stage: config.stage || "new",
      probability: config.probability || 10,
      amount: leadData.value || 0,
      currency: leadData.currency || "USD",
      expected_close_date: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      status: "open",
      created_from_workflow: true,
    };

    const { data, error } = await this.supabase
      .from("opportunities")
      .insert(opportunityData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create opportunity: ${error.message}`);
    }

    return data;
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(leadId, status, userId, agencyId) {
    const { data, error } = await this.supabase
      .from("leads")
      .update({
        status,
        updated_at: new Date().toISOString(),
        status_updated_by_workflow: true,
      })
      .eq("id", leadId)
      .eq("user_id", userId)
      .eq(agencyId ? "agency_id" : "user_id", agencyId || userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update lead status: ${error.message}`);
    }

    return data;
  }

  /**
   * Create activity record
   */
  async createActivity(data, config, userId, agencyId) {
    const activityData = {
      user_id: userId,
      agency_id: agencyId,
      lead_id: data.id || null,
      opportunity_id: data.id || null,
      contact_id: data.id || null,
      type: config.type,
      description: config.description,
      created_by_workflow: true,
      created_at: new Date().toISOString(),
    };

    const { data: result, error } = await this.supabase
      .from("activities")
      .insert(activityData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create activity: ${error.message}`);
    }

    return result;
  }

  /**
   * Update lead score
   */
  async updateLeadScore(leadId, increment, userId, agencyId) {
    // First get current score
    const { data: currentLead, error: fetchError } = await this.supabase
      .from("leads")
      .select("score")
      .eq("id", leadId)
      .eq("user_id", userId)
      .eq(agencyId ? "agency_id" : "user_id", agencyId || userId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch lead score: ${fetchError.message}`);
    }

    const newScore = Math.max(0, (currentLead.score || 0) + increment);

    const { data, error } = await this.supabase
      .from("leads")
      .update({
        score: newScore,
        score_updated_by_workflow: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId)
      .eq("user_id", userId)
      .eq(agencyId ? "agency_id" : "user_id", agencyId || userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update lead score: ${error.message}`);
    }

    return data;
  }

  /**
   * Update deal probability
   */
  async updateDealProbability(dealId, probability, userId, agencyId) {
    const { data, error } = await this.supabase
      .from("opportunities")
      .update({
        probability,
        probability_updated_by_workflow: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dealId)
      .eq("user_id", userId)
      .eq(agencyId ? "agency_id" : "user_id", agencyId || userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update deal probability: ${error.message}`);
    }

    return data;
  }

  /**
   * Update deal status
   */
  async updateDealStatus(dealId, status, userId, agencyId) {
    const updateData = {
      status,
      status_updated_by_workflow: true,
      updated_at: new Date().toISOString(),
    };

    if (status === "won") {
      updateData.won_at = new Date().toISOString();
    } else if (status === "lost") {
      updateData.lost_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from("opportunities")
      .update(updateData)
      .eq("id", dealId)
      .eq("user_id", userId)
      .eq(agencyId ? "agency_id" : "user_id", agencyId || userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update deal status: ${error.message}`);
    }

    return data;
  }

  /**
   * Send notification (placeholder for future notification system)
   */
  async sendNotification(data, config, userId, agencyId) {
    // This would integrate with email, SMS, or in-app notifications
    const notificationData = {
      user_id: userId,
      agency_id: agencyId,
      type: config.type,
      template: config.template,
      data: data,
      created_at: new Date().toISOString(),
    };

    const { data: result, error } = await this.supabase
      .from("notifications")
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return result;
  }

  /**
   * Process lead status change
   */
  async processLeadStatusChange(
    leadId,
    newStatus,
    previousData,
    userId,
    agencyId,
  ) {
    // Get current lead data
    const { data: currentLead, error: fetchError } = await this.supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .eq("user_id", userId)
      .eq(agencyId ? "agency_id" : "user_id", agencyId || userId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch lead: ${fetchError.message}`);
    }

    // Find applicable workflow rules
    const statusChangeKey = `${previousData.status}-to-${newStatus}`;
    const workflowRule = this.workflowRules.leadStatusChange[statusChangeKey];

    if (!workflowRule) {
      // Just update status if no specific workflow
      return await this.updateLeadStatus(leadId, newStatus, userId, agencyId);
    }

    // Evaluate conditions
    const conditionsMet = this.evaluateConditions(
      workflowRule.conditions,
      currentLead,
      previousData,
    );

    if (conditionsMet) {
      // Execute actions
      return await this.executeActions(
        workflowRule.actions,
        currentLead,
        userId,
        agencyId,
      );
    }

    return { message: "No workflow conditions met" };
  }

  /**
   * Process deal stage change
   */
  async processDealStageChange(
    dealId,
    newStage,
    previousData,
    userId,
    agencyId,
  ) {
    // Get current deal data
    const { data: currentDeal, error: fetchError } = await this.supabase
      .from("opportunities")
      .select("*")
      .eq("id", dealId)
      .eq("user_id", userId)
      .eq(agencyId ? "agency_id" : "user_id", agencyId || userId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch deal: ${fetchError.message}`);
    }

    // Find applicable workflow rules
    const stageChangeKey = `${previousData.stage}-to-${newStage}`;
    const workflowRule = this.workflowRules.dealStageChange[stageChangeKey];

    if (!workflowRule) {
      // Just update stage if no specific workflow
      return await this.updateDealProbability(
        dealId,
        this.getStageProbability(newStage),
        userId,
        agencyId,
      );
    }

    // Evaluate conditions
    const conditionsMet = this.evaluateConditions(
      workflowRule.conditions,
      currentDeal,
      previousData,
    );

    if (conditionsMet) {
      // Execute actions
      return await this.executeActions(
        workflowRule.actions,
        currentDeal,
        userId,
        agencyId,
      );
    }

    return { message: "No workflow conditions met" };
  }

  /**
   * Get default probability for a stage
   */
  getStageProbability(stage) {
    const stageProbabilities = {
      new: 10,
      qualified: 40,
      proposal: 70,
      negotiation: 85,
      won: 100,
      lost: 0,
    };

    return stageProbabilities[stage] || 10;
  }

  /**
   * Check if lead can be converted to opportunity
   */
  canConvertToOpportunity(leadData) {
    const conditions = this.workflowRules.leadToOpportunity.conditions;
    return this.evaluateConditions(conditions, leadData);
  }

  /**
   * Convert lead to opportunity with workflow
   */
  async convertLeadToOpportunity(leadId, userId, agencyId) {
    // Get lead data
    const { data: leadData, error: fetchError } = await this.supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .eq("user_id", userId)
      .eq(agencyId ? "agency_id" : "user_id", agencyId || userId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch lead: ${fetchError.message}`);
    }

    // Check if conversion is allowed
    if (!this.canConvertToOpportunity(leadData)) {
      throw new Error("Lead does not meet conversion criteria");
    }

    // Execute conversion workflow
    const conditions = this.workflowRules.leadToOpportunity.conditions;
    const actions = this.workflowRules.leadToOpportunity.actions;

    const conditionsMet = this.evaluateConditions(conditions, leadData);

    if (conditionsMet) {
      return await this.executeActions(actions, leadData, userId, agencyId);
    }

    throw new Error("Lead does not meet conversion criteria");
  }
}

export default CRMWorkflowService;
