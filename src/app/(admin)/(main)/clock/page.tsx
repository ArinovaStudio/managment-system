import { Sticker, Timer } from 'lucide-react'
import React from 'react'



function page() {
  return (
    <div className='w-full flex-col justify-start items-start gap-4'>
      <div className="w-full h-62 flex justify-start items-start gap-4">
        <div className="w-[28%] h-full bg-gradient-to-br from-green-900 to-green-300 relative rounded-3xl p-6 flex justify-end items-start flex-col">
          <div className="absolute left-[75%] top-6 w-14 h-14 rounded-full bg-white/40 grid place-items-center">
          <Timer className="mb-1" color="white" size={26} />
          </div>
                    <h1 className="text-5xl font-bold text-white text-left mb-3"><span className="text-2xl font-medium">IND</span> <br />10AM-5PM</h1>
          <h1 className="text-xl text-right w-full text-white mt-4">Selected Time Zone</h1>
        </div>

                <div className="w-[35%] h-full bg-gradient-to-br from-indigo-700 to-indigo-300 rounded-3xl p-6 pb-0 relative flex flex-col gap-3 justify-start items-start">
                            <div className="absolute left-[80%] top-4 w-14 h-14 rounded-full bg-white/40 grid place-items-center">
                                      <Sticker color="white" size={26} />
                            </div>
                  <button className="w-auto px-4 py-1 bg-white border-2 border-white/30 rounded-full mb-4 text-xs text-purple-500">Apply For Leave</button>
                  <div className="w-full flex justify-between items-center px-4 mt-2">
                  <div className="w-20 h-20 grid place-items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full border border-white/40"></div>
                    <p className="text-white text-xs text-center mt-1 font-medium">Remaining Leaves</p>
                  </div>
                  <div className="w-20 h-20 grid place-items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full border border-white/40"></div>
                    <p className="text-white text-xs text-center mt-1 font-medium">Emergency Leaves</p>
                  </div>
                  <div className="w-20 h-20 grid place-items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full border border-white/40"></div>
                    <p className="text-white text-xs text-center mt-1 font-medium">Sick <br /> Leaves</p>
                  </div>

                  </div>
          <h1 className="text-xl text-right w-full text-white mt-4">Leaves Information</h1>

                </div>
        
        <div className="w-[35%] h-full flex flex-wrap justify-between items-start gap-3">
          <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl"></div>
          <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl"></div>
          <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl"></div>
          <div className="w-[48%] h-[45%] bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl"></div>
        </div>

      </div>

      <div className="w-full h-80 mt-4 flex justify-start items-start gap-4">
        <div className="w-3/5 h-full bg-white rounded-3xl"></div>
        <div className="w-2/5 h-full bg-white rounded-3xl"></div>
      </div>

    <div className="w-full h-32 mt-4 flex justify-start items-center gap-4">
    <div className="w-1/3 h-full bg-white rounded-2xl"></div>
        <div className="w-1/3 h-full bg-white rounded-2xl"></div>  
    <div className="w-1/3 h-full bg-white rounded-2xl"></div>  
  
    </div>   
    </div>
  )
}

export default page
