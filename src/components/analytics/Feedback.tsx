import { useState, useEffect } from "react";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    async function fetchFeedbacks() {
      try {
        const response = await fetch('/api/feedbacks?userOnly=true', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setFeedbacks(data.feedbacks || []);
        }
      } catch (error) {
        console.error('Failed to fetch feedbacks:', error);
      }
    }
    fetchFeedbacks();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] h-48">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Feedback ({feedbacks.length})
      </h3>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {feedbacks.length > 0 ? (
          feedbacks.map((feedback, index) => (
            <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{feedback.type}:</span> {feedback.desc}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No feedback available</p>
        )}
      </div>
    </div>
  );
};

export default Feedback;