import { JSX } from "react";

function SkeletonList(): JSX.Element {
  return (
    <>
      <div className="flex items-center space-x-4 p-2 rounded-lg">
        <div className="animate-pulse">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg" />
        </div>
        <div className="animate-pulse w-full">
          <div className="h-12 w-full sm:w-full sm:h-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center space-x-4 p-2 rounded-lg">
        <div className="animate-pulse">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg" />
        </div>
        <div className="animate-pulse w-full">
          <div className="h-12 w-full sm:w-full sm:h-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center space-x-4 p-2 rounded-lg">
        <div className="animate-pulse">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg" />
        </div>
        <div className="animate-pulse w-full">
          <div className="h-12 w-full sm:w-full sm:h-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center space-x-4 p-2 rounded-lg">
        <div className="animate-pulse">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg" />
        </div>
        <div className="animate-pulse w-full">
          <div className="h-12 w-full sm:w-full sm:h-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center space-x-4 p-2 rounded-lg">
        <div className="animate-pulse">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg" />
        </div>
        <div className="animate-pulse w-full">
          <div className="h-12 w-full sm:w-full sm:h-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </>
  );
}

export default SkeletonList;
