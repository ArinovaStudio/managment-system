import React from "react";
import BarChartOne from "../charts/bar/BarChartOne";
import ComponentCard from "../common/ComponentCard";

const SkillsDevelopment = ({ analyticsData }: { analyticsData?: any }) => {
  const skillsData = analyticsData?.skills || [];

  return (
    <div>
      <div className="space-y-6">
        <ComponentCard title="Skills Development">
          <BarChartOne skillsData={skillsData} />
        </ComponentCard>
      </div>
    </div>
  );
};

export default SkillsDevelopment;
