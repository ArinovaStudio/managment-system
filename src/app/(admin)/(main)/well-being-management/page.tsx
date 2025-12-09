"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Users, Activity, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function page() {
    const [wellBeingData, setWellBeingData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("list");
    const [newTip, setNewTip] = useState({ title: "", description: "", category: "" });
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetchUser();
        fetchWellBeingData();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/user', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setIsAdmin(data.user?.role === 'ADMIN');
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    const fetchWellBeingData = async () => {
        try {
            const response = await fetch('/api/well-being', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                // Map the data to match expected structure
                const mappedData = (data.wellBeing || []).map(item => ({
                    ...item,
                    description: item.answer || item.description,
                    category: item.category || 'General'
                }));
                setWellBeingData(mappedData);
            }
        } catch (error) {
            console.error('Failed to fetch well-being data:', error);
        }
    };

    const createTip = async () => {
        if (!newTip.title.trim() || !newTip.description.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/well-being', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title: newTip.title,
                    answer: newTip.description,
                    description: newTip.description,
                    category: newTip.category
                })
            });

            if (response.ok) {
                toast.success('Well-being tip created successfully!');
                setShowModal(false);
                setNewTip({ title: "", description: "", category: "" });
                await fetchWellBeingData();
            } else {
                toast.error('Failed to create tip');
            }
        } catch (error) {
            console.error('Error creating tip:', error);
            toast.error('Error creating tip');
        } finally {
            setLoading(false);
        }
    };

    const deleteTip = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this tip?')) return;

        try {
            const response = await fetch('/api/well-being', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id })
            });

            if (response.ok) {
                toast.success('Tip deleted successfully!');
                await fetchWellBeingData();
            } else {
                toast.error('Failed to delete tip');
            }
        } catch (error) {
            console.error('Error deleting tip:', error);
            toast.error('Error deleting tip');
        }
    };

    const filteredData = wellBeingData.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Admin interface
    if (isAdmin) {
        return (
            <div className="min-h-[75vh] rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Activity className="text-blue-600" size={24} />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Well-being Management</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={16} />
                            Add Tip
                        </button>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users size={16} />
                            {wellBeingData.length} Total tips
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search tips..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode("list")}
                                className={`px-3 py-2 text-sm ${viewMode === "list"
                                    ? "bg-blue-600 text-white"
                                    : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                List view
                            </button>

                            <button
                                onClick={() => setViewMode("card")}
                                className={`px-3 py-2 text-sm ${viewMode === "card"
                                    ? "bg-blue-600 text-white"
                                    : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                Card view
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className={viewMode === "card" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
                    {filteredData.map((item, index) => (
                        <div
                            key={item.id || index}
                            className={`border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all ${viewMode === "card" ? "" : "flex items-center justify-between"
                                }`}
                        >
                            {viewMode === "card" ? (
                                <>
                                    <div className="flex items-start justify-between mb-3">

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => deleteTip(item.id)}
                                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {item.title || 'Untitled'}
                                    </h3>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                                        {item.description || 'No description'}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 flex-1">

                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                {item.title || 'Untitled'}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md">
                                                {item.description || 'No description'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">
                                            {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() => deleteTip(item.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {filteredData.length === 0 && (
                    <div className="text-center py-12">
                        <Activity className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No well-being tips found</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first well-being tip to get started.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add First Tip
                        </button>
                    </div>
                )}

                {/* Create Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Create Well-being Tip
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={newTip.title}
                                        onChange={(e) => setNewTip({ ...newTip, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="Enter tip title..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={newTip.category}
                                        onChange={(e) => setNewTip({ ...newTip, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select category</option>
                                        <option value="Mental">Mental Health</option>
                                        <option value="Physical">Physical Health</option>
                                        <option value="Nutrition">Nutrition</option>
                                        <option value="Sleep">Sleep</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={newTip.description}
                                        onChange={(e) => setNewTip({ ...newTip, description: e.target.value })}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        placeholder="Enter tip description..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setNewTip({ title: "", description: "", category: "" });
                                    }}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createTip}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                >
                                    {loading ? 'Creating...' : 'Create Tip'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
};
