"use client";

import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface User {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
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

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Employee ID</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.employeeId || "Not provided"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.email || "Not provided"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.phone || "Not provided"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Department</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.department || "Not assigned"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Position</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.workingAs || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* EDIT BUTTON */}
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
      </div>

      {/* EDIT MODAL */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
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
            <div className="h-[450px] overflow-y-auto px-2 pb-3">
              
              {/* SOCIAL LINKS */}
              {/* <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90">
                Social Links
              </h5>

              <div className="grid grid-cols-1 gap-y-5 lg:grid-cols-2 gap-x-6">
                {[
                  { label: "Facebook", key: "facebook" },
                  { label: "X.com", key: "x" },
                  { label: "LinkedIn", key: "linkedin" },
                  { label: "Instagram", key: "instagram" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <Label>{label}</Label>
                    <Input
                      type="text"
                      value={formData[key as keyof User]}
                      onChange={(e) =>
                        setFormData({ ...formData, [key]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div> */}

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

                {/* <div>
                  <Label>Department</Label>
                  <Input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  />
                </div> */}

                {/* <div>
                  <Label>Position</Label>
                  <Input
                    type="text"
                    value={formData.workingAs}
                    onChange={(e) =>
                      setFormData({ ...formData, workingAs: e.target.value })
                    }
                  />
                </div> */}

                {/* <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                  />
                </div> */}

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
    </div>
  );
}
