"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";

interface UserMetaCardProps {
  user: any;
  onUpdate?: (data: any) => void;
}

export default function UserMetaCard({ user, onUpdate }: UserMetaCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    department: '',
    bio: '',
    workingAs: '',
    image: '' as string | null,
  });
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        department: user.department || '',
        bio: user.bio || '',
        workingAs: user.workingAs || '',
        image: user.image || null,
      });
    }
  }, [user]);

  // const handleSave = () => {
  //   if (onUpdate) {
  //     onUpdate(formData);
  //   }
  //   closeModal();
  // };


  const handleSave = async () => {
    if (isSaving) return; // safety guard

    setIsSaving(true);


    const payload = {
      id: user.id,
      email: user.email,
      ...formData,
    };

    try {
      const res = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || "Failed to update profile");
        return;
      }
      onUpdate?.(data.user);
      toast.success("Profile updated successfully");
      closeModal();

      router.refresh(); // ✅ ONLY THIS
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <Toaster position="top-right" />
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          {/* LEFT SIDE - Photo + Name + Info */}
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">

            {/* Avatar */}
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center">
              {user?.image ? (
                <Image
                  width={80}
                  height={80}
                  src={user.image}
                  alt="user"
                  className="object-cover rounded-full w-full h-full"
                />
              ) : (
                <span className="text-lg font-semibold text-white bg-blue-600 w-full h-full flex items-center justify-center">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>


            {/* User Details */}
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user?.name || "Unnamed User"}
              </h4>

              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.workingAs || user?.bio || user?.role || "Employee"}
                </p>
                {user?.department && (
                  <>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.department}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Social Links */}
            {/* <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              {["facebook", "x", "linkedin", "instagram"].map((platform) => (
                <a
                  key={platform}
                  target="_blank"
                  rel="noreferrer"
                  href={user?.[platform] || "#"}
                  className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  
                  <span className="text-xs capitalize">{platform[0]}</span>
                </a>
              ))}
            </div> */}
          </div>

          {/* EDIT BUTTON */}
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>

      {/* EDIT MODAL */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">

              {/* Social Links */}
              {/* <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Social Links
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Facebook</Label>
                    <Input type="text" defaultValue={user?.facebook || ""} />
                  </div>

                  <div>
                    <Label>X.com</Label>
                    <Input type="text" defaultValue={user?.x || ""} />
                  </div>

                  <div>
                    <Label>LinkedIn</Label>
                    <Input type="text" defaultValue={user?.linkedin || ""} />
                  </div>

                  <div>
                    <Label>Instagram</Label>
                    <Input type="text" defaultValue={user?.instagram || ""} />
                  </div>
                </div>
              </div> */}

              {/* Personal Info */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Full Name</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 flex items-center gap-6">
                    <label className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group border border-gray-300 dark:border-gray-700">

                      {/* Avatar */}
                      <Image
                        src={formData.image || user?.image || "/default-avatar.png"}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="object-cover"
                      />

                      {/* Hover Overlay */}
                      <div
                        className="
        absolute inset-0
        bg-gradient-to-t from-black/60 via-black/30 to-transparent
        opacity-0 group-hover:opacity-100
        transition-opacity
        flex items-center justify-center
      "
                      >
                        <Camera className="w-6 h-6 text-white" />
                      </div>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData((prev) => ({
                              ...prev,
                              image: reader.result as string,
                            }));
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>

                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Profile photo
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Click the image to change
                      </p>
                    </div>
                  </div>




                  {/* <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Department</Label>
                    <Input 
                      type="text" 
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Position</Label>
                    <Input 
                      type="text" 
                      value={formData.workingAs}
                      onChange={(e) => setFormData({...formData, workingAs: e.target.value})}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input 
                      type="text" 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    />
                  </div> */}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>

            </div>

          </div>
        </div>
      </Modal>
    </>
  );
}
