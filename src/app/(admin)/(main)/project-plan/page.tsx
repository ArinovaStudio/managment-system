"use client";

import Loader from '@/components/common/Loading';
import { FolderOpen, LucidePlus } from 'lucide-react'
import Link from 'next/link';
import { useEffect, useState } from 'react';

function page() {
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  const fetchAll = async () => {
    setLoading(true)
    const req = await fetch("/api/admin/plan-docs");
    if (req.status === 200) {
      const data = await req.json();
      setData(data.data)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll();
  }, [])
  if (isLoading) {
        return (
      <div className="w-full h-[60vh] grid place-items-center">
        <Loader />
      </div>
    )
  }
  return (
    <div className='w-full h-full'>
            <h1 className="text-3xl font-bold mb-4">Plan Docs</h1>
            <div className="grid grid-col-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Link href={"/project-plan/document"} className="w-full h-80 border border-purple-900 rounded-lg bg-purple-600/10 text-purple-400 grid place-items-center">
                    <div className="flex flex-col justify-center items-center">
                    <LucidePlus size={80} strokeWidth={1} className='leading-0'/>
                    <p>New Document</p>
                    </div>
                </Link>
            {
              data.length > 0 && data.map((items, index) => (
                <Link href={`/project-plan/document?id=${items.id}`} key={index} className="w-full h-80 border border-gray-700 rounded-lg bg-gray-600/10 text-gray-400 grid place-items-center">
                    <div className="flex flex-col justify-center items-center">
                    <FolderOpen strokeWidth={1.2} size={42} />
                    <p className='text-xl font-semibold dark:text-white text-black mt-3'>{items.name}</p>
                    <p className='text-base mt-1 font-normal text-gray-500 dark:text-gray-400'>{items.createdBy}</p>
                    <p className='text-xs font-normal text-gray-500 dark:text-gray-400'>{new Date(items.createdAt.split("T")[0]).toDateString()}</p>

                    </div>
                </Link>
              ))
            }
              

            </div>
    </div>
  )
}

export default page