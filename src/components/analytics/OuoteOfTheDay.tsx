"use client";

import { useEffect, useState } from "react";

interface QuoteData {
  quote: string;
  author: string;
}

const QuoteOfTheDay = () => {
  const [data, setData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuote = async () => {
    try {
      const res = await fetch("/api/quotes?selected=true", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await res.json();
      setData(result.quote); 
    } catch (error) {
      console.error("Error fetching quote of the day:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="relative">
  <div className="absolute -top-3 left-4 
      text-xs font-medium text-blue-600 dark:text-blue-400 
      bg-blue-100 dark:bg-blue-800 px-3 py-1 rounded-full">
    QUOTE OF THE DAY
  </div>

  <div className="h-full rounded-2xl border border-blue-200 bg-blue-50 
       dark:border-blue-800 dark:bg-blue-900/20 p-4 pt-8">

    <p className="text-gray-700 dark:text-gray-300 mb-4">
      {loading
        ? "Loading inspirational quote..."
        : data?.quote || "No quote selected"}
    </p>

    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium text-right">
      — {data?.author || "Unknown"}
    </p>
  </div>
</div>

  );
};

export default QuoteOfTheDay;
