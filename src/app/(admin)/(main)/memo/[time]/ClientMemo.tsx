"use client";

import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Editor from 'react-simple-wysiwyg';

type Props = {
    time: number;
    meetingId: string;
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
        localStorage.removeItem("memo");
    };

    useEffect(() => {
        fetchmeet();
    }, [meetingId]);

    useEffect(() => {
        if (!meeting) return;

        setHtml(`
    Reason: ${meeting.reason}
    Status: ${meeting.status}
    Duration: ${meeting.duration} min
   Date: ${new Date(meeting.meetDate).toLocaleDateString()}
  `);
    }, [meeting]);


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
                <div className="flex gap-4 items-center">
                    <button onClick={loadMemoFromLocal} className="mt-4 px-4 py-2 bg-zinc-500 text-white rounded hover:bg-zinc-600 hover:shadow-md">show</button>
                    <button onClick={clearMemoFromLocal} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 hover:shadow-md">clear</button>
                </div>
            </div>

            <p className="mt-2 text-gray-600">
                <span>
                    <p className="mt-2 text-gray-600">
                        <span className="text-sm font-semibold text-green-600">
                            Meeting running • {minutes}:{seconds.toString().padStart(2, "0")}
                        </span>
                    </p>
                </span>

                <span>
                    <Editor value={html} onChange={onChange} className="dark:text-white" />
                </span>
            </p>

            <div className="flex gap-5 items-center">
                <button onClick={submitMemo} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:shadow-md">
                    Finish
                </button>

                <button onClick={() => saveMemoToLocal(html)} className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 hover:shadow-md">
                    Save
                </button>
            </div>

        </div>
    );
}
