// Test script to verify onboarding functionality
const puppeteer = require("puppeteer");

async function testOnboarding() {
  console.log("🧪 Testing onboarding flow...");

  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Enable console logging from the page
    page.on("console", (msg) => {
      console.log("Browser console:", msg.text());
    });

    // Navigate to onboarding
    await page.goto("http://localhost:3000/onboarding");
    await page.waitForSelector("body", { timeout: 5000 });

    console.log("✅ Page loaded");

    // Wait for intro screen
    await page.waitForSelector("button", { timeout: 10000 });
    console.log("✅ Intro screen loaded");

    // Click "Get Started" button
    await page.click("button");
    console.log("✅ Get Started clicked");

    // Wait for questions to load
    await page.waitForSelector('[data-testid="question-title"]', {
      timeout: 10000,
    });
    console.log("✅ Questions loaded");

    // Take screenshot
    await page.screenshot({ path: "onboarding-test.png" });
    console.log("📸 Screenshot saved");

    await browser.close();
    console.log("✅ Test completed successfully");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testOnboarding();
