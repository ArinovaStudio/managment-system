"use client";

const ProjectStats = ({ analyticsData }: { analyticsData?: any }) => {
  const projects = analyticsData?.stats?.projects || 0;
  const pendingTasks = analyticsData?.stats?.pendingTasks || 0;

  return (
    <div className="grid grid-cols-2 gap-4">

      {/* Completed Projects */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          {projects}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Completed Projects
        </p>
      </div>

      {/* Pending Tasks */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          {pendingTasks}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Pending Tasks
        </p>
      </div>

    </div>
  );
};

export default ProjectStats;
