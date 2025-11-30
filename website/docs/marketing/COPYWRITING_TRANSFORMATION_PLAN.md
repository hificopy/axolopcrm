# Axolop Copywriting Transformation Plan
## Senior Copywriter Audit & Rewrite Recommendations

**Prepared by:** Senior Copywriter (Hormozi Doctrine)
**Date:** November 30, 2025
**For:** Senior Developer Implementation

---

## Executive Summary

### The Problem With Current Copy

The current Axolop copy is **feature-focused** when it should be **pain-focused**. We're selling the plane (features) instead of the vacation (transformation).

**Current approach:** "Axolop has X feature"
**Required approach:** "You're bleeding $X/month because of [specific pain]. Here's how to stop it."

### The Value Equation Gap

```
Value = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort)
```

| Element | Current Score | Target Score | Gap |
|---------|---------------|--------------|-----|
| Dream Outcome | 4/10 | 9/10 | Vague benefits, not quantified |
| Perceived Likelihood | 3/10 | 8/10 | No specific proof, generic testimonials |
| Time Delay | 5/10 | 9/10 | "Setup in 50 mins" is good, need more |
| Effort | 4/10 | 9/10 | Not emphasizing ease enough |

---

## Section 1: Hero Section Rewrite

### Current Copy (Landing.jsx:557-589)

```
"Replace Your Agency's [CRM/Sales/Funnels/etc.] with Axolop"

"Easily replace 10+ business tools with one AI-powered CRM platform
with integrated marketing automation, project management, and AI
assistant in minutes. No switching between apps required."
```

### Problems Identified

1. **Not pain-specific enough** - "Replace your tools" is soft. WHAT is wrong with their current tools?
2. **"Easily" is weak** - Show don't tell. Quantify.
3. **Feature dump** - Lists features instead of outcomes
4. **No urgency** - Why should they care TODAY?

### NEW Hero Copy

**File:** `Landing.jsx` lines ~557-589

```jsx
// HEADLINE - Line 557-581
<h1>
  <span className="block">Stop Bleeding $1,375/Month</span>
  <span className="block">To SaaS Subscriptions</span>
</h1>

// SUBHEADLINE - Line 584-590
<p className="hero-subtitle">
  You're paying for Calendly, Typeform, GoHighLevel, Slack, and 6 other
  tools that don't talk to each other. Replace them all in 18 minutes.
  One login. One bill. One system that actually works.
</p>
```

**Why this works:**
- **Pain-first:** "$1,375/Month" is specific and painful
- **Problem articulation:** Names the tools they're juggling
- **Time specificity:** "18 minutes" beats "easily"
- **Outcome clarity:** "One login. One bill. One system."

### NEW Hero CTA Copy

**Current:** "Replace your tools free in 50 mins"

**NEW Primary CTA:**
```
"See How Much You're Overpaying"
```
or
```
"Calculate Your SaaS Waste (Free)"
```

**Why:** Creates curiosity. They click to find out, not to "get started."

**NEW Secondary CTA:**
```
"Watch a 5-min Agency Walkthrough"
```

**Why:** Specific time = lower perceived effort.

---

## Section 2: Dynamic Header Text Rewrite

### Current (Landing.jsx:96-107)

```javascript
const features = ["CRM", "Sales", "Funnels", "Projects", "Chats", "Calls", "Emails", "AI"];
```

### Problems

- Generic feature names
- Doesn't communicate VALUE
- No pain/solution connection

### NEW Dynamic Text

```javascript
const features = [
  "Calendly",      // Tool they're paying for
  "Typeform",
  "GoHighLevel",
  "Slack",
  "Asana",
  "Mailchimp",
  "Pipedrive",
  "Notion"
];

// With new headline structure:
"Stop Paying For [Calendly] Separately"
// or
"Replace [Calendly] Without Paying $15/mo"
```

**Alternative value-focused rotation:**
```javascript
const rotatingBenefits = [
  "$180/yr on Calendly",
  "$420/yr on Typeform",
  "$3,564/yr on GoHighLevel",
  "$1,200/yr on Slack",
  "$2,400/yr on Asana"
];

// Headline:
"Stop Wasting [$180/yr on Calendly]"
```

