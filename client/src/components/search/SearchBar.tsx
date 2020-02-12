import React, {useState} from 'react';

interface SearchBarProperties {
    handleSearch : (value : string) => void
}

export function SearchBar({handleSearch} : SearchBarProperties) {
    const [search, setSearch] = useState("");

    function handleChange(event : any) {
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