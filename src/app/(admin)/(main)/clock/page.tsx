'use client';
import { ArrowUpFromDot, ClipboardClock, ClockArrowDown, ClockArrowUp, ClockFading, Cloud, Coffee, CookingPot, Play, Siren, Timer, ScanFace, X, SirenIcon, LogOut } from 'lucide-react'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import WorkHoursChart from './Chart'
import FaceRecognition from './FaceRecognition'
import toast from 'react-hot-toast'

interface BreakType {
  id: string;
  name: string;
  duration: number;
  description: string;
  color: string;
  icon: string;
}

function Clock() {
  const [timezone, setTimezone] = useState<any>(null);
  const [allTimezones, setAllTimezones] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [leaves, setLeaves] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [breakTypes, setBreakTypes] = useState<BreakType[]>([]);
  const [activeBreak, setActiveBreak] = useState<string | null>(null);
  const [activeBreakStartTime, setActiveBreakStartTime] = useState<Date | null>(null);
  const [activeBreakEndTime, setActiveBreakEndTime] = useState<Date | null>(null);
  const [totalBreakTime, setTotalBreakTime] = useState(0); // in minutes
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showFaceAuth, setShowFaceAuth] = useState(false);
  const [faceAuthMode, setFaceAuthMode] = useState<'register' | 'authenticate'>('authenticate');
  const [userStatus, setUserStatus] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const faceRecognitionRef = useRef<any>(null);
  const [showDeveloperPopup, setShowDeveloperPopup] = useState(false);
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const [workSummary, setWorkSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Load user status on mount
  useEffect(() => {
    loadUserStatus();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch("/api/clock/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        // If there's an active session, force user status to logged in
        if (data.hasActiveSession) {
          setUserStatus(prev => ({ ...prev, isLoggedIn: true }));
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const loadUserStatus = async () => {
    try {
      const response = await fetch('/api/clock/face-recognition');
      if (response.ok) {
        const data = await response.json();
        
        // Always check stats for active sessions
        const statsResponse = await fetch('/api/clock/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.hasActiveSession) {
            data.isLoggedIn = true;
          }
        }
        
        setUserStatus(data);
      }
    } catch (error) {
      console.error('Failed to load user status:', error);
    }
  };

  // LOAD USER TIMEZONE
  useEffect(() => {
    async function loadUserTZ() {
      try {
        const res = await fetch("/api/clock/timezone");
        const data = await res.json();
        setTimezone(data.timezone);
      } catch (error) {
        console.error('Failed to load timezone:', error);
      }
    }
    loadUserTZ();
  }, []);

  // LOAD ALL TIMEZONES
  useEffect(() => {
    async function loadTZList() {
      try {
        const res = await fetch("/api/clock/timezone?action=timezones");
        const data = await res.json();
        setAllTimezones(data.timezones);
      } catch (error) {
        console.error('Failed to load timezone list:', error);
      }
    }
    loadTZList();
  }, []);

  // UPDATE TIMEZONE


  // LOAD LEAVES
  useEffect(() => {
    async function loadLeaves() {
      try {
        const res = await fetch("/api/clock/leave");
        const data = await res.json();
        setLeaves(data.leaves);
      } catch (error) {
        console.error('Failed to load leaves:', error);
      }
    }
    loadLeaves();
  }, []);

  // LOAD BREAK TYPES
  useEffect(() => {
    fetchBreakTypes();
  }, []);

  // Countdown timer and auto-end
  useEffect(() => {
    if (!activeBreakEndTime || !activeBreak) return;
    
    const interval = setInterval(() => {
      const timeLeft = Math.max(0, Math.floor((activeBreakEndTime.getTime() - Date.now()) / 1000));
      setBreakTimeLeft(timeLeft);
      
      // Auto-end break when time is up
      if (timeLeft <= 0) {
        handleBreakAction(activeBreak, 'end');
        toast.success('Break time completed! You are back online.');
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeBreakEndTime, activeBreak]);

  // Check for expired breaks on component mount
  useEffect(() => {
    if (activeBreak && activeBreakEndTime) {
      const timeLeft = Math.floor((activeBreakEndTime.getTime() - Date.now()) / 1000);
      if (timeLeft <= 0) {
        handleBreakAction(activeBreak, 'end');
        toast.success('Previous break has been automatically ended.');
      }
    }
  }, [activeBreak, activeBreakEndTime]);

  const fetchBreakTypes = async () => {
    try {
      const response = await fetch('/api/clock/break');
      const data = await response.json();
      if (data.breakTypes) {
        setBreakTypes(data.breakTypes);
        if (data.activeBreak) {
          setActiveBreak(data.activeBreak.id);
          setActiveBreakStartTime(new Date(data.activeBreak.startTime));
          const duration = breakTypes.find(bt => bt.id === data.activeBreak.id)?.duration || 15;
          setActiveBreakEndTime(new Date(new Date(data.activeBreak.startTime).getTime() + duration * 60 * 1000));
        } else {
          setActiveBreak(null);
          setActiveBreakStartTime(null);
          setActiveBreakEndTime(null);
        }
        if (data.todayBreakTime) {
          setTotalBreakTime(data.todayBreakTime);
        }
      }
    } catch (error) {
      console.error('Failed to fetch break types:', error);
    }
  };

  const handleBreakAction = async (breakType: string, action: 'start' | 'end') => {
    // Check if user is logged in before allowing break actions
    if (!userStatus?.isLoggedIn) {
      toast.error('Please clock in first before taking a break');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/clock/break', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ breakType, action })
      });

      const data = await response.json();
      if (data.success) {
        if (action === 'start') {
          setActiveBreak(breakType);
          setActiveBreakStartTime(new Date());
          const duration = breakTypes.find(bt => bt.id === breakType)?.duration || 15;
          setActiveBreakEndTime(new Date(Date.now() + duration * 60 * 1000));
        } else {
          setActiveBreak(null);
          setActiveBreakStartTime(null);
          setActiveBreakEndTime(null);
          if (data.break?.duration) {
            setTotalBreakTime(prev => prev + data.break.duration);
          }
        }
        // Show success message
        const breakTypeName = breakTypes.find(bt => bt.id === breakType)?.name;
        const message = action === 'start'
          ? `${breakTypeName} started successfully`
          : `${breakTypeName} ended successfully. Duration: ${data.break?.duration || 0} minutes`;
        toast.success(message);
      } else {
        toast.error(data.error || 'Break action failed');
      }
    } catch (error) {
      console.error('Break action failed:', error);
      toast.error('Failed to update break status');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons = { Coffee, CookingPot, Siren };
    return icons[iconName as keyof typeof icons] || Coffee;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      purple: { bg: 'bg-purple-500', accent: 'bg-purple-300/20', text: 'text-purple-500' },
      yellow: { bg: 'bg-yellow-500', accent: 'bg-yellow-300/20', text: 'text-yellow-500' },
      red: { bg: 'bg-red-500', accent: 'bg-red-300/20', text: 'text-red-500' }
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentBreakDuration = () => {
    if (!activeBreakStartTime) return 0;
    return Math.floor((new Date().getTime() - activeBreakStartTime.getTime()) / (1000 * 60));
  };

  const handleFaceAuth = async () => {
    try {
      // Always refresh user status first
      const response = await fetch('/api/clock/face-recognition');
      if (!response.ok) {
        throw new Error('Failed to fetch user status');
      }

      const data = await response.json();
      setUserStatus(data);
      
      // For clock-out, skip face recognition and go directly to logout workflow
      if (data.isLoggedIn) {
        // Get user info to check role
        const userResponse = await fetch('/api/user');
        const userData = await userResponse.json();
        console.log(userData);
        
        if (userData.user?.isDev) {
          setShowDeveloperPopup(true);
        } else {
          setShowSummaryPopup(true);
        }
        return;
      }

      // For clock-in, use face recognition
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (cameraError) {
        // No camera - show password popup
        setShowAuthPopup(true);
        return;
      }

      if (data.hasFaceRegistered) {
        setFaceAuthMode('authenticate');
      } else {
        setFaceAuthMode('register');
      }
      setShowFaceAuth(true);
    } catch (error) {
      console.error('Face auth error:', error);
      toast.error('Failed to initialize face authentication. Please try again.');
    }
  };

  const handlePasswordAuth = async () => {
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setAuthLoading(true);
    try {
      const response = await fetch('/api/clock/password-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          action: userStatus?.isLoggedIn ? 'clock-out' : 'clock-in'
        })
      });

      const result = await response.json();

      if (result.success) {
        setShowAuthPopup(false);
        setPassword('');
        console.log(result);
        
        // If clocking out, check for developer workflow or show summary
        if (result.action === 'clock-out-auth') {
          if (result.isDev) {
            setShowDeveloperPopup(true);
          } else {
            setShowSummaryPopup(true);
          }
        } else {
          toast.success(`Clock-In Successfully! ${result.message}`);
          await loadUserStatus();
          await loadStats();
        }
      } else {
        toast.error(`Authentication failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Password auth error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDeveloperResponse = (pushedCode: boolean) => {
    if (!pushedCode) {
      setShowDeveloperPopup(false);
      toast.error('Ops! First you need to push all your work progress!');
    } else {
      setShowDeveloperPopup(false);
      setShowSummaryPopup(true);
    }
  };


  const handleSummarySubmit = async () => {
    if (!workSummary.trim()) {
      toast.error('Hey, Hey! Tell me what\'s your today\'s progress first?');
      return;
    }

    setSummaryLoading(true);
    try {
      const response = await fetch('/api/clock/work-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: workSummary })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Clock-Out Successfully!. ${result?.message}`);
        setShowSummaryPopup(false);
        setWorkSummary('');
        await loadUserStatus();
        await loadStats();
      } else {
        toast.error(`Failed to save summary: ${result.error}`);
      }
    } catch (error) {
      console.error('Summary save error:', error);
      toast.error('Failed to save summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleFaceSuccess = async (result: any) => {
    if (faceAuthMode === 'register') {
      toast.success('Face registered successfully! You can now use face authentication.');
      setShowFaceAuth(false);
      await loadUserStatus();
    } else {
      setShowFaceAuth(false);

      // If clocking out, check for developer workflow or show summary
      if (result.action === 'clock-out') {
        // Get user info from API to check workingAs
        const userResponse = await fetch('/api/user');
        const userData = await userResponse.json();
        // console.log(userData);
        
        if (userData.user?.isDev) {
          setShowDeveloperPopup(true);
        } else {
          setShowSummaryPopup(true);
        }
      } else {
        const action = result.action === 'clock-in' ? 'Clocked In' : 'Clocked Out';
        toast.success(`${action} Successfully! ${result.message}`);
        await loadUserStatus();
        await loadStats();
      }
    }
  };

  const handleCloseFaceAuth = () => {
    setShowFaceAuth(false);
  };

  const handleFaceError = (error: string) => {
    console.error('Face recognition error:', error);

    // Show password popup for camera/permission issues
    if (error.includes('NotAllowedError') || error.includes('NotFoundError') ||
      error.includes('camera not found') || error.includes('Permission denied') ||
      error.includes('getUserMedia') || error.includes('camera') ||
      error.includes('Camera') || error.includes('device') ||
      error.includes('media') || error.includes('video')) {
      setShowFaceAuth(false);
      setShowAuthPopup(true);
      return;
    }

    // Show user-friendly error message for other issues
    if (error.includes('No face detected')) {
      toast('No face detected. Please position your face clearly in the camera with good lighting.');
    } else if (error.includes('Multiple faces')) {
      toast('Multiple faces detected. Please ensure only one person is visible in the camera.');
    } else if (error.includes('not recognized')) {
      toast.error('Face not recognized. Please register your face first or use password authentication.');
    } else {
      toast.error(`Face recognition failed: ${error}`);
    }

    setShowFaceAuth(false);
  };

  return (
    <div className="w-full flex-col justify-start items-start gap-4">
      <div className="w-full h-62 flex justify-start items-start gap-4">

        {/* TIMEZONE CARD */}
        <div className="w-[28%] h-full bg-gradient-to-br from-green-900 to-green-300 relative rounded-3xl p-6 flex justify-end items-start flex-col">
          <div className="absolute left-[75%] top-4 w-14 h-14 rounded-full bg-white/40 grid place-items-center">
            <Timer className="mb-1" color="white" size={26} />
          </div>

          <h1 className="text-5xl font-bold text-white">
            <span className="text-2xl font-medium">{timezone?.code || 'UTC'}</span>
            <br />
            {timezone?.hours || '--:--'}
          </h1>

          <h1 className="text-xl text-right w-full text-white mt-4">
            Selected Time Zone
          </h1>
        </div>

        {/* LEAVES CARD */}
        <div className="w-[35%] h-full bg-gradient-to-br from-sky-700 to-sky-300 rounded-3xl p-6 pb-0 relative flex flex-col gap-3 justify-center items-center">
          <div className="absolute left-[80%] top-4 w-14 h-14 rounded-full bg-white/40 grid place-items-center">
            <Cloud color="white" size={26} />
          </div>
          <div className="w-full flex justify-between items-center px-4 mt-8">
            <div className="w-20 h-20 grid place-items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full border border-white/40 text-white text-xl font-bold grid place-items-center">
                {leaves?.remaining || 0}
              </div>
              <p className="text-white text-xs text-center mt-1 font-medium">Remaining Leaves</p>
            </div>
            <div className="w-20 h-20 grid place-items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full border border-white/40 text-white text-xl font-bold grid place-items-center">
                {leaves?.emergency || 0}
              </div>
              <p className="text-white text-xs text-center mt-1 font-medium">Emergency Leaves</p>
            </div>
            <div className="w-20 h-20 grid place-items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full border border-white/40 text-white text-xl font-bold grid place-items-center">
                {leaves?.sick || 0}
              </div>
              <p className="text-white text-xs text-center mt-1 font-medium">Sick <br /> Leaves</p>
            </div>
          </div>
          <h1 className="text-xl text-right w-full text-white mt-4">Leaves Information</h1>
        </div>

        {/* AVG. STATS CARD */}
        <div className="w-[35%] h-full flex flex-wrap justify-between items-start gap-3">
          <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl flex justify-start items-center gap-2 px-3">
            <div className="w-12 h-12 bg-green-400/20 text-green-600 rounded-full grid place-items-center">
              <ClockArrowDown />
            </div>
            <div>
              <h1 className='text-2xl font-bold dark:text-white tracking-tight'>{stats?.avgClockIn || "--"}</h1>
              <p className='text-sm text-gray-400'>Avg. Clock-In</p>
            </div>
          </div>
          <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl flex justify-start items-center gap-2 px-3">
            <div className="w-12 h-12 bg-orange-400/20 text-orange-600 rounded-full grid place-items-center">
              <ClockArrowUp />
            </div>
            <div>
              <h1 className='text-2xl font-bold dark:text-white tracking-tight'>{stats?.avgClockOut || "--"}</h1>
              <p className='text-sm text-gray-400'>Avg. Clock-Out</p>
            </div>
          </div>
          <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl flex justify-start items-center gap-2 px-3">
            <div className="w-12 h-12 bg-sky-400/20 text-sky-600 rounded-full grid place-items-center">
              <ClockFading />
            </div>
            <div>
              <h1 className='text-2xl font-bold dark:text-white tracking-tight'>{stats?.avgWorkingHours || "--"}</h1>
              <p className='text-xs text-gray-400'>Avg. Working Hours</p>
            </div>
          </div>
          <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl flex justify-start items-center gap-2 px-3">
            <div className="w-12 h-12 bg-purple-400/20 text-purple-500 rounded-full grid place-items-center">
              <ClipboardClock />
            </div>
            <div>
              <h1 className='text-2xl font-bold dark:text-white tracking-tight'>{stats?.totalPayPeriod || "--"}</h1>
              <p className='text-sm text-gray-400'>Total pay period</p>
            </div>
          </div>
        </div>
      </div>

      {/* BREAK TIME CARD */}
      <div className="w-full h-20 mt-4 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-400/20 text-red-500 rounded-full grid place-items-center">
            <Coffee />
          </div>
          <div>
            <h2 className="text-lg font-semibold dark:text-white">Today's Break Time</h2>
            <p className="text-sm text-gray-400">Total break duration</p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold dark:text-white">
            {formatMinutes(totalBreakTime + (activeBreak ? getCurrentBreakDuration() : 0))}
          </h1>
          {activeBreak && (
            <p className="text-sm text-red-500 animate-pulse">
              Break active: {formatSeconds(breakTimeLeft)} left
            </p>
          )}
        </div>
      </div>

      {/* WORK HOURS CARD */}
      <div className="w-full h-80 mt-4 flex justify-start items-start gap-4">
        <div className="w-3/5 h-full bg-white dark:bg-white/[0.03] rounded-3xl">
          <WorkHoursChart />
        </div>
        <div className="w-2/5 h-full bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-3xl p-8 shadow-[inset_-4px_-7px_19px_-4px_rgba(0,_0,_0,_0.1)]">
          <h1 className='text-center mx-auto font-bold text-2xl dark:text-white'>Let&apos;s Start Today&apos;s Work</h1>
          <p className='text-center mx-auto text-base dark:text-gray-400 text-neutral-400 mt-2'>
            Please verify with face recognition and {userStatus?.isLoggedIn ? 'Clock-Out' : 'Clock-In'}
          </p>
          <div
            onClick={handleFaceAuth}
            className="mx-auto cursor-pointer w-20 mt-6 h-20 bg-sky-400 shadow-[inset_4px_5px_7px_0px_#ffffff90] rounded-full grid place-items-center text-white hover:scale-105 transition-transform"
          >
            {userStatus?.isLoggedIn ? 
            <LogOut className='rotate-180' size={32} />
             : 
            <ScanFace size={32} />
            }
          </div>

          <h1 className="uppercase mt-8 dark:text-gray-400 text-neutral-400 text-center font-semibold text-lg">
            {userStatus?.isLoggedIn ? (
              <span className="text-green-400">You are Logged-IN</span>
            ) : (
              <span>You are not Logged-IN</span>
            )}
          </h1>

          {userStatus?.userName && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
              {userStatus.userName}
            </p>
          )}
        </div>
      </div>

      {/* TAKE A BREAK CARD */}
      <div className="w-full h-32 mt-4 flex justify-start items-center gap-4">
        {breakTypes.map((breakType) => {
          const IconComponent = getIconComponent(breakType.icon);
          const colors = getColorClasses(breakType.color);
          const isActive = activeBreak === breakType.id;

          return (
            <React.Fragment key={breakType.id}>
              <div key={breakType.id} className="w-1/3 h-full bg-white dark:bg-white/[0.03] dark:text-white rounded-2xl flex justify-start p-4 items-center gap-3">
                <div className={`w-20 h-5/6 ${colors.bg} text-white rounded-xl grid place-items-center`}>
                  <IconComponent size={28} strokeWidth={1.6} />
                </div>
                <div className="flex-1">
                  <h1 className='text-2xl font-bold tracking-tighter'>{breakType.name}</h1>
                  <p className="text-xs text-neutral-400">
                    {breakType.description.split('\n').map((line, i) => (
                      <span key={i}>{line}<br /></span>
                    ))}
                  </p>
                </div>

                <button
                  onClick={() => handleBreakAction(breakType.id, isActive ? 'end' : 'start')}
                  disabled={loading}
                  className={`w-12 h-12 ${colors.accent} ${colors.text} rounded-full grid place-items-center hover:scale-105 transition-transform ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isActive ? 'End break' : 'Start break'}
                >
                  {isActive ? (
                    <div className="w-3 h-3 bg-current rounded-full animate-pulse" />
                  ) : breakType.id === 'emergency' ? (
                    <ArrowUpFromDot size={22} />
                  ) : (
                    <Play size={22} />
                  )}
                </button>
              </div>
            </React.Fragment>
          );
        })}

        {/* emergency break */}
        <div className="w-1/3 h-full bg-white dark:bg-white/[0.03] dark:text-white rounded-2xl flex justify-start p-4 items-center gap-3">
          <div className={`w-20 h-5/6 bg-red-500 text-white rounded-xl grid place-items-center`}>
            {/* <IconComponent size={28} strokeWidth={1.6} /> */}
            <SirenIcon size={28} strokeWidth={1.6}/>
          </div>
          <div className="flex-1">
            <h1 className='text-2xl font-bold tracking-tighter'>Emergency Break</h1>
            <p className="text-xs text-neutral-400">
              Everything is alright? 
              Request for break!
            </p>
          </div>
          <button
            onClick={() => window.open('/leave-requests', '_blank')}
            disabled={loading}
            className={`w-12 h-12 bg-red-300/20 text-red-500 rounded-full grid place-items-center hover:scale-105 transition-transform`}
            title={'Start break'}
          >
            <ArrowUpFromDot size={22} />
            {/* <Play size={22} /> */}
          </button>
        </div>
      </div>

      {/* Face Recognition Popup */}
      {showFaceAuth && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">
                {faceAuthMode === 'register' ? 'Register Your Face' : 'Face Authentication'}
              </h2>
              <button
                onClick={handleCloseFaceAuth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} className="dark:text-white" />
              </button>
            </div>

            <FaceRecognition
              ref={faceRecognitionRef}
              mode={faceAuthMode}
              onSuccess={handleFaceSuccess}
              onError={handleFaceError}
              userId={userStatus?.userId}
              isLoggedIn={userStatus?.isLoggedIn}
            />
          </div>
        </div>
      )}

      {/* Password Authentication Popup */}
      {showAuthPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 mx-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">Authentication Required</h2>
              <button
                onClick={() => setShowAuthPopup(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} className="dark:text-white" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please enter your password to Login.
            </p>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordAuth()}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowAuthPopup(false)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-all hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordAuth}
                disabled={authLoading}
                className="flex-1 py-2 px-4 bg-sky-400 text-white rounded-lg hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
              >
                {authLoading ? 'logging in...' : 'Login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Developer Popup */}
      {showDeveloperPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 mx-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-xl font-semibold text-gray-400 text-center w-full">Before Logout</h2>
            </div>

            <p className="text-gray-800 dark:text-gray-100 mb-6 text-center text-lg">
              Did you push the codes?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleDeveloperResponse(false)}
                className="flex-1 py-3 px-4 dark:text-white rounded-lg border-2 border-gray-600 transition-all hover:scale-105 font-medium"
              >
                No
              </button>
              <button
                onClick={() => handleDeveloperResponse(true)}
                className="flex-1 py-3 px-4 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-all hover:scale-105 font-medium"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work Summary Popup */}
      {showSummaryPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-[500px] mx-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">Work Summary</h2>
              <button
                onClick={() => {
                  setShowSummaryPopup(false);
                  setWorkSummary('');
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} className="dark:text-white" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please provide a summary of your today's work:
            </p>

            <textarea
              value={workSummary}
              onChange={(e) => setWorkSummary(e.target.value)}
              placeholder="Describe what you accomplished today..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all h-32 resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSummaryPopup(false);
                  setWorkSummary('');
                  toast.error("Hey, Hey! Tell me what\'s your today\'s progress first?");
                }}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-all hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleSummarySubmit}
                disabled={summaryLoading}
                className="flex-1 py-2 px-4 bg-sky-400 text-white rounded-lg hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
              >
                {summaryLoading ? 'Saving...' : 'Submit & Clock Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clock