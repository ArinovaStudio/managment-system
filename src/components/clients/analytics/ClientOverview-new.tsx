'use client';

import React from 'react';
import { Calendar, User, Clock } from 'lucide-react';

const ClientOverview = ({ data }: { data: any }) => {
  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg text-red-600 dark:text-red-400">Error loading overview data</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Section - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Project Name Card - Blue */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-1">{data.project?.name || 'Glow Nest'}</h3>
                <p className="text-blue-100 text-sm opacity-90">Project Name</p>
              </div>

              {/* Project Type Card - Yellow */}
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-1">{data.project?.type || 'Custom Management'}</h3>
                <p className="text-yellow-100 text-sm opacity-90">Project Type</p>
              </div>

              {/* Budget Card - Purple */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-1">{data.project?.budget || '30,000 /-'}</h3>
                <p className="text-purple-100 text-sm opacity-90">Project Budget</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {data.project?.description || 'Lorem ipsum dolor sit amet consectetur. Convallis amet hendrerit vel imperdiet mauris et sit. Donec et dolor in commodo. Interdum urna luctus pharetra porta euismod placerat. Ac eget lorem lorem tellus turpis porttitor duis. Ultrices tincidunt eget nec duis nunc. Pulvinar nec tortor maecenas semper enim. Sed ut molestie ut suspendisse cursus vitae tellus at in porttitor. Id euismod'}
              </p>
            </div>

            {/* Bottom Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Start Date */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-md flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Start Date</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {data.timeline?.startDate || '20 Jan, 2026'}
                </p>
              </div>

              {/* Deadline */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-md flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Deadline</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {data.timeline?.deadline || '20 Feb, 2026'}
                </p>
              </div>

              {/* Project Manager */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Project Manager</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {data.team?.projectManager || 'Sayam Khajuria'}
                </p>
              </div>

              {/* Total Duration */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Total Duration</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {data.timeline?.totalDuration || '30'} {data.timeline?.durationUnit || 'Days'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Progress Chart */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col items-center justify-center">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-6">overall progress</h3>
              
              {/* Donut Chart */}
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e5e7eb"
                    className="dark:stroke-gray-600"
                    strokeWidth="16"
                  />
                  
                  {/* Progress segments */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="16"
                    strokeDasharray={`${(40 / 100) * 502} 502`}
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="16"
                    strokeDasharray={`${(30 / 100) * 502} 502`}
                    strokeDashoffset={`-${(40 / 100) * 502}`}
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="16"
                    strokeDasharray={`${(20 / 100) * 502} 502`}
                    strokeDashoffset={`-${(70 / 100) * 502}`}
                  />
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {data.progress?.overall || '90'}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOverview;