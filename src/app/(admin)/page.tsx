'use client';
import EmployeeProfile from "@/components/analytics/EmployeeProfile";
import Feedback from "@/components/analytics/Feedback";
import QuoteOfTheDay from "@/components/analytics/OuoteOfTheDay";
import PerformanceRadial from "@/components/analytics/PerformanceRadial";
import ProjectStats from "@/components/analytics/ProjectStats";
import SkillsDevelopment from "@/components/analytics/SkillsDevelopment";
import StatusCard from "@/components/analytics/StatusCard";
import ToDoTask from "@/components/analytics/ToDoTask";
import UpcomingMeetings from "@/components/analytics/UpcomingMeetings";
import React, { useEffect, useState } from "react";

export default function EmployeeDashboard() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [analyticsRes, performanceRes] = await Promise.all([
        fetch('/api/analytics', { credentials: 'include' }),
        fetch('/api/performace', { credentials: 'include' })
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalyticsData(data.analytics);
      }

      if (performanceRes.ok) {
        const data = await performanceRes.json();
        setPerformanceData(data);
      } else {
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 md:col-span-5">
          <EmployeeProfile />
        </div>
        <div className="col-span-12 md:col-span-7">
          <QuoteOfTheDay />
        </div>
        <div className="col-span-12 md:col-span-7">
          <ProjectStats analyticsData={analyticsData} />
        </div>
        <div className="col-span-12 md:col-span-5">
          <StatusCard />
        </div>
        <div className="col-span-12 md:col-span-7">
          <SkillsDevelopment performanceData={performanceData} />
        </div>
        <div className="col-span-12 md:col-span-5">
          <PerformanceRadial performanceData={performanceData} />
        </div>
        <div className="col-span-12 md:col-span-4">
          <Feedback />
        </div>
        <div className="col-span-12 md:col-span-4">
          <UpcomingMeetings />
        </div>
        <div className="col-span-12 md:col-span-4">
          <ToDoTask />
        </div>
      </div>
    </div>
  );
}