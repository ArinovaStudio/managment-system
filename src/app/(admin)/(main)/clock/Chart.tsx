"use client";
import React, { useState } from "react";

export default function WorkHoursCard() {
  const weekOptions = ["1 Dec - 7 Dec", "8 Dec - 14 Dec"];
  const [week, setWeek] = useState(weekOptions[0]);
  const date = new Date();
  const day = date.getDay()
  
  const dataByWeek: any = {
    "1 Dec - 7 Dec": [
      { day: "Mon", hours: 9.83, login: "09:05 AM", logout: "06:53 PM" },
      { day: "Tue", hours: 8.5, login: "09:10 AM", logout: "05:40 PM" },
      { day: "Wed", hours: 9.5, login: "08:40 AM", logout: "06:10 PM" },
      { day: "Thu", hours: 8.0, login: "09:15 AM", logout: "05:10 PM" },
      { day: "Fri", hours: 7.83, login: "09:20 AM", logout: "05:04 PM" },
      { day: "Sat", hours: 5.2, login: "09:45 AM", logout: "03:00 PM" },
    ],
    "8 Dec - 14 Dec": [
      { day: "Mon", hours: 8.3, login: "09:00 AM", logout: "05:18 PM" },
      { day: "Tue", hours: 7.9, login: "09:15 AM", logout: "05:04 PM" },
      { day: "Wed", hours: 9.1, login: "08:50 AM", logout: "06:00 PM" },
      { day: "Thu", hours: 8.5, login: "09:10 AM", logout: "05:40 PM" },
      { day: "Fri", hours: 6.8, login: "10:00 AM", logout: "04:48 PM" },
      { day: "Sat", hours: 4.9, login: "10:10 AM", logout: "03:00 PM" },
    ],
  };

  const data = dataByWeek[week];
  const maxHours = Math.max(...data.map((d: any) => d.hours));

  return (
    <div className="py-4 px-6 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold dark:text-white text-gray-800">
        Work Hours per Day (Weekly View)
      </h3>
              <div className="flex items-center">
          <select
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            className="text-orange-500 text-sm font-medium cursor-pointer bg-transparent border-none appearance-none pr-3 focus:outline-none"
          >
            {weekOptions.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <span className="text-orange-500 ml-1 select-none">▾</span>
        </div>
      </div>

      {/* Days Row + Bars */}
      <div className={`flex justify-between ${day === 7 ? "items-center" : "items-end"} flex-1`}>
                    {day === 7 ? (
              <h1 className="text-center w-full text-4xl text-orange-400">Enjoy Your Sunday</h1>
            ) : (
              <>
        {data.map((item: any, index: number) => (
          <div
            key={item.day}
            className="flex flex-col items-center justify-end w-[50px]"
          >
            {/* Logout time */}
            <span className="text-[13px] text-[#92400E] dark:text-orange-300 font-semibold mb-1">
              {item.logout !== "-" ? item.logout.split(" ")[0] : "-"}
              {item.logout !== "-" && (
                <span className="block text-[11px] font-normal">
                  {item.logout.split(" ")[1]}
                </span>
              )}
            </span>

            {/* Bar */}
            <div
              className="w-[60px] bg-[#FDBA74] rounded-xl transition-all"
              style={{
                height: `${(item.hours / maxHours) * 130}px`, // max bar height = 130px
              }}
            ></div>

            {/* Login time */}
            <span className="text-[13px] text-[#92400E] dark:text-orange-300 font-semibold mt-1">
              {item.login !== "-" ? item.login.split(" ")[0] : "-"}
              {item.login !== "-" && (
                <span className="block text-[11px] font-normal text-right">
                  {item.login.split(" ")[1]}
                </span>
              )}
            </span>

            {/* Day Label */}
            <span className={`text-sm font-medium mt-2   ${day - 1 === index ? "text-orange-400": "dark:text-white text-gray-600"}`}>
              {item.day}
            </span>
          </div>
        ))}
        </>
)}
      </div>
    </div>
  );
}
