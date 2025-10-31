"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Wrapper from "@/layout/Wrapper";
// import Wrapper from "./Wrapper";

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  department?: string;
  status: "Pending" | "Approved" | "Rejected";
}

export default function LeaveRequestModule() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<LeaveRequest | null>(null);

  async function fetchRequests(): Promise<LeaveRequest[]> {
    return [
      {
        id: "LR-001",
        leaveType: "Annual Leave",
        startDate: "2025-11-10",
        endDate: "2025-11-14",
        totalDays: 5,
        reason: "Family vacation trip to hometown",
        department: "Engineering",
        status: "Approved",
      },
      {
        id: "LR-002",
        leaveType: "Sick Leave",
        startDate: "2025-10-25",
        endDate: "2025-10-26",
        totalDays: 2,
        reason: "High fever and rest advised by doctor",
        department: "IT Support",
        status: "Rejected",
      },
      {
        id: "LR-003",
        leaveType: "Personal Leave",
        startDate: "2025-12-01",
        endDate: "2025-12-03",
        totalDays: 3,
        reason: "Personal commitments",
        department: "HR",
        status: "Pending",
      },
    ];
  }

  useEffect(() => {
    (async () => {
      const data = await fetchRequests();
      setRequests(data);
    })();
  }, []);

  function handleAddRequest(newReq: LeaveRequest) {
    setRequests((prev) => [newReq, ...prev]);
  }

  const openCardDetails = (req: LeaveRequest) => {
    setSelectedCard(req);
  };

  const renderCard = (req: LeaveRequest) => (
    <motion.div
      key={req.id}
      onClick={() => openCardDetails(req)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.05] rounded-lg p-4 shadow-sm transition"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {req.leaveType}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {req.startDate} → {req.endDate} ({req.totalDays} days)
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
            {req.reason}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            req.status === "Approved"
              ? "bg-green-100 text-green-800 dark:bg-green-900/20"
              : req.status === "Rejected"
              ? "bg-red-100 text-red-800 dark:bg-red-900/20"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20"
          }`}
        >
          {req.status}
        </span>
      </div>
    </motion.div>
  );

  return (
    <Wrapper>
      <div className="flex flex-col w-full h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Leave Requests
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm font-medium bg-blue-400 text-white rounded-md hover:bg-blue-500 transition"
          >
            Apply for Leave
          </button>
        </div>

        {/* List */}
        <div className="grid gap-4">
          {requests.map((r) => renderCard(r))}
        </div>
      </div>

      {/* Form Modal */}
      <AddLeaveForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddRequest}
      />

      {/* Card Details Modal */}
      <CardDetailsModal
        selected={selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </Wrapper>
  );
}

/* --------------------- APPLY LEAVE FORM --------------------- */
function AddLeaveForm({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (req: LeaveRequest) => void;
}) {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [department, setDepartment] = useState("");

  const employeeName = "John Doe";
  const employeeId = "EMP-2025";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newReq: LeaveRequest = {
      id: `LR-${Date.now()}`,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      department,
      status: "Pending",
    };
    onSubmit(newReq);
    onClose();
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setDepartment("");
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
            className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-[90%] sm:w-[500px] shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Apply for Leave
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={employeeName}
                    disabled
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    disabled
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Leave Type *
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select leave type</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Maternity / Paternity">
                    Maternity / Paternity
                  </option>
                  <option value="Bereavement Leave">Bereavement Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Reason / Comments *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 dark:text-gray-200"
                  placeholder="Explain your reason for leave"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Your department"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-5 py-2.5 rounded-md bg-blue-400 text-white hover:bg-blue-500 transition"
                >
                  Submit Request
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* --------------------- CARD DETAILS MODAL --------------------- */
function CardDetailsModal({
  selected,
  onClose,
}: {
  selected: LeaveRequest | null;
  onClose: () => void;
}) {
  if (!selected) return null;
  return (
    <AnimatePresence>
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
          className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-[90%] sm:w-[450px] shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Leave Details
          </h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p><strong>Leave Type:</strong> {selected.leaveType}</p>
            <p><strong>Duration:</strong> {selected.startDate} → {selected.endDate}</p>
            <p><strong>Total Days:</strong> {selected.totalDays}</p>
            <p><strong>Department:</strong> {selected.department || "—"}</p>
            <p><strong>Status:</strong> {selected.status}</p>
            <p><strong>Reason:</strong></p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{selected.reason}</p>
          </div>
          <div className="flex justify-end mt-5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-blue-400 text-white rounded-md hover:bg-blue-500 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
