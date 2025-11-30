import { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Plus,
  X,
  Check,
  Trash2,
  Edit3,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import api from "@/lib/api";

export default function TodoSlideOver() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch todos from API
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/user-preferences/todos");
      const data = response.data?.data || response.data || [];
      setTodos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching todos:", error);
      // Only show error if not a 401 (auth redirect will handle it)
      if (error?.response?.status !== 401) {
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load todos on mount and when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchTodos();
    }
  }, [isOpen, fetchTodos]);

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    setSaving(true);
    try {
      const response = await api.post("/user-preferences/todos", {
        title: newTodo.trim(),
        completed: false,
        priority: "medium",
      });

      const newTodoData = response.data?.data || response.data;
      setTodos([newTodoData, ...todos]);
      setNewTodo("");
      toast({
        title: "Task Added",
        description: "Your task has been saved.",
      });
    } catch (error) {
      console.error("Error adding todo:", error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleTodo = async (id) => {
    // Optimistic update
    const previousTodos = [...todos];
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );

    try {
      await api.post(`/user-preferences/todos/${id}/toggle`);
    } catch (error) {
      console.error("Error toggling todo:", error);
      setTodos(previousTodos); // Rollback on error
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    }
  };

  const deleteTodo = async (id) => {
    // Optimistic update
    const previousTodos = [...todos];
    setTodos(todos.filter((todo) => todo.id !== id));

    try {
      await api.delete(`/user-preferences/todos/${id}`);
      toast({
        title: "Deleted",
        description: "Task has been removed.",
      });
    } catch (error) {
      console.error("Error deleting todo:", error);
      setTodos(previousTodos); // Rollback on error
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.title || todo.text || "");
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;

    // Optimistic update
    const previousTodos = [...todos];
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, title: editText.trim() } : todo,
      ),
    );
    setEditingId(null);

    try {
      await api.put(`/user-preferences/todos/${id}`, {
        title: editText.trim(),
      });
    } catch (error) {
      console.error("Error updating todo:", error);
      setTodos(previousTodos); // Rollback on error
      setEditingId(id);
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    }
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const stats = {
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  return (
    <>
      {/* Collapsed Bar - Top Right - Glassmorphic */}
      <div className="fixed top-3 right-[40px] z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-premium-red relative h-10 w-10 flex items-center justify-center rounded-xl text-white transition-all duration-200 group"
          style={{ position: "fixed", top: "12px", right: "40px" }}
        >
          <CheckSquare className="h-5 w-5 text-white group-hover:text-white transition-colors relative z-10" />
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-[#5a1610] rounded-full shadow-lg z-20 flex items-center justify-center text-xs text-white font-bold">
            {stats.active > 9 ? "9+" : stats.active}
          </span>

          {/* Tooltip - Opaque */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-gray-700">
            Tasks
          </div>
        </button>
      </div>

      {/* Slide-over Panel - Glassmorphic */}
      <div
        className={`fixed top-16 right-4 w-96 backdrop-blur-2xl bg-white/95 rounded-lg shadow-2xl border border-gray-200/50 z-50 transition-all duration-300 transform ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
        style={{ maxHeight: "calc(100vh - 6rem)" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#761B14] to-[#6b1a12] text-white px-4 py-3 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              <h3 className="font-bold">Quick Tasks</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 text-xs">
                <span className="bg-white/20 px-2 py-1 rounded">
                  {stats.active} Active
                </span>
                <span className="bg-white/20 px-2 py-1 rounded">
                  {stats.completed} Done
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-1 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Add Todo Input */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <Input
              placeholder="Add a task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTodo()}
              className="flex-1 h-9 text-sm border-gray-300 focus:ring-[#761B14] focus:border-[#761B14]"
            />
            <Button
              onClick={addTodo}
              size="sm"
              className="btn-premium-red h-9"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Todo List */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 16rem)" }}
        >
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="h-8 w-8 mx-auto mb-3 text-[#761B14] animate-spin" />
              <p className="text-sm font-medium">Loading tasks...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium">No tasks yet</p>
              <p className="text-xs mt-1">Add your first task above</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`group bg-white border border-gray-200 rounded-lg p-2.5 hover:shadow-md transition-all duration-200 ${
                    todo.completed ? "bg-gray-50 border-gray-100" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        todo.completed
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-gray-300 hover:border-[#761B14]"
                      }`}
                    >
                      {todo.completed && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </button>

                    {/* Todo Content */}
                    <div className="flex-1 min-w-0">
                      {editingId === todo.id ? (
                        <div className="flex gap-1">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") saveEdit(todo.id);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="flex-1 h-7 text-sm"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => saveEdit(todo.id)}
                            className="h-7 px-2 bg-emerald-500 hover:bg-emerald-600"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            className="h-7 px-2"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p
                            className={`text-sm font-medium ${
                              todo.completed
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {todo.title || todo.text}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(
                              todo.created_at || todo.createdAt,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    {editingId !== todo.id && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(todo)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Edit3 className="h-3 w-3 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
