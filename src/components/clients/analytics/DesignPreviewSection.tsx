"use client";

import Image from "next/image";
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
      {/* Image */}
      <div className="w-full h-80 p-15 relative">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-fill border-3 border-gray-200 dark:border-gray-800 rounded-2xl"
        />
      </div>

      {/* Button */}
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
  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-64" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-64" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 h-full sm:grid-cols-2 gap-6 py-6">
      {/* View Design */}
      <PreviewCard
        title="View Design"
        buttonText="View Design"
        buttonColor="#55b8ff"
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