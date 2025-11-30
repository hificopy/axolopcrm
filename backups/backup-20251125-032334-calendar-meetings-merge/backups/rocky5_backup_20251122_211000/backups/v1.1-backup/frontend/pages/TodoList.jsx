import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X, Edit3, Filter, Calendar, CheckSquare, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

export default function TodoList() {
  const { toast } = useToast();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch todos from API
  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.get(`${API_BASE_URL}/api/user-preferences/todos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(response.data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load todos. Using local storage as fallback.',
        variant: 'destructive',
      });
      // Fallback to localStorage if API fails
      const savedTodos = localStorage.getItem('axolop-todos');
      if (savedTodos) {
        try {
          setTodos(JSON.parse(savedTodos));
        } catch (e) {
          console.error('Error loading from localStorage:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Load todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim()) {
      toast({
        title: "Empty Task",
        description: "Please enter a task description.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.post(
        `${API_BASE_URL}/api/user-preferences/todos`,
        { text: newTodo.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTodos([response.data, ...todos]);
      setNewTodo('');

      toast({
        title: "Task Added",
        description: "New task has been added to your list.",
      });
    } catch (error) {
      console.error('Error adding todo:', error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleTodo = async (id) => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.post(
        `${API_BASE_URL}/api/user-preferences/todos/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTodos(todos.map(todo =>
        todo.id === id ? response.data : todo
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    }
  };

  const deleteTodo = async (id) => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      await axios.delete(
        `${API_BASE_URL}/api/user-preferences/todos/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTodos(todos.filter(todo => todo.id !== id));

      toast({
        title: "Task Deleted",
        description: "Task has been removed from your list.",
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) {
      toast({
        title: "Empty Task",
        description: "Task description cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.put(
        `${API_BASE_URL}/api/user-preferences/todos/${id}`,
        { text: editText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTodos(todos.map(todo =>
        todo.id === id ? response.data : todo
      ));
      setEditingId(null);
      setEditText('');

      toast({
        title: "Task Updated",
        description: "Task has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating todo:', error);
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const clearCompleted = async () => {
    const completedTodos = todos.filter(t => t.completed);
    const completedCount = completedTodos.length;

    if (completedCount === 0) return;

    try {
      const token = localStorage.getItem('supabase.auth.token');

      // Delete all completed todos
      await Promise.all(
        completedTodos.map(todo =>
          axios.delete(
            `${API_BASE_URL}/api/user-preferences/todos/${todo.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      setTodos(todos.filter(todo => !todo.completed));

      toast({
        title: "Completed Tasks Cleared",
        description: `Removed ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}.`,
      });
    } catch (error) {
      console.error('Error clearing completed todos:', error);
      toast({
        title: "Error",
        description: "Failed to clear completed tasks.",
        variant: "destructive",
      });
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'ACTIVE') return !todo.completed;
    if (filter === 'COMPLETED') return todo.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b1c14] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              To-Do List
              <span className="ml-3 text-[#7b1c14]">●</span>
            </h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Manage your daily tasks and stay organized
            </p>
          </div>

          {stats.completed > 0 && (
            <Button
              variant="outline"
              size="default"
              className="gap-2"
              onClick={clearCompleted}
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Completed</span>
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#7b1c14]/10">
                <CheckSquare className="h-5 w-5 text-[#7b1c14]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Tasks</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-600/10">
                <Circle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Active</div>
                <div className="text-2xl font-bold text-amber-600 mt-1">
                  {stats.active}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-600/10">
                <Check className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Completed</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">
                  {stats.completed}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Todo Input */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex gap-3">
          <Input
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            className="flex-1 border-gray-300 focus:ring-[#7b1c14] focus:border-[#7b1c14]"
          />
          <Button
            onClick={addTodo}
            className="bg-[#7b1c14] hover:bg-[#6b1a12] shadow-lg gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'ALL'
                ? 'bg-[#7b1c14] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'ACTIVE'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'COMPLETED'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({stats.completed})
          </button>
        </div>
      </div>

      {/* Todo List */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 shadow-lg">
            <div className="p-6 rounded-full bg-[#7b1c14]/10 mx-auto mb-6">
              <CheckSquare className="h-16 w-16 text-[#7b1c14]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {filter === 'ALL' && 'No tasks yet'}
              {filter === 'ACTIVE' && 'No active tasks'}
              {filter === 'COMPLETED' && 'No completed tasks'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md text-center">
              {filter === 'ALL' && 'Add your first task to get started with your to-do list'}
              {filter === 'ACTIVE' && 'All tasks are completed. Great job!'}
              {filter === 'COMPLETED' && 'Complete some tasks to see them here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      todo.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-gray-300 hover:border-[#7b1c14]'
                    }`}
                  >
                    {todo.completed && <Check className="h-4 w-4 text-white" />}
                  </button>

                  {/* Todo Text */}
                  <div className="flex-1 min-w-0">
                    {editingId === todo.id ? (
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') saveEdit(todo.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="w-full"
                        autoFocus
                      />
                    ) : (
                      <div>
                        <p
                          className={`text-gray-900 font-medium ${
                            todo.completed ? 'line-through text-gray-500' : ''
                          }`}
                        >
                          {todo.text}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(todo.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {editingId === todo.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => saveEdit(todo.id)}
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(todo)}
                          className="hover:border-[#7b1c14] hover:text-[#7b1c14]"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTodo(todo.id)}
                          className="hover:border-red-500 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
