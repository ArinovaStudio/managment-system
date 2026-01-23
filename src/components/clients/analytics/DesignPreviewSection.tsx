"use client";

import { useState } from "react";
import Image from "next/image";
import { appConfig } from "@/config/appConfig";

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
        bg-gray-100 dark:bg-gray-800 p-5
        rounded-2xl border-3 border-gray-200 dark:border-gray-700
        overflow-hidden shadow-sm
        hover:shadow-md transition-all duration-200
        w-full h-full
      "
    >
      <div className="w-full h-80 p-15 relative">
        <Image
          src={imageUrl || appConfig.logo}
          alt={title}
          fill
          className="object-fill border-3 border-gray-200 dark:border-gray-800 rounded-2xl"
          onError={(e) => {
            e.currentTarget.src = appConfig.logo;
          }}
        />
      </div>

      <button
        onClick={onClick}
        className="w-full py-3 border-3 border-gray-200 dark:border-gray-700 rounded-xl mt-5 text-white text-lg font-semibold"
        style={{ backgroundColor: buttonColor }}
      >
        {buttonText}
      </button>
    </div>
  );
};

const DesignPreviewSection = ({ data }: { data: any }) => {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  const handleClick = (item: any) => {
    if (!item) return;

    const url = item.liveUrl || item.imageUrl;
    if (!url || url.trim() === "") return;

    try {
      // Ensure URL has proper protocol
      let fullUrl = url.trim();
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = 'https://' + fullUrl;
      }

      // Validate URL
      new URL(fullUrl);

      // Check if it's an image
      const isImage = fullUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

      if (isImage) {
        // Open images in new tab
        window.open(fullUrl, "_blank");
        return;
      }

      // For links, show in iframe instead of opening in new tab
      setIframeUrl(fullUrl);
    } catch (error) {
      console.error('Invalid URL:', url);
      // Fallback: try to open as is
      window.open(url, "_blank");
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 h-full sm:grid-cols-2 gap-6 py-6">
        <PreviewCard
          title="View Design"
          buttonText="View Design"
          buttonColor="#55b8ff"
          imageUrl={data?.design?.imageUrl || appConfig.logo}
          onClick={() => handleClick(data?.design)}
        />

        <PreviewCard
          title="Live Preview"
          buttonText="Live Preview"
          buttonColor="#A855F7"
          imageUrl={data?.preview?.imageUrl || appConfig.logo}
          onClick={() => handleClick(data?.preview)}
        />
      </div>

      {/* Iframe with close button */}
      {iframeUrl && (
        <div className="w-full h-[600px] mt-6 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 relative">
          <button
            onClick={() => setIframeUrl(null)}
            className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold"
          >
            ×
          </button>
          <iframe
            src={iframeUrl}
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};

export default DesignPreviewSection;