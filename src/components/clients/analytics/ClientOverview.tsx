'use client';

import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, Calendar, User, Clock } from 'lucide-react';
import Loader from '@/components/common/Loading';

interface ProjectOverview {
  project: {
    name: string;
    type: string;
    budget: number;
    currency: string;
    description: string;
  };
  timeline: {
    startDate: string;
    deadline: string;
    totalDuration: number;
    durationUnit: string;
  };
  team: {
    projectManager: string;
  };
  progress: {
    overall: number;
    phases: Array<{
      name: string;
      percentage: number;
      color: string;
      completed: boolean;
    }>;
  };
}

const ClientOverview = ({ clientId }: { clientId: string }) => {
  const [data, setData] = useState<ProjectOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await fetch(`/api/client/analytics/overview?clientId=${clientId}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error fetching overview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [clientId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency === 'INR' ? '/-' : currency}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-lg text-red-600 dark:text-red-400">Error loading data</div>
      </div>
    );
  }

  return (
    <div className="pb-5 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">

            {/* Top 3 Cards Row */}
            <div className="grid grid-cols-3 gap-4">

              {/* Project Name Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 w-10 h-10 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-1">{data.project.name}</h2>
                  <p className="text-blue-100 text-sm">Project Name</p>
                </div>
              </div>

              {/* Project Type Card */}
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 w-10 h-10 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-1">{data.project.type}</h2>
                  <p className="text-yellow-100 text-sm">Project Type</p>
                </div>
              </div>

              {/* Project Budget Card */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 w-10 h-10 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-1">{formatCurrency(data.project.budget, data.project.currency)}</h2>
                  <p className="text-purple-100 text-sm">Project Budget</p>
                </div>
              </div>

            </div>

            {/* Bottom Row - Description and Date Cards */}
            <div className="grid grid-cols-2 gap-4">

              {/* Description Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {data.project.description}
                </p>
              </div>

              {/* Date & Manager Cards */}
              <div className="flex flex-col gap-4 col-span-1">

                <div className="flex gap-4 w-full h-40">
                  {/* Start Date Card */}
                  <div className="bg-white dark:bg-gray-800 max-h-40 w-full rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Start Date</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatDate(data.timeline.startDate)}</p>
                  </div>

                  {/* Deadline Card */}
                  <div className="bg-white dark:bg-gray-800 justify-end max-h-40 w-full rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Deadline</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatDate(data.timeline.deadline)}</p>
                  </div>
                </div>

                <div className="flex gap-4 w-full">
                  {/* Project Manager Card */}
                  <div className="bg-white dark:bg-gray-800 items-end w-full rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Project Manager</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{data.team.projectManager}</p>
                  </div>

                  {/* Total Duration Card */}
                  <div className="bg-white items-end justify-end  dark:bg-gray-800 w-40 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Total Duration</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{data.timeline.totalDuration} {data.timeline.durationUnit}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Section - Overall Progress */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 h-full rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-8">overall progress</h3>

              {/* Donut Chart */}
              <div className="relative w-64 h-64">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e5e7eb"
                    className="dark:stroke-gray-600"
                    strokeWidth="20"
                  />

                  {/* Dynamic segments */}
                  {data.progress.phases.map((phase, index) => {
                    const circumference = 2 * Math.PI * 80;
                    const strokeDasharray = (phase.percentage / 100) * circumference;
                    const previousPercentages = data.progress.phases
                      .slice(0, index)
                      .reduce((sum, p) => sum + p.percentage, 0);
                    const strokeDashoffset = -(previousPercentages / 100) * circumference;

                    return (
                      <circle
                        key={phase.name}
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke={phase.color}
                        strokeWidth="20"
                        strokeDasharray={`${strokeDasharray} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                      />
                    );
                  })}
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">{data.progress.overall}%</span>
                </div>
              </div>

              {/* Legend */}
              {/* <div className="mt-8 space-y-3 w-full">
                {data.progress.phases.map((phase) => (
                  <div key={phase.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: phase.color }}
                      ></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{phase.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{phase.percentage}%</span>
                  </div>
                ))}
              </div> */}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientOverview;