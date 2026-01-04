'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface DailyReport {
    id: string;
    date: string;
    clockIn: string;
    clockOut: string;
    hours: number;
    summary: string;
    user: {
        name: string;
        workingAs: string;
        image?: string;
        department: string;
        breaks: {duration: number, type: string}[]
    };
}

const DailyReports = () => {
    const [reports, setReports] = useState<DailyReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/clock/work-summary');
            const data = await res.json();

            if (data.success) {
                // console.log(data.reports);
                
                setReports(data.reports);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    async function handleDelete() {
        const res = await fetch("/api/clock/work-summary", {method: "DELETE"})
        if (res.status === 200) {
            toast.success("Deleted All")
            fetchReports()
        }
    }
    const getStatusClasses = (role: string) => {
        if (role?.toLowerCase().includes('web')) {
            return {
                badge: 'bg-orange-500 text-white',
                ring: 'ring-orange-400',
                cardBg: 'bg-orange-50'
            };
        }
        if (role?.toLowerCase().includes('design')) {
            return {
                badge: 'bg-green-500 text-white',
                ring: 'ring-green-400',
                cardBg: 'bg-green-50'
            };
        }
        return {
            badge: 'bg-blue-500 text-white',
            ring: 'ring-blue-400',
            cardBg: 'bg-blue-50'
        };
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 dark:bg-gray-900 min-h-screen">

            {/* HEADER */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team List</h1>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-xs font-medium">
                    {new Date().toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}
                </p>
            <div className="flex justify-center items-center gap-2">
                {
                    reports.length > 0 && (
                        <button 
                        onClick={() => handleDelete()}
                        className="px-4 py-2 border border-red-400/80 bg-red-400/20 text-red-400 scale-90 transition-all rounded-lg">Delete All</button>
                        
                    )
                }
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-sm"
                    >
                    <option>All</option>
                    <option>Submitted</option>
                </select>
                    </div>
            </div>


            {/* REPORT CARDS GRID */}
            <div className="flex justify-start items-start gap-4 flex-col ">
                {reports.map((report) => {
                    const status = getStatusClasses(report.user.workingAs);

                    return (
                        <div
                            key={report.id}
                            className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition"
                        >
                            {/* CARD HEADER */}
                            <div className="flex items-start gap-4 mb-4">
                                <div
                                    className={`ring-2 ${status.ring} rounded-full w-10 h-10 overflow-hidden flex items-center justify-center flex-shrink-0`}
                                >
                                    {
                                        report.user?.image ? (
                                            <Image
                                                src={report.user.image}
                                                alt={report.user.name}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-blue-700/20 text-blue-400 text-center grid place-items-center">{report.user.name.charAt(0)}</div>
                                        )
                                    }
                                </div>


                                <div className="flex-1">
                                    <div className="font-normal flex justify-between text-gray-800 dark:text-white">
                                        {report.user.name}
                                        <span className="text-[13px]  text-gray-500 dark:text-gray-400">
                                            {report.clockOut} - {report.clockIn} ~ <span className='text-purple-400 font-semibold'> ({report.hours.toFixed(1)} hours)</span>
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        {report.user.department} • {report.user.workingAs}
                                    </p>
                                </div>
                            </div>

                            {/* SUMMARY */}
                            <p className="text-base text-gray-600 dark:text-gray-300 ">
                                {report.summary}
                            </p>
                        </div>
                    );
                })}
            </div>

            {reports.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No reports found</p>
            )}
        </div>
    );
};

export default DailyReports;