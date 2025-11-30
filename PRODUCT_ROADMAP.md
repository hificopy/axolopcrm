# AXOLOP CRM - PRODUCT ROADMAP
## Director of Product Research | Last Updated: November 2025

---

# EXECUTIVE SUMMARY

**Mission:** Build the unified CRM that replaces 10+ tools for agency owners—maximizing LTV through constraint-focused development.

**Current Product State:** V1.3 (Beta) - 80+ features implemented, competing against GoHighLevel, ClickFunnels, Monday.com, Perspective Funnels, DocuSign.

**Primary ICP (Ideal Customer Profile):**
- Real estate agents, insurance brokers, marketing agencies
- Revenue: $100k-$500k/year
- Team: Solo or 1-5 employees
- Pain: Leads falling through cracks, tool fragmentation
- Tech Level: Comfortable but not technical

---

# PART 1: CURRENT STATE ANALYSIS

## FEATURE INVENTORY

### CORE CRM (Fully Implemented)
| Feature | Status | Maturity | Notes |
|---------|--------|----------|-------|
| Contacts Management | ✅ Live | High | Full CRUD, custom fields, import |
| Leads Management | ✅ Live | High | Lead capture, scoring, conversion |
| Pipeline/Opportunities | ✅ Live | High | Visual drag-drop, stage management |
| Activities/Timeline | ✅ Live | High | Full audit trail |

### COMMUNICATION (Partially Implemented)
| Feature | Status | Maturity | Notes |
|---------|--------|----------|-------|
| Email Marketing | ✅ Live | Medium | SendGrid integration, campaigns |
| Inbox (Unified) | 🔒 V1.3 | Framework | IMAP sync ready, locked |
| Conversations | ✅ Live | Medium | Threading, email history |
| Calls | ✅ Live | Medium | Twilio integration |
| Team Chat | 🔒 V1.1 | Framework | UI exists, locked |
| SMS/WhatsApp | ❌ Not built | None | Twilio can support |

### MARKETING & AUTOMATION
| Feature | Status | Maturity | Notes |
|---------|--------|----------|-------|
| Form Builder | ✅ Live | Very High | 109KB, drag-drop, conditional logic |
| Workflow Builder | 🔒 V1.1 | High | Powerful engine, partially locked |
| Funnels | 🟡 Beta | Medium | Funnel builder started |
| Link in Bio | 🔒 V1.1 | Framework | Landing pages, locked |
| Content | 🔒 V1.1 | Framework | Content management, locked |

### SCHEDULING & CALENDAR
| Feature | Status | Maturity | Notes |
|---------|--------|----------|-------|
| Calendar | ✅ Live | High | Google Calendar sync |
| Meetings | ✅ Live | High | Booking links, scheduling |
| Meeting Intelligence | ✅ Live | Medium | AI analysis of meetings |

### AI & INTELLIGENCE
| Feature | Status | Maturity | Notes |
|---------|--------|----------|-------|
| Second Brain | ✅ Live | High | RAG-based knowledge base |
| AI Call Analysis | ✅ Live | Medium | Call transcription, insights |
| AI Assistant | ✅ Live | Medium | General AI helper |
| Mind Maps | ✅ Live | Medium | Visual knowledge organization |

### TEAM & COLLABORATION
| Feature | Status | Maturity | Notes |
|---------|--------|----------|-------|
| Agency Management | ✅ Live | High | Multi-user, teams |
| Projects | 🔒 V1.2 | Framework | Project management, locked |
| Task Lists | 🔒 V1.2 | Framework | Todo management, locked |
| Boards (Kanban) | 🔒 V1.2 | Framework | Visual boards, locked |
| Roles & Permissions | ✅ Live | Medium | RBAC implemented |

