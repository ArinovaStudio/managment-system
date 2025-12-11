import React, { useMemo } from "react";

const PerformanceRadial = ({ performanceData }: { performanceData?: any }) => {
  // Use dynamic backend performance data
  const data = useMemo(() => {
    // Check if we have ratings data (not employees data)
    if (!performanceData?.ratings?.length) {
      return [
        { label: "Speed", value: 0, color: "#3b82f6" },
        { label: "Work Quality", value: 0, color: "#8b5cf6" },
        { label: "Leaves", value: 0, color: "#ec4899" },
        { label: "Communication", value: 0, color: "#f59e0b" },
        { label: "Feedback", value: 0, color: "#10b981" },
      ];
    }

    const latestRating = performanceData.ratings[0];
    return [
      { label: "Speed", value: (latestRating.speed || 0) * 10, color: "#3b82f6" },
      { label: "Leave", value: (latestRating.leaves || 0) * 10, color: "#ec4899" },
      { label: "Feedback", value: (latestRating.feedback || 0) * 10, color: "#10b981" },
      { label: "Communication", value: (latestRating.communication || 0) * 10, color: "#f59e0b" },
      { label: "Work", value: (latestRating.workQuality || 0) * 10, color: "#8b5cf6" },
    ];
  }, [performanceData]);

  // Chart geometry
  const size = 250;
  const center = size / 2;
  const maxRadius = size / 2 - 30;
  const levels = 5;

  const angleStep = data.length > 0 ? (2 * Math.PI) / data.length : 0;

  const gridCircles = Array.from({ length: levels }, (_, i) => {
    const radius = (maxRadius / levels) * (i + 1);
    return (
      <circle
        key={i}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="1"
      />
    );
  });

  const radialLines = data.map((_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const x = center + maxRadius * Math.cos(angle);
    const y = center + maxRadius * Math.sin(angle);

    return (
      <line
        key={i}
        x1={center}
        y1={center}
        x2={x}
        y2={y}
        stroke="#e5e7eb"
        strokeWidth="1"
      />
    );
  });

  const points = data
    .map((point, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const radius = (point.value / 100) * maxRadius;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");

  const dataPoints = data.map((point, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const radius = (point.value / 100) * maxRadius;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);

    return <circle key={i} cx={x} cy={y} r="4" fill={point.color} />;
  });

  const labels = data.map((point, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const labelRadius = maxRadius + 20;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);

    return (
      <text
        key={i}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs fill-gray-600 dark:fill-gray-400"
        fontSize="10"
      >
        {point.label}
      </text>
    );
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] h-80">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Performance Radial
      </h3>

      <div className="flex items-center justify-center">
        {data.every(d => d.value === 0) ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            {performanceData?.employees ? 'Admin view - No personal ratings' : 'No performance ratings available'}
          </div>
        ) : (
        <svg width={size} height={size}>
          {/* Grid */}
          {gridCircles}

          {/* Radials */}
          {radialLines}

          {/* Filled Polygon */}
          <polygon
            points={points}
            fill="url(#gradient)"
            fillOpacity="0.3"
            stroke="#3b82f6"
            strokeWidth="2"
          />

          {/* Dots */}
          {dataPoints}

          {/* Labels */}
          {labels}

          {/* Gradient */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        )}
      </div>
    </div>
  );
};

export default PerformanceRadial;
