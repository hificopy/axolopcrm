# RICE SCORING FRAMEWORK
## Feature Prioritization System for Axolop CRM

---

# HOW TO USE THIS DOCUMENT

Every feature request goes through RICE scoring before entering the roadmap. No exceptions.

**Minimum Score to Enter Roadmap:**
- NOW (current sprint): Score > 25 + solves THE CONSTRAINT
- NEXT (next quarter): Score > 15
- LATER (6-12 months): Score > 8
- FUTURE (12+ months): Any score (vision features)

---

# THE RICE FORMULA

```
RICE Score = (Reach × Impact × Confidence) / Effort

Then apply LTV Multipliers for final score.
```

---

# SCORING CRITERIA

## REACH: How Many Users Affected?

| Score | % of Users | Definition | How to Measure |
|-------|------------|------------|----------------|
| 10 | 80%+ | Universal need | Survey: 80%+ say "yes" |
| 7 | 50-80% | Majority need | Survey: 50-80% say "yes" |
| 4 | 20-50% | Segment need | Survey: 20-50% say "yes" |
| 1 | <20% | Niche need | Survey: <20% say "yes" |

**Research Methods:**
- Customer survey: "Would you use [feature]?"
- Usage data: "What % currently try workaround?"
- Support tickets: "How many mention this need?"

---

## IMPACT: How Much Does This Affect LTV?

| Score | Impact Level | Definition | Evidence Needed |
|-------|--------------|------------|-----------------|
| 10 | Massive | Directly increases retention OR revenue | Churn data, revenue correlation |
| 7 | High | Likely increases retention | Strong customer feedback |
| 4 | Medium | Improves experience | Usability testing positive |
| 1 | Low | Nice-to-have | No measurable LTV impact |

**Research Methods:**
- Churn analysis: "Did users who have similar feature churn less?"
- Revenue analysis: "Do power users use this feature?"
- Exit interviews: "Would this have made you stay?"
- Competitor analysis: "Did their customers stay longer after this?"

