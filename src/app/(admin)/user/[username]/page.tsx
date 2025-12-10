"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Users, Calendar } from "lucide-react";

// Priority Color Helper
function getPriorityColor(priority: string) {
  switch (priority?.toUpperCase()) {
    case "HIGH":
      return "text-red-500 bg-red-500/20";
    case "MEDIUM":
      return "text-yellow-500 bg-yellow-500/20";
    case "LOW":
      return "text-green-500 bg-green-500/20";
    default:
      return "text-gray-500 bg-gray-500/20";
  }
}

export default function UserProfilePage() {
  const { username } = useParams();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) loadUser();
  }, [username]);

  async function loadUser() {
    try {
      const res = await fetch(`/api/user/${username}`);
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error loading user:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-500">Loading user...</p>;
  if (!user) return <p className="p-6 text-red-500">User not found.</p>;

  const projects = user.projectMembers || [];

  return (
    <div className="p-6">

      {/* PROFILE HEADER */}
      <div className="flex items-center gap-6 mb-8">
        <Image
          src={user.image ?? "/default-avatar.png"}
          alt={user.name}
          width={96}
          height={96}
          className="rounded-full object-cover"
        />

        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-400">
            Department: {user.department || "N/A"}
          </p>
        </div>
      </div>

      {/* SECTION HEADER */}
      <h2 className="text-xl font-semibold mb-4">Assigned Projects</h2>

      {/* PROJECT GRID */}
      {projects.length === 0 ? (
        <p className="text-gray-500">No assigned projects</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {projects.map((pm: any) => {
            const project = pm.project;
            const info = project?.projectInfo;
            const members = project?.members || [];

            return (
              <Link
                key={project.id}
                href={`/user/${user.name}/${project.id}`}
                className="block"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 hover:shadow-lg transition-all">

                  {/* Header */}
                  <div className="flex justify-between mb-3">
                    <h3 className="text-lg font-semibold">
                      {project.name}
                    </h3>

                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-gray-400 mb-4">
                    {project.summary || "No summary available"}
                  </p>

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      {members.length} members
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* PROGRESS */}
                  <div className="mb-3">
                    <div className="text-xs mb-1">{project.progress ?? 0}%</div>
                    <div className="bg-gray-200 h-1.5 rounded-full">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${project.progress ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* MEMBERS LIST PREVIEW (FIXED FEATURE 🔥) */}
                  {members.length > 0 && (
                    <div className="flex -space-x-2 mt-3">
                      {members.slice(0, 5).map((member: any) => (
                        <Image
                          key={member.user.id}
                          src={member.user.image || "/default-avatar.png"}
                          alt={member.user.name}
                          width={28}
                          height={28}
                          className="rounded-full border object-cover"
                        />
                      ))}
                      {members.length > 5 && (
                        <span className="text-xs text-gray-400 ml-3">
                          +{members.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* EXTRA INFO */}
                  {info && (
                    <div className="text-xs text-gray-400 mt-3 space-y-1">
                      <p><strong>Budget:</strong> {info.budget || "—"}</p>
                      <p><strong>Type:</strong> {info.projectType || "—"}</p>
                      <p><strong>Supervisor:</strong> {info.supervisorAdmin || "—"}</p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
