"use client";

import { useEffect, useState } from "react";
import { X, Users, Calendar, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface User {
    id: string;
    name: string;
    workingAs?: string;
}

export default function CreateMeetingModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [meetingLink, setMeetingLink] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchUser, setSearchUser] = useState("");

    useEffect(() => {
        if (open) {
            fetch('/api/user?all=true')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setUsers(data.users.filter((u: any) => u.role === 'EMPLOYEE'));
                    }
                })
        }
    }, [open]);

    const toggleUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const submit = async () => {
        if (!title || !scheduledAt || selectedUsers.length === 0) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        const res = await fetch('/api/meetings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, scheduledAt, meetingLink, attendees: selectedUsers })
        });
        setLoading(false);

        const data = await res.json();
        if (data.success) {
            toast.success("Meeting created successfully");
            onCreated();
            onClose();
            setTitle("");
            setDescription("");
            setScheduledAt("");
            setMeetingLink("");
            setSelectedUsers([]);
        } else {
            toast.error(data.error || "Failed to create meeting");
        }
    };

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchUser.toLowerCase())
    );


    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4  ">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none']  [scrollbar-width:'none']">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold dark:text-white">Create Meeting</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <X size={20} className="text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-white">Meeting Title *</label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Enter meeting title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-white">
                                Description ({description.length}/150)
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Brief description (max 150 characters)"
                                maxLength={150}
                                rows={3}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-white">
                                <Clock size={16} className="inline mr-1" />
                                Scheduled Time *
                            </label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={e => setScheduledAt(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-white">
                                Meeting Link*
                            </label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                type="url"
                                placeholder="https://meet.google.com/xxx or https://zoom.us/j/xxx"
                                value={meetingLink}
                                onChange={e => setMeetingLink(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Users size={20} className="text-gray-600 dark:text-gray-400" />
                                <label className="text-sm font-medium dark:text-white">
                                    Select Attendees ({selectedUsers.length} selected) *
                                </label>
                            </div> 

                            {/* DROPDOWN BUTTON */}
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                {selectedUsers.length > 0
                                    ? `${selectedUsers.length} user(s) selected`
                                    : "Select attendees"} ↓
                            </button>

                            {/* DROPDOWN PANEL */}
                            {isDropdownOpen && (
                                <div className="mt-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 p-2 max-h-64 overflow-y-auto">

                                    {/* SEARCH INPUT */}
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                        className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                    />

                                    {/* USER LIST */}
                                    {filteredUsers.length === 0 ? (
                                        <p className="text-sm text-gray-500 px-2">No users found</p>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => toggleUser(user.id)}
                                                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all mb-1
              ${selectedUsers.includes(user.id)
                                                        ? "bg-blue-100 dark:bg-blue-900/30"
                                                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    }
            `}
                                            >
                                                <div>
                                                    <p className="text-sm font-medium dark:text-white">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {user.workingAs || "Employee"}
                                                    </p>
                                                </div>

                                                {selectedUsers.includes(user.id) && (
                                                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <svg
                                                            className="w-3 h-3 text-white"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Calendar size={16} />
                                    Create Meeting
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}