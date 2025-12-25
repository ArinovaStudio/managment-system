"use client";

import { Mail, Phone, Calendar, User, MapPin, Edit2, Trash2, Plus, Leaf, LucideTrash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
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
  leaves?: {
    total: number;
    remaining: number;
    emergency: number;
    sick: number;
  } | null;
  timezone?: {
    code: string;
    name?: string;
  } | null;
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
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [addUser, setAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE', department: '', workingAs: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Other'];
  const positions = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'Product Manager', 'Marketing Manager', 'Sales Executive', 'HR Manager', 'Other'];
  const [allTimezones, setAllTimezones] = useState<any[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [leaveDays, setLeaveDays] = useState(0);

  async function handleSaveAllChanges() {
    if (!editUser) return;

    setSaving(true);
    const toastId = toast.loading("Saving changes...");

    try {
      /* --------------------
         1️⃣ UPDATE USER PROFILE
      -------------------- */
      const userRes = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUser),
      });

      if (!userRes.ok) {
        const err = await userRes.json();
        throw new Error(err.error || "Failed to update user");
      }

      /* --------------------
         2️⃣ UPDATE TIMEZONE (OPTIONAL)
      -------------------- */
      let updatedTimezone = editUser.timezone;

      if (selectedTimezone && selectedTimezone !== editUser.timezone?.code) {
        const tzRes = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: editUser.id,
            timezoneCode: selectedTimezone,
          }),
        });

        const tzData = await tzRes.json();
        if (!tzRes.ok) throw new Error(tzData.error || "Failed to update timezone");

        updatedTimezone = tzData.timezone;
      }

      /* --------------------
         3️⃣ DEDUCT LEAVES (OPTIONAL)
      -------------------- */
      let updatedLeaves = editUser.leaves;

      if (leaveType && leaveDays > 0) {
        const leaveRes = await fetch("/api/admin/leaves", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: editUser.id,
            action: "deduct",
            type: leaveType,
            days: leaveDays,
          }),
        });

        const leaveData = await leaveRes.json();
        if (!leaveRes.ok) throw new Error(leaveData.error || "Failed to deduct leaves");

        updatedLeaves = leaveData.leaves;
      }

      /* --------------------
         4️⃣ UPDATE UI STATE
      -------------------- */
      setUsers(prev =>
        prev.map(u =>
          u.id === editUser.id
            ? {
              ...u,
              ...editUser,
              timezone: updatedTimezone,
              leaves: updatedLeaves,
            }
            : u
        )
      );

      toast.success("Changes saved successfully", { id: toastId });
      setEditUser(null);

      // Reset temp states
      setLeaveType("");
      setLeaveDays(0);
      setSelectedTimezone("");

    } catch (err: any) {
      toast.error(err.message || "Something went wrong", { id: toastId });
    } finally {
      setSaving(false);
    }
  }


  // async function updateLeaves() {
  //   if (!editUser || !leaveType || !leaveDays) return;

  //   const res = await fetch("/api/admin/leaves", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       userId: editUser.id,
  //       action: "deduct",
  //       type: leaveType,
  //       days: leaveDays,
  //     }),
  //   });

  //   const data = await res.json();
  //   if (!res.ok) return toast.error(data.error);

  //   setUsers(prev =>
  //     prev.map(u =>
  //       u.id === editUser.id ? { ...u, leaves: data.leaves } : u
  //     )
  //   );

  //   toast.success("Leaves updated");
  // }

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/getRoleWise?role=" + selectedRole);
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to load users");
          return;
        }
        setUsers(data.users || []);
      } catch {
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [selectedRole]);

  useEffect(() => {
    async function loadTimezones() {
      try {
        const res = await fetch("/api/clock/timezone?action=timezones");
        const data = await res.json();
        if (data.success) {
          setAllTimezones(data.timezones);
        }
      } catch {
        toast.error("Failed to load timezones");
      }
    }

    loadTimezones();
  }, []);


  // UPDATE TIMEZONE
  // async function updateTimezone() {
  //   if (!selected || !editUser) return;

  //   try {
  //     const res = await fetch("/api/admin/users", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         userId: editUser.id,
  //         timezoneCode: selected,
  //       }),
  //     });

  //     const data = await res.json();
  //     if (!res.ok) {
  //       toast.error(data.error || "Failed to update timezone");
  //       return;
  //     }

  //     // Update UI instantly
  //     setUsers((prev) =>
  //       prev.map((u) =>
  //         u.id === editUser.id
  //           ? { ...u, timezone: data.timezone }
  //           : u
  //       )
  //     );
  //     setEditUser(prev =>
  //       prev ? { ...prev, timezone: data.timezone } : prev
  //     );
  //     setEditUser(null);


  //     toast.success("Timezone updated");
  //   } catch {
  //     toast.error("Network error");
  //   }
  // }



  const visibleUsers = users.filter((u) => u.role === selectedRole);

  function getLeaveStats(user: User) {
    const leaves = user.leaves ?? { sick: 0, emergency: 0 };

    const TOTAL_LEAVES = 8;

    const remaining = leaves.sick + leaves.emergency;
    const used = TOTAL_LEAVES - remaining;

    return {
      total: TOTAL_LEAVES,
      remaining,
      used,
      breakdown: {
        sick: leaves.sick,
        emergency: leaves.emergency,
      },
    };
  }



  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">{selectedRole === "EMPLOYEE" ? "Employees" : selectedRole === "ADMIN" ? "Admin" : "Client"}
          <span className="text-m font-semibold text-gray-800 dark:text-gray-500 mx-3">{visibleUsers.length}</span>
        </h1>
        <div className="flex justify-between items-center">
          {/* Tab Navigation */}
          <div className="flex gap-2 bg-white dark:bg-gray-900 rounded-lg p-1.5 shadow-sm border border-gray-200 dark:border-gray-800">
            {["EMPLOYEE", "ADMIN", "CLIENT"].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${selectedRole === role
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                {role === "EMPLOYEE" ? "Employees" : role === "ADMIN" ? "Admin" : "Client"}
              </button>
            ))}
          </div>

          {/* ADD USER BUTTON */}
          <button
            onClick={() => setAddUser(true)}
            className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-medium text-sm"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {addUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-250">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Add New User</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                const toastId = toast.loading("Creating user...");
                try {
                  const res = await fetch("/api/admin/user", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newUser),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    toast.error(data.error || "Failed to create user", { id: toastId });
                    return;
                  }
                  setUsers((prev) => [...prev, data.user]);
                  toast.success("User created successfully", { id: toastId });
                  setAddUser(false);
                  setNewUser({ name: "", email: "", password: "", role: "EMPLOYEE", department: "", workingAs: "", phone: "" });
                } catch {
                  toast.error("Something went wrong", { id: toastId });
                } finally {
                  setSaving(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input required className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Enter name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input required type="email" className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="Enter email" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input required type="password" className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Enter password" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                  <option value="CLIENT">Client</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}>
                  <option value="">Select or type below</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded mt-2" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })} placeholder="Or type custom department" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <select className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded" value={newUser.workingAs} onChange={(e) => setNewUser({ ...newUser, workingAs: e.target.value })}>
                  <option value="">Select or type below</option>
                  {positions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded mt-2" value={newUser.workingAs} onChange={(e) => setNewUser({ ...newUser, workingAs: e.target.value })} placeholder="Or type custom position" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} placeholder="Enter phone number" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => { setAddUser(false); setNewUser({ name: '', email: '', password: '', role: 'EMPLOYEE', department: '', workingAs: '', phone: '' }); }} className="px-4 py-2 rounded border dark:border-gray-600">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">{saving ? "Creating..." : "Create User"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && <p className="text-center text-gray-400 mt-4">Loading users...</p>}

      {/* ADMIN TABLE */}
      {!loading && selectedRole === "ADMIN" ? (
        <table className="w-full border dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-3 border text-left text-sm font-medium">ID</th>
              <th className="p-3 border text-left text-sm font-medium">Name</th>
              <th className="p-3 border text-left text-sm font-medium">Email</th>
              <th className="p-3 border text-left text-sm font-medium">Role</th>
              <th className="p-3 border text-left text-sm font-medium">Department</th>
              <th className="p-3 border text-left text-sm font-medium">Phone</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((u) => (
              <tr key={u.id} className="dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-3 border text-sm">{u.id}</td>
                <td className="p-3 border text-sm">{u.name}</td>
                <td className="p-3 border text-sm">{u.email}</td>
                <td className="p-3 border text-sm">{u.role}</td>
                <td className="p-3 border text-sm">{u.department || "-"}</td>
                <td className="p-3 border text-sm">{u.phone || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        /* EMPLOYEE + CLIENT CARD VIEW */
        <div>
          {/* EMPLOYEE CARD VIEW */}
          {selectedRole === "EMPLOYEE" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {visibleUsers.map((u) => {
                const emergencyPhone = u.phone || "N/A";
                const leaveStats = getLeaveStats(u);

                return (
                  // <Link
                  //   href={`/user/${u.name}`}
                  //   className="hover:shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                  //   title="View Profile"
                  //   key={u.id}
                  // >
                  <div key={u.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all">
                    {/* Header Section */}
                    <div className="flex items-start gap-4">
                      {/* Avatar with Status */}
                      <div className="relative flex-shrink-0">
                        <Image
                          src={u.image ?? "/default-avatar.png"}
                          alt={u.name}
                          width={72}
                          height={72}
                          className="rounded-full object-cover w-18 h-18"
                        />
                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${u.isLogin ? "bg-green-500" : "bg-gray-400"}`} />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 gap-2 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{u.name}</h3>

                        {/* Contact Info with Icons */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                            <span className="truncate">{u.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                            <span>{u.phone || "N/A"}</span>
                          </div>
                        </div>

                        {/* Employee Details */}
                        <div className="mt-3 space-y-3">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                            <User className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>ID: {u.employeeId || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Emergency: {emergencyPhone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                            <Leaf className="w-4 h-4" />
                            <span className="text-gray-600 dark:text-gray-400">
                              Leaves: {leaveStats.remaining} - {leaveStats.total}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditUser(u);
                            setSelectedTimezone(u.timezone?.code || "");
                          }}

                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>

                        <button
                          onClick={() => {
                            setDeleteUser(u)
                          }}

                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>

                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {u.workingAs || "Employee"} - {u.department || "Department"}
                      </span>
                    </div>

                    {/* Bio */}
                    <p className="mt-2.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {u.bio || "Hardworking and result-oriented professional"}
                    </p>

                    {/* Footer - Timezone & DOB */}
                    <div className="mt-4 pt-3.5 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Time Zone: {u.timezone?.code || "IND"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>DOB: {u.dob || "N/A"}</span>
                      </div>
                    </div>

                    {/* EDIT USER MODAL */}
                    {editUser && editUser.id === u.id && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                          <h2 className="text-lg font-bold mb-4">Edit User</h2>
                          <form
                            // onSubmit={async (e) => {
                            //   e.preventDefault();
                            //   setSaving(true);
                            //   const toastId = toast.loading("Updating user...");
                            //   try {
                            //     const res = await fetch("/api/auth/user", {
                            //       method: "PATCH",
                            //       headers: { "Content-Type": "application/json" },
                            //       body: JSON.stringify(editUser),
                            //     });
                            //     const data = await res.json();
                            //     if (!res.ok) {
                            //       toast.error(data.error || "Update failed", { id: toastId });
                            //       return;
                            //     }
                            //     setUsers((prev) => prev.map((u) => (u.id === editUser.id ? data.user ?? editUser : u)));
                            //     toast.success("User updated successfully", { id: toastId });
                            //     setEditUser(null);
                            //   } catch {
                            //     toast.error("Something went wrong", { id: toastId });
                            //   } finally {
                            //     setSaving(false);
                            //   }
                            // }}
                            className="space-y-3"
                          >
                            <div>
                              <label className="block text-sm font-medium mb-1">Name</label>
                              <input className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} placeholder="Enter name" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Email</label>
                              <input className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} placeholder="Enter email" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Phone</label>
                              <input className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded" value={editUser.phone ?? ""} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} placeholder="Enter phone number" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Department</label>
                              <select className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded" value={editUser.department ?? ""} onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}>
                                <option value="">Select or type below</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                              <input className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded mt-2" value={editUser.department ?? ""} onChange={(e) => setEditUser({ ...editUser, department: e.target.value })} placeholder="Or type custom department" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Position</label>
                              <select className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded" value={editUser.workingAs ?? ""} onChange={(e) => setEditUser({ ...editUser, workingAs: e.target.value })}>
                                <option value="">Select or type below</option>
                                {positions.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                              <input className="w-full border dark:border-gray-600 dark:bg-gray-700 px-3 py-2 rounded mt-2" value={editUser.workingAs ?? ""} onChange={(e) => setEditUser({ ...editUser, workingAs: e.target.value })} placeholder="Or type custom position" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Manage Leaves</label>
                              <select
                                value={leaveType}
                                onChange={(e) => setLeaveType(e.target.value)}
                                className="w-full border px-3 py-2 rounded dark:bg-gray-700"
                              >
                                <option value="">Select leave type</option>
                                <option value="remaining">Casual</option>
                                <option value="sick">Sick</option>
                                <option value="emergency">Emergency</option>
                              </select>
                              <input
                                type="number"
                                min={1}
                                value={leaveDays}
                                onChange={(e) => setLeaveDays(Number(e.target.value))}
                                className="w-full border px-3 py-2 rounded mt-2 dark:bg-gray-700"
                                placeholder="Number of days"
                              />
                              {/* <button
                                onClick={updateLeaves}
                                className="w-full mt-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Deduct Leaves
                              </button> */}
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Time Zone
                              </label>

                              <select
                                value={selectedTimezone}
                                onChange={(e) => setSelectedTimezone(e.target.value)}
                                className=" w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="" disabled>
                                  Select Timezone
                                </option>

                                {allTimezones.map((tz) => (
                                  <option key={tz.code} value={tz.code}>
                                    {tz.code} — {tz.hours}
                                  </option>
                                ))}
                              </select>
                              {/* <button
                                onClick={updateTimezone}
                                disabled={!selected}
                                className="w-full mt-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                              >
                                Save Timezone
                              </button> */}

                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                              <button
                                type="button"
                                onClick={() => setEditUser(null)}
                                className="px-4 py-2 rounded border dark:border-gray-600"
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                onClick={handleSaveAllChanges}
                                disabled={saving}
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                              >
                                {saving ? "Saving..." : "Save Changes"}
                              </button>
                            </div>

                          </form>
                        </div>
                      </div>
                    )}

                    {/* DELETE USER MODAL */}
                    {deleteUser && deleteUser.id === u.id && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
                          <h2 className="text-lg font-bold text-red-600">Delete User</h2>
                          <p className="text-sm mt-2">Are you sure you want to delete <strong>{deleteUser.name}</strong>? This action cannot be undone.</p>
                          <div className="flex justify-end gap-3 mt-5">
                            <button onClick={() => setDeleteUser(null)} className="px-4 py-2 rounded border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
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
                              }}
                              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  // </Link>
                );
              })}
            </div>
          )}

          {/* CLIENT CARD VIEW */}
          {selectedRole === "CLIENT" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {visibleUsers.map((u) => (
                <div key={u.id} onClick={() => (window.location.href = `/user/${u.name}`)} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.01]">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <Image src={u.image ?? "/default-avatar.png"} alt={u.name} width={72} height={72} className="rounded-full object-cover w-18 h-18" />
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${u.isLogin ? "bg-green-500" : "bg-gray-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0 relative">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{u.name}</h3>
                      <div className="w-10 h-10 hover:bg-gray-200/20 rounded-sm flex justify-center items-center absolute right-0 top-0 z-50" 
                      onClick={() => {
                            setDeleteUser(u)
                          }}>
                        <LucideTrash color="white" strokeWidth={1} size={18}/>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                          <span className="truncate">{u.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                          <span>{u.phone || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mt-2">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Bio: {u.bio || "N/A"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}