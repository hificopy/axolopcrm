# FEATURE VALIDATION CHECKLIST
## Gate Process Before Engineering Builds

---

# THE RULE

**No feature enters development without passing this checklist.**

No exceptions. If we can't validate it, we don't build it.

---

# VALIDATION STAGES

## STAGE 1: PROBLEM VALIDATION

**Question: Does this problem actually exist?**

### Checklist

| # | Criteria | Required | Evidence |
|---|----------|----------|----------|
| 1.1 | 5+ customers confirm the problem | ✅ Yes | Interview notes |
| 1.2 | Problem appears in support tickets | 🟡 Helpful | Ticket count |
| 1.3 | Problem mentioned in churn interviews | 🟡 Helpful | Exit survey data |
| 1.4 | Workaround attempts visible in data | 🟡 Helpful | Usage analytics |
| 1.5 | Competitor solves this problem | 🟡 Helpful | Competitive research |

### Interview Questions for Problem Validation

```markdown
1. "Tell me about a time when [problem] happened to you."
2. "How often does this problem occur?"
3. "What do you currently do to solve this?"
4. "How much time/money does this problem cost you?"
5. "On a scale of 1-10, how painful is this problem?"
```

### Problem Validation Template

```markdown
## Problem: [Name]

**Problem Statement:** [One sentence description]

**Evidence:**
- [ ] Customer interviews (count: ___)
- [ ] Support tickets (count: ___)
- [ ] Churn mentions (count: ___)
- [ ] Workaround data (describe: ___)
- [ ] Competitor validation (which: ___)

**Pain Score:** ___/10 (average from interviews)

**Conclusion:** [ ] Validated / [ ] Needs more research / [ ] Not validated
```

---

## STAGE 2: SOLUTION VALIDATION

**Question: Will our proposed solution actually solve the problem?**

### Checklist

| # | Criteria | Required | Evidence |
|---|----------|----------|----------|
| 2.1 | RICE score calculated | ✅ Yes | Scoring doc |
| 2.2 | RICE score > 15 | ✅ Yes | Score |
| 2.3 | Prototype/mockup created | 🟡 Helpful | Design file |
| 2.4 | 5+ users understand the solution | ✅ Yes | Usability test |
| 2.5 | 5+ users say they'd use it | ✅ Yes | Interview notes |
| 2.6 | No "nice to have" responses | ✅ Yes | Interview notes |

### Interview Questions for Solution Validation

```markdown
1. "If I showed you [solution], would you use it?"
2. "How would you use this feature?"
3. "Would this solve the problem we discussed?"
4. "Would you pay extra for this?" (if premium feature)
5. "What would make this even better?"
```

### Solution Validation Template

```markdown
## Solution: [Feature Name]

**Solution Statement:** [One sentence description]

**RICE Score:**
- Reach: ___/10
- Impact: ___/10
- Confidence: ___%
- Effort: ___
- **Score:** ___

**User Testing:**
- [ ] Prototype shown to users (count: ___)
- [ ] Users understood it without explanation (Y/N)
- [ ] Users said they'd use it (count: ___)
- [ ] Users said it solves the problem (count: ___)

**Red Flags:**
- [ ] "Nice to have" responses (count: ___)
- [ ] Confusion during demo (Y/N)
- [ ] Users suggested different solution (Y/N)

**Conclusion:** [ ] Validated / [ ] Needs iteration / [ ] Not validated
```

---

## STAGE 3: IMPACT VALIDATION

**Question: Will this actually improve our metrics?**

### Checklist

| # | Criteria | Required | Evidence |
|---|----------|----------|----------|
| 3.1 | Clear success metric identified | ✅ Yes | Metric name |
| 3.2 | Baseline metric measured | ✅ Yes | Current value |
| 3.3 | Target improvement defined | ✅ Yes | Target value |
| 3.4 | LTV impact hypothesized | ✅ Yes | Impact type |
| 3.5 | Competitor had success with this | 🟡 Helpful | Research |

### Impact Types

| Type | Description | Multiplier |
|------|-------------|------------|
| Activation | Drives users to key milestone | 2x RICE |
| Retention | Reduces churn | 2x RICE |
| Revenue | Directly increases ARPU | 2x RICE |
| Expansion | Increases users per account | 1.5x RICE |
| Premium | Justifies higher pricing | 1.5x RICE |

### Impact Validation Template

```markdown
## Feature: [Name]

**Primary Metric:** [metric name]
**Current Baseline:** [value]
**Target After Ship:** [value] (+X%)

**LTV Impact:**
- [ ] Activation (milestone: ___)
- [ ] Retention (churn reduction: ___%)
- [ ] Revenue (ARPU increase: $__)
- [ ] Expansion (seat increase: __)
- [ ] Premium (tier upgrade: __%)

**Competitor Evidence:**
- Competitor [name] launched this
- Result: [what happened]

**Conclusion:** [ ] High impact / [ ] Medium impact / [ ] Low impact
```

---

## STAGE 4: FEASIBILITY VALIDATION

**Question: Can we actually build this?**

### Checklist

| # | Criteria | Required | Evidence |
|---|----------|----------|----------|
| 4.1 | Engineering effort estimated | ✅ Yes | Weeks/months |
| 4.2 | Technical dependencies identified | ✅ Yes | Dependency list |
| 4.3 | No architecture blockers | ✅ Yes | Eng confirmation |
| 4.4 | Resources available in timeline | ✅ Yes | Resource plan |
| 4.5 | No security/compliance issues | ✅ Yes | Security review |

### Questions for Engineering

```markdown
1. How many dev-weeks to build MVP?
2. Does this require new infrastructure?
3. Are there dependencies on other features?
4. What's the testing complexity?
5. Does this affect existing features?
6. Any security or compliance concerns?
7. Can we build this incrementally?
```

