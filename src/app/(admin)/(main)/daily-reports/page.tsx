'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

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
            if (data.success) setReports(data.reports);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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
                    {new Date().toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}
                </p>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-sm"
                >
                    <option>All</option>
                    <option>Submitted</option>
                </select>
            </div>

            {/* TOP HORIZONTAL TEAM ROW */}
            <div className="flex gap-4 relative overflow-x-auto no-scrollbar pb-2">
                {reports.map((report) => {
                    const status = getStatusClasses(report.user.workingAs);

                    return (
                        <div
                            key={`${report.id}-horizontal`}
                            className=" min-w-[260px]"
                        >
                            {/* Role Badge - Floating outside at top */}
                            <span className={`relative top-2 left-25 ${status.badge} text-[11px] px-1 py-1 rounded-full z-10 shadow-sm`}>
                                {report.user.workingAs}
                            </span>

                            {/* Card Container */}
                            <div className={`flex bg-white items-center gap-3 rounded-full border-2 ${status.ring} ${status.cardBg} dark:bg-gray-800 shadow-sm px-4 py-3`}>
                                <div
                                    className={`ring-2 ${status.ring} rounded-full w-10 h-10 overflow-hidden flex items-center justify-center flex-shrink-0`}
                                >
                                    <Image
                                        src={report.user.image || '/images/user/user-01.png'}
                                        alt={report.user.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>


                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{report.user.name}</p>
                                    <p className="text-[11px] text-gray-600 dark:text-gray-400">{report.user.workingAs}</p>
                                </div>

                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">{report.clockOut}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* REPORT CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => {
                    const status = getStatusClasses(report.user.workingAs);

                    return (
                        <div
                            key={report.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition"
                        >
                            {/* CARD HEADER */}
                            <div className="flex items-start gap-4 mb-4">
                                <div
                                    className={`ring-2 ${status.ring} rounded-full w-10 h-10 overflow-hidden flex items-center justify-center flex-shrink-0`}
                                >
                                    <Image
                                        src={report.user.image || '/images/user/user-01.png'}
                                        alt={report.user.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>


                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{report.user.name}</h3>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        {report.user.department} • {report.user.workingAs} 
                                    </p>
                                </div>
                            </div>

                            {/* SUMMARY */}
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-6">
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