"use client";

import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface UserAddressCardProps {
  user: any;
  onUpdate?: (updatedData: any) => void;
}

export default function UserAddressCard({ user, onUpdate }: UserAddressCardProps) {
  const { isOpen, openModal, closeModal } = useModal();

  if (!user) return null;

  const [formData, setFormData] = useState({
    dob: "",
    bio: "",
    github: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        dob: user.dob || "",
        bio: user.bio || "",
        github: user.githubProfile || "",
      });
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault()
    onUpdate(formData);
    closeModal();
  };

  return (
    <>
      {/* Display Card */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Additional Information
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-7 2xl:gap-x-32">

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Role
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.role || "Not provided"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Date of Birth
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.dob || "Not provided"}
                </p>
              </div>

      {
        user?.isDev && (
          <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Github Profile
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.githubProfile ? `@${user.githubProfile}` : "Not provided"}
                </p>
          </div>
        )
      }

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Joined us on
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Bio
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.bio || "No bio added"}
                </p>
              </div>




            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 lg:w-auto"
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
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto rounded-3xl bg-white dark:bg-gray-900 lg:p-11">

          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Additional Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Update your additional details.
            </p>
          </div>

          <form className="flex flex-col">

            <div className="px-2 pb-3 overflow-y-auto custom-scrollbar grid grid-cols-1 gap-y-5">

              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.dob}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Bio</Label>
                <Input
                  type="text"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
              </div>

                            <div>
                <Label>Github Profile</Label>
                <Input
                  type="text"
                  placeholder="Paste Your Github Username Without '@', i.e, ArinovaStudio"
                  value={formData.github}
                  onChange={(e) =>
                    setFormData({ ...formData, github: e.target.value })
                  }
                />
              </div>

            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <button
              className={`text-center bg-blue-600 px-4 py-2.5 text-white rounded-lg hover:bg-blue-900`}
              onClick={(e) =>  handleSave(e)}>
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </Modal>
    </>
  );
}
