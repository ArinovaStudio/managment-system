"use client";

import { ArrowLeftRight, CheckCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/common/editor/Editor";

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

const MemoDetailPage = ({ memoId }: { memoId: string }) => {
  const [memo, setMemos] = useState<Memo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // 🔁 this replaces Editor value
  const [editedMessage, setEditedMessage] = useState("");

  const [saving, setSaving] = useState(false);

  const fetchMemos = async () => {
    try {
      const res = await fetch(`/api/memoperpro?id=${memoId}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMemos(data.memo);
    } catch {
      toast.error("Failed to load memos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const content = editedMessage.trim();
      if (!content) {
        toast.error("Message cannot be empty");
        return;
      }

      const res = await fetch(`/api/memoperpro?id=${memoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!res.ok) throw new Error();
      toast.success("Message updated");
      setIsEditing(false);
      fetchMemos();
    } catch {
      toast.error("Failed to save message");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  useEffect(() => {
    if (memo?.message) {
      setEditedMessage(memo.message);
    }
  }, [memo]);

  if (loading) return <p>Loading…</p>;
  if (!memo) return <p>No memo found</p>;

  const priority = memo.meetingRequest?.project?.priority?.toUpperCase();

  const priorityStyles: Record<string, string> = {
    LOW: "bg-green-100 dark:bg-green-600/20 text-green-600 dark:text-green-400 border border-green-400",
    MEDIUM: "bg-orange-100 dark:bg-orange-600/20 text-orange-600 dark:text-orange-400 border border-orange-400",
    HIGH: "bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-400",
  };

  return (
    <div>
      <div className="border rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex justify-between">
          <h1 className="text-2xl mb-8">MEETING DETAILS</h1>
          <p className="text-[#098500] text-xl font-bold">{memo.totaltime}</p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-6 flex flex-col gap-1">
                <label className="text-sm text-gray-500">Project Name</label>
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-4 py-3 rounded-xl border">
                  {memo.meetingRequest?.project?.name ?? "No project"}
                </div>
              </div>

              <div className="col-span-4 flex flex-col gap-1">
                <label className="text-sm text-gray-500">Project Priority</label>
                {priority && (
                  <div className={`px-4 py-3 rounded-xl font-medium ${priorityStyles[priority]}`}>
                    {priority}
                  </div>
                )}
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-sm text-gray-500">Meeting Duration</label>
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-400 px-4 py-3 rounded-xl border text-center font-medium">
                  {memo.meetingRequest!.duration} min.
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-4 flex flex-col gap-1">
                <label className="text-sm text-gray-500">Meeting Date</label>
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-400 px-4 py-3 rounded-xl border">
                  {new Date(memo.meetingRequest!.meetDate).toLocaleDateString()}
                </div>
              </div>

              <div className="col-span-8 flex flex-col gap-1">
                <label className="text-sm text-gray-500">Meeting Reason</label>
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-400 px-4 py-3 rounded-xl border">
                  {memo.meetingRequest?.reason ?? "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div>
          {!isEditing && (
            <div className="flex justify-between items-center mt-5 text-xl">
              <div>Message</div>
              <div
                onClick={() => setIsEditing(true)}
                className="border cursor-pointer bg-blue-400 px-6 py-1 rounded-md text-white flex items-center gap-2"
              >
                <ArrowLeftRight size={18} />
                <div>Editor</div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex justify-between items-center mt-5 text-xl">
              <div>Editor</div>
              <div
                onClick={saving ? () => {} : handleSubmit}
                className={`border cursor-pointer bg-blue-400 px-6 py-1 rounded-md text-white flex items-center gap-2 ${
                  saving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div>{saving ? "Saving..." : "Save"}</div>
                <CheckCheck size={18} />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-3">
          {!isEditing && (
            <div
              className="prose dark:prose-invert max-w-none text-gray-100 px-3 py-1 rounded-md"
              dangerouslySetInnerHTML={{ __html: memo.message }}
            />
          )}

          {isEditing && (
            <RichTextEditor
              isBigEditor={true}
              content={editedMessage}
              onChange={(e) => setEditedMessage(e)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoDetailPage;
