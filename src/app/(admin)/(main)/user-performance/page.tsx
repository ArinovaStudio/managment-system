"use client";
import React, { useState, useEffect } from 'react';
import { User, Star, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const PerformanceRating = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [ratings, setRatings] = useState({
    newLearnings: 5,
    speed: 5,
    workQuality: 5,
    leaves: 5,
    communication: 5,
    feedback: 5
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const ratingFields = [
    { key: 'newLearnings', label: 'New Learnings', desc: 'Ability to learn and adapt to new technologies/processes' },
    { key: 'speed', label: 'Speed', desc: 'Task completion speed and efficiency' },
    { key: 'workQuality', label: 'Work Quality', desc: 'Quality and accuracy of delivered work' },
    { key: 'leaves', label: 'Attendance', desc: 'Punctuality and attendance record' },
    { key: 'communication', label: 'Communication', desc: 'Communication skills and team collaboration' },
    { key: 'feedback', label: 'Feedback Reception', desc: 'How well they receive and implement feedback' }
  ];


  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/getRoleWise?role=EMPLOYEE', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUser(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
    finally {
      setLoading(false)
    }
  };

  const fetchPeformance = async (id: string) => {
    try {
      const response = await fetch(`/api/performace?userId=${id}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        
        setRatings(data.ratings[0])
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleRatingChange = (field: string, value: number) => {
    setRatings(prev => ({ ...prev, [field]: value }));
  };


  useEffect(() => {
    fetchUser();
    // fetchPeformance();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchPeformance(selectedEmployee)
    }
  }, [selectedEmployee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/performace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          employeeId: selectedEmployee,
          ...ratings,
          ratedBy: 'Admin'
        })
      });

      if (response.ok) {
        toast.success('Performance rating submitted successfully!');
        setSelectedEmployee('');
        setRatings({
          newLearnings: 5,
          speed: 5,
          workQuality: 5,
          leaves: 5,
          communication: 5,
          feedback: 5
        });
      } else {
        toast.error('Failed to submit rating');
      }
    } catch (error) {
      toast.error('Error submitting rating');
    } finally {
      setLoading(false);
    }
  };

  const selectedEmp = employees.find(emp => emp.id === selectedEmployee);

  return (
    <div className="min-h-[75vh] rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-6">
      <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
          Employee Performance Rating
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
          Rate employee performance on a scale of 1 (Poor) to 10 (Excellent)
            </p>
          </div>
          
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        {/* Employee Selection */}
        <div className="bg-gray-50 dark:bg-white/[0.05] p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Employee
          </label>
          {/* {} */}
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900/80 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{loading ? 'Loading...' : 'Choose an employee'}</option>
            {!loading && user?.length > 0 && user.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.employeeId})
              </option>
            ))}
          </select>
          
          {selectedEmp && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User size={16} />
              <span>Rating for: {selectedEmp.name} - {selectedEmp.email}</span>
            </div>
          )}
        </div>

        {/* Rating Fields */}
        <div className="grid gap-6">
          {ratingFields.map((field) => (
            <div key={field.key} className="bg-gray-50 dark:bg-white/[0.05] p-4 rounded-lg">
              <div className="mb-3">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  {field.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {field.desc}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleRatingChange(field.key, num)}
                      className={`w-10 h-10 rounded-full border text-sm font-medium transition-all ${
                        ratings[field.key as keyof typeof ratings] === num
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-400" size={20} />
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">
                    {ratings[field.key as keyof typeof ratings]}/10
                  </span>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>1-3: Poor</span> • <span>4-6: Average</span> • <span>7-8: Good</span> • <span>9-10: Excellent</span>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading || !selectedEmployee}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Send size={16} />
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
        </form>
    </div>
  );
};

export default PerformanceRating;