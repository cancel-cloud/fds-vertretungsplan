import React, { useState } from "react";
import { SearchBarProps } from "@/types";

/**
 * SearchBar component for filtering substitution data
 * @param onSearch - Callback function called when search query changes
 */
const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  /**
   * Handles input change events and triggers search
   * @param event - React change event from input element
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    onSearch(value);
  };

  /**
   * Handles keyboard events for better mobile UX
   * @param event - React keyboard event from input element
   */
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearch(query);
      // Blur the input to close the keyboard on mobile devices
      (event.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="my-4">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDownCapture={handleKeyPress}
        placeholder="Search..."
        className="w-full rounded border p-2"
        autoComplete="off"
      />
    </div>
  );
};

export default SearchBar;