### SERVICE & SUPPORT
| Feature | Status | Maturity | Notes |
|---------|--------|----------|-------|
| Tickets | 🔒 V1.1 | Framework | Support ticketing, locked |
| Knowledge Base | 🔒 V1.1 | Framework | Help docs, locked |
| Customer Portal | 🔒 V1.1 | Framework | Client portal, locked |

### ANALYTICS & REPORTING
| Feature | Status | Maturity | Notes |
|---------|--------|----------|-------|
| Agency Analytics | ✅ Live | Medium | Dashboard, KPIs |
| Reports | 🔒 V1.1 | Framework | Custom reports, locked |
| Form Analytics | ✅ Live | Medium | Form response tracking |

### INTEGRATIONS
| Feature | Status | Maturity | Notes |
|---------|--------|----------|-------|
| Google (OAuth, Calendar, Gmail) | ✅ Live | High | Full integration |
| SendGrid | ✅ Live | High | Email delivery |
| Stripe | ✅ Live | High | Payments |
| Twilio | ✅ Live | Medium | Calls/SMS |
| Zapier | ❌ Not built | None | CRITICAL GAP |
| Slack | ❌ Not built | None | Competitive gap |
| QuickBooks/Accounting | ❌ Not built | None | Enterprise need |

### MOBILE
| Feature | Status | Maturity | Notes |
|---------|--------|----------|-------|
| Responsive Web | ✅ Live | Medium | Mobile-responsive |
| iOS App | ❌ Not built | None | CRITICAL GAP |
| Android App | ❌ Not built | None | CRITICAL GAP |

---

# PART 2: USER JOURNEY ANALYSIS

## HYPOTHESIZED USER JOURNEY (Needs Validation with Real Data)

```
SIGNUP → ONBOARDING → FIRST VALUE → HABIT → POWER USER → ADVOCATE
```

### Step-by-Step Funnel (Estimated Drop-offs)

| Step | Action | Est. Completion | Est. Drop-off | Constraint? |
|------|--------|-----------------|---------------|-------------|
| 1 | Signs up | 100% | - | |
| 2 | Completes onboarding | 75% | 25% | 🟡 Medium |
| 3 | Creates first contact | 65% | 10% | |
| 4 | Creates first pipeline | 50% | 15% | 🟡 Medium |
| 5 | Adds first deal | 40% | 10% | |
| 6 | **Sends first email** | 20% | **50%** | 🔴 **CONSTRAINT** |
| 7 | Closes first deal | 15% | 5% | |
| 8 | Connects integration | 12% | 3% | |
| 9 | Invites team member | 8% | 4% | |
| 10 | Daily active user | 5% | 3% | |

### THE CONSTRAINT HYPOTHESIS

**Primary Constraint: Email Activation (50% drop-off at "Send First Email")**

**Why users likely drop off at email:**
1. No pre-built templates to reduce friction
2. Email sync setup is complex (IMAP configuration)
3. Gmail OAuth requires technical understanding
4. No "quick win" email option
5. Users don't see immediate value

**Secondary Constraints:**
1. Onboarding completion (25% drop-off) - needs simplification
2. Pipeline creation (15% drop-off) - needs guided setup
3. Team invitation (4% drop-off) - needs clearer value proposition

---

# PART 3: COMPETITIVE ANALYSIS

## FEATURE MATRIX: AXOLOP vs. COMPETITORS

| Feature | Axolop | GoHighLevel | ClickFunnels | Monday | DocuSign | Perspective |
|---------|--------|-------------|--------------|--------|----------|-------------|
| **CRM Core** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Pipeline** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Email Marketing** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Form Builder** | ✅ High | ✅ | ✅ High | ✅ | ❌ | ✅ High |
| **Funnel Builder** | 🟡 Beta | ✅ High | ✅ Very High | ❌ | ❌ | ✅ High |
| **Workflow Automation** | 🔒 Locked | ✅ High | ✅ | ✅ High | ❌ | ✅ |
| **Calendar/Booking** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **AI Features** | ✅ Unique | 🟡 Basic | ❌ | 🟡 Basic | ❌ | ❌ |
| **Second Brain** | ✅ Unique | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Mobile App** | ❌ Gap | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Zapier/Integrations** | ❌ Gap | ✅ | ✅ | ✅ High | ✅ | ✅ |
| **White Label** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Document Signing** | ❌ Gap | ✅ | ❌ | ❌ | ✅ Core | ❌ |
| **Price** | $99/mo | $297/mo | $147/mo | $49/mo | $25/mo | €39/mo |

