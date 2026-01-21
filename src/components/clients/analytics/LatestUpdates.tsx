"use client";

import { format } from "date-fns";

const LatestUpdates = ({ updates }: { updates: any[] }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-300 dark:border-gray-700 p-6 shadow-md relative">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">Latest Updates</h2>
        <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
          {format(new Date(updates[0]?.date), "dd MMM. yyyy")}
        </span>
      </div>

      {/* Scrollable container */}
      <div className="relative">
        <div className="space-y-6 max-h-[430px] overflow-y-auto pr-2 no-scrollbar pb-10">
          {updates.map((item, index) => (
            <div key={item.id} className="relative">
              <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-600">
                {/* Date inside card */}
                <span className="absolute top-3 right-4 text-sm text-purple-600 dark:text-purple-400 font-medium">
                  {format(new Date(item.date), "dd MMM. yyyy")}
                </span>

                <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                  {item.title}
                </p>
              </div>

              {/* Divider */}
              {index !== updates.length - 1 && (
                <div className="h-px bg-gray-200 dark:bg-gray-700 mt-6" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom Inner Shadow */}
      </div>
        <div className="pointer-events-none rounded-xl absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-300/60 dark:from-gray-800/60 to-transparent"></div>

    </div>
  );
};

export default LatestUpdates;
