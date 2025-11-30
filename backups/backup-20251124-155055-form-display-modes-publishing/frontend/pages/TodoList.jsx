import { useState, useEffect, useMemo, useCallback } from 'react';
import { CheckSquare, Circle, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { MondayTable } from '@/components/MondayTable';
import { useAgency } from '@/context/AgencyContext';
import ViewOnlyBadge from '@/components/ui/view-only-badge';
import api from '@/lib/api';

export default function TodoList() {
  const { toast } = useToast();
  const { isReadOnly, canEdit, canCreate } = useAgency();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch todos from API
  const fetchTodos = useCallback(async () => {
    try {
      const response = await api.get('/api/user-preferences/todos');
      setTodos(response.data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load todos.',
        variant: 'destructive',
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
      const response = await api.post('/api/user-preferences/todos', { text: 'New Task' });

      setTodos([response.data, ...todos]);
      toast({
        title: "Task Added",
        description: "New task has been added to your list.",
      });
    } catch (error) {
      console.error('Error adding todo:', error);
      toast({
        title: "Error",
        description: "Failed to add task.",
        variant: "destructive",
      });
    }
  };

  // Add todo to specific group
  const handleAddTodoToGroup = async (groupKey, groupLabel, initialData = {}) => {
    try {
      const response = await api.post('/api/user-preferences/todos', {
        text: initialData.text || 'New Task',
        completed: groupLabel === 'Completed'
      });

      setTodos([response.data, ...todos]);
      toast({
        title: "Task Added",
        description: `New task added to ${groupLabel}.`,
      });
    } catch (error) {
      console.error('Error adding todo:', error);
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
      if (columnKey === 'text') {
        const response = await api.put(`/api/user-preferences/todos/${todoId}`, { text: value });
        setTodos(todos.map(todo => todo.id === todoId ? response.data : todo));
      } else if (columnKey === 'status') {
        const response = await api.post(`/api/user-preferences/todos/${todoId}/toggle`);
        setTodos(todos.map(todo => todo.id === todoId ? response.data : todo));
      }

      toast({
        title: "Updated",
        description: "Task updated successfully.",
      });
    } catch (error) {
      console.error('Error updating todo:', error);
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
      await api.delete(`/api/user-preferences/todos/${todo.id}`);

      setTodos(todos.filter(t => t.id !== todo.id));
      toast({
        title: "Task Deleted",
        description: "Task has been removed.",
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
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
      const response = await api.post('/api/user-preferences/todos', {
        text: `${todo.text} (Copy)`,
        completed: false
      });

      setTodos([response.data, ...todos]);
      toast({
        title: "Task Duplicated",
        description: "Task has been copied.",
      });
    } catch (error) {
      console.error('Error duplicating todo:', error);
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
        todoIds.map(id => api.delete(`/api/user-preferences/todos/${id}`))
      );

      setTodos(todos.filter(t => !todoIds.includes(t.id)));
      toast({
        title: "Tasks Deleted",
        description: `${todoIds.length} tasks have been removed.`,
      });
    } catch (error) {
      console.error('Error bulk deleting todos:', error);
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
        key: 'text',
        label: 'Item',
        type: 'text',
        editable: true,
        width: 500,
      },
      {
        key: 'status',
        label: 'Status',
        type: 'status',
        editable: true,
        width: 180,
      },
      {
        key: 'createdAt',
        label: 'Date',
        type: 'date',
        editable: false,
        width: 160,
      },
    ],
    []
  );

  // Predefined groups
  const todoGroups = useMemo(() => [
    {
      key: 'active',
      label: 'Active',
      color: '#fdab3d',
      filter: (todo) => !todo.completed
    },
    {
      key: 'completed',
      label: 'Completed',
      color: '#00c875',
      filter: (todo) => todo.completed
    }
  ], []);

  // Calculate stats
  const stats = useMemo(() => ({
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  }), [todos]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center pt-[150px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#791C14] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              To-Do List
              <span className="ml-3 text-[#791C14]">●</span>
            </h1>
            {isReadOnly() && <ViewOnlyBadge />}
          </div>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            {isReadOnly() ? 'View tasks - Read-only access' : 'Manage your daily tasks and stay organized'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#791C14]/10">
                <CheckSquare className="h-5 w-5 text-[#791C14]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Tasks</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
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
                <div className="text-2xl font-bold text-amber-600 mt-1">{stats.active}</div>
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
                <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.completed}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monday Table */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
        <MondayTable
          data={todos}
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
