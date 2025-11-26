import React, { useMemo } from "react";

const PerformanceRadial = ({ analyticsData }: { analyticsData?: any }) => {
  // Default fallback chart when no analytics data yet
  const fallbackData = [
    { label: "Design", value: 85, color: "#3b82f6" },
    { label: "Development", value: 92, color: "#8b5cf6" },
    { label: "Marketing", value: 78, color: "#ec4899" },
    { label: "Sales", value: 88, color: "#f59e0b" },
    { label: "Support", value: 95, color: "#10b981" },
    { label: "Analytics", value: 82, color: "#06b6d4" },
  ];

  // Use dynamic backend performance OR fallback
  const data = useMemo(() => {
    const perf = analyticsData?.performance;

    if (!perf || !Array.isArray(perf) || perf.length === 0) {
      return fallbackData;
    }

    // Ensure values are valid 0–100
    return perf.map((item: any) => ({
      ...item,
      value: Math.max(0, Math.min(100, item.value)),
    }));
  }, [analyticsData]);

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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] h-80">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Performance Radial
      </h3>

      <div className="flex items-center justify-center">
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

          {/* Gradient */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default PerformanceRadial;
