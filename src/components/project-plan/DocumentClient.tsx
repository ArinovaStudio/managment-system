"use client";

import RichTextEditor from '@/components/common/editor/Editor'
import Loader from '@/components/common/Loading';
import { LucideArrowLeft, LucideLoader2, LucideTrash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useTransition } from 'react'
import toast from 'react-hot-toast';

function DocumentClient() {
    const [data, setData] = useState("")
    const [name, setName] = useState("")
    const [currentUser, setCurrentUser] = useState("")
    const params = useSearchParams()
    const [isLoading, setLoading] = useState(false);
    const [transition, startTransition] = useTransition();

    const router = useRouter()
    const id = params.get("id")

    
const handleCreate = () =>
  startTransition(() => {
    (async () => {
      const content = data.trim()
      if (!content) {
        toast.error("Please add something first.")
        return
      }

      const req = await fetch("/api/admin/plan-docs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          content,
          createdBy: currentUser,
        }),
      })

      if (req.ok) {
        toast.success("Saved.")
      }
    })()
  })


const handleUpdate = () => startTransition(() => {
      (async () => {
        const content = data.trim()
        if (!content) {
          return toast.error("Please add something first.")
        }
  
        const req = await fetch("/api/admin/plan-docs", {
          method: "PUT",
          body: JSON.stringify({id, name, content})
        })
  
        if (req.status === 200) {
          const data = await req.json();
          const props = data.data;
          setData(props.content);
          setName(props.name);
          toast.success("Updated.")
        }
      })()
    })

const handleDelete = () => startTransition(() => {
  (
    async () => {
      if (!id) {
        return toast.error("Please provide id");
      }
        const req = await fetch(`/api/admin/plan-docs?id=${id}`, {
          method: "DELETE",
        })
        if (req.status === 200) {
          toast.success("Deleted successfully!")
          router.back()
        }
    }
  )()
})

    const fetchSpec = async (id: string) => {
    setLoading(true)
    const req = await fetch(`/api/admin/plan-docs?id=${id}`);
    if (req.status === 200) {
      const data = await req.json();
      const props = data.data[0];
      setData(props.content);
      setName(props.name);
      setLoading(false)
    }
  }

    const checkUserRole = async () => {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        if (data.user) {
        setCurrentUser(data.user.name);
        }
      } catch (error) {
        console.error('Failed to check user role:', error);
      }
    };

  useEffect(() => {
  checkUserRole()

  if (id) {
    fetchSpec(id)
  }
  }, [])

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] grid place-items-center">
        <Loader />
      </div>
    )
  }
  return (
    <div className='w-full'>
      <div className="flex justify-between mb-6">
        <div className="flex justify-center items-center gap-2">
        <button onClick={() => router.back()} className='text-blue-white bg-gray-400/20 text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3'>
          <LucideArrowLeft size={18}/>
        </button>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className='text-gray-400 bg-gray-200 dark:bg-gray-800 py-2 px-2 rounded-lg outline-none border border-gray-300 dark:border-gray-700'/>
        </div>
        <div className="flex justify-center items-center gap-2">
        <button onClick={id ? handleUpdate : handleCreate} className='text-blue-white bg-blue-600 text-white font-medium rounded-xl px-4 py-2'>{transition ? <LucideLoader2 className='animate-spin text-white' size={16}/> : id ? "Update" : "Save"}</button>
        {id && 
        <button onClick={handleDelete} className='text-blue-white bg-red-400/20 text-red-400 rounded-xl px-4 py-3'>
          <LucideTrash2 size={18}/>
        </button>
        }
        
        </div>
      </div>
        <div className="w-full">
            <RichTextEditor 
            isBigEditor={true}
            content={data}
            onChange={(e) => setData(e)}
            />
            </div>
        </div>
  )
}

export default DocumentClient