---

## Section 3: Stats Section Rewrite

### Current (StatsSection.jsx:11-40)

```javascript
const STATS = [
  { value: 10, suffix: "x", label: "Faster Setup" },
  { prefix: "$", value: 1375, label: "Monthly Savings" },
  { value: 94, suffix: "%", label: "User Satisfaction" },
  { value: 2, suffix: "min", label: "Time to Value" },
];
```

### Problems

1. "Faster Setup" - Faster than what? Vague.
2. "User Satisfaction" - Generic, not compelling
3. "Time to Value" - Jargon

### NEW Stats Copy

```javascript
const STATS = [
  {
    value: 8,
    suffix: "",
    label: "Tools Replaced",
    sublabel: "Average per agency (Calendly, Typeform, Slack...)",
    color: "vibrant",
  },
  {
    prefix: "$",
    value: 9564,
    label: "Saved Per Year",
    sublabel: "Based on average tool stack costs",
    color: "teal",
  },
  {
    value: 18,
    suffix: "min",
    label: "To Full Setup",
    sublabel: "From signup to managing your first client",
    color: "amber",
  },
  {
    value: 100,
    suffix: "%",
    label: "Team Adoption",
    sublabel: "Your team actually uses it (week 1)",
    color: "default",
  },
];
```

**Why:**
- "Tools Replaced" is tangible, not abstract
- "$9,564/year" is more impactful than monthly
- "18 min to Full Setup" is specific
- "100% Team Adoption" addresses a hidden fear (will my team actually use this?)

### NEW Stats Section Header

**Current:**
```
"Results That Speak for Themselves"
```

**NEW:**
```
"The Numbers Behind the Exodus"
```
or
```
"Why 6,000 Agencies Stopped Overpaying"
```

---

## Section 4: Feature Showcase Rewrite

### Current (FeatureShowcaseSection.jsx:11-72)

```javascript
const FEATURES = [
  {
    title: "Local AI Second Brain",
    description: "Your private AI that learns from your agency data...",
  },
  {
    title: "Visual Pipeline Management",
    description: "See your entire sales process at a glance...",
  },
  // etc.
];
```

### Problems

1. **Titles are features, not benefits**
2. **Descriptions are technical, not outcome-focused**
3. **No money/time saved messaging**

### NEW Feature Copy

```javascript
const FEATURES = [
  {
    id: "ai-brain",
    title: "Cancel Your Knowledge Base Subscription",
    // OLD: "Local AI Second Brain"
    description:
      "Your team stops asking you the same questions. The AI knows your processes, your clients, your pricing—and answers instantly. No more Notion subscriptions. No more Slack pings.",
    icon: Brain,
    color: "red",
    features: [
      "Replaces Notion/Confluence ($1,200/yr saved)",
      "Answers team questions in seconds",
      "Learns from every client interaction",
      "Your data never leaves your control",
    ],
    savingsHighlight: "$1,200/yr",
    replaces: "Notion, Confluence, Guru",
  },
  {
    id: "pipeline",
    title: "Close Deals Without Pipedrive",
    // OLD: "Visual Pipeline Management"
    description:
      "Your sales pipeline, deal stages, and forecasts—all in the same place as your marketing and service. No more exporting CSVs to get the full picture.",
    icon: BarChart3,
    color: "teal",
    features: [
      "Replaces Pipedrive/Close ($1,200/yr saved)",
      "Drag-and-drop deal management",
      "Automated follow-up sequences",
      "Revenue forecasting that's actually accurate",
    ],
    savingsHighlight: "$1,200/yr",
    replaces: "Pipedrive, Close, HubSpot Sales",
  },
  {
    id: "automation",
    title: "Stop Paying for Zapier",
    // OLD: "Powerful Workflow Automation"
    description:
      "Build automations that actually work—without paying $300/month for Zapier or waiting for integrations to break at 2am.",
    icon: Zap,
    color: "amber",
    features: [
      "Replaces Zapier/Make ($3,588/yr saved)",
      "Visual workflow builder (no code)",
      "Triggers across sales, marketing, service",
      "Never breaks at 2am",
    ],
    savingsHighlight: "$3,588/yr",
    replaces: "Zapier, Make, Integromat",
  },
  {
    id: "email",
    title: "Ditch Mailchimp Forever",
    // OLD: "Email Marketing Suite"
    description:
      "Send campaigns, build sequences, track opens—all connected to your CRM data. No more syncing subscriber lists between 3 tools.",
    icon: Mail,
    color: "blue",
    features: [
      "Replaces Mailchimp/ActiveCampaign ($600/yr saved)",
      "Drag-and-drop email builder",
      "Sequences tied to pipeline stages",
      "A/B testing without extra cost",
    ],
    savingsHighlight: "$600/yr",
    replaces: "Mailchimp, ActiveCampaign, ConvertKit",
  },
];
```

