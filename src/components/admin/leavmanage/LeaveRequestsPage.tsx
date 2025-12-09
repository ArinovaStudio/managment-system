"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";

export default function LeaveRequestsPage() {
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openCard, setOpenCard] = useState<string | null>(null);
    const [leaveStatus, setLeaveStatus] = useState<string>("");

    async function updateLeaveStatus(id: string, newStatus: string) {
        try {
            const res = await fetch(`/api/leaves/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                console.error("Failed to update status");
                return;
            }

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
            <h1 className="text-2xl font-bold">
                Leave Management
            </h1>
            <p className="text-sm text-gray-400 mb-6">
                {(() => {
                    const date = new Date();
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                    const month = months[date.getMonth()];
                    const day = String(date.getDate()).padStart(2, "0");
                    const year = date.getFullYear();

                    return `${month} ${day}, ${year}`;
                })()}
            </p>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 shadow rounded-lg flex items-center gap-5">
                    <div className="bg-[#c282ce] w-1.5 rounded-full h-22" />
                    <div>
                        <p className="text-gray-500 text-2xl">Total Requests</p>
                        <h2 className="text-2xl text-[#c282ce] font-bold">{leaveRequests.length}</h2>
                    </div>
                </div>

                <div className="p-4 shadow rounded-lg flex items-center gap-5">
                    <div className="bg-[#ffc93c] w-1.5 rounded-full h-22" />
                    <div>
                        <p className="text-gray-500 text-2xl">Pending</p>
                        <h2 className="text-xl font-bold text-[#ffc93c]">
                            {leaveRequests.filter(req => req.status === "Pending").length}
                        </h2>
                    </div>
                </div>

                <div className="p-4 shadow rounded-lg flex items-center gap-5">
                    <div className="bg-[#43b77d] w-1.5 rounded-full h-22" />
                    <div>
                        <p className="text-gray-500 text-2xl">Approved</p>
                        <h2 className="text-xl font-bold text-[#43b77d]">
                            {leaveRequests.filter(req => req.status === "Approved").length}
                        </h2>
                    </div>
                </div>

                <div className="p-4 shadow rounded-lg flex items-center gap-5">
                    <div className="bg-[#ff6459] w-1.5 rounded-full h-22" />
                    <div>
                        <p className="text-gray-500 text-2xl">Rejected</p>
                        <h2 className="text-xl font-bold text-[#ff6459]">
                            {leaveRequests.filter(req => req.status === "Rejected").length}
                        </h2>
                    </div>
                </div>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading leave requests...</p>
            ) : (
                <div>
                    <div className="flex">
                        <h1 className="mb-5 text-2xl">Leave Approval</h1>
                        <span className="dark:text-gray-600 ml-2 mt-2 bg-[#ff9768] rounded-full w-5 h-5 flex items-center justify-center">
                            {leaveRequests.filter(req => req.status === "Pending").length}
                        </span>
                        <span className=" ml-2 mt-2 text-[#ff9768] opacity-75 text-sm">Pending</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {leaveRequests.map((req) => {

                            const totalDays =
                                Math.ceil(
                                    (new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                ) + 1;

                            return (
                                <div
                                    key={req.id}
                                    className="p-4 border rounded shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 min-w-full"
                                >
                                    {/* TOP SECTION */}
                                    <div className="">
                                        <div className="image flex gap-5">
                                            <div className="right w-full flex flex-col">

                                                {/* TOP ROW */}
                                                <div className="flex justify-between items-center w-full">

                                                    <Image
                                                        src={req.user?.image}
                                                        alt={req.empName}
                                                        width={50}
                                                        height={50}
                                                        unoptimized
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />

                                                    {/* LEFT */}
                                                    <div>
                                                        <h2 className="font-bold text-lg">{req.empName}</h2>

                                                    </div>
                                                    <p className="text-sm ">{req.department}</p>
                                                    {/* RIGHT – TOTAL DAYS */}
                                                    <span className="px-3 py-1 text-xs rounded-full font-medium bg-blue-100 dark:bg-blue-100/60  text-blue-700">
                                                        {totalDays} Days
                                                    </span>

                                                </div>

                                                {/* BOTTOM ROW */}
                                                <div className="">{req.user?.employeeId}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            {/* TYPE + EMP ID */}
                                            <div className="mt-3">
                                                <p className="text-sm">
                                                    <strong>{req.leaveType}</strong>
                                                </p>
                                            </div>

                                            {/* DATE RANGE */}
                                            <div className=" flex items-center gap-1">
                                                <p className="text-sm">
                                                    <strong></strong>{" "}
                                                    {new Date(req.startDate).toLocaleDateString("en-GB")}
                                                </p>
                                                <p>-</p>
                                                <p className="text-sm">
                                                    <strong></strong>{" "}
                                                    {new Date(req.endDate).toLocaleDateString("en-GB")}
                                                </p>
                                            </div>
                                        </div>

                                        {/* EXPAND BUTTON */}
                                        <button
                                            className="mt-3 text-sm text-[#033f68] flex items-center bg-[#fcfeff] p-1 rounded-md"
                                            onClick={() =>
                                                setOpenCard(openCard === req.id ? null : req.id)
                                            }
                                        >
                                            Details
                                            <ChevronDown
                                                className={`ml-1 w-4 h-4 transition-transform ${openCard === req.id ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>
                                    </div>





                                    {/* EXPANDED DETAILS */}
                                    <div className="flex flex-col w-full">
                                        {openCard === req.id && (
                                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {req.reason}
                                                </p>

                                                {/* <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                                    <strong>User Email:</strong> {req.user?.email}
                                                </p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                                    <strong>DOB:</strong> {req.user?.dob}
                                                </p> */}



                                            </div>
                                        )}


                                    </div>
                                    <div>
                                        <div className="flex  justify-end gap-4">
                                            <button
                                                onClick={() => updateLeaveStatus(req.id, "Approved")}
                                                className="mt-2 text-sm text-blue-400 hover:text-blue-500 py-1 rounded-xl">
                                                Approve
                                            </button>

                                            <button onClick={() => updateLeaveStatus(req.id, "Rejected")} className="mt-2 text-blue-400 hover:text-blue-500 text-sm py-1 rounded-xl">
                                                Deny
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
