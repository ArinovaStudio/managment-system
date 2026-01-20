'use client';

import { Palette, Type, Heart, MessageCircle, ArrowRight } from 'lucide-react';

const DesignOverview = ({ data }: { data: any; designPreview: any }) => {
    if (!data) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-lg text-red-600 dark:text-red-400">Error loading design data</div>
            </div>
        );
    }

    return (
        <div className="dark:bg-gray-900">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Design System Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 relative">
                    <div className="absolute -top-3 left-45">
                        <span className="bg-blue-500 text-white px-4 py-1 rounded-sm text-sm font-medium">
                            Design System
                        </span>
                    </div>

                    <div className="mt-4 space-y-6">
                        {/* Colors */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                Colors
                            </h3>
                            <div className="flex gap-2">
                                {data.colors.map((color: string, index: number) => (
                                    <div
                                        key={index}
                                        className="  group  flex items-center  h-8  w-8 hover:w-24  px-2  rounded-full  border-2 border-gray-200 dark:border-gray-600  transition-all duration-300 ease-out  cursor-pointer  overflow-hidden"
                                        style={{ backgroundColor: color }}
                                        >
                                        {/* Hex Code */}
                                        <span className="  ml-2  text-xs font-semibold text-white  opacity-0 group-hover:opacity-100  translate-x-[-6px] group-hover:translate-x-0  transition-all duration-300  whitespace-nowrap">
                                            {color.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Design Language */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Design Language</h3>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Design Type</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {data.designType.join(', ')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Brand Feel</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {data.brandFeel}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Content Tone</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {data.contentTone.join(', ')}
                                </span>
                            </div>
                        </div>

                        {/* Fonts Button */}
                        <button className="w-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                            <Type className="w-4 h-4" />
                            <span className="font-medium">Fonts</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right Unified Card */}
                <div className="  lg:col-span-2   bg-white dark:bg-gray-800   rounded-2xl   border border-gray-200 dark:border-gray-700   flex overflow-hidden">

                    {/* Days Remaining */}
                    <div className="flex-1 p-6 flex flex-col justify-center">
                        <div className="mb-4 items-start justify-start">
                            <span className="inline-flex justify-start items-center gap-2    bg-green-100 dark:bg-green-900    text-green-700 dark:text-green-300    px-3 py-2 rounded-full    text-xs font-medium ">
                                <span className="w-2 h-2 bg-green-500 rounded-full" />
                                On Time
                            </span>
                        </div>

                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                            {data.projectPhase.daysRemaining} Days
                        </h2>

                        <div className="mt-2 h-1 w-20 bg-purple-500 rounded-full" />

                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Days Remaining
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="w-px bg-gray-200 dark:bg-gray-700" />

                    {/* Current Phase */}
                    <div className="flex-1 p-6">
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">
                            Current Phase
                        </h3>

                        <div className="space-y-3">
                            {["Design", "Code", "Testing", "Deployment"].map((phase) => {
                                const isActive = phase === data.projectPhase.current;

                                return (
                                    <div
                                        key={phase}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                                             ${isActive
                                                ? "bg-purple-500 text-white"
                                                : "text-gray-600 dark:text-gray-400"}`}>
                                        <span className={`text-lg ${isActive ? "text-white" : "text-gray-400 dark:text-gray-500"}`}>
                                            ⌘
                                        </span>
                                        {phase}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px bg-gray-200 dark:bg-gray-700" />

                    {/* Technology Used */}
                    <div className="flex-1 p-6">
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">
                            Technology Used
                        </h3>

                        <div className="space-y-3 py-3  text-sm">
                            {[
                                ["Design", data.technology.design],
                                ["Frontend", data.technology.frontend],
                                ["Backend", data.technology.backend],
                                ["Database", data.technology.database],
                                ["Server", data.technology.server],
                                ["Database Hosted ON", data.technology.hosting],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">{label}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignOverview;