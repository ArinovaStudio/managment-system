"use client";

import { ArrowLeftRight } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import toast from "react-hot-toast";
type Project = {
    name: string;
    summary: string;
    priority: string;
    basicDetails: string;
    createdAt: string;
};

type meetingRequest = {
    id: string;
    reason: string;
    project?: Project | null;
    createdAt: string;
    updatedAt: string;
    meetDate: string;
    meetTime: string;
    duration: string;
};

type Memo = {
    id: string;
    memo: string;
    message: string;
    totaltime: string;
    createdAt: string;
    meetingRequest?: meetingRequest | null;
};

const MemoDetailPage = ({ memoId, }) => {
    const [memo, setMemos] = useState<Memo | null>(null);
    const [loading, setLoading] = useState(true);



    const fetchMemos = async () => {
        try {
            const res = await fetch(`/api/memoperpro?id=${memoId}`);
            if (!res.ok) throw new Error("Failed");

            const data = await res.json();
            setMemos(data.memo);
        } catch (err) {
            toast.error("Failed to load memos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemos();
    }, []);

    if (loading) return <p>Loading…</p>;
    if (!memo) return <p>No memo found</p>;

    const priority = memo.meetingRequest?.project?.priority?.toUpperCase();

    const priorityStyles: Record<string, string> = {
        LOW: "bg-green-100 text-green-600 border border-green-400",
        MEDIUM: "bg-orange-100 text-orange-600 border border-orange-400",
        HIGH: "bg-red-100 text-red-600 border border-red-400",
    };
    return (
        <div>

            <div className="border rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex justify-between">

                    <h1 className='text-2xl mb-8'>
                        ON GOING MEETING
                    </h1>
                    <p className="text-[#098500] text-xl font-bold">{memo.totaltime}</p>
                </div>

                <div className="flex flex-col gap-1">

                    <div className="space-y-6">

                        {/* Row 1 */}
                        <div className="grid grid-cols-12 gap-6">
                            {/* Project Name */}
                            <div className="col-span-6 flex flex-col gap-1">
                                <label className="text-sm text-gray-500">Project Name</label>
                                <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-4 py-3 rounded-xl border">
                                    {memo.meetingRequest?.project?.name ?? "No project"}
                                </div>
                            </div>

                            {/* Project Priority */}
                            <div className="col-span-4 flex flex-col gap-1">
                                <label className="text-sm  text-gray-500">Project Priority</label>
                                {priority && (
                                    <div
                                        className={`px-4 py-3 rounded-xl font-medium
      ${priorityStyles[priority] ?? "bg-gray-100 text-gray-600 border"}
    `}
                                    >
                                        {priority}
                                    </div>
                                )}

                            </div>

                            {/* Meeting Duration */}
                            <div className="col-span-2 flex flex-col gap-1">
                                <label className="text-sm text-gray-500">Meeting Duration</label>
                                <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 px-4 py-3 rounded-xl border text-center font-medium">
                                    {memo.meetingRequest!.duration} min.
                                </div>
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-12 gap-6">
                            {/* Meeting Date */}
                            <div className="col-span-4 flex flex-col gap-1">
                                <label className="text-sm text-gray-500">Meeting Date</label>
                                <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 px-4 py-3 rounded-xl border">
                                    {new Date(memo.meetingRequest!.meetDate).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Meeting Reason */}
                            <div className="col-span-8 flex flex-col gap-1">
                                <label className="text-sm text-gray-500">Meeting Reason</label>
                                <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 px-4 py-3 rounded-xl border">
                                    {memo.meetingRequest?.reason ?? "—"}
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
                <div className='flex justify-between items-center mt-5 text-xl'>
                    <div>Message.</div>
                    <div className='border border-blue-500 px-3 rounded-md text-blue-500'><ArrowLeftRight />Editor</div>
                </div>
                <div className='dark:bg-gray-800 px-3 py-1 mt-3 rounded-md'>
                    <div
                    className="mt-3 prose dark:prose-invert max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: memo.message }}
                />
                
                </div>
            </div>
        </div>
    )
}

export default MemoDetailPage