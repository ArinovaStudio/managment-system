"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, User, Clock } from "lucide-react";

export default function WorkDoneTab({ projectId }: any) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedTasks();
  }, [projectId]);

  const fetchCompletedTasks = async () => {
    try {
      const res = await fetch(`/api/kanban/task?projectId=${projectId}`);
      const data = await res.json();
      if (data.tasks) {
        // Filter completed tasks for this project
        const completedTasks = data.tasks.filter((task: any) => 
          task.status.trim().toLowerCase() === 'completed' && 
          (!projectId || task.projectId === projectId)
        );
        setTasks(completedTasks);
      }
    } catch (err) {
      console.error("Error fetching work done:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-2 border-blue-500 border-b-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Work Done Tracking
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        View all tasks completed by team members.
      </p>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{tasks.length}</p>
              <p className="text-sm text-green-600 dark:text-green-400">Completed Tasks</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <User className="text-blue-600 dark:text-blue-400" size={24} />
            <div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {new Set(tasks.map(t => t.assignee)).size}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Contributors</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="text-purple-600 dark:text-purple-400" size={24} />
            <div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {tasks.filter(t => {
                  const completedDate = new Date(t.updatedAt);
                  const today = new Date();
                  return completedDate.toDateString() === today.toDateString();
                }).length}
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400">Completed Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Inventory */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Complete Inventory of Finished Tasks
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            All tasks completed with assignee information
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No completed tasks yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Completed tasks will appear here with assignee details
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 mt-1" size={20} />
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                        <User size={14} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Completed by: {task.assignee}
                        </span>
                      </div>
                      
                      {task.priority && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          task.priority === 'high' ? 'bg-red-300/20 text-red-300' :
                          task.priority === 'medium' ? 'bg-yellow-300/20 text-yellow-300' :
                          'bg-green-300/20 text-green-300'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {task.tags && task.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {task.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <Clock size={14} className="inline mr-1" />
                      Completed on
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(task.updatedAt).toLocaleDateString()}
                    </div>
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
