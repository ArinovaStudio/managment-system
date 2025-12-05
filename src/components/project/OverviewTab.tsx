"use client";

import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import LatestUpdates from "./LatestUpdates";

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
};

interface OverviewTabProps {
  project: Project;
}

const ProgressGauge = ({ progress = 70 }: { progress?: number }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{progress}</span>
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
        <p className="text-sm text-gray-500">{member.role || 'Frontend Developer'}</p>
      </div>
    </div>
  </div>
);

export default function OverviewTab({ project }: OverviewTabProps) {
  const [milestones, setMilestones] = useState({ ongoing: 0, total: 0 });

  useEffect(() => {
      if (!project?.id) return;  // ⬅️ prevents crash during first render

    const fetchMilestones = async () => {
      try {
        const res = await fetch(`/api/project/milestone?projectId=${project.id}`);
        const data = await res.json();
        if (data.success && data.milestones) {
          const total = data.milestones.length;
          const ongoing = data.milestones.filter((milestone: any) => {
            const dueDate = new Date(milestone.dueDate);
            const now = new Date();
            return dueDate >= now; // Not overdue = ongoing
          }).length;
          
          setMilestones({ ongoing, total });
        }
      } catch (err) {
        console.error("Failed to fetch milestones:", err);
      }
    };

    if (project?.id) {
      fetchMilestones();
    }
  }, [project]);

  if (!project) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Top Row - Progress and Milestones side by side */}
        <div className="grid grid-cols-2 gap-6">
          {/* Overall Progress */}
          <div className="bg-white border border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded-2xl p-6 flex flex-col items-center justify-center">
            <ProgressGauge progress={project.progress} />
            <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
              Overall Progress
            </h3>
          </div>

          {/* Ongoing Milestones */}
          <div className="bg-gradient-to-br from-white to-purple-600 rounded-2xl p-6 flex flex-col items-center justify-center text-white">
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
          {project.members.slice(0, 3).map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
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
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-500 text-white rounded-full">
                {project.priority} Priority
              </span>
            </div>
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
          <div>
            <LatestUpdates projectId={project.id} />
          </div>
        </div>
      </div>
    </div>
  );
}