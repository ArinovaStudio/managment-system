"use client";

import React, { useEffect, useState } from "react";


export default function Banner() {
  
  const [weekDates, setWeekDates] = useState<{ day: string; date: number; fullDate: Date }[]>([]);

  useEffect(() => {
    const getWeekDates = () => {
      const today = new Date();
      const currentDay = today.getDay();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - currentDay);

      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push({
          day: date.toLocaleDateString('en-US', { weekday: 'long' }),
          date: date.getDate(),
          fullDate: date,
        });
      }
      return dates;
    };

    setWeekDates(getWeekDates());
  }, []);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <>
    <div className="w-full h-56 bg-gradient-to-br from-blue-700 to-blue-300 dark:to-blue-900 rounded-3xl p-6 py-8 relative overflow-hidden">
      <div className="hidden lg:block absolute right-4 -top-6 h-[120%] w-1/3">
        <img 
          src={"/images/brand/well-being.png"}
          alt="Illustration"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="relative z-10">
        <h1 className="text-2xl md:text-4xl text-white font-bold">We Care For Your Health</h1>
        <p className="text-white text-lg md:text-xl font-normal mt-2">When your health is good only then work is good.</p>
        <div className="w-full lg:w-5/6 flex justify-start items-center gap-2 md:gap-4 mt-4 overflow-x-auto">
          {weekDates.map((items) => (
            <div key={items.day} className={`h-16 md:h-20 min-w-[60px] md:min-w-[80px] ${isToday(items.fullDate) ? 'bg-white text-blue-600' : "bg-white/20 text-white"} px-2 md:px-3 py-2 md:py-4 rounded-xl flex-shrink-0`}>
              <h1 className="font-bold text-lg md:text-2xl text-center">{items.date}</h1>
              <p className="text-xs font-medium text-center truncate">{items.day.slice(0, 3)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
