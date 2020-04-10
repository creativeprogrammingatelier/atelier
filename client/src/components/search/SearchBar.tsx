import React, {useState} from 'react';

/**
 * Simple interface for properties provided to the search bar.
 * handleSearch: method to which search results ore forwarded.
 */
interface SearchBarProperties {
    handleSearch: (value: string) => void
}

export function SearchBar({handleSearch}: SearchBarProperties) {
    const [search, setSearch] = useState("");

    // Handle changes in the input field of the search
    function handleChange(event: any) {
        const {value} = event.target;
        setSearch(value);
    }

    return (
        <div>
            <input type="text" onChange={handleChange} value={search}/>
            <button onClick={() => handleSearch(search)}>Search</button>
        </div>
    )
}