"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";

interface PreviewCardProps {
  title: string;
  buttonText: string;
  buttonColor: string;
  imageUrl: string;
  onClick?: () => void;
}

const PreviewCard = ({
  title,
  buttonText,
  buttonColor,
  imageUrl,
  onClick,
}: PreviewCardProps) => {
  return (
    <div
      className="
        bg-white dark:bg-gray-800 
        rounded-2xl border border-gray-300 dark:border-gray-700
        overflow-hidden shadow-sm
        hover:shadow-md transition-all duration-200
        w-full
      "
    >
      {/* Image */}
      <div className="w-full h-56 relative">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover rounded-t-2xl"
        />
      </div>

      {/* Button */}
      <button
        onClick={onClick}
        className="w-full py-3 text-white text-lg font-semibold"
        style={{ backgroundColor: buttonColor }}
      >
        {buttonText}
      </button>
    </div>
  );
};

interface DesignPreviewSectionProps {
  clientId: string;
}

const DesignPreviewSection = ({ data }: { data: any }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-64" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-64" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
      {/* View Design */}
      <PreviewCard
        title="View Design"
        buttonText="View Design"
        buttonColor="#3B82F6"
        imageUrl={data?.design?.imageUrl || "/logo.jpg"}
        onClick={() => data?.design?.imageUrl && window.open(data.design.imageUrl, '_blank')}
      />

      {/* Live Preview */}
      <PreviewCard
        title="Live Preview"
        buttonText="Live Preview"
        buttonColor="#A855F7"
        imageUrl={data?.preview?.imageUrl || "/logo.jpg"}
        onClick={() => {
          const liveUrl = data?.preview?.liveUrl;
          if (liveUrl) {
            window.open(liveUrl, '_blank');
          } else if (data?.preview?.imageUrl) {
            window.open(data.preview.imageUrl, '_blank');
          }
        }}
      />
    </div>
  );
};

export default DesignPreviewSection;