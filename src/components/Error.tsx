import React from "react";

/**
 * Error component displayed when data fetching fails
 * @returns JSX element with error message
 */
const Error: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-4">
      <div className="text-6xl">😅</div>
      <p className="text-xl text-red-500 text-center">
        Das liegt an FDS
      </p>
      <p className="text-sm text-gray-600 text-center">
        Der Vertretungsplan konnte nicht geladen werden. 
        Bitte versuche es später erneut.
      </p>
    </div>
  );
};

export default Error;
