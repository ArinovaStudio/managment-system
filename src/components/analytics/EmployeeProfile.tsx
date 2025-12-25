'use client';
import Image from "next/image";
import { useEffect, useState } from "react";

const EmployeeProfile = () => {
    const [user, setUser] = useState<any>(null);
    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch('/api/user', { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        }
        fetchUser();
    }, []);
    return (


        <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-300 to-purple-800 overflow-hidden flex justify-center items-center">
                    {user?.image ? (
                    <Image
                        width={80}
                        height={80}
                        src={user.image} 
                        alt="user"
                    />
                    ) : (
                        <h1 className="text-white text-4xl">{user?.name.charAt(0)}</h1>
                    )}
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white">
                        {user?.name || "Unnamed User"}
                    </h3>
                    <p className="text-base text-gray-500 dark:text-gray-400">
                        {user?.role || "Employee"}
                    </p>
                </div>
            </div>
        </div>
    )
}
export default EmployeeProfile;