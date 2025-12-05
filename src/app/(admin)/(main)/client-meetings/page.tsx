"use client";

import React, { useState } from "react";

export default function AdminMeetRequests() {
  const [meetRequests, setMeetRequests] = useState([
    {
      id: 1,
      client: "Aritra Dhank",
      reason: "Need help with dashboard UI",
      date: "2025-02-10",
      time: "14:00",
      duration: "30 minutes",
      status: "pending",
      meetLink: "",
    },
    {
      id: 2,
      client: "John Doe",
      reason: "Discuss API integration",
      date: "2025-02-12",
      time: "11:30",
      duration: "1 hour",
      status: "approved",
      meetLink: "https://meet.google.com/xyz-123",
    },
  ]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [meetLink, setMeetLink] = useState("");

  const approveHandler = (id: number) => {
    setSelectedId(id);
    setOpenModal(true);
  };

  // NEW REJECT HANDLER
  const rejectHandler = (id: number) => {
    setMeetRequests((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: "rejected", meetLink: "" }
          : m
      )
    );
  };

  const submitMeetLink = () => {
    if (!selectedId) return;

    setMeetRequests((prev) =>
      prev.map((m) =>
        m.id === selectedId
          ? { ...m, status: "approved", meetLink }
          : m
      )
    );

    setOpenModal(false);
    setMeetLink("");
  };

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Meeting Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          View and manage client meeting requests.
        </p>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {meetRequests.map((m) => (
          <div
            key={m.id}
            className="
              bg-white dark:bg-gray-900 p-4 rounded-xl
              border border-gray-200 dark:border-gray-800
              shadow-sm hover:shadow-md transition-all
            "
          >
            {/* Title row */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {m.reason}
              </h3>

              <span
                className={`px-3 py-1 text-xs rounded-full capitalize ${m.status === "approved"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : m.status === "rejected"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                  }`}
              >
                {m.status}
              </span>
            </div>

            {/* Details */}
            <div className="flex justify-between items-center mt-3">
              <div className="space-y-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Client: {m.client}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Date: {m.date}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Time: {m.time}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Duration: {m.duration}
                </p>
              </div>

              {/* Right side buttons */}
              {m.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => approveHandler(m.id)}
                    className="
      px-4 py-2 rounded-lg text-sm
      bg-blue-600/30 text-blue-700
      dark:bg-blue-500/20 dark:text-blue-300
      hover:bg-blue-600/40 dark:hover:bg-blue-500/30
      transition
    "
                  >
                    Approve & Send Link
                  </button>

                  <button
                    onClick={() => rejectHandler(m.id)}
                    className="
      px-4 py-2 rounded-lg text-sm
      bg-red-600/30 text-red-700
      dark:bg-red-500/20 dark:text-red-300
      hover:bg-red-600/40 dark:hover:bg-red-500/30
      transition
    "
                  >
                    Reject
                  </button>
                </div>

              ) : (
                m.meetLink && (
                  <a
                    href={m.meetLink}
                    target="_blank"
                    className="
                      px-4 py-2 rounded-lg text-sm font-medium
                      bg-blue-500/30 text-blue-600
                      dark:bg-blue-400/20 dark:text-blue-300
                      hover:bg-blue-500/40 dark:hover:bg-blue-400/30
                      transition
                    "
                  >
                    Join
                  </a>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-[9999]">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Approve Meeting & Send Link
            </h2>

            <input
              type="text"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              placeholder="Paste Google Meet Link"
              className="
                w-full mt-1 rounded-lg border border-gray-300 dark:border-gray-700
                bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                p-3 focus:ring-2 focus:ring-blue-500 outline-none
              "
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={submitMeetLink}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
