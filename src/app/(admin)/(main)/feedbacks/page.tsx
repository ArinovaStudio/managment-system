"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, IdCard } from "lucide-react";
import Wrapper from "@/layout/Wrapper";

export default function FeedbackForm() {
  const [anonymous, setAnonymous] = useState(false);
  const [feedbackType, setFeedbackType] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/user', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    }
    fetchUser();
  }, []);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: feedbackType,
          rating,
          desc: description,
          isAnynonyms: anonymous,
          byName: anonymous ? "Anonymous" : user?.name || "Unknown",
          byEmpId: anonymous ? "Hidden" : user?.employeeId || "Unknown",
        })
      });
      
      if (response.ok) {
        alert('Feedback submitted successfully!');
        setFeedbackType('');
        setRating(null);
        setDescription('');
      } else {
        alert('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    }
  };

  return (
    <Wrapper>
      <div className={`min-h-[75vh] rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-6`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Employee Feedback
        </h2>

        {/* Anonymous toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Anonymous
          </span>
          <div
            onClick={() => setAnonymous((prev) => !prev)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
              anonymous ? "bg-gray-700" : "bg-gray-300"
            }`}
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 700, damping: 30 }}
              className={`w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                anonymous ? "translate-x-6 bg-white" : "translate-x-0 bg-gray-700"
              }`}
            />
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 max-w-2xl mx-auto"
      >
        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Feedback Type
          </label>
          <select
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="">Select a category</option>
            <option value="Work Culture">Work Culture</option>
            <option value="Management">Management</option>
            <option value="Workload">Workload</option>
            <option value="Communication">Communication</option>
            <option value="Tools & Resources">Tools & Resources</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rating
          </label>
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <motion.button
                key={num}
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRating(num)}
                className={`w-9 h-9 rounded-full border text-sm font-medium transition-all ${
                  rating === num
                    ? "bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-gray-900"
                    : "border-gray-400 text-gray-600 dark:text-gray-300"
                }`}
              >
                {num}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-800 dark:text-gray-200"
            placeholder="Describe your feedback in detail..."
          />
        </div>

        {/* Name (disabled) */}
        <div className="flex gap-6">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                disabled
                value={anonymous ? "Anonymous" : user?.name || "Loading..."}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Employee ID (disabled) */}
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Employee ID
            </label>
            <div className="relative">
              <IdCard className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                disabled
                value={anonymous ? "Hidden" : user?.employeeId || "Loading..."}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="px-5 py-2.5 rounded-md bg-blue-400/20 text-blue-600 dark:bg-white dark:text-gray-900 hover:bg-blue-500 hover:text-white dark:hover:bg-white/90 transition-colors"
          >
            Submit Feedback
          </motion.button>
        </div>
      </form>
      </div>
    </Wrapper>
  );
}
