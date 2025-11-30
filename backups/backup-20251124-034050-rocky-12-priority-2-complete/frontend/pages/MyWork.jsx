import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Filter, Download, Calendar, CheckSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { MondayTable } from '@/components/MondayTable';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { InfoTooltipInline } from '@/components/ui/info-tooltip';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

export default function MyWork() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch tasks from backend
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle add task
  const handleAddTask = async () => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.post(
        `${API_BASE_URL}/api/tasks`,
        {
          name: 'New Task',
          status: 'Not Started',
          priority: 'medium',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks([response.data.data, ...tasks]);
      toast({
        title: "Task Created",
        description: "New task has been added successfully.",
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Failed to Create Task",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle cell edit
  const handleCellEdit = async (taskId, columnKey, value) => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      await axios.patch(
        `${API_BASE_URL}/api/tasks/${taskId}`,
        { [columnKey]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optimistic update
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, [columnKey]: value } : task
        )
      );

      toast({
        title: "Updated",
        description: "Task updated successfully.",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
      // Refetch on error
      fetchTasks();
    }
  };

  // Handle delete task
  const handleDelete = async (task) => {
    const confirmed = window.confirm(`Delete "${task.name}"?`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('supabase.auth.token');
      await axios.delete(`${API_BASE_URL}/api/tasks/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(tasks.filter(t => t.id !== task.id));
      toast({
        title: "Task Deleted",
        description: "Task has been removed.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  // Handle duplicate task
  const handleDuplicate = async (task) => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.post(
        `${API_BASE_URL}/api/tasks`,
        {
          ...task,
          id: undefined,
          name: `${task.name} (Copy)`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks([response.data.data, ...tasks]);
      toast({
        title: "Task Duplicated",
        description: "Task has been copied.",
      });
    } catch (error) {
      console.error('Error duplicating task:', error);
      toast({
        title: "Duplicate Failed",
        description: "Failed to duplicate task.",
        variant: "destructive",
      });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async (taskIds) => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      await axios.post(
        `${API_BASE_URL}/api/tasks/bulk-delete`,
        { taskIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks(tasks.filter(t => !taskIds.includes(t.id)));
      toast({
        title: "Tasks Deleted",
        description: `${taskIds.length} tasks have been removed.`,
      });
    } catch (error) {
      console.error('Error bulk deleting tasks:', error);
      toast({
        title: "Bulk Delete Failed",
        description: "Failed to delete tasks.",
        variant: "destructive",
      });
    }
  };

  // Handle add task to specific group
  const handleAddTaskToGroup = async (groupKey, groupLabel, initialData = {}) => {
    try {
      const token = localStorage.getItem('supabase.auth.token');

      // Calculate due date based on group
      let dueDate = null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (groupLabel) {
        case 'Today':
          dueDate = new Date(today);
          break;
        case 'This week':
          // Set to tomorrow
          dueDate = new Date(today);
          dueDate.setDate(dueDate.getDate() + 1);
          break;
        case 'Next week':
          // Set to next Monday
          dueDate = new Date(today);
          dueDate.setDate(dueDate.getDate() + 8);
          break;
        case 'Later':
          // Set to 30 days from now
          dueDate = new Date(today);
          dueDate.setDate(dueDate.getDate() + 30);
          break;
        case 'Past Dates':
          // Set to yesterday
          dueDate = new Date(today);
          dueDate.setDate(dueDate.getDate() - 1);
          break;
        case 'Without a date':
        default:
          dueDate = null;
          break;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/tasks`,
        {
          name: initialData.name || 'New Task',
          status: 'Not Started',
          priority: 'medium',
          due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
          ...initialData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks([response.data.data, ...tasks]);
      toast({
        title: "Task Created",
        description: `New task added to ${groupLabel}.`,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Failed to Create Task",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Monday table columns configuration
  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Task',
        type: 'text',
        editable: true,
        width: 300,
      },
      {
        key: 'comments',
        label: '',
        type: 'comments',
        editable: false,
        width: 50,
      },
      {
        key: 'group_name',
        label: 'Group',
        type: 'group',
        editable: false,
        width: 180,
      },
      {
        key: 'status',
        label: 'Status',
        type: 'status',
        editable: true,
        width: 160,
      },
      {
        key: 'board',
        label: 'Board',
        type: 'board',
        editable: false,
        width: 130,
      },
      {
        key: 'assigned_to',
        label: 'People',
        type: 'person',
        editable: false,
        width: 150,
      },
      {
        key: 'due_date',
        label: 'Date',
        type: 'date',
        editable: false,
        width: 140,
      },
      {
        key: 'priority',
        label: 'Priority',
        type: 'priority',
        editable: true,
        width: 160,
      },
    ],
    []
  );

  // Predefined groups (matching Monday.com)
  const taskGroups = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getGroupForTask = (task) => {
      if (!task.due_date) return 'Without a date';

      const taskDate = new Date(task.due_date);
      taskDate.setHours(0, 0, 0, 0);

      const diffTime = taskDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'Past Dates';
      if (diffDays === 0) return 'Today';
      if (diffDays > 0 && diffDays <= 7) return 'This week';
      if (diffDays > 7 && diffDays <= 14) return 'Next week';
      return 'Later';
    };

    return [
      {
        key: 'past-dates',
        label: 'Past Dates',
        color: '#e44258',
        filter: (task) => getGroupForTask(task) === 'Past Dates'
      },
      {
        key: 'today',
        label: 'Today',
        color: '#00c875',
        filter: (task) => getGroupForTask(task) === 'Today'
      },
      {
        key: 'this-week',
        label: 'This week',
        color: '#fdab3d',
        filter: (task) => getGroupForTask(task) === 'This week'
      },
      {
        key: 'next-week',
        label: 'Next week',
        color: '#2563eb',
        filter: (task) => getGroupForTask(task) === 'Next week'
      },
      {
        key: 'later',
        label: 'Later',
        color: '#7b2d8e',
        filter: (task) => getGroupForTask(task) === 'Later'
      },
      {
        key: 'without-date',
        label: 'Without a date',
        color: '#c4c4c4',
        filter: (task) => getGroupForTask(task) === 'Without a date'
      }
    ];
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t =>
      t.status?.toLowerCase() === 'done' ||
      t.status?.toLowerCase() === 'completed'
    ).length;
    const inProgress = tasks.filter(t =>
      t.status?.toLowerCase() === 'working on it' ||
      t.status?.toLowerCase() === 'in progress'
    ).length;
    const overdue = tasks.filter(t => {
      if (!t.due_date) return false;
      const taskDate = new Date(t.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return taskDate < today &&
        t.status?.toLowerCase() !== 'done' &&
        t.status?.toLowerCase() !== 'completed';
    }).length;

    return { total, completed, inProgress, overdue };
  }, [tasks]);

  return (
    <div className="h-full flex flex-col crm-page-wrapper bg-white">
      {/* Page Header */}
      <div className="relative bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              My Work
              <span className="ml-3 text-[#791C14]">●</span>
            </h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Track and manage your tasks, projects, and deadlines
            </p>
          </div>

          <div className="crm-button-group">
            <Button variant="outline" size="default" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" size="default" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="crm-stats-grid mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
              <CheckSquare className="h-4 w-4 mr-2" />
              Total Tasks
              <InfoTooltipInline content="All tasks in your workspace" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats.total}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide flex items-center">
              <CheckSquare className="h-4 w-4 mr-2" />
              Completed
              <InfoTooltipInline content="Tasks marked as completed" />
            </div>
            <div className="text-3xl font-bold text-emerald-600 mt-2">
              {stats.completed}
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              In Progress
              <InfoTooltipInline content="Tasks currently being worked on" />
            </div>
            <div className="text-3xl font-bold text-amber-600 mt-2">
              {stats.inProgress}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-[#791C14]/30 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="text-xs font-semibold text-[#791C14] uppercase tracking-wide flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Overdue
              <InfoTooltipInline content="Tasks past their due date" />
            </div>
            <div className="text-3xl font-bold text-[#791C14] mt-2">
              {stats.overdue}
            </div>
          </div>
        </div>
      </div>

      {/* Monday Table */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#791C14] mb-4"></div>
              <p className="text-gray-600 font-medium">Loading tasks...</p>
            </div>
          </div>
        ) : (
          <MondayTable
            data={tasks}
            columns={columns}
            groups={taskGroups}
            onAddItem={handleAddTask}
            onAddItemToGroup={handleAddTaskToGroup}
            onCellEdit={handleCellEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onBulkDelete={handleBulkDelete}
            searchPlaceholder="Search tasks..."
            newItemLabel="New item"
            addRowLabel="+ Add item"
            enableSearch={true}
            enableGroups={true}
            enableBulkActions={true}
            enableAddRow={true}
            enablePlaceholderRows={true}
            placeholderRowCount={3}
          />
        )}
      </div>
    </div>
  );
}
