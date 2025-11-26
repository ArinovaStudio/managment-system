const ToDoTask = ({ analyticsData }: { analyticsData?: any }) => {
  const tasks = analyticsData?.tasks || [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] h-48">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        To Do Tasks ({tasks.length})
      </h3>

      <div className="space-y-3 max-h-32 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No tasks available</p>
        ) : (
          tasks.slice(0, 4).map((task: any) => (
            <div key={task.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="rounded"
                defaultChecked={task.completed}
              />
              <span
                className={`text-sm text-gray-600 dark:text-gray-400 ${
                  task.completed ? "line-through" : ""
                }`}
              >
                {task.title}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ToDoTask;