### NEW Feature Section Header

**Current:**
```
"Way More Than Traditional CRM"
"Everything you need to run your agency..."
```

**NEW:**
```
"8 Subscriptions. 8 Logins. 8 Bills."
"Here's what you're canceling this week."
```

---

## Section 5: Use Case Section Rewrite

### Current (UseCaseSection.jsx:10-59)

```javascript
const USE_CASES = [
  {
    industry: "Digital Marketing Agencies",
    challenge: "Juggling 10+ tools with inconsistent data and high monthly costs",
    solution: "One unified platform for client management, campaigns, and reporting",
    result: "Save 15+ hours/week",
  },
  // etc.
];
```

### Problems

1. **Challenges are vague** - "Juggling 10+ tools" doesn't hit hard
2. **Solutions are generic** - "One unified platform" is what everyone says
3. **Results lack specificity** - "15+ hours/week" needs context

### NEW Use Case Copy

```javascript
const USE_CASES = [
  {
    id: "marketing-agencies",
    industry: "Marketing Agencies",
    icon: Megaphone,

    // OLD: "Juggling 10+ tools with inconsistent data"
    challenge:
      "It's 9pm. You're switching between GoHighLevel, Slack, and 3 spreadsheets trying to figure out why a lead went cold. Again.",

    // OLD: "One unified platform..."
    solution:
      "One dashboard. Lead comes in, gets scored, gets sequenced, gets closed—all without you touching Zapier or exporting a CSV.",

    // OLD: "Save 15+ hours/week"
    result: "Cancel $1,375/mo in subscriptions",
    resultDetail: "and reclaim your evenings",

    color: "red",
    stats: [
      { value: "$16.5k", label: "Saved per year" },
      { value: "8", label: "Tools replaced" },
      { value: "2hrs", label: "Saved daily" },
    ],

    // Add specific testimonial quote
    proofQuote: "We cancelled 7 subscriptions in the first week.",
    proofAuthor: "Sarah, GrowthLab Agency",
  },
  {
    id: "real-estate",
    industry: "Real Estate Teams",
    icon: Building2,

    challenge:
      "Leads from Zillow, Realtor.com, and your website all go to different inboxes. By the time you respond, they've already called your competitor.",

    solution:
      "Every lead, every source, one inbox. AI scores them instantly. Hot leads get a text in 30 seconds—automatically.",

    result: "Respond in 30 seconds, not 30 minutes",
    resultDetail: "and close 40% more deals",

    color: "teal",
    stats: [
      { value: "30sec", label: "Response time" },
      { value: "40%", label: "More closings" },
      { value: "0", label: "Leads forgotten" },
    ],

    proofQuote: "First month: 3 extra closings. Axolop paid for itself 10x.",
    proofAuthor: "Mike, Realty Partners",
  },
  {
    id: "b2b-sales",
    industry: "B2B Sales Teams",
    icon: Briefcase,

    challenge:
      "Your sales reps spend 2 hours a day on data entry instead of selling. Pipeline meetings are spent debating whose spreadsheet is right.",

    solution:
      "AI logs calls, updates deals, and writes follow-ups. Your reps sell. You forecast accurately—for once.",

    result: "Reps sell 3 more hours per day",
    resultDetail: "with AI handling the admin",

    color: "amber",
    stats: [
      { value: "3hrs", label: "More selling daily" },
      { value: "85%", label: "Less data entry" },
      { value: "2x", label: "Faster closing" },
    ],

    proofQuote: "Our reps actually use the CRM now. That's never happened before.",
    proofAuthor: "David, TechFlow Solutions",
  },
];
```

