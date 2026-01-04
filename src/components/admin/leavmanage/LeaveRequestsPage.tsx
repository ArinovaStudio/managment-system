"use client";

import { ChevronDown, LucideLoader2, LucideShredder } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";


const Cards = ({
    id, image, department, empName, empId, leaveType, startDate, endDate, desc, status, handleDelete, updateLeaveStatus, isLoading
}: {
    id: string
    image: string,
    department: string,
    empName: string,
    empId: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    desc: string,
    status: string,
    handleDelete: (id: string) => void,
    updateLeaveStatus: (id: string, type: string) => void
    isLoading: boolean
}) => {
    const totalDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const [open, SetOpen] = useState<string | null>(null);

    const Isopen = open === id;


    return (
    <div className="w-full h-auto dark:bg-gray-800 bg-gray-100 rounded-4xl p-6 py-4 relative">
                            <div className={`absolute px-4 py-1.5 
                            ${status === "Pending"
                                                            ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                                                            : status === "Approved"
                                                                ? "bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                                                : status === "Rejected"
                                                                    ? "bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                                                    : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                                        }
                            right-6 top-5 rounded-full text-xs
                                `}>{status}</div>
                            <div className="flex justify-start items-center gap-1.5">
                                <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-500 grid place-items-center">
                                {
                                    image ? (
                                        <Image
                                            src={image}
                                            alt={empName}
                                            width={50}
                                            height={50}
                                            className="w-full h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <p className="text-lg">{empName?.charAt(0)}</p>
                                    )
                                }
                                </div>
                                <div className="">
                                    <p className="text-sm dark:text-gray-400 text-gray-500">{department}</p>
                                    <h1 className="text-xl font-semibold -mt-0.5">{empName}</h1>
                                    <p className="text-sm dark:text-gray-200 text-gray-600 dark:font-light font-normal">{empId}</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h1 className="text-lg font-medium tracking-tight">{leaveType} • <span className="text-lg text-blue-400">{totalDays} Days</span></h1>
                                <div className="mt-0 flex justify-between items-center">
                                <p className="text-sm font-medium dark:text-gray-300 text-gray-700">{new Date(startDate).toDateString()} • {new Date(endDate).toDateString()}</p>
                                <button onClick={() => SetOpen(open ? null : id)} className="text-base font-medium dark:text-gray-300 text-gray-700 flex justify-center items-center gap-1">
                                    {Isopen ? "Collapse" : "View"} <ChevronDown size={20} className={`${Isopen ? "rotate-180" : "rotate-0"}`} />
                                    </button>
                                </div>

                            <div className={`dark:bg-gray-900 bg-gray-200 rounded-xl p-4 mt-3 dark:text-zinc-400 text-zinc-700 text-sm ${Isopen ? "py-2.5" : "line-clamp-1 py-1"}`}>
                                {desc}
                            </div>
                            {
                                Isopen && (
                            <div className="flex justify-between items-center mt-4">
                                <button disabled={isLoading} onClick={isLoading ? () => {} :() => handleDelete(id)} className="w-10 h-10 cursor-pointer rounded-4xl bg-red-200 dark:bg-red-400/20 dark:text-red-300 text-red-400 grid place-items-center">
                                    {
                                        isLoading ? <LucideLoader2 className={`animate-spin`} size={18} strokeWidth={1.8} /> : <LucideShredder size={18} strokeWidth={1.8} />
                                    }
                                </button>

                                <div className="flex justify-center items-center gap-2.5">
                                {
                                    status === "Approved" ? <p className="text-sm px-4 py-2 bg-green-200 dark:bg-green-400/10 text-green-600 rounded-lg">Approved</p> : status === "Rejected" ? <p className="text-sm px-4 py-2 bg-red-200 dark:bg-red-400/10 text-red-400 rounded-lg">Rejected</p> : (
                                        <>
                                        {
                                            isLoading ? (
                                                <div className="">
                                                    <LucideLoader2 className={`animate-spin text-purple-300`} size={16} />
                                                </div>
                                            ) : (
                                                <>
                                        <button disabled={isLoading} onClick={isLoading ? () => {} : () => updateLeaveStatus(id, "Rejected")} className="text-base text-red-400">Decline</button>
                                        <button disabled={isLoading} onClick={isLoading ? () => {} : () => updateLeaveStatus(id, "Approved")} className="text-base bg-green-200 dark:bg-green-400/20 dark:text-green-400 text-green-600 rounded-xl px-4 py-2">Approve</button>
                                                </>
                                            )
                                        }
                                        </>
                                    )
                                }
                                </div>
                            </div>
                                )
                            }
                            </div>
                        </div>
                        
    )
}


