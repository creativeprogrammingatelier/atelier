import React, {useState} from 'react';

import {SearchBar} from './SearchBar';
import {DataTable} from "../general/DataTable";
import {Frame} from '../frame/Frame';
import {Loading} from "../general/Loading";
import { search } from '../../../helpers/APIHelper';


export function SearchOverview() {
    const [searchTerm, updateSearchTerm] = useState("");

    // TODO get result from api: determine interface of what comes back from the API
    const getResults = (term: string): any => search(term)
        .then(data => ({
               // TODO Process data
            }));

    // TODO add tables for search
    return (
        <Frame title="Search" user={{id:"1", name:"John Doe"}} sidebar>
            <h1>Search Overview Page</h1>
            <SearchBar handleSearch={updateSearchTerm} />

        </Frame>
    )
}