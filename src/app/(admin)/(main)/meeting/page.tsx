"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, User, AlertCircle, Plus, Users, Trash2 } from "lucide-react";
import CreateMeetingModal from "@/components/meetings/CreateMeetingModal";

interface Meeting {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  meetingLink?: string;
  createdBy: string | { name: string };
  attendees?: { user: { name: string } }[];
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMeetings = async () => {
    const userRes = await fetch('/api/user');
    const userData = await userRes.json();
    const admin = userData.user?.role === 'ADMIN';
    setIsAdmin(admin);

    const endpoint = admin ? '/api/meetings' : '/api/meetings/assigned';
    const res = await fetch(endpoint);
    const data = await res.json();

    if (data.success) {
      setMeetings(data.meetings);
    }
    setLoading(false);
  };

  const deleteMeeting = async (meetingId: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;
    
    setDeletingId(meetingId);
    try {
      const res = await fetch(`/api/meetings?id=${meetingId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setMeetings(meetings.filter(m => m.id !== meetingId));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isAdmin ? 'Upcoming Meetings' : 'My Upcoming Meetings'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isAdmin ? 'Manage and schedule team meetings' : 'View your scheduled meetings'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create Meeting
          </button>
        )}
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isAdmin ? 'No meetings scheduled' : 'No meetings assigned'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isAdmin ? 'Create your first meeting to get started' : "You don't have any upcoming meetings"}
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Create Meeting
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map(meeting => (
            <div
              key={meeting.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2">{meeting.title}</h3>
                <Calendar size={20} className="text-blue-600 flex-shrink-0" />
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{meeting.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock size={16} />
                  <span>
                    {new Date(meeting.scheduledAt).toLocaleString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                {isAdmin ? (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users size={16} />
                    <span>{meeting.attendees?.length || 0} attendees</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User size={16} />
                    <span>Organized by: <span className="text-blue-600 dark:text-blue-400 font-medium">{meeting.scheduledAt}</span></span>
                  </div>
                )}
              </div>

              {meeting.meetingLink && (
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Join Meeting
                </a>
              )}

              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created by: <span className="text-blue-600 dark:text-blue-400 font-medium">{typeof meeting.createdBy === 'object' ? meeting.createdBy.name : meeting.createdBy}</span>
                    </p>
                    <button
                      onClick={() => deleteMeeting(meeting.id)}
                      disabled={deletingId === meeting.id}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                      title="Delete meeting"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <CreateMeetingModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreated={fetchMeetings}
        />
      )}
    </div>
  );
}
