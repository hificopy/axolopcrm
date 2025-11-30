import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "../context/SupabaseContext";

/**
 * Custom hook to manage user preferences stored in Supabase
 * Replaces localStorage usage for cross-device synchronization
 */
export const useUserPreferences = () => {
  const { user, getAuthToken } = useSupabase();
  const [preferences, setPreferences] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Base API URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  /**
   * Fetch user preferences from Supabase
   */
  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/user-preferences`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch preferences");

      const result = await response.json();
      setPreferences(result.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching preferences:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, API_URL, getAuthToken]);

  /**
   * Fetch user settings from Supabase
   */
  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/user-preferences/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch settings");

      const result = await response.json();
      setSettings(result.data);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(err.message);
    }
  }, [user, API_URL, getAuthToken]);

  /**
   * Update a specific preference
   */
  const updatePreference = useCallback(
    async (key, value) => {
      if (!user) return;

      try {
        const token = await getAuthToken();

        const response = await fetch(`${API_URL}/user-preferences`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key, value }),
        });

        if (!response.ok) throw new Error("Failed to update preference");

        const result = await response.json();
        setPreferences(result.data);
        return result.data;
      } catch (err) {
        console.error("Error updating preference:", err);
        setError(err.message);
        throw err;
      }
    },
    [user, API_URL, getAuthToken],
  );

  /**
   * Update user settings (theme, notifications, etc.)
   */
  const updateSettings = useCallback(
    async (newSettings) => {
      if (!user) return;

      try {
        const token = await getAuthToken();

        const response = await fetch(`${API_URL}/user-preferences/settings`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSettings),
        });

        if (!response.ok) throw new Error("Failed to update settings");

        const result = await response.json();
        setSettings(result.data);
        return result.data;
      } catch (err) {
        console.error("Error updating settings:", err);
        setError(err.message);
        throw err;
      }
    },
    [user, API_URL, getAuthToken],
  );

  /**
   * Get theme preference
   */
  const getTheme = useCallback(() => {
    return settings?.theme || "system";
  }, [settings]);

  /**
   * Set theme preference
   */
  const setTheme = useCallback(
    async (theme) => {
      return updateSettings({ theme });
    },
    [updateSettings],
  );

  /**
   * Get dashboard layout
   */
  const getDashboardLayout = useCallback(() => {
    return preferences?.dashboard_layout || {};
  }, [preferences]);

  /**
   * Update dashboard layout
   */
  const updateDashboardLayout = useCallback(
    async (layout) => {
      return updatePreference("dashboard_layout", layout);
    },
    [updatePreference],
  );

  // Fetch preferences and settings on mount
  useEffect(() => {
    if (user) {
      fetchPreferences();
      fetchSettings();
    }
  }, [user, fetchPreferences, fetchSettings]);

  return {
    preferences,
    settings,
    loading,
    error,
    updatePreference,
    updateSettings,
    getTheme,
    setTheme,
    getDashboardLayout,
    updateDashboardLayout,
    refetch: () => {
      fetchPreferences();
      fetchSettings();
    },
  };
};

/**
 * Custom hook to manage user todos stored in Supabase
 */
export const useUserTodos = () => {
  const { user, getAuthToken } = useSupabase();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Base API URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  /**
   * Fetch todos from Supabase
   */
  const fetchTodos = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await getAuthToken();

      const response = await fetch(`${API_URL}/user-preferences/todos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch todos");

      const result = await response.json();
      setTodos(result.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching todos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, API_URL, getAuthToken]);

  /**
   * Create a new todo
   */
  const createTodo = useCallback(
    async (todoData) => {
      if (!user) return;

      try {
        const token = await getAuthToken();

        const response = await fetch(`${API_URL}/user-preferences/todos`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(todoData),
        });

        if (!response.ok) throw new Error("Failed to create todo");

        const result = await response.json();
        setTodos([...todos, result.data]);
        return result.data;
      } catch (err) {
        console.error("Error creating todo:", err);
        setError(err.message);
        throw err;
      }
    },
    [user, todos, API_URL, getAuthToken],
  );

  /**
   * Update a todo
   */
  const updateTodo = useCallback(
    async (todoId, updates) => {
      if (!user) return;

      try {
        const token = await getAuthToken();

        const response = await fetch(
          `${API_URL}/user-preferences/todos/${todoId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
          },
        );

        if (!response.ok) throw new Error("Failed to update todo");

        const result = await response.json();
        setTodos(todos.map((t) => (t.id === todoId ? result.data : t)));
        return result.data;
      } catch (err) {
        console.error("Error updating todo:", err);
        setError(err.message);
        throw err;
      }
    },
    [user, todos, API_URL, getAuthToken],
  );

  /**
   * Delete a todo
   */
  const deleteTodo = useCallback(
    async (todoId) => {
      if (!user) return;

      try {
        const token = await getAuthToken();

        const response = await fetch(
          `${API_URL}/user-preferences/todos/${todoId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Failed to delete todo");

        setTodos(todos.filter((t) => t.id !== todoId));
      } catch (err) {
        console.error("Error deleting todo:", err);
        setError(err.message);
        throw err;
      }
    },
    [user, todos, API_URL, getAuthToken],
  );

  /**
   * Toggle todo completion
   */
  const toggleTodo = useCallback(
    async (todoId) => {
      if (!user) return;

      try {
        const token = await getAuthToken();

        const response = await fetch(
          `${API_URL}/user-preferences/todos/${todoId}/toggle`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) throw new Error("Failed to toggle todo");

        const result = await response.json();
        setTodos(todos.map((t) => (t.id === todoId ? result.data : t)));
        return result.data;
      } catch (err) {
        console.error("Error toggling todo:", err);
        setError(err.message);
        throw err;
      }
    },
    [user, todos, API_URL, getAuthToken],
  );

  // Fetch todos on mount
  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user, fetchTodos]);

  return {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    refetch: fetchTodos,
  };
};
