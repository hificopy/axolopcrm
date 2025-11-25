import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Important Dates Service
 * Manages lead birthdays, anniversaries, policy expiration dates, etc.
 * For insurance agents and relationship-driven sales
 */

// ===========================================================================
// IMPORTANT DATES MANAGEMENT
// ===========================================================================

/**
 * Get all important dates for a user
 */
const getImportantDates = async (userId, filters = {}) => {
  let query = supabase
    .from('lead_important_dates')
    .select(`
      *,
      lead:leads(*),
      contact:contacts(*)
    `)
    .eq('user_id', userId)
    .order('date_value', { ascending: true });

  // Apply filters
  if (filters.dateType) {
    query = query.eq('date_type', filters.dateType);
  }
  if (filters.leadId) {
    query = query.eq('lead_id', filters.leadId);
  }
  if (filters.contactId) {
    query = query.eq('contact_id', filters.contactId);
  }
  if (filters.startDate) {
    query = query.gte('date_value', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('date_value', filters.endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Get important date by ID
 */
const getImportantDateById = async (userId, dateId) => {
  const { data, error } = await supabase
    .from('lead_important_dates')
    .select(`
      *,
      lead:leads(*),
      contact:contacts(*)
    `)
    .eq('id', dateId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Add an important date
 */
const addImportantDate = async (userId, dateData) => {
  const {
    leadId,
    contactId,
    dateType,
    dateValue,
    recurring,
    notifyDaysBefore,
    notes,
    customFields
  } = dateData;

  const { data, error } = await supabase
    .from('lead_important_dates')
    .insert({
      user_id: userId,
      lead_id: leadId,
      contact_id: contactId,
      date_type: dateType || 'birthday',
      date_value: dateValue,
      recurring: recurring !== undefined ? recurring : true,
      notify_days_before: notifyDaysBefore || 7,
      notification_sent: false,
      notes,
      custom_fields: customFields || {}
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update an important date
 */
const updateImportantDate = async (userId, dateId, dateData) => {
  const {
    dateType,
    dateValue,
    recurring,
    notifyDaysBefore,
    notes,
    customFields
  } = dateData;

  const updateData = {
    updated_at: new Date()
  };

  if (dateType !== undefined) updateData.date_type = dateType;
  if (dateValue !== undefined) updateData.date_value = dateValue;
  if (recurring !== undefined) updateData.recurring = recurring;
  if (notifyDaysBefore !== undefined) updateData.notify_days_before = notifyDaysBefore;
  if (notes !== undefined) updateData.notes = notes;
  if (customFields !== undefined) updateData.custom_fields = customFields;

  const { data, error } = await supabase
    .from('lead_important_dates')
    .update(updateData)
    .eq('id', dateId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete an important date
 */
const deleteImportantDate = async (userId, dateId) => {
  const { error } = await supabase
    .from('lead_important_dates')
    .delete()
    .eq('id', dateId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
};

// ===========================================================================
// BIRTHDAY SPECIFIC FUNCTIONS
// ===========================================================================

/**
 * Add birthday to lead/contact
 */
const addBirthday = async (userId, leadId, contactId, birthday, notes = null) => {
  return addImportantDate(userId, {
    leadId,
    contactId,
    dateType: 'birthday',
    dateValue: birthday,
    recurring: true,
    notifyDaysBefore: 7,
    notes
  });
};

/**
 * Get upcoming birthdays
 */
const getUpcomingBirthdays = async (userId, daysAhead = 30) => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);

  // Get all birthdays
  const { data: allBirthdays, error } = await supabase
    .from('lead_important_dates')
    .select(`
      *,
      lead:leads(*),
      contact:contacts(*)
    `)
    .eq('user_id', userId)
    .eq('date_type', 'birthday')
    .order('date_value', { ascending: true });

  if (error) throw error;

  // Filter birthdays that occur in the next N days (considering recurring)
  const upcomingBirthdays = allBirthdays.filter(birthday => {
    const birthDate = new Date(birthday.date_value);
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );

    // If birthday already passed this year, check next year
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }

    const daysUntil = Math.ceil(
      (thisYearBirthday - today) / (1000 * 60 * 60 * 24)
    );

    return daysUntil >= 0 && daysUntil <= daysAhead;
  });

  // Sort by days until birthday
  return upcomingBirthdays.map(birthday => {
    const birthDate = new Date(birthday.date_value);
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );

    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }

    const daysUntil = Math.ceil(
      (thisYearBirthday - today) / (1000 * 60 * 60 * 24)
    );

    const age = today.getFullYear() - birthDate.getFullYear();

    return {
      ...birthday,
      days_until: daysUntil,
      age_turning: age,
      this_year_date: thisYearBirthday.toISOString().split('T')[0]
    };
  }).sort((a, b) => a.days_until - b.days_until);
};

/**
 * Get today's birthdays
 */
const getTodayBirthdays = async (userId) => {
  const today = new Date();
  const todayMonth = today.getMonth() + 1; // 1-12
  const todayDay = today.getDate();

  const { data: allBirthdays, error } = await supabase
    .from('lead_important_dates')
    .select(`
      *,
      lead:leads(*),
      contact:contacts(*)
    `)
    .eq('user_id', userId)
    .eq('date_type', 'birthday');

  if (error) throw error;

  // Filter birthdays that match today's month and day
  const todaysBirthdays = allBirthdays.filter(birthday => {
    const birthDate = new Date(birthday.date_value);
    return (
      birthDate.getMonth() + 1 === todayMonth &&
      birthDate.getDate() === todayDay
    );
  });

  return todaysBirthdays.map(birthday => {
    const birthDate = new Date(birthday.date_value);
    const age = today.getFullYear() - birthDate.getFullYear();

    return {
      ...birthday,
      age_turning: age
    };
  });
};

// ===========================================================================
// POLICY/RENEWAL DATE FUNCTIONS (Insurance specific)
// ===========================================================================

/**
 * Add policy expiration/renewal date
 */
const addPolicyDate = async (userId, leadId, policyType, expirationDate, notes = null) => {
  return addImportantDate(userId, {
    leadId,
    dateType: 'policy_expiration',
    dateValue: expirationDate,
    recurring: true, // Policies typically renew annually
    notifyDaysBefore: 30, // Notify 30 days before expiration
    notes,
    customFields: {
      policy_type: policyType
    }
  });
};

/**
 * Get expiring policies
 */
const getExpiringPolicies = async (userId, daysAhead = 60) => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('lead_important_dates')
    .select(`
      *,
      lead:leads(*)
    `)
    .eq('user_id', userId)
    .eq('date_type', 'policy_expiration')
    .gte('date_value', today.toISOString().split('T')[0])
    .lte('date_value', futureDate.toISOString().split('T')[0])
    .order('date_value', { ascending: true });

  if (error) throw error;

  return data.map(policy => {
    const expirationDate = new Date(policy.date_value);
    const daysUntil = Math.ceil(
      (expirationDate - today) / (1000 * 60 * 60 * 24)
    );

    return {
      ...policy,
      days_until_expiration: daysUntil,
      urgency: daysUntil <= 14 ? 'critical' : daysUntil <= 30 ? 'high' : 'medium'
    };
  });
};

// ===========================================================================
// NOTIFICATION MANAGEMENT
// ===========================================================================

/**
 * Get dates needing notifications
 */
const getDatesNeedingNotification = async (userId) => {
  const today = new Date();

  // Get all important dates
  const { data: allDates, error } = await supabase
    .from('lead_important_dates')
    .select(`
      *,
      lead:leads(*),
      contact:contacts(*)
    `)
    .eq('user_id', userId)
    .eq('notification_sent', false);

  if (error) throw error;

  // Filter dates that need notification
  const datesToNotify = allDates.filter(date => {
    const dateValue = new Date(date.date_value);
    const notifyDate = new Date(dateValue);
    notifyDate.setDate(dateValue.getDate() - date.notify_days_before);

    return notifyDate <= today && dateValue >= today;
  });

  return datesToNotify;
};

/**
 * Mark notification as sent
 */
const markNotificationSent = async (dateId) => {
  const { data, error } = await supabase
    .from('lead_important_dates')
    .update({
      notification_sent: true,
      last_notification_sent_at: new Date()
    })
    .eq('id', dateId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Reset notifications for recurring dates (run annually)
 */
const resetRecurringNotifications = async () => {
  const { data, error } = await supabase
    .from('lead_important_dates')
    .update({
      notification_sent: false,
      last_notification_sent_at: null
    })
    .eq('recurring', true)
    .eq('notification_sent', true);

  if (error) throw error;
  return data;
};

// ===========================================================================
// STATISTICS
// ===========================================================================

/**
 * Get important dates statistics
 */
const getDateStats = async (userId) => {
  const today = new Date();
  const next30Days = new Date();
  next30Days.setDate(today.getDate() + 30);

  // Get all dates for user
  const { data: allDates } = await supabase
    .from('lead_important_dates')
    .select('*')
    .eq('user_id', userId);

  const stats = {
    total_dates: allDates?.length || 0,
    birthdays: allDates?.filter(d => d.date_type === 'birthday').length || 0,
    policy_expirations: allDates?.filter(d => d.date_type === 'policy_expiration').length || 0,
    anniversaries: allDates?.filter(d => d.date_type === 'anniversary').length || 0,
    upcoming_30_days: 0,
    needs_notification: 0
  };

  // Calculate upcoming dates
  if (allDates) {
    allDates.forEach(date => {
      const dateValue = new Date(date.date_value);
      const daysUntil = Math.ceil((dateValue - today) / (1000 * 60 * 60 * 24));

      if (daysUntil >= 0 && daysUntil <= 30) {
        stats.upcoming_30_days++;
      }

      // Check if needs notification
      const notifyDate = new Date(dateValue);
      notifyDate.setDate(dateValue.getDate() - date.notify_days_before);

      if (!date.notification_sent && notifyDate <= today && dateValue >= today) {
        stats.needs_notification++;
      }
    });
  }

  return stats;
};

// ===========================================================================
// EXPORTS
// ===========================================================================

export default {
  // General date management
  getImportantDates,
  getImportantDateById,
  addImportantDate,
  updateImportantDate,
  deleteImportantDate,

  // Birthday specific
  addBirthday,
  getUpcomingBirthdays,
  getTodayBirthdays,

  // Policy/Insurance specific
  addPolicyDate,
  getExpiringPolicies,

  // Notifications
  getDatesNeedingNotification,
  markNotificationSent,
  resetRecurringNotifications,

  // Statistics
  getDateStats
};
