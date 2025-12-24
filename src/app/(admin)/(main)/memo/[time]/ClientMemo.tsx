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
            console.log(data.meeting);

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
        console.log("i am calledd");
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

                <div className="flex flex-col">
                    <p><span className="text-blue-400">Meeting Reasion:</span> {meeting?.reason}</p>
                    <p><span className="text-blue-400">Meeting Status:</span> {meeting?.status}</p>
                    <p><span className="text-blue-400">Meeting Duration:</span> {meeting?.duration}</p>
                    <p><span className="text-blue-400">Meeting Date:</span> {new Date(meeting?.meetDate).toLocaleDateString()}</p>
                    {meeting?.project ? (
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
                    )}

                </div>

                <span>
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