## COMPETITIVE GAPS (Opportunities)

### CRITICAL GAPS (Table Stakes - Customers Expect These)
1. **Mobile App** - Every competitor has one. Users work in field.
2. **Zapier Integration** - Standard for SaaS. Blocks enterprise deals.
3. **SMS/WhatsApp** - GoHighLevel differentiator. High-intent channel.

### STRATEGIC GAPS (Differentiation Opportunities)
1. **Document Signing** - DocuSign competitor. Close deals in-app.
2. **White Label** - GoHighLevel's moat. Agency reseller opportunity.
3. **Advanced Funnels** - ClickFunnels/Perspective strength.

### AXOLOP ADVANTAGES (Double Down)
1. **Second Brain/AI** - Unique. No competitor has RAG-based knowledge.
2. **Form Builder** - Very mature (109KB). Strong foundation.
3. **Price** - $99 vs $297 (GoHighLevel) = 3x cheaper.
4. **All-in-One** - Truly unified vs. fragmented competitors.

---

# PART 4: THE ROADMAP

## NOW (Current Sprint - Next 2 Weeks)

**Focus: Solve THE CONSTRAINT (Email Activation)**

| Priority | Feature | RICE Score | Why | Success Metric | Status |
|----------|---------|------------|-----|----------------|--------|
| P0 | Email Templates Library | 32 | Reduces friction to first email | +30% first email rate | Planned |
| P0 | One-Click Gmail Connect | 28 | Simplifies email sync | +40% integration adoption | Planned |
| P1 | Onboarding Checklist | 24 | Guides users to activation | +15% onboarding completion | Planned |
| P1 | "Send Your First Email" Prompt | 20 | Triggers action | +20% first email rate | Planned |
| P2 | Quick Pipeline Templates | 18 | Reduces setup friction | +10% pipeline creation | Planned |

### RICE Calculation: Email Templates Library
- **Reach:** 9 (90% of users need email)
- **Impact:** 10 (directly hits activation point)
- **Confidence:** 80% (competitor validated)
- **Effort:** 2 (2-3 weeks)
- **Base RICE:** (9 × 10 × 0.8) / 2 = 36
- **LTV Multiplier:** 2x (activation feature) = 72
- **Adjusted for quick win:** 32

---

## NEXT (Q1 2026 - Next Quarter)

**Focus: Mobile + Integration Gaps + Unlock V1.1 Features**

| Priority | Feature | RICE Score | Why | Research Status |
|----------|---------|------------|-----|-----------------|
| P0 | Mobile App (iOS MVP) | 48 | Table stakes, field workers | ✅ Competitor validated |
| P0 | Zapier Integration | 42 | Enterprise blocker, stickiness | ✅ Customer requests |
| P1 | Unlock Workflows (V1.1) | 38 | Automation is core value | ✅ Already built |
| P1 | SMS/WhatsApp Messaging | 36 | High-intent channel | ✅ Twilio ready |
| P2 | AI Email Writer | 34 | Activation + differentiation | ✅ Tech validated |
| P2 | Unlock Projects (V1.2) | 28 | Team collaboration | 🟡 Needs validation |

### RICE Calculation: Mobile App (iOS)
- **Reach:** 10 (100% of users benefit)
- **Impact:** 8 (retention driver, not direct LTV)
- **Confidence:** 90% (every competitor has it)
- **Effort:** 8 (3+ months React Native)
- **Base RICE:** (10 × 8 × 0.9) / 8 = 9
- **LTV Multiplier:** 2x (reduces churn) = 18
- **Strategic Priority Boost:** +30 (table stakes) = **48**

