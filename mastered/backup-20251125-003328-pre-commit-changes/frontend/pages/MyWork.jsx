import { useState, useEffect, useCallback, useMemo } from 'react';
import { Filter, Calendar, CheckSquare, Clock, AlertTriangle, TrendingUp, Target, Play } from 'lucide-react';
import { Button } from './components/ui/button';
import { MondayTable } from './components/MondayTable';
import { tasksApi } from './lib/api';
import { useToast } from './components/ui/use-toast';
import { InfoTooltipInline } from './components/ui/info-tooltip';

export default function MyWork() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Fetch tasks from backend
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await tasksApi.getAll();
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
      const response = await tasksApi.create({
        name: 'New Task',
        status: 'Not Started',
        priority: 'medium',
      });

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
      await tasksApi.update(taskId, { [columnKey]: value });

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
      await tasksApi.delete(task.id);

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
      const response = await tasksApi.create({
        ...task,
        id: undefined,
        name: `${task.name} (Copy)`,
      });

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
      await Promise.all(taskIds.map(id => tasksApi.delete(id)));

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

      const response = await tasksApi.create({
        name: initialData.name || 'New Task',
        status: 'Not Started',
        priority: 'medium',
        due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
        ...initialData,
      });

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

  // Calculate comprehensive stats
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
    const notStarted = tasks.filter(t =>
      t.status?.toLowerCase() === 'not started' ||
      !t.status
    ).length;
    const highPriority = tasks.filter(t =>
      (t.priority === 'high' || t.priority === 'critical' || t.priority === 'urgent') &&
      t.status?.toLowerCase() !== 'done' &&
      t.status?.toLowerCase() !== 'completed'
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = tasks.filter(t => {
      if (!t.due_date) return false;
      const taskDate = new Date(t.due_date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate < today &&
        t.status?.toLowerCase() !== 'done' &&
        t.status?.toLowerCase() !== 'completed';
    }).length;

    const dueToday = tasks.filter(t => {
      if (!t.due_date) return false;
      const taskDate = new Date(t.due_date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime() &&
        t.status?.toLowerCase() !== 'done' &&
        t.status?.toLowerCase() !== 'completed';
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, notStarted, highPriority, overdue, dueToday, completionRate };
  }, [tasks]);

  // Filter tasks based on selected filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Status filter
      if (statusFilter !== 'all') {
        const taskStatus = task.status?.toLowerCase() || 'not started';
        if (statusFilter === 'completed' && taskStatus !== 'done' && taskStatus !== 'completed') return false;
        if (statusFilter === 'in-progress' && taskStatus !== 'working on it' && taskStatus !== 'in progress') return false;
        if (statusFilter === 'not-started' && taskStatus !== 'not started') return false;
      }
      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, priorityFilter]);

  return (
    <div className="h-full flex flex-col crm-page-wrapper bg-white">
      {/* Page Header */}
      <div className="relative bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              My Work
              <span className="ml-3 text-[#761B14]">●</span>
            </h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Track and manage your tasks, projects, and deadlines
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-[#761B14]/20 focus:border-[#761B14] transition-all"
              >
                <option value="all">All Status</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-[#761B14]/20 focus:border-[#761B14] transition-all"
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            {(statusFilter !== 'all' || priorityFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); }}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear Filters
              </Button>
            )}
            <Button variant="outline" size="default" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid - Enhanced */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#761B14]/10">
                <CheckSquare className="h-4 w-4 text-[#761B14]" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Total</div>
                <div className="text-lg font-bold text-gray-900">{stats.total}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-3 border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <CheckSquare className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">Done</div>
                <div className="text-lg font-bold text-emerald-600">{stats.completed}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-3 border border-amber-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <Play className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">In Progress</div>
                <div className="text-lg font-bold text-amber-600">{stats.inProgress}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gray-500/10">
                <Target className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Not Started</div>
                <div className="text-lg font-bold text-gray-600">{stats.notStarted}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-3 border border-red-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-red-700 uppercase tracking-wide">High Priority</div>
                <div className="text-lg font-bold text-red-600">{stats.highPriority}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-3 border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-orange-700 uppercase tracking-wide">Overdue</div>
                <div className="text-lg font-bold text-orange-600">{stats.overdue}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-3 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-purple-700 uppercase tracking-wide">Due Today</div>
                <div className="text-lg font-bold text-purple-600">{stats.dueToday}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-3 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">Completion</div>
                <div className="text-lg font-bold text-blue-600">{stats.completionRate}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monday Table */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#761B14] mb-4"></div>
              <p className="text-gray-600 font-medium">Loading tasks...</p>
            </div>
          </div>
        ) : (
          <MondayTable
            data={filteredTasks}
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
