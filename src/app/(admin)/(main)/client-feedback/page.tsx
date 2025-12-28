"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Star, Plus } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/common/Loading";

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
      </div>

      {loading ? (
        <div className="flex justify-center w-full h-[60vh] items-center">
          <Loader />
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
    </div>
  );
}