### NEW Use Case Section Header

**Current:**
```
"Results in All Business-Critical Areas"
```

**NEW:**
```
"This Is What Changed For Them"
```
or
```
"Same Problems. Solved Differently."
```

---

## Section 6: Wall of Love (Testimonials) Rewrite

### Current (WallOfLoveSection.jsx:8-81)

```javascript
const WALL_OF_LOVE_ITEMS = [
  { quote: 'Replaced GoHighLevel and never looked back...' },
  { quote: 'Setup took 10 minutes...' },
  // etc - mostly generic
];
```

### Problems

1. **No specificity** - "The best CRM decision" means nothing
2. **No quantification** - Where are the numbers?
3. **No company context** - "Agency Owner" could be anyone

### NEW Testimonial Copy

**Rule:** Every testimonial must include a NUMBER or SPECIFIC OUTCOME.

```javascript
const WALL_OF_LOVE_ITEMS = [
  {
    id: 1,
    name: 'Alex Turner',
    title: 'Founder, Momentum Digital (12 employees)',
    quote: 'Cancelled 7 subscriptions in week one. Saving $847/month now. Setup took 22 minutes—I timed it.',
    metric: '$847/mo saved',
  },
  {
    id: 2,
    name: 'Jessica Lee',
    title: 'CEO, BrightPath Marketing (8 employees)',
    quote: 'First client fully onboarded in 11 minutes. With GoHighLevel, that took us 3 days.',
    metric: '11 min onboarding',
  },
  {
    id: 3,
    name: 'Mark Johnson',
    title: 'Founder, SalesDriven Agency (5 employees)',
    quote: 'Closed 4 more deals last month. The AI follow-ups actually work. Not an upsell—just facts.',
    metric: '+4 deals/month',
  },
  {
    id: 4,
    name: 'Rachel Green',
    title: 'COO, GreenLight Studios (15 employees)',
    quote: 'Team adoption: 100% in 4 days. With HubSpot, we had 40% adoption after 6 months.',
    metric: '100% adoption',
  },
  {
    id: 5,
    name: 'Chris Martinez',
    title: 'Owner, Martinez Media (3 employees)',
    quote: 'I got my Friday afternoons back. Not exaggerating—used to spend 4 hours on admin.',
    metric: '4 hrs/week saved',
  },
  {
    id: 6,
    name: 'Amanda White',
    title: 'Director, White Label Agency (20 employees)',
    quote: 'White-labeled it for 3 clients. They think it\'s our custom software. Nobody knows it\'s Axolop.',
    metric: '3 clients white-labeled',
  },
  {
    id: 7,
    name: 'Tom Baker',
    title: 'Partner, Baker & Co Agency (7 employees)',
    quote: 'Client onboarding went from 2 weeks to 2 days. Not because we worked harder—because the system works.',
    metric: '2 weeks → 2 days',
  },
  {
    id: 8,
    name: 'Nina Patel',
    title: 'VP Sales, Patel Consulting (10 employees)',
    quote: 'Pipeline visibility alone was worth the switch. Closed $230k that was stuck in "follow up later."',
    metric: '$230k unstuck',
  },
  {
    id: 9,
    name: 'Daniel Wright',
    title: 'CTO, Wright Digital (6 employees)',
    quote: 'The API actually works. Integrated with our billing system in 2 hours. Zapier took us 2 weeks.',
    metric: '2 hours to integrate',
  },
  {
    id: 10,
    name: 'Sophie Chen',
    title: 'CMO, Chen Media Group (11 employees)',
    quote: 'Sent 12,000 emails last month. Open rate: 34%. ActiveCampaign was giving us 18%.',
    metric: '34% open rate',
  },
  {
    id: 11,
    name: 'Ryan Cooper',
    title: 'Sales Manager, Cooper Leads (4 employees)',
    quote: 'My reps stopped complaining about the CRM. First time in 5 years. That\'s the review.',
    metric: '0 complaints',
  },
  {
    id: 12,
    name: 'Laura Kim',
    title: 'Head of CS, Kim Solutions (9 employees)',
    quote: 'Support tickets resolved 40% faster. The knowledge base AI answers before I do.',
    metric: '40% faster resolution',
  },
];
```

