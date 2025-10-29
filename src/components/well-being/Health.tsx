import React from 'react'
import WellCard from './WellCard'
import WellBeingGrid from './cards'
import WellBeingSection from './cards'

function Health() {
  return (
    <div className='w-full mt-4 min-h-[70vh] flex justify-start items-start gap-4'>
          <div className="w-3/5 h-auto lex justify-start items-start flex-col gap-6">
        <WellCard />
        <WellCard />
        </div>
        <WellBeingSection />  
    </div>
  )
}

export default Health