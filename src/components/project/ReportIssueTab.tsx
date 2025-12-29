"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Plus, MessageSquare, Calendar, User } from "lucide-react";
import toast from "react-hot-toast";

export default function ReportIssueTab({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [issueType, setIssueType] = useState("project");

  const [newReport, setNewReport] = useState({
    message: "",
    taskId: ""
  });

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  useEffect(() => {
    if (tasks.length > 0) {
      fetchAllReports();
    }
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/kanban/task?projectId=${projectId}`);
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
    finally {
      setLoading(false);
    }
  };

  const fetchAllReports = async () => {
    if (tasks.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const allReports = [];
      for (const task of tasks) {
        try {
          const reportRes = await fetch(`/api/kanban/report?taskId=${task.id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (reportRes.ok) {
            const reportData = await reportRes.json();
            
            if (reportData.success && reportData.messages) {
              const taskReports = reportData.messages.map((msg: any) => ({
                ...msg,
                taskTitle: task.title,
                taskId: task.id,
                issueType: msg.message.includes('[PROJECT ISSUE]') ? 'PROJECT' : 'TASK'
              }));
              allReports.push(...taskReports);
            }
          }
        } catch (err) {
          console.error(`Failed to fetch reports for task ${task.id}:`, err);
        }
      }
      setReports(allReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const createReport = async () => {
    if (!newReport.message.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    if (issueType === "task" && !newReport.taskId) {
      toast.error('Please select a task for task-specific issues');
      return;
    }

    try {
      setCreating(true);
      
      const taskId = issueType === "project" ? tasks[0]?.id : newReport.taskId;
      
      if (!taskId) {
        toast.error('No tasks available. Please create a task first.');
        return;
      }

      const res = await fetch('/api/kanban/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: `[${issueType.toUpperCase()} ISSUE] ${newReport.message.trim()}`,
          taskId
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        setNewReport({ message: "", taskId: "" });
        setIssueType("project");
        await fetchAllReports();
        toast.success('Issue reported successfully!');
      } else {
        toast.error(data.error || 'Failed to report issue');
      }
    } catch (err) {
      console.error("Failed to report issue:", err);
      toast.error('Error reporting issue');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertCircle size={24} />
          Report an Issue
        </h2>
        
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Report Issue
        </button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Issue Reporting Guidelines</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li><strong>Project-Wide Issues:</strong> General problems affecting the entire project</li>
          <li><strong>Task-Specific Issues:</strong> Problems related to individual tasks or features</li>
          <li><strong>Examples:</strong> Bug reports, performance issues, unclear requirements, technical difficulties</li>
        </ul>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No issues reported</h3>
          <p className="text-gray-600 dark:text-gray-400">
            When team members report issues, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report: any) => {
            const isProjectIssue = report.message.includes('[PROJECT ISSUE]');
            const cleanMessage = report.message.replace(/^\[(PROJECT|TASK) ISSUE\]\s*/, '');
            
            return (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className={`mt-1 ${isProjectIssue ? 'text-red-500' : 'text-orange-500'}`} size={20} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isProjectIssue 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                      }`}>
                        {isProjectIssue ? 'Project Issue' : 'Task Issue'}
                      </span>
                      {!isProjectIssue && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Task: {report.taskTitle}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {cleanMessage}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>Reported by team member</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report an Issue
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  Issue Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="project"
                      checked={issueType === "project"}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="mr-2"
                      disabled={creating}
                    />
                    <span className="text-sm">Project-Wide</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="task"
                      checked={issueType === "task"}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="mr-2"
                      disabled={creating}
                    />
                    <span className="text-sm">Task-Specific</span>
                  </label>
                </div>
              </div>

              {issueType === "task" && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                    Select Task *
                  </label>
                  <select
                    value={newReport.taskId}
                    onChange={(e) => setNewReport({ ...newReport, taskId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                    disabled={creating}
                  >
                    <option value="">Choose a task...</option>
                    {tasks.map((task: any) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  Issue Description *
                </label>
                <textarea
                  value={newReport.message}
                  onChange={(e) => setNewReport({ ...newReport, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 resize-none"
                  rows={4}
                  placeholder="Describe the issue in detail..."
                  disabled={creating}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewReport({ message: "", taskId: "" });
                  setIssueType("project");
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={createReport}
                disabled={creating || !newReport.message.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {creating ? 'Reporting...' : 'Report Issue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}