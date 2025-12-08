"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, User2, Crown } from "lucide-react";

export default function TeamTab({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/project/member?projectId=${projectId}`);
      const data = await res.json();

      if (data.success) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error("Team Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, role: string, isLeader: boolean) => {
    try {
      await fetch(`/api/project/member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, userId, role, isLeader }),
      });

      fetchMembers(); // refresh UI
    } catch (err) {
      console.error("Update Failed:", err);
    }
  };

  if (loading) {
    return <p className="text-gray-400">Loading team...</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Project Team</h2>

      {members.length === 0 && (
        <p className="text-gray-400">No team members added yet.</p>
      )}

      <div className="space-y-4">
        {members.map((m: any) => (
          <div
            key={m.id}
            className="p-5 bg-white  dark:bg-gray-800/50 border border-gray-400 rounded-xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold dark:text-white">{m.user.name}</p>

                <p className="dark:text-gray-400 text-sm">
                  <span className="font-medium">{m.role || "Not assigned"}</span>
                </p>

                {m.isLeader && (
                  <p className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mt-1">
                    <Crown size={18} /> Team Leader
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                {/* SET LEADER */}
                <button
                  onClick={() => updateRole(m.userId, m.role || "Member", true)}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs ${
                    m.isLeader
                      ? "bg-yellow-400/70 text-black"
                      : "bg-gray-400/30 text-white"
                  }`}
                >
                  <ShieldCheck size={14} />
                  {m.isLeader ? "Leader" : "Make Leader"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
