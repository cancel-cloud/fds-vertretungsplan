"use client"; // Ensure this is a client-side component

import React from 'react';

const SearchBar: React.FC<{ onSearch: (query: string) => void }> = ({ onSearch }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearch(e.target.value);
    };

    return (
        <div className="flex justify-center my-4">
            <input
                type="text"
                className="border p-2 rounded shadow-md w-2/3"
                placeholder="Suche..."
                onChange={handleChange}
            />
        </div>
    );
};

export default SearchBar;
