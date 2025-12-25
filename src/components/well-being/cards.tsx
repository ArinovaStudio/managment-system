"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets,
  Clock,
  ChartPie,
  Wind,
  Sparkles,
  MonitorOff,
  LucideEdit3,
} from "lucide-react";

const Card = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="w-full h-52 text-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-5 py-5 shadow-sm overflow-hidden relative flex flex-col justify-between"
  >
    <div className="flex-1 flex flex-col justify-center items-center">{children}</div>
    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 text-center mt-3">
      {title}
    </h3>
  </motion.div>
);



// ---------- 💧 1. Water Intake ----------
export const WaterIntakeCard = () => {
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    fetchWaterIntake();
  }, []);

  const fetchWaterIntake = async () => {
    try {
      const res = await fetch('/api/well-being', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get' })
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.amount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch water intake:', error);
    }
  };

  const handleDrink = async () => {
    try {
      const res = await fetch('/api/well-being', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', amount: 250 })
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.amount);
      }
    } catch (error) {
      console.error('Failed to update water intake:', error);
    }
  };

  return (
    <Card title="Drink Water (2L)">
      <div
        className="relative flex flex-col items-center justify-center h-full w-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AnimatePresence>
          {hovered && (
            <motion.svg
              className="absolute bottom-0 left-0 w-full h-full"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              style={{ transform: "scaleY(-1)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.path
                fill="#3b82f6"
                fillOpacity="0.4"
                d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,160C672,128,768,96,864,112C960,128,1056,192,1152,197.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L0,320Z"
                animate={{
                  d: [
                    "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,160C672,128,768,96,864,112C960,128,1056,192,1152,197.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L0,320Z",
                    "M0,180L60,190C120,200,240,220,360,200C480,180,600,120,720,100C840,80,960,120,1080,140C1200,160,1320,160,1380,150L1440,140L1440,320L0,320Z",
                  ],
                }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                style={{ transform: `translateY(${100 - (progress / 2000) * 100}%)` }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
        <Droplets className="text-blue-600 z-10 mb-1" size={32} />
        <p className="z-10 dark:text-white text-gray-700 text-sm">
          {progress}ml / 2000ml
        </p>
        <p className="z-10 dark:text-white text-gray-600 text-sm captalize my-2 mb-3">
          Drink at least 2L. water during working hours.
        </p>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDrink}
          className="z-10 px-6 py-1 bg-blue-500 text-white text-xs rounded-full shadow"
        >
          + Drink 250ml
        </motion.button>
      </div>
    </Card>
  );
};


// ---------- 🧘 2. Stretch Reminder ----------
export const StretchCard = () => {
  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (started && seconds < 300) {
      const timer = setTimeout(() => setSeconds((s) => s + 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [started, seconds]);

  return (
    <Card title="Stretch for 5 Minutes">
      <div className="flex flex-col items-center justify-center h-full">
        <motion.div
          animate={started ? { rotate: [0, 15, -15, 0] } : {}}
          transition={started ? { repeat: Infinity, duration: 2 } : {}}
          className="w-14 h-14 rounded-full bg-green-400/40 flex items-center justify-center"
        >
          <Clock className="text-green-600" />
        </motion.div>
        <p className="text-gray-600 mt-2 text-sm">
          {started
            ? `Time left: ${Math.floor((300 - seconds) / 60)}:${String(
                (300 - seconds) % 60
              ).padStart(2, "0")}`
            : "Every 2 hours, stretch for 5 min"}
        </p>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { started ? () => {} :
            setStarted(true);
            setSeconds(0);
          }}
          className="mt-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full"
        >
          {started ? "In Progress..." : "Start Stretch"}
        </motion.button>
      </div>
    </Card>
  );
};


// ---------- 💺 3. Posture ----------
export const PostureCard = () => {
  const [hovered, setHovered] = useState(false);
  return (
    <Card title="Maintain Good Posture">
      <div
        className="relative flex flex-col items-center justify-center h-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <ChartPie className="text-indigo-600 z-10" size={36} />
        <p className="text-gray-600 z-10 mt-2 text-sm">
          Sit straight, feet flat, relaxed shoulders
        </p>
      </div>
    </Card>
  );
};


// ---------- 🌬️ 4. Breathing ----------
export const BreathingCard = () => {
  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (started && seconds < 300) {
      const timer = setTimeout(() => setSeconds((s) => s + 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [started, seconds]);

  return (
    <Card title="Deep Breathing (5 min)">
      <div className="flex flex-col items-center justify-center h-full">
        <motion.div
          animate={
            started
              ? { scale: [1, 1.4, 1] }
              : {}
          }
          transition={
            started
              ? { repeat: Infinity, duration: 4, ease: "easeInOut" }
              : {}
          }
          className="w-16 h-16 rounded-full bg-cyan-400/30 flex items-center justify-center"
        >
          <Wind className="text-cyan-600" />
        </motion.div>
        <p className="text-gray-600 mt-2 text-sm">
          {started
            ? `Remaining: ${Math.floor((300 - seconds) / 60)}:${String(
                (300 - seconds) % 60
              ).padStart(2, "0")}`
            : "Click to start 5 min session"}
        </p>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            started ? () => {} : setStarted(true); setSeconds(0);
          }}
          className="mt-2 bg-cyan-500 text-white text-xs px-3 py-1 rounded-full"
        >
          {started ? "In Progress..." : "Start Breathing"}
        </motion.button>
      </div>
    </Card>
  );
};


// ---------- ✍️ 5. Positive Thought ----------
export const PositiveThoughtCard = () => {
  const [thought, setThought] = useState("");
  const [sparkle, setSparkle] = useState(false);

  const handleSubmit = async () => {
    if (!thought.trim()) return;
    
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote: thought })
    });

    if (res.ok) {
      setSparkle(true);
      setTimeout(() => setSparkle(false), 2000);
      setThought("");
    }
  };

  return (
    <Card title="">
      <div className="flex flex-col items-center justify-center h-full relative">
        <LucideEdit3 className={"text-yellow-500 mb-2"} size={34} />
        <p className="text-xs text-gray-800 font-medium dark:text-white my-2.5">After a long working day, you can finish with a beautiful quote</p>
        <input
          type="text"
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          placeholder="I'm grateful for..."
          className="w-full text-xs rounded-lg border border-gray-300 px-2 py-1 dark:text-white text-gray-700 dark:bg-transparent"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSubmit}
          className="mt-4 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full"
        >
          Share
        </motion.button>
        <AnimatePresence>
          {sparkle && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute top-2 text-yellow-400"
            >
              <Sparkles size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};


// ---------- 📵 6. Screen Time ----------
export const ScreenTimeCard = () => {
  const [dim, setDim] = useState(false);

  return (
    <Card title="Reduce Screen Time">
      <div className="flex flex-col items-center justify-center h-full">
        <motion.div
          className="absolute bg-black inset-0 w-full h-full"
          animate={{ opacity: dim ? 0.7 : 0 }}
          transition={{ duration: 0.8 }}
        />
        <MonitorOff className="z-10 dark:text-white text-gray-700" size={36} />
        <p className="z-10 dark:text-white text-gray-700 mt-2 text-sm">
          {dim ? "Break Mode Active" : "Eyes deserve rest!"}
        </p>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setDim(!dim)}
          className="z-10 mt-2 bg-gray-700 text-white text-xs px-3 py-1 rounded-full"
        >
          {dim ? "Resume Work" : "Take Screen Break"}
        </motion.button>
      </div>
    </Card>
  );
};


// ---------- 🧩 Default Export ----------
export default function WellBeingSection() {
  return (
    <div className="w-full mt-4 sticky top-0 h-auto grid grid-cols-1 md:grid-cols-2 gap-4">
      <WaterIntakeCard />
      <StretchCard />
      <PostureCard />
      <BreathingCard />
      <PositiveThoughtCard />
      <ScreenTimeCard />
    </div>
  );
}
