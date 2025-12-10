"use client";

import {
  FileText,
  Calendar,
  User,
  FolderKanban,
  BarChart,
  Clock,
  ClipboardList,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const ProgressGauge = ({ progress = 0 }: { progress?: number }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          strokeWidth="8"
          className="text-gray-200 dark:text-gray-700"
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          strokeWidth="8"
          className="text-blue-600 transition-all duration-500"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">
          {progress}%
        </span>
      </div>
    </div>
  );
};


export default function ClientDashboard({ data }) {
  const { projectId } = useParams();
  const [dashboard, setDashboard] = useState(data);
  const [userRole, setUserRole] = useState(null);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [newUpdate, setNewUpdate] = useState("");

  useEffect(() => {
    // Get user role from API
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUserRole(data.user.role);
        }
      })
      .catch(err => console.error("Failed to get user:", err));
  }, []);

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;

    try {
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();

      const res = await fetch("/api/latest-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newUpdate,
          projectId,
          createdBy: userData.user?.name || "Admin"
        })
      });

      if (res.ok) {
        const result = await res.json();
        setDashboard(prev => ({
          ...prev,
          latestUpdates: [result.update, ...prev.latestUpdates].slice(0, 3)
        }));
        setNewUpdate("");
        setShowAddUpdate(false);
      }
    } catch (error) {
      console.error("Failed to add update:", error);
    }
  };
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
          <ProgressGauge progress={dashboard.projectProgress} />

          <p className="text-gray-700 dark:text-gray-300">
            Your project is making steady progress! Keep checking for updates.
          </p>
        </div>
      </section>


      {/* Latest Updates + Work Done */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Latest Updates */}
        <CardBox title="Latest Updates">
          {userRole === "ADMIN" && (
            <div className="mb-4">
              {!showAddUpdate ? (
                <button
                  onClick={() => setShowAddUpdate(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Update
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    placeholder="Enter update title..."
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddUpdate}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setShowAddUpdate(false); setNewUpdate(""); }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <ul className="space-y-4">
            {dashboard.latestUpdates.slice(0, 3).map((update) => (
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
