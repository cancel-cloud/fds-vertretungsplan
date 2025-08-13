import React from "react";
import { UI_CONFIG } from "@/constants";

/**
 * Loading component displaying a spinning animation
 * @returns JSX element with loading spinner
 */
const Loading: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className={`${UI_CONFIG.LOADING_SPINNER_SIZE} animate-spin rounded-full border-b-2 border-t-2 border-blue-500`}></div>
    </div>
  );
};

export default Loading;
