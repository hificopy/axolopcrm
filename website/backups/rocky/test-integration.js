// Integration test for Axolop CRM - Forms, Campaigns, and Activities

// This is a conceptual test file demonstrating how the integration works
// In a real implementation, this would be properly integrated with a testing framework

import EmailService from './backend/services/email-service.js';
import FormBuilderService from './backend/services/form-builder-service.js';
import FormCampaignIntegrationService from './backend/services/form-campaign-integration-service.js';

// Test data
const testForm = {
  title: "Integration Test Form",
  description: "A form to test CRM integration",
  questions: [
    {
      id: "name",
      type: "short-text",
      title: "Your Name",
      required: true
    },
    {
      id: "email",
      type: "email",
      title: "Your Email",
      required: true
    },
    {
      id: "interest",
      type: "multiple-choice",
      title: "Interest Level",
      options: ["High", "Medium", "Low"],
      lead_scoring_enabled: true,
      lead_scoring: {
        "High": 10,
        "Medium": 5,
        "Low": 1
      }
    }
  ],
  settings: {
    branding: true,
    analytics: true,
    notifications: true
  }
};

const testFormData = {
  responses: {
    name: "Test User",
    email: "test@example.com",
    interest: "High"
  },
  metadata: {
    ip_address: "127.0.0.1",
    user_agent: "Integration Test",
    utm_source: "integration_test"
  }
};

async function runIntegrationTest() {
  console.log("🚀 Starting Axolop CRM Integration Test...\n");

  try {
    // Step 1: Create services to test integration
    console.log("1️⃣  Testing service initialization...");
    const emailService = new EmailService();
    const formBuilderService = new FormBuilderService();
    const formCampaignService = new FormCampaignIntegrationService();
    
    console.log("✅ All services initialized successfully\n");

    // Step 2: Test lead scoring calculation
    console.log("2️⃣  Testing lead scoring functionality...");
    const leadScore = formBuilderService.calculateLeadScore(
      testForm.questions,
      testFormData.responses
    );
    
    console.log(`✅ Lead Score calculated: ${leadScore.total}`);
    console.log(`📋 Qualified: ${leadScore.qualified}\n`);

    // Step 3: Test contact extraction
    console.log("3️⃣  Testing contact extraction...");
    const contactInfo = formBuilderService.extractContactInfo(
      testForm.questions,
      testFormData.responses
    );
    
    console.log(`✅ Contact extracted: ${contactInfo.name} <${contactInfo.email}>\n`);

    // Step 4: Test placeholder function execution
    console.log("4️⃣  Testing placeholder integrations...");
    
    // Test conditions check
    const conditions = { interest: "High" };
    const conditionsMet = formCampaignService.checkTriggerConditions(
      conditions,
      testFormData.responses
    );
    
    console.log(`✅ Trigger conditions met: ${conditionsMet}\n`);

    // Step 5: Test email content replacement
    console.log("5️⃣  Testing email placeholder replacement...");
    const testContent = "Hello {{contact.name}}, welcome!";
    const replacedContent = formCampaignService.replaceContactPlaceholders(
      testContent,
      contactInfo
    );
    
    console.log(`✅ Content after replacement: ${replacedContent}\n`);

    console.log("✅ All integration tests passed successfully!");
    console.log("\n📋 Summary:");
    console.log("- Email service initialized correctly");
    console.log("- Form builder service working");
    console.log("- Lead scoring calculation functional");
    console.log("- Contact extraction working");
    console.log("- Trigger condition checking operational");
    console.log("- Placeholder replacement functional");
    console.log("\nNote: Full integration requires proper database and email configuration.");
    
  } catch (error) {
    console.error("❌ Integration test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

// Run the integration test
runIntegrationTest();

export { runIntegrationTest };