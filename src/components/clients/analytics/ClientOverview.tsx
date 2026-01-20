'use client';

import { FileText, DollarSign, Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns/format';


const ClientOverview = ({ data }: { data: any }) => {
  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg text-red-600 dark:text-red-400">Error loading overview data</div>
      </div>
    );
  }

  return (
    <div className="dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">

            {/* Top 3 Cards Row */}
            <div className="grid grid-cols-3 h-35 gap-4">

              {/* Project Name Card */}
              <div className="bg-gradient-to-r content-end from-blue-600/60 to-blue-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 w-10 h-10 bg-gray-100/40 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-1">{data.project.name}</h2>
                  <p className="text-blue-100 text-sm">Project Name</p>
                </div>
              </div>

              {/* Project Type Card */}
              <div className="bg-gradient-to-r content-end from-yellow-400/70 to-yellow-800/80 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 w-10 h-10 bg-gray-100/40 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-1">{data.project.type}</h2>
                  <p className="text-yellow-100 text-sm">Project Type</p>
                </div>
              </div>

              {/* Project Budget Card */}
              <div className="bg-gradient-to-r content-end from-purple-600/50 to-purple-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 w-10 h-10 bg-gray-100/40 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-1">{data.project.budget}</h2>
                  <p className="text-purple-100 text-sm">Project Budget</p>
                </div>
              </div>

            </div>

            {/* Bottom Row - Description and Date Cards */}
            <div className="grid grid-cols-2 gap-4">

              {/* Description Card */}
              <div className="p-6">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {data.project.description}
                </p>
              </div>

              {/* Date & Manager Cards */}
              <div className="flex flex-col gap-4 col-span-1">

                <div className="flex gap-4 w-full h-30">
                  {/* Start Date Card */}
                  <div className="bg-white dark:bg-gray-800 max-h-50 w-full rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-end justify-end gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Start Date</span>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {format(new Date(data.timeline.startDate), "dd MMM.yyyy")}</p>
                    </div>
                  </div>

                  {/* Deadline Card */}
                  <div className="bg-white dark:bg-gray-800 justify-end max-h-40 w-full rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-end items-end gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center items-start">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Deadline</span>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {format(new Date(data.timeline.deadline), "dd MMM.yyyy")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 w-full h-20">
                  {/* Project Manager Card */}
                  <div className="bg-white dark:bg-gray-800 items-end w-80 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-start justify-start gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Project Manager</span>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{data.team.projectManager}</p>
                    </div>
                  </div>

                  {/* Total Duration Card */}
                  <div className="bg-white items-end justify-end  dark:bg-gray-800 w-40 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-start justify-start gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Total Duration</span>
                      <p className="text-xl font-bold text-gray-900 justify-center dark:text-white">{data.timeline.totalDuration} {data.timeline.durationUnit}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Section - Overall Progress */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-800 h-full rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <h3 className="block text-left  font-bold text-gray-900 dark:text-white mb-8">overall progress</h3>

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
                    strokeWidth="35"
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
                        strokeWidth="35"
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