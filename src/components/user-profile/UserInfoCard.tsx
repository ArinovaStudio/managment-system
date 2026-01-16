"use client";

import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { LucideLoader2, RotateCcwKey } from "lucide-react";

interface User {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  projectMembers?: number;
  bio?: string;
  workingAs?: string;
  department?: string;
  dob?: string;
  employeeId?: string;
  role?: string;
  createdAt?: string;
}

interface UserInfoCardProps {
  user: User | null;
  onUpdate?: (updatedData: Partial<User>) => void;
}

export default function UserInfoCard({ user, onUpdate }: UserInfoCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [changePasswordOpen, setChangePassword] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState(0)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (!user) return null;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    department: "",
    workingAs: "",
    dob: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        department: user.department || "",
        workingAs: user.workingAs || "",
        dob: user.dob || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleSave = () => {
    onUpdate?.(formData);
    closeModal();
  };

  const verifyPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
      const req = await fetch(`/api/change-pass?oldPass=${oldPassword.trim()}`)
      const data = await req.json()
      if (req.status === 200) {
        setStep(1)
        setError("")
        setLoading(false)
      }
      setError(data.error)
      setLoading(false)
  }


  const changePass = async (e) => {
    e.preventDefault()
    if (newPass !== confirmPassword) {
      return setError("Password & Confirm password didn't match.")
    }
    if (newPass === oldPassword) {
      return setError("Ops! You have entered your same old password.")
    }
    if (newPass.length < 6) {
      return setError("Password must be atleast of 6 characters")
    }

    setLoading(true)
      const req = await fetch(`/api/change-pass`, {
        method: "PUT",
        body: JSON.stringify({newPass: newPass})
      })
      const data = await req.json()
      if (req.status === 200) {
        setStep(0)
        setError("")
        setNewPass("")
        setOldPassword("")
        setConfirmPassword("")
        setLoading(false)
      }
      setError(data.error)
      setLoading(false)
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* LEFT SIDE DISPLAY */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Full Name</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.name || "Not provided"}
              </p>
            </div>
          { user.role !== "CLIENT" ? 
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Employee ID</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.employeeId || "Not provided"}
              </p>
            </div> 
            : null
            }

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.phone || "Not provided"}
              </p>
            </div>
          { user.role !== "CLIENT" ? 
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Department</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.department || "Not provided"}
              </p>
            </div> 
            : null
            }



          <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.email || "Not provided"}
              </p>
            </div>



          { user.role !== "CLIENT" ? 
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Position</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.workingAs || "Not provided"}
              </p>
            </div> 
            : null
            }
          </div>
        </div>

        {/* EDIT BUTTON */}
        <div className="flex justify-center items-center gap-3">
        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206Z"
            />
          </svg>
          Edit
        </button>
      
      <button
          onClick={() => setChangePassword(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 lg:inline-flex lg:w-auto"
        >
          <RotateCcwKey size={18} />
          Change Password
        </button>
        </div>
      </div>

      {/* EDIT MODAL */}
      <Modal isOpen={isOpen} onClose={closeModal}  className="max-w-[700px] m-4">
        <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Update your details to keep your profile up-to-date.
            </p>
          </div>

          <form className="flex flex-col">
            <div className="h-auto overflow-y-auto px-2 pb-3">
              
              {/* PERSONAL INFO */}
              <h5 className="mt-7 mb-5 text-lg font-medium text-gray-800 dark:text-white/90">
                Personal Information
              </h5>

              <div className="grid grid-cols-1 gap-y-5 lg:grid-cols-2 gap-x-6">
                <div className="">
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="lg:col-span-2">
  <Label>Bio</Label>
  <textarea
    value={formData.bio}
    onChange={(e) =>
      setFormData({ ...formData, bio: e.target.value })
    }
    rows={5}
    placeholder="Write a short bio..."
    className="
      w-full rounded-lg border px-3 py-2
      text-gray-900 dark:text-white
      
      border-gray-300 dark:border-gray-800
      resize-y
      focus:outline-none focus:ring-2 focus:ring-blue-500
    "
  />
</div>

              </div>
            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* PASSWORD CHANGE */}
      <Modal isOpen={changePasswordOpen} onClose={() => {setChangePassword(false), setOldPassword(""), setNewPass(""), setConfirmPassword(""), setStep(0)}} className="max-w-[600px] m-4">
        <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-4">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Change your password
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Wanna change your password? Go for it!
            </p>
          </div>

          <form className="flex flex-col">
            <div className="h-auto overflow-y-auto px-2 pb-3">

                <div className="">
                  <Label>Current Password</Label>
                  <Input
                    className={`${step === 1 ? "opacity-50" : "opacity-100"}`}
                    type="text"
                    disabled={step === 1 ? true : false}
                    value={oldPassword}
                    placeholder="Enter your old password"
                    onChange={(e) =>{
                      setOldPassword(e.target.value)
                      setError("")
                    }
                    }
                  />
                </div>
                {
                  step === 1 && (
<>
                <div className="mt-2">
                  <Label>New Password</Label>
                  <Input
                    type="text"
                    value={newPass}
                    placeholder="Enter your new password"
                    onChange={(e) =>{
                      setNewPass(e.target.value)
                      setError("")
                    }
                    }
                  />
              </div>
              <div className="mt-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="text"
                    value={confirmPassword}
                    placeholder="Re-enter your new password"
                    onChange={(e) =>{
                      setConfirmPassword(e.target.value)
                      setError("")
                    }
                    }
                  />
              </div>
</>
                  )
                }
                {error && <p className="text-red-400 text-sm py-2">{error}</p>}
            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={() => {setChangePassword(false), setOldPassword(""), setNewPass(""), setConfirmPassword(""), setStep(0)}}>
                Close
              </Button>
              <button 
              disabled={loading || !oldPassword}
              className={`text-center bg-blue-600 px-4 py-2.5 text-white rounded-lg hover:bg-blue-900 ${(loading || !oldPassword) ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"}`}
              onClick={loading ? () => {} : step === 0 ? (e) => verifyPassword(e) : (e) => changePass(e)}
              >
                    {!loading ? step === 0 ? "Verify" : "Change Password" : <div className="animate-spin"><LucideLoader2 /></div>}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
