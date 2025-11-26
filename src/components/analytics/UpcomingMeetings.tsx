const UpcomingMeetings = ({ analyticsData }: { analyticsData?: any }) => {
  const meetings = analyticsData?.meetings || [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] h-48">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Upcoming Meetings ({meetings.length})
      </h3>

      <div className="space-y-3 max-h-32 overflow-y-auto">
        {meetings.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming meetings</p>
        ) : (
          meetings.slice(0, 4).map((meeting: any) => (
            <div key={meeting.id} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {meeting.title}
              </span>
              <span className="text-xs text-gray-500">{meeting.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingMeetings;
