"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";


type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string | null;
  department?: string | null;
  phone?: string | null;
  createdAt?: string;
  image?: string;
  isLogin: boolean;
  bio?: string;
  workingAs?: string;
  clockRecords?: any[];
  breaks?: any[];
  Documents?: any[];
  milestones?: any[];
  leaves?: any[];
  timezone?: any[];
  workHours?: any[];
  featureRequests?: any[];
  meetingRequests?: any[];
  faceDescriptor?: string;
  dob?: string;
  leaveRequests?: { status: string }[];

  projectMembers?: {
    project: {
      id: string;
      name: string;
      summary?: string | null;
      priority?: string | null;
      progress?: number | null;
      status?: string | null;
      createdAt?: string;

      projectInfo?: {
        budget?: number | null;
        projectType?: string | null;
        supervisorAdmin?: string | null;
      } | null;
    };
  }[];
};

export default function RoleDashboard() {
  const [selectedRole, setSelectedRole] = useState("EMPLOYEE");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCard, setOpenCard] = useState<string | null>(null);

  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);


  // FETCH USERS FROM BACKEND
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/auth/signup");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  // Reset open card when switching roles (optional but nicer UX)
  useEffect(() => {
    setOpenCard(null);
  }, [selectedRole]);

  // FILTER USERS BY ROLE
  const filteredUsers = users.filter(
    (u) => u.role.toUpperCase() === selectedRole
  );

  return (
    <div className="p-6">

      <Toaster position="top-right" />
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold uppercase">
          {selectedRole} ({filteredUsers.length})
        </h1>

        {/* ROLE SWITCH BUTTONS */}
        <div className="flex gap-3">
          {["EMPLOYEE", "ADMIN", "CLIENT"].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${selectedRole === role
                  ? "bg-blue-600 text-white border-blue-700 shadow-lg scale-105"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300"
                }
              `}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Loading users...
        </p>
      )}

      {/* ADMIN TABLE */}
      {!loading && selectedRole === "ADMIN" ? (
        <table className="w-full border dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Department</th>
              <th className="p-2 border">Phone</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="dark:bg-gray-900">
                <td className="p-2 border">{u.id}</td>
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.role}</td>
                <td className="p-2 border">{u.department || "-"}</td>
                <td className="p-2 border">{u.phone || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        /* EMPLOYEE + CLIENT VIEW */
        <div>
          {/* EMPLOYEE CARD VIEW */}
          {selectedRole === "EMPLOYEE" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {filteredUsers.map((u) => {
                const isOpen = openCard === u.id;

                return (
                  <div
                    key={u.id}
                    className="p-4 border rounded shadow bg-white dark:bg-gray-900 dark:border-gray-700 transition-all duration-200 self-start"
                  >
                    {/* HEADER (always visible) */}
                    <div className="flex justify-between items-center">
                      <div className="relative w-fit">
                        <Image
                          src={u.image ?? "/default-avatar.png"}
                          alt={u.name}
                          width={80}
                          height={80}
                          unoptimized
                          className="w-20 h-20 rounded-full object-cover"
                        />

                        <span
                          className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${u.isLogin ? "bg-green-500" : "bg-red-500"
                            }`}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditUser(u)}
                          className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>

                      </div>

                      <div>

                        <button
                          onClick={() => setDeleteUser(u)}
                          className="text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenCard(isOpen ? null : u.id)}
                        className="text-gray-600"
                      >
                        <ChevronDown
                          className={`w-7 h-7 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                    </div>

                    {editUser && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                          <h2 className="text-lg font-bold mb-4">Edit User</h2>

                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              setSaving(true);

                              const toastId = toast.loading("Updating user...");
                              try {
                                const res = await fetch("/api/auth/user", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify(editUser),
                                });

                                const data = await res.json();

                                if (!res.ok) {
                                  toast.error(data.error || "Update failed", { id: toastId });
                                  return;
                                }

                                setUsers((prev) =>
                                  prev.map((u) => (u.id === editUser.id ? data.user ?? editUser : u))
                                );

                                toast.success("User updated successfully", { id: toastId });
                                setEditUser(null);
                              } catch {
                                toast.error("Something went wrong", { id: toastId });
                              } finally {
                                setSaving(false);
                              }


                              setUsers((prev) =>
                                prev.map((u) => (u.id === editUser.id ? editUser : u))
                              );

                              setSaving(false);
                              setEditUser(null);
                            }}
                            className="space-y-3"
                          >
                            <div>
                              <label className="block text-sm font-medium mb-1">Name</label>
                              <input
                                className="w-full border px-3 py-2 rounded"
                                value={editUser.name}
                                onChange={(e) =>
                                  setEditUser({ ...editUser, name: e.target.value })
                                }
                                placeholder="Enter name"
                              />
                            </div>


                            <div>
                              <label className="block text-sm font-medium mb-1">Email</label>
                              <input
                                className="w-full border px-3 py-2 rounded"
                                value={editUser.email}
                                onChange={(e) =>
                                  setEditUser({ ...editUser, email: e.target.value })
                                }
                                placeholder="Enter email"
                              />
                            </div>


                            <div>
                              <label className="block text-sm font-medium mb-1">Phone</label>
                              <input
                                className="w-full border px-3 py-2 rounded"
                                value={editUser.phone ?? ""}
                                onChange={(e) =>
                                  setEditUser({ ...editUser, phone: e.target.value })
                                }
                                placeholder="Enter phone number"
                              />
                            </div>


                            <div>
                              <label className="block text-sm font-medium mb-1">Department</label>
                              <input
                                className="w-full border px-3 py-2 rounded"
                                value={editUser.department ?? ""}
                                onChange={(e) =>
                                  setEditUser({ ...editUser, department: e.target.value })
                                }
                                placeholder="Enter department"
                              />
                            </div>


                            <div>
                              <label className="block text-sm font-medium mb-1">Working As</label>
                              <input
                                className="w-full border px-3 py-2 rounded"
                                value={editUser.workingAs ?? ""}
                                onChange={(e) =>
                                  setEditUser({ ...editUser, workingAs: e.target.value })
                                }
                                placeholder="e.g. Frontend Developer"
                              />
                            </div>


                            <div className="flex justify-end gap-3 mt-4">
                              <button
                                type="button"
                                onClick={() => setEditUser(null)}
                                className="px-4 py-2 rounded border"
                              >
                                Cancel
                              </button>

                              <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 rounded bg-blue-600 text-white"
                              >
                                {saving ? "Saving..." : "Save"}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                    {deleteUser && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
                          <h2 className="text-lg font-bold text-red-600">
                            Delete User
                          </h2>

                          <p className="text-sm mt-2">
                            Are you sure you want to delete{" "}
                            <strong>{deleteUser.name}</strong>?
                            This action cannot be undone.
                          </p>

                          <div className="flex justify-end gap-3 mt-5">
                            {/* Cancel */}
                            <button
                              onClick={() => setDeleteUser(null)}
                              className="
      px-4 py-2 rounded-md border
      text-gray-700 dark:text-gray-300
      bg-white dark:bg-gray-800
      hover:bg-gray-100 dark:hover:bg-gray-700
      hover:border-gray-400
      transition-all duration-200
      active:scale-95
      focus:outline-none focus:ring-2 focus:ring-gray-400/50
    "
                            >
                              Cancel
                            </button>

                            {/* Delete */}
                            <button
                              onClick={async () => {
                                const toastId = toast.loading("Deleting user...");
                                try {
                                  const res = await fetch("/api/auth/user", {
                                    method: "DELETE",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ email: deleteUser.email }),
                                  });

                                  const data = await res.json();

                                  if (!res.ok) {
                                    toast.error(data.error || "Delete failed", { id: toastId });
                                    return;
                                  }

                                  setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
                                  toast.success("User deleted successfully", { id: toastId });
                                  setDeleteUser(null);
                                } catch {
                                  toast.error("Something went wrong", { id: toastId });
                                }



                                setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
                                setDeleteUser(null);
                              }}
                              className="
      px-4 py-2 rounded-md
      bg-red-600 text-white
      hover:bg-red-700
      transition-all duration-200
      active:scale-95
      focus:outline-none focus:ring-2 focus:ring-red-500/60
    "
                            >
                              Delete
                            </button>
                          </div>

                        </div>
                      </div>
                    )}



                    {/* MAIN CONTENT (collapsed view) */}
                    {!isOpen && (
                      <div className="mt-3">
                        <h2 className="font-bold text-lg">{u.name}</h2>

                        <div className="flex justify-between mt-2 text-sm text-gray-500">
                          <span>Dept: {u.department || "N/A"}</span>

                          <span>
                            Joined:{" "}
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString("en-GB")
                              : "N/A"}
                          </span>
                        </div>

                        <p className="text-sm mt-2">{u.email}</p>
                        <p className="text-sm text-gray-500">{u.phone || "N/A"}</p>
                      </div>
                    )}

                    {/* DROPDOWN CONTENT (only when open) */}
                    {isOpen && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
                        {/* EMPLOYEE INFO */}
                        <p className="text-sm font-semibold">
                          {u.employeeId || "N/A"}
                        </p>

                        {/* WORKING AS */}
                        <p className="text-sm mt-1">{u.workingAs || "N/A"}</p>

                        {/* LEAVE REQUEST COUNTS */}
                        {(() => {
                          const pendingLeaves =
                            u.leaveRequests?.filter(
                              (l) => l.status === "Pending"
                            )?.length || 0;

                          const approvedLeaves =
                            u.leaveRequests?.filter(
                              (l) => l.status === "Approved"
                            )?.length || 0;

                          return (
                            <>
                              <p className="text-xs mt-3">
                                <strong>Pending Leaves:</strong> {pendingLeaves}
                              </p>

                              <p className="text-xs mt-1">
                                <strong>Approved Leaves:</strong>{" "}
                                {approvedLeaves}
                              </p>
                            </>
                          );
                        })()}

                        {/* CLOCK IN / CLOCK OUT */}
                        {(() => {
                          const latestClock = u.clockRecords
                            ?.sort(
                              (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime()
                            )[0];

                          const clockIn = latestClock?.clockIn
                            ? new Date(
                              latestClock.clockIn
                            ).toLocaleTimeString("en-GB")
                            : "N/A";

                          const clockOut = latestClock?.clockOut
                            ? new Date(
                              latestClock.clockOut
                            ).toLocaleTimeString("en-GB")
                            : "N/A";

                          return (
                            <>
                              <p className="text-xs mt-3">
                                <strong>Clock In:</strong> {clockIn}
                              </p>
                              <p className="text-xs mt-1">
                                <strong>Clock Out:</strong> {clockOut}
                              </p>
                            </>
                          );
                        })()}

                        {/* PROJECT ASSIGNED (EMPLOYEE SIDE – original list view) */}
                        {(() => {
                          const projects = u.projectMembers || [];

                          return (
                            <div className="mt-4">
                              <p className="text-sm font-semibold mb-1">
                                Projects Assigned:
                              </p>

                              {projects.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                  No assigned projects
                                </p>
                              ) : (
                                <ul className="list-disc pl-5">
                                  {projects.map((pm) => (
                                    <li
                                      key={pm.project.id}
                                      className="text-sm"
                                    >
                                      {pm.project.name}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* CLIENT CARD VIEW */}
          {selectedRole === "CLIENT" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => (window.location.href = `/user/${u.name}`)}
                  className="p-4 border rounded shadow bg-white dark:bg-gray-900 dark:border-gray-700 transition-all duration-200 self-start cursor-pointer hover:shadow-lg hover:scale-[1.01]"
                >
                  {/* HEADER */}
                  <div className="flex justify-between items-center">
                    <div className="relative w-fit">
                      <Image
                        src={u.image ?? "/default-avatar.png"}
                        alt={u.name}
                        width={80}
                        height={80}
                        unoptimized
                        className="w-20 h-20 rounded-full object-cover"
                      />

                      <span
                        className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${u.isLogin ? "bg-green-500" : "bg-red-500"
                          }`}
                      />
                    </div>
                  </div>

                  {/* MAIN CONTENT */}
                  <div className="mt-3">
                    <h2 className="font-bold text-lg">{u.name}</h2>

                    <div className="flex justify-between mt-2 text-sm text-gray-500">
                      <span>Dept: {u.department || "N/A"}</span>

                      <span>
                        Joined:{" "}
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-GB")
                          : "N/A"}
                      </span>
                    </div>

                    <p className="text-sm mt-2">{u.email}</p>
                    <p className="text-sm text-gray-500">{u.phone || "N/A"}</p>
                  </div>

                  {/* REMOVE DROPDOWN — NO PROJECTS HERE */}
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
