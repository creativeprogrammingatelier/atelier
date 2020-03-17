import React, {useState} from "react";

import {SearchBar} from "./SearchBar";
import {Frame} from "../frame/Frame";
import {search} from "../../../helpers/APIHelper";
import {Jumbotron} from "react-bootstrap";
import {SearchQuery} from "./SearchQuery";
import {DataList} from "../general/data/DataList";


export function SearchOverview() {
	const [searchResults, setSearchResults] = useState([] as string[]);

	return (
		<Frame title="Search" sidebar>
			<Jumbotron>
				<h1>Search</h1>
			</Jumbotron>
			<div className="m-3">
				<SearchQuery handleResponse={results => setSearchResults(results)}/>
			</div>
		</Frame>
	);
}