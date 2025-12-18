"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Plus, Clock, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminMeetRequests() {
  const [meetRequests, setMeetRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [meetLink, setMeetLink] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ reason: "", meetDate: "", meetTime: "", duration: 30 });
  const [userRole, setUserRole] = useState(false);

  useEffect(() => {
    fetchMeetings();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    const userResponse = await fetch('/api/user');
    const userData = await userResponse.json();

    const adminStatus: boolean = userData.user && userData.user.role === 'ADMIN';
    setUserRole(adminStatus);
  };

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

  const approveHandler = (id: string) => {
    setSelectedId(id);
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

  const submitMeetLink = async () => {
    if (!selectedId || !meetLink) return;

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

  const submitMeetingRequest = async () => {
    if (!newMeeting.reason || !newMeeting.meetDate || !newMeeting.meetTime) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const res = await fetch('/api/client/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeeting)
      });
      if (res.ok) {
        toast.success('Meeting request submitted successfully');
        setShowRequestModal(false);
        setNewMeeting({ reason: "", meetDate: "", meetTime: "", duration: 30 });
        fetchMeetings();
      }
    } catch (error) {
      toast.error('Failed to submit meeting request');
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
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {meetRequests.map((m) => (
            <div
              key={m.id}
              className="
              bg-white dark:bg-gray-900 p-4 rounded-xl
              border border-gray-200 dark:border-gray-800
              shadow-sm hover:shadow-md transition-all
            "
            >
              {/* Title row */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {m.reason}
                </h3>
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
                    {new Date(m.meetDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Clock size={16} className="text-green-500" />
                    {m.meetTime} ({m.duration}min)
                  </div>
                  {m.client && (
                    <span className="text-sm text-gray-500">
                      by {m.client.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">

                  {m.status === "approved" ? (
                    <a
                      href={m.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer text-sm bg-sky-500 px-3 py-1 rounded-lg text-white hover:bg-sky-600 transition"
                    >Join Meeting</a>
                  ) : null}

                  {userRole && m.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveHandler(m.id)}
                        className="px-3 py-1 rounded-lg text-sm bg-blue-600/30 text-blue-700 hover:bg-blue-600/40 transition"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => rejectHandler(m.id)}
                        className="px-3 py-1 rounded-lg text-sm bg-red-600/30 text-red-700 hover:bg-red-600/40 transition"
                      >
                        Reject
                      </button>
                    </div>
                  ) : null}

                  {m.status === "rejected" ? (
                    <span
                      className="px-3 py-1 rounded-lg text-sm bg-red-600/30 text-red-700 hover:bg-red-600/40 transition"
                    >
                      Rejected
                    </span>
                  ) : null}

                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Meeting Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Request New Meeting</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Meeting reason/topic"
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
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={submitMeetingRequest}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
              >
                Submit Request
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
    </div>
  );
}
