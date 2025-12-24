"use client";

import { Shredder, Trash, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


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
};

type Memo = {
    id: string;
    memo: string;
    message: string;
    totaltime: string;
    createdAt: string;
    meetingRequest?: meetingRequest | null;
};

export default function AllMemosPage() {
    const [memos, setMemos] = useState<Memo[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const fetchMemos = async () => {
        try {
            const res = await fetch("/api/memobook");
            if (!res.ok) throw new Error("Failed");

            const data = await res.json();
            setMemos(data.memos || []);
        } catch (err) {
            toast.error("Failed to load memos");
        } finally {
            setLoading(false);
        }
    };

    const deleteMemo = async (id: string) => {
        try {
            console.log(id);

            setLoading(true);
            const res = await fetch(`/api/memobook?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete memo");
            toast.success("Memo deleted successfully");
            fetchMemos();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete memo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemos();
    }, []);

    if (loading) {
        return <p className="p-6 text-gray-500">Loading memos...</p>;
    }

    if (memos.length === 0) {
        return <p className="p-6 text-gray-500">No memos found</p>;
    }

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">Meetings Memo</h1>

            <div className="grid grid-cols-2 gap-4">
                {memos.map((memo) => (
                    <div
                        key={memo.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/memobook/detailsmemo?memoId=${memo.id}`, "_blank", "noopener,noreferrer");
                        }}
                        className="border rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm cursor-pointer hover:scale-101"
                    >
                        <div >

                            {/* time and project */}
                            <div className="flex justify-between items-center">
                                {/* ✅ Project conditional rendering */}
                                {memo.meetingRequest?.project ? (
                                    <p className="text-gray-600">
                                        {memo.meetingRequest.project.name}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-600 italic">
                                        No project details found
                                    </p>
                                )}
                                <p className="text-[#098500] font-bold">
                                    {memo.totaltime}
                                </p>
                            </div>

                            {/* reasion */}
                            <p className="text-2xl">
                                {memo.meetingRequest?.reason ?? "—"}
                            </p>

                            {/* date and time */}
                            <div className="mt-4 flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    {new Date(memo.meetingRequest.meetDate).toLocaleDateString()}
                                </p>

                                <p className="text-sm text-gray-600">
                                    {memo.meetingRequest.meetTime}
                                </p>
                            </div>

                            {/* message and trash */}
                            <div className="flex items-center gap-2 mt-2">
                                <div className="border px-3 py-2 rounded-lg w-full">
                                    <div
                                        className="mt-3 prose dark:prose-invert max-w-none text-gray-600"
                                        dangerouslySetInnerHTML={{ __html: memo.message }}
                                    />
                                </div>
                                <div
                                    className="bg-red-300 h-22 w-7 flex items-center justify-center rounded-md cursor-pointer
             transition-transform duration-200 ease-out
             hover:scale-105 active:scale-95 hover:shadow-md"
                                >
                                    <button onClick={() => deleteMemo(memo.id)}>
                                        <Shredder className="w-4 h-4 text-red-800" />
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>


                ))}
            </div>
        </div>
    );
}
