import React, {useState} from "react";
import {Sorting} from "../../../../models/enums/SortingEnum";
import {ParameterHelper} from "../../helpers/ParameterHelper";
import {Frame} from "../frame/Frame";
import {Jumbotron} from "react-bootstrap";
import {SearchQuery} from "./SearchQuery";
import {SearchResult} from "../../../../models/api/SearchResult";
import {SearchResults} from "./SearchResults";

export interface SearchProperties {
    /** Search Query */
    query?: string,
    /** Variable denoting the way the data is sorted.*/
    sorting?: Sorting
    /** Course ot search in.*/
    course?: string,
    /** Used for to search for.*/
    user?: string,
    /** Submission to search for.*/
    submission?: string
}
interface SearchOverviewProperties {
    /** Variable for storing a search query */
    location: {
        /** Search Properties */
        state: SearchProperties,
        /** Search String */
        search: string
    }
}
/**
 * Component for executing a an returning a search query.
 */
export function SearchOverview({location: {state={}, search}}: SearchOverviewProperties) {
    const [selectedCourse, setSelectedCourse] = useState(state.course);
    const [searchResults, setSearchResults] = useState(undefined as unknown as SearchResult);

    return <Frame title="Search" sidebar>
        <Jumbotron>
            <h1>Search</h1>
        </Jumbotron>
        <div className="m-3">
            <SearchQuery state={mergeState(state, search)} onCourseChange={setSelectedCourse} handleResponse={results => setSearchResults(results)}/>
        </div>
        {searchResults && <SearchResults course={selectedCourse} results={searchResults}/>}
    </Frame>;
}

function mergeState(state: SearchProperties, parameters: string) {
    return {...state, ...ParameterHelper.nameParameters(ParameterHelper.getQueryParameters(parameters), {
        q: "query"
    })};
}
