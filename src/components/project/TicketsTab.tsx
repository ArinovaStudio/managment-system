"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Plus, Trash2, User, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function TicketsTab({ projectId }: { projectId: string }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [newTicket, setNewTicket] = useState({
    reason: ""
  });

  useEffect(() => {
    if (projectId) {
      fetchTickets();
      fetchCurrentUser();
    }
  }, [projectId]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/project/ticket?projectId=${projectId}`);
      const data = await res.json();
      
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!newTicket.reason.trim()) {
      toast.error('Please describe the blockage issue');
      return;
    }

    if (!currentUser?.name) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setCreating(true);
      const res = await fetch('/api/project/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          reportedBy: currentUser.name,
          reason: newTicket.reason.trim()
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        setNewTicket({ reason: "" });
        await fetchTickets();
        toast.success('Blockage ticket created successfully!');
      } else {
        toast.error(data.message || 'Failed to create ticket');
      }
    } catch (err) {
      console.error("Failed to create ticket:", err);
      toast.error('Error creating ticket');
    } finally {
      setCreating(false);
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      const res = await fetch('/api/project/ticket', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId })
      });

      const data = await res.json();
      
      if (data.success) {
        await fetchTickets();
        toast.success('Ticket deleted successfully!');
      } else {
        toast.error(data.message || 'Failed to delete ticket');
      }
    } catch (err) {
      console.error("Failed to delete ticket:", err);
      toast.error('Error deleting ticket');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle size={24} />
          Project Blockage Tickets
        </h2>
        
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Report Blockage
        </button>
      </div>

      <p className="text-gray-600 dark:text-gray-400">
        Report impediments that are blocking project progress. Examples: waiting for designs, external dependencies, team member availability.
      </p>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No blockages reported</h3>
          <p className="text-gray-600 dark:text-gray-400">
            When team members face impediments, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket: any) => (
            <div
              key={ticket.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <AlertTriangle className="text-red-500 mt-1" size={20} />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Project Blockage Issue
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {ticket.reason}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>Reported by: {ticket.reportedBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {currentUser?.role === 'ADMIN' && (
                  <button
                    onClick={() => deleteTicket(ticket.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete Ticket"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report Project Blockage
            </h3>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Describe the blockage issue *
              </label>
              <textarea
                value={newTicket.reason}
                onChange={(e) => setNewTicket({ reason: e.target.value })}
                className="w-full px-3 py-2  dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 resize-none"
                rows={4}
                placeholder="e.g., Frontend development is blocked because the design team hasn't provided the final UI mockups for the dashboard page."
                disabled={creating}
              />
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Examples:</strong> Waiting for designs, external API issues, team member unavailable, missing requirements, dependency delays.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewTicket({ reason: "" });
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={createTicket}
                disabled={creating || !newTicket.reason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {creating ? 'Creating...' : 'Report Blockage'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}