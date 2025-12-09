"use client";
import React, { useState, useEffect } from "react";

export default function WorkHoursCard() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [data, setData] = useState([]);
  const [weekLabel, setWeekLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const date = new Date();
  const day = date.getDay();

  const fetchWorkHours = async (offset: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/clock/work-hours?week=${offset}`, {
        cache: 'no-store'
      });
      const result = await res.json();

      if (result.success) {
        setData(result.data);
        setWeekLabel(result.weekLabel);
      }
    } catch (error) {
      console.error("Failed to fetch work hours:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkHours(weekOffset);
  }, [weekOffset]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWorkHours(weekOffset);
    }, 30000);
    return () => clearInterval(interval);
  }, [weekOffset]);

  // Manual refresh function
  const refreshData = () => {
    fetchWorkHours(weekOffset);
  };

  const maxHours = data.length > 0 ? Math.max(...data.map((d: any) => d.hours || 0)) : 8;

  return (
    <div className="py-4 px-6 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold dark:text-white text-gray-800">
          Work Hours per Day (Weekly View)
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            ← Prev
          </button>
          <span className="text-orange-500 text-sm font-medium px-2">
            {weekLabel || "Loading..."}
          </span>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            disabled={weekOffset <= -4}
            className="text-orange-500 hover:text-orange-600 disabled:text-gray-400 text-sm font-medium"
          >
            Next →
          </button>
          <button
            onClick={refreshData}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium ml-2"
            title="Refresh data"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Days Row + Bars */}
      <div className={`flex justify-between ${day === 7 && weekOffset === 0 ? "items-center" : "items-end"} flex-1`}>
        {loading ? (
          <div className="text-center w-full text-gray-500">Loading...</div>
        ) : day === 7 && weekOffset === 0 ? (
          <h1 className="text-center w-full text-4xl text-orange-400">Enjoy Your Sunday</h1>
        ) : (
          data.map((item: any, index: number) => {
            const isToday = weekOffset === 0 && day - 1 === index;
            return (
              <div
                key={`${item.day}-${index}`}
                className="flex flex-col items-center justify-end w-[50px]"
              >
                {/* Logout time */}
                <span className="text-[13px] text-[#92400E] dark:text-orange-300 font-semibold mb-1">
                  {item.logout !== "-" ? (
                    <>
                      {item.logout.split(" ")[0]}
                      <span className="block text-[11px] font-normal">
                        {item.logout.split(" ")[1]}
                      </span>
                    </>
                  ) : "-"}
                </span>
                {/* Bar */}
                <div
                  className="w-[60px] bg-[#FDBA74] rounded-xl transition-all"
                  style={{
                    height: `${maxHours > 0 ? (item.hours / maxHours) * 130 : 0}px`,
                  }}
                >
                  {/* Working Hours Text */}
                  <span className="text-[12px] text-white font-bold block mt-5 w-full text-center">
                    {item.hours > 0 ? `${item.hours.toFixed(1)}h` : "-"}
                  </span>

                </div>

                {/* Login time */}
                <span className="text-[13px] text-[#92400E] dark:text-orange-300 font-semibold mt-1">
                  {item.login !== "-" ? (
                    <>
                      {item.login.split(" ")[0]}
                      <span className="block text-[11px] font-normal text-right">
                        {item.login.split(" ")[1]}
                      </span>
                    </>
                  ) : "-"}
                </span>

                {/* Day Label */}
                <span className={`text-sm font-medium mt-2 ${isToday ? "text-orange-400" : "dark:text-white text-gray-600"}`}>
                  {item.day}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