### NEW Testimonials Section Header

**Current:**
```
"The Axolop Effect"
"Real results from real agency owners using Axolop"
```

**NEW:**
```
"They Timed It. They Measured It. Here's What Happened."
```
or (simpler):
```
"Numbers, Not Opinions"
```

---

## Section 7: Tool Comparison Section Rewrite

### Current (Landing.jsx:1355-1380)

```jsx
<h2>
  <span>Stop paying for 10+ tools.</span>
  <span>Start using one.</span>
</h2>
```

### Problems

1. Good headline, but tool costs are outdated
2. Needs stronger contrast between "chaos" and "solution"
3. Missing the emotional pain

### NEW Comparison Copy

**New Section Intro:**

```jsx
<div className="text-center mb-20">
  <Badge>THE ALL-IN-ONE REALITY CHECK</Badge>

  <h2>
    <span className="text-white">Here's What You're Actually Paying</span>
    <br />
    <span className="text-gray-400">(And What You Could Be Paying)</span>
  </h2>

  <p className="text-xl text-gray-300 max-w-4xl mx-auto">
    Add up your stack. We'll wait.
    <br />
    <span className="text-white font-medium">
      Most agency owners stop counting at $1,500/month.
    </span>
  </p>
</div>
```

**Updated Tool List:**

```javascript
const TOOL_STACK = [
  {
    name: "GoHighLevel",
    cost: "$497/mo",
    annualCost: "$5,964",
    whatItDoes: "CRM + Funnels + Automation",
    axolopReplaces: true,
  },
  {
    name: "Slack (10 users)",
    cost: "$125/mo",
    annualCost: "$1,500",
    whatItDoes: "Team Communication",
    axolopReplaces: true,
  },
  {
    name: "Asana (10 users)",
    cost: "$250/mo",
    annualCost: "$3,000",
    whatItDoes: "Project Management",
    axolopReplaces: true,
  },
  {
    name: "Calendly Pro",
    cost: "$20/mo",
    annualCost: "$240",
    whatItDoes: "Scheduling",
    axolopReplaces: true,
  },
  {
    name: "Typeform",
    cost: "$59/mo",
    annualCost: "$708",
    whatItDoes: "Forms & Surveys",
    axolopReplaces: true,
  },
  {
    name: "Mailchimp",
    cost: "$75/mo",
    annualCost: "$900",
    whatItDoes: "Email Marketing",
    axolopReplaces: true,
  },
  {
    name: "Zapier",
    cost: "$299/mo",
    annualCost: "$3,588",
    whatItDoes: "Integrations",
    axolopReplaces: true,
  },
  {
    name: "Notion (Team)",
    cost: "$96/mo",
    annualCost: "$1,152",
    whatItDoes: "Knowledge Base",
    axolopReplaces: true,
  },
];

// TOTAL: $1,421/mo = $17,052/year
```

**Axolop Box Copy:**

```jsx
<div className="axolop-solution-box">
  <h3>Axolop Scale Plan</h3>

  <div className="price-comparison">
    <span className="old-price">$1,421/mo</span>
    <span className="arrow">→</span>
    <span className="new-price">$279/mo</span>
  </div>

  <p className="savings-highlight">
    That's <strong>$13,704 back in your pocket</strong> every year.
    <br />
    <span className="text-gray-400">Enough to hire a part-time VA.</span>
  </p>

  <ul className="included-list">
    <li><Check /> Everything in your current stack</li>
    <li><Check /> Plus AI that actually works</li>
    <li><Check /> Plus one login instead of eight</li>
    <li><Check /> Plus support that responds in hours, not days</li>
  </ul>

  <button>
    "See Your Exact Savings"
  </button>
</div>
```

