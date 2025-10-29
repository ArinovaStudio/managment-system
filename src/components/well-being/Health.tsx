import React from 'react'
import WellCard from './WellCard'

function Health() {
  return (
    <div className='w-full mt-4 min-h-[70vh] flex justify-start items-start gap-4'>
          <div className="w-3/5 h-auto lex justify-start items-start flex-col gap-6">
        <WellCard />
        <WellCard />

        </div>
        <div className="w-2/5 mt-4 h-full flex flex-wrap justify-between items-start gap-4">
          <div className="w-[48%] h-48 rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03]"></div>
          <div className="w-[48%] h-48 rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03]"></div>
        </div>
    </div>
  )
}

export default Health