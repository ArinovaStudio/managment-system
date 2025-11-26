"use client";
import React, { useState } from 'react'
import { Bookmark, LucideArrowBigDown } from 'lucide-react'

function WellCard({ data }: { data?: any }) {
  const [likes, setLikes] = useState(data?.likes || 0);
  const [dislikes, setDislikes] = useState(data?.dislikes || 0);

  return (
        <div className="h-full mt-4">
          <div className="w-full h-auto min-h-40 p-4 pb-12 relative rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
           <div className="absolute right-6 -top-2 bg-yellow-200/30 text-yellow-400 rounded-full text-sm py-0.5 px-4">💡 Tips</div>
          <h1 className="text-2xl font-semibold dark:text-white mb-2">{data?.title || 'Wellness Tip'}</h1>
          <p className='text-neutral-700 dark:text-white'>{data?.answer || 'No content available'}</p>
          <div className="w-full h-8 px-4 absolute bottom-2 left-0 flex justify-end items-end gap-4">

            <button onClick={() => setLikes(prev => prev + 1)} className="justify-center items-center dark:text-white/30 text-gray-400 gap-2 flex-col hover:text-green-500">
            <div className="rotate-180">
            <LucideArrowBigDown strokeWidth={1} size={20} />
            </div>
             <span className="text-xs">{likes}</span>
            </button>

            <button onClick={() => setDislikes(prev => prev + 1)} className="justify-center items-center dark:text-white/30 text-gray-400 gap-2 flex-col hover:text-red-500">
            <div>
            <LucideArrowBigDown strokeWidth={1} size={20} />
            </div>
             <span className="text-xs">{dislikes}</span>
            </button>
            
            <button className="justify-center items-center dark:text-white/30 text-gray-400 gap-2 flex-col hover:text-blue-500">
            <div>
            <Bookmark strokeWidth={1} size={20} />
            </div>
             <span className="text-xs">Save</span>
            </button>
            
          </div>
          </div>
        </div>
  )
}

export default WellCard