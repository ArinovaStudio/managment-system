"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Calendar, Plus, Clock, Trash2, LucideLoader2, LucideLoader } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/common/Loading";

export default function AdminMeetRequests() {
  const [meetRequests, setMeetRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [meetLink, setMeetLink] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ adminName: "", clientId: "", projectId: "", meetLink: "", reason: "", meetDate: "", meetTime: "", duration: 30 });
  const [userRole, setUserRole] = useState(false);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [clients, setClients] = useState([])
  const [project, setProjects] = useState([])
  const [transition, startTransition] = useTransition()
  const [projectTransition, startProject] = useTransition()
  const [creating, setCreating] = useState(false)

  const checkUserRole = async () => {
    const userResponse = await fetch('/api/user');
    const userData = await userResponse.json();
    const adminStatus: boolean = userData.user && userData.user.role === 'ADMIN';
    
    setNewMeeting(prev => ({
    ...prev,
    adminName: userData.user.name,
  }));

    setUserRole(adminStatus);
  };

  const getClients = () => startTransition(async () => {
    const clients = await fetch("/api/admin/getRoleWise?role=CLIENT")
    const data = await clients.json()
    setClients(data.users)
  })

  const getProjects = (id: string) => startProject(async () => {
    const res = await fetch(`/api/feedbacks/clientprojectfetch?userId=${id}`);
    const data = await res.json();
    setProjects(data.projects || []);
  })

  
  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/client/meeting');
      const data = await res.json();
      if (data.success) {
        setMeetRequests(data.meetings);
      }
    } catch (error) {
      toast.error('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };


  const submitMeetLink = async () => {
    if (!selectedId) return;

    try {
      const res = await fetch('/api/client/meeting', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId, status: 'approved', meetLink })
      });
      if (res.ok) {
        toast.success('Meeting approved');
        setOpenModal(false);
        setMeetLink("");
        fetchMeetings();
      }
    } catch (error) {
      toast.error('Failed to approve meeting');
    }
  };

  const approveHandler = (id: string, meetLink: string | null) => {
    setSelectedId(id);
  if (meetLink) {
    submitMeetLink()
    return
  }
  setOpenModal(true);
  };

  const rejectHandler = async (id: string) => {
    try {
      const res = await fetch('/api/client/meeting', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'rejected' })
      });
      if (res.ok) {
        toast.success('Meeting rejected');
        fetchMeetings();
      }
    } catch (error) {
      toast.error('Failed to reject meeting');
    }
  };


  const submitMeetingRequest = async () => {
    if (!newMeeting.reason || !newMeeting.clientId || !newMeeting.projectId || !newMeeting.meetDate || !newMeeting.meetTime) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setCreating(true)
      const res = await fetch('/api/client/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeeting)
      });
      if (res.ok) {
        toast.success('Meeting request submitted & Mail sent.');
        setShowRequestModal(false);
        setNewMeeting({ clientId: "", projectId: "", reason: "", meetDate: "", meetTime: "", meetLink: "", duration: 30, adminName: '' });
        fetchMeetings();
      }
    } catch (error) {
      toast.error('Failed to submit meeting request');
    } finally {
      setCreating(false)
    }
  };

  const deleteMeeting = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;

    try {
      const res = await fetch('/api/client/meeting', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        toast.success('Meeting deleted successfully');
        fetchMeetings();
      }
    } catch (error) {
      toast.error('Failed to delete meeting');
    }
  };

  const getMeetingStartTime = (meetDate: string, meetTime: string) => {
    const [hours, minutes] = meetTime.split(":").map(Number);
    const date = new Date(meetDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };


  function toAmPm(time24: string): string {
  if (!time24) return ""

  const [hourStr, minute] = time24.split(":")
  let hour = Number(hourStr)

  if (isNaN(hour)) return time24

  const period = hour >= 12 ? "PM" : "AM"
  hour = hour % 12 || 12

  return `${hour}:${minute} ${period}`
}


  const now = new Date();
  const isActive = activeMeetingId === hoveredId;

  useEffect(() => {
    fetchMeetings();
    checkUserRole();
  }, []);

  useEffect(() => {
    if (showRequestModal) {
      getClients()
    }
  }, [showRequestModal])

  useEffect(() => {
    if (newMeeting.clientId) {
      getProjects(newMeeting.clientId)
    }
  }, [newMeeting.clientId])

  useEffect(() => {
    if (!activeMeetingId) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeMeetingId]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (activeMeetingId) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);

    
  }, [activeMeetingId]);


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Meeting Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            View and manage client meeting requests.
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Request Meeting
        </button> 
      </div>

      {loading ? (
        <div className="flex justify-center w-full h-[60vh] items-center">
          <Loader />
        </div>
      ) : (
        <div className="grid gap-4">
          {meetRequests.length > 0 ? meetRequests.map((m) => (
            <div
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}
              key={m.id}
              onClick={() => {
                if (isActive) {
                  window.open(`/memo?meetingId=${activeMeetingId}&seconds=${elapsedSeconds}`, "_blank", "noopener,noreferrer");
                };
              }}
              className=
              {` bg-white dark:bg-gray-900 p-4 rounded-xl
              border border-gray-200 dark:border-gray-800
              shadow-sm transition-all ${isActive
                  ? " hover:shadow-md hover:scale-101 cursor-pointer"
                  : "cursor-default"}`}

            >
              <div>
                {/* Title row */}
                <div className="flex justify-between items-start">
                  <div className="">
                  <p className="text-sm text-gray-400">
                    {m?.project?.name}
                  </p>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {m.reason}
                  </h3>
                  {m.client && (
                      <span className="text-sm text-gray-500">
                        By {m?.createdBy ? m.createdBy : m.client.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {userRole && (
                      <button
                        onClick={() => deleteMeeting(m.id)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Calendar size={16} className="text-blue-500" />
                      {new Date(m.meetDate).toDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Clock size={16} className="text-green-500" />
                      {toAmPm(m.meetTime)} ({m.duration}min)
                    </div>
                  </div>

                  <div className="flex items-center gap-2">

                    {/* {m.status === "approved" ? (
                    <a
                      href={m.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer text-sm bg-sky-500 px-3 py-1 rounded-lg text-white hover:bg-sky-600 transition"
                    >Join Meeting</a>
                  ) : null} */}

                    {m.status === "approved" && (() => {
                      const meetingStart = getMeetingStartTime(m.meetDate, m.meetTime);
                      const hasStarted = now >= meetingStart;

                      return hasStarted ? (
                        (activeMeetingId === m.id ? (
                          <span className="text-sm font-semibold text-green-600">
                            Meeting running •{" "}
                            {Math.floor(elapsedSeconds / 60)}:
                            {(elapsedSeconds % 60).toString().padStart(2, "0")}
                          </span>
                        ) : (
                          <a
                            href={m.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              setActiveMeetingId(m.id);
                              setElapsedSeconds(0);
                            }}
                            className="cursor-pointer text-sm bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-700 transition"
                          >
                            Join Meeting
                          </a>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 italic">
                          Please wait, meeting has not started yet
                        </span>
                      );
                    })()}


                    {userRole && m.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveHandler(m.id, m?.meetingLink)}
                          className="px-3 py-1 rounded-lg text-sm bg-blue-400/20 text-blue-400 hover:bg-blue-600/40 transition"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => rejectHandler(m.id)}
                          className="px-3 py-1 rounded-lg text-sm bg-red-400/20 text-red-400 hover:bg-red-600/40 transition"
                        >
                          Reject
                        </button>
                      </div>
                    ) : null}

                    {m.status === "rejected" ? (
                      <span
                        className="px-3 py-1 rounded-lg text-sm bg-red-400/20 text-red-400 hover:bg-red-600/40 transition"
                      >
                        Rejected
                      </span>
                    ) : null}

                  </div>

                </div>
              </div>
            </div>
          )) : <p className="text-gray-400 text-center">No Meetings are schuduled</p>}
        </div>
      )}

      {/* Request Meeting Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Request New Meeting</h2>
            <div className="space-y-4">
              <select
                value={newMeeting.clientId}
                onChange={(e) => setNewMeeting({ ...newMeeting, clientId: e.target.value})}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                {
                  transition ? <option value="">Loading...</option> : clients.length > 0 && clients.map((items, index) => (
                    <React.Fragment key={index}>
                    <option disabled value="">Select Client</option>
                    <option key={index} value={items.id}>{items.name} - {items.email}</option>
                    </React.Fragment>
                  ))
                }
              </select>

            <select
                disabled={project.length > 0 ? false : true}
                value={newMeeting.projectId}
                onChange={(e) => setNewMeeting({ ...newMeeting, projectId: e.target.value})}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                {
                  projectTransition ? <option value="">Loading...</option> : project.length > 0 ? project.map((items, index) => (
                    <React.Fragment key={index}>
                    
                    <option disabled value="">Select</option>
                    <option key={index} value={items.project.id}>{items.project.name}</option>
                    </React.Fragment>
                  )) : (
                    <option value="" disabled className="cursor-not-allowed">Select Client First</option>
                  )
                }
              </select>

              <input
                type="text"
                placeholder="Explain why you want to have meet?"
                value={newMeeting.reason}
                onChange={(e) => setNewMeeting({ ...newMeeting, reason: e.target.value })}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <input
                type="date"
                value={newMeeting.meetDate}
                onChange={(e) => setNewMeeting({ ...newMeeting, meetDate: e.target.value })}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <input
                type="time"
                value={newMeeting.meetTime}
                onChange={(e) => setNewMeeting({ ...newMeeting, meetTime: e.target.value })}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
              <select
                value={newMeeting.duration}
                onChange={(e) => setNewMeeting({ ...newMeeting, duration: parseInt(e.target.value) })}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
              </select>

              <input
                type="text"
                placeholder="Meeting Link i.e, https://meet.google.com"
                value={newMeeting.meetLink}
                onChange={(e) => setNewMeeting({ ...newMeeting, meetLink: e.target.value })}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={creating || !newMeeting.reason || !newMeeting.clientId || !newMeeting.projectId || !newMeeting.meetDate || !newMeeting.meetTime || !newMeeting.duration}
                onClick={submitMeetingRequest}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed grid place-items-center"
              >
                {
                  creating ? <LucideLoader size={18} color="white" className="animate-spin" /> : "Submit Request"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-[9999]">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Approve Meeting & Send Link
            </h2>

            <input
              type="text"
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              placeholder="Paste Google Meet Link"
              className="
                w-full mt-1 rounded-lg border border-gray-300 dark:border-gray-700
                bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                p-3 focus:ring-2 focus:ring-blue-500 outline-none
              "
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={submitMeetLink}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INFO MODAL */}
      {showInfoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => setShowInfoModal(false)} // 👈 click outside closes
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()} // 👈 prevent closing when clicking inside
          >
            {/* Close (X) */}
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold">
              Meeting in progress
            </h2>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              A meeting is currently running. Please finish it before leaving this page.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
