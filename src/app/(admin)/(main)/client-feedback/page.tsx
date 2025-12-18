"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Star, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ type: "", rating: 5, desc: "", isAnynonyms: false });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/client/feedback');
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks);
      }
    } catch (error) {
      toast.error('Failed to fetch feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!newFeedback.type || !newFeedback.desc) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const res = await fetch('/api/client/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeedback)
      });
      if (res.ok) {
        toast.success('Feedback submitted successfully');
        setShowModal(false);
        setNewFeedback({ type: "", rating: 5, desc: "", isAnynonyms: false });
        fetchFeedbacks();
      }
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Client Feedbacks
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Feedback
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-blue-600" size={20} />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {fb.byName}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {fb.type} • Rating: {fb.rating}/10
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(Math.floor(fb.rating / 2))].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-500 fill-current" />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {fb.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Submit Feedback</h2>
            <div className="space-y-4">
              <select
                value={newFeedback.type}
                onChange={(e) => setNewFeedback({ ...newFeedback, type: e.target.value })}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select feedback type</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="General">General</option>
                <option value="Complaint">Complaint</option>
              </select>
              <div>
                <label className="block text-sm mb-2">Rating (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newFeedback.rating}
                  onChange={(e) => setNewFeedback({ ...newFeedback, rating: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{newFeedback.rating}/10</span>
              </div>
              <textarea
                placeholder="Your feedback..."
                value={newFeedback.desc}
                onChange={(e) => setNewFeedback({ ...newFeedback, desc: e.target.value })}
                className="w-full p-3 border rounded-lg h-24 dark:bg-gray-700 dark:border-gray-600"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newFeedback.isAnynonyms}
                  onChange={(e) => setNewFeedback({ ...newFeedback, isAnynonyms: e.target.checked })}
                />
                <span className="text-sm">Submit anonymously</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
