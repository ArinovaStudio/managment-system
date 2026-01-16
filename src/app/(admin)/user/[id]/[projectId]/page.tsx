"use client";

import ClientDashboard from '@/components/clients/Dashboard'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const page = () => {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetch(`/api/project/${projectId}`)
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setData(result.dashboardData);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Project not found</div>;

  return (
    <div>
      <ClientDashboard data={data} />
    </div>
  )
}

export default page