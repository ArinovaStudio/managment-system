import { useState, useEffect } from "react";

const StatusCard = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isOnBreak, setIsOnBreak] = useState<boolean>(false);

  useEffect(() => {
    checkUserStatus();
    const interval = setInterval(checkUserStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkUserStatus = async () => {
    try {
      const response = await fetch('/api/clock/break');
      const data = await response.json();
      setIsOnBreak(!!data.activeBreak);
      setIsOnline(!data.activeBreak);
    } catch (error) {
      console.error('Failed to check user status:', error);
    }
  };

  return (
    <div
      className={`h-full rounded-2xl border p-6 flex flex-col items-center justify-center ${
        isOnline
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
      }`}
    >
      <p
        className={`font-medium ${
          isOnline ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        }`}
      >
        {isOnBreak ? "On Break" : isOnline ? "You're online" : "You're offline"}
      </p>
    </div>
  );
};

export default StatusCard;
