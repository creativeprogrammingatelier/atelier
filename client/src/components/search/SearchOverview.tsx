import React, {useState} from "react";

import {SearchBar} from "./SearchBar";
import {Frame} from "../frame/Frame";
import {search} from "../../../helpers/APIHelper";
import {Jumbotron} from "react-bootstrap";
import {SearchQuery} from "./SearchQuery";
import {DataList} from "../data/DataList";
import {SearchResult} from "../../../../models/api/SearchResult";
import {SearchResults} from "./SearchResults";


export function SearchOverview() {
	const [searchResults, setSearchResults] = useState(undefined as unknown as SearchResult);

	return (
		<Frame title="Search" sidebar>
			<Jumbotron>
				<h1>Search</h1>
			</Jumbotron>
			<div className="m-3">
				<SearchQuery handleResponse={results => setSearchResults(results)}/>
			</div>
			{searchResults && <SearchResults results={searchResults}/>}

		</Frame>
	);
}