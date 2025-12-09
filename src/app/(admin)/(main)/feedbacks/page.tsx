"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, IdCard, Send } from "lucide-react";
import Wrapper from "@/layout/Wrapper";
import toast from "react-hot-toast";

export default function FeedbackForm() {
  const [anonymous, setAnonymous] = useState(false);
  const [feedbackType, setFeedbackType] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'view' | 'give'>('view');
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/user', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          if (data.user?.role === 'ADMIN') {
            setIsAdmin(true);
            await fetchEmployees();
            await fetchAllFeedbacks();
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    }
    fetchUser();
  }, []);

  const fetchAllFeedbacks = async () => {
    try {
      const response = await fetch('/api/feedbacks?all=true');
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.feedbacks || []);
      }
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/feedbacks?employees=true', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      } else {
        console.error('Failed to fetch employees:', response.status);
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAdmin && !selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }
    
    setLoading(true);
    
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
          byName: isAdmin ? `Admin: ${user?.name}` : (anonymous ? "Anonymous" : user?.name || "Unknown"),
          byEmpId: isAdmin ? (user?.employeeId || 'ADMIN') : (anonymous ? "Hidden" : user?.employeeId || "Unknown"),
          employeeId: isAdmin ? selectedEmployee : null,
          isAdminFeedback: isAdmin
        })
      });
      
      if (response.ok) {
        toast.success(isAdmin ? 'Feedback sent to employee successfully!' : 'Feedback submitted successfully!');
        setFeedbackType('');
        setRating(null);
        setDescription('');
        setSelectedEmployee('');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Error submitting feedback');
    } finally {
      setLoading(false);
    }
  };

  const selectedEmp = employees.find(emp => emp.id === selectedEmployee);

  return (
      <div className={`min-h-[75vh] rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-6`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {isAdmin ? 'Send Feedback to Employee' : 'Employee Feedback'}
        </h2>

        {/* Anonymous toggle - only for employees */}
        {!isAdmin && (
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
        )}
        
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode('view')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'view' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              View Feedbacks
            </button>
            <button 
              onClick={() => setViewMode('give')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'give' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Give Feedback
            </button>
          </div>
        )}
      </div>

      {isAdmin && viewMode === 'view' ? (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">All Feedbacks</h3>
          {feedbacks.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No feedbacks yet</p>
          ) : (
            <div className="grid gap-4">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-white/[0.05]">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {fb.type}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{fb.byName}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({fb.byEmpId})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < fb.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{fb.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 max-w-2xl mx-auto"
        >
        {/* Employee Selection - Admin only */}
        {isAdmin && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Employee
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900/80 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose an employee</option>
                {employees.map((emp, index) => {
                  return (
                    <option key={emp.id} value={emp.id}>
                      {emp.name || 'No Name'} ({emp.employeeId || 'No ID'})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selected Employee Info */}
            {selectedEmp && (
              <div className="bg-gray-50 dark:bg-white/[0.05] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sending feedback to:
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    <span className="text-gray-800 dark:text-gray-200">{selectedEmp.name || 'No Name'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IdCard size={16} className="text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">{selectedEmp.employeeId || 'No ID'}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Feedback Type */}
        <div >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Feedback Type
          </label>
          <select
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900/80  text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value="">Select a category</option>
            {isAdmin ? (
              <>
                <option value="Performance">Performance</option>
                <option value="Communication">Communication</option>
                <option value="Teamwork">Teamwork</option>
                <option value="Initiative">Initiative</option>
                <option value="Quality of Work">Quality of Work</option>
                <option value="Professional Development">Professional Development</option>
                <option value="Other">Other</option>
              </>
            ) : (
              <>
                <option value="Work Culture">Work Culture</option>
                <option value="Management">Management</option>
                <option value="Workload">Workload</option>
                <option value="Communication">Communication</option>
                <option value="Tools & Resources">Tools & Resources</option>
                <option value="Other">Other</option>
              </>
            )}
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
                    ? isAdmin ? "bg-blue-600 text-white border-blue-600" : "bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-gray-900"
                    : "border-gray-400 text-gray-600 dark:text-gray-300 hover:border-blue-400"
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
            placeholder={isAdmin ? "Provide detailed feedback for the employee..." : "Describe your feedback in detail..."}
          />
        </div>

        {/* Name & ID - only for employees */}
        {!isAdmin && (
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
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 ${
              isAdmin 
                ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400" 
                : "bg-blue-400/20 text-blue-600 dark:bg-white dark:text-gray-900 hover:bg-blue-500 hover:text-white dark:hover:bg-white/90"
            } disabled:cursor-not-allowed`}
          >
            {isAdmin && <Send size={16} />}
            {loading ? 'Sending...' : (isAdmin ? 'Send Feedback' : 'Submit Feedback')}
          </motion.button>
        </div>
      </form>
      )}
      </div>
  );
}
