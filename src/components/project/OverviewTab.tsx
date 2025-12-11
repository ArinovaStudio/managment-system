"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp, User, X } from "lucide-react";

import toast, { Toaster } from "react-hot-toast";


type Member = {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
};

type Project = {
  id: string;
  name: string;
  summary: string;
  priority: "HIGH" | "MEDIUM" | "LOW" | string;
  basicDetails: string | null;
  membersCount: number;
  members: Member[];
  progress?: number;
  ongoingMilestones?: number;
  totalMilestones?: number;
  projectInfo?: {
    budget?: number;
    startDate?: string;
    deadline?: string;
    projectType?: string;
  };
};

interface OverviewTabProps {
  project: Project;
}

const ProgressGauge = ({ progress }: { progress?: number }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - ((progress || 0) / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#8b5cf6"
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{progress || 0}%</span>
      </div>
    </div>
  );
};

const TeamMemberCard = ({ member }: { member: Member }) => (
  <div className="bg-white border border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded-xl p-4">
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
        {member.avatar ? (
          <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <User size={28} className="text-gray-500 dark:text-gray-400" />
        )}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
        <p className="text-sm text-gray-500">{member.role || 'Team Member'}</p>
      </div>
    </div>
  </div>
);

export default function OverviewTab({ project }: OverviewTabProps) {
  const [milestones, setMilestones] = useState({ ongoing: 0, total: 0 });
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newProgress, setNewProgress] = useState(project?.progress || 0);
  const [currentProgress, setCurrentProgress] = useState(project?.progress || 0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!project?.id) return;
    setNewProgress(project.progress || 0);
    setCurrentProgress(project.progress || 0);

    const checkUserRole = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        if (data.user && data.user.role === 'ADMIN') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Failed to check user role:', error);
      }
    };

    const fetchMilestones = async () => {
      try {
        const res = await fetch(`/api/project/milestone?projectId=${project.id}`);
        const data = await res.json();
        if (data.success && data.milestones) {
          const total = data.milestones.length;
          const ongoing = data.milestones.filter((milestone: any) => {
            const dueDate = new Date(milestone.dueDate);
            const now = new Date();
            return dueDate >= now;
          }).length;

          setMilestones({ ongoing, total });
        }
      } catch (err) {
        console.error("Failed to fetch milestones:", err);
      }
    };

    checkUserRole();
    fetchMilestones();
  }, [project]);

  const handleProgressUpdate = async () => {
    if (newProgress < 0 || newProgress > 100) {
      toast.error('Progress must be between 0 and 100');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/project/progress?id=${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress }),
      });

      if (response.ok) {
        toast.success('Progress updated successfully');
        setShowProgressModal(false);
        setCurrentProgress(newProgress);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update progress');
      }
    } catch (error) {
      toast.error('Failed to update progress');
    } finally {
      setUpdating(false);
    }
  };

  if (!project) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Top Row - Progress and Milestones side by side */}
        <div className="grid grid-cols-2 gap-6">
          {/* Overall Progress */}
          <div className="bg-white border border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded-2xl p-6 flex flex-col items-center justify-center">
            <ProgressGauge progress={currentProgress} />
            <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
              Overall Progress
            </h3>
            {isAdmin && (
              <button
                onClick={() => {
                  setNewProgress(project.progress || 0);
                  setShowProgressModal(true);
                }}
                className="right-6 bottom-6 mt-2 px-4 py-1 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 transition-colors"
              >
                <ArrowUp size={16} className="inline-block mr-1" />
              </button>
            )}
          </div>

          {/* Ongoing Milestones */}
          <div className="bg-gradient-to-br from-white to-purple-700 rounded-2xl p-6 flex flex-col items-center justify-center text-white">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                {milestones.ongoing}
                <span className="text-3xl font-normal">/{milestones.total}</span>
              </div>
              <p className="text-white/90 text-sm">Ongoing Milestones</p>
            </div>
          </div>
        </div>

        {/* Team Members - Full width below */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h2>
          {project.members && project.members.length > 0 ? (
            project.members.slice(0, 3).map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No team members assigned</p>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Project Information */}
        <div className="bg-white border border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Project Information
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {project.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {project.summary}
              </p>
            </div>

            <div>
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${project.priority === 'HIGH' ? 'bg-red-500/20 text-red-500' :
                project.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-green-500/20 text-green-500'
                }`}>
                {project.priority} Priority
              </span>
            </div>

            {isAdmin && project.projectInfo?.budget && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Budget
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ${project.projectInfo.budget.toLocaleString()}
                </p>
              </div>
            )}

            {project.projectInfo?.startDate && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Start Date
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(project.projectInfo.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {project.projectInfo?.deadline && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Deadline
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(project.projectInfo.deadline).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {project.basicDetails && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Details
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {project.basicDetails}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Work Done History */}
        <div className="bg-white border border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Work Done History
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Latest updates will appear here</p>
        </div>
      </div>

      {/* Progress Update Modal with Slider */}
      {showProgressModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold dark:text-white">Update Progress</h2>
              <button
                onClick={() => setShowProgressModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium dark:text-white">
                    Progress Percentage
                  </label>
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {newProgress}%
                  </span>
                </div>

                {/* Custom Slider */}
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newProgress}
                    onChange={(e) => setNewProgress(Number(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${newProgress}%, #e5e7eb ${newProgress}%, #e5e7eb 100%)`
                    }}
                  />
                </div>

                {/* Percentage markers */}
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Progress visualization */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${newProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProgressUpdate}
                  disabled={updating}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 font-medium transition-all"
                >
                  {updating ? 'Updating...' : 'Update Progress'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}