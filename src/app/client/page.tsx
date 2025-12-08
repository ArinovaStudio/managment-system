"use client";

import { clientDemoData } from "./demodata";
import {
  FileText,
  Calendar,
  User,
  FolderKanban,
  BarChart,
  Clock,
  ClipboardList,
} from "lucide-react";

export default function ClientDashboard() {
  const { dashboard } = clientDemoData;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Dashboard Overview
      </h1>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <DashboardCard
          title="Project Progress"
          value={`${dashboard.projectProgress}%`}
          icon={<BarChart className="w-6 h-6" />}
          color="from-blue-500 to-blue-700"
        />

        <DashboardCard
          title="Latest Update"
          value={dashboard.latestUpdates[0].title}
          icon={<Clock className="w-6 h-6" />}
          color="from-indigo-500 to-indigo-700"
        />

        <DashboardCard
          title="Tasks Completed"
          value={dashboard.workDone.length}
          icon={<ClipboardList className="w-6 h-6" />}
          color="from-emerald-500 to-emerald-700"
        />

        <DashboardCard
          title="Documents"
          value={dashboard.documents.length}
          icon={<FileText className="w-6 h-6" />}
          color="from-rose-500 to-rose-700"
        />
      </div>

      {/* Progress Section */}
      <section className="bg-white dark:bg-gray-900 dark:border shadow rounded-xl p-6">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-4">
          Project Progress
        </h2>

        <div className="flex items-center gap-6">
          {/* Circle Progress */}
          <div className="relative w-32 h-32">
            <svg className="w-full h-full">
              <circle
                cx="50%"
                cy="50%"
                r="45"
                strokeWidth="10"
                className="text-gray-200 dark:text-gray-700"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45"
                strokeWidth="10"
                className="text-blue-600 transition-all duration-500"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={
                  2 * Math.PI * 45 - (dashboard.projectProgress / 100) * (2 * Math.PI * 45)
                }
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800 dark:text-gray-100">
              {dashboard.projectProgress}%
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300">
            Your project is making steady progress! Keep checking for updates.
          </p>
        </div>
      </section>

      {/* Latest Updates + Work Done */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Latest Updates */}
        <CardBox title="Latest Updates">
          <ul className="space-y-4">
            {dashboard.latestUpdates.map((update) => (
              <li key={update.id} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                <p className="font-medium text-gray-800 dark:text-gray-100">{update.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{update.date}</p>
              </li>
            ))}
          </ul>
        </CardBox>

        {/* Work Done */}
        <CardBox title="Work Completed">
          <ul className="space-y-4">
            {dashboard.workDone.map((work) => (
              <li key={work.id} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                <p className="font-medium text-gray-800 dark:text-gray-100">{work.task}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{work.completedOn}</p>
              </li>
            ))}
          </ul>
        </CardBox>
      </div>

      {/* Project Information */}
      <CardBox title="Project Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem label="Project Name" value={dashboard.projectInfo.projectName} icon={<FolderKanban />} />
          <InfoItem label="Budget" value={dashboard.projectInfo.budget} icon={<BarChart />} />
          <InfoItem label="Client Name" value={dashboard.projectInfo.clientName} icon={<User />} />
          <InfoItem label="Type" value={dashboard.projectInfo.type} icon={<FileText />} />
          <InfoItem label="Start Date" value={dashboard.projectInfo.startDate} icon={<Calendar />} />
          <InfoItem label="Deadline" value={dashboard.projectInfo.deadline} icon={<Clock />} />
        </div>
      </CardBox>

      {/* Documents */}
      <CardBox title="Project Documents">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dashboard.documents.map((doc) => (
            <div key={doc.id} className="p-4 rounded-lg border dark:border-gray-700">
              <p className="font-medium text-gray-800 dark:text-gray-100">{doc.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{doc.type}</p>
              <button className="mt-2 text-blue-600 dark:text-blue-400 underline text-sm">
                View Document
              </button>
            </div>
          ))}
        </div>
      </CardBox>
    </div>
  );
}


// CARD
const DashboardCard = ({ title, value, icon, color }: any) => {
  return (
    <div
      className={`p-5 rounded-xl shadow bg-gradient-to-br ${color} text-white flex flex-col gap-2`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-80">{title}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

// BOX CONTAINER
const CardBox = ({ title, children }: any) => (
  <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 shadow rounded-xl p-6">
    <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-4">{title}</h2>
    {children}
  </div>
);

// INFO ITEM
const InfoItem = ({ label, value, icon }: any) => (
  <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
    <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  </div>
);
