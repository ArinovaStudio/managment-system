"use client";

import React, { useState, useEffect } from "react";
import { Upload, FileText, Check, X, Eye, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
    const [addModal, setAddModal] = useState(false);
    const [newDoc, setNewDoc] = useState({ title: "", file: null, projectId: "" });

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/client/documents');
            const data = await res.json();
            if (data.success) {
                setDocuments(data.documents);
            }
        } catch (error) {
            toast.error('Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const addDocument = async () => {
        if (!newDoc.title || !newDoc.file) {
            toast.error('Please fill all fields');
            return;
        }

        const formData = new FormData();
        formData.append('title', newDoc.title);
        formData.append('file', newDoc.file);
        formData.append('projectId', newDoc.projectId);
        
        try {
            setLoading(true);
            const res = await fetch('/api/client/documents', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                toast.success('Document uploaded successfully');
                setAddModal(false);
                setNewDoc({ title: "", file: null, projectId: "" });
                fetchDocuments();
            }
        } catch (error) {
            toast.error('Failed to upload document');
        }
        finally {
            setLoading(false);
        }
    };

    const deleteDocument = async (id: string) => {
        if (!confirm('Delete this document?')) return;

        try {
            const res = await fetch('/api/client/documents', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                toast.success('Document deleted');
                fetchDocuments();
            }
        } catch (error) {
            toast.error('Failed to delete document');
        }
    };

    const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/project');
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects');
    }
    finally {
        setLoading(false);
    }
  };

      useEffect(() => {
        fetchDocuments();
        if (addModal) {
            fetchProjects();
        }
    }, [addModal]);


    return (
        <div className="space-y-10">

            {/* Heading */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Documents Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Client documents and manage all project files.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            Documents ({documents.length})
                        </h2>
                        <button
                            onClick={() => setAddModal(true)}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-2"
                        >
                            <Plus size={18} /> Add Document
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-blue-600" size={20} />
                                        <div>
                                            <p className="font-normal text-xs text-gray-500">{doc?.Projects.name} - {doc?.User.name}</p>
                                            <p className="font-medium text-gray-900 dark:text-white mb-1">{doc.title}</p>
                                            <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={doc.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 rounded-lg text-sm flex items-center gap-1 bg-blue-600/30 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 hover:bg-blue-600/40 dark:hover:bg-blue-500/30 transition"
                                        >
                                            <Eye size={16} /> View
                                        </a>
                                        <button
                                            onClick={() => deleteDocument(doc.id)}
                                            className="px-3 py-2 rounded-lg text-sm flex items-center gap-1 bg-red-600/30 text-red-700 dark:bg-red-500/20 dark:text-red-300 hover:bg-red-600/40 dark:hover:bg-red-500/30 transition"
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}


            {addModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-[9999]">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-lg">

                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Add New Document
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Document Title</label>
                                <input
                                    type="text"
                                    value={newDoc.title}
                                    onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                                    className="w-full p-3 mt-1 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter document title"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Select Project</label>
                            <select
                                value={newDoc.projectId}
                                onChange={(e) => setNewDoc({ ...newDoc, projectId: e.target.value })}
                                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                <option value="" disabled={loading}>{loading ? "Loading..." : "Select project"}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">Upload File</label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                    onChange={(e) => setNewDoc({ ...newDoc, file: e.target.files?.[0] || null })}
                                    className="w-full p-3 mt-1 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Supported: PDF, DOC, DOCX, JPG, PNG, TXT</p>
                            </div>
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
                                onClick={loading ? () => {} : addDocument}
                                disabled={!newDoc.title || !newDoc.file || !newDoc.projectId || loading}
                                className={`px-4 py-2 rounded-lg text-sm text-white ${
                                    !newDoc.title || !newDoc.file
                                        ? "bg-blue-600/40 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                                {loading ? "Uploading..." : "Add Document"}
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}
