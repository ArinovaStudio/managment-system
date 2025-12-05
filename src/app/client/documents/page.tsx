"use client";

import React, { useState } from "react";
import { Upload, FileText, Download } from "lucide-react";

export default function ProjectDocuments() {
    const projects = ["E-Commerce App", "Portfolio Website", "Attendance System"];

    const [selectedProject, setSelectedProject] = useState("");
    const [documents, setDocuments] = useState([
        {
            id: 1,
            name: "Website-Plan.pdf",
            size: "1.2 MB",
            date: "2025-02-15",
            url: "#",
            project: "Portfolio Website",
        },
        {
            id: 2,
            name: "UI-Wireframe.png",
            size: "820 KB",
            date: "2025-02-20",
            url: "#",
            project: "E-Commerce App",
        },
    ]);

    const handleUpload = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const newDoc = {
            id: documents.length + 1,
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            date: new Date().toISOString().split("T")[0],
            url: "#",
            project: selectedProject,
        };

        setDocuments([...documents, newDoc]);
    };

    return (
        <div className="space-y-8">

            {/* Heading */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Project Documents
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Select a project and upload related documents.
                </p>
            </div>

            {/* Project Selector */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-800 dark:text-gray-300">
                    Select Project
                </label>
                <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="
                        w-full rounded-xl px-4 py-2.5
                        bg-white dark:bg-gray-900
                        border border-gray-300 dark:border-gray-700
                        text-gray-900 dark:text-gray-100
                        shadow-sm
                    "
                >
                    <option value="">-- Choose Project --</option>
                    {projects.map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>

            {/* Upload Box */}
            <label
                className={`
                    flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition
                    ${selectedProject
                        ? "border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        : "border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-800/40 cursor-not-allowed"}
                `}
            >
                <Upload
                    className={`
                        w-8 h-8
                        ${selectedProject ? "text-gray-500 dark:text-gray-400" : "text-gray-400 dark:text-gray-600"}
                    `}
                />

                <p
                    className={`
                        mt-2 font-medium
                        ${selectedProject ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}
                    `}
                >
                    {selectedProject ? "Click to upload document" : "Select a project to upload"}
                </p>

                <input
                    type="file"
                    disabled={!selectedProject}
                    className="hidden"
                    onChange={handleUpload}
                />
            </label>

            {/* Document List */}
            <div className="grid gap-4">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
                    >
                        {/* Icon + Info */}
                        <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />

                            <div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {doc.name}
                                </h3>

                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {doc.size} • Uploaded on {doc.date}
                                </p>

                                <p className="text-xs mt-1 font-medium text-blue-600 dark:text-blue-300">
                                    Project: {doc.project}
                                </p>
                            </div>
                        </div>

                        {/* Download Button */}
                        <a
                            href={doc.url}
                            target="_blank"
                            className="
                                flex items-center gap-2 text-sm font-medium px-4 py-2 
                                rounded-lg bg-blue-500/20 dark:bg-blue-400/20 
                                text-blue-600 dark:text-blue-300 
                                hover:bg-blue-500/30 dark:hover:bg-blue-400/30 
                                transition
                            "
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </a>
                    </div>
                ))}
            </div>

        </div>
    );
}
