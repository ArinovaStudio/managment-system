"use client";

const LatestUpdates = ({ updates }: { updates: any[] }) => {
  return (
    <div
      className="  bg-white dark:bg-gray-800   rounded-2xl   border border-gray-300 dark:border-gray-700   p-6  shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Updates</h2>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {updates[0]?.date}
        </span>
      </div>

      {/* Updates List */}
      <div className="space-y-6">
        {updates.map((item, index) => (
          <div key={item.id} className="relative">
            <div
              className="
                bg-gray-50 dark:bg-gray-700 
                rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-600
              "
            >
              {/* small date inside card */}
              <span className="absolute top-3 right-4 text-xs text-purple-600 dark:text-purple-400 font-medium">
                {item.date}
              </span>

              <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                {item.title}
              </p>
            </div>

            {/* Divider (but not after last) */}
            {index !== updates.length - 1 && (
              <div className="h-px bg-gray-200 dark:bg-gray-700 mt-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestUpdates;
