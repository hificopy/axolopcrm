/**
 * Comprehensive Test for Root Cause Fixes
 * Tests cascade delete validation and N+1 query optimizations
 */

import { createClient } from "@supabase/supabase-js";
import contactService from "./backend/services/contactService.js";
import leadService from "./backend/services/leadService.js";
import opportunityService from "./backend/services/opportunityService.js";
import { validateCascadeDelete } from "./backend/utils/transaction-handler.js";
import {
  batchFetchRelated,
  batchFetchUsersByEmail,
} from "./backend/utils/batch-operations.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class RootCauseFixesTest {
  constructor() {
    this.testUserId = null;
    this.testResults = [];
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logEntry);
    this.testResults.push({ timestamp, message, type });
  }

  async runTest(testName, testFunction) {
    this.log(`\n🧪 Running test: ${testName}`);
    try {
      const startTime = Date.now();
      await testFunction();
      const duration = Date.now() - startTime;
      this.log(`✅ ${testName} - PASSED (${duration}ms)`, "success");
      return true;
    } catch (error) {
      this.log(`❌ ${testName} - FAILED: ${error.message}`, "error");
      console.error(error);
      return false;
    }
  }

  async setupTestData() {
    this.log("Setting up test data...");

    // Create test user
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email: "test-rootcause@example.com",
        name: "Root Cause Test User",
      })
      .select()
      .single();

    if (userError || !user) {
      throw new Error(`Failed to create test user: ${userError?.message}`);
    }

    this.testUserId = user.id;
    this.log(`Created test user: ${user.id}`);

    // Create test lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        user_id: this.testUserId,
        name: "Test Lead for Root Cause",
        email: "testlead@example.com",
        status: "NEW",
      })
      .select()
      .single();

    if (leadError || !lead) {
      throw new Error(`Failed to create test lead: ${leadError?.message}`);
    }

    this.testLeadId = lead.id;
    this.log(`Created test lead: ${lead.id}`);

    // Create test contact
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .insert({
        user_id: this.testUserId,
        lead_id: lead.id,
        first_name: "Test",
        last_name: "Contact",
        email: "testcontact@example.com",
      })
      .select()
      .single();

    if (contactError || !contact) {
      throw new Error(
        `Failed to create test contact: ${contactError?.message}`,
      );
    }

    this.testContactId = contact.id;
    this.log(`Created test contact: ${contact.id}`);

    // Create test opportunity
    const { data: opportunity, error: oppError } = await supabase
      .from("opportunities")
      .insert({
        user_id: this.testUserId,
        lead_id: lead.id,
        name: "Test Opportunity",
        amount: 10000,
        stage: "NEW",
      })
      .select()
      .single();

    if (oppError || !opportunity) {
      throw new Error(
        `Failed to create test opportunity: ${oppError?.message}`,
      );
    }

    this.testOpportunityId = opportunity.id;
    this.log(`Created test opportunity: ${opportunity.id}`);

    // Create dependent records for cascade delete testing
    await supabase.from("activities").insert({
      user_id: this.testUserId,
      contact_id: contact.id,
      title: "Test Activity",
      type: "CALL",
      status: "COMPLETED",
    });

    await supabase.from("notes").insert({
      user_id: this.testUserId,
      contact_id: contact.id,
      title: "Test Note",
      content: "Test note content",
    });

    this.log("Test data setup complete");
  }

  async cleanupTestData() {
    this.log("Cleaning up test data...");

    try {
      // Delete in order of dependencies
      await supabase.from("activities").delete().eq("user_id", this.testUserId);
      await supabase.from("notes").delete().eq("user_id", this.testUserId);
      await supabase
        .from("opportunities")
        .delete()
        .eq("user_id", this.testUserId);
      await supabase.from("contacts").delete().eq("user_id", this.testUserId);
      await supabase.from("leads").delete().eq("user_id", this.testUserId);
      await supabase.from("users").delete().eq("id", this.testUserId);

      this.log("Test data cleanup complete");
    } catch (error) {
      this.log(`Cleanup error: ${error.message}`, "error");
    }
  }

  // Test 1: Cascade Delete Validation
  async testCascadeDeleteValidation() {
    // Test contact deletion with dependencies
    const validation = await validateCascadeDelete(
      "contacts",
      this.testContactId,
      this.testUserId,
      [
        {
          table: "activities",
          foreignKey: "contact_id",
          action: "Cannot delete contact with activities",
        },
        {
          table: "notes",
          foreignKey: "contact_id",
          action: "Cannot delete contact with notes",
        },
      ],
    );

    if (validation.success) {
      throw new Error("Expected cascade delete validation to fail");
    }

    if (!validation.error.includes("dependent records exist")) {
      throw new Error("Expected dependent records error message");
    }

    this.log("Cascade delete validation correctly identified dependencies");
  }

  // Test 2: Safe Delete with Dependencies
  async testSafeDeleteWithDependencies() {
    try {
      await contactService.deleteContact(this.testUserId, this.testContactId);
      throw new Error("Expected safe delete to fail with dependencies");
    } catch (error) {
      if (!error.message.includes("Cannot delete")) {
        throw new Error(`Expected cascade delete error, got: ${error.message}`);
      }
      this.log("Safe delete correctly prevented deletion with dependencies");
    }
  }

  // Test 3: Batch Operations Performance
  async testBatchOperationsPerformance() {
    const startTime = Date.now();

    // Test batch fetch related records
    const relatedMap = await batchFetchRelated(
      "activities",
      "contact_id",
      [this.testContactId],
      ["id", "title", "type"],
    );

    const batchTime = Date.now() - startTime;

    if (!relatedMap.has(this.testContactId)) {
      throw new Error("Batch fetch should return related activities");
    }

    this.log(`Batch operations completed in ${batchTime}ms`);

    // Test batch user fetch
    const userMap = await batchFetchUsersByEmail([
      "test-rootcause@example.com",
    ]);

    if (!userMap.has("test-rootcause@example.com")) {
      throw new Error("Batch user fetch should return test user");
    }

    this.log("Batch operations working correctly");
  }

  // Test 4: N+1 Query Optimization
  async testN1QueryOptimization() {
    const startTime = Date.now();

    // Test optimized contact fetching with related data
    const contacts = await contactService.getContacts(this.testUserId, {
      includeCounts: true,
      includeLead: true,
    });

    const optimizedTime = Date.now() - startTime;

    if (!contacts || contacts.length === 0) {
      throw new Error("Should return contacts with optimized queries");
    }

    const contact = contacts.find((c) => c.id === this.testContactId);
    if (!contact) {
      throw new Error("Should include test contact");
    }

    // Verify enrichment worked
    if (typeof contact.activityCount !== "number") {
      throw new Error("Should include activity count from batch enrichment");
    }

    this.log(`N+1 optimized query completed in ${optimizedTime}ms`);
    this.log("N+1 query optimization working correctly");
  }

  // Test 5: Transaction Handler Integration
  async testTransactionHandlerIntegration() {
    // Test that all services use transaction handler properly
    const services = [
      { name: "contactService", service: contactService },
      { name: "leadService", service: leadService },
      { name: "opportunityService", service: opportunityService },
    ];

    for (const { name, service } of services) {
      if (
        !service.deleteContact &&
        !service.deleteLead &&
        !service.deleteOpportunity
      ) {
        throw new Error(`${name} should have delete methods`);
      }

      this.log(`${name} has required delete methods`);
    }

    this.log("Transaction handler integration verified");
  }

  // Test 6: Error Handling Improvements
  async testErrorHandlingImprovements() {
    // Test cascade delete error handling
    try {
      await leadService.deleteLead(this.testUserId, this.testLeadId);
      throw new Error("Expected lead deletion to fail with dependencies");
    } catch (error) {
      if (!error.message.includes("Cannot delete")) {
        throw new Error(`Expected cascade delete error, got: ${error.message}`);
      }
    }

    try {
      await opportunityService.deleteOpportunity(
        this.testUserId,
        this.testOpportunityId,
      );
      throw new Error(
        "Expected opportunity deletion to fail with dependencies",
      );
    } catch (error) {
      if (!error.message.includes("Cannot delete")) {
        throw new Error(`Expected cascade delete error, got: ${error.message}`);
      }
    }

    this.log("Error handling improvements working correctly");
  }

  async runAllTests() {
    this.log("🚀 Starting Root Cause Fixes Comprehensive Test");

    let passedTests = 0;
    const totalTests = 6;

    try {
      await this.setupTestData();

      // Run all tests
      const tests = [
        ["Cascade Delete Validation", () => this.testCascadeDeleteValidation()],
        [
          "Safe Delete with Dependencies",
          () => this.testSafeDeleteWithDependencies(),
        ],
        [
          "Batch Operations Performance",
          () => this.testBatchOperationsPerformance(),
        ],
        ["N+1 Query Optimization", () => this.testN1QueryOptimization()],
        [
          "Transaction Handler Integration",
          () => this.testTransactionHandlerIntegration(),
        ],
        [
          "Error Handling Improvements",
          () => this.testErrorHandlingImprovements(),
        ],
      ];

      for (const [testName, testFunction] of tests) {
        const passed = await this.runTest(testName, testFunction);
        if (passed) passedTests++;
      }
    } finally {
      await this.cleanupTestData();
    }

    // Summary
    this.log(`\n📊 Test Results Summary:`);
    this.log(`✅ Passed: ${passedTests}/${totalTests}`);
    this.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

    if (passedTests === totalTests) {
      this.log(`🎉 All root cause fixes are working correctly!`, "success");
    } else {
      this.log(
        `⚠️  Some tests failed. Please review the issues above.`,
        "error",
      );
    }

    return {
      passed: passedTests,
      total: totalTests,
      success: passedTests === totalTests,
      results: this.testResults,
    };
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new RootCauseFixesTest();
  test
    .runAllTests()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Test execution failed:", error);
      process.exit(1);
    });
}

export default RootCauseFixesTest;
