"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Star, Plus, LucideTrash2 } from "lucide-react";
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
          {feedbacks.length > 0 ? feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="bg-white relative dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all"
            >
              <div className="absolute right-2 top-4 w-8 h-8">
                <LucideTrash2 className="text-red-400 hover:text-red-600 cursor-pointer" size={20} strokeWidth={1.3}/>
              </div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-blue-600" size={20} />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {fb.byName}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {fb.project}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {fb.message}
              </p>
            </div>
          )) : (
            <p className="text-center text-gray-400">No Feedbacks Provided.</p>
          )}
        </div>
      )}
    </div>
  );
}
