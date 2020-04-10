import React, {useState} from "react";
import {Frame} from "../frame/Frame";
import {Jumbotron} from "react-bootstrap";
import {SearchQuery} from "./SearchQuery";
import {SearchResult} from "../../../../models/api/SearchResult";
import {SearchResults} from "./SearchResults";

export interface SearchProperties {
    course?: string,
    user?: string,
    submission?: string
}

interface SearchOverviewProperties {
    location: {
        state: SearchProperties
    }
}

export function SearchOverview({location: {state}}: SearchOverviewProperties) {
    const [searchResults, setSearchResults] = useState(undefined as unknown as SearchResult);

    console.log("Loading search");
    console.log(state);

    return (
        <Frame title="Search" sidebar>
            <Jumbotron>
                <h1>Search</h1>
            </Jumbotron>
            <div className="m-3">
                <SearchQuery state={state} handleResponse={results => setSearchResults(results)}/>
            </div>
            {searchResults && <SearchResults results={searchResults}/>}
        </Frame>
    );
}