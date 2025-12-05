"use client";

import React, { useState } from "react";
import { Upload, FileText, Check, X } from "lucide-react";

export default function AdminDocuments() {
    const [pendingDocs, setPendingDocs] = useState([
        {
            id: 1,
            client: "Aritra Dhank",
            project: "Dashboard UI",
            fileName: "requirements.pdf",
            uploadedAt: "2025-02-10",
        },
        {
            id: 2,
            client: "John Doe",
            project: "API System",
            fileName: "api-schema.docx",
            uploadedAt: "2025-02-11",
        },
    ]);

    const [approvedDocs, setApprovedDocs] = useState([
        {
            id: 10,
            project: "E-Commerce App",
            fileName: "ui-wireframe.pdf",
            uploadedAt: "2025-01-28",
        },
    ]);

    // Modal control
    const [addModal, setAddModal] = useState(false);
    const [newProject, setNewProject] = useState("");
    const [newFile, setNewFile] = useState<File | null>(null);

    const approveDoc = (id: number) => {
        const doc = pendingDocs.find((d) => d.id === id);
        if (!doc) return;

        setApprovedDocs((prev) => [
            ...prev,
            { id: Date.now(), project: doc.project, fileName: doc.fileName, uploadedAt: doc.uploadedAt },
        ]);

        setPendingDocs((prev) => prev.filter((d) => d.id !== id));
    };

    const rejectDoc = (id: number) => {
        setPendingDocs((prev) => prev.filter((d) => d.id !== id));
    };

    const addDocument = () => {
        if (!newProject || !newFile) return;

        setApprovedDocs((prev) => [
            ...prev,
            {
                id: Date.now(),
                project: newProject,
                fileName: newFile.name,
                uploadedAt: new Date().toISOString().split("T")[0],
            },
        ]);

        setNewProject("");
        setNewFile(null);
        setAddModal(false);
    };

    return (
        <div className="space-y-10">

            {/* Heading */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Documents Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Approve client documents and manage all project files.
                </p>
            </div>

            {/* Pending Documents */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Pending Approval
                    </h2>
                </div>

                <div className="grid gap-4">
                    {pendingDocs.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No pending documents.
                        </p>
                    )}

                    {pendingDocs.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{doc.fileName}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {doc.project} — Uploaded by {doc.client}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        {doc.uploadedAt}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => approveDoc(doc.id)}
                                        className="
      px-3 py-2 rounded-lg text-sm flex items-center gap-1
      bg-green-600/30 text-green-700
      dark:bg-green-500/20 dark:text-green-300
      hover:bg-green-600/40 dark:hover:bg-green-500/30
      transition
    "
                                    >
                                        <Check size={16} /> Approve
                                    </button>

                                    <button
                                        onClick={() => rejectDoc(doc.id)}
                                        className="
      px-3 py-2 rounded-lg text-sm flex items-center gap-1
      bg-red-600/30 text-red-700
      dark:bg-red-500/20 dark:text-red-300
      hover:bg-red-600/40 dark:hover:bg-red-500/30
      transition
    "
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Project Documents */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Project Documents
                    </h2>

                    <button
                        onClick={() => setAddModal(true)}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-2"
                    >
                        <Upload size={18} /> Add Document
                    </button>
                </div>

                <div className="grid gap-4">
                    {approvedDocs.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex justify-between items-center"
                        >
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{doc.fileName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{doc.project}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">{doc.uploadedAt}</p>
                            </div>

                            <FileText className="text-gray-600 dark:text-gray-400" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Add Document Modal */}
            {/* Add Document Modal */}
            {addModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-[9999]">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-lg">

                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Add New Document
                        </h2>

                        {/* Project Selector */}
                        <label className="text-sm text-gray-600 dark:text-gray-400">Select Project</label>
                        <select
                            value={newProject}
                            onChange={(e) => setNewProject(e.target.value)}
                            className="
          w-full p-3 mt-1 rounded-lg bg-gray-50 dark:bg-gray-800
          border border-gray-300 dark:border-gray-700
          text-gray-900 dark:text-white
          focus:ring-2 focus:ring-blue-500 outline-none
        "
                        >
                            <option value="">-- Select a project --</option>
                            <option value="Dashboard UI">Dashboard UI</option>
                            <option value="API System">API System</option>
                            <option value="E-Commerce App">E-Commerce App</option>
                            <option value="Portfolio Website">Portfolio Website</option>
                        </select>

                        {/* File Upload (Disabled until project selected) */}
                        <div className="mt-4">
                            <label className="text-sm text-gray-600 dark:text-gray-400">Upload File</label>

                            <input
                                type="file"
                                disabled={!newProject}
                                onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                                className={`
            w-full p-3 mt-1 rounded-lg 
            bg-gray-50 dark:bg-gray-800
            border border-gray-300 dark:border-gray-700
            text-gray-900 dark:text-white
            ${!newProject ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
          `}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setAddModal(false)}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg text-sm"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={addDocument}
                                disabled={!newProject || !newFile}
                                className={`
            px-4 py-2 rounded-lg text-sm text-white
            ${!newProject || !newFile
                                        ? "bg-blue-600/40 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                    }
          `}
                            >
                                Add Document
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}