export default function LeaveRequestsPage() {
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [transition, startTransition] = useState<boolean>(false);

    async function updateLeaveStatus(id: string, newStatus: string) {
        try {
            startTransition(true)
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
        finally {
            startTransition(false)
        }
    }

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


        async function handleDelete(id: string) {
        startTransition(true);
        const res = await fetch(`/api/leaves/${id}`, {method: "DELETE"})
        if (res.status === 200) {
            toast.success("Deleted Successfully!")
            startTransition(false);
            loadRequests()
        }
    }

    useEffect(() => {        
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
                        <h1 className="text-2xl">Requeseted Leaves</h1>

                        <span className="ml-2 mt-1 bg-amber-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {leaveRequests.filter(req => req.status === "Pending").length}
                        </span>
                        <span className="ml-2 mt-1 text-amber-400 opacity-75 text-sm">Pending</span>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                        {
                           leaveRequests.filter(req => req.status === "Pending").length > 0 ? leaveRequests.filter(req => req.status === "Pending").map((items, index) => (
                            <Cards 
                            key={index}
                            id={items.id}
                            department={items.department}
                            desc={items.reason}
                            empName={items.empName}
                            empId={items.user?.employeeId}
                            endDate={items.endDate}
                            startDate={items.startDate}
                            image={items.user?.image}
                            leaveType={items.leaveType}
                            status={items.status}
                            handleDelete={handleDelete}
                            updateLeaveStatus={updateLeaveStatus}
                            isLoading={transition}
                            /> 
                           )) : (
                            <p className="text-base text-gray-400">No Pending Requests</p>
                           )
                        }
                    </div>


                    <div className="flex items-center my-5">
                        <h1 className="text-2xl">Approved Leaves</h1>

                        <span className="ml-2 mt-1 bg-green-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {leaveRequests.filter(req => req.status === "Approved").length}
                        </span>
                        <span className="ml-2 mt-1 text-green-400 opacity-75 text-sm">Approved</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                        {
                           leaveRequests.filter(req => req.status === "Approved").length > 0 ? leaveRequests.filter(req => req.status === "Approved").map((items, index) => (
                            <Cards 
                            key={index}
                            id={items.id}
                            department={items.department}
                            desc={items.reason}
                            empName={items.empName}
                            empId={items.user?.employeeId}
                            endDate={items.endDate}
                            startDate={items.startDate}
                            image={items.user?.image}
                            leaveType={items.leaveType}
                            status={items.status}
                            handleDelete={handleDelete}
                            updateLeaveStatus={updateLeaveStatus}
                            isLoading={transition}
                            /> 
                           )) : (
                            <p className="text-base text-gray-400">No Approved Requests</p>
                           )
                        }
                    </div>
                    


                    <div className="flex items-center my-5">
                        <h1 className="text-2xl">Rejected Leaves</h1>

                        <span className="ml-2 mt-1 bg-red-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {leaveRequests.filter(req => req.status === "Rejected").length}
                        </span>
                        <span className="ml-2 mt-1 text-red-400 opacity-75 text-sm">Rejected</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                        {
                           leaveRequests.filter(req => req.status === "Rejected").length > 0 ? leaveRequests.filter(req => req.status === "Rejected").map((items, index) => (
                            <Cards 
                            key={index}
                            id={items.id}
                            department={items.department}
                            desc={items.reason}
                            empName={items.empName}
                            empId={items.user?.employeeId}
                            endDate={items.endDate}
                            startDate={items.startDate}
                            image={items.user?.image}
                            leaveType={items.leaveType}
                            status={items.status}
                            handleDelete={handleDelete}
                            updateLeaveStatus={updateLeaveStatus}
                            isLoading={transition}
                            /> 
                           )) : (
                            <p className="text-base text-gray-400">No Rejected Requests</p>
                           )
                        }
                    </div>
                </div>
            )}
        </div>
    );
}