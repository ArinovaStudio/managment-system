"use client";

import { useEffect, useState } from "react";

interface Meeting {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  meetingLink?: string;
  createdBy: string | { name: string };
  attendees?: { user: { name: string } }[];
}

const UpcomingMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchMeetings = async () => {
    try {
      // 1. Get Logged-in User
      const userRes = await fetch("/api/user", {
        credentials: "include",
      });
      const userData = await userRes.json();

      const admin = userData.user?.role === "ADMIN";
      setIsAdmin(admin);

      // 2. Choose Correct API
      const endpoint = admin
        ? "/api/meetings"
        : "/api/meetings/assigned";

      const res = await fetch(endpoint, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        const now = new Date();

        // 3. FILTER ONLY UPCOMING MEETINGS
        const upcoming = data.meetings.filter((meeting: Meeting) => {
          return new Date(meeting.scheduledAt) > now;
        });

        setMeetings(upcoming);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] h-48">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Upcoming Meetings ({meetings.length})
      </h3>

      <div className="space-y-3 max-h-32 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading meetings...
          </p>
        ) : meetings.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No upcoming meetings
          </p>
        ) : (
          meetings.slice(0, 4).map((meeting) => (
            <div key={meeting.id} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {meeting.title}
              </span>

              {/* Proper date display */}
              <span className="text-xs text-gray-500">
                {new Date(meeting.scheduledAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingMeetings;
