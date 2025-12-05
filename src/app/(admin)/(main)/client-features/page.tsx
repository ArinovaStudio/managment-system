"use client";

import React, { useState } from "react";

type FeatureRequest = {
  id: number;
  title: string;
  description: string;
  submittedBy: string;
  date: string;
  status: "pending" | "approved" | "rejected";
};

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<FeatureRequest[]>([
    {
      id: 1,
      title: "Dark Mode Enhancement",
      description: "Improve the dark mode contrast and add AMOLED black.",
      submittedBy: "Client A",
      date: "2025-02-10",
      status: "pending",
    },
    {
      id: 2,
      title: "Search Functionality",
      description: "Add search inside dashboard tables.",
      submittedBy: "Client B",
      date: "2025-02-09",
      status: "pending",
    },
  ]);

  const approveFeature = (id: number) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: "approved" } : f
      )
    );
  };

  const rejectFeature = (id: number) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: "rejected" } : f
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Feature Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Review feature requests submitted by clients.
        </p>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {features.map((f) => (
          <div
            key={f.id}
            className="
              bg-white dark:bg-gray-900 
              p-5 rounded-xl border 
              border-gray-200 dark:border-gray-800 
              shadow-sm hover:shadow-md transition-all
            "
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {f.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Submitted by {f.submittedBy} • {f.date}
                </p>
              </div>

              {/* Status badge */}
              <span
                className={`
                  px-3 py-1 text-xs rounded-full capitalize
                  ${
                    f.status === "approved"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : f.status === "rejected"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                  }
                `}
              >
                {f.status}
              </span>
            </div>

            <p className="mt-4 text-gray-700 dark:text-gray-300">
              {f.description}
            </p>

            {/* Buttons */}
            {f.status === "pending" && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => approveFeature(f.id)}
                  className="
                    px-4 py-2 rounded-lg text-sm font-medium
                    bg-blue-500/30 text-blue-600
                    dark:bg-blue-400/20 dark:text-blue-300
                    hover:bg-blue-500 hover:text-white
                    dark:hover:bg-blue-400 dark:hover:text-black
                    transition
                  "
                >
                  Approve
                </button>

                <button
                  onClick={() => rejectFeature(f.id)}
                  className="
                    px-4 py-2 rounded-lg text-sm font-medium
                    bg-red-500/30 text-red-600
                    dark:bg-red-400/20 dark:text-red-300
                    hover:bg-red-500 hover:text-white
                    dark:hover:bg-red-400 dark:hover:text-black
                    transition
                  "
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
