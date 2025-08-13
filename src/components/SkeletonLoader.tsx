import React from "react";

/**
 * Skeleton loading component for better loading UX
 */
const SkeletonLoader: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      {/* Search bar skeleton */}
      <div className="my-4">
        <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
      </div>
      
      {/* Toggle skeleton */}
      <div className="my-4 flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
          <div className="h-6 w-12 animate-pulse rounded-full bg-gray-200"></div>
          <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Substitution cards skeleton */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded bg-white p-4 shadow-md">
            <div className="space-y-3">
              {/* Stunde */}
              <div className="flex">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                <div className="ml-2 h-4 w-8 animate-pulse rounded bg-gray-200"></div>
              </div>
              
              {/* Zeit */}
              <div className="flex">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                <div className="ml-2 h-4 w-24 animate-pulse rounded bg-gray-200"></div>
              </div>
              
              {/* Klassen */}
              <div className="flex">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                <div className="ml-2 h-4 w-16 animate-pulse rounded bg-gray-200"></div>
              </div>
              
              {/* Fach */}
              <div className="flex">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                <div className="ml-2 h-4 w-20 animate-pulse rounded bg-gray-200"></div>
              </div>
              
              {/* Raum */}
              <div className="flex">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                <div className="ml-2 h-4 w-14 animate-pulse rounded bg-gray-200"></div>
              </div>
              
              {/* Lehrkraft */}
              <div className="flex">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                <div className="ml-2 h-4 w-12 animate-pulse rounded bg-gray-200"></div>
              </div>
              
              {/* Info */}
              <div className="flex">
                <div className="h-4 w-10 animate-pulse rounded bg-gray-200"></div>
                <div className="ml-2 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
              </div>
              
              {/* Vertretungstext */}
              <div className="flex">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200"></div>
                <div className="ml-2 h-4 w-24 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;