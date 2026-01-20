import { AlertTriangle } from "lucide-react";

const RiskBlockage = ({ risks }: { risks: string[] }) => {
  return (
    <div
      className="
        bg-white dark:bg-gray-800 
        rounded-2xl p-5 
        border-2 border-red-400 
        shadow-sm
      "
    >
      {/* Header Pill */}
      <div className="flex justify-end -mt-6 mb-4">
        <span className="bg-red-400 text-white px-4 py-1 rounded-full text-sm font-medium">
          Risk Blockage
        </span>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        {risks.map((risk, index) => (
          <div
            key={index}
            className="
              bg-gray-50 dark:bg-gray-700 
              rounded-xl p-4 
              flex items-center gap-3 
              border border-gray-200 dark:border-gray-600
            "
          >
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <p className="text-sm text-gray-800 dark:text-gray-200">
              {risk}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskBlockage;