---

## LATER (Q2-Q3 2026 - 6 Months)

**Focus: Enterprise Readiness + Platform Expansion**

| Theme | Features | Strategic Goal | Research Needed |
|-------|----------|----------------|-----------------|
| **Enterprise** | SSO, RBAC enhancements, Audit logs | $500+/mo customers | Win/loss analysis |
| **Integrations** | Slack, QuickBooks, Zoom, HubSpot import | Increase stickiness | Integration usage data |
| **Advanced Funnels** | Full funnel builder, A/B testing | ClickFunnels parity | Funnel conversion data |
| **Document Signing** | E-signatures, contracts | DocuSign replacement | Customer interviews |

### Unlock Schedule for Locked Features
| Feature Set | Current Lock | Unlock Target | Dependencies |
|-------------|--------------|---------------|--------------|
| Workflows | V1.1 | Q1 2026 | None - ready |
| Team Chat | V1.1 | Q2 2026 | Mobile app |
| Projects/Boards | V1.2 | Q2 2026 | Team Chat |
| Email Marketing Enhanced | V1.3 | Q1 2026 | Email templates |
| Tickets/Support | V1.1 | Q3 2026 | Customer Portal |

---

## FUTURE (12+ Months - Vision)

**Focus: Platform Leadership + AI Moat**

| Vision Feature | Dream Outcome | Feasibility | Market Timing |
|----------------|---------------|-------------|---------------|
| White Label Platform | Agencies resell Axolop | High | Test demand Q2 2026 |
| AI Sales Agent | Close deals autonomously | Low (tech maturing) | 2-3 years |
| Predictive Lead Scoring | Know winners before calling | Medium | 1-2 years |
| Voice AI (calls) | AI makes follow-up calls | Medium | 1-2 years |
| Full DocuSign Replacement | Contracts, e-sign, notary | High | 12-18 months |

---

# PART 5: ACTIVATION MILESTONES

## TARGET ACTIVATION POINTS

Based on typical CRM activation patterns and product analysis:

| Milestone | Timeframe | Action | Target % | Churn Risk if Missed |
|-----------|-----------|--------|----------|---------------------|
| **M1: First Contact** | Day 1 | Create 1 contact | 80% | 40% churn |
| **M2: Pipeline Setup** | Day 1 | Create first pipeline | 70% | 45% churn |
| **M3: First Email** | Day 3 | Send 1 email via Axolop | 50% | 60% churn |
| **M4: Integration** | Day 7 | Connect Google/email | 40% | 50% churn |
| **M5: First Deal** | Day 14 | Move deal to "Won" | 30% | 55% churn |
| **M6: Team Invite** | Day 14 | Add 1 team member | 20% | 30% churn |
| **M7: Automation** | Day 30 | Create 1 workflow | 15% | 25% churn |
| **M8: Power User** | Day 30 | Daily active, 5+ features | 10% | 10% churn |

## ACTIVATION-FOCUSED ROADMAP FEATURES

| Feature | Activation Point | Expected Lift |
|---------|------------------|---------------|
| Onboarding checklist with progress | M1, M2, M3 | +25% activation |
| Email templates | M3 | +30% email activation |
| Pre-built pipeline templates | M2 | +20% pipeline creation |
| "Quick win" prompts | M3, M5 | +15% action rates |
| Integration wizard | M4 | +35% integration adoption |
| Team invitation rewards | M6 | +40% team expansion |

---

# PART 6: FEATURE VALIDATION FRAMEWORK

## VALIDATION CHECKLIST (Before Any Feature Enters Build)

