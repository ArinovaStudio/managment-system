"use client";

import React, { useEffect, useState } from "react";
import { clientDemoData } from "../demodata"
import { Toaster, toast } from "react-hot-toast";

export default function ScheduleMeet() {
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [loading, setLoading] = useState(false);
  const [loadingfetch, setLoadingfetch] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const [meetings, setMeetings] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!reason || !date || !time) {
      toast.error('Please fill all fields');
      return;
    }
    const durationInt = Number(duration);

    if (isNaN(durationInt)) {
      toast.error('Please enter a valid duration');
      return;
    }

    try {
      const res = await fetch('/api/client/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, meetDate: date, meetTime: time, duration: durationInt , projectId: selectedProject })
      });
      if (res.ok) {
        toast.success('Meeting request submitted successfully');
        setReason("");
        setDate("");
        setTime("");
        setDuration("30");
        fetchMeetings();
      }
    } catch (error) {
      toast.error('Failed to submit meeting request');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async () => {
    setLoadingfetch(true);
    try {
      const res = await fetch('/api/client/meeting');
      const data = await res.json();
      if (data.success) {

        console.log("this is meetings", data.meetings);

        setMeetings(data.meetings);
      }
    } catch (error) {
      toast.error('Failed to fetch meetings');
    } finally {
      setLoadingfetch(false);
    }
  };

  const fetchUser = async () => {
    const res = await fetch("/api/user");
    const data = await res.json();



    if (data.user) {
      setUser(data.user);
      console.log(user);
    }
  };

  const fetchProject = async () => {
    const res = await fetch(`/api/feedbacks/clientprojectfetch?userId=${user?.id}`);
    const data = await res.json();
    console.log("this is project", data);

    setProjects(data.projects || []);
  };

  useEffect(() => {
    fetchMeetings();
    fetchUser();
  }, []);

  useEffect(() => {
    fetchProject();
  }, [user]);

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Schedule a Meeting
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Request a meeting with the admin or developer team.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-5"
      >
        {/* Reason */}
        <div>
          <label className="text-sm font-medium text-gray-800 dark:text-gray-300">
            Meeting Reason
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 100))}
            maxLength={50}
            minLength={50}
            placeholder="Explain why you want the meeting"
            required
            className="w-full mt-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="my-2 text-right text-xs text-neutral-400 dark:text-neutral-600">{reason.length}/100</p>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5">
            Project
          </label>

          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="
          w-full appearance-none rounded-xl px-4 py-2.5
          bg-white dark:bg-gray-900
          border border-gray-300 dark:border-gray-700
          text-gray-900 dark:text-gray-100
          transition-all duration-200
          shadow-sm
        "
            >
              <option value="">Select Project</option>

              {projects.map((proj) => (
                <option key={proj.id} value={proj.project.id}>
                  {proj.project.name}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-gray-300">
              Date
            </label>
            <input
              type="date"
              value={date}
              required
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-gray-300">
              Time
            </label>
            <input
              type="time"
              value={time}
              required
              onChange={(e) => setTime(e.target.value)}
              className="w-full mt-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-sm font-medium text-gray-800 dark:text-gray-300">
            Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full mt-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="1">1 hour</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all"
        >
          {loading ? "Submitting..." : "Request Meeting"}
        </button>
      </form>

      {/* Meeting List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Requested Meetings
        </h2>

        <div className="grid gap-4">
          {/* {meetings.map((m) => (
            <div
              key={m.id}
              className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {m.reason}
                </h3>

                <span
                  className={`px-3 py-1 text-xs rounded-full ${m.status === "approved"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                    }`}
                >
                  {m.status}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3">

                <div className="space-y-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Date: {m.meetDate}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Time: {m.meetTime}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Duration: {m.duration}
                  </p>
                </div>

                {m.status === "approved" && m.meetLink && (
                  <a
                    href={m.meetLink}
                    target="_blank"
                    className="
              px-4 py-2 rounded-lg text-sm font-medium
              bg-blue-500/30 text-blue-600
              dark:bg-blue-400/20 dark:text-blue-300
              hover:bg-blue-500/40 dark:hover:bg-blue-400/30
              transition
            "
                  >
                    Join
                  </a>
                )}
              </div>

            </div>
          ))} */}

          <div className="grid gap-4">
            {loadingfetch ? (
              <p className="text-center text-sm text-gray-500">
                Loading meetings...
              </p>
            ) : meetings.length === 0 ? (
              <p className="text-center text-sm text-gray-500">
                No meetings found
              </p>
            ) : (
              meetings.map((m) => (
                <div
                  key={m.id}
                  className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {m.reason}
                    </h3>

                    <span
                      className={`px-3 py-1 text-xs rounded-full ${m.status === "approved"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                        }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Date: {m.meetDate}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Time: {m.meetTime}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Duration: {m.duration}
                      </p>
                    </div>

                    {m.status === "approved" && m.meetLink && (
                      <a
                        href={m.meetLink}
                        target="_blank"
                        className="
                px-4 py-2 rounded-lg text-sm font-medium
                bg-blue-500/30 text-blue-600
                dark:bg-blue-400/20 dark:text-blue-300
                hover:bg-blue-500/40 dark:hover:bg-blue-400/30
                transition
              "
                      >
                        Join
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>


      </div>
    </div>
  );
}
