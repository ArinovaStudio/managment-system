import { ArrowUpFromDot, ClipboardClock, ClockArrowDown, ClockArrowUp, ClockFading, Cloud, Coffee, CookingPot, Play, Siren, Timer, ScanFace } from 'lucide-react'
import React from 'react'
import WorkHoursChart from './Chart'




function page() {
  return (
    <div className='w-full flex-col justify-start items-start gap-4'>
      <div className="w-full h-62 flex justify-start items-start gap-4">
        <div className="w-[28%] h-full bg-gradient-to-br from-green-900 to-green-300 relative rounded-3xl p-6 flex justify-end items-start flex-col">
          <div className="absolute left-[75%] top-4 w-14 h-14 rounded-full bg-white/40 grid place-items-center">
          <Timer className="mb-1" color="white" size={26} />
          </div>
                    <h1 className="text-5xl font-bold text-white text-left mb-3"><span className="text-2xl font-medium">IND</span> <br />10AM-5PM</h1>
          <h1 className="text-xl text-right w-full text-white mt-4">Selected Time Zone</h1>
        </div>

                <div className="w-[35%] h-full bg-gradient-to-br from-sky-700 to-sky-300 rounded-3xl p-6 pb-0 relative flex flex-col gap-3 justify-center items-center">
                            <div className="absolute left-[80%] top-4 w-14 h-14 rounded-full bg-white/40 grid place-items-center">
                                      <Cloud color="white" size={26} />
                            </div>
                  <div className="w-full flex justify-between items-center px-4 mt-8">
                  <div className="w-20 h-20 grid place-items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full border border-white/40 text-white text-xl font-bold grid place-items-center">10</div>
                    <p className="text-white text-xs text-center mt-1 font-medium">Remaining Leaves</p>
                  </div>
                  <div className="w-20 h-20 grid place-items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full border border-white/40 text-white text-xl font-bold grid place-items-center">10</div>
                    <p className="text-white text-xs text-center mt-1 font-medium">Emergency Leaves</p>
                  </div>
                  <div className="w-20 h-20 grid place-items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full border border-white/40 text-white text-xl font-bold grid place-items-center">10</div>
                    <p className="text-white text-xs text-center mt-1 font-medium">Sick <br /> Leaves</p>
                  </div>

                  </div>
          <h1 className="text-xl text-right w-full text-white mt-4">Leaves Information</h1>

                </div>
        
        <div className="w-[35%] h-full flex flex-wrap justify-between items-start gap-3">
          <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl flex justify-start items-center gap-2 px-3">
            <div className="w-12 h-12 bg-green-400/20 text-green-600 rounded-full grid place-items-center">
              <ClockArrowDown />
            </div>
            <div className="">
              <h1 className='text-2xl font-bold dark:text-white traking-tight'>9:00AM</h1>
              <p className='text-sm text-gray-400'>Avg. Clock-In</p>
            </div>
          </div>
                   <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl flex justify-start items-center gap-2 px-3">
            <div className="w-12 h-12 bg-orange-400/20 text-orange-600 rounded-full grid place-items-center">
              <ClockArrowUp />
            </div>
            <div className="">
              <h1 className='text-2xl font-bold dark:text-white traking-tight'>9:00AM</h1>
              <p className='text-sm text-gray-400'>Avg. Clock-Out</p>
            </div>
          </div>
                    <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl flex justify-start items-center gap-2 px-3">
            <div className="w-12 h-12 bg-sky-400/20 text-sky-600 rounded-full grid place-items-center">
              <ClockFading />
            </div>
            <div className="">
              <h1 className='text-2xl font-bold dark:text-white traking-tight'>19:00AM</h1>
              <p className='text-xs text-gray-400'>Avg. Working Hours</p>
            </div>
          </div>
                    <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl flex justify-start items-center gap-2 px-3">
            <div className="w-12 h-12 bg-purple-400/20 text-purple-500 rounded-full grid place-items-center">
              <ClipboardClock />
            </div>
            <div className="">
              <h1 className='text-2xl font-bold dark:text-white traking-tight'>9:00AM</h1>
              <p className='text-sm text-gray-400'>Total pay period</p>
            </div>
          </div>
        </div>

      </div>

      <div className="w-full h-80 mt-4 flex justify-start items-start gap-4">
        <div className="w-3/5 h-full bg-white dark:bg-white/[0.03] rounded-3xl">
        <WorkHoursChart />
        </div>
        <div className="w-2/5 h-full bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-3xl p-8 shadow-[inset_-4px_-7px_19px_-4px_rgba(0,_0,_0,_0.1)]">
        <h1 className='text-center mx-auto font-bold text-2xl dark:text-white'>Let's Start Today's Work</h1>
        <p className='text-center mx-auto text-base dark:text-gray-400 text-neutral-400 mt-2'>Please verify with face recognition and Clock-In</p>
        <div className="mx-auto cursor-pointer w-20 mt-6 h-20 bg-sky-400 shadow-[inset_4px_5px_7px_0px_#ffffff90] rounded-full grid place-items-center text-white">
          <ScanFace size={32} />
        </div>

        <h1 className="uppercase mt-8 dark:text-gray-400 text-neutral-400 text-center font-semibold text-lg">You are not Logged-IN</h1>
        <p className='text-center text-xl font-medium uppercase text-gray-500'>10:00AM</p>

        </div>
      </div>



    <div className="w-full h-32 mt-4 flex justify-start items-center gap-4">
    <div className="w-1/3 h-full bg-white dark:bg-white/[0.03] dark:text-white rounded-2xl flex justify-start p-4 items-center gap-3">
      <div className="w-20 h-5/6 bg-purple-500 text-white rounded-xl grid place-items-center">
      <Coffee size={28} strokeWidth={1.6} />
      </div>
      <div className="">
        <h1 className='text-2xl font-bold traking-tighter'>Take a Break</h1>
        <p className="text-xs text-neutral-400">Pissed with work? <br /> Take a 15min. Break</p>
      </div>

      <div className="w-12 h-12 bg-purple-300/20 text-purple-500 ml-8 rounded-full grid place-items-center">
      <Play size={22}/>
      </div>
    </div>
    <div className="w-1/3 h-full bg-white dark:bg-white/[0.03] dark:text-white rounded-2xl flex justify-start p-4 items-center gap-3">
      <div className="w-20 h-5/6 bg-yellow-500 text-white rounded-xl grid place-items-center">
      <CookingPot size={28} strokeWidth={1.6} />
      </div>
      <div className="">
        <h1 className='text-2xl font-bold traking-tighter'>Meal Break</h1>
        <p className="text-xs text-neutral-400">Food is here? <br /> Take a 30min. Break</p>
      </div>

      <div className="w-12 h-12 bg-yellow-300/20 text-yellow-500 ml-12 rounded-full grid place-items-center">
      <Play size={22}/>
      </div>
    </div>
        <div className="w-1/3 h-full bg-white dark:bg-white/[0.03] dark:text-white rounded-2xl flex justify-start p-4 items-center gap-3">
      <div className="w-20 h-5/6 bg-red-500 text-white rounded-xl grid place-items-center">
      <Siren size={28} strokeWidth={1.6} />
      </div>
      <div className="">
        <h1 className='text-2xl font-bold traking-tighter'>Emergency</h1>
        <p className="text-xs text-neutral-400">Everything is alright? <br />Request for break!</p>
      </div>

      <div className="w-12 h-12 bg-red-300/20 text-red-500 ml-12 rounded-full grid place-items-center">
      <ArrowUpFromDot size={22}/>
      </div>
    </div>
  
    </div>   
    </div>
  )
}

export default page
