"use client";

import React, { useState, useEffect } from "react";
import { Lightbulb, Plus, Calendar, Check, X, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newFeature, setNewFeature] = useState({ title: "", description: "", projectId: "" });
  const [userRole, setUserRole] = useState(false);

  useEffect(() => {
    fetchFeatures();
    fetchProjects();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    const userResponse = await fetch('/api/user');
    const userData = await userResponse.json();

    const adminStatus: boolean = userData.user && userData.user.role === 'ADMIN';
    setUserRole(adminStatus);
  };

  const fetchFeatures = async () => {
    try {
      const res = await fetch('/api/client/features');
      const data = await res.json();
      if (data.success) {
        setFeatures(data.features);
      }
    } catch (error) {
      toast.error('Failed to fetch features');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/project');
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects');
    }
  };

  const submitFeature = async () => {
    if (!newFeature.title || !newFeature.description || !newFeature.projectId) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const res = await fetch('/api/client/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeature)
      });
      if (res.ok) {
        toast.success('Feature request submitted successfully');
        setShowModal(false);
        setNewFeature({ title: "", description: "", projectId: "" });
        fetchFeatures();
      }
    } catch (error) {
      toast.error('Failed to submit feature request');
    }
  };

  const updateFeatureStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/client/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        toast.success(`Feature ${status.toLowerCase()}`);
        fetchFeatures();
      }
    } catch (error) {
      toast.error('Failed to update feature status');
    }
  };

  const deleteFeature = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;

    try {
      const res = await fetch('/api/client/features', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        toast.success('Feature deleted successfully');
        fetchFeatures();
      }
    } catch (error) {
      toast.error('Failed to delete feature');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Feature Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Manage feature requests from your clients.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Request Feature
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* <Lightbulb className="text-yellow-500" size={20} /> */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(feature.createdAt).toLocaleDateString()}
                      {feature.project && ` • ${feature.project.name}`}
                      {feature.client && ` • by ${feature.client.name}`}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium
                  ${feature.status === "accepted"
                      ? "bg-green-50 dark:bg-green-500/20 text-green-500"
                      : feature.status === "rejected"
                        ? "bg-red-50 dark:bg-red-500/20 text-red-500"
                        : "bg-yellow-50 dark:bg-yellow-500/20 text-yellow-500"
                    }
               `}
                >
                  {feature.status}
                </span>
              </div>
              <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>


              {userRole && (
                <div className="flex ">
                  {/* <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => updateFeatureStatus(feature.id, "accepted")}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-500/20 text-blue-500 rounded-lg text-sm"
                    >
                      {feature.status === "accepted" ? "Accepted" : "Accept"}
                    </button>

                    <button
                      onClick={() => updateFeatureStatus(feature.id, "rejected")}
                      className="px-3 py-1 bg-red-50 dark:bg-red-500/20 text-red-500 rounded-lg text-sm"
                    >
                      {feature.status === "rejected" ? "Rejected" : "Reject"}
                    </button>
                  </div> */}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => updateFeatureStatus(feature.id, "accepted")}
                      disabled={feature.status === "accepted"}
                      className={`px-3 py-1 rounded-lg text-sm transition-all
      ${feature.status === "accepted"
                          ? "bg-blue-600 text-white cursor-not-allowed"
                          : "bg-blue-50 dark:bg-blue-500/20 text-blue-500 hover:bg-blue-100"
                        }
    `}
                    >
                      {feature.status === "accepted" ? "Accepted" : "Accept"}
                    </button>

                    <button
                      onClick={() => updateFeatureStatus(feature.id, "rejected")}
                      disabled={feature.status === "rejected"}
                      className={`px-3 py-1 rounded-lg text-sm transition-all
      ${feature.status === "rejected"
                          ? "bg-red-800 text-white  cursor-not-allowed"
                          : "bg-red-50 dark:bg-red-600/20 text-red-400 hover:bg-red-100"
                        }
    `}
                    >
                      {feature.status === "rejected" ? "Rejected" : "Reject"}
                    </button>
                  </div>


                  <div className="flex-1 flex justify-end items-end gap-2">
                    <button
                      onClick={() => deleteFeature(feature.id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Feature Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Request New Feature</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Feature title"
                value={newFeature.title}
                onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <select
                value={newFeature.projectId}
                onChange={(e) => setNewFeature({ ...newFeature, projectId: e.target.value })}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Feature description"
                value={newFeature.description}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                className="w-full p-3 border rounded-lg h-24 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={submitFeature}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}