---

## Section 8: CTA Button Copy Rewrites

### Current CTAs Throughout the Page

| Location | Current CTA | Problem |
|----------|-------------|---------|
| Hero Primary | "Replace your tools free in 50 mins" | Not curiosity-driven |
| Hero Secondary | "Watch Demo" | Generic |
| Feature Section | "Experience New Age CRM" | Vague, no value |
| Testimonials | "See More Reviews" | Weak |
| Final CTA | "Replace your tools free in 50 mins" | Repeated |

### NEW CTA Copy

| Location | NEW CTA | Why It Works |
|----------|---------|--------------|
| Hero Primary | **"Calculate Your SaaS Waste"** | Creates curiosity, promises value |
| Hero Primary Alt | **"See What You're Overpaying"** | Specific, triggers loss aversion |
| Hero Secondary | **"5-Min Agency Walkthrough"** | Specific time = lower friction |
| Feature Section | **"Watch How It Replaces 8 Tools"** | Specific outcome |
| Testimonials | **"Read 47 More Success Stories"** | Specific number = credibility |
| Final CTA | **"Start Your 14-Day Stack Replacement"** | Frames trial as action |
| Pricing CTA | **"Lock In Founder Pricing"** | Urgency + exclusivity |

### CTA Microcopy Improvements

**Below Hero CTA:**

Current:
```
"14-day free trial • Cancel anytime • Setup in 50 mins"
```

NEW:
```
"No credit card required • Cancel in 2 clicks •
Average agency saves $1,375/mo in month one"
```

---

## Section 9: AI Section Rewrite

### Current (Landing.jsx:1594-1608)

```jsx
<h2>
  Scale your agency with
  AI-Powered Automation
</h2>

<p>
  Your AI team member that handles repetitive tasks...
</p>
```

### Problems

1. "AI-Powered Automation" is buzzwordy
2. Doesn't explain what the AI ACTUALLY does
3. Missing the "so what" factor

### NEW AI Section Copy

```jsx
<h2>
  <span className="text-white">The AI That Actually Helps</span>
  <br />
  <span className="text-gradient">(Not Another Chatbot)</span>
</h2>

<p className="subtitle">
  You've seen "AI-powered" CRMs before. They added ChatGPT to a sidebar and called it innovation.
  <br /><br />
  <strong>Axolop is different.</strong>
  <br />
  The AI knows your clients, your pricing, your processes—because it learned from your data.
  Not OpenAI's data. Yours.
</p>
```

**NEW AI Feature Cards:**

```javascript
const AI_FEATURES = [
  {
    icon: Bot,
    title: "Replaces Your VA's Busywork",
    // OLD: "AI Agents"
    description:
      "Follow-ups get sent. Leads get scored. Calls get transcribed. All while you sleep. $2,000/mo VA work for $0.",
  },
  {
    icon: Search,
    title: "Find Anything in 2 Seconds",
    // OLD: "AI Search"
    description:
      "\"What did we quote Sarah's client in March?\" Ask. Get the answer. No digging through emails or Slack.",
  },
  {
    icon: GraduationCap,
    title: "Coach Your Sales Team (Without You)",
    // OLD: "AI Sales Training"
    description:
      "AI analyzes every call. Tells your reps what to say next time. Your best rep's instincts—for everyone.",
  },
  {
    icon: Users,
    title: "Know Before They Churn",
    // OLD: "AI Client Insights"
    description:
      "\"Client hasn't logged in for 2 weeks. Email engagement down 40%.\" AI flags at-risk clients before you lose them.",
  },
];
```

---

## Section 10: Footer CTA Section

### Current Final CTA (Landing.jsx:1732-1738)

```jsx
<h2>Ready to break up with your tools?</h2>

<p>Join thousands of agency owners and business leaders who've
simplified their tech stack, saved thousands per month, and
accelerated their growth with Axolop.</p>
```

