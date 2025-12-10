"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function UserProfilePage() {
  const { username } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) loadUser();
  }, [username]);

  async function loadUser() {
    try {
      const res = await fetch(`/api/user/${username}`, { method: "GET" });
      const data = await res.json();

      if (data.success) setUser(data.user);
    } catch (err) {
      console.error("Error loading user:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading user...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-red-500">User not found.</p>
      </div>
    );
  }

  const projects = user.projectMembers || [];

  return (
    <div className="p-6">

      {/* PROFILE HEADER */}
      <div className="flex items-center gap-6 mb-8">
        <Image
          src={user.image ?? "/default-avatar.png"}
          alt={user.name}
          width={100}
          height={100}
          unoptimized
          className="w-24 h-24 rounded-full object-cover"
        />

        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-400 mt-1">
            Department: {user.department || "N/A"}
          </p>
        </div>
      </div>

      {/* SECTION HEADER */}
      <h2 className="text-xl font-semibold mb-3">Assigned Projects</h2>

      {/* PROJECT GRID */}
      {projects.length === 0 ? (
        <p className="text-gray-500">No assigned projects</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((pm: any) => {
            const p = pm.project;
            const info = p.projectInfo;

            return (
              <div
                key={p.id}
                className="border p-4 rounded-lg shadow bg-white dark:bg-gray-900 dark:border-gray-700"
              >
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{p.summary || "No summary available"}</p>

                <p className="text-sm">
                  <strong>Priority:</strong> {p.priority || "—"}
                </p>

                <p className="text-sm">
                  <strong>Status:</strong> {p.status || "—"}
                </p>

                <p className="text-sm">
                  <strong>Progress:</strong> {p.progress ?? 0}%
                </p>

                <p className="text-sm">
                  <strong>Created At:</strong>{" "}
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                </p>

                {/* PROJECT INFO SUBSECTION */}
                {info && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-sm">
                      <strong>Budget:</strong> {info.budget || "—"}
                    </p>

                    <p className="text-sm">
                      <strong>Project Type:</strong> {info.projectType || "—"}
                    </p>

                    <p className="text-sm">
                      <strong>Supervisor Admin:</strong> {info.supervisorAdmin || "—"}
                    </p>
                  </div>
                )}

                {/* BUTTON TO VIEW FULL PROJECT PAGE */}
                <button
                  onClick={() => (window.location.href = `/project/${p.id}`)}
                  className="mt-4 w-full text-sm bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                >
                  View Project Details
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
