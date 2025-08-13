import React, { useState, useCallback } from "react";
import { SearchBarProps } from "@/types";
import { debounce } from "@/utils";

/**
 * SearchBar component for filtering substitution data with debounced search
 * @param onSearch - Callback function called when search query changes
 */
const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  // Debounced search function to improve performance
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch(searchQuery);
    }, 300),
    [] // Empty dependency array as onSearch is stable from parent
  );

  /**
   * Handles input change events and triggers debounced search
   * @param event - React change event from input element
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    debouncedSearch(value);
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
      <label htmlFor="search-input" className="sr-only">
        Suche nach Klassen, Lehrern, Fächern oder Räumen
      </label>
      <input
        id="search-input"
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDownCapture={handleKeyPress}
        placeholder="Suche nach Klassen, Lehrern, Fächern oder Räumen..."
        className="w-full rounded border p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        autoComplete="off"
        aria-describedby="search-help"
      />
      <div id="search-help" className="sr-only">
        Geben Sie einen Suchbegriff ein, um die Vertretungspläne zu filtern. 
        Die Suche erfolgt automatisch während der Eingabe.
      </div>
    </div>
  );
};

export default SearchBar;
