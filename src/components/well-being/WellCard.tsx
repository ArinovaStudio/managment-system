import React from 'react'
import { Bookmark, LucideArrowBigDown } from 'lucide-react'


function WellCard() {
  return (
        <div className="h-full mt-4">
          <div className="w-full h-auto min-h-40 p-4 pb-12 relative rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
           <div className="absolute right-6 -top-2 bg-yellow-200/30 text-yellow-400 rounded-full text-sm py-0.5 px-4">💡 Tips</div>
          <h1 className="text-2xl font-semibold dark:text-white mb-2">Does your back hurts?</h1>
          <p className='text-neutral-700 dark:text-white'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus, rem magnam fugiat non ratione aspernatur, ullam iusto facere nostrum, voluptate inventore sint nihil ex nisi quidem ad itaque ea necessitatibus officia repellat laborum! Soluta!</p>
          <div className="w-full h-8 px-4 absolute bottom-2 left-0 flex justify-end items-end gap-4">

            <div className="justify-center items-center dark:text-white/30 text-gray-400  gap-2 flex-col">
            <div className="rotate-180">
            <LucideArrowBigDown strokeWidth={1} size={20} />
            </div>
             <span className="text-xs">100</span>
            </div>

            <div className="justify-center items-center dark:text-white/30 text-gray-400  gap-2 flex-col">
            <div>
            <LucideArrowBigDown strokeWidth={1} size={20} />
            </div>
             <span className="text-xs">100</span>
            </div>
            
            <div className="justify-center items-center dark:text-white/30 text-gray-400  gap-2 flex-col">
            <div>
            <Bookmark strokeWidth={1} size={20} />
            </div>
             <span className="text-xs">100</span>
            </div>
            
          </div>
          </div>
        </div>
  )
}

export default WellCard