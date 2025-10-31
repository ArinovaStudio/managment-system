import CertCards from '@/components/certificates/CertCards'
import Wrapper from '@/layout/Wrapper'
import React from 'react'

function Card() {
  return (
          <div className="w-80 h-80 mt-6 border-2 bg-white dark:bg-white/[0.03] dark:text-white border-gray-200 dark:border-gray-600 rounded-2xl realtive flex justify-end items-start px-4 py-2.5 flex-col gap-2 relative">
          <div className="absolute w-5/6 h-4/5 rounded-xl -top-10 left-6">
            <img 
            src="https://picsum.photos/1080/1080"
            alt="image"
            className="w-full h-full object-cover rounded-xl"
            />
          </div>
            <h1 className="font-semibold captalize text-xl">Internship certificate</h1>
            <button className="w-full py-2 text-blue-400 hover:bg-blue-300/60 transition-all font-bold rounded-lg text-center px-4 bg-blue-300/20">Download</button>
          </div>
  )
}


function page() {
  return (
    <Wrapper>
        <div className="flex flex-wrap justify-start items-center gap-10 gap-y-14">
            <Card />
            <Card />
            <Card />
        </div>
    </Wrapper>
  )
}

export default page