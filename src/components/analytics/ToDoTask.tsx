import React, { useState, useEffect } from 'react';

const ToDoTask = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [showInput, setShowInput] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/todotask', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const createTask = async () => {
    if (!newTask.trim()) return;
    
    try {
      const response = await fetch('/api/todotask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newTask })
      });
      
      if (response.ok) {
        setNewTask('');
        setShowInput(false);
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/todotask', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ taskId })
      });
      
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          To Do Tasks ({tasks.length})
        </h3>
        <button
          onClick={() => setShowInput(!showInput)}
          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
        >
          + Add Task
        </button>
      </div>

      {showInput && (
        <div className="mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter task title..."
            className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && createTask()}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={createTask}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Add
            </button>
            <button
              onClick={() => { setShowInput(false); setNewTask(''); }}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: showInput ? '120px' : '180px' }}>
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No tasks available</p>
        ) : (
          tasks.slice(0, 4).map((task: any) => (
            <div key={task.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="rounded cursor-pointer"
                onChange={() => completeTask(task.id)}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
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
