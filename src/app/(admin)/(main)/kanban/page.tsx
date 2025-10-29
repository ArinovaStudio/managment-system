"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Play, Undo2, Plus } from "lucide-react";
import Wrapper from "@/layout/Wrapper";

// ---------------------- Types ----------------------
interface Task {
  id: string;
  title: string;
  description: string;
  status: "assigned" | "inprogress" | "completed";
}

// ---------------------- Add Task Modal ----------------------
function AddTaskForm({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Task) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      status: "assigned",
    };
    onAdd(newTask);
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-[90%] sm:w-[400px] border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Assign Task to Yourself
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="w-full mt-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the task..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-sm border border-gray-400 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-sm border border-gray-600 dark:border-gray-500 rounded-md bg-gray-800 text-white hover:bg-gray-700 dark:hover:bg-gray-700 transition"
                >
                  Add Task
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------- Main Kanban ----------------------
export default function KanbanBoard() {
  const [assigned, setAssigned] = useState<Task[]>([]);
  const [inProgress, setInProgress] = useState<Task[]>([]);
  const [completed, setCompleted] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ---- Mock API Calls ----
  async function fetchAssigned(): Promise<Task[]> {
    return [
      { id: "1", title: "Code Review", description: "Review frontend PRs", status: "assigned" },
      { id: "2", title: "Fix UI Bug", description: "Resolve navbar flicker", status: "assigned" },
    ];
  }

  async function fetchInProgress(): Promise<Task[]> {
    return [
      { id: "3", title: "Build Analytics Page", description: "Design and build analytics UI", status: "inprogress" },
    ];
  }

  async function fetchCompleted(): Promise<Task[]> {
    return [
      { id: "4", title: "Setup API Layer", description: "Integrated backend with frontend", status: "completed" },
    ];
  }

  useEffect(() => {
    (async () => {
      const a = await fetchAssigned();
      const b = await fetchInProgress();
      const c = await fetchCompleted();
      setAssigned(a);
      setInProgress(b);
      setCompleted(c);
    })();
  }, []);

  // ---- Handlers ----
  const moveToProgress = (task: Task) => {
    setAssigned((prev) => prev.filter((t) => t.id !== task.id));
    setInProgress((prev) => [...prev, { ...task, status: "inprogress" }]);
  };

  const moveToCompleted = (task: Task) => {
    if (task.status === "assigned") setAssigned((prev) => prev.filter((t) => t.id !== task.id));
    if (task.status === "inprogress") setInProgress((prev) => prev.filter((t) => t.id !== task.id));
    setCompleted((prev) => [...prev, { ...task, status: "completed" }]);
  };

  const reopenTask = (task: Task) => {
    setCompleted((prev) => prev.filter((t) => t.id !== task.id));
    setAssigned((prev) => [...prev, { ...task, status: "assigned" }]);
  };

  const addTask = (task: Task) => setAssigned((prev) => [...prev, task]);

  // ---- Animation ----
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const renderTaskCard = (task: Task, type: "assigned" | "inprogress" | "completed") => (
    <motion.div
      key={task.id}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01 }}
      className={`rounded-xl border ${type==="assigned" ? "border-blue-600" : type === "inprogress" ? "border-yellow-500" : "border-green-500"} bg-white dark:bg-white/[0.05] p-4 transition-all`}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-200 mt-1">{task.description}</p>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          {type === "assigned" && (
            <>
              <button
                onClick={() => moveToProgress(task)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md text-yellow-500 border border-yellow-500 hover:bg-gray-100 dark:hover:bg-white/10 transition"
              >
                <Play size={12} /> Progress
              </button>
              <button
                onClick={() => moveToCompleted(task)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
              >
                <Check size={12} /> Complete
              </button>
            </>
          )}
          {type === "inprogress" && (
            <button
              onClick={() => moveToCompleted(task)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
            >
              <Check size={12} /> Mark Done
            </button>
          )}
          {type === "completed" && (
            <button
              onClick={() => reopenTask(task)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 text-blue-500 rounded-md border border-blue-400 dark:hover:bg-white/10 transition"
            >
              <Undo2 size={12} /> Reopen
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <Wrapper>
      <div className="flex flex-col w-full h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Kanban Board</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-white px-3 py-1.5 rounded-full bg-gradient-to-br from-blue-700 to-blue-300 transition"
          >
            <Plus size={16} /> Add Task
          </button>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 h-full gap-6 relative">
          {/* Vertical separator lines */}
          <div className="hidden sm:block absolute top-0 left-1/3 w-px h-full bg-gray-200 dark:bg-gray-600" />
          <div className="hidden sm:block absolute top-0 left-2/3 w-px h-full bg-gray-200 dark:bg-gray-600" />

          {/* Assigned */}
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="flex flex-col pr-4">
            <h3 className="text-sm font-semibold text-blue-500 mb-4 uppercase tracking-wide">
              Assigned
            </h3>
            <div className="space-y-3">{assigned.map((t) => renderTaskCard(t, "assigned"))}</div>
          </motion.div>

          {/* In Progress */}
          <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="flex flex-col px-4">
            <h3 className="text-sm font-semibold text-yellow-500 mb-4 uppercase tracking-wide">
              In Progress
            </h3>
            <div className="space-y-3">{inProgress.map((t) => renderTaskCard(t, "inprogress"))}</div>
          </motion.div>

          {/* Completed */}
          <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="flex flex-col pl-4">
            <h3 className="text-sm font-semibold text-green-500 mb-4 uppercase tracking-wide">
              Completed
            </h3>
            <div className="space-y-3">{completed.map((t) => renderTaskCard(t, "completed"))}</div>
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      <AddTaskForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addTask} />
    </Wrapper>
  );
}
