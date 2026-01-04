"use client";
import { Plus } from "lucide-react";
import React, { useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className = "" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className={`relative bg-white dark:bg-gray-900 rounded-xl shadow-xl ${className}`}>
        {children}
      </div>
    </div>
  );
};

const Calendar: React.FC = () => {
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState<"HOLIDAY" | "WORKDAY">("HOLIDAY");
  const [holidays, setHolidays] = useState<any[]>([]);
  const [workdays, setWorkdays] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    initializeCalendar();
  }, []);

  const initializeCalendar = async () => {
    await fetchUserRole();
    await fetchCalendarData();
    setLoading(false);
  };

  const fetchUserRole = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      setIsAdmin(data.user?.role === 'ADMIN');
    } catch (error) {
      console.error('Failed to fetch user role:', error);
    }
  };

  const fetchCalendarData = async () => {
    try {
      const [holidaysRes, workdaysRes, leavesRes] = await Promise.all([
        fetch('/api/calender?type=holidays'),
        fetch('/api/calender?type=workdays'),
        fetch('/api/calender?type=leaves')
      ]);

      const [holidaysData, workdaysData, leavesData] = await Promise.all([
        holidaysRes.json(),
        workdaysRes.json(),
        leavesRes.json()
      ]);

      if (holidaysData.success) setHolidays(holidaysData.events || []);
      if (workdaysData.success) setWorkdays(workdaysData.events || []);
      if (leavesData.success) setLeaves(leavesData.leaves || []);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const events = [];

    // Helper function to normalize dates to local timezone
    const normalizeDate = (dateString: string) => {
      const d = new Date(dateString);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().split('T')[0];
    };

    holidays.forEach(h => {
      if (normalizeDate(h.date) === dateStr) {
        events.push({ ...h, type: 'HOLIDAY', color: 'bg-red-500' });
      }
    });

    workdays.forEach(w => {
      if (normalizeDate(w.date) === dateStr) {
        events.push({ ...w, type: 'WORKDAY', color: 'bg-green-500' });
      }
    });

    leaves.forEach(l => {
      const startStr = normalizeDate(l.startDate);
      const endStr = normalizeDate(l.endDate);
      const currentStr = dateStr;
      if (currentStr >= startStr && currentStr <= endStr) {
        events.push({ ...l, title: `Leave: ${l.leaveType || 'Personal'}`, type: 'LEAVE', color: 'bg-orange-500' });
      }
    });

    return events;
  };

  const handleAddEvent = async () => {
    if (!eventTitle.trim() || !eventDate) return;

    try {
      const res = await fetch('/api/calender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: eventTitle.trim(), date: eventDate, type: eventType })
      });

      const data = await res.json();
      if (data.success) {
        await fetchCalendarData();
        closeModal();
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!isAdmin || eventId.startsWith('auto-')) return;

    if (window.confirm('Delete this event?')) {
      try {
        const res = await fetch(`/api/calender?id=${eventId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) await fetchCalendarData();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEventTitle('');
    setEventDate('');
    setEventType('HOLIDAY');
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const today = () => setCurrentDate(new Date());

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Public Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Working Weekend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Leave</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="px-5 py-2 font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700">‹</button>
            <button onClick={nextMonth} className="px-5 py-2 font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700">›</button>
            <button onClick={today} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Today</button>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          {isAdmin && (
            <button onClick={() => setIsModalOpen(true)} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={20} />   Add Event
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 dark:bg-gray-800 p-3 text-center font-semibold text-gray-700 dark:text-gray-300">
              {day}
            </div>
          ))}
          {getDaysInMonth(currentDate).map((date, idx) => {
            if (!date) return <div key={idx} className="bg-white dark:bg-gray-900 min-h-24"></div>;

            const events = getEventsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div key={idx} className={`bg-white dark:bg-gray-900 min-h-24 p-2 ${isToday ? 'ring-2 ring-blue-500' : ''
                }`}>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{date.getDate()}</div>
                <div className="space-y-1">
                  {events.map((event, i) => (
                    <div key={i} className={`text-xs px-2 py-4 rounded text-white ${event.color} flex items-center justify-between group`}>
                      <span className="truncate">{event.title}</span>
                      {isAdmin && event.type !== 'LEAVE' && !event.id?.startsWith('auto-') && (
                        <button onClick={() => handleDeleteEvent(event.id)} className="opacity-0 group-hover:opacity-100 ml-1">×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-[500px] w-full p-6">
        <div>
          <h5 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Add Calendar Event</h5>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter event title"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Event Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="HOLIDAY"
                    checked={eventType === "HOLIDAY"}
                    onChange={() => setEventType("HOLIDAY")}
                    className="mr-2 w-4 h-4 text-blue-600 cursor-pointer hidden"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">🔴 Public Holiday</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="WORKDAY"
                    checked={eventType === "WORKDAY"}
                    onChange={() => setEventType("WORKDAY")}
                    className="mr-2 w-4 h-4 text-blue-600 cursor-pointer hidden"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">🟢 Work Day (Weekend Override)</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white transition-colors">
              Cancel
            </button>
            <button onClick={handleAddEvent} disabled={!eventTitle.trim() || !eventDate} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Add Event
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Calendar;
