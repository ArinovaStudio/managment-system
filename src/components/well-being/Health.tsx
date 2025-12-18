import React from 'react'
import WellCard from './WellCard'
import WellBeingSection from './cards'

function Health({ wellBeingData }: { wellBeingData: any[] }) {
  return (
    <div className='w-full mt-4 h-[100vh] flex flex-col lg:flex-row justify-start items-start gap-4'>
      <div className="w-full lg:w-3/5 h-full overflow-y-auto no-scrollbar flex justify-start items-start flex-col gap-6 pr-2">
        {wellBeingData.length > 0 ? (
          wellBeingData.map((item, index) => (
            <WellCard key={index} data={item} />
          ))
        ) : (
          <div className="w-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No wellness tips available</p>
          </div>
        )}
      </div>
      <div className="w-full lg:w-2/5 h-full ">
        <WellBeingSection />
      </div>
    </div>
  )
}

export default Health