"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Wrapper from "@/layout/Wrapper";
import toast from "react-hot-toast";
import { LucidePill, LucideSiren, LucideSprout, LucideIcon, LucideLeaf } from "lucide-react";

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  department?: string;
  status: "Pending" | "Approved" | "Rejected";
  empName?: string;
  empId?: string;
}

export default function LeaveRequestModule() {
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<LeaveRequest | null>(null);
  const [stats, setStats] = useState([])
  const [user, setUser] = useState<any>(null);

  async function fetchRequests(empId: string, id: string) {
    try {
      const response = await fetch(`/api/leaves?empId=${empId}&id=${id}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setRequests(data.leaveRequests)
        const allowedKeys = ["sick", "total", "remaining", "emergency"];
        const statsData = data.leaveStats[0]

        const stats = Object.entries(statsData)
  .filter(([key]) => allowedKeys.includes(key))
  .map(([key, value]) => ({
    key,
    value
  }));
  console.log(stats);
  
  setStats(stats)
      }
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
    }
    return [];
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/user`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRequests(user.employeeId, user.id)
    }
  }, [user]);

  async function handleAddRequest(newReq: Omit<LeaveRequest, 'id'>) {
    try {
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newReq)
      });
      if (response.ok) {
        const data = await response.json();
        setRequests((prev) => [data, ...prev]);
      }
    } catch (error) {
      console.error('Failed to create leave request:', error);
    }
  }

  const openCardDetails = (req: LeaveRequest) => {
    setSelectedCard(req);
  };

  const renderCard = (req: LeaveRequest) => {
    const totalDays = Math.ceil((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return (
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
          <p className="text-xs font-medium text-gray-500 dark:text-gray-300">
            {new Date(req.startDate).toDateString()} → {new Date(req.endDate).toDateString()} • {totalDays} Days
          </p>
          <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 my-1">
            {req.leaveType}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {req.reason}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-4 py-1.5 mb-1 rounded-full ${
            req.status === "Approved"
              ? "bg-green-100 text-green-500 dark:bg-green-700/20"
              : req.status === "Rejected"
              ? "bg-red-100 text-red-400 dark:bg-red-600/20"
              : "bg-yellow-100 text-yellow-500 dark:bg-yellow-700/20"
          }`}
        >
          {req.status}
        </span>
      </div>
    </motion.div>
    )
  };

  const StatsCard = ({Type, Number}: {Type: string, Number: number}) => {
    const [Icon, setIcon] = useState<{color: string, Icon: LucideIcon}>({
      color: '',
      Icon: LucideSprout
    })
    console.log(Type);
    
    const getColorAndIcon = () => {
      if (Type === "total") {
        return {
          color: 'bg-purple-400/20 text-purple-400',
          Icon: LucideLeaf
        }
      }
            if (Type === "sick") {
        return {
          color: 'bg-blue-400/20 text-blue-400',
          Icon: LucidePill
        }
      }

            if (Type === "emergency") {
        return {
          color: 'bg-red-400/20 text-red-400',
          Icon: LucideSiren
        }
      }
            if (Type === "remaining") {
        return {
          color: 'bg-green-400/20 text-green-400',
          Icon: LucideSprout
        }
      }
      else {
                return {
          color: 'bg-purple-400/20 text-purple-400',
          Icon: LucideLeaf
        }
      }
    }

  useEffect(() => {
    const det = getColorAndIcon()
    setIcon({
      color: det.color,
      Icon: det.Icon
    })
  }, [Type])



    return (
        <div className="w-full flex justify-center items-start flex-col gap-0 relative h-44 rounded-3xl dark:bg-gray-800 bg-gray-100 px-6 py-3">
          <div className={`absolute right-4 top-3 w-12 h-12 rounded-full ${Icon?.color} grid place-items-center`}>
            <Icon.Icon size={22} />
          </div>
          <h1 className="text-7xl font-bold">{Number}</h1>
          <p className="text-xl font-normal text-zinc-400">{Type.charAt(0).toUpperCase() + Type.slice(1)} Leaves</p>
        </div>
    )
  }

  return (
    <>
      <h1 className="text-3xl font-semibold">Leave Requests</h1>
     {/* Top section - Have you ever think why pus*y release milk while being high? */}
        {stats.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 px-0">
        {
          stats.map((items, index) => (
            <StatsCard
              key={index}
              Number={items.value}
              Type={items.key}
            />
          ))
        }

        </div>
        ) : (
          <p className="text-center text-gray-500">Loading Data</p>
        )}
    <div className="flex justify-between items-center">
      <h1 className="text-4xl py-3 font-semibold">History</h1>
      <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-base font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
          >
            Apply for Leave +
          </button>
    </div>

  <div className="grid gap-4 mt-4">
{user ? (
    (() => {
      // const userLeaves = requests.filter((r) => r.empId === user.employeeId);

      return requests.length > 0 ?  (
         requests.map((r) => renderCard(r))
      ) : (
        <p className="text-gray-500 text-sm">No leave requests found.</p>
      );
    })()
  ) : null}

</div>

      <AddLeaveForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddRequest}
        user={user}
      />


  <CardDetailsModal
        selected={selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </>
  );
}

function AddLeaveForm({
  isOpen,
  onClose,
  onSubmit,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (req: any) => void;
  user: any;
}) {
  const [leaveType, setLeaveType] = useState("");
  const [customLeaveType, setCustomLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // TODAY DATE (safe version)
  const today = new Date().toLocaleDateString("en-CA");

  // Hidden auto-filled values
  const employeeName = user?.name;
  const employeeId = user?.employeeId;
  const departmentValue = user?.department || "Not specified";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeName || !employeeId) {
      toast.error("User data not loaded. Please wait and try again.");
      return;
    }

    const finalLeaveType =
      leaveType === "Other" ? customLeaveType : leaveType;

    const newReq = {
      empName: employeeName,
      empId: employeeId,
      leaveType: finalLeaveType,
      startDate,
      endDate,
      reason,
      department: departmentValue,
    };

    onSubmit(newReq);
    onClose();

    // Reset fields
    setLeaveType("");
    setCustomLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-100"
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

              {/* LEAVE TYPE */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Leave Type *
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-900/40 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select leave type</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Half Day Leave">Half Day Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Other">Other (Specify)</option>
                </select>
              </div>

              {/* CUSTOM LEAVE TYPE FIELD */}
              {leaveType === "Other" && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Enter Custom Leave Type *
                  </label>
                  <input
                    type="text"
                    value={customLeaveType}
                    onChange={(e) => setCustomLeaveType(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Example: Half Day, Emergency Leave"
                  />
                </div>
              )}

              {/* START & END DATE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-white mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    min={today}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-white mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    min={startDate || today}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              {/* REASON */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white mb-1">
                  Reason *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Explain your reason for leave"
                />
              </div>

              {/* FOOTER BUTTONS */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition"
                >
                  Cancel
                </button>

                <motion.button
                  disabled={!reason || !endDate || !startDate || !leaveType}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-5 py-2.5 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
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
  const totalDays = Math.ceil((new Date(selected.endDate).getTime() - new Date(selected.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
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
          <div className="grid">
            <div className="w-full py-3 bg-neutral-800 px-4 rounded-xl text-neutral-400">{selected.leaveType}</div>
            <div className="grid grid-cols-2 gap-3 py-3">
              <div className="w-full py-2.5 bg-neutral-800 px-4 rounded-xl text-neutral-400 text-base">{new Date(selected.startDate).toDateString()}</div>
              <div className="w-full py-2.5 bg-neutral-800 px-4 rounded-xl text-neutral-400 text-base">{new Date(selected.endDate).toDateString()}</div>
              <div className="w-full py-2.5 bg-neutral-800 px-4 rounded-xl text-neutral-400 text-base">{totalDays} Days</div>
              <div className={`w-full py-2.5 px-4 rounded-xl text-base
                ${
            selected.status === "Approved"
              ? "bg-green-100 text-green-500 dark:bg-green-700/20"
              : selected.status === "Rejected"
              ? "bg-red-100 text-red-400 dark:bg-red-600/20"
              : "bg-yellow-100 text-yellow-500 dark:bg-yellow-700/20"
          }
                `}>{selected.status}</div>
            </div>
              <div className="w-full py-2.5 bg-neutral-800 px-4 rounded-xl text-neutral-400 text-base">{selected.reason}</div>
          </div>
          <div className="flex justify-end mt-5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-red-400 text-white rounded-md hover:bg-red-500 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
