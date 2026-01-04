"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";

export default function LeaveRequestsPage() {
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openCard, setOpenCard] = useState<string | null>(null);

    async function updateLeaveStatus(id: string, newStatus: string) {
        try {
            const res = await fetch(`/api/leaves/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) return console.error("Failed to update status");

            const updated = await res.json();

            setLeaveRequests((prev) =>
                prev.map((req) => (req.id === id ? { ...req, status: updated.status } : req))
            );
        } catch (err) {
            console.error("Error updating leave status:", err);
        }
    }

    useEffect(() => {
        async function loadRequests() {
            try {
                const res = await fetch("/api/leaves", { method: "GET" });
                const data = await res.json();
                setLeaveRequests(Array.isArray(data) ? data : data?.leaveRequests || data?.data || []);
            } catch (err) {
                console.error("Error fetching leave requests:", err);
            } finally {
                setLoading(false);
            }
        }
        loadRequests();
    }, []);

    return (
        <div className="p-6">

            {/* HEADER */}
            <h1 className="text-2xl font-bold">Leave Management</h1>

            <p className="text-sm text-gray-400 mb-6">
                {(() => {
                    const date = new Date();
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}, ${date.getFullYear()}`;
                })()}
            </p>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Requests", value: leaveRequests.length, color: "#c282ce" },
                    { label: "Pending", value: leaveRequests.filter(r => r.status === "Pending").length, color: "#ffc93c" },
                    { label: "Approved", value: leaveRequests.filter(r => r.status === "Approved").length, color: "#43b77d" },
                    { label: "Rejected", value: leaveRequests.filter(r => r.status === "Rejected").length, color: "#ff6459" },
                ].map((stat, i) => (
                    <div key={i} className="p-4 shadow rounded-lg flex items-center gap-5">
                        <div className="w-1.5 h-22 rounded-full" style={{ background: stat.color }} />
                        <div>
                            <p className="text-gray-500 text-xl">{stat.label}</p>
                            <h2 className="text-2xl font-bold" style={{ color: stat.color }}>
                                {stat.value}
                            </h2>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <p className="text-gray-500">Loading leave requests...</p>
            ) : (
                <div>
                    {/* HEADER */}
                    <div className="flex items-center mb-5">
                        <h1 className="text-2xl">Leave Approval</h1>

                        <span className="ml-2 mt-1 bg-[#ff9768] text-white rounded-full w-5 h-5 flex items-center justify-center">
                            {leaveRequests.filter(req => req.status === "Pending").length}
                        </span>

                        <span className="ml-2 mt-1 text-[#ff9768] opacity-75 text-sm">Pending</span>
                    </div>

                    {/* CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 items-start">
                        {leaveRequests.map((req) => {
                            const totalDays =
                                Math.ceil(
                                    (new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                ) + 1;

                            const isOpen = openCard === req.id;

                            return (
                                <div
                                    key={req.id}
                                    className="p-4 border rounded shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 self-start transition-all duration-200"
                                >
                                    {/* TOP SECTION */}
                                    <div className="flex gap-5">
                                        {
                                            req.user?.image ? (
                                                                                        <Image
                                            src={req.user?.image}
                                            alt={req.empName}
                                            width={50}
                                            height={50}
                                            unoptimized
                                            className="w-12 h-12 rounded-full object-cover"
                                        />

                                            ) : (
                                            <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-500 grid place-items-center">{req.empName.charAt(0)}</div>
                                        
                                            )
                                        }
                                        <div className="flex flex-col w-full">
                                            <div className="flex justify-between w-full">
                                                <h2 className="font-bold text-lg">{req.empName}</h2>

                                                <p className="text-sm">{req.department}</p>

                                                <span className="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-100/20 text-[#0f8fe4]">
                                                    {totalDays} Days
                                                </span>
                                                <span
                                                    className={`px-3 py-1 text-xs font-semibold rounded-full
    ${req.status === "Pending"
                                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                                                            : req.status === "Approved"
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                                                : req.status === "Rejected"
                                                                    ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                                        }
  `}
                                                >
                                                    {req.status}
                                                </span>

                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {req.user?.employeeId}
                                            </p>
                                        </div>
                                    </div>

                                    {/* DATE + TYPE */}
                                    <div className="flex justify-between items-center mt-3">
                                        <div>
                                            <p className="text-sm font-semibold">{req.leaveType}</p>

                                            <div className="flex items-center gap-1 text-sm">
                                                <span>{new Date(req.startDate).toLocaleDateString("en-GB")}</span>
                                                <span>-</span>
                                                <span>{new Date(req.endDate).toLocaleDateString("en-GB")}</span>
                                            </div>
                                        </div>

                                        <button
                                            className="text-sm text-[#0e78be] flex items-center"
                                            onClick={() => setOpenCard(isOpen ? null : req.id)}
                                        >
                                            Details
                                            <ChevronDown
                                                className={`ml-1 w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                            />
                                        </button>
                                    </div>

                                    {/* EXPANDED SECTION */}
                                    {isOpen && (
                                        <div>
                                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {req.reason}
                                                </p>

                                                {req.status === "Pending" && (
                                                    <div className="flex justify-end gap-4 mt-3">
                                                        <button
                                                            onClick={() => updateLeaveStatus(req.id, "Approved")}
                                                            className="text-sm text-[#0e78be] hover:text-blue-500"
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            onClick={() => updateLeaveStatus(req.id, "Rejected")}
                                                            className="text-sm text-[#0e78be] hover:text-blue-500"
                                                        >
                                                            Deny
                                                        </button>
                                                    </div>
                                                )}

                                            </div>

                                            {/* ACTION BUTTONS */}

                                        </div>
                                    )}


                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
