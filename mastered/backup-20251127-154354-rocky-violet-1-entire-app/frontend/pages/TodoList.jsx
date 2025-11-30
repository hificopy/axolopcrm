import { useState, useEffect, useMemo, useCallback } from "react";
import {
  CheckSquare,
  Circle,
  Check,
  AlertTriangle,
  Clock,
  Target,
  TrendingUp,
  Filter,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { MondayTable } from "@/components/MondayTable";
import { useAgency } from "@/hooks/useAgency";
import ViewOnlyBadge from "@/components/ui/view-only-badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function TodoList() {
  const { toast } = useToast();
  const { isReadOnly, canEdit, canCreate } = useAgency();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Fetch todos from API
  const fetchTodos = useCallback(async () => {
    try {
      const response = await api.get("/user-preferences/todos");
      // Handle both response.data and response.data.data formats
      const rawData = response.data?.data || response.data || [];
      // Map title to text for display compatibility
      const mappedData = Array.isArray(rawData)
        ? rawData.map((todo) => ({
            ...todo,
            text: todo.title || todo.text,
            createdAt: todo.created_at || todo.createdAt,
          }))
        : [];
      setTodos(mappedData);
    } catch (error) {
      console.error("Error fetching todos:", error);

      // Handle specific error types
      let errorMessage = "Failed to load todos.";
      if (
        error?.error === "Unauthorized" ||
        error?.message?.includes("Authentication")
      ) {
        errorMessage = "Please sign in to access your todos.";
      } else if (error?.error === "Network Error") {
        errorMessage =
          "Network connection failed. Please check your internet connection.";
      } else if (error?.status === 401) {
        errorMessage = "Your session has expired. Please sign in again.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Add new todo
  const handleAddTodo = async () => {
    try {
      const response = await api.post("/user-preferences/todos", {
        title: "New Task",
      });
      const newTodo = response.data?.data || response.data;
      // Map to display format
      const mappedTodo = {
        ...newTodo,
        text: newTodo.title,
        createdAt: newTodo.created_at,
      };
      setTodos([mappedTodo, ...todos]);
      toast({
        title: "Task Added",
        description: "New task has been added to your list.",
      });
    } catch (error) {
      console.error("Error adding todo:", error);
      toast({
        title: "Error",
        description: "Failed to add task.",
        variant: "destructive",
      });
    }
  };

  // Add todo to specific group
  const handleAddTodoToGroup = async (
    groupKey,
    groupLabel,
    initialData = {},
  ) => {
    try {
      const response = await api.post("/user-preferences/todos", {
        title: initialData.text || initialData.title || "New Task",
        completed: groupLabel === "Completed",
      });
      const newTodo = response.data?.data || response.data;
      const mappedTodo = {
        ...newTodo,
        text: newTodo.title,
        createdAt: newTodo.created_at,
      };
      setTodos([mappedTodo, ...todos]);
      toast({
        title: "Task Added",
        description: `New task added to ${groupLabel}.`,
      });
    } catch (error) {
      console.error("Error adding todo:", error);
      toast({
        title: "Error",
        description: "Failed to add task.",
        variant: "destructive",
      });
    }
  };

  // Edit cell
  const handleCellEdit = async (todoId, columnKey, value) => {
    try {
      let updateData = {};

      if (columnKey === "text") {
        updateData = { title: value };
      } else if (columnKey === "status") {
        // Toggle completion via dedicated endpoint
        const response = await api.post(
          `/user-preferences/todos/${todoId}/toggle`,
        );
        const updatedTodo = response.data?.data || response.data;
        const mappedTodo = {
          ...updatedTodo,
          text: updatedTodo.title,
          createdAt: updatedTodo.created_at,
        };
        setTodos(todos.map((todo) => (todo.id === todoId ? mappedTodo : todo)));
        toast({ title: "Updated", description: "Task status toggled." });
        return;
      } else if (columnKey === "priority") {
        updateData = { priority: value };
      } else if (columnKey === "category") {
        updateData = { category: value };
      } else if (columnKey === "due_date") {
        updateData = { due_date: value };
      } else {
        updateData = { [columnKey]: value };
      }

      const response = await api.put(
        `/user-preferences/todos/${todoId}`,
        updateData,
      );
      const updatedTodo = response.data?.data || response.data;
      const mappedTodo = {
        ...updatedTodo,
        text: updatedTodo.title,
        createdAt: updatedTodo.created_at,
      };
      setTodos(todos.map((todo) => (todo.id === todoId ? mappedTodo : todo)));

      toast({
        title: "Updated",
        description: "Task updated successfully.",
      });
    } catch (error) {
      console.error("Error updating todo:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update task.",
        variant: "destructive",
      });
      fetchTodos(); // Rollback on error
    }
  };

  // Delete todo
  const handleDelete = async (todo) => {
    const confirmed = window.confirm(`Delete "${todo.text}"?`);
    if (!confirmed) return;

    try {
      await api.delete(`/user-preferences/todos/${todo.id}`);

      setTodos(todos.filter((t) => t.id !== todo.id));
      toast({
        title: "Task Deleted",
        description: "Task has been removed.",
      });
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  // Duplicate todo
  const handleDuplicate = async (todo) => {
    try {
      const response = await api.post("/user-preferences/todos", {
        title: `${todo.text || todo.title} (Copy)`,
        completed: false,
      });
      const newTodo = response.data?.data || response.data;
      const mappedTodo = {
        ...newTodo,
        text: newTodo.title,
        createdAt: newTodo.created_at,
      };
      setTodos([mappedTodo, ...todos]);
      toast({
        title: "Task Duplicated",
        description: "Task has been copied.",
      });
    } catch (error) {
      console.error("Error duplicating todo:", error);
      toast({
        title: "Duplicate Failed",
        description: "Failed to duplicate task.",
        variant: "destructive",
      });
    }
  };

  // Bulk delete
  const handleBulkDelete = async (todoIds) => {
    try {
      await Promise.all(
        todoIds.map((id) => api.delete(`/user-preferences/todos/${id}`)),
      );

      setTodos(todos.filter((t) => !todoIds.includes(t.id)));
      toast({
        title: "Tasks Deleted",
        description: `${todoIds.length} tasks have been removed.`,
      });
    } catch (error) {
      console.error("Error bulk deleting todos:", error);
      toast({
        title: "Bulk Delete Failed",
        description: "Failed to delete tasks.",
        variant: "destructive",
      });
    }
  };

  // Column configuration
  const columns = useMemo(
    () => [
      {
        key: "text",
        label: "Item",
        type: "text",
        editable: true,
        width: 350,
      },
      {
        key: "status",
        label: "Status",
        type: "status",
        editable: true,
        width: 140,
      },
      {
        key: "priority",
        label: "Priority",
        type: "priority",
        editable: true,
        width: 130,
      },
      {
        key: "category",
        label: "Category",
        type: "category",
        editable: true,
        width: 130,
        options: [
          "Work",
          "Personal",
          "Urgent",
          "Follow-up",
          "Research",
          "Meeting",
          "Other",
        ],
      },
      {
        key: "due_date",
        label: "Due Date",
        type: "date",
        editable: true,
        width: 130,
      },
      {
        key: "createdAt",
        label: "Created",
        type: "date",
        editable: false,
        width: 120,
      },
    ],
    [],
  );

  // Get unique categories from todos
  const uniqueCategories = useMemo(() => {
    const categories = todos.map((t) => t.category).filter(Boolean);
    return ["all", ...new Set(categories)];
  }, [todos]);

  // Filter todos based on selected filters
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (priorityFilter !== "all" && todo.priority !== priorityFilter)
        return false;
      if (categoryFilter !== "all" && todo.category !== categoryFilter)
        return false;
      return true;
    });
  }, [todos, priorityFilter, categoryFilter]);

  // Predefined groups
  const todoGroups = useMemo(
    () => [
      {
        key: "active",
        label: "Active",
        color: "#fdab3d",
        filter: (todo) => !todo.completed,
      },
      {
        key: "completed",
        label: "Completed",
        color: "#00c875",
        filter: (todo) => todo.completed,
      },
    ],
    [],
  );

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const total = todos.length;
    const active = todos.filter((t) => !t.completed).length;
    const completed = todos.filter((t) => t.completed).length;
    const highPriority = todos.filter(
      (t) => !t.completed && (t.priority === "high" || t.priority === "urgent"),
    ).length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate overdue tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = todos.filter((t) => {
      if (t.completed) return false;
      if (!t.due_date) return false;
      const dueDate = new Date(t.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;

    // Tasks due today
    const dueToday = todos.filter((t) => {
      if (t.completed) return false;
      if (!t.due_date) return false;
      const dueDate = new Date(t.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    }).length;

    return {
      total,
      active,
      completed,
      highPriority,
      completionRate,
      overdue,
      dueToday,
    };
  }, [todos]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center pt-[150px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F0D28] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                To-Do List
                <span className="ml-3 text-[#3F0D28]">●</span>
              </h1>
              {isReadOnly() && <ViewOnlyBadge />}
            </div>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              {isReadOnly()
                ? "View tasks - Read-only access"
                : "Manage your daily tasks and stay organized"}
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-[#3F0D28]/20 focus:border-[#3F0D28] transition-all"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            {uniqueCategories.length > 1 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-[#3F0D28]/20 focus:border-[#3F0D28] transition-all"
              >
                <option value="all">All Categories</option>
                {uniqueCategories
                  .filter((c) => c !== "all")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            )}
            {(priorityFilter !== "all" || categoryFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPriorityFilter("all");
                  setCategoryFilter("all");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid - Enhanced */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#3F0D28]/10">
                <CheckSquare className="h-4 w-4 text-[#3F0D28]" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  Total
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {stats.total}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 border border-amber-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <Circle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">
                  Active
                </div>
                <div className="text-xl font-bold text-amber-600">
                  {stats.active}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <Check className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">
                  Done
                </div>
                <div className="text-xl font-bold text-emerald-600">
                  {stats.completed}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#3F0D28]/5 to-[#3F0D28]/10 rounded-xl p-4 border border-[#3F0D28]/20 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#3F0D28]/10">
                <AlertTriangle className="h-4 w-4 text-[#3F0D28]" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[#3F0D28] uppercase tracking-wide">
                  High Priority
                </div>
                <div className="text-xl font-bold text-[#3F0D28]">
                  {stats.highPriority}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-orange-700 uppercase tracking-wide">
                  Overdue
                </div>
                <div className="text-xl font-bold text-orange-600">
                  {stats.overdue}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-4 w-4 text-[#3F0D28]" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">
                  Completion
                </div>
                <div className="text-xl font-bold text-[#3F0D28]">
                  {stats.completionRate}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monday Table */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
        <MondayTable
          data={filteredTodos}
          columns={columns}
          groups={todoGroups}
          onAddItem={canCreate() ? handleAddTodo : undefined}
          onAddItemToGroup={canCreate() ? handleAddTodoToGroup : undefined}
          onCellEdit={canEdit() ? handleCellEdit : undefined}
          onDelete={canEdit() ? handleDelete : undefined}
          onDuplicate={canCreate() ? handleDuplicate : undefined}
          onBulkDelete={canEdit() ? handleBulkDelete : undefined}
          enablePlaceholderRows={!isReadOnly()}
          searchPlaceholder="Search tasks..."
          newItemLabel="New item"
          addRowLabel="+ Add item"
          enableSearch={true}
          enableGroups={true}
          enableBulkActions={true}
          enableAddRow={true}
          placeholderRowCount={3}
        />
      </div>
    </div>
  );
}
