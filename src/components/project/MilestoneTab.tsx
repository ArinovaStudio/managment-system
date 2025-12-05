"use client";

import { useEffect, useState } from "react";
import { Calendar, Flag, Plus, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";

export default function MilestoneTab({ projectId }: any) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  // Load milestones and current user
  useEffect(() => {
    if (projectId) {
      fetchMilestones();
      fetchCurrentUser();
    }
  }, [projectId]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      
      
      if (res.ok && data.success) {
        setCurrentUser(data.user);
      } else {
        console.error('Auth failed:', data.message);
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
    }
  };

  const fetchMilestones = async () => {
    try {
      const res = await fetch(`/api/project/milestone?projectId=${projectId}`);
      const data = await res.json();

      if (data.success) setMilestones(data.milestones);
    } catch (err) {
      console.error("Milestone fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async () => {
    if (!newMilestone.title.trim() || !newMilestone.dueDate.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!currentUser?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/project/milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMilestone,
          projectId,
          adminId: currentUser.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOpen(false);
        setNewMilestone({ title: "", description: "", dueDate: "" });
        await fetchMilestones();
        toast.success('Milestone created successfully!');
      } else {
        toast.error(data.message || 'Failed to create milestone');
      }
    } catch (err) {
      console.error("Milestone creation error:", err);
      toast.error("Error creating milestone");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <p className="text-gray-400">Loading milestones...</p>;
  }

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Milestones</h2>
        
        {/* Debug info */}
        <div className="text-xs text-gray-500 mb-2">
          User: {currentUser?.name || 'Not loaded'} | Role: {currentUser?.role || 'Unknown'}
        </div>
        
        {(currentUser?.role === 'ADMIN' || currentUser?.role === 'EMPLOYEE') && (
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> Add Milestone
          </button>
        )}
      </div>

      {/* Empty State */}
      {milestones.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No milestones created yet.</p>
          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'EMPLOYEE') && (
            <p className="text-sm text-gray-400 mt-2">Create your first milestone to track project progress.</p>
          )}
        </div>
      )}

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.map((m: any) => {
          const isOverdue = new Date(m.dueDate) < new Date();
          const isUpcoming = new Date(m.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          
          return (
            <div
              key={m.id}
              className={` ${
                isOverdue ? 'bg-white border border-red-200 dark:bg-red-500/20' :
                isUpcoming ? 'bg-white border border-yellow-200 dark:bg-yellow-500/20' :
                'bg-white border border-green-200 dark:bg-green-500/20'
              }
                p-5 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-shadow`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{m.title}</h3>

                <div className="flex items-center gap-2">
                  <Flag 
                    size={16} 
                    className={`${
                      isOverdue ? 'text-red-500' : 
                      isUpcoming ? 'text-yellow-500' : 
                      'text-green-500'
                    }`} 
                  />
                  <span className={`text-xs px-3 py-1 rounded-lg border ${
                    isOverdue ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' :
                    isUpcoming ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800' :
                    'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                  }`}>
                    {new Date(m.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mt-2">{m.description || "No description"}</p>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-400">
                  {isOverdue ? 'Overdue' : isUpcoming ? 'Due Soon' : 'On Track'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl">

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Milestone</h2>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={newMilestone.title}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, title: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter milestone title"
                disabled={creating}
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Description</label>
              <textarea
                value={newMilestone.description}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, description: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Enter milestone description"
                disabled={creating}
              />
            </div>

            {/* Due Date */}
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">Due Date *</label>
              <input
                type="date"
                value={newMilestone.dueDate}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
                disabled={creating}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setOpen(false);
                  setNewMilestone({ title: "", description: "", dueDate: "" });
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={creating}
              >
                Cancel
              </button>

              <button
                onClick={createMilestone}
                disabled={creating || !newMilestone.title.trim() || !newMilestone.dueDate.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {creating && <Loader2 size={16} className="animate-spin" />}
                {creating ? 'Creating...' : 'Create Milestone'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
