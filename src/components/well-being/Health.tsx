import React from 'react'
import WellCard from './WellCard'
import WellBeingSection from './cards'

function Health({ wellBeingData }: { wellBeingData: any[] }) {
  return (
    <div className='w-full mt-4 min-h-[70vh] flex justify-start items-start gap-4'>
      <div className="w-3/5 h-auto flex justify-start items-start flex-col gap-6">
        {wellBeingData.length > 0 ? (
          wellBeingData.map((item, index) => (
            <WellCard key={index} data={item} />
          ))
        ) : (
          <div className="text-gray-500 dark:text-gray-400 mt-8">No wellness tips available</div>
        )}
      </div>
      <WellBeingSection />  
    </div>
  )
}

export default Health