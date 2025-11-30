/**
 * LocalStorage Migration Utility
 * Migrates data from localStorage to Supabase user-specific storage
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Migrate theme preference from localStorage to Supabase
 */
export const migrateTheme = async (token) => {
  try {
    const theme = localStorage.getItem('theme');
    if (!theme) return null;

    // Update theme in Supabase
    const response = await fetch(`${API_URL}/user-preferences/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ theme })
    });

    if (!response.ok) {
      console.error('Failed to migrate theme');
      return null;
    }

    // Clear from localStorage after successful migration
    localStorage.removeItem('theme');
    console.log('✅ Theme migrated to Supabase');
    return theme;
  } catch (error) {
    console.error('Error migrating theme:', error);
    return null;
  }
};

/**
 * Migrate todos from localStorage to Supabase
 */
export const migrateTodos = async (token) => {
  try {
    const todosJson = localStorage.getItem('axolop-todos');
    if (!todosJson) return null;

    const todos = JSON.parse(todosJson);
    if (!Array.isArray(todos) || todos.length === 0) return null;

    // Create each todo in Supabase
    const migratedTodos = [];
    for (const todo of todos) {
      const response = await fetch(`${API_URL}/user-preferences/todos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: todo.text || todo.title || 'Untitled',
          description: todo.description || '',
          completed: todo.completed || false,
          priority: todo.priority || 'medium',
          sort_order: todo.id || 0
        })
      });

      if (response.ok) {
        const result = await response.json();
        migratedTodos.push(result.data);
      }
    }

    // Clear from localStorage after successful migration
    localStorage.removeItem('axolop-todos');
    console.log(`✅ ${migratedTodos.length} todos migrated to Supabase`);
    return migratedTodos;
  } catch (error) {
    console.error('Error migrating todos:', error);
    return null;
  }
};


/**
 * Migrate onboarding responses from localStorage to Supabase
 * Note: This should ideally go to the onboarding_data table, but for now
 * we'll store it in user preferences
 */
export const migrateOnboardingResponses = async (token) => {
  try {
    const responses = localStorage.getItem('onboarding_responses');
    const recommendedPlan = localStorage.getItem('recommended_plan');

    if (!responses && !recommendedPlan) return null;

    const data = {};

    if (responses) {
      try {
        data.onboarding_responses = JSON.parse(responses);
      } catch (e) {
        console.error('Error parsing onboarding responses:', e);
      }
    }

    if (recommendedPlan) {
      data.recommended_plan = recommendedPlan;
    }

    if (Object.keys(data).length === 0) return null;

    // Store in preferences
    const response = await fetch(`${API_URL}/user-preferences`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: 'onboarding_data',
        value: data
      })
    });

    if (!response.ok) {
      console.error('Failed to migrate onboarding responses');
      return null;
    }

    // Clear from localStorage after successful migration
    localStorage.removeItem('onboarding_responses');
    localStorage.removeItem('recommended_plan');
    console.log('✅ Onboarding responses migrated to Supabase');
    return data;
  } catch (error) {
    console.error('Error migrating onboarding responses:', error);
    return null;
  }
};

/**
 * Migrate affiliate code from localStorage to Supabase
 * Note: This is user-specific and should be stored per user
 */
export const migrateAffiliateCode = async (token, userId) => {
  try {
    // Check for both generic and user-specific affiliate codes
    const genericCode = localStorage.getItem('ref_code');
    const userCode = localStorage.getItem(`affiliate_code_${userId}`);

    const code = userCode || genericCode;
    if (!code) return null;

    // Store in preferences
    const response = await fetch(`${API_URL}/user-preferences`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: 'affiliate_code',
        value: code
      })
    });

    if (!response.ok) {
      console.error('Failed to migrate affiliate code');
      return null;
    }

    // Clear from localStorage after successful migration
    localStorage.removeItem('ref_code');
    localStorage.removeItem(`affiliate_code_${userId}`);
    console.log('✅ Affiliate code migrated to Supabase');
    return code;
  } catch (error) {
    console.error('Error migrating affiliate code:', error);
    return null;
  }
};

/**
 * Main migration function - runs all migrations
 */
export const migrateAllLocalStorageData = async (token, userId) => {
  console.log('🔄 Starting localStorage to Supabase migration...');

  try {
    const results = await Promise.allSettled([
      migrateTheme(token),
      migrateTodos(token),
      migrateOnboardingResponses(token),
      migrateAffiliateCode(token, userId)
    ]);

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
    console.log(`✅ Migration complete! ${successCount} items migrated.`);

    // Set a flag to indicate migration has been completed
    localStorage.setItem('migration_completed', new Date().toISOString());

    return {
      success: true,
      migratedCount: successCount
    };
  } catch (error) {
    console.error('Error during migration:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if migration has already been completed
 */
export const hasMigrationCompleted = () => {
  return localStorage.getItem('migration_completed') !== null;
};

/**
 * Reset migration flag (for testing purposes)
 */
export const resetMigrationFlag = () => {
  localStorage.removeItem('migration_completed');
};
