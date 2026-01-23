'use client';

import { Palette, Type, Heart, MessageCircle, ArrowRight, Code, Bug, Server } from 'lucide-react';
import { useState } from 'react';

const phaseIcons: any = {
    Design: <Palette className="w-4 h-4" />,
    Code: <Code className="w-4 h-4" />,
    Testing: <Bug className="w-4 h-4" />,
    Deployment: <Server className="w-4 h-4" />
};

const DesignOverview = ({ data }: { data: any; designPreview: any }) => {

    const slides = [
        // Slide 1
        [
            { label: "Brand Name", value: data.brandName },
            { label: "Design Type", value: Array.isArray(data.designType) ? data.designType.join(", ") : data.designType },
            { label: "Brand Feel", value: data.brandFeel },
        ],

        // Slide 2
        [
            { label: "Content Tone", value: Array.isArray(data.contentTone) ? data.contentTone.join(", ") : data.contentTone },
            { label: "Theme", value: Array.isArray(data.theme) ? data.theme.join(", ") : data.theme },
            { label: "Key Pages", value: Array.isArray(data.keyPages) ? data.keyPages.join(", ") : data.keyPages },
        ],

        // Slide 3
        [
            { label: "Fonts", value: data.fonts ? (typeof data.fonts === 'object' ? Object.keys(data.fonts).join(", ") : data.fonts) : "Not set" },
            { label: "Layout Style", value: data.layoutStyle ? (typeof data.layoutStyle === 'object' ? Object.keys(data.layoutStyle).join(", ") : data.layoutStyle) : "Not set" },
            { label: "Visual Guidelines", value: data.visualGuidelines ? (typeof data.visualGuidelines === 'object' ? Object.keys(data.visualGuidelines).join(", ") : data.visualGuidelines) : "Not set" },
        ],

        // Slide 4
        [
            { label: "Uniqueness", value: data.uniqueness ? (typeof data.uniqueness === 'object' ? Object.keys(data.uniqueness).join(", ") : data.uniqueness) : "Not set" },
        ],
    ];


    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };


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
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 relative">
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
                        <div className="overflow-hidden relative h-40">
                            <div
                                className="flex transition-transform duration-500 ease-out"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {slides.map((slide, index) => (
                                    <div key={index} className="min-w-full space-y-4">
                                        {slide.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white max-w-32 truncate" title={item.value}>
                                                    {item.value || "Not set"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* Navigation Button */}
                        <div className="flex justify-end items-center">
                            <button
                                onClick={nextSlide}
                                className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 py-1 px-4 rounded-full flex items-center gap-2 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                            >
                                <span className="font-medium">Fonts</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                    </div>
                </div>

                {/* Right Unified Card */}
                <div className=" lg:col-span-2  bg-gray-100 dark:bg-gray-800  rounded-2xl border border-2 border-gray-300/50 dark:border-gray-700  flex overflow-hidden  relative">
                    {/* Days Remaining */}
                    <div className="flex-1 p-6 flex flex-col justify-center">
                        <div className="mb-4 items-start justify-start">
                            <span className="inline-flex justify-start items-center gap-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-2 rounded-full text-xs font-medium">
                                <span className="w-2 h-2 bg-green-500 rounded-full" />
                                On Time
                            </span>
                        </div>

                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                            {data.projectPhase.daysRemaining} Days
                        </h2>

                        <div className="mt-2 h-1 w-60 bg-purple-500 rounded-full" />

                        <p className="text-sm text-right text-gray-500 dark:text-gray-400 mt-2">
                            Days Remaining
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="h-full w-1 bg-gray-300 dark:bg-gray-600"></div>

                    {/* Current Phase */}
                    <div className="flex-1 p-6 relative overflow-hidden">
                        <div className="relative mb-5 flex flex-col items-start">
                            <h3 className="text-xl text-gray-700/60 dark:text-gray-300 mb-4">
                                Current Phase
                            </h3>
                            <div className="h-1 w-full absolute -left-10 top-8 bg-gray-300 dark:bg-gray-600"></div>
                        </div>

                        <div className="space-y-3 pb-8">
                            {data.projectPhase.phases.map((phase) => {
                                const isActive = phase.name === data.projectPhase.current;

                                return (
                                    <div
                                        key={phase.name}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-lg font-medium transition-all
                        ${isActive ? "bg-purple-500 text-white" : "text-gray-600 dark:text-gray-400"}`}>

                                        <span className={`text-lg ${isActive ? "text-white" : "text-gray-400 dark:text-gray-500"}`}>
                                            {phaseIcons[phase]}
                                        </span>

                                        {phase.name}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom Inner Shadow */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-300/60 dark:from-gray-700/40 to-transparent"></div>
                    </div>


                    {/* Divider */}
                    <div className="h-full w-1 bg-gray-300 dark:bg-gray-600"></div>

                    {/* Technology Used */}
                    <div className="flex-1 p-6 relative overflow-hidden">
                        <div className="relative flex flex-col mb-5 items-start">
                            <h3 className="text-xl text-gray-700/60 dark:text-gray-300 mb-6">
                                Technology Used
                            </h3>
                            <div className="h-1 w-[230px] absolute -left-10 top-8 bg-gray-300 dark:bg-gray-600"></div>
                        </div>

                        {/* Scrollable area */}
                        <div className="space-y-5 text-sm overflow-y-scroll max-h-65 no-scrollbar">
                            {data.technology.map((item) => (
                                <div key={item.key} className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">{item.key}</span>
                                    <span className="font-medium ml-10 text-gray-900 dark:text-white">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>


                        {/* Bottom Inner Shadow */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-30 bg-gradient-to-t from-gray-300/60 dark:from-gray-700/40 to-transparent"></div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DesignOverview;