# Meetings Module - TODO List

**Last Updated:** November 24, 2025
**Phase 1 Status:** ✅ **COMPLETE**
**Next Focus:** Phase 2 (High Priority Issues)

---

## ✅ PHASE 1: CRITICAL FIXES - COMPLETE

- [x] **1.1** - Unify database schema (deprecated old service)
- [x] **1.2** - Fix insecure auth fallback pattern
- [x] **1.3** - Fix analytics SQL errors (user_id → assigned_to)
- [x] **1.4** - Add agency permission middleware

**Result:** All critical security and functionality issues resolved ✅

---

## 🟠 PHASE 2: HIGH PRIORITY ISSUES - PENDING

### 2.1: Implement Email Service
**Priority:** HIGH
**Impact:** User Experience - No confirmation emails sent

**Task:**
- Implement `booking-email-service.js` with SendGrid
- Add confirmation email template
- Add reminder email template (24 hours, 1 hour before)
- Add cancellation email template
- Integrate with existing SendGrid service

**Files to Modify:**
- `/backend/services/booking-email-service.js` (implement)
- `/backend/services/booking-link-service-enhanced.js:857` (remove console.log)

**Estimated Time:** 3-4 hours

---

### 2.2: Optimize Slot Filtering Performance
**Priority:** HIGH
**Impact:** Performance - Slow availability calculation

**Problem:**
```javascript
// O(n²) nested loop in booking-link-service.js:226-265
events?.forEach(event => {
  slots.forEach(slot => {
    // Overlap check - 5000+ iterations for busy calendars
  });
});
```

**Task:**
- Replace nested loop with Set-based approach
- Add caching for availability results (5 minutes)
- Use interval tree for O(n log n) complexity
- Add pagination for slots (max 50 per request)

**Files to Modify:**
- `/backend/services/booking-link-service.js:226-265`

**Estimated Time:** 2-3 hours

---

### 2.3: Fix Database Query in Loop
**Priority:** HIGH
**Impact:** Performance - N+1 query problem

**Problem:**
```javascript
// Load-balanced assignment queries DB in loop
for (const userId of hostIds) {
  const { data } = await supabase.from('bookings')...  // ❌ N queries
}
```

**Task:**
- Refactor to single query with GROUP BY
- Calculate booking counts in one database call
- Cache results for 1 minute

**Files to Modify:**
- `/backend/services/booking-link-service-enhanced.js:726-740`

**Estimated Time:** 1-2 hours

---

### 2.4: Add Google Calendar Webhooks
**Priority:** HIGH
**Impact:** Data Accuracy - Stale calendar data

**Problem:**
- No real-time sync with Google Calendar
- Only syncs on connection (100 events max)
- Double-bookings possible if calendar updated elsewhere

**Task:**
- Implement Google Calendar Push Notifications (watch API)
- Add webhook endpoint for calendar change notifications
- Add background job for sync (every 15 minutes)
- Add pagination to fetch all events (not just 100)
- Handle token refresh failures gracefully

**Files to Create:**
- `/backend/routes/calendar-webhooks.js`
- `/backend/services/calendar-sync-service.js`

**Files to Modify:**
- `/backend/services/google-calendar-service.js:423-446`

**Estimated Time:** 4-5 hours

---

## 🟡 PHASE 3: UX IMPROVEMENTS - PENDING

### 3.1: Break Up CreateBookingDialog
**Priority:** MEDIUM
**Impact:** Maintainability - 1728-line component

**Task:**
- Extract each step into separate component:
  - `EventDetailsStep.jsx`
  - `HostsStep.jsx`
  - `TimingStep.jsx`
  - `AvailabilityStep.jsx`
  - `QuestionsStep.jsx`
  - `DisqualificationStep.jsx`
  - `RoutingStep.jsx`
  - `CustomizationStep.jsx`
- Create shared context for form state
- Add step navigation component

**Files to Create:**
- `/frontend/components/meetings/booking-dialog-steps/*.jsx` (8 files)
- `/frontend/components/meetings/BookingDialogContext.jsx`

**Files to Modify:**
- `/frontend/components/meetings/CreateBookingDialog.jsx` (refactor)

**Estimated Time:** 5-6 hours

---

### 3.2: Add Retry Logic for Auto-Save
**Priority:** MEDIUM
**Impact:** Data Loss - Form data lost on network failure

**Task:**
- Implement exponential backoff retry (3 attempts)
- Add localStorage backup for form data
- Show connection status indicator
- Add "Save draft" manual button
- Restore form data on page reload

**Files to Modify:**
- `/frontend/pages/BookingEmbed.jsx:93-131`

**Estimated Time:** 2-3 hours

---

### 3.3: Fix Timezone Handling
**Priority:** MEDIUM
**Impact:** UX - Wrong times for international users

**Problem:**
- Default timezone hardcoded to 'America/New_York'
- No browser timezone detection

**Task:**
- Detect user timezone from browser
```javascript
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
```
- Add timezone selector to booking form
- Display times in user's local timezone
- Store timezone with booking

**Files to Modify:**
- `/backend/services/booking-link-service.js` (multiple locations)
- `/backend/services/booking-link-service-enhanced.js` (multiple locations)
- `/frontend/pages/BookingEmbed.jsx`

**Estimated Time:** 2-3 hours

---

### 3.4: Add Loading Indicators
**Priority:** MEDIUM
**Impact:** UX - Users unsure if actions succeeded

**Task:**
- Add loading state to each button in Meetings.jsx:
  - Copy link button
  - Create link button
  - Delete link button
  - Embed button
- Show spinner during operations
- Disable buttons while loading
- Add success/error toasts

**Files to Modify:**
- `/frontend/pages/Meetings.jsx` (lines 292-350)

**Estimated Time:** 1-2 hours

---

## 📊 PROGRESS TRACKING

### Overall Progress
- ✅ Phase 1: **100%** (4/4 tasks complete)
- 🟠 Phase 2: **0%** (0/4 tasks complete)
- 🟡 Phase 3: **0%** (0/4 tasks complete)

**Total Progress:** 33% (4/12 tasks complete)

---

## 🎯 RECOMMENDED ORDER

1. **Phase 2.1** - Email Service (critical for user experience)
2. **Phase 2.2** - Slot Filtering (performance impact)
3. **Phase 2.3** - Query in Loop (performance impact)
4. **Phase 2.4** - Calendar Webhooks (data accuracy)
5. **Phase 3.2** - Retry Logic (prevents data loss)
6. **Phase 3.3** - Timezone (user experience)
7. **Phase 3.4** - Loading Indicators (polish)
8. **Phase 3.1** - Component Refactor (code quality)

---

## 📞 NOTES

- Phase 1 took **2.5 hours** (includes testing)
- Phase 2 estimated: **10-14 hours**
- Phase 3 estimated: **10-14 hours**
- **Total remaining:** 20-28 hours

---

## 🚀 DEPLOYMENT STRATEGY

1. **Deploy Phase 1** → Production (Ready now ✅)
2. **Develop Phase 2** → Staging → Production (1-2 weeks)
3. **Develop Phase 3** → Staging → Production (1-2 weeks)

---

**Last Commit:** Phase 1 Complete - All critical issues fixed
**Next Up:** Phase 2.1 - Email Service Implementation
