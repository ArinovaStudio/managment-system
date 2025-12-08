"use client";

import React, { useState } from "react";

type Feedback = {
  id: number;
  client: string;
  message: string;
  submittedAt: string;
};

export default function AdminFeedbacksPage() {
  const [feedbacks] = useState<Feedback[]>([
    {
      id: 1,
      client: "Client A",
      message: "The UI looks clean and smooth. Would love more themes!",
      submittedAt: "2025-02-12"
    },
    {
      id: 2,
      client: "Client B",
      message: "The dashboard loads slowly sometimes, please optimize.",
      submittedAt: "2025-02-10"
    },
    {
      id: 3,
      client: "Client C",
      message: "Great customer support and fast updates!",
      submittedAt: "2025-02-07"
    },
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Client Feedbacks
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Read feedback submitted by your clients.
        </p>
      </div>

      {/* Feedback List */}
      <div className="grid gap-4">
        {feedbacks.map((fb) => (
          <div
            key={fb.id}
            className="
              bg-white dark:bg-gray-900
              p-5 rounded-xl border
              border-gray-200 dark:border-gray-800
              shadow-sm hover:shadow-md
              transition-all
            "
          >
            {/* Top Row */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {fb.client}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {fb.submittedAt}
              </p>
            </div>

            {/* Message */}
            <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              {fb.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
