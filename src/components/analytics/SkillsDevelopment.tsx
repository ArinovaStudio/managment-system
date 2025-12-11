import React from "react";
import BarChartOne from "../charts/bar/BarChartOne";
import ComponentCard from "../common/ComponentCard";

const SkillsDevelopment = ({ performanceData }: { performanceData?: any }) => {
  const skillsData = React.useMemo(() => {
    if (!performanceData?.ratings?.length) return [];
    
    const latestRating = performanceData.ratings[0];
    return [
      { name: 'Learnings', value: latestRating.newLearnings || 0 },
      { name: 'Speed', value: latestRating.speed || 0 },
      { name: 'Work Quality', value: latestRating.workQuality || 0 },
      { name: 'Leaves', value: latestRating.leaves || 0 },
      { name: 'Communication', value: latestRating.communication || 0 },
      { name: 'Feedback', value: latestRating.feedback || 0 }
    ];
  }, [performanceData]);

  return (
    <div>
      <div className="space-y-6">
        <ComponentCard title="Skills Development">
          {skillsData.length > 0 ? (
            <BarChartOne skillsData={skillsData} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              {performanceData?.employees ? 'Admin view - No personal ratings' : 'No performance data available'}
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
};

export default SkillsDevelopment;
