// Sidebar UX Test Script
// Run this in browser console to test all sidebar functionality

console.log("🧪 Starting Sidebar UX Tests...");

// Test 1: Collapse button positioning and visibility
const collapseButton = document.querySelector('[aria-label*="sidebar"]');
if (collapseButton) {
  console.log("✅ Collapse button found");

  // Test positioning
  const rect = collapseButton.getBoundingClientRect();
  console.log("📍 Button position:", rect);

  // Test hover states
  collapseButton.addEventListener("mouseenter", () => {
    console.log("🖱️ Collapse button hover entered");
  });

  collapseButton.addEventListener("mouseleave", () => {
    console.log("🖱️ Collapse button hover left");
  });
} else {
  console.error("❌ Collapse button not found");
}

// Test 2: Logo visibility in both states
const logo = document.querySelector('img[alt="Axolop"]');
if (logo) {
  console.log("✅ Logo found");
  console.log("🎨 Logo visibility:", logo.style.opacity);
} else {
  console.error("❌ Logo not found");
}

// Test 3: Navigation items visibility
const navItems = document.querySelectorAll('a[href*="/app/"]');
console.log(`📊 Found ${navItems.length} navigation items`);

navItems.forEach((item, index) => {
  const isVisible = item.offsetParent !== null;
  console.log(
    `🔗 Nav item ${index + 1}: ${item.textContent.trim()} - Visible: ${isVisible}`,
  );
});

// Test 4: Animation performance
const sidebar = document.querySelector(".fixed.lg\\:relative");
if (sidebar) {
  console.log("✅ Sidebar found");

  // Monitor animation performance
  let animationCount = 0;
  const observer = new MutationObserver(() => {
    animationCount++;
    console.log(`🎬 Animation detected: ${animationCount}`);
  });

  observer.observe(sidebar, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

// Test 5: Responsive behavior
function testResponsive() {
  const width = window.innerWidth;
  console.log(`📱 Screen width: ${width}px`);

  if (width < 1024) {
    console.log("📱 Mobile mode detected");
  } else {
    console.log("🖥️ Desktop mode detected");
  }
}

testResponsive();
window.addEventListener("resize", testResponsive);

// Test 6: Accessibility
console.log("♿ Testing accessibility...");
const focusableElements = document.querySelectorAll(
  "button, [href], input, select, textarea",
);
console.log(`🎯 Found ${focusableElements.length} focusable elements`);

focusableElements.forEach((element, index) => {
  element.addEventListener("focus", () => {
    console.log(`🎯 Element ${index + 1} focused:`, element);
  });
});

console.log(
  "🧪 Sidebar UX Tests initialized. Interact with the sidebar to see results.",
);