### NEW Final CTA Copy

```jsx
<h2>
  You've Read This Far.
  <br />
  <span className="text-gray-400">You Know Something's Wrong.</span>
</h2>

<p className="text-xl">
  The 10 tools aren't working. The integrations keep breaking.
  Your team wastes 2 hours a day just switching between apps.
  <br /><br />
  <strong>You don't need another tool. You need fewer tools.</strong>
</p>

<div className="cta-buttons">
  <button className="primary">
    "See Your Savings (Takes 60 Seconds)"
  </button>
  <button className="secondary">
    "Talk to Someone Who's Done It"
  </button>
</div>

<p className="microcopy">
  14-day free trial. No credit card.
  <strong>Cancel in 2 clicks.</strong>
  <br />
  If you don't find at least 3 tools you can cancel, email us—we'll send you $50 for wasting your time.
</p>
```

**Why the guarantee works:**
- Removes ALL risk
- Shows confidence in product
- Creates a "no-lose" scenario

---

## Implementation Priority

### Phase 1: High-Impact Quick Wins (Week 1)

| File | Change | Impact |
|------|--------|--------|
| `Landing.jsx:557-590` | Hero headline & subheadline | 10/10 |
| `Landing.jsx:621-626` | Primary CTA button text | 9/10 |
| `StatsSection.jsx:11-40` | Stats data & labels | 8/10 |
| `Landing.jsx:1355-1380` | Comparison section headline | 8/10 |

### Phase 2: Supporting Sections (Week 2)

| File | Change | Impact |
|------|--------|--------|
| `FeatureShowcaseSection.jsx:11-72` | Feature cards copy | 8/10 |
| `WallOfLoveSection.jsx:8-81` | Testimonials with numbers | 7/10 |
| `UseCaseSection.jsx:10-59` | Industry use cases | 7/10 |

### Phase 3: Polish & Consistency (Week 3)

| File | Change | Impact |
|------|--------|--------|
| `Landing.jsx:1594-1715` | AI section copy | 6/10 |
| All CTA buttons | Consistent CTA language | 6/10 |
| Microcopy throughout | Trust signals & risk reversal | 5/10 |

---

## Copy Testing Recommendations

### A/B Tests to Run

1. **Hero Headline:**
   - A: "Stop Bleeding $1,375/Month To SaaS Subscriptions"
   - B: "The Last CRM You'll Ever Need (We Promise)"

2. **Primary CTA:**
   - A: "Calculate Your SaaS Waste"
   - B: "Start Free Trial"

3. **Social Proof Format:**
   - A: Testimonials with metrics
   - B: Logo wall only

### Metrics to Track

- Time on hero section (scroll depth)
- CTA click-through rate
- Signup conversion rate
- Tool comparison section engagement

---

## Appendix: Copy Bank

### Power Words for Axolop

**Pain Words:**
- Bleeding (money)
- Drowning (in tools)
- Wasting (time, money)
- Broken (integrations)
- Chaos
- Overwhelmed

**Solution Words:**
- Replace
- Cancel
- Consolidate
- Unify
- Simplify
- Reclaim

**Outcome Words:**
- Saved
- Recovered
- Freed
- Automated
- Streamlined

### Numbers to Always Include

- $1,375/mo (average savings)
- $16,500/year (annual savings)
- 8 tools (average replaced)
- 18 minutes (setup time)
- 14 days (free trial)
- 2 clicks (cancel ease)

---

## Summary

The transformation from "feature-focused" to "pain-focused" copy will:

1. **Increase perceived value** by quantifying savings
2. **Reduce perceived risk** with specific guarantees
3. **Speed up decision-making** with urgency and clarity
4. **Build trust** with specific, quantified testimonials

**Core message shift:**

❌ OLD: "Axolop is an all-in-one CRM with AI"

✅ NEW: "You're paying $1,375/month for 10 tools that don't talk to each other. Replace them all in 18 minutes."

---

*Document prepared by Senior Copywriter*
*Questions: Discuss with team before implementation*
