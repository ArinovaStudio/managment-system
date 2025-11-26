'use client';
import { ArrowUpFromDot, ClipboardClock, ClockArrowDown, ClockArrowUp, ClockFading, Cloud, Coffee, CookingPot, Play, Siren, Timer, ScanFace, X } from 'lucide-react'
import React, { useState, useEffect } from 'react'
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

    // LOAD USER TIMEZONE
  useEffect(() => {
    async function loadUserTZ() {
      const res = await fetch("/api/clock/timezone");
      const data = await res.json();
      setTimezone(data.timezone);
    }
    loadUserTZ();
  }, []);

    // LOAD ALL TIMEZONES
  useEffect(() => {
    async function loadTZList() {
      const res = await fetch("/api/clock/timezone?action=timezones");
      const data = await res.json();
      setAllTimezones(data.timezones);
    }
    loadTZList();
  }, []);

  // UPDATE TIMEZONE
  async function updateTimezone() {
    if (!selected) return;

    const res = await fetch("/api/clock/timezone", {
      method: "POST",
      body: JSON.stringify({
        action: "set-timezone",
        timezone: selected,
      }),
    });

    const data = await res.json();
    setTimezone(data.timezone);
  }

    // LOAD LEAVES
  useEffect(() => {
    async function loadLeaves() {
      const res = await fetch("/api/clock/leave");
      const data = await res.json();
      setLeaves(data.leaves);
    }
    loadLeaves();
  }, []);

   // LOAD STATS
  useEffect(() => {
    async function loadStats() {
      const res = await fetch("/api/clock/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    }
    loadStats();
  }, []);
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
      } else {
        alert(data.error || 'Break action failed');
      }
    } catch (error) {
      console.error('Break action failed:', error);
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
      const response = await fetch('/api/clock/face-recognition');
      const data = await response.json();
      setUserStatus(data);
      
      if (data.hasFaceRegistered) {
        setFaceAuthMode('authenticate');
      } else {
        setFaceAuthMode('register');
      }
      setShowFaceAuth(true);
    } catch (error) {
      setShowAuthPopup(true); // Fallback to password
    }
  };

  const handlePasswordAuth = async () => {
    if (!password.trim()) {
      alert('Please enter your password');
      return;
    }

    setAuthLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Authentication successful!');
      setShowAuthPopup(false);
      setPassword('');
    } catch (error) {
      alert('Authentication failed!');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFaceSuccess = async (result: any) => {
    if (faceAuthMode === 'register') {
      alert('Face registered successfully! You can now use face authentication.');
      setShowFaceAuth(false);
      // Refresh user status
      const response = await fetch('/api/clock/face-recognition');
      const data = await response.json();
      setUserStatus(data);
    } else {
      alert(result.message || 'Authentication successful!');
      setShowFaceAuth(false);
      // Refresh user status and page data
      const response = await fetch('/api/clock/face-recognition');
      const data = await response.json();
      setUserStatus(data);
      // Optionally reload stats
      window.location.reload();
    }
  };

  const handleFaceError = (error: string) => {
    alert(`Face recognition failed: ${error}`);
    setShowFaceAuth(false);
    setShowAuthPopup(true); // Fallback to password
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
            <span className="text-2xl font-medium">{timezone?.code}</span>
            <br />
            {timezone?.hours}
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
              <div className="w-16 h-16 bg-white/20 rounded-full border border-white/40 text-white text-xl font-bold grid place-items-center">{leaves?.remaining || 0}</div>
              <p className="text-white text-xs text-center mt-1 font-medium">Remaining Leaves</p>
            </div>
            <div className="w-20 h-20 grid place-items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full border border-white/40 text-white text-xl font-bold grid place-items-center">{leaves?.emergency || 0}</div>
              <p className="text-white text-xs text-center mt-1 font-medium">Emergency Leaves</p>
            </div>
            <div className="w-20 h-20 grid place-items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full border border-white/40 text-white text-xl font-bold grid place-items-center">{leaves?.sick || 0}</div>
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
            <div className="">
              <h1 className='text-2xl font-bold dark:text-white traking-tight'>{stats?.avgClockIn || "--"}</h1>
              <p className='text-sm text-gray-400'>Avg. Clock-In</p>
            </div>
          </div>
          <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl flex justify-start items-center gap-2 px-3">
            <div className="w-12 h-12 bg-orange-400/20 text-orange-600 rounded-full grid place-items-center">
              <ClockArrowUp />
            </div>
            <div className="">
              <h1 className='text-2xl font-bold dark:text-white traking-tight'>{stats?.avgClockOut || "--"}</h1>
              <p className='text-sm text-gray-400'>Avg. Clock-Out</p>
            </div>
          </div>
          <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl flex justify-start items-center gap-2 px-3">
            <div className="w-12 h-12 bg-sky-400/20 text-sky-600 rounded-full grid place-items-center">
              <ClockFading />
            </div>
            <div className="">
              <h1 className='text-2xl font-bold dark:text-white traking-tight'>{stats?.avgWorkingHours || "--"}</h1>
              <p className='text-xs text-gray-400'>Avg. Working Hours</p>
            </div>
          </div>
          <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl flex justify-start items-center gap-2 px-3">
            <div className="w-12 h-12 bg-purple-400/20 text-purple-500 rounded-full grid place-items-center">
              <ClipboardClock />
            </div>
            <div className="">
              <h1 className='text-2xl font-bold dark:text-white traking-tight'>{stats?.totalPayPeriod || "--"}</h1>
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
          <h1 className='text-center mx-auto font-bold text-2xl dark:text-white'>Let's Start Today's Work</h1>
          <p className='text-center mx-auto text-base dark:text-gray-400 text-neutral-400 mt-2'>Please verify with face recognition and Clock-In</p>
          <div 
            onClick={handleFaceAuth}
            className="mx-auto cursor-pointer w-20 mt-6 h-20 bg-sky-400 shadow-[inset_4px_5px_7px_0px_#ffffff90] rounded-full grid place-items-center text-white hover:scale-105 transition-transform"
          >
            <ScanFace size={32} />
          </div>

          <h1 className="uppercase mt-8 dark:text-gray-400 text-neutral-400 text-center font-semibold text-lg">
            {userStatus?.isLoggedIn ? 'You are Logged-IN' : 'You are not Logged-IN'}
          </h1>
          
          {userStatus?.hasFaceRegistered && (
            <p className="text-xs text-center text-green-500 mt-2">
              ✅ Face Recognition Enabled
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
              <div className="">
                <h1 className='text-2xl font-bold traking-tighter'>{breakType.name}</h1>
                <p className="text-xs text-neutral-400">{breakType.description.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}</p>
              </div>

              <button 
                onClick={() => handleBreakAction(breakType.id, isActive ? 'end' : 'start')}
                disabled={loading}
                className={`w-12 h-12 ${colors.accent} ${colors.text} ${breakType.id === 'meal' ? 'ml-12' : breakType.id === 'emergency' ? 'ml-12' : 'ml-8'} rounded-full grid place-items-center hover:scale-105 transition-transform ${loading ? 'opacity-50' : ''}`}
              >
                {isActive ? (
                  <div className="w-3 h-3 bg-current rounded-full" />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-[500px] mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">
                {faceAuthMode === 'register' ? 'Register Your Face' : 'Face Authentication'}
              </h2>
              <button 
                onClick={() => setShowFaceAuth(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X size={20} className="dark:text-white" />
              </button>
            </div>
            
            <FaceRecognition
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-96 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">Authentication Required</h2>
              <button 
                onClick={() => setShowAuthPopup(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
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
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordAuth()}
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowAuthPopup(false)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordAuth}
                disabled={authLoading}
                className="flex-1 py-2 px-4 bg-sky-400 text-white rounded-lg hover:bg-sky-500 disabled:opacity-50"
              >
                {authLoading ? 'Authenticating...' : 'Authenticate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clock
