"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ProjectTabs from "@/components/project/projectTabs";
import TabContent from "@/components/project/TabContent";

export default function ProjectIdPage() {
  const { projectId }: any = useParams();
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId]);

  async function loadProject() {
    const res = await fetch(`/api/project/${projectId}`);
    const data = await res.json();
    if (data.success) setProject(data.project);
  }

  return (
    <div className="p-6">

      {/* === 11 TABS === */}
      <ProjectTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className=" gap-6 mt-6">
        {/* ===== LEFT BIG CONTENT AREA ===== */}
        <div className="">
          <TabContent activeTab={activeTab} project={project} />
        </div>

      </div>
    </div>
  );
}
