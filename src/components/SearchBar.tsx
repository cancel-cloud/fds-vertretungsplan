import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setQuery(value);
        onSearch(value);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
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
                onKeyPress={handleKeyPress}
                placeholder="Search..."
                className="w-full p-2 border rounded"
                autoComplete="off"
            />
        </div>
    );
};

export default SearchBar;