### Stage 1: Problem Validation
- [ ] 5+ customer interviews confirm the problem exists
- [ ] Support ticket data shows pattern (>10 related tickets)
- [ ] Churn interviews mention this as reason (>5%)
- [ ] Competitor has this feature (competitor validation)

### Stage 2: Solution Validation
- [ ] RICE score calculated and >15
- [ ] Prototype/mockup tested with 5+ users
- [ ] Users understand what it does without explanation
- [ ] Users say they would use it (not just "nice to have")

### Stage 3: Impact Validation
- [ ] Clear metric identified (what moves if successful?)
- [ ] Baseline metric measured
- [ ] Target improvement defined (e.g., +20%)
- [ ] LTV impact hypothesized (retention, revenue, expansion)

### Stage 4: Feasibility Validation
- [ ] Engineering effort estimated (weeks/months)
- [ ] Technical dependencies identified
- [ ] No blockers from existing architecture
- [ ] Resources available in timeline

---

## RICE SCORING TEMPLATE

### Formula
```
RICE Score = (Reach × Impact × Confidence) / Effort
```

### Scoring Guide

**REACH (% of users affected)**
| Score | Criteria |
|-------|----------|
| 10 | 80%+ of users |
| 7 | 50-80% of users |
| 4 | 20-50% of users |
| 1 | <20% of users |

**IMPACT (LTV effect)**
| Score | Criteria |
|-------|----------|
| 10 | Direct revenue/retention increase (proven) |
| 7 | Likely retention increase (strong hypothesis) |
| 4 | Experience improvement (unclear LTV) |
| 1 | Nice-to-have (no measurable LTV) |

**CONFIDENCE (certainty)**
| Score | Criteria |
|-------|----------|
| 100% | Data proves this works |
| 80% | Strong feedback + competitor validation |
| 50% | Good idea, needs more validation |
| 20% | Gut feeling only |

**EFFORT (engineering time)**
| Score | Time |
|-------|------|
| 1 | 1-2 weeks |
| 2 | 1 month |
| 4 | 2-3 months |
| 8 | 3-6 months |
| 16 | 6+ months |

**LTV MULTIPLIERS (apply after base score)**
| Multiplier | Criteria |
|------------|----------|
| 2x | Feature hits activation point |
| 2x | Feature reduces known churn reason |
| 1.5x | Feature enables premium pricing |

---

# PART 7: RESEARCH AGENDA

## WEEK 1 PRIORITIES (Immediate Actions)

### 1. User Journey Validation
- [ ] Set up analytics tracking for each funnel step
- [ ] Identify actual drop-off points (not hypothesized)
- [ ] Calculate current activation rates

### 2. Constraint Validation
- [ ] Confirm email is THE constraint
- [ ] Interview 5 users who dropped off at email step
- [ ] Interview 5 users who successfully sent first email

### 3. Champion/Churned Analysis
- [ ] Segment users: Champions (6+ mo), Survivors (3-6 mo), Churned (<3 mo)
- [ ] Analyze first 30 days behavior for each segment
- [ ] Identify activation patterns that predict retention

### 4. Feature Request Audit
- [ ] Compile all feature requests from:
  - Support tickets
  - Customer interviews
  - Sales calls
  - App store reviews (competitors)
- [ ] Score each with RICE

### 5. Competitive Deep Dive
- [ ] Sign up for GoHighLevel, ClickFunnels, Monday.com trials
- [ ] Document onboarding flow differences
- [ ] List features we lack that they have
- [ ] Read 50 competitor reviews on G2/Capterra

---

## DATA NEEDED FROM ENGINEERING/ANALYTICS

### User Funnel Metrics
```sql
-- Need these metrics:
- signup_to_onboarding_completion_rate
- onboarding_to_first_contact_rate
- first_contact_to_first_email_rate
- first_email_to_first_deal_rate
- daily_active_user_rate_by_cohort
- feature_adoption_rates (by feature)
- time_to_first_value (median, p90)
```

