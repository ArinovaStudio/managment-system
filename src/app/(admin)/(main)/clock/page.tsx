'use client';
import { ArrowUpFromDot, ClipboardClock, ClockArrowDown, ClockArrowUp, ClockFading, Cloud, Coffee, CookingPot, Play, Siren, Timer, ScanFace, X } from 'lucide-react'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import WorkHoursChart from './Chart'
import FaceRecognition from './FaceRecognition'
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";

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
  }, []);

  const loadUserStatus = async () => {
    try {
      const response = await fetch('/api/clock/face-recognition');
      if (response.ok) {
        const data = await response.json();
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
  async function updateTimezone() {
    if (!selected) return;

    try {
      const res = await fetch("/api/clock/timezone", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "set-timezone",
          timezone: selected,
        }),
      });

      const data = await res.json();
      setTimezone(data.timezone);
    } catch (error) {
      console.error('Failed to update timezone:', error);
      alert('Failed to update timezone');
    }
  }

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

  // LOAD STATS
  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/clock/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // LOAD BREAK TYPES
  useEffect(() => {
    fetchBreakTypes();
  }, []);

  const fetchBreakTypes = async () => {
    try {
      const response = await fetch('/api/clock/break');
      const data = await response.json();
      if (data.breakTypes) {
        setBreakTypes(data.breakTypes);
        if (data.activeBreak) {
          setActiveBreak(data.activeBreak.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch break types:', error);
    }
  };

  const handleBreakAction = async (breakType: string, action: 'start' | 'end') => {
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
        } else {
          setActiveBreak(null);
        }
        // Show success message
        const breakTypeName = breakTypes.find(bt => bt.id === breakType)?.name;
        alert(`${breakTypeName} ${action === 'start' ? 'started' : 'ended'} successfully`);
      } else {
        alert(data.error || 'Break action failed');
      }
    } catch (error) {
      console.error('Break action failed:', error);
      alert('Failed to update break status');
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
        
        if (userData.user?.workingAs === 'Developer') {
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
      alert('Failed to initialize face authentication. Please try again.');
    }
  };

  const handlePasswordAuth = async () => {
    if (!password.trim()) {
      alert('Please enter your password');
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
        
        // If clocking out, check for developer workflow or show summary
        if (result.action === 'clock-out-auth') {
          if (result.userWorkingAs === 'Developer') {
            setShowDeveloperPopup(true);
          } else {
            setShowSummaryPopup(true);
          }
        } else {
          alert(`Clock-In Successfully!\n${result.message}`);
          await loadUserStatus();
          await loadStats();
        }
      } else {
        alert(`Authentication failed\n\n${result.error}`);
      }
    } catch (error) {
      console.error('Password auth error:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDeveloperResponse = (pushedCode: boolean) => {
    if (!pushedCode) {
      setShowDeveloperPopup(false);
      alert('Please Commit and push changes');
    } else {
      setShowDeveloperPopup(false);
      setShowSummaryPopup(true);
    }
  };

  const handleWorkSummary = async () => {
    if (!workSummary.trim()) {
      alert('Please provide a work summary');
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
        setShowSummaryPopup(false);
        setWorkSummary('');
        alert(`Clock-out successful!\n${result.message}`);
        await loadUserStatus();
        await loadStats();
      } else {
        alert(`Failed to save work summary\n\n${result.error}`);
      }
    } catch (error) {
      console.error('Work summary error:', error);
      alert('Failed to save work summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleFaceAuthSuccess = async (result: any) => {
    setShowFaceAuth(false);
    
    if (result.action === 'clock-out') {
      // For clock-out, check if user is developer
      if (result.userRole === 'DEVELOPER') {
        setShowDeveloperPopup(true);
      } else {
        setShowSummaryPopup(true);
      }
    } else {
      alert(`Welcome!\n${result.message}`);
      await loadUserStatus();
      await loadStats();
    }
  };

  const handleFaceAuthError = () => {
    setShowFaceAuth(false);
    setShowAuthPopup(true);
  };

  const handleSummarySubmit = async () => {
    if (!workSummary.trim()) {
      alert('Please provide a work summary');
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
        alert('Clock-Out Successfully!\nWork summary saved.');
        setShowSummaryPopup(false);
        setWorkSummary('');
        await loadUserStatus();
        await loadStats();
      } else {
        alert(`Failed to save summary\n\n${result.error}`);
      }
    } catch (error) {
      console.error('Summary save error:', error);
      alert('Failed to save summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleFaceSuccess = async (result: any) => {
    if (faceAuthMode === 'register') {
      alert('Face registered successfully! You can now use face authentication.');
      setShowFaceAuth(false);
      await loadUserStatus();
    } else {
      setShowFaceAuth(false);
      
      // If clocking out, check for developer workflow or show summary
      if (result.action === 'clock-out') {
        // Get user info from API to check workingAs
        const userResponse = await fetch('/api/user');
        const userData = await userResponse.json();
        
        if (userData.user?.workingAs === 'Developer') {
          setShowDeveloperPopup(true);
        } else {
          setShowSummaryPopup(true);
        }
      } else {
        const action = result.action === 'clock-in' ? 'Clocked In' : 'Clocked Out';
        alert(`${action} Successfully!\n${result.message}`);
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
      alert('No face detected\n\nPlease:\n• Position your face clearly in the camera\n• Ensure good lighting\n• Look directly at the camera');
    } else if (error.includes('Multiple faces')) {
      alert('Multiple faces detected\n\nPlease ensure only one person is visible in the camera.');
    } else if (error.includes('not recognized')) {
      alert('Face not recognized\n\nPlease register your face first or use password authentication.');
    } else {
      alert(`Face recognition failed\n\n${error}`);
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

          {/* Change timezone button */}
          {/* <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-3 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                Change Timezone
              </Button>
            </DialogTrigger>

            <DialogContent
              className="
      rounded-3xl
      border border-white/20 
      bg-white/10 
      backdrop-blur-2xl 
      shadow-[0_8px_32px_rgba(0,0,0,0.2)] 
      p-8
      animate-in 
      fade-in-50 
      zoom-in-95
    "
            >
              <DialogHeader>
                <DialogTitle className="text-white text-2xl font-semibold tracking-tight">
                  Select Timezone
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4">
                <Select onValueChange={setSelected}>
                  <SelectTrigger
                    className="
            w-full 
            bg-white/20 
            border border-white/30 
            text-white 
            rounded-xl 
            hover:bg-white/30 
            transition 
            backdrop-blur-md
          "
                  >
                    <SelectValue placeholder="Choose timezone..." />
                  </SelectTrigger>

                  <SelectContent
                    className="
            bg-white/90 
            text-gray-900 
            rounded-xl 
            shadow-lg 
            animate-in 
            slide-in-from-top-2
          "
                  >
                    {allTimezones.map((tz) => (
                      <SelectItem
                        key={tz.code}
                        value={tz.code}
                        className="
                cursor-pointer
                py-2
                hover:bg-gray-200 
                rounded-lg
              "
                      >
                        <span className="font-semibold">{tz.code}</span> — {tz.hours}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={updateTimezone}
                className="
        w-full mt-6 py-3 
        rounded-xl 
        bg-gradient-to-r from-green-500 to-green-700 
        text-white 
        font-semibold 
        shadow-lg 
        hover:scale-[1.02] 
        transition-transform
      "
              >
                Save
              </Button>
            </DialogContent>
          </Dialog> */}

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
            <ScanFace size={32} />
          </div>

          <h1 className="uppercase mt-8 dark:text-gray-400 text-neutral-400 text-center font-semibold text-lg">
            {userStatus?.isLoggedIn ? (
              <span className="text-green-500">You are Logged-IN</span>
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
          );
        })}
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
              Camera not available. Please enter your password to authenticate.
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
                {authLoading ? 'Authenticating...' : 'Authenticate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Developer Popup */}
      {showDeveloperPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 mx-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">Developer Check</h2>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center text-lg">
              Did you push the codes?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleDeveloperResponse(false)}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all hover:scale-105 font-medium"
              >
                No
              </button>
              <button
                onClick={() => handleDeveloperResponse(true)}
                className="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all hover:scale-105 font-medium"
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