**Impact Scoring Examples:**
| Feature | Impact Score | Reasoning |
|---------|-------------|-----------|
| Mobile app | 8 | Retention driver (can't use in field without it) |
| AI email writer | 10 | Directly helps close deals = revenue |
| Dark mode | 1 | Aesthetic only, no LTV impact |
| Zapier integration | 7 | Stickiness (harder to leave) |
| SMS messaging | 9 | Higher response rates = more deals |

---

## CONFIDENCE: How Sure Are We?

| Score | Confidence | Definition | Evidence Required |
|-------|------------|------------|-------------------|
| 100% | Certain | Data proves this | Analytics + customer proof |
| 80% | High | Strong signals | Customer interviews + competitor validation |
| 50% | Medium | Good hypothesis | Some feedback, needs more validation |
| 20% | Low | Gut feeling | No data, speculation only |

**How to Increase Confidence:**
1. Interview 5+ customers specifically about this feature
2. Check if competitors have it (and if it worked for them)
3. Review support tickets for patterns
4. Build prototype and test with users
5. Analyze usage data for workaround attempts

**Confidence Boosters:**
| Evidence Type | Confidence Boost |
|---------------|------------------|
| 5+ customer interviews say "yes" | +20% |
| Competitor has it successfully | +15% |
| 10+ support tickets requesting it | +10% |
| Prototype tested with users | +15% |
| Usage data shows workaround attempts | +20% |

---

## EFFORT: How Long to Build?

| Score | Time | Team Size | Complexity |
|-------|------|-----------|------------|
| 1 | 1-2 weeks | 1 dev | Simple feature |
| 2 | 1 month | 1-2 devs | Medium feature |
| 4 | 2-3 months | 2-3 devs | Large feature |
| 8 | 3-6 months | 3+ devs | Major feature |
| 16 | 6+ months | Full team | Platform-level |

**Get Engineering Estimate Before Scoring**

Questions for engineering:
1. How many dev-weeks?
2. Does this require new infrastructure?
3. Are there dependencies on other features?
4. What's the testing complexity?
5. Does this affect existing features?

---

# LTV MULTIPLIERS

Apply these AFTER calculating base RICE score:

| Multiplier | Criteria | Apply When |
|------------|----------|------------|
| **2x** | Hits activation point | Feature directly drives Day 1-7 activation |
| **2x** | Reduces churn | Feature addresses known churn reason |
| **1.5x** | Enables premium | Feature justifies higher pricing |
| **1.5x** | Competitive parity | We're losing deals without it |
| **0.5x** | Low confidence | Confidence <50% |

---

# WORKED EXAMPLES

## Example 1: Email Templates Library

**Context:** Pre-built email templates to reduce friction on first email send.

| Factor | Score | Reasoning |
|--------|-------|-----------|
| Reach | 9 | 90% of users need to send emails |
| Impact | 10 | Directly addresses THE CONSTRAINT |
| Confidence | 80% | Competitors have this, support tickets confirm |
| Effort | 2 | 3-4 weeks to build |

**Base RICE:** (9 × 10 × 0.8) / 2 = **36**

**LTV Multipliers:**
- 2x - Hits activation point (first email)

**Final Score: 72** → HIGH PRIORITY, NOW

---

## Example 2: Mobile App (iOS)

**Context:** Native mobile app for field workers.

| Factor | Score | Reasoning |
|--------|-------|-----------|
| Reach | 10 | 100% of users would benefit |
| Impact | 8 | Retention driver, not direct revenue |
| Confidence | 90% | Every competitor has one |
| Effort | 8 | 3+ months React Native development |

**Base RICE:** (10 × 8 × 0.9) / 8 = **9**

**LTV Multipliers:**
- 2x - Reduces churn (users can't work without mobile)
- 1.5x - Competitive parity (losing deals)

**Final Score: 27** → PRIORITY, NEXT QUARTER

---

## Example 3: Dark Mode

**Context:** UI dark theme option.

| Factor | Score | Reasoning |
|--------|-------|-----------|
| Reach | 3 | ~30% of users have requested |
| Impact | 1 | Aesthetic only, no LTV impact |
| Confidence | 50% | Users say they want it, unclear if they'd use it |
| Effort | 1 | 2 weeks to implement |

**Base RICE:** (3 × 1 × 0.5) / 1 = **1.5**

**LTV Multipliers:** None apply.

**Final Score: 1.5** → LOW PRIORITY, FUTURE or DELETE

---

## Example 4: AI Email Writer

**Context:** AI that drafts emails for users based on context.

| Factor | Score | Reasoning |
|--------|-------|-----------|
| Reach | 9 | 90% of users send emails |
| Impact | 10 | Helps close deals faster |
| Confidence | 80% | Competitors successful, tech proven |
| Effort | 4 | 2-3 months (AI integration) |

**Base RICE:** (9 × 10 × 0.8) / 4 = **18**

**LTV Multipliers:**
- 2x - Hits activation point (email)
- 1.5x - Enables premium (AI feature upsell)

**Final Score: 54** → HIGH PRIORITY, NEXT QUARTER

---

## Example 5: Zapier Integration

**Context:** Connect Axolop to 5000+ apps via Zapier.

| Factor | Score | Reasoning |
|--------|-------|-----------|
| Reach | 7 | 60% of users want integrations |
| Impact | 7 | Stickiness (harder to leave) |
| Confidence | 90% | Industry standard, enterprise requirement |
| Effort | 4 | 2 months (API + Zapier approval) |

**Base RICE:** (7 × 7 × 0.9) / 4 = **11**

**LTV Multipliers:**
- 2x - Reduces churn (integration = sticky)
- 1.5x - Competitive parity (losing enterprise deals)

**Final Score: 33** → PRIORITY, NEXT QUARTER

---

# FEATURE SCORING TEMPLATE

Copy this for each feature:

```
## Feature: [NAME]

**Description:** [What does it do?]

**Requester:** [Customer interviews / Support tickets / Internal]

### RICE SCORING

| Factor | Score | Reasoning |
|--------|-------|-----------|
| Reach | /10 | |
| Impact | /10 | |
| Confidence | % | |
| Effort | | |

**Base RICE:** ( × × ) / =

### LTV MULTIPLIERS

| Multiplier | Applies? | Reasoning |
|------------|----------|-----------|
| 2x Activation | Y/N | |
| 2x Churn Reduction | Y/N | |
| 1.5x Premium | Y/N | |
| 1.5x Competitive | Y/N | |

**Final Score:**

### RECOMMENDATION

[ ] NOW (Sprint) - Score >25 + solves constraint
[ ] NEXT (Quarter) - Score >15
[ ] LATER (6-12 mo) - Score >8
[ ] FUTURE (12+ mo) - Score <8
[ ] DELETE - Doesn't align with ICP
```

---

# CURRENT FEATURE SCORES

## Scored Features (Sorted by Priority)

| Feature | Base RICE | Multipliers | Final Score | Roadmap |
|---------|-----------|-------------|-------------|---------|
| Email Templates | 36 | 2x activation | 72 | NOW |
| AI Email Writer | 18 | 2x + 1.5x | 54 | NEXT |
| Mobile App (iOS) | 9 | 2x + 1.5x | 27 | NEXT |
| Unlock Workflows | 15 | 2x activation | 30 | NOW |
| Zapier Integration | 11 | 2x + 1.5x | 33 | NEXT |
| SMS/WhatsApp | 14 | 2x churn | 28 | NEXT |
| Onboarding Checklist | 12 | 2x activation | 24 | NOW |
| Projects (V1.2) | 8 | None | 8 | LATER |
| Team Chat | 6 | None | 6 | LATER |
| Dark Mode | 1.5 | None | 1.5 | FUTURE |

---

# SCORING RULES

## DO Score:
- Features requested by 3+ customers
- Features that solve known pain points
- Features competitors have successfully
- Features that hit activation milestones

## DON'T Score:
- Features requested by only 1 person
- Features that don't serve the ICP
- Features that add complexity without value
- Features that distract from THE CONSTRAINT

## WHEN TO RE-SCORE:
- New customer research data
- Competitor launches similar feature
- Engineering estimate changes
- Churn analysis reveals new insights
- Quarterly roadmap review

---

*Document Owner: Director of Product Research*
*Last Updated: November 2025*