### Churn Analysis
```sql
-- Need these metrics:
- churn_rate_by_cohort
- churn_reasons (exit survey data)
- last_action_before_churn
- features_used_before_churn
- days_since_last_login_before_churn
```

### Activation Correlation
```sql
-- Need these metrics:
- retention_rate_by_activation_milestone
- ltv_by_feature_adoption
- expansion_revenue_by_user_segment
```

---

# PART 8: COMMUNICATION CADENCE

## Weekly Rhythm

| Day | Activity | Output |
|-----|----------|--------|
| Monday | Research review (interviews, data, tickets) | Research summary |
| Tuesday | Constraint analysis (funnel, drop-offs) | Constraint report |
| Wednesday | Feature validation (interviews, prototypes) | Validation reports |
| Thursday | Roadmap update (re-prioritize, align eng) | Updated roadmap |
| Friday | Stakeholder sync (present, get buy-in) | Presentation deck |

## Monthly Cadence

| Week | Focus |
|------|-------|
| Week 1 | Customer interviews (10-15) |
| Week 2 | Data analysis + RICE scoring |
| Week 3 | Roadmap refinement + validation |
| Week 4 | Stakeholder alignment + planning |

## Quarterly Cadence

- **Q Start:** Major roadmap review, OKR setting
- **Q Mid:** Progress check, constraint re-evaluation
- **Q End:** Retrospective, feature success analysis

---

# APPENDIX A: FEATURE REQUEST LOG

## Top Requested Features (To Be Validated)

| Feature | Source | Request Count | RICE Score | Status |
|---------|--------|---------------|------------|--------|
| Mobile app | Customer interviews | High | 48 | NEXT |
| SMS/WhatsApp | Support tickets | High | 36 | NEXT |
| Zapier | Enterprise deals | High | 42 | NEXT |
| Email templates | Onboarding feedback | Medium | 32 | NOW |
| Dark mode | UI requests | Low | 2 | FUTURE |
| Custom reports | Enterprise | Medium | TBD | LATER |
| White label | Agency partners | Medium | TBD | FUTURE |

---

# APPENDIX B: LOCKED FEATURE AUDIT

## Features Ready to Unlock (Already Built)

| Feature | Lock Version | Code Maturity | Unlock Priority |
|---------|--------------|---------------|-----------------|
| Workflows | V1.1 | High (26KB engine) | P0 - Unlock Now |
| Inbox | V1.3 | Medium (24KB) | P1 - With email templates |
| Email Marketing Enhanced | V1.3 | Medium | P1 - Q1 2026 |
| Projects | V1.2 | Low (framework) | P2 - Needs work |
| Team Chat | V1.1 | Low (framework) | P3 - After mobile |
| Tickets | V1.1 | Low (framework) | P4 - Q3 2026 |

**Recommendation:** Unlock Workflows immediately. High-value automation feature already built but inaccessible to users.

---

# APPENDIX C: TECHNICAL DEBT ITEMS

## Items That May Slow Feature Development

| Item | Impact | Priority |
|------|--------|----------|
| Form Builder (109KB) | Large file, harder to maintain | Medium |
| Calendar (73KB) | Large file, refactor candidate | Low |
| Multiple workflow engines | Consolidate to one | Medium |
| Landing page (77KB) | Marketing, not core product | Low |

---

# NEXT STEPS

## Immediate Actions (This Week)

1. **Validate the Constraint**
   - Set up funnel analytics
   - Confirm email step is biggest drop-off
   - Interview 5 churned + 5 champion users

2. **Quick Wins**
   - Email templates library (design started)
   - Onboarding checklist (low effort)
   - Unlock Workflows V1.1 (already built)

3. **Research Setup**
   - Feature request intake form
   - RICE scoring spreadsheet
   - Competitor tracking dashboard

---

*Document Owner: Director of Product Research*
*Review Cadence: Weekly (Thursdays)*
*Next Major Update: End of Week 1*
