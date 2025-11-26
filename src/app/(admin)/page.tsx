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

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        const response = await fetch('/api/analytics', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data.analytics);
        }
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      }
    }
    fetchAnalyticsData();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 md:col-span-5">
        <EmployeeProfile />
      </div>
      <div className="col-span-12 md:col-span-7">
        <QuoteOfTheDay analyticsData={analyticsData} />
      </div>
      <div className="col-span-12 md:col-span-7">
        <ProjectStats analyticsData={analyticsData} />
      </div>
      <div className="col-span-12 md:col-span-5">
        <StatusCard />
      </div>
      <div className="col-span-12 md:col-span-7">
        <SkillsDevelopment analyticsData={analyticsData} />
      </div>
      <div className="col-span-12 md:col-span-5">
        <PerformanceRadial analyticsData={analyticsData} />
      </div>
      <div className="col-span-12 md:col-span-4">
        <Feedback />
      </div>
      <div className="col-span-12 md:col-span-4">
        <UpcomingMeetings analyticsData={analyticsData} />
      </div>
      <div className="col-span-12 md:col-span-4">
        <ToDoTask analyticsData={analyticsData} />
      </div>
    </div>
  );
}