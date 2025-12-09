"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";

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
};

export default function RoleDashboard() {
  const [selectedRole, setSelectedRole] = useState("EMPLOYEE");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCard, setOpenCard] = useState<string | null>(null);

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

  // FILTER USERS BY ROLE
  const filteredUsers = users.filter(
    (u) => u.role.toUpperCase() === selectedRole
  );

  return (
    <div className="p-6">
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
              className={`px-4 py-2 rounded-lg font-medium border transition-all duration-200
                ${
                  selectedRole === role
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
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {filteredUsers.map((u) => {
      const isOpen = openCard === u.id;

      return (
        <div
          key={u.id}
          className="p-4 border rounded shadow bg-white dark:bg-gray-900 dark:border-gray-700 transition-all duration-200"
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
                className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${
                  u.isLogin ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>

            <button
              type="button"
              onClick={() => setOpenCard(isOpen ? null : u.id)}
              className="text-gray-600"
            >
              <ChevronDown
                className={`w-7 h-7 transform transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* MAIN CONTENT (hidden when open) */}
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
              <p className="text-sm">
                <strong>{u.employeeId || "N/A"}</strong> 
              </p>
              <p className="text-sm mt-1">
                {/* <strong>Bio:</strong> {u.bio || "No bio"} */}
              </p>
              <p className="text-sm mt-1">
                <strong></strong> {u.workingAs || "N/A"}
              </p>
            </div>
          )}
        </div>
      );
    })}
  </div>
)}


          {/* CLIENT CARD VIEW */}
          {selectedRole === "CLIENT" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-4 border rounded shadow bg-white dark:bg-gray-900 dark:border-gray-700"
                >
                  <Image
                    src={u.image ?? "/default-avatar.png"}
                    alt={u.name}
                    width={80}
                    height={80}
                    unoptimized
                    className="w-20 h-20 rounded-full object-cover mb-3"
                  />

                  <h2 className="font-bold text-lg">{u.name}</h2>
                  <p className="text-sm text-gray-500">
                    Joined:{" "}
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-GB")
                      : "N/A"}
                  </p>
                  <p className="text-sm">{u.email}</p>
                  <p className="text-sm text-gray-500">{u.phone || "N/A"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
