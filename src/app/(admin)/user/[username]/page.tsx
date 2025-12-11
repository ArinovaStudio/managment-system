"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Users, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Priority Color Helper
function getPriorityColor(priority: string) {
  switch (priority?.toUpperCase()) {
    case "HIGH":
      return "text-red-500 bg-red-500/20";
    case "MEDIUM":
      return "text-yellow-500 bg-yellow-500/20";
    case "LOW":
      return "text-green-500 bg-green-500/20";
    default:
      return "text-gray-500 bg-gray-500/20";
  }
}

export default function UserProfilePage() {
  const { username } = useParams();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    if (username) {
      loadUser();
      loadPerformanceData();
    }
  }, [username]);

  async function loadUser() {
    try {
      const res = await fetch(`/api/user/${username}`);
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error loading user:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadPerformanceData() {
    try {
      const res = await fetch(`/api/performace?employeeId=${username}`);
      const data = await res.json();
      setPerformanceData(data.ratings || []);
    } catch (err) {
      console.error("Error loading performance data:", err);
    }
  }

  if (loading) return <p className="p-6 text-gray-500">Loading user...</p>;
  if (!user) return <p className="p-6 text-red-500">User not found.</p>;

  const projects = user.projectMembers || [];

  return (
    <div className="p-6">

      {/* PROFILE HEADER */}
      <div className="flex items-center gap-6 mb-8">
        <Image
          src={user.image ?? "/default-avatar.png"}
          alt={user.name}
          width={96}
          height={96}
          className="rounded-full h-30 w-30 object-cover"
        />

        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-400">
            Department: {user.department || "N/A"}
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-2 px-1 ${activeTab === 'projects' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          <div className="flex items-center gap-2">
            <Users size={16} />
            Projects
          </div>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-2 px-1 ${activeTab === 'analytics' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={16} />
            Performance Analytics
          </div>
        </button>
      </div>

      {/* CONTENT */}
      {activeTab === 'projects' ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Assigned Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">No assigned projects</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {projects.map((pm: any) => {
            const project = pm.project;
            const info = project?.projectInfo;
            const members = project?.members || [];

            return (
              <Link
                key={project.id}
                href={`/user/${user.name}/${project.id}`}
                className="block"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 hover:shadow-lg transition-all">

                  {/* Header */}
                  <div className="flex justify-between mb-3">
                    <h3 className="text-lg font-semibold">
                      {project.name}
                    </h3>

                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-gray-400 mb-4">
                    {project.summary || "No summary available"}
                  </p>

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      {members.length} members
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div className="mb-3">
                    <div className="text-xs mb-1">{project.progress ?? 0}%</div>
                    <div className="bg-gray-200 h-1.5 rounded-full">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${project.progress ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* MEMBERS LIST PREVIEW (FIXED FEATURE 🔥) */}
                  {members.length > 0 && (
                    <div className="flex -space-x-2 mt-3">
                      {members.slice(0, 5).map((member: any) => (
                        <Image
                          key={member.user.id}
                          src={member.user.image || "/default-avatar.png"}
                          alt={member.user.name}
                          width={28}
                          height={28}
                          className="rounded-full h-8 w-8 border object-cover"
                        />
                      ))}
                      {members.length > 5 && (
                        <span className="text-xs text-gray-400 ml-3">
                          +{members.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* EXTRA INFO */}
                  {info && (
                    <div className="text-xs text-gray-400 mt-3 space-y-1">
                      <p><strong>Budget:</strong> {info.budget || "—"}</p>
                      <p><strong>Type:</strong> {info.projectType || "—"}</p>
                      <p><strong>Supervisor:</strong> {info.supervisorAdmin || "—"}</p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Performance Analytics</h2>
          {performanceData.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No performance data available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart - Performance Over Time */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
                <Chart
                  options={{
                    chart: { type: 'line', toolbar: { show: false } },
                    xaxis: {
                      categories: performanceData.map((_, i) => `Rating ${i + 1}`),
                      labels: { style: { colors: '#6B7280' } }
                    },
                    yaxis: {
                      min: 0,
                      max: 10,
                      labels: { style: { colors: '#6B7280' } }
                    },
                    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
                    stroke: { curve: 'smooth', width: 2 },
                    grid: { borderColor: '#E5E7EB' },
                    legend: { position: 'bottom' }
                  }}
                  series={[
                    { name: 'New Learnings', data: performanceData.map(d => d.newLearnings) },
                    { name: 'Speed', data: performanceData.map(d => d.speed) },
                    { name: 'Work Quality', data: performanceData.map(d => d.workQuality) },
                    { name: 'Attendance', data: performanceData.map(d => d.leaves) },
                    { name: 'Communication', data: performanceData.map(d => d.communication) },
                    { name: 'Feedback Reception', data: performanceData.map(d => d.feedback) }
                  ]}
                  type="line"
                  height={350}
                />
              </div>

              {/* Radial Chart - Latest Performance */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Latest Performance Scores</h3>
                {performanceData.length > 0 && (
                  <Chart
                    options={{
                      chart: { type: 'radialBar' },
                      plotOptions: {
                        radialBar: {
                          dataLabels: {
                            name: { fontSize: '12px' },
                            value: { fontSize: '14px', formatter: (val: number) => `${val}%` }
                          }
                        }
                      },
                      labels: ['New Learnings', 'Speed', 'Work Quality', 'Attendance', 'Communication', 'Feedback'],
                      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
                    }}
                    series={[
                      (performanceData[0]?.newLearnings || 0) * 10,
                      (performanceData[0]?.speed || 0) * 10,
                      (performanceData[0]?.workQuality || 0) * 10,
                      (performanceData[0]?.leaves || 0) * 10,
                      (performanceData[0]?.communication || 0) * 10,
                      (performanceData[0]?.feedback || 0) * 10
                    ]}
                    type="radialBar"
                    height={350}
                  />
                )}
              </div>

              {/* Performance Summary Cards */}
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {performanceData.length > 0 && [
                  { key: 'newLearnings', label: 'New Learnings', color: 'bg-blue-500' },
                  { key: 'speed', label: 'Speed', color: 'bg-green-500' },
                  { key: 'workQuality', label: 'Work Quality', color: 'bg-yellow-500' },
                  { key: 'leaves', label: 'Attendance', color: 'bg-red-500' },
                  { key: 'communication', label: 'Communication', color: 'bg-purple-500' },
                  { key: 'feedback', label: 'Feedback', color: 'bg-cyan-500' }
                ].map(metric => (
                  <div key={metric.key} className="bg-white dark:bg-gray-800 rounded-lg border p-4 text-center">
                    <div className={`w-12 h-12 ${metric.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <span className="text-white font-bold">
                        {performanceData[0]?.[metric.key] || 0}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{metric.label}</p>
                    <p className="text-xs text-gray-500">Latest Score</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
