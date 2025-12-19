"use client";

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  Paperclip,
  User,
  Calendar,
  Flag,
  X,
  Plus,
  Search,
  Send,
  AlertCircle,
  Tag
} from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeAvatar: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  tags: string[];
  comments: Comment[];
  attachments: Array<{ id: string; name: string; size: string; type: string }>;
  status: 'assigned' | 'in-progress' | 'completed';
}

const priorityClasses = {
  low: 'dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 bg-blue-50 text-blue-700 border-blue-200',
  medium: 'dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30 bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30 bg-red-50 text-red-700 border-red-200'
} as const;

type NewTaskShape = {
  title: string;
  description: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  tags: string[];
  status: 'assigned' | 'in-progress' | 'completed';
  attachmentFile: File | null;
};

interface KanbanTabProps {
  projectId: string;
}

const NewTaskModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  newTask: NewTaskShape;
  setNewTask: (t: NewTaskShape) => void;
  handleCreateTask: () => void;
  handleAddTag: (tag: string) => void;
  handleRemoveTag: (tag: string) => void;
  currentUser: { name: string } | null;
}> = ({ isOpen, onClose, newTask, setNewTask, handleCreateTask, handleAddTag, handleRemoveTag, currentUser }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0a0a0a]">
        <div className="sticky top-0 z-10 border-b px-6 py-4 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Task</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Task Title *</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Enter task title..."
              className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-[#111] border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Describe the task..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border resize-none bg-white dark:bg-[#111] border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Assignee</label>
              <div className="flex items-center gap-2 pl-1">
                <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-900 dark:text-white font-medium">
                  {currentUser?.name || newTask.assignee || "Loading..."}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border bg-white dark:bg-[#111] border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Priority</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setNewTask({ ...newTask, priority })}
                    className={`flex-1 px-4 py-3 rounded-lg border font-medium capitalize transition-all ${newTask.priority === priority
                        ? priority === 'low'
                          ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/50'
                          : priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/50'
                            : 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/50'
                        : 'bg-white dark:bg-[#111] border-gray-300 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-700'
                      }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as Task['status'] })}
                className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-[#111] border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {newTask.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tags (press Enter)..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-[#111] border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 px-6 py-3 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button onClick={handleCreateTask} disabled={!newTask.title.trim()} className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors">
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidePanel: React.FC<{
  selectedTask: Task | null;
  onClose: () => void;
  commentText: string;
  setCommentText: (v: string) => void;
  handleAddComment: () => void;
}> = ({ selectedTask, onClose, commentText, setCommentText, handleAddComment }) => {
  if (!selectedTask) return null;

  return (
    <div className="fixed inset-0 z-9999 flex justify-end">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[600px] h-full bg-white dark:bg-[#0a0a0a] shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 border-b px-6 py-4 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Task Details</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTask.title}</h1>
              <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${priorityClasses[selectedTask.priority]}`}>
                <Flag className="w-3 h-3 inline mr-1" />
                {selectedTask.priority}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Task ID: #{selectedTask.id}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Description</h3>
            <p className="text-gray-600 dark:text-gray-400">{selectedTask.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#111]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Assignee</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gradient-to-br from-blue-400 to-purple-400 text-white dark:from-blue-500 dark:to-purple-500">
                  {selectedTask.assigneeAvatar}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{selectedTask.assignee}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Due Date</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(selectedTask.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <MessageSquare className="w-5 h-5" />
              Comments ({selectedTask?.comments?.length})
            </h3>
            <div className="space-y-4 mb-4">
              {selectedTask.comments?.map(comment => (
                <div key={comment.id} className="p-4 rounded-xl bg-gray-50 dark:bg-[#111]">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gradient-to-br from-green-400 to-teal-400 text-white dark:from-green-500 dark:to-teal-500">{comment.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">{comment.author}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">{new Date(comment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl border bg-gray-50 border-gray-200 dark:bg-[#111] dark:border-gray-800">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <button onClick={handleAddComment} disabled={!commentText.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function KanbanTab({ projectId }: KanbanTabProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [commentText, setCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string } | null>(null);
  const [newTask, setNewTask] = useState<NewTaskShape>({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    dueDate: '',
    tags: [],
    status: 'assigned',
    attachmentFile: null
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  console.log("i am running");


  useEffect(() => {
    fetchTasks();
    console.log("this is the project id", projectId);


  }, [projectId]);

  useEffect(() => {
  fetch("/api/user", { credentials: "include" })
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      if (data?.user) {
        setCurrentUser(data.user);
        setNewTask(prev => ({
          ...prev,
          assignee: data.user.name,
        }));
      }
    })
    .catch(() => {});
}, []);


  const fetchTasks = async () => {
    try {
      console.log("fetch tas calledd");

      const res = await fetch(`/api/kanban/task?projectId=${projectId}`);
      const data = await res.json();
      console.log("fetched tasks data", data);

      if (data.tasks) setTasks(data.tasks);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  };

  const columns = [
    { id: 'assigned', title: 'Assigned', icon: User, color: 'blue' },
    { id: 'in-progress', title: 'In Progress', icon: Clock, color: 'yellow' },
    { id: 'completed', title: 'Completed', icon: CheckCircle2, color: 'green' }
  ];

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus: Task["status"]) => {
    if (!draggedTask) return;

    const prevTasks = [...tasks];
    setTasks(prev =>
      prev.map(task =>
        task.id === draggedTask.id ? { ...task, status: newStatus } : task
      )
    );

    try {
      const res = await fetch("/api/kanban/task", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draggedTask.id,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }
    } catch (err) {
      console.error("API Update Failed:", err);
      setTasks(prevTasks);
    }

    setDraggedTask(null);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedTask) return;

    const res = await fetch("/api/kanban/comment", {
      method: "POST",
      body: JSON.stringify({
        content: commentText,
        taskId: selectedTask.id,
      }),
    });

    const data = await res.json();
    if (!data.success) return;

    const newComment = data.comment;
    setTasks(tasks.map(task =>
      task.id === selectedTask.id
        ? { ...task, comments: [...task.comments, newComment] }
        : task
    ));

    setSelectedTask({
      ...selectedTask,
      comments: [...selectedTask.comments, newComment],
    });

    setCommentText("");
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const formData = new FormData();

      const assigneeName = newTask.assignee || "Unassigned";


      formData.append("title", newTask.title.trim());
      formData.append("description", newTask.description.trim());
      formData.append("assignee", assigneeName);
      formData.append("assigneeAvatar", newTask.assignee ? newTask.assignee.split(" ").map(n => n[0]).join("").toUpperCase() : "");
      formData.append("priority", newTask.priority);
      formData.append("dueDate", newTask.dueDate);
      formData.append("status", newTask.status);
      formData.append("tags", newTask.tags.join(","));
      formData.append("projectId", projectId);

      if (newTask.attachmentFile) {
        formData.append("attachment", newTask.attachmentFile);
      }

      const res = await fetch("/api/kanban/task", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Create Task Error:", data);
        return;
      }

      setTasks(prev => [...prev, data.task]);
      setShowNewTaskModal(false);
      setNewTask({
        title: "",
        description: "",
        assignee: "",
        priority: "medium",
        dueDate: "",
        tags: [],
        status: "assigned",
        attachmentFile: null,
      });
    } catch (error) {
      console.error("Create Task Exception:", error);
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !newTask.tags.includes(tag.trim())) {
      setNewTask({ ...newTask, tags: [...newTask.tags, tag.trim()] });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTask({ ...newTask, tags: newTask.tags.filter(tag => tag !== tagToRemove) });
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTasksByStatus = (status: Task['status']) => filteredTasks.filter(task => task.status === status);

  return (
    <div className="min-h-screen transition-colors duration-200">
      <div className="border-b sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Kanban Board</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                />
              </div>
              <button onClick={() => setShowNewTaskModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" />
                New Task
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {columns.map(column => {
            const Icon = column.icon;
            const columnTasks = getTasksByStatus(column.id as Task['status']);

            return (
              <div key={column.id} className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${column.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                        column.color === 'yellow' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400' :
                          'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                      }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{column.title}</h2>
                  </div>
                  <h2 className="font-medium text-base text-gray-600 dark:text-white mr-4">{columnTasks.length}</h2>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(column.id as Task['status'])}
                  className={`flex-1 space-y-3 min-h-[200px] p-1 rounded-lg ${draggedTask && draggedTask.status !== column.id ? 'bg-gray-100/50 dark:bg-gray-800/30' : ''
                    }`}
                >
                  {columnTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onClick={() => setSelectedTask(task)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all bg-white dark:bg-gray-800/[0.5] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 ${draggedTask?.id === task.id ? 'opacity-50' : ''
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-600 dark:text-white line-clamp-2">{task.title}</h3>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${priorityClasses[task.priority]} flex-shrink-0 ml-2`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-sm mb-3 line-clamp-2 text-gray-600 dark:text-gray-400">{task.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {task.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{task.comments?.length}</span>
                          </div>
                          {task.attachments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Paperclip className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{task.attachments.length}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-gradient-to-br from-blue-500 to-green-500 text-white">
                            {task.assigneeAvatar}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SidePanel
        selectedTask={selectedTask}
        onClose={() => setSelectedTask(null)}
        commentText={commentText}
        setCommentText={setCommentText}
        handleAddComment={handleAddComment}
      />

      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        newTask={newTask}
        setNewTask={setNewTask}
        handleCreateTask={handleCreateTask}
        currentUser={currentUser}
        handleAddTag={handleAddTag}
        handleRemoveTag={handleRemoveTag}
      />
    </div>
  );
}