### Feasibility Template

```markdown
## Feature: [Name]

**Engineering Estimate:**
- MVP: ___ weeks
- Full feature: ___ weeks
- Team required: ___ devs

**Dependencies:**
- [ ] Feature: ___
- [ ] Infrastructure: ___
- [ ] Third-party: ___

**Risks:**
- [ ] Technical risk: ___
- [ ] Timeline risk: ___
- [ ] Resource risk: ___

**Security Review:**
- [ ] Data handling reviewed
- [ ] Auth requirements met
- [ ] No OWASP vulnerabilities

**Conclusion:** [ ] Feasible / [ ] Needs scoping / [ ] Not feasible
```

---

# VALIDATION SCORECARD

## Full Feature Validation

| Stage | Score | Pass Criteria |
|-------|-------|---------------|
| Problem Validation | /10 | ≥7 to proceed |
| Solution Validation | /10 | ≥7 to proceed |
| Impact Validation | /10 | ≥6 to proceed |
| Feasibility Validation | /10 | ≥7 to proceed |
| **TOTAL** | /40 | ≥28 to build |

### Scoring Guide

**Problem Validation (10 points)**
- 5+ customer confirmations: 4 points
- Support ticket evidence: 2 points
- Churn interview mentions: 2 points
- Workaround data: 1 point
- Competitor validation: 1 point

**Solution Validation (10 points)**
- RICE score >15: 3 points
- RICE score >25: +2 points
- Prototype tested: 2 points
- Users would use it: 2 points
- No "nice to have": 1 point

**Impact Validation (10 points)**
- Clear metric identified: 2 points
- Baseline measured: 2 points
- Target defined: 2 points
- LTV impact clear: 2 points
- Competitor success: 2 points

**Feasibility Validation (10 points)**
- Effort estimated: 2 points
- Dependencies identified: 2 points
- No blockers: 2 points
- Resources available: 2 points
- Security cleared: 2 points

---

# FAST VALIDATION TRACK

For small features (Effort score = 1), use this abbreviated checklist:

| # | Criteria | Required |
|---|----------|----------|
| 1 | 3+ customers want this | ✅ Yes |
| 2 | RICE score > 10 | ✅ Yes |
| 3 | Engineering says <2 weeks | ✅ Yes |
| 4 | Clear success metric | ✅ Yes |
| 5 | No security concerns | ✅ Yes |

**If all 5 pass:** Build it.
**If any fail:** Full validation required.

---

# VALIDATION MEETING FORMAT

## Weekly Validation Review (30 min)

**Attendees:** Product, Engineering lead

**Agenda:**
1. Review features awaiting validation (5 min)
2. Present validation evidence (15 min per feature)
3. Vote: Validated / Needs more / Not validated (5 min)
4. Update roadmap (5 min)

**Decision Framework:**

| Outcome | Action |
|---------|--------|
| Validated | Add to roadmap (NOW/NEXT based on RICE) |
| Needs more | Assign research tasks, revisit next week |
| Not validated | Remove from consideration, document why |

---

# ANTI-PATTERNS TO AVOID

## Red Flags That Block Validation

| Red Flag | What It Means | Action |
|----------|---------------|--------|
| "I think users want this" | No evidence | Get evidence |
| "Competitor has it" | Not sufficient alone | Validate problem exists for OUR users |
| "Sales asked for it" | Single request | Need 5+ confirmations |
| "It would be cool" | Not a problem | Delete |
| "Nice to have" responses | Low impact | Deprioritize |
| "Users might use it" | Low confidence | More research |
| RICE score < 10 | Low value | Deprioritize or delete |

## Things We Don't Build

| Category | Example | Why Not |
|----------|---------|---------|
| Single user requests | "Can you add [X] for me?" | Not enough reach |
| Copy competitor | "They have it" | Need own validation |
| Executive pet projects | "I think we should..." | Need customer evidence |
| Tech-driven | "This would be fun to build" | Need problem first |
| Scope creep | "While we're at it..." | Separate feature |

---

# VALIDATION DOCUMENTATION

## Feature Request Intake

When a feature request comes in:

```markdown
## Feature Request

**Date:** ___
**Source:** Customer / Support / Sales / Internal
**Requester:** [name/count]

**Request:** [verbatim what they asked for]

**Problem:** [what problem does this solve?]

**Validation Status:**
- [ ] Problem validated
- [ ] Solution validated
- [ ] Impact validated
- [ ] Feasibility validated

**RICE Score:** ___
**Roadmap Position:** NOW / NEXT / LATER / FUTURE / DELETE
```

## Validation Summary (For Approved Features)

```markdown
## Feature Validation Summary

**Feature:** [Name]
**Date Validated:** [Date]
**Validated By:** [Name]

### Evidence Summary
- Customer interviews: [count]
- Support tickets: [count]
- RICE score: [score]
- Success metric: [metric]
- Target: [value]

### Key Quotes
- "[Quote from customer 1]"
- "[Quote from customer 2]"

### Risks
- [Risk 1]
- [Risk 2]

### Recommendation
[Build / Don't build / Needs more research]
```

---

# GOVERNANCE

## Who Can Approve Features?

| Feature Size | Approver |
|--------------|----------|
| Small (1-2 weeks) | Product Manager |
| Medium (1-3 months) | Director of Product |
| Large (3+ months) | VP/CEO + Director |

## Escalation Path

1. Feature fails validation → Return for more research
2. Feature validated but low priority → Add to LATER/FUTURE
3. Feature validated and high priority → Add to NOW/NEXT
4. Disagreement on validation → Escalate to Director
5. Strategic override → Document reasoning, CEO approval

---

*Document Owner: Director of Product Research*
*Review Cadence: As needed*
*Last Updated: November 2025*
