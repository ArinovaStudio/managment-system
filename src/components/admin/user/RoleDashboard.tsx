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
};

export default function RoleDashboard() {
  const [selectedRole, setSelectedRole] = useState("EMPLOYEE");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
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
    setIsCountryOpen(false);
    loadUsers();
  }, []);

  // FILTER BY ROLE
  const filteredUsers = users.filter(
    (u) => u.role.toUpperCase() === selectedRole
  );

  return (
    <div className="p-6">
      {/* TOP HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold uppercase">{selectedRole}</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setSelectedRole("EMPLOYEE")}
            className="px-4 py-2 border rounded dark:border-gray-700"
          >
            Employee
          </button>

          <button
            onClick={() => setSelectedRole("ADMIN")}
            className="px-4 py-2 border rounded dark:border-gray-700"
          >
            Admin
          </button>

          <button
            onClick={() => setSelectedRole("CLIENT")}
            className="px-4 py-2 border rounded dark:border-gray-700"
          >
            Client
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Loading users...
        </p>
      )}

      {/* WHEN DATA LOADED */}
      {!loading && selectedRole === "ADMIN" ? (
        // ADMIN TABLE VIEW
        <table className="w-full border dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 dark:text-white">
              <th className="p-2 border dark:border-gray-700">ID</th>
              <th className="p-2 border dark:border-gray-700">Name</th>
              <th className="p-2 border dark:border-gray-700">Email</th>
              <th className="p-2 border dark:border-gray-700">Role</th>
              <th className="p-2 border dark:border-gray-700">Department</th>
              <th className="p-2 border dark:border-gray-700">Phone</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="dark:bg-gray-900">
                <td className="p-2 border dark:border-gray-700">{u.id}</td>
                <td className="p-2 border dark:border-gray-700">{u.name}</td>
                <td className="p-2 border dark:border-gray-700">{u.email}</td>
                <td className="p-2 border dark:border-gray-700">{u.role}</td>
                <td className="p-2 border dark:border-gray-700">
                  {u.department || "-"}
                </td>
                <td className="p-2 border dark:border-gray-700">
                  {u.phone || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // EMPLOYEE & CLIENT CARD VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* EMPLOYEE CARD VIEW */}
          {selectedRole === "EMPLOYEE" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-4 border rounded shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 min-w-[350px]"
                >
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

                      {/* Green status dot */}
                      <span
                        className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${u.isLogin ? "bg-green-500" : "bg-red-500"
                          }`}
                      />
                    </div>

                    <div>
                      <button
  type="button"
  onClick={() =>
    setOpenCard(openCard === u.id ? null : u.id)
  }
  className="text-3xl text-[#7e7e7e]"
>
  <span
    className={`transition-transform duration-200 flex items-center ${
      openCard === u.id ? "rotate-180" : ""
    }`}
  >
    <ChevronDown className="w-6 h-6" />
  </span>
</button>

                    </div>

                  </div>

                  <h2 className="font-bold text-lg">{u.name}</h2>

                  <div className="flex justify-between">
                    <div className="flex flex-col text-sm text-gray-500 dark:text-gray-400 gap-1">
                      <span>Department</span>
                      <span>{u.department || "N/A"}</span>
                    </div>

                    <div className="flex flex-col text-sm text-gray-500 dark:text-gray-400 gap-1">
                      <span>Hire Date</span>
                      <span>
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-GB")
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm mt-2">Email: {u.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Phone: {u.phone || "N/A"}
                  </p>

                  {openCard === u.id && (
  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow z-10 relative">
    <p className="text-sm text-gray-700 dark:text-gray-300">
      <strong>Employee ID:</strong> {u.employeeId || "N/A"}
    </p>
    <p className="text-sm text-gray-700 dark:text-gray-300">
      <strong>Bio:</strong> {u.bio || "No bio"}
    </p>
    <p className="text-sm text-gray-700 dark:text-gray-300">
      <strong>Working As:</strong> {u.workingAs || "N/A"}
    </p>
  </div>
)}


                </div>
              ))}
            </div>
          )}


          {/* CLIENT CARD VIEW */}
          {selectedRole === "CLIENT" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-4 border rounded shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 min-w-[350px]"
                >
                  <Image
                    src={u.image ?? "/default-avatar.png"}
                    alt={u.name}
                    width={50}
                    height={50}
                    unoptimized
                    className="w-20 h-20 rounded-full mb-4 object-cover"
                  />

                  <h2 className="font-bold text-lg">{u.name}</h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Joined:{" "}
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-GB")
                      : "N/A"}
                  </p>

                  <p className="text-sm mt-1">Email: {u.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Phone: {u.phone || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
