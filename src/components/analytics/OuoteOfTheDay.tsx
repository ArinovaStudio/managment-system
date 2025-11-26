const QuoteOfTheDay = ({ analyticsData }: { analyticsData?: any }) => (
  <div className="h-full rounded-2xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-3 py-1 rounded-full inline-block mt-2 mx-50">
      QUOTE OF THE DAY
    </div>

    <p className="text-gray-700 px-4 dark:text-gray-300 mb-4">
      {analyticsData?.quote?.text || "Loading inspirational quote..."}
    </p>

    <p className="text-sm mb-4 mx-3 text-blue-600 dark:text-blue-400 font-medium text-right">
      — {analyticsData?.quote?.author || "Unknown"}
    </p>
  </div>
);

export default QuoteOfTheDay;
