"use client";

import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Editor from 'react-simple-wysiwyg';

type Props = {
    time: number;
    meetingId: string;
};

type Project = {
    id: string;
    name: string;
    summary: string;
    priority: string;
    basicDetails: string;
    status: number;
    createdAt: string;
    progress: number;
};

type Meeting = {
    id: string;
    clientId: string;
    reason: string;
    meetDate: string;
    meetTime: string;
    status: string;
    duration: number;
    createdAt: string;
    updatedAt: string;
    project?: Project | null;
    projectId?: string;
};

export default function ClientMemo({ time, meetingId, }: Props) {
    // ✅ convert once from URL
    const [elapsedSeconds, setElapsedSeconds] = useState(() => {
        const sec = Number(time);
        return isNaN(sec) ? 0 : sec;
    });
    const [loading, setLoading] = useState(true);
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [html, setHtml] = useState('<b>Arinova</b>');
    const [isRunning, setIsRunning] = useState(true);


    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    const fetchmeet = async () => {
        const res = await fetch(`/api/memo?meetingId=${meetingId}`);
        if (res.ok) {
            const data = await res.json();
            setMeeting(data.meeting);

        } else {
            toast.error('Failed to fetch meeting');
        }
    };

    const submitMemo = async () => {
        const totalTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        const res = await fetch('/api/memo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meetingId, memo: html, totaltime: totalTime })
        });
        if (res.ok) {
            toast.success('Memo submitted successfully');
            setIsRunning(false);
        } else {
            toast.error('Failed to submit memo');
        }
    };

    function onChange(e) {
        setHtml(e.target.value);
    }

    const saveMemoToLocal = (html: string) => {
        localStorage.setItem("memo", html);

    };

    const loadMemoFromLocal = () => {
        setHtml(localStorage.getItem("memo"));
        return localStorage.getItem("memo");

    };

    const clearMemoFromLocal = () => {
        localStorage.setItem("memo", "Arinova");
        onChange({ target: { value: "Arinova" } });
    };

    useEffect(() => {
        fetchmeet();
    }, [meetingId]);


    // useEffect(() => {
    //     if (!isRunning) return;

    //     const interval = setInterval(() => {
    //         setElapsedSeconds((prev) => prev + 1);
    //     }, 1000);

    //     return () => clearInterval(interval);
    // }, []);


    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning]);

    const priority = meeting?.project?.priority?.toUpperCase();

    const priorityStyles: Record<string, string> = {
        LOW: "bg-green-100 text-green-600 border border-green-400",
        MEDIUM: "bg-orange-100 text-orange-600 border border-orange-400",
        HIGH: "bg-red-100 text-red-600 border border-red-400",
    };

    return (
        <div className="p-6">
            <Toaster position="top-right" />
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Meeting Time</h1>
            </div>

            <p className="mt-2 text-gray-600">
                <span>
                    <p className="mt-2 text-gray-600">
                        <span className="text-sm font-semibold text-green-600">
                            Meeting running • {minutes}:{seconds.toString().padStart(2, "0")}
                        </span>
                    </p>
                </span>

                <div className="flex flex-col mb-3">
                    

                    {/* Row 1 */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* Project Name */}
                        <div className="col-span-6 flex flex-col gap-1">
                            <label className="text-sm text-gray-500">Project Name</label>
                            <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-4 py-3 rounded-xl border">
                                {meeting?.project?.name ?? "No project"}
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
                                {meeting?.duration} min.
                            </div>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* Meeting Date */}
                        <div className="col-span-4 flex flex-col gap-1">
                            <label className="text-sm text-gray-500">Meeting Date</label>
                            <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 px-4 py-3 rounded-xl border">
                                {new Date(meeting?.meetDate).toLocaleDateString()}
                            </div>
                        </div>

                        {/* Meeting Reason */}
                        <div className="col-span-8 flex flex-col gap-1">
                            <label className="text-sm text-gray-500">Meeting Reason</label>
                            <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 px-4 py-3 rounded-xl border">
                                {meeting?.reason ?? "—"}
                            </div>
                        </div>
                    </div>


                    {/* meeting project details */}
                    {/* {meeting?.project ? (
                        <>
                            <p>
                                <span className="text-blue-400">Project Name:</span>{" "}
                                {meeting.project.name}
                            </p>
                            <p>
                                <span className="text-blue-400">Project Priority:</span>{" "}
                                {meeting.project.priority}
                            </p>
                        </>
                    ) : (
                        <p className="text-gray-500 italic">
                            No project details found
                        </p>
                    )} */}

                </div>

                <span className="mt-3">
                    <Editor value={html} onChange={onChange} className="dark:text-white" />
                </span>
            </p>

            <div className="flex gap-5 items-center justify-between">
                <div className="flex gap-3">
                    <button onClick={() => saveMemoToLocal(html)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 hover:shadow-md">Save</button>
                    <button onClick={loadMemoFromLocal} className="mt-4 px-4 py-1 border-zinc-700 border-2 rounded hover:shadow-md">show</button>
                    <button onClick={clearMemoFromLocal} className="mt-4 px-4 py-1 rounded hover:shadow-md">clear</button>
                </div>
                <button onClick={submitMemo} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 hover:shadow-md">
                    Finish
                </button>

            </div>

        </div>
    );
}
