"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Users, Calendar, TrendingUp, BarChart3, Mail, Building2, Award } from "lucide-react";
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

  const {id} = useParams()

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('projects');


  async function loadUser() {
    try {
      const res = await fetch(`/api/user/${id}`);
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
      const res = await fetch(`/api/performace?userId=${id}`);
      const data = await res.json();
      console.log(data);
      
      setPerformanceData(data.ratings || []);
    } catch (err) {
      console.error("Error loading performance data:", err);
    }
  }


  useEffect(() => {
    if (id) {
      loadUser();
      loadPerformanceData();
    }
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  if (!user) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500 text-lg">User not found.</p>
    </div>
  );

  const projects = user.projectMembers || [];

  return (
    <div className="space-y-6">

      {/* PROFILE HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            {
              user?.image ? (
                <Image
                src={user.image ?? "/default-avatar.png"}
                alt={user.name}
                  width={120}
                  height={120}
                  className="rounded-full h-30 w-30 object-cover border-4 border-white shadow-xl"
                  />
              ) : (
                  <div className="rounded-full h-30 w-30 object-cover text-white border-4 border-white shadow-xl grid place-items-center text-4xl bg-white/20">{user.name.charAt(0)}</div>
              )
            }
            <div className="absolute -bottom-0 -right-0 bg-green-500 w-8 h-8 rounded-full border-4 border-white"></div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-100 justify-center md:justify-start">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100 justify-center md:justify-start">
                <Building2 size={16} />
                <span>{user.department || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100 justify-center md:justify-start">
                <Award size={16} />
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">{user.role || "Employee"}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center min-w-[100px]">
              <p className="text-2xl font-bold text-white">{projects.length}</p>
              <p className="text-blue-100 text-sm">Projects</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center min-w-[100px]">
              <p className="text-2xl font-bold text-white">{performanceData.length}</p>
              <p className="text-blue-100 text-sm">Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 inline-flex gap-1">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all ${activeTab === 'projects'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
          <Users size={18} />
          Projects
        </button>
        {user.role === 'EMPLOYEE' ? (
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all ${activeTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            <TrendingUp size={18} />
            Performance Analytics
          </button>
        ) : null}
      </div>

      {/* CONTENT */}
      {activeTab === 'projects' ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assigned Projects</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{projects.length} total</span>
          </div>
          {projects.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No assigned projects</p>
            </div>
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
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all group">

                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {project.name}
                        </h3>

                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </div>

                      {/* Summary */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {project.summary || "No summary available"}
                      </p>

                      {/* Stats */}
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-blue-500" />
                          <span className="font-medium">{members.length}</span> members
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-green-500" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* PROGRESS */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="text-xs font-bold text-blue-600">{project.progress ?? 0}%</span>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress ?? 0}%` }}
                          />
                        </div>
                      </div>

                      {/* MEMBERS LIST PREVIEW */}
                      {members.length > 0 && (
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex -space-x-2">
                            {members.slice(0, 5).map((member: any) => (
                              <Image
                                key={member.user.id}
                                src={member.user.image || "/default-avatar.png"}
                                alt={member.user.name}
                                width={32}
                                height={32}
                                className="rounded-full h-8 w-8 border-2 border-white dark:border-gray-800 object-cover"
                                title={member.user.name}
                              />
                            ))}
                          </div>
                          {members.length > 5 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              +{members.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* EXTRA INFO */}
                      {info && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-2">
                          <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">Budget</p>
                            <p>{info.budget || "—"}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">Type</p>
                            <p>{info.projectType || "—"}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="font-medium text-gray-700 dark:text-gray-300">Supervisor</p>
                            <p>{info.supervisorAdmin || "—"}</p>
                          </div>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Performance Analytics</h2